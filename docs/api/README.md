# API Documentation

Welcome to the Lakra API documentation. This guide provides comprehensive information about all available endpoints, request/response formats, and usage examples.

## Base URL

```
http://localhost:8000/api
```

## Authentication

All API endpoints (except registration and login) require authentication using JWT tokens.

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

### Getting a Token

```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
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

## Table of Contents

1. [Authentication Endpoints](#authentication)
2. [User Management](#user-management)
3. [Sentences](#sentences)
4. [Annotations](#annotations)
5. [Evaluations](#evaluations)
6. [MT Quality Assessment](#mt-quality-assessment)
7. [Admin Endpoints](#admin-endpoints)
8. [Onboarding Tests](#onboarding-tests)
9. [File Upload](#file-upload)
10. [Error Handling](#error-handling)

## Authentication

### Register User

Create a new user account.

```http
POST /api/register
```

**Request Body:**
```json
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

**Response:**
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

### Login

Authenticate and receive access token.

```http
POST /api/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
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

## User Management

### Get Current User

Get information about the authenticated user.

```http
GET /api/me
Authorization: Bearer <token>
```

**Response:**
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

### Update Guidelines Seen

Mark annotation guidelines as seen.

```http
PUT /api/me/guidelines-seen
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "guidelines_seen": true
}
```

### Get User Languages

Get user's preferred languages.

```http
GET /api/me/languages
Authorization: Bearer <token>
```

**Response:**
```json
["en", "es", "fr"]
```

### Update User Languages

Update user's preferred languages.

```http
POST /api/me/languages
Authorization: Bearer <token>
```

**Request Body:**
```json
["en", "es", "de"]
```

**Response:**
```json
["en", "es", "de"]
```

## Sentences

### List Sentences

Get a list of sentences for annotation.

```http
GET /api/sentences?skip=0&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `skip` (optional): Number of sentences to skip (default: 0)
- `limit` (optional): Maximum number of sentences to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "source_text": "Hello world",
    "machine_translation": "Hola mundo",
    "source_language": "en",
    "target_language": "es",
    "domain": "general",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true
  }
]
```

### Get Next Sentence

Get the next sentence for annotation.

```http
GET /api/sentences/next
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "source_text": "Hello world",
  "machine_translation": "Hola mundo",
  "source_language": "en",
  "target_language": "es",
  "domain": "general",
  "created_at": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

### Get Unannotated Sentences

Get sentences that haven't been annotated by the user.

```http
GET /api/sentences/unannotated?skip=0&limit=50
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 2,
    "source_text": "Good morning",
    "machine_translation": "Buenos días",
    "source_language": "en",
    "target_language": "es",
    "domain": "general",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true
  }
]
```

### Create Sentence (Admin Only)

Create a new sentence for annotation.

```http
POST /api/sentences
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "source_text": "Hello world",
  "machine_translation": "Hola mundo",
  "source_language": "en",
  "target_language": "es",
  "domain": "general"
}
```

