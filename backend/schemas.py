# schemas.py
from pydantic import BaseModel
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
    vout: float

class AQMSFullDataCreate(AQMSFullDataBase):
    pass

class AQMSFullDataResponse(AQMSFullDataBase):
    id: Optional[str] = None   # MongoDB _id as string

    class Config:
        orm_mode = True
