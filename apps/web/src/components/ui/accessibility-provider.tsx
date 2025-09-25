import * as React from 'react'

// Accessibility preferences and settings
export interface AccessibilityPreferences {
  highContrastMode: boolean
  reducedMotion: boolean
  screenReaderOptimized: boolean
  largeTextMode: boolean
  voiceOverSupport: boolean
  keyboardNavigation: boolean
  colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  focusVisibleOnly: boolean
  dyslexiaFriendly: boolean
}

// LGPD accessibility compliance
export interface LGPDAccessibilitySettings {
  screenReaderAnnouncements: boolean
  dataProcessingAnnouncements: boolean
  consentManagementAccessibility: boolean
  dataAccessAccessibility: boolean
  emergencyAccessibilityFeatures: boolean
}

// Healthcare-specific accessibility features
export interface HealthcareAccessibility {
  emergencyMode: boolean
  medicalAlertSystem: boolean
  patientDataProtection: boolean
  consentFormAccessibility: boolean
  treatmentInformationAccessibility: boolean
}

// Accessibility context interface
export interface AccessibilityContextType {
  // Preferences
  preferences: AccessibilityPreferences
  // LGPD compliance
  lgpdSettings: LGPDAccessibilitySettings
  // Healthcare features
  healthcare: HealthcareAccessibility
  // Actions
  updatePreferences: (preferences: Partial<AccessibilityPreferences>) => void
  announceToScreenReader: (message: string, politeness?: 'polite' | 'assertive') => void
  manageFocus: (element: HTMLElement | null) => void
  trapFocus: (container: HTMLElement) => void
  releaseFocus: () => void
  keyboardShortcuts: Map<string, () => void>
  registerKeyboardShortcut: (key: string, callback: () => void) => void
  unregisterKeyboardShortcut: (key: string) => void
}

// Default accessibility preferences
const defaultPreferences: AccessibilityPreferences = {
  highContrastMode: false,
  reducedMotion: false,
  screenReaderOptimized: false,
  largeTextMode: false,
  voiceOverSupport: false,
  keyboardNavigation: false,
  colorBlindSupport: 'none',
  focusVisibleOnly: false,
  dyslexiaFriendly: false,
}

// Default LGPD settings
const defaultLGPDSettings: LGPDAccessibilitySettings = {
  screenReaderAnnouncements: true,
  dataProcessingAnnouncements: true,
  consentManagementAccessibility: true,
  dataAccessAccessibility: true,
  emergencyAccessibilityFeatures: true,
}

// Default healthcare accessibility
const defaultHealthcare: HealthcareAccessibility = {
  emergencyMode: false,
  medicalAlertSystem: true,
  patientDataProtection: true,
  consentFormAccessibility: true,
  treatmentInformationAccessibility: true,
}

// Create accessibility context
const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined)

