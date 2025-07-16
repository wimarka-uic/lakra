# Configuration Guide

## Overview

This guide covers the configuration options for the Lakra annotation system. For detailed environment variable configuration, see the [Environment Configuration Guide](configuration/environment.md).

## Configuration Structure

The system uses a hierarchical configuration structure:

```
Configuration Sources (Priority Order):
1. Environment Variables (Highest)
2. Configuration Files (.env files)
3. Command Line Arguments
4. Default Values (Lowest)
```

## Quick Configuration

### Development Configuration

For local development, create these files:

**backend/.env:**
```env
# Database - PostgreSQL only
DATABASE_URL=postgresql://lakra_user:lakra_pass@localhost:5432/lakra_dev

# Security
SECRET_KEY=dev-secret-key-change-in-production

# API Settings
API_HOST=localhost
API_PORT=8000
DEBUG=True

# CORS
CORS_ORIGINS=http://localhost:5173
```

**frontend/.env:**
```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Lakra
VITE_ENVIRONMENT=development
```

### Production Configuration

For production deployment:

**backend/.env:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lakra_prod

# Security
SECRET_KEY=super-secure-random-key-32-chars-min
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# CORS
CORS_ORIGINS=https://yourdomain.com

# Performance
WORKER_PROCESSES=4
DB_POOL_SIZE=20
```

**frontend/.env:**
```env
# API Configuration
VITE_API_URL=https://yourdomain.com
VITE_APP_NAME=Lakra
VITE_ENVIRONMENT=production
```

## Core Configuration Areas

### 1. Database Configuration

#### PostgreSQL (Required for all environments)
```env
DATABASE_URL=postgresql://username:password@host:port/database
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=5
DB_POOL_TIMEOUT=30
```

**Examples:**
- **Development**: `postgresql://lakra_user:lakra_pass@localhost:5432/lakra_dev`
- **Production**: `postgresql://lakra_user:secure_password@db.example.com:5432/lakra_prod`

#### MySQL (Alternative)
```env
DATABASE_URL=mysql://username:password@host:port/database
```

### 2. Security Configuration

#### JWT Authentication
```env
SECRET_KEY=your-secret-key-minimum-32-characters
ACCESS_TOKEN_EXPIRE_MINUTES=30
PASSWORD_HASH_ROUNDS=12
```

#### CORS Settings
```env
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOW_HEADERS=*
```

### 3. API Configuration

#### Server Settings
```env
API_HOST=0.0.0.0
API_PORT=8000
API_PREFIX=/api
DEBUG=False
```

#### Rate Limiting
```env
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
RATE_LIMIT_STORAGE=memory
```

### 4. Feature Configuration

#### Core Features
```env
ENABLE_VOICE_RECORDING=True
ENABLE_MT_QUALITY=True
ENABLE_ONBOARDING=True
ENABLE_BATCH_PROCESSING=True
```

#### File Upload Settings
```env
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=mp3,wav,ogg,m4a
```

### 5. UI/UX Configuration

#### Frontend Settings
```env
VITE_DEFAULT_LANGUAGE=en
VITE_ITEMS_PER_PAGE=20
VITE_AUTO_SAVE_INTERVAL=30000
VITE_THEME=light
```

