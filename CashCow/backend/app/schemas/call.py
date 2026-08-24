from pydantic import BaseModel, ConfigDict

class DiscrepancyRead(BaseModel):

    call_id: int
    title: str
    atm_id: int
    technician_id: int
    model_config = ConfigDict(from_attributes=True)
