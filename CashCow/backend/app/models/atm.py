from __future__ import annotations
from typing import TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import Integer, String, Numeric, CheckConstraint
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .enums import ATMStatus


class Atm(Base):

    __tablename__ = "atms"

    __table_args__ = (
        CheckConstraint("cash_level BETWEEN 0 AND 10000",
                        name="cash_level_range"),
    )
    

    id: Mapped[int] = mapped_column(primary_key = True)
    serial_number: Mapped[int] = mapped_column(Integer)
    model: Mapped[str] = mapped_column(String(50))
    cash_level: Mapped[Decimal] = mapped_column(Numeric(5,2))
    status: Mapped[ATMStatus] = mapped_column(
        SqlEnum(
            ATMStatus,
            name="atm_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default= ATMStatus.OFFLINE,
    )
    facility_id: Mapped[int] = mapped_column(Integer)


    def needs_maintenance(self) -> bool:
        return self.status == ATMStatus.MAINTENANCE

    #tostring
    def __repr__(self) -> str:
        return (f"Atm(serial={self.serial_number!r}, model={self.model!r}, "
                f"Atm={self.cash_level}%, status={self.status.value})")

    