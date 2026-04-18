from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    image_url = Column(String, nullable=True)

    clinic = relationship("Clinic", back_populates="services")
