from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import List, Optional
import json
import os
import uuid
import shutil
from pathlib import Path

from evaluator import DistilBERTMTEvaluator, evaluate_mt_quality

from database import get_db, create_tables, User, Sentence, Annotation, TextHighlight, UserLanguage, Evaluation, MTQualityAssessment, OnboardingTest, LanguageProficiencyQuestion, UserQuestionAnswer
from config import settings
from auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash, 
    get_current_user, 
    get_current_admin_user,
    get_current_evaluator_user,
    get_current_admin_or_evaluator_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from schemas import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    UserProfileUpdate,
    Token,
    SentenceCreate,
    SentenceResponse,
    AnnotationCreate,
    AnnotationUpdate,
    AnnotationResponse,
    TextHighlightCreate,
    TextHighlightResponse,
    EvaluationCreate,
    EvaluationUpdate,
    EvaluationResponse,
    AdminStats,
    UserStats,
    EvaluatorStats,
    MTQualityAssessmentCreate,
    MTQualityAssessmentUpdate,
    MTQualityAssessmentResponse,
    MTEvaluatorStats,
    SyntaxErrorSchema,
    SemanticErrorSchema,
    OnboardingTestCreate,
    OnboardingTestSubmission,
    OnboardingTestResponse,
    OnboardingTestQuestion,
    LanguageProficiencyQuestionCreate,
    LanguageProficiencyQuestionUpdate,
    LanguageProficiencyQuestionResponse,
    OnboardingTestResults,
    AdminUserCreate
)

