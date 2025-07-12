# Admin API Documentation

## Overview

This document provides detailed information about administrative endpoints in the Lakra API. These endpoints are restricted to users with administrative privileges and provide system management capabilities.

## Authentication

All admin endpoints require authentication with administrator privileges. Include the JWT token in the Authorization header:

```
Authorization: Bearer <admin_token>
```

## Base URL

```
http://localhost:8000/api
```

## User Management

### Get All Users

Retrieve a list of all users in the system.

```http
GET /api/admin/users
```

**Query Parameters:**
- `skip`: Integer, default 0 (pagination offset)
- `limit`: Integer, default 100, max 1000 (pagination limit)
- `role`: String, optional filter by role ("admin", "evaluator", "annotator")
- `active`: Boolean, optional filter by active status
- `search`: String, optional search by username or email
- `created_after`: ISO datetime, optional filter by creation date
- `created_before`: ISO datetime, optional filter by creation date

**Example Request:**
```http
GET /api/admin/users?skip=0&limit=50&role=evaluator&active=true&search=john
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 123,
      "email": "john.doe@example.com",
      "username": "john_doe",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true,
      "is_admin": false,
      "is_evaluator": true,
      "guidelines_seen": true,
      "onboarding_status": "completed",
      "onboarding_score": 85.5,
      "onboarding_completed_at": "2024-01-10T14:30:00Z",
      "created_at": "2024-01-05T10:00:00Z",
      "languages": ["en", "es", "fil"],
      "annotation_count": 45,
      "evaluation_count": 23,
      "last_login": "2024-01-15T09:30:00Z"
    }
  ],
  "total_count": 25,
  "page_count": 1,
  "current_page": 1,
  "has_next": false,
  "has_previous": false
}
```

### Get User Details

Get detailed information about a specific user.

```http
GET /api/admin/users/{user_id}
```

**Path Parameters:**
- `user_id`: Integer, required

**Response (200 OK):**
```json
{
  "id": 123,
  "email": "john.doe@example.com",
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "is_admin": false,
  "is_evaluator": true,
  "guidelines_seen": true,
  "onboarding_status": "completed",
  "onboarding_score": 85.5,
  "onboarding_completed_at": "2024-01-10T14:30:00Z",
  "created_at": "2024-01-05T10:00:00Z",
  "languages": ["en", "es", "fil"],
  "statistics": {
    "annotation_count": 45,
    "evaluation_count": 23,
    "average_annotation_quality": 4.2,
    "average_evaluation_score": 4.1,
    "total_time_spent": 54000,
    "last_activity": "2024-01-15T09:30:00Z"
  },
  "recent_annotations": [
    {
      "id": 456,
      "sentence_id": 12,
      "overall_quality": 4,
      "created_at": "2024-01-15T08:00:00Z"
    }
  ],
  "recent_evaluations": [
    {
      "id": 789,
      "annotation_id": 234,
      "overall_evaluation_score": 4,
      "created_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

### Create User

Create a new user account.

```http
POST /api/admin/users
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "secure_password123",
  "first_name": "New",
  "last_name": "User",
  "is_active": true,
  "is_evaluator": false,
  "languages": ["en", "es"],
  "skip_onboarding": false
}
```

**Response (201 Created):**
```json
{
  "id": 124,
  "email": "newuser@example.com",
  "username": "newuser",
  "first_name": "New",
  "last_name": "User",
  "is_active": true,
  "is_admin": false,
  "is_evaluator": false,
  "guidelines_seen": false,
  "onboarding_status": "pending",
  "created_at": "2024-01-15T15:00:00Z",
  "languages": ["en", "es"],
  "temporary_password": "secure_password123"
}
```

### Update User

Update an existing user account.

```http
PUT /api/admin/users/{user_id}
```

**Path Parameters:**
- `user_id`: Integer, required

**Request Body:**
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "is_active": true,
  "is_evaluator": true,
  "languages": ["en", "es", "fil"]
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "email": "john.doe@example.com",
  "username": "john_doe",
  "first_name": "Updated",
  "last_name": "Name",
  "is_active": true,
  "is_admin": false,
  "is_evaluator": true,
  "languages": ["en", "es", "fil"],
  "updated_at": "2024-01-15T15:30:00Z"
}
```

### Toggle User Evaluator Role

Toggle evaluator privileges for a user.

```http
PUT /api/admin/users/{user_id}/toggle-evaluator
```

**Path Parameters:**
- `user_id`: Integer, required

