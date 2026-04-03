"""Payout generation and download API."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.partner import User
from app.models.payout import Payout
from app.schemas.payout import PayoutGenerateRequest, PayoutResponse
from app.api.deps import require_role
from app.services.payout import generate_client_payout, generate_revshare_payout

router = APIRouter(prefix="/payouts", tags=["payouts"])


@router.post("/generate", response_model=PayoutResponse)
async def generate_payout(
    body: PayoutGenerateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    if body.type == "client":
        payout = await generate_client_payout(db, body.period_start, body.period_end)
    elif body.type in ("nspk", "beeline_th", "beeline_invest"):
        payout = await generate_revshare_payout(
            db, body.period_start, body.period_end, body.type
        )
    else:
        raise HTTPException(400, "Invalid payout type")

    await db.commit()
    await db.refresh(payout)

    return PayoutResponse.model_validate(payout)


@router.get("/{payout_id}", response_model=PayoutResponse)
async def get_payout(
    payout_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    payout = await db.get(Payout, payout_id)
    if not payout:
        raise HTTPException(404, "Payout not found")
    return PayoutResponse.model_validate(payout)
