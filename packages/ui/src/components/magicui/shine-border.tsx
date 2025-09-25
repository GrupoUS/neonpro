'use client'

import React from 'react'
import { cn } from '../../utils'
import './shine-border.css'

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The width of the border in pixels
   * @default 1
   */
  borderWidth?: number
  /**
   * The border radius of the shine border
   * @default 8
   */
  borderRadius?: number
  /**
   * The duration of the animation in seconds
   * @default 14
   */
  duration?: number
  /**
   * The color(s) of the shine border
   * Can be a single color or an array of colors
   * @default "#000000"
   */
  shineColor?: string | string[]
  /**
   * Background color of the component
   * @default "white"
   */
  background?: string
  /**
   * Animation pattern
   * @default "linear"
   */
  pattern?: 'linear' | 'wave' | 'orbital'
  /**
   * Animation intensity
   * @default "normal"
   */
  intensity?: 'subtle' | 'normal' | 'vibrant'
  /**
   * Animation speed
   * @default "normal"
   */
  speed?: 'slow' | 'normal' | 'fast'
  /**
   * Color theme
   * @default "gold"
   */
  theme?:
    | 'gold'
    | 'silver'
    | 'copper'
    | 'blue'
    | 'purple'
    | 'green'
    | 'red'
    | 'neonpro-primary'
    | 'neonpro-secondary'
    | 'neonpro-accent'
    | 'aesthetic-gold'
    | 'beauty-rainbow'
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * The content to render inside the border
   */
  children?: React.ReactNode
  /**
   * Disable the shine effect
   * @default false
   */
  disabled?: boolean
}

export function ShineBorder({
  borderWidth = 1,
  borderRadius = 8,
  duration = 14,
  shineColor,
  background = 'white',
  pattern = 'linear',
  intensity = 'normal',
  speed = 'normal',
  theme = 'gold',
  className,
  children,
  disabled = false,
  ...props
}: ShineBorderProps) {
  // Generate class names for the shine effect
  const shineClasses = cn(
    'shine-border',
    !disabled && [
      `shine-border--${pattern}`,
      `shine-border--${intensity}`,
      `shine-border--${speed}`,
      shineColor ? '' : `shine-border--${theme}`,
    ],
    className,
  )

  return (
    <div
      className={cn('relative flex overflow-hidden', shineClasses)}
      style={{
        '--border-width': `${borderWidth}px`,
        '--shine-duration': `${duration}s`,
        '--shine-color': shineColor
          ? Array.isArray(shineColor)
            ? shineColor.join(', ')
            : shineColor
          : undefined,
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
      } as React.CSSProperties}
      {...props}
    >
      {/* Content Container */}
      <div
        className='relative z-[1] flex h-full w-full items-center justify-center overflow-hidden'
        style={{
          backgroundColor: background,
          borderRadius: `${Math.max(0, borderRadius - borderWidth)}px`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

ShineBorder.displayName = 'ShineBorder'

export type { ShineBorderProps }
export default ShineBorder
