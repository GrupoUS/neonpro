import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ReducedMotionContextType {
  reducedMotion: boolean
  toggleReducedMotion: () => void
  setReducedMotion: (enabled: boolean) => void
  motionLevel: 'none' | 'reduced' | 'normal'
  setMotionLevel: (level: 'none' | 'reduced' | 'normal') => void
  prefersReducedMotion: boolean
}

const ReducedMotionContext = createContext<ReducedMotionContextType | undefined>(undefined)

interface ReducedMotionProviderProps {
  children: ReactNode
  defaultEnabled?: boolean
  respectSystemPreference?: boolean
  persistPreference?: boolean
}

export const ReducedMotionProvider: React.FC<ReducedMotionProviderProps> = ({
  children,
  defaultEnabled = false,
  respectSystemPreference = true,
  persistPreference = true,
}) => {
  const [reducedMotion, setReducedMotionState] = useState(defaultEnabled)
  const [motionLevel, setMotionLevelState] = useState<'none' | 'reduced' | 'normal'>('normal')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check system preference for reduced motion
  useEffect(() => {
    if (respectSystemPreference) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
        if (respectSystemPreference && e.matches) {
          setReducedMotionState(true)
          setMotionLevelState('reduced')
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [respectSystemPreference])

  // Load preference from localStorage on mount
  useEffect(() => {
    if (persistPreference) {
      try {
        const saved = localStorage.getItem('reduced-motion')
        const savedLevel = localStorage.getItem('motion-level')
        if (saved) {
          setReducedMotionState(saved === 'true')
        }
        if (savedLevel && ['none', 'reduced', 'normal'].includes(savedLevel)) {
          setMotionLevelState(savedLevel as 'none' | 'reduced' | 'normal')
        }
      } catch (error) {
        console.warn('Failed to load reduced motion preference:', error)
      }
    }
  }, [persistPreference])

  // Apply reduced motion classes to document
  useEffect(() => {
    const root = document.documentElement
    
    if (reducedMotion || prefersReducedMotion) {
      root.classList.add('reduced-motion')
      root.setAttribute('data-motion-level', motionLevel)
      
      // Apply specific motion level classes
      root.classList.remove('motion-none', 'motion-reduced', 'motion-normal')
      root.classList.add(`motion-${motionLevel}`)
      
      // Disable animations for healthcare applications when requested
      if (motionLevel === 'none') {
        root.style.setProperty('--animation-duration', '0ms')
        root.style.setProperty('--transition-duration', '0ms')
      } else if (motionLevel === 'reduced') {
        root.style.setProperty('--animation-duration', '0.3s')
        root.style.setProperty('--transition-duration', '0.2s')
      } else {
        root.style.removeProperty('--animation-duration')
        root.style.removeProperty('--transition-duration')
      }
    } else {
      root.classList.remove('reduced-motion', 'motion-none', 'motion-reduced', 'motion-normal')
      root.removeAttribute('data-motion-level')
      
      // Reset custom styles
      root.style.removeProperty('--animation-duration')
      root.style.removeProperty('--transition-duration')
    }

    // Announce to screen readers
    const announcer = document.createElement('div')
    announcer.setAttribute('role', 'status')
    announcer.setAttribute('aria-live', 'polite')
    announcer.className = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
    announcer.textContent = reducedMotion || prefersReducedMotion 
      ? `Reduced motion enabled, ${motionLevel} motion level` 
      : 'Reduced motion disabled'
    
    document.body.appendChild(announcer)
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }, [reducedMotion, motionLevel, prefersReducedMotion])

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion
    setReducedMotionState(newValue)
    
    if (persistPreference) {
      try {
        localStorage.setItem('reduced-motion', newValue.toString())
      } catch (error) {
        console.warn('Failed to save reduced motion preference:', error)
      }
    }
  }

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled)
    
    if (persistPreference) {
      try {
        localStorage.setItem('reduced-motion', enabled.toString())
      } catch (error) {
        console.warn('Failed to save reduced motion preference:', error)
      }
    }
  }

  const setMotionLevel = (level: 'none' | 'reduced' | 'normal') => {
    setMotionLevelState(level)
    
    if (persistPreference) {
      try {
        localStorage.setItem('motion-level', level)
      } catch (error) {
        console.warn('Failed to save motion level preference:', error)
      }
    }
  }

  const value: ReducedMotionContextType = {
    reducedMotion: reducedMotion || prefersReducedMotion,
    toggleReducedMotion,
    setReducedMotion,
    motionLevel,
    setMotionLevel,
    prefersReducedMotion,
  }

  return (
    <ReducedMotionContext.Provider value={value}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

export const useReducedMotion = (): ReducedMotionContextType => {
  const context = useContext(ReducedMotionContext)
  if (context === undefined) {
    throw new Error('useReducedMotion must be used within a ReducedMotionProvider')
  }
  return context
}

// Reduced motion toggle button component
interface ReducedMotionToggleProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'switch' | 'icon'
}

