from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class Account(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "accounts"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    plaid_account_id: Mapped[str | None] = mapped_column(String(255), unique=True)
    plaid_item_id: Mapped[str | None] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    official_name: Mapped[str | None] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    subtype: Mapped[str | None] = mapped_column(String(50))
    mask: Mapped[str | None] = mapped_column(String(10))
    institution_name: Mapped[str | None] = mapped_column(String(255))
    institution_logo: Mapped[str | None] = mapped_column(String(500))
    balance_current: Mapped[float | None] = mapped_column(Numeric(12, 2))
    balance_available: Mapped[float | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(
        String(3), server_default="USD", nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="accounts")
    transactions = relationship(
        "Transaction", back_populates="account", cascade="all, delete-orphan"
    )
