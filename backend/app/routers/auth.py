from fastapi import APIRouter, status

from app.schemas.auth import LoginRequest, SignupRequest, SignupResponse, TokenResponse
from app.services.auth_service import login_user, signup_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def signup(payload: SignupRequest) -> SignupResponse:
    """Create a new buyer or seller account."""
    await signup_user(payload)
    return SignupResponse(message="User created successfully")


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT access token",
)
async def login(payload: LoginRequest) -> TokenResponse:
    """Authenticate with email and password and return a Bearer access token."""
    token, user = await login_user(payload.email, payload.password)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user,
    )
