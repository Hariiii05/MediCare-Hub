from pydantic import BaseModel
from typing import Optional


class ServiceResponse(BaseModel):
    id: int
    clinic_id: int
    name: str
    price: int
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}
