import React from 'react'
import { cn } from '../../../lib/utils'
import { useAccessibility } from './accessibility-provider'

interface HighContrastToggleProps {
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'switch' | 'button'
  className?: string
}

export const HighContrastToggle: React.FC<HighContrastToggleProps> = ({
  showLabel = true,
  size = 'md',
  variant = 'switch',
  className,
}) => {
  const { highContrast, toggleHighContrast, contrastLevel, setContrastLevel } = useAccessibility()

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
    toggleHighContrast()
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2 transition-colors',
          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
          highContrast && 'bg-blue-600 text-white hover:bg-blue-700',
          className
        )}
        aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
        title={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
      >
        <svg
          className={sizeClasses[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {highContrast ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          )}
        </svg>
        {showLabel && (
          <span className={cn('ml-2', labelSizeClasses[size])}>
            {highContrast ? 'High Contrast On' : 'High Contrast Off'}
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
          highContrast && 'bg-blue-600 text-white hover:bg-blue-700',
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
          {highContrast ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          )}
        </svg>
        {showLabel && (
          <span className={labelSizeClasses[size]}>
            {highContrast ? 'High Contrast On' : 'High Contrast Off'}
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
          highContrast ? 'bg-blue-600' : 'bg-gray-200',
          className
        )}
        role="switch"
        aria-checked={highContrast}
        aria-label="Toggle high contrast mode"
      >
        <span className="sr-only">Toggle high contrast</span>
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            highContrast ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {showLabel && (
        <span className={cn(labelSizeClasses[size], 'text-gray-700')}>
          High Contrast
        </span>
      )}
    </div>
  )
}