**Response:**
```json
{
  "id": 1,
  "source_text": "Hello world",
  "machine_translation": "Hola mundo",
  "source_language": "en",
  "target_language": "es",
  "domain": "general",
  "created_at": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

## Annotations

### Create Annotation

Create a new annotation for a sentence.

```http
POST /api/annotations
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sentence_id": 1,
  "fluency_score": 4,
  "adequacy_score": 5,
  "overall_quality": 4,
  "comments": "Good translation with minor issues",
  "final_form": "Hola mundo",
  "time_spent_seconds": 300,
  "highlights": [
    {
      "highlighted_text": "world",
      "start_index": 6,
      "end_index": 11,
      "text_type": "machine",
      "comment": "Could be more natural",
      "error_type": "MI_SE"
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "sentence_id": 1,
  "annotator_id": 1,
  "fluency_score": 4,
  "adequacy_score": 5,
  "overall_quality": 4,
  "comments": "Good translation with minor issues",
  "final_form": "Hola mundo",
  "time_spent_seconds": 300,
  "annotation_status": "completed",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "sentence": {
    "id": 1,
    "source_text": "Hello world",
    "machine_translation": "Hola mundo",
    "source_language": "en",
    "target_language": "es"
  },
  "highlights": [
    {
      "id": 1,
      "annotation_id": 1,
      "highlighted_text": "world",
      "start_index": 6,
      "end_index": 11,
      "text_type": "machine",
      "comment": "Could be more natural",
      "error_type": "MI_SE",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Update Annotation

Update an existing annotation.

```http
PUT /api/annotations/{annotation_id}
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fluency_score": 5,
  "adequacy_score": 5,
  "overall_quality": 5,
  "comments": "Excellent translation",
  "annotation_status": "completed"
}
```

### Get My Annotations

Get annotations created by the authenticated user.

```http
GET /api/annotations?skip=0&limit=100
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "sentence_id": 1,
    "annotator_id": 1,
    "fluency_score": 4,
    "adequacy_score": 5,
    "overall_quality": 4,
    "annotation_status": "completed",
    "created_at": "2024-01-01T00:00:00Z",
    "sentence": {
      "id": 1,
      "source_text": "Hello world",
      "machine_translation": "Hola mundo"
    },
    "highlights": []
  }
]
```

### Delete Annotation

Delete an annotation.

```http
DELETE /api/annotations/{annotation_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Annotation deleted successfully"
}
```

## Evaluations

### Create Evaluation

Create an evaluation for an annotation (evaluators only).

```http
POST /api/evaluations
Authorization: Bearer <evaluator_token>
```

**Request Body:**
```json
{
  "annotation_id": 1,
  "annotation_quality_score": 4,
  "accuracy_score": 5,
  "completeness_score": 4,
  "overall_evaluation_score": 4,
  "feedback": "Good annotation with clear explanations",
  "evaluation_notes": "Well-structured annotation",
  "time_spent_seconds": 180
}
```

**Response:**
```json
{
  "id": 1,
  "annotation_id": 1,
  "evaluator_id": 2,
  "annotation_quality_score": 4,
  "accuracy_score": 5,
  "completeness_score": 4,
  "overall_evaluation_score": 4,
  "feedback": "Good annotation with clear explanations",
  "evaluation_notes": "Well-structured annotation",
  "time_spent_seconds": 180,
  "evaluation_status": "completed",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get My Evaluations

Get evaluations created by the authenticated evaluator.

```http
GET /api/evaluations?skip=0&limit=100
Authorization: Bearer <evaluator_token>
```

### Get Pending Evaluations

Get annotations that need evaluation.

```http
GET /api/evaluations/pending?skip=0&limit=50
Authorization: Bearer <evaluator_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "sentence_id": 1,
    "annotator_id": 1,
    "annotation_status": "completed",
    "created_at": "2024-01-01T00:00:00Z",
    "sentence": {
      "id": 1,
      "source_text": "Hello world",
      "machine_translation": "Hola mundo"
    }
  }
]
```

## MT Quality Assessment

### Create MT Quality Assessment

Create an AI-powered quality assessment for a sentence.

```http
POST /api/mt-quality/assess
Authorization: Bearer <evaluator_token>
```

**Request Body:**
```json
{
  "sentence_id": 1,
  "human_feedback": "The AI assessment seems accurate",
  "correction_notes": "No major corrections needed",
  "time_spent_seconds": 120
}
```

**Response:**
```json
{
  "id": 1,
  "sentence_id": 1,
  "evaluator_id": 2,
  "fluency_score": 4.2,
  "adequacy_score": 4.8,
  "overall_quality_score": 4.5,
  "syntax_errors": [],
  "semantic_errors": [],
  "quality_explanation": "The translation is generally accurate with good fluency.",
  "correction_suggestions": ["Consider using more natural phrasing"],
  "model_confidence": 0.85,
  "processing_time_ms": 150,
  "human_feedback": "The AI assessment seems accurate",
  "evaluation_status": "completed",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Get Pending MT Assessments

Get sentences that need MT quality assessment.

```http
GET /api/mt-quality/pending?skip=0&limit=50
Authorization: Bearer <evaluator_token>
```

### Get My MT Assessments

Get MT quality assessments created by the authenticated evaluator.

```http
GET /api/mt-quality/my-assessments?skip=0&limit=100
Authorization: Bearer <evaluator_token>
```

### Get MT Assessment Statistics

Get statistics for MT quality assessments.

```http
GET /api/mt-quality/stats
Authorization: Bearer <evaluator_token>
```

**Response:**
```json
{
  "total_assessments": 150,
  "completed_assessments": 140,
  "pending_assessments": 10,
  "average_time_per_assessment": 180.5,
  "average_fluency_score": 4.2,
  "average_adequacy_score": 4.3,
  "average_overall_score": 4.25,
  "total_syntax_errors_found": 45,
  "total_semantic_errors_found": 32,
  "average_model_confidence": 0.82,
  "human_agreement_rate": 0.78
}
```

## Admin Endpoints

### Get Admin Statistics

Get system-wide statistics (admin only).

```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "total_users": 25,
  "total_sentences": 1000,
  "total_annotations": 2500,
  "completed_annotations": 2300,
  "active_users": 20
}
```

### Get All Users

Get list of all users (admin only).

```http
GET /api/admin/users?skip=0&limit=100
Authorization: Bearer <admin_token>
```

### Toggle User Evaluator Role

Toggle evaluator role for a user (admin only).

```http
PUT /api/admin/users/{user_id}/toggle-evaluator
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "is_evaluator": true,
  "message": "User evaluator role updated"
}
```

### Bulk Create Sentences

Create multiple sentences at once (admin only).

```http
POST /api/admin/sentences/bulk
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
[
  {
    "source_text": "Hello world",
    "machine_translation": "Hola mundo",
    "source_language": "en",
    "target_language": "es",
    "domain": "general"
  },
  {
    "source_text": "Good morning",
    "machine_translation": "Buenos días",
    "source_language": "en",
    "target_language": "es",
    "domain": "greetings"
  }
]
```

## Onboarding Tests

### Create Onboarding Test

Create a new onboarding test for a user.

```http
POST /api/onboarding-tests
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "language": "es"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "language": "es",
  "test_data": {
    "questions": [
      {
        "id": "q1",
        "source_text": "Hello world",
        "machine_translation": "Hola mundo",
        "source_language": "en",
        "target_language": "es",
        "correct_fluency_score": 5,
        "correct_adequacy_score": 5,
        "error_types": [],
        "explanation": "This is a perfect translation"
      }
    ]
  },
  "score": null,
  "status": "in_progress",
  "started_at": "2024-01-01T00:00:00Z",
  "completed_at": null
}
```

### Submit Onboarding Test

Submit answers for an onboarding test.

```http
POST /api/onboarding-tests/{test_id}/submit
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "test_id": 1,
  "answers": [
    {
      "question_id": "q1",
      "fluency_score": 5,
      "adequacy_score": 5,
      "error_types": [],
      "explanation": "Perfect translation"
    }
  ]
}
```

**Response:**
```json
{
  "score": 95.0,
  "status": "completed",
  "passed": true,
  "message": "Congratulations! You passed the onboarding test."
}
```

### Get My Onboarding Tests

Get onboarding tests for the authenticated user.

```http
GET /api/onboarding-tests/my-tests
Authorization: Bearer <token>
```

## File Upload

### Upload Voice Recording

Upload a voice recording for an annotation.

```http
POST /api/annotations/upload-voice
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `audio_file`: Audio file (required)
- `annotation_id`: Annotation ID (optional)

**Response:**
```json
{
  "message": "Voice recording uploaded successfully",
  "file_url": "/uploads/audio/recording_123456.wav",
  "duration": 15
}
```

## Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### Error Response Format

```json
{
  "detail": "Error message description",
  "error_code": "SPECIFIC_ERROR_CODE",
  "field_errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Common Error Codes

- `AUTHENTICATION_FAILED`: Invalid credentials
- `TOKEN_EXPIRED`: JWT token has expired
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `VALIDATION_ERROR`: Request data validation failed
- `DUPLICATE_RESOURCE`: Resource already exists
- `ONBOARDING_REQUIRED`: User must complete onboarding first

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **File upload**: 5 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Window reset time

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum items to return (default: 100, max: 1000)

**Response Headers:**
- `X-Total-Count`: Total number of items
- `X-Page-Count`: Number of pages
- `X-Current-Page`: Current page number

---

For more detailed information about specific endpoints, authentication, or error handling, please refer to the individual documentation sections or contact the development team. 