**Response (200 OK):**
```json
{
  "id": 123,
  "email": "john.doe@example.com",
  "username": "john_doe",
  "is_evaluator": true,
  "message": "User evaluator role updated successfully"
}
```

### Deactivate User

Deactivate a user account.

```http
PUT /api/admin/users/{user_id}/deactivate
```

**Path Parameters:**
- `user_id`: Integer, required

**Request Body:**
```json
{
  "reason": "User requested account deactivation",
  "notify_user": true
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "username": "john_doe",
  "is_active": false,
  "deactivated_at": "2024-01-15T16:00:00Z",
  "deactivation_reason": "User requested account deactivation"
}
```

### Reset User Password

Reset a user's password.

```http
POST /api/admin/users/{user_id}/reset-password
```

**Path Parameters:**
- `user_id`: Integer, required

**Request Body:**
```json
{
  "new_password": "new_secure_password123",
  "force_change": true,
  "notify_user": true
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "username": "john_doe",
  "password_reset": true,
  "force_change_on_login": true,
  "reset_at": "2024-01-15T16:30:00Z",
  "message": "Password reset successfully"
}
```

## Content Management

### Get All Sentences

Retrieve all sentences in the system.

```http
GET /api/admin/sentences
```

**Query Parameters:**
- `skip`: Integer, default 0 (pagination offset)
- `limit`: Integer, default 100, max 1000 (pagination limit)
- `language_pair`: String, optional filter by language pair (e.g., "en-es")
- `domain`: String, optional filter by domain
- `active`: Boolean, optional filter by active status
- `search`: String, optional search in source text

**Response (200 OK):**
```json
{
  "sentences": [
    {
      "id": 1,
      "source_text": "This is a good translation",
      "machine_translation": "Esta es una buena traducción",
      "source_language": "en",
      "target_language": "es",
      "domain": "general",
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "annotation_count": 5,
      "evaluation_count": 3,
      "average_quality": 4.2
    }
  ],
  "total_count": 150,
  "page_count": 2,
  "current_page": 1
}
```

### Create Sentence

Create a new sentence for annotation.

```http
POST /api/admin/sentences
```

**Request Body:**
```json
{
  "source_text": "This is a test sentence",
  "machine_translation": "Esta es una oración de prueba",
  "source_language": "en",
  "target_language": "es",
  "domain": "general",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "id": 151,
  "source_text": "This is a test sentence",
  "machine_translation": "Esta es una oración de prueba",
  "source_language": "en",
  "target_language": "es",
  "domain": "general",
  "is_active": true,
  "created_at": "2024-01-15T17:00:00Z"
}
```

### Bulk Create Sentences

Create multiple sentences at once.

```http
POST /api/admin/sentences/bulk
```

**Request Body:**
```json
{
  "sentences": [
    {
      "source_text": "First sentence",
      "machine_translation": "Primera oración",
      "source_language": "en",
      "target_language": "es",
      "domain": "general"
    },
    {
      "source_text": "Second sentence",
      "machine_translation": "Segunda oración",
      "source_language": "en",
      "target_language": "es",
      "domain": "general"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "created_sentences": [
    {
      "id": 152,
      "source_text": "First sentence",
      "status": "created"
    },
    {
      "id": 153,
      "source_text": "Second sentence",
      "status": "created"
    }
  ],
  "total_created": 2,
  "errors": []
}
```

### Update Sentence

Update an existing sentence.

```http
PUT /api/admin/sentences/{sentence_id}
```

**Path Parameters:**
- `sentence_id`: Integer, required

**Request Body:**
```json
{
  "source_text": "Updated sentence text",
  "machine_translation": "Texto de oración actualizado",
  "domain": "technical",
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "source_text": "Updated sentence text",
  "machine_translation": "Texto de oración actualizado",
  "source_language": "en",
  "target_language": "es",
  "domain": "technical",
  "is_active": false,
  "updated_at": "2024-01-15T17:30:00Z"
}
```

### Delete Sentence

Delete a sentence from the system.

```http
DELETE /api/admin/sentences/{sentence_id}
```

**Path Parameters:**
- `sentence_id`: Integer, required

**Response (204 No Content):**
```
No response body
```

**Note:** This will also delete all associated annotations and evaluations.

## System Statistics

### Get System Statistics

Get comprehensive system statistics.

```http
GET /api/admin/stats
```

