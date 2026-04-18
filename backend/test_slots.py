from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.appointment import Appointment

engine = create_engine("sqlite:///database.db")
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

doctor_id = 1
target_date = datetime.strptime("2026-02-20", "%Y-%m-%d").date()

day_start = datetime.combine(target_date, datetime.min.time())
from datetime import timedelta
day_end = day_start + timedelta(days=1)
booked = (
    db.query(Appointment.slot_start)
    .filter(
        Appointment.doctor_id == doctor_id,
        Appointment.slot_start >= day_start,
        Appointment.slot_start < day_end,
    )
    .all()
)
booked_times = {b.slot_start for b in booked}

current = datetime.combine(target_date, datetime.min.time()).replace(hour=8, minute=30)
print(f"Db booked times: {booked_times}")
print(f"Comparing current: {current}")
print(f"Is current in booked_times? {current in booked_times}")

