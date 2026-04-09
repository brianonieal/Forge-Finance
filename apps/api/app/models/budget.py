from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class Budget(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "budgets"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    amount_limit: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    period: Mapped[str] = mapped_column(
        String(20), server_default="monthly", nullable=False
    )
    alert_threshold: Mapped[int] = mapped_column(server_default="70", nullable=False)

    # Relationships
    user = relationship("User", back_populates="budgets")
