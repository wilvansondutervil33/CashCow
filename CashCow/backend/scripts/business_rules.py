import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models import ServiceCall, Atm, Technician, Branch

async def find_colocation_discrepancies_orm(session: AsyncSession) -> list[ServiceCall]:

    statement = (
        select(ServiceCall)
        .join(Atm, Atm.id == ServiceCall.atm_id)
        .join(Technician, Technician.id == ServiceCall.technician_id)
        .where(Atm.branch_id != Technician.branch_id)
        .order_by(ServiceCall.id)
    )

    result = await session.execute(statement)
    return list(result.scalars().all())

async def find_low_cash_atms(session: AsyncSession, threshold: int = 2000) -> list[Atm]:

    statement = (
            select(Atm)
            .where(Atm.cash_level <= threshold)
            .order_by(Atm.id)
        )
    
    result = await session.execute(statement)
    return list(result.scalars().all())

async def reliability_metrics(session: AsyncSession) -> list[ServiceCall]:
    #need fixing

    statement = (
                select(ServiceCall)
                .where(Atm.cash_level <= 0)
                .order_by(Atm.id)
            )
        
    result = await session.execute(statement)
    return list(result.scalars().all())

async def maintenance_flags(session: AsyncSession, branch_id:int) -> list[Branch]:

    statement = (
            select(Branch)
            .join(Atm, Atm.branch_id == Branch.id)
            .where(Atm.branch_id == branch_id,
                   Atm.status == 'Maintenance')
            .order_by(Branch.id)
        )
    
    result = await session.execute(statement)
    return list(result.scalars().all())

async def reporting_lines(session: AsyncSession) -> list[Technician]:
    statement = (
                select(Technician)
                .join(ServiceCall, ServiceCall.technician_id == Technician.id)
                .where(ServiceCall.status.not_in(["Completed", "Failed"]))
                .group_by(Technician.id)
            )
        
    result = await session.execute(statement)
    return list(result.scalars().all())