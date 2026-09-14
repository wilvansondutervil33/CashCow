from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import Response

from app.dependencies import get_db, require_role, get_current_user
from app.models import User, UserRole
from app.schemas.users import Token, UserCreate, UserRead, UserDelete, UserUpdate
from app.security import create_access_token, hash_password, verify_password


router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=list[UserRead])
async def list_users(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[User]:
    
    statement = select(User)

    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> User:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )
    return user

@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))) -> User:
    user = User(**payload.model_dump())
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.put("/{user_id}", response_model=UserRead, status_code=status.HTTP_202_ACCEPTED)
async def update_user(user_id: int, payload: UserUpdate, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))) -> User:
    
    user = await db.get(User, user_id)
    user.username = payload.username
    user.role = payload.role
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/{user_id}", response_model=UserDelete, status_code=status.HTTP_202_ACCEPTED)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN))):
    user = await db.get(User, user_id)
    await db.delete(user)
    await db.commit()
    return Response(status_code=204)