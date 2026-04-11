from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import auth, offers, billing, transactions, client, admin, payouts
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown — close Redis connection if opened
    try:
        from app.utils.cache import _redis
        if _redis is not None:
            await _redis.close()
    except Exception:
        pass


app = FastAPI(
    title="CLO Platform — Билайн×НСПК",
    description="Card-Linked Offers MVP",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# API v1 routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(offers.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(client.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(payouts.router, prefix="/api/v1")

# Serve uploaded files (local backend only — for S3, frontend fetches from Object Storage directly)
uploads_dir = Path(settings.UPLOAD_DIR)
uploads_dir.mkdir(exist_ok=True)
app.mount(f"/{settings.UPLOAD_DIR}", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/api/health")
async def health():
    return {"status": "ok", "storage": settings.STORAGE_BACKEND, "cache": settings.CACHE_ENABLED}
