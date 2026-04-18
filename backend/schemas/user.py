from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
# @router.post("/register")
# def register(user_data: UserCreate)

class UserLogin(BaseModel):
    username: str
    password: str
# def login(user_data: UserLogin)

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    model_config = {"from_attributes": True}
# response_model=UserResponse

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
# response_model=Token