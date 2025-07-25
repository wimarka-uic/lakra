from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from config import settings

# Use settings from config
SQLALCHEMY_DATABASE_URL = settings.database_url

# Create PostgreSQL engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_timeout=settings.db_pool_timeout,
    pool_recycle=settings.db_pool_recycle,
    pool_pre_ping=True  # Verify connections before use
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    preferred_language = Column(String)  # Legacy field, keeping for backward compatibility
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_evaluator = Column(Boolean, default=False)  # New field for evaluator role
    guidelines_seen = Column(Boolean, default=False)
    onboarding_status = Column(String, default='pending')  # 'pending', 'in_progress', 'completed', 'failed'
    onboarding_score = Column(Float, nullable=True)  # Overall onboarding test score (0-100)
    onboarding_completed_at = Column(DateTime, nullable=True)  # When onboarding was completed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    annotations = relationship("Annotation", back_populates="annotator")
    evaluations = relationship("Evaluation", back_populates="evaluator")
    mt_assessments = relationship("MTQualityAssessment", back_populates="evaluator")
    languages = relationship("UserLanguage", back_populates="user")
    onboarding_tests = relationship("OnboardingTest", back_populates="user")

class UserLanguage(Base):
    __tablename__ = "user_languages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    language = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="languages")

class Sentence(Base):
    __tablename__ = "sentences"
    
    id = Column(Integer, primary_key=True, index=True)
    source_text = Column(Text)
    machine_translation = Column(Text)
    source_language = Column(String)
    target_language = Column(String)
    domain = Column(String, nullable=True)  # e.g., medical, legal, technical
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    annotations = relationship("Annotation", back_populates="sentence")
    mt_assessments = relationship("MTQualityAssessment", back_populates="sentence")

class TextHighlight(Base):
    __tablename__ = "text_highlights"
    
    id = Column(Integer, primary_key=True, index=True)
    annotation_id = Column(Integer, ForeignKey("annotations.id"), index=True)
    
    # Text segment information
    highlighted_text = Column(Text)  # The actual highlighted text
    start_index = Column(Integer)  # Start character position in the text
    end_index = Column(Integer)  # End character position in the text
    text_type = Column(String)  # 'machine' only - which text this highlight belongs to
    
    # Annotation details
    comment = Column(Text)  # User's comment about this highlight
    error_type = Column(String, default='MI_SE')  # Error type: MI_ST, MI_SE, MA_ST, MA_SE
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    annotation = relationship("Annotation", back_populates="highlights")

class Annotation(Base):
    __tablename__ = "annotations"
    
    id = Column(Integer, primary_key=True, index=True)
    sentence_id = Column(Integer, ForeignKey("sentences.id"))
    annotator_id = Column(Integer, ForeignKey("users.id"))
    
    # Quality ratings (1-5 scale)
    fluency_score = Column(Integer)  # How fluent is the translation
    adequacy_score = Column(Integer)  # How adequate is the translation
    overall_quality = Column(Integer)  # Overall quality assessment
    
    # Legacy text fields (for backward compatibility)
    errors_found = Column(Text)  # Legacy field - JSON string of error categories and descriptions
    suggested_correction = Column(Text)  # Legacy field - Suggested improved translation
    comments = Column(Text)  # General comments (in addition to highlight-specific comments)
    final_form = Column(Text)  # Final corrected form of the sentence
    
    # Voice recording for final form
    voice_recording_url = Column(String, nullable=True)  # URL/path to audio file
    voice_recording_duration = Column(Integer, nullable=True)  # Duration in seconds
    
    # Metadata
    time_spent_seconds = Column(Integer)  # Time spent on annotation
    annotation_status = Column(String, default="in_progress")  # in_progress, completed, reviewed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sentence = relationship("Sentence", back_populates="annotations")
    annotator = relationship("User", back_populates="annotations")
    highlights = relationship("TextHighlight", back_populates="annotation", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="annotation")

