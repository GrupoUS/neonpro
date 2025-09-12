# Unified Animation Props Interface Specification

## Overview
Comprehensive props interface design for granular control over both hover-border-gradient and enhanced shine-border animations, integrated with the existing universal-button architecture.

## Design Principles

### 1. Backward Compatibility
- **Existing props preserved**: All current universal-button props maintained
- **Opt-in enhancement**: New animation features enabled via explicit configuration
- **Graceful degradation**: Fallback to existing behavior when new props undefined
- **Migration path**: Clear upgrade path from current implementation

### 2. Performance-First Design
- **Conditional loading**: Features only loaded when enabled
- **GPU acceleration toggles**: Fine-grained control over hardware acceleration
- **Battery awareness**: Automatic optimization for mobile devices
- **Reduced motion support**: Built-in accessibility compliance

### 3. Developer Experience
- **Type safety**: Full TypeScript support with intelligent autocomplete
- **Logical grouping**: Related props organized into intuitive sections
- **Sensible defaults**: Zero-configuration setup with optimal defaults
- **Documentation integration**: IntelliSense-friendly JSDoc comments

## Core Interface Architecture

### Base Animation Configuration
```typescript
interface BaseAnimationConfig {
  // Global Animation Control
  enabled: boolean;
  autoStart: boolean;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  
  // Performance Settings
  enableGPUAcceleration: boolean;
  respectReducedMotion: boolean;
  batteryAware: boolean;
  frameRateTarget: 30 | 60 | 120;
  
  // Accessibility
  reduceMotionFallback?: 'static' | 'slow' | 'disabled';
  announceToScreenReader?: boolean;
  
  // Event Handlers
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  onAnimationIteration?: () => void;
}
```

### Hover Border Gradient Configuration
```typescript
interface HoverBorderGradientConfig extends BaseAnimationConfig {
  // Animation Type
  type: 'hover-border-gradient';
  
  // Visual Properties
  colors: string[];
  borderWidth: number;
  borderRadius?: string | number;
  
  // Animation Behavior
  duration: number;
  rotationDirection: 'clockwise' | 'counter-clockwise' | 'alternate';
  rotationSpeed: number; // 0.1x to 5x multiplier
  
  // Interaction Features
  followMouse: boolean;
  mouseInfluenceRadius: number; // 0-100px
  hoverIntensityMultiplier: number; // 0.5x to 3x
  
  // Advanced Visual Effects
  gradientOpacity: number; // 0-1
  blurRadius: number; // 0-8px
  glowEffect: boolean;
  pulsateOnHover: boolean;
  
  // Mouse Tracking
  mouseTrackingSmoothing: number; // 0-1, higher = smoother
  mouseTrackingEnabled: boolean;
  trackingBoundary: 'component' | 'viewport' | number; // px from edge
}
```

### Enhanced Shine Border Configuration
```typescript
interface EnhancedShineBorderConfig extends BaseAnimationConfig {
  // Animation Type
  type: 'shine-border';
  
  // Pattern Selection
  pattern: 'linear' | 'orbital' | 'pulse' | 'wave' | 'spiral';
  patternVariant?: 'subtle' | 'normal' | 'intense';
  
  // Visual Properties
  colors: string[];
  borderWidth: number;
  intensity: number; // 0-1
  blur: number; // 0-8px
  
  // Animation Timing
  duration: number;
  delay: number;
  easing: string; // CSS easing function
  iterationCount: number | 'infinite';
  
  // Direction Control
  direction: 'clockwise' | 'counter-clockwise' | 'alternate' | 'random';
  reverse: boolean;
  
  // Trigger Modes
  trigger: 'continuous' | 'hover' | 'focus' | 'visible' | 'click';
  triggerDelay: number;
  
  // Advanced Effects
  multiLayer: boolean;
  shadowEffect: boolean;
  shimmerWidth: number; // 10-50% of container
  gradientStops: number; // 2-8 stops
  
  // Pattern-Specific Options
  linearSweepAngle?: number; // For linear pattern: 0-360 degrees
  orbitalEccentricity?: number; // For orbital pattern: 0-1
  pulseOrigin?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  waveAmplitude?: number; // For wave pattern: 0-50px
  spiralTightness?: number; // For spiral pattern: 0.1-5
}
```

### Unified Animation Props
```typescript
interface UniversalButtonAnimationProps {
  // Animation Configuration
  animation?: HoverBorderGradientConfig | EnhancedShineBorderConfig | null;
  
  // Legacy Support (backward compatibility)
  borderGradient?: boolean; // Maps to basic shine-border
  borderGradientDirection?: 'clockwise' | 'counter-clockwise';
  
  // Multi-Animation Support
  animations?: (HoverBorderGradientConfig | EnhancedShineBorderConfig)[];
  animationPriority?: 'first' | 'last' | 'blend';
  
  // Global Animation Overrides
  globalAnimationDisabled?: boolean;
  globalReducedMotion?: boolean;
  globalPerformanceMode?: 'low' | 'medium' | 'high';
}
```

## Integration with Universal Button

