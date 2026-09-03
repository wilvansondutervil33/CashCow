from pydantic import BaseModel

class MetricsBase(BaseModel):
    model: str 
    completed: int 
    failed: int 

