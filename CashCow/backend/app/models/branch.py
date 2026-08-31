from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .atm import Atm
    from .technician import Technician

class Branch(Base):
    #setting the table name for the facility model in the database
    __tablename__ = "branches"

    #define our columns
    id: Mapped[int] = mapped_column(primary_key = True)
    name: Mapped[str] = mapped_column(String(100))
    location_region: Mapped[str] = mapped_column(String(50))
    capacity: Mapped[int] = mapped_column(Integer)
    supervisor_id: Mapped[int] = mapped_column(Integer)

    atms: Mapped[list["Atm"]]= relationship(back_populates="branch")
    technicians: Mapped[list["Technician"]] = relationship(back_populates="branch")
 
    def __repr__(self) -> str:
        return (f"Branch(id={self.id}, name={self.name!r}, "
                f"region={self.location_region!r})")
