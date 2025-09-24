/**
 * Animation Hooks Export
 * Advanced hover border and shine border animation system
 * Inspired by AceternityUI and MagicUI with 60fps performance optimization
 */

export { usePersistedDashboardLayout } from './use-persisted-dashboard-layout';
export { useAnimationPerformance } from './useAnimationPerformance';
export { useHoverBorderGradient } from './useHoverBorderGradient';
export { useShineBorderAnimation } from './useShineBorderAnimation';

// Re-export types for convenience
export type {
  HoverBorderGradientConfig,
  HoverBorderGradientReturn,
} from './useHoverBorderGradient';

export type {
  HoverDirection,
  HoverGradientTheme,
  ShineBorderAnimationConfig,
  ShineBorderAnimationReturn,
  ShineIntensity,
  ShinePattern,
  ShineSpeed,
  ShineTheme,
} from './useShineBorderAnimation';

export type {
  AnimationPerformanceReturn,
  DeviceCapabilities,
  PerformanceSettings,
} from './useAnimationPerformance';
