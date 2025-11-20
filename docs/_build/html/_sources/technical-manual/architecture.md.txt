# Architecture

This document describes the overall architecture of the Lakra annotation and evaluation system.

## Overview

Lakra is a modern web application built with a **serverless architecture** using React for the frontend and Supabase as the backend-as-a-service (BaaS).

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │           React 19 Application                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │   │
│  │  │  Pages   │  │Components│  │  Context/State │  │   │
│  │  └──────────┘  └──────────┘  └────────────────┘  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │   │
│  │  │ Services │  │  Utils   │  │     Hooks      │  │   │
│  │  └──────────┘  └──────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / WebSocket
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                    │
│  ┌────────────┐  ┌──────────┐  ┌─────────────────────┐ │
│  │   Auth     │  │PostgreSQL│  │   Storage (S3)      │ │
│  │  (JWT)     │  │  + RLS   │  │ (Voice Recordings)  │ │
│  └────────────┘  └──────────┘  └─────────────────────┘ │
│  ┌────────────┐  ┌──────────┐  ┌─────────────────────┐ │
│  │Edge Funcs  │  │Realtime  │  │    API (REST)       │ │
│  │(Optional)  │  │Listeners │  │                     │ │
│  └────────────┘  └──────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Architecture Principles

### 1. Serverless-First
- No traditional backend server to maintain
- Supabase handles all server-side operations
- Scales automatically with demand
- Reduces operational complexity

### 2. Client-Side Rendering
- React handles all UI rendering
- Fast, interactive user experience
- State management via React Context
- Client-side routing with React Router

### 3. Security by Default
- Row Level Security (RLS) at database level
- JWT-based authentication
- Role-based access control (RBAC)
- Secure HTTP-only operations

### 4. Mobile-First Design
- Responsive layouts work on all screen sizes
- Progressive Web App (PWA) capabilities
- Optimized for touch interfaces
- Adaptive UI based on device

## Frontend Architecture

### Technology Stack

- **React 19**: Core UI library
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool and dev server
- **TailwindCSS**: Utility-first styling
- **React Router**: Client-side routing
- **GSAP**: Animations
- **Supabase Client**: Backend integration

### Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── modals/         # Modal dialogs
│   ├── pages/          # Page components
│   └── ui/             # Reusable UI components
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state
├── hooks/              # Custom React hooks
│   └── useSEO.ts       # SEO meta tags
├── services/           # API services
│   ├── api.ts          # API wrappers
│   └── supabase-api.ts # Supabase client methods
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
├── utils/              # Utility functions
│   ├── logger.ts       # Logging utilities
│   ├── seo.ts          # SEO utilities
│   └── supabase.ts     # Supabase client configuration
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

### Component Architecture

**Component Hierarchy:**

```
App
├── AuthProvider (Context)
├── Router
│   ├── Layout
│   │   ├── Navbar
│   │   ├── AnimatedBackground
│   │   └── Footer
│   └── Routes
│       ├── Public Routes
│       │   ├── Landing
│       │   ├── Login
│       │   ├── Register
│       │   └── About
│       ├── Protected Routes (Authenticated)
│       │   ├── AnnotatorDashboard
│       │   ├── AnnotationInterface
│       │   ├── EvaluatorDashboard
│       │   ├── EvaluationInterface
│       │   └── AdminDashboard
│       └── Admin Routes
│           ├── UserManagement
│           ├── SentenceManagement
│           └── Analytics
└── Modals
    ├── GuidelinesModal
    ├── ConfirmationModal
    └── QuizModals
```

### State Management

**Authentication State:**
- Managed by `AuthContext`
- Provides current user, role, and auth methods
- Persisted via Supabase session management

**Local State:**
- Component-level state with `useState`
- Form state management
- UI state (modals, loading, etc.)

**Server State:**
- Fetched from Supabase in components
- Real-time updates via Supabase listeners (optional)
- Optimistic updates for better UX

