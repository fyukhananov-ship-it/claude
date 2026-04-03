import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Enum, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Partner(Base):
    __tablename__ = "partners"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    logo_url: Mapped[str | None] = mapped_column(String(512))
    contact_email: Mapped[str] = mapped_column(String(255))
    contact_phone: Mapped[str | None] = mapped_column(String(50))
    balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))
    status: Mapped[str] = mapped_column(
        Enum("active", "blocked", name="partner_status"), default="active"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    users: Mapped[list["User"]] = relationship(back_populates="partner")
    offers: Mapped[list["Offer"]] = relationship(back_populates="partner")  # noqa: F821


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(
        Enum("partner_admin", "partner_manager", "operator", name="user_role")
    )
    partner_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("partners.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    partner: Mapped[Partner | None] = relationship(back_populates="users")
