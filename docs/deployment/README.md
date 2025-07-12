# Deployment Guide

## Overview

This guide covers deployment strategies for the Lakra annotation system across different environments. The system consists of a FastAPI backend, React frontend, and database components that can be deployed using various methods.

## Deployment Options

### 1. Development Deployment
- Local development environment
- Hot reloading enabled
- Debug mode active
- SQLite database

### 2. Staging Deployment
- Pre-production testing environment
- Production-like configuration
- PostgreSQL database
- SSL/TLS enabled

### 3. Production Deployment
- Production-ready configuration
- High availability setup
- Database backups
- Monitoring and logging

## Prerequisites

### System Requirements

**Minimum Requirements:**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+, CentOS 8+, or equivalent

**Recommended Requirements:**
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

### Software Dependencies

**Backend:**
- Python 3.8+
- pip package manager
- Virtual environment support

**Frontend:**
- Node.js 16+
- npm or yarn package manager

**Database:**
- PostgreSQL 12+ (production)
- SQLite 3.35+ (development)

**Web Server:**
- Nginx 1.18+
- SSL certificate (Let's Encrypt recommended)

## Development Deployment

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/[username]/lakra.git
   cd lakra
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python init_db.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `backend/.env`:
   ```env
   # Database
   DATABASE_URL=sqlite:///./annotation_system.db
   
   # JWT Secret
   SECRET_KEY=your-secret-key-here
   
   # API Configuration
   API_HOST=localhost
   API_PORT=8000
   DEBUG=True
   
   # CORS
   CORS_ORIGINS=http://localhost:5173
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_APP_NAME=Lakra
   VITE_VERSION=1.0.0
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   source venv/bin/activate
   python main.py
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Tools

**Hot Reloading:**
- Backend: FastAPI auto-reload enabled
- Frontend: Vite HMR (Hot Module Replacement)

**Debugging:**
- Backend: Python debugger support
- Frontend: Chrome DevTools integration

## Staging Deployment

### Server Setup

1. **Server Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install required packages
   sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx postgresql postgresql-contrib
   
   # Install certbot for SSL
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   sudo -u postgres psql
   CREATE DATABASE lakra_staging;
   CREATE USER lakra_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE lakra_staging TO lakra_user;
   \q
   ```

3. **Application Deployment**
   ```bash
   # Create application directory
   sudo mkdir -p /opt/lakra
   sudo chown $USER:$USER /opt/lakra
   
   # Clone repository
   cd /opt/lakra
   git clone https://github.com/[username]/lakra.git .
   
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

4. **Environment Configuration**
   
   Create `/opt/lakra/backend/.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://lakra_user:secure_password@localhost:5432/lakra_staging
   
   # JWT Secret
   SECRET_KEY=your-very-secure-secret-key
   
   # API Configuration
   API_HOST=0.0.0.0
   API_PORT=8000
   DEBUG=False
   
   # CORS
   CORS_ORIGINS=https://staging.yourdomain.com
   ```

5. **Systemd Service Setup**
   
   Create `/etc/systemd/system/lakra-backend.service`:
   ```ini
   [Unit]
   Description=Lakra Backend API
   After=network.target
   
   [Service]
   Type=simple
   User=www-data
   Group=www-data
   WorkingDirectory=/opt/lakra/backend
   Environment=PATH=/opt/lakra/backend/venv/bin
   ExecStart=/opt/lakra/backend/venv/bin/python main.py
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   ```

6. **Nginx Configuration**
   
   Create `/etc/nginx/sites-available/lakra-staging`:
   ```nginx
   server {
       listen 80;
       server_name staging.yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name staging.yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/staging.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/staging.yourdomain.com/privkey.pem;
       
       # Frontend
       location / {
           root /opt/lakra/frontend/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       # API Documentation
       location /docs {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

7. **Enable Services**
   ```bash
   # Enable nginx site
   sudo ln -s /etc/nginx/sites-available/lakra-staging /etc/nginx/sites-enabled/
   
   # Test nginx configuration
   sudo nginx -t
   
   # Enable and start services
   sudo systemctl enable lakra-backend
   sudo systemctl start lakra-backend
   sudo systemctl reload nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d staging.yourdomain.com
   ```

## Production Deployment

### High Availability Setup

1. **Load Balancer Setup**
   
   Using Nginx as a load balancer:
   ```nginx
   upstream lakra_backend {
       server 10.0.1.10:8000;
       server 10.0.1.11:8000;
       server 10.0.1.12:8000;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       # SSL configuration
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       # Frontend
       location / {
           root /opt/lakra/frontend/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
           
           # Caching for static assets
           location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
               expires 1y;
               add_header Cache-Control "public, immutable";
           }
       }
       
       # Backend API
       location /api {
           proxy_pass http://lakra_backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # Health check
           proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
       }
   }
   ```

2. **Database Clustering**
   
   PostgreSQL Master-Slave setup:
   ```bash
   # Master server configuration
   # Edit /etc/postgresql/14/main/postgresql.conf
   listen_addresses = '*'
   wal_level = replica
   max_wal_senders = 3
   checkpoint_segments = 8
   wal_keep_segments = 8
   
   # Edit /etc/postgresql/14/main/pg_hba.conf
   host replication replica 10.0.1.0/24 md5
   ```

3. **Application Scaling**
   
   Using Gunicorn for production WSGI:
   ```bash
   # Install Gunicorn
   pip install gunicorn
   
   # Gunicorn configuration
   cat > /opt/lakra/backend/gunicorn.conf.py << EOF
   bind = "0.0.0.0:8000"
   workers = 4
   worker_class = "uvicorn.workers.UvicornWorker"
   worker_connections = 1000
   max_requests = 1000
   max_requests_jitter = 50
   preload_app = True
   keepalive = 2
   EOF
   
   # Start with Gunicorn
   gunicorn main:app -c gunicorn.conf.py
   ```

4. **Monitoring Setup**
   
   Install monitoring tools:
   ```bash
   # Install monitoring stack
   sudo apt install -y prometheus node-exporter grafana
   
   # Configure Prometheus
   cat > /etc/prometheus/prometheus.yml << EOF
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'lakra-backend'
       static_configs:
         - targets: ['localhost:8000']
   
     - job_name: 'node-exporter'
       static_configs:
         - targets: ['localhost:9100']
   EOF
   ```

### Production Environment Configuration

**Backend (.env):**
```env
# Database
DATABASE_URL=postgresql://lakra_user:secure_password@db-cluster:5432/lakra_production

# JWT Secret
SECRET_KEY=your-extremely-secure-secret-key-here

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# CORS
CORS_ORIGINS=https://yourdomain.com

# Security
SECURE_COOKIES=True
SESSION_SECURE=True

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/lakra/backend.log

# Performance
WORKER_PROCESSES=4
MAX_CONNECTIONS=1000
```

**Frontend (.env):**
```env
VITE_API_URL=https://yourdomain.com
VITE_APP_NAME=Lakra
VITE_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

## Container Deployment

### Docker Compose Setup

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     backend:
       build: ./backend
       ports:
         - "8000:8000"
       environment:
         - DATABASE_URL=postgresql://lakra_user:password@db:5432/lakra
         - SECRET_KEY=your-secret-key
       depends_on:
         - db
       volumes:
         - ./backend:/app
         - uploads:/app/uploads
   
     frontend:
       build: ./frontend
       ports:
         - "80:80"
       depends_on:
         - backend
   
     db:
       image: postgres:14
       environment:
         - POSTGRES_DB=lakra
         - POSTGRES_USER=lakra_user
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
     redis:
       image: redis:alpine
       ports:
         - "6379:6379"
   
   volumes:
     postgres_data:
     uploads:
   ```

2. **Backend Dockerfile**
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY . .
   
   EXPOSE 8000
   
   CMD ["python", "main.py"]
   ```

3. **Frontend Dockerfile**
   ```dockerfile
   FROM node:16-alpine AS builder
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   
   EXPOSE 80
   
   CMD ["nginx", "-g", "daemon off;"]
   ```

4. **Deploy with Docker Compose**
   ```bash
   # Build and start services
   docker-compose up -d
   
   # Scale backend services
   docker-compose up -d --scale backend=3
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

## Cloud Deployment

### AWS Deployment

1. **Using AWS ECS**
   ```bash
   # Create ECS cluster
   aws ecs create-cluster --cluster-name lakra-cluster
   
   # Create task definition
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   
   # Create service
   aws ecs create-service \
     --cluster lakra-cluster \
     --service-name lakra-service \
     --task-definition lakra-task \
     --desired-count 3
   ```

2. **Using AWS Elastic Beanstalk**
   ```bash
   # Initialize EB application
   eb init lakra-app
   
   # Create environment
   eb create production
   
   # Deploy application
   eb deploy
   ```

### Google Cloud Platform

1. **Using Google Cloud Run**
   ```bash
   # Build and push image
   gcloud builds submit --tag gcr.io/PROJECT_ID/lakra-backend
   
   # Deploy to Cloud Run
   gcloud run deploy lakra-backend \
     --image gcr.io/PROJECT_ID/lakra-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Azure Deployment

1. **Using Azure Container Instances**
   ```bash
   # Create container instance
   az container create \
     --resource-group lakra-rg \
     --name lakra-backend \
     --image yourdockerhub/lakra-backend:latest \
     --dns-name-label lakra-backend \
     --ports 8000
   ```

## Database Migration

### Production Database Migration

1. **Backup Current Database**
   ```bash
   # PostgreSQL backup
   pg_dump -U lakra_user -h localhost lakra_production > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # SQLite backup
   sqlite3 annotation_system.db ".backup backup_$(date +%Y%m%d_%H%M%S).db"
   ```

2. **Run Migrations**
   ```bash
   # Run migration scripts
   python migrate_db.py
   python migrate_evaluator.py
   python migrate_mt_quality.py
   python migrate_onboarding.py
   ```

3. **Verify Migration**
   ```bash
   # Check database schema
   python -c "from database import engine; print(engine.table_names())"
   
   # Test application
   python -c "from main import app; print('Application started successfully')"
   ```

## Security Considerations

### SSL/TLS Configuration

1. **Let's Encrypt SSL**
   ```bash
   # Install certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get certificate
   sudo certbot --nginx -d yourdomain.com
   
   # Auto-renewal
   sudo crontab -e
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

2. **Security Headers**
   ```nginx
   # Add security headers
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-XSS-Protection "1; mode=block" always;
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   add_header Content-Security-Policy "default-src 'self'" always;
   ```

### Firewall Configuration

```bash
# UFW firewall rules
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoint**
   ```python
   @app.get("/health")
   def health_check():
       return {"status": "healthy", "timestamp": datetime.utcnow()}
   ```

2. **Logging Configuration**
   ```python
   import logging
   
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
       handlers=[
           logging.FileHandler('/var/log/lakra/backend.log'),
           logging.StreamHandler()
       ]
   )
   ```

### Performance Monitoring

1. **Prometheus Metrics**
   ```bash
   # Install prometheus client
   pip install prometheus-client
   
   # Add metrics to application
   from prometheus_client import Counter, Histogram, generate_latest
   
   REQUEST_COUNT = Counter('requests_total', 'Total requests')
   REQUEST_LATENCY = Histogram('request_duration_seconds', 'Request latency')
   ```

2. **Grafana Dashboard**
   ```json
   {
     "dashboard": {
       "title": "Lakra Application Metrics",
       "panels": [
         {
           "title": "Request Rate",
           "type": "graph",
           "targets": [
             {
               "expr": "rate(requests_total[5m])"
             }
           ]
         }
       ]
     }
   }
   ```

## Backup and Recovery

### Automated Backups

1. **Database Backup Script**
   ```bash
   #!/bin/bash
   # backup_db.sh
   
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/opt/backups"
   
   # Create backup directory
   mkdir -p $BACKUP_DIR
   
   # PostgreSQL backup
   pg_dump -U lakra_user -h localhost lakra_production > "$BACKUP_DIR/db_backup_$DATE.sql"
   
   # Compress backup
   gzip "$BACKUP_DIR/db_backup_$DATE.sql"
   
   # Remove old backups (keep 30 days)
   find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
   ```

2. **Cron Job Setup**
   ```bash
   # Add to crontab
   0 2 * * * /opt/scripts/backup_db.sh
   ```

### Disaster Recovery

1. **Database Restoration**
   ```bash
   # Restore from backup
   gunzip -c /opt/backups/db_backup_20240101_020000.sql.gz | psql -U lakra_user -d lakra_production
   ```

2. **Application Recovery**
   ```bash
   # Restore application files
   cd /opt/lakra
   git pull origin main
   
   # Restart services
   sudo systemctl restart lakra-backend
   sudo systemctl reload nginx
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   psql -U lakra_user -h localhost -d lakra_production
   
   # Check service status
   sudo systemctl status postgresql
   ```

2. **Application Errors**
   ```bash
   # Check application logs
   sudo journalctl -u lakra-backend -f
   
   # Check nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew --dry-run
   ```

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes for better query performance
   CREATE INDEX idx_annotations_created_at ON annotations(created_at);
   CREATE INDEX idx_sentences_language ON sentences(target_language);
   
   -- Analyze query performance
   EXPLAIN ANALYZE SELECT * FROM annotations WHERE created_at > NOW() - INTERVAL '1 day';
   ```

2. **Application Tuning**
   ```python
   # Connection pooling
   from sqlalchemy import create_engine
   from sqlalchemy.pool import QueuePool
   
   engine = create_engine(
       DATABASE_URL,
       poolclass=QueuePool,
       pool_size=20,
       max_overflow=0
   )
   ```

---

**Last Updated**: January 2024
**Deployment Version**: 1.0.0
**Supported Platforms**: Linux, Docker, AWS, GCP, Azure 