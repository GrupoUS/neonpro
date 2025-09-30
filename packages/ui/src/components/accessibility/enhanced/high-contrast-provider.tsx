import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface HighContrastContextType {
  highContrast: boolean
  toggleHighContrast: () => void
  setHighContrast: (enabled: boolean) => void
  contrastLevel: 'normal' | 'high' | 'maximum'
  setContrastLevel: (level: 'normal' | 'high' | 'maximum') => void
}

const HighContrastContext = createContext<HighContrastContextType | undefined>(undefined)

interface HighContrastProviderProps {
  children: ReactNode
  defaultEnabled?: boolean
  persistPreference?: boolean
}

export const HighContrastProvider: React.FC<HighContrastProviderProps> = ({
  children,
  defaultEnabled = false,
  persistPreference = true,
}) => {
  const [highContrast, setHighContrastState] = useState(defaultEnabled)
  const [contrastLevel, setContrastLevelState] = useState<'normal' | 'high' | 'maximum'>('high')

  // Load preference from localStorage on mount
  useEffect(() => {
    if (persistPreference) {
      try {
        const saved = localStorage.getItem('high-contrast')
        const savedLevel = localStorage.getItem('contrast-level')
        if (saved) {
          setHighContrastState(saved === 'true')
        }
        if (savedLevel && ['normal', 'high', 'maximum'].includes(savedLevel)) {
          setContrastLevelState(savedLevel as 'normal' | 'high' | 'maximum')
        }
      } catch (error) {
        console.warn('Failed to load high contrast preference:', error)
      }
    }
  }, [persistPreference])

  // Apply high contrast classes to document
  useEffect(() => {
    const root = document.documentElement
    
    if (highContrast) {
      root.classList.add('high-contrast')
      root.setAttribute('data-contrast-level', contrastLevel)
      
      // Apply specific contrast level classes
      root.classList.remove('contrast-normal', 'contrast-high', 'contrast-maximum')
      root.classList.add(`contrast-${contrastLevel}`)
      
      // Increase contrast for healthcare applications
      if (contrastLevel === 'maximum') {
        root.style.setProperty('--tw-border-opacity', '1')
        root.style.setProperty('--tw-text-opacity', '1')
        root.style.setProperty('--tw-bg-opacity', '1')
      }
    } else {
      root.classList.remove('high-contrast', 'contrast-normal', 'contrast-high', 'contrast-maximum')
      root.removeAttribute('data-contrast-level')
      
      // Reset custom styles
      root.style.removeProperty('--tw-border-opacity')
      root.style.removeProperty('--tw-text-opacity')
      root.style.removeProperty('--tw-bg-opacity')
    }

    // Announce to screen readers
    const announcer = document.createElement('div')
    announcer.setAttribute('role', 'status')
    announcer.setAttribute('aria-live', 'polite')
    announcer.className = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
    announcer.textContent = highContrast 
      ? `High contrast mode enabled, ${contrastLevel} contrast level` 
      : 'High contrast mode disabled'
    
    document.body.appendChild(announcer)
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }, [highContrast, contrastLevel])

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrastState(newValue)
    
    if (persistPreference) {
      try {
        localStorage.setItem('high-contrast', newValue.toString())
      } catch (error) {
        console.warn('Failed to save high contrast preference:', error)
      }
    }
  }

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled)
    
    if (persistPreference) {
      try {
        localStorage.setItem('high-contrast', enabled.toString())
      } catch (error) {
        console.warn('Failed to save high contrast preference:', error)
      }
    }
  }

  const setContrastLevel = (level: 'normal' | 'high' | 'maximum') => {
    setContrastLevelState(level)
    
    if (persistPreference) {
      try {
        localStorage.setItem('contrast-level', level)
      } catch (error) {
        console.warn('Failed to save contrast level preference:', error)
      }
    }
  }

  const value: HighContrastContextType = {
    highContrast,
    toggleHighContrast,
    setHighContrast,
    contrastLevel,
    setContrastLevel,
  }

  return (
    <HighContrastContext.Provider value={value}>
      {children}
    </HighContrastContext.Provider>
  )
}

