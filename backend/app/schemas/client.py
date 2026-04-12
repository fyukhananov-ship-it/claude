from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class ClientOfferResponse(BaseModel):
    id: str
    partner_name: str
    partner_logo: str | None = None
    name: str
    description: str
    image_url: str | None = None
    cashback_type: str
    cashback_rate: Decimal
    min_check: Decimal
    max_cashback_per_tx: Decimal
    start_date: date
    end_date: date
    status: str  # new, activated, cashback_received
    category: str | None = None
    is_featured: bool = False


class ActivationResponse(BaseModel):
    offer_id: str
    activated_at: datetime
    status: str


class CashbackHistoryItem(BaseModel):
    date: datetime
    partner_name: str
    purchase_amount: Decimal
    cashback_amount: Decimal
    status: str  # pending, approved, paid


class CashbackTotalResponse(BaseModel):
    total: Decimal
    period_start: date | None = None
    period_end: date | None = None
