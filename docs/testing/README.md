# Testing Documentation & Guidelines

## Overview

This document provides comprehensive testing guidelines for the Lakra annotation system. Testing ensures the reliability, performance, and quality of the annotation platform across all user roles and workflows.

## Testing Strategy

### Testing Pyramid

```
    /\
   /  \
  /E2E \    End-to-End Tests (Few)
 /______\   - User workflows
/        \  - Integration scenarios
/Integration\ Integration Tests (Some)
/____________\ - API endpoints
/            \ - Database operations
/Unit Tests   \ Unit Tests (Many)
/______________\ - Individual functions
                 - Component logic
```

### Testing Levels

1. **Unit Tests** (60-70% of tests)
   - Individual functions and methods
   - Component logic
   - Utility functions
   - Data validation

2. **Integration Tests** (20-30% of tests)
   - API endpoints
   - Database operations
   - Service interactions
   - Component integration

3. **End-to-End Tests** (5-10% of tests)
   - Complete user workflows
   - Cross-system functionality
   - User acceptance scenarios

## Backend Testing

### Test Structure

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Pytest configuration
│   ├── unit/
│   │   ├── test_auth.py         # Authentication tests
│   │   ├── test_database.py     # Database model tests
│   │   ├── test_evaluator.py    # AI evaluator tests
│   │   └── test_schemas.py      # Data validation tests
│   ├── integration/
│   │   ├── test_api.py          # API endpoint tests
│   │   ├── test_annotations.py  # Annotation workflow tests
│   │   ├── test_evaluations.py  # Evaluation system tests
│   │   └── test_mt_quality.py   # MT quality assessment tests
│   └── fixtures/
│       ├── sample_data.json     # Test data
│       └── test_database.db     # Test database
├── requirements-test.txt        # Testing dependencies
└── pytest.ini                  # Pytest configuration
```

### Testing Dependencies

**requirements-test.txt:**
```txt
pytest>=7.0.0
pytest-asyncio>=0.21.0
pytest-cov>=4.0.0
pytest-mock>=3.10.0
httpx>=0.24.0
faker>=18.0.0
factory-boy>=3.2.0
sqlalchemy-utils>=0.41.0
```

### Unit Tests

#### Authentication Tests

**tests/unit/test_auth.py:**
```python
import pytest
from unittest.mock import Mock, patch
from backend.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    verify_token,
    authenticate_user
)
from backend.database import User

class TestPasswordHandling:
    def test_password_hashing(self):
        """Test password hashing and verification."""
        password = "test_password_123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert verify_password(password, hashed)
        assert not verify_password("wrong_password", hashed)
    
    def test_password_hash_uniqueness(self):
        """Test that same password produces different hashes."""
        password = "same_password"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)

class TestJWTTokens:
    def test_create_and_verify_token(self):
        """Test JWT token creation and verification."""
        test_data = {"sub": "test@example.com", "role": "user"}
        token = create_access_token(test_data)
        
        assert token is not None
        assert isinstance(token, str)
        
        # Verify token
        payload = verify_token(token)
        assert payload["sub"] == "test@example.com"
        assert payload["role"] == "user"
    
    def test_invalid_token(self):
        """Test handling of invalid tokens."""
        with pytest.raises(Exception):
            verify_token("invalid_token")
    
    def test_expired_token(self):
        """Test handling of expired tokens."""
        from datetime import timedelta
        
        # Create token with very short expiration
        test_data = {"sub": "test@example.com"}
        token = create_access_token(test_data, expires_delta=timedelta(seconds=-1))
        
        with pytest.raises(Exception):
            verify_token(token)

class TestUserAuthentication:
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock()
    
    @pytest.fixture
    def test_user(self):
        """Test user fixture."""
        user = User(
            email="test@example.com",
            username="testuser",
            hashed_password=get_password_hash("testpass123"),
            is_active=True
        )
        return user
    
    def test_authenticate_valid_user(self, mock_db, test_user):
        """Test authentication with valid credentials."""
        mock_db.query.return_value.filter.return_value.first.return_value = test_user
        
        authenticated_user = authenticate_user(mock_db, "test@example.com", "testpass123")
        
        assert authenticated_user is not None
        assert authenticated_user.email == "test@example.com"
    
    def test_authenticate_invalid_password(self, mock_db, test_user):
        """Test authentication with invalid password."""
        mock_db.query.return_value.filter.return_value.first.return_value = test_user
        
        authenticated_user = authenticate_user(mock_db, "test@example.com", "wrongpass")
        
        assert authenticated_user is False
    
    def test_authenticate_nonexistent_user(self, mock_db):
        """Test authentication with non-existent user."""
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        authenticated_user = authenticate_user(mock_db, "nonexistent@example.com", "password")
        
        assert authenticated_user is False
```

#### Database Model Tests

**tests/unit/test_database.py:**
```python
import pytest
from datetime import datetime
from backend.database import User, Sentence, Annotation, TextHighlight

