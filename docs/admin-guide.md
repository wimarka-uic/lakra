# Administrator Guide

## Overview

This guide provides comprehensive instructions for system administrators managing the Lakra annotation system. It covers user management, system configuration, monitoring, maintenance, and troubleshooting procedures.

## Table of Contents

1. [Administrator Access and Setup](#administrator-access-and-setup)
2. [User Management](#user-management)
3. [Content Management](#content-management)
4. [System Configuration](#system-configuration)
5. [Monitoring and Analytics](#monitoring-and-analytics)
6. [Quality Control](#quality-control)
7. [Data Management](#data-management)
8. [System Maintenance](#system-maintenance)
9. [Security Management](#security-management)
10. [Troubleshooting](#troubleshooting)

## Administrator Access and Setup

### Initial Administrator Setup

#### Creating the First Admin User

During system installation, create the initial administrator account:

```bash
# Navigate to backend directory
cd backend
source venv/bin/activate

# Create admin user
python -c "
from database import SessionLocal, User
from auth import get_password_hash

db = SessionLocal()
admin_user = User(
    email='admin@yourdomain.com',
    username='admin',
    hashed_password=get_password_hash('secure_admin_password'),
    first_name='System',
    last_name='Administrator',
    is_admin=True,
    is_active=True
)
db.add(admin_user)
db.commit()
print('Administrator account created successfully')
"
```

#### Admin Dashboard Access

1. **Login**: Use admin credentials to access the system
2. **Navigation**: Admin-specific options appear in the navigation menu
3. **Dashboard**: Access the administrative dashboard at `/admin`
4. **Permissions**: Verify admin permissions are active

### Administrator Permissions

Administrators have access to:
- **User Management**: Create, modify, and manage user accounts
- **Content Management**: Upload and manage annotation content
- **System Configuration**: Modify system settings and parameters
- **Analytics**: View system-wide statistics and reports
- **Quality Control**: Monitor annotation and evaluation quality
- **Data Export**: Export system data for analysis
- **System Maintenance**: Perform maintenance tasks

## User Management

### User Account Administration

#### Creating New Users

**Via Admin Interface**:
1. Navigate to Admin Dashboard → User Management
2. Click "Add New User"
3. Fill in user details:
   - Email (required, unique)
   - Username (required, unique)
   - Password (auto-generated or manual)
   - First Name and Last Name
   - Role (Annotator, Evaluator, Admin)
   - Language preferences
   - Account status (Active/Inactive)
4. Click "Create User"

**Via Command Line**:
```bash
python -c "
from database import SessionLocal, User, UserLanguage
from auth import get_password_hash
import secrets

db = SessionLocal()
password = secrets.token_urlsafe(12)  # Generate secure password
user = User(
    email='newuser@example.com',
    username='newuser',
    hashed_password=get_password_hash(password),
    first_name='New',
    last_name='User',
    is_active=True
)
db.add(user)
db.commit()
print(f'User created: {user.email} / {password}')
"
```

**Via API**:
```bash
curl -X POST http://localhost:8000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "secure_password",
    "first_name": "New",
    "last_name": "User",
    "is_evaluator": false
  }'
```

#### Managing User Roles

**Assigning Evaluator Role**:
```bash
curl -X PUT http://localhost:8000/api/admin/users/USER_ID/toggle-evaluator \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Promoting to Administrator**:
```bash
python -c "
from database import SessionLocal, User
db = SessionLocal()
user = db.query(User).filter(User.email == 'user@example.com').first()
user.is_admin = True
db.commit()
print('User promoted to administrator')
"
```

#### User Account Management

**Deactivating Users**:
```bash
python -c "
from database import SessionLocal, User
db = SessionLocal()
user = db.query(User).filter(User.email == 'user@example.com').first()
user.is_active = False
db.commit()
print('User account deactivated')
"
```

**Resetting Passwords**:
```bash
python -c "
from database import SessionLocal, User
from auth import get_password_hash
import secrets

db = SessionLocal()
user = db.query(User).filter(User.email == 'user@example.com').first()
new_password = secrets.token_urlsafe(12)
user.hashed_password = get_password_hash(new_password)
db.commit()
print(f'Password reset for {user.email}: {new_password}')
"
```

### User Onboarding Management

#### Onboarding Configuration

**Setting Onboarding Requirements**:
```env
# In backend/.env
ONBOARDING_REQUIRED=True
ONBOARDING_PASS_THRESHOLD=80
ONBOARDING_MAX_ATTEMPTS=3
ONBOARDING_LANGUAGES=en,es,fil
```

**Monitoring Onboarding Progress**:
```bash
python -c "
from database import SessionLocal, User
db = SessionLocal()
users = db.query(User).filter(User.onboarding_status == 'pending').all()
print(f'Users pending onboarding: {len(users)}')
for user in users:
    print(f'  - {user.email} ({user.username})')
"
```

#### Onboarding Test Management

**Creating Custom Onboarding Tests**:
```bash
python -c "
from database import SessionLocal, OnboardingTest
import json

db = SessionLocal()
test_data = {
    'questions': [
        {
            'id': 'q1',
            'source_text': 'Hello world',
            'machine_translation': 'Hola mundo',
            'source_language': 'en',
            'target_language': 'es',
            'correct_fluency_score': 5,
            'correct_adequacy_score': 5,
            'error_types': [],
            'explanation': 'Perfect translation'
        }
    ]
}

test = OnboardingTest(
    user_id=1,
    language='es',
    test_data=json.dumps(test_data)
)
db.add(test)
db.commit()
print('Onboarding test created')
"
```

### User Analytics

#### User Activity Monitoring

**Active Users Report**:
```bash
python -c "
from database import SessionLocal, User, Annotation
from datetime import datetime, timedelta
from sqlalchemy import func

db = SessionLocal()
week_ago = datetime.now() - timedelta(days=7)

active_users = db.query(User).join(Annotation).filter(
    Annotation.created_at >= week_ago
).distinct().count()

print(f'Active users in last 7 days: {active_users}')
"
```

**User Performance Statistics**:
```bash
python -c "
from database import SessionLocal, User, Annotation
from sqlalchemy import func

db = SessionLocal()
user_stats = db.query(
    User.username,
    func.count(Annotation.id).label('annotation_count'),
    func.avg(Annotation.overall_quality).label('avg_quality')
).join(Annotation).group_by(User.id).all()

print('User Performance:')
for username, count, avg_quality in user_stats:
    print(f'  {username}: {count} annotations, avg quality: {avg_quality:.2f}')
"
```

## Content Management

### Sentence Management

#### Adding Sentences

**Single Sentence Addition**:
```bash
curl -X POST http://localhost:8000/api/sentences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "source_text": "Good morning",
    "machine_translation": "Buenos días",
    "source_language": "en",
    "target_language": "es",
    "domain": "greetings"
  }'
```

**Bulk Sentence Upload**:
```bash
python -c "
from database import SessionLocal, Sentence
import json

db = SessionLocal()
sentences_data = [
    {
        'source_text': 'Hello world',
        'machine_translation': 'Hola mundo',
        'source_language': 'en',
        'target_language': 'es',
        'domain': 'general'
    },
    {
        'source_text': 'Good night',
        'machine_translation': 'Buenas noches',
        'source_language': 'en',
        'target_language': 'es',
        'domain': 'greetings'
    }
]

for data in sentences_data:
    sentence = Sentence(**data)
    db.add(sentence)

db.commit()
print(f'Added {len(sentences_data)} sentences')
"
```

**CSV Import**:
```bash
python -c "
import csv
from database import SessionLocal, Sentence

db = SessionLocal()
with open('sentences.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        sentence = Sentence(
            source_text=row['source_text'],
            machine_translation=row['machine_translation'],
            source_language=row['source_language'],
            target_language=row['target_language'],
            domain=row.get('domain', 'general')
        )
        db.add(sentence)
    db.commit()
    print(f'Imported {reader.line_num - 1} sentences')
"
```

#### Sentence Management

**Deactivating Sentences**:
```bash
python -c "
from database import SessionLocal, Sentence
db = SessionLocal()
sentence = db.query(Sentence).filter(Sentence.id == 1).first()
sentence.is_active = False
db.commit()
print('Sentence deactivated')
"
```

**Sentence Statistics**:
```bash
python -c "
from database import SessionLocal, Sentence
from sqlalchemy import func

db = SessionLocal()
stats = db.query(
    func.count(Sentence.id).label('total'),
    func.count(Sentence.id).filter(Sentence.is_active == True).label('active')
).first()

print(f'Total sentences: {stats.total}')
print(f'Active sentences: {stats.active}')
"
```

### Domain Management

#### Domain Configuration

**Available Domains**:
- `general`: General purpose content
- `medical`: Medical and healthcare content
- `legal`: Legal and regulatory content
- `technical`: Technical and scientific content
- `business`: Business and commercial content
- `academic`: Academic and educational content
- `literary`: Literary and creative content
- `news`: News and journalism content

**Domain Statistics**:
```bash
python -c "
from database import SessionLocal, Sentence
from sqlalchemy import func

db = SessionLocal()
domain_stats = db.query(
    Sentence.domain,
    func.count(Sentence.id).label('count')
).group_by(Sentence.domain).all()

print('Domain Statistics:')
for domain, count in domain_stats:
    print(f'  {domain}: {count} sentences')
"
```

## System Configuration

### Global Settings

#### System Parameters

**Core Configuration**:
```env
# System settings
SYSTEM_NAME=Lakra
SYSTEM_VERSION=1.0.0
SYSTEM_DESCRIPTION=Annotation Tool for Machine Translation

# User settings
DEFAULT_USER_ROLE=annotator
REQUIRE_EMAIL_VERIFICATION=False
ALLOW_SELF_REGISTRATION=True
MAX_USERS=1000

# Annotation settings
ANNOTATION_TIME_LIMIT=3600  # 1 hour
ANNOTATIONS_PER_USER=100
ENABLE_VOICE_RECORDING=True
MAX_VOICE_DURATION=300  # 5 minutes

# Quality settings
QUALITY_THRESHOLD=3.0
EVALUATION_REQUIRED=True
MIN_EVALUATIONS_PER_ANNOTATION=1
```

#### Feature Flags

**Enabling/Disabling Features**:
```env
# Feature flags
ENABLE_ONBOARDING=True
ENABLE_MT_QUALITY=True
ENABLE_BATCH_PROCESSING=True
ENABLE_ANALYTICS=True
ENABLE_API_DOCUMENTATION=True
ENABLE_VOICE_RECORDING=True
ENABLE_DARK_MODE=False
```

### Database Configuration

#### Database Maintenance

**Database Backup**:
```bash
# PostgreSQL backup
pg_dump -U lakra_user -h localhost lakra_production > backup_$(date +%Y%m%d_%H%M%S).sql

# SQLite backup
sqlite3 annotation_system.db ".backup backup_$(date +%Y%m%d_%H%M%S).db"
```

**Database Optimization**:
```bash
python -c "
from database import engine
from sqlalchemy import text

# Add performance indexes
engine.execute(text('CREATE INDEX IF NOT EXISTS idx_annotations_created_at ON annotations(created_at)'))
engine.execute(text('CREATE INDEX IF NOT EXISTS idx_annotations_status ON annotations(annotation_status)'))
engine.execute(text('CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at)'))
print('Database indexes created')
"
```

**Database Cleanup**:
```bash
python -c "
from database import SessionLocal, Annotation
from datetime import datetime, timedelta

db = SessionLocal()
cutoff_date = datetime.now() - timedelta(days=90)

# Delete old draft annotations
deleted = db.query(Annotation).filter(
    Annotation.annotation_status == 'draft',
    Annotation.created_at < cutoff_date
).delete()

db.commit()
print(f'Deleted {deleted} old draft annotations')
"
```

## Monitoring and Analytics

### System Statistics

#### Real-time Metrics

**System Health Check**:
```bash
python -c "
from database import SessionLocal, User, Sentence, Annotation
from datetime import datetime, timedelta

db = SessionLocal()
now = datetime.now()
today = now.date()

# Basic counts
total_users = db.query(User).count()
active_users = db.query(User).filter(User.is_active == True).count()
total_sentences = db.query(Sentence).count()
total_annotations = db.query(Annotation).count()

# Today's activity
today_annotations = db.query(Annotation).filter(
    Annotation.created_at >= today
).count()

print(f'System Health Report - {now}')
print(f'Total Users: {total_users}')
print(f'Active Users: {active_users}')
print(f'Total Sentences: {total_sentences}')
print(f'Total Annotations: {total_annotations}')
print(f'Today\\'s Annotations: {today_annotations}')
"
```

#### Performance Metrics

**Annotation Statistics**:
```bash
python -c "
from database import SessionLocal, Annotation
from sqlalchemy import func

db = SessionLocal()

# Quality statistics
quality_stats = db.query(
    func.avg(Annotation.fluency_score).label('avg_fluency'),
    func.avg(Annotation.adequacy_score).label('avg_adequacy'),
    func.avg(Annotation.overall_quality).label('avg_overall')
).first()

# Status distribution
status_stats = db.query(
    Annotation.annotation_status,
    func.count(Annotation.id).label('count')
).group_by(Annotation.annotation_status).all()

print('Quality Statistics:')
print(f'  Average Fluency: {quality_stats.avg_fluency:.2f}')
print(f'  Average Adequacy: {quality_stats.avg_adequacy:.2f}')
print(f'  Average Overall: {quality_stats.avg_overall:.2f}')

print('\\nStatus Distribution:')
for status, count in status_stats:
    print(f'  {status}: {count}')
"
```

### Analytics Dashboard

#### Custom Reports

**Monthly Activity Report**:
```bash
python -c "
from database import SessionLocal, User, Annotation
from datetime import datetime, timedelta
from sqlalchemy import func

db = SessionLocal()
month_ago = datetime.now() - timedelta(days=30)

# User activity
active_users = db.query(User).join(Annotation).filter(
    Annotation.created_at >= month_ago
).distinct().count()

# Annotation statistics
annotation_stats = db.query(
    func.count(Annotation.id).label('total'),
    func.avg(Annotation.overall_quality).label('avg_quality'),
    func.avg(Annotation.time_spent_seconds).label('avg_time')
).filter(Annotation.created_at >= month_ago).first()

print('Monthly Activity Report:')
print(f'Active Users: {active_users}')
print(f'Annotations Created: {annotation_stats.total}')
print(f'Average Quality: {annotation_stats.avg_quality:.2f}')
print(f'Average Time: {annotation_stats.avg_time:.0f} seconds')
"
```

**Quality Trends**:
```bash
python -c "
from database import SessionLocal, Annotation
from datetime import datetime, timedelta
from sqlalchemy import func

db = SessionLocal()
weeks = []

for i in range(4):
    week_start = datetime.now() - timedelta(weeks=i+1)
    week_end = datetime.now() - timedelta(weeks=i)
    
    week_stats = db.query(
        func.count(Annotation.id).label('count'),
        func.avg(Annotation.overall_quality).label('avg_quality')
    ).filter(
        Annotation.created_at >= week_start,
        Annotation.created_at < week_end
    ).first()
    
    weeks.append((i+1, week_stats.count, week_stats.avg_quality or 0))

print('Quality Trends (Last 4 Weeks):')
for week, count, quality in weeks:
    print(f'  Week {week}: {count} annotations, avg quality: {quality:.2f}')
"
```

### System Monitoring

#### Health Monitoring

**Service Status Check**:
```bash
#!/bin/bash
# health_check.sh

echo "System Health Check - $(date)"
echo "=================================="

# Check backend service
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✓ Backend service: Running"
else
    echo "✗ Backend service: Not responding"
fi

# Check database connectivity
if python -c "from database import engine; engine.connect(); print('✓ Database: Connected')" 2>/dev/null; then
    echo "✓ Database: Connected"
else
    echo "✗ Database: Connection failed"
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo "✓ Disk space: ${DISK_USAGE}% used"
else
    echo "⚠ Disk space: ${DISK_USAGE}% used (Warning)"
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEM_USAGE -lt 90 ]; then
    echo "✓ Memory usage: ${MEM_USAGE}%"
else
    echo "⚠ Memory usage: ${MEM_USAGE}% (Warning)"
fi

echo "=================================="
```

#### Performance Monitoring

**Database Performance**:
```bash
python -c "
from database import SessionLocal
from sqlalchemy import text
import time

db = SessionLocal()

# Test query performance
queries = [
    'SELECT COUNT(*) FROM users',
    'SELECT COUNT(*) FROM sentences',
    'SELECT COUNT(*) FROM annotations',
    'SELECT COUNT(*) FROM evaluations'
]

print('Database Performance Test:')
for query in queries:
    start = time.time()
    result = db.execute(text(query)).scalar()
    end = time.time()
    print(f'  {query}: {result} rows in {end-start:.3f}s')
"
```

## Quality Control

### Annotation Quality Management

#### Quality Metrics

**System-wide Quality Statistics**:
```bash
python -c "
from database import SessionLocal, Annotation, Evaluation
from sqlalchemy import func

db = SessionLocal()

# Annotation quality
annotation_quality = db.query(
    func.count(Annotation.id).label('total'),
    func.avg(Annotation.fluency_score).label('avg_fluency'),
    func.avg(Annotation.adequacy_score).label('avg_adequacy'),
    func.avg(Annotation.overall_quality).label('avg_overall')
).first()

# Evaluation quality
evaluation_quality = db.query(
    func.count(Evaluation.id).label('total'),
    func.avg(Evaluation.overall_evaluation_score).label('avg_evaluation')
).first()

print('System Quality Report:')
print(f'Annotations: {annotation_quality.total}')
print(f'  Avg Fluency: {annotation_quality.avg_fluency:.2f}')
print(f'  Avg Adequacy: {annotation_quality.avg_adequacy:.2f}')
print(f'  Avg Overall: {annotation_quality.avg_overall:.2f}')
print(f'Evaluations: {evaluation_quality.total}')
print(f'  Avg Evaluation Score: {evaluation_quality.avg_evaluation:.2f}')
"
```

#### Quality Alerts

**Low Quality Detection**:
```bash
python -c "
from database import SessionLocal, Annotation, User
from datetime import datetime, timedelta

db = SessionLocal()
threshold = 2.5  # Quality threshold
recent = datetime.now() - timedelta(days=7)

# Find low quality annotations
low_quality = db.query(Annotation, User).join(User).filter(
    Annotation.overall_quality < threshold,
    Annotation.created_at >= recent
).all()

print(f'Low Quality Annotations (< {threshold}):')
for annotation, user in low_quality:
    print(f'  {user.username}: Score {annotation.overall_quality:.1f}')
"
```

### Inter-annotator Agreement

#### Agreement Metrics

**Calculate Agreement**:
```bash
python -c "
from database import SessionLocal, Annotation, Sentence
from sqlalchemy import func
import numpy as np

db = SessionLocal()

# Find sentences with multiple annotations
multi_annotated = db.query(
    Sentence.id,
    func.count(Annotation.id).label('count')
).join(Annotation).group_by(Sentence.id).having(
    func.count(Annotation.id) > 1
).all()

print(f'Sentences with multiple annotations: {len(multi_annotated)}')

# Calculate agreement for first sentence
if multi_annotated:
    sentence_id = multi_annotated[0][0]
    annotations = db.query(Annotation).filter(
        Annotation.sentence_id == sentence_id
    ).all()
    
    scores = [a.overall_quality for a in annotations]
    agreement = np.std(scores)
    
    print(f'Example agreement (std dev): {agreement:.2f}')
"
```

## Data Management

### Data Export

#### Export Annotations

**CSV Export**:
```bash
python -c "
import csv
from database import SessionLocal, Annotation, Sentence, User

db = SessionLocal()
annotations = db.query(Annotation, Sentence, User).join(
    Sentence, Annotation.sentence_id == Sentence.id
).join(
    User, Annotation.annotator_id == User.id
).all()

with open('annotations_export.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        'annotation_id', 'sentence_id', 'annotator_username',
        'source_text', 'machine_translation', 'fluency_score',
        'adequacy_score', 'overall_quality', 'final_form',
        'created_at', 'annotation_status'
    ])
    
    for annotation, sentence, user in annotations:
        writer.writerow([
            annotation.id, sentence.id, user.username,
            sentence.source_text, sentence.machine_translation,
            annotation.fluency_score, annotation.adequacy_score,
            annotation.overall_quality, annotation.final_form,
            annotation.created_at, annotation.annotation_status
        ])

print('Annotations exported to annotations_export.csv')
"
```

**JSON Export**:
```bash
python -c "
import json
from database import SessionLocal, Annotation, Sentence, User

db = SessionLocal()
annotations = db.query(Annotation, Sentence, User).join(
    Sentence, Annotation.sentence_id == Sentence.id
).join(
    User, Annotation.annotator_id == User.id
).all()

export_data = []
for annotation, sentence, user in annotations:
    export_data.append({
        'annotation_id': annotation.id,
        'sentence_id': sentence.id,
        'annotator_username': user.username,
        'source_text': sentence.source_text,
        'machine_translation': sentence.machine_translation,
        'fluency_score': annotation.fluency_score,
        'adequacy_score': annotation.adequacy_score,
        'overall_quality': annotation.overall_quality,
        'final_form': annotation.final_form,
        'created_at': annotation.created_at.isoformat(),
        'annotation_status': annotation.annotation_status
    })

with open('annotations_export.json', 'w', encoding='utf-8') as f:
    json.dump(export_data, f, indent=2, ensure_ascii=False)

print('Annotations exported to annotations_export.json')
"
```

### Data Backup and Recovery

#### Automated Backups

**Daily Backup Script**:
```bash
#!/bin/bash
# daily_backup.sh

BACKUP_DIR="/backup/lakra"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="lakra_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U lakra_user -h localhost $DB_NAME > "$BACKUP_DIR/db_backup_$DATE.sql"

# Application files backup
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" /opt/lakra \
    --exclude='/opt/lakra/backend/venv' \
    --exclude='/opt/lakra/frontend/node_modules'

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

#### Recovery Procedures

**Database Recovery**:
```bash
# Stop services
sudo systemctl stop lakra

# Restore database
psql -U lakra_user -d lakra_production < /backup/lakra/db_backup_YYYYMMDD_HHMMSS.sql

# Start services
sudo systemctl start lakra
```

**Application Recovery**:
```bash
# Stop services
sudo systemctl stop lakra

# Restore application files
cd /opt
sudo tar -xzf /backup/lakra/app_backup_YYYYMMDD_HHMMSS.tar.gz

# Restore permissions
sudo chown -R www-data:www-data /opt/lakra

# Start services
sudo systemctl start lakra
```

## System Maintenance

### Regular Maintenance Tasks

#### Daily Tasks

**System Health Check**:
```bash
# Check service status
sudo systemctl status lakra nginx postgresql

# Check disk space
df -h

# Check memory usage
free -h

# Check recent errors
sudo journalctl -u lakra --since "24 hours ago" | grep -i error
```

#### Weekly Tasks

**Database Maintenance**:
```bash
# Update database statistics
python -c "
from database import engine
from sqlalchemy import text

engine.execute(text('ANALYZE'))
print('Database statistics updated')
"

# Check database size
python -c "
from database import engine
from sqlalchemy import text

size = engine.execute(text('SELECT pg_size_pretty(pg_database_size(current_database()))')).scalar()
print(f'Database size: {size}')
"
```

#### Monthly Tasks

**Performance Review**:
```bash
# Generate performance report
python -c "
from database import SessionLocal, Annotation, User
from datetime import datetime, timedelta
from sqlalchemy import func

db = SessionLocal()
month_ago = datetime.now() - timedelta(days=30)

# Monthly statistics
stats = db.query(
    func.count(Annotation.id).label('annotations'),
    func.count(User.id.distinct()).label('active_users'),
    func.avg(Annotation.overall_quality).label('avg_quality')
).join(User).filter(Annotation.created_at >= month_ago).first()

print('Monthly Performance Report:')
print(f'Annotations: {stats.annotations}')
print(f'Active Users: {stats.active_users}')
print(f'Average Quality: {stats.avg_quality:.2f}')
"
```

### System Updates

#### Application Updates

**Update Procedure**:
```bash
# Stop services
sudo systemctl stop lakra

# Backup current version
cp -r /opt/lakra /opt/lakra_backup_$(date +%Y%m%d)

# Update code
cd /opt/lakra
git pull origin main

# Update dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
npm install
npm run build

# Run migrations
cd ../backend
python migrate_db.py

# Start services
sudo systemctl start lakra
```

#### Security Updates

**System Security Updates**:
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Python dependencies
cd /opt/lakra/backend
source venv/bin/activate
pip install --upgrade pip
pip list --outdated

# Update Node.js dependencies
cd ../frontend
npm audit
npm update
```

## Security Management

### User Security

#### Password Policies

**Password Requirements**:
- Minimum 8 characters
- Mixed case letters
- Numbers and special characters
- No common dictionary words
- No personal information

**Password Reset**:
```bash
python -c "
from database import SessionLocal, User
from auth import get_password_hash
import secrets

db = SessionLocal()
user = db.query(User).filter(User.email == 'user@example.com').first()
new_password = secrets.token_urlsafe(16)
user.hashed_password = get_password_hash(new_password)
db.commit()

print(f'Password reset for {user.email}')
print(f'New password: {new_password}')
"
```

#### Session Management

**Session Configuration**:
```env
# JWT settings
SECRET_KEY=your-very-secure-secret-key-32-chars-minimum
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Session security
SECURE_COOKIES=True
SESSION_SECURE=True
FORCE_HTTPS=True
```

### System Security

#### Security Monitoring

**Failed Login Monitoring**:
```bash
# Monitor failed login attempts
sudo tail -f /var/log/lakra/auth.log | grep "failed login"

# Check for brute force attempts
python -c "
from database import SessionLocal, User
from datetime import datetime, timedelta
import json

db = SessionLocal()
hour_ago = datetime.now() - timedelta(hours=1)

# This would require implementing login attempt logging
print('Login monitoring requires implementation of audit logging')
"
```

#### Security Hardening

**SSL/TLS Configuration**:
```bash
# Check SSL certificate
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test SSL configuration
curl -I https://yourdomain.com
```

**Security Headers**:
```nginx
# Add to nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

### Audit and Compliance

#### Audit Logging

**Enable Audit Logging**:
```python
# Add to backend/main.py
import logging

audit_logger = logging.getLogger('audit')
audit_handler = logging.FileHandler('/var/log/lakra/audit.log')
audit_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
audit_handler.setFormatter(audit_formatter)
audit_logger.addHandler(audit_handler)
audit_logger.setLevel(logging.INFO)

# Log admin actions
@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith('/api/admin/'):
        audit_logger.info(f"Admin action: {request.method} {request.url.path}")
    return response
```

#### Compliance Reporting

**Generate Compliance Reports**:
```bash
python -c "
from database import SessionLocal, User, Annotation
from datetime import datetime, timedelta

db = SessionLocal()
report_date = datetime.now()

# User activity report
total_users = db.query(User).count()
active_users = db.query(User).filter(User.is_active == True).count()

# Data processing report
total_annotations = db.query(Annotation).count()
week_ago = datetime.now() - timedelta(days=7)
recent_annotations = db.query(Annotation).filter(
    Annotation.created_at >= week_ago
).count()

print(f'Compliance Report - {report_date}')
print(f'Total Users: {total_users}')
print(f'Active Users: {active_users}')
print(f'Total Annotations: {total_annotations}')
print(f'Recent Annotations: {recent_annotations}')
"
```

## Troubleshooting

### Common Administrative Issues

#### Service Issues

**Service Won't Start**:
```bash
# Check service status
sudo systemctl status lakra

# Check logs
sudo journalctl -u lakra -f

# Check configuration
python -c "from backend.config import get_settings; print(get_settings())"

# Restart service
sudo systemctl restart lakra
```

#### Database Issues

**Database Connection Problems**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U lakra_user -d lakra_production -h localhost

# Check connection limits
python -c "
from database import SessionLocal
db = SessionLocal()
print('Database connection successful')
"
```

#### Performance Issues

**High Memory Usage**:
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Check Python memory usage
python -c "
import psutil
process = psutil.Process()
print(f'Memory usage: {process.memory_info().rss / 1024 / 1024:.1f} MB')
"
```

### Emergency Procedures

#### System Recovery

**Service Recovery**:
```bash
# Stop all services
sudo systemctl stop lakra nginx

# Check for conflicts
sudo netstat -tulnp | grep :8000

# Restart services
sudo systemctl start postgresql
sudo systemctl start lakra
sudo systemctl start nginx
```

#### Data Recovery

**Database Recovery**:
```bash
# Check database integrity
python -c "
from database import engine
from sqlalchemy import text

try:
    result = engine.execute(text('SELECT 1'))
    print('Database integrity check passed')
except Exception as e:
    print(f'Database integrity check failed: {e}')
"

# Restore from backup if needed
# See Data Backup and Recovery section
```

### Support and Resources

#### Getting Help

- **System Logs**: Check `/var/log/lakra/` for application logs
- **Documentation**: Refer to [Troubleshooting Guide](troubleshooting.md)
- **Support**: Contact technical support team
- **Community**: Join administrator discussions

#### Emergency Contacts

- **Technical Support**: support@yourdomain.com
- **System Administrator**: admin@yourdomain.com
- **Emergency Hotline**: (555) 123-4567

---

**Last Updated**: January 2024
**Administrator Guide Version**: 1.0.0
**Target Audience**: System Administrators and IT Staff 