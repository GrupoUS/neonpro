import * as React from 'react'
import { forwardRef } from 'react'

export interface ShineBorderProps {
  children: React.ReactNode
  theme?: 'gold' | 'silver' | 'blue' | 'neonpro-primary' | 'aesthetic-gold' | 'beauty-rainbow' | 'purple' | 'green'
  pattern?: 'linear' | 'wave' | 'orbital'
  intensity?: 'normal' | 'vibrant' | 'subtle'
  speed?: 'slow' | 'normal' | 'fast'
  duration?: number
  className?: string
}

export const ShineBorder = forwardRef<HTMLDivElement, ShineBorderProps>(
  ({
    children,
    theme = 'gold',
    pattern = 'linear',
    intensity = 'normal',
    speed = 'normal',
    duration = 3,
    className = '',
    ...props
  }, ref) => {
    const themeColors = {
      gold: 'from-amber-400 via-yellow-300 to-amber-400',
      silver: 'from-gray-300 via-gray-100 to-gray-300',
      blue: 'from-blue-400 via-cyan-300 to-blue-400',
      'neonpro-primary': 'from-amber-400 via-orange-300 to-pink-400',
      'aesthetic-gold': 'from-amber-400 via-orange-300 to-amber-400',
      'beauty-rainbow': 'from-purple-400 via-pink-300 to-purple-400',
      purple: 'from-purple-400 via-violet-300 to-purple-400',
      green: 'from-green-400 via-emerald-300 to-green-400'
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

    const animationStyle = {
      animationDuration: `${speedDuration[speed as keyof typeof speedDuration]}s`,
      backgroundSize: '200% 100%'
    }

    return (
      <div
        ref={ref}
        className={`
          relative overflow-hidden rounded-lg border-2 border-gray-200
          bg-gradient-to-r ${themeColors[theme as keyof typeof themeColors]}
          ${intensityOpacity[intensity]}
          ${className}
        `}
        {...props}
      >
        <div
          className={`
            absolute inset-0 bg-gradient-to-r ${themeColors[theme as keyof typeof themeColors]}
            ${intensityOpacity[intensity as keyof typeof intensityOpacity]}
          `}
          style={animationStyle}
        />

        <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg m-0.5 p-4">
          {children}
        </div>
      </div>
    )
  }
)

ShineBorder.displayName = 'ShineBorder'
