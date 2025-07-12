# Frontend Component Documentation

## Overview

The Lakra frontend is built with React and TypeScript, following modern component architecture patterns. The application uses a combination of functional components with hooks, context for state management, and TailwindCSS for styling.

## Architecture

### Component Structure

```
src/
├── components/           # React components
│   ├── About.tsx        # About page component
│   ├── AdminDashboard.tsx # Admin management interface
│   ├── AnnotationInterface.tsx # Core annotation interface
│   ├── EvaluationInterface.tsx # Evaluation interface
│   ├── EvaluatorDashboard.tsx # Evaluator dashboard
│   ├── GuidelinesModal.tsx # Guidelines modal
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Login.tsx        # Login form
│   ├── MTQualityInterface.tsx # MT quality assessment
│   ├── MyAnnotations.tsx # User's annotation history
│   ├── MyEvaluations.tsx # User's evaluation history
│   ├── OnboardingTest.tsx # Onboarding test interface
│   ├── Profile.tsx      # User profile management
│   ├── Register.tsx     # User registration
│   ├── UserDashboard.tsx # User dashboard
│   └── VoiceRecorder.tsx # Voice recording component
├── contexts/            # React contexts
│   └── AuthContext.tsx # Authentication context
├── services/           # API services
│   └── api.ts         # API client
└── types/             # TypeScript types
    └── index.ts       # Type definitions
```

## Core Components

### Layout.tsx

**Purpose**: Main application layout wrapper with navigation and authentication.

**Props**: None (uses React Router location)

**Features**:
- Responsive navigation bar
- Role-based menu items
- Authentication status display
- Mobile-responsive design

**Usage**:
```tsx
<Layout>
  <Routes>
    <Route path="/dashboard" element={<UserDashboard />} />
    {/* Other routes */}
  </Routes>
</Layout>
```

**Key Features**:
- Dynamic navigation based on user role
- Logout functionality
- Current user display
- Mobile hamburger menu

### AnnotationInterface.tsx

**Purpose**: Core annotation interface for text highlighting and quality assessment.

**Props**:
```typescript
interface AnnotationProps {
  sentence?: Sentence;
  onComplete?: () => void;
}
```

**Features**:
- Interactive text highlighting
- Error type classification
- Quality score inputs (1-5 scale)
- Comment system
- Voice recording integration
- Progress tracking

**Key Functions**:
- `handleTextSelection()` - Processes text selection for highlighting
- `handleErrorClassification()` - Manages error type selection
- `handleQualityScoring()` - Manages quality score inputs
- `handleSubmission()` - Submits annotation data

**Error Types**:
- `MI_ST` - Minor Inaccuracy - Syntax/Terminology
- `MI_SE` - Minor Inaccuracy - Semantics
- `MA_ST` - Major Inaccuracy - Syntax/Terminology
- `MA_SE` - Major Inaccuracy - Semantics

### EvaluationInterface.tsx

**Purpose**: Interface for evaluators to assess annotation quality.

**Props**:
```typescript
interface EvaluationProps {
  annotation: Annotation;
  onComplete?: () => void;
}
```

**Features**:
- Annotation quality assessment
- Accuracy scoring
- Completeness evaluation
- Feedback system
- Time tracking

**Evaluation Criteria**:
- **Annotation Quality**: Overall quality of the annotation
- **Accuracy**: Correctness of error identification
- **Completeness**: Thoroughness of annotation
- **Overall Score**: Combined evaluation score

### MTQualityInterface.tsx

**Purpose**: Machine Translation quality assessment with AI assistance.

**Props**:
```typescript
interface MTQualityProps {
  sentence: Sentence;
  onComplete?: () => void;
}
```

**Features**:
- AI-powered quality scoring
- Syntax error detection
- Semantic error analysis
- Human feedback integration
- Confidence scoring

**AI Features**:
- DistilBERT-based quality assessment
- Automatic error detection
- Quality explanations
- Correction suggestions

### AdminDashboard.tsx

**Purpose**: Administrative interface for system management.

