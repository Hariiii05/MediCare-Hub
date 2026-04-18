import os
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.user import User
from models.appointment import Appointment
from models.doctor import Doctor
from schemas.appointment import AppointmentResponse
from auth import get_current_user

router = APIRouter(prefix="/appointments", tags=["Appointments"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")


def can_cancel_appointment(slot_start: datetime, status: str) -> bool:
    """Allow cancel only for non-cancelled appointments from today onward."""
    if status in {"cancelled", "rejected"}:
        return False
    return slot_start.date() >= datetime.now().date()


@router.post("", response_model=AppointmentResponse, status_code=201)
async def create_appointment( # Nhận các tham số
    doctor_id: int = Form(...),
    service_type: str = Form("doctor_visit"),
    package_name: Optional[str] = Form(None),
    sessions_total: Optional[int] = Form(None),
    slot_start: str = Form(...),
    symptoms: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user), # Yêu cầu đăng nhập, chỉ có ngươì có token hợp lệ mới gọi được
    db: Session = Depends(get_db),
):
    # Parse the datetime, kiểm tra thời gian từ fe
    try:
        # Accept both "...+07:00" and "...Z" formats from frontend
        normalized_slot_start = slot_start.replace("Z", "+00:00")
        slot_dt = datetime.fromisoformat(normalized_slot_start)
    except ValueError:
        raise HTTPException(status_code=400, detail="Thời gian đặt lịch không hợp lệ")

    # Only allow booking from tomorrow up to 30 days ahead (by calendar day)
    today = datetime.now().date()
    booking_date = slot_dt.date()
    days_until_booking = (booking_date - today).days
    if days_until_booking < 1:
        raise HTTPException(
            status_code=400,
            detail="Ngày khám phải cách ngày hiện tại ít nhất 1 ngày",
        )
    if days_until_booking > 30:
        raise HTTPException(
            status_code=400,
            detail="Chỉ được đặt lịch tối đa trước 30 ngày",
        )

    # Check doctor exists
    doctor = db.query(Doctor).options(joinedload(Doctor.clinic)).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    allowed_service_types = {"doctor_visit", "package_5_sessions"}
    if service_type not in allowed_service_types:
        raise HTTPException(status_code=400, detail="Loại dịch vụ không hợp lệ")
    if service_type == "package_5_sessions":
        if not package_name:
            raise HTTPException(status_code=400, detail="Thiếu tên gói khám")
        if sessions_total is None or sessions_total <= 0:
            raise HTTPException(status_code=400, detail="Số buổi khám phải lớn hơn 0")
    else:
        package_name = None
        sessions_total = None

    # First-come, first-served: check slot not taken
    existing = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doctor_id,
            Appointment.slot_start == slot_dt,
            Appointment.status != "cancelled",
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="This time slot is already booked")

    # Handle image upload
    image_path = None
    if image and image.filename:
        os.makedirs(UPLOAD_DIR, exist_ok=True) # Tạo thư mục nếu chưa tồn tại
        ext = os.path.splitext(image.filename)[1] # Lấy đuôi file
        filename = f"{uuid.uuid4().hex}{ext}" # Tạo tên file ngẫu nhiên
        file_path = os.path.join(UPLOAD_DIR, filename)
        contents = await image.read()
        with open(file_path, "wb") as f:
            f.write(contents) # lưu vào database
        image_path = f"/uploads/{filename}"

    appointment = Appointment(
        patient_id=current_user.id, # lấy id từ token
        doctor_id=doctor_id,
        service_type=service_type,
        package_name=package_name,
        sessions_total=sessions_total,
        slot_start=slot_dt,
        symptoms=symptoms,
        image_path=image_path,
        status="pending",
    ) # lưu vào db
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return AppointmentResponse(
        id=appointment.id,
        doctor_id=appointment.doctor_id,
        service_type=appointment.service_type,
        package_name=appointment.package_name,
        sessions_total=appointment.sessions_total,
        doctor_name=doctor.name,
        clinic_name=doctor.clinic.name if doctor.clinic else None,
        slot_start=appointment.slot_start,
        symptoms=appointment.symptoms,
        image_path=appointment.image_path,
        status=appointment.status,
        created_at=appointment.created_at,
        can_cancel=can_cancel_appointment(appointment.slot_start, appointment.status),
    )


