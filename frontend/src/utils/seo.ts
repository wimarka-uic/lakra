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
  '/about': {
    title: 'About Lakra - Smart Annotation Tool for WiMarka',
    description: 'Learn about Lakra, the smart annotation tool designed for the WiMarka project to enhance translation quality assessment and linguistic research.',
    keywords: 'about lakra, WiMarka project, annotation tool, research tool, translation quality'
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
  '/dashboard': {
    title: 'Dashboard - Lakra Annotation Tool',
    description: 'Your personal dashboard for managing annotations and evaluations in the Lakra platform.',
    keywords: 'dashboard, annotations, evaluations, user interface',
    noIndex: true
  },
  '/admin': {
    title: 'Admin Dashboard - Lakra',
    description: 'Administrative interface for managing the Lakra annotation platform.',
    keywords: 'admin, management, platform administration',
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