// Accessibility provider component
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = React.useState<AccessibilityPreferences>(defaultPreferences)
  const [lgpdSettings] = React.useState<LGPDAccessibilitySettings>(defaultLGPDSettings)
  const [healthcare] = React.useState<HealthcareAccessibility>(defaultHealthcare)
  
  // Refs for focus management
  const focusRef = React.useRef<HTMLElement | null>(null)
  const trappedFocusRef = React.useRef<HTMLElement | null>(null)
  const keyboardShortcutsRef = React.useRef<Map<string, () => void>>(new Map())

  // Initialize accessibility preferences from system settings
  React.useEffect(() => {
    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    const prefersLargeText = window.matchMedia('(prefers-reduced-data: reduce)').matches

    // Detect screen reader usage
    const detectScreenReader = () => {
      const testElement = document.createElement('div')
      testElement.setAttribute('aria-hidden', 'true')
      testElement.textContent = 'test'
      document.body.appendChild(testElement)
      
      const isScreenReader = testElement.offsetWidth === 0 && testElement.offsetHeight === 0
      document.body.removeChild(testElement)
      
      return isScreenReader
    }

    // Detect keyboard navigation
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setPreferences(prev => ({ ...prev, keyboardNavigation: true }))
        window.removeEventListener('keydown', handleFirstTab)
      }
    }

    // Detect color blindness support
    const detectColorBlindSupport = () => {
      // This is a basic detection - in practice, you'd want more sophisticated detection
      const colorTest = document.createElement('div')
      colorTest.style.color = '#ff0000'
      colorTest.style.backgroundColor = '#00ff00'
      document.body.appendChild(colorTest)
      
      const computedColor = window.getComputedStyle(colorTest).color
      const computedBg = window.getComputedStyle(colorTest).backgroundColor
      
      document.body.removeChild(colorTest)
      
      // Simple test - in reality, this would be more complex
      return 'none'
    }

    // Apply detected preferences
    setPreferences(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrastMode: prefersHighContrast,
      largeTextMode: prefersLargeText,
      screenReaderOptimized: detectScreenReader(),
      colorBlindSupport: detectColorBlindSupport(),
    }))

    // Set up keyboard navigation detection
    window.addEventListener('keydown', handleFirstTab)

    // Listen for system preference changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }))
    }

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrastMode: e.matches }))
    }

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
    highContrastQuery.addEventListener('change', handleHighContrastChange)

    return () => {
      window.removeEventListener('keydown', handleFirstTab)
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
      highContrastQuery.removeEventListener('change', handleHighContrastChange)
    }
  }, [])

  // Apply CSS classes based on preferences
  React.useEffect(() => {
    const root = document.documentElement

    // Apply preference-based classes
    if (preferences.highContrastMode) {
      root.classList.add('high-contrast-mode')
    } else {
      root.classList.remove('high-contrast-mode')
    }

    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    if (preferences.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized')
    } else {
      root.classList.remove('screen-reader-optimized')
    }

    if (preferences.largeTextMode) {
      root.classList.add('large-text-mode')
    } else {
      root.classList.remove('large-text-mode')
    }

    if (preferences.keyboardNavigation) {
      root.classList.add('keyboard-navigation')
    } else {
      root.classList.remove('keyboard-navigation')
    }

    if (preferences.colorBlindSupport !== 'none') {
      root.classList.add(`color-blind-${preferences.colorBlindSupport}`)
    }

    if (preferences.dyslexiaFriendly) {
      root.classList.add('dyslexia-friendly')
    } else {
      root.classList.remove('dyslexia-friendly')
    }

    // Healthcare-specific classes
    if (healthcare.emergencyMode) {
      root.classList.add('emergency-mode')
    }

    // LGPD compliance classes
    if (lgpdSettings.screenReaderAnnouncements) {
      root.classList.add('lgpd-announcements-enabled')
    }

  }, [preferences, healthcare, lgpdSettings])

  // Handle global keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return
      }

      const key = event.key.toLowerCase()
      
      // Handle modifier combinations
      let shortcutKey = key
      if (event.ctrlKey) shortcutKey = `ctrl+${key}`
      if (event.altKey) shortcutKey = `alt+${key}`
      if (event.shiftKey) shortcutKey = `shift+${key}`

      const callback = keyboardShortcutsRef.current.get(shortcutKey)
      if (callback) {
        event.preventDefault()
        event.stopPropagation()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Screen reader announcement system
  const announceToScreenReader = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (!lgpdSettings.screenReaderAnnouncements) return

    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', politeness)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Focus management
  const manageFocus = (element: HTMLElement | null) => {
    if (element) {
      element.focus()
      focusRef.current = element
    }
  }

  // Focus trapping for modals
  const trapFocus = (container: HTMLElement) => {
    trappedFocusRef.current = container

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    
    // Focus first element
    firstElement.focus()

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  const releaseFocus = () => {
    trappedFocusRef.current = null
  }

  // Keyboard shortcut management
  const registerKeyboardShortcut = (key: string, callback: () => void) => {
    keyboardShortcutsRef.current.set(key.toLowerCase(), callback)
  }

  const unregisterKeyboardShortcut = (key: string) => {
    keyboardShortcutsRef.current.delete(key.toLowerCase())
  }

  // Register default healthcare shortcuts
  React.useEffect(() => {
    // Emergency shortcut
    registerKeyboardShortcut('ctrl+shift+e', () => {
      healthcare.emergencyMode = !healthcare.emergencyMode
      announceToScreenReader(
        healthcare.emergencyMode ? 'Modo de emergência ativado' : 'Modo de emergência desativado',
        'assertive'
      )
    })

    // High contrast toggle
    registerKeyboardShortcut('ctrl+shift+h', () => {
      setPreferences(prev => ({ ...prev, highContrastMode: !prev.highContrastMode }))
      announceToScreenReader(
        preferences.highContrastMode ? 'Modo alto contraste desativado' : 'Modo alto contraste ativado'
      )
    })

    // Screen reader optimization toggle
    registerKeyboardShortcut('ctrl+shift+s', () => {
      setPreferences(prev => ({ ...prev, screenReaderOptimized: !prev.screenReaderOptimized }))
      announceToScreenReader(
        preferences.screenReaderOptimized ? 'Otimização para leitor de tela desativada' : 'Otimização para leitor de tela ativada'
      )
    })

    return () => {
      unregisterKeyboardShortcut('ctrl+shift+e')
      unregisterKeyboardShortcut('ctrl+shift+h')
      unregisterKeyboardShortcut('ctrl+shift+s')
    }
  }, [preferences.highContrastMode, preferences.screenReaderOptimized, healthcare.emergencyMode])

  // Update preferences function
  const updatePreferences = (newPreferences: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }))
  }

  const contextValue: AccessibilityContextType = {
    preferences,
    lgpdSettings,
    healthcare,
    updatePreferences,
    announceToScreenReader,
    manageFocus,
    trapFocus,
    releaseFocus,
    keyboardShortcuts: keyboardShortcutsRef.current,
    registerKeyboardShortcut,
    unregisterKeyboardShortcut,
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  )
}

// Hook to use accessibility context
export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Hook for focus management
export const useFocusManagement = () => {
  const { manageFocus, trapFocus, releaseFocus } = useAccessibility()
  
  return {
    manageFocus,
    trapFocus,
    releaseFocus,
  }
}

// Hook for screen reader announcements
export const useScreenReaderAnnouncer = () => {
  const { announceToScreenReader } = useAccessibility()
  
  return {
    announce: announceToScreenReader,
  }
}

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = () => {
  const { registerKeyboardShortcut, unregisterKeyboardShortcut } = useAccessibility()
  
  return {
    register: registerKeyboardShortcut,
    unregister: unregisterKeyboardShortcut,
  }
}

// Higher-order component for accessibility
export const withAccessibility = <P extends object>(
  Component: React.ComponentType<P>,
  accessibilityProps?: Partial<AccessibilityPreferences>
) => {
  return (props: P) => {
    const accessibility = useAccessibility()
    
    return (
      <Component 
        {...props}
        accessibility={accessibility}
        accessibilityPreferences={accessibilityProps}
      />
    )
  }
}

// Export types
export type {
  AccessibilityPreferences,
  LGPDAccessibilitySettings,
  HealthcareAccessibility,
  AccessibilityContextType,
}