#### Feature Flags
```env
VITE_ENABLE_DARK_MODE=false
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

## System Administration

### User Management Configuration

#### Default User Settings
```env
DEFAULT_USER_ROLE=annotator
REQUIRE_EMAIL_VERIFICATION=False
ALLOW_SELF_REGISTRATION=True
DEFAULT_LANGUAGE_PREFERENCES=en
```

#### Onboarding Configuration
```env
ONBOARDING_REQUIRED=True
ONBOARDING_PASS_THRESHOLD=80
ONBOARDING_MAX_ATTEMPTS=3
ONBOARDING_LANGUAGES=en,es,fil
```

### Content Management

#### Sentence Management
```env
DEFAULT_SENTENCE_DOMAIN=general
SENTENCE_BATCH_SIZE=100
ENABLE_SENTENCE_DEACTIVATION=True
```

#### Annotation Settings
```env
ANNOTATION_TIME_LIMIT=3600  # 1 hour
ENABLE_ANNOTATION_DRAFTS=True
AUTO_SAVE_INTERVAL=30  # seconds
```

### Quality Control

#### Evaluation Settings
```env
EVALUATION_REQUIRED=True
EVALUATOR_ASSIGNMENT_METHOD=round_robin
EVALUATION_BATCH_SIZE=50
```

#### AI Quality Assessment
```env
MT_QUALITY_MODEL=distilbert-base-uncased
MT_QUALITY_THRESHOLD=0.7
MT_QUALITY_BATCH_SIZE=16
```

## Performance Configuration

### Backend Performance

#### Worker Configuration
```env
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1000
WORKER_TIMEOUT=30
WORKER_KEEPALIVE=2
```

#### Database Performance
```env
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=5
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

#### Caching Configuration
```env
CACHE_BACKEND=redis
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=3600
CACHE_PREFIX=lakra:
```

### Frontend Performance

#### Build Configuration
```env
VITE_BUILD_TARGET=es2015
VITE_BUILD_MINIFY=true
VITE_BUILD_SOURCEMAP=false
```

#### Runtime Configuration
```env
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_CHUNK_SIZE_WARNING_LIMIT=1000
```

## Monitoring and Logging

### Logging Configuration

#### Backend Logging
```env
LOG_LEVEL=INFO
LOG_FILE=/var/log/lakra/backend.log
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s
LOG_ROTATION=daily
LOG_RETENTION=30  # days
```

#### Frontend Logging
```env
VITE_LOG_LEVEL=warn
VITE_LOG_CONSOLE=true
VITE_LOG_REMOTE=false
```

### Monitoring Configuration

#### Health Checks
```env
HEALTH_CHECK_INTERVAL=30
HEALTH_CHECK_TIMEOUT=5
HEALTH_CHECK_ENDPOINTS=/health,/api/health
```

#### Metrics Collection
```env
ENABLE_METRICS=True
METRICS_ENDPOINT=/metrics
METRICS_RETENTION=7  # days
```

## External Service Configuration

### Email Configuration

#### SMTP Settings
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_TLS=True
SMTP_FROM=noreply@yourdomain.com
```

### Analytics Configuration

#### Google Analytics
```env
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_GOOGLE_ANALYTICS_ENABLED=true
```

#### Custom Analytics
```env
VITE_ANALYTICS_ENDPOINT=https://analytics.yourdomain.com
VITE_ANALYTICS_KEY=your-analytics-key
```

### Error Tracking

#### Sentry Configuration
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0
```

## Customization Options

### Branding Configuration

#### Application Branding
```env
VITE_APP_NAME=Lakra
VITE_APP_DESCRIPTION=Annotation Tool for Machine Translation
VITE_APP_VERSION=1.0.0
VITE_COMPANY_NAME=Your Organization
```

#### Theme Configuration
```env
VITE_PRIMARY_COLOR=#3B82F6
VITE_SECONDARY_COLOR=#10B981
VITE_ACCENT_COLOR=#F59E0B
VITE_LOGO_URL=/logo.png
```

### Language Configuration

#### Supported Languages
```env
SUPPORTED_LANGUAGES=en,es,fil,ceb,hil,war,tgl
DEFAULT_SOURCE_LANGUAGE=en
DEFAULT_TARGET_LANGUAGE=fil
```

#### Interface Languages
```env
INTERFACE_LANGUAGES=en,es,fil
DEFAULT_INTERFACE_LANGUAGE=en
```

## Environment-Specific Configurations

### Development Environment

