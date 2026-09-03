from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.models import Branch, User, UserRole
from app.schemas.branch import BranchCreate, BranchRead, BranchUpdate, BranchDelete

#our FastAPI router for the /robots endpoints. The prefix argument means that
#  all routes defined in this router will be prefixed with /robots, and the 
# tags argument is used for documentation purposes in the OpenAPI schema.
router = APIRouter(prefix="/branches", tags=["branches"])


#our GET /robots endpoint, which returns a list of robots, optionally filtered by battery level.
@router.get("", response_model=list[BranchRead])
async def list_branches(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[Branch]:
    
    statement = select(Branch)

    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/{branch_id}", response_model=BranchRead)
async def get_branch(branch_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> Branch:
    branch = await db.get(Branch, branch_id)
    if branch is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Branch {branch_id} not found",
        )
    return branch

#our POST /robots endpoint, which creates a new robot.
@router.post("", response_model=BranchRead, status_code=status.HTTP_201_CREATED)
async def create_branch(payload: BranchCreate, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))) -> Branch:
    branch = Branch(**payload.model_dump())
    db.add(branch)
    await db.commit()
    await db.refresh(branch)
    return branch

@router.put("/{branch_id}", response_model=BranchRead, status_code=status.HTTP_202_ACCEPTED)
async def update_branch(branch_id: int, payload: BranchUpdate, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))) -> Branch:
    
    branch = await db.get(Branch, branch_id)
    branch.name = payload.name
    branch.location_region = payload.location_region
    branch.capacity = payload.capacity
    branch.supervisor_id = payload.supervisor_id
    db.add(branch)
    await db.commit()
    await db.refresh(branch)
    return branch

@router.delete("/{branch_id}", response_model=BranchDelete, status_code=status.HTTP_202_ACCEPTED)
async def delete_branch(branch_id: int, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))):
    branch = await db.get(Branch, branch_id)
    db.delete(branch)
    await db.commit()
    await db.refresh(branch)
    return branch