export const ReducedMotionToggle: React.FC<ReducedMotionToggleProps> = ({
  className,
  showLabel = false,
  size = 'md',
  variant = 'button',
}) => {
  const { reducedMotion, toggleReducedMotion, motionLevel, prefersReducedMotion } = useReducedMotion()

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

  const getMotionIcon = () => {
    if (prefersReducedMotion) return '⚙️' // System preference
    switch (motionLevel) {
      case 'none':
        return '🚫'
      case 'reduced':
        return '🐌'
      case 'normal':
        return '🏃'
      default:
        return '🏃'
    }
  }

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-sm font-medium">
          {showLabel && 'Reduced Motion'}
        </span>
        <button
          onClick={toggleReducedMotion}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
          )}
          role="switch"
          aria-checked={reducedMotion}
          aria-label={reducedMotion ? 'Disable reduced motion' : 'Enable reduced motion'}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              reducedMotion ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <span className="text-xs" aria-hidden="true">
          {getMotionIcon()}
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={toggleReducedMotion}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        reducedMotion && 'border-2 border-blue-600 bg-blue-50 text-blue-900',
        prefersReducedMotion && 'border-2 border-orange-600 bg-orange-50 text-orange-900',
        className
      )}
      aria-pressed={reducedMotion}
      aria-label={reducedMotion ? 'Disable reduced motion' : 'Enable reduced motion'}
    >
      <span className={iconSizes[size]} aria-hidden="true">
        {getMotionIcon()}
      </span>
      {showLabel && (
        <span>
          {prefersReducedMotion ? 'System Reduced Motion' : 
           reducedMotion ? 'Reduced Motion On' : 'Reduced Motion Off'}
        </span>
      )}
    </button>
  )
}

// Motion level selector component
interface MotionLevelSelectorProps {
  className?: string
  showLabel?: boolean
}

export const MotionLevelSelector: React.FC<MotionLevelSelectorProps> = ({
  className,
  showLabel = false,
}) => {
  const { motionLevel, setMotionLevel, prefersReducedMotion } = useReducedMotion()

  const levels = [
    { value: 'none', label: 'No Motion', icon: '🚫', description: 'Disable all animations' },
    { value: 'reduced', label: 'Reduced', icon: '🐌', description: 'Minimal animations' },
    { value: 'normal', label: 'Normal', icon: '🏃', description: 'Full animations' },
  ] as const

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">
          Motion Level
        </label>
      )}
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => setMotionLevel(level.value)}
            disabled={prefersReducedMotion}
            className={cn(
              'flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
              motionLevel === level.value && 'border-blue-600 bg-blue-50 text-blue-900',
              prefersReducedMotion && 'border-orange-600 bg-orange-50 text-orange-900'
            )}
            aria-pressed={motionLevel === level.value}
            aria-label={`${level.label} motion level`}
            title={level.description}
          >
            <span aria-hidden="true">{level.icon}</span>
            <span>{level.label}</span>
          </button>
        ))}
      </div>
      {prefersReducedMotion && (
        <p className="text-xs text-orange-600">
          System preference enabled - motion level controlled by operating system
        </p>
      )}
    </div>
  )
}

// Reduced motion styles for healthcare applications
export const reducedMotionStyles = `
  /* Reduced motion styles */
  .reduced-motion {
    --animation-duration: 0.3s;
    --transition-duration: 0.2s;
  }

  .motion-none {
    --animation-duration: 0ms;
    --transition-duration: 0ms;
  }

  .motion-reduced {
    --animation-duration: 0.3s;
    --transition-duration: 0.2s;
  }

  .motion-normal {
    --animation-duration: var(--default-animation-duration, 0.5s);
    --transition-duration: var(--default-transition-duration, 0.3s);
  }

  /* Disable animations when reduced motion is preferred */
  .reduced-motion * {
    animation-duration: var(--animation-duration) !important;
    transition-duration: var(--transition-duration) !important;
  }

  /* Healthcare-specific reduced motion styles */
  .reduced-motion .animate-pulse {
    animation: none !important;
    background-color: inherit !important;
  }

  .reduced-motion .emergency-alert {
    animation: none !important;
    border-width: 3px !important;
  }

  .reduced-motion .focus-visible:ring-2:focus-visible {
    outline: 2px solid currentColor !important;
    outline-offset: 2px !important;
  }

  /* Screen reader only content for motion changes */
  .motion-announcement {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`

export type { ReducedMotionProviderProps, ReducedMotionToggleProps, MotionLevelSelectorProps }
export default ReducedMotionProvider