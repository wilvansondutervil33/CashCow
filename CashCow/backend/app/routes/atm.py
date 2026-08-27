from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.models import Atm, ATMStatus, User, UserRole
from app.schemas.atm import ATMCreate, ATMRead, ATMUpdate, ATMDelete

#our FastAPI router for the /robots endpoints. The prefix argument means that
#  all routes defined in this router will be prefixed with /robots, and the 
# tags argument is used for documentation purposes in the OpenAPI schema.
router = APIRouter(prefix="/atms", tags=["atms"])


#our GET /robots endpoint, which returns a list of robots, optionally filtered by battery level.
@router.get("", response_model=list[ATMRead])
async def list_atms(
    max_cash: Decimal | None = Query(
        default=None,
        ge=0,
        le=10000,
        description="Only return atms strictly below this cash level.",
    ),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
) -> list[Atm]:
    
    statement = select(Atm).where(Atm.status != ATMStatus.OFFLINE)
    if max_cash is not None:
        statement = statement.where(Atm.cash_level < max_cash)
    statement = statement.order_by(Atm.id)

    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/{atm_id}", response_model=ATMRead)
async def get_robot(atm_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> Atm:
    atm = await db.get(Atm, atm_id)
    if atm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Robot {atm_id} not found",
        )
    return atm

#our POST /robots endpoint, which creates a new robot.
@router.post("", response_model=ATMRead, status_code=status.HTTP_201_CREATED)
async def create_robot(payload: ATMCreate, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))) -> Atm:
    atm = Atm(**payload.model_dump())
    db.add(atm)
    await db.commit()
    await db.refresh(atm)
    return atm

@router.put("/{atm_id}", response_model=ATMRead, status_code=status.HTTP_202_ACCEPTED)
async def update_robot(atm_id: int, payload: ATMCreate, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))) -> Atm:
    atm = await db.get(Atm, atm_id)
    atm.cash_level = payload.cash_level
    atm.status = payload.status
    db.add(atm)
    await db.commit()
    await db.refresh(atm)
    return atm

@router.delete("/{atm_id}", response_model=ATMDelete, status_code=status.HTTP_204_NO_CONTENT)
async def delete_robot(atm_id: int, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))):
    atm = await db.get(Atm, atm_id)
    db.delete(atm)
    await db.commit()
    await db.refresh(atm)