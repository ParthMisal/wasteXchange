from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Link
from pydantic import Field

REQUEST_STATUSES = ("pending", "accepted", "in_transit", "completed", "rejected")


class Request(Document):
    """A buyer's request for a seller's material listing."""

    material_id: str
    buyer_id: str
    seller_id: str
    quantity: float = 0
    unit: str = "kg"
    price: float = 0
    status: str = "pending"
    note: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "requests"
        indexes = [
            [("buyer_id", 1)],
            [("seller_id", 1)],
            [("material_id", 1)],
            [("status", 1)],
        ]