**Props**: None (uses authentication context)

**Features**:
- User management
- System statistics
- Content management
- Quality metrics
- Bulk operations

**Admin Functions**:
- User role management
- Sentence bulk upload
- Annotation monitoring
- System health metrics

### EvaluatorDashboard.tsx

**Purpose**: Dashboard for evaluators to manage their evaluation tasks.

**Props**: None (uses authentication context)

**Features**:
- Pending evaluations list
- Evaluation statistics
- MT quality assessments
- Progress tracking

**Evaluator Functions**:
- Annotation evaluation queue
- MT quality assessment queue
- Performance metrics
- Evaluation history

### UserDashboard.tsx

**Purpose**: Main dashboard for annotators showing their progress and tasks.

**Props**: None (uses authentication context)

**Features**:
- Annotation progress
- Next annotation button
- Statistics display
- Recent activity

**User Functions**:
- Quick annotation access
- Progress visualization
- Achievement tracking
- Language preferences

## Authentication Components

### Login.tsx

**Purpose**: User authentication form.

**Props**: None

**Features**:
- Email/password login
- Form validation
- Error handling
- Remember me option
- Registration link

**Form Fields**:
- Email (required, email validation)
- Password (required, minimum length)

### Register.tsx

**Purpose**: User registration form.

**Props**: None

**Features**:
- Multi-step registration
- Language preference selection
- Role selection (evaluator option)
- Form validation
- Terms acceptance

**Form Fields**:
- Email (unique, required)
- Username (unique, required)
- Password (strength requirements)
- First Name & Last Name
- Language preferences
- Evaluator role option

### Profile.tsx

**Purpose**: User profile management.

**Props**: None (uses authentication context)

**Features**:
- Profile editing
- Language preferences
- Password change
- Account settings

## Specialized Components

### VoiceRecorder.tsx

**Purpose**: Voice recording component for annotation corrections.

**Props**:
```typescript
interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number;
}
```

**Features**:
- Browser-based audio recording
- Recording controls (start, stop, pause)
- Playback functionality
- Duration limits
- Audio quality settings

**Browser Support**:
- Chrome, Firefox, Safari
- Requires HTTPS for production
- MediaRecorder API

### GuidelinesModal.tsx

**Purpose**: Modal displaying annotation guidelines.

**Props**:
```typescript
interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
}
```

**Features**:
- Comprehensive guidelines display
- Acknowledgment tracking
- Scrollable content
- Responsive design

### OnboardingTest.tsx

**Purpose**: Onboarding test interface for new users.

**Props**:
```typescript
interface OnboardingTestProps {
  language: string;
  onComplete: (score: number) => void;
}
```

**Features**:
- Interactive test questions
- Score calculation
- Progress tracking
- Results display

## Data Display Components

### MyAnnotations.tsx

**Purpose**: Display user's annotation history.

**Props**: None (uses authentication context)

**Features**:
- Annotation list with pagination
- Status filtering
- Search functionality
- Sorting options
- Edit/delete actions

### MyEvaluations.tsx

**Purpose**: Display user's evaluation history.

**Props**: None (uses authentication context)

**Features**:
- Evaluation list with pagination
- Status filtering
- Performance metrics
- Feedback display

### About.tsx

**Purpose**: About page with project information.

**Props**: None

**Features**:
- Project description
- Team information
- Academic context
- Contact details

## State Management

### AuthContext.tsx

**Purpose**: Authentication state management.

**Context Value**:
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}
```

**Features**:
- JWT token management
- Automatic token refresh
- User profile state
- Login/logout functions
- Loading states

## Component Patterns

### Hooks Usage

**Common Hooks**:
- `useState` - Local component state
- `useEffect` - Side effects and API calls
- `useContext` - Authentication context
- `useNavigate` - Programmatic navigation
- `useLocation` - Current route information

**Custom Hooks** (Implicit):
- Authentication state management
- API call handling
- Form validation
- Error handling

### Error Handling

**Error Boundary Pattern**:
```tsx
try {
  // API call or operation
} catch (error) {
  console.error('Operation failed:', error);
  // User-friendly error message
}
```

**Common Error Types**:
- Network errors
- Authentication errors
- Validation errors
- Server errors

### Loading States

**Loading Pattern**:
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    // Async operation
  } finally {
    setIsLoading(false);
  }
};
```

