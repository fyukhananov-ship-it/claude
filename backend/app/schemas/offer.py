from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class OfferCreate(BaseModel):
    name: str = Field(max_length=255)
    description: str
    cashback_type: str = Field(pattern="^(percent|fixed)$")
    cashback_rate: Decimal
    min_check: Decimal
    max_cashback_per_tx: Decimal
    max_cashback_per_client: Decimal
    budget: Decimal
    start_date: date
    end_date: date
    segment: str = Field(default="all", pattern="^(all|new|existing)$")
    geo: dict | None = None


class OfferUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    cashback_type: str | None = None
    cashback_rate: Decimal | None = None
    min_check: Decimal | None = None
    max_cashback_per_tx: Decimal | None = None
    max_cashback_per_client: Decimal | None = None
    budget: Decimal | None = None
    start_date: date | None = None
    end_date: date | None = None
    segment: str | None = None
    geo: dict | None = None


class OfferStatusUpdate(BaseModel):
    status: str = Field(pattern="^(draft|moderation|active|paused|finished)$")


class OfferResponse(BaseModel):
    id: str
    partner_id: str
    name: str
    description: str
    image_url: str | None = None
    cashback_type: str
    cashback_rate: Decimal
    min_check: Decimal
    max_cashback_per_tx: Decimal
    max_cashback_per_client: Decimal
    budget: Decimal
    budget_spent: Decimal
    start_date: date
    end_date: date
    status: str
    segment: str
    geo: dict | None = None
    created_at: datetime
    terminals_count: int = 0
    placements: list["PlacementResponse"] = []

    model_config = {"from_attributes": True}


class PlacementCreate(BaseModel):
    placement_type: str = Field(pattern="^(catalog|banner|push|stories)$")
    cpm_rate: Decimal | None = None
    budget: Decimal | None = None
    start_date: date | None = None
    end_date: date | None = None


class PlacementResponse(BaseModel):
    id: int
    placement_type: str
    cpm_rate: Decimal | None = None
    budget: Decimal | None = None
    budget_spent: Decimal
    impressions: int
    clicks: int
    start_date: date | None = None
    end_date: date | None = None

    model_config = {"from_attributes": True}


class OfferStatsResponse(BaseModel):
    offer_id: str
    impressions: int = 0
    clicks: int = 0
    ctr: float = 0.0
    activations: int = 0
    purchases: int = 0
    gmv: Decimal = Decimal("0.00")
    cashback_total: Decimal = Decimal("0.00")
    budget_remaining: Decimal = Decimal("0.00")


class OfferDailyStats(BaseModel):
    date: date
    impressions: int = 0
    clicks: int = 0
    activations: int = 0
    purchases: int = 0
    gmv: Decimal = Decimal("0.00")
    cashback: Decimal = Decimal("0.00")