class TestUserModel:
    def test_user_creation(self):
        """Test user model creation."""
        user = User(
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password",
            first_name="Test",
            last_name="User",
            is_active=True
        )
        
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.is_active is True
        assert user.is_admin is False
        assert user.is_evaluator is False
    
    def test_user_relationships(self):
        """Test user model relationships."""
        user = User(email="test@example.com", username="testuser")
        
        # Test relationship attributes exist
        assert hasattr(user, 'annotations')
        assert hasattr(user, 'evaluations')
        assert hasattr(user, 'mt_assessments')
        assert hasattr(user, 'languages')

class TestSentenceModel:
    def test_sentence_creation(self):
        """Test sentence model creation."""
        sentence = Sentence(
            source_text="Hello world",
            machine_translation="Kumusta mundo",
            source_language="en",
            target_language="fil",
            domain="general"
        )
        
        assert sentence.source_text == "Hello world"
        assert sentence.machine_translation == "Kumusta mundo"
        assert sentence.source_language == "en"
        assert sentence.target_language == "fil"
        assert sentence.is_active is True

class TestAnnotationModel:
    def test_annotation_creation(self):
        """Test annotation model creation."""
        annotation = Annotation(
            sentence_id=1,
            annotator_id=1,
            fluency_score=4,
            adequacy_score=3,
            overall_quality=4,
            final_form="Corrected translation",
            time_spent_seconds=120
        )
        
        assert annotation.fluency_score == 4
        assert annotation.adequacy_score == 3
        assert annotation.overall_quality == 4
        assert annotation.annotation_status == "in_progress"
        assert annotation.time_spent_seconds == 120
    
    def test_annotation_validation(self):
        """Test annotation score validation."""
        # Test valid scores
        annotation = Annotation(
            sentence_id=1,
            annotator_id=1,
            fluency_score=5,
            adequacy_score=1,
            overall_quality=3
        )
        
        assert 1 <= annotation.fluency_score <= 5
        assert 1 <= annotation.adequacy_score <= 5
        assert 1 <= annotation.overall_quality <= 5

class TestTextHighlightModel:
    def test_text_highlight_creation(self):
        """Test text highlight model creation."""
        highlight = TextHighlight(
            annotation_id=1,
            highlighted_text="error text",
            start_index=10,
            end_index=20,
            text_type="machine",
            comment="This is an error",
            error_type="MI_SE"
        )
        
        assert highlight.highlighted_text == "error text"
        assert highlight.start_index == 10
        assert highlight.end_index == 20
        assert highlight.error_type == "MI_SE"
        assert highlight.comment == "This is an error"
```

#### AI Evaluator Tests

**tests/unit/test_evaluator.py:**
```python
import pytest
from unittest.mock import Mock, patch
from backend.evaluator import (
    DistilBERTMTEvaluator, 
    SyntaxError, 
    SemanticError, 
    MTQualityScore,
    evaluate_mt_quality
)

class TestDistilBERTMTEvaluator:
    @pytest.fixture
    def evaluator(self):
        """Create evaluator instance."""
        return DistilBERTMTEvaluator()
    
    def test_evaluator_initialization(self, evaluator):
        """Test evaluator initialization."""
        assert evaluator is not None
        assert hasattr(evaluator, 'model')
        assert hasattr(evaluator, 'tokenizer')
    
    @patch('backend.evaluator.pipeline')
    def test_evaluate_translation(self, mock_pipeline, evaluator):
        """Test translation evaluation."""
        # Mock the pipeline
        mock_pipeline.return_value = Mock()
        
        source_text = "Hello world"
        target_text = "Hola mundo"
        
        result = evaluator.evaluate_translation(source_text, target_text)
        
        assert isinstance(result, MTQualityScore)
        assert 1.0 <= result.fluency_score <= 5.0
        assert 1.0 <= result.adequacy_score <= 5.0
        assert 1.0 <= result.overall_quality <= 5.0
        assert 0.0 <= result.model_confidence <= 1.0
    
    def test_syntax_error_detection(self, evaluator):
        """Test syntax error detection."""
        text_with_errors = "This are a bad grammar sentence."
        
        errors = evaluator._detect_syntax_errors(text_with_errors)
        
        assert isinstance(errors, list)
        # Should detect grammar error
        assert len(errors) > 0
        assert all(isinstance(error, SyntaxError) for error in errors)
    
    def test_semantic_error_detection(self, evaluator):
        """Test semantic error detection."""
        source_text = "The cat is sleeping."
        target_text = "El perro está durmiendo."  # Wrong animal
        
        errors = evaluator._detect_semantic_errors(source_text, target_text)
        
        assert isinstance(errors, list)
        # Should detect semantic mismatch
        assert len(errors) > 0
        assert all(isinstance(error, SemanticError) for error in errors)
    
    def test_fluency_score_calculation(self, evaluator):
        """Test fluency score calculation."""
        good_text = "This is a well-written sentence."
        bad_text = "This are very bad grammar sentence many error."
        
        good_score = evaluator._calculate_fluency_score(good_text, [])
        bad_score = evaluator._calculate_fluency_score(bad_text, [])
        
        assert good_score > bad_score
        assert 1.0 <= good_score <= 5.0
        assert 1.0 <= bad_score <= 5.0
    
    def test_adequacy_score_calculation(self, evaluator):
        """Test adequacy score calculation."""
        source_text = "The cat is sleeping."
        good_translation = "El gato está durmiendo."
        bad_translation = "The dog is running."
        
        good_score = evaluator._calculate_adequacy_score(source_text, good_translation, [])
        bad_score = evaluator._calculate_adequacy_score(source_text, bad_translation, [])
        
        assert good_score > bad_score
        assert 1.0 <= good_score <= 5.0
        assert 1.0 <= bad_score <= 5.0

