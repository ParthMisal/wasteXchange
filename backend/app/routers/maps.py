"""Map helpers: geocoding and distance (Google Maps API with fallbacks)."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.maps_service import distance_between, geocode

router = APIRouter(prefix="/api/maps", tags=["maps"])


@router.get("/geocode")
async def geocode_endpoint(
    address: str = "",
    current_user: User = Depends(get_current_user),
):
    """Resolve an address/place to coordinates."""
    if not address.strip():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "address is required")
    result = await geocode(address.strip())
    if not result:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Could not resolve location",
        )
    return result


@router.get("/distance")
async def distance_endpoint(
    origin: str = "",
    destination: str = "",
    origin_lat: float = 0,
    origin_lng: float = 0,
    destination_lat: float = 0,
    destination_lng: float = 0,
    current_user: User = Depends(get_current_user),
):
    """Distance + duration between two points (addresses or coordinates)."""
    origin_coords = (origin_lat, origin_lng) if origin_lat or origin_lng else None
    destination_coords = (
        (destination_lat, destination_lng) if destination_lat or destination_lng else None
    )

    if origin_coords and origin_coords == (0, 0):
        origin_coords = None
    if destination_coords and destination_coords == (0, 0):
        destination_coords = None

    result = await distance_between(
        origin_coords,
        destination_coords,
        origin_address=origin,
        destination_address=destination,
    )
    return result
