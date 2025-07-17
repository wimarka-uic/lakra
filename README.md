<div align="center">
  <img src="https://raw.githubusercontent.com/wimarka-uic/lakra/d0abd137499cd39740394f8b5179790e50b3fa56/frontend/public/lakra.svg" alt="Lakra Logo" width="256" height="256">
</div>

A comprehensive annotation and evaluation system for Machine Translation (MT) quality assessment, designed specifically for the WiMarka project. Built with FastAPI, PostgreSQL, React, TypeScript, and TailwindCSS.

## Overview

Lakra is a sophisticated annotation platform that supports multiple annotation workflows for evaluating machine translation quality. The system combines AI-powered assessment with human-in-the-loop evaluation to provide comprehensive MT quality analysis.

## Features

### Core Annotation Features
- **Text Highlighting**: Interactive text selection and highlighting for error annotation
- **Error Classification**: Categorized error types (MI_ST, MI_SE, MA_ST, MA_SE)
- **Quality Scoring**: Multi-dimensional quality assessment (fluency, adequacy, overall quality)
- **Voice Recording**: Audio annotation support for final corrected forms
- **Real-time Processing**: Immediate feedback and validation

### MT Quality Assessment
- **AI-Powered Evaluation**: DistilBERT-based quality scoring (0-100) with confidence levels
- **Error Detection & Classification**: Automatic detection of syntax and semantic errors
- **Detailed Explanations**: AI-generated explanations for quality scores and detected errors
- **Improvement Suggestions**: Automated suggestions for translation improvements
- **Human Feedback Integration**: Evaluators can confirm, reject, or modify AI assessments

### User Management & Roles
- **Multi-Role System**: Administrators, Annotators, and Evaluators
- **Language Preferences**: User-specific language settings and preferences
- **Onboarding System**: Comprehensive onboarding tests for quality assurance
- **Progress Tracking**: Individual and system-wide progress monitoring

### For Annotators
- **Interactive Annotation Interface**: Intuitive text highlighting and error marking
- **Quality Assessment**: Rate fluency, adequacy, and overall quality (1-5 scale)
- **Error Documentation**: Detailed error classification and descriptions
- **Voice Integration**: Record audio explanations for corrections
- **Progress Dashboard**: Track annotation history and statistics

### For Evaluators
- **Annotation Evaluation**: Review and score other annotators' work
- **MT Quality Assessment**: Evaluate machine translation quality with AI assistance
- **Feedback System**: Provide detailed feedback on annotations and assessments
- **Quality Metrics**: Track evaluation accuracy and agreement rates
- **Batch Processing**: Efficient batch assessment capabilities

### For Administrators
- **Admin Dashboard**: Comprehensive system overview and analytics
- **User Management**: Manage users, roles, and permissions
- **Content Management**: Add and manage sentences for annotation
- **Bulk Import**: Import sentences via CSV files for efficient content management
- **Quality Control**: Monitor annotation and evaluation quality
- **System Analytics**: Track completion rates and quality metrics

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework with automatic API documentation
- **SQLAlchemy**: SQL toolkit and ORM for database management
- **SQLite**: Lightweight database for development and small deployments
- **JWT Authentication**: Secure token-based authentication system
- **Pydantic**: Data validation and serialization
- **DistilBERT Integration**: AI model for MT quality assessment

### Frontend
- **React**: Modern JavaScript library for building user interfaces
- **TypeScript**: Type-safe JavaScript development
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **Lucide React**: Beautiful icon library

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database:**
   ```bash
   python init_db.py
   ```

