from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class Conversation(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "conversations"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    messages: Mapped[list] = mapped_column(JSONB, server_default="[]", nullable=False)
    title: Mapped[str | None] = mapped_column()

    # Relationships
    user = relationship("User", back_populates="conversations")
