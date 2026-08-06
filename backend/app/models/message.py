from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import Field


class Message(Document):
    """A chat message within a request thread."""

    request_id: str
    sender_id: str
    sender_name: Optional[str] = None
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "messages"
        indexes = [[("request_id", 1)]]