class TestErrorClasses:
    def test_syntax_error_creation(self):
        """Test syntax error creation."""
        error = SyntaxError(
            error_type="grammar",
            severity="major",
            start_position=0,
            end_position=4,
            text_span="This",
            description="Subject-verb disagreement"
        )
        
        assert error.error_type == "grammar"
        assert error.severity == "major"
        assert error.text_span == "This"
        assert error.description == "Subject-verb disagreement"
    
    def test_semantic_error_creation(self):
        """Test semantic error creation."""
        error = SemanticError(
            error_type="mistranslation",
            severity="critical",
            start_position=4,
            end_position=7,
            text_span="cat",
            description="Incorrect animal translation"
        )
        
        assert error.error_type == "mistranslation"
        assert error.severity == "critical"
        assert error.text_span == "cat"
        assert error.description == "Incorrect animal translation"

class TestMTQualityScore:
    def test_quality_score_creation(self):
        """Test MT quality score creation."""
        score = MTQualityScore(
            fluency_score=4.0,
            adequacy_score=3.5,
            overall_quality=3.8,
            syntax_errors=[],
            semantic_errors=[],
            quality_explanation="Good translation overall",
            correction_suggestions=["Minor improvements needed"],
            model_confidence=0.85,
            processing_time_ms=150
        )
        
        assert score.fluency_score == 4.0
        assert score.adequacy_score == 3.5
        assert score.overall_quality == 3.8
        assert score.model_confidence == 0.85
        assert score.processing_time_ms == 150
```

### Integration Tests

#### API Endpoint Tests

**tests/integration/test_api.py:**
```python
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db, User
from backend.auth import get_password_hash

@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)

@pytest.fixture
def test_db():
    """Create test database."""
    # Implementation depends on your database setup
    pass

class TestAuthenticationEndpoints:
    def test_register_user(self, client):
        """Test user registration."""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User",
            "languages": ["en", "fil"]
        }
        
        response = client.post("/api/register", json=user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"]
        assert data["user"]["email"] == user_data["email"]
        assert data["user"]["username"] == user_data["username"]
    
    def test_login_user(self, client):
        """Test user login."""
        # First register a user
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        }
        client.post("/api/register", json=user_data)
        
        # Then login
        login_data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        
        response = client.post("/api/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"]
        assert data["user"]["email"] == login_data["email"]
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpass"
        }
        
        response = client.post("/api/login", json=login_data)
        
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

