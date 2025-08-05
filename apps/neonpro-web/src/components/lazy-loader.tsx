"use client";

import React, {
  Suspense,
  lazy,
  ComponentType,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import type { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent } from "@/components/ui/card";
import type { cn } from "@/lib/utils";

// =====================================================================================
// LAZY LOADING SYSTEM
// Optimized component lazy loading with error boundaries and loading states
// =====================================================================================

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  className?: string;
  minLoadingTime?: number; // Minimum loading time to prevent flashing
  retryable?: boolean;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

interface LazyComponentOptions {
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  minLoadingTime?: number;
  retryable?: boolean;
  preload?: boolean; // Preload on hover/focus
  chunkName?: string; // For webpack chunk naming
}

// =====================================================================================
// ENHANCED LAZY LOADER COMPONENT
// =====================================================================================

export function LazyLoader({
  children,
  fallback,
  errorFallback,
  className,
  minLoadingTime = 200,
  retryable = true,
  onError,
  onLoad,
}: LazyLoaderProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const loadingStartTime = useRef(Date.now());
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleLoad = useCallback(() => {
    const elapsed = Date.now() - loadingStartTime.current;
    const remainingTime = Math.max(0, minLoadingTime - elapsed);

    setTimeout(() => {
      if (mounted.current) {
        setIsLoading(false);
        onLoad?.();
      }
    }, remainingTime);
  }, [minLoadingTime, onLoad]);

  const handleError = useCallback(
    (error: Error) => {
      if (mounted.current) {
        setHasError(true);
        setIsLoading(false);
        onError?.(error);
      }
    },
    [onError],
  );

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
    loadingStartTime.current = Date.now();
  }, []);

  useEffect(() => {
    if (!hasError && !isLoading) {
      handleLoad();
    }
  }, [hasError, isLoading, handleLoad]);

  if (hasError) {
    return (
      <ErrorFallback
        error={new Error("Component failed to load")}
        onRetry={retryable ? handleRetry : undefined}
        retryCount={retryCount}
        customFallback={errorFallback}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <ErrorBoundary onError={handleError}>
        <Suspense
          fallback={
            fallback || (
              <LoadingFallback minLoadingTime={minLoadingTime} onLoadComplete={handleLoad} />
            )
          }
        >
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// =====================================================================================
// ERROR BOUNDARY
// =====================================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: ReactNode; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("LazyLoader Error:", error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      throw this.state.error;
    }

    return this.props.children;
  }
}

// =====================================================================================
// LOADING FALLBACK
// =====================================================================================

interface LoadingFallbackProps {
  minLoadingTime?: number;
  onLoadComplete?: () => void;
  message?: string;
  showProgress?: boolean;
}

function LoadingFallback({
  minLoadingTime = 200,
  onLoadComplete,
  message = "Loading component...",
  showProgress = false,
}: LoadingFallbackProps) {
  const [progress, setProgress] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const newProgress = Math.min(90, (elapsed / minLoadingTime) * 100);
      setProgress(newProgress);
    }, 50);

    return () => clearInterval(interval);
  }, [minLoadingTime, showProgress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadComplete?.();
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime, onLoadComplete]);

  return (
    <Card className="animate-pulse">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{message}</p>
            {showProgress && (
              <div className="mt-2 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================================
// ERROR FALLBACK
// =====================================================================================

interface ErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  retryCount?: number;
  customFallback?: ReactNode;
  className?: string;
}

function ErrorFallback({
  error,
  onRetry,
  retryCount = 0,
  customFallback,
  className,
}: ErrorFallbackProps) {
  if (customFallback) {
    return <div className={className}>{customFallback}</div>;
  }

  return (
    <Card className={cn("border-red-200 bg-red-50", className)}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load component</h3>
            <p className="text-sm text-red-700 mb-4">
              {error.message || "An unexpected error occurred"}
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-red-600 mb-4">Retry attempts: {retryCount}</p>
            )}
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================================
// ENHANCED LAZY COMPONENT FACTORY
// =====================================================================================

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {},
) {
  const {
    fallback,
    errorFallback,
    minLoadingTime = 200,
    retryable = true,
    preload = false,
    chunkName,
  } = options;

  // Create the lazy component
  const LazyComponent = lazy(() => {
    // Add artificial delay for minimum loading time
    const loadPromise = importFn();

    if (minLoadingTime > 0) {
      const delayPromise = new Promise((resolve) => setTimeout(resolve, minLoadingTime));

      return Promise.all([loadPromise, delayPromise]).then(([module]) => module);
    }

    return loadPromise;
  });

  // Enhanced component with preloading
  const EnhancedComponent = React.forwardRef<any, any>((props, ref) => {
    const [shouldPreload, setShouldPreload] = useState(false);
    const preloadTriggered = useRef(false);

    const handlePreload = useCallback(() => {
      if (preload && !preloadTriggered.current) {
        preloadTriggered.current = true;
        importFn().catch(console.warn); // Preload silently
      }
    }, []);

    const containerProps = preload
      ? {
          onMouseEnter: handlePreload,
          onFocus: handlePreload,
        }
      : {};

    return (
      <div {...containerProps}>
        <LazyLoader
          fallback={fallback}
          errorFallback={errorFallback}
          minLoadingTime={minLoadingTime}
          retryable={retryable}
        >
          <LazyComponent {...props} ref={ref} />
        </LazyLoader>
      </div>
    );
  });

  // Add display name for debugging
  EnhancedComponent.displayName = `LazyComponent(${chunkName || "Unknown"})`;

  // Add preload method
  (EnhancedComponent as any).preload = () => importFn();

  return EnhancedComponent;
}

// =====================================================================================
// INTERSECTION OBSERVER LAZY LOADER
// =====================================================================================

interface IntersectionLazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
}

export function IntersectionLazyLoader({
  children,
  fallback,
  rootMargin = "50px",
  threshold = 0.1,
  triggerOnce = true,
  className,
}: IntersectionLazyLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, triggerOnce, hasTriggered]);

  return (
    <div ref={elementRef} className={className}>
      {isVisible
        ? children
        : fallback || (
            <div className="h-32 flex items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          )}
    </div>
  );
}

// =====================================================================================
// UTILITY HOOKS
// =====================================================================================

export function useLazyPreload(importFn: () => Promise<any>) {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  const preload = useCallback(async () => {
    if (isPreloaded || isPreloading) return;

    setIsPreloading(true);
    try {
      await importFn();
      setIsPreloaded(true);
    } catch (error) {
      console.warn("Preload failed:", error);
    } finally {
      setIsPreloading(false);
    }
  }, [importFn, isPreloaded, isPreloading]);

  return {
    preload,
    isPreloaded,
    isPreloading,
  };
}

export function useComponentVisibility(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold]);

  return [elementRef, isVisible] as const;
}

// =====================================================================================
// PREBUILT LAZY COMPONENTS
// =====================================================================================

// Common loading fallbacks
export const SkeletonCard = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </CardContent>
  </Card>
);

export const SkeletonTable = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex space-x-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

export const SkeletonForm = () => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    ))}
    <div className="h-10 bg-gray-200 rounded w-32"></div>
  </div>
);

export default LazyLoader;
