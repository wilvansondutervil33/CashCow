
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, case, cast, Float
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.models import Branch, User, UserRole, ServiceCall, Atm, Technician
from app.schemas.branch import BranchRead
from app.schemas.atm import ATMRead
from app.schemas.call import CallRead
from app.schemas.technician import TechnicianRead

#our FastAPI router for the /robots endpoints. The prefix argument means that
#  all routes defined in this router will be prefixed with /robots, and the 
# tags argument is used for documentation purposes in the OpenAPI schema.
router = APIRouter(prefix="/business", tags=["business"])


#our GET /robots endpoint, which returns a list of robots, optionally filtered by battery level.
@router.get("/colocation", response_model=list[CallRead])
async def find_colocation_discrepancies_orm(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[ServiceCall]:

    statement = (
        select(ServiceCall)
        .join(Atm, Atm.id == ServiceCall.atm_id)
        .join(Technician, Technician.id == ServiceCall.technician_id)
        .where(Atm.branch_id != Technician.branch_id)
        .order_by(ServiceCall.id)
    )

    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/lowcost", response_model=list[ATMRead])
async def find_low_cash_atms(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user), threshold: int = 2000) -> list[Atm]:

    statement = (
            select(Atm)
            .where(Atm.cash_level <= threshold)
            .order_by(Atm.id)
        )
    
    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/metrics", response_model=list[CallRead])
async def reliability_metrics(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[ServiceCall]:
    #need fixing

    statement = (
                select(ServiceCall)
                .join(Atm, Atm.id == ServiceCall.atm_id)
                .group_by(Atm.model)
                .having(
                    cast(func.count(ServiceCall.id).filter(
                        ServiceCall.status == 'Completed'
                    ), Float) / 
                    cast(func.count(ServiceCall.id).filter(
                        ServiceCall.status == 'Failed'
                    ), Float) >= 1.0
                )
                
            )
        
    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/flags", response_model=list[BranchRead])
async def maintenance_flags(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[Branch]:

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

    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/report", response_model=list[TechnicianRead])
async def reporting_lines(supervisor_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[Technician]:
    statement = (
                select(Technician)
                .join(ServiceCall, ServiceCall.technician_id == Technician.id)
                .join(Branch, Branch.id == Technician.branch_id)
                .where(
                        ServiceCall.status.not_in(["Completed", "Failed"]),
                        Branch.supervisor_id == supervisor_id,
                    )
                .distinct()
    )
        
    result = await db.execute(statement)
    return list(result.scalars().all())
    