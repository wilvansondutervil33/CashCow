from pydantic import BaseModel, ConfigDict

class CallRead(BaseModel):

    call_id: int
    title: str
    atm_id: int
    technician_id: int
    model_config = ConfigDict(from_attributes=True)

class CallCreate(CallRead):
    ""
    
class CallUpdate(CallRead):
    ""
    id: int

class CallDelete(CallRead):
    id: int