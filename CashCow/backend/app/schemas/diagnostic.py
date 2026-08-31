from pydantic import BaseModel, ConfigDict
from datetime import datetime

class DiscrepancyRead(BaseModel):

    call_id: int
    file_url: str
    notes: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DiscrepancyCreate(BaseModel):
    call_id: int
    file_url: str
    notes: str
    model_config = ConfigDict(from_attributes=True)

