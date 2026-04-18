"""
Seed script to populate the database with sample clinics and doctors.
Run: python seed.py
"""
from database import engine, SessionLocal, Base
from models.clinic import Clinic
from models.doctor import Doctor
from models.service import Service
from models.user import User
from auth import hash_password


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # --- Clinics (idempotent) ---
        clinic_seed_data = [
            {
                "name": "Tổ hợp phòng khám MEDIPLUS",
                "address": "Tầng 2, TTTM Mandarin Garden 2, 99 Tân Mai, Hoàng Mai, Thành phố Hà Nội",
                "phone": "(024) 7300 8386",
                "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400",
            },
            {
                "name": "Bệnh viện 199 - Đà Nẵng",
                "address": "Số 216 Nguyễn Công Trứ, An Hải Đông, Sơn Trà, Đà Nẵng",
                "phone": "(0236) 3888 199",
                "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400",
            },
            {
                "name": "Hệ thống y tế Thu Cúc TCI",
                "address": "286 Thụy Khuê, Bưởi, Tây Hồ, Hà Nội",
                "phone": "(024) 3957 5858",
                "image_url": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400",
            },
            {
                "name": "Phòng khám Đa khoa Quốc tế Thu Cúc",
                "address": "216 Trần Duy Hưng, Trung Hoà, Cầu Giấy, Hà Nội",
                "phone": "(024) 3557 3553",
                "image_url": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400",
            },
        ]
        clinics = []
        for item in clinic_seed_data:
            clinic = db.query(Clinic).filter(Clinic.name == item["name"]).first()
            if not clinic:
                clinic = Clinic(**item)
                db.add(clinic)
                db.flush()
            clinics.append(clinic)

        # --- Doctors (idempotent) ---
        doctor_seed_data = [
            {
                "name": "BSCKI Nguyễn Nhật Tân",
                "specialty": "Nội tiêu hoá",
                "clinic_idx": 0,
                "image_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200",
            },
            {
                "name": "ThS.BS Bùi Duy Khánh",
                "specialty": "Nội tim mạch",
                "clinic_idx": 0,
                "image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200",
            },
            {
                "name": "BS Hồ Minh Tâm",
                "specialty": "Đa Khoa",
                "clinic_idx": 1,
                "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200",
            },
            {
                "name": "PGS.TS Trần Thị Mai",
                "specialty": "Sản phụ khoa",
                "clinic_idx": 2,
                "image_url": "https://images.unsplash.com/photo-1594824476967-48c8b964df17?w=200",
            },
            {
                "name": "ThS.BS Lê Văn Đức",
                "specialty": "Chấn thương chỉnh hình",
                "clinic_idx": 3,
                "image_url": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200",
            },
        ]
        for item in doctor_seed_data:
            clinic_id = clinics[item["clinic_idx"]].id
            existing_doctor = (
                db.query(Doctor)
                .filter(Doctor.name == item["name"], Doctor.clinic_id == clinic_id)
                .first()
            )
            if not existing_doctor:
                db.add(
                    Doctor(
                        name=item["name"],
                        specialty=item["specialty"],
                        clinic_id=clinic_id,
                        image_url=item["image_url"],
                    )
                )

        # --- Services (idempotent, different per clinic) ---
        service_seed_data = {
            "Tổ hợp phòng khám MEDIPLUS": [
                ("Khám tổng quát chuyên sâu", 450000),
                ("Tầm soát tim mạch cơ bản", 650000),
                ("Gói tư vấn dinh dưỡng 1:1", 300000),
            ],
            "Bệnh viện 199 - Đà Nẵng": [
                ("Khám chuyên khoa Nội tổng hợp", 350000),
                ("Gói khám sức khỏe doanh nghiệp", 1200000),
                ("Khám và tư vấn phục hồi chức năng", 500000),
            ],
            "Hệ thống y tế Thu Cúc TCI": [
                ("Khám Giáo sư", 1500000),
                ("Combo 5 buổi trị liệu ngôn ngữ", 7000000),
                ("Gói tầm soát ung thư sớm", 2800000),
            ],
            "Phòng khám Đa khoa Quốc tế Thu Cúc": [
                ("Khám Nhi tổng quát", 280000),
                ("Khám Tai Mũi Họng", 320000),
                ("Khám Sản phụ khoa", 450000),
            ],
        }
        for clinic in clinics:
            clinic_services = service_seed_data.get(clinic.name, [])
            for service_name, price in clinic_services:
                exists = (
                    db.query(Service)
                    .filter(Service.clinic_id == clinic.id, Service.name == service_name)
                    .first()
                )
                if not exists:
                    db.add(
                        Service(
                            clinic_id=clinic.id,
                            name=service_name,
                            price=price,
                            image_url="/assets/booking_clinics_1.png",
                        )
                    )

        # --- Accounts (idempotent) ---
        existing_user = db.query(User).filter(User.username == "testpatient").first()
        if not existing_user:
            test_user = User(
                username="testpatient",
                email="test@medicare.hub",
                password_hash=hash_password("password123"),
                role="patient",
            )
            db.add(test_user)
            db.flush()

        doctor_username = "drnguyennhattan"
        doctor_user = db.query(User).filter(User.username == doctor_username).first()
        if not doctor_user:
            doctor_user = User(
                username=doctor_username,
                email="dr.nguyennhattan@medicare.hub",
                password_hash=hash_password("doctor123"),
                role="doctor",
            )
            db.add(doctor_user)
            db.flush()

        nguyen_nhat_tan = db.query(Doctor).filter(Doctor.name == "BSCKI Nguyễn Nhật Tân").first()
        if nguyen_nhat_tan and not nguyen_nhat_tan.user_id:
            nguyen_nhat_tan.user_id = doctor_user.id

        db.commit()
        print("Database seeded successfully!")
        print(f"  - {db.query(Clinic).count()} clinics")
        print(f"  - {db.query(Doctor).count()} doctors")
        print(f"  - {db.query(Service).count()} services")
        print("  - patient account: testpatient / password123")
        print("  - doctor account: drnguyennhattan / doctor123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
