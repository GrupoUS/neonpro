import React, { useEffect, useRef, useState } from 'react'

interface KeyboardNavigationProps {
  children: React.ReactNode
  enabled?: boolean
  focusTrap?: boolean
  onEscape?: () => void
  onEnter?: () => void
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
  className?: string
}

interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  onEscape?: () => void
}

// Healthcare-specific keyboard navigation component
export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  enabled = true,
  focusTrap = false,
  onEscape,
  onEnter,
  onArrowKeys,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Store last focused element for screen readers
      if (document.activeElement instanceof HTMLElement) {
        setLastFocusedElement(document.activeElement)
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          onEscape?.()
          break
        
        case 'Enter':
          event.preventDefault()
          onEnter?.()
          break
        
        case 'ArrowUp':
          event.preventDefault()
          onArrowKeys?.('up')
          break
        
        case 'ArrowDown':
          event.preventDefault()
          onArrowKeys?.('down')
          break
        
        case 'ArrowLeft':
          event.preventDefault()
          onArrowKeys?.('left')
          break
        
        case 'ArrowRight':
          event.preventDefault()
          onArrowKeys?.('right')
          break
        
        // Healthcare-specific shortcuts
        case 'F1':
          event.preventDefault()
          console.log('🆘 Emergency help activated')
          break
        
        case 'F2':
          event.preventDefault()
          console.log('👁️ Screen reader mode toggled')
          break
        
        case 'F3':
          event.preventDefault()
          console.log('🔊 High contrast mode toggled')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onEscape, onEnter, onArrowKeys])

  // Focus trap implementation
  useEffect(() => {
    if (!focusTrap || !enabled) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    if (!firstElement || !lastElement) return

    const handleFocus = (e: FocusEvent) => {
      if (e.target === document) return

      const focusedElement = e.target as HTMLElement
      const isTabPressed = e instanceof KeyboardEvent && e.key === 'Tab'

      if (!isTabPressed) return

      if (e.shiftKey) {
        // Shift + Tab
        if (focusedElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        // Tab
        if (focusedElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('focusin', handleFocus)
    return () => container.removeEventListener('focusin', handleFocus)
  }, [focusTrap, enabled])

  // Announce to screen readers when component mounts
  useEffect(() => {
    if (!enabled) return

    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'polite')
    announcement.className = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
    announcement.textContent = 'Keyboard navigation enabled. Use Tab to navigate, Enter to select, Escape to cancel.'
    
    document.body.appendChild(announcement)
    
    // Cleanup announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)

    // Restore focus when component unmounts
    return () => {
      if (lastFocusedElement) {
        lastFocusedElement.focus()
      }
    }
  }, [enabled, lastFocusedElement])

  return (
    <div
      ref={containerRef}
      className={className}
      role={focusTrap ? 'dialog' : undefined}
      aria-modal={focusTrap ? 'true' : undefined}
    >
      {children}
    </div>
  )
}

// Focus trap component for modal dialogs
export const FocusTrap: React.FC<FocusTrapProps> = ({ children, active, onEscape }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return

    // Focus first element when trap activates
    const firstElement = focusableElements[0]
    if (firstElement) {
      firstElement.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }

      if (event.key !== 'Tab') return

      const focusedElement = document.activeElement as HTMLElement
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab
        if (focusedElement === firstElement && lastElement) {
          lastElement.focus()
          event.preventDefault()
        }
      } else {
        // Tab
        if (focusedElement === lastElement && firstElement) {
          firstElement.focus()
          event.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, onEscape])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

// Skip links component for accessibility
export const SkipLinks: React.FC = () => {
  const skipLinks = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#search', label: 'Skip to search' },
    { href: '#emergency-contact', label: 'Skip to emergency contact' },
  ]

  return (
    <nav className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 focus:w-auto focus:h-auto focus:p-2 focus:m-0 focus:overflow-visible focus:whitespace-normal focus:top-0 focus:left-0 z-50 bg-white border-b">
      {skipLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}

// Screen reader announcer for dynamic content
export const ScreenReaderAnnouncer: React.FC<{
  message: string
  priority?: 'polite' | 'assertive'
  timeout?: number
}> = ({ message, priority = 'polite', timeout = 5000 }) => {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    setAnnouncement(message)
    
    const timer = setTimeout(() => {
      setAnnouncement('')
    }, timeout)

    return () => clearTimeout(timer)
  }, [message, timeout])

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
    >
      {announcement}
    </div>
  )
}

// High contrast mode toggle
export const HighContrastMode: React.FC = () => {
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    const isHighContrast = localStorage.getItem('high-contrast') === 'true'
    setHighContrast(isHighContrast)
    
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast')
    }
  }, [])

  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast')
      localStorage.setItem('high-contrast', 'true')
    } else {
      document.documentElement.classList.remove('high-contrast')
      localStorage.setItem('high-contrast', 'false')
    }
  }

  return (
    <button
      onClick={toggleHighContrast}
      className="p-2 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-pressed={highContrast}
      aria-label="Toggle high contrast mode"
    >
      <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
        {highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      </span>
      <span aria-hidden="true">🔆</span>
    </button>
  )
}

// Keyboard navigation help modal
export const KeyboardHelp: React.FC<{
  isOpen: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const shortcuts = [
    { key: 'Tab', description: 'Navigate between interactive elements' },
    { key: 'Shift + Tab', description: 'Navigate backwards' },
    { key: 'Enter', description: 'Activate buttons and links' },
    { key: 'Escape', description: 'Close dialogs or cancel actions' },
    { key: 'Space', description: 'Toggle checkboxes and radio buttons' },
    { key: 'Arrow Keys', description: 'Navigate within menus and lists' },
    { key: 'F1', description: 'Emergency help' },
    { key: 'F2', description: 'Toggle screen reader mode' },
    { key: 'F3', description: 'Toggle high contrast mode' },
  ]

  return (
    <FocusTrap active={isOpen} onEscape={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">Keyboard Navigation Help</h2>
          <div className="space-y-2 mb-6">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                  {shortcut.key}
                </kbd>
                <span className="text-sm">{shortcut.description}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </FocusTrap>
  )
}

export type { KeyboardNavigationProps, FocusTrapProps }
export default KeyboardNavigation