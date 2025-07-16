# Environment Configuration Guide

## Overview

This guide covers all environment variables, configuration files, and settings required to run the Lakra annotation system across different environments. The system uses environment variables for configuration to maintain security and flexibility across development, staging, and production environments.

## Configuration Structure

```
lakra/
├── backend/
│   ├── .env                 # Backend environment variables
│   ├── .env.example         # Example configuration
│   └── config.py            # Configuration management
├── frontend/
│   ├── .env                 # Frontend environment variables
│   ├── .env.example         # Example configuration
│   └── .env.local           # Local development overrides
└── docker-compose.yml       # Container environment configuration
```

## Backend Configuration

### Required Environment Variables

#### Database Configuration

```env
# PostgreSQL database connection string (REQUIRED)
DATABASE_URL=postgresql://user:password@localhost:5432/lakra_db
```

**Format:** `postgresql://user:password@host:port/database`

**Example configurations:**
- **Local development**: `postgresql://lakra_user:lakra_pass@localhost:5432/lakra_dev`
- **Production**: `postgresql://lakra_user:secure_password@db.example.com:5432/lakra_prod`

#### Authentication & Security

```env
# JWT secret key for token signing (REQUIRED)
SECRET_KEY=your-very-secure-secret-key-here

# JWT token expiration (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Password hashing settings
PASSWORD_HASH_ROUNDS=12
```

**Security Best Practices:**
- Use a cryptographically secure random string for `SECRET_KEY`
- Minimum 32 characters for production
- Never commit secret keys to version control
- Rotate keys regularly in production

#### API Configuration

```env
# API server settings
API_HOST=0.0.0.0
API_PORT=8000
API_PREFIX=/api

# Debug mode (disable in production)
DEBUG=False

# API rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

#### CORS Configuration

```env
# Allowed origins for CORS
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com

# CORS settings
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOW_HEADERS=*
```

#### File Upload Configuration

```env
# File upload settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_EXTENSIONS=mp3,wav,ogg,m4a

# Audio processing
AUDIO_QUALITY=high
AUDIO_SAMPLE_RATE=44100
```

#### Logging Configuration

```env
# Logging settings
LOG_LEVEL=INFO
LOG_FILE=/var/log/lakra/backend.log
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s

# Sentry error tracking (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

#### Email Configuration (Optional)

```env
# Email server settings
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_TLS=True

# Email templates
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SUPPORT=support@yourdomain.com
```

#### AI/ML Configuration

```env
# DistilBERT model configuration
MODEL_NAME=distilbert-base-uncased
MODEL_CACHE_DIR=./models
MODEL_MAX_LENGTH=512

# AI processing settings
AI_PROCESSING_TIMEOUT=30
AI_BATCH_SIZE=16
AI_CONFIDENCE_THRESHOLD=0.7
```

### Optional Environment Variables

#### Performance Settings

```env
# Database connection pooling
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=0
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600

# Worker process settings
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1000
WORKER_TIMEOUT=30
```

#### Caching Configuration

```env
# Redis cache settings
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=3600
CACHE_PREFIX=lakra:
```

#### Feature Flags

```env
# Feature toggles
ENABLE_VOICE_RECORDING=True
ENABLE_MT_QUALITY=True
ENABLE_ONBOARDING=True
ENABLE_BATCH_PROCESSING=True
ENABLE_ANALYTICS=True
```

## Frontend Configuration

### Required Environment Variables

#### API Configuration

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# API timeout settings
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
```

#### Application Settings

```env
# Application information
VITE_APP_NAME=Lakra
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Annotation Tool for WiMarka

# Environment identifier
VITE_ENVIRONMENT=development
```

### Optional Environment Variables

#### Feature Configuration

```env
# Feature flags
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_DARK_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
```

#### UI/UX Settings

```env
# UI configuration
VITE_DEFAULT_LANGUAGE=en
VITE_THEME=light
VITE_ITEMS_PER_PAGE=20
VITE_AUTO_SAVE_INTERVAL=30000
```

#### External Services

```env
# Analytics (Google Analytics, etc.)
VITE_GOOGLE_ANALYTICS_ID=GA_TRACKING_ID

# Error tracking (Sentry)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# CDN settings
VITE_CDN_URL=https://cdn.yourdomain.com
```

## Environment-Specific Configurations

### Development Environment

**Backend (.env.development):**
```env
# Development settings
DEBUG=True
DATABASE_URL=postgresql://lakra_user:lakra_pass@localhost:5432/lakra_dev
SECRET_KEY=development-secret-key
API_HOST=localhost
API_PORT=8000
LOG_LEVEL=DEBUG
CORS_ORIGINS=http://localhost:5173

