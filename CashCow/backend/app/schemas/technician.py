from pydantic import BaseModel, ConfigDict

class TechnicianRead(BaseModel):

    id: int
    name: str
    branch_id: int
    model_config = ConfigDict(from_attributes=True)