from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'database.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}) # noi py vs db
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # phiên lm việc với db


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#FastAPI sẽ: Gọi get_db() Tạo session Truyền session vào function Sau khi xong → tự động close()


def migrate_sqlite_schema():
    """Apply lightweight schema updates for SQLite without Alembic."""
    db_path = os.path.join(BASE_DIR, "database.db")
    if not os.path.exists(db_path):
        return

    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(appointments)")
        cols = {row[1] for row in cur.fetchall()}
        if not cols:
            return

        if "service_type" not in cols:
            cur.execute("ALTER TABLE appointments ADD COLUMN service_type TEXT DEFAULT 'doctor_visit'")
        if "package_name" not in cols:
            cur.execute("ALTER TABLE appointments ADD COLUMN package_name TEXT")
        if "sessions_total" not in cols:
            cur.execute("ALTER TABLE appointments ADD COLUMN sessions_total INTEGER")

        cur.execute("UPDATE appointments SET service_type='doctor_visit' WHERE service_type IS NULL")

        cur.execute("PRAGMA table_info(doctors)")
        doctor_cols = {row[1] for row in cur.fetchall()}
        if doctor_cols and "user_id" not in doctor_cols:
            cur.execute("ALTER TABLE doctors ADD COLUMN user_id INTEGER")
        conn.commit()
    finally:
        conn.close()
