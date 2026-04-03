import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    String, Text, Enum, Numeric, Date, DateTime, Integer,
    ForeignKey, JSON, func, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    partner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("partners.id"))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(512))
    cashback_type: Mapped[str] = mapped_column(
        Enum("percent", "fixed", name="cashback_type")
    )
    cashback_rate: Mapped[Decimal] = mapped_column(Numeric(10, 4))
    min_check: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    max_cashback_per_tx: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    max_cashback_per_client: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    budget: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    budget_spent: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00")
    )
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(
        Enum("draft", "moderation", "active", "paused", "finished", name="offer_status"),
        default="draft",
    )
    segment: Mapped[str] = mapped_column(
        Enum("all", "new", "existing", name="offer_segment"), default="all"
    )
    geo: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    partner: Mapped["Partner"] = relationship(back_populates="offers")  # noqa: F821
    terminals: Mapped[list["OfferTerminal"]] = relationship(
        back_populates="offer", cascade="all, delete-orphan"
    )
    placements: Mapped[list["OfferPlacement"]] = relationship(
        back_populates="offer", cascade="all, delete-orphan"
    )


class OfferTerminal(Base):
    __tablename__ = "offer_terminals"
    __table_args__ = (
        UniqueConstraint("offer_id", "terminal_id", name="uq_offer_terminal"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    offer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("offers.id", ondelete="CASCADE"))
    terminal_id: Mapped[str] = mapped_column(String(100), index=True)
    mcc: Mapped[str | None] = mapped_column(String(10), nullable=True)

    offer: Mapped[Offer] = relationship(back_populates="terminals")


class OfferPlacement(Base):
    __tablename__ = "offer_placements"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    offer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("offers.id", ondelete="CASCADE"))
    placement_type: Mapped[str] = mapped_column(
        Enum("catalog", "banner", "push", "stories", name="placement_type")
    )
    cpm_rate: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    budget: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    budget_spent: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00")
    )
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    offer: Mapped[Offer] = relationship(back_populates="placements")
