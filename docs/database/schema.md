# Database Schema Documentation

## Overview

The Lakra annotation system uses a relational database to store user data, annotation content, quality assessments, and system metadata. The schema is designed to support multi-role user management, detailed annotation workflows, and comprehensive quality evaluation processes.

## Database Technology

- **Primary Database**: PostgreSQL (required for all environments)
- **Production Ready**: PostgreSQL (recommended)
- **ORM**: SQLAlchemy with declarative mapping
- **Migrations**: Custom Python migration scripts

## Schema Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Users       │    │  UserLanguages  │    │   Sentences     │
│─────────────────│    │─────────────────│    │─────────────────│
│ id (PK)         │────┤ user_id (FK)    │    │ id (PK)         │
│ email           │    │ id (PK)         │    │ source_text     │
│ username        │    │ language        │    │ machine_trans   │
│ hashed_password │    └─────────────────┘    │ source_language │
│ first_name      │                           │ target_language │
│ last_name       │                           │ domain          │
│ is_active       │                           │ is_active       │
│ is_admin        │                           │ created_at      │
│ is_evaluator    │                           └─────────────────┘
│ onboarding_*    │                                    │
│ created_at      │                                    │
└─────────────────┘                                    │
         │                                             │
         │                                             │
         │    ┌─────────────────┐                     │
         │────┤   Annotations   │─────────────────────┘
         │    │─────────────────│
         │    │ id (PK)         │
         │    │ sentence_id (FK)│
         │    │ annotator_id(FK)│
         │    │ fluency_score   │
         │    │ adequacy_score  │
         │    │ overall_quality │
         │    │ final_form      │
         │    │ voice_recording │
         │    │ time_spent      │
         │    │ created_at      │
         │    └─────────────────┘
         │             │
         │             │
         │    ┌─────────────────┐
         │    │ TextHighlights  │
         │    │─────────────────│
         │    │ id (PK)         │
         │    │ annotation_id(FK)│
         │    │ highlighted_text│
         │    │ start_index     │
         │    │ end_index       │
         │    │ error_type      │
         │    │ comment         │
         │    └─────────────────┘
         │
         │    ┌─────────────────┐
         │────┤   Evaluations   │
         │    │─────────────────│
         │    │ id (PK)         │
         │    │ annotation_id(FK)│
         │    │ evaluator_id(FK)│
         │    │ quality_scores  │
         │    │ feedback        │
         │    │ created_at      │
         │    └─────────────────┘
         │
         │    ┌─────────────────┐
         │────┤MTQualityAssess  │
              │─────────────────│
              │ id (PK)         │
              │ sentence_id (FK)│
              │ evaluator_id(FK)│
              │ ai_scores       │
              │ human_feedback  │
              │ created_at      │
              └─────────────────┘
