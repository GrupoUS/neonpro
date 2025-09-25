import * as React from 'react'

export interface Announcement {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
  timeout?: number
}

interface ScreenReaderAnnouncerProps {
  className?: string
}

export const ScreenReaderAnnouncerContext = React.createContext<{
  announce: (announcement: Announcement) => void
  clear: () => void
}>({
  announce: () => {},
  clear: () => {},
})

export const ScreenReaderAnnouncerProvider: React.FC<ScreenReaderAnnouncerProps> = ({
  children,
  className,
}) => {
  const [announcements, setAnnouncements] = React.useState<{
    polite: string[]
    assertive: string[]
  }>({
    polite: [],
    assertive: [],
  })

  const announce = React.useCallback(({ message, politeness = 'polite', timeout = 1000 }: Announcement) => {
    const key = politeness === 'assertive' ? 'assertive' : 'polite'
    
    setAnnouncements(prev => ({
      ...prev,
      [key]: [...prev[key], message],
    }))

    // Clear announcement after timeout
    setTimeout(() => {
      setAnnouncements(prev => ({
        ...prev,
        [key]: prev[key].filter(msg => msg !== message),
      }))
    }, timeout)
  }, [])

  const clear = React.useCallback(() => {
    setAnnouncements({ polite: [], assertive: [] })
  }, [])

  const contextValue = React.useMemo(() => ({
    announce,
    clear,
  }), [announce, clear])

  return (
    <ScreenReaderAnnouncerContext.Provider value={contextValue}>
      {/* Polite announcements (for non-critical info) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements.polite.map((msg, index) => (
          <div key={`polite-${index}`}>{msg}</div>
        ))}
      </div>

      {/* Assertive announcements (for critical info) */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements.assertive.map((msg, index) => (
          <div key={`assertive-${index}`}>{msg}</div>
        ))}
      </div>

      {children}
    </ScreenReaderAnnouncerContext.Provider>
  )
}

// Hook for components to use screen reader announcements
export const useScreenReaderAnnouncer = () => {
  const context = React.useContext(ScreenReaderAnnouncerContext)
  return context
}

// Focus management utilities
export const useFocusManagement = () => {
  const focusRef = React.useRef<HTMLElement>(null)
  const previouslyFocused = React.useRef<HTMLElement | null>(null)

  const setFocus = React.useCallback((element: HTMLElement | null) => {
    if (element) {
      previouslyFocused.current = document.activeElement as HTMLElement
      element.focus()
      focusRef.current = element
    }
  }, [])

  const restoreFocus = React.useCallback(() => {
    if (previouslyFocused.current) {
      previouslyFocused.current.focus()
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
    focusRef,
    setFocus,
    restoreFocus,
    trapFocus,
  }
}

// Skip link component for keyboard navigation
export const SkipLinks: React.FC<{
  links: Array<{
    href: string
    label: string
    description?: string
  }>
}> = ({ links }) => {
  return (
    <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white p-4 rounded shadow-lg">
      <nav aria-label="Links de navegação rápida">
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className="text-blue-600 hover:text-blue-800 underline font-medium block py-1"
                onClick={(e) => {
                  e.preventDefault()
                  const target = document.querySelector(link.href)
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' })
                    ;(target as HTMLElement).focus()
                  }
                }}
              >
                {link.label}
                {link.description && (
                  <span className="text-sm text-gray-600 block font-normal">
                    {link.description}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

// Landmark components for screen reader navigation
export const Main: React.FC<React.HTMLAttributes<HTMLElement>> = ({ children, ...props }) => (
  <main {...props} role="main" aria-label="Conteúdo principal">
    {children}
  </main>
)

export const Navigation: React.FC<React.HTMLAttributes<HTMLElement>> = ({ children, ...props }) => (
  <nav {...props} aria-label="Navegação principal">
    {children}
  </nav>
)

export const Complementary: React.FC<React.HTMLAttributes<HTMLElement>> = ({ children, ...props }) => (
  <aside {...props} role="complementary">
    {children}
  </aside>
)

export const ContentInfo: React.FC<React.HTMLAttributes<HTMLElement>> = ({ children, ...props }) => (
  <footer {...props} role="contentinfo">
    {children}
  </footer>
)