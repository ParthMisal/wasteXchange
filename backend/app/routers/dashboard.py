"""Dashboard aggregates for sellers and buyers."""
from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.models.material import Material
from app.models.request import Request
from app.models.saved import SavedMaterial
from app.models.user import User
from app.services import ai_service
from app.services.matching_service import find_matches
from app.services.maps_service import geocode

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Rough carbon savings (kg CO2e per tonne of material diverted from landfill)
CARBON_FACTORS = {
    "Plastic": 2500,
    "Metal": 4000,
    "Chemical": 1500,
    "Textile": 1800,
    "Wood": 800,
    "E-waste": 6000,
    "Paper": 1200,
    "Glass": 500,
    "Rubber": 900,
    "Organic": 300,
    "Construction": 200,
    "Other": 1000,
}


def _tonnes(material: Material) -> float:
    return material.quantity if material.unit == "tonnes" else material.quantity / 1000


async def _impact_from_materials(materials: list[Material]) -> dict:
    tonnes_by_category: dict[str, float] = {}
    for m in materials:
        tonnes_by_category[m.category] = tonnes_by_category.get(m.category, 0) + _tonnes(m)

    total_tonnes = sum(tonnes_by_category.values())
    co2 = sum(
        tonnes * CARBON_FACTORS.get(category, 1000)
        for category, tonnes in tonnes_by_category.items()
    )
    return {
        "tonnes_diverted": round(total_tonnes, 1),
        "co2_reduced_kg": round(co2),
        "co2_reduced_tonnes": round(co2 / 1000, 1),
        "trees_equivalent": round(co2 / 21),
        "cars_off_road": round(co2 / 2200, 1),
        "kwh_saved": round(co2 * 2.1),
        "by_category": {
            cat: {"tonnes": round(t, 1), "co2_kg": round(t * CARBON_FACTORS.get(cat, 1000))}
            for cat, t in tonnes_by_category.items()
        },
    }


@router.get("/seller")
async def seller_dashboard(current_user: User = Depends(get_current_user)):
    """Stats, recent requests, and AI insight for the seller."""
    user_id = str(current_user.id)

    listings: list[Material] = []
    async for m in Material.find(Material.seller_id == user_id):
        listings.append(m)

    requests: list[Request] = []
    async for r in Request.find({"seller_id": user_id}):
        requests.append(r)
    requests.sort(key=lambda r: r.created_at, reverse=True)

    recent_requests = []
    for req in requests[:10]:
        material = await Material.get(req.material_id)
        buyer = await User.get(req.buyer_id)
        recent_requests.append(
            {
                "id": str(req.id),
                "material_name": material.name if material else "Unknown material",
                "category": material.category if material else None,
                "buyer": buyer.company_name if buyer else "Buyer",
                "quantity": req.quantity,
                "unit": req.unit,
                "status": req.status,
                "created_at": req.created_at,
            }
        )

    impact = await _impact_from_materials([m for m in listings if m.status in ("sold", "reserved")])
    pending = sum(1 for r in requests if r.status == "pending")
    active = sum(1 for r in requests if r.status in ("accepted", "in_transit"))

    insight = await ai_service.generate_market_insight(
        {
            "listings": len(listings),
            "pending_requests": pending,
            "active_requests": active,
            "total_requests": len(requests),
            "tonnes_listed": round(sum(_tonnes(m) for m in listings), 1),
        }
    )

    return {
        "summary": {
            "totalListings": len(listings),
            "pendingRequests": pending,
            "activeRequests": active,
            "totalTonnes": int(sum(_tonnes(m) for m in listings)),
            "totalValue": round(sum(m.price * m.quantity for m in listings), 2),
        },
        "requests": recent_requests,
        "impact": impact,
        "insight": insight,
        "ai_enabled": ai_service.ai_enabled(),
    }


