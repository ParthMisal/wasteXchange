"""Google Maps integration: geocoding + distance matrix with haversine fallback.

When GOOGLE_MAPS_API_KEY is configured, the Google Geocoding and Distance
Matrix APIs are used. Otherwise a haversine (great-circle) fallback keeps
every feature working for demos / local development.
"""
import math
from typing import Optional

import httpx

from app.core.config import get_settings

settings = get_settings()

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
DISTANCE_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance between two coordinates in kilometres."""
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


async def geocode(address: str) -> Optional[dict]:
    """Resolve a free-text address to {address, latitude, longitude}.

    Returns None when the address cannot be resolved.
    """
    if not address or not address.strip():
        return None

    if settings.GOOGLE_MAPS_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    GEOCODE_URL,
                    params={
                        "address": address,
                        "key": settings.GOOGLE_MAPS_API_KEY,
                        "language": settings.GOOGLE_MAPS_LANGUAGE,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
            if data.get("status") == "OK" and data.get("results"):
                loc = data["results"][0]["geometry"]["location"]
                return {
                    "address": data["results"][0].get("formatted_address", address),
                    "latitude": loc["lat"],
                    "longitude": loc["lng"],
                }
        except Exception:
            pass

    # Fallback: a rough geocode for Indian cities so demos work offline.
    rough = _rough_city_lookup(address)
    if rough:
        return {
            "address": address,
            "latitude": rough[0],
            "longitude": rough[1],
        }
    return None


async def distance_between(
    origin: tuple[float, float] | None,
    destination: tuple[float, float] | None,
    *,
    origin_address: str = "",
    destination_address: str = "",
) -> dict:
    """Return {distance_km, duration_min, source}.

    Uses the Google Distance Matrix API when a key is present and both
    endpoints resolve; otherwise falls back to haversine.
    """
    empty = {"distance_km": None, "duration_min": None, "source": "unknown"}

    if settings.GOOGLE_MAPS_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    DISTANCE_URL,
                    params={
                        "origins": origin_address or origin,
                        "destinations": destination_address or destination,
                        "key": settings.GOOGLE_MAPS_API_KEY,
                        "mode": "driving",
                        "units": "metric",
                    },
                )
                resp.raise_for_status()
                data = resp.json()
            if data.get("status") == "OK":
                row = data.get("rows", [{}])[0]
                element = (row.get("elements") or [{}])[0]
                if element.get("status") == "OK":
                    distance_m = element["distance"]["value"]
                    duration_s = element["duration"]["value"]
                    return {
                        "distance_km": round(distance_m / 1000, 1),
                        "duration_min": round(duration_s / 60),
                        "source": "google",
                    }
        except Exception:
            pass

    if origin and destination:
        km = haversine_km(*origin, *destination)
        # ~40 km/h average freight speed
        return {
            "distance_km": round(km, 1),
            "duration_min": max(1, round(km / 40 * 60)),
            "source": "haversine",
        }

    return empty


def _rough_city_lookup(address: str) -> Optional[tuple[float, float]]:
    """Rough coordinates for common Indian cities (offline fallback)."""
    text = (address or "").lower()
    cities = {
        "mumbai": (19.0760, 72.8777),
        "delhi": (28.6139, 77.2090),
        "new delhi": (28.6139, 77.2090),
        "bengaluru": (12.9716, 77.5946),
        "bangalore": (12.9716, 77.5946),
        "hyderabad": (17.3850, 78.4867),
        "chennai": (13.0827, 80.2707),
        "kolkata": (22.5726, 88.3639),
        "pune": (18.5204, 73.8567),
        "ahmedabad": (23.0225, 72.5714),
        "jaipur": (26.9124, 75.7873),
        "lucknow": (26.8467, 80.9462),
        "surat": (21.1702, 72.8311),
        "kanpur": (26.4499, 80.3319),
        "nagpur": (21.1458, 79.0882),
        "indore": (22.7196, 75.8577),
        "bhopal": (23.2599, 77.4126),
        "ludhiana": (30.9010, 75.8573),
        "chandigarh": (30.7333, 76.7794),
        "coimbatore": (11.0168, 76.9558),
        "kochi": (9.9312, 76.2673),
        "vizag": (17.6868, 83.2185),
        "visakhapatnam": (17.6868, 83.2185),
        "guwahati": (26.1445, 91.7362),
        "raipur": (21.2514, 81.6296),
        "patna": (25.5941, 85.1376),
        "vadodara": (22.3072, 73.1812),
    }
    for city, coords in cities.items():
        if city in text:
            return coords
    return None
