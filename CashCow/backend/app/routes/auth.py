from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_role, get_current_user
from app.models import User, UserRole
from app.schemas.users import Token, UserCreate, UserRead, UserDelete, UserUpdate
from app.security import create_access_token, hash_password, verify_password


#First step is to set up the router for our endpoints
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()

    #check to verify if the password is correct
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    #set our access token
    access_token = create_access_token(data={"sub": user.username, "role": user.role.value})
    return Token(access_token=access_token, token_type="bearer")


#function to register a new user. This endpoint is protected by the require_role dependency, which will
#require the user to have the Fleet Admin role
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.OPERATION_ADMIN)),
) -> User:
    
    #checking if the username already exists in the db
    existing = await db.execute(select(User).where(User.username == payload.username))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{payload.username}' is already taken",
        )

    user = User(
        username = payload.username,
        hashed_password=hash_password(payload.password),
        role=payload.role
    )

    #add that new user object to the db
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

# @router.get("", response_model=list[UserRead])
# async def list_users(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[User]:
    
#     statement = select(User)

#     result = await db.execute(statement)
#     return list(result.scalars().all())

# @router.get("/{user_id}", response_model=UserRead)
# async def get_user(user_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> User:
#     user = await db.get(User, user_id)
#     if user is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail=f"User {user_id} not found",
#         )
#     return user

# @router.put("/{user_id}", response_model=UserRead, status_code=status.HTTP_202_ACCEPTED)
# async def update_user(user_id: int, payload: UserUpdate, db: AsyncSession = Depends(get_db),
#                        _: User = Depends(require_role(UserRole.OPERATION_ADMIN))) -> User:
    
#     user = await db.get(User, user_id)
#     user.username = payload.username
#     user.role = payload.role
#     db.add(user)
#     await db.commit()
#     await db.refresh(user)
#     return user

# @router.delete("/{user_id}", response_model=UserDelete, status_code=status.HTTP_202_ACCEPTED)
# async def delete_user(user_id: int, db: AsyncSession = Depends(get_db),
#                        _: User = Depends(require_role(UserRole.OPERATION_ADMIN))):
#     user = await db.get(User, user_id)
#     db.delete(user)
#     await db.commit()
#     await db.refresh(user)
#     return user