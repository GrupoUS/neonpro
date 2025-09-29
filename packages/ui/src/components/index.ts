/**
 * NEONPRO UI Components - Unified Exports
 * 
 * Centralized export for all NEONPRO themed components
 * Aesthetic clinic optimized with constitutional compliance
 */

// Core Theme Components
export { ThemeProvider } from '../theme-provider';

// Existing shadcn/ui components (enhanced with NEONPRO theme)
export { Button } from './ui/button';

// NEONPRO Custom Components
export { default as MagicCard } from './ui/magic-card/magic-card';
export { default as AnimatedThemeToggler } from './ui/theme-toggler/animated-theme-toggler';
export { default as GradientButton } from './ui/gradient-button/gradient-button';
export { default as Sidebar } from './ui/sidebar/sidebar';
export { default as TiltedCard } from './ui/tilted-card/tilted-card';
export { default as ShineBorder } from './ui/shine-border/shine-border';
export { default as HoverBorderGradientButton } from './ui/hover-border-gradient-button/hover-border-gradient-button';

// Theme and Accessibility Utilities
export * from '../lib/theme/accessibility';
export * from '../lib/theme/installation';

// Explicit theme type exports to avoid ambiguity
export type { 
  ThemeInstallationRequest,
  ThemeInstallationResponse,
  ThemeConfigurationRequest,
  ColorScheme,
  ColorPalette,
  FontConfiguration,
  FontDefinition 
} from '../types/theme';

// Re-export utility functions
export { cn } from '../lib/utils';

// Type exports for component props (temporarily commented for deploy)
// export type { 
//   AccessibilityValidationResult,
//   AccessibilityViolation,
//   ContrastRatio,
//   ThemeInstallationRequest,
//   ThemeInstallationResponse,
//   ThemeConfigurationRequest,
//   ColorScheme,
//   ColorPalette,
//   FontConfiguration,
//   FontDefinition 
// } from '../types/theme';