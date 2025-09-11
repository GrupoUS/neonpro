import { useEffect } from 'react';
import { useConsent } from '../contexts/ConsentContext';
import { analytics } from '../lib/analytics';

/**
 * Hook to initialize analytics based on user consent
 * Automatically handles consent changes and analytics initialization
 */
export function useAnalytics() {
  const { hasConsent, consentSettings: _consentSettings } = useConsent();

  useEffect(() => {
    // Initialize analytics if user has granted analytics consent
    if (hasConsent('analytics')) {
      analytics.initialize().catch((error) => {
        console.error('Failed to initialize analytics:', error);
      });
    }
  }, [hasConsent]);

  useEffect(() => {
    // Listen for consent changes to handle analytics initialization/cleanup
    const handleConsentChange = (event: CustomEvent) => {
      const { category, granted } = event.detail;
      
      if (category === 'analytics') {
        if (granted) {
          analytics.initialize().catch((error) => {
            console.error('Failed to initialize analytics after consent granted:', error);
          });
        } else {
          analytics.cleanup();
        }
      }
    };

    // Add event listener for consent changes
    window.addEventListener('consent-changed', handleConsentChange as EventListener);

    return () => {
      window.removeEventListener('consent-changed', handleConsentChange as EventListener);
    };
  }, []);

  // Return analytics functions that respect consent
  return {
    trackPageView: (data: { path: string; title: string; referrer?: string }) => {
      if (hasConsent('analytics')) {
        analytics.trackPageView(data);
      }
    },
    trackEvent: (data: { name: string; properties?: Record<string, any> }) => {
      if (hasConsent('analytics')) {
        analytics.trackEvent(data);
      }
    },
    trackInteraction: (data: {
      element: string;
      action: string;
      category?: string;
      label?: string;
      value?: number;
    }) => {
      if (hasConsent('analytics')) {
        analytics.trackInteraction(data);
      }
    },
    setUserId: (userId: string) => {
      if (hasConsent('analytics')) {
        analytics.setUserId(userId);
      }
    },
    isInitialized: hasConsent('analytics'),
  };
}

/**
 * Hook for page view tracking with TanStack Router
 */
export function usePageTracking() {
  const { trackPageView } = useAnalytics();

  const trackPage = (path: string, title?: string) => {
    trackPageView({
      path,
      title: title || document.title,
      referrer: document.referrer || undefined,
    });
  };

  return { trackPage };
}

/**
 * Hook for interaction tracking
 */
export function useInteractionTracking() {
  const { trackInteraction } = useAnalytics();

  const trackClick = (
    element: string,
    category?: string,
    label?: string,
    value?: number
  ) => {
    trackInteraction({
      element,
      action: 'click',
      category,
      label,
      value,
    });
  };

  const trackFormSubmit = (formName: string, success: boolean) => {
    trackInteraction({
      element: 'form',
      action: 'submit',
      category: 'form_interaction',
      label: formName,
      value: success ? 1 : 0,
    });
  };

  const trackSearch = (query: string, resultsCount?: number) => {
    trackInteraction({
      element: 'search',
      action: 'search',
      category: 'site_search',
      label: query,
      value: resultsCount,
    });
  };

  return {
    trackClick,
    trackFormSubmit,
    trackSearch,
    trackInteraction,
  };
}