### Routing Strategy

**Route Types:**

1. **Public Routes**: Accessible without authentication
   - Landing page (`/`)
   - Login (`/login`)
   - Register (`/register`)
   - About (`/about`)

2. **Accessible Routes**: Available to both authenticated and non-authenticated users
   - About page with different content

3. **Protected Routes**: Require authentication
   - Dashboards
   - Annotation interfaces
   - Evaluation interfaces

4. **Role-Based Routes**: Require specific roles
   - Admin routes (admin only)
   - Annotator routes (annotator only)
   - Evaluator routes (evaluator only)

**Route Guards:**
```typescript
<ProtectedRoute adminOnly={true}>
  <AdminDashboard />
</ProtectedRoute>
```

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Service Function (API call)
    ↓
Supabase Client
    ↓
[Network Request]
    ↓
Supabase Backend
    ↓
PostgreSQL + RLS
    ↓
[Network Response]
    ↓
Component State Update
    ↓
UI Re-render
```

## Backend Architecture

### Supabase Components

#### 1. PostgreSQL Database

**Features:**
- Fully managed PostgreSQL database
- Row Level Security (RLS) policies
- Real-time capabilities
- Full-text search
- Complex queries and joins

**Schema Design:**
- Normalized relational structure
- Foreign key relationships
- Indexes for performance
- Constraints for data integrity

See [Database Schema](database-schema.md) for details.

#### 2. Authentication (Supabase Auth)

**Features:**
- Email/password authentication
- Username-based login via RPC
- JWT tokens (access + refresh)
- Automatic session management
- Secure password hashing

**Authentication Flow:**
```
1. User submits credentials
2. Supabase Auth validates
3. JWT tokens generated
4. Tokens stored in browser (localStorage)
5. Tokens sent with every request
6. RLS policies check user permissions
```

#### 3. Storage (Supabase Storage)

**Purpose:** Voice recording storage

**Features:**
- S3-compatible object storage
- Private buckets with access policies
- Signed URLs for secure access
- Automatic MIME type detection

**Bucket Structure:**
```
voice-recordings/
├── {user_id}/
│   ├── {annotation_id}_voice.webm
│   └── {annotation_id}_voice.mp3
```

#### 4. Row Level Security (RLS)

**Purpose:** Database-level access control

**How it works:**
- Policies defined per table and operation (SELECT, INSERT, UPDATE, DELETE)
- Policies use `auth.uid()` to identify current user
- Policies check user role and ownership
- Enforced at database level (can't be bypassed)

**Example Policy:**
```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

#### 5. Edge Functions (Optional)

**Purpose:** Custom serverless functions

**Use Cases:**
- Complex business logic
- Third-party API integrations
- Background processing
- Email notifications

**Deployment:**
```bash
supabase functions deploy function-name
```

## Authentication Flow

### Login Process

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (React)
    participant S as Supabase Auth
    participant DB as PostgreSQL

    U->>C: Enter email/username + password
    C->>S: signInWithPassword()
    S->>DB: Validate credentials
    DB-->>S: User data
    S-->>C: JWT tokens + session
    C->>C: Store tokens
    C->>DB: Fetch user profile (with RLS)
    DB-->>C: User data with role
    C-->>U: Redirect to role dashboard
```

### Authorization Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Supabase API
    participant RLS as RLS Engine
    participant DB as Database

    C->>API: Request with JWT
    API->>RLS: Check policies
    RLS->>RLS: Extract user from JWT
    RLS->>DB: Query with user context
    DB-->>RLS: Filtered results
    RLS-->>API: Authorized data
    API-->>C: Response
```

## Data Flow Patterns

### Annotation Creation

```
1. User fills annotation form
2. Client validates input
3. Service calls Supabase API
4. RLS verifies user can create annotation
5. Database inserts annotation record
6. Database triggers update sentence status
7. Response sent to client
8. UI updates with new annotation
9. Navigate to next sentence
```