# Machine Translation Quality Assessment table
class MTQualityAssessment(Base):
    __tablename__ = "mt_quality_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    sentence_id = Column(Integer, ForeignKey("sentences.id"))
    evaluator_id = Column(Integer, ForeignKey("users.id"))
    
    # Core quality scores (1-5 scale) 
    fluency_score = Column(Float)           # How natural and grammatically correct
    adequacy_score = Column(Float)          # How well it conveys source meaning  
    overall_quality_score = Column(Float)   # Overall translation quality
    
    # Error analysis (JSON stored as text)
    syntax_errors = Column(Text)            # JSON array of syntax errors
    semantic_errors = Column(Text)          # JSON array of semantic errors
    
    # Quality explanation and suggestions
    quality_explanation = Column(Text)      # AI-generated explanation
    correction_suggestions = Column(Text)   # JSON array of suggestions
    
    # Processing metadata
    model_confidence = Column(Float)        # DistilBERT confidence score (0-1)
    processing_time_ms = Column(Integer)    # Time taken for AI analysis
    time_spent_seconds = Column(Integer)    # Human evaluator time (optional)
    
    # Human feedback (optional overrides)
    human_feedback = Column(Text)           # Additional human feedback
    correction_notes = Column(Text)         # Human correction notes
    
    # Status tracking
    evaluation_status = Column(String, default="pending")  # pending, completed, reviewed
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sentence = relationship("Sentence", back_populates="mt_assessments")
    evaluator = relationship("User", back_populates="mt_assessments")

# Existing Evaluation class (kept for backward compatibility)
class Evaluation(Base):
    __tablename__ = "evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    annotation_id = Column(Integer, ForeignKey("annotations.id"))
    evaluator_id = Column(Integer, ForeignKey("users.id"))
    
    # Evaluation scores (1-5 scale)
    annotation_quality_score = Column(Integer)  # How well the annotator did their job
    accuracy_score = Column(Integer)  # How accurate is the annotation
    completeness_score = Column(Integer)  # How complete is the annotation
    overall_evaluation_score = Column(Integer)  # Overall evaluation of the annotation
    
    # Evaluation feedback
    feedback = Column(Text)  # Evaluator's feedback on the annotation
    evaluation_notes = Column(Text)  # Additional notes from evaluator
    
    # Evaluation status
    evaluation_status = Column(String, default="in_progress")  # in_progress, completed
    time_spent_seconds = Column(Integer)  # Time spent on evaluation
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    annotation = relationship("Annotation", back_populates="evaluations")
    evaluator = relationship("User", back_populates="evaluations")

class OnboardingTest(Base):
    __tablename__ = "onboarding_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    language = Column(String)  # Language being tested
    test_data = Column(JSON)  # Test questions and answers in JSON format
    score = Column(Float, nullable=True)  # Test score (0-100)
    status = Column(String, default='in_progress')  # 'in_progress', 'completed', 'failed'
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="onboarding_tests")

class LanguageProficiencyQuestion(Base):
    __tablename__ = "language_proficiency_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    language = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False, index=True)  # 'grammar', 'vocabulary', 'translation', 'cultural', 'comprehension'
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # Array of options as JSON
    correct_answer = Column(Integer, nullable=False)  # Index of correct option (0-based)
    explanation = Column(Text, nullable=False)
    difficulty = Column(String, nullable=False, index=True)  # 'basic', 'intermediate', 'advanced'
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    user_answers = relationship("UserQuestionAnswer", back_populates="question")

class UserQuestionAnswer(Base):
    __tablename__ = "user_question_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("language_proficiency_questions.id"), nullable=False, index=True)
    selected_answer = Column(Integer, nullable=False)  # Index of selected option
    is_correct = Column(Boolean, nullable=False)
    answered_at = Column(DateTime, default=datetime.utcnow)
    test_session_id = Column(String, nullable=True, index=True)  # To group answers from the same test session
    
    # Relationships
    user = relationship("User")
    question = relationship("LanguageProficiencyQuestion", back_populates="user_answers")

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()