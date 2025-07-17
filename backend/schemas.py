from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    preferred_language: Optional[str] = None  # Keeping for backward compatibility
    languages: Optional[List[str]] = []  # New field for multiple languages

class UserCreate(UserBase):
    password: str
    is_evaluator: Optional[bool] = False

class AdminUserCreate(UserBase):
    password: str
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False
    is_evaluator: Optional[bool] = False
    skip_onboarding: Optional[bool] = False

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    preferred_language: Optional[str] = None
    languages: Optional[List[str]] = None

class UserLogin(BaseModel):
    email: str  # Changed from EmailStr to str to accept both email and username
    password: str

class UserLanguageBase(BaseModel):
    language: str

class UserLanguageResponse(UserLanguageBase):
    id: int
    user_id: int

    model_config = {
        "from_attributes": True
    }

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    is_evaluator: bool = False
    guidelines_seen: bool
    onboarding_status: str = 'pending'
    onboarding_score: Optional[float] = None
    onboarding_completed_at: Optional[datetime] = None
    created_at: datetime
    languages: List[str] = []  # Include the languages in the response

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }
    
    @classmethod
    def from_orm(cls, obj):
        """Compatibility method for older code using from_orm"""
        # Create a dict from the model to avoid direct attribute access issues
        obj_dict = {
            "id": getattr(obj, "id", None),
            "email": getattr(obj, "email", ""),
            "username": getattr(obj, "username", ""),
            "first_name": getattr(obj, "first_name", ""),
            "last_name": getattr(obj, "last_name", ""),
            "preferred_language": getattr(obj, "preferred_language", ""),
            "is_active": getattr(obj, "is_active", True),
            "is_admin": getattr(obj, "is_admin", False),
            "is_evaluator": getattr(obj, "is_evaluator", False),
            "guidelines_seen": getattr(obj, "guidelines_seen", False),
            "onboarding_status": getattr(obj, "onboarding_status", "pending"),
            "onboarding_score": getattr(obj, "onboarding_score", None),
            "onboarding_completed_at": getattr(obj, "onboarding_completed_at", None),
            "created_at": getattr(obj, "created_at", datetime.utcnow())
        }
        
        # Extract language strings from UserLanguage objects
        languages = []
        if hasattr(obj, "languages") and obj.languages:
            for lang_obj in obj.languages:
                if hasattr(lang_obj, "language"):
                    languages.append(lang_obj.language)
                elif isinstance(lang_obj, str):
                    languages.append(lang_obj)
        
        # Create instance from dict
        instance = cls(**obj_dict)
        instance.languages = languages
        return instance

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Sentence schemas
class SentenceBase(BaseModel):
    source_text: str
    machine_translation: str
    source_language: str
    target_language: str
    domain: Optional[str] = None

class SentenceCreate(SentenceBase):
    pass

class SentenceResponse(SentenceBase):
    id: int
    created_at: datetime
    is_active: bool

    model_config = {
        "from_attributes": True
    }

# Text Highlight schemas
class TextHighlightBase(BaseModel):
    highlighted_text: str
    start_index: int
    end_index: int
    text_type: str  # 'machine' only
    comment: str
    error_type: Optional[str] = 'MI_SE'  # MI_ST, MI_SE, MA_ST, MA_SE

class TextHighlightCreate(TextHighlightBase):
    pass

class TextHighlightResponse(TextHighlightBase):
    id: int
    annotation_id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

# Annotation schemas
class AnnotationBase(BaseModel):
    fluency_score: Optional[int] = None
    adequacy_score: Optional[int] = None
    overall_quality: Optional[int] = None
    errors_found: Optional[str] = None  # Legacy field
    suggested_correction: Optional[str] = None  # Legacy field
    comments: Optional[str] = None  # General comments
    final_form: Optional[str] = None  # Final corrected form of the sentence
    voice_recording_url: Optional[str] = None  # URL/path to audio file
    voice_recording_duration: Optional[int] = None  # Duration in seconds
    time_spent_seconds: Optional[int] = None

