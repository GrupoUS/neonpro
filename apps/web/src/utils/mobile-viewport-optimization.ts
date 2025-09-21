/**
 * Mobile Viewport Optimization Utility
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - Mobile viewport management
 * - Responsive design optimization
 * - Touch interaction enhancement
 * - Healthcare-specific mobile UX improvements
 */

/**
 * Mobile viewport configuration interface
 */
export interface MobileViewportConfig {
  enableTouchOptimization: boolean;
  enableResponsiveEnhancement: boolean;
  enableHealthcareUX: boolean;
  enablePerformanceOptimization: boolean;
  minTouchTargetSize: number;
  preventZoomOnInput: boolean;
  enableSafeAreaInsets: boolean;
}

/**
 * Default mobile viewport configuration
 */
const DEFAULT_MOBILE_CONFIG: MobileViewportConfig = {
  enableTouchOptimization: true,
  enableResponsiveEnhancement: true,
  enableHealthcareUX: true,
  enablePerformanceOptimization: true,
  minTouchTargetSize: 44,
  preventZoomOnInput: true,
  enableSafeAreaInsets: true,
};

/**
 * Breakpoint configuration for healthcare applications
 */
export interface BreakpointConfig {
  mobile: number;
  mobileLarge: number;
  tablet: number;
  tabletLarge: number;
  desktop: number;
  desktopLarge: number;
}

/**
 * Healthcare-optimized breakpoints
 */
const HEALTHCARE_BREAKPOINTS: BreakpointConfig = {
  mobile: 320,
  mobileLarge: 375,
  tablet: 768,
  tabletLarge: 1024,
  desktop: 1280,
  desktopLarge: 1536,
};

/**
 * Viewport optimization state
 */
interface ViewportState {
  isInitialized: boolean;
  currentBreakpoint: string;
  viewportSize: { width: number; height: number };
  isTouchDevice: boolean;
  config: MobileViewportConfig;
}

let viewportState: ViewportState = {
  isInitialized: false,
  currentBreakpoint: 'mobile',
  viewportSize: { width: 0, height: 0 },
  isTouchDevice: false,
  config: DEFAULT_MOBILE_CONFIG,
};

/**
 * Detect touch device capabilities
 */
function detectTouchDevice(): boolean {
  return (
    'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || 'msMaxTouchPoints' in navigator
  );
}

/**
 * Detect mobile device type
 */
function detectMobileDevice(): string {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('iphone')) return 'iphone';
  if (userAgent.includes('ipad')) return 'ipad';
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('windows phone')) return 'windows-phone';

  return 'unknown';
}

/**
 * Get current viewport size
 */
function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Determine current breakpoint based on viewport width
 */
function determineBreakpoint(width: number): string {
  const { mobile: _mobile, mobileLarge, tablet, tabletLarge, desktop, desktopLarge } =
    HEALTHCARE_BREAKPOINTS;

  if (width >= desktopLarge) return 'desktop-large';
  if (width >= desktop) return 'desktop';
  if (width >= tabletLarge) return 'tablet-large';
  if (width >= tablet) return 'tablet';
  if (width >= mobileLarge) return 'mobile-large';
  return 'mobile';
}

/**
 * Apply safe area insets for modern mobile devices
 */
function applySafeAreaInsets(): void {
  if (!viewportState.config.enableSafeAreaInsets) {
    return;
  }

  const html = document.documentElement;

  // Check if the device supports safe area insets
  const supportsSafeArea = CSS.supports('padding-left', 'env(safe-area-inset-left)');

  if (supportsSafeArea) {
    // Apply safe area insets to the body
    document.body.style.paddingTop = 'env(safe-area-inset-top)';
    document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
    document.body.style.paddingLeft = 'env(safe-area-inset-left)';
    document.body.style.paddingRight = 'env(safe-area-inset-right)';

    // Store safe area values as CSS variables
    html.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    html.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    html.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    html.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
  }
}

/**
 * Optimize viewport meta tag for mobile
 */
function optimizeViewportMetaTag(): void {
  const viewport = document.querySelector('meta[name="viewport"]');

  if (viewport) {
    // Enhanced viewport configuration for healthcare applications
    const viewportContent = [
      'width=device-width',
      'initial-scale=1.0',
      'minimum-scale=1.0',
      'maximum-scale=5.0', // Allow zoom for accessibility
      'user-scalable=yes', // Allow user scaling for accessibility
      'viewport-fit=cover', // Support safe area insets
      'shrink-to-fit=no', // Prevent content shrinking
    ].join(', ');

    viewport.setAttribute('content', viewportContent);
  }
}

