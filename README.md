<div align="center">
  <img src="https://raw.githubusercontent.com/wimarka-uic/lakra/d0abd137499cd39740394f8b5179790e50b3fa56/frontend/public/lakra.svg" alt="Lakra Logo" width="256" height="256">
</div>

A comprehensive annotation and evaluation system for machine translation quality assessment, designed specifically for the WiMarka project. Built with React, TypeScript, TailwindCSS, and Supabase.

## Overview

Lakra is a sophisticated annotation platform that supports multiple annotation workflows for evaluating machine translation quality. The system combines AI-powered assessment with human-in-the-loop evaluation to provide comprehensive quality analysis.

## Features

### Core Annotation Features
- **Text Highlighting**: Interactive text selection and highlighting for error annotation
- **Error Classification**: Categorized error types (MI_ST, MI_SE, MA_ST, MA_SE)
- **Quality Scoring**: Multi-dimensional quality assessment (fluency, adequacy, overall quality)
- **Voice Recording**: Audio annotation support for final corrected forms
- **Real-time Processing**: Immediate feedback and validation

### Quality Assessment
- **AI-Powered Evaluation**: Quality scoring with confidence levels
- **Error Detection & Classification**: Automatic detection of syntax and semantic errors
- **Detailed Explanations**: AI-generated explanations for quality scores and detected errors
- **Improvement Suggestions**: Automated suggestions for translation improvements
- **Human Feedback Integration**: Evaluators can confirm, reject, or modify AI assessments

### User Management & Roles
- **Multi-Role System**: Administrators, Annotators, and Evaluators
- **Flexible Authentication**: Sign in with email or username
- **Language Preferences**: User-specific language settings and preferences
- **Onboarding System**: Comprehensive onboarding tests for quality assurance
- **Progress Tracking**: Individual and system-wide progress monitoring

### For Annotators
- **Interactive Annotation Interface**: Intuitive text highlighting and error marking
- **Quality Assessment**: Rate fluency, adequacy, and overall quality (1-5 scale)
- **Error Documentation**: Detailed error classification and descriptions
- **Voice Integration**: Record audio explanations for corrections
- **Progress Dashboard**: Track annotation history and statistics

### For Evaluators
- **Annotation Evaluation**: Review and score other annotators' work
- **Quality Assessment**: Evaluate machine translation quality with AI assistance
- **Feedback System**: Provide detailed feedback on annotations and assessments
- **Quality Metrics**: Track evaluation accuracy and agreement rates
- **Batch Processing**: Efficient batch assessment capabilities

### For Administrators
- **Admin Dashboard**: Comprehensive system overview and analytics
- **User Management**: Manage users, roles, and permissions
- **Content Management**: Add and manage sentences for annotation
- **Bulk Import**: Import sentences via CSV files for efficient content management
- **Quality Control**: Monitor annotation and evaluation quality
- **System Analytics**: Track completion rates and quality metrics

## Tech Stack

### Backend (Supabase)
- **Supabase**: Complete backend-as-a-service with PostgreSQL database
- **PostgreSQL**: Robust relational database with Row Level Security (RLS)
- **Supabase Auth**: Built-in authentication with JWT tokens
- **Supabase Edge Functions**: Serverless functions for custom logic
- **Real-time Subscriptions**: Live updates for collaborative features

### Frontend
- **React 19**: Modern JavaScript library for building user interfaces
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing and navigation
- **Lucide React**: Beautiful icon library


## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or bun
- Supabase account (free tier available)

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd lakra
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from the project settings
   - Create a `.env` file in the `frontend` directory with:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Set up the database:**
   - Run the SQL migrations in your Supabase SQL editor
   - Set up Row Level Security (RLS) policies
   - Configure authentication settings

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

   The frontend will be available at `http://localhost:5173`

## Database Schema

### Core Tables

**Users Table:**
- User authentication and profile information
- Role-based access control (admin/annotator/evaluator)
- Language preferences and onboarding status
- Activity tracking and evaluation statistics

**Sentences Table:**
- Source text and machine translations
- Language pairs and domain classification
- Active/inactive status management

**Annotations Table:**
- Quality ratings (fluency, adequacy, overall quality)
- Error documentation and suggested corrections
- Voice recording integration
- Time tracking and status management

**TextHighlights Table:**
- Interactive text highlighting for error annotation
- Error type classification (MI_ST, MI_SE, MA_ST, MA_SE)
- Character position tracking for precise error location