```

## Core Tables

### Users Table

The central user management table supporting role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique user identifier |
| `email` | STRING | UNIQUE, NOT NULL | User's email address (login credential) |
| `username` | STRING | UNIQUE, NOT NULL | Display name for user |
| `hashed_password` | STRING | NOT NULL | Bcrypt hashed password |
| `first_name` | STRING | NOT NULL | User's first name |
| `last_name` | STRING | NOT NULL | User's last name |
| `preferred_language` | STRING | NULLABLE | Legacy language preference |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |
| `is_admin` | BOOLEAN | DEFAULT FALSE | Administrative privileges |
| `is_evaluator` | BOOLEAN | DEFAULT FALSE | Evaluator role privileges |
| `guidelines_seen` | BOOLEAN | DEFAULT FALSE | Guidelines acknowledgment |
| `onboarding_status` | STRING | DEFAULT 'pending' | Onboarding progress status |
| `onboarding_score` | FLOAT | NULLABLE | Overall onboarding test score (0-100) |
| `onboarding_completed_at` | DATETIME | NULLABLE | Onboarding completion timestamp |
| `created_at` | DATETIME | DEFAULT NOW | Account creation timestamp |

**Indexes:**
- `ix_users_email` - Unique index on email
- `ix_users_username` - Unique index on username

**Relationships:**
- `annotations` → One-to-many with Annotations table
- `evaluations` → One-to-many with Evaluations table
- `mt_assessments` → One-to-many with MTQualityAssessment table
- `languages` → One-to-many with UserLanguages table
- `onboarding_tests` → One-to-many with OnboardingTests table

### UserLanguages Table

Supports multi-language preferences for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique language preference identifier |
| `user_id` | INTEGER | FOREIGN KEY | Reference to Users table |
| `language` | STRING | NOT NULL | Language code (e.g., 'en', 'fil', 'ceb') |

**Constraints:**
- `UNIQUE(user_id, language)` - Prevents duplicate language preferences per user

**Relationships:**
- `user` → Many-to-one with Users table

### Sentences Table

Stores source text and machine translations for annotation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique sentence identifier |
| `source_text` | TEXT | NOT NULL | Original text in source language |
| `machine_translation` | TEXT | NOT NULL | Machine-generated translation |
| `source_language` | STRING | NOT NULL | Source language code |
| `target_language` | STRING | NOT NULL | Target language code |
| `domain` | STRING | NULLABLE | Content domain (medical, legal, etc.) |
| `created_at` | DATETIME | DEFAULT NOW | Creation timestamp |
| `is_active` | BOOLEAN | DEFAULT TRUE | Sentence active status |

**Indexes:**
- `ix_sentences_source_language` - Index on source language
- `ix_sentences_target_language` - Index on target language
- `ix_sentences_domain` - Index on domain

**Relationships:**
- `annotations` → One-to-many with Annotations table
- `mt_assessments` → One-to-many with MTQualityAssessment table

### Annotations Table

Core annotation data with quality scores and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique annotation identifier |
| `sentence_id` | INTEGER | FOREIGN KEY | Reference to Sentences table |
| `annotator_id` | INTEGER | FOREIGN KEY | Reference to Users table |
| `fluency_score` | INTEGER | 1-5 scale | Translation fluency rating |
| `adequacy_score` | INTEGER | 1-5 scale | Translation adequacy rating |
| `overall_quality` | INTEGER | 1-5 scale | Overall quality rating |
| `errors_found` | TEXT | NULLABLE | Legacy JSON error data |
| `suggested_correction` | TEXT | NULLABLE | Legacy correction field |
| `comments` | TEXT | NULLABLE | General annotation comments |
| `final_form` | TEXT | NULLABLE | Final corrected translation |
| `voice_recording_url` | STRING | NULLABLE | Audio file path/URL |
| `voice_recording_duration` | INTEGER | NULLABLE | Audio duration in seconds |
| `time_spent_seconds` | INTEGER | NULLABLE | Time spent annotating |
| `annotation_status` | STRING | DEFAULT 'in_progress' | Annotation status |
| `created_at` | DATETIME | DEFAULT NOW | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT NOW | Last update timestamp |

**Indexes:**
- `ix_annotations_sentence_id` - Index on sentence_id
- `ix_annotations_annotator_id` - Index on annotator_id
- `ix_annotations_status` - Index on annotation_status

**Relationships:**
- `sentence` → Many-to-one with Sentences table
- `annotator` → Many-to-one with Users table
- `highlights` → One-to-many with TextHighlights table
- `evaluations` → One-to-many with Evaluations table

### TextHighlights Table

Detailed error annotation with precise text positioning.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique highlight identifier |
| `annotation_id` | INTEGER | FOREIGN KEY | Reference to Annotations table |
| `highlighted_text` | TEXT | NOT NULL | Selected text segment |
| `start_index` | INTEGER | NOT NULL | Start character position |
| `end_index` | INTEGER | NOT NULL | End character position |
| `text_type` | STRING | NOT NULL | Text type ('machine') |
| `comment` | TEXT | NOT NULL | Error description/comment |
| `error_type` | STRING | DEFAULT 'MI_SE' | Error classification |
| `created_at` | DATETIME | DEFAULT NOW | Creation timestamp |

**Error Types:**
- `MI_ST` - Minor Inaccuracy - Syntax/Terminology
- `MI_SE` - Minor Inaccuracy - Semantics  
- `MA_ST` - Major Inaccuracy - Syntax/Terminology
- `MA_SE` - Major Inaccuracy - Semantics

**Indexes:**
- `ix_texthighlights_annotation_id` - Index on annotation_id

**Relationships:**
- `annotation` → Many-to-one with Annotations table

### MTQualityAssessment Table

AI-powered machine translation quality evaluation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique assessment identifier |
| `sentence_id` | INTEGER | FOREIGN KEY | Reference to Sentences table |
| `evaluator_id` | INTEGER | FOREIGN KEY | Reference to Users table |
| `fluency_score` | FLOAT | 1-5 scale | AI-generated fluency score |
| `adequacy_score` | FLOAT | 1-5 scale | AI-generated adequacy score |
| `overall_quality_score` | FLOAT | 1-5 scale | AI-generated overall score |
| `syntax_errors` | TEXT | JSON | Detected syntax errors |
| `semantic_errors` | TEXT | JSON | Detected semantic errors |
| `quality_explanation` | TEXT | NOT NULL | AI-generated explanation |
| `correction_suggestions` | TEXT | JSON | Improvement suggestions |
| `model_confidence` | FLOAT | 0-1 scale | AI model confidence |
| `processing_time_ms` | INTEGER | NOT NULL | AI processing time |
| `time_spent_seconds` | INTEGER | NULLABLE | Human review time |
| `human_feedback` | TEXT | NULLABLE | Human evaluator feedback |
| `correction_notes` | TEXT | NULLABLE | Human correction notes |
| `evaluation_status` | STRING | DEFAULT 'pending' | Assessment status |
| `created_at` | DATETIME | DEFAULT NOW | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT NOW | Last update timestamp |

**Indexes:**
- `ix_mtquality_sentence_id` - Index on sentence_id
- `ix_mtquality_evaluator_id` - Index on evaluator_id

**Relationships:**
- `sentence` → Many-to-one with Sentences table
- `evaluator` → Many-to-one with Users table

### Evaluations Table

Human evaluation of annotation quality.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique evaluation identifier |
| `annotation_id` | INTEGER | FOREIGN KEY | Reference to Annotations table |
| `evaluator_id` | INTEGER | FOREIGN KEY | Reference to Users table |
| `annotation_quality_score` | INTEGER | 1-5 scale | Annotation quality rating |
| `accuracy_score` | INTEGER | 1-5 scale | Annotation accuracy rating |
| `completeness_score` | INTEGER | 1-5 scale | Annotation completeness rating |
| `overall_evaluation_score` | INTEGER | 1-5 scale | Overall evaluation score |
| `feedback` | TEXT | NULLABLE | Detailed evaluation feedback |
| `evaluation_notes` | TEXT | NULLABLE | Additional evaluator notes |
| `evaluation_status` | STRING | DEFAULT 'in_progress' | Evaluation status |
| `time_spent_seconds` | INTEGER | NULLABLE | Time spent evaluating |
| `created_at` | DATETIME | DEFAULT NOW | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT NOW | Last update timestamp |

**Indexes:**
- `ix_evaluations_annotation_id` - Index on annotation_id
- `ix_evaluations_evaluator_id` - Index on evaluator_id

**Relationships:**
- `annotation` → Many-to-one with Annotations table
- `evaluator` → Many-to-one with Users table

### OnboardingTests Table

User onboarding and qualification tests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Unique test identifier |
| `user_id` | INTEGER | FOREIGN KEY | Reference to Users table |
| `language` | STRING | NOT NULL | Test language |
| `test_data` | JSON | NOT NULL | Test questions and answers |
| `score` | FLOAT | NULLABLE | Test score (0-100) |
| `status` | STRING | DEFAULT 'in_progress' | Test status |
| `started_at` | DATETIME | DEFAULT NOW | Test start timestamp |
| `completed_at` | DATETIME | NULLABLE | Test completion timestamp |

**Indexes:**
- `ix_onboarding_user_id` - Index on user_id

**Relationships:**
- `user` → Many-to-one with Users table

## Data Relationships

### Primary Relationships

1. **Users → Annotations**: One-to-many relationship where each user can create multiple annotations
2. **Users → Evaluations**: One-to-many relationship where evaluators can evaluate multiple annotations
3. **Users → MTQualityAssessment**: One-to-many relationship where evaluators can assess multiple MT outputs
4. **Sentences → Annotations**: One-to-many relationship where each sentence can have multiple annotations
5. **Annotations → TextHighlights**: One-to-many relationship where each annotation can have multiple text highlights
6. **Annotations → Evaluations**: One-to-many relationship where each annotation can be evaluated multiple times

### Referential Integrity

- **CASCADE DELETE**: TextHighlights are deleted when their parent Annotation is deleted
- **RESTRICT DELETE**: Users cannot be deleted if they have associated annotations or evaluations
- **SET NULL**: Optional foreign key relationships allow null values

## Query Patterns

### Common Queries

**Get user's annotations with highlights:**
```sql
SELECT a.*, th.highlighted_text, th.error_type 
FROM annotations a
LEFT JOIN text_highlights th ON a.id = th.annotation_id
WHERE a.annotator_id = ?
ORDER BY a.created_at DESC
```

**Get pending evaluations for evaluator:**
```sql
SELECT a.*, s.source_text, s.machine_translation
FROM annotations a
JOIN sentences s ON a.sentence_id = s.id
WHERE a.annotation_status = 'completed'
AND a.id NOT IN (
    SELECT annotation_id FROM evaluations 
    WHERE evaluator_id = ?
)
```

**Get MT quality statistics:**
```sql
SELECT 
    AVG(fluency_score) as avg_fluency,
    AVG(adequacy_score) as avg_adequacy,
    AVG(overall_quality_score) as avg_overall,
    AVG(model_confidence) as avg_confidence
