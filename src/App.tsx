import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import { useSEO } from './hooks/useSEO';


import Layout from './components/layout/Layout';
import Landing from './components/pages/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AnnotationInterface from './components/pages/AnnotationInterface';
import MyAnnotations from './components/pages/MyAnnotations';
import AdminDashboard from './components/pages/AdminDashboard';
import UserDashboard from './components/pages/UserDashboard';
import Profile from './components/pages/Profile';

import AboutLanding from './components/pages/AboutLanding';
import Features from './components/pages/Features';
import Process from './components/pages/Process';
import Contact from './components/pages/Contact';
import BugReport from './components/pages/BugReport';
import GuidelinesModal from './components/modals/GuidelinesModal';
import EvaluatorDashboard from './components/pages/EvaluatorDashboard';
import EvaluationInterface from './components/pages/EvaluationInterface';
import MyEvaluations from './components/pages/MyEvaluations';
import AnnotationRevisionInterface from './components/pages/AnnotationRevisionInterface';
import AnnotationReviewInterface from './components/pages/AnnotationReviewInterface';
import MyMTAssessments from './components/pages/MyMTAssessments';
import MTQualityInterface from './components/pages/MTQualityInterface';
import OnboardingTest from './components/pages/OnboardingTest';
import About from './components/pages/About';
import { Analytics } from '@vercel/analytics/react';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  adminOnly?: boolean; 
  userOnly?: boolean;
  evaluatorOnly?: boolean;
}> = ({ 
  children, 
  adminOnly = false,
  userOnly = false,
  evaluatorOnly = false
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only routes: redirect non-admins to appropriate dashboard
  if (adminOnly && !user?.is_admin) {
    if (user?.is_evaluator) {
      return <Navigate to="/evaluator" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // User-only routes: redirect admins and evaluators to their dashboards
  if (userOnly && (user?.is_admin || user?.is_evaluator)) {
    if (user?.is_admin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/evaluator" replace />;
  }

  // Evaluator-only routes: redirect non-evaluators to appropriate dashboard
  if (evaluatorOnly && !user?.is_evaluator) {
    if (user?.is_admin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Smart redirect component
const SmartRedirect: React.FC = () => {
  return <Navigate to="/landing" replace />;
};

// Landing page redirect component for authenticated users
const LandingRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    if (user.is_admin) {
      return <Navigate to="/admin" replace />;
    }
    if (user.is_evaluator) {
      return <Navigate to="/evaluator" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the landing page
  return <Landing />;
};

// 404 Not Found component
const NotFound: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => window.history.back()}
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

// Public Route Component (redirects to appropriate dashboard if already authenticated)
// This is used for login/register pages, not the landing page
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.is_admin) {
      return <Navigate to="/admin" replace />;
    }
    if (user?.is_evaluator) {
      return <Navigate to="/evaluator" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Accessible Route Component (allows both authenticated and unauthenticated users)
// This is used for about, features, process, contact pages
const AccessibleRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// About page component that shows different content based on authentication
const AboutPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // If authenticated, show the About component (for logged-in users)
  // If not authenticated, show the AboutLanding component (for landing page users)
  return isAuthenticated ? <About /> : <AboutLanding />;
};


// SEO Manager Component
const SEOManager: React.FC = () => {
  useSEO(); // This will automatically update based on current pathname
  return null;
};
  
  
const AppContent: React.FC = () => {
  const { user, isAuthenticated, markGuidelinesSeen } = useAuth();
  const [showGuidelines, setShowGuidelines] = useState(false);

  useEffect(() => {
    // Show guidelines modal for authenticated users who haven't seen them
    if (isAuthenticated && user && !user.guidelines_seen) {
      setShowGuidelines(true);
    }
  }, [isAuthenticated, user]);

  const handleGuidelinesAccept = async () => {
    try {
      await markGuidelinesSeen();
      setShowGuidelines(false);
    } catch (error) {
      console.error('Error accepting guidelines:', error);
      // Still close the modal even if the API call fails
      setShowGuidelines(false);
    }
  };

  const handleGuidelinesClose = () => {
    setShowGuidelines(false);
  };

  const handleShowGuidelines = () => {
    setShowGuidelines(true);
  };

  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <SEOManager />
      <Layout onShowGuidelines={handleShowGuidelines}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/landing" 
            element={<LandingRedirect />}
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />

          {/* Onboarding Test Route */}
          <Route 
            path="/onboarding-test" 
            element={
              <ProtectedRoute userOnly>
                <OnboardingTest />
              </ProtectedRoute>
            } 
          />
          
          {/* User Only Routes - Annotation Features */}
          <Route 
            path="/annotate" 
            element={
              <ProtectedRoute userOnly>
                <AnnotationInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/annotate/:sentenceId" 
            element={
              <ProtectedRoute userOnly>
                <AnnotationInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-annotations" 
            element={
              <ProtectedRoute userOnly>
                <MyAnnotations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute userOnly>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/about" 
            element={
              <AccessibleRoute>
                <AboutPage />
              </AccessibleRoute>
            } 
          />
          
          <Route 
            path="/features" 
            element={
              <AccessibleRoute>
                <Features />
              </AccessibleRoute>
            } 
          />
          
          <Route 
            path="/process" 
            element={
              <AccessibleRoute>
                <Process />
              </AccessibleRoute>
            } 
          />
          
          <Route 
            path="/contact" 
            element={
              <AccessibleRoute>
                <Contact />
              </AccessibleRoute>
            } 
          />
          
          <Route 
            path="/bug-report" 
            element={
              <AccessibleRoute>
                <BugReport />
              </AccessibleRoute>
            } 
          />
          
          {/* Evaluator Only Routes */}
          <Route 
            path="/evaluator" 
            element={
              <ProtectedRoute evaluatorOnly>
                <EvaluatorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/evaluate/:annotationId" 
            element={
              <ProtectedRoute evaluatorOnly>
                <EvaluationInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-evaluations" 
            element={
              <ProtectedRoute evaluatorOnly>
                <MyEvaluations />
              </ProtectedRoute>
            } 
          />
          
          {/* MT Quality Assessment Routes */}
          <Route 
            path="/mt-assess" 
            element={
              <ProtectedRoute evaluatorOnly>
                <MTQualityInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mt-assess/:sentenceId" 
            element={
              <ProtectedRoute evaluatorOnly>
                <MTQualityInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-assessments" 
            element={
              <ProtectedRoute evaluatorOnly>
                <MyMTAssessments />
              </ProtectedRoute>
            } 
          />
          
          {/* Annotation Review Routes */}
          <Route 
            path="/review-annotation/:annotationId" 
            element={
              <ProtectedRoute evaluatorOnly>
                <AnnotationReviewInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/revise-annotation/:annotationId" 
            element={
              <ProtectedRoute evaluatorOnly>
                <AnnotationRevisionInterface />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Only Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirects */}
          <Route path="/" element={<SmartRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Guidelines Modal */}
        <GuidelinesModal
          isOpen={showGuidelines}
          onClose={handleGuidelinesClose}
          onAccept={handleGuidelinesAccept}
        />
        
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Analytics />
      <AppContent />
    </AuthProvider>
  );
};

export default App;