**Quality Assessment Table:**
- AI-generated quality scores with confidence levels
- Syntax and semantic error detection
- Human feedback integration
- Processing metadata and time tracking

**Evaluations Table:**
- Annotation quality assessment by evaluators
- Multi-dimensional scoring (accuracy, completeness, overall)
- Feedback and evaluation notes
- Time tracking and status management

**OnboardingTests Table:**
- User onboarding test management
- Test scoring and completion tracking
- Language-specific test data

## API Structure

The application uses Supabase client libraries for all database operations:

### Authentication
- `authAPI.login()` - User login (supports both email and username)
- `authAPI.register()` - User registration
- `authAPI.getCurrentUser()` - Get current user info
- `authAPI.logout()` - User logout

### Sentences
- `sentencesAPI.getSentences()` - List all sentences
- `sentencesAPI.getNextSentence()` - Get next sentence for annotation
- `sentencesAPI.createSentence()` - Create new sentence (admin only)
- `sentencesAPI.importSentencesFromCSV()` - Import sentences from CSV file

### Annotations
- `annotationsAPI.createAnnotation()` - Create new annotation
- `annotationsAPI.getMyAnnotations()` - Get user's annotations
- `annotationsAPI.deleteAnnotation()` - Delete annotation

### Evaluations
- `evaluationsAPI.createEvaluation()` - Create evaluation
- `evaluationsAPI.getMyEvaluations()` - Get user's evaluations
- `evaluationsAPI.getPendingEvaluations()` - Get pending evaluations

### Admin Functions
- `adminAPI.getStats()` - System statistics
- `adminAPI.getAllUsers()` - List all users
- `adminAPI.createUser()` - Create new user
- `adminAPI.updateUser()` - Update user profile
- `adminAPI.deleteUser()` - Delete user

## Usage Guide

### For Annotators

1. **Register/Login**: Create an account or log in with existing credentials
2. **Complete Onboarding**: Take onboarding tests if required
3. **Start Annotation**: Navigate to the annotation interface
4. **Highlight Errors**: Select text and mark errors with appropriate classifications
5. **Rate Quality**: Provide fluency, adequacy, and overall quality scores
6. **Add Comments**: Provide detailed explanations for errors and corrections
7. **Record Voice**: Optionally record audio explanations
8. **Submit Annotation**: Save your work and move to the next sentence

### For Evaluators

1. **Access Evaluation Interface**: Navigate to evaluation dashboard
2. **Review Annotations**: Assess other annotators' work quality
3. **Quality Assessment**: Evaluate machine translation quality with AI assistance
4. **Provide Feedback**: Give detailed feedback on annotations and assessments
5. **Track Progress**: Monitor evaluation statistics and agreement rates

### For Administrators

1. **Access Admin Panel**: Navigate to admin dashboard
2. **Monitor System**: View comprehensive system statistics
3. **Manage Users**: Add users, assign roles, and monitor activity
4. **Manage Content**: Add sentences and monitor annotation progress
5. **Quality Control**: Review annotation and evaluation quality

## Quality Metrics

The system tracks various quality metrics:

- **Annotation Quality**: Fluency, adequacy, and overall quality scores
- **Error Classification**: Detailed error type analysis
- **Evaluation Agreement**: Inter-evaluator agreement rates
- **Quality Assessment**: AI-assisted quality scoring with human validation
- **Processing Time**: Time tracking for efficiency analysis
- **Onboarding Performance**: Test scores and completion rates

## Development

### Adding New Features

1. **Database**: Add new tables and RLS policies in Supabase
2. **Frontend**: Create new components in `src/components/`, add routes to `App.tsx`
3. **API**: Add new functions to the appropriate API module in `src/services/`

### Configuration

- **Supabase URL**: Configure in `frontend/src/utils/supabase.ts`
- **Environment Variables**: Update `.env` file for different environments

## Production Deployment

### Frontend
- Build the production bundle: `npm run build`
- Deploy to Vercel, Netlify, or any static hosting service
- Configure environment variables for production
- Set up custom domain and HTTPS

### Supabase
- Use Supabase's built-in hosting for Edge Functions
- Configure production database settings
- Set up proper RLS policies for security
- Configure authentication providers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the Supabase dashboard for database issues
2. Review browser console for frontend errors
3. Check Supabase logs for backend issues
4. Review the API documentation in `src/services/` 
