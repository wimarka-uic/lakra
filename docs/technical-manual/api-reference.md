# API Reference

Complete API documentation for the Lakra system. All API calls are made through the Supabase JavaScript client.

## Overview

Lakra uses Supabase client libraries for all backend operations. The API is organized into modules:

- **Authentication API** - User authentication
- **Sentences API** - Sentence management
- **Annotations API** - Annotation operations
- **Evaluations API** - Evaluation operations
- **Quality Assessments API** - AI quality assessments
- **Admin API** - Administrative functions

## Authentication

Located in `src/services/supabase-api.ts`

### authAPI

#### login(credentials)

Sign in a user with email or username.

**Parameters:**
```typescript
{
  identifier: string;  // email or username
  password: string;
  isUsername?: boolean; // true if identifier is username
}
```

**Returns:**
```typescript
{
  user: User;
  session: Session;
  error: null | Error;
}
```

**Example:**
```javascript
const { user, error } = await authAPI.login({
  identifier: 'user@example.com',
  password: 'password123'
});
```

#### register(userData)

Register a new user.

**Parameters:**
```typescript
{
  email: string;
  password: string;
  username?: string;
  fullName?: string;
  role: 'annotator' | 'evaluator';
}
```

#### logout()

Sign out the current user.

#### getCurrentUser()

Get the currently authenticated user with profile data.

**Returns:**
```typescript
{
  id: string;
  email: string;
  username?: string;
  role: string;
  // ... other user fields
}
```

#### updatePassword(newPassword)

Update user password.

## Sentences

### sentencesAPI

#### getSentences(filters)

Fetch sentences with optional filtering.

**Parameters:**
```typescript
{
  languagePair?: {source: string, target: string};
  domain?: string;
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}
```

**Returns:** Array of sentence objects

**Example:**
```javascript
const sentences = await sentencesAPI.getSentences({
  languagePair: {source: 'en', target: 'fil'},
  activeOnly: true,
  limit: 20
});
```

#### getSentenceById(id)

Fetch a specific sentence by ID.

#### getNextSentence(userId)

Get the next unannotated sentence for a user.

**Returns:** Sentence object or null

#### createSentence(sentenceData)

Create a new sentence (admin only).

**Parameters:**
```typescript
{
  sourceText: string;
  machineTranslation: string;
  sourceLanguage: string;
  targetLanguage: string;
  domain?: string;
  context?: string;
  backTranslation?: string;
  isActive?: boolean;
}
```

#### updateSentence(id, updates)

Update an existing sentence (admin only).

#### deleteSentence(id)

Delete a sentence (admin only).

#### importSentencesFromCSV(csvData)

Bulk import sentences from CSV data (admin only).

**Parameters:**
```typescript
{
  csvData: Array<{
    source_text: string;
    machine_translation: string;
    source_language: string;
    target_language: string;
    domain?: string;
  }>;
}
```

**Returns:**
```typescript
{
  successful: number;
  failed: number;
  errors: Array<{row: number, error: string}>;
}
```

## Annotations

### annotationsAPI

#### createAnnotation(annotationData)

Create a new annotation.

**Parameters:**
```typescript
{
  sentenceId: string;
  fluencyScore: number;      // 1-5
  adequacyScore: number;     // 1-5
  overallQualityScore: number; // 1-5
  comments?: string;
  suggestedCorrection?: string;
  voiceRecordingUrl?: string;
  timeSpentSeconds?: number;
  textHighlights?: Array<{
    startPosition: number;
    endPosition: number;
    highlightedText: string;
    errorType: 'MI_ST' | 'MI_SE' | 'MA_ST' | 'MA_SE';
    errorDescription?: string;
    suggestedFix?: string;
  }>;
}
```

**Returns:** Created annotation object

**Example:**
```javascript
const annotation = await annotationsAPI.createAnnotation({
  sentenceId: 'uuid-here',
  fluencyScore: 4,
  adequacyScore: 4,
  overallQualityScore: 4,
  comments: 'Good translation overall',
  textHighlights: [
    {
      startPosition: 0,
      endPosition: 5,
      highlightedText: 'Hello',
      errorType: 'MI_ST',
      errorDescription: 'Missing punctuation'
    }
  ]
});
```

#### getMyAnnotations(userId, options)

Get all annotations by a specific user.

**Parameters:**
```typescript
{
  limit?: number;
  offset?: number;
  status?: 'draft' | 'completed' | 'under_review';
}
```

#### getAnnotationById(id)

Fetch a specific annotation with all related data.

**Returns:**
```typescript
{
  id: string;
  sentence: Sentence;
  fluencyScore: number;
  // ... all annotation fields
  textHighlights: TextHighlight[];
  evaluations: Evaluation[];
}
```

#### updateAnnotation(id, updates)

Update an existing annotation (before evaluation).

#### deleteAnnotation(id)

Delete an annotation (before evaluation).

#### getAnnotationsBysentence(sentenceId)

Get all annotations for a specific sentence.

## Evaluations

### evaluationsAPI

#### createEvaluation(evaluationData)

Create a new evaluation of an annotation.

