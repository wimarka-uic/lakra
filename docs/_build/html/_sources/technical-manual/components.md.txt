# Components

Documentation of key React components in the Lakra system.

## Component Organization

```
src/components/
├── auth/              # Authentication components
├── layout/            # Layout components
├── modals/            # Modal dialogs
├── pages/             # Page components
├── ui/                # Reusable UI components  
└── index.ts           # Barrel exports
```

## Authentication Components

### Login
**Path:** `src/components/auth/Login.tsx`

User login form with email/username support.

**Props:** None (uses AuthContext)

**Features:**
- Email or username login
- Password visibility toggle
- Form validation
- Error handling  
- Redirect after login

### Register  
**Path:** `src/components/auth/Register.tsx`

User registration form.

**Features:**
- Email/username/password fields
- Role selection (annotator/evaluator)
- Password confirmation
- Validation
- Terms acceptance

### ForgotPassword
**Path:** `src/components/auth/ForgotPassword.tsx`

Password reset request form.

### ResetPassword
**Path:** `src/components/auth/ResetPassword.tsx`

New password entry after reset link.

## Layout Components

### Navbar
**Path:** `src/components/layout/Navbar.tsx`

Top navigation bar.

**Features:**
- Logo and branding
- Navigation links (role-based)
- User menu dropdown
- Logout functionality
- Mobile responsive menu

### Footer
**Path:** `src/components/layout/Footer.tsx`

Site footer with links and info.

### Layout
**Path:** `src/components/layout/Layout.tsx`

Main layout wrapper.

**Props:**
```typescript
{
  children: ReactNode;
  showGuidelines?: () => void;
}
```

**Structure:**
```jsx
<Layout>
  <Navbar />
  <AnimatedBackground />
  <main>{children}</main>
  <Footer />
</Layout>
```

### AnimatedBackground
**Path:** `src/components/layout/AnimatedBackground.tsx`

Animated background effects using GSAP.

## Modal Components

### GuidelinesModal
**Path:** `src/components/modals/GuidelinesModal.tsx`

Annotation guidelines display.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}
```

### ConfirmationModal
**Path:** `src/components/modals/ConfirmationModal.tsx`

Generic confirmation dialog.

**Props:**
```typescript
{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}
```

**Usage:**
```jsx
<ConfirmationModal
  isOpen={showConfirm}
  title="Delete Annotation"
  message="Are you sure you want to delete this annotation?"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

## Page Components

### Landing
**Path:** `src/components/pages/Landing.tsx`

Landing page for unauthenticated users.

**Features:**
- Hero section
- Feature highlights
- Call-to-action buttons
- Responsive design

### AnnotatorDashboard
**Path:** `src/components/pages/AnnotatorDashboard.tsx`

Main dashboard for annotators.

**Displays:**
- Annotation statistics
- Recent annotations
- Available sentences count
- Quick start button

### AnnotationInterface
**Path:** `src/components/pages/AnnotationInterface.tsx`

Main annotation interface.

**Features:**
- Source text display
- Machine translation display
- Text highlighting
- Error classification
- Quality rating sliders
- Comments input
- Voice recorder
- Submit button

**State:**
```typescript
{
  sentence: Sentence | null;
  highlights: Highlight[];
  fluencyScore: number;
  adequacyScore: number;
  overallScore: number;
  comments: string;
  voiceRecording: Blob | null;
  loading: boolean;
}
```

### EvaluatorDashboard
**Path:** `src/components/pages/EvaluatorDashboard.tsx`

Main dashboard for evaluators.

**Displays:**
- Pending evaluations count
- Pending quality assessments
- Completed evaluations
- Performance metrics

### EvaluationInterface  
**Path:** `src/components/pages/EvaluationInterface.tsx`  

Annotation evaluation interface.

**Features:**
- Annotation display
- Highlighted errors review
- Evaluation scoring
- Feedback text area
- Voice recording playback

### AdminDashboard
**Path:** `src/components/pages/AdminDashboard.tsx`

Administrator dashboard.

**Sections:**
- System statistics
- User management
- Sentence management
- Analytics charts

### UserManagement
**Path:** `src/components/pages/UserManagement.tsx`

User administration interface.

**Features:**
- User list with filtering
- Create/edit/delete users
- Role assignment
- Activity status

### SentenceManagement  
**Path:** `src/components/pages/SentenceManagement.tsx`

Sentence administration interface.

**Features:**
- Sentence list with filtering
- Add/edit/delete sentences
- CSV bulk import
- Activate/deactivate sentences

## UI Components

### Logo
**Path:** `src/components/ui/Logo.tsx`

Lakra logo component.

**Props:**
```typescript
{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

### VoiceRecorder
**Path:** `src/components/ui/VoiceRecorder.tsx`

Voice recording component.

**Props:**
```typescript
{
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number; // seconds
}
```

**Features:**
- Record/pause/stop controls
- Waveform visualization (optional)
- Playback before save
- Duration display

**Usage:**
```jsx
<VoiceRecorder
  onRecordingComplete={(blob) => handleVoiceRecording(blob)}
  maxDuration={120}
/>
```

### SEO
**Path:** `src/components/ui/SEO.tsx`

SEO meta tags component.

**Props:**
```typescript
{
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}
```

## Component Patterns

### Protected Component Pattern

Components that require authentication:

```typescript
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <div>Protected content</div>;
}
```

### Role-Based Rendering

```typescript
function RoleComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      {user?.role === 'admin' && <AdminPanel />}
      {user?.role === 'annotator' && <AnnotatorPanel />}
      {user?.role === 'evaluator' && <EvaluatorPanel />}
    </div>
  );
}
```

### Data Fetching Pattern

```typescript
function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const result = await api.getData();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* render data */}</div>;
}
```

## Styling

### TailwindCSS Usage

Components use utility classes:

```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>
```

### Custom Styles

Global styles in `src/index.css`:
- CSS custom properties for theming
- Base component styles
- Utility classes
- Animations

## Component Best Practices

1. **Functional Components**: Use function components, not classes
2. **TypeScript**: Always type props and state
3. **Hooks**: Use React hooks for state and effects
4. **Composition**: Small, focused components
5. **Props**: Destructure props for clarity
6. **Memoization**: Use `useMemo`/`useCallback` for expensive operations
7. **Error Boundaries**: Wrap components in error boundaries
8. **Accessibility**: Use semantic HTML and ARIA labels
9. **Loading States**: Always show loading indicators
10. **Error States**: Handle and display errors gracefully

## Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Component from './Component';

test('renders component', () => {
  render(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );
  
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

## See Also

- [Architecture](architecture.md) - System architecture
- [Development](development.md) - Development workflow
- [API Reference](api-reference.md) - API documentation
