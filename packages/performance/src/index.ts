/**
 * @neonpro/performance
 * Healthcare Performance Optimization Package
 * 
 * Features:
 * - Intelligent lazy loading with healthcare priorities
 * - Bundle size reduction (10MB+ savings)
 * - Core Web Vitals optimization
 * - Emergency-first preloading strategies
 */

// Lazy Loading System
export * from './lazy-loading/healthcare-dynamic-loader';

// Performance Hooks
export * from './hooks/use-healthcare-preloader';

// Type definitions
export type {
  HealthcarePriority as Priority,
} from './lazy-loading/healthcare-dynamic-loader';

// Performance utilities
export const PERFORMANCE_THRESHOLDS = {
  EMERGENCY: 200,        // ms
  URGENT: 500,          // ms 
  STANDARD: 1000,       // ms
  ADMINISTRATIVE: 2000, // ms
} as const;

// Bundle size estimates (for monitoring)
export const LIBRARY_SIZES = {
  TENSORFLOW_JS: 10_240, // ~10MB
  REACT_PDF: 8192,      // ~8MB
  FRAMER_MOTION: 3072,  // ~3MB
  HTML2_CANVAS: 2048,   // ~2MB
  RECHARTS: 1536,       // ~1.5MB
} as const;