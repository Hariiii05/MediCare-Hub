from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    doctors = relationship("Doctor", back_populates="clinic")
    services = relationship("Service", back_populates="clinic")