class AnnotationCreate(AnnotationBase):
    sentence_id: int
    highlights: Optional[List[TextHighlightCreate]] = []  # New highlight-based annotations

class AnnotationUpdate(AnnotationBase):
    annotation_status: Optional[str] = None
    highlights: Optional[List[TextHighlightCreate]] = None  # Allow updating highlights

class AnnotationResponse(AnnotationBase):
    id: int
    sentence_id: int
    annotator_id: int
    annotation_status: str
    created_at: datetime
    updated_at: datetime
    sentence: SentenceResponse
    annotator: UserResponse
    highlights: List[TextHighlightResponse] = []  # Include highlights in response

    model_config = {
        "from_attributes": True
    }



    model_config = {
        "from_attributes": True
    }

# Admin schemas
class AdminStats(BaseModel):
    total_users: int
    total_sentences: int
    total_annotations: int
    completed_annotations: int
    active_users: int

# Evaluation schemas
class EvaluationBase(BaseModel):
    annotation_quality_score: Optional[int] = None
    accuracy_score: Optional[int] = None
    completeness_score: Optional[int] = None
    overall_evaluation_score: Optional[int] = None
    feedback: Optional[str] = None
    evaluation_notes: Optional[str] = None
    time_spent_seconds: Optional[int] = None

class EvaluationCreate(EvaluationBase):
    annotation_id: int

class EvaluationUpdate(EvaluationBase):
    evaluation_status: Optional[str] = None

class EvaluationResponse(EvaluationBase):
    id: int
    annotation_id: int
    evaluator_id: int
    evaluation_status: str
    created_at: datetime
    updated_at: datetime
    annotation: AnnotationResponse
    evaluator: UserResponse

    model_config = {
        "from_attributes": True
    }

# Evaluator stats schema
class EvaluatorStats(BaseModel):
    total_evaluations: int
    completed_evaluations: int
    pending_evaluations: int
    average_time_per_evaluation: float

class UserStats(BaseModel):
    user: UserResponse
    total_annotations: int
    completed_annotations: int
    average_time_per_annotation: float

# Machine Translation Quality Assessment schemas
class SyntaxErrorSchema(BaseModel):
    error_type: str  # 'grammar', 'word_order', 'punctuation', 'capitalization'
    severity: str   # 'minor', 'major', 'critical' 
    start_position: int
    end_position: int
    text_span: str
    description: str
    suggested_fix: Optional[str] = None

class SemanticErrorSchema(BaseModel):
    error_type: str  # 'mistranslation', 'omission', 'addition', 'wrong_sense'
    severity: str   # 'minor', 'major', 'critical'
    start_position: int
    end_position: int
    text_span: str
    description: str
    suggested_fix: Optional[str] = None

class MTQualityAssessmentBase(BaseModel):
    fluency_score: float
    adequacy_score: float
    overall_quality_score: float
    syntax_errors: List[SyntaxErrorSchema] = []
    semantic_errors: List[SemanticErrorSchema] = []
    quality_explanation: str
    correction_suggestions: List[str] = []
    model_confidence: float
    processing_time_ms: int
    time_spent_seconds: Optional[int] = None
    human_feedback: Optional[str] = None
    correction_notes: Optional[str] = None
    evaluation_status: str = "pending"

class MTQualityAssessmentCreate(BaseModel):
    sentence_id: int
    # Optional manual overrides (if evaluator disagrees with AI)
    fluency_score: Optional[float] = None
    adequacy_score: Optional[float] = None
    overall_quality_score: Optional[float] = None
    
    # Additional human feedback
    human_feedback: Optional[str] = None
    correction_notes: Optional[str] = None
    time_spent_seconds: Optional[int] = None

class MTQualityAssessmentUpdate(BaseModel):
    fluency_score: Optional[float] = None
    adequacy_score: Optional[float] = None
    overall_quality_score: Optional[float] = None
    human_feedback: Optional[str] = None
    correction_notes: Optional[str] = None
    time_spent_seconds: Optional[int] = None
    evaluation_status: Optional[str] = None

