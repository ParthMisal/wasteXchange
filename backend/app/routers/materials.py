"""Material listing endpoints: CRUD, search, saved items, seller summaries."""
from typing import Optional

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.dependencies.auth import get_current_user
from app.models.material import Material
from app.models.saved import SavedMaterial
from app.models.user import User
from app.schemas.material import MaterialResponse, MaterialSummary
from app.services import image_service
from app.services.maps_service import distance_between, geocode

router = APIRouter(prefix="/api/materials", tags=["materials"])


class UpdateMaterialRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    purity: Optional[str] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


async def _material_response(
    m: Material,
    seller: Optional[User] = None,
    distance: Optional[dict] = None,
) -> dict:
    return {
        "id": str(m.id),
        "seller_id": m.seller_id,
        "name": m.name,
        "category": m.category,
        "subcategory": m.subcategory,
        "quantity": m.quantity,
        "unit": m.unit,
        "price": m.price,
        "purity": m.purity,
        "condition": m.condition,
        "description": m.description,
        "images": m.images,
        "location": m.location,
        "latitude": m.latitude,
        "longitude": m.longitude,
        "status": m.status,
        "views": m.views,
        "distance_km": (distance or {}).get("distance_km"),
        "duration_min": (distance or {}).get("duration_min"),
        "seller_name": seller.full_name if seller else None,
        "seller_company": seller.company_name if seller else None,
        "verified": bool(seller and seller.verified),
        "created_at": m.created_at,
        "updated_at": m.updated_at,
    }


@router.post("", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def create_material(
    name: str = Form(...),
    category: str = Form("Other"),
    subcategory: str = Form(""),
    quantity: float = Form(0),
    unit: str = Form("kg"),
    price: float = Form(0),
    purity: str = Form(""),
    condition: str = Form(""),
    description: str = Form(""),
    location: str = Form(""),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    images: list[UploadFile] = [],
    current_user: User = Depends(get_current_user),
):
    """Create a listing. Supports multipart form data with multiple images."""
    if current_user.role not in ("seller",) and "seller" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can list materials",
        )

    image_urls: list[str] = []
    for img in images:
        if not img.filename:
            continue
        try:
            image_urls.append(await image_service.save_image(img))
        except ValueError as exc:
            for url in image_urls:
                image_service.delete_image(url)
            raise HTTPException(status_code=400, detail=str(exc))

    lat, lng = latitude, longitude
    if (lat is None or lng is None) and location.strip():
        geo = await geocode(location)
        if geo:
            lat, lng = geo["latitude"], geo["longitude"]

    material = Material(
        seller_id=str(current_user.id),
        name=name.strip(),
        category=category.strip() or "Other",
        subcategory=subcategory.strip() or None,
        quantity=quantity,
        unit=unit,
        price=price,
        purity=purity.strip() or None,
        condition=condition.strip() or None,
        description=description.strip() or None,
        images=image_urls,
        location=location.strip() or current_user.address,
        latitude=lat,
        longitude=lng,
    )
    await material.insert()
    return await _material_response(material)


@router.get("/search", response_model=dict)
async def search_materials(
    query: str = "",
    category: str = "",
    sort: str = "newest",
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    minQuantity: Optional[float] = None,
    maxQuantity: Optional[float] = None,
    verifiedOnly: bool = False,
    current_user: User = Depends(get_current_user),
):
    """Search available materials with filters, sorted with distance from buyer."""
    filters: dict = {"status": "available"}

    if category and category != "All":
        filters["category"] = category
    if minPrice is not None or maxPrice is not None:
        price_filter: dict = {}
        if minPrice is not None:
            price_filter["$gte"] = minPrice
        if maxPrice is not None:
            price_filter["$lte"] = maxPrice
        filters["price"] = price_filter
    if minQuantity is not None or maxQuantity is not None:
        qty_filter: dict = {}
        if minQuantity is not None:
            qty_filter["$gte"] = minQuantity
        if maxQuantity is not None:
            qty_filter["$lte"] = maxQuantity
        filters["quantity"] = qty_filter

    candidates: list[Material] = []
    async for m in Material.find(filters):
        if query and query.strip().lower() not in m.name.lower():
            continue
        candidates.append(m)

    # Enrich with seller info + distance
    user_origin = (
        (current_user.latitude, current_user.longitude)
        if current_user.latitude is not None and current_user.longitude is not None
        else None
    )
    seller_cache: dict[str, Optional[User]] = {}
    verified_sellers = set()
    if verifiedOnly:
        async for u in User.find({"verified": True}):
            verified_sellers.add(str(u.id))

    results = []
    for m in candidates:
        if verifiedOnly and m.seller_id not in verified_sellers:
            continue
        seller = seller_cache.get(m.seller_id)
        if seller is None and m.seller_id not in seller_cache:
            seller = await User.get(m.seller_id)
            seller_cache[m.seller_id] = seller
        distance = await distance_between(
            user_origin,
            (m.latitude, m.longitude) if m.latitude is not None else None,
            destination_address=m.location or "",
        )
        results.append(await _material_response(m, seller, distance))

    if sort == "price_asc":
        results.sort(key=lambda r: (r["price"] or 0))
    elif sort == "distance":
        results.sort(key=lambda r: (r["distance_km"] if r["distance_km"] is not None else float("inf")))
    else:
        results.sort(key=lambda r: r["created_at"], reverse=True)

    return {"materials": results, "count": len(results)}


