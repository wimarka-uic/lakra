# Error Handling API Documentation

## Overview

This document provides comprehensive information about error handling in the Lakra API, including error codes, response formats, and troubleshooting guidance.

## Error Response Format

All API errors follow a consistent response format:

```json
{
  "detail": "Human-readable error message",
  "error_code": "SPECIFIC_ERROR_CODE",
  "field_errors": {
    "field_name": ["Field-specific error message"]
  },
  "metadata": {
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:30:00Z",
    "endpoint": "/api/annotations",
    "method": "POST"
  }
}
```

## HTTP Status Codes

### 2xx Success

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 202 | Accepted | Request accepted for processing |
| 204 | No Content | Request successful, no content returned |

### 4xx Client Errors

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 405 | Method Not Allowed | HTTP method not supported |
| 409 | Conflict | Resource already exists |
| 413 | Request Entity Too Large | File too large |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |

### 5xx Server Errors

| Code | Status | Description |
|------|--------|-------------|
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | Gateway error |
| 503 | Service Unavailable | Service temporarily unavailable |
| 504 | Gateway Timeout | Gateway timeout |

## Authentication Errors

### 401 Unauthorized

**Error Code**: `AUTHENTICATION_REQUIRED`

**Description**: Valid authentication token required

**Response Example:**
```json
{
  "detail": "Authentication credentials were not provided",
  "error_code": "AUTHENTICATION_REQUIRED",
  "metadata": {
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Error Code**: `INVALID_TOKEN`

**Description**: JWT token is invalid or expired

**Response Example:**
```json
{
  "detail": "Invalid or expired authentication token",
  "error_code": "INVALID_TOKEN",
  "metadata": {
    "token_expired": true,
    "expiry_time": "2024-01-15T10:00:00Z"
  }
}
```

**Error Code**: `TOKEN_EXPIRED`

**Description**: JWT token has expired

**Response Example:**
```json
{
  "detail": "Authentication token has expired",
  "error_code": "TOKEN_EXPIRED",
  "metadata": {
    "expired_at": "2024-01-15T10:00:00Z",
    "current_time": "2024-01-15T10:30:00Z"
  }
}
```

## Authorization Errors

### 403 Forbidden

**Error Code**: `INSUFFICIENT_PERMISSIONS`

**Description**: User lacks required permissions

**Response Example:**
```json
{
  "detail": "You do not have permission to perform this action",
  "error_code": "INSUFFICIENT_PERMISSIONS",
  "metadata": {
    "required_role": "admin",
    "user_role": "annotator"
  }
}
```

**Error Code**: `EVALUATOR_REQUIRED`

**Description**: Evaluator privileges required

**Response Example:**
```json
{
  "detail": "Evaluator privileges are required for this action",
  "error_code": "EVALUATOR_REQUIRED",
  "metadata": {
    "user_id": 123,
    "is_evaluator": false
  }
}
```

**Error Code**: `ADMIN_REQUIRED`

**Description**: Administrator privileges required

**Response Example:**
```json
{
  "detail": "Administrator privileges are required for this action",
  "error_code": "ADMIN_REQUIRED",
  "metadata": {
    "user_id": 123,
    "is_admin": false
  }
}
```

**Error Code**: `SELF_EVALUATION_FORBIDDEN`

**Description**: Cannot evaluate own annotation

**Response Example:**
```json
{
  "detail": "You cannot evaluate your own annotation",
  "error_code": "SELF_EVALUATION_FORBIDDEN",
  "metadata": {
    "annotation_id": 456,
    "annotator_id": 123,
    "evaluator_id": 123
  }
}
```

## Validation Errors

### 422 Unprocessable Entity

**Error Code**: `VALIDATION_ERROR`

**Description**: Request data validation failed

**Response Example:**
```json
{
  "detail": "Validation error in request data",
  "error_code": "VALIDATION_ERROR",
  "field_errors": {
    "email": ["This field is required"],
    "fluency_score": ["Score must be between 1 and 5"],
    "password": ["Password must be at least 8 characters long"]
  }
}
```

**Error Code**: `INVALID_ANNOTATION_DATA`

**Description**: Annotation data is invalid

**Response Example:**
```json
{
  "detail": "Invalid annotation data provided",
  "error_code": "INVALID_ANNOTATION_DATA",
  "field_errors": {
    "highlights": ["Text highlight range is invalid"],
    "error_type": ["Invalid error type specified"]
  }
}
```

**Error Code**: `INVALID_SCORE_RANGE`

**Description**: Score values are out of valid range

**Response Example:**
```json
{
  "detail": "Score values must be between 1 and 5",
  "error_code": "INVALID_SCORE_RANGE",
  "field_errors": {
    "fluency_score": ["Score must be between 1 and 5"],
    "adequacy_score": ["Score must be between 1 and 5"]
  }
}
```

## Resource Errors

### 404 Not Found

**Error Code**: `ANNOTATION_NOT_FOUND`

**Description**: Annotation does not exist

**Response Example:**
```json
{
  "detail": "Annotation with ID 456 not found",
  "error_code": "ANNOTATION_NOT_FOUND",
  "metadata": {
    "annotation_id": 456,
    "user_id": 123
  }
}
```

**Error Code**: `SENTENCE_NOT_FOUND`

**Description**: Sentence does not exist

**Response Example:**
```json
{
  "detail": "Sentence with ID 789 not found",
  "error_code": "SENTENCE_NOT_FOUND",
  "metadata": {
    "sentence_id": 789
  }
}
```

**Error Code**: `USER_NOT_FOUND`

**Description**: User does not exist

**Response Example:**
```json
{
  "detail": "User with ID 123 not found",
  "error_code": "USER_NOT_FOUND",
  "metadata": {
    "user_id": 123
  }
}
```

**Error Code**: `EVALUATION_NOT_FOUND`

**Description**: Evaluation does not exist

**Response Example:**
```json
{
  "detail": "Evaluation with ID 456 not found",
  "error_code": "EVALUATION_NOT_FOUND",
  "metadata": {
    "evaluation_id": 456
  }
}
```

## Conflict Errors

### 409 Conflict

**Error Code**: `ANNOTATION_EXISTS`

**Description**: Annotation already exists for this sentence

**Response Example:**
```json
{
  "detail": "You have already annotated this sentence",
  "error_code": "ANNOTATION_EXISTS",
  "metadata": {
    "sentence_id": 789,
    "existing_annotation_id": 456,
    "user_id": 123
  }
}
```

**Error Code**: `EVALUATION_EXISTS`

**Description**: Evaluation already exists for this annotation

**Response Example:**
```json
{
  "detail": "You have already evaluated this annotation",
  "error_code": "EVALUATION_EXISTS",
  "metadata": {
    "annotation_id": 456,
    "existing_evaluation_id": 789,
    "evaluator_id": 123
  }
}
```

**Error Code**: `USER_EXISTS`

**Description**: User already exists

**Response Example:**
```json
{
  "detail": "User with this email already exists",
  "error_code": "USER_EXISTS",
  "metadata": {
    "email": "user@example.com"
  }
}
```

**Error Code**: `USERNAME_EXISTS`

**Description**: Username already taken

**Response Example:**
```json
{
  "detail": "Username is already taken",
  "error_code": "USERNAME_EXISTS",
  "metadata": {
    "username": "desired_username"
  }
}
```

## Business Logic Errors

### 400 Bad Request

**Error Code**: `ANNOTATION_NOT_COMPLETED`

**Description**: Annotation must be completed before evaluation

**Response Example:**
```json
{
  "detail": "Annotation must be completed before it can be evaluated",
  "error_code": "ANNOTATION_NOT_COMPLETED",
  "metadata": {
    "annotation_id": 456,
    "current_status": "in_progress"
  }
}
```

**Error Code**: `ONBOARDING_REQUIRED`

**Description**: User must complete onboarding first

**Response Example:**
```json
{
  "detail": "You must complete the onboarding test before annotating",
  "error_code": "ONBOARDING_REQUIRED",
  "metadata": {
    "user_id": 123,
    "onboarding_status": "pending"
  }
}
```

**Error Code**: `INACTIVE_SENTENCE`

**Description**: Sentence is not active for annotation

**Response Example:**
```json
{
  "detail": "This sentence is not currently available for annotation",
  "error_code": "INACTIVE_SENTENCE",
  "metadata": {
    "sentence_id": 789,
    "is_active": false
  }
}
```

**Error Code**: `EVALUATION_DEADLINE_EXCEEDED`

**Description**: Evaluation deadline has passed

**Response Example:**
```json
{
  "detail": "The evaluation deadline has passed",
  "error_code": "EVALUATION_DEADLINE_EXCEEDED",
  "metadata": {
    "deadline": "2024-01-15T23:59:59Z",
    "current_time": "2024-01-16T08:00:00Z"
  }
}
```

## File Upload Errors

### 413 Request Entity Too Large

**Error Code**: `FILE_TOO_LARGE`

**Description**: Uploaded file exceeds size limit

**Response Example:**
```json
{
  "detail": "File size exceeds maximum allowed limit",
  "error_code": "FILE_TOO_LARGE",
  "metadata": {
    "file_size": 15728640,
    "max_size": 10485760,
    "max_size_mb": 10
  }
}
```

**Error Code**: `UNSUPPORTED_FILE_FORMAT`

**Description**: File format not supported

**Response Example:**
```json
{
  "detail": "Unsupported file format",
  "error_code": "UNSUPPORTED_FILE_FORMAT",
  "metadata": {
    "file_extension": ".txt",
    "supported_formats": [".wav", ".mp3", ".ogg", ".m4a"]
  }
}
```

**Error Code**: `AUDIO_DURATION_EXCEEDED`

**Description**: Audio file duration exceeds limit

**Response Example:**
```json
{
  "detail": "Audio duration exceeds maximum allowed limit",
  "error_code": "AUDIO_DURATION_EXCEEDED",
  "metadata": {
    "duration_seconds": 600,
    "max_duration_seconds": 300
  }
}
```

## Rate Limiting Errors

### 429 Too Many Requests

**Error Code**: `RATE_LIMIT_EXCEEDED`

**Description**: Rate limit exceeded

**Response Example:**
```json
{
  "detail": "Rate limit exceeded. Please try again later",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "metadata": {
    "limit": 100,
    "window": 60,
    "reset_time": "2024-01-15T10:31:00Z",
    "retry_after": 60
  }
}
```

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642248060
Retry-After: 60
```

