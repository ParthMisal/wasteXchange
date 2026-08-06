from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserSignup(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    company: Optional[str] = Field(default=None, max_length=100)
    location: Optional[str] = Field(default=None, max_length=150)

    @field_validator("name", "company", "location")
    @classmethod
    def strip_optional_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped and value != "":
            raise ValueError("Field must not be empty")
        return stripped


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    company: Optional[str] = None
    role: str = "user"
    location: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"