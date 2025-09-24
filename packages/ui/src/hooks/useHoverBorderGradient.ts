/**
 * useHoverBorderGradient Hook
 * Provides mouse tracking functionality for hover border gradient animations
 * Inspired by AceternityUI effects with 60fps performance optimization
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Type for CSS custom properties
type CSSPropertiesWithVars = React.CSSProperties & {
  [key: `--${string}`]: string | number;
};

interface MousePosition {
  x: number;
  y: number;
}

interface HoverBorderGradientConfig {
  /** Enable/disable the hover border gradient effect */
  enabled?: boolean;
  /** Animation intensity (subtle, normal, vibrant) */
  intensity?: 'subtle' | 'normal' | 'vibrant';
  /** Gradient direction (left-right, top-bottom, diagonal-tl-br, diagonal-tr-bl, radial) */
  direction?:
    | 'left-right'
    | 'top-bottom'
    | 'diagonal-tl-br'
    | 'diagonal-tr-bl'
    | 'radial';
  /** Gradient color theme */
  theme?: 'gold' | 'silver' | 'copper' | 'blue' | 'purple' | 'green' | 'red';
  /** Animation speed (slow, normal, fast) */
  speed?: 'slow' | 'normal' | 'fast';
  /** Border width in pixels */
  borderWidth?: number;
  /** Custom gradient colors */
  colors?: string[];
  /** Debounce mouse tracking for performance (ms) */
  debounce?: number;
}

interface HoverBorderGradientReturn {
  /** Ref to attach to the element */
  elementRef: React.RefObject<HTMLElement | null>;
  /** Current mouse position relative to element */
  mousePosition: MousePosition;
  /** Whether mouse is currently hovering */
  isHovering: boolean;
  /** CSS class names to apply */
  classNames: string;
  /** CSS custom properties object */
  style: CSSPropertiesWithVars;
  /** Manual trigger methods */
  handlers: {
    onMouseEnter: (event: React.MouseEvent) => void;
    onMouseLeave: (event: React.MouseEvent) => void;
    onMouseMove: (event: React.MouseEvent) => void;
  };
}

export function useHoverBorderGradient(
  config: HoverBorderGradientConfig = {},
): HoverBorderGradientReturn {
  const {
    enabled = true,
    intensity = 'normal',
    direction = 'radial',
    theme = 'gold',
    speed = 'normal',
    borderWidth = 1,
    colors,
    debounce = 16, // ~60fps
  } = config;

  const elementRef = useRef<HTMLElement | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const [isHovering, setIsHovering] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Performance-optimized mouse tracking with RAF
  const updateMousePosition = useCallback(
    (event: React.MouseEvent) => {
      if (!enabled || !elementRef.current) {return;}

      // Cancel previous RAF if pending
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!elementRef.current) {return;}

        const rect = elementRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        setMousePosition({
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        });
      });
    },
    [enabled],
  );

  // Debounced mouse move handler
  const debouncedMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = window.setTimeout(() => {
        updateMousePosition(event);
      }, debounce);
    },
    [updateMousePosition, debounce],
  );

  // Event handlers
  const handleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      if (!enabled) {return;}
      setIsHovering(true);
      updateMousePosition(event);
    },
    [enabled, updateMousePosition],
  );

  const handleMouseLeave = useCallback(() => {
    if (!enabled) {return;}
    setIsHovering(false);
    setMousePosition({ x: 50, y: 50 }); // Reset to center
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Generate CSS class names
  const classNames = enabled
    ? [
      'hover-border-gradient',
      `hover-border-gradient--${intensity}`,
      `hover-border-gradient--${direction}`,
      `hover-border-gradient--${theme}`,
      `hover-border-gradient--${speed}`,
    ].join(' ')
    : '';

  // Generate CSS custom properties
  const style: CSSPropertiesWithVars = enabled
    ? {
      '--mouse-x': `${mousePosition.x}%`,
      '--mouse-y': `${mousePosition.y}%`,
      '--border-width': `${borderWidth}px`,
      ...(colors && {
        '--gradient-color-1': colors[0] || '#AC9469',
        '--gradient-color-2': colors[1] || '#D4AF37',
        '--gradient-color-3': colors[2] || '#FFD700',
      }),
    }
    : {};

  return {
    elementRef,
    mousePosition,
    isHovering,
    classNames,
    style,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseMove: debouncedMouseMove,
    },
  };
}

// Export types for external use
export type { HoverBorderGradientConfig, HoverBorderGradientReturn };