# Development features
ENABLE_DEBUG_TOOLBAR=True
ENABLE_PROFILING=True
RELOAD_ON_CHANGE=True
```

**Frontend (.env.development):**
```env
# Development settings
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_HOT_RELOAD=true
```

### Staging Environment

**Backend (.env.staging):**
```env
# Staging settings
DEBUG=False
DATABASE_URL=postgresql://lakra_user:secure_password@localhost:5432/lakra_staging
SECRET_KEY=staging-secret-key-very-secure
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
CORS_ORIGINS=https://staging.yourdomain.com

# Staging features
ENABLE_PROFILING=True
ENABLE_DEBUG_TOOLBAR=False
```

**Frontend (.env.staging):**
```env
# Staging settings
VITE_API_URL=https://staging.yourdomain.com
VITE_ENVIRONMENT=staging
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

### Production Environment

**Backend (.env.production):**
```env
# Production settings
DEBUG=False
DATABASE_URL=postgresql://lakra_user:very_secure_password@db-cluster:5432/lakra_production
SECRET_KEY=production-secret-key-extremely-secure
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO
CORS_ORIGINS=https://yourdomain.com

# Production security
SECURE_COOKIES=True
SESSION_SECURE=True
FORCE_HTTPS=True

# Production performance
WORKER_PROCESSES=4
DB_POOL_SIZE=50
CACHE_TTL=3600

# Production monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
ENABLE_METRICS=True
```

**Frontend (.env.production):**
```env
# Production settings
VITE_API_URL=https://yourdomain.com
VITE_ENVIRONMENT=production
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

## Docker Configuration

### Docker Compose Environment

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://lakra_user:${DB_PASSWORD}@db:5432/lakra
      - SECRET_KEY=${SECRET_KEY}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    environment:
      - VITE_API_URL=http://backend:8000
      - VITE_ENVIRONMENT=docker

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=lakra
      - POSTGRES_USER=lakra_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:alpine
```

**Docker Environment File (.env):**
```env
# Docker environment variables
DB_PASSWORD=secure_database_password
SECRET_KEY=docker-secret-key
COMPOSE_PROJECT_NAME=lakra
```

## Configuration Management

### Environment Variable Loading

**Backend Configuration (config.py):**
```python
import os
from typing import Optional
from functools import lru_cache

class Settings:
    # Database - PostgreSQL only
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/lakra_db")
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # API
    api_host: str = os.getenv("API_HOST", "localhost")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # CORS
    cors_origins: list = os.getenv("CORS_ORIGINS", "").split(",")
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_file: Optional[str] = os.getenv("LOG_FILE")
    
    # Features
    enable_voice_recording: bool = os.getenv("ENABLE_VOICE_RECORDING", "True").lower() == "true"
    enable_mt_quality: bool = os.getenv("ENABLE_MT_QUALITY", "True").lower() == "true"

@lru_cache()
def get_settings():
    return Settings()
```

### Frontend Configuration Loading

**Frontend Configuration (src/config.ts):**
```typescript
interface Config {
  apiUrl: string;
  environment: string;
  enableDebugMode: boolean;
  enableAnalytics: boolean;
  itemsPerPage: number;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  itemsPerPage: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '20'),
};

export default config;
```

## Configuration Validation

### Backend Validation

```python
from pydantic import BaseSettings, validator

class Settings(BaseSettings):
    secret_key: str
    database_url: str
    
    @validator('secret_key')
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters long')
        return v
    
    @validator('database_url')
    def validate_database_url(cls, v):
        if not v.startswith('postgresql://'):
            raise ValueError('DATABASE_URL must be PostgreSQL (postgresql://...)')
        return v
    
    class Config:
        env_file = '.env'
        case_sensitive = False
```

### Frontend Validation

```typescript
const validateConfig = (config: Config): void => {
  if (!config.apiUrl) {
    throw new Error('VITE_API_URL is required');
  }
  
  if (!config.apiUrl.startsWith('http')) {
    throw new Error('VITE_API_URL must be a valid URL');
  }
  
  if (config.itemsPerPage < 1 || config.itemsPerPage > 100) {
    throw new Error('VITE_ITEMS_PER_PAGE must be between 1 and 100');
  }
};

validateConfig(config);
```

## Security Considerations

### Environment Variable Security

1. **Never commit sensitive data to version control**
2. **Use different secrets for each environment**
3. **Rotate secrets regularly**
4. **Use environment variable injection in CI/CD**
5. **Validate all configuration values**

