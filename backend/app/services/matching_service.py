"""AI matchmaking: ranks material listings for a buyer's requirement.

match_score = 0.65 * deal_quality + 0.35 * distance_score

deal_quality (0-100) blends:
  - category fit (exact/substring/synonym)
  - quantity compatibility (buyer qty fits within seller stock)
  - price competitiveness (vs. running market average for the category)
  - quality signals (purity/grade/condition keywords in text)
  - seller trust (verified status + number of listings)

When an LLM provider is configured, the top candidates are additionally
refined by the model and an overall insight is produced.
"""
from datetime import datetime, timezone
from typing import Any, Optional

from app.core.config import get_settings
from app.models.material import Material
from app.models.user import User
from app.services import ai_service
from app.services.maps_service import distance_between

settings = get_settings()

CATEGORY_SYNONYMS = {
    "plastic": ["plastic", "polymer", "hdfe", "hdpe", "ldpe", "pp", "pet", "pvc", "pe"],
    "metal": ["metal", "steel", "iron", "copper", "aluminium", "aluminum", "brass", "zinc", "tin", "scrap"],
    "chemical": ["chemical", "solvent", "acid", "alkali", "catalyst", "resin", "pigment", "toluene"],
    "textile": ["textile", "fabric", "cotton", "jute", "yarn", "polyester", "nylon", "wool", "denim"],
    "wood": ["wood", "timber", "pallet", "sawdust", "plywood", "bamboo", "furniture scrap"],
    "e-waste": ["e-waste", "electronic", "pcb", "circuit", "battery", "laptop", "wire", "cable"],
    "paper": ["paper", "cardboard", "corrugated", "pulp", "newspaper"],
    "glass": ["glass", "cullet", "bottles"],
    "rubber": ["rubber", "tyre", "tire", "latex"],
    "organic": ["organic", "food", "biomass", "agricultural", "compost"],
    "construction": ["construction", "concrete", "cement", "brick", "rubble", "sand", "aggregate"],
}

QUALITY_KEYWORDS = [
    "high purity",
    "pure",
    "virgin",
    "clean",
    "grade a",
    "grade a+",
    "prime",
    "food grade",
    "tested",
    "certified",
    "high grade",
    "99%",
    "98%",
    "95%",
    "uncontaminated",
]

CATEGORY_PRICE_BASELINES: dict[str, tuple[float, float]] = {
    # (low, high) INR per kg heuristic baselines for competitiveness scoring
    "Plastic": (15, 60),
    "Metal": (40, 350),
    "Chemical": (25, 300),
    "Textile": (8, 40),
    "Wood": (4, 18),
    "E-waste": (30, 250),
    "Paper": (3, 12),
    "Glass": (2, 10),
    "Rubber": (8, 30),
    "Organic": (2, 15),
    "Construction": (5, 25),
    "Other": (5, 50),
}


def _normalise(s: Optional[str]) -> str:
    return (s or "").strip().lower()


def _category_match(listing_category: Optional[str], requirement_category: Optional[str]) -> float:
    """0..1 similarity between two category strings."""
    lc = _normalise(listing_category)
    rc = _normalise(requirement_category)
    if not rc or not lc:
        return 0.5
    if lc == rc:
        return 1.0
    if lc in rc or rc in lc:
        return 0.9
    synonyms = CATEGORY_SYNONYMS.get(lc, [lc])
    if any(word in rc for word in synonyms):
        return 0.85
    return 0.1


def _quantity_score(listing_qty: float, listing_unit: str, req_qty: float, req_unit: str) -> float:
    """0..1 - best when the buyer's quantity fits comfortably in the listing."""
    if not req_qty or req_qty <= 0:
        return 0.8
    if not listing_qty or listing_qty <= 0:
        return 0.5
    lq = listing_qty if listing_unit == req_unit else listing_qty * 1000
    rq = req_qty if req_unit == listing_unit else req_qty / 1000
    if rq <= lq:
        availability = rq / lq
        if availability <= 0.8:
            return 1.0
        return 0.85 + 0.15 * (1 - availability)
    shortfall = rq / lq
    if shortfall <= 1.5:
        return 0.6
    if shortfall <= 2:
        return 0.35
    return 0.1


