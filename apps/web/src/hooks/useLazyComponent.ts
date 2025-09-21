/**
 * Lazy Component Loading Hook
 * T078 - Frontend Performance Optimization
 */

import { createIntersectionObserver } from '@/utils/performance';
import { ComponentType, lazy } from 'react';
import { useEffect, useRef, useState } from 'react';

// Cache for lazy-loaded components
const componentCache = new Map<string, LazyExoticComponent<any>>();

/**
 * Creates a lazy-loaded component with caching
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  cacheKey: string,
): LazyExoticComponent<T> {
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey) as LazyExoticComponent<T>;
  }

  const LazyComponent = lazy(importFn);
  componentCache.set(cacheKey, LazyComponent);

  return LazyComponent;
}

/**
 * Hook for lazy loading components based on intersection
 */
export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  cacheKey: string,
  options: {
    rootMargin?: string;
    threshold?: number;
    triggerOnce?: boolean;
  } = {},
) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [LazyComponent, setLazyComponent] = useState<LazyExoticComponent<T> | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  const { rootMargin = '100px', threshold = 0.1, triggerOnce = true } = options;

  useEffect(_() => {
    if (shouldLoad && !LazyComponent) {
      const component = createLazyComponent(importFn, cacheKey);
      setLazyComponent(component);
    }
  }, [shouldLoad, LazyComponent, importFn, cacheKey]);

  useEffect(_() => {
    const observer = createIntersectionObserver(
      entries => {
        entries.forEach(_entry => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            if (triggerOnce) {
              observer?.disconnect();
            }
          }
        });
      },
      {
        rootMargin,
        threshold,
      },
    );

    if (observer && elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce]);

  return {
    LazyComponent,
    shouldLoad,
    elementRef,
  };
}

/**
 * Hook for preloading components
 */
export function useComponentPreloader() {
  const preloadedComponents = useRef(new Set<string>());

  const preloadComponent = async <T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    cacheKey: string,
  ) => {
    if (preloadedComponents.current.has(cacheKey)) {
      return;
    }

    try {
      const _component = createLazyComponent(importFn, cacheKey);
      preloadedComponents.current.add(cacheKey);

      // Trigger the import to cache it
      await importFn();

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] Preloaded component: ${cacheKey}`);
      }
    } catch (_error) {
      console.error(
        `[Performance] Failed to preload component: ${cacheKey}`,
        error,
      );
    }
  };

  const preloadRouteComponents = async (
    routeComponents: Array<{
      importFn: () => Promise<{ default: ComponentType<any> }>;
      cacheKey: string;
    }>,
  ) => {
    const promises = routeComponents.map(_({ importFn,_cacheKey }) =>
      preloadComponent(importFn, cacheKey)
    );

    await Promise.allSettled(promises);
  };

  return {
    preloadComponent,
    preloadRouteComponents,
  };
}

/**
 * Route-based lazy loading configurations
 */
export const routeComponents = {
  // Patient routes
  patients: () =>
    createLazyComponent(_() =>
        import('@/routes/patients/dashboard').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'patients-route',
    ),
  patientProfile: () =>
    createLazyComponent(_() =>
        import('@/routes/patients/$patientId').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'patient-profile-route',
    ),
  patientEdit: () =>
    createLazyComponent(_() =>
        import('@/routes/patients/$patientId/edit').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'patient-edit-route',
    ),

  // Appointment routes
  appointments: () =>
    createLazyComponent(_() =>
        import('@/routes/appointments/new').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'appointments-route',
    ),
  appointmentNew: () =>
    createLazyComponent(_() =>
        import('@/routes/appointments/new').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'appointment-new-route',
    ),

  // Service routes
  services: () =>
    createLazyComponent(_() =>
        import('@/routes/services/index').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'services-route',
    ),
  serviceCategories: () =>
    createLazyComponent(_() =>
        import('@/routes/services/service-categories').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'service-categories-route',
    ),

  // AI routes
  aiChat: () =>
    createLazyComponent(_() =>
        import('@/routes/ai/insights').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'ai-chat-route',
    ),

  // Admin routes
  governance: () =>
    createLazyComponent(_() =>
        import('@/routes/admin/governance').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'governance-route',
    ),
  reports: () =>
    createLazyComponent(_() =>
        import('@/routes/admin/reports').then(m => ({
          default: (m as any).Route?.component as ComponentType<any>,
        })),
      'reports-route',
    ),
};

/**
 * Component-based lazy loading configurations
 */
export const _lazyComponents = {
  // AI Components
  aiInsightsDashboard: () =>
    createLazyComponent(_() => import('@/components/ai/insights-dashboard'),
      'ai-insights-dashboard',
    ),
  aiChat: () =>
    createLazyComponent(_() => import('@/components/ai/ai-chat'),
      'ai-chat-component',
    ),

  // Form Components
  patientCreationForm: () =>
    createLazyComponent(_() =>
        import('@/components/patients/PatientCreationForm').then(m => ({
          default: (m as any).default,
        })),
      'patient-creation-form',
    ),
  brazilianFields: () =>
    createLazyComponent(_() =>
        import('@/components/forms/brazilian-fields').then(m => ({
          default: (m as any).default,
        })),
      'brazilian-fields',
    ),

  // Complex Components
  appointmentBooking: () =>
    createLazyComponent(_() =>
        import('@/components/appointment-booking').then(m => ({
          default: m.AppointmentBooking,
        })),
      'appointment-booking',
    ),
  eventCalendar: () =>
    createLazyComponent(_() =>
        import('@/components/event-calendar/event-calendar').then(m => ({
          default: m.EventCalendar,
        })),
      'event-calendar',
    ),

  // Chart Components
  performanceDashboard: () =>
    createLazyComponent(_() =>
        import('@/components/performance/PerformanceDashboard').then(m => ({
          default: m.PerformanceDashboard,
        })),
      'performance-dashboard',
    ),
};

/**
 * Critical components that should be preloaded
 */
export const _criticalComponents = [
  {
    importFn: () => import('@/components/auth/AuthForm'),
    cacheKey: 'auth-form',
  },
  {
    importFn: () => import('@/components/layout/EnhancedSidebar'),
    cacheKey: 'sidebar',
  },
  {
    importFn: () => import('@/components/patient/patient-card'),
    cacheKey: 'patient-card',
  },
];

export default useLazyComponent;
