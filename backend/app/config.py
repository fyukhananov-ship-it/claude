from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://clo:clo_secret@localhost:5432/clo_db"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET: str = "change-me-in-production-very-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 2 * 1024 * 1024  # 2MB

    PLATFORM_COMMISSION_RATE: float = 0.036  # 3.6%
    REVSHARE_TRAFFIC_HOLDER: float = 0.20
    REVSHARE_NSPK: float = 0.17
    REVSHARE_BEELINE: float = 0.10

    ANTIFRAUD_MAX_ACCRUALS_PER_DAY: int = 3
    ANTIFRAUD_TERMINAL_SPIKE_THRESHOLD: float = 0.50

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
