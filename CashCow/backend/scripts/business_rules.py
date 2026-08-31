import asyncio

from sqlalchemy import select, func, case, cast, Float
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
                .join(Atm, Atm.id == ServiceCall.atm_id)
                .group_by(Atm.model)
                .having(
                    func.count(ServiceCall.id).filter(
                        ServiceCall.status == 'Completed'
                    ) / 
                    cast(func.count(ServiceCall.id).filter(
                        ServiceCall.status == 'Failed'
                    ), Float)
                )
                
            )
        
    result = await session.execute(statement)
    return list(result.scalars().all())

async def maintenance_flags(session: AsyncSession) -> list[Branch]:

    statement = (
        select(Branch)
        .join(Atm, Atm.branch_id == Branch.id)
        .group_by(Branch.id)
        .having(
            (
                func.count(Atm.id).filter(
                    Atm.status == "Maintenance"
                )
                / cast(func.count(Atm.id), Float)
            ) > 0.30
        )
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

async def main() -> None:
    async with AsyncSessionLocal() as session:
        print("== Co-Location Discrepancy Report ==")
        discrepancies = await find_colocation_discrepancies_orm(session)

if __name__ == "__main__":
    asyncio.run(main())