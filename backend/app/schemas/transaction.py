from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class TransactionRecord(BaseModel):
    transaction_id: str
    phone_hash: str
    terminal_id: str
    mcc: str
    amount: Decimal
    timestamp: datetime


class BatchUploadResponse(BaseModel):
    batch_id: str
    records_total: int
    status: str


class BatchStatusResponse(BaseModel):
    batch_id: str
    filename: str
    records_total: int
    records_matched: int
    records_errors: int
    records_antifraud: int
    status: str
    uploaded_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class MatchResultResponse(BaseModel):
    transaction_id: str
    offer_id: str
    offer_name: str
    client_phone_hash: str
    amount: Decimal
    cashback_amount: Decimal
    status: str