**Response (200 OK):**
```json
{
  "users": {
    "total": 50,
    "active": 45,
    "annotators": 35,
    "evaluators": 10,
    "admins": 5,
    "new_this_week": 3,
    "new_this_month": 12
  },
  "content": {
    "total_sentences": 500,
    "active_sentences": 480,
    "language_pairs": {
      "en-es": 250,
      "en-fil": 200,
      "es-fil": 50
    },
    "domains": {
      "general": 300,
      "technical": 150,
      "medical": 50
    }
  },
  "annotations": {
    "total": 2500,
    "completed": 2300,
    "in_progress": 150,
    "draft": 50,
    "this_week": 180,
    "this_month": 750,
    "average_quality": 4.1,
    "average_time_per_annotation": 1200
  },
  "evaluations": {
    "total": 1800,
    "completed": 1750,
    "in_progress": 50,
    "this_week": 120,
    "this_month": 480,
    "average_score": 4.2,
    "average_time_per_evaluation": 300
  },
  "system_health": {
    "uptime": "15 days, 6 hours",
    "last_restart": "2024-01-01T00:00:00Z",
    "database_size": "250 MB",
    "storage_used": "1.2 GB",
    "active_sessions": 25
  }
}
```

### Get User Statistics

Get detailed statistics about users.

```http
GET /api/admin/stats/users
```

**Query Parameters:**
- `time_range`: String, optional - "week", "month", "quarter", "year"
- `user_type`: String, optional - "annotator", "evaluator", "admin"

**Response (200 OK):**
```json
{
  "user_metrics": {
    "total_users": 50,
    "active_users": 45,
    "new_registrations": {
      "this_week": 3,
      "this_month": 12,
      "this_quarter": 28
    },
    "user_retention": {
      "7_day": 0.85,
      "30_day": 0.72,
      "90_day": 0.68
    }
  },
  "role_distribution": {
    "annotators": 35,
    "evaluators": 10,
    "admins": 5
  },
  "activity_metrics": {
    "daily_active_users": 25,
    "weekly_active_users": 38,
    "monthly_active_users": 45
  },
  "onboarding_metrics": {
    "completed_onboarding": 42,
    "pending_onboarding": 8,
    "average_onboarding_score": 82.5,
    "onboarding_pass_rate": 0.88
  }
}
```

### Get Annotation Statistics

Get detailed statistics about annotations.

```http
GET /api/admin/stats/annotations
```

**Query Parameters:**
- `time_range`: String, optional - "week", "month", "quarter", "year"
- `language_pair`: String, optional filter by language pair
- `domain`: String, optional filter by domain

**Response (200 OK):**
```json
{
  "annotation_metrics": {
    "total_annotations": 2500,
    "completed_annotations": 2300,
    "completion_rate": 0.92,
    "average_quality_scores": {
      "fluency": 4.2,
      "adequacy": 4.1,
      "overall": 4.0
    },
    "time_metrics": {
      "average_time_per_annotation": 1200,
      "median_time_per_annotation": 900,
      "total_time_spent": 3000000
    }
  },
  "quality_distribution": {
    "score_1": 50,
    "score_2": 200,
    "score_3": 600,
    "score_4": 1000,
    "score_5": 650
  },
  "error_analysis": {
    "total_errors_identified": 5000,
    "error_types": {
      "MI_ST": 2000,
      "MI_SE": 1500,
      "MA_ST": 1000,
      "MA_SE": 500
    }
  },
  "productivity_metrics": {
    "annotations_per_day": 125,
    "annotations_per_user": 50,
    "peak_hours": ["10:00-11:00", "14:00-15:00"]
  }
}
```

### Get Evaluation Statistics

Get detailed statistics about evaluations.

```http
GET /api/admin/stats/evaluations
```

**Response (200 OK):**
```json
{
  "evaluation_metrics": {
    "total_evaluations": 1800,
    "completed_evaluations": 1750,
    "evaluation_coverage": 0.76,
    "average_evaluation_scores": {
      "annotation_quality": 4.2,
      "accuracy": 4.3,
      "completeness": 4.1,
      "overall": 4.2
    },
    "time_metrics": {
      "average_time_per_evaluation": 300,
      "median_time_per_evaluation": 240,
      "total_time_spent": 540000
    }
  },
  "evaluator_performance": {
    "total_evaluators": 10,
    "active_evaluators": 8,
    "evaluations_per_evaluator": 180,
    "consistency_score": 0.85
  },
  "feedback_metrics": {
    "total_feedback_given": 1600,
    "average_feedback_length": 150,
    "feedback_helpfulness": 4.3
  }
}
```

## System Management

### Get System Health

Get current system health status.

