# Troubleshooting Guide

## Overview

This guide provides solutions to common problems you might encounter when using the Lakra annotation system. Issues are organized by category with step-by-step solutions.

## Getting Help

### Quick Diagnosis

Before diving into specific issues, try these quick diagnostic steps:

1. **Check System Status**
   ```bash
   # Backend health check
   curl http://localhost:8000/health
   
   # Frontend accessibility
   curl http://localhost:5173
   ```

2. **Check Logs**
   ```bash
   # Backend logs
   tail -f backend/app.log
   
   # System logs (if using systemd)
   sudo journalctl -u lakra -f
   ```

3. **Verify Configuration**
   ```bash
   # Check environment variables
   printenv | grep -E "(DATABASE_URL|SECRET_KEY|API_HOST)"
   ```

### Support Resources

- **Documentation**: [Main Documentation](README.md)
- **FAQ**: [Frequently Asked Questions](support/faq.md)
- **Known Issues**: [Known Issues List](support/known-issues.md)
- **Contact**: [Support Contact](support/contact.md)

## Installation Issues

### Permission Errors

**Problem**: Permission denied errors during installation
```
Permission denied: '/opt/lakra'
```

**Solution**:
```bash
# Fix file permissions
sudo chown -R $USER:$USER /opt/lakra
chmod +x /opt/lakra/backend/venv/bin/python

# For development
chmod +x backend/venv/bin/activate
```

### Python Version Issues

**Problem**: Python version compatibility errors
```
Python 3.7 is not supported
```

**Solution**:
```bash
# Install Python 3.8+
sudo apt update
sudo apt install python3.8 python3.8-venv python3.8-dev

# Use specific Python version
python3.8 -m venv venv
```

### Node.js Version Issues

**Problem**: Node.js version compatibility errors
```
Node.js version 14 is not supported
```

**Solution**:
```bash
# Install Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify version
node --version
npm --version
```

### Package Installation Failures

**Problem**: pip or npm installation failures
```
Failed building wheel for package
```

**Solution**:
```bash
# Backend packages
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt --force-reinstall

# Frontend packages
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Database Issues

### Connection Errors

**Problem**: Database connection failures
```
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) no such table: users
```

**Solution**:
```bash
# Initialize database
cd backend
python init_db.py

# For PostgreSQL connection issues
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Migration Errors

**Problem**: Database migration failures
```
alembic.util.exc.CommandError: Can't locate revision identified by
```

**Solution**:
```bash
# Run migrations step by step
python migrate_db.py
python migrate_evaluator.py
python migrate_mt_quality.py
python migrate_onboarding.py

# If migrations fail, reset database (development only)
rm -f annotation_system.db
python init_db.py
```

### SQLite Locking Issues

**Problem**: Database is locked errors
```
sqlite3.OperationalError: database is locked
```

**Solution**:
```bash
# Find processes using the database
lsof backend/annotation_system.db

# Kill processes if safe
kill -9 <PID>

# Or restart the application
pkill -f "python main.py"
```

### PostgreSQL Issues

**Problem**: PostgreSQL connection refused
```
psycopg2.OperationalError: could not connect to server: Connection refused
```

**Solution**:
```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U lakra_user -d lakra_production -h localhost
```

## Application Startup Issues

### Port Conflicts

**Problem**: Port already in use errors
```
[Errno 98] Address already in use
```

**Solution**:
```bash
# Check port usage
sudo netstat -tulnp | grep :8000
sudo lsof -i :8000

# Kill process using port
sudo kill -9 <PID>

# Or use different port
export API_PORT=8001
python main.py
```

### Module Import Errors

**Problem**: Python module import failures
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution**:
```bash
# Activate virtual environment
source venv/bin/activate

# Verify virtual environment
which python
pip list

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Build Errors

**Problem**: Vite build or start failures
```
Error: Cannot resolve module
```

**Solution**:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 16+

# Try alternative package manager
npm install -g yarn
yarn install
```

## Authentication Issues

### JWT Token Errors

**Problem**: Invalid or expired token errors
```
HTTPException: Could not validate credentials
```

**Solution**:
```bash
# Check SECRET_KEY configuration
echo $SECRET_KEY

# Verify token expiration settings
grep TOKEN_EXPIRE .env

# Clear browser storage (for frontend)
# Open DevTools > Application > Storage > Clear
```

### Login Failures