class TestAnnotationEndpoints:
    @pytest.fixture
    def authenticated_client(self, client):
        """Create authenticated client."""
        # Register and login user
        user_data = {
            "email": "annotator@example.com",
            "username": "annotator",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "Annotator"
        }
        client.post("/api/register", json=user_data)
        
        login_response = client.post("/api/login", json={
            "email": "annotator@example.com",
            "password": "testpass123"
        })
        
        token = login_response.json()["access_token"]
        client.headers = {"Authorization": f"Bearer {token}"}
        return client
    
    def test_create_annotation(self, authenticated_client):
        """Test annotation creation."""
        # First create a sentence
        sentence_data = {
            "source_text": "Hello world",
            "machine_translation": "Kumusta mundo",
            "source_language": "en",
            "target_language": "fil"
        }
        
        # Create sentence (requires admin privileges)
        # This would need proper admin setup
        
        annotation_data = {
            "sentence_id": 1,
            "fluency_score": 4,
            "adequacy_score": 3,
            "overall_quality": 4,
            "final_form": "Corrected translation",
            "highlights": [
                {
                    "highlighted_text": "error text",
                    "start_index": 10,
                    "end_index": 20,
                    "text_type": "machine",
                    "comment": "This is an error",
                    "error_type": "MI_SE"
                }
            ]
        }
        
        response = authenticated_client.post("/api/annotations", json=annotation_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["fluency_score"] == 4
        assert data["adequacy_score"] == 3
        assert len(data["highlights"]) == 1
    
    def test_get_annotations(self, authenticated_client):
        """Test getting user annotations."""
        response = authenticated_client.get("/api/annotations")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_unauthorized_access(self, client):
        """Test unauthorized access to protected endpoints."""
        response = client.get("/api/annotations")
        
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
```

#### Database Operation Tests

**tests/integration/test_database_operations.py:**
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base, User, Sentence, Annotation, TextHighlight

@pytest.fixture
def db_session():
    """Create test database session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    
    yield session
    
    session.close()

class TestUserOperations:
    def test_create_user(self, db_session):
        """Test user creation in database."""
        user = User(
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password",
            first_name="Test",
            last_name="User"
        )
        
        db_session.add(user)
        db_session.commit()
        
        retrieved_user = db_session.query(User).filter(User.email == "test@example.com").first()
        assert retrieved_user is not None
        assert retrieved_user.username == "testuser"
    
    def test_user_relationships(self, db_session):
        """Test user relationships with annotations."""
        # Create user
        user = User(
            email="test@example.com",
            username="testuser",
            hashed_password="hashed_password",
            first_name="Test",
            last_name="User"
        )
        db_session.add(user)
        db_session.commit()
        
        # Create sentence
        sentence = Sentence(
            source_text="Hello world",
            machine_translation="Hola mundo",
            source_language="en",
            target_language="es"
        )
        db_session.add(sentence)
        db_session.commit()
        
        # Create annotation
        annotation = Annotation(
            sentence_id=sentence.id,
            annotator_id=user.id,
            fluency_score=4,
            adequacy_score=3,
            overall_quality=4
        )
        db_session.add(annotation)
        db_session.commit()
        
        # Test relationship
        assert len(user.annotations) == 1
        assert user.annotations[0].fluency_score == 4

class TestAnnotationOperations:
    def test_annotation_with_highlights(self, db_session):
        """Test annotation creation with text highlights."""
        # Create user and sentence
        user = User(email="test@example.com", username="testuser", hashed_password="hash")
        sentence = Sentence(
            source_text="Hello world",
            machine_translation="Hola mundo",
            source_language="en",
            target_language="es"
        )
        
        db_session.add_all([user, sentence])
        db_session.commit()
        
        # Create annotation
        annotation = Annotation(
            sentence_id=sentence.id,
            annotator_id=user.id,
            fluency_score=4,
            adequacy_score=3,
            overall_quality=4
        )
        db_session.add(annotation)
        db_session.commit()
        
        # Create text highlight
        highlight = TextHighlight(
            annotation_id=annotation.id,
            highlighted_text="error text",
            start_index=10,
            end_index=20,
            text_type="machine",
            comment="This is an error",
            error_type="MI_SE"
        )
        db_session.add(highlight)
        db_session.commit()
        
        # Test relationships
        assert len(annotation.highlights) == 1
        assert annotation.highlights[0].error_type == "MI_SE"
        assert annotation.highlights[0].comment == "This is an error"
```

### Test Configuration

#### Pytest Configuration

**pytest.ini:**
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
    --disable-warnings
    --cov=backend
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow tests
    auth: Authentication tests
    api: API tests
    database: Database tests
```

**conftest.py:**
```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import Base, get_db

@pytest.fixture(scope="session")
def db_engine():
    """Create test database engine."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return engine

@pytest.fixture
def db_session(db_engine):
    """Create test database session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    
    yield session
    
    session.rollback()
    session.close()

@pytest.fixture
def client(db_session):
    """Create test client with database override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()

@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "languages": ["en", "fil"]
    }

@pytest.fixture
def sample_sentence_data():
    """Sample sentence data for testing."""
    return {
        "source_text": "Hello world",
        "machine_translation": "Kumusta mundo",
        "source_language": "en",
        "target_language": "fil",
        "domain": "general"
    }

@pytest.fixture
def sample_annotation_data():
    """Sample annotation data for testing."""
    return {
        "sentence_id": 1,
        "fluency_score": 4,
        "adequacy_score": 3,
        "overall_quality": 4,
        "final_form": "Corrected translation",
        "highlights": [
            {
                "highlighted_text": "error text",
                "start_index": 10,
                "end_index": 20,
                "text_type": "machine",
                "comment": "This is an error",
                "error_type": "MI_SE"
            }
        ]
    }
```

## Frontend Testing

### Test Structure

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── components/
│   │   │   ├── AnnotationInterface.test.tsx
│   │   │   ├── Login.test.tsx
│   │   │   └── UserDashboard.test.tsx
│   │   ├── services/
│   │   │   └── api.test.ts
│   │   ├── utils/
│   │   │   └── helpers.test.ts
│   │   └── setupTests.ts
│   ├── components/
│   └── ...
├── e2e/
│   ├── specs/
│   │   ├── annotation.e2e.ts
│   │   ├── authentication.e2e.ts
│   │   └── evaluation.e2e.ts
│   └── support/
│       └── commands.ts
├── jest.config.js
├── cypress.config.ts
└── package.json
```

### Unit Tests (React Testing Library)

#### Component Tests

**src/__tests__/components/Login.test.tsx:**
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../components/Login';
import { AuthProvider } from '../../contexts/AuthContext';

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  test('renders login form', () => {
    renderLogin();
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  test('shows validation errors for empty fields', async () => {
    renderLogin();
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
  
  test('submits form with valid data', async () => {
    const mockLogin = jest.fn();
    
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
  
  test('shows error message on login failure', async () => {
    // Mock failed login
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

**src/__tests__/components/AnnotationInterface.test.tsx:**
```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AnnotationInterface from '../../components/AnnotationInterface';
import { AuthProvider } from '../../contexts/AuthContext';

const mockSentence = {
  id: 1,
  source_text: "Hello world",
  machine_translation: "Hola mundo",
  source_language: "en",
  target_language: "es",
  domain: "general",
  created_at: "2024-01-01T00:00:00Z",
  is_active: true
};

const renderAnnotationInterface = () => {
  return render(
    <AuthProvider>
      <AnnotationInterface sentence={mockSentence} />
    </AuthProvider>
  );
};

describe('AnnotationInterface Component', () => {
  test('renders sentence content', () => {
    renderAnnotationInterface();
    
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Hola mundo")).toBeInTheDocument();
  });
  
  test('renders quality score inputs', () => {
    renderAnnotationInterface();
    
    expect(screen.getByLabelText(/fluency score/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adequacy score/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/overall quality/i)).toBeInTheDocument();
  });
  
  test('handles text selection for highlighting', async () => {
    renderAnnotationInterface();
    
    const translationText = screen.getByText("Hola mundo");
    
    // Simulate text selection
    fireEvent.mouseUp(translationText);
    
    await waitFor(() => {
      expect(screen.getByText(/add highlight/i)).toBeInTheDocument();
    });
  });
  
  test('validates quality scores', async () => {
    renderAnnotationInterface();
    
    const fluencyInput = screen.getByLabelText(/fluency score/i);
    const submitButton = screen.getByRole('button', { name: /submit annotation/i });
    
    // Enter invalid score
    fireEvent.change(fluencyInput, { target: { value: '6' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/score must be between 1 and 5/i)).toBeInTheDocument();
    });
  });
  
  test('submits annotation with valid data', async () => {
    const mockOnComplete = jest.fn();
    
    render(
      <AuthProvider>
        <AnnotationInterface sentence={mockSentence} onComplete={mockOnComplete} />
      </AuthProvider>
    );
    
    const fluencyInput = screen.getByLabelText(/fluency score/i);
    const adequacyInput = screen.getByLabelText(/adequacy score/i);
    const overallInput = screen.getByLabelText(/overall quality/i);
    const submitButton = screen.getByRole('button', { name: /submit annotation/i });
    
    fireEvent.change(fluencyInput, { target: { value: '4' } });
    fireEvent.change(adequacyInput, { target: { value: '3' } });
    fireEvent.change(overallInput, { target: { value: '4' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});
```

#### Service Tests

**src/__tests__/services/api.test.ts:**
```typescript
import { api } from '../../services/api';
import { User, Sentence, Annotation } from '../../types';

// Mock axios
jest.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Authentication', () => {
    test('login makes correct API call', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          user: { id: 1, email: 'test@example.com' }
        }
      };
      
      (api.post as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await api.login('test@example.com', 'password123');
      
      expect(api.post).toHaveBeenCalledWith('/api/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse.data);
    });
    
    test('register makes correct API call', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User'
      };
      
      const mockResponse = {
        data: {
          access_token: 'test-token',
          user: { id: 1, ...userData }
        }
      };
      
      (api.post as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await api.register(userData);
      
      expect(api.post).toHaveBeenCalledWith('/api/register', userData);
      expect(result).toEqual(mockResponse.data);
    });
  });
  
  describe('Sentences', () => {
    test('getSentences makes correct API call', async () => {
      const mockSentences = [
        { id: 1, source_text: 'Hello', machine_translation: 'Hola' }
      ];
      
      (api.get as jest.Mock).mockResolvedValue({ data: mockSentences });
      
      const result = await api.getSentences();
      
      expect(api.get).toHaveBeenCalledWith('/api/sentences');
      expect(result).toEqual(mockSentences);
    });
    
    test('getNextSentence makes correct API call', async () => {
      const mockSentence = { id: 1, source_text: 'Hello', machine_translation: 'Hola' };
      
      (api.get as jest.Mock).mockResolvedValue({ data: mockSentence });
      
      const result = await api.getNextSentence();
      
      expect(api.get).toHaveBeenCalledWith('/api/sentences/next');
      expect(result).toEqual(mockSentence);
    });
  });
  
  describe('Annotations', () => {
    test('createAnnotation makes correct API call', async () => {
      const annotationData = {
        sentence_id: 1,
        fluency_score: 4,
        adequacy_score: 3,
        overall_quality: 4
      };
      
      const mockResponse = { data: { id: 1, ...annotationData } };
      
      (api.post as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await api.createAnnotation(annotationData);
      
      expect(api.post).toHaveBeenCalledWith('/api/annotations', annotationData);
      expect(result).toEqual(mockResponse.data);
    });
    
    test('getMyAnnotations makes correct API call', async () => {
      const mockAnnotations = [
        { id: 1, sentence_id: 1, fluency_score: 4 }
      ];
      
      (api.get as jest.Mock).mockResolvedValue({ data: mockAnnotations });
      
      const result = await api.getMyAnnotations();
      
      expect(api.get).toHaveBeenCalledWith('/api/annotations');
      expect(result).toEqual(mockAnnotations);
    });
  });
});
```

### End-to-End Tests (Cypress)

#### E2E Test Configuration

**cypress.config.ts:**
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'e2e/support/commands.ts',
    specPattern: 'e2e/specs/**/*.e2e.ts',
    video: true,
    screenshot: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      apiUrl: 'http://localhost:8000',
    },
  },
});
```

#### Authentication E2E Tests

**e2e/specs/authentication.e2e.ts:**
```typescript
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset database state
    cy.task('resetDb');
    cy.visit('/login');
  });
  
  it('should allow user to register and login', () => {
    // Navigate to registration
    cy.get('[data-cy="register-link"]').click();
    
    // Fill registration form
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="username-input"]').type('testuser');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="first-name-input"]').type('Test');
    cy.get('[data-cy="last-name-input"]').type('User');
    
    // Submit registration
    cy.get('[data-cy="register-button"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="user-name"]').should('contain', 'Test User');
  });
  
  it('should login existing user', () => {
    // Create test user
    cy.task('createUser', {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    });
    
    // Login
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="user-name"]').should('contain', 'Test User');
  });
  
  it('should show error for invalid credentials', () => {
    cy.get('[data-cy="email-input"]').type('invalid@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="login-button"]').click();
    
    cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
  });
  
  it('should logout user', () => {
    // Login first
    cy.task('createUser', {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    });
    
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();
    
    // Logout
    cy.get('[data-cy="logout-button"]').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
  });
});
```

#### Annotation Workflow E2E Tests

**e2e/specs/annotation.e2e.ts:**
```typescript
describe('Annotation Workflow', () => {
  beforeEach(() => {
    // Setup test data
    cy.task('resetDb');
    cy.task('createUser', {
      email: 'annotator@example.com',
      username: 'annotator',
      password: 'password123',
      first_name: 'Test',
      last_name: 'Annotator'
    });
    cy.task('createSentence', {
      source_text: 'Hello world',
      machine_translation: 'Hola mundo',
      source_language: 'en',
      target_language: 'es'
    });
    
    // Login
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('annotator@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();
  });
  
  it('should complete annotation workflow', () => {
    // Navigate to annotation interface
    cy.get('[data-cy="start-annotation-button"]').click();
    
    // Should display sentence
    cy.get('[data-cy="source-text"]').should('contain', 'Hello world');
    cy.get('[data-cy="machine-translation"]').should('contain', 'Hola mundo');
    
    // Add text highlight
    cy.get('[data-cy="machine-translation"]').then(($el) => {
      // Select text
      const text = $el.text();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents($el[0]);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Trigger mouseup to show highlight menu
      cy.wrap($el).trigger('mouseup');
    });
    
    // Add highlight
    cy.get('[data-cy="add-highlight-button"]').click();
    cy.get('[data-cy="highlight-comment"]').type('This is an error');
    cy.get('[data-cy="error-type-select"]').select('MI_SE');
    cy.get('[data-cy="confirm-highlight"]').click();
    
    // Fill quality scores
    cy.get('[data-cy="fluency-score"]').type('4');
    cy.get('[data-cy="adequacy-score"]').type('3');
    cy.get('[data-cy="overall-quality"]').type('4');
    
    // Add final form
    cy.get('[data-cy="final-form"]').type('Corrected translation');
    
    // Submit annotation
    cy.get('[data-cy="submit-annotation"]').click();
    
    // Should show success message
    cy.get('[data-cy="success-message"]').should('be.visible');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });
  
  it('should validate required fields', () => {
    cy.get('[data-cy="start-annotation-button"]').click();
    
    // Try to submit without filling required fields
    cy.get('[data-cy="submit-annotation"]').click();
    
    // Should show validation errors
    cy.get('[data-cy="fluency-error"]').should('contain', 'required');
    cy.get('[data-cy="adequacy-error"]').should('contain', 'required');
    cy.get('[data-cy="overall-quality-error"]').should('contain', 'required');
  });
  
  it('should save annotation as draft', () => {
    cy.get('[data-cy="start-annotation-button"]').click();
    
    // Fill partial data
    cy.get('[data-cy="fluency-score"]').type('4');
    cy.get('[data-cy="adequacy-score"]').type('3');
    
    // Save as draft
    cy.get('[data-cy="save-draft-button"]').click();
    
    // Should show draft saved message
    cy.get('[data-cy="draft-saved-message"]').should('be.visible');
    
    // Navigate away and back
    cy.get('[data-cy="dashboard-link"]').click();
    cy.get('[data-cy="my-annotations-link"]').click();
    
    // Should show draft annotation
    cy.get('[data-cy="annotation-status"]').should('contain', 'Draft');
  });
});
```

## Performance Testing

### Load Testing

**tests/performance/load_test.py:**
```python
import time
import concurrent.futures
import requests
import statistics

class LoadTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_endpoint(self, endpoint, method="GET", data=None, headers=None):
        """Test a single endpoint."""
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            if method == "GET":
                response = self.session.get(url, headers=headers)
            elif method == "POST":
                response = self.session.post(url, json=data, headers=headers)
            
            end_time = time.time()
            response_time = end_time - start_time
            
            return {
                "status_code": response.status_code,
                "response_time": response_time,
                "success": response.status_code < 400
            }
        except Exception as e:
            return {
                "status_code": 0,
                "response_time": time.time() - start_time,
                "success": False,
                "error": str(e)
            }
    
    def run_load_test(self, endpoint, num_requests=100, concurrent_users=10):
        """Run load test on endpoint."""
        print(f"Running load test on {endpoint}")
        print(f"Requests: {num_requests}, Concurrent users: {concurrent_users}")
        
        results = []
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = []
            
            for i in range(num_requests):
                future = executor.submit(self.test_endpoint, endpoint)
                futures.append(future)
            
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                results.append(result)
        
        return self.analyze_results(results)
    
    def analyze_results(self, results):
        """Analyze test results."""
        response_times = [r["response_time"] for r in results]
        success_count = sum(1 for r in results if r["success"])
        
        analysis = {
            "total_requests": len(results),
            "successful_requests": success_count,
            "failed_requests": len(results) - success_count,
            "success_rate": (success_count / len(results)) * 100,
            "average_response_time": statistics.mean(response_times),
            "median_response_time": statistics.median(response_times),
            "min_response_time": min(response_times),
            "max_response_time": max(response_times),
            "95th_percentile": statistics.quantiles(response_times, n=20)[18]
        }
        
        return analysis

def main():
    tester = LoadTester()
    
    # Test health endpoint
    health_results = tester.run_load_test("/health", num_requests=100, concurrent_users=10)
    print("Health Endpoint Results:")
    print(f"Success Rate: {health_results['success_rate']:.2f}%")
    print(f"Average Response Time: {health_results['average_response_time']:.3f}s")
    print(f"95th Percentile: {health_results['95th_percentile']:.3f}s")
    
    # Test API endpoints (requires authentication)
    # Add more endpoint tests here

if __name__ == "__main__":
    main()
```

## Test Automation

### CI/CD Pipeline Testing

**GitHub Actions (.github/workflows/test.yml):**
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_lakra
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        cd backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run unit tests
      run: |
        cd backend
        pytest tests/unit -v --cov=. --cov-report=xml
    
    - name: Run integration tests
      run: |
        cd backend
        pytest tests/integration -v
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_lakra
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run unit tests
      run: |
        cd frontend
        npm test -- --coverage --watchAll=false
    
    - name: Run linting
      run: |
        cd frontend
        npm run lint
    
    - name: Run type checking
      run: |
        cd frontend
        npm run type-check

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Start backend
      run: |
        cd backend
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        python main.py &
        sleep 10
    
    - name: Start frontend
      run: |
        cd frontend
        npm ci
        npm run build
        npm run preview &
        sleep 10
    
    - name: Run Cypress tests
      run: |
        cd frontend
        npm run cypress:run
    
    - name: Upload screenshots
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: cypress-screenshots
        path: frontend/cypress/screenshots
```

### Test Reporting

**Test Coverage Report:**
```python
# coverage_report.py
import coverage
import sys

def generate_coverage_report():
    """Generate test coverage report."""
    cov = coverage.Coverage()
    cov.start()
    
    # Run tests
    import pytest
    exit_code = pytest.main(['-v', 'tests/'])
    
    cov.stop()
    cov.save()
    
    # Generate reports
    print("Coverage Report:")
    cov.report()
    
    # Generate HTML report
    cov.html_report(directory='htmlcov')
    
    # Check coverage threshold
    total_coverage = cov.report(show_missing=False)
    if total_coverage < 80:
        print(f"Coverage {total_coverage:.1f}% is below threshold (80%)")
        sys.exit(1)
    
    print(f"Coverage {total_coverage:.1f}% meets threshold")

if __name__ == "__main__":
    generate_coverage_report()
```

## Quality Assurance

### Code Quality Checks

**Backend Quality Checks:**
```python
# quality_checks.py
import ast
import subprocess
import sys

def run_linting():
    """Run code linting."""
    print("Running flake8...")
    result = subprocess.run(['flake8', '.'], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("Linting failed:")
        print(result.stdout)
        return False
    
    print("Linting passed")
    return True

def run_type_checking():
    """Run type checking."""
    print("Running mypy...")
    result = subprocess.run(['mypy', '.'], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("Type checking failed:")
        print(result.stdout)
        return False
    
    print("Type checking passed")
    return True

def check_complexity():
    """Check code complexity."""
    print("Checking code complexity...")
    result = subprocess.run(['radon', 'cc', '.', '--min', 'B'], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("Complexity check failed:")
        print(result.stdout)
        return False
    
    print("Complexity check passed")
    return True

def main():
    """Run all quality checks."""
    checks = [
        run_linting(),
        run_type_checking(),
        check_complexity()
    ]
    
    if all(checks):
        print("All quality checks passed")
        sys.exit(0)
    else:
        print("Some quality checks failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### Security Testing

**Security Test Suite:**
```python
# security_tests.py
import requests
import json

class SecurityTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
    
    def test_sql_injection(self):
        """Test for SQL injection vulnerabilities."""
        payloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "' UNION SELECT * FROM users --"
        ]
        
        for payload in payloads:
            response = requests.post(
                f"{self.base_url}/api/login",
                json={"email": payload, "password": "test"}
            )
            
            # Should not return 200 or reveal database errors
            assert response.status_code != 200
            assert "database" not in response.text.lower()
    
    def test_xss_prevention(self):
        """Test for XSS prevention."""
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src='x' onerror='alert(1)'>"
        ]
        
        for payload in xss_payloads:
            response = requests.post(
                f"{self.base_url}/api/register",
                json={
                    "email": "test@example.com",
                    "username": payload,
                    "password": "test123",
                    "first_name": "Test",
                    "last_name": "User"
                }
            )
            
            # Should either reject or sanitize the payload
            if response.status_code == 200:
                assert payload not in response.text
    
    def test_authentication_bypass(self):
        """Test for authentication bypass."""
        protected_endpoints = [
            "/api/annotations",
            "/api/admin/users",
            "/api/me"
        ]
        
        for endpoint in protected_endpoints:
            response = requests.get(f"{self.base_url}{endpoint}")
            
            # Should return 401 Unauthorized
            assert response.status_code == 401
    
    def test_rate_limiting(self):
        """Test rate limiting."""
        # Make multiple requests rapidly
        for i in range(20):
            response = requests.post(
                f"{self.base_url}/api/login",
                json={"email": "test@example.com", "password": "wrong"}
            )
            
            # Should implement rate limiting
            if i > 10:
                assert response.status_code in [429, 503]

def main():
    tester = SecurityTester()
    
    print("Running security tests...")
    tester.test_sql_injection()
    tester.test_xss_prevention()
    tester.test_authentication_bypass()
    tester.test_rate_limiting()
    
    print("Security tests completed")

if __name__ == "__main__":
    main()
```

## Best Practices

### Testing Guidelines

1. **Test Naming**
   - Use descriptive test names
   - Follow `test_<action>_<expected_result>` pattern
   - Group related tests in classes

2. **Test Structure**
   - Arrange, Act, Assert pattern
   - One assertion per test
   - Clear test setup and teardown

3. **Test Data**
   - Use factories for test data
   - Avoid hardcoded values
   - Clean up after tests

4. **Mocking**
   - Mock external dependencies
   - Use dependency injection
   - Mock at the right level

5. **Coverage**
   - Aim for 80%+ code coverage
   - Focus on critical paths
   - Include edge cases

### Performance Testing Guidelines

1. **Load Testing**
   - Test realistic user loads
   - Identify bottlenecks
   - Monitor resource usage

2. **Stress Testing**
   - Test beyond normal capacity
   - Identify breaking points
   - Test recovery mechanisms

3. **Metrics to Monitor**
   - Response times
   - Throughput
   - Error rates
   - Resource utilization

## Troubleshooting

### Common Testing Issues

1. **Test Database Issues**
   ```bash
   # Reset test database
   python -c "from database import engine; engine.drop_all(); engine.create_all()"
   ```

2. **Async Test Issues**
   ```python
   # Use pytest-asyncio
   @pytest.mark.asyncio
   async def test_async_function():
       result = await async_function()
       assert result is not None
   ```

3. **Mock Issues**
   ```python
   # Proper mock cleanup
   @pytest.fixture(autouse=True)
   def cleanup_mocks():
       yield
       mock.patch.stopall()
   ```

4. **Frontend Test Issues**
   ```bash
   # Clear Jest cache
   npm test -- --clearCache
   
   # Update snapshots
   npm test -- --updateSnapshot
   ```

---

**Last Updated**: January 2024  
**Testing Framework Versions**: pytest 7.0+, Jest 29.0+, Cypress 12.0+  
**Coverage Target**: 80%+ for production code 