## System Errors

### 500 Internal Server Error

**Error Code**: `INTERNAL_SERVER_ERROR`

**Description**: Unexpected server error

**Response Example:**
```json
{
  "detail": "An unexpected error occurred. Please try again later",
  "error_code": "INTERNAL_SERVER_ERROR",
  "metadata": {
    "request_id": "req_123456789",
    "error_id": "err_987654321",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Error Code**: `DATABASE_ERROR`

**Description**: Database operation failed

**Response Example:**
```json
{
  "detail": "Database operation failed. Please try again",
  "error_code": "DATABASE_ERROR",
  "metadata": {
    "operation": "INSERT",
    "table": "annotations",
    "error_type": "connection_timeout"
  }
}
```

**Error Code**: `SERVICE_UNAVAILABLE`

**Description**: Service temporarily unavailable

**Response Example:**
```json
{
  "detail": "Service is temporarily unavailable",
  "error_code": "SERVICE_UNAVAILABLE",
  "metadata": {
    "service": "annotation_service",
    "expected_recovery": "2024-01-15T11:00:00Z"
  }
}
```

## Text Highlight Errors

**Error Code**: `HIGHLIGHT_INVALID_RANGE`

**Description**: Text highlight range is invalid

**Response Example:**
```json
{
  "detail": "Text highlight range is invalid",
  "error_code": "HIGHLIGHT_INVALID_RANGE",
  "metadata": {
    "start_index": 50,
    "end_index": 45,
    "text_length": 100
  }
}
```

**Error Code**: `HIGHLIGHT_OUT_OF_BOUNDS`

**Description**: Text highlight is out of bounds

**Response Example:**
```json
{
  "detail": "Text highlight is out of bounds",
  "error_code": "HIGHLIGHT_OUT_OF_BOUNDS",
  "metadata": {
    "start_index": 95,
    "end_index": 105,
    "text_length": 100
  }
}
```

## Onboarding Errors

**Error Code**: `ONBOARDING_TEST_NOT_FOUND`

**Description**: Onboarding test not found

**Response Example:**
```json
{
  "detail": "Onboarding test not found",
  "error_code": "ONBOARDING_TEST_NOT_FOUND",
  "metadata": {
    "test_id": 123,
    "user_id": 456
  }
}
```

**Error Code**: `ONBOARDING_ALREADY_COMPLETED`

**Description**: Onboarding already completed

**Response Example:**
```json
{
  "detail": "You have already completed the onboarding test",
  "error_code": "ONBOARDING_ALREADY_COMPLETED",
  "metadata": {
    "user_id": 456,
    "completion_date": "2024-01-10T14:30:00Z",
    "score": 85.5
  }
}
```

**Error Code**: `ONBOARDING_MAX_ATTEMPTS_EXCEEDED`

**Description**: Maximum onboarding attempts exceeded

**Response Example:**
```json
{
  "detail": "Maximum number of onboarding attempts exceeded",
  "error_code": "ONBOARDING_MAX_ATTEMPTS_EXCEEDED",
  "metadata": {
    "max_attempts": 3,
    "attempts_used": 3,
    "last_attempt": "2024-01-12T16:00:00Z"
  }
}
```

## Error Code Reference

### Complete Error Code List

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Authentication credentials required |
| `INVALID_TOKEN` | 401 | JWT token is invalid |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `EVALUATOR_REQUIRED` | 403 | Evaluator privileges required |
| `ADMIN_REQUIRED` | 403 | Administrator privileges required |
| `SELF_EVALUATION_FORBIDDEN` | 403 | Cannot evaluate own annotation |
| `VALIDATION_ERROR` | 422 | Request data validation failed |
| `INVALID_ANNOTATION_DATA` | 422 | Annotation data is invalid |
| `INVALID_SCORE_RANGE` | 422 | Score values out of range |
| `ANNOTATION_NOT_FOUND` | 404 | Annotation does not exist |
| `SENTENCE_NOT_FOUND` | 404 | Sentence does not exist |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `EVALUATION_NOT_FOUND` | 404 | Evaluation does not exist |
| `ANNOTATION_EXISTS` | 409 | Annotation already exists |
| `EVALUATION_EXISTS` | 409 | Evaluation already exists |
| `USER_EXISTS` | 409 | User already exists |
| `USERNAME_EXISTS` | 409 | Username already taken |
| `ANNOTATION_NOT_COMPLETED` | 400 | Annotation not completed |
| `ONBOARDING_REQUIRED` | 400 | Onboarding required |
| `INACTIVE_SENTENCE` | 400 | Sentence not active |
| `EVALUATION_DEADLINE_EXCEEDED` | 400 | Evaluation deadline passed |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `UNSUPPORTED_FILE_FORMAT` | 400 | File format not supported |
| `AUDIO_DURATION_EXCEEDED` | 400 | Audio duration too long |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `HIGHLIGHT_INVALID_RANGE` | 422 | Text highlight range invalid |
| `HIGHLIGHT_OUT_OF_BOUNDS` | 422 | Text highlight out of bounds |
| `ONBOARDING_TEST_NOT_FOUND` | 404 | Onboarding test not found |
| `ONBOARDING_ALREADY_COMPLETED` | 409 | Onboarding already completed |
| `ONBOARDING_MAX_ATTEMPTS_EXCEEDED` | 429 | Max onboarding attempts exceeded |

## Error Handling Best Practices

### Client-Side Error Handling

#### TypeScript Example

```typescript
interface ApiError {
  detail: string;
  error_code: string;
  field_errors?: Record<string, string[]>;
  metadata?: Record<string, any>;
}

