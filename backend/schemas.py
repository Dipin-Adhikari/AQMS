# schemas.py
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class AQMSFullDataBase(BaseModel):
    ts: int
    pm1: float
    pm25: float
    pm10: float
    temp: float
    hum: float
    battery: float
    vin: float

    aht20: bool
    rtc: bool
    pms7003: bool
    wifi: bool
    ntp: bool
    sdcard: bool
    thingspeak: bool

class AQMSFullDataCreate(AQMSFullDataBase):
    pass

class AQMSFullDataResponse(AQMSFullDataBase):
    id: Optional[str] = None   # MongoDB _id as string

    class Config:
        orm_mode = True


# Authentication Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    role: str = "user"  # Default role

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: str
    hashed_password: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None
