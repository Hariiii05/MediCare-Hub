from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models.clinic import Clinic
from models.doctor import Doctor
from models.appointment import Appointment
from models.service import Service
from schemas.clinic import ClinicResponse
from schemas.service import ServiceResponse

router = APIRouter(prefix="/clinics", tags=["Clinics"])


@router.get("", response_model=List[ClinicResponse])
def list_clinics(
    location: Optional[str] = Query(
        None, description="Hà Nội | Đà Nẵng | Hồ Chí Minh"
    ),
    clinic_type: Optional[str] = Query(
        None, description="Bệnh viện | Phòng khám | Hệ thống y tế"
    ),
    booking_order: Optional[str] = Query(
        None, description="asc | desc (Số lượt đặt tăng/giảm dần)"
    ),
    db: Session = Depends(get_db),
):

    query = (
        db.query(
            Clinic,
            func.count(Appointment.id).label("booking_count"),
        )
        .outerjoin(Doctor, Doctor.clinic_id == Clinic.id)
        .outerjoin(
            Appointment,
            (Appointment.doctor_id == Doctor.id) & (Appointment.status != "cancelled"),
        )
        .group_by(Clinic.id)
    )

    if location:
        location_map = {
            "ha noi": ["Hà Nội", "hà nội", "Ha Noi", "ha noi", "thành phố Hà Nội", "thành phố hà nội"],
            "hanoi": ["Hà Nội", "hà nội", "Ha Noi", "ha noi", "thành phố Hà Nội", "thành phố hà nội"],
            "hà nội": ["Hà Nội", "hà nội", "Ha Noi", "ha noi", "thành phố Hà Nội", "thành phố hà nội"],
            "da nang": ["Đà Nẵng", "đà nẵng", "Da Nang", "da nang"],
            "danang": ["Đà Nẵng", "đà nẵng", "Da Nang", "da nang"],
            "đà nẵng": ["Đà Nẵng", "đà nẵng", "Da Nang", "da nang"],
            "ho chi minh": ["Hồ Chí Minh", "hồ chí minh", "Ho Chi Minh", "ho chi minh", "TP.HCM", "tp.hcm", "TPHCM", "tphcm"],
            "hcm": ["Hồ Chí Minh", "hồ chí minh", "Ho Chi Minh", "ho chi minh", "TP.HCM", "tp.hcm", "TPHCM", "tphcm"],
            "hồ chí minh": ["Hồ Chí Minh", "hồ chí minh", "Ho Chi Minh", "ho chi minh", "TP.HCM", "tp.hcm", "TPHCM", "tphcm"],
        }
        normalized_location = location.strip().lower()
        keywords = location_map.get(normalized_location, [normalized_location])
        # Use LIKE (not ILIKE) with explicit keyword variants to avoid Unicode
        # case-folding issues on some SQLite setups (e.g. Đ/đ).
        location_filters = [Clinic.address.like(f"%{keyword}%") for keyword in keywords]
        query = query.filter(or_(*location_filters))

    if clinic_type:
        normalized_type = clinic_type.strip().lower()
        if normalized_type in {"bệnh viện", "benh vien"}:
            query = query.filter(Clinic.name.ilike("%bệnh viện%"))
        elif normalized_type in {"phòng khám", "phong kham"}:
            query = query.filter(Clinic.name.ilike("%phòng khám%"))
        elif normalized_type in {"hệ thống y tế", "he thong y te"}:
            query = query.filter(Clinic.name.ilike("%hệ thống y tế%"))

    if booking_order:
        normalized_order = booking_order.strip().lower()
        if normalized_order == "asc":
            query = query.order_by(func.count(Appointment.id).asc(), Clinic.id.asc())
        elif normalized_order == "desc":
            query = query.order_by(func.count(Appointment.id).desc(), Clinic.id.asc())
    else:
        query = query.order_by(Clinic.id.asc())

    rows = query.all()
    return [
        ClinicResponse(
            id=clinic.id,
            name=clinic.name,
            address=clinic.address,
            phone=clinic.phone,
            image_url=clinic.image_url,
            booking_count=booking_count or 0,
        )
        for clinic, booking_count in rows
    ]


@router.get("/{clinic_id}/services", response_model=List[ServiceResponse])
def list_clinic_services(clinic_id: int, db: Session = Depends(get_db)):
    services = (
        db.query(Service)
        .filter(Service.clinic_id == clinic_id)
        .order_by(Service.id.asc())
        .all()
    )
    return services
