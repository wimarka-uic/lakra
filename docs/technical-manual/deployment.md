# Deployment Guide

This guide covers deploying Lakra to production environments.

## Deployment Overview

Lakra consists of two main components:
- **Frontend**: Static React application
- **Backend**: Supabase (managed service)

## Recommended Architecture

```
Production Setup:
- Frontend: Vercel (or Netlify, AWS S3 + CloudFront)
- Backend: Supabase (managed PostgreSQL + Auth + Storage)
- Domain: Custom domain with SSL
- CDN: Built-in with hosting provider
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Advantages:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments
- Analytics included

**Steps:**

1. **Prepare Project**

```bash
# Ensure build works
npm run build

# Test production build
npm run preview
```

2. **Connect to Vercel**

```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

**Or via Vercel Dashboard:**
- Connect GitHub repository
- Configure project settings
- Add environment variables
- Deploy

3. **Environment Variables**

In Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Custom Domain**

Vercel Dashboard → Settings → Domains:
- Add your custom domain
- Configure DNS (CNAME or A record)
- SSL automatically provisioned

5. **Build Settings**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

**vercel.json** (already configured):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Netlify

**Steps:**

1. **Build Configuration**

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Environment Variables**

Netlify Dashboard → Site settings → Build & deploy → Environment:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

3. **Deploy**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option 3: AWS S3 + CloudFront

**Steps:**

1. **Build Application**

```bash
npm run build
```

2. **Create S3 Bucket**

```bash
aws s3 mb s3://your-bucket-name
```

3. **Configure Bucket for Static Hosting**

```bash
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

4. **Upload Build**

```bash
aws s3 sync dist/ s3://your-bucket-name
```

5. **CloudFront Distribution**

- Point to S3 bucket
- Configure custom domain
- Set up SSL certificate (ACM)
- Configure error pages (404 → index.html)

## Backend Deployment (Supabase)

### Production Supabase Setup

1. **Create Production Project**

- Go to [supabase.com](https://supabase.com)
- Create new project
- Select region closest to users
- Use strong database password

2. **Database Migration**

**Export from Development:**

```sql
-- In Supabase SQL Editor, export schema
pg_dump -h dev-host -U postgres -s database_name > schema.sql
```

**Import to Production:**

```bash
# Run schema script in Production SQL Editor
# Or use psql:
psql -h prod-host -U postgres -d database_name -f schema.sql
```

3. **Row Level Security**

Verify all RLS policies are enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Enable if needed
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

4. **Database Indexes**

Ensure all indexes are created:

```sql
-- Critical indexes for performance
CREATE INDEX IF NOT EXISTS idx_annotations_sentence_id 
  ON annotations(sentence_id);

CREATE INDEX IF NOT EXISTS idx_annotations_annotator_id 
  ON annotations(annotator_id);

-- Add indexes for foreign keys
-- See database-schema.md for complete list
```

5. **Authentication Configuration**

Supabase Dashboard → Authentication → Settings:

- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: 
  - `https://your-domain.com/auth/callback`
  - Add any additional redirect URLs
- **Email Templates**: Customize email templates
- **Rate Limits**: Configure appropriate limits

6. **Storage Configuration**

Supabase Dashboard → Storage:

- Create `voice-recordings` bucket
- Set bucket to private
- Configure storage policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'voice-recordings');

-- Users can read their own recordings
CREATE POLICY "Users can read own recordings"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'voice-recordings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

7. **Environment Variables**

Production values:

```env
# Frontend .env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

### Database Backups

**Automatic Backups:**
- Supabase Pro: Daily automated backups
- Free tier: Point-in-time recovery (limited)

**Manual Backups:**

```bash
# Via Supabase Dashboard
# Settings → Database → Backups → Manual Backup

# Or via pg_dump
pg_dump -h db.your-project.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f backup_$(date +%Y%m%d).dump
```

**Backup Schedule:**
- Daily automated backups
- Weekly manual backups
- Before major updates
- Before schema migrations

## Security Hardening

### 1. Environment Variables

**Never commit:**
- Supabase URL
- API keys
- Passwords
- Secrets

**Use:**
- Environment variables
- Secret management services
- Different keys for dev/staging/prod

### 2. Supabase Security

**API Keys:**
- Use **anon key** for frontend (safe to expose)
- **Never** use service_role key in frontend
- Rotate keys periodically

**RLS Policies:**
- Test all policies thoroughly
- Use least privilege principle
- Regular security audits

**Database:**
- Strong database password
- Restrict IP access (if needed)
- Regular updates

### 3. Frontend Security

**Content Security Policy:**

Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' https://*.supabase.co;
               img-src 'self' data: https:;
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';">
```

