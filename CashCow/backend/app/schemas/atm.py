from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ATMStatus


class ATMBase(BaseModel):
    # String fields withg specific lengths
    serial_number: str = Field(min_length=1, max_length=50)
    model: str = Field(min_length=1, max_length=100)
    cash_level: Decimal = Field(ge=0, le=10000)
    facility_id: int
    status: ATMStatus = ATMStatus.OFFLINE


# Two additional classes that build upon this starter class
class ATMCreate(ATMBase):
    """Shape of the Request Body for POST /robots"""

class ATMRead(ATMBase):
    """Shape of a Robot in any API Response"""

    id: int

    model_config = ConfigDict(from_attributes=True)