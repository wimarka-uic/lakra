# Evaluations API Documentation

## Overview

This document provides detailed information about evaluation-related endpoints in the Lakra API. These endpoints allow evaluators to assess annotation quality, provide feedback, and manage evaluation workflows.

## Authentication

All evaluation endpoints require authentication with evaluator privileges. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Base URL

```
http://localhost:8000/api
```

## Evaluation Endpoints

### Create Evaluation

Create a new evaluation for an annotation (evaluators only).

```http
POST /api/evaluations
```

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <evaluator_token>
```

**Request Body:**
```json
{
  "annotation_id": 123,
  "annotation_quality_score": 4,
  "accuracy_score": 5,
  "completeness_score": 4,
  "overall_evaluation_score": 4,
  "feedback": "Good annotation with clear explanations. Minor improvements needed in error classification.",
  "evaluation_notes": "Annotator shows good understanding of quality criteria. Consider providing more specific examples in comments.",
  "time_spent_seconds": 300,
  "evaluation_status": "completed"
}
```

**Response (201 Created):**
```json
{
  "id": 456,
  "annotation_id": 123,
  "evaluator_id": 789,
  "annotation_quality_score": 4,
  "accuracy_score": 5,
  "completeness_score": 4,
  "overall_evaluation_score": 4,
  "feedback": "Good annotation with clear explanations. Minor improvements needed in error classification.",
  "evaluation_notes": "Annotator shows good understanding of quality criteria. Consider providing more specific examples in comments.",
  "time_spent_seconds": 300,
  "evaluation_status": "completed",
  "created_at": "2024-01-15T14:30:00Z",
  "updated_at": "2024-01-15T14:30:00Z",
  "annotation": {
    "id": 123,
    "sentence_id": 1,
    "annotator_id": 456,
    "fluency_score": 4,
    "adequacy_score": 5,
    "overall_quality": 4,
    "annotation_status": "completed",
    "created_at": "2024-01-15T10:30:00Z",
    "sentence": {
      "id": 1,
      "source_text": "This is a good translation",
      "machine_translation": "Esta es una buena traducción",
      "source_language": "en",
      "target_language": "es"
    }
  }
}
```

**Validation Rules:**
- `annotation_id`: Required, must exist and be completed
- `annotation_quality_score`: Required, integer 1-5
- `accuracy_score`: Required, integer 1-5
- `completeness_score`: Required, integer 1-5
- `overall_evaluation_score`: Required, integer 1-5
- `feedback`: Optional, maximum 2000 characters
- `evaluation_notes`: Optional, maximum 1000 characters
- `time_spent_seconds`: Optional, positive integer
- `evaluation_status`: Optional, one of: "draft", "in_progress", "completed"

### Get Evaluation

Retrieve a specific evaluation by ID.

```http
GET /api/evaluations/{evaluation_id}
```

**Path Parameters:**
- `evaluation_id`: Integer, required

**Response (200 OK):**
```json
{
  "id": 456,
  "annotation_id": 123,
  "evaluator_id": 789,
  "annotation_quality_score": 4,
  "accuracy_score": 5,
  "completeness_score": 4,
  "overall_evaluation_score": 4,
  "feedback": "Good annotation with clear explanations. Minor improvements needed in error classification.",
  "evaluation_notes": "Annotator shows good understanding of quality criteria.",
  "time_spent_seconds": 300,
  "evaluation_status": "completed",
  "created_at": "2024-01-15T14:30:00Z",
  "updated_at": "2024-01-15T14:30:00Z",
  "annotation": {
    "id": 123,
    "sentence_id": 1,
    "annotator_id": 456,
    "annotator_username": "john_annotator",
    "fluency_score": 4,
    "adequacy_score": 5,
    "overall_quality": 4,
    "comments": "Good translation with minor issues",
    "final_form": "Esta es una buena traducción",
    "annotation_status": "completed",
    "created_at": "2024-01-15T10:30:00Z",
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
        "highlighted_text": "es",
        "start_index": 5,
        "end_index": 7,
        "text_type": "machine",
        "comment": "Minor grammatical issue",
        "error_type": "MI_ST"
      }
    ]
  }
}
```

### Update Evaluation

Update an existing evaluation.

```http
PUT /api/evaluations/{evaluation_id}
```

**Path Parameters:**
- `evaluation_id`: Integer, required

**Request Body:**
```json
{
  "annotation_quality_score": 5,
  "accuracy_score": 5,
  "completeness_score": 5,
  "overall_evaluation_score": 5,
  "feedback": "Excellent annotation with comprehensive error analysis and clear explanations.",
  "evaluation_status": "completed"
}
```

**Response (200 OK):**
```json
{
  "id": 456,
  "annotation_id": 123,
  "evaluator_id": 789,
  "annotation_quality_score": 5,
  "accuracy_score": 5,
  "completeness_score": 5,
  "overall_evaluation_score": 5,
  "feedback": "Excellent annotation with comprehensive error analysis and clear explanations.",
  "evaluation_notes": "Annotator shows good understanding of quality criteria.",
  "time_spent_seconds": 300,
  "evaluation_status": "completed",
  "updated_at": "2024-01-15T15:00:00Z"
}
```

**Access Control:**
- Only the evaluation creator can update their own evaluations
- Admins can update any evaluation

### List My Evaluations

Get evaluations created by the authenticated evaluator.

```http
GET /api/evaluations
```

**Query Parameters:**
- `skip`: Integer, default 0 (pagination offset)
- `limit`: Integer, default 100, max 1000 (pagination limit)
- `status`: String, optional filter by evaluation status
- `annotation_id`: Integer, optional filter by annotation ID
- `annotator_id`: Integer, optional filter by annotator ID
- `created_after`: ISO datetime, optional filter by creation date
- `created_before`: ISO datetime, optional filter by creation date
- `score_range`: String, optional filter by score range (e.g., "4-5")

**Example Request:**
```http
GET /api/evaluations?skip=0&limit=50&status=completed&score_range=4-5
```

**Response (200 OK):**
```json
{
  "evaluations": [
    {
      "id": 456,
      "annotation_id": 123,
      "evaluator_id": 789,
      "annotation_quality_score": 4,
      "accuracy_score": 5,
      "completeness_score": 4,
      "overall_evaluation_score": 4,
      "evaluation_status": "completed",
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      "annotation": {
        "id": 123,
        "annotator_username": "john_annotator",
        "fluency_score": 4,
        "adequacy_score": 5,
        "overall_quality": 4,
        "sentence": {
          "id": 1,
          "source_text": "This is a good translation",
          "machine_translation": "Esta es una buena traducción",
          "source_language": "en",
          "target_language": "es",
          "domain": "general"
        }
      }
    }
  ],
  "total_count": 35,
  "page_count": 2,
  "current_page": 1,
  "has_next": true,
  "has_previous": false
}
```

### Delete Evaluation

Delete a specific evaluation.

```http
DELETE /api/evaluations/{evaluation_id}
```

**Path Parameters:**
- `evaluation_id`: Integer, required

**Response (204 No Content):**
```
No response body
```

**Access Control:**
- Only the evaluation creator can delete their own evaluations
- Admins can delete any evaluation

### Get Pending Evaluations

Get annotations that are ready for evaluation.

```http
GET /api/evaluations/pending
```

**Query Parameters:**
- `skip`: Integer, default 0 (pagination offset)
- `limit`: Integer, default 50, max 200 (pagination limit)
- `language_pair`: String, optional filter by language pair (e.g., "en-es")
- `domain`: String, optional filter by domain
- `annotator_id`: Integer, optional filter by annotator
- `created_after`: ISO datetime, optional filter by annotation creation date
- `exclude_own`: Boolean, default true (exclude own annotations)

**Example Request:**
```http
GET /api/evaluations/pending?skip=0&limit=20&language_pair=en-es&domain=general
```

**Response (200 OK):**
```json
{
  "annotations": [
    {
      "id": 124,
      "sentence_id": 2,
      "annotator_id": 456,
      "annotator_username": "jane_annotator",
      "fluency_score": 3,
      "adequacy_score": 4,
      "overall_quality": 3,
      "comments": "Translation has some issues but conveys the meaning",
      "final_form": "Esta es una traducción aceptable",
      "annotation_status": "completed",
      "created_at": "2024-01-15T12:00:00Z",
      "time_spent_seconds": 900,
      "sentence": {
        "id": 2,
        "source_text": "This is an acceptable translation",
        "machine_translation": "Esta es una traducción aceptable",
        "source_language": "en",
        "target_language": "es",
        "domain": "general"
      },
      "highlights_count": 1,
      "existing_evaluations": 0,
      "priority": "normal"
    }
  ],
  "total_count": 15,
  "page_count": 1,
  "current_page": 1,
  "has_next": false,
  "has_previous": false
}
```

### Get Evaluation Statistics

Get statistics for the authenticated evaluator's evaluations.

```http
GET /api/evaluations/stats
```

**Response (200 OK):**
```json
{
  "total_evaluations": 45,
  "completed_evaluations": 42,
  "draft_evaluations": 3,
  "average_annotation_quality_score": 4.1,
  "average_accuracy_score": 4.3,
  "average_completeness_score": 4.0,
  "average_overall_score": 4.1,
  "total_time_spent_seconds": 18000,
  "average_time_per_evaluation": 400,
  "evaluations_this_week": 12,
  "evaluations_this_month": 45,
  "score_distribution": {
    "annotation_quality": {
      "1": 1,
      "2": 3,
      "3": 8,
      "4": 20,
      "5": 13
    },
    "accuracy": {
      "1": 0,
      "2": 2,
      "3": 6,
      "4": 18,
      "5": 19
    },
    "completeness": {
      "1": 1,
      "2": 4,
      "3": 9,
      "4": 22,
      "5": 9
    },
    "overall": {
      "1": 0,
      "2": 3,
      "3": 7,
      "4": 21,
      "5": 14
    }
  },
  "annotator_feedback_stats": {
    "total_annotators_evaluated": 8,
    "average_feedback_length": 150,
    "feedback_sentiment": "positive"
  }
}
```

## Evaluation Workflow Endpoints

### Assign Evaluation

Assign a specific annotation to an evaluator for evaluation.

```http
POST /api/evaluations/assign
```

**Request Body:**
```json
{
  "annotation_id": 123,
  "evaluator_id": 789,
  "priority": "high",
  "deadline": "2024-01-20T23:59:59Z",
  "notes": "Priority evaluation for quality review"
}
```

**Response (201 Created):**
```json
{
  "id": 999,
  "annotation_id": 123,
  "evaluator_id": 789,
  "status": "assigned",
  "priority": "high",
  "deadline": "2024-01-20T23:59:59Z",
  "notes": "Priority evaluation for quality review",
  "assigned_at": "2024-01-15T15:30:00Z",
  "assigned_by": 101
}
```

**Access Control:**
- Only admins can assign evaluations
- Cannot assign to the annotation creator

### Get Evaluation Assignment

Get details about an evaluation assignment.

```http
GET /api/evaluations/assignments/{assignment_id}
```

**Path Parameters:**
- `assignment_id`: Integer, required

**Response (200 OK):**
```json
{
  "id": 999,
  "annotation_id": 123,
  "evaluator_id": 789,
  "evaluator_username": "expert_evaluator",
  "status": "assigned",
  "priority": "high",
  "deadline": "2024-01-20T23:59:59Z",
  "notes": "Priority evaluation for quality review",
  "assigned_at": "2024-01-15T15:30:00Z",
  "assigned_by": 101,
  "annotation": {
    "id": 123,
    "annotator_username": "john_annotator",
    "sentence": {
      "source_text": "This is a good translation",
      "machine_translation": "Esta es una buena traducción"
    }
  }
}
```

### Update Evaluation Assignment

Update an evaluation assignment.

```http
PUT /api/evaluations/assignments/{assignment_id}
```

**Path Parameters:**
- `assignment_id`: Integer, required

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Started evaluation process"
}
```