**Parameters:**
```typescript
{
  annotationId: string;
  accuracyScore: number;      // 1-5
  completenessScore: number;  // 1-5
  overallQualityScore: number; // 1-5
  feedback: string;
  strengths?: string;
  improvementsNeeded?: string;
  missedErrors?: string[];
  incorrectClassifications?: string[];
  timeSpentSeconds?: number;
}
```

#### getMyEvaluations(evaluatorId, options)

Get all evaluations by a specific evaluator.

#### getPendingEvaluations(evaluatorId, options)

Get annotations awaiting evaluation.

**Returns:** Array of annotations without evaluations from this evaluator

#### getEvaluationById(id)

Fetch a specific evaluation.

#### getEvaluationsForAnnotation(annotationId)

Get all evaluations for a specific annotation.

## Quality Assessments

### qualityAssessmentsAPI

#### createQualityAssessment(assessmentData)

Create an AI quality assessment for a sentence.

**Parameters:**
```typescript
{
  sentenceId: string;
  evaluatedBy?: string;
  // AI scores populated by backend AI service
}
```

#### getQualityAssessment(sentenceId)

Get quality assessment for a sentence.

#### validateQualityAssessment(id, validation)

Validate/modify an AI quality assessment.

**Parameters:**
```typescript
{
  humanFluencyScore: number;
  humanAdequacyScore: number;
  humanOverallScore: number;
  humanFeedback: string;
  validationStatus: 'confirmed' | 'rejected' | 'modified';
}
```

## Admin Functions

### adminAPI

#### getStats()

Get system-wide statistics.

**Returns:**
```typescript
{
  totalUsers: number;
  usersByRole: {admin: number, annotator: number, evaluator: number};
  totalSentences: number;
  totalAnnotations: number;
  totalEvaluations: number;
  averageQualityScores: {
    fluency: number;
    adequacy: number;
    overall: number;
  };
  recentActivity: Array<Activity>;
}
```

#### getAllUsers(options)

Get all users (admin only).

**Parameters:**
```typescript
{
  role?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}
```

#### createUser(userData)

Create a new user (admin only).

**Parameters:**
```typescript
{
  email: string;
  username?: string;
  password: string;
  role: 'admin' | 'annotator' | 'evaluator';
  fullName?: string;
}
```

#### updateUser(userId, updates)

Update user profile (admin only).

#### deleteUser(userId)

Delete a user (admin only).

#### getAnnotationMetrics(options)

Get detailed annotation metrics.

**Parameters:**
```typescript
{
  startDate?: Date;
  endDate?: Date;
  annotatorId?: string;
  languagePair?: {source: string, target: string};
}
```

**Returns:**
```typescript
{
  totalAnnotations: number;
  averageTimePerAnnotation: number;
  errorDistribution: {
    MI_ST: number;
    MI_SE: number;
    MA_ST: number;
    MA_SE: number;
  };
  qualityTrends: Array<{date: string, avgScore: number}>;
}
```

## Storage (Voice Recordings)

### storageAPI

#### uploadVoiceRecording(file, annotationId)

Upload voice recording to Supabase Storage.

**Parameters:**
```typescript
{
  file: File; // Audio file (WebM, MP3, etc.)
  annotationId: string;
}
```

**Returns:**
```typescript
{
  url: string; // Public or signed URL
  path: string; // Storage path
}
```

**Example:**
```javascript
const { url } = await storageAPI.uploadVoiceRecording(
  audioBlob,
  annotationId
);
```

#### getVoiceRecordingUrl(path)

Get a signed URL for a voice recording.

**Returns:** Temporary signed URL (expires in 1 hour)

#### deleteVoiceRecording(path)

Delete a voice recording from storage.

## Error Handling

All API functions return errors in a consistent format:

```typescript
{
  data: null,
  error: {
    message: string;
    code?: string;
    details?: any;
  }
}
```

**Common Error Codes:**
- `PGRST116` - No rows found
- `23505` - Unique violation
- `42501` - Insufficient privilege (RLS policy)
- `08006` - Connection failure

**Example Error Handling:**
```javascript
const { data, error } = await annotationsAPI.createAnnotation(annotationData);

if (error) {
  if (error.code === '23505') {
    console.error('Duplicate annotation');
  } else {
    console.error('Error:', error.message);
  }
  return;
}

// Use data
console.log('Annotation created:', data);
```

## Real-Time Subscriptions

Subscribe to database changes (optional feature):

```javascript
// Subscribe to new annotations
const subscription = supabase
  .channel('annotations')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'annotations'
    },
    (payload) => {
      console.log('New annotation:', payload.new);
    }
  )
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

## Rate Limiting

Supabase applies rate limiting:
- **Anonymous requests**: 100/hour
- **Authenticated requests**: 500/hour

For production, configure appropriate limits in Supabase dashboard.

## Best Practices

1. **Always handle errors** - Check for error objects on every API call
2. **Use TypeScript** - Type safety prevents many runtime errors
3. **Implement loading states** - Show loading indicators during API calls
4. **Optimize queries** - Use selective field fetching, pagination
5. **Cache when appropriate** - Store frequently accessed data client-side
6. **Debounce user input** - Prevent excessive API calls during typing
7. **Handle offline scenarios** - Graceful degradation when network fails

## See Also

- [Database Schema](database-schema.md) - Database structure
- [Architecture](architecture.md) - System architecture
- [Development](development.md) - Development workflow
