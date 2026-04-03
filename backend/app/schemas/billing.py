from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class BalanceResponse(BaseModel):
    partner_id: str
    balance: Decimal


class BillingTransactionResponse(BaseModel):
    id: int
    type: str
    amount: Decimal
    balance_after: Decimal
    reference_id: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TopupRequest(BaseModel):
    amount: Decimal