**Response (200 OK):**
```json
{
  "id": 999,
  "annotation_id": 123,
  "evaluator_id": 789,
  "status": "in_progress",
  "priority": "high",
  "deadline": "2024-01-20T23:59:59Z",
  "notes": "Started evaluation process",
  "updated_at": "2024-01-15T16:00:00Z"
}
```

## Evaluation Quality Control

### Get Evaluation Quality Report

Get a quality report for evaluations.

```http
GET /api/evaluations/quality-report
```

**Query Parameters:**
- `evaluator_id`: Integer, optional filter by evaluator
- `start_date`: ISO date, optional filter by start date
- `end_date`: ISO date, optional filter by end date
- `include_metrics`: Boolean, default true

**Response (200 OK):**
```json
{
  "report_period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "total_evaluations": 150,
  "evaluator_performance": [
    {
      "evaluator_id": 789,
      "evaluator_username": "expert_evaluator",
      "total_evaluations": 45,
      "average_time_per_evaluation": 400,
      "consistency_score": 0.85,
      "feedback_quality_score": 4.2,
      "agreement_with_peers": 0.78
    }
  ],
  "quality_metrics": {
    "inter_evaluator_agreement": 0.76,
    "evaluation_consistency": 0.82,
    "feedback_usefulness": 4.1,
    "turnaround_time": 2.5
  },
  "recommendations": [
    "Provide additional training on error classification",
    "Implement peer review process for complex cases",
    "Consider evaluation guidelines refinement"
  ]
}
```