**HTTPS Only:**
- Enforce HTTPS
- HSTS headers
- Secure cookies

### 4. Rate Limiting

Configure in Supabase Dashboard:
- Authentication rate limits
- API rate limits
- Per-user limits

## Performance Optimization

### Frontend

**Build Optimization:**

```typescript
// vite.config.ts - already configured
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
});
```

**Asset Optimization:**
- Compress images (WebP format)
- Minify CSS/JS (automatic in build)
- Use CDN for static assets
- Enable gzip/brotli compression

**Caching:**

```
# _headers file (for Netlify)
/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: no-cache
```

### Backend

**Database:**
- Connection pooling (automatic in Supabase)
- Query optimization
- Proper indexing
- Regular VACUUM

**API:**
- Pagination for large datasets
- Field selection (not SELECT *)
- Caching strategies

## Monitoring

### Frontend Monitoring

**Vercel Analytics:**
- Automatically included
- Page views
- Performance metrics

**Custom Monitoring:**

```typescript
// Track errors
window.addEventListener('error', (event) => {
  // Send to monitoring service
  console.error('Error:', event.error);
});

// Track performance
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    // Monitor metrics
  });
  observer.observe({ entryTypes: ['navigation', 'resource'] });
}
```

### Backend Monitoring

**Supabase Dashboard:**
- Database performance
- API usage
- Authentication analytics
- Error logs

**Alert Configuration:**
- Database connection limits
- Storage usage
- Error rates
- Response times

## CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup current production

### Deployment

- [ ] Deploy database changes first
- [ ] Verify database migrations
- [ ] Deploy frontend
- [ ] Verify build successful
- [ ] Check all environment variables

### Post-Deployment

- [ ] Smoke test critical paths
- [ ] Verify authentication works
- [ ] Test main user flows
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Verify emails work (if applicable)

### Rollback Plan

If issues occur:

```bash
# Vercel - revert to previous deployment
vercel rollback

# Database - restore from backup
# Via Supabase Dashboard or:
pg_restore -h db.project.supabase.co \
           -U postgres \
           -d postgres \
           backup.dump
```

## Scaling Considerations

### Horizontal Scaling

**Frontend:**
- Handled automatically by Vercel/Netlify
- CDN distribution worldwide
- Edge functions (if needed)

**Backend:**
- Supabase handles scaling
- Upgrade plan for higher limits
- Connection pooling (PgBouncer)

### Database Scaling

**Optimization:**
- Add indexes for slow queries
- Partition large tables
- Archive old data
- Vacuum regularly

**Vertical Scaling:**
- Upgrade Supabase plan
- More CPU/RAM
- Better IOPS

### Storage Scaling

**Files:**
- Use CDN for frequently accessed files
- Implement cleanup policies
- Archive old recordings

## Maintenance

### Regular Tasks

**Weekly:**
- Review error logs
- Check performance metrics
- Monitor storage usage

**Monthly:**
- Security updates
- Dependency updates
- Database optimization

**Quarterly:**
- Security audit
- Performance review
- Cost optimization

### Updates

**Dependencies:**

```bash
# Check outdated packages
npm outdated

# Update
npm update

# Major updates
npm install package@latest
```

**Database:**
- Test migrations in staging first
- Run during low-traffic periods
- Have rollback plan ready

## Troubleshooting

### Common Production Issues

**Build Failures:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

**Environment Variables:**
- Verify all variables are set
- Check for typos
- Restart deployment

**Database Connection:**
- Check Supabase status
- Verify connection string
- Check RLS policies

**CORS Errors:
**
- Verify Supabase URL in frontend
- Check Supabase CORS settings
- Ensure API key is correct

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [React Production Build](https://react.dev/learn/installation#production-build)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## See Also

- [Architecture](architecture.md) - System architecture
- [Development](development.md) - Development setup
- [Database Schema](database-schema.md) - Database structure