@router.get("/buyer")
async def buyer_dashboard(current_user: User = Depends(get_current_user)):
    """Stats, active requests, saved materials, impact, and AI recommendations."""
    user_id = str(current_user.id)

    requests: list[Request] = []
    async for r in Request.find({"buyer_id": user_id}):
        requests.append(r)
    requests.sort(key=lambda r: r.created_at, reverse=True)

    request_items = []
    for req in requests[:10]:
        material = await Material.get(req.material_id)
        seller = await User.get(req.seller_id)
        request_items.append(
            {
                "id": str(req.id),
                "material_name": material.name if material else "Unknown material",
                "category": material.category if material else None,
                "seller": seller.company_name if seller else "Seller",
                "quantity": req.quantity,
                "unit": req.unit,
                "status": req.status,
                "status_label": req.status.replace("_", " ").title(),
                "price": req.price,
                "created_at": req.created_at,
            }
        )

    saved: list[SavedMaterial] = []
    async for s in SavedMaterial.find(SavedMaterial.user_id == user_id):
        saved.append(s)
    saved_materials = []
    for s in saved:
        material = await Material.get(s.material_id)
        if material:
            seller = await User.get(material.seller_id)
            saved_materials.append(
                {
                    "id": str(material.id),
                    "name": material.name,
                    "category": material.category,
                    "quantity": material.quantity,
                    "unit": material.unit,
                    "price": material.price,
                    "status": material.status,
                    "images": material.images,
                    "seller": seller.company_name if seller else None,
                }
            )

    procured: list[Request] = [r for r in requests if r.status == "completed"]
    impact = await _impact_from_materials([])
    # Impact from completed requests
    for req in procured:
        material = await Material.get(req.material_id)
        if material:
            impact["tonnes_diverted"] += round(req.quantity / (1000 if req.unit == "kg" else 1), 1)
            factor = CARBON_FACTORS.get(material.category, 1000)
            co2 = req.quantity / (1000 if req.unit == "kg" else 1) * factor
            impact["co2_reduced_kg"] += co2

    impact["co2_reduced_tonnes"] = round(impact["co2_reduced_kg"] / 1000, 1)
    impact["trees_equivalent"] = round(impact["co2_reduced_kg"] / 21)
    impact["cars_off_road"] = round(impact["co2_reduced_kg"] / 2200, 1)
    impact["kwh_saved"] = round(impact["co2_reduced_kg"] * 2.1)

    # AI recommendations: top 3 matches for the buyer's latest pending requirement
    recommendations = []
    if requests:
        latest = requests[0]
        material = await Material.get(latest.material_id)
        requirement = {"category": material.category if material else "", "quantity": latest.quantity, "unit": latest.unit}
        user_location = None
        if current_user.latitude is not None and current_user.longitude is not None:
            user_location = (current_user.latitude, current_user.longitude)
        try:
            result = await find_matches(requirement, user_location)
            for m in result["matches"][:3]:
                if m["material_id"] != str(latest.material_id):
                    recommendations.append(
                        {
                            "material_id": m["material_id"],
                            "material_name": m["material_name"],
                            "category": m["category"],
                            "price": m["price"],
                            "unit": m["unit"],
                            "quantity": m["quantity"],
                            "match_score": m["match_score"],
                            "deal_quality": m["deal_quality"],
                            "distance_km": m["distance_km"],
                            "seller_name": m["seller_name"],
                            "images": m["images"],
                        }
                    )
        except Exception:
            pass

    insight = await ai_service.generate_market_insight(
        {
            "active_requests": len([r for r in requests if r.status == "pending"]),
            "completed_requests": len(procured),
            "saved_materials": len(saved),
            "tonnes_procured": impact["tonnes_diverted"],
        }
    )

    return {
        "summary": {
            "activeRequests": len([r for r in requests if r.status in ("pending", "accepted", "in_transit")]),
            "savedItems": len(saved),
            "tonnesProcured": round(impact["tonnes_diverted"], 1),
            "totalRequests": len(requests),
        },
        "requests": request_items,
        "savedMaterials": saved_materials,
        "impact": impact,
        "recommendations": recommendations,
        "insight": insight,
        "ai_enabled": ai_service.ai_enabled(),
    }
