from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

# Single password context reused across the app.
# - bcrypt is the active scheme.
# - `deprecated="auto"` keeps support for verifying old hashes while only
#   emitting bcrypt for new ones, so future algorithm migrations stay smooth.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt.

    - Never store the raw password.
    - bcrypt salts automatically on every call, so the same password always
      produces a different hash -- required for secure storage.
    - Returns a self-contained hash string (scheme + salt + digest) that
      verify_password() parses back later.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash.

    - Supports the default cost factor already baked into the stored hash.
    - Always returns a bool; never raises on mismatched input.
    - The comparison runs in constant time inside Passlib, reducing the risk
      of timing-based enumeration of a valid hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    subject: str,
    role: str,
    roles: Optional[list[str]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token for a user."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "roles": roles or [role],
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token. Raises JWTError if invalid."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
