# Components Structure

This directory contains all React components organized by category for better maintainability and discoverability.

## Folder Structure

```
components/
├── layout/          # Layout and navigation components
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── AnimatedBackground.tsx
│   └── index.ts
├── auth/            # Authentication components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   └── index.ts
├── pages/           # Page components
│   ├── Landing.tsx
│   ├── AboutLanding.tsx
│   ├── Features.tsx
│   ├── Process.tsx
│   ├── Contact.tsx
│   ├── About.tsx
│   ├── AdminDashboard.tsx
│   ├── UserDashboard.tsx
│   ├── EvaluatorDashboard.tsx
│   ├── AnnotationInterface.tsx
│   ├── EvaluationInterface.tsx
│   ├── OnboardingTest.tsx
│   ├── MyAnnotations.tsx
│   ├── MyEvaluations.tsx
│   ├── Profile.tsx
│   └── index.ts
├── modals/          # Modal components
│   ├── Modal.tsx
│   ├── GuidelinesModal.tsx
│   ├── QuizSuccessModal.tsx
│   ├── QuizFailureModal.tsx
│   └── index.ts
├── ui/              # Reusable UI components
│   ├── Logo.tsx
│   ├── VoiceRecorder.tsx
│   ├── SEO.tsx
│   └── index.ts
├── forms/           # Form components (future use)
└── index.ts         # Main export file
```

## Import Examples

### Before (flat structure)
```typescript
import Layout from './components/Layout';
import Login from './components/Login';
import Navbar from './components/Navbar';
```

### After (organized structure)
```typescript
// Option 1: Direct imports
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Navbar from './components/layout/Navbar';

// Option 2: Using index files
import { Layout, Navbar } from './components/layout';
import { Login } from './components/auth';
import { Landing, AboutLanding } from './components/pages';
```

## Benefits

1. **Better Organization**: Components are grouped by functionality
2. **Easier Navigation**: Clear folder structure makes it easy to find components
3. **Scalability**: Easy to add new components in appropriate folders
4. **Maintainability**: Related components are kept together
5. **Clean Imports**: Index files provide clean import paths

## Guidelines

- **Layout components**: Navigation, headers, footers, and overall page structure
- **Auth components**: Login, registration, password management
- **Page components**: Full page components and major interfaces
- **Modal components**: Popup dialogs and overlays
- **UI components**: Reusable small components like buttons, logos, etc.
- **Forms components**: Form-specific components (reserved for future use)

## Adding New Components

1. Determine the appropriate category folder
2. Create the component file
3. Update the corresponding `index.ts` file
4. Update any import statements in files that use the component 