```http
GET /api/admin/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T18:00:00Z",
  "uptime": "15 days, 6 hours, 30 minutes",
  "version": "1.0.0",
  "components": {
    "database": {
      "status": "healthy",
      "response_time": "2ms",
      "connections": 15,
      "max_connections": 100
    },
    "file_system": {
      "status": "healthy",
      "disk_usage": "35%",
      "free_space": "15.2 GB"
    },
    "memory": {
      "status": "healthy",
      "usage": "2.1 GB",
      "available": "6.2 GB"
    },
    "api": {
      "status": "healthy",
      "response_time": "45ms",
      "requests_per_minute": 150
    }
  }
}
```

### Get System Logs

Get system logs for debugging and monitoring.

```http
GET /api/admin/logs
```

**Query Parameters:**
- `level`: String, optional - "ERROR", "WARNING", "INFO", "DEBUG"
- `start_time`: ISO datetime, optional filter by start time
- `end_time`: ISO datetime, optional filter by end time
- `limit`: Integer, default 100, max 1000

**Response (200 OK):**
```json
{
  "logs": [
    {
      "timestamp": "2024-01-15T17:55:00Z",
      "level": "INFO",
      "message": "User john_doe created annotation 456",
      "module": "annotations",
      "user_id": 123,
      "ip_address": "192.168.1.100"
    },
    {
      "timestamp": "2024-01-15T17:54:30Z",
      "level": "WARNING",
      "message": "Slow database query detected",
      "module": "database",
      "query_time": "2.5s",
      "query": "SELECT * FROM annotations WHERE..."
    }
  ],
  "total_count": 1500,
  "log_levels": {
    "ERROR": 5,
    "WARNING": 25,
    "INFO": 1400,
    "DEBUG": 70
  }
}
```

### Update System Configuration

Update system configuration settings.

```http
PUT /api/admin/config
```

**Request Body:**
```json
{
  "max_annotations_per_user": 200,
  "annotation_timeout_minutes": 60,
  "evaluation_timeout_minutes": 30,
  "enable_voice_recording": true,
  "max_file_size_mb": 10,
  "onboarding_required": true,
  "onboarding_pass_threshold": 80
}
```

**Response (200 OK):**
```json
{
  "configuration": {
    "max_annotations_per_user": 200,
    "annotation_timeout_minutes": 60,
    "evaluation_timeout_minutes": 30,
    "enable_voice_recording": true,
    "max_file_size_mb": 10,
    "onboarding_required": true,
    "onboarding_pass_threshold": 80
  },
  "updated_at": "2024-01-15T18:30:00Z",
  "message": "Configuration updated successfully"
}
```

## Data Management

### Export System Data

Export system data for backup or analysis.

```http
POST /api/admin/export
```

**Request Body:**
```json
{
  "data_types": ["users", "annotations", "evaluations", "sentences"],
  "format": "json",
  "date_range": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "include_inactive": false
}
```

**Response (202 Accepted):**
```json
{
  "export_id": "export_20240115_183000",
  "status": "processing",
  "created_at": "2024-01-15T18:30:00Z",
  "estimated_completion": "2024-01-15T18:35:00Z",
  "download_url": null
}
```

### Get Export Status

Check the status of a data export.

```http
GET /api/admin/export/{export_id}
```

**Path Parameters:**
- `export_id`: String, required

**Response (200 OK):**
```json
{
  "export_id": "export_20240115_183000",
  "status": "completed",
  "created_at": "2024-01-15T18:30:00Z",
  "completed_at": "2024-01-15T18:34:00Z",
  "file_size": "15.2 MB",
  "record_count": 25000,
  "download_url": "/api/admin/export/export_20240115_183000/download",
  "expires_at": "2024-01-22T18:34:00Z"
}
```

### Import System Data

Import data into the system.

```http
POST /api/admin/import
```

**Request:**
```
Content-Type: multipart/form-data

Form Data:
- file: File (required) - Data file to import
- data_type: String (required) - "sentences", "users", "annotations"
- format: String (required) - "json", "csv", "xml"
- update_existing: Boolean (optional) - Whether to update existing records
```

**Response (202 Accepted):**
```json
{
  "import_id": "import_20240115_184000",
  "status": "processing",
  "created_at": "2024-01-15T18:40:00Z",
  "estimated_completion": "2024-01-15T18:45:00Z",
  "file_size": "5.2 MB",
  "preview": {
    "total_records": 1000,
    "valid_records": 980,
    "invalid_records": 20
  }
}
```

