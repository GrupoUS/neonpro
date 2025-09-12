// Export theme utilities
export * from './utils';

// Re-export theme APIs at the root to avoid subpath resolution issues in some bundlers/test runners
export { installThemeStyles, themeCss } from './theme';
export { ThemeProviderBridge, useThemeBridge } from './theme/ThemeContext';

// Export UI components
export { Button, buttonVariants, NeumorphButton } from './components/ui/button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';
export { UniversalButton, universalButtonVariants } from './components/ui/universal-button';
export type { UniversalButtonProps, AdvancedAnimationProps } from './components/ui/universal-button';

// Export hooks
export * from './hooks';

// Export MagicUI components
export { ShineBorder } from './components/magicui/shine-border';
export type { ShineBorderProps } from './components/magicui/shine-border';

// Export Aceternity components
export { HoverBorderGradient, EnhancedShineBorder } from './components/aceternity';
export type { HoverBorderGradientProps, EnhancedShineBorderProps } from './components/aceternity';
