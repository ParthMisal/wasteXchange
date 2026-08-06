"""AI matchmaking endpoint: /api/match"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.material import MatchResponse
from app.services.maps_service import geocode
from app.services.matching_service import find_matches

router = APIRouter(prefix="/api/match", tags=["match"])


@router.get("", response_model=dict)
async def get_matches(
    category: str = "",
    quantity: Optional[float] = None,
    unit: str = "",
    location: str = "",
    current_user: User = Depends(get_current_user),
):
    """Rank available listings against the buyer's requirement using AI.

    match_score blends deal quality (category fit, quantity, price, quality,
    seller trust) with distance (Google Distance Matrix / haversine).
    """
    if current_user.role not in ("buyer",) and "buyer" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI matching is a buyer feature",
        )

    requirement = {
        "category": category.strip(),
        "quantity": quantity,
        "unit": unit.strip() or "kg",
    }

    # Resolve the buyer's location (query param overrides profile)
    user_location = None
    if current_user.latitude is not None and current_user.longitude is not None:
        user_location = (current_user.latitude, current_user.longitude)

    geo = None
    if location and location.strip():
        geo = await geocode(location.strip())
    if geo:
        user_location = (geo["latitude"], geo["longitude"])
        requirement["location_resolved"] = geo["address"]

    result = await find_matches(requirement, user_location)

    matches = [MatchResponse(**m) for m in result["matches"]]
    return {
        "matches": matches,
        "insight": result.get("insight", ""),
        "market_avg_price": result.get("market_avg_price"),
        "requirement": requirement,
    }