## Styling and Design

### TailwindCSS Classes

**Common Patterns**:
- `container mx-auto` - Centered containers
- `grid grid-cols-*` - Grid layouts
- `flex items-center justify-between` - Flexbox layouts
- `bg-white shadow-lg rounded-lg` - Card designs
- `text-sm text-gray-600` - Typography

**Responsive Design**:
- Mobile-first approach
- `sm:`, `md:`, `lg:` breakpoints
- Responsive grid layouts
- Mobile navigation patterns

### Component Styling

**Button Variants**:
- Primary: `bg-blue-500 hover:bg-blue-600`
- Secondary: `bg-gray-500 hover:bg-gray-600`
- Danger: `bg-red-500 hover:bg-red-600`
- Success: `bg-green-500 hover:bg-green-600`

**Form Styling**:
- Input fields: `border border-gray-300 rounded-md`
- Labels: `block text-sm font-medium text-gray-700`
- Error states: `border-red-500 text-red-500`

## API Integration

### API Service Pattern

**Service Layer**:
```typescript
// services/api.ts
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**API Calls in Components**:
```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await api.get('/endpoint');
      setData(response.data);
    } catch (error) {
      setError(error.message);
    }
  };
  fetchData();
}, []);
```

## Performance Optimization

### Optimization Techniques

**Memoization**:
```tsx
const MemoizedComponent = React.memo(({ data }) => {
  // Component implementation
});
```

**Lazy Loading**:
```tsx
const LazyComponent = React.lazy(() => import('./Component'));
```

**Code Splitting**:
- Route-based splitting
- Component-based splitting
- Dynamic imports

### Bundle Optimization

- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Gzip Compression**: Server-side compression
- **CDN**: Static asset delivery

## Testing Strategy

### Component Testing

**Testing Patterns**:
- Unit tests for individual components
- Integration tests for component interactions
- E2E tests for user workflows

**Test Tools**:
- Jest for unit testing
- React Testing Library for component testing
- Cypress for E2E testing

### Test Examples

**Component Test**:
```tsx
import { render, screen } from '@testing-library/react';
import { Login } from './Login';

test('renders login form', () => {
  render(<Login />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});
```

## Accessibility

### ARIA Support

**ARIA Attributes**:
- `aria-label` for screen readers
- `aria-describedby` for help text
- `role` attributes for semantic meaning
- `tabindex` for keyboard navigation

### Keyboard Navigation

**Keyboard Support**:
- Tab navigation
- Enter/Space activation
- Escape key handling
- Arrow key navigation

### Screen Reader Support

**Screen Reader Features**:
- Semantic HTML elements
- Proper heading hierarchy
- Form labels and descriptions
- Status announcements

## Deployment

### Build Process

**Production Build**:
```bash
npm run build
```

**Build Optimization**:
- Code minification
- Asset optimization
- Bundle splitting
- Source maps

### Environment Configuration

**Environment Variables**:
- `VITE_API_URL` - API base URL
- `VITE_APP_NAME` - Application name
- `VITE_VERSION` - Application version

## Future Enhancements

### Planned Features

1. **Real-time Collaboration**: Live annotation sharing
2. **Advanced Analytics**: Detailed performance metrics
3. **Mobile App**: React Native application
4. **Offline Support**: Progressive Web App features
5. **Advanced UI**: Enhanced user interface components

### Performance Improvements

1. **Virtual Scrolling**: Large dataset handling
2. **Caching**: Intelligent data caching
3. **Lazy Loading**: Progressive content loading
4. **Service Workers**: Background processing

---

**Last Updated**: January 2024
**React Version**: 18.x
**TypeScript Version**: 5.x
**TailwindCSS Version**: 3.x 