FROM mt_quality_assessments
WHERE evaluation_status = 'completed'
```

## Performance Considerations

### Indexing Strategy

- **Primary Keys**: All tables have auto-incrementing integer primary keys
- **Foreign Keys**: All foreign key columns are indexed for join performance
- **Status Fields**: Status columns are indexed for filtering
- **Timestamp Fields**: Created_at fields are indexed for time-based queries

### Query Optimization

- Use `LIMIT` clauses for pagination
- Filter by status before joining tables
- Use `EXISTS` instead of `IN` for large subqueries
- Consider composite indexes for multi-column filters

## Data Integrity

### Constraints

- **Unique Constraints**: Email and username are unique per user
- **Check Constraints**: Score fields are constrained to valid ranges
- **Foreign Key Constraints**: Maintain referential integrity
- **NOT NULL Constraints**: Required fields cannot be null

### Data Validation

- **Email Validation**: Performed at application layer
- **Score Validation**: 1-5 scale validation for quality scores
- **Status Validation**: Enum-like validation for status fields
- **Language Code Validation**: ISO language code validation

## Migration Strategy

### Schema Evolution

1. **Version Control**: Each schema change has a migration script
2. **Backward Compatibility**: New columns are nullable or have defaults
3. **Data Preservation**: Migrations preserve existing data
4. **Rollback Support**: Down migrations available for rollback

### Migration Scripts

Located in `/backend/migrate_*.py`:
- `migrate_db.py` - Core schema migrations
- `migrate_evaluator.py` - Evaluator role additions
- `migrate_mt_quality.py` - MT quality assessment features
- `migrate_onboarding.py` - Onboarding system
- `migrate_voice_recording.py` - Voice recording features

## Security Considerations

### Data Protection

- **Password Hashing**: Bcrypt with salt for password storage
- **No Sensitive Data**: Personal information is minimal
- **Audit Trail**: Timestamps track all data modifications
- **Access Control**: Role-based access at application layer

### Privacy

- **Data Minimization**: Only collect necessary data
- **User Consent**: Explicit consent for data processing
- **Right to Deletion**: Support for data deletion requests
- **Anonymization**: Research data can be anonymized

## Backup and Recovery

### Backup Strategy

- **Full Backups**: Daily full database backups
- **Incremental Backups**: Hourly incremental backups
- **Point-in-Time Recovery**: Transaction log backups
- **Cross-Region Replication**: Disaster recovery backups

### Data Retention

- **Active Data**: Indefinite retention for active research
- **Completed Projects**: 7-year retention for academic records
- **User Data**: Retention based on user consent
- **Audit Logs**: 3-year retention for security auditing

---

**Last Updated**: January 2024
**Schema Version**: 1.0.0
**Compatible Database**: SQLite 3.35+, PostgreSQL 12+ 