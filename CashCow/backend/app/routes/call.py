from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.models import ServiceCall, User, UserRole
from app.schemas.call import CallCreate, CallRead, CallUpdate, CallDelete

#our FastAPI router for the /robots endpoints. The prefix argument means that
#  all routes defined in this router will be prefixed with /robots, and the 
# tags argument is used for documentation purposes in the OpenAPI schema.
router = APIRouter(prefix="/servicecalls", tags=["servicecalls"])


#our GET /robots endpoint, which returns a list of robots, optionally filtered by battery level.
@router.get("", response_model=list[CallRead])
async def list_calls(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[ServiceCall]:
    
    statement = select(ServiceCall)

    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/{call_id}", response_model=CallRead)
async def get_call(call_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> ServiceCall:
    call = await db.get(ServiceCall, call_id)
    if call is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service_Call {call_id} not found",
        )
    return call

#our POST /robots endpoint, which creates a new robot.
@router.post("", response_model=CallRead, status_code=status.HTTP_201_CREATED)
async def create_call(payload: CallCreate, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))) -> ServiceCall:
    call = ServiceCall(**payload.model_dump())
    db.add(call)
    await db.commit()
    await db.refresh(call)
    return call

@router.put("/{call_id}", response_model=CallRead, status_code=status.HTTP_202_ACCEPTED)
async def update_call(call_id: int, payload: CallUpdate, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))) -> ServiceCall:
    
    call = ServiceCall(**payload.model_dump())
    db.add(call)
    await db.commit()
    await db.refresh(call)
    return call

@router.delete("/{call_id}", response_model=CallDelete, status_code=status.HTTP_202_ACCEPTED)
async def delete_call(call_id: int, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))):
    call = await db.get(ServiceCall, call_id)
    db.delete(call)
    await db.commit()
    await db.refresh(call)
    return call