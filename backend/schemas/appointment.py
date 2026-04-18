from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AppointmentCreate(BaseModel):
    doctor_id: int
    service_type: str = "doctor_visit"
    package_name: Optional[str] = None
    sessions_total: Optional[int] = None
    slot_start: datetime
    symptoms: str
# POST / appoitments


class AppointmentResponse(BaseModel):
    id: int
    doctor_id: int
    service_type: str
    package_name: Optional[str] = None
    sessions_total: Optional[int] = None
    doctor_name: Optional[str] = None
    clinic_name: Optional[str] = None
    slot_start: datetime
    symptoms: str
    image_path: Optional[str] = None
    status: str
    created_at: datetime
    can_cancel: bool = True

    model_config = {"from_attributes": True} # return appointment
