import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Enum, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BillingTransaction(Base):
    __tablename__ = "billing_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    partner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("partners.id"))
    type: Mapped[str] = mapped_column(
        Enum("topup", "cashback", "commission", "cpm", name="billing_type")
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    balance_after: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    reference_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
