"""
Configuration management for Lakra Annotation System
"""
import os
from typing import Optional, List
from pydantic import BaseModel, field_validator
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseModel):
    """Application settings"""
    
    # Database - PostgreSQL only
    database_url: str = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/lakra')
    db_pool_size: int = int(os.getenv('DB_POOL_SIZE', '10'))
    db_max_overflow: int = int(os.getenv('DB_MAX_OVERFLOW', '20'))
    db_pool_timeout: int = int(os.getenv('DB_POOL_TIMEOUT', '30'))
    db_pool_recycle: int = int(os.getenv('DB_POOL_RECYCLE', '3600'))
    
    # Security
    secret_key: str = os.getenv('SECRET_KEY', 'fallback-secret-key-change-this')
    access_token_expire_minutes: int = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '1440'))
    
    # API
    api_host: str = os.getenv('API_HOST', '0.0.0.0')
    api_port: int = int(os.getenv('API_PORT', '8000'))
    debug: bool = os.getenv('DEBUG', 'True').lower() == 'true'
    
    # CORS
    allowed_origins: List[str] = [
        origin.strip() for origin in 
        os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
    ]
    
    # File uploads
    max_file_size_mb: int = int(os.getenv('MAX_FILE_SIZE_MB', '10'))
    upload_dir: str = os.getenv('UPLOAD_DIR', './uploads')
    
    @field_validator('database_url')
    @classmethod
    def validate_database_url(cls, v):
        """Validate database URL format - PostgreSQL only"""
        if not v:
            raise ValueError('DATABASE_URL cannot be empty')
        
        # Only PostgreSQL is supported
        if not v.startswith('postgresql://'):
            raise ValueError('DATABASE_URL must be PostgreSQL (postgresql://...)')
        
        return v
    
    @property
    def is_postgresql(self) -> bool:
        """Check if using PostgreSQL - always True now"""
        return True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Global settings instance
settings = get_settings()
