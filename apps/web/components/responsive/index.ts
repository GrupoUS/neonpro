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
  type HealthcareContext,
  HealthcareContextSwitcher,
  type LayoutVariant,
  ResponsiveLayout,
  ResponsiveProvider,
  useResponsive,
} from "./ResponsiveLayout";

// Touch-optimized form controls
export {
  default as TouchControls,
  TouchButton,
  TouchCheckbox,
  TouchInput,
  TouchRadioGroup,
  TouchSelect,
  TouchTextarea,
} from "./TouchOptimizedControls";

// Gesture-based navigation
export {
  type GestureEvent,
  GestureHelp,
  GestureNavigation,
  type GestureType,
  MobileMenuDrawer,
  type NavigationDirection,
  SwipeIndicators,
} from "./GestureNavigation";

// Healthcare-optimized breakpoints (CSS custom properties)
export const HEALTHCARE_BREAKPOINTS = {
  mobileSmall: "320px", // Emergency interface only
  mobileStandard: "375px", // Full patient interface
  tablet: "768px", // Dual pane layouts
  desktop: "1024px", // Full dashboard with sidebar
} as const;

// Touch target sizes for different healthcare contexts
export const TOUCH_TARGETS = {
  normal: "44px", // WCAG AA minimum
  emergency: "56px", // Emergency/stress contexts
  postProcedure: "60px", // Post-procedure accessibility
} as const;

// Healthcare context definitions
export const HEALTHCARE_CONTEXTS = {
  normal: "Standard consultation mode",
  emergency: "Emergency/urgent care with large targets",
  postProcedure: "Post-procedure enhanced accessibility",
  oneHanded: "Single-hand operation optimization",
  highContrast: "High contrast for visual impairments",
} as const;
