from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .call import ServiceCall

class DiagnosticReport(Base):
    __tablename__ = "diagnostic_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    call_id: Mapped[int] = mapped_column(Integer, ForeignKey("servicecalls.id"))
    file_url: Mapped[str] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default= func.now())
    #server_default=func.now() sets the default value of the created_at column
    #to the current timestamp when a new record is inserted into the database

    servicecall: Mapped["ServiceCall"] = relationship(back_populates="diagnostic_reports")

    def __repr__(self) -> str:
        return (f"DiagnosticReport(id={self.id}, mission_id={self.call_id}, "
                f"file_url={self.file_url!r})")