class ApiClient {
  async handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response) {
        const apiError: ApiError = error.response.data;
        this.handleApiError(apiError);
      }
      throw error;
    }
  }

  private handleApiError(error: ApiError): void {
    switch (error.error_code) {
      case 'AUTHENTICATION_REQUIRED':
      case 'INVALID_TOKEN':
      case 'TOKEN_EXPIRED':
        this.redirectToLogin();
        break;
      
      case 'INSUFFICIENT_PERMISSIONS':
        this.showPermissionDenied();
        break;
      
      case 'VALIDATION_ERROR':
        this.showValidationErrors(error.field_errors);
        break;
      
      case 'RATE_LIMIT_EXCEEDED':
        this.showRateLimitMessage(error.metadata?.retry_after);
        break;
      
      case 'ONBOARDING_REQUIRED':
        this.redirectToOnboarding();
        break;
      
      default:
        this.showGenericError(error.detail);
    }
  }
}
```

#### Python Example

```python
import requests
from typing import Dict, Any

class ApiError(Exception):
    def __init__(self, detail: str, error_code: str, field_errors: Dict = None, metadata: Dict = None):
        self.detail = detail
        self.error_code = error_code
        self.field_errors = field_errors or {}
        self.metadata = metadata or {}
        super().__init__(detail)

class ApiClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
    
    def handle_response(self, response: requests.Response) -> Dict[str, Any]:
        if response.status_code >= 400:
            error_data = response.json()
            raise ApiError(
                detail=error_data.get('detail', 'Unknown error'),
                error_code=error_data.get('error_code', 'UNKNOWN_ERROR'),
                field_errors=error_data.get('field_errors'),
                metadata=error_data.get('metadata')
            )
        return response.json()
    
    def create_annotation(self, data: Dict) -> Dict:
        try:
            response = requests.post(
                f"{self.base_url}/api/annotations",
                json=data,
                headers={'Authorization': f'Bearer {self.token}'}
            )
            return self.handle_response(response)
        except ApiError as e:
            if e.error_code == 'ONBOARDING_REQUIRED':
                print("Please complete onboarding first")
            elif e.error_code == 'VALIDATION_ERROR':
                print(f"Validation errors: {e.field_errors}")
            else:
                print(f"API Error: {e.detail}")
            raise
```

### Error Recovery Strategies

#### Automatic Retry

```typescript
class ApiClient {
  private async retryOnError<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        const shouldRetry = this.shouldRetry(error, attempt, maxRetries);
        if (!shouldRetry) {
          throw error;
        }
        
        const delay = backoffMs * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }
    throw new Error('Max retries exceeded');
  }

  private shouldRetry(error: any, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;
    
    const retryableErrors = [
      'INTERNAL_SERVER_ERROR',
      'DATABASE_ERROR',
      'SERVICE_UNAVAILABLE'
    ];
    
    return retryableErrors.includes(error.error_code);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### Token Refresh

```typescript
class AuthenticatedApiClient {
  private async refreshTokenIfNeeded(): Promise<void> {
    if (this.tokenExpired()) {
      try {
        await this.refreshToken();
      } catch (error) {
        this.redirectToLogin();
        throw error;
      }
    }
  }

  private async makeAuthenticatedRequest<T>(apiCall: () => Promise<T>): Promise<T> {
    await this.refreshTokenIfNeeded();
    
    try {
      return await apiCall();
    } catch (error) {
      if (error.error_code === 'TOKEN_EXPIRED') {
        await this.refreshToken();
        return await apiCall();
      }
      throw error;
    }
  }
}
```

## Debugging and Logging

### Request ID Tracking

All error responses include a unique `request_id` for tracking and debugging:

```json
{
  "detail": "Internal server error",
  "error_code": "INTERNAL_SERVER_ERROR",
  "metadata": {
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Logging

```typescript
class ErrorLogger {
  logError(error: ApiError, context: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      error_code: error.error_code,
      detail: error.detail,
      request_id: error.metadata?.request_id,
      user_id: context.user_id,
      endpoint: context.endpoint,
      method: context.method,
      stack_trace: error.stack
    };
    
    // Send to logging service
    this.sendToLoggingService(logData);
  }
}
```

## Testing Error Scenarios

### Test Cases

```bash
# Test authentication errors
curl -X GET http://localhost:8000/api/annotations
# Expected: 401 AUTHENTICATION_REQUIRED

