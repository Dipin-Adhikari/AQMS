from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from database import get_users_collection
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-min-32-chars-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme - tells FastAPI where to look for the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# Password Hashing Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password[:72])

# JWT Token Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def mongo_doc_to_user(doc):
    """Convert MongoDB user doc to a dict with 'id' as str."""
    user = dict(doc)
    user["id"] = str(user["_id"])
    # Optionally remove '_id' to avoid confusion
    # del user["_id"]
    return user

# Dependency Functions
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    coll = get_users_collection()
    user = await coll.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception

    return mongo_doc_to_user(user)
    """
    Dependency that validates JWT token and returns current user.
    This runs on every protected route.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Fetch user from database
    coll = get_users_collection()
    user = await coll.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
        return mongo_doc_to_user(user)


async def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    """
    Dependency that checks if current user is an admin.
    Use this to protect admin-only routes.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )
    return current_user



