import { useEffect } from 'react';
import { getPageSEO, type SEOConfig } from '../../utils/seo';

interface SEOProps extends Partial<SEOConfig> {
  pathname?: string;
}

const SEO: React.FC<SEOProps> = ({
  pathname = window.location.pathname,
  title,
  description,
  keywords,
  image,
  type,
  noIndex
}) => {
  useEffect(() => {
    // Get default SEO config for the current page
    const defaultConfig = getPageSEO(pathname);
    
    // Use provided props or fall back to page defaults
    const finalTitle = title || defaultConfig.title;
    const finalDescription = description || defaultConfig.description;
    const finalKeywords = keywords || defaultConfig.keywords;
    const finalImage = image || defaultConfig.image || '/seo-image.jpg';
    const finalType = type || defaultConfig.type || 'website';
    const finalNoIndex = noIndex !== undefined ? noIndex : defaultConfig.noIndex || false;
    const currentUrl = window.location.pathname;

    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
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
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    
    // Update robots meta tag
    updateMetaTag('robots', finalNoIndex ? 'noindex, nofollow' : 'index, follow');

    // Update Open Graph tags
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', finalType, true);

    // Remove Twitter Card tags since we don't have Twitter
    // Just keep minimal social media support via Open Graph

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = currentUrl;
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = currentUrl;
      document.head.appendChild(canonicalLink);
    }

  }, [pathname, title, description, keywords, image, type, noIndex]);

  return null; // This component doesn't render anything
};

export default SEO;
