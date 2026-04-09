from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class Transaction(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "transactions"

    account_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("accounts.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    plaid_transaction_id: Mapped[str | None] = mapped_column(String(255), unique=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    merchant_name: Mapped[str | None] = mapped_column(String(255))
    merchant_logo: Mapped[str | None] = mapped_column(String(500))
    category: Mapped[str | None] = mapped_column(String(255))
    subcategory: Mapped[str | None] = mapped_column(String(255))
    pending: Mapped[bool] = mapped_column(server_default="false", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    # Embedding stored via pgvector — column added in migration as vector(1024)

    # Relationships
    account = relationship("Account", back_populates="transactions")
    user = relationship("User", back_populates="transactions")
