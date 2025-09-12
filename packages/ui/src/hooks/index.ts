/**
 * Animation Hooks Export
 * Advanced hover border and shine border animation system
 * Inspired by AceternityUI and MagicUI with 60fps performance optimization
 */

export { useHoverBorderGradient } from './useHoverBorderGradient';
export { useShineBorderAnimation } from './useShineBorderAnimation';
export { useAnimationPerformance } from './useAnimationPerformance';

// Re-export types for convenience
export type {
  HoverBorderGradientConfig,
  HoverBorderGradientReturn,
} from './useHoverBorderGradient';

export type {
  ShineBorderAnimationConfig,
  ShineBorderAnimationReturn,
} from './useShineBorderAnimation';

export type {
  DeviceCapabilities,
  PerformanceSettings,
  AnimationPerformanceReturn,
} from './useAnimationPerformance';