class MTQualityAssessmentResponse(MTQualityAssessmentBase):
    id: int
    sentence_id: int
    evaluator_id: int
    created_at: datetime
    updated_at: datetime
    sentence: SentenceResponse
    evaluator: UserResponse

    model_config = {
        "from_attributes": True
    }

# Updated Evaluator Stats for MT Quality focus
class MTEvaluatorStats(BaseModel):
    total_assessments: int
    completed_assessments: int
    pending_assessments: int
    average_time_per_assessment: float
    
    # Quality metrics
    average_fluency_score: float
    average_adequacy_score: float
    average_overall_score: float
    
    # Error detection stats
    total_syntax_errors_found: int
    total_semantic_errors_found: int
    
    # Model performance
    average_model_confidence: float
    human_agreement_rate: float  # % of times human agrees with AI assessment

# Legacy evaluation schemas (kept for backward compatibility)
class EvaluationResponse(EvaluationBase):
    id: int
    annotation_id: int
    evaluator_id: int
    evaluation_status: str
    created_at: datetime
    updated_at: datetime
    annotation: AnnotationResponse
    evaluator: UserResponse

# Onboarding Test schemas
class OnboardingTestQuestion(BaseModel):
    id: str
    source_text: str
    machine_translation: str
    source_language: str
    target_language: str
    correct_fluency_score: int  # Expected score 1-5
    correct_adequacy_score: int  # Expected score 1-5
    error_types: List[str] = []  # Expected error types to be identified
    explanation: str  # Explanation of why these scores are correct

class OnboardingTestCreate(BaseModel):
    language: str



class OnboardingTestResponse(BaseModel):
    id: int
    user_id: int
    language: str
    test_data: dict
    score: Optional[float] = None
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

# Language Proficiency Question schemas
class LanguageProficiencyQuestionBase(BaseModel):
    language: str
    type: str  # 'grammar', 'vocabulary', 'translation', 'cultural', 'comprehension'
    question: str
    options: List[str]  # Array of options
    correct_answer: int  # Index of correct option (0-based)
    explanation: str
    difficulty: str  # 'basic', 'intermediate', 'advanced'

class LanguageProficiencyQuestionCreate(LanguageProficiencyQuestionBase):
    is_active: Optional[bool] = True

class LanguageProficiencyQuestionUpdate(BaseModel):
    language: Optional[str] = None
    type: Optional[str] = None
    question: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[int] = None
    explanation: Optional[str] = None
    difficulty: Optional[str] = None
    is_active: Optional[bool] = None

class LanguageProficiencyQuestionResponse(LanguageProficiencyQuestionBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    model_config = {
        "from_attributes": True
    }

# For the frontend test (without correct answer and explanation)
class LanguageProficiencyQuestionPublic(BaseModel):
    id: int
    language: str
    type: str
    question: str
    options: List[str]
    difficulty: str

    model_config = {
        "from_attributes": True
    }

# User Question Answer schemas
class UserQuestionAnswerBase(BaseModel):
    question_id: int
    selected_answer: int

class UserQuestionAnswerCreate(UserQuestionAnswerBase):
    test_session_id: Optional[str] = None

class UserQuestionAnswerResponse(UserQuestionAnswerBase):
    id: int
    user_id: int
    is_correct: bool
    answered_at: datetime
    test_session_id: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

# Test submission schema
class OnboardingTestSubmission(BaseModel):
    test_session_id: str
    answers: List[UserQuestionAnswerCreate]
    languages: List[str]  # Languages being tested

# Test results schema
class OnboardingTestResults(BaseModel):
    total_questions: int
    correct_answers: int
    score: float  # Percentage (0-100)
    passed: bool  # True if score >= 70
    questions_by_language: dict  # Results breakdown by language
    session_id: str
    updated_user: Optional[UserResponse] = None  # Updated user data when passed