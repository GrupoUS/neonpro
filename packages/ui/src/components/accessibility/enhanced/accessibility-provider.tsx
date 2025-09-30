import React, { createContext, useContext, ReactNode } from 'react'
import { cn } from '../../../lib/utils'
import { HighContrastProvider, useHighContrast } from './high-contrast-provider'
import { ReducedMotionProvider, useReducedMotion } from './reduced-motion-provider'
import { ScreenReaderAnnouncer, useAnnouncer } from './screen-reader-announcer'
import { HighContrastToggle } from './high-contrast-toggle'
import { ReducedMotionToggle } from './reduced-motion-toggle'

interface AccessibilityContextType {
  // High contrast
  highContrast: boolean
  toggleHighContrast: () => void
  setHighContrast: (enabled: boolean) => void
  contrastLevel: 'normal' | 'high' | 'maximum'
  setContrastLevel: (level: 'normal' | 'high' | 'maximum') => void
  
  // Reduced motion
  reducedMotion: boolean
  toggleReducedMotion: () => void
  setReducedMotion: (enabled: boolean) => void
  motionLevel: 'none' | 'reduced' | 'normal'
  setMotionLevel: (level: 'none' | 'reduced' | 'normal') => void
  prefersReducedMotion: boolean
  
  // Screen reader announcements
  announce: (text: string, priority?: 'polite' | 'assertive', timeout?: number) => void
  announceEmergency: (text: string) => void
  announcePatientUpdate: (action: string, patientId?: string) => void
  announceMedicationReminder: (medication: string, time: string) => void
  announceAppointment: (patientName: string, time: string) => void
  announceVitalSigns: (patientName: string, vitals: string) => void
  announceProcedure: (procedure: string, outcome: string) => void
  announceStaffAssignment: (staffName: string, patientName: string) => void
  announceDataAccess: (dataType: string, accessedBy: string) => void
  announceSystem: (message: string) => void
  