def _price_score(price: float, unit: str, category: str, market_avg: Optional[float]) -> float:
    """0..1 - lower price relative to market average is a better deal."""
    if market_avg and market_avg > 0:
        ratio = price / market_avg
        if ratio <= 0.6:
            return 1.0
        if ratio <= 1.0:
            return 0.95 - 0.35 * (ratio - 0.6)
        if ratio <= 1.4:
            return 0.6 - 0.3 * (ratio - 1.0)
        return 0.3
    low, high = CATEGORY_PRICE_BASELINES.get(category, (5, 50))
    if price <= 0:
        return 0.6
    if price <= low:
        return 0.95
    if price <= high:
        return 0.8 - 0.3 * ((price - low) / max(high - low, 1))
    return 0.35


def _quality_signal_score(material: Material) -> float:
    text = _normalise(
        f"{material.purity} {material.condition} {material.subcategory} {material.description}"
    )
    hits = sum(1 for kw in QUALITY_KEYWORDS if kw in text)
    if hits >= 3:
        return 1.0
    if hits == 2:
        return 0.85
    if hits == 1:
        return 0.65
    if material.purity:
        return 0.5
    return 0.35


def _trust_score(seller: Optional[User], listing_count: int) -> float:
    if seller is None:
        return 0.5
    score = 0.4
    if seller.verified:
        score += 0.4
    score += min(0.2, listing_count * 0.05)
    return score


def _distance_score(distance_km: Optional[float]) -> float:
    if distance_km is None:
        return 0.5
    if distance_km <= 25:
        return 1.0
    if distance_km <= 100:
        return 0.9 - 0.3 * ((distance_km - 25) / 75)
    if distance_km <= 500:
        return 0.6 - 0.3 * ((distance_km - 100) / 400)
    return 0.3


def _convert_to_kg(quantity: float, unit: str) -> float:
    if unit == "tonnes" or unit == "ton":
        return quantity * 1000
    if unit == "kg":
        return quantity
    if unit == "lbs" or unit == "lb":
        return quantity * 0.4536
    return quantity


def _is_sold_out(material: Material) -> bool:
    return _convert_to_kg(material.quantity, material.unit) <= 0


async def score_deal(
    material: Material,
    seller: Optional[User],
    requirement: dict[str, Any],
    distance_km: Optional[float],
) -> dict[str, Any]:
    """Compute the deal-quality and final match score for one listing."""
    category = material.category or "Other"
    category_fit = _category_match(category, requirement.get("category"))
    quantity_fit = _quantity_score(
        material.quantity,
        material.unit,
        float(requirement.get("quantity") or 0),
        requirement.get("unit") or material.unit,
    )
    price_comp = _price_score(
        material.price,
        material.unit,
        category,
        requirement.get("market_avg_price"),
    )
    quality_signal = _quality_signal_score(material)
    trust = _trust_score(seller, requirement.get("seller_listing_counts", {}).get(str(material.seller_id), 0))

    deal_quality = round(
        100
        * (
            0.35 * category_fit
            + 0.25 * quantity_fit
            + 0.2 * price_comp
            + 0.1 * quality_signal
            + 0.1 * trust
        ),
        1,
    )

    dscore = _distance_score(distance_km)
    match_score = round(0.65 * deal_quality + 0.35 * dscore * 100, 1)

    return {
        "match_score": match_score,
        "deal_quality": deal_quality,
        "breakdown": {
            "category_fit": round(category_fit * 100),
            "quantity_fit": round(quantity_fit * 100),
            "price_competitiveness": round(price_comp * 100),
            "quality_signal": round(quality_signal * 100),
            "seller_trust": round(trust * 100),
            "distance_score": round(dscore * 100),
        },
        "distance_km": distance_km,
        "duration_min": None,
    }