### Enhanced Universal Button Props
```typescript
interface UniversalButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants>,
  UniversalButtonAnimationProps {
  
  // Existing props preserved
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Enhanced animation integration
  animationPreset?: 'subtle' | 'normal' | 'vibrant' | 'custom';
  animationTheme?: 'light' | 'dark' | 'auto';
  
  // Performance optimization
  lazyLoadAnimations?: boolean;
  animationPriority?: 'low' | 'normal' | 'high';
}
```

### Preset System
```typescript
interface AnimationPresets {
  subtle: {
    hoverBorderGradient: Partial<HoverBorderGradientConfig>;
    shineBorder: Partial<EnhancedShineBorderConfig>;
  };
  normal: {
    hoverBorderGradient: Partial<HoverBorderGradientConfig>;
    shineBorder: Partial<EnhancedShineBorderConfig>;
  };
  vibrant: {
    hoverBorderGradient: Partial<HoverBorderGradientConfig>;
    shineBorder: Partial<EnhancedShineBorderConfig>;
  };
}

const ANIMATION_PRESETS: AnimationPresets = {
  subtle: {
    hoverBorderGradient: {
      duration: 4000,
      intensity: 0.3,
      blur: 1,
      respectReducedMotion: true
    },
    shineBorder: {
      pattern: 'linear',
      intensity: 0.2,
      duration: 3000,
      blur: 0.5
    }
  },
  normal: {
    hoverBorderGradient: {
      duration: 3000,
      intensity: 0.6,
      blur: 2,
      followMouse: true
    },
    shineBorder: {
      pattern: 'orbital',
      intensity: 0.5,
      duration: 2500,
      blur: 1
    }
  },
  vibrant: {
    hoverBorderGradient: {
      duration: 2000,
      intensity: 0.9,
      blur: 3,
      followMouse: true,
      glowEffect: true
    },
    shineBorder: {
      pattern: 'pulse',
      intensity: 0.8,
      duration: 2000,
      blur: 2,
      multiLayer: true
    }
  }
};
```

## Usage Examples

### Basic Implementation
```tsx
// Simple hover border gradient
<UniversalButton
  animation={{
    type: 'hover-border-gradient',
    enabled: true,
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
    duration: 3000,
    followMouse: true
  }}
>
  Hover Me
</UniversalButton>

// Enhanced shine border
<UniversalButton
  animation={{
    type: 'shine-border',
    enabled: true,
    pattern: 'orbital',
    colors: ['#gold', '#transparent', '#gold'],
    intensity: 0.7,
    trigger: 'hover'
  }}
>
  Shine Effect
</UniversalButton>
```

### Preset Usage
```tsx
// Using presets for quick setup
<UniversalButton animationPreset="vibrant">
  Vibrant Animation
</UniversalButton>

// Custom preset override
<UniversalButton 
  animationPreset="normal"
  animation={{
    type: 'hover-border-gradient',
    colors: ['#custom1', '#custom2']
  }}
>
  Custom Colors
</UniversalButton>
```

### Multi-Animation Support
```tsx
// Multiple animations with priority
<UniversalButton
  animations={[
    {
      type: 'shine-border',
      pattern: 'linear',
      trigger: 'continuous',
      intensity: 0.3
    },
    {
      type: 'hover-border-gradient',
      trigger: 'hover',
      intensity: 0.8
    }
  ]}
  animationPriority="blend"
>
  Multi-Effect Button
</UniversalButton>
```

## Performance Considerations

### Conditional Loading Strategy
```typescript
interface AnimationLoadingStrategy {
  // Load animations only when needed
  lazyLoad: boolean;
  
  // Preload critical animations
  preloadCritical: string[];
  
  // Bundle splitting
  splitByPattern: boolean;
  
  // Progressive enhancement
  loadProgressively: boolean;
}
```

### Memory Management
```typescript
interface AnimationMemoryManagement {
  // Cleanup inactive animations
  autoCleanup: boolean;
  cleanupDelay: number;
  
  // Limit concurrent animations
  maxConcurrentAnimations: number;
  
  // Memory usage monitoring
  enableMemoryMonitoring: boolean;
  memoryThreshold: number; // MB
}
```

## Type Safety and Validation

### Runtime Validation
```typescript
interface AnimationConfigValidator {
  validateConfig(config: BaseAnimationConfig): ValidationResult;
  validatePerformance(config: BaseAnimationConfig): PerformanceWarning[];
  validateAccessibility(config: BaseAnimationConfig): AccessibilityIssue[];
}
```

### Development Tools
```typescript
interface AnimationDevTools {
  // Debug mode
  enableDebugMode: boolean;
  showPerformanceMetrics: boolean;
  
  // Visual debugging
  showAnimationBounds: boolean;
  showFrameRate: boolean;
  
  // Validation
  enableRuntimeValidation: boolean;
  warnOnPerformanceIssues: boolean;
}
```

## Migration Strategy

### Backward Compatibility Mapping
```typescript
// Legacy prop mapping
interface LegacyPropMapping {
  borderGradient: boolean → animation.type = 'shine-border'
  borderGradientDirection: string → animation.direction
  // All existing props preserved and mapped
}
```

### Deprecation Timeline
1. **Phase 1**: New props available alongside legacy props
2. **Phase 2**: Legacy props marked as deprecated with console warnings
3. **Phase 3**: Legacy props removed (major version bump)

---

*Last Updated: 2025-01-12*
*Status: Interface Design Complete - Ready for Implementation*