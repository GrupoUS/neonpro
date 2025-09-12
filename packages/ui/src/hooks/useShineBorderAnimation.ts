/**
 * useShineBorderAnimation Hook
 * Provides animation control for enhanced shine border effects
 * Inspired by MagicUI effects with multiple animation patterns
 */

import { useCallback, useEffect, useRef, useState } from 'react';

type ShinePattern = 'linear' | 'orbital' | 'pulse' | 'wave' | 'spiral';
type ShineIntensity = 'subtle' | 'normal' | 'vibrant';
type ShineTheme = 'gold' | 'silver' | 'copper' | 'blue' | 'purple' | 'green' | 'red';
type ShineSpeed = 'slow' | 'normal' | 'fast';

// Aceternity Hover Border Gradient types
type HoverDirection = 'TOP' | 'LEFT' | 'BOTTOM' | 'RIGHT';
type HoverGradientTheme = 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink' | 'neonpro' | 'aesthetic';

interface ShineBorderAnimationConfig {
  /** Enable/disable the shine border effect */
  enabled?: boolean;
  /** Animation pattern type */
  pattern?: ShinePattern;
  /** Animation intensity */
  intensity?: ShineIntensity;
  /** Color theme */
  theme?: ShineTheme;
  /** Animation speed */
  speed?: ShineSpeed;
  /** Border width in pixels */
  borderWidth?: number;
  /** Custom shine color */
  color?: string;
  /** Animation duration in seconds */
  duration?: number;
  /** Blur effect intensity */
  blur?: number;
  /** Auto-start animation */
  autoStart?: boolean;
  /** Loop animation */
  loop?: boolean;
  /** Start animation on hover only */
  hoverOnly?: boolean;
  
  // Aceternity Hover Border Gradient options
  /** Enable Aceternity-style hover border gradient */
  enableHoverGradient?: boolean;
  /** Hover gradient theme */
  hoverGradientTheme?: HoverGradientTheme;
  /** Rotation direction for hover gradient */
  hoverClockwise?: boolean;
  /** Hover gradient animation duration */
  hoverDuration?: number;
  /** Custom hover gradient colors */
  hoverGradientColors?: {
    moving?: string;
    highlight?: string;
  };
}

interface ShineBorderAnimationReturn {
  /** Ref to attach to the element */
  elementRef: React.RefObject<HTMLElement | null>;
  /** Whether animation is currently playing */
  isPlaying: boolean;
  /** Whether animation is currently animating (alias for compatibility) */
  isAnimating: boolean;
  /** CSS class names to apply */
  classNames: string;
  /** CSS classes (alias for compatibility) */
  cssClasses: string;
  /** CSS custom properties object */
  style: React.CSSProperties;
  /** Animation control methods */
  controls: {
    start: () => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
    restart: () => void;
  };
  /** Individual control methods for compatibility */
  start: () => void;
  stop: () => void;
  restart: () => void;
  /** Event handlers */
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  
  // Aceternity Hover Border Gradient returns
  /** Hover gradient state */
  hoverGradient: {
    isHovered: boolean;
    direction: HoverDirection;
    backgroundStyle: string;
    containerClassName: string;
  };
}

// Custom CSS properties type for shine border
type CSSPropertiesWithShineVars = React.CSSProperties & {
  '--shine-duration'?: string;
  '--border-width'?: string;
  '--shine-color'?: string;
  '--shine-blur'?: string;
  '--pulse-origin-x'?: string;
  '--pulse-origin-y'?: string;
  '--wave-direction'?: string;
  '--spiral-start'?: string;
  '--orbital-angle'?: string;
};

