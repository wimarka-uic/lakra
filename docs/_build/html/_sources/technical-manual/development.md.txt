# Development Guide

This guide covers setting up your development environment and contributing to Lakra.

## Prerequisites

- **Node.js 18+**: [Download](https://nodejs.org/)
- **Package Manager**: npm, yarn, or bun
- **Git**: Version control
- **Code Editor**: VS Code recommended
- **Supabase Account**: [Sign up](https://supabase.com)

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd lakra
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Setup

In Supabase Dashboard:

1. Go to SQL Editor
2. Run table creation scripts (see [Database Schema](database-schema.md))
3. Set up RLS policies
4. Create database functions/triggers

### 5. Start Development Server

```bash
npm run dev
```

Application runs at `http://localhost:5173`

## Project Structure

```
lakra/
├── .github/              # GitHub workflows
├── docs/                 # Documentation (ReadtheDocs)
├── public/               # Static assets
│   ├── lakra.svg
│   ├── favicon.svg
│   └── _redirects
├── src/
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilities
│   ├── App.tsx           # Main app
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables (gitignored)
├── .env.example          # Example env file
├── .gitignore
├── package.json
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind config
├── vite.config.ts        # Vite config
├── eslint.config.js      # ESLint config
├── README.md
└── CONTRIBUTING.md
```

## Available Scripts

### Development

```bash
npm run dev       # Start dev server (HMR enabled)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Vite Configuration

**vite.config.ts** includes:
- React plugin
- Console removal in production
- Code splitting (vendor, router chunks)

## Development Workflow

### Branching Strategy

```bash
# Create feature branch from master
git checkout master
git pull
git checkout -b feature/your-feature-name

# Make changes...
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(annotations): add voice recording support
fix(auth): resolve username login issue
docs(api): update API reference
```

## Code Style

### TypeScript

Use TypeScript for all new files:

```typescript
// Define types
interface User {
  id: string;
  email: string;
  role: 'admin' | 'annotator' | 'evaluator';
}

// Type function parameters and return
function getUser(id: string): Promise<User | null> {
  // implementation
}

// Type React components
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}
```

### React Best Practices

```typescript
// Use functional components
function MyComponent() {
  // Use hooks
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  // Early returns for loading/error states
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  // Main render
  return <div>Content</div>;
}
```

### ESLint Configuration

Project uses ESLint with:
- TypeScript support
- React hooks rules
- React refresh plugin

Fix linting issues:
```bash
npm run lint -- --fix
```

### Tailwind CSS

Use utility classes:

```tsx
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

Use responsive modifiers:
```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>
```

## Adding New Features

### 1. Create Component

```typescript
// src/components/features/NewFeature.tsx
import { useState } from 'react';

interface NewFeatureProps {
  data: string;
}

export default function NewFeature({ data }: NewFeatureProps) {
  const [state, setState] = useState('');
  
  return (
    <div>
      <h2>{data}</h2>
    </div>
  );
}
```

### 2. Add Route (if needed)

In `App.tsx`:

```typescript
<Route
  path="/new-feature"
  element={
    <ProtectedRoute>
      <Layout>
        <NewFeature />
      </Layout>
    </ProtectedRoute>
  }
/>
```

### 3. Add API Function (if needed)

In `src/services/supabase-api.ts`:

```typescript
export const newFeatureAPI = {
  async getData(id: string) {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
};
```

### 4. Update Types

In `src/types/index.ts`:

```typescript
export interface NewFeatureData {
  id: string;
  name: string;
  // ...
}
```

## Database Migrations

### Creating Migrations

1. Design schema changes
2. Write SQL migration in Supabase SQL Editor
3. Test in development
4. Document in `database-schema.md`
5. Apply to production

**Example Migration:**

```sql
-- Add new column
ALTER TABLE users
ADD COLUMN preferred_language TEXT;

-- Create index
CREATE INDEX idx_users_preferred_language 
  ON users(preferred_language);

-- Update RLS policy
CREATE POLICY "Users can update own language"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## Testing

### Manual Testing Checklist

Before submitting PR:

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Works in Chrome, Firefox, Safari
- [ ] No TypeScript errors (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Tested with different user roles
- [ ] Tested error cases

### Testing User Flows

**1. Authentication:**
- Sign up new user
- Login with email
- Login with username
- Password reset
- Logout

**2. Annotation:**
- Navigate to annotation interface
- Select sentence
- Add highlights
- Submit annotation
- View submitted annotations

**3. Evaluation:**
- View pending evaluations
- Evaluate annotation
- Submit feedback

**4. Admin:**
- Create users
- Add sentences
- Import CSV
- View statistics

## Debugging

### Browser DevTools

Use React Developer Tools:
- Install extension
- Inspect component tree
- View props/state
- Profile performance

### Supabase Dashboard

Check:
- Database tables
- RLS policies
- API logs
- Auth users
- Storage files

### Common Issues

**"Failed to fetch" errors:**
```typescript
// Check network tab
// Verify Supabase URL/key
// Check RLS policies
// Review CORS settings
```

**Authentication issues:**
```typescript
// Clear localStorage
localStorage.clear();
// Check Supabase Auth logs
// Verify user exists in database
```

**Build errors:**
```bash
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install

# Clear build
rm -rf dist
npm run build
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Database Query Optimization

```typescript
// Select only needed fields
const { data } = await supabase
  .from('table')
  .select('id, name, email') // Not *
  .limit(20);

// Use pagination
const { data } = await supabase
  .from('table')
  .select('*')
  .range(0, 19);
```

## Documentation

Update documentation when:
- Adding new features
- Changing API
- Modifying database schema
- Updating configuration

Documentation locations:
- **User docs**: `docs/user-manual/`
- **Technical docs**: `docs/technical-manual/`
- **Code comments**: Inline for complex logic
- **README**: Project overview

## Contributing

See `CONTRIBUTING.md` for:
- Code of Conduct
- Pull Request process
- Review criteria
- Style guidelines

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)

## See Also

- [Architecture](architecture.md) - System design
- [Components](components.md) - Component documentation
- [API Reference](api-reference.md) - API docs
- [Deployment](deployment.md) - Production deployment