### Compare Evaluations

Compare evaluations from different evaluators for the same annotation.

```http
GET /api/evaluations/compare/{annotation_id}
```

**Path Parameters:**
- `annotation_id`: Integer, required

**Response (200 OK):**
```json
{
  "annotation_id": 123,
  "evaluations": [
    {
      "id": 456,
      "evaluator_id": 789,
      "evaluator_username": "expert_evaluator_1",
      "annotation_quality_score": 4,
      "accuracy_score": 5,
      "completeness_score": 4,
      "overall_evaluation_score": 4,
      "feedback": "Good annotation with clear explanations",
      "created_at": "2024-01-15T14:30:00Z"
    },
    {
      "id": 457,
      "evaluator_id": 790,
      "evaluator_username": "expert_evaluator_2",
      "annotation_quality_score": 3,
      "accuracy_score": 4,
      "completeness_score": 3,
      "overall_evaluation_score": 3,
      "feedback": "Adequate annotation but missing some error details",
      "created_at": "2024-01-15T16:45:00Z"
    }
  ],
  "agreement_metrics": {
    "score_agreement": 0.75,
    "feedback_similarity": 0.68,
    "overall_agreement": 0.72
  },
  "consensus": {
    "average_annotation_quality": 3.5,
    "average_accuracy": 4.5,
    "average_completeness": 3.5,
    "average_overall": 3.5,
    "combined_feedback": "Good annotation with clear explanations, but could benefit from more detailed error analysis"
  }
}
```

