/**
 * SEO utilities for Lakra - Smart Annotation Tool for WiMarka
 * Provides domain-agnostic SEO configuration
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  image?: string;
  type?: string;
  noIndex?: boolean;
}

export const defaultSEO: SEOConfig = {
  title: 'Lakra - Smart Annotation Tool for WiMarka',
  description: 'Smart annotation tool for WiMarka project with AI-powered evaluation, error detection, and comprehensive quality analysis capabilities.',
  keywords: 'annotation tool, WiMarka, smart annotation, AI evaluation, translation quality, error detection, linguistic annotation, research tool',
  image: '/seo-image.jpg',
  type: 'website',
  noIndex: true // Keep noindex until production ready
};

export const pageSEOConfigs: Record<string, Partial<SEOConfig>> = {
  '/': {
    title: 'Lakra - Smart Annotation Tool for WiMarka',
    description: 'Smart annotation tool for WiMarka project with AI-powered evaluation, error detection, and comprehensive quality analysis capabilities.',
    keywords: 'annotation tool, WiMarka, smart annotation, AI evaluation, translation quality, error detection'
  },
  '/landing': {
    title: 'Lakra - Smart Annotation Tool for WiMarka',
    description: 'Smart annotation tool for WiMarka project with AI-powered evaluation, error detection, and comprehensive quality analysis capabilities.',
    keywords: 'annotation tool, WiMarka, smart annotation, AI evaluation, translation quality, error detection'
  },
  '/about': {
    title: 'About Lakra - Smart Annotation Tool for WiMarka',
    description: 'Learn about Lakra, the smart annotation tool designed for the WiMarka project to enhance translation quality assessment and linguistic research.',
    keywords: 'about lakra, WiMarka project, annotation tool, research tool, translation quality'
  },
  '/features': {
    title: 'Features - Lakra Annotation Tool',
    description: 'Discover the powerful features of Lakra including AI-powered evaluation, error detection, and comprehensive annotation capabilities.',
    keywords: 'features, annotation tool, AI evaluation, error detection, translation quality'
  },
  '/process': {
    title: 'How It Works - Lakra Annotation Tool',
    description: 'Learn how Lakra streamlines the annotation process for translation quality assessment and linguistic research.',
    keywords: 'process, workflow, annotation tool, translation quality, research'
  },
  '/contact': {
    title: 'Contact - Lakra Annotation Tool',
    description: 'Get in touch with the Lakra team for support, questions, or collaboration opportunities.',
    keywords: 'contact, support, help, collaboration, WiMarka project'
  },
  '/login': {
    title: 'Login - Lakra Annotation Tool',
    description: 'Access your Lakra account to start annotating and evaluating translation quality for the WiMarka project.',
    keywords: 'login, access, annotation tool, WiMarka',
    noIndex: true
  },
  '/register': {
    title: 'Register - Lakra Annotation Tool',
    description: 'Create your Lakra account to join the WiMarka project and contribute to translation quality research.',
    keywords: 'register, signup, annotation tool, WiMarka',
    noIndex: true
  },
  '/forgot-password': {
    title: 'Forgot Password - Lakra',
    description: 'Reset your Lakra account password to regain access to the annotation platform.',
    keywords: 'forgot password, reset password, account recovery',
    noIndex: true
  },
  '/reset-password': {
    title: 'Reset Password - Lakra',
    description: 'Set a new password for your Lakra account.',
    keywords: 'reset password, new password, account security',
    noIndex: true
  },
  '/onboarding-test': {
    title: 'Proficiency Test - Lakra',
    description: 'Complete your language proficiency test to start annotating with Lakra.',
    keywords: 'proficiency test, language test, onboarding, qualification',
    noIndex: true
  },
  '/dashboard': {
    title: 'Dashboard - Lakra Annotation Tool',
    description: 'Your personal dashboard for managing annotations and evaluations in the Lakra platform.',
    keywords: 'dashboard, annotations, evaluations, user interface',
    noIndex: true
  },
  '/annotate': {
    title: 'Annotate - Lakra Annotation Tool',
    description: 'Start annotating translation quality with Lakra\'s intelligent annotation interface.',
    keywords: 'annotate, annotation interface, translation quality, linguistic annotation',
    noIndex: true
  },
  '/my-annotations': {
    title: 'My Annotations - Lakra',
    description: 'View and manage your completed annotations in the Lakra platform.',
    keywords: 'my annotations, annotation history, completed work',
    noIndex: true
  },
  '/evaluator': {
    title: 'Evaluator Dashboard - Lakra',
    description: 'Evaluator dashboard for reviewing and assessing annotations in the Lakra platform.',
    keywords: 'evaluator, evaluation dashboard, quality assessment',
    noIndex: true
  },
  '/evaluate': {
    title: 'Evaluate - Lakra Annotation Tool',
    description: 'Evaluate and review annotations for quality assurance in the Lakra platform.',
    keywords: 'evaluate, evaluation interface, quality review, assessment',
    noIndex: true
  },
  '/my-evaluations': {
    title: 'My Evaluations - Lakra',
    description: 'View and manage your completed evaluations in the Lakra platform.',
    keywords: 'my evaluations, evaluation history, completed assessments',
    noIndex: true
  },
  '/mt-assess': {
    title: 'MT Quality Assessment - Lakra',
    description: 'Assess machine translation quality using Lakra\'s comprehensive evaluation tools.',
    keywords: 'MT assessment, machine translation quality, evaluation tools',
    noIndex: true
  },
  '/my-assessments': {
    title: 'My Assessments - Lakra',
    description: 'View and manage your completed MT quality assessments in the Lakra platform.',
    keywords: 'my assessments, MT quality, assessment history',
    noIndex: true
  },
  '/admin': {
    title: 'Admin Dashboard - Lakra',
    description: 'Administrative interface for managing the Lakra annotation platform.',
    keywords: 'admin, management, platform administration',
    noIndex: true
  },
  '/profile': {
    title: 'Profile - Lakra',
    description: 'Manage your Lakra account profile and preferences.',
    keywords: 'profile, account settings, user preferences',
    noIndex: true
  }
};

/**
 * Get SEO configuration for a specific page
 */
export const getPageSEO = (pathname: string): SEOConfig => {
  const pageConfig = pageSEOConfigs[pathname] || {};
  return { ...defaultSEO, ...pageConfig };
};

/**
 * Generate structured data for the application
 */
export const generateStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Lakra",
    "description": "Smart annotation tool for WiMarka project with AI-powered evaluation, error detection, and comprehensive quality analysis capabilities",
    "applicationCategory": "Research Tool",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "WiMarka Project"
    },
    "featureList": [
      "Smart Annotation Interface",
      "AI-Powered Evaluation",
      "Error Detection and Classification",
      "Interactive Text Annotation",
      "Voice Recording Support",
      "Multi-Role User Management",
      "Comprehensive Quality Scoring"
    ],
    "screenshot": "/seo-image.jpg",
    "softwareVersion": "1.0.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": ["en", "es", "fil", "ceb"],
    "isAccessibleForFree": true,
    "license": "https://opensource.org/licenses/MIT"
  };
};
