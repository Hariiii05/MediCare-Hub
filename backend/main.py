from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base, migrate_sqlite_schema
from routers import auth_router, clinics_router, doctors_router, appointments_router

# Create all tables
Base.metadata.create_all(bind=engine)
migrate_sqlite_schema()

app = FastAPI(title="MediCare Hub API", version="1.0.0")

# CORS — preflight OPTIONS trả 400 nếu Origin không khớp (khác cổng / IP LAN / http vs https)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    # Mọi cổng trên localhost / 127.0.0.1 / ::1; mạng LAN 192.168.x.x (mở FE bằng IP máy)
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Register routers
app.include_router(auth_router.router) # Đăng nhập/ đăng ký
app.include_router(clinics_router.router) # Quản lý cơ sở ý tế
app.include_router(doctors_router.router) # Quản lý bác sĩ
app.include_router(appointments_router.router) # Đặt lịch khám


@app.get("/")
def root():
    return {"message": "MediCare Hub API is running"}