## Batch Evaluation Operations

### Batch Create Evaluations

Create multiple evaluations in a single request.

```http
POST /api/evaluations/batch
```

**Request Body:**
```json
{
  "evaluations": [
    {
      "annotation_id": 123,
      "annotation_quality_score": 4,
      "accuracy_score": 5,
      "completeness_score": 4,
      "overall_evaluation_score": 4,
      "feedback": "Good annotation"
    },
    {
      "annotation_id": 124,
      "annotation_quality_score": 3,
      "accuracy_score": 4,
      "completeness_score": 3,
      "overall_evaluation_score": 3,
      "feedback": "Adequate annotation"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "created_evaluations": [
    {
      "id": 458,
      "annotation_id": 123,
      "status": "created"
    },
    {
      "id": 459,
      "annotation_id": 124,
      "status": "created"
    }
  ],
  "total_created": 2,
  "errors": []
}
```

### Export Evaluations

Export evaluations to various formats.

```http
GET /api/evaluations/export
```

**Query Parameters:**
- `format`: String, required - "csv", "json", "xml"
- `skip`: Integer, default 0
- `limit`: Integer, default 1000
- `status`: String, optional filter
- `created_after`: ISO datetime, optional filter
- `created_before`: ISO datetime, optional filter
- `include_feedback`: Boolean, default true

