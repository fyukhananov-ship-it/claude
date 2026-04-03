from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class PayoutGenerateRequest(BaseModel):
    period_start: date
    period_end: date
    type: str  # client, nspk, beeline_th, beeline_invest


class PayoutResponse(BaseModel):
    id: str
    type: str
    period_start: date
    period_end: date
    total_amount: Decimal
    records_count: int
    file_url: str | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