@router.get("/my-listings", response_model=list[MaterialResponse])
async def my_listings(current_user: User = Depends(get_current_user)):
    """All listings belonging to the current user."""
    materials: list[Material] = []
    async for m in Material.find(Material.seller_id == str(current_user.id)):
        materials.append(m)
    materials.sort(key=lambda m: m.created_at, reverse=True)
    return [await _material_response(m) for m in materials]


@router.get("/my-listings/summary", response_model=MaterialSummary)
async def my_listings_summary(current_user: User = Depends(get_current_user)):
    """Aggregate stats for the seller dashboard."""
    from app.models.request import Request

    materials: list[Material] = []
    async for m in Material.find(Material.seller_id == str(current_user.id)):
        materials.append(m)

    total_listings = len(materials)
    total_tonnes = 0
    total_value = 0.0
    for m in materials:
        kg = m.quantity if m.unit == "kg" else m.quantity * 1000
        total_tonnes += kg / 1000
        total_value += m.price * m.quantity

    pending_requests = 0
    async for r in Request.find({"seller_id": str(current_user.id), "status": "pending"}):
        pending_requests += 1

    return MaterialSummary(
        totalListings=total_listings,
        pendingRequests=pending_requests,
        totalTonnes=int(total_tonnes),
        totalValue=round(total_value, 2),
    )


@router.get("/saved", response_model=list[dict])
async def saved_materials(current_user: User = Depends(get_current_user)):
    """Materials bookmarked by the current user."""
    results = []
    async for saved in SavedMaterial.find(SavedMaterial.user_id == str(current_user.id)):
        material = await Material.get(saved.material_id)
        if material:
            seller = await User.get(material.seller_id)
            results.append(await _material_response(material, seller, {"distance_km": None}))
    return results


@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(material_id: str, current_user: User = Depends(get_current_user)):
    material = await Material.get(material_id)
    if not material:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Material not found")
    material.views += 1
    await material.save()
    seller = await User.get(material.seller_id)
    return await _material_response(material, seller)


@router.put("/{material_id}", response_model=MaterialResponse)
async def update_material(
    material_id: str,
    payload: UpdateMaterialRequest,
    current_user: User = Depends(get_current_user),
):
    material = await Material.get(material_id)
    if not material:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Material not found")
    if material.seller_id != str(current_user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your listing")

    updates = payload.model_dump(exclude_unset=True, exclude_none=True)
    if "location" in updates and updates["location"]:
        geo = await geocode(updates["location"])
        if geo:
            material.latitude = geo["latitude"]
            material.longitude = geo["longitude"]
    for key, value in updates.items():
        setattr(material, key, value)
    material.updated_at = material.updated_at
    await material.save()
    return await _material_response(material)


@router.delete("/{material_id}", status_code=status.HTTP_200_OK)
async def delete_material(material_id: str, current_user: User = Depends(get_current_user)):
    material = await Material.get(material_id)
    if not material:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Material not found")
    if material.seller_id != str(current_user.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your listing")

    for url in material.images:
        image_service.delete_image(url)
    await SavedMaterial.find(SavedMaterial.material_id == material_id).delete()
    await material.delete()
    return {"message": "Material deleted"}


@router.post("/{material_id}/save", status_code=status.HTTP_201_CREATED)
async def save_material(material_id: str, current_user: User = Depends(get_current_user)):
    material = await Material.get(material_id)
    if not material:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Material not found")

    existing = await SavedMaterial.find_one(
        SavedMaterial.user_id == str(current_user.id),
        SavedMaterial.material_id == material_id,
    )
    if existing:
        return {"saved": True}
    await SavedMaterial(user_id=str(current_user.id), material_id=material_id).insert()
    return {"saved": True}


@router.delete("/{material_id}/save", status_code=status.HTTP_200_OK)
async def unsave_material(material_id: str, current_user: User = Depends(get_current_user)):
    await SavedMaterial.find(
        SavedMaterial.user_id == str(current_user.id),
        SavedMaterial.material_id == material_id,
    ).delete()
    return {"saved": False}
