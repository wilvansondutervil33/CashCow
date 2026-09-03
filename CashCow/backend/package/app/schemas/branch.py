from pydantic import BaseModel, ConfigDict, Field



class BranchBase(BaseModel):
    # String fields withg specific lengths
    name: str = Field(min_length=3, max_length=100)
    location_region: str = Field(min_length=1, max_length=50)
    capacity: int = Field(ge=0, le=10000)
    supervisor_id: int


# Two additional classes that build upon this starter class
class BranchCreate(BranchBase):
    """Shape of the Request Body for POST /robots"""

class BranchRead(BranchBase):
    """Shape of a Robot in any API Response"""

    id: int

    model_config = ConfigDict(from_attributes=True)

class BranchUpdate(BranchRead):
    "PUT request"

class BranchDelete(BranchBase):
    id: int