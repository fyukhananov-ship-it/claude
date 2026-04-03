import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import String, Enum, Numeric, Date, DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Payout(Base):
    __tablename__ = "payouts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    type: Mapped[str] = mapped_column(
        Enum("client", "nspk", "beeline_th", "beeline_invest", name="payout_type")
    )
    period_start: Mapped[date] = mapped_column(Date)
    period_end: Mapped[date] = mapped_column(Date)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    records_count: Mapped[int] = mapped_column(Integer)
    file_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("generated", "sent", "confirmed", name="payout_status"),
        default="generated",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