/**
 * Apply responsive design enhancements
 */
function applyResponsiveEnhancements(): void {
  if (!viewportState.config.enableResponsiveEnhancement) {
    return;
  }

  const html = document.documentElement;
  const currentBreakpoint = determineBreakpoint(viewportState.viewportSize.width);

  // Update breakpoint attribute
  html.setAttribute('data-breakpoint', currentBreakpoint);
  viewportState.currentBreakpoint = currentBreakpoint;

  // Apply healthcare-specific responsive classes
  if (viewportState.config.enableHealthcareUX) {
    html.setAttribute('data-healthcare-responsive', 'true');
    html.setAttribute('data-mobile-optimized', 'true');
  }

  // Apply performance optimizations
  if (viewportState.config.enablePerformanceOptimization) {
    // Use containment for better performance on mobile
    if (currentBreakpoint === 'mobile' || currentBreakpoint === 'mobile-large') {
      html.setAttribute('data-performance-mode', 'mobile');
    } else {
      html.removeAttribute('data-performance-mode');
    }
  }
}

/**
 * Apply touch interaction optimizations
 */
function applyTouchOptimizations(): void {
  if (!viewportState.config.enableTouchOptimization) {
    return;
  }

  const html = document.documentElement;

  // Add touch device detection attributes
  html.setAttribute('data-touch-device', viewportState.isTouchDevice.toString());
  html.setAttribute('data-input-method', viewportState.isTouchDevice ? 'touch' : 'pointer');

  // Add mobile device type
  const deviceType = detectMobileDevice();
  if (deviceType !== 'unknown') {
    html.setAttribute('data-device-type', deviceType);
  }

  // Apply touch optimization styles
  if (viewportState.isTouchDevice) {
    // Optimize for touch interactions
    html.style.setProperty('--touch-target-size', `${viewportState.config.minTouchTargetSize}px`);

    // Prevent zoom on input focus for iOS
    if (viewportState.config.preventZoomOnInput) {
      const inputs = document.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="tel"], input[type="password"], textarea, select',
      );
      inputs.forEach(input => {
        (input as HTMLElement).style.fontSize = '16px';
      });
    }

    // Add touch-specific event listeners
    setupTouchEventListeners();
  }
}

/**
 * Setup touch event listeners for healthcare UX
 */
function setupTouchEventListeners(): void {
  let lastTouchTime = 0;

  // Prevent double-tap zoom on buttons
  document.addEventListener('touchend', event => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTouchTime;

    if (tapLength < 300 && tapLength > 0) {
      // This might be a double-tap
      const target = event.target as HTMLElement;

      // Check if target is a button or interactive element
      if (
        target.tagName === 'BUTTON'
        || target.tagName === 'A'
        || target.closest('button')
        || target.closest('a')
        || target.hasAttribute('role') === 'button'
      ) {
        event.preventDefault();
      }
    }

    lastTouchTime = currentTime;
  });

  // Handle touch events for better feedback
  document.addEventListener('touchstart', event => {
    const target = event.target as HTMLElement;

    // Add touch feedback to interactive elements
    if (
      target.tagName === 'BUTTON'
      || target.tagName === 'A'
      || target.closest('button')
      || target.closest('a')
      || target.hasAttribute('role') === 'button'
    ) {
      target.classList.add('touch-active');
    }
  });

  document.addEventListener('touchend', event => {
    const target = event.target as HTMLElement;
    target.classList.remove('touch-active');
  });

  document.addEventListener('touchcancel', event => {
    const target = event.target as HTMLElement;
    target.classList.remove('touch-active');
  });
}

/**
 * Handle viewport resize events with debounce
 */
function setupResizeHandler(): void {
  let resizeTimeout: NodeJS.Timeout;

  const handleResize = () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(_() => {
      // Update viewport size
      viewportState.viewportSize = getViewportSize();

      // Re-apply responsive enhancements
      applyResponsiveEnhancements();

      // Update touch optimizations if needed
      if (viewportState.config.enableTouchOptimization) {
        applyTouchOptimizations();
      }

      // Log viewport changes in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Mobile Viewport] Viewport updated:', {
          size: viewportState.viewportSize,
          breakpoint: viewportState.currentBreakpoint,
          isTouchDevice: viewportState.isTouchDevice,
        });
      }
    }, 150); // Debounce resize events
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
}

/**
 * Apply healthcare-specific mobile optimizations
 */
