from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ─── Database ───
    DATABASE_URL: str = "postgresql+asyncpg://clo:clo_secret@localhost:5432/clo_db"

    # ─── Redis / Valkey cache ───
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 60
    CACHE_ENABLED: bool = True

    # ─── Auth ───
    JWT_SECRET: str = "change-me-in-production-very-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── File storage ───
    # Backend selector: "local" (uploads/ dir) or "s3" (Yandex Object Storage)
    STORAGE_BACKEND: str = "local"
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 2 * 1024 * 1024  # 2MB

    # ─── S3 (Yandex Object Storage) ───
    S3_ENDPOINT_URL: str = "https://storage.yandexcloud.net"
    S3_REGION: str = "ru-central1"
    S3_BUCKET_UPLOADS: str = "beeline-clo-uploads"
    # Public base for returned URLs. Leave empty to build from endpoint+bucket.
    # Example: https://beeline-clo-uploads.storage.yandexcloud.net
    S3_PUBLIC_BASE_URL: str = ""
    YC_ACCESS_KEY: str = ""
    YC_SECRET_KEY: str = ""

    # ─── CORS ───
    # Comma-separated list of allowed origins. Use "*" only in dev.
    CORS_ORIGINS: str = "*"

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ─── Business rules ───
    PLATFORM_COMMISSION_RATE: float = 0.036  # 3.6%
    REVSHARE_TRAFFIC_HOLDER: float = 0.20
    REVSHARE_NSPK: float = 0.17
    REVSHARE_BEELINE: float = 0.10

    # ─── Anti-fraud ───
    ANTIFRAUD_MAX_ACCRUALS_PER_DAY: int = 3
    ANTIFRAUD_TERMINAL_SPIKE_THRESHOLD: float = 0.50

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
