from pydantic import BaseModel
from typing import Optional


class DoctorResponse(BaseModel):
    id: int
    name: str
    specialty: Optional[str] = None
    clinic_id: int
    clinic_name: Optional[str] = None
    image_url: Optional[str] = None

    model_config = {"from_attributes": True} # return doctor
