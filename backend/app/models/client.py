import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Integer, Enum, Numeric, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    phone_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    msisdn_encrypted: Mapped[str | None] = mapped_column(String(512), nullable=True)
    cashback_total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=Decimal("0.00")
    )
    gacha_pity: Mapped[int] = mapped_column(Integer, default=0)
    gacha_total_pulls: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    activations: Mapped[list["ClientActivation"]] = relationship(back_populates="client")


class ClientActivation(Base):
    __tablename__ = "client_activations"
    __table_args__ = (
        UniqueConstraint("client_id", "offer_id", name="uq_client_offer"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    client_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("clients.id"))
    offer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("offers.id"))
    activated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    status: Mapped[str] = mapped_column(
        Enum("active", "used", "expired", name="activation_status"), default="active"
    )

    client: Mapped[Client] = relationship(back_populates="activations")
    offer: Mapped["Offer"] = relationship()  # noqa: F821