**Problem**: Cannot login with correct credentials
```
401 Unauthorized: Invalid credentials
```

**Solution**:
```bash
# Check user exists in database
python -c "
from database import SessionLocal, User
db = SessionLocal()
user = db.query(User).filter(User.email == 'admin@example.com').first()
print(f'User found: {user is not None}')
"

# Reset user password
python -c "
from database import SessionLocal, User
from auth import get_password_hash
db = SessionLocal()
user = db.query(User).filter(User.email == 'admin@example.com').first()
user.hashed_password = get_password_hash('new_password')
db.commit()
print('Password reset successfully')
"
```

### Session Issues

**Problem**: Session expires immediately
```
Session expired, please login again
```

**Solution**:
```bash
# Check session configuration
grep SESSION_EXPIRE .env

# Verify system time
date
timedatectl status

# Clear browser cookies
# DevTools > Application > Cookies > Clear
```

## API Issues

### CORS Errors

**Problem**: Cross-origin request blocked
```
Access to fetch at 'http://localhost:8000/api' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**:
```bash
# Check CORS configuration
grep CORS_ORIGINS backend/.env

# Should include frontend URL
CORS_ORIGINS=http://localhost:5173

# Test CORS
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8000/api/health
```

### API Response Errors

**Problem**: 500 Internal Server Error
```
HTTPException: Internal server error
```

**Solution**:
```bash
# Check backend logs
tail -f backend/app.log

# Enable debug mode
export DEBUG=True
python main.py

# Check database connection
python -c "
from database import engine
try:
    engine.connect()
    print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
"
```

### Request Timeout Errors

**Problem**: Request timeout errors
```
Request timed out after 30 seconds
```

**Solution**:
```bash
# Increase timeout settings
export API_TIMEOUT=60

# Check system resources
htop
df -h

# Optimize database queries
# Add indexes, check query performance
```

## Frontend Issues

### Page Load Errors

**Problem**: White screen or JavaScript errors
```
Uncaught TypeError: Cannot read property
```

**Solution**:
```bash
# Check browser console for errors
# F12 > Console

# Clear browser cache
# Ctrl+Shift+R (hard refresh)

# Rebuild frontend
npm run build
npm run dev
```

### Component Rendering Issues

**Problem**: Components not displaying correctly
```
Component failed to render
```

**Solution**:
```bash
# Check React version compatibility
npm list react

# Update dependencies
npm update

# Check for CSS conflicts
# Inspect element in browser DevTools
```

### Navigation Issues

**Problem**: Routing not working
```
Cannot GET /dashboard
```

**Solution**:
```bash
# Check routing configuration
# src/App.tsx

# Verify history mode configuration
# For production, ensure server redirects to index.html

# Check base URL configuration
grep BASE_URL .env
```

## Performance Issues

### Slow Database Queries

**Problem**: Database queries taking too long
```
Query execution time: 30+ seconds
```

**Solution**:
```bash
# Add database indexes
python -c "
from database import engine
from sqlalchemy import text
engine.execute(text('CREATE INDEX idx_annotations_created_at ON annotations(created_at)'))
"

# Analyze query performance
python -c "
from database import SessionLocal
from sqlalchemy import text
db = SessionLocal()
result = db.execute(text('EXPLAIN ANALYZE SELECT * FROM annotations'))
print(result.fetchall())
"
```

### Memory Issues

**Problem**: High memory usage or out of memory errors
```
MemoryError: Unable to allocate memory
```

**Solution**:
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Optimize Python memory
export PYTHONMALLOC=malloc
export MALLOC_TRIM_THRESHOLD_=100000

# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Slow Frontend Loading

**Problem**: Frontend takes too long to load
```
Initial page load: 10+ seconds
```

**Solution**:
```bash
# Optimize build
npm run build -- --minify

# Check bundle size
npm run build -- --analyze

# Enable compression
# Configure gzip in nginx/apache

# Use CDN for static assets
```

## File Upload Issues

### Voice Recording Failures

**Problem**: Voice recording not working
```
MediaRecorder not available
```

**Solution**:
```bash
# Check HTTPS requirement
# Voice recording requires HTTPS in production

# Check browser permissions
# Settings > Privacy > Microphone > Allow