### Database Maintenance

Perform database maintenance operations.

```http
POST /api/admin/maintenance
```

**Request Body:**
```json
{
  "operations": ["optimize", "vacuum", "reindex"],
  "backup_before": true,
  "notify_users": false
}
```

**Response (202 Accepted):**
```json
{
  "maintenance_id": "maint_20240115_185000",
  "status": "processing",
  "operations": ["optimize", "vacuum", "reindex"],
  "started_at": "2024-01-15T18:50:00Z",
  "estimated_completion": "2024-01-15T19:00:00Z"
}
```

## Security and Audit

### Get Audit Logs

Get audit logs for security monitoring.

```http
GET /api/admin/audit
```

**Query Parameters:**
- `start_time`: ISO datetime, optional filter by start time
- `end_time`: ISO datetime, optional filter by end time
- `user_id`: Integer, optional filter by user
- `action`: String, optional filter by action type
- `limit`: Integer, default 100, max 1000

**Response (200 OK):**
```json
{
  "audit_logs": [
    {
      "id": 1001,
      "timestamp": "2024-01-15T18:00:00Z",
      "user_id": 123,
      "username": "john_doe",
      "action": "LOGIN",
      "resource_type": "user",
      "resource_id": 123,
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "success": true,
      "details": {
        "login_method": "password",
        "session_id": "sess_abc123"
      }
    },
    {
      "id": 1002,
      "timestamp": "2024-01-15T18:05:00Z",
      "user_id": 456,
      "username": "admin_user",
      "action": "USER_CREATED",
      "resource_type": "user",
      "resource_id": 789,
      "ip_address": "192.168.1.101",
      "success": true,
      "details": {
        "created_user": "newuser@example.com",
        "assigned_role": "annotator"
      }
    }
  ],
  "total_count": 5000,
  "summary": {
    "total_actions": 5000,
    "successful_actions": 4950,
    "failed_actions": 50,
    "unique_users": 45,
    "most_common_actions": [
      "LOGIN",
      "ANNOTATION_CREATED",
      "EVALUATION_CREATED"
    ]
  }
}
```

### Get Security Report

Get security analysis report.

```http
GET /api/admin/security/report
```

**Response (200 OK):**
```json
{
  "security_summary": {
    "risk_level": "low",
    "last_scan": "2024-01-15T18:00:00Z",
    "vulnerabilities_found": 0,
    "recommendations": []
  },
  "authentication_metrics": {
    "failed_login_attempts": 15,
    "suspicious_activities": 2,
    "password_strength": {
      "weak": 5,
      "medium": 25,
      "strong": 20
    }
  },
  "access_patterns": {
    "unusual_access_times": 3,
    "multiple_ip_addresses": 8,
    "high_frequency_users": 5
  },
  "data_protection": {
    "encryption_status": "enabled",
    "backup_encryption": "enabled",
    "data_retention_compliance": "compliant"
  }
}
```

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "detail": "Administrator privileges required",
  "error_code": "ADMIN_REQUIRED"
}
```

**403 Forbidden:**
```json
{
  "detail": "Cannot perform this action",
  "error_code": "INSUFFICIENT_PERMISSIONS"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found",
  "error_code": "RESOURCE_NOT_FOUND"
}
```

**409 Conflict:**
```json
{
  "detail": "User already exists",
  "error_code": "USER_EXISTS"
}
```

### Error Codes

| Error Code | Description |
|------------|-------------|
| `ADMIN_REQUIRED` | Administrator privileges required |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `USER_EXISTS` | User already exists |
| `INVALID_CONFIGURATION` | Configuration data is invalid |
| `MAINTENANCE_IN_PROGRESS` | System maintenance in progress |
| `EXPORT_FAILED` | Data export operation failed |
| `IMPORT_FAILED` | Data import operation failed |

## Rate Limiting

Admin endpoints have higher rate limits:
- **General endpoints**: 200 requests per minute
- **User management**: 100 requests per minute
- **Bulk operations**: 20 requests per minute
- **Export/Import**: 5 requests per minute

## Testing

### Example Test Cases

```bash
# Get all users
curl -X GET "http://localhost:8000/api/admin/users?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create user
curl -X POST http://localhost:8000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "secure_password123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Get system statistics
curl -X GET http://localhost:8000/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Toggle evaluator role
curl -X PUT http://localhost:8000/api/admin/users/123/toggle-evaluator \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

**Last Updated**: January 2024
**API Version**: 1.0.0
**Admin Endpoints**: Comprehensive system administration API 