# Installation Guide

## Overview

This guide provides step-by-step instructions for installing the Lakra annotation system. The system consists of a FastAPI backend, React frontend, and database components.

## System Requirements

### Hardware Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB free space
- Network: Broadband internet connection

**Recommended:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- Network: Reliable broadband connection

### Software Requirements

**Operating System:**
- Linux: Ubuntu 20.04+ (recommended), CentOS 8+, Debian 10+
- macOS: 10.15+
- Windows: 10+ (with WSL2 recommended)

**Backend Requirements:**
- Python 3.8 or higher
- pip package manager
- Virtual environment support

**Frontend Requirements:**
- Node.js 16.0 or higher
- npm 7.0 or higher (or yarn 1.22+)

**Database Requirements:**
- SQLite 3.35+ (development)
- PostgreSQL 12+ (production recommended)

## Installation Methods

### Method 1: Development Setup (Recommended for Development)

This method is best for development and testing.

#### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/lakra.git
cd lakra
```

#### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py
```

#### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Build for development
npm run dev
```

#### Step 4: Configuration

Create environment files:

**Backend (.env):**
```env
DATABASE_URL=sqlite:///./annotation_system.db
SECRET_KEY=your-secret-key-here
API_HOST=localhost
API_PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Lakra
VITE_ENVIRONMENT=development
```

#### Step 5: Run Application

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # Linux/macOS
# or venv\Scripts\activate  # Windows
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Method 2: Docker Setup (Recommended for Production)

This method uses Docker containers for easy deployment.

#### Step 1: Prerequisites

Install Docker and Docker Compose:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**
```bash
sudo yum install docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

**macOS/Windows:**
Download and install Docker Desktop from https://www.docker.com/products/docker-desktop

#### Step 2: Clone and Configure

```bash
git clone https://github.com/your-username/lakra.git
cd lakra

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

#### Step 3: Build and Run

```bash
# Build containers
docker-compose build

# Run services
docker-compose up -d

# Check status
docker-compose ps
```

### Method 3: Production Setup

For production deployment on a server.

#### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx postgresql postgresql-contrib

# Install SSL certificate support
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres createdb lakra_production
sudo -u postgres createuser lakra_user
sudo -u postgres psql -c "ALTER USER lakra_user PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lakra_production TO lakra_user;"
```

#### Step 3: Application Setup

```bash
# Create application directory
sudo mkdir -p /opt/lakra
sudo chown $USER:$USER /opt/lakra

# Clone repository
cd /opt/lakra
git clone https://github.com/your-username/lakra.git .

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
npm run build
```

#### Step 4: System Service Setup

Create systemd service file:

```bash
sudo tee /etc/systemd/system/lakra.service > /dev/null <<EOF
[Unit]
Description=Lakra Annotation System
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/lakra/backend
Environment=PATH=/opt/lakra/backend/venv/bin
ExecStart=/opt/lakra/backend/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

#### Step 5: Web Server Configuration

Configure Nginx:

```bash
sudo tee /etc/nginx/sites-available/lakra > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /opt/lakra/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/lakra /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 6: SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

#### Step 7: Start Services

```bash
# Enable and start services
sudo systemctl enable lakra
sudo systemctl start lakra
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Verification

### Development Verification

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status": "healthy"}`

2. **Frontend Access:**
   Open browser to `http://localhost:5173`

3. **API Documentation:**
   Visit `http://localhost:8000/docs`

### Production Verification

1. **Service Status:**
   ```bash
   sudo systemctl status lakra
   sudo systemctl status nginx
   sudo systemctl status postgresql
   ```

2. **Website Access:**
   Open browser to `https://your-domain.com`

3. **Database Connection:**
   ```bash
   psql -U lakra_user -d lakra_production -c "SELECT version();"
   ```

## Post-Installation Setup

### Create Admin User

```bash
# Activate backend environment
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
    first_name='Admin',
    last_name='User',
    is_admin=True,
    is_active=True
)
db.add(admin_user)
db.commit()
print('Admin user created successfully')
"
```

### Load Sample Data

```bash
# Load sample sentences for annotation
python -c "
from database import SessionLocal, Sentence

db = SessionLocal()

sample_sentences = [
    Sentence(
        source_text='Hello world',
        machine_translation='Hola mundo',
        source_language='en',
        target_language='es',
        domain='general'
    ),
    Sentence(
        source_text='How are you?',
        machine_translation='¿Cómo estás?',
        source_language='en',
        target_language='es',
        domain='conversation'
    )
]

for sentence in sample_sentences:
    db.add(sentence)

db.commit()
print('Sample data loaded successfully')
"
```

## Troubleshooting

### Common Issues

#### Permission Errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER /opt/lakra
chmod +x /opt/lakra/backend/venv/bin/python
```

#### Database Connection Issues
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Test connection
psql -U lakra_user -d lakra_production -h localhost
```

#### Port Conflicts
```bash
# Check port usage
sudo netstat -tulnp | grep :8000
sudo netstat -tulnp | grep :5173

# Kill process using port
sudo kill -9 <PID>
```

#### Module Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Log Files

Check log files for errors:

```bash
# System logs
sudo journalctl -u lakra -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Application logs
tail -f /opt/lakra/backend/app.log
```

## Updating

### Development Update

```bash
# Update code
git pull origin main

# Update backend dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Update frontend dependencies
cd ../frontend
npm install

# Run database migrations if needed
cd ../backend
python migrate_db.py
```

### Production Update

```bash
# Stop services
sudo systemctl stop lakra

# Update code
cd /opt/lakra
git pull origin main

# Update dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Run migrations
cd ../backend
python migrate_db.py

# Start services
sudo systemctl start lakra
```

## Uninstallation

### Development Cleanup

```bash
# Remove virtual environment
rm -rf backend/venv

# Remove node modules
rm -rf frontend/node_modules

# Remove database (if using SQLite)
rm -f backend/annotation_system.db
```

### Production Cleanup

```bash
# Stop services
sudo systemctl stop lakra
sudo systemctl disable lakra

# Remove service file
sudo rm /etc/systemd/system/lakra.service

# Remove nginx configuration
sudo rm /etc/nginx/sites-enabled/lakra
sudo rm /etc/nginx/sites-available/lakra

# Remove SSL certificate
sudo certbot delete --cert-name your-domain.com

# Remove application files
sudo rm -rf /opt/lakra

# Remove database (optional)
sudo -u postgres dropdb lakra_production
sudo -u postgres dropuser lakra_user
```

## Security Considerations

### Development Security

- Use strong SECRET_KEY
- Don't commit sensitive data to version control
- Keep dependencies updated
- Use virtual environments

### Production Security

- Use HTTPS with valid SSL certificates
- Configure firewall rules
- Use strong database passwords
- Regular security updates
- Monitor access logs
- Implement rate limiting

## Next Steps

After successful installation:

1. **Read the [Quick Start Guide](quick-start.md)** for initial setup
2. **Configure the system** using the [Configuration Guide](configuration.md)
3. **Set up user accounts** and permissions
4. **Load initial data** for annotation
5. **Train users** with the [User Manual](user-manual.md)

## Support

For installation support:
- Check the [Troubleshooting Guide](troubleshooting.md)
- Review [Known Issues](support/known-issues.md)
- Contact support team
- Join community discussions

---

**Last Updated**: January 2024
**Installation Version**: 1.0.0
**Tested Platforms**: Ubuntu 22.04, CentOS 8, macOS 12+, Windows 10+ 