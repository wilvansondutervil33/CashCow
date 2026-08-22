from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .operator import Operator
    from .robot import Robot

class Branch(Base):
    #setting the table name for the facility model in the database
    __tablename__ = "branches"

    #define our columns
    id: Mapped[int] = mapped_column(primary_key = True)
    name: Mapped[str] = mapped_column(String(100))
    location_region: Mapped[str] = mapped_column(String(50))
    capacity: Mapped[int] = mapped_column(Integer)
    supervisor_id: Mapped[int] = mapped_column(Integer)


    def __repr__(self) -> str:
        return (f"Branch(id={self.id}, name={self.name!r}, "
                f"region={self.location_region!r})")

























from typing import ClassVar


class Branch:

    registry: ClassVar[list["Branch"]] = []

    def __init__(self, branch_id:int, name:str, location_region:str, capacity:int, supervisor_id:int):

        self.id = branch_id
        self.name = name
        self.capacity = capacity
        self.location_region = location_region
        self.supervisor_id = supervisor_id
        Branch.registry.append(self)

    def __repr__(self) -> str:
        return (f"Branch(id={self.id}, name={self.name!r}, "
                 f"region={self.location_region!r})")

    @classmethod
    def find_by_id(cls, branch_id:int) -> "Branch | None ":
        for b in cls.registry:
            if b.id == branch_id:
                return b
        return None