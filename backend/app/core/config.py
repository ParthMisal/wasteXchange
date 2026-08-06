from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "Eco-Sync API"
    APP_VERSION: str = "0.2.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    MONGO_URI: str = ""
    MONGO_DB_NAME: str = "ecosync"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Google Maps (optional - haversine fallback when unset)
    GOOGLE_MAPS_API_KEY: str = ""
    GOOGLE_MAPS_LANGUAGE: str = "en"

    # AI provider (optional - heuristic scoring when unset)
    # Values: "gemini" | "openai" | "none"
    AI_PROVIDER: str = "none"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gemini-2.0-flash"
    AI_TIMEOUT_SECONDS: int = 20

    # Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 8

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
