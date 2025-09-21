import { useEffect, useState } from 'react';

/**
 * Hook for mobile optimization in healthcare applications
 * Provides touch-friendly interactions and responsive behavior
 */
export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [touchSupported, setTouchSupported] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Breakpoints for healthcare applications
  const breakpoints = {
    mobile: 480, // Phones in portrait
    tablet: 768, // Tablets in portrait
    desktop: 1024, // Desktop and landscape tablets
  };

  useEffect(_() => {
    if (typeof window === 'undefined') return;

    // Check touch support
    setTouchSupported('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewportSize({ width, height });

      // Update device type based on width
      setIsMobile(width < breakpoints.mobile);
      setIsTablet(width >= breakpoints.mobile && width < breakpoints.desktop);
      setIsDesktop(width >= breakpoints.desktop);
    };

    // Initial check
    handleResize();

    // Listen for resize and orientation changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [breakpoints.mobile, breakpoints.desktop]);

  /**
   * Get touch target size based on device type
   * WCAG 2.1 recommends minimum 44x44px for touch targets
   */
  const getTouchTargetSize = useCallback(_() => {
    if (isMobile) return 44; // Minimum for mobile
    if (isTablet) return 48; // Larger for tablets
    return 40; // Standard for desktop
  }, [isMobile, isTablet]);

  /**
   * Get font size based on device type for better readability
   */
  const getFontSize = useCallback(_() => {
    if (isMobile) return 'base'; // 16px base
    if (isTablet) return 'lg'; // 18px for tablets
    return 'base'; // 16px for desktop
  }, [isMobile, isTablet]);

  /**
   * Get spacing based on device type
   */
  const getSpacing = useCallback(_() => {
    if (isMobile) return 'tight'; // Less spacing on mobile
    if (isTablet) return 'normal'; // Normal spacing on tablets
    return 'normal'; // Normal spacing on desktop
  }, [isMobile, isTablet]);

  /**
   * Check if device should use touch interactions
   */
  const shouldUseTouchInteractions = useCallback(_() => {
    return touchSupported && (isMobile || isTablet);
  }, [touchSupported, isMobile, isTablet]);

  /**
   * Get optimized interaction delay for touch devices
   */
  const getInteractionDelay = useCallback(_() => {
    if (shouldUseTouchInteractions()) {
      return 300; // 300ms delay for touch devices
    }
    return 0; // No delay for desktop
  }, [shouldUseTouchInteractions]);

  /**
   * Get viewport orientation
   */
  const getOrientation = useCallback(_() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }, []);

  /**
   * Check if device is in landscape mode
   */
  const isLandscape = useCallback(_() => {
    return getOrientation() === 'landscape';
  }, [getOrientation]);

  /**
   * Check if device is in portrait mode
   */
  const isPortrait = useCallback(_() => {
    return getOrientation() === 'portrait';
  }, [getOrientation]);

  /**
   * Get safe area insets for mobile devices (notch, home indicator)
   */
  const getSafeAreaInsets = useCallback(_() => {
    if (typeof window === 'undefined' || !CSS.supports('padding', 'env(safe-area-inset-top)')) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    // Try to get safe area values from CSS
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    };
  }, []);

  /**
   * Generate CSS classes for mobile optimization
   */
  const getMobileOptimizedClasses = useCallback(_() => {
    const classes = [];

    if (isMobile) {
      classes.push('mobile-optimized');
      classes.push('touch-manipulation'); // Improves touch responsiveness
    }

    if (isTablet) {
      classes.push('tablet-optimized');
    }

    if (shouldUseTouchInteractions()) {
      classes.push('touch-optimized');
    }

    return classes.join(' ');
  }, [isMobile, isTablet, shouldUseTouchInteractions]);

  /**
   * Check if viewport is narrow (good for column layouts)
   */
  const isNarrowViewport = useCallback(_() => {
    return viewportSize.width < breakpoints.mobile;
  }, [viewportSize.width, breakpoints.mobile]);

  /**
   * Check if viewport is medium (good for grid layouts)
   */
  const isMediumViewport = useCallback(_() => {
    return viewportSize.width >= breakpoints.mobile && viewportSize.width < breakpoints.desktop;
  }, [viewportSize.width, breakpoints.mobile, breakpoints.desktop]);

  /**
   * Check if viewport is wide (good for side-by-side layouts)
   */
  const isWideViewport = useCallback(_() => {
    return viewportSize.width >= breakpoints.desktop;
  }, [viewportSize.width, breakpoints.desktop]);

  return {
    // Device detection
    isMobile,
    isTablet,
    isDesktop,
    touchSupported,
    shouldUseTouchInteractions,

    // Viewport information
    viewportSize,
    orientation: getOrientation(),
    isLandscape,
    isPortrait,
    safeAreaInsets: getSafeAreaInsets(),

    // Viewport size categories
    isNarrowViewport,
    isMediumViewport,
    isWideViewport,

    // Optimization helpers
    touchTargetSize: getTouchTargetSize(),
    fontSize: getFontSize(),
    spacing: getSpacing(),
    interactionDelay: getInteractionDelay(),

    // CSS classes
    mobileOptimizedClasses: getMobileOptimizedClasses(),

    // Breakpoints
    breakpoints,
  };
}