async def find_matches(
    requirement: dict[str, Any],
    user_location: Optional[tuple[float, float]],
) -> dict[str, Any]:
    """Rank all available listings against the requirement.

    Returns {"matches": [...], "insight": str, "market_avg_price": float|None}
    """
    category = requirement.get("category")
    query = {"status": "available"}

    candidates: list[Material] = []
    async for m in Material.find(query):
        if _is_sold_out(m):
            continue
        if category and category != "All":
            if _category_match(m.category, category) < 0.5:
                continue
        candidates.append(m)

    if not candidates:
        return {"matches": [], "insight": "", "market_avg_price": None}

    # Market average price per category (per kg normalised) for competitiveness
    market_avg = await _market_average_price(candidates)
    requirement["market_avg_price"] = market_avg

    seller_ids = {m.seller_id for m in candidates}
    sellers: dict[str, User] = {}
    from bson import ObjectId

    ids = [ObjectId(sid) for sid in seller_ids]
    async for u in User.find({"_id": {"$in": ids}}):
        sellers[str(u.id)] = u
    listing_counts: dict[str, int] = {}
    async for m in Material.find({"seller_id": {"$in": list(seller_ids)}}):
        listing_counts[m.seller_id] = listing_counts.get(m.seller_id, 0) + 1
    requirement["seller_listing_counts"] = listing_counts

    # Per-candidate distance via Google Distance Matrix (haversine fallback)
    results = []
    for m in candidates:
        dist = await distance_between(
            user_location,
            (m.latitude, m.longitude) if m.latitude is not None and m.longitude is not None else None,
            destination_address=m.location or "",
        )
        seller = sellers.get(m.seller_id)
        scored = await score_deal(m, seller, requirement, dist.get("distance_km"))
        scored.update(
            {
                "material_id": str(m.id),
                "material_name": m.name,
                "category": m.category,
                "quantity": m.quantity,
                "unit": m.unit,
                "price": m.price,
                "purity": m.purity,
                "images": m.images,
                "seller_id": m.seller_id,
                "seller_name": seller.company_name if seller else "Seller",
                "verified": bool(seller and seller.verified),
                "status": m.status,
                "duration_min": dist.get("duration_min"),
                "distance_source": dist.get("source"),
                "location": m.location,
                "created_at": m.created_at.isoformat(),
            }
        )
        results.append(scored)

    results.sort(key=lambda r: r["match_score"], reverse=True)
    top = results[:10]

    # LLM refinement of top deals (optional)
    ai_result = {"refinements": {}, "insight": ""}
    if ai_service.ai_enabled():
        ai_result = await ai_service.analyze_deals(
            {
                "requirement": {k: v for k, v in requirement.items() if not k.startswith("seller_")},
                "deals": [
                    {
                        "material_id": r["material_id"],
                        "name": r["material_name"],
                        "category": r["category"],
                        "price": r["price"],
                        "unit": r["unit"],
                        "quantity": r["quantity"],
                        "deal_quality": r["deal_quality"],
                    }
                    for r in top
                ],
            }
        )
        for r in results:
            ref = ai_result["refinements"].get(r["material_id"])
            if ref:
                delta = float(ref.get("score_delta", 0) or 0)
                r["match_score"] = round(min(100, max(0, r["match_score"] + delta)), 1)
                r["ai_reason"] = ref.get("reason", "")
        results.sort(key=lambda r: r["match_score"], reverse=True)

    return {
        "matches": results,
        "insight": ai_result.get("insight", ""),
        "market_avg_price": market_avg,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


async def _market_average_price(candidates: list[Material]) -> Optional[float]:
    """Average per-kg price across the candidate pool for price scoring."""
    prices = []
    for m in candidates:
        kg = _convert_to_kg(1, m.unit)
        if m.price > 0 and kg:
            prices.append(m.price / kg)
    if not prices:
        return None
    return round(sum(prices) / len(prices), 2)
