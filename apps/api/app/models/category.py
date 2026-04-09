from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKey


class Category(UUIDPrimaryKey, TimestampMixin, Base):
    __tablename__ = "categories"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(
        String(7), server_default="#8B96A8", nullable=False
    )
    icon: Mapped[str | None] = mapped_column(String(50))
    is_default: Mapped[bool] = mapped_column(server_default="false", nullable=False)

    # Relationships
    user = relationship("User", back_populates="categories")