export const useHighContrast = (): HighContrastContextType => {
  const context = useContext(HighContrastContext)
  if (context === undefined) {
    throw new Error('useHighContrast must be used within a HighContrastProvider')
  }
  return context
}

// High contrast toggle button component
interface HighContrastToggleProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'switch' | 'icon'
}

export const HighContrastToggle: React.FC<HighContrastToggleProps> = ({
  className,
  showLabel = false,
  size = 'md',
  variant = 'button',
}) => {
  const { highContrast, toggleHighContrast, contrastLevel } = useHighContrast()

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const getContrastIcon = () => {
    switch (contrastLevel) {
      case 'normal':
        return '🔆'
      case 'high':
        return '🔅'
      case 'maximum':
        return '⚡'
      default:
        return '🔆'
    }
  }

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-sm font-medium">
          {showLabel && 'High Contrast'}
        </span>
        <button
          onClick={toggleHighContrast}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            highContrast ? 'bg-blue-600' : 'bg-gray-200'
          )}
          role="switch"
          aria-checked={highContrast}
          aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              highContrast ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <span className="text-xs" aria-hidden="true">
          {getContrastIcon()}
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={toggleHighContrast}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        highContrast && 'border-2 border-blue-600 bg-blue-50 text-blue-900',
        className
      )}
      aria-pressed={highContrast}
      aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
    >
      <span className={iconSizes[size]} aria-hidden="true">
        {getContrastIcon()}
      </span>
      {showLabel && (
        <span>
          {highContrast ? 'High Contrast On' : 'High Contrast Off'}
        </span>
      )}
    </button>
  )
}

// High contrast mode styles for healthcare applications
export const highContrastStyles = `
  /* High contrast mode styles */
  .high-contrast {
    --tw-border-opacity: 1 !important;
    --tw-text-opacity: 1 !important;
    --tw-bg-opacity: 1 !important;
  }

  .contrast-normal {
    --contrast-ratio: 4.5;
  }

  .contrast-high {
    --contrast-ratio: 7;
  }

  .contrast-maximum {
    --contrast-ratio: 21;
  }

  .high-contrast .border-input {
    border-color: hsl(0 0% 0%) !important;
    border-width: 2px !important;
  }

  .high-contrast .bg-background {
    background-color: hsl(0 0% 100%) !important;
  }

  .high-contrast .text-foreground {
    color: hsl(0 0% 0%) !important;
  }

  .high-contrast .text-muted-foreground {
    color: hsl(0 0% 30%) !important;
  }

  .high-contrast .bg-destructive {
    background-color: hsl(0 84% 30%) !important;
  }

  .high-contrast .text-destructive {
    color: hsl(0 84% 30%) !important;
  }

  .high-contrast .bg-primary {
    background-color: hsl(221 83% 30%) !important;
  }

  .high-contrast .text-primary {
    color: hsl(221 83% 30%) !important;
  }

  /* Emergency alerts in high contrast */
  .high-contrast .border-red-600 {
    border-color: hsl(0 84% 30%) !important;
    border-width: 3px !important;
  }

  .high-contrast .bg-red-50 {
    background-color: hsl(0 84% 90%) !important;
  }

  .high-contrast .text-red-700 {
    color: hsl(0 84% 30%) !important;
    font-weight: 700 !important;
  }

  /* Healthcare-specific high contrast styles */
  .high-contrast [data-healthcare="true"] {
    border-width: 2px !important;
    border-color: hsl(0 0% 0%) !important;
  }

  .high-contrast [data-sensitive="true"] {
    background-color: hsl(60 100% 90%) !important;
    border-color: hsl(60 100% 30%) !important;
  }
`

export type { HighContrastProviderProps, HighContrastToggleProps }
export default HighContrastProvider