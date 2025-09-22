'use client';

import * as React from 'react';

import { cn } from '@/components/ui';

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the border in pixels
   * @default 1
   */
  borderWidth?: number;
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number;
  /**
   * Color of the border, can be a single color or an array of colors
   * @default "#000000"
   */
  shineColor?: string | string[];
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 6,
  shineColor = '#AC9469',
  className,
  style,
  ...props
}: ShineBorderProps) {
  // Usar a cor dourada NeonPro original com efeito de rotação
  const goldColor = Array.isArray(shineColor) ? shineColor[0] : shineColor;

  return (
    <div
      style={{
        '--border-width': `${borderWidth}px`,
        '--duration': `${duration}s`,
        backgroundImage: `conic-gradient(
            from 0deg,
            transparent 0deg,
            ${goldColor} 90deg,
            transparent 180deg,
            transparent 270deg,
            ${goldColor} 360deg
          )`,
        mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        padding: 'var(--border-width)',
        ...style,
      } as React.CSSProperties}
      className={cn(
        'pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-transform motion-safe:animate-shine-rotate',
        className,
      )}
      {...props}
    />
  );
}