### Secret Management

**Using HashiCorp Vault:**
```bash
# Store secrets in Vault
vault kv put secret/lakra/production \
  secret_key="production-secret-key" \
  database_password="secure-password"

# Retrieve secrets
vault kv get -field=secret_key secret/lakra/production
```

**Using AWS Secrets Manager:**
```python
import boto3
from botocore.exceptions import ClientError

def get_secret(secret_name):
    session = boto3.session.Session()
    client = session.client('secretsmanager')
    
    try:
        response = client.get_secret_value(SecretId=secret_name)
        return response['SecretString']
    except ClientError as e:
        raise e
```

## Troubleshooting

### Common Configuration Issues

1. **Database Connection Errors**
   ```bash
   # Check database URL format
   echo $DATABASE_URL
   
   # Test database connection
   python -c "from sqlalchemy import create_engine; engine = create_engine('$DATABASE_URL'); print(engine.connect())"
   ```

2. **CORS Issues**
   ```bash
   # Check CORS origins
   echo $CORS_ORIGINS
   
   # Test CORS in browser console
   fetch('http://localhost:8000/api/health', {mode: 'cors'})
   ```

3. **Environment Variable Not Loading**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Check environment variables
   printenv | grep LAKRA
   ```

### Configuration Debugging

**Backend Debug Script:**
```python
import os
from config import get_settings

def debug_config():
    settings = get_settings()
    print(f"Database URL: {settings.database_url}")
    print(f"Debug Mode: {settings.debug}")
    print(f"API Host: {settings.api_host}")
    print(f"CORS Origins: {settings.cors_origins}")
    
    # Check environment variables
    print("\nEnvironment Variables:")
    for key, value in os.environ.items():
        if key.startswith('LAKRA_') or key in ['DEBUG', 'SECRET_KEY']:
            print(f"{key}: {'*' * len(value) if 'SECRET' in key else value}")

if __name__ == "__main__":
    debug_config()
```

**Frontend Debug Script:**
```typescript
const debugConfig = (): void => {
  console.log('Frontend Configuration:');
  console.log('API URL:', config.apiUrl);
  console.log('Environment:', config.environment);
  console.log('Debug Mode:', config.enableDebugMode);
  console.log('Analytics:', config.enableAnalytics);
  
  // Check environment variables
  console.log('\nEnvironment Variables:');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('VITE_ENVIRONMENT:', import.meta.env.VITE_ENVIRONMENT);
};

// Call in development
if (config.enableDebugMode) {
  debugConfig();
}
```

## Best Practices

### Development

1. **Use .env.example files** to document required variables
2. **Provide sensible defaults** for development
3. **Use environment-specific files** (.env.development, .env.staging)
4. **Validate configuration** on application startup

### Production

1. **Use external secret management** systems
2. **Implement configuration validation**
3. **Monitor configuration changes**
4. **Use infrastructure as code** for consistency

### Team Collaboration

1. **Document all configuration options**
2. **Use consistent naming conventions**
3. **Provide setup scripts** for new team members
4. **Maintain configuration templates**

## Configuration Templates

### Backend .env Template

```env
# ==================================================
# Lakra Backend Configuration
# ==================================================

# Database Configuration - PostgreSQL only
DATABASE_URL=postgresql://lakra_user:lakra_pass@localhost:5432/lakra_dev

# Security Settings
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_HOST=localhost
API_PORT=8000
DEBUG=True

# CORS Settings
CORS_ORIGINS=http://localhost:5173

# Logging
LOG_LEVEL=INFO
LOG_FILE=

# Features
ENABLE_VOICE_RECORDING=True
ENABLE_MT_QUALITY=True
ENABLE_ONBOARDING=True

# File Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Email (Optional)
SMTP_SERVER=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_TLS=True

# AI/ML Settings
MODEL_NAME=distilbert-base-uncased
MODEL_CACHE_DIR=./models
AI_PROCESSING_TIMEOUT=30
```

### Frontend .env Template

```env
# ==================================================
# Lakra Frontend Configuration
# ==================================================

# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Application Settings
VITE_APP_NAME=Lakra
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Features
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false

# UI Settings
VITE_DEFAULT_LANGUAGE=en
VITE_ITEMS_PER_PAGE=20
VITE_AUTO_SAVE_INTERVAL=30000

# External Services
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=
```

---

**Last Updated**: January 2024
**Configuration Version**: 1.0.0
**Supported Environments**: Development, Staging, Production, Docker 