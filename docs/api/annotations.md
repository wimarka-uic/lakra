# Annotations API Documentation

## Overview

This document provides detailed information about annotation-related endpoints in the Lakra API. These endpoints allow users to create, read, update, and manage annotations for machine translation quality assessment.

## Authentication

All annotation endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Base URL

```
http://localhost:8000/api
```

## Annotation Endpoints

### Create Annotation

Create a new annotation for a sentence.

```http
POST /api/annotations
```

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sentence_id": 1,
  "fluency_score": 4,
  "adequacy_score": 5,
  "overall_quality": 4,
  "comments": "Good translation with minor grammatical issues",
  "final_form": "Esta es una buena traducción",
  "time_spent_seconds": 1200,
  "annotation_status": "completed",
  "highlights": [
    {
      "highlighted_text": "es",
      "start_index": 5,
      "end_index": 7,
      "text_type": "machine",
      "comment": "Minor grammatical issue with verb agreement",
      "error_type": "MI_ST"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": 123,
  "sentence_id": 1,
  "annotator_id": 456,
  "fluency_score": 4,
  "adequacy_score": 5,
  "overall_quality": 4,
  "comments": "Good translation with minor grammatical issues",
  "final_form": "Esta es una buena traducción",
  "time_spent_seconds": 1200,
  "annotation_status": "completed",
  "voice_recording_url": null,
  "voice_recording_duration": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "sentence": {
    "id": 1,
    "source_text": "This is a good translation",
    "machine_translation": "Esta es una buena traducción",
    "source_language": "en",
    "target_language": "es",
    "domain": "general"
  },
  "highlights": [
    {
      "id": 789,
      "annotation_id": 123,
      "highlighted_text": "es",
      "start_index": 5,
      "end_index": 7,
      "text_type": "machine",
      "comment": "Minor grammatical issue with verb agreement",
      "error_type": "MI_ST",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Validation Rules:**
- `sentence_id`: Required, must exist in database
- `fluency_score`: Required, integer 1-5
- `adequacy_score`: Required, integer 1-5
- `overall_quality`: Required, integer 1-5
- `comments`: Optional, maximum 2000 characters
- `final_form`: Optional, maximum 1000 characters
- `time_spent_seconds`: Optional, positive integer
- `annotation_status`: Optional, one of: "draft", "in_progress", "completed"

### Get Annotation

Retrieve a specific annotation by ID.

```http
GET /api/annotations/{annotation_id}
```

**Path Parameters:**
- `annotation_id`: Integer, required

**Response (200 OK):**
```json
{
  "id": 123,
  "sentence_id": 1,
  "annotator_id": 456,
  "fluency_score": 4,
  "adequacy_score": 5,
  "overall_quality": 4,
  "comments": "Good translation with minor grammatical issues",
  "final_form": "Esta es una buena traducción",
  "time_spent_seconds": 1200,
  "annotation_status": "completed",
  "voice_recording_url": "/uploads/audio/annotation_123.wav",
  "voice_recording_duration": 45,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "sentence": {
    "id": 1,
    "source_text": "This is a good translation",
    "machine_translation": "Esta es una buena traducción",
    "source_language": "en",
    "target_language": "es",
    "domain": "general"
  },
  "highlights": [
    {
      "id": 789,
      "annotation_id": 123,
      "highlighted_text": "es",
      "start_index": 5,
      "end_index": 7,
      "text_type": "machine",
      "comment": "Minor grammatical issue with verb agreement",
      "error_type": "MI_ST",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Update Annotation

Update an existing annotation.

```http
PUT /api/annotations/{annotation_id}
```

**Path Parameters:**
- `annotation_id`: Integer, required

**Request Body:**
```json
{
  "fluency_score": 5,
  "adequacy_score": 5,
  "overall_quality": 5,
  "comments": "Excellent translation after reconsideration",
  "final_form": "Esta es una excelente traducción",
  "annotation_status": "completed"
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "sentence_id": 1,
  "annotator_id": 456,
  "fluency_score": 5,
  "adequacy_score": 5,
  "overall_quality": 5,
  "comments": "Excellent translation after reconsideration",
  "final_form": "Esta es una excelente traducción",
  "time_spent_seconds": 1200,
  "annotation_status": "completed",
  "updated_at": "2024-01-15T11:00:00Z",
  "sentence": {
    "id": 1,
    "source_text": "This is a good translation",
    "machine_translation": "Esta es una buena traducción",
    "source_language": "en",
    "target_language": "es"
  }
}
```

**Access Control:**
- Only the annotation creator can update their own annotations
- Admins can update any annotation

### List My Annotations

Get annotations created by the authenticated user.

```http
GET /api/annotations
```

**Query Parameters:**
- `skip`: Integer, default 0 (pagination offset)
- `limit`: Integer, default 100, max 1000 (pagination limit)
- `status`: String, optional filter by annotation status
- `sentence_id`: Integer, optional filter by sentence ID
- `created_after`: ISO datetime, optional filter by creation date
- `created_before`: ISO datetime, optional filter by creation date

**Example Request:**
```http
GET /api/annotations?skip=0&limit=50&status=completed&created_after=2024-01-01T00:00:00Z
```

**Response (200 OK):**
```json
{
  "annotations": [
    {
      "id": 123,
      "sentence_id": 1,
      "annotator_id": 456,
      "fluency_score": 4,
      "adequacy_score": 5,
      "overall_quality": 4,
      "annotation_status": "completed",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "sentence": {
        "id": 1,
        "source_text": "This is a good translation",
        "machine_translation": "Esta es una buena traducción",
        "source_language": "en",
        "target_language": "es",
        "domain": "general"
      },
      "highlights_count": 2,
      "has_voice_recording": true
    }
  ],
  "total_count": 150,
  "page_count": 3,
  "current_page": 1,
  "has_next": true,
  "has_previous": false
}
```

**Response Headers:**
```
X-Total-Count: 150
X-Page-Count: 3
X-Current-Page: 1
```

### Delete Annotation

Delete a specific annotation.

```http
DELETE /api/annotations/{annotation_id}
```

**Path Parameters:**
- `annotation_id`: Integer, required

**Response (204 No Content):**
```
No response body
```

**Access Control:**
- Only the annotation creator can delete their own annotations
- Admins can delete any annotation
- Cannot delete annotations that have been evaluated

### Get Annotation Statistics

Get statistics for the authenticated user's annotations.

```http
GET /api/annotations/stats
```

**Response (200 OK):**
```json
{
  "total_annotations": 25,
  "completed_annotations": 22,
  "draft_annotations": 3,
  "average_fluency_score": 4.2,
  "average_adequacy_score": 4.1,
  "average_overall_quality": 4.0,
  "total_time_spent_seconds": 36000,
  "average_time_per_annotation": 1440,
  "annotations_this_week": 8,
  "annotations_this_month": 25,
  "error_distribution": {
    "MI_ST": 15,
    "MI_SE": 12,
    "MA_ST": 8,
    "MA_SE": 5
  },
  "language_pairs": {
    "en-es": 20,
    "en-fil": 5
  },
  "domain_distribution": {
    "general": 15,
    "technical": 6,
    "medical": 4
  }
}
```

## Text Highlights Endpoints

### Add Text Highlight

Add a text highlight to an existing annotation.

```http
POST /api/annotations/{annotation_id}/highlights
```

**Path Parameters:**
- `annotation_id`: Integer, required

**Request Body:**
```json
{
  "highlighted_text": "buena",
  "start_index": 12,
  "end_index": 17,
  "text_type": "machine",
  "comment": "Word choice could be improved",
  "error_type": "MI_SE"
}
```

**Response (201 Created):**
```json
{
  "id": 790,
  "annotation_id": 123,
  "highlighted_text": "buena",
  "start_index": 12,
  "end_index": 17,
  "text_type": "machine",
  "comment": "Word choice could be improved",
  "error_type": "MI_SE",
  "created_at": "2024-01-15T11:15:00Z"
}
```

### Update Text Highlight

Update a specific text highlight.

```http
PUT /api/annotations/{annotation_id}/highlights/{highlight_id}
```

**Path Parameters:**
- `annotation_id`: Integer, required
- `highlight_id`: Integer, required

**Request Body:**
```json
{
  "comment": "Updated comment about word choice",
  "error_type": "MI_ST"
}
```

**Response (200 OK):**
```json
{
  "id": 790,
  "annotation_id": 123,
  "highlighted_text": "buena",
  "start_index": 12,
  "end_index": 17,
  "text_type": "machine",
  "comment": "Updated comment about word choice",
  "error_type": "MI_ST",
  "created_at": "2024-01-15T11:15:00Z"
}
```

### Delete Text Highlight

Delete a specific text highlight.

```http
DELETE /api/annotations/{annotation_id}/highlights/{highlight_id}
```

**Path Parameters:**
- `annotation_id`: Integer, required
- `highlight_id`: Integer, required

**Response (204 No Content):**
```
No response body
```

### List Text Highlights

Get all text highlights for a specific annotation.

```http
GET /api/annotations/{annotation_id}/highlights
```

**Path Parameters:**
- `annotation_id`: Integer, required

**Response (200 OK):**
```json
[
  {
    "id": 789,
    "annotation_id": 123,
    "highlighted_text": "es",
    "start_index": 5,
    "end_index": 7,
    "text_type": "machine",
    "comment": "Minor grammatical issue with verb agreement",
    "error_type": "MI_ST",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 790,
    "annotation_id": 123,
    "highlighted_text": "buena",
    "start_index": 12,
    "end_index": 17,
    "text_type": "machine",
    "comment": "Word choice could be improved",
    "error_type": "MI_SE",
    "created_at": "2024-01-15T11:15:00Z"
  }
]
```

## Voice Recording Endpoints

### Upload Voice Recording

Upload a voice recording for an annotation.

```http
POST /api/annotations/{annotation_id}/voice-recording
```

**Path Parameters:**
- `annotation_id`: Integer, required

**Request:**
```
Content-Type: multipart/form-data

Form Data:
- audio_file: File (required) - Audio file (WAV, MP3, OGG, M4A)
- description: String (optional) - Description of the recording
```

**Response (200 OK):**
```json
{
  "message": "Voice recording uploaded successfully",
  "voice_recording_url": "/uploads/audio/annotation_123.wav",
  "voice_recording_duration": 45,
  "file_size": 2048576,
  "format": "wav"
}
```

**File Restrictions:**
- Maximum file size: 10MB
- Supported formats: WAV, MP3, OGG, M4A
- Maximum duration: 5 minutes

### Get Voice Recording

Download or stream a voice recording.

```http
GET /api/annotations/{annotation_id}/voice-recording
```

**Path Parameters:**
- `annotation_id`: Integer, required

**Response (200 OK):**
```
Content-Type: audio/wav
Content-Length: 2048576
Content-Disposition: attachment; filename="annotation_123.wav"

[Binary audio data]
```

### Delete Voice Recording

Delete a voice recording from an annotation.

```http
DELETE /api/annotations/{annotation_id}/voice-recording
```

**Path Parameters:**
- `annotation_id`: Integer, required

**Response (204 No Content):**
```
No response body
```

## Batch Operations

### Create Multiple Annotations

Create multiple annotations in a single request.

```http
POST /api/annotations/batch
```

**Request Body:**
```json
{
  "annotations": [
    {
      "sentence_id": 1,
      "fluency_score": 4,
      "adequacy_score": 5,
      "overall_quality": 4,
      "comments": "Good translation",
      "highlights": [
        {
          "highlighted_text": "good",
          "start_index": 10,
          "end_index": 14,
          "text_type": "machine",
          "comment": "Minor issue",
          "error_type": "MI_ST"
        }
      ]
    },
    {
      "sentence_id": 2,
      "fluency_score": 3,
      "adequacy_score": 4,
      "overall_quality": 3,
      "comments": "Adequate translation"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "created_annotations": [
    {
      "id": 124,
      "sentence_id": 1,
      "status": "created"
    },
    {
      "id": 125,
      "sentence_id": 2,
      "status": "created"
    }
  ],
  "total_created": 2,
  "errors": []
}
```

### Export Annotations

Export annotations to various formats.

```http
GET /api/annotations/export
```

**Query Parameters:**
- `format`: String, required - "csv", "json", "xml"
- `skip`: Integer, default 0
- `limit`: Integer, default 1000
- `status`: String, optional filter
- `created_after`: ISO datetime, optional filter
- `created_before`: ISO datetime, optional filter

**Example Request:**
```http
GET /api/annotations/export?format=csv&status=completed&created_after=2024-01-01T00:00:00Z
```

**Response (200 OK):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="annotations_export.csv"

id,sentence_id,annotator_id,fluency_score,adequacy_score,overall_quality,created_at
123,1,456,4,5,4,2024-01-15T10:30:00Z
124,2,456,3,4,3,2024-01-15T11:00:00Z
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "detail": "Validation error",
  "error_code": "VALIDATION_ERROR",
  "field_errors": {
    "fluency_score": ["Score must be between 1 and 5"],
    "sentence_id": ["Sentence does not exist"]
  }
}
```

**401 Unauthorized:**
```json
{
  "detail": "Authentication required",
  "error_code": "AUTHENTICATION_REQUIRED"
}
```

**403 Forbidden:**
```json
{
  "detail": "Cannot modify annotation created by another user",
  "error_code": "INSUFFICIENT_PERMISSIONS"
}
```

**404 Not Found:**
```json
{
  "detail": "Annotation not found",
  "error_code": "ANNOTATION_NOT_FOUND"
}
```

**409 Conflict:**
```json
{
  "detail": "Annotation already exists for this sentence",
  "error_code": "ANNOTATION_EXISTS"
}
```

**413 Request Entity Too Large:**
```json
{
  "detail": "File too large. Maximum size is 10MB",
  "error_code": "FILE_TOO_LARGE"
}
```

**422 Unprocessable Entity:**
```json
{
  "detail": "Invalid annotation data",
  "error_code": "INVALID_ANNOTATION_DATA",
  "field_errors": {
    "highlights": ["Invalid text selection range"]
  }
}
```

### Error Codes

| Error Code | Description |
|------------|-------------|
| `VALIDATION_ERROR` | Request data validation failed |
| `AUTHENTICATION_REQUIRED` | Valid JWT token required |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `ANNOTATION_NOT_FOUND` | Annotation does not exist |
| `ANNOTATION_EXISTS` | Annotation already exists |
| `SENTENCE_NOT_FOUND` | Referenced sentence does not exist |
| `INVALID_ANNOTATION_DATA` | Annotation data is invalid |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `UNSUPPORTED_FILE_FORMAT` | File format not supported |
| `HIGHLIGHT_INVALID_RANGE` | Text highlight range is invalid |

## Rate Limiting

Annotation endpoints have the following rate limits:
- **General endpoints**: 100 requests per minute
- **Create/Update operations**: 50 requests per minute
- **File upload**: 10 requests per minute
- **Export operations**: 5 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Webhooks

### Annotation Events

Configure webhooks to receive notifications about annotation events:

**Available Events:**
- `annotation.created`: New annotation created
- `annotation.updated`: Annotation modified
- `annotation.completed`: Annotation status changed to completed
- `annotation.deleted`: Annotation deleted

**Webhook Payload Example:**
```json
{
  "event": "annotation.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "annotation_id": 123,
    "annotator_id": 456,
    "sentence_id": 1,
    "overall_quality": 4,
    "time_spent_seconds": 1200
  }
}
```

## SDK and Code Examples

### Python SDK

```python
import requests
from typing import Dict, List, Optional

class LakraAnnotationClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def create_annotation(self, annotation_data: Dict) -> Dict:
        """Create a new annotation."""
        response = requests.post(
            f"{self.base_url}/api/annotations",
            json=annotation_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_annotation(self, annotation_id: int) -> Dict:
        """Get annotation by ID."""
        response = requests.get(
            f"{self.base_url}/api/annotations/{annotation_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def list_annotations(self, skip: int = 0, limit: int = 100, 
                        status: Optional[str] = None) -> Dict:
        """List user's annotations."""
        params = {'skip': skip, 'limit': limit}
        if status:
            params['status'] = status
        
        response = requests.get(
            f"{self.base_url}/api/annotations",
            params=params,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def update_annotation(self, annotation_id: int, 
                         update_data: Dict) -> Dict:
        """Update an existing annotation."""
        response = requests.put(
            f"{self.base_url}/api/annotations/{annotation_id}",
            json=update_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage example
client = LakraAnnotationClient('http://localhost:8000', 'your-jwt-token')

# Create annotation
annotation = client.create_annotation({
    'sentence_id': 1,
    'fluency_score': 4,
    'adequacy_score': 5,
    'overall_quality': 4,
    'comments': 'Good translation with minor issues'
})

# Get annotation
annotation = client.get_annotation(123)

# List annotations
annotations = client.list_annotations(skip=0, limit=50, status='completed')
```

### JavaScript/TypeScript SDK

```typescript
interface AnnotationData {
  sentence_id: number;
  fluency_score: number;
  adequacy_score: number;
  overall_quality: number;
  comments?: string;
  final_form?: string;
  highlights?: TextHighlight[];
}

interface TextHighlight {
  highlighted_text: string;
  start_index: number;
  end_index: number;
  text_type: 'machine' | 'source';
  comment: string;
  error_type: 'MI_ST' | 'MI_SE' | 'MA_ST' | 'MA_SE';
}

class LakraAnnotationClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async createAnnotation(data: AnnotationData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/annotations`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getAnnotation(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/annotations/${id}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async listAnnotations(skip = 0, limit = 100, status?: string): Promise<any> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    });
    
    if (status) {
      params.append('status', status);
    }
    
    const response = await fetch(`${this.baseUrl}/api/annotations?${params}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

// Usage example
const client = new LakraAnnotationClient('http://localhost:8000', 'your-jwt-token');

// Create annotation
const annotation = await client.createAnnotation({
  sentence_id: 1,
  fluency_score: 4,
  adequacy_score: 5,
  overall_quality: 4,
  comments: 'Good translation with minor issues'
});

// Get annotation
const fetchedAnnotation = await client.getAnnotation(123);

// List annotations
const annotations = await client.listAnnotations(0, 50, 'completed');
```

## Testing

### Example Test Cases

```bash
# Create annotation
curl -X POST http://localhost:8000/api/annotations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sentence_id": 1,
    "fluency_score": 4,
    "adequacy_score": 5,
    "overall_quality": 4,
    "comments": "Test annotation"
  }'

# Get annotation
curl -X GET http://localhost:8000/api/annotations/123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# List annotations
curl -X GET "http://localhost:8000/api/annotations?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update annotation
curl -X PUT http://localhost:8000/api/annotations/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fluency_score": 5,
    "comments": "Updated comment"
  }'

# Delete annotation
curl -X DELETE http://localhost:8000/api/annotations/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Last Updated**: January 2024
**API Version**: 1.0.0
**Annotation Endpoints**: Comprehensive annotation management API 