5. **Start the FastAPI server:**
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`
   API documentation will be available at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Default Credentials

After running the database initialization script, you can log in with:

- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Administrator

## System Architecture

### Database Schema

**Users Table:**
- User authentication and profile information
- Role-based access control (admin/annotator/evaluator)
- Language preferences and onboarding status
- Activity tracking and evaluation statistics

**Sentences Table:**
- Source text and machine translations
- Language pairs and domain classification
- Active/inactive status management

**Annotations Table:**
- Quality ratings (fluency, adequacy, overall quality)
- Error documentation and suggested corrections
- Voice recording integration
- Time tracking and status management

**TextHighlights Table:**
- Interactive text highlighting for error annotation
- Error type classification (MI_ST, MI_SE, MA_ST, MA_SE)
- Character position tracking for precise error location

**MTQualityAssessment Table:**
- AI-generated quality scores with confidence levels
- Syntax and semantic error detection
- Human feedback integration
- Processing metadata and time tracking

**Evaluations Table:**
- Annotation quality assessment by evaluators
- Multi-dimensional scoring (accuracy, completeness, overall)
- Feedback and evaluation notes
- Time tracking and status management

**OnboardingTests Table:**
- User onboarding test management
- Test scoring and completion tracking
- Language-specific test data

### API Endpoints

**Authentication:**
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Get current user info
- `PUT /api/me/guidelines-seen` - Mark guidelines as seen

**Sentences:**
- `GET /api/sentences` - List all sentences
- `GET /api/sentences/next` - Get next sentence for annotation
- `GET /api/sentences/unannotated` - Get unannotated sentences
- `POST /api/sentences` - Create new sentence (admin only)
- `POST /api/sentences/bulk` - Bulk create sentences (admin only)
- `POST /api/sentences/import-csv` - Import sentences from CSV file (admin only)

**Annotations:**
- `POST /api/annotations` - Create new annotation
- `POST /api/annotations/legacy` - Legacy annotation format
- `PUT /api/annotations/{id}` - Update annotation
- `GET /api/annotations` - Get user's annotations
- `DELETE /api/annotations/{id}` - Delete annotation
- `POST /api/annotations/upload-voice` - Upload voice recording

**Evaluations:**
- `POST /api/evaluations` - Create evaluation
- `PUT /api/evaluations/{id}` - Update evaluation
- `GET /api/evaluations` - Get user's evaluations
- `GET /api/evaluations/pending` - Get pending evaluations

**MT Quality Assessment:**
- `POST /api/mt-quality/assess` - Create MT quality assessment
- `PUT /api/mt-quality/{id}` - Update assessment
- `GET /api/mt-quality/my-assessments` - Get user's assessments
- `GET /api/mt-quality/pending` - Get pending assessments
- `POST /api/mt-quality/batch-assess` - Batch assessment
- `GET /api/mt-quality/stats` - Get assessment statistics

**Admin:**
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/sentences` - List all sentences
- `GET /api/admin/annotations` - List all annotations
- `GET /api/admin/mt-quality` - List all MT assessments
- `PUT /api/admin/users/{id}/toggle-evaluator` - Toggle evaluator role

**Onboarding:**
- `POST /api/onboarding-tests` - Create onboarding test
- `POST /api/onboarding-tests/{id}/submit` - Submit test
- `GET /api/onboarding-tests/my-tests` - Get user's tests
- `GET /api/onboarding-tests/{id}` - Get specific test

## Usage Guide

### For Annotators

1. **Register/Login**: Create an account or log in with existing credentials
2. **Complete Onboarding**: Take onboarding tests if required
3. **Start Annotation**: Navigate to the annotation interface
4. **Highlight Errors**: Select text and mark errors with appropriate classifications
5. **Rate Quality**: Provide fluency, adequacy, and overall quality scores
6. **Add Comments**: Provide detailed explanations for errors and corrections
7. **Record Voice**: Optionally record audio explanations
8. **Submit Annotation**: Save your work and move to the next sentence

### For Evaluators

1. **Access Evaluation Interface**: Navigate to evaluation dashboard
2. **Review Annotations**: Assess other annotators' work quality
3. **MT Quality Assessment**: Evaluate machine translation quality with AI assistance
4. **Provide Feedback**: Give detailed feedback on annotations and assessments
5. **Track Progress**: Monitor evaluation statistics and agreement rates

### For Administrators

1. **Access Admin Panel**: Navigate to admin dashboard
2. **Monitor System**: View comprehensive system statistics
3. **Manage Users**: Add users, assign roles, and monitor activity
4. **Manage Content**: Add sentences and monitor annotation progress
5. **Quality Control**: Review annotation and evaluation quality

## Quality Metrics

The system tracks various quality metrics:

- **Annotation Quality**: Fluency, adequacy, and overall quality scores
- **Error Classification**: Detailed error type analysis
- **Evaluation Agreement**: Inter-evaluator agreement rates
- **MT Quality Assessment**: AI-assisted quality scoring with human validation
- **Processing Time**: Time tracking for efficiency analysis
- **Onboarding Performance**: Test scores and completion rates

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `main.py`, define schemas in `schemas.py`
2. **Frontend**: Create new components in `src/components/`, add routes to `App.tsx`
3. **Database**: Modify models in `database.py`, run migrations if needed

### Configuration

- **Database URL**: Configure in `backend/database.py`
- **JWT Secret**: Update `SECRET_KEY` in `backend/auth.py`
- **CORS Settings**: Modify allowed origins in `backend/main.py`
- **API Base URL**: Update in `frontend/src/services/api.ts`

## Production Deployment

### Backend
- Use a production WSGI server like Gunicorn or Uvicorn
- Configure environment variables for sensitive data
- Use a production database (PostgreSQL recommended)
- Set up proper logging and monitoring

### Frontend
- Build the production bundle: `npm run build`
- Serve static files with a web server (Nginx recommended)
- Configure proper caching headers
- Set up HTTPS and security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the database schema in `database.py`
3. Check browser console for frontend errors
4. Review server logs for backend issues 
