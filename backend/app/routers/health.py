from fastapi import APIRouter

from app.core.database import get_database

router = APIRouter()


@router.get("/", summary="Health check")
async def health_check() -> dict[str, str]:
    """Confirm the backend is running and the database is reachable."""
    try:
        database = get_database()
        await database.command("ping")
        database_status = "Connected"
    except Exception:
        database_status = "Disconnected"

    return {
        "status": "Backend Running",
        "database": database_status,
    }