# Test microphone access
# Browser > Developer Tools > Console:
# navigator.mediaDevices.getUserMedia({audio: true})
```

### File Size Limits

**Problem**: File upload fails due to size limits
```
File too large: Maximum size is 10MB
```

**Solution**:
```bash
# Check upload limits
grep MAX_FILE_SIZE .env

# Increase limits
export MAX_FILE_SIZE=20971520  # 20MB

# Check nginx limits (if using nginx)
sudo nginx -T | grep client_max_body_size
```

## Security Issues

### SSL Certificate Problems

**Problem**: SSL certificate errors
```
SSL certificate verify failed
```

**Solution**:
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
curl -I https://yourdomain.com
```

### Security Headers Missing

**Problem**: Missing security headers
```
Content-Security-Policy header missing
```

**Solution**:
```bash
# Add security headers to nginx
cat >> /etc/nginx/sites-available/lakra << 'EOF'
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
EOF

sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring and Debugging

### Enable Debug Mode

**Development Environment**:
```bash
# Backend debug mode
export DEBUG=True
export LOG_LEVEL=DEBUG

# Frontend debug mode
export VITE_ENABLE_DEBUG_MODE=true
```

### Logging Configuration

**Backend Logging**:
```python
# Add to main.py
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('debug.log'),
        logging.StreamHandler()
    ]
)
```

**Frontend Logging**:
```javascript
// Add to src/main.tsx
if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
  console.log('Debug mode enabled');
  // Enable additional logging
}
```

### Performance Monitoring

**System Monitoring**:
```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor disk usage
df -h
du -sh /opt/lakra/*

# Monitor network
netstat -tuln
```

**Application Monitoring**:
```bash
# Monitor API responses
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/api/health

# Monitor database performance
python -c "
from database import SessionLocal
from sqlalchemy import text
import time
db = SessionLocal()
start = time.time()
result = db.execute(text('SELECT COUNT(*) FROM annotations'))
end = time.time()
print(f'Query time: {end - start:.2f}s')
"
```

## Recovery Procedures

### Database Recovery

**Backup and Restore**:
```bash
# Create backup
pg_dump -U lakra_user -h localhost lakra_production > backup.sql

# Restore from backup
psql -U lakra_user -h localhost lakra_production < backup.sql

# SQLite backup
sqlite3 annotation_system.db ".backup backup.db"
```

### Application Recovery

**Service Recovery**:
```bash
# Restart services
sudo systemctl restart lakra
sudo systemctl restart nginx

# Check service status
sudo systemctl status lakra
sudo systemctl status nginx

# View service logs
sudo journalctl -u lakra --since "10 minutes ago"
```

### File System Recovery

**Disk Space Issues**:
```bash
# Clean up log files
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log

# Clean up temporary files
sudo rm -rf /tmp/*
docker system prune -a

# Clean up old backups
find /backups -name "*.sql" -mtime +30 -delete
```

## Prevention Best Practices

### Regular Maintenance

1. **Monitor disk space regularly**
2. **Keep dependencies updated**
3. **Regular database backups**
4. **Monitor log files**
5. **Performance monitoring**

### Security Maintenance

1. **Regular security updates**
2. **SSL certificate renewal**
3. **Access log monitoring**
4. **Dependency vulnerability scanning**
5. **Regular password updates**

### Performance Maintenance

1. **Database optimization**
2. **Log rotation**
3. **Cache cleanup**
4. **Resource monitoring**
5. **Load testing**

## Getting Additional Help

### Community Resources

- **GitHub Issues**: Report bugs and request features
- **Discussion Forums**: Community discussions and Q&A
- **Documentation**: Comprehensive system documentation
- **Stack Overflow**: Tag questions with 'lakra-annotation'

### Professional Support

- **Email Support**: [support@yourdomain.com](mailto:support@yourdomain.com)
- **Bug Reports**: [GitHub Issues](https://github.com/your-org/lakra/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-org/lakra/discussions)

### Diagnostic Information

When requesting support, please provide:

1. **System Information**:
   ```bash
   uname -a
   python --version
   node --version
   ```

2. **Error Messages**: Complete error messages and stack traces

3. **Log Files**: Relevant log entries (with sensitive data removed)

4. **Configuration**: Environment variables and configuration files

5. **Steps to Reproduce**: Detailed steps to reproduce the issue

---

**Last Updated**: January 2024
**Troubleshooting Version**: 1.0.0

For additional help, see [Support Resources](support/resources.md) or contact [Support](support/contact.md). 