from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.partner import Partner, User
from app.models.billing import BillingTransaction
from app.schemas.billing import BalanceResponse, BillingTransactionResponse
from app.api.deps import require_role

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/balance", response_model=BalanceResponse)
async def get_balance(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    partner = await db.get(Partner, user.partner_id)
    return BalanceResponse(partner_id=str(partner.id), balance=partner.balance)


@router.get("/transactions", response_model=list[BillingTransactionResponse])
async def get_transactions(
    limit: int = 50,
    offset: int = 0,
    type: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    q = (
        select(BillingTransaction)
        .where(BillingTransaction.partner_id == user.partner_id)
        .order_by(BillingTransaction.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    if type:
        q = q.where(BillingTransaction.type == type)

    result = (await db.execute(q)).scalars().all()
    return [BillingTransactionResponse.model_validate(r) for r in result]
