from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from pydantic import BaseModel
from bson import ObjectId

import schemas
import crud
import database
import os
from dotenv import load_dotenv

# ==================== IMPORTS FROM LOCAL MODULES ====================
from auth import (
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin_user,
    get_password_hash,  # IMPORTANT: Import this
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from fastapi import BackgroundTasks
from alerts import send_whatsapp_alert
from datetime import datetime, timedelta
import pytz
from fastapi.responses import StreamingResponse
import io
import csv

from database import get_users_collection  # IMPORTANT: Import this

load_dotenv()

# ==================== PYDANTIC MODELS ====================
class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

# ==================== APP SETUP ====================
app = FastAPI()

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL")
monitoring_url = os.getenv("MONITORING_URL")
origins = [
    frontend_url,
    monitoring_url
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def unix_to_nepali_time(ts: int) -> str:
    # Convert Unix timestamp (UTC) to Nepal Time (UTC+5:45)
    utc_dt = datetime.utcfromtimestamp(ts)
    nepali_tz = pytz.FixedOffset(345)  # 5 * 60 + 45 = 345 minutes
    nepali_dt = utc_dt.replace(tzinfo=pytz.utc).astimezone(nepali_tz)
    return nepali_dt.strftime("%Y-%m-%d %H:%M:%S")

# ==================== MONGODB LIFECYCLE ====================
@app.on_event("startup")
async def startup_event():
    await database.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await database.close()

# ==================== SENSOR DATA ROUTES ====================

@app.post("/api/data", response_model=schemas.AQMSFullDataResponse)
async def upload_full_data(
    data: schemas.AQMSFullDataCreate,
    background_tasks: BackgroundTasks
):
    response = await crud.create_full_data(data)

    alert_messages = []

    # Check battery voltage
    # if data.battery < 30:
    #     alert_messages.append(f"Battery voltage is low ({data.battery}V)")


    # Check device boolean flags; if False, add alerts
    device_fields = ["aht20", "rtc", "pms7003", "wifi", "ntp", "sdcard", "thingspeak"]
    for field in device_fields:
        if not getattr(data, field):
            alert_messages.append(f"Device {field} status is FALSE")

    # If any alerts, prepare message with Nepali time
    if alert_messages:
        nepali_time_str = unix_to_nepali_time(data.ts)
        alert_msg = f"ALERT at {nepali_time_str} (Nepali Time): " + "; ".join(alert_messages)
        print(f"Alert msg: {alert_msg}")
        background_tasks.add_task(send_whatsapp_alert, alert_msg)

    return response


@app.get("/api/data", response_model=list[schemas.AQMSFullDataResponse])
async def get_full_data():
    """Frontend GET endpoint to retrieve all sensor data"""
    return await crud.get_all_full_data()

# ==================== BASIC ROUTES ====================
@app.get("/")
async def root():
    return {"message": "Backend is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ==================== AUTHENTICATION ROUTES ====================
@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: schemas.UserCreate):
    """
    Register a new user (send role='admin' for first admin).
    """
    # Check if user exists
    existing_user = await crud.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Email already registered"
        )

    # Create user
    user.created_at = datetime.utcnow()
    user_id = await crud.create_user(user)
    created_user = await crud.get_user_by_email(user.email)
    return schemas.UserResponse(**created_user)

@app.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login with email and password. Use email in 'username' field.
    Returns JWT access token.
    """
    user = await crud.get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect email or password"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns currently logged in user's details (JWT required).
    """
    return schemas.UserResponse(**current_user)

# ==================== PASSWORD MANAGEMENT ====================
@app.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Allows logged-in user to change their password.
    Requires current password and new password.
    JWT token required.
    """
    # Verify old password is correct
    if not verify_password(password_data.old_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    new_hashed = get_password_hash(password_data.new_password)
    
    # Update in database
    # Use current_user["id"] which is the converted string ID (from _doc_to_resp)
    coll = get_users_collection()
    result = await coll.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"hashed_password": new_hashed}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update password"
        )
    
    return {"message": "Password changed successfully"}

# ==================== ADMIN-ONLY ROUTES ====================
@app.get("/admin/dashboard")
async def admin_dashboard(current_admin = Depends(get_current_admin_user)):
    """
    Admin-only route. Returns welcome message with admin info.
    Requires admin role and valid JWT token.
    """
    return {
        "message": "Welcome Admin!",
        "admin": current_admin["username"],
        "email": current_admin["email"],
        "role": current_admin["role"]
    }

@app.get("/admin/users")
async def list_all_users(current_admin = Depends(get_current_admin_user)):
    """
    Admin-only route to list all registered users.
    Requires admin role and valid JWT token.
    """
    users = await crud.list_users()
    return {
        "total_users": len(users),
        "users": users
    }


@app.get("/admin/export-csv")
async def export_csv(
    days: int = 7,
    current_admin = Depends(get_current_admin_user),
):
    """
    Export CSV of last N days' AQMS data (admin-only).
    """
    cutoff_ts = int((datetime.utcnow() - timedelta(days=days)).timestamp())
    # Fetch all readings after cutoff
    all_data = await crud.get_full_data_after_timestamp(cutoff_ts)

    headers = [
        "Timestamp", "PM1.0", "PM2.5", "PM10", "Temperature", "Humidity", "Battery",
        "Vin", "AHT20", "RTC", "PMS7003", "WiFi", "NTP", "SD Card", "Thingspeak"
    ]

    def csv_generator():
        buf = io.StringIO()
        writer = csv.writer(buf)
        # Write headers
        writer.writerow(headers)
        yield buf.getvalue()
        buf.seek(0)
        buf.truncate(0)
        # Write data rows

        nepal_tz = pytz.timezone("Asia/kathmandu")
        for reading in all_data:
            writer.writerow([
                datetime.fromtimestamp(reading["ts"], nepal_tz).isoformat(),
                reading["pm1"], reading["pm25"], reading["pm10"], reading["temp"], reading["hum"],
                reading["battery"], reading["vin"],
                reading["aht20"], reading["rtc"],
                reading["pms7003"], reading["wifi"], reading["ntp"], reading["sdcard"], reading["thingspeak"]
            ])
            yield buf.getvalue()
            buf.seek(0)
            buf.truncate(0)
        print(f"Exporting {len(all_data)} rows")


    filename = f"aqms_export_{days}days_{datetime.utcnow().date()}.csv"
    return StreamingResponse(
        csv_generator(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


