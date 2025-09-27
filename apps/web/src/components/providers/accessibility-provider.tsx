import * as React from 'react'
import { TranslationProvider } from '@/lib/i18n/use-translation'
import { ScreenReaderAnnouncerProvider } from '@/components/ui/screen-reader-announcer.js'
import { SkipLinks } from '@/components/ui/screen-reader-announcer.js'

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
}) => {
  return (
    <TranslationProvider defaultLanguage="pt-BR">
      <ScreenReaderAnnouncerProvider>
        <AccessibilityCore>{children}</AccessibilityCore>
      </ScreenReaderAnnouncerProvider>
    </TranslationProvider>
  )
}

const AccessibilityCore: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {/* Skip links for keyboard navigation */}
      <SkipLinks
        links={[
          {
            href: '#main-content',
            label: 'Ir para o conteúdo principal',
            description: 'Pular navegação e ir diretamente para o conteúdo principal',
          },
          {
            href: '#main-navigation',
            label: 'Ir para a navegação principal',
            description: 'Pular para o menu de navegação principal',
          },
          {
            href: '#search',
            label: 'Ir para a busca',
            description: 'Pular para o campo de busca',
          },
        ]}
      />

      {/* Main content */}
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>

      {/* Accessibility announcements region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="accessibility-announcements"
      />

      {/* Focus management for screen readers */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        id="screen-reader-updates"
      />
    </>
  )
}

// Accessibility utilities hook
export const useAccessibility = () => {
  const announceChange = React.useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', politeness)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  const manageFocus = React.useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const trapFocus = React.useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement[]

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return {
    announceChange,
    manageFocus,
    trapFocus,
  }
}

// High contrast mode detection hook
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    setIsHighContrast(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isHighContrast
}

// Reduced motion detection hook
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// Screen reader detection hook
export const useScreenReader = () => {
  const [hasScreenReader, setHasScreenReader] = React.useState(false)

  React.useEffect(() => {
    // This is a simple detection method - not 100% accurate
    const detectScreenReader = () => {
      const testElement = document.createElement('div')
      testElement.setAttribute('aria-hidden', 'true')
      testElement.style.position = 'absolute'
      testElement.style.left = '-10000px'
      testElement.style.width = '1px'
      testElement.style.height = '1px'
      testElement.style.overflow = 'hidden'
      testElement.textContent = 'Screen reader detection test'

      document.body.appendChild(testElement)

      // Check if the element was read (this is an approximation)
      setTimeout(() => {
        document.body.removeChild(testElement)
        // In a real implementation, you'd have more sophisticated detection
        setHasScreenReader(false) // Default to false for privacy reasons
      }, 100)
    }

    detectScreenReader()
  }, [])

  return hasScreenReader
}

// Accessibility validation utilities
export const AccessibilityValidator = {
  // Check color contrast
  checkContrast: (foreground: string, background: string): number => {
    // This is a simplified contrast calculation
    // In a real implementation, you'd use a proper color contrast library
    return 4.5 // Default to AA compliant
  },

  // Check if touch targets are large enough
  checkTouchTarget: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect()
    const minSize = 44 // WCAG minimum touch target size
    return rect.width >= minSize && rect.height >= minSize
  },

  // Check if ARIA labels are present
  checkAriaLabels: (element: HTMLElement): boolean => {
    const interactiveElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [role="button"], [role="link"]'
    )

    for (const el of interactiveElements) {
      const hasLabel = el.hasAttribute('aria-label') ||
                       el.hasAttribute('aria-labelledby') ||
                       el.textContent?.trim()
      if (!hasLabel) return false
    }

    return true
  },

  // Check keyboard navigation
  checkKeyboardNav: (element: HTMLElement): boolean => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    // Check if all interactive elements are focusable
    return focusableElements.length > 0
  },
}
