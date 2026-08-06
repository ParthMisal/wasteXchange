from datetime import datetime
from typing import Literal, Optional

from pydantic import (
    AliasChoices,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)


class SignupRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    full_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    company_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        validation_alias=AliasChoices("company_name", "companyName"),
    )
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: Literal["buyer", "seller"] = "seller"
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("address", "city"),
    )
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @field_validator("full_name", "company_name")
    @classmethod
    def strip_required_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("Field must not be empty")
        return stripped

    @model_validator(mode="after")
    def default_full_name(self) -> "SignupRequest":
        if not self.full_name and self.company_name:
            self.full_name = self.company_name
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: str
    full_name: str
    company_name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class SignupResponse(BaseModel):
    message: str
