from pydantic import BaseModel, ConfigDict

class CallRead(BaseModel):
    id:int
    title: str 
    priority: str
    status: str
    atm_id: int
    technician_id: int
    model_config = ConfigDict(from_attributes=True)

class CallCreate(CallRead):
    ""
    
class CallUpdate(CallRead):
    ""

class CallDelete(CallRead):
    id: int