@router.get("", response_model=List[AppointmentResponse])
def list_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == current_user.id) # chỉ xem danh sách lịch khám của user hiện tại
        .options(joinedload(Appointment.doctor).joinedload(Doctor.clinic)) # join với doctor và clinic
        .order_by(Appointment.slot_start.desc())  # sắp xo mới nhất
        .all()
    )
    return [
        AppointmentResponse( # trả về danh sách
            id=a.id,
            doctor_id=a.doctor_id,
            service_type=a.service_type,
            package_name=a.package_name,
            sessions_total=a.sessions_total,
            doctor_name=a.doctor.name if a.doctor else None,
            clinic_name=a.doctor.clinic.name if a.doctor and a.doctor.clinic else None,
            slot_start=a.slot_start,
            symptoms=a.symptoms,
            image_path=a.image_path,
            status=a.status,
            created_at=a.created_at,
            can_cancel=can_cancel_appointment(a.slot_start, a.status),
        )
        for a in appointments
    ]


@router.get("/doctor/me", response_model=List[AppointmentResponse])
def list_doctor_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Chỉ tài khoản bác sĩ mới truy cập được")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ bác sĩ")

    appointments = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == doctor.id)
        .options(joinedload(Appointment.doctor).joinedload(Doctor.clinic))
        .order_by(Appointment.slot_start.desc())
        .all()
    )
    return [
        AppointmentResponse(
            id=a.id,
            doctor_id=a.doctor_id,
            service_type=a.service_type,
            package_name=a.package_name,
            sessions_total=a.sessions_total,
            doctor_name=a.doctor.name if a.doctor else None,
            clinic_name=a.doctor.clinic.name if a.doctor and a.doctor.clinic else None,
            slot_start=a.slot_start,
            symptoms=a.symptoms,
            image_path=a.image_path,
            status=a.status,
            created_at=a.created_at,
            can_cancel=False,
        )
        for a in appointments
    ]


@router.patch("/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = (
        db.query(Appointment)
        .options(joinedload(Appointment.doctor).joinedload(Doctor.clinic))
        .filter(
            Appointment.id == appointment_id,
            Appointment.patient_id == current_user.id,
        )
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch khám")

    if appointment.status == "cancelled":
        raise HTTPException(status_code=400, detail="Lịch khám đã được huỷ trước đó")
    if appointment.slot_start.date() < datetime.now().date():
        raise HTTPException(status_code=400, detail="Không thể huỷ lịch đã qua ngày khám")

    appointment.status = "cancelled"
    db.commit()
    db.refresh(appointment)

    return AppointmentResponse(
        id=appointment.id,
        doctor_id=appointment.doctor_id,
        service_type=appointment.service_type,
        package_name=appointment.package_name,
        sessions_total=appointment.sessions_total,
        doctor_name=appointment.doctor.name if appointment.doctor else None,
        clinic_name=appointment.doctor.clinic.name if appointment.doctor and appointment.doctor.clinic else None,
        slot_start=appointment.slot_start,
        symptoms=appointment.symptoms,
        image_path=appointment.image_path,
        status=appointment.status,
        created_at=appointment.created_at,
        can_cancel=can_cancel_appointment(appointment.slot_start, appointment.status),
    )


@router.patch("/{appointment_id}/doctor-decision", response_model=AppointmentResponse)
def doctor_decide_appointment(
    appointment_id: int,
    decision: str = Form(...),  # "confirmed" or "rejected"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Chỉ tài khoản bác sĩ mới thao tác được")
    if decision not in {"confirmed", "rejected"}:
        raise HTTPException(status_code=400, detail="Quyết định không hợp lệ")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ bác sĩ")

    appointment = (
        db.query(Appointment)
        .options(joinedload(Appointment.doctor).joinedload(Doctor.clinic))
        .filter(Appointment.id == appointment_id, Appointment.doctor_id == doctor.id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch khám")
    if appointment.status == "cancelled":
        raise HTTPException(status_code=400, detail="Lịch khám đã bị huỷ")

    appointment.status = decision
    db.commit()
    db.refresh(appointment)

    return AppointmentResponse(
        id=appointment.id,
        doctor_id=appointment.doctor_id,
        service_type=appointment.service_type,
        package_name=appointment.package_name,
        sessions_total=appointment.sessions_total,
        doctor_name=appointment.doctor.name if appointment.doctor else None,
        clinic_name=appointment.doctor.clinic.name if appointment.doctor and appointment.doctor.clinic else None,
        slot_start=appointment.slot_start,
        symptoms=appointment.symptoms,
        image_path=appointment.image_path,
        status=appointment.status,
        created_at=appointment.created_at,
        can_cancel=False,
    )
