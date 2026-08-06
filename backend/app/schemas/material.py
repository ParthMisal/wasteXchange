from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MaterialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    seller_id: str
    name: str
    category: str
    subcategory: Optional[str] = None
    quantity: float
    unit: str
    price: float
    purity: Optional[str] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    images: list[str] = []
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "available"
    views: int = 0
    distance_km: Optional[float] = None
    duration_min: Optional[int] = None
    seller_name: Optional[str] = None
    seller_company: Optional[str] = None
    verified: bool = False
    created_at: datetime
    updated_at: datetime


class MaterialSummary(BaseModel):
    totalListings: int
    pendingRequests: int
    totalTonnes: int
    totalValue: float


class MatchResponse(BaseModel):
    material_id: str
    material_name: str
    category: str
    quantity: float
    unit: str
    price: float
    purity: Optional[str] = None
    images: list[str] = []
    seller_id: str
    seller_name: Optional[str] = None
    verified: bool = False
    status: str = "available"
    match_score: float
    deal_quality: float
    breakdown: dict = {}
    distance_km: Optional[float] = None
    duration_min: Optional[int] = None
    distance_source: Optional[str] = None
    location: Optional[str] = None
    ai_reason: Optional[str] = None
    created_at: Optional[str] = None