  // Combined preferences
  accessibilityMode: boolean
  resetPreferences: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

interface AccessibilityProviderProps {
  children: ReactNode
  // High contrast props
  defaultHighContrast?: boolean
  persistHighContrast?: boolean
  // Reduced motion props
  defaultReducedMotion?: boolean
  respectSystemPreference?: boolean
  persistReducedMotion?: boolean
  // Healthcare mode
  healthcareMode?: boolean
  emergencyMode?: boolean
  // Screen reader props
  maxAnnouncements?: number
  defaultAnnouncementTimeout?: number
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  defaultHighContrast = false,
  persistHighContrast = true,
  defaultReducedMotion = false,
  respectSystemPreference = true,
  persistReducedMotion = true,
  healthcareMode = false,
  emergencyMode = false,
  maxAnnouncements = 5,
  defaultAnnouncementTimeout = 5000,
}) => {
  const highContrastContext = useHighContrast()
  const reducedMotionContext = useReducedMotion()
  const announcer = useAnnouncer()

  // Combined accessibility mode
  const accessibilityMode = highContrastContext.highContrast || reducedMotionContext.reducedMotion

  // Reset all accessibility preferences
  const resetPreferences = () => {
    highContrastContext.setHighContrast(false)
    reducedMotionContext.setReducedMotion(false)
    highContrastContext.setContrastLevel('high')
    reducedMotionContext.setMotionLevel('normal')
    
    // Clear localStorage
    try {
      localStorage.removeItem('high-contrast')
      localStorage.removeItem('contrast-level')
      localStorage.removeItem('reduced-motion')
      localStorage.removeItem('motion-level')
    } catch (error) {
      console.warn('Failed to clear accessibility preferences:', error)
    }
  }

  const value: AccessibilityContextType = {
    // High contrast
    highContrast: highContrastContext.highContrast,
    toggleHighContrast: highContrastContext.toggleHighContrast,
    setHighContrast: highContrastContext.setHighContrast,
    contrastLevel: highContrastContext.contrastLevel,
    setContrastLevel: highContrastContext.setContrastLevel,
    
    // Reduced motion
    reducedMotion: reducedMotionContext.reducedMotion,
    toggleReducedMotion: reducedMotionContext.toggleReducedMotion,
    setReducedMotion: reducedMotionContext.setReducedMotion,
    motionLevel: reducedMotionContext.motionLevel,
    setMotionLevel: reducedMotionContext.setMotionLevel,
    prefersReducedMotion: reducedMotionContext.prefersReducedMotion,
    
    // Screen reader announcements
    announce: announcer.announce,
    announceEmergency: announcer.announceEmergency,
    announcePatientUpdate: announcer.announcePatientUpdate,
    announceMedicationReminder: announcer.announceMedicationReminder,
    announceAppointment: announcer.announceAppointment,
    announceVitalSigns: announcer.announceVitalSigns,
    announceProcedure: announcer.announceProcedure,
    announceStaffAssignment: announcer.announceStaffAssignment,
    announceDataAccess: announcer.announceDataAccess,
    announceSystem: announcer.announceSystem,
    
    // Combined preferences
    accessibilityMode,
    resetPreferences,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      <HighContrastProvider
        defaultEnabled={defaultHighContrast}
        persistPreference={persistHighContrast}
      >
        <ReducedMotionProvider
          defaultEnabled={defaultReducedMotion}
          respectSystemPreference={respectSystemPreference}
          persistPreference={persistReducedMotion}
        >
          <ScreenReaderAnnouncer
            healthcareMode={healthcareMode}
            emergencyMode={emergencyMode}
            maxMessages={maxAnnouncements}
            defaultTimeout={defaultAnnouncementTimeout}
          />
          {children}
        </ReducedMotionProvider>
      </HighContrastProvider>
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Accessibility controls panel component
interface AccessibilityControlsProps {
  className?: string
  showLabels?: boolean
  compact?: boolean
  variant?: 'panel' | 'toolbar' | 'menu'
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  className,
  showLabels = true,
  compact = false,
  variant = 'panel',
}) => {
  const {
    highContrast,
    toggleHighContrast,
    contrastLevel,
    setContrastLevel,
    reducedMotion,
    toggleReducedMotion,
    motionLevel,
    setMotionLevel,
    accessibilityMode,
    resetPreferences,
  } = useAccessibility()

  const controlClasses = compact ? 'gap-2' : 'gap-4'

  if (variant === 'toolbar') {
    return (
      <div className={cn('flex items-center', controlClasses, className)}>
        <HighContrastToggle
          showLabel={showLabels}
          size={compact ? 'sm' : 'md'}
          variant="icon"
        />
        <ReducedMotionToggle
          showLabel={showLabels}
          size={compact ? 'sm' : 'md'}
          variant="icon"
        />
        {accessibilityMode && (
          <button
            onClick={resetPreferences}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              compact && 'text-xs px-1 py-0.5'
            )}
            title="Reset accessibility preferences"
          >
            <span aria-hidden="true">🔄</span>
            {showLabels && !compact && <span>Reset</span>}
          </button>
        )}
      </div>
    )
  }

  if (variant === 'menu') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Accessibility Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">High Contrast</span>
              <HighContrastToggle
                showLabel={false}
                size="sm"
                variant="switch"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Reduced Motion</span>
              <ReducedMotionToggle
                showLabel={false}
                size="sm"
                variant="switch"
              />
            </div>
          </div>
        </div>
        
        {(highContrast || reducedMotion) && (
          <div className="space-y-3">
            {highContrast && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Contrast Level
                </label>
                <div className="flex gap-2">
                  {(['normal', 'high', 'maximum'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setContrastLevel(level)}
                      className={cn(
                        'flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        contrastLevel === level && 'border-blue-600 bg-blue-50 text-blue-900'
                      )}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {reducedMotion && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Motion Level
                </label>
                <div className="flex gap-2">
                  {(['none', 'reduced', 'normal'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setMotionLevel(level)}
                      className={cn(
                        'flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        motionLevel === level && 'border-blue-600 bg-blue-50 text-blue-900'
                      )}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={resetPreferences}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Reset All Preferences
            </button>
          </div>
        )}
      </div>
    )
  }

  // Default panel variant
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Accessibility Settings</h3>
          <p className="text-sm text-gray-600">
            Customize the interface for your accessibility needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">High Contrast Mode</label>
            <div className="flex items-center gap-2">
              <HighContrastToggle
                showLabel={showLabels}
                size="md"
                variant="switch"
              />
              {showLabels && (
                <span className="text-sm text-gray-600">
                  {highContrast ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Reduced Motion</label>
            <div className="flex items-center gap-2">
              <ReducedMotionToggle
                showLabel={showLabels}
                size="md"
                variant="switch"
              />
              {showLabels && (
                <span className="text-sm text-gray-600">
                  {reducedMotion ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {accessibilityMode && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Accessibility mode is active
              </span>
              <button
                onClick={resetPreferences}
                className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Reset Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Health check component for accessibility features
export const AccessibilityHealthCheck: React.FC = () => {
  const {
    highContrast,
    reducedMotion,
    contrastLevel,
    motionLevel,
    prefersReducedMotion,
  } = useAccessibility()

  const checks = [
    {
      name: 'High Contrast Mode',
      status: highContrast,
      detail: highContrast ? `Enabled (${contrastLevel} contrast)` : 'Disabled',
      type: 'contrast' as const,
    },
    {
      name: 'Reduced Motion',
      status: reducedMotion,
      detail: reducedMotion 
        ? `Enabled (${motionLevel} motion${prefersReducedMotion ? ', system preference' : ''})`
        : 'Disabled',
      type: 'motion' as const,
    },
    {
      name: 'Screen Reader Announcements',
      status: true, // Always available
      detail: 'Enabled for healthcare notifications',
      type: 'announcement' as const,
    },
    {
      name: 'Keyboard Navigation',
      status: true, // Always available
      detail: 'Full keyboard support enabled',
      type: 'navigation' as const,
    },
    {
      name: 'ARIA Live Regions',
      status: true, // Always available
      detail: 'Dynamic content announcements active',
      type: 'live' as const,
    },
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900">Accessibility Status</h4>
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.name} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{check.name}</span>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-2 w-2 rounded-full',
                  check.status ? 'bg-green-500' : 'bg-gray-300'
                )}
                aria-hidden="true"
              />
              <span className="text-gray-600">{check.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export type { AccessibilityProviderProps, AccessibilityControlsProps }
export default AccessibilityProvider