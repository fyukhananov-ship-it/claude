import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Enum, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("transactions.id"), index=True
    )
    offer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("offers.id"), index=True
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("clients.id"), index=True
    )
    cashback_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    commission_platform: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    revshare_traffic_holder: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    revshare_nspk: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    revshare_beeline: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    net_platform: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    status: Mapped[str] = mapped_column(
        Enum("pending", "approved", "paid", "rejected", name="match_status"),
        default="pending",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    transaction: Mapped["Transaction"] = relationship()  # noqa: F821
    offer: Mapped["Offer"] = relationship()  # noqa: F821
    client: Mapped["Client"] = relationship()  # noqa: F821
