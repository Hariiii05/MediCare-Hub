from pydantic import BaseModel
from typing import Optional


class ClinicResponse(BaseModel):
    id: int
    name: str
    address: str
    phone: Optional[str] = None
    image_url: Optional[str] = None
    booking_count: int = 0

    model_config = {"from_attributes": True} # return clinic
