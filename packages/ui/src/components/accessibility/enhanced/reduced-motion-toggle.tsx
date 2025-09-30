import React from 'react'
import { cn } from '../../../lib/utils'
import { useAccessibility } from './accessibility-provider'

interface ReducedMotionToggleProps {
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'switch' | 'button'
  className?: string
}

export const ReducedMotionToggle: React.FC<ReducedMotionToggleProps> = ({
  showLabel = true,
  size = 'md',
  variant = 'switch',
  className,
}) => {
  const { reducedMotion, toggleReducedMotion, motionLevel, setMotionLevel } = useAccessibility()

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const handleToggle = () => {
    toggleReducedMotion()
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2 transition-colors',
          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
          reducedMotion && 'bg-blue-600 text-white hover:bg-blue-700',
          className
        )}
        aria-label={reducedMotion ? 'Enable animations' : 'Reduce animations'}
        title={reducedMotion ? 'Enable animations' : 'Reduce animations'}
      >
        <svg
          className={sizeClasses[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {reducedMotion ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>
        {showLabel && (
          <span className={cn('ml-2', labelSizeClasses[size])}>
            {reducedMotion ? 'Reduced Motion On' : 'Reduced Motion Off'}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'bg-gray-100 text-gray-900 hover:bg-gray-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          reducedMotion && 'bg-blue-600 text-white hover:bg-blue-700',
          className
        )}
      >
        <svg
          className={cn('mr-2', sizeClasses[size])}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {reducedMotion ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>
        {showLabel && (
          <span className={labelSizeClasses[size]}>
            {reducedMotion ? 'Reduced Motion On' : 'Reduced Motion Off'}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          reducedMotion ? 'bg-blue-600' : 'bg-gray-200',
          className
        )}
        role="switch"
        aria-checked={reducedMotion}
        aria-label="Toggle reduced motion"
      >
        <span className="sr-only">Toggle reduced motion</span>
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            reducedMotion ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {showLabel && (
        <span className={cn(labelSizeClasses[size], 'text-gray-700')}>
          Reduced Motion
        </span>
      )}
    </div>
  )
}