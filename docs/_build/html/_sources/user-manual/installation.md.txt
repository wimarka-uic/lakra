# Installation Guide

This guide covers how to install and set up Lakra for your organization or local development.

```{note}
Most end users won't need this guide - your administrator will set up Lakra for you. This guide is for administrators and developers setting up new instances.
```

## Prerequisites

Before installing Lakra, ensure you have:

- **Node.js 18+**: [Download from nodejs.org](https://nodejs.org/)
- **Package Manager**: npm, yarn, or bun
- **Supabase Account**: [Sign up at supabase.com](https://supabase.com) (free tier available)
- **Git**: For cloning the repository

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lakra
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

Using bun:
```bash
bun install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - **Name**: Choose a name (e.g., "lakra-production")
   - **Database Password**: Create a strong password
   - **Region**: Select the closest region to your users
5. Click "Create new project"

#### Get Your Project Credentials

1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** (shown under "Project URL")
   - **Anon/Public Key** (shown under "Project API keys")

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env
```

Add the following content (replace with your actual values):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Example:
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```{warning}
Never commit your `.env` file to version control. It's already included in `.gitignore`.
```

### 5. Set Up the Database

#### Run SQL Migrations

In your Supabase project dashboard:

1. Navigate to **SQL Editor**
2. Create the following tables and configurations:

**Users Table:**
```sql
-- See technical manual for complete schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'annotator', 'evaluator')),
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- Add other columns as per schema
);
```

```{note}
For the complete database schema and all tables, see the [Database Schema](../technical-manual/database-schema.md) in the Technical Manual.
```

#### Configure Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
-- Continue for all tables
```

Create security policies:

```sql
-- Example: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

```{tip}
Refer to the [Development Guide](../technical-manual/development.md) for complete RLS policies.
```

#### Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure allowed authentication methods:
   - Enable **Email** authentication
3. Set **Site URL** to your application URL
4. Configure **Redirect URLs** if needed

### 6. Configure Storage (for Voice Recordings)

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket:
   - **Name**: `voice-recordings`
   - **Public**: unchecked (private bucket)
3. Set up storage policies for authenticated uploads

### 7. Start the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### 8. Create Your First Admin User

Since you need an admin account to create other users:

1. Go to **Authentication** → **Users** in Supabase
2. Click "Add user"
3. Enter email and password
4. After creation, update the user in the `users` table:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin@example.com';
```

### 9. Access the Application

1. Open your browser to `http://localhost:5173`
2. Sign in with your admin credentials
3. Access the admin panel to:
   - Create additional users
   - Add sentences for annotation
   - Configure system settings

## Verification

After installation, verify everything works:

- [ ] Application loads in browser
- [ ] Can sign in with admin account
- [ ] Admin dashboard displays correctly
- [ ] Can create test users
- [ ] Can add test sentences
- [ ] Authentication persists across page refreshes

## Production Deployment

For production deployment, see the [Deployment Guide](../technical-manual/deployment.md) in the Technical Manual.

### Quick Production Checklist

- [ ] Build production bundle: `npm run build`
- [ ] Deploy to hosting service (Vercel, Netlify, etc.)
- [ ] Configure production environment variables
- [ ] Set up custom domain
- [ ] Configure HTTPS
- [ ] Set up proper RLS policies in Supabase
- [ ] Configure authentication redirect URLs
- [ ] Test all features in production

## Troubleshooting

### Common Issues

**"Failed to fetch" errors:**
- Check if Supabase URL and anon key are correct
- Verify Supabase project is active
- Check CORS settings in Supabase

**Authentication not working:**
- Verify email auth is enabled in Supabase
- Check Site URL and Redirect URLs configuration
- Clear browser cache and cookies

**Database connection errors:**
- Verify row-level security policies are set
- Check that tables exist in Supabase
- Ensure user has proper permissions

### Getting Help

- Check Supabase dashboard logs
- Review browser console for errors
- See the [FAQ](faq.md) for common questions
- Consult the [Development Guide](../technical-manual/development.md)

## Next Steps

- Create user accounts for your team
- Import sentences via CSV (see [Admin Guide](admin-guide.md))
- Configure onboarding tests
- Start annotating and evaluating!
