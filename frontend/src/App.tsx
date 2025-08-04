import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';

import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AnnotationInterface from './components/AnnotationInterface';
import MyAnnotations from './components/MyAnnotations';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Profile from './components/Profile';
import About from './components/About';
import GuidelinesModal from './components/GuidelinesModal';
import EvaluatorDashboard from './components/EvaluatorDashboard';
import EvaluationInterface from './components/EvaluationInterface';
import MyEvaluations from './components/MyEvaluations';
import MTQualityInterface from './components/MTQualityInterface';
import OnboardingTest from './components/OnboardingTest';
import { PWABanner } from './components/PWABanner';

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.is_admin) {
    return <Navigate to="/admin" replace />;
  }

  if (user?.is_evaluator) {
    return <Navigate to="/evaluator" replace />;
  }

  return <Navigate to="/dashboard" replace />;
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
    return <Navigate to="/login" replace />;
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
      <Layout onShowGuidelines={handleShowGuidelines}>
        <Routes>
          {/* Public Routes */}
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
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
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
                <MyEvaluations />
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
        
        {/* PWA Banner */}
        <PWABanner />
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
