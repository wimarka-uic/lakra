<div align="center">
  <img src="https://raw.githubusercontent.com/wimarka-uic/lakra/d0abd137499cd39740394f8b5179790e50b3fa56/frontend/public/lakra.svg" alt="Lakra Logo" width="256" height="256">
</div>

# Lakra

**Lakra** is a comprehensive annotation and evaluation platform designed for machine translation quality assessment. Built for the WiMarka project, it combines AI-powered assessment with human-in-the-loop evaluation to provide detailed, interpretable quality analysis for Philippine Languages.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![React Version](https://img.shields.io/badge/react-19.1.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Documentation](https://img.shields.io/badge/docs-readthedocs-blue.svg)](https://lakra.readthedocs.io/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Core Annotation Features](#core-annotation-features)
  - [Quality Assessment](#quality-assessment)
  - [User Management & Roles](#user-management--roles)
  - [For Annotators](#for-annotators)
  - [For Evaluators](#for-evaluators)
  - [For Administrators](#for-administrators)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
  - [Frontend Setup](#frontend-setup)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Usage Guide](#usage-guide)
- [Quality Metrics](#quality-metrics)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)
- [Contact & Support](#contact--support)

---

## 🔍 Overview

Lakra is a sophisticated annotation platform that supports multiple annotation workflows for evaluating machine translation quality. Designed specifically for the WiMarka project, it enables:

- **Interactive Text Annotation**: Precise error highlighting and classification
- **AI-Assisted Quality Assessment**: Automated scoring with human validation
- **Multi-Role Workflow**: Separate interfaces for annotators, evaluators, and administrators
- **Comprehensive Quality Metrics**: Multi-dimensional assessment across fluency, adequacy, and overall quality
- **Real-time Collaboration**: Live updates and progress tracking
- **Philippine Language Focus**: Specialized support for WiMarka's machine translation evaluation needs

---

## ✨ Features

### Core Annotation Features

- **🎯 Interactive Text Highlighting**: Click-and-drag text selection for precise error annotation
- **📝 Error Classification**: Categorized error types:
  - `MI_ST` - Minor Syntactic errors
  - `MI_SE` - Minor Semantic errors
  - `MA_ST` - Major Syntactic errors
  - `MA_SE` - Major Semantic errors
- **⭐ Quality Scoring**: Multi-dimensional quality assessment (1-5 scale)
  - Fluency Score
  - Adequacy Score
  - Overall Quality Score
- **🎤 Voice Recording**: Audio annotation support for final corrected forms
- **⚡ Real-time Processing**: Immediate feedback and validation

### Quality Assessment

- **🤖 AI-Powered Evaluation**: Automated quality scoring with confidence levels
- **🔍 Error Detection & Classification**: Automatic detection of syntax and semantic errors
- **💡 Detailed Explanations**: AI-generated explanations for quality scores and detected errors
- **🔧 Improvement Suggestions**: Automated suggestions for translation improvements
- **👥 Human Feedback Integration**: Evaluators can confirm, reject, or modify AI assessments

### User Management & Roles

- **👤 Multi-Role System**: Three distinct user roles with tailored interfaces
  - **Administrators**: System management and oversight
  - **Annotators**: Translation quality annotation
  - **Evaluators**: Annotation and assessment review
- **🔐 Flexible Authentication**: Sign in with email or username
- **🌐 Language Preferences**: User-specific language settings
- **📚 Onboarding System**: Comprehensive onboarding tests for quality assurance
- **📊 Progress Tracking**: Individual and system-wide progress monitoring

### For Annotators

- **✏️ Interactive Annotation Interface**: Intuitive text highlighting and error marking
- **📊 Quality Assessment**: Rate fluency, adequacy, and overall quality
- **📋 Error Documentation**: Detailed error classification and descriptions
- **🎙️ Voice Integration**: Record audio explanations for corrections
- **📈 Progress Dashboard**: Track annotation history and statistics

### For Evaluators

- **✅ Annotation Evaluation**: Review and score other annotators' work
- **🤝 Quality Assessment**: Evaluate machine translation quality with AI assistance
- **💬 Feedback System**: Provide detailed feedback on annotations and assessments
- **📊 Quality Metrics**: Track evaluation accuracy and agreement rates
- **⚡ Batch Processing**: Efficient batch assessment capabilities

### For Administrators

- **📊 Admin Dashboard**: Comprehensive system overview and analytics
- **👥 User Management**: Manage users, roles, and permissions
- **📝 Content Management**: Add and manage sentences for annotation
- **📂 Bulk Import**: Import sentences via CSV files for efficient content management
- **✅ Quality Control**: Monitor annotation and evaluation quality
- **📈 System Analytics**: Track completion rates and quality metrics

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | Modern UI library |
| **TypeScript** | 5.8.3 | Type-safe development |
| **Vite** | 6.3.5 | Fast build tool and dev server |
| **TailwindCSS** | 3.3.6 | Utility-first CSS framework |
| **React Router** | 6.20.1 | Client-side routing |
| **Lucide React** | 0.295.0 | Beautiful icon library |
| **GSAP** | 3.13.0 | High-performance animations |

### Backend (Supabase)

| Technology | Purpose |
|------------|---------|
| **Supabase** | Complete backend-as-a-service |
| **PostgreSQL** | Robust relational database |
| **Row Level Security (RLS)** | Fine-grained access control |
| **Supabase Auth** | Built-in authentication with JWT |
| **Supabase Edge Functions** | Serverless functions for custom logic |
| **Real-time Subscriptions** | Live updates for collaboration |

---

## 📦 Prerequisites

Before installing Lakra, ensure you have:

- **Node.js** >= 18.0
- **npm**, **yarn**, or **bun** package manager
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))
- **Modern Web Browser** (Chrome, Firefox, Safari, or Edge)

---

## 🚀 Installation

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/wimarka-uic/lakra.git
   cd lakra
   ```

2. **Create a Supabase project:**
   - Visit [supabase.com](https://supabase.com) and create a new project
   - Navigate to **Settings > API** to get your project credentials
   - Copy the **Project URL** and **anon/public key**

3. **Configure environment variables:**
   
   Create a `.env` file in the project root directory:
   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Example `.env` file:**
   ```
   VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Database Setup

1. **Open your Supabase SQL Editor:**
   - Navigate to **SQL Editor** in your Supabase dashboard

2. **Run the database migrations:**
   - Execute the SQL migration scripts to create the necessary tables
   - Set up Row Level Security (RLS) policies
   - Configure database functions and triggers

3. **Configure authentication:**
   - Navigate to **Authentication > Settings**
   - Enable Email authentication
   - Configure any additional authentication providers as needed

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

   The application will be available at `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   # or
   yarn build
   # or
   bun build
   ```

---

## 📚 Documentation

For comprehensive documentation, visit **[Lakra Documentation on ReadtheDocs](https://lakra.readthedocs.io/)**.

The documentation includes:

- **User Manual**: Installation, usage guides, role-specific tutorials, and FAQs
- **Technical Manual**: Architecture, database schema, API reference, and development guides

### Quick Links

- 📖 [Getting Started](https://lakra.readthedocs.io/en/latest/user-manual/getting-started.html)
- 📝 [Annotator Guide](https://lakra.readthedocs.io/en/latest/user-manual/annotator-guide.html)
- ✅ [Evaluator Guide](https://lakra.readthedocs.io/en/latest/user-manual/evaluator-guide.html)
- 👨‍💼 [Administrator Guide](https://lakra.readthedocs.io/en/latest/user-manual/admin-guide.html)
- 🏗️ [Architecture](https://lakra.readthedocs.io/en/latest/technical-manual/architecture.html)
- 🔧 [API Reference](https://lakra.readthedocs.io/en/latest/technical-manual/api-reference.html)
- 💾 [Database Schema](https://lakra.readthedocs.io/en/latest/technical-manual/database-schema.html)

---

## 📁 Project Structure

```
lakra/
├── src/                        # Source code directory
│   ├── components/             # React components
│   │   ├── admin/              # Admin-specific components
│   │   ├── annotator/          # Annotator interface components
│   │   ├── evaluator/          # Evaluator interface components
│   │   ├── auth/               # Authentication components
│   │   └── common/             # Shared/common components
│   ├── services/               # API service modules
│   │   ├── auth.ts             # Authentication API
│   │   ├── sentences.ts        # Sentences management API
│   │   ├── annotations.ts      # Annotations API
│   │   ├── evaluations.ts      # Evaluations API
│   │   └── admin.ts            # Admin functions API
│   ├── utils/                  # Utility functions
│   │   ├── supabase.ts         # Supabase client configuration
│   │   └── helpers.ts          # Helper functions
│   ├── types/                  # TypeScript type definitions
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # React contexts
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Application entry point
├── public/                     # Static assets
│   ├── lakra.svg               # Lakra logo
│   └── favicon.ico             # Favicon
├── docs/                       # Documentation files
│   ├── conf.py                 # Sphinx configuration
│   ├── index.rst               # Documentation index
│   ├── user-manual/            # User manual documentation
│   └── technical-manual/       # Technical documentation
├── index.html                  # HTML entry point
├── package.json                # Node.js dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # TailwindCSS configuration
├── .env.example                # Environment variable template
├── .readthedocs.yaml           # ReadtheDocs configuration
├── LICENSE                     # GPL-3.0 License
└── README.md                   # This file
```

---

## 💾 Database Schema

### Core Tables

#### **users**
User authentication and profile information:
- User credentials and authentication data
- Role-based access control (admin/annotator/evaluator)
- Language preferences and settings
- Onboarding status tracking
- Activity metrics and evaluation statistics

#### **sentences**
Source text and machine translations:
- Source language text
- Target language machine translations
- Language pair information
- Domain classification
- Active/inactive status management

#### **annotations**
User-submitted annotations:
- Quality ratings (fluency, adequacy, overall quality)
- Error documentation and descriptions
- Suggested corrections
- Voice recording integration
- Time tracking and status management
- User association

#### **text_highlights**
Interactive text highlighting for error annotation:
- Associated annotation reference
- Error type classification (MI_ST, MI_SE, MA_ST, MA_SE)
- Character position tracking (start/end indices)
- Highlighted text content
- Error descriptions

#### **quality_assessments**
AI-generated quality assessments:
- Quality scores with confidence levels
- Syntax and semantic error detection
- Detailed explanations for scores
- Human feedback integration (confirm/reject/modify)
- Processing metadata and timestamps

#### **evaluations**
Annotation quality assessment by evaluators:
- Associated annotation reference
- Multi-dimensional scoring (accuracy, completeness, overall)
- Detailed feedback and evaluation notes
- Time tracking and status management
- Evaluator association

#### **onboarding_tests**
User onboarding test management:
- User association
- Test scoring and completion tracking
- Language-specific test data
- Pass/fail status

---

## 🔌 API Reference

The application uses Supabase client libraries for all database operations.

### Authentication

```typescript
// User login (supports both email and username)
authAPI.login({ email: string, password: string })
authAPI.login({ username: string, password: string })

// User registration
authAPI.register({ email, password, username, role, language })

// Get current user info
authAPI.getCurrentUser()

// User logout
authAPI.logout()
```

### Sentences

```typescript
// List all sentences
sentencesAPI.getSentences(filters?: object)

// Get next sentence for annotation
sentencesAPI.getNextSentence(userId: string, language: string)

// Create new sentence (admin only)
sentencesAPI.createSentence(sentenceData: object)

// Import sentences from CSV file
sentencesAPI.importSentencesFromCSV(file: File)
```

### Annotations

```typescript
// Create new annotation
annotationsAPI.createAnnotation(annotationData: object)

// Get user's annotations
annotationsAPI.getMyAnnotations(userId: string)

// Update annotation
annotationsAPI.updateAnnotation(id: string, updates: object)

// Delete annotation
annotationsAPI.deleteAnnotation(id: string)
```

### Evaluations

```typescript
// Create evaluation
evaluationsAPI.createEvaluation(evaluationData: object)

// Get user's evaluations
evaluationsAPI.getMyEvaluations(userId: string)

// Get pending evaluations
evaluationsAPI.getPendingEvaluations(userId: string)
```

### Admin Functions

```typescript
// System statistics
adminAPI.getStats()

// User management
adminAPI.getAllUsers()
adminAPI.createUser(userData: object)
adminAPI.updateUser(id: string, updates: object)
adminAPI.deleteUser(id: string)

// Content management
adminAPI.getSentencesStats()
adminAPI.bulkImportSentences(csvData: string)
```

---

## 💻 Usage Guide

### For Annotators

1. **Register/Login**: Create an account or log in with existing credentials
2. **Complete Onboarding**: Take onboarding tests if required
3. **Start Annotation**: Navigate to the annotation interface
4. **Highlight Errors**: 
   - Select text by clicking and dragging
   - Choose error type (MI_ST, MI_SE, MA_ST, MA_SE)
   - Add error descriptions
5. **Rate Quality**: Provide scores (1-5) for:
   - Fluency
   - Adequacy
   - Overall Quality
6. **Add Comments**: Provide detailed explanations for errors and corrections
7. **Record Voice** *(Optional)*: Record audio explanations
8. **Submit Annotation**: Save your work and move to the next sentence

### For Evaluators

1. **Access Evaluation Interface**: Navigate to evaluation dashboard
2. **Review Annotations**: Assess the quality of other annotators' work
3. **Quality Assessment**: 
   - Review AI-generated quality scores
   - Confirm, reject, or modify AI assessments
4. **Provide Feedback**: Give detailed feedback on:
   - Annotation accuracy
   - Completeness
   - Overall quality
5. **Track Progress**: Monitor evaluation statistics and agreement rates

### For Administrators

1. **Access Admin Panel**: Navigate to admin dashboard
2. **Monitor System**: View comprehensive statistics:
   - Total users, sentences, annotations
   - Completion rates
   - Quality metrics
3. **Manage Users**: 
   - Add new users
   - Assign/modify roles
   - Monitor user activity
4. **Manage Content**: 
   - Add individual sentences
   - Bulk import via CSV
   - Monitor annotation progress
5. **Quality Control**: Review annotation and evaluation quality metrics

---

## 📊 Quality Metrics

The system tracks various quality metrics to ensure high-quality annotations:

| Metric | Description | Range |
|--------|-------------|-------|
| **Fluency Score** | How natural the translation reads | 1-5 |
| **Adequacy Score** | Semantic completeness and accuracy | 1-5 |
| **Overall Quality** | Comprehensive translation quality | 1-5 |
| **Error Classification** | Detailed error type analysis | MI_ST, MI_SE, MA_ST, MA_SE |
| **Evaluation Agreement** | Inter-evaluator agreement rates | % |
| **AI Confidence** | AI assessment confidence levels | 0-100% |
| **Processing Time** | Time tracking for efficiency | seconds |

---

## 🛠️ Development

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/wimarka-uic/lakra.git
cd lakra

# Install dependencies
npm install
# or
yarn install
# or
bun install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Adding New Features

1. **Database Changes**: 
   - Add new tables/columns in Supabase SQL Editor
   - Configure Row Level Security (RLS) policies
   - Update TypeScript types in `src/types/`

2. **Frontend Components**: 
   - Create new components in `src/components/`
   - Follow existing component structure
   - Use TypeScript for type safety

3. **API Integration**: 
   - Add new functions to appropriate API module in `src/services/`
   - Use Supabase client for database operations
   - Handle errors and edge cases

4. **Routing**: 
   - Add new routes in `App.tsx`
   - Use React Router for navigation

### Code Style

- **TypeScript**: Use strict type checking
- **ESLint**: Follow configured linting rules
- **Components**: Functional components with hooks
- **Styling**: TailwindCSS utility classes

### Running Linter

```bash
npm run lint
# or
yarn lint
# or
bun lint
```

---

## 🚀 Production Deployment

### Frontend Deployment

The application is configured for deployment on Vercel:

1. **Build the production bundle:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy automatically on push to main branch

3. **Alternative hosting:**
   - The build output is in the `dist/` folder
   - Deploy to any static hosting service (Netlify, Cloudflare Pages, etc.)

### Supabase Configuration

1. **Production Database:**
   - Use Supabase's production tier for better performance
   - Configure proper connection pooling
   - Set up database backups

2. **Security:**
   - Review and tighten RLS policies
   - Use environment-specific API keys
   - Enable HTTPS-only connections

3. **Authentication:**
   - Configure production authentication providers
   - Set up email templates
   - Configure redirect URLs

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Make your changes**
   - Follow the code style guidelines
   - Add tests if applicable
   - Update documentation as needed
4. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Open a Pull Request**

Please ensure your code:
- Follows the existing code style
- Includes appropriate TypeScript types
- Has meaningful commit messages
- Updates documentation for new features

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

```
Copyright 2025 University of the Immaculate Conception - College of Computer Studies
```

---

## 👥 Authors

**University of the Immaculate Conception - College of Computer Studies**

- [College of Computer Studies](https://ccs.uic.edu.ph)
- [University of the Immaculate Conception](https://uic.edu.ph)
- GitHub: [@wimarka-uic](https://github.com/wimarka-uic)

---

## 🙏 Acknowledgments

- **University of the Immaculate Conception - College of Computer Studies**
- **WiMarka Research Team**: 
  - [Al Gabriel Orig](https://github.com/aaalgieee)
  - [Charlese Te](https://github.com/ctrl-siege)
  - [Shaira Montojo](https://github.com/ShowBeez)
  - Adviser: [Assoc. Prof. Kristine Mae Adlaon](https://github.com/kadlaon)
- [**Mindanao Natural Language Processing Research and Development Laboratory**](https://github.com/minna-lproc)
- **All Annotators and Evaluators** who contributed to the platform

---

## 📧 Contact & Support

For questions, issues, or suggestions:

- **Issues**: [GitHub Issues](https://github.com/wimarka-uic/lakra/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wimarka-uic/lakra/discussions)
- **Email**: [ccs@uic.edu.ph](mailto:ccs@uic.edu.ph)
- **Documentation**: [lakra.readthedocs.io](https://lakra.readthedocs.io/)

### Troubleshooting

1. **Database Issues**: Check the Supabase dashboard for errors
2. **Frontend Errors**: Review browser console for error messages
3. **Backend Issues**: Check Supabase logs and Edge Function logs
4. **API Documentation**: Review the API documentation in `src/services/`

---

<div align="center">
  <strong>Made with ❤️ for Philippine Languages</strong>
</div>
