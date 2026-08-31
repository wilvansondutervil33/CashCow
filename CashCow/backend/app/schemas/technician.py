from pydantic import BaseModel, ConfigDict
from datetime import datetime

class TechnicianRead(BaseModel):

    id: int
    name: str
    branch_id: str
    model_config = ConfigDict(from_attributes=True)