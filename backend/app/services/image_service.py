"""Local image storage for material listings (served via StaticFiles)."""
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import get_settings

settings = get_settings()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def _upload_dir() -> Path:
    path = Path(settings.UPLOAD_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def upload_dir_absolute() -> Path:
    """Resolve the uploads directory relative to the backend root."""
    return Path(settings.UPLOAD_DIR).resolve()


async def save_image(file: UploadFile) -> str:
    """Persist an uploaded image and return its public URL path."""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    destination = _upload_dir() / filename

    size_limit = settings.MAX_UPLOAD_MB * 1024 * 1024
    written = 0
    with destination.open("wb") as out:
        while chunk := await file.read(1024 * 1024):
            written += len(chunk)
            if written > size_limit:
                await file.close()
                destination.unlink(missing_ok=True)
                raise ValueError(f"Image exceeds {settings.MAX_UPLOAD_MB}MB limit")
            out.write(chunk)

    return f"/uploads/{filename}"


def delete_image(url: str) -> None:
    """Remove an image file from disk (best-effort)."""
    if not url or not url.startswith("/uploads/"):
        return
    filename = url.rsplit("/", 1)[-1]
    (Path(settings.UPLOAD_DIR) / filename).unlink(missing_ok=True)
