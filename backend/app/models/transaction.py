import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Enum, Numeric, DateTime, Integer, Boolean, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TransactionBatch(Base):
    __tablename__ = "transaction_batches"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    filename: Mapped[str] = mapped_column(String(255))
    records_total: Mapped[int] = mapped_column(Integer, default=0)
    records_matched: Mapped[int] = mapped_column(Integer, default=0)
    records_errors: Mapped[int] = mapped_column(Integer, default=0)
    records_antifraud: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        Enum("uploaded", "processing", "completed", "error", name="batch_status"),
        default="uploaded",
    )
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    transactions: Mapped[list["Transaction"]] = relationship(back_populates="batch")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    batch_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("transaction_batches.id")
    )
    transaction_id_external: Mapped[str] = mapped_column(
        String(255), unique=True, index=True
    )
    phone_hash: Mapped[str] = mapped_column(String(64), index=True)
    terminal_id: Mapped[str] = mapped_column(String(100), index=True)
    mcc: Mapped[str] = mapped_column(String(10))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    processed: Mapped[bool] = mapped_column(Boolean, default=False)

    batch: Mapped[TransactionBatch] = relationship(back_populates="transactions")
