'use client';

import * as React from 'react';

import { cn } from '@/lib/utils.ts';

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
   * @default "#AC9469"
   */
  shineColor?: string | string[];
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 * Official MagicUI implementation optimized for NeonPro golden color scheme.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = '#AC9469', // NeonPro golden color as default
  className,
  style,
  ...props
}: ShineBorderProps) {
  const colorValue = Array.isArray(shineColor) ? shineColor.join(',') : shineColor;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] z-0 overflow-hidden',
        className,
      )}
      style={{
        '--border-width': `${borderWidth}px`,
        '--duration': `${duration}s`,
        '--shine-color': colorValue,
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {/* Top Border */}
      <div
        className='absolute top-0 left-0 w-full h-[2px] opacity-0'
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${colorValue} 50%, transparent 100%)`,
          animation: `shine-top ${duration}s infinite linear`,
        }}
      />

      {/* Right Border */}
      <div
        className='absolute top-0 right-0 w-[2px] h-full opacity-0'
        style={{
          background:
            `linear-gradient(180deg, transparent 0%, ${colorValue} 50%, transparent 100%)`,
          animation: `shine-right ${duration}s infinite linear`,
        }}
      />

      {/* Bottom Border */}
      <div
        className='absolute bottom-0 right-0 w-full h-[2px] opacity-0'
        style={{
          background:
            `linear-gradient(270deg, transparent 0%, ${colorValue} 50%, transparent 100%)`,
          animation: `shine-bottom ${duration}s infinite linear`,
        }}
      />

      {/* Left Border */}
      <div
        className='absolute bottom-0 left-0 w-[2px] h-full opacity-0'
        style={{
          background: `linear-gradient(0deg, transparent 0%, ${colorValue} 50%, transparent 100%)`,
          animation: `shine-left ${duration}s infinite linear`,
        }}
      />
    </div>
  );
}