export function useShineBorderAnimation(
  config: ShineBorderAnimationConfig = {},
): ShineBorderAnimationReturn {
  const {
    enabled = true,
    pattern = 'linear',
    intensity = 'normal',
    theme = 'gold',
    speed = 'normal',
    borderWidth = 1,
    color,
    duration,
    blur,
    autoStart = true,
    hoverOnly = false,
    // Aceternity Hover Border Gradient options
    enableHoverGradient = false,
    hoverGradientTheme = 'blue',
    hoverClockwise = true,
    hoverDuration = 1,
    hoverGradientColors,
  } = config;

  const [isPlaying, setIsPlaying] = useState(autoStart && !hoverOnly);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverDirection, setHoverDirection] = useState<HoverDirection>('TOP');
  const [isHoverGradientActive, setIsHoverGradientActive] = useState(false);
  
  const animationStateRef = useRef<'playing' | 'paused' | 'stopped'>(
    autoStart && !hoverOnly ? 'playing' : 'stopped',
  );
  const hoverIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Aceternity Hover Border Gradient: Direction rotation logic
  const rotateDirection = useCallback((currentDirection: HoverDirection): HoverDirection => {
    const directions: HoverDirection[] = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = hoverClockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  }, [hoverClockwise]);

  // Aceternity Hover Border Gradient: Gradient definitions
  const getHoverGradientMaps = useCallback(() => {
    const movingMap: Record<HoverDirection, string> = {
      TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
      LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
      BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
      RIGHT: "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    };

    // Theme-based highlight colors for NeonPro
    const themeHighlights: Record<HoverGradientTheme, string> = {
      blue: "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)",
      purple: "radial-gradient(75% 181.15942028985506% at 50% 50%, #8B5CF6 0%, rgba(255, 255, 255, 0) 100%)",
      green: "radial-gradient(75% 181.15942028985506% at 50% 50%, #10B981 0%, rgba(255, 255, 255, 0) 100%)",
      red: "radial-gradient(75% 181.15942028985506% at 50% 50%, #EF4444 0%, rgba(255, 255, 255, 0) 100%)",
      orange: "radial-gradient(75% 181.15942028985506% at 50% 50%, #F97316 0%, rgba(255, 255, 255, 0) 100%)",
      pink: "radial-gradient(75% 181.15942028985506% at 50% 50%, #EC4899 0%, rgba(255, 255, 255, 0) 100%)",
      neonpro: "radial-gradient(75% 181.15942028985506% at 50% 50%, #AC9469 0%, rgba(255, 255, 255, 0) 100%)", // NeonPro gold
      aesthetic: "radial-gradient(75% 181.15942028985506% at 50% 50%, linear-gradient(45deg, #AC9469, #294359) 0%, rgba(255, 255, 255, 0) 100%)", // NeonPro aesthetic gradient
    };

    return {
      moving: hoverGradientColors?.moving || movingMap[hoverDirection],
      highlight: hoverGradientColors?.highlight || themeHighlights[hoverGradientTheme],
    };
  }, [hoverDirection, hoverGradientTheme, hoverGradientColors]);

  // Duration mapping based on speed
  const getDuration = useCallback(() => {
    if (duration) return duration;
    switch (speed) {
      case 'slow':
        return 5;
      case 'fast':
        return 1.5;
      default:
        return 3;
    }
  }, [speed, duration]);

  // Animation control methods
  const start = useCallback(() => {
    if (!enabled) return;
    setIsPlaying(true);
    animationStateRef.current = 'playing';
  }, [enabled]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    animationStateRef.current = 'stopped';
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    animationStateRef.current = 'paused';
  }, []);

  const resume = useCallback(() => {
    if (animationStateRef.current === 'paused') {
      setIsPlaying(true);
      animationStateRef.current = 'playing';
    }
  }, []);

  const restart = useCallback(() => {
    stop();
    // Use RAF to ensure the stop state is applied before starting
    requestAnimationFrame(() => {
      start();
    });
  }, [start, stop]);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (!enabled) return;
    setIsHovering(true);
    
    // Handle shine border
    if (hoverOnly) {
      start();
    }
    
    // Handle Aceternity hover gradient
    if (enableHoverGradient) {
      setIsHoverGradientActive(true);
      // Stop direction rotation when hovering
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    }
  }, [enabled, hoverOnly, start, enableHoverGradient]);

  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;
    setIsHovering(false);
    
    // Handle shine border
    if (hoverOnly) {
      stop();
    }
    
    // Handle Aceternity hover gradient
    if (enableHoverGradient) {
      setIsHoverGradientActive(false);
      // Resume direction rotation
      if (!isHoverGradientActive) {
        hoverIntervalRef.current = setInterval(() => {
          setHoverDirection((prevState) => rotateDirection(prevState));
        }, hoverDuration * 1000);
      }
    }
  }, [enabled, hoverOnly, stop, enableHoverGradient, isHoverGradientActive, rotateDirection, hoverDuration]);

  // Auto-start effect
  useEffect(() => {
    if (enabled && autoStart && !hoverOnly) {
      start();
    }
  }, [enabled, autoStart, hoverOnly, start]);

  // Aceternity Hover Border Gradient: Direction rotation effect
  useEffect(() => {
    if (enableHoverGradient && !isHoverGradientActive) {
      hoverIntervalRef.current = setInterval(() => {
        setHoverDirection((prevState) => rotateDirection(prevState));
      }, hoverDuration * 1000);
      
      return () => {
        if (hoverIntervalRef.current) {
          clearInterval(hoverIntervalRef.current);
        }
      };
    }
    return () => {
      // Cleanup function for when effect conditions are not met
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, [enableHoverGradient, isHoverGradientActive, rotateDirection, hoverDuration]);

  // Generate CSS class names
  const classNames = enabled
    ? [
      'shine-border',
      `shine-border--${pattern}`,
      `shine-border--${intensity}`,
      `shine-border--${theme}`,
      `shine-border--${speed}`,
      !isPlaying ? 'shine-border--paused' : '',
      hoverOnly && !isHovering ? 'shine-border--hidden' : '',
      enableHoverGradient ? 'hover-border-gradient' : '',
      enableHoverGradient ? `hover-border-gradient--${hoverGradientTheme}` : '',
    ]
      .filter(Boolean)
      .join(' ')
    : '';

  // Aceternity Hover Border Gradient: Generate background style
  const hoverGradientMaps = getHoverGradientMaps();
  const hoverBackgroundStyle = enableHoverGradient
    ? isHoverGradientActive
      ? `linear-gradient(${hoverGradientMaps.moving}, ${hoverGradientMaps.highlight})`
      : hoverGradientMaps.moving
    : '';

  // Aceternity Hover Border Gradient: Container class names
  const hoverContainerClassName = enableHoverGradient
    ? [
      'relative flex rounded-full border content-center transition duration-500',
      'bg-black/20 hover:bg-black/10 dark:bg-white/20',
      'items-center flex-col flex-nowrap gap-10 h-min justify-center',
      'overflow-visible p-px decoration-clone w-fit',
    ].join(' ')
    : '';

  // Generate CSS custom properties
  const style: CSSPropertiesWithShineVars = enabled
    ? {
      '--shine-duration': `${getDuration()}s`,
      '--border-width': `${borderWidth}px`,
      ...(color && { '--shine-color': color }),
      ...(blur !== undefined && { '--shine-blur': `${blur}px` }),
      // Pattern-specific custom properties
      ...(pattern === 'pulse' && {
        '--pulse-origin-x': '50%',
        '--pulse-origin-y': '50%',
      }),
      ...(pattern === 'wave' && {
        '--wave-direction': '45deg',
      }),
      ...(pattern === 'spiral' && {
        '--spiral-start': '0deg',
      }),
      ...(pattern === 'orbital' && {
        '--orbital-angle': '0deg',
      }),
    }
    : {};

  return {
    elementRef: useRef<HTMLElement | null>(null),
    isPlaying,
    isAnimating: isPlaying, // Alias for compatibility
    classNames,
    cssClasses: classNames, // Alias for compatibility
    style,
    controls: {
      start,
      stop,
      pause,
      resume,
      restart,
    },
    // Individual methods for compatibility
    start,
    stop,
    restart,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    // Aceternity Hover Border Gradient
    hoverGradient: {
      isHovered: isHoverGradientActive,
      direction: hoverDirection,
      backgroundStyle: hoverBackgroundStyle,
      containerClassName: hoverContainerClassName,
    },
  };
}

// Export types for external use
export type { 
  ShineBorderAnimationConfig, 
  ShineBorderAnimationReturn,
  HoverDirection,
  HoverGradientTheme,
  ShinePattern,
  ShineIntensity,
  ShineTheme,
  ShineSpeed,
};
