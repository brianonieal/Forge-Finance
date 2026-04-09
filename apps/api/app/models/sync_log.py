from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class SyncLog(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "sync_log"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    cursor: Mapped[str | None] = mapped_column(Text)
    error_message: Mapped[str | None] = mapped_column(Text)
    transactions_added: Mapped[int] = mapped_column(server_default="0", nullable=False)
    transactions_modified: Mapped[int] = mapped_column(
        server_default="0", nullable=False
    )
    transactions_removed: Mapped[int] = mapped_column(
        server_default="0", nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
