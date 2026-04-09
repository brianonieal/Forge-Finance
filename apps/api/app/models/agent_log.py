from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class AgentLog(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "agent_log"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    agent: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    input_tokens: Mapped[int] = mapped_column(
        Integer, server_default="0", nullable=False
    )
    output_tokens: Mapped[int] = mapped_column(
        Integer, server_default="0", nullable=False
    )
    cost: Mapped[float] = mapped_column(
        Numeric(8, 6), server_default="0", nullable=False
    )
    duration_ms: Mapped[int] = mapped_column(
        Integer, server_default="0", nullable=False
    )
    query: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(
        String(20), server_default="success", nullable=False
    )
