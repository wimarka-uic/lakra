# Authentication API Documentation

## Overview

This document provides detailed information about authentication endpoints and security mechanisms in the Lakra API.

## Authentication System

The Lakra API uses JWT (JSON Web Tokens) for authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Authentication Flow

1. **Register** or **Login** to obtain a JWT token
2. **Include token** in subsequent API requests
3. **Token expires** after a configured time period
4. **Refresh token** or re-authenticate when expired

## Registration

### POST /api/register

Create a new user account.

**Request:**
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "languages": ["en", "es"],
  "is_evaluator": false
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "is_admin": false,
    "is_evaluator": false,
    "languages": ["en", "es"],
    "onboarding_status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Validation Rules:**
- Email: Must be valid email format, unique
- Username: 3-50 characters, alphanumeric and underscore only, unique
- Password: Minimum 8 characters
- First/Last Name: 1-100 characters
- Languages: Array of valid language codes

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email or username already exists

## Login

### POST /api/login

Authenticate existing user.

**Request:**
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "is_admin": false,
    "is_evaluator": false,
    "languages": ["en", "es"]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account disabled

## Token Usage

### Authorization Header

Include the JWT token in the Authorization header for all protected endpoints:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Token Structure

JWT tokens contain the following claims:
- `sub`: User ID
- `email`: User email
- `username`: Username
- `is_admin`: Admin status
- `is_evaluator`: Evaluator status
- `exp`: Expiration time
- `iat`: Issued at time

## User Profile

### GET /api/me

Get current user information.

**Request:**
```http
GET /api/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "is_admin": false,
  "is_evaluator": false,
  "languages": ["en", "es"],
  "onboarding_status": "completed",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### PUT /api/me

Update current user information.

**Request:**
```http
PUT /api/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "Jane",
  "last_name": "Smith",
  "is_admin": false,
  "is_evaluator": false,
  "languages": ["en", "es"],
  "onboarding_status": "completed",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Language Management

### GET /api/me/languages

Get user's language preferences.

**Request:**
```http
GET /api/me/languages
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
["en", "es", "fr"]
```

### POST /api/me/languages

Update user's language preferences.

**Request:**
```http
POST /api/me/languages
Authorization: Bearer <token>
Content-Type: application/json

["en", "es", "de"]
```

**Response (200 OK):**
```json
["en", "es", "de"]
```

## Guidelines Acknowledgment

### PUT /api/me/guidelines-seen

Mark annotation guidelines as seen.

**Request:**
```http
PUT /api/me/guidelines-seen
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "guidelines_seen": true
}
```

## Security Features

### Password Security

- Minimum 8 characters required
- Passwords are hashed using bcrypt
- Salt rounds: 12 (configurable)
- Password history not stored

### JWT Security

- **Secret Key**: Configurable secret key for signing
- **Expiration**: Configurable token expiration (default: 30 minutes)
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Claims**: Standard and custom claims

### Rate Limiting

Authentication endpoints are rate-limited:
- **Login**: 5 attempts per minute per IP
- **Register**: 3 attempts per minute per IP
- **Password Reset**: 1 attempt per minute per IP

## Error Handling

### Authentication Errors

**401 Unauthorized:**
```json
{
  "detail": "Could not validate credentials",
  "error_code": "INVALID_TOKEN"
}
```

**403 Forbidden:**
```json
{
  "detail": "Insufficient permissions",
  "error_code": "INSUFFICIENT_PERMISSIONS"
}
```

**422 Validation Error:**
```json
{
  "detail": "Validation error",
  "error_code": "VALIDATION_ERROR",
  "field_errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Common Error Codes

- `INVALID_CREDENTIALS`: Email/password combination invalid
- `INVALID_TOKEN`: JWT token invalid or expired
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `ACCOUNT_DISABLED`: User account is disabled
- `ONBOARDING_REQUIRED`: User must complete onboarding first

## Best Practices

### Client Implementation

1. **Store tokens securely** (not in localStorage for web apps)
2. **Check token expiration** before making requests
3. **Handle token refresh** appropriately
4. **Implement proper error handling** for auth failures
5. **Use HTTPS** in production

### Security Considerations

1. **Use strong secret keys** (minimum 32 characters)
2. **Implement proper CORS** policies
3. **Use HTTPS** for all authentication endpoints
4. **Monitor for brute force attacks**
5. **Implement account lockout** after failed attempts

### Token Management

1. **Short expiration times** for access tokens
2. **Implement refresh tokens** for long-lived sessions
3. **Revoke tokens** when necessary
4. **Monitor token usage** for suspicious activity

## Example Implementation

### JavaScript/TypeScript

```typescript
class AuthService {
  private token: string | null = null;
  
  async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    this.token = data.access_token;
    return data.user;
  }
  
  async getProfile(): Promise<User> {
    if (!this.token) {
      throw new Error('No token available');
    }
    
    const response = await fetch('/api/me', {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get profile');
    }
    
    return response.json();
  }
  
  logout(): void {
    this.token = null;
  }
}
```

### Python

```python
import requests
from typing import Optional

class AuthService:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None
    
    def login(self, email: str, password: str) -> dict:
        response = requests.post(
            f"{self.base_url}/api/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        
        data = response.json()
        self.token = data["access_token"]
        return data["user"]
    
    def get_profile(self) -> dict:
        if not self.token:
            raise ValueError("No token available")
        
        response = requests.get(
            f"{self.base_url}/api/me",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        response.raise_for_status()
        return response.json()
    
    def logout(self) -> None:
        self.token = None
```

## Testing

### Authentication Testing

```bash
# Register new user
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer TOKEN"
```

---

**Last Updated**: January 2024
**API Version**: 1.0.0
**Authentication Method**: JWT Bearer Tokens 