app = FastAPI(title="Lakra - Annotation Tool for WiMarka", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,  # Use config from environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory for voice recordings
UPLOAD_DIR = Path("uploads/audio")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files for serving audio files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Create tables on startup
@app.on_event("startup")
def startup_event():
    create_tables()

# Authentication endpoints
@app.post("/api/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        preferred_language=user_data.preferred_language if user_data.preferred_language else user_data.languages[0] if user_data.languages else "tagalog",
        hashed_password=hashed_password,
        is_evaluator=getattr(user_data, 'is_evaluator', False)
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Add user languages if specified
    if user_data.languages and len(user_data.languages) > 0:
        for language in user_data.languages:
            user_language = UserLanguage(user_id=db_user.id, language=language)
            db.add(user_language)
        db.commit()
    # If no languages specified but preferred_language is set, use that
    elif user_data.preferred_language:
        user_language = UserLanguage(user_id=db_user.id, language=user_data.preferred_language)
        db.add(user_language)
        db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    # Refresh user to ensure we have the latest data including languages relationship
    db.refresh(db_user)
    
    # Create a response with user data
    user_response = UserResponse.from_orm(db_user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@app.post("/api/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Create a response with user data and languages
    # UserResponse.from_orm now handles languages conversion properly
    user_data = UserResponse.from_orm(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }



def convert_user_to_response(db: Session, user: User) -> UserResponse:
    """Helper function to convert a User model to UserResponse with proper language strings"""
    # Since UserResponse.from_orm now properly handles language extraction, we can use it directly
    return UserResponse.from_orm(user)

@app.get("/api/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fresh query to ensure we get the latest data from database
    fresh_user = db.query(User).filter(User.id == current_user.id).first()
    if not fresh_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Refresh the session to ensure we get latest data
    db.refresh(fresh_user)
    
    # Return user data with properly extracted languages
    return UserResponse.from_orm(fresh_user)

@app.put("/api/me/guidelines-seen", response_model=UserResponse)
def mark_guidelines_seen(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.guidelines_seen = True
    db.commit()
    db.refresh(current_user)
    
    # Process the user to ensure languages are properly handled
    return convert_user_to_response(db, current_user)

@app.put("/api/me/profile", response_model=UserResponse)
def update_user_profile(
    profile_update: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Update profile fields if provided
    if profile_update.first_name is not None:
        current_user.first_name = profile_update.first_name
    
    if profile_update.last_name is not None:
        current_user.last_name = profile_update.last_name
    
    if profile_update.preferred_language is not None:
        current_user.preferred_language = profile_update.preferred_language
    
    # Handle languages update
    if profile_update.languages is not None:
        # Get existing language associations
        existing_languages = db.query(UserLanguage).filter(UserLanguage.user_id == current_user.id).all()
        existing_language_names = {lang.language for lang in existing_languages}
        new_language_names = set(profile_update.languages)
        
        # Remove languages that are no longer in the list
        languages_to_remove = existing_language_names - new_language_names
        if languages_to_remove:
            db.query(UserLanguage).filter(
                UserLanguage.user_id == current_user.id,
                UserLanguage.language.in_(languages_to_remove)
            ).delete(synchronize_session=False)
        
        # Add new languages that don't already exist
        languages_to_add = new_language_names - existing_language_names
        for language in languages_to_add:
            user_language = UserLanguage(user_id=current_user.id, language=language)
            db.add(user_language)
    
    db.commit()
    db.refresh(current_user)
    
    # Process the user to ensure languages are properly handled
    return convert_user_to_response(db, current_user)

# Helper function to check onboarding completion
def check_onboarding_completed(user: User):
    """Check if user has completed onboarding test and raise exception if not"""
    if user.onboarding_status != 'completed':
        status_messages = {
            'pending': 'You need to complete the onboarding test before you can access annotation features.',
            'in_progress': 'Please complete your onboarding test to access annotation features.',
            'failed': 'You need to pass the onboarding test before you can access annotation features. Please retake the test.'
        }
        message = status_messages.get(user.onboarding_status, 'Please complete your onboarding test.')
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message
        )

# Sentence management endpoints
@app.post("/api/sentences", response_model=SentenceResponse)
def create_sentence(
    sentence_data: SentenceCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_sentence = Sentence(**sentence_data.dict())
    db.add(db_sentence)
    db.commit()
    db.refresh(db_sentence)
    return db_sentence

@app.get("/api/sentences", response_model=List[SentenceResponse])
def get_sentences(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sentences = db.query(Sentence).filter(Sentence.is_active == True).offset(skip).limit(limit).all()
    return sentences

# Get next sentence for annotation
@app.get("/api/sentences/next", response_model=Optional[SentenceResponse])
def get_next_sentence(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user has completed onboarding
    check_onboarding_completed(current_user)
    
    # Find sentences that haven't been annotated by this user and match their preferred language
    next_sentence = db.query(Sentence).filter(
        Sentence.is_active == True,
        Sentence.target_language == current_user.preferred_language
    ).filter(
        ~db.query(Annotation).filter(
            Annotation.sentence_id == Sentence.id,
            Annotation.annotator_id == current_user.id
        ).exists()
    ).first()
    
    return next_sentence

# Get multiple unannotated sentences for sheet view
@app.get("/api/sentences/unannotated", response_model=List[SentenceResponse])
def get_unannotated_sentences(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user has completed onboarding
    check_onboarding_completed(current_user)
    
    # Find sentences that haven't been annotated by this user and match their preferred language
    unannotated_sentences = db.query(Sentence).filter(
        Sentence.is_active == True,
        Sentence.target_language == current_user.preferred_language
    ).filter(
        ~db.query(Annotation).filter(
            Annotation.sentence_id == Sentence.id,
            Annotation.annotator_id == current_user.id
        ).exists()
    ).offset(skip).limit(limit).all()
    
    return unannotated_sentences

@app.get("/api/sentences/{sentence_id}", response_model=SentenceResponse)
def get_sentence(
    sentence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sentence = db.query(Sentence).filter(Sentence.id == sentence_id).first()
    if not sentence:
        raise HTTPException(status_code=404, detail="Sentence not found")
    return sentence

# Annotation endpoints
@app.post("/api/annotations", response_model=AnnotationResponse)
def create_annotation(
    annotation_data: AnnotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user has completed onboarding
    check_onboarding_completed(current_user)
    
    # Check if user already annotated this sentence
    existing_annotation = db.query(Annotation).filter(
        Annotation.sentence_id == annotation_data.sentence_id,
        Annotation.annotator_id == current_user.id
    ).first()
    
    if existing_annotation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already annotated this sentence"
        )
    
    # Create the main annotation
    annotation_dict = annotation_data.model_dump(exclude={'highlights'})
    db_annotation = Annotation(
        **annotation_dict,
        annotator_id=current_user.id,
        annotation_status="completed"
    )
    
    db.add(db_annotation)
    db.flush()  # Flush to get the annotation ID
    
    # Create associated highlights (deduplicate by start_index, end_index, text_type, comment)
    if annotation_data.highlights:
        unique_highlights = []
        seen = set()
        for h in annotation_data.highlights:
            key = (h.start_index, h.end_index, h.text_type, h.comment)
            if key not in seen:
                seen.add(key)
                unique_highlights.append(h)
        for highlight_data in unique_highlights:
            db_highlight = TextHighlight(
                annotation_id=db_annotation.id,
                highlighted_text=highlight_data.highlighted_text,
                start_index=highlight_data.start_index,
                end_index=highlight_data.end_index,
                text_type=highlight_data.text_type,
                comment=highlight_data.comment
            )
            db.add(db_highlight)
    
    db.commit()
    db.refresh(db_annotation)
    
    # Return properly formatted response
    return {
        "id": db_annotation.id,
        "sentence_id": db_annotation.sentence_id,
        "annotator_id": db_annotation.annotator_id,
        "annotation_status": db_annotation.annotation_status,
        "created_at": db_annotation.created_at,
        "updated_at": db_annotation.updated_at,
        "fluency_score": db_annotation.fluency_score,
        "adequacy_score": db_annotation.adequacy_score,
        "overall_quality": db_annotation.overall_quality,
        "errors_found": db_annotation.errors_found,
        "suggested_correction": db_annotation.suggested_correction,
        "comments": db_annotation.comments,
        "final_form": db_annotation.final_form,
        "time_spent_seconds": db_annotation.time_spent_seconds,
        "sentence": db_annotation.sentence,
        "annotator": UserResponse.from_orm(db_annotation.annotator),
        "highlights": db_annotation.highlights or []
    }



@app.put("/api/annotations/{annotation_id}", response_model=AnnotationResponse)
def update_annotation(
    annotation_id: int,
    annotation_data: AnnotationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user has completed onboarding
    check_onboarding_completed(current_user)
    
    annotation = db.query(Annotation).filter(
        Annotation.id == annotation_id,
        Annotation.annotator_id == current_user.id
    ).first()
    
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    
    # Update annotation fields
    update_data = annotation_data.model_dump(exclude_unset=True, exclude={'highlights'})
    for field, value in update_data.items():
        setattr(annotation, field, value)
    
    # Update highlights if provided (deduplicate)
    if annotation_data.highlights is not None:
        db.query(TextHighlight).filter(TextHighlight.annotation_id == annotation_id).delete()
        unique_highlights = []
        seen = set()
        for h in annotation_data.highlights:
            key = (h.start_index, h.end_index, h.text_type, h.comment)
            if key not in seen:
                seen.add(key)
                unique_highlights.append(h)
        for highlight_data in unique_highlights:
            db_highlight = TextHighlight(
                annotation_id=annotation_id,
                highlighted_text=highlight_data.highlighted_text,
                start_index=highlight_data.start_index,
                end_index=highlight_data.end_index,
                text_type=highlight_data.text_type,
                comment=highlight_data.comment
            )
            db.add(db_highlight)
    
    db.commit()
    db.refresh(annotation)
    
    # Return properly formatted response
    return {
        "id": annotation.id,
        "sentence_id": annotation.sentence_id,
        "annotator_id": annotation.annotator_id,
        "annotation_status": annotation.annotation_status,
        "created_at": annotation.created_at,
        "updated_at": annotation.updated_at,
        "fluency_score": annotation.fluency_score,
        "adequacy_score": annotation.adequacy_score,
        "overall_quality": annotation.overall_quality,
        "errors_found": annotation.errors_found,
        "suggested_correction": annotation.suggested_correction,
        "comments": annotation.comments,
        "final_form": annotation.final_form,
        "time_spent_seconds": annotation.time_spent_seconds,
        "sentence": annotation.sentence,
        "annotator": UserResponse.from_orm(annotation.annotator),
        "highlights": annotation.highlights or []
    }

@app.get("/api/annotations", response_model=List[AnnotationResponse])
def get_my_annotations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    annotations = db.query(Annotation).filter(
        Annotation.annotator_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    # Convert to proper response format to handle language serialization
    response_annotations = []
    for annotation in annotations:
        # Create annotation dict
        annotation_dict = {
            "id": annotation.id,
            "sentence_id": annotation.sentence_id,
            "annotator_id": annotation.annotator_id,
            "annotation_status": annotation.annotation_status,
            "created_at": annotation.created_at,
            "updated_at": annotation.updated_at,
            "fluency_score": annotation.fluency_score,
            "adequacy_score": annotation.adequacy_score,
            "overall_quality": annotation.overall_quality,
            "errors_found": annotation.errors_found,
            "suggested_correction": annotation.suggested_correction,
            "comments": annotation.comments,
            "final_form": annotation.final_form,
            "time_spent_seconds": annotation.time_spent_seconds,
            "sentence": annotation.sentence,
            "annotator": UserResponse.from_orm(annotation.annotator),
            "highlights": annotation.highlights or []
        }
        response_annotations.append(annotation_dict)
    
    return response_annotations

@app.delete("/api/annotations/{annotation_id}")
def delete_annotation(
    annotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find the annotation
    annotation = db.query(Annotation).filter(
        Annotation.id == annotation_id,
        Annotation.annotator_id == current_user.id
    ).first()
    
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    
    # Delete associated highlights first (cascade should handle this, but being explicit)
    db.query(TextHighlight).filter(TextHighlight.annotation_id == annotation_id).delete()
    
    # Delete any evaluations associated with this annotation
    db.query(Evaluation).filter(Evaluation.annotation_id == annotation_id).delete()
    
    # Delete the annotation
    db.delete(annotation)
    db.commit()
    
    return {"message": "Annotation deleted successfully"}

# Admin endpoints
@app.get("/api/admin/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    total_users = db.query(User).count()
    total_sentences = db.query(Sentence).count()
    total_annotations = db.query(Annotation).count()
    completed_annotations = db.query(Annotation).filter(
        Annotation.annotation_status == "completed"
    ).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    return AdminStats(
        total_users=total_users,
        total_sentences=total_sentences,
        total_annotations=total_annotations,
        completed_annotations=completed_annotations,
        active_users=active_users
    )

@app.get("/api/admin/sentences", response_model=List[SentenceResponse])
def get_admin_sentences(
    skip: int = 0,
    limit: int = 100,
    target_language: Optional[str] = None,
    source_language: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    query = db.query(Sentence)
    
    if target_language:
        query = query.filter(Sentence.target_language == target_language)
    if source_language:
        query = query.filter(Sentence.source_language == source_language)
    
    sentences = query.offset(skip).limit(limit).all()
    return sentences

@app.get("/api/admin/sentences/counts")
def get_sentence_counts_by_language(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get sentence counts grouped by target language."""
    from sqlalchemy import func
    
    # Get counts by target language
    target_counts = db.query(
        Sentence.target_language,
        func.count(Sentence.id).label('count')
    ).group_by(Sentence.target_language).all()
    
    # Convert to dictionary
    counts = {}
    total = 0
    for language, count in target_counts:
        counts[language] = count
        total += count
    
    # Add total count
    counts['all'] = total
    
    return counts

@app.get("/api/admin/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    users = db.query(User).offset(skip).limit(limit).all()
    
    # Convert to proper response format to handle language serialization
    response_users = []
    for user in users:
        response_users.append(UserResponse.from_orm(user))
    
    return response_users

@app.post("/api/admin/users", response_model=UserResponse)
def create_admin_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new user with specified roles (admin access required)"""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        preferred_language=user_data.preferred_language if user_data.preferred_language else user_data.languages[0] if user_data.languages else "en",
        hashed_password=hashed_password,
        is_active=user_data.is_active,
        is_admin=user_data.is_admin,
        is_evaluator=user_data.is_evaluator,
        onboarding_status='completed' if user_data.skip_onboarding else 'pending'
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Add user languages if specified
    if user_data.languages and len(user_data.languages) > 0:
        for language in user_data.languages:
            user_language = UserLanguage(user_id=db_user.id, language=language)
            db.add(user_language)
        db.commit()
    
    return UserResponse.from_orm(db_user)

@app.put("/api/admin/users/{user_id}/toggle-evaluator", response_model=UserResponse)
def toggle_user_evaluator_role(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle evaluator role
    user.is_evaluator = not user.is_evaluator
    db.commit()
    db.refresh(user)
    
    # Return properly formatted response
    return UserResponse.from_orm(user)

@app.get("/api/admin/annotations", response_model=List[AnnotationResponse])
def get_all_annotations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    annotations = db.query(Annotation).offset(skip).limit(limit).all()
    
    # Convert to proper response format to handle language serialization
    response_annotations = []
    for annotation in annotations:
        # Create annotation dict
        annotation_dict = {
            "id": annotation.id,
            "sentence_id": annotation.sentence_id,
            "annotator_id": annotation.annotator_id,
            "annotation_status": annotation.annotation_status,
            "created_at": annotation.created_at,
            "updated_at": annotation.updated_at,
            "fluency_score": annotation.fluency_score,
            "adequacy_score": annotation.adequacy_score,
            "overall_quality": annotation.overall_quality,
            "errors_found": annotation.errors_found,
            "suggested_correction": annotation.suggested_correction,
            "comments": annotation.comments,
            "final_form": annotation.final_form,
            "time_spent_seconds": annotation.time_spent_seconds,
            "sentence": annotation.sentence,
            "annotator": UserResponse.from_orm(annotation.annotator),
            "highlights": annotation.highlights or []
        }
        response_annotations.append(annotation_dict)
    
    return response_annotations

@app.get("/api/admin/sentences/{sentence_id}/annotations", response_model=List[AnnotationResponse])
def get_sentence_annotations(
    sentence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    annotations = db.query(Annotation).filter(
        Annotation.sentence_id == sentence_id
    ).all()
    
    # Convert to proper response format to handle language serialization
    response_annotations = []
    for annotation in annotations:
        # Create annotation dict
        annotation_dict = {
            "id": annotation.id,
            "sentence_id": annotation.sentence_id,
            "annotator_id": annotation.annotator_id,
            "annotation_status": annotation.annotation_status,
            "created_at": annotation.created_at,
            "updated_at": annotation.updated_at,
            "fluency_score": annotation.fluency_score,
            "adequacy_score": annotation.adequacy_score,
            "overall_quality": annotation.overall_quality,
            "errors_found": annotation.errors_found,
            "suggested_correction": annotation.suggested_correction,
            "comments": annotation.comments,
            "final_form": annotation.final_form,
            "time_spent_seconds": annotation.time_spent_seconds,
            "sentence": annotation.sentence,
            "annotator": UserResponse.from_orm(annotation.annotator),
            "highlights": annotation.highlights or []
        }
        response_annotations.append(annotation_dict)
    
    return response_annotations

@app.post("/api/admin/sentences/bulk", response_model=List[SentenceResponse])
def bulk_create_sentences(
    sentences_data: List[SentenceCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_sentences = []
    for sentence_data in sentences_data:
        db_sentence = Sentence(**sentence_data.model_dump())
        db.add(db_sentence)
        db_sentences.append(db_sentence)
    
    db.commit()
    return db_sentences

@app.post("/api/admin/sentences/import-csv", response_model=dict)
async def import_sentences_from_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Import sentences from a CSV file.
    
    Expected CSV format:
    source_text,machine_translation,source_language,target_language,domain
    
    Example:
    "Hello world","Kumusta mundo","en","tagalog","general"
    "How are you?","Kumusta ka?","en","tagalog","conversation"
    """
    import csv
    import io
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV file")
    
    try:
        # Read CSV content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(content_str))
        
        # Validate required columns
        required_columns = {'source_text', 'machine_translation', 'source_language', 'target_language'}
        csv_columns = set(csv_reader.fieldnames or [])
        
        if not required_columns.issubset(csv_columns):
            missing_columns = required_columns - csv_columns
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Process rows
        imported_count = 0
        skipped_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 because row 1 is header
            try:
                # Validate required fields
                if not row.get('source_text') or not row.get('machine_translation'):
                    errors.append(f"Row {row_num}: Missing required text fields")
                    skipped_count += 1
                    continue
                
                # Create sentence object
                sentence_data = {
                    'source_text': row['source_text'].strip(),
                    'machine_translation': row['machine_translation'].strip(),
                    'source_language': row['source_language'].strip().lower(),
                    'target_language': row['target_language'].strip().lower(),
                    'domain': row.get('domain', '').strip() or None
                }
                
                # Validate language codes
                valid_source_languages = ['en']
                valid_target_languages = ['tagalog', 'cebuano', 'ilocano']
                
                if sentence_data['source_language'] not in valid_source_languages:
                    errors.append(f"Row {row_num}: Invalid source language '{sentence_data['source_language']}'. Only 'en' is supported.")
                    skipped_count += 1
                    continue
                
                if sentence_data['target_language'] not in valid_target_languages:
                    errors.append(f"Row {row_num}: Invalid target language '{sentence_data['target_language']}'. Only 'tagalog', 'cebuano', and 'ilocano' are supported.")
                    skipped_count += 1
                    continue
                
                # Create sentence in database
                db_sentence = Sentence(**sentence_data)
                db.add(db_sentence)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                skipped_count += 1
                continue
        
        # Commit all valid sentences
        db.commit()
        
        return {
            "message": "CSV import completed",
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "total_rows": imported_count + skipped_count,
            "errors": errors
        }
        
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding. Please use UTF-8 encoding.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing CSV file: {str(e)}")

# Evaluation endpoints
@app.post("/api/evaluations", response_model=EvaluationResponse)
def create_evaluation(
    evaluation_data: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    # Check if evaluator already evaluated this annotation
    existing_evaluation = db.query(Evaluation).filter(
        Evaluation.annotation_id == evaluation_data.annotation_id,
        Evaluation.evaluator_id == current_user.id
    ).first()
    
    if existing_evaluation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already evaluated this annotation"
        )
    
    # Create the evaluation
    evaluation_dict = evaluation_data.model_dump()
    db_evaluation = Evaluation(
        **evaluation_dict,
        evaluator_id=current_user.id,
        evaluation_status="completed"
    )
    
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    
    # Update annotation status to reviewed
    annotation = db.query(Annotation).filter(Annotation.id == evaluation_data.annotation_id).first()
    if annotation:
        annotation.annotation_status = "reviewed"
        db.commit()
    
    # Return properly formatted response
    return {
        "id": db_evaluation.id,
        "annotation_id": db_evaluation.annotation_id,
        "evaluator_id": db_evaluation.evaluator_id,
        "annotation_quality_score": db_evaluation.annotation_quality_score,
        "accuracy_score": db_evaluation.accuracy_score,
        "completeness_score": db_evaluation.completeness_score,
        "overall_evaluation_score": db_evaluation.overall_evaluation_score,
        "feedback": db_evaluation.feedback,
        "evaluation_notes": db_evaluation.evaluation_notes,
        "time_spent_seconds": db_evaluation.time_spent_seconds,
        "evaluation_status": db_evaluation.evaluation_status,
        "created_at": db_evaluation.created_at,
        "updated_at": db_evaluation.updated_at,
        "evaluator": UserResponse.from_orm(db_evaluation.evaluator),
        "annotation": {
            "id": db_evaluation.annotation.id,
            "sentence_id": db_evaluation.annotation.sentence_id,
            "annotator_id": db_evaluation.annotation.annotator_id,
            "annotation_status": db_evaluation.annotation.annotation_status,
            "created_at": db_evaluation.annotation.created_at,
            "updated_at": db_evaluation.annotation.updated_at,
            "fluency_score": db_evaluation.annotation.fluency_score,
            "adequacy_score": db_evaluation.annotation.adequacy_score,
            "overall_quality": db_evaluation.annotation.overall_quality,
            "errors_found": db_evaluation.annotation.errors_found,
            "suggested_correction": db_evaluation.annotation.suggested_correction,
            "comments": db_evaluation.annotation.comments,
            "final_form": db_evaluation.annotation.final_form,
            "time_spent_seconds": db_evaluation.annotation.time_spent_seconds,
            "sentence": db_evaluation.annotation.sentence,
            "annotator": UserResponse.from_orm(db_evaluation.annotation.annotator),
            "highlights": db_evaluation.annotation.highlights or []
        }
    }

@app.put("/api/evaluations/{evaluation_id}", response_model=EvaluationResponse)
def update_evaluation(
    evaluation_id: int,
    evaluation_data: EvaluationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    evaluation = db.query(Evaluation).filter(
        Evaluation.id == evaluation_id,
        Evaluation.evaluator_id == current_user.id
    ).first()
    
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Update evaluation fields
    update_data = evaluation_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(evaluation, field, value)
    
    db.commit()
    db.refresh(evaluation)
    
    # Return properly formatted response
    return {
        "id": evaluation.id,
        "annotation_id": evaluation.annotation_id,
        "evaluator_id": evaluation.evaluator_id,
        "annotation_quality_score": evaluation.annotation_quality_score,
        "accuracy_score": evaluation.accuracy_score,
        "completeness_score": evaluation.completeness_score,
        "overall_evaluation_score": evaluation.overall_evaluation_score,
        "feedback": evaluation.feedback,
        "evaluation_notes": evaluation.evaluation_notes,
        "time_spent_seconds": evaluation.time_spent_seconds,
        "evaluation_status": evaluation.evaluation_status,
        "created_at": evaluation.created_at,
        "updated_at": evaluation.updated_at,
        "evaluator": UserResponse.from_orm(evaluation.evaluator),
        "annotation": {
            "id": evaluation.annotation.id,
            "sentence_id": evaluation.annotation.sentence_id,
            "annotator_id": evaluation.annotation.annotator_id,
            "annotation_status": evaluation.annotation.annotation_status,
            "created_at": evaluation.annotation.created_at,
            "updated_at": evaluation.annotation.updated_at,
            "fluency_score": evaluation.annotation.fluency_score,
            "adequacy_score": evaluation.annotation.adequacy_score,
            "overall_quality": evaluation.annotation.overall_quality,
            "errors_found": evaluation.annotation.errors_found,
            "suggested_correction": evaluation.annotation.suggested_correction,
            "comments": evaluation.annotation.comments,
            "final_form": evaluation.annotation.final_form,
            "time_spent_seconds": evaluation.annotation.time_spent_seconds,
            "sentence": evaluation.annotation.sentence,
            "annotator": UserResponse.from_orm(evaluation.annotation.annotator),
            "highlights": evaluation.annotation.highlights or []
        }
    }

@app.get("/api/evaluations", response_model=List[EvaluationResponse])
def get_my_evaluations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    evaluations = db.query(Evaluation).filter(
        Evaluation.evaluator_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    # Convert to proper response format to handle language serialization
    response_evaluations = []
    for evaluation in evaluations:
        # Create evaluation dict with properly converted nested objects
        evaluation_dict = {
            "id": evaluation.id,
            "annotation_id": evaluation.annotation_id,
            "evaluator_id": evaluation.evaluator_id,
            "annotation_quality_score": evaluation.annotation_quality_score,
            "accuracy_score": evaluation.accuracy_score,
            "completeness_score": evaluation.completeness_score,
            "overall_evaluation_score": evaluation.overall_evaluation_score,
            "feedback": evaluation.feedback,
            "evaluation_notes": evaluation.evaluation_notes,
            "time_spent_seconds": evaluation.time_spent_seconds,
            "evaluation_status": evaluation.evaluation_status,
            "created_at": evaluation.created_at,
            "updated_at": evaluation.updated_at,
            "evaluator": UserResponse.from_orm(evaluation.evaluator),
            "annotation": {
                "id": evaluation.annotation.id,
                "sentence_id": evaluation.annotation.sentence_id,
                "annotator_id": evaluation.annotation.annotator_id,
                "annotation_status": evaluation.annotation.annotation_status,
                "created_at": evaluation.annotation.created_at,
                "updated_at": evaluation.annotation.updated_at,
                "fluency_score": evaluation.annotation.fluency_score,
                "adequacy_score": evaluation.annotation.adequacy_score,
                "overall_quality": evaluation.annotation.overall_quality,
                "errors_found": evaluation.annotation.errors_found,
                "suggested_correction": evaluation.annotation.suggested_correction,
                "comments": evaluation.annotation.comments,
                "final_form": evaluation.annotation.final_form,
                "time_spent_seconds": evaluation.annotation.time_spent_seconds,
                "sentence": evaluation.annotation.sentence,
                "annotator": UserResponse.from_orm(evaluation.annotation.annotator),
                "highlights": evaluation.annotation.highlights or []
            }
        }
        response_evaluations.append(evaluation_dict)
    
    return response_evaluations

@app.get("/api/evaluations/pending", response_model=List[AnnotationResponse])
def get_pending_evaluations(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    # Get completed annotations that haven't been evaluated by current user yet
    evaluated_annotation_ids = db.query(Evaluation.annotation_id).filter(
        Evaluation.evaluator_id == current_user.id
    ).subquery()
    
    annotations = db.query(Annotation).filter(
        Annotation.annotation_status == "completed",
        ~Annotation.id.in_(evaluated_annotation_ids)
    ).offset(skip).limit(limit).all()
    
    # Convert to proper response format to handle language serialization
    response_annotations = []
    for annotation in annotations:
        # Create annotation dict
        annotation_dict = {
            "id": annotation.id,
            "sentence_id": annotation.sentence_id,
            "annotator_id": annotation.annotator_id,
            "annotation_status": annotation.annotation_status,
            "created_at": annotation.created_at,
            "updated_at": annotation.updated_at,
            "fluency_score": annotation.fluency_score,
            "adequacy_score": annotation.adequacy_score,
            "overall_quality": annotation.overall_quality,
            "errors_found": annotation.errors_found,
            "suggested_correction": annotation.suggested_correction,
            "comments": annotation.comments,
            "final_form": annotation.final_form,
            "time_spent_seconds": annotation.time_spent_seconds,
            "sentence": annotation.sentence,
            "annotator": UserResponse.from_orm(annotation.annotator),
            "highlights": annotation.highlights or []
        }
        response_annotations.append(annotation_dict)
    
    return response_annotations

@app.get("/api/evaluator/stats", response_model=EvaluatorStats)
def get_evaluator_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    total_evaluations = db.query(Evaluation).filter(
        Evaluation.evaluator_id == current_user.id
    ).count()
    
    completed_evaluations = db.query(Evaluation).filter(
        Evaluation.evaluator_id == current_user.id,
        Evaluation.evaluation_status == "completed"
    ).count()
    
    pending_evaluations = db.query(Annotation).filter(
        Annotation.annotation_status == "completed",
        ~Annotation.id.in_(
            db.query(Evaluation.annotation_id).filter(
                Evaluation.evaluator_id == current_user.id
            )
        )
    ).count()
    
    # Calculate average time per evaluation
    evaluations_with_time = db.query(Evaluation).filter(
        Evaluation.evaluator_id == current_user.id,
        Evaluation.time_spent_seconds.isnot(None)
    ).all()
    
    average_time = 0.0
    if evaluations_with_time:
        total_time = sum(e.time_spent_seconds for e in evaluations_with_time)
        average_time = total_time / len(evaluations_with_time)
    
    return EvaluatorStats(
        total_evaluations=total_evaluations,
        completed_evaluations=completed_evaluations,
        pending_evaluations=pending_evaluations,
        average_time_per_evaluation=average_time
    )

# Machine Translation Quality Assessment Endpoints

@app.get("/api/mt-quality/pending", response_model=List[SentenceResponse])
def get_pending_mt_assessments(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    """Get sentences pending MT quality assessment"""
    # Get sentences that haven't been assessed yet by this evaluator
    assessed_sentence_ids = db.query(MTQualityAssessment.sentence_id).filter(
        MTQualityAssessment.evaluator_id == current_user.id
    ).subquery()
    
    sentences = db.query(Sentence).filter(
        Sentence.is_active == True,
        ~Sentence.id.in_(assessed_sentence_ids)
    ).offset(skip).limit(limit).all()
    
    return [SentenceResponse.from_orm(sentence) for sentence in sentences]

@app.post("/api/mt-quality/assess", response_model=MTQualityAssessmentResponse)
def create_mt_quality_assessment(
    assessment_data: MTQualityAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    """Create MT quality assessment using DistilBERT analysis"""
    # Get the sentence
    sentence = db.query(Sentence).filter(Sentence.id == assessment_data.sentence_id).first()
    if not sentence:
        raise HTTPException(status_code=404, detail="Sentence not found")
    
    # Check if already assessed by this evaluator
    existing_assessment = db.query(MTQualityAssessment).filter(
        MTQualityAssessment.sentence_id == assessment_data.sentence_id,
        MTQualityAssessment.evaluator_id == current_user.id
    ).first()
    
    if existing_assessment:
        raise HTTPException(status_code=400, detail="Sentence already assessed by this evaluator")
    
    # Run DistilBERT evaluation
    mt_result = evaluate_mt_quality(
        sentence.source_text,
        sentence.machine_translation, 
        sentence.source_language,
        sentence.target_language
    )
    
    # Create assessment record
    db_assessment = MTQualityAssessment(
        sentence_id=assessment_data.sentence_id,
        evaluator_id=current_user.id,
        fluency_score=assessment_data.fluency_score or mt_result.fluency_score,
        adequacy_score=assessment_data.adequacy_score or mt_result.adequacy_score,
        overall_quality_score=assessment_data.overall_quality_score or mt_result.overall_quality,
        syntax_errors=json.dumps([{
            'error_type': error.error_type,
            'severity': error.severity,
            'start_position': error.start_position,
            'end_position': error.end_position,
            'text_span': error.text_span,
            'description': error.description,
            'suggested_fix': error.suggested_fix
        } for error in mt_result.syntax_errors]),
        semantic_errors=json.dumps([{
            'error_type': error.error_type,
            'severity': error.severity,
            'start_position': error.start_position,
            'end_position': error.end_position,
            'text_span': error.text_span,
            'description': error.description,
            'suggested_fix': error.suggested_fix
        } for error in mt_result.semantic_errors]),
        quality_explanation=mt_result.quality_explanation,
        correction_suggestions=json.dumps(mt_result.correction_suggestions),
        model_confidence=mt_result.model_confidence,
        processing_time_ms=mt_result.processing_time_ms,
        time_spent_seconds=assessment_data.time_spent_seconds,
        human_feedback=assessment_data.human_feedback,
        correction_notes=assessment_data.correction_notes,
        evaluation_status="completed"
    )
    
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    # Convert to response format
    return MTQualityAssessmentResponse(
        id=db_assessment.id,
        sentence_id=db_assessment.sentence_id,
        evaluator_id=db_assessment.evaluator_id,
        fluency_score=db_assessment.fluency_score,
        adequacy_score=db_assessment.adequacy_score,
        overall_quality_score=db_assessment.overall_quality_score,
        syntax_errors=json.loads(db_assessment.syntax_errors),
        semantic_errors=json.loads(db_assessment.semantic_errors),
        quality_explanation=db_assessment.quality_explanation,
        correction_suggestions=json.loads(db_assessment.correction_suggestions),
        model_confidence=db_assessment.model_confidence,
        processing_time_ms=db_assessment.processing_time_ms,
        time_spent_seconds=db_assessment.time_spent_seconds,
        human_feedback=db_assessment.human_feedback,
        correction_notes=db_assessment.correction_notes,
        evaluation_status=db_assessment.evaluation_status,
        created_at=db_assessment.created_at,
        updated_at=db_assessment.updated_at,
        sentence=SentenceResponse.from_orm(db_assessment.sentence),
        evaluator=UserResponse.from_orm(db_assessment.evaluator)
    )

@app.put("/api/mt-quality/{assessment_id}", response_model=MTQualityAssessmentResponse)
def update_mt_quality_assessment(
    assessment_id: int,
    update_data: MTQualityAssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    """Update MT quality assessment with human feedback"""
    assessment = db.query(MTQualityAssessment).filter(
        MTQualityAssessment.id == assessment_id,
        MTQualityAssessment.evaluator_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Update fields
    if update_data.fluency_score is not None:
        assessment.fluency_score = update_data.fluency_score
    if update_data.adequacy_score is not None:
        assessment.adequacy_score = update_data.adequacy_score
    if update_data.overall_quality_score is not None:
        assessment.overall_quality_score = update_data.overall_quality_score
    if update_data.human_feedback is not None:
        assessment.human_feedback = update_data.human_feedback
    if update_data.correction_notes is not None:
        assessment.correction_notes = update_data.correction_notes
    if update_data.time_spent_seconds is not None:
        assessment.time_spent_seconds = update_data.time_spent_seconds
    if update_data.evaluation_status is not None:
        assessment.evaluation_status = update_data.evaluation_status
    
    db.commit()
    db.refresh(assessment)
    
    return MTQualityAssessmentResponse(
        id=assessment.id,
        sentence_id=assessment.sentence_id,
        evaluator_id=assessment.evaluator_id,
        fluency_score=assessment.fluency_score,
        adequacy_score=assessment.adequacy_score,
        overall_quality_score=assessment.overall_quality_score,
        syntax_errors=json.loads(assessment.syntax_errors),
        semantic_errors=json.loads(assessment.semantic_errors),
        quality_explanation=assessment.quality_explanation,
        correction_suggestions=json.loads(assessment.correction_suggestions),
        model_confidence=assessment.model_confidence,
        processing_time_ms=assessment.processing_time_ms,
        time_spent_seconds=assessment.time_spent_seconds,
        human_feedback=assessment.human_feedback,
        correction_notes=assessment.correction_notes,
        evaluation_status=assessment.evaluation_status,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
        sentence=SentenceResponse.from_orm(assessment.sentence),
        evaluator=UserResponse.from_orm(assessment.evaluator)
    )

@app.get("/api/mt-quality/my-assessments", response_model=List[MTQualityAssessmentResponse])
def get_my_mt_assessments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    """Get evaluator's MT quality assessments"""
    assessments = db.query(MTQualityAssessment).filter(
        MTQualityAssessment.evaluator_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return [MTQualityAssessmentResponse(
        id=assessment.id,
        sentence_id=assessment.sentence_id,
        evaluator_id=assessment.evaluator_id,
        fluency_score=assessment.fluency_score,
        adequacy_score=assessment.adequacy_score,
        overall_quality_score=assessment.overall_quality_score,
        syntax_errors=json.loads(assessment.syntax_errors),
        semantic_errors=json.loads(assessment.semantic_errors),
        quality_explanation=assessment.quality_explanation,
        correction_suggestions=json.loads(assessment.correction_suggestions),
        model_confidence=assessment.model_confidence,
        processing_time_ms=assessment.processing_time_ms,
        time_spent_seconds=assessment.time_spent_seconds,
        human_feedback=assessment.human_feedback,
        correction_notes=assessment.correction_notes,
        evaluation_status=assessment.evaluation_status,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
        sentence=SentenceResponse.from_orm(assessment.sentence),
        evaluator=UserResponse.from_orm(assessment.evaluator)
    ) for assessment in assessments]

@app.get("/api/mt-quality/stats", response_model=MTEvaluatorStats)
def get_mt_evaluator_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    """Get MT evaluator statistics"""
    total_assessments = db.query(MTQualityAssessment).filter(
        MTQualityAssessment.evaluator_id == current_user.id
    ).count()
    
    completed_assessments = db.query(MTQualityAssessment).filter(
        MTQualityAssessment.evaluator_id == current_user.id,
        MTQualityAssessment.evaluation_status == "completed"
    ).count()
    
    pending_assessments = db.query(Sentence).filter(
        Sentence.is_active == True,
        ~Sentence.id.in_(
            db.query(MTQualityAssessment.sentence_id).filter(
                MTQualityAssessment.evaluator_id == current_user.id
            )
        )
    ).count()
    
    # Calculate averages
    assessments = db.query(MTQualityAssessment).filter(
        MTQualityAssessment.evaluator_id == current_user.id,
        MTQualityAssessment.evaluation_status == "completed"
    ).all()
    
    if assessments:
        avg_fluency = sum(a.fluency_score for a in assessments) / len(assessments)
        avg_adequacy = sum(a.adequacy_score for a in assessments) / len(assessments)
        avg_overall = sum(a.overall_quality_score for a in assessments) / len(assessments)
        avg_confidence = sum(a.model_confidence for a in assessments) / len(assessments)
        
        # Calculate error statistics
        total_syntax_errors = sum(len(json.loads(a.syntax_errors)) for a in assessments)
        total_semantic_errors = sum(len(json.loads(a.semantic_errors)) for a in assessments)
        
        # Calculate time statistics
        assessments_with_time = [a for a in assessments if a.time_spent_seconds]
        avg_time = sum(a.time_spent_seconds for a in assessments_with_time) / len(assessments_with_time) if assessments_with_time else 0
        
        # Human agreement rate (simplified - percentage of assessments where human didn't override AI scores)
        human_overrides = sum(1 for a in assessments if a.human_feedback or a.correction_notes)
        agreement_rate = 1.0 - (human_overrides / len(assessments)) if assessments else 1.0
    else:
        avg_fluency = avg_adequacy = avg_overall = avg_confidence = 0.0
        total_syntax_errors = total_semantic_errors = 0
        avg_time = 0.0
        agreement_rate = 1.0
    
    return MTEvaluatorStats(
        total_assessments=total_assessments,
        completed_assessments=completed_assessments,
        pending_assessments=pending_assessments,
        average_time_per_assessment=avg_time,
        average_fluency_score=avg_fluency,
        average_adequacy_score=avg_adequacy,
        average_overall_score=avg_overall,
        total_syntax_errors_found=total_syntax_errors,
        total_semantic_errors_found=total_semantic_errors,
        average_model_confidence=avg_confidence,
        human_agreement_rate=agreement_rate
    )

@app.get("/api/mt-quality/sentence/{sentence_id}", response_model=Optional[MTQualityAssessmentResponse])
def get_mt_assessment_by_sentence(
    sentence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    """Get MT quality assessment for a specific sentence"""
    assessment = db.query(MTQualityAssessment).filter(
        MTQualityAssessment.sentence_id == sentence_id,
        MTQualityAssessment.evaluator_id == current_user.id
    ).first()
    
    if not assessment:
        return None
    
    return MTQualityAssessmentResponse(
        id=assessment.id,
        sentence_id=assessment.sentence_id,
        evaluator_id=assessment.evaluator_id,
        fluency_score=assessment.fluency_score,
        adequacy_score=assessment.adequacy_score,
        overall_quality_score=assessment.overall_quality_score,
        syntax_errors=json.loads(assessment.syntax_errors),
        semantic_errors=json.loads(assessment.semantic_errors),
        quality_explanation=assessment.quality_explanation,
        correction_suggestions=json.loads(assessment.correction_suggestions),
        model_confidence=assessment.model_confidence,
        processing_time_ms=assessment.processing_time_ms,
        time_spent_seconds=assessment.time_spent_seconds,
        human_feedback=assessment.human_feedback,
        correction_notes=assessment.correction_notes,
        evaluation_status=assessment.evaluation_status,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
        sentence=SentenceResponse.from_orm(assessment.sentence),
        evaluator=UserResponse.from_orm(assessment.evaluator)
    )

@app.post("/api/mt-quality/batch-assess", response_model=List[MTQualityAssessmentResponse])
def batch_assess_mt_quality(
    sentence_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_evaluator_user)
):
    """Batch process sentences for MT quality assessment"""
    if len(sentence_ids) > 10:  # Limit batch size
        raise HTTPException(status_code=400, detail="Batch size limited to 10 sentences")
    
    assessments = []
    
    for sentence_id in sentence_ids:
        # Check if already assessed
        existing = db.query(MTQualityAssessment).filter(
            MTQualityAssessment.sentence_id == sentence_id,
            MTQualityAssessment.evaluator_id == current_user.id
        ).first()
        
        if existing:
            continue  # Skip already assessed
        
        # Get sentence
        sentence = db.query(Sentence).filter(Sentence.id == sentence_id).first()
        if not sentence:
            continue  # Skip missing sentences
        
        # Run DistilBERT evaluation
        mt_result = evaluate_mt_quality(
            sentence.source_text,
            sentence.machine_translation,
            sentence.source_language,
            sentence.target_language
        )
        
        # Create assessment
        db_assessment = MTQualityAssessment(
            sentence_id=sentence_id,
            evaluator_id=current_user.id,
            fluency_score=mt_result.fluency_score,
            adequacy_score=mt_result.adequacy_score,
            overall_quality_score=mt_result.overall_quality,
            syntax_errors=json.dumps([{
                'error_type': error.error_type,
                'severity': error.severity,
                'start_position': error.start_position,
                'end_position': error.end_position,
                'text_span': error.text_span,
                'description': error.description,
                'suggested_fix': error.suggested_fix
            } for error in mt_result.syntax_errors]),
            semantic_errors=json.dumps([{
                'error_type': error.error_type,
                'severity': error.severity,
                'start_position': error.start_position,
                'end_position': error.end_position,
                'text_span': error.text_span,
                'description': error.description,
                'suggested_fix': error.suggested_fix
            } for error in mt_result.semantic_errors]),
            quality_explanation=mt_result.quality_explanation,
            correction_suggestions=json.dumps(mt_result.correction_suggestions),
            model_confidence=mt_result.model_confidence,
            processing_time_ms=mt_result.processing_time_ms,
            evaluation_status="completed"
        )
        
        db.add(db_assessment)
        assessments.append(db_assessment)
    
    db.commit()
    
    # Refresh and return
    for assessment in assessments:
        db.refresh(assessment)
    
    return [MTQualityAssessmentResponse(
        id=assessment.id,
        sentence_id=assessment.sentence_id,
        evaluator_id=assessment.evaluator_id,
        fluency_score=assessment.fluency_score,
        adequacy_score=assessment.adequacy_score,
        overall_quality_score=assessment.overall_quality_score,
        syntax_errors=json.loads(assessment.syntax_errors),
        semantic_errors=json.loads(assessment.semantic_errors),
        quality_explanation=assessment.quality_explanation,
        correction_suggestions=json.loads(assessment.correction_suggestions),
        model_confidence=assessment.model_confidence,
        processing_time_ms=assessment.processing_time_ms,
        time_spent_seconds=assessment.time_spent_seconds,
        human_feedback=assessment.human_feedback,
        correction_notes=assessment.correction_notes,
        evaluation_status=assessment.evaluation_status,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
        sentence=SentenceResponse.from_orm(assessment.sentence),
        evaluator=UserResponse.from_orm(assessment.evaluator)
    ) for assessment in assessments]

# Admin MT Quality endpoints
@app.get("/api/admin/mt-quality", response_model=List[MTQualityAssessmentResponse])
def get_all_mt_assessments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all MT quality assessments (admin only)"""
    assessments = db.query(MTQualityAssessment).offset(skip).limit(limit).all()
    
    return [MTQualityAssessmentResponse(
        id=assessment.id,
        sentence_id=assessment.sentence_id,
        evaluator_id=assessment.evaluator_id,
        fluency_score=assessment.fluency_score,
        adequacy_score=assessment.adequacy_score,
        overall_quality_score=assessment.overall_quality_score,
        syntax_errors=json.loads(assessment.syntax_errors),
        semantic_errors=json.loads(assessment.semantic_errors),
        quality_explanation=assessment.quality_explanation,
        correction_suggestions=json.loads(assessment.correction_suggestions),
        model_confidence=assessment.model_confidence,
        processing_time_ms=assessment.processing_time_ms,
        time_spent_seconds=assessment.time_spent_seconds,
        human_feedback=assessment.human_feedback,
        correction_notes=assessment.correction_notes,
        evaluation_status=assessment.evaluation_status,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at,
        sentence=SentenceResponse.from_orm(assessment.sentence),
        evaluator=UserResponse.from_orm(assessment.evaluator)
    ) for assessment in assessments]

@app.get("/api/annotations/{annotation_id}/evaluations", response_model=List[EvaluationResponse])
def get_annotation_evaluations(
    annotation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_or_evaluator_user)
):
    evaluations = db.query(Evaluation).filter(
        Evaluation.annotation_id == annotation_id
    ).all()
    
    # Convert to proper response format to handle language serialization
    response_evaluations = []
    for evaluation in evaluations:
        # Create evaluation dict with properly converted nested objects
        evaluation_dict = {
            "id": evaluation.id,
            "annotation_id": evaluation.annotation_id,
            "evaluator_id": evaluation.evaluator_id,
            "annotation_quality_score": evaluation.annotation_quality_score,
            "accuracy_score": evaluation.accuracy_score,
            "completeness_score": evaluation.completeness_score,
            "overall_evaluation_score": evaluation.overall_evaluation_score,
            "feedback": evaluation.feedback,
            "evaluation_notes": evaluation.evaluation_notes,
            "time_spent_seconds": evaluation.time_spent_seconds,
            "evaluation_status": evaluation.evaluation_status,
            "created_at": evaluation.created_at,
            "updated_at": evaluation.updated_at,
            "evaluator": UserResponse.from_orm(evaluation.evaluator),
            "annotation": {
                "id": evaluation.annotation.id,
                "sentence_id": evaluation.annotation.sentence_id,
                "annotator_id": evaluation.annotation.annotator_id,
                "annotation_status": evaluation.annotation.annotation_status,
                "created_at": evaluation.annotation.created_at,
                "updated_at": evaluation.annotation.updated_at,
                "fluency_score": evaluation.annotation.fluency_score,
                "adequacy_score": evaluation.annotation.adequacy_score,
                "overall_quality": evaluation.annotation.overall_quality,
                "errors_found": evaluation.annotation.errors_found,
                "suggested_correction": evaluation.annotation.suggested_correction,
                "comments": evaluation.annotation.comments,
                "final_form": evaluation.annotation.final_form,
                "time_spent_seconds": evaluation.annotation.time_spent_seconds,
                "sentence": evaluation.annotation.sentence,
                "annotator": UserResponse.from_orm(evaluation.annotation.annotator),
                "highlights": evaluation.annotation.highlights or []
            }
        }
        response_evaluations.append(evaluation_dict)
    
    return response_evaluations



@app.post("/api/annotations/upload-voice")
async def upload_voice_recording(
    audio_file: UploadFile = File(...),
    annotation_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload voice recording for annotation final form"""
    
    # Check if user has completed onboarding
    check_onboarding_completed(current_user)
    
    # Validate file type
    if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Generate unique filename
    file_extension = audio_file.filename.split('.')[-1] if '.' in audio_file.filename else 'webm'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        
        # Calculate file duration (basic estimation based on file size)
        # For more accurate duration, you could use audio processing libraries
        file_size = file_path.stat().st_size
        estimated_duration = max(1, file_size // 1000)  # Rough estimation: 1 second per KB
        
        # Generate URL for accessing the file
        voice_recording_url = f"/uploads/audio/{unique_filename}"
        
        # If annotation_id is provided, update the annotation
        if annotation_id:
            annotation = db.query(Annotation).filter(
                Annotation.id == int(annotation_id),
                Annotation.annotator_id == current_user.id
            ).first()
            
            if annotation:
                # Remove old voice recording file if it exists
                if annotation.voice_recording_url:
                    old_file_path = Path("uploads") / annotation.voice_recording_url.lstrip("/uploads/")
                    if old_file_path.exists():
                        old_file_path.unlink()
                
                annotation.voice_recording_url = voice_recording_url
                annotation.voice_recording_duration = estimated_duration
                db.commit()
        
        return {
            "voice_recording_url": voice_recording_url,
            "voice_recording_duration": estimated_duration,
            "message": "Voice recording uploaded successfully"
        }
        
    except Exception as e:
        # Clean up file if something went wrong
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to upload voice recording: {str(e)}")

# Onboarding Test endpoints
@app.post("/api/onboarding-tests", response_model=OnboardingTestResponse)
def create_onboarding_test(
    test_data: OnboardingTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new onboarding test for the user"""
    
    # Check if user already has an incomplete test
    existing_test = db.query(OnboardingTest).filter(
        OnboardingTest.user_id == current_user.id,
        OnboardingTest.status == 'in_progress'
    ).first()
    
    if existing_test:
        return OnboardingTestResponse.from_orm(existing_test)
    
    # Sample test questions for the onboarding test
    test_questions = [
        {
            "id": "1",
            "source_text": "The weather is beautiful today.",
            "machine_translation": "Ang panahon ay maganda ngayon.",
            "source_language": "English",
            "target_language": "Tagalog",
            "correct_fluency_score": 5,
            "correct_adequacy_score": 5,
            "error_types": [],
            "explanation": "This is an excellent translation with perfect fluency and adequacy. No errors present."
        },
        {
            "id": "2",
            "source_text": "I will go to the hospital tomorrow.",
            "machine_translation": "Ako ay pupunta sa ospital bukas.",
            "source_language": "English",
            "target_language": "Tagalog",
            "correct_fluency_score": 4,
            "correct_adequacy_score": 5,
            "error_types": ["MI_ST"],
            "explanation": "Good translation with complete meaning preserved. Minor stylistic issue - could be more natural as 'Pupunta ako sa ospital bukas.'"
        },
        {
            "id": "3",
            "source_text": "She plays the piano very well.",
            "machine_translation": "Siya ay naglalaro ng piano nang napakahusay.",
            "source_language": "English",
            "target_language": "Tagalog",
            "correct_fluency_score": 2,
            "correct_adequacy_score": 3,
            "error_types": ["MI_SE", "MA_SE"],
            "explanation": "Incorrect verb choice - 'naglalaro' (playing games) instead of 'tumutugtog' (playing instrument). This affects both fluency and adequacy."
        }
    ]
    
    # Create new test
    onboarding_test = OnboardingTest(
        user_id=current_user.id,
        language=test_data.language,
        test_data={"questions": test_questions},
        status='in_progress'
    )
    
    db.add(onboarding_test)
    db.commit()
    db.refresh(onboarding_test)
    
    return OnboardingTestResponse.from_orm(onboarding_test)



@app.get("/api/onboarding-tests/my-tests", response_model=List[OnboardingTestResponse])
def get_my_onboarding_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's onboarding tests"""
    tests = db.query(OnboardingTest).filter(
        OnboardingTest.user_id == current_user.id
    ).order_by(OnboardingTest.started_at.desc()).all()
    
    return [OnboardingTestResponse.from_orm(test) for test in tests]

@app.get("/api/onboarding-tests/{test_id}", response_model=OnboardingTestResponse) 
def get_onboarding_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific onboarding test"""
    test = db.query(OnboardingTest).filter(
        OnboardingTest.id == test_id,
        OnboardingTest.user_id == current_user.id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    return OnboardingTestResponse.from_orm(test)

# Language Proficiency Questions endpoints
@app.get("/api/language-proficiency-questions", response_model=List[LanguageProficiencyQuestionResponse])
def get_language_proficiency_questions(
    languages: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get language proficiency questions, optionally filtered by languages"""
    query = db.query(LanguageProficiencyQuestion)
    
    if languages:
        language_list = [lang.strip() for lang in languages.split(',')]
        query = query.filter(LanguageProficiencyQuestion.language.in_(language_list))
    
    questions = query.order_by(LanguageProficiencyQuestion.language, LanguageProficiencyQuestion.type, LanguageProficiencyQuestion.difficulty, LanguageProficiencyQuestion.created_at).all()
    return [LanguageProficiencyQuestionResponse.from_orm(q) for q in questions]

@app.post("/api/language-proficiency-questions/submit")
def submit_language_proficiency_answers(
    submission: OnboardingTestSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit language proficiency test answers"""
    correct_count = 0
    total_questions = len(submission.answers)
    
    # Store each answer and calculate score
    for answer in submission.answers:
        # Get the question to check correct answer
        question = db.query(LanguageProficiencyQuestion).filter(
            LanguageProficiencyQuestion.id == answer.question_id
        ).first()
        
        if question:
            is_correct = answer.selected_answer == question.correct_answer
            if is_correct:
                correct_count += 1
            
            # Store the user's answer
            user_answer = UserQuestionAnswer(
                user_id=current_user.id,
                question_id=answer.question_id,
                selected_answer=answer.selected_answer,
                is_correct=is_correct,
                test_session_id=submission.test_session_id
            )
            db.add(user_answer)
    
    db.commit()
    
    # Calculate score
    score = (correct_count / total_questions * 100) if total_questions > 0 else 0
    passed = score >= 70.0
    
    # Update user onboarding status if passed
    if passed:
        current_user.onboarding_status = 'completed'
        current_user.onboarding_score = score
        current_user.onboarding_completed_at = datetime.utcnow()
        
        # Ensure we're working with the same session
        db.add(current_user)
        db.commit()
        
        # Force refresh from database
        db.refresh(current_user)
        
        # Additional verification - query fresh from database with explicit session
        fresh_user = db.query(User).filter(User.id == current_user.id).first()
        
        # Close and recreate session to ensure no caching
        db.expunge_all()
        fresh_user2 = db.query(User).filter(User.id == current_user.id).first()
        
    else:
        current_user.onboarding_status = 'failed'
        current_user.onboarding_score = score
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    
    # Create results breakdown by language
    questions_by_language = {}
    for language in submission.languages:
        lang_questions = db.query(LanguageProficiencyQuestion).filter(
            LanguageProficiencyQuestion.language == language
        ).all()
        lang_question_ids = [q.id for q in lang_questions]
        
        lang_answers = [a for a in submission.answers if a.question_id in lang_question_ids]
        lang_correct = sum(1 for a in lang_answers 
                          if db.query(LanguageProficiencyQuestion).filter(
                              LanguageProficiencyQuestion.id == a.question_id,
                              LanguageProficiencyQuestion.correct_answer == a.selected_answer
                          ).first())
        
        questions_by_language[language] = {
            "total": len(lang_answers),
            "correct": lang_correct,
            "score": (lang_correct / len(lang_answers) * 100) if len(lang_answers) > 0 else 0
        }
    
    return OnboardingTestResults(
        total_questions=total_questions,
        correct_answers=correct_count,
        score=score,
        passed=passed,
        questions_by_language=questions_by_language,
        session_id=submission.test_session_id,
        updated_user=UserResponse.from_orm(fresh_user2) if passed else None
    )

# Admin endpoints for language proficiency questions
@app.get("/api/admin/language-proficiency-questions", response_model=List[LanguageProficiencyQuestionResponse])
def admin_get_all_questions(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Get all language proficiency questions"""
    questions = db.query(LanguageProficiencyQuestion).order_by(
        LanguageProficiencyQuestion.language, 
        LanguageProficiencyQuestion.type,
        LanguageProficiencyQuestion.difficulty,
        LanguageProficiencyQuestion.created_at
    ).all()
    return [LanguageProficiencyQuestionResponse.from_orm(q) for q in questions]

@app.post("/api/admin/language-proficiency-questions", response_model=LanguageProficiencyQuestionResponse)
def admin_create_question(
    question: LanguageProficiencyQuestionCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Create a new language proficiency question"""
    db_question = LanguageProficiencyQuestion(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return LanguageProficiencyQuestionResponse.from_orm(db_question)

@app.put("/api/admin/language-proficiency-questions/{question_id}", response_model=LanguageProficiencyQuestionResponse)
def admin_update_question(
    question_id: int,
    question: LanguageProficiencyQuestionUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Update a language proficiency question"""
    db_question = db.query(LanguageProficiencyQuestion).filter(
        LanguageProficiencyQuestion.id == question_id
    ).first()
    
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    for field, value in question.dict(exclude_unset=True).items():
        setattr(db_question, field, value)
    
    db.commit()
    db.refresh(db_question)
    return LanguageProficiencyQuestionResponse.from_orm(db_question)

@app.delete("/api/admin/language-proficiency-questions/{question_id}")
def admin_delete_question(
    question_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin: Delete a language proficiency question"""
    db_question = db.query(LanguageProficiencyQuestion).filter(
        LanguageProficiencyQuestion.id == question_id
    ).first()
    
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(db_question)
    db.commit()
    return {"message": "Question deleted successfully"}

@app.get("/api/admin/analytics/user-growth")
def get_user_growth_analytics(
    months: int = 6,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get user growth and annotation activity over time"""
    from sqlalchemy import func, extract
    from datetime import datetime, timedelta
    
    # Get user registrations by month
    user_growth = []
    for i in range(months - 1, -1, -1):
        start_date = datetime.now() - timedelta(days=30 * i)
        end_date = start_date + timedelta(days=30)
        
        # Count users registered in this month
        users_count = db.query(User).filter(
            User.created_at >= start_date,
            User.created_at < end_date
        ).count()
        
        # Count annotations created in this month
        annotations_count = db.query(Annotation).filter(
            Annotation.created_at >= start_date,
            Annotation.created_at < end_date
        ).count()
        
        user_growth.append({
            "month": start_date.strftime("%b %y"),
            "users": users_count,
            "annotations": annotations_count
        })
    
    return user_growth

@app.get("/api/admin/analytics/error-distribution")
def get_error_distribution_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get error type distribution from text highlights"""
    from sqlalchemy import func
    
    # Get all text highlights with error types
    highlights = db.query(TextHighlight).filter(
        TextHighlight.error_type.isnot(None)
    ).all()
    
    # Count by error type
    error_counts = {}
    for highlight in highlights:
        error_type = highlight.error_type
        if error_type not in error_counts:
            error_counts[error_type] = 0
        error_counts[error_type] += 1
    
    # Map error types to display names and colors
    error_type_mapping = {
        'MI_ST': {
            'type': 'Minor Syntactic',
            'color': '#f97316',
            'description': 'Grammar, punctuation, word order'
        },
        'MI_SE': {
            'type': 'Minor Semantic', 
            'color': '#3b82f6',
            'description': 'Word choice, cultural nuances'
        },
        'MA_ST': {
            'type': 'Major Syntactic',
            'color': '#ef4444', 
            'description': 'Sentence structure, missing words'
        },
        'MA_SE': {
            'type': 'Major Semantic',
            'color': '#8b5cf6',
            'description': 'Meaning distortion, context errors'
        }
    }
    
    # Convert to response format
    error_distribution = []
    for error_code, count in error_counts.items():
        if error_code in error_type_mapping:
            mapping = error_type_mapping[error_code]
            error_distribution.append({
                'type': mapping['type'],
                'count': count,
                'color': mapping['color'],
                'description': mapping['description']
            })
    
    return error_distribution

@app.get("/api/admin/analytics/language-activity")
def get_language_activity_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get language activity statistics"""
    from sqlalchemy import func
    
    # Get sentence counts by language
    sentence_counts = db.query(
        Sentence.target_language,
        func.count(Sentence.id).label('sentence_count')
    ).group_by(Sentence.target_language).all()
    
    # Get annotation counts by language
    annotation_counts = db.query(
        Sentence.target_language,
        func.count(Annotation.id).label('annotation_count')
    ).join(Annotation, Sentence.id == Annotation.sentence_id).group_by(
        Sentence.target_language
    ).all()
    
    # Combine the data
    language_activity = []
    sentence_dict = {lang: count for lang, count in sentence_counts}
    annotation_dict = {lang: count for lang, count in annotation_counts}
    
    for language in sentence_dict.keys():
        language_activity.append({
            'language': language.capitalize(),
            'sentences': sentence_dict[language],
            'annotations': annotation_dict.get(language, 0)
        })
    
    # Sort by sentence count
    language_activity.sort(key=lambda x: x['sentences'], reverse=True)
    
    return language_activity

@app.get("/api/admin/analytics/daily-activity")
def get_daily_activity_analytics(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get daily activity for the last N days"""
    from sqlalchemy import func, extract
    from datetime import datetime, timedelta
    
    daily_activity = []
    
    for i in range(days - 1, -1, -1):
        date = datetime.now() - timedelta(days=i)
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        # Count annotations for this day
        annotations_count = db.query(Annotation).filter(
            Annotation.created_at >= start_of_day,
            Annotation.created_at < end_of_day
        ).count()
        
        # Count evaluations for this day
        evaluations_count = db.query(Evaluation).filter(
            Evaluation.created_at >= start_of_day,
            Evaluation.created_at < end_of_day
        ).count()
        
        daily_activity.append({
            'date': date.strftime('%a'),
            'annotations': annotations_count,
            'evaluations': evaluations_count
        })
    
    return daily_activity

@app.get("/api/admin/analytics/user-roles")
def get_user_role_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get user role distribution"""
    # Count users by role
    admin_count = db.query(User).filter(User.is_admin == True).count()
    evaluator_count = db.query(User).filter(
        User.is_evaluator == True,
        User.is_admin == False
    ).count()
    annotator_count = db.query(User).filter(
        User.is_admin == False,
        User.is_evaluator == False
    ).count()
    
    return [
        {'role': 'Admins', 'count': admin_count, 'color': '#8b5cf6'},
        {'role': 'Evaluators', 'count': evaluator_count, 'color': '#10b981'},
        {'role': 'Annotators', 'count': annotator_count, 'color': '#6b7280'}
    ]

@app.get("/api/admin/analytics/quality-metrics")
def get_quality_metrics_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get quality metrics from completed annotations"""
    # Get completed annotations with quality scores
    completed_annotations = db.query(Annotation).filter(
        Annotation.annotation_status == 'completed',
        Annotation.overall_quality.isnot(None)
    ).all()
    
    if not completed_annotations:
        return {
            'averageQuality': 0,
            'averageFluency': 0,
            'averageAdequacy': 0,
            'completionRate': 0
        }
    
    # Calculate averages
    total_annotations = db.query(Annotation).count()
    completed_count = len(completed_annotations)
    
    avg_quality = sum(a.overall_quality for a in completed_annotations) / len(completed_annotations)
    avg_fluency = sum(a.fluency_score for a in completed_annotations if a.fluency_score) / len(completed_annotations)
    avg_adequacy = sum(a.adequacy_score for a in completed_annotations if a.adequacy_score) / len(completed_annotations)
    completion_rate = (completed_count / total_annotations) * 100 if total_annotations > 0 else 0
    
    return {
        'averageQuality': round(avg_quality, 1),
        'averageFluency': round(avg_fluency, 1),
        'averageAdequacy': round(avg_adequacy, 1),
        'completionRate': round(completion_rate, 1)
    }

@app.put("/api/admin/users/{user_id}", response_model=UserResponse)
def update_admin_user(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update user information (admin access required)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields
    if 'first_name' in user_data:
        user.first_name = user_data['first_name']
    if 'last_name' in user_data:
        user.last_name = user_data['last_name']
    if 'email' in user_data:
        user.email = user_data['email']
    if 'username' in user_data:
        user.username = user_data['username']
    if 'is_active' in user_data:
        user.is_active = user_data['is_active']
    if 'is_evaluator' in user_data:
        user.is_evaluator = user_data['is_evaluator']
    
    # Update languages if provided
    if 'languages' in user_data:
        # Remove existing languages
        db.query(UserLanguage).filter(UserLanguage.user_id == user_id).delete()
        
        # Add new languages
        for language in user_data['languages']:
            user_language = UserLanguage(user_id=user_id, language=language)
            db.add(user_language)
    
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)

@app.delete("/api/admin/users/{user_id}")
def delete_admin_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a user (admin access required)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@app.post("/api/admin/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    password_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Reset user password (admin access required)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.hashed_password = get_password_hash(password_data['new_password'])
    db.commit()
    
    return {"message": "Password reset successfully"}

@app.put("/api/admin/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    deactivation_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Deactivate a user (admin access required)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deactivating yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
