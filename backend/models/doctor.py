from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, unique=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    image_url = Column(String, nullable=True)

    user = relationship("User")
    clinic = relationship("Clinic", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