Use `.env.development` for development-specific settings:
```env
DEBUG=True
LOG_LEVEL=DEBUG
ENABLE_DEBUG_TOOLBAR=True
ENABLE_PROFILING=True
VITE_ENABLE_DEBUG_MODE=true
```

### Staging Environment

Use `.env.staging` for staging-specific settings:
```env
DEBUG=False
LOG_LEVEL=INFO
ENABLE_DEBUG_TOOLBAR=False
ENABLE_PROFILING=True
VITE_ENABLE_DEBUG_MODE=false
```

### Production Environment

Use `.env.production` for production-specific settings:
```env
DEBUG=False
LOG_LEVEL=WARNING
ENABLE_DEBUG_TOOLBAR=False
ENABLE_PROFILING=False
SECURE_COOKIES=True
VITE_ENABLE_DEBUG_MODE=false
```

## Configuration Management

### Configuration Files

#### Backend Configuration
```
backend/
├── .env                    # Main environment file
├── .env.development        # Development overrides
├── .env.staging           # Staging overrides
├── .env.production        # Production overrides
├── .env.example           # Example configuration
└── config.py              # Configuration loader
```

#### Frontend Configuration
```
frontend/
├── .env                    # Main environment file
├── .env.development        # Development overrides
├── .env.staging           # Staging overrides
├── .env.production        # Production overrides
├── .env.example           # Example configuration
└── src/config/            # Configuration utilities
```

### Configuration Validation

#### Backend Validation
```python
# config.py
from pydantic import BaseSettings, validator

class Settings(BaseSettings):
    secret_key: str
    database_url: str
    
    @validator('secret_key')
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters')
        return v
    
    class Config:
        env_file = '.env'
```

#### Frontend Validation
```typescript
// src/config/validation.ts
const validateConfig = (config: Config) => {
  if (!config.apiUrl) {
    throw new Error('VITE_API_URL is required');
  }
  // Additional validation...
};
```

## Best Practices

### Security Best Practices

1. **Never commit secrets to version control**
2. **Use different secrets for each environment**
3. **Rotate secrets regularly**
4. **Use environment variable injection in CI/CD**
5. **Validate all configuration values**

### Performance Best Practices

1. **Use appropriate database connection pooling**
2. **Configure caching appropriately**
3. **Set reasonable timeouts**
4. **Monitor resource usage**
5. **Use CDN for static assets**

### Maintenance Best Practices

1. **Document all configuration changes**
2. **Test configuration changes in staging**
3. **Monitor configuration drift**
4. **Regular configuration backups**
5. **Automated configuration validation**

## Troubleshooting

### Common Configuration Issues

#### Database Connection Issues
```bash
# Test database connection
python -c "from sqlalchemy import create_engine; engine = create_engine('$DATABASE_URL'); print(engine.connect())"
```

#### CORS Configuration Issues
```bash
# Check CORS settings
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8000/api/health
```

#### Environment Variable Issues
```bash
# Check environment variables
printenv | grep -E "(DATABASE_URL|SECRET_KEY|API_HOST)"
```

### Configuration Debugging

Create a debug script to verify configuration:

```python
# debug_config.py
import os
from backend.config import get_settings

def debug_config():
    settings = get_settings()
    print("Configuration Debug:")
    print(f"Database URL: {settings.database_url}")
    print(f"API Host: {settings.api_host}")
    print(f"Debug Mode: {settings.debug}")
    print(f"CORS Origins: {settings.cors_origins}")

if __name__ == "__main__":
    debug_config()
```

## Additional Resources

- [Environment Configuration Guide](configuration/environment.md) - Detailed environment variable documentation
- [Deployment Guide](deployment/README.md) - Production deployment configuration
- [Security Guide](deployment/security.md) - Security configuration best practices
- [Performance Guide](technical/performance.md) - Performance optimization settings

---

**Last Updated**: January 2024
**Configuration Version**: 1.0.0
**For detailed environment configuration, see**: [Environment Configuration Guide](configuration/environment.md) 