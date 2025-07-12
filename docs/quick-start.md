# Quick Start Guide

## Overview

This guide will help you get the Lakra annotation system up and running quickly. For detailed installation instructions, see the [Installation Guide](installation.md).

## Prerequisites

- Python 3.8+
- Node.js 16+
- Git
- 20GB free disk space

## 5-Minute Setup

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-username/lakra.git
cd lakra

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# or venv\Scripts\activate  # Windows
pip install -r requirements.txt
python init_db.py

# Setup frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create configuration files:

**backend/.env:**
```env
DATABASE_URL=sqlite:///./annotation_system.db
SECRET_KEY=your-secret-key-change-this-in-production
API_HOST=localhost
API_PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:5173
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Lakra
VITE_ENVIRONMENT=development
```

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## First Use

### 1. Create Admin Account

```bash
# In backend directory with venv activated
python -c "
from database import SessionLocal, User
from auth import get_password_hash

db = SessionLocal()
admin = User(
    email='admin@example.com',
    username='admin',
    hashed_password=get_password_hash('admin123'),
    first_name='Admin',
    last_name='User',
    is_admin=True,
    is_active=True
)
db.add(admin)
db.commit()
print('Admin user created: admin@example.com / admin123')
"
```

### 2. Load Sample Data

```bash
python -c "
from database import SessionLocal, Sentence

db = SessionLocal()
sentences = [
    Sentence(
        source_text='Hello world',
        machine_translation='Hola mundo',
        source_language='en',
        target_language='es',
        domain='general'
    ),
    Sentence(
        source_text='Good morning',
        machine_translation='Buenos días',
        source_language='en',
        target_language='es',
        domain='greetings'
    )
]

for sentence in sentences:
    db.add(sentence)
db.commit()
print('Sample data loaded')
"
```

### 3. Register and Login

1. **Open browser to** http://localhost:5173
2. **Click "Register"** to create a new account
3. **Fill in your details**:
   - Email: your-email@example.com
   - Username: your-username
   - Password: secure-password
   - Name: Your Name
   - Languages: Select your preferred languages
4. **Complete onboarding test** if prompted
5. **Start annotating!**

## Key Features Overview

### For Annotators

- **Annotation Interface**: Interactive text highlighting and quality scoring
- **Quality Assessment**: 1-5 scale scoring for fluency, adequacy, and overall quality
- **Error Classification**: Categorize errors as minor/major syntax or semantic issues
- **Voice Recording**: Optional audio recordings for pronunciation corrections
- **Progress Tracking**: Monitor your annotation statistics and history

### For Evaluators

- **Evaluation Dashboard**: Review and assess annotation quality
- **MT Quality Assessment**: AI-powered machine translation evaluation
- **Performance Metrics**: Track evaluation statistics and feedback
- **Batch Processing**: Handle multiple evaluations efficiently

### For Administrators

- **User Management**: Create, manage, and assign roles to users
- **Content Management**: Upload and organize sentences for annotation
- **System Analytics**: Monitor system usage and performance
- **Quality Control**: Oversee annotation and evaluation processes

## Common Tasks

### Adding New Sentences

```bash
# As admin, add sentences via API or admin interface
curl -X POST http://localhost:8000/api/sentences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "source_text": "How are you?",
    "machine_translation": "¿Cómo estás?",
    "source_language": "en",
    "target_language": "es",
    "domain": "conversation"
  }'
```

### Creating User Accounts

```bash
# Register via web interface or API
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "newuser",
    "password": "password123",
    "first_name": "New",
    "last_name": "User",
    "languages": ["en", "es"]
  }'
```

### Basic Annotation Workflow

1. **Login to the system**
2. **Click "Start Annotating"** from dashboard
3. **Review the sentence pair** (source + machine translation)
4. **Highlight errors** by selecting text in the translation
5. **Classify errors** using the error type dropdown
6. **Add comments** explaining the issues
7. **Provide quality scores** (1-5 scale)
8. **Create final corrected version**
9. **Submit annotation**

## Configuration Options

### Backend Configuration

Common settings in `backend/.env`:

```env
# Database
DATABASE_URL=sqlite:///./annotation_system.db

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Settings
API_HOST=localhost
API_PORT=8000
DEBUG=True

# Features
ENABLE_VOICE_RECORDING=True
ENABLE_MT_QUALITY=True
ENABLE_ONBOARDING=True
```

### Frontend Configuration

Common settings in `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# App Settings
VITE_APP_NAME=Lakra
VITE_ENVIRONMENT=development

# Features
VITE_ENABLE_VOICE_RECORDING=true
VITE_ENABLE_DEBUG_MODE=true
```

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check if port is in use
lsof -i :8000

# Verify virtual environment is activated
which python
pip list | grep fastapi
```

**Frontend won't start:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Database issues:**
```bash
# Reset database
rm -f backend/annotation_system.db
cd backend
python init_db.py
```

**CORS errors:**
```bash
# Check CORS_ORIGINS in backend/.env
# Should match frontend URL: http://localhost:5173
```

### Getting Help

- Check the [Full Documentation](README.md)
- Review [Troubleshooting Guide](troubleshooting.md)
- Visit API docs at http://localhost:8000/docs
- Check application logs for errors

## What's Next?

After completing the quick start:

1. **Read the [User Manual](user-manual.md)** for detailed annotation instructions
2. **Configure the system** using the [Configuration Guide](configuration.md)
3. **Set up production deployment** with the [Deployment Guide](deployment/README.md)
4. **Learn about the API** in the [API Documentation](api/README.md)
5. **Explore advanced features** in the complete documentation

## Sample Annotation Session

Here's what a typical annotation session looks like:

### 1. Login and Navigate
- Login to http://localhost:5173
- Click "Start Annotating" from dashboard

### 2. Review Sentence
- **Source**: "The weather is nice today"
- **Translation**: "El tiempo está bien hoy"
- **Languages**: English → Spanish

### 3. Identify Issues
- "bien" might be better as "bueno" for weather
- Overall meaning is conveyed correctly

### 4. Annotate
- **Highlight**: "bien" in translation
- **Error Type**: Minor Semantic (MI_SE)
- **Comment**: "Consider 'bueno' for weather description"
- **Final Form**: "El tiempo está bueno hoy"
- **Scores**: Fluency: 4, Adequacy: 4, Overall: 4

### 5. Submit
- Click "Submit Annotation"
- System saves your work
- Next sentence appears automatically

## Performance Tips

- **Use keyboard shortcuts** for faster navigation
- **Set up dual monitors** for better workflow
- **Take regular breaks** to maintain quality
- **Save work frequently** (auto-save is enabled)
- **Use consistent criteria** for scoring

## Security Notes

- **Change default passwords** immediately
- **Use HTTPS** in production
- **Keep dependencies updated**
- **Monitor access logs**
- **Backup data regularly**

---

**Ready to start?** Follow the 5-minute setup above and begin annotating!

**Need help?** Check the [full documentation](README.md) or [troubleshooting guide](troubleshooting.md).

**Last Updated**: January 2024
**Quick Start Version**: 1.0.0 