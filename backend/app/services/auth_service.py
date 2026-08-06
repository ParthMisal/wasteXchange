from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import SignupRequest, UserResponse


def _to_user_response(user: User) -> UserResponse:
    """Map a User document to the public response schema."""
    return UserResponse(
        id=str(user.id),
        full_name=user.full_name,
        company_name=user.company_name,
        email=user.email,
        role=user.role,
        roles=user.active_roles or ["user"],
        phone=user.phone,
        address=user.address,
        location=user.location,
        latitude=user.latitude,
        longitude=user.longitude,
        verified=user.verified,
        created_at=user.created_at,
    )


async def signup_user(payload: SignupRequest) -> User:
    """Create a new user. Raises 409 if the email is already registered."""
    email = payload.email.lower()

    existing = await User.find_one(User.email == email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    roles = list(payload.roles or ["seller"])
    user = User(
        full_name=payload.full_name,
        company_name=payload.company_name,
        email=email,
        hashed_password=hash_password(payload.password),
        role=roles[0],
        roles=roles,
        phone=payload.phone,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    await user.insert()
    return user


async def add_role(user: User, role: str) -> User:
    """Grant an additional role (buyer/seller) to an existing account."""
    role = role.lower()
    if role not in ("buyer", "seller"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid role")

    roles = list(user.active_roles)
    if role not in roles:
        roles.append(role)
        user.roles = roles
        user.role = roles[0]
        user.updated_at = datetime.now(timezone.utc)
        await user.save()

    return user


async def login_user(email: str, password: str) -> tuple[str, UserResponse]:
    """Authenticate credentials and return an access token with the user.

    Raises 401 for unknown email or an invalid password.
    """
    user = await User.find_one(User.email == email.lower())
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    roles = user.active_roles or ["user"]
    token = create_access_token(
        subject=str(user.id),
        role=user.role or roles[0],
        roles=roles,
    )
    return token, _to_user_response(user)
