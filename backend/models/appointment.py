from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    service_type = Column(String, nullable=False, default="doctor_visit")  # "doctor_visit" or "package_5_sessions"
    package_name = Column(String, nullable=True)
    sessions_total = Column(Integer, nullable=True)
    slot_start = Column(DateTime, nullable=False)
    symptoms = Column(Text, nullable=False)
    image_path = Column(String, nullable=True)
    status = Column(String, default="pending")  # "pending" or "confirmed"
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
