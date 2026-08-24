"""
Operator Model - Day 3 ORM version
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


if TYPE_CHECKING:
    from .branch import Branch
    from .call import ServiceCall

class Technician(Base):
    __tablename__ = "technicians"

    id: Mapped[int] = mapped_column(primary_key = True)
    name: Mapped[str] = mapped_column(String(100))
    #foreign key
    branch_id: Mapped[int] = mapped_column(Integer, ForeignKey("branches.id"))

    branch: Mapped["Branch"] = relationship(back_populates="technicians")
    call: Mapped[list["ServiceCall"]] = relationship(back_populates="technician")

    def __repr__(self) -> str:
            return (f"Operator(id={self.id}, name={self.name!r}, "
                    f"facility_id={self.facility_id})")
