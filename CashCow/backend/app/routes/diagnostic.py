from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.models import DiagnosticReport, User, UserRole
from app.schemas.diagnostic import DiscrepancyCreate, DiscrepancyRead

#our FastAPI router for the /robots endpoints. The prefix argument means that
#  all routes defined in this router will be prefixed with /robots, and the 
# tags argument is used for documentation purposes in the OpenAPI schema.
router = APIRouter(prefix="/diagnosticrepots", tags=["diagnosticrepots"])


@router.get("", response_model=list[DiscrepancyRead])
async def list_reports(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[DiagnosticReport]:
    
    statement = select(DiagnosticReport)

    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/{report_id}", response_model=DiscrepancyRead)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> DiagnosticReport:
    report = await db.get(DiagnosticReport, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnostic Report {report_id} not found",
        )
    return report

#our POST /robots endpoint, which creates a new robot.
@router.post("", response_model=DiscrepancyRead, status_code=status.HTTP_201_CREATED)
async def create_call(payload: DiscrepancyCreate, db: AsyncSession = Depends(get_db),
                       _: User = Depends(require_role(UserRole.OPERATION_ADMIN, UserRole.FIELD_TECHNICIAN))) -> DiagnosticReport:
    report = DiagnosticReport(**payload.model_dump())
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report

