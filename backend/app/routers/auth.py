from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    AddRoleRequest,
    LoginRequest,
    SignupRequest,
    SignupResponse,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import add_role, login_user, signup_user
from app.services.auth_service import _to_user_response

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def signup(payload: SignupRequest) -> SignupResponse:
    """Create a new buyer and/or seller account."""
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


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently authenticated user",
)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the profile of the logged-in user (useful after refresh)."""
    return _to_user_response(current_user)


@router.post(
    "/me/roles",
    response_model=UserResponse,
    summary="Grant an additional role to the current account",
)
async def add_my_role(
    payload: AddRoleRequest,
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Upgrade a buyer account to also sell (or vice versa) with the same email."""
    user = await add_role(current_user, payload.role)
    return _to_user_response(user)
