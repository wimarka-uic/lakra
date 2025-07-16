"""
Configuration management for Lakra Annotation System
"""
import os
from typing import Optional, List
from pydantic import BaseModel, field_validator
from functools import lru_cache

class Settings(BaseModel):
    """Application settings"""
    
    # Database
    database_url: str = "sqlite:///./annotation_system.db"
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_timeout: int = 30
    db_pool_recycle: int = 3600
    
    # Security
    secret_key: str = "fallback-secret-key-change-this"
    access_token_expire_minutes: int = 1440
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # File uploads
    max_file_size_mb: int = 10
    upload_dir: str = "./uploads"
    
    def __init__(self, **kwargs):
        # Load from environment variables
        env_vars = {
            'database_url': os.getenv('DATABASE_URL', 'sqlite:///./annotation_system.db'),
            'secret_key': os.getenv('SECRET_KEY', 'fallback-secret-key-change-this'),
            'access_token_expire_minutes': int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 1440)),
            'api_host': os.getenv('API_HOST', '0.0.0.0'),
            'api_port': int(os.getenv('API_PORT', 8000)),
            'debug': os.getenv('DEBUG', 'True').lower() == 'true',
            'allowed_origins': os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(','),
            'max_file_size_mb': int(os.getenv('MAX_FILE_SIZE_MB', 10)),
            'upload_dir': os.getenv('UPLOAD_DIR', './uploads'),
            'db_pool_size': int(os.getenv('DB_POOL_SIZE', 10)),
            'db_max_overflow': int(os.getenv('DB_MAX_OVERFLOW', 20)),
            'db_pool_timeout': int(os.getenv('DB_POOL_TIMEOUT', 30)),
            'db_pool_recycle': int(os.getenv('DB_POOL_RECYCLE', 3600)),
        }
        env_vars.update(kwargs)
        super().__init__(**env_vars)
    
    @field_validator('database_url')
    @classmethod
    def validate_database_url(cls, v):
        """Validate database URL format"""
        if not v:
            raise ValueError('DATABASE_URL cannot be empty')
        
        # Basic validation for supported database types
        if not (v.startswith('sqlite:///') or v.startswith('postgresql://')):
            raise ValueError('DATABASE_URL must be SQLite or PostgreSQL')
        
        return v
    
    @property
    def is_postgresql(self) -> bool:
        """Check if using PostgreSQL"""
        return self.database_url.startswith('postgresql://')
    
    @property
    def is_sqlite(self) -> bool:
        """Check if using SQLite"""
        return self.database_url.startswith('sqlite:///')

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Global settings instance
settings = get_settings()
