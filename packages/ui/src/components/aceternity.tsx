import * as React from 'react'
import { forwardRef } from 'react'

export interface HoverBorderGradientProps {
  children: React.ReactNode
  theme?: 'blue' | 'neonpro' | 'aesthetic' | 'green' | 'purple' | 'gold' | 'silver'
  duration?: number
  clockwise?: boolean
  as?: React.ElementType
  className?: string
}

export const HoverBorderGradient = forwardRef<HTMLDivElement, HoverBorderGradientProps>(
  ({ children, theme = 'blue', duration = 2, clockwise = true, as: Component = 'div', className = '', ...props }, ref) => {
    const themeColors = {
      blue: 'from-blue-400 via-cyan-400 to-blue-400',
      neonpro: 'from-amber-400 via-orange-400 to-pink-400',
      aesthetic: 'from-purple-400 via-pink-400 to-purple-400',
      green: 'from-green-400 via-emerald-400 to-green-400',
      purple: 'from-purple-400 via-violet-400 to-purple-400',
      gold: 'from-amber-400 via-yellow-400 to-amber-400',
      silver: 'from-gray-300 via-gray-200 to-gray-300'
    }

    return (
      <Component
        ref={ref}
        className={`
          relative overflow-hidden rounded-lg border-2 border-transparent
          bg-gradient-to-r ${themeColors[theme as keyof typeof themeColors]}
          bg-[length:200%_100%] bg-[position:0%_50%]
          transition-all duration-1000 ease-in-out
          hover:bg-[position:100%_50%]
          ${className}
        `}
        style={{
          animationDuration: `${duration}s`,
          animationDirection: clockwise ? 'normal' : 'reverse'
        }}
        {...props}
      >
        <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg" />
        <div className="relative z-10 p-4">
          {children}
        </div>
      </Component>
    )
  }
)

HoverBorderGradient.displayName = 'HoverBorderGradient'

export interface EnhancedShineBorderProps {
  children: React.ReactNode
  enableShine?: boolean
  enableHoverGradient?: boolean
  pattern?: 'linear' | 'wave' | 'orbital' | 'pulse'
  theme?: 'gold' | 'silver' | 'purple' | 'blue' | 'green'
  hoverGradientTheme?: 'neonpro' | 'aesthetic' | 'purple' | 'blue' | 'green'
  intensity?: 'normal' | 'vibrant' | 'subtle'
  speed?: 'slow' | 'normal' | 'fast'
  duration?: number
  hoverOnly?: boolean
  as?: React.ElementType
  className?: string
}

export const EnhancedShineBorder = forwardRef<HTMLDivElement, EnhancedShineBorderProps>(
  ({
    children,
    enableShine = true,
    enableHoverGradient = true,
    pattern = 'linear',
    theme = 'gold',
    hoverGradientTheme = 'neonpro',
    intensity = 'normal',
    speed = 'normal',
    duration = 3,
    hoverOnly = false,
    as: Component = 'div',
    className = '',
    ...props
  }, ref) => {
    const themeColors = {
      gold: 'from-amber-400 via-yellow-300 to-amber-400',
      silver: 'from-gray-300 via-gray-100 to-gray-300',
      purple: 'from-purple-400 via-violet-300 to-purple-400',
      blue: 'from-blue-400 via-cyan-300 to-blue-400',
      green: 'from-green-400 via-emerald-300 to-green-400'
    }

    const hoverThemeColors = {
      neonpro: 'from-amber-400 via-orange-400 to-pink-400',
      aesthetic: 'from-purple-400 via-pink-400 to-purple-400',
      purple: 'from-purple-400 via-violet-400 to-purple-400',
      blue: 'from-blue-400 via-cyan-400 to-blue-400',
      green: 'from-green-400 via-emerald-400 to-green-400'
    }

    const speedDuration = {
      slow: duration * 1.5,
      normal: duration,
      fast: duration * 0.7
    }

    const intensityOpacity = {
      subtle: 'opacity-30',
      normal: 'opacity-50',
      vibrant: 'opacity-70'
    }

    return (
      <Component
        ref={ref}
        className={`
          relative overflow-hidden rounded-lg border-2
          ${enableShine ? `bg-gradient-to-r ${themeColors[theme as keyof typeof themeColors]}` : 'bg-gray-100'}
          ${hoverOnly ? '' : `${intensityOpacity[intensity as keyof typeof intensityOpacity]}`}
          ${className}
        `}
        {...props}
      >
        {enableShine && !hoverOnly && (
          <div
            className={`
              absolute inset-0 bg-gradient-to-r ${themeColors[theme as keyof typeof themeColors]}
              ${intensityOpacity[intensity as keyof typeof intensityOpacity]}
            `}
            style={{
              animation: `shine ${speedDuration[speed as keyof typeof speedDuration]}s linear infinite`,
              backgroundSize: '200% 100%'
            }}
          />
        )}

        {enableHoverGradient && (
          <div
            className={`
              absolute inset-0 bg-gradient-to-r ${hoverThemeColors[hoverGradientTheme as keyof typeof hoverThemeColors]}
              opacity-0 hover:opacity-100 transition-opacity duration-500
            `}
          />
        )}

        <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg m-0.5 p-4">
          {children}
        </div>

      </Component>
    )
  }
)

EnhancedShineBorder.displayName = 'EnhancedShineBorder'
