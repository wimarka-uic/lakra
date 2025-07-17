from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import or_
import re
from database import get_db, User

# Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token scheme
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def is_email_format(email_or_username: str) -> bool:
    """Check if the input string is in email format"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email_or_username) is not None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    email = verify_token(credentials.credentials)
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def get_current_evaluator_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_evaluator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Evaluator permissions required"
        )
    return current_user

def get_current_admin_or_evaluator_user(current_user: User = Depends(get_current_user)):
    if not (current_user.is_admin or current_user.is_evaluator):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or evaluator permissions required"
        )
    return current_user

def authenticate_user(db: Session, email_or_username: str, password: str):
    """
    Authenticate user by email or username.
    
    Args:
        db: Database session
        email_or_username: Email address or username
        password: Plain text password
        
    Returns:
        User object if authentication successful, False otherwise
    """
    # Determine if input is email or username format
    if is_email_format(email_or_username):
        # Query by email
        user = db.query(User).filter(User.email == email_or_username).first()
    else:
        # Query by username
        user = db.query(User).filter(User.username == email_or_username).first()
    
    # If user not found with specific method, try both (fallback for edge cases)
    if not user:
        user = db.query(User).filter(
            or_(User.email == email_or_username, User.username == email_or_username)
        ).first()
    
    if not user:
        return False
    
    if not verify_password(password, user.hashed_password):
        return False
    
    return user