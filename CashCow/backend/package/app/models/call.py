from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .enums import CallPriority, CallStatus


if TYPE_CHECKING:
    from .atm import Atm
    from .diagnostic import DiagnosticReport
    from .technician import Technician

class ServiceCall(Base):
    __tablename__ = "servicecalls"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150))
    priority: Mapped[CallPriority] = mapped_column(
        SqlEnum(
            CallPriority,
            name="call_priority",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        )
    )
    status: Mapped[CallStatus] = mapped_column(
        SqlEnum(
            CallStatus,
            name="call_status",
            values_callable = lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=CallStatus.PENDING,
    )
    atm_id: Mapped[int]= mapped_column(Integer, ForeignKey("atms.id"))
    technician_id: Mapped[int]= mapped_column(Integer, ForeignKey("technicians.id"))

    #Left: singular because this is the 'one' side of the relationship
    #Right: plural because this is the 'to-many' side of the relationship
    atm: Mapped["Atm"] = relationship(back_populates="servicecalls")
    technician: Mapped["Technician"] = relationship(back_populates="servicecalls")
    diagnostic_reports: Mapped[list["DiagnosticReport"]] = relationship(back_populates="servicecall")
