from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Indexed
from pydantic import Field


class User(Document):
    """A registered user of the Eco-Sync platform (buyer or seller)."""

    name: Optional[str] = None
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    company: Optional[str] = None
    email: Indexed(str, unique=True)
    hashed_password: str
    role: str = "user"
    phone: Optional[str] = None
    address: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
