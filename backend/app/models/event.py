import uuid
from datetime import datetime

from sqlalchemy import Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UIEvent(Base):
    __tablename__ = "ui_events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    client_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("clients.id"), nullable=True, index=True
    )
    offer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("offers.id"), index=True
    )
    event_type: Mapped[str] = mapped_column(
        Enum("impression", "click", "activation", name="event_type")
    )
    placement_type: Mapped[str] = mapped_column(
        Enum("catalog", "banner", "push", "stories", name="event_placement_type")
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