**Example Request:**
```http
GET /api/evaluations/export?format=csv&status=completed&include_feedback=true
```

**Response (200 OK):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="evaluations_export.csv"

id,annotation_id,evaluator_id,annotation_quality_score,accuracy_score,completeness_score,overall_evaluation_score,feedback,created_at
456,123,789,4,5,4,4,"Good annotation with clear explanations",2024-01-15T14:30:00Z
457,124,789,3,4,3,3,"Adequate annotation",2024-01-15T15:00:00Z
```

## Evaluation Feedback System

### Get Evaluation Feedback

Get feedback on an evaluation from the original annotator.

```http
GET /api/evaluations/{evaluation_id}/feedback
```

**Path Parameters:**
- `evaluation_id`: Integer, required

**Response (200 OK):**
```json
{
  "evaluation_id": 456,
  "annotator_feedback": {
    "id": 101,
    "annotator_id": 456,
    "feedback_text": "Thank you for the detailed evaluation. I understand the points about error classification and will be more specific in future annotations.",
    "rating": 5,
    "helpful": true,
    "created_at": "2024-01-16T09:00:00Z"
  },
  "evaluator_response": {
    "id": 102,
    "evaluator_id": 789,
    "response_text": "Great to hear! Keep up the good work with the improved specificity.",
    "created_at": "2024-01-16T10:30:00Z"
  }
}
```

### Submit Evaluation Feedback

Submit feedback on an evaluation (annotators only).

```http
POST /api/evaluations/{evaluation_id}/feedback
```

**Path Parameters:**
- `evaluation_id`: Integer, required

**Request Body:**
```json
{
  "feedback_text": "Thank you for the detailed evaluation. I understand the points about error classification and will be more specific in future annotations.",
  "rating": 5,
  "helpful": true
}
```

**Response (201 Created):**
```json
{
  "id": 101,
  "evaluation_id": 456,
  "annotator_id": 456,
  "feedback_text": "Thank you for the detailed evaluation. I understand the points about error classification and will be more specific in future annotations.",
  "rating": 5,
  "helpful": true,
  "created_at": "2024-01-16T09:00:00Z"
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "detail": "Validation error",
  "error_code": "VALIDATION_ERROR",
  "field_errors": {
    "annotation_quality_score": ["Score must be between 1 and 5"],
    "annotation_id": ["Annotation must be completed before evaluation"]
  }
}
```

**401 Unauthorized:**
```json
{
  "detail": "Evaluator privileges required",
  "error_code": "EVALUATOR_REQUIRED"
}
```

**403 Forbidden:**
```json
{
  "detail": "Cannot evaluate your own annotation",
  "error_code": "SELF_EVALUATION_FORBIDDEN"
}
```

**404 Not Found:**
```json
{
  "detail": "Evaluation not found",
  "error_code": "EVALUATION_NOT_FOUND"
}
```

**409 Conflict:**
```json
{
  "detail": "Evaluation already exists for this annotation",
  "error_code": "EVALUATION_EXISTS"
}
```

### Error Codes

| Error Code | Description |
|------------|-------------|
| `VALIDATION_ERROR` | Request data validation failed |
| `EVALUATOR_REQUIRED` | Evaluator privileges required |
| `EVALUATION_NOT_FOUND` | Evaluation does not exist |
| `EVALUATION_EXISTS` | Evaluation already exists |
| `ANNOTATION_NOT_FOUND` | Referenced annotation does not exist |
| `ANNOTATION_NOT_COMPLETED` | Annotation must be completed first |
| `SELF_EVALUATION_FORBIDDEN` | Cannot evaluate own annotation |
| `EVALUATION_ASSIGNMENT_REQUIRED` | Evaluation must be assigned first |
| `DEADLINE_EXCEEDED` | Evaluation deadline has passed |

## Rate Limiting

Evaluation endpoints have the following rate limits:
- **General endpoints**: 100 requests per minute
- **Create/Update operations**: 30 requests per minute
- **Batch operations**: 10 requests per minute
- **Export operations**: 5 requests per minute

## SDK and Code Examples

### Python SDK

```python
import requests
from typing import Dict, List, Optional

class LakraEvaluationClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def create_evaluation(self, evaluation_data: Dict) -> Dict:
        """Create a new evaluation."""
        response = requests.post(
            f"{self.base_url}/api/evaluations",
            json=evaluation_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_pending_evaluations(self, skip: int = 0, limit: int = 50) -> Dict:
        """Get pending annotations for evaluation."""
        response = requests.get(
            f"{self.base_url}/api/evaluations/pending",
            params={'skip': skip, 'limit': limit},
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_evaluation_stats(self) -> Dict:
        """Get evaluation statistics."""
        response = requests.get(
            f"{self.base_url}/api/evaluations/stats",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage example
client = LakraEvaluationClient('http://localhost:8000', 'your-evaluator-token')

# Get pending evaluations
pending = client.get_pending_evaluations(skip=0, limit=20)

# Create evaluation
evaluation = client.create_evaluation({
    'annotation_id': 123,
    'annotation_quality_score': 4,
    'accuracy_score': 5,
    'completeness_score': 4,
    'overall_evaluation_score': 4,
    'feedback': 'Good annotation with clear explanations'
})
```

### JavaScript/TypeScript SDK

```typescript
interface EvaluationData {
  annotation_id: number;
  annotation_quality_score: number;
  accuracy_score: number;
  completeness_score: number;
  overall_evaluation_score: number;
  feedback?: string;
  evaluation_notes?: string;
}

class LakraEvaluationClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async createEvaluation(data: EvaluationData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/evaluations`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getPendingEvaluations(skip = 0, limit = 50): Promise<any> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    });
    
    const response = await fetch(`${this.baseUrl}/api/evaluations/pending?${params}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getEvaluationStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/evaluations/stats`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

// Usage example
const client = new LakraEvaluationClient('http://localhost:8000', 'your-evaluator-token');

// Get pending evaluations
const pending = await client.getPendingEvaluations(0, 20);

// Create evaluation
const evaluation = await client.createEvaluation({
  annotation_id: 123,
  annotation_quality_score: 4,
  accuracy_score: 5,
  completeness_score: 4,
  overall_evaluation_score: 4,
  feedback: 'Good annotation with clear explanations'
});
```

## Testing

### Example Test Cases

```bash
# Create evaluation
curl -X POST http://localhost:8000/api/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EVALUATOR_TOKEN" \
  -d '{
    "annotation_id": 123,
    "annotation_quality_score": 4,
    "accuracy_score": 5,
    "completeness_score": 4,
    "overall_evaluation_score": 4,
    "feedback": "Good annotation"
  }'

# Get pending evaluations
curl -X GET "http://localhost:8000/api/evaluations/pending?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_EVALUATOR_TOKEN"

# Get evaluation statistics
curl -X GET http://localhost:8000/api/evaluations/stats \
  -H "Authorization: Bearer YOUR_EVALUATOR_TOKEN"

# Update evaluation
curl -X PUT http://localhost:8000/api/evaluations/456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EVALUATOR_TOKEN" \
  -d '{
    "annotation_quality_score": 5,
    "feedback": "Excellent annotation"
  }'
```

---

**Last Updated**: January 2024
**API Version**: 1.0.0
**Evaluation Endpoints**: Comprehensive evaluation management API 