### Quality Assessment

```
1. Evaluator selects annotation to review
2. Client fetches annotation + AI assessment
3. Evaluator validates/modifies scores
4. Client submits evaluation
5. RLS verifies evaluator role
6. Database inserts evaluation record
7. Database updates annotation metadata
8. Response confirms success
9. UI shows next pending evaluation
```

## Performance Optimizations

### Frontend

1. **Code Splitting**
   - Vendor bundle (React, React-DOM)
   - Router bundle (React Router)
   - Lazy loading for routes (optional)

2. **Build Optimizations**
   - Vite's optimized bundling
   - Tree shaking
   - Minification
   - Console removal in production

3. **Runtime Optimizations**
   - Memoization (`useMemo`, `useCallback`)
   - Debouncing user inputs
   - Optimistic UI updates

### Backend

1. **Database**
   - Indexes on foreign keys
   - Indexes on frequently queried columns
   - Efficient RLS policies
   - Connection pooling

2. **API**
   - Selective field fetching
   - Pagination for large datasets
   - Caching strategies (if applicable)

3. **Storage**
   - CDN for static assets
   - Signed URL caching
   - Optimized file formats (WebM for audio)

## Security Architecture

### Defense in Depth

**Layer 1: Client Validation**
- Input validation
- Client-side role checks
- UI-level access control

**Layer 2: Network**
- HTTPS only
- CORS configuration
- Rate limiting (via Supabase)

**Layer 3: Authentication**
- JWT verification
- Session timeout
- Refresh token rotation

**Layer 4: Authorization (RLS)**
- Database-level policies
- Role-based access
- Data ownership checks

**Layer 5: Data**
- Encrypted at rest
- Encrypted in transit
- Secure password hashing

### Threat Mitigation

**SQL Injection:**
- Prevented by Supabase parameterized queries
- No raw SQL from client

**XSS (Cross-Site Scripting):**
- React escapes output by default
- Content Security Policy headers

**CSRF (Cross-Site Request Forgery):**
- JWT tokens (not cookies)
- Origin verification

**Unauthorized Access:**
- RLS policies enforce permissions
- Role verification at multiple layers

## Scalability Considerations

### Horizontal Scaling

- Supabase handles database scaling
- CDN for static assets (Vercel)
- Serverless functions scale automatically

### Performance at Scale

- Database connection pooling
- Efficient query optimization
- Caching strategies
- Background job processing (if needed)

### Data Growth

- Archival strategies for old data
- Partitioning for large tables
- Storage optimization

## Monitoring and Observability

### Client-Side

- Vercel Analytics integration
- Error tracking (if configured)
- Performance metrics

### Server-Side

- Supabase dashboard metrics
- Database query performance
- API response times
- Error logs

## Deployment Architecture

### Development

```
Local Machine
├── Vite Dev Server (port 5173)
└── Supabase Project (cloud)
```

### Production

```
Vercel (Frontend)
├── CDN (Global)
├── Edge Functions (Optional)
└── Static Build

Supabase (Backend)
├── Database (Regional)
├── Auth Service
├── Storage (S3)
└── API Gateway
```

## Future Architecture Enhancements

Potential improvements:

1. **Real-Time Collaboration**
   - Supabase Realtime for live updates
   - Collaborative annotation features

2. **Offline Support**
   - Service workers
   - Local storage
   - Sync when online

3. **Advanced AI Integration**
   - Supabase Edge Functions for AI processing
   - Third-party AI service integration

4. **Analytics Pipeline**
   - Data warehouse integration
   - Advanced reporting
   - Machine learning insights

## See Also

- [Database Schema](database-schema.md) - Complete database structure
- [API Reference](api-reference.md) - API documentation
- [Components](components.md) - Component details
- [Development](development.md) - Development setup
- [Deployment](deployment.md) - Production deployment
