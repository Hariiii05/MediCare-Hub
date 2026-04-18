from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date, timedelta

from database import get_db
from models.doctor import Doctor
from models.appointment import Appointment
from schemas.doctor import DoctorResponse

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("", response_model=List[DoctorResponse])
def list_doctors(
    clinic_id: Optional[int] = Query(None), # Nếu không truyền lấy tất cả bác sĩ, không thì lọc theo CSYT
    db: Session = Depends(get_db),
):
    query = db.query(Doctor).options(joinedload(Doctor.clinic))
    if clinic_id:
        query = query.filter(Doctor.clinic_id == clinic_id) # SELECT * FROM doctors WHERE clinic_id = ?
    doctors = query.all()
    return [
        DoctorResponse(
            id=d.id,
            name=d.name,
            specialty=d.specialty,
            clinic_id=d.clinic_id,
            clinic_name=d.clinic.name if d.clinic else None,
            image_url=d.image_url,
        )
        for d in doctors
    ]


@router.get("/{doctor_id}/slots") # Lấy khung giờ khám
def get_available_slots(
    doctor_id: int,
    target_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
):
    """Return available 30-minute time slots for a doctor on a given date."""
    # Generate slots from 08:00 to 17:00 (8 AM to 5 PM), 30-min intervals
    slots = []
    start_hour = 8
    end_hour = 17
    current = datetime.combine(target_date, datetime.min.time()).replace(hour=start_hour)
    end = datetime.combine(target_date, datetime.min.time()).replace(hour=end_hour)

    while current < end:
        slots.append(current)
        current += timedelta(minutes=30)

    # Get booked slots for this doctor on this date
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = day_start + timedelta(days=1)
    booked = (
        db.query(Appointment.slot_start)
        .filter(
            Appointment.doctor_id == doctor_id,
            Appointment.slot_start >= day_start,
            Appointment.slot_start < day_end,
            Appointment.status != "cancelled",
        )
        .all()
    )
    booked_times = {b.slot_start for b in booked}
    # Nếu slot nằm trong booked_times → available = false
    available = [
        {"slot_start": s.isoformat(), "available": s not in booked_times}
        for s in slots
    ]
    return available
