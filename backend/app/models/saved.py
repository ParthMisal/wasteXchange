from datetime import datetime, timezone

from beanie import Document
from pydantic import Field


class SavedMaterial(Document):
    """A material bookmarked by a buyer for later."""

    user_id: str
    material_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "saved_materials"
        indexes = [
            [("user_id", 1), ("material_id", 1)],
        ]
