from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr


class PartnerCreate(BaseModel):
    name: str
    contact_email: EmailStr
    contact_phone: str | None = None


class PartnerResponse(BaseModel):
    id: str
    name: str
    logo_url: str | None = None
    contact_email: str
    contact_phone: str | None = None
    balance: Decimal
    status: str
    created_at: datetime
    offers_count: int = 0

    model_config = {"from_attributes": True}


class ModerationRequest(BaseModel):
    action: str  # approve or reject
    comment: str | None = None


class DashboardResponse(BaseModel):
    active_offers: int
    total_transactions_today: int
    total_transactions_week: int
    cashback_today: Decimal
    cashback_week: Decimal
    partners_count: int
    low_balance_partners: int


class RevShareResponse(BaseModel):
    period_start: date
    period_end: date
    total_gmv: Decimal
    total_commission: Decimal
    revshare_traffic_holder: Decimal
    revshare_nspk: Decimal
    revshare_beeline: Decimal
    net_platform: Decimal


class PnLItem(BaseModel):
    partner_id: str
    partner_name: str
    gmv: Decimal
    commission: Decimal
    cashback: Decimal
    net: Decimal