# Test validation errors
curl -X POST http://localhost:8000/api/annotations \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fluency_score": 10}'
# Expected: 422 VALIDATION_ERROR

# Test rate limiting
for i in {1..110}; do
  curl -X GET http://localhost:8000/api/annotations \
    -H "Authorization: Bearer VALID_TOKEN"
done
# Expected: 429 RATE_LIMIT_EXCEEDED after 100 requests
```

### Error Simulation

```python
# Simulate various error conditions for testing
def simulate_error(error_type: str):
    error_responses = {
        'auth_required': {
            'status': 401,
            'body': {
                'detail': 'Authentication required',
                'error_code': 'AUTHENTICATION_REQUIRED'
            }
        },
        'validation_error': {
            'status': 422,
            'body': {
                'detail': 'Validation error',
                'error_code': 'VALIDATION_ERROR',
                'field_errors': {
                    'fluency_score': ['Score must be between 1 and 5']
                }
            }
        }
    }
    
    return error_responses.get(error_type)
```

## Troubleshooting Common Issues

### Authentication Issues

1. **Token Expired**: Refresh token or re-authenticate
2. **Invalid Token**: Check token format and signature
3. **Missing Authorization Header**: Ensure header is included

### Validation Issues

1. **Check Field Requirements**: Verify all required fields are provided
2. **Validate Data Types**: Ensure correct data types (int, string, etc.)
3. **Check Value Ranges**: Verify values are within acceptable ranges

### Rate Limiting

1. **Implement Backoff**: Use exponential backoff for retries
2. **Monitor Usage**: Track API usage patterns
3. **Batch Requests**: Combine multiple operations when possible

### File Upload Issues

1. **Check File Size**: Verify file is under size limit
2. **Validate Format**: Ensure file format is supported
3. **Check Permissions**: Verify user has upload permissions

---

**Last Updated**: January 2024
**API Version**: 1.0.0
**Error Documentation**: Comprehensive error handling guide 