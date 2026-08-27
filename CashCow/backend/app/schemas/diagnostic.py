from pydantic import BaseModel, ConfigDict
from datetime import datetime

class DiscrepancyRead(BaseModel):

    report_id: int
    file_url: str
    notes: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class DiscrepancyCreate(DiscrepancyRead):
    ""
