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
}

interface ShineBorderAnimationReturn {
  /** Ref to attach to the element */
  elementRef: React.RefObject<HTMLElement>;
  /** Whether animation is currently playing */
  isPlaying: boolean;
  /** CSS class names to apply */
  classNames: string;
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
  /** Event handlers */
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

export function useShineBorderAnimation(
  config: ShineBorderAnimationConfig = {}
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
    loop = true,
    hoverOnly = false,
  } = config;

  const elementRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoStart && !hoverOnly);
  const [isHovering, setIsHovering] = useState(false);
  const animationStateRef = useRef<'playing' | 'paused' | 'stopped'>(
    autoStart && !hoverOnly ? 'playing' : 'stopped'
  );

  // Duration mapping based on speed
  const getDuration = useCallback(() => {
    if (duration) return duration;
    switch (speed) {
      case 'slow': return 5;
      case 'fast': return 1.5;
      default: return 3;
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
    if (hoverOnly) {
      start();
    }
  }, [enabled, hoverOnly, start]);

  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;
    setIsHovering(false);
    if (hoverOnly) {
      stop();
    }
  }, [enabled, hoverOnly, stop]);

  // Auto-start effect
  useEffect(() => {
    if (enabled && autoStart && !hoverOnly) {
      start();
    }
  }, [enabled, autoStart, hoverOnly, start]);

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
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  // Generate CSS custom properties
  const style: React.CSSProperties = enabled
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
    elementRef,
    isPlaying,
    classNames,
    style,
    controls: {
      start,
      stop,
      pause,
      resume,
      restart,
    },
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}
