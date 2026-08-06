from typing import Optional

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings
from app.models.user import User

settings = get_settings()

_client: Optional[AsyncIOMotorClient] = None


async def init_db() -> None:
    """Initialise the MongoDB client, verify connectivity and set up Beanie ODM."""
    global _client

    _client = AsyncIOMotorClient(settings.MONGO_URI)
    database = _client[settings.MONGO_DB_NAME]

    await database.command("ping")

    await init_beanie(
        database=database,
        document_models=[User],
    )


async def close_db() -> None:
    """Close the MongoDB client connection."""
    global _client

    if _client is not None:
        _client.close()
        _client = None


def get_database() -> AsyncIOMotorDatabase:
    """Return the active MongoDB database handle."""
    if _client is None:
        raise RuntimeError("Database not initialised. Call init_db() first.")
    return _client[settings.MONGO_DB_NAME]
