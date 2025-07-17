import { useEffect } from 'react';
import { getPageSEO, type SEOConfig } from '../utils/seo';

/**
 * Hook to manage page-specific SEO
 * Usage:
 * 
 * // Use default SEO for current page
 * useSEO();
 * 
 * // Override specific properties
 * useSEO({
 *   title: 'Custom Page Title',
 *   description: 'Custom description'
 * });
 */
export const useSEO = (overrides?: Partial<SEOConfig>) => {
  useEffect(() => {
    const pathname = window.location.pathname;
    const defaultConfig = getPageSEO(pathname);
    
    // Merge default config with overrides
    const config = { ...defaultConfig, ...overrides };
    
    // Update document title
    document.title = config.title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Update basic meta tags
    updateMetaTag('description', config.description);
    updateMetaTag('keywords', config.keywords);
    
    // Update robots meta tag
    updateMetaTag('robots', config.noIndex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags (no Twitter since we removed it)
    updateMetaTag('og:title', config.title, true);
    updateMetaTag('og:description', config.description, true);
    updateMetaTag('og:image', config.image || '/seo-image.jpg', true);
    updateMetaTag('og:type', config.type || 'website', true);

    // Update canonical URL (use relative path, no domain)
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = pathname;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = pathname;
      document.head.appendChild(canonicalLink);
    }

  }, [overrides]);
};
