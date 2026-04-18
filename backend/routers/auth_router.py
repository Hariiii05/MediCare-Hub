from fastapi import APIRouter, Depends, HTTPException, status # Tạo nhóm API, dependency injection, trả lỗi chuẩn REST, mã HTTP
from sqlalchemy.orm import Session # phiên làm việc với database

from database import get_db # kết nối với DB
from models.user import User # bảng users
from schemas.user import UserCreate, UserLogin, UserResponse, Token # trả về dữ khi đăng ký, đăng nhập, khi đăng ký thành công, khi login
from auth import hash_password, verify_password, create_access_token
# mã hoá mật khẩu, so sánh mật khẩu, chứng minh người dùng đã đăng nhập
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists
    existing = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    if existing:
        if existing.username == user_data.username:
            raise HTTPException(status_code=400, detail="Username already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    # Tạo user mới
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="patient",
    )
    db.add(user) # thêm vào session
    db.commit() # ghi vào database
    db.refresh(user) # lấy lại dữ liệu mới
    return user


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Tìm user theo username
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
            "username": user.username,
            "email": user.email,
        }
    )
    return Token(access_token=access_token)
