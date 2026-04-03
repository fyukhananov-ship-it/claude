from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.v1 import auth, offers, billing, transactions, client, admin, payouts

app = FastAPI(
    title="CLO Platform — Билайн×НСПК",
    description="Card-Linked Offers MVP",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(offers.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(client.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(payouts.router, prefix="/api/v1")

# Serve uploaded files
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
