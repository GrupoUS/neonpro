/**
 * NEONPRO Healthcare Responsive Design System
 * Mobile-First Components with Healthcare Context Optimization
 * 
 * Following KISS/YAGNI Constitutional Principles:
 * - Single responsive system for all healthcare contexts
 * - Progressive enhancement from mobile-first
 * - Healthcare-specific accessibility adaptations
 * - Touch optimization for medical environments
 */

// Core responsive layout system
export {
  ResponsiveLayout,
  ResponsiveProvider,
  HealthcareContextSwitcher,
  useResponsive,
  type HealthcareContext,
  type LayoutVariant
} from './ResponsiveLayout';

// Touch-optimized form controls
export {
  TouchButton,
  TouchInput,
  TouchTextarea,
  TouchSelect,
  TouchCheckbox,
  TouchRadioGroup,
  default as TouchControls
} from './TouchOptimizedControls';

// Gesture-based navigation
export {
  GestureNavigation,
  SwipeIndicators,
  MobileMenuDrawer,
  GestureHelp,
  type GestureType,
  type NavigationDirection,
  type GestureEvent
} from './GestureNavigation';

// Healthcare-optimized breakpoints (CSS custom properties)
export const HEALTHCARE_BREAKPOINTS = {
  mobileSmall: '320px',     // Emergency interface only
  mobileStandard: '375px',  // Full patient interface
  tablet: '768px',          // Dual pane layouts
  desktop: '1024px'         // Full dashboard with sidebar
} as const;

// Touch target sizes for different healthcare contexts
export const TOUCH_TARGETS = {
  normal: '44px',      // WCAG AA minimum
  emergency: '56px',   // Emergency/stress contexts
  postProcedure: '60px' // Post-procedure accessibility
} as const;

// Healthcare context definitions
export const HEALTHCARE_CONTEXTS = {
  normal: 'Standard consultation mode',
  emergency: 'Emergency/urgent care with large targets',
  postProcedure: 'Post-procedure enhanced accessibility',
  oneHanded: 'Single-hand operation optimization',
  highContrast: 'High contrast for visual impairments'
} as const;