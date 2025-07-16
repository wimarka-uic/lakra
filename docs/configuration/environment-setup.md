# Environment Configuration Guide

## Overview
The Lakra backend uses environment variables for configuration, loaded from a `.env` file. This guide explains how to set up and customize your configuration.

## Quick Setup

### 1. Copy the Example File
```bash
cd backend
cp .env.example .env
```

### 2. Edit Your Settings
```bash
# Edit the .env file with your preferred editor
nano .env  # or vim .env, code .env, etc.
```

### 3. Key Settings to Update

#### Database Configuration (Required)
```env
# Update with your PostgreSQL credentials
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/your_database
```

#### Security Settings (Required)
```env
# Generate a secure secret key (use a random string generator)
SECRET_KEY=your-very-secure-secret-key-here-at-least-32-characters
```

## Configuration Reference

### Database Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DB_POOL_SIZE` | Connection pool size | `10` |
| `DB_MAX_OVERFLOW` | Max overflow connections | `20` |
| `DB_POOL_TIMEOUT` | Connection timeout (seconds) | `30` |
| `DB_POOL_RECYCLE` | Connection recycle time (seconds) | `3600` |

### Security Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key (REQUIRED) | `your-32+-character-secret-key` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `1440` (24 hours) |

### API Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `API_HOST` | Server bind address | `0.0.0.0` |
| `API_PORT` | Server port | `8000` |
| `DEBUG` | Enable debug mode | `True` or `False` |

### CORS Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | Allowed frontend URLs | `http://localhost:3000,http://localhost:5173` |

### File Upload Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `MAX_FILE_SIZE_MB` | Maximum upload size (MB) | `10` |
| `UPLOAD_DIR` | Upload directory path | `./uploads` |

## Environment-Specific Configurations

### Development Environment
```env
DEBUG=True
DATABASE_URL=postgresql://lakra_user:lakra_pass@localhost:5432/lakra_dev
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=DEBUG
```

### Production Environment
```env
DEBUG=False
DATABASE_URL=postgresql://lakra_user:secure_password@db.prod.com:5432/lakra_prod
SECRET_KEY=very-secure-production-secret-key-32+-characters
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=INFO
DB_POOL_SIZE=20
```

## Security Best Practices

### 1. Secret Key Generation
Generate a secure secret key:
```bash
# Python method
python3 -c "import secrets; print(secrets.token_hex(32))"

# OpenSSL method
openssl rand -hex 32
```

### 2. Database Security
- Use strong passwords for database users
- Limit database user permissions to only what's needed
- Use SSL connections in production (`sslmode=require` in DATABASE_URL)

### 3. Environment Variables
- Never commit `.env` files to version control
- Use different `.env` files for different environments
- Set restrictive file permissions: `chmod 600 .env`

## Validation

The application validates configuration on startup:
- `DATABASE_URL` must start with `postgresql://`
- `SECRET_KEY` must not be empty
- All required environment variables must be set

## Troubleshooting

### Common Issues

#### "DATABASE_URL must be PostgreSQL"
- Ensure your DATABASE_URL starts with `postgresql://`
- Check for typos in the connection string

#### "ModuleNotFoundError: No module named 'pydantic'"
- Install requirements: `pip install -r requirements.txt`
- Activate your Python virtual environment

#### Database Connection Errors
- Verify PostgreSQL is running
- Check database credentials and permissions
- Test connection with: `python3 utils/test_db_connection.py`

### Getting Help
- Run the database test: `python3 utils/test_db_connection.py`
- Check application logs for detailed error messages
- Verify all required packages are installed: `pip install -r requirements.txt`
