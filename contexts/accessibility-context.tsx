import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

interface AccessibilityContextValue {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void
  setFocusOn: (element: HTMLElement | string) => void
  trapFocus: (container: HTMLElement) => () => void
  isHighContrast: boolean
  reduceMotion: boolean
  fontSize: 'normal' | 'large' | 'extra-large'
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal')
  const announceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Detect high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(highContrastQuery.matches)
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }
    
    highContrastQuery.addEventListener('change', handleHighContrastChange)

    // Detect reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(motionQuery.matches)
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches)
    }
    
    motionQuery.addEventListener('change', handleMotionChange)

    // Load font size preference
    const savedFontSize = localStorage.getItem('neonpro-font-size') as 'normal' | 'large' | 'extra-large' || 'normal'
    setFontSize(savedFontSize)
    document.documentElement.setAttribute('data-font-size', savedFontSize)

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange)
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      // Clear previous message
      announceRef.current.textContent = ''
      // Add new message after a brief delay to ensure it's announced
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = message
          announceRef.current.setAttribute('aria-live', priority)
        }
      }, 100)
    }
  }

  const setFocusOn = (element: HTMLElement | string) => {
    const targetElement = typeof element === 'string' 
      ? document.getElementById(element) || document.querySelector(element)
      : element

    if (targetElement && targetElement instanceof HTMLElement) {
      // Ensure element is focusable
      if (!targetElement.hasAttribute('tabindex') && 
          !['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'A'].includes(targetElement.tagName)) {
        targetElement.setAttribute('tabindex', '-1')
      }
      
      targetElement.focus()
      
      // Scroll into view if necessary
      targetElement.scrollIntoView({ 
        behavior: reduceMotion ? 'auto' : 'smooth', 
        block: 'nearest' 
      })
    }
  }

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault()
            lastFocusable?.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault()
            firstFocusable?.focus()
          }
        }
      }
      
      if (e.key === 'Escape') {
        // Allow escape to break focus trap for dialogs
        const closeButton = container.querySelector('[data-close-modal]') as HTMLElement
        if (closeButton) {
          closeButton.click()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    
    // Focus the first element when trap is activated
    if (firstFocusable) {
      firstFocusable.focus()
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  const handleFontSizeChange = (newSize: 'normal' | 'large' | 'extra-large') => {
    setFontSize(newSize)
    localStorage.setItem('neonpro-font-size', newSize)
    document.documentElement.setAttribute('data-font-size', newSize)
    announceToScreenReader(`Tamanho da fonte alterado para ${newSize === 'normal' ? 'normal' : newSize === 'large' ? 'grande' : 'extra grande'}`)
  }

  const value: AccessibilityContextValue = {
    announceToScreenReader,
    setFocusOn,
    trapFocus,
    isHighContrast,
    reduceMotion,
    fontSize,
    setFontSize: handleFontSizeChange
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader announcement region */}
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  const handleArrowNavigation = (
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void,
    options: {
      horizontal?: boolean
      wrap?: boolean
      enterAction?: () => void
    } = {}
  ) => {
    const { horizontal = false, wrap = true, enterAction } = options
    
    switch (e.key) {
      case horizontal ? 'ArrowLeft' : 'ArrowUp':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : wrap ? items.length - 1 : currentIndex
        onIndexChange(prevIndex)
        items[prevIndex]?.focus()
        break
        
      case horizontal ? 'ArrowRight' : 'ArrowDown':
        e.preventDefault()
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : wrap ? 0 : currentIndex
        onIndexChange(nextIndex)
        items[nextIndex]?.focus()
        break
        
      case 'Home':
        e.preventDefault()
        onIndexChange(0)
        items[0]?.focus()
        break
        
      case 'End':
        e.preventDefault()
        const lastIndex = items.length - 1
        onIndexChange(lastIndex)
        items[lastIndex]?.focus()
        break
        
      case 'Enter':
      case ' ':
        if (enterAction) {
          e.preventDefault()
          enterAction()
        }
        break
    }
  }

  return { handleArrowNavigation }
}

// Hook for managing roving tabindex
export function useRovingTabIndex(items: HTMLElement[], activeIndex: number = 0) {
  useEffect(() => {
    items.forEach((item, index) => {
      if (index === activeIndex) {
        item.setAttribute('tabindex', '0')
      } else {
        item.setAttribute('tabindex', '-1')
      }
    })
  }, [items, activeIndex])
}
