from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Indexed
from pydantic import Field

MATERIAL_CATEGORIES = [
    "Plastic",
    "Metal",
    "Chemical",
    "Textile",
    "Wood",
    "E-waste",
    "Paper",
    "Glass",
    "Rubber",
    "Organic",
    "Construction",
    "Other",
]


class Material(Document):
    """An industrial surplus / waste material listed by a seller."""

    seller_id: str
    name: str
    category: str = "Other"
    subcategory: Optional[str] = None
    quantity: float = 0
    unit: str = "kg"
    price: float = 0
    purity: Optional[str] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    images: list[str] = Field(default_factory=list)
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "available"
    views: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "materials"
        indexes = [
            [("category", 1)],
            [("status", 1)],
            [("seller_id", 1)],
            [("price", 1)],
            [("quantity", 1)],
        ]
