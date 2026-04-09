from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class Goal(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "goals"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    target_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    current_amount: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default="0", nullable=False
    )
    deadline: Mapped[date | None] = mapped_column(Date)
    linked_account_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL")
    )
    status: Mapped[str] = mapped_column(
        String(20), server_default="active", nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="goals")
