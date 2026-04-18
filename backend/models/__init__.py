from .user import User
from .clinic import Clinic
from .doctor import Doctor
from .appointment import Appointment
from .service import Service

__all__ = ["User", "Clinic", "Doctor", "Appointment", "Service"]
#uvicorn main:app --reload --port 8000