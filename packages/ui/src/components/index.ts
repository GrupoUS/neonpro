/**
 * NEONPRO UI Components - Unified Exports
 * 
 * Centralized export for all NEONPRO themed components
 * Aesthetic clinic optimized with constitutional compliance
 */

// Core Theme Components
export { ThemeProvider } from './theme-provider';

// Existing shadcn/ui components (enhanced with NEONPRO theme)
export { Button } from './components/ui/button';

// NEONPRO Custom Components
export { default as MagicCard } from './components/ui/magic-card/magic-card';
export { default as AnimatedThemeToggler } from './components/ui/theme-toggler/animated-theme-toggler';
export { default as GradientButton } from './components/ui/gradient-button/gradient-button';
export { default as Sidebar } from './components/ui/sidebar/sidebar';
export { default as TiltedCard } from './components/ui/tilted-card/tilted-card';
export { default as ShineBorder } from './components/ui/shine-border/shine-border';
export { default as HoverBorderGradientButton } from './components/ui/hover-border-gradient-button/hover-border-gradient-button';

// Theme and Accessibility Utilities
export * from './types/theme';
export * from './lib/theme/accessibility';
export * from './lib/theme/installation';

// Re-export utility functions
export { cn } from './lib/utils';

// Type exports for component props
export type { 
  AccessibilityValidationResult,
  AccessibilityViolation,
  ContrastRatio,
  ThemeInstallationRequest,
  ThemeInstallationResponse,
  ThemeConfigurationRequest,
  ColorScheme,
  ColorPalette,
  FontConfiguration,
  FontDefinition 
} from './types/theme';