function applyHealthcareMobileOptimizations(): void {
  if (!viewportState.config.enableHealthcareUX) {
    return;
  }

  const html = document.documentElement;

  // Healthcare-specific mobile optimizations
  html.setAttribute('data-healthcare-mobile', 'true');

  // Optimize for healthcare workflows on mobile
  if (
    viewportState.currentBreakpoint === 'mobile'
    || viewportState.currentBreakpoint === 'mobile-large'
  ) {
    // Mobile-first healthcare UX
    html.setAttribute('data-healthcare-workflow', 'mobile-optimized');

    // Ensure touch targets meet healthcare accessibility standards
    const touchTargets = document.querySelectorAll('button, .touch-target, [role="button"]');
    touchTargets.forEach(target => {
      const element = target as HTMLElement;
      element.style.minHeight = `${viewportState.config.minTouchTargetSize}px`;
      element.style.minWidth = `${viewportState.config.minTouchTargetSize}px`;
    });

    // Optimize form inputs for healthcare data entry
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
      const element = input as HTMLElement;
      element.style.fontSize = '16px'; // Prevent iOS zoom
      element.style.padding = '12px'; // Adequate touch target size
    });
  }

  // Add healthcare-specific CSS variables
  html.style.setProperty('--healthcare-touch-min', `${viewportState.config.minTouchTargetSize}px`);
  html.style.setProperty('--healthcare-spacing-mobile', '1rem');
  html.style.setProperty('--healthcare-border-radius', '8px');
}

/**
 * Initialize mobile viewport optimization
 */
export function initializeMobileViewport(config?: Partial<MobileViewportConfig>): void {
  if (viewportState.isInitialized) {
    console.log('[Mobile Viewport] Already initialized');
    return;
  }

  try {
    // Merge configuration
    viewportState.config = {
      ...DEFAULT_MOBILE_CONFIG,
      ...config,
    };

    // Detect device capabilities
    viewportState.isTouchDevice = detectTouchDevice();
    viewportState.viewportSize = getViewportSize();

    console.log('[Mobile Viewport] Initializing with config:', {
      ...viewportState.config,
      isTouchDevice: viewportState.isTouchDevice,
      viewportSize: viewportState.viewportSize,
    });

    // Apply optimizations
    optimizeViewportMetaTag();
    applySafeAreaInsets();
    applyResponsiveEnhancements();
    applyTouchOptimizations();
    applyHealthcareMobileOptimizations();

    // Setup event listeners
    setupResizeHandler();

    // Mark as initialized
    viewportState.isInitialized = true;

    console.log('[Mobile Viewport] ✅ Mobile viewport optimization completed');

    // Log final status
    console.log('[Mobile Viewport] Final Status:', {
      initialized: viewportState.isInitialized,
      breakpoint: viewportState.currentBreakpoint,
      viewportSize: viewportState.viewportSize,
      isTouchDevice: viewportState.isTouchDevice,
      deviceType: detectMobileDevice(),
    });
  } catch {
    console.error('[Mobile Viewport] ❌ Initialization failed:', error);
    throw error;
  }
}

/**
 * Get current viewport state
 */
export function getViewportState(): ViewportState {
  return { ...viewportState };
}

/**
 * Check if current viewport matches breakpoint
 */
export function isBreakpoint(breakpoint: string): boolean {
  return viewportState.currentBreakpoint === breakpoint;
}

/**
 * Check if viewport is mobile (mobile or mobile-large)
 */
export function isMobile(): boolean {
  return viewportState.currentBreakpoint === 'mobile'
    || viewportState.currentBreakpoint === 'mobile-large';
}

/**
 * Check if viewport is tablet
 */
export function isTablet(): boolean {
  return viewportState.currentBreakpoint === 'tablet'
    || viewportState.currentBreakpoint === 'tablet-large';
}

/**
 * Check if viewport is desktop
 */
export function isDesktop(): boolean {
  return viewportState.currentBreakpoint === 'desktop'
    || viewportState.currentBreakpoint === 'desktop-large';
}

/**
 * Update viewport configuration
 */
export function updateViewportConfig(config: Partial<MobileViewportConfig>): void {
  viewportState.config = {
    ...viewportState.config,
    ...config,
  };

  // Re-apply optimizations with new config
  applyResponsiveEnhancements();
  applyTouchOptimizations();
  applyHealthcareMobileOptimizations();
}

export default {
  initialize: initializeMobileViewport,
  getState: getViewportState,
  isBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  updateConfig: updateViewportConfig,
};
