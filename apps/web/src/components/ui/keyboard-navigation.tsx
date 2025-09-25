import * as React from 'react'

export interface KeyboardNavigationProps {
  children: React.ReactNode
  className?: string
  trapFocus?: boolean
  restoreFocus?: boolean
  autoFocus?: boolean
  onEscape?: () => void
  onEnter?: () => void
}

export const KeyboardNavigationContext = React.createContext<{
  registerFocusable: (element: HTMLElement, priority?: number) => void
  unregisterFocusable: (element: HTMLElement) => void
  focusFirst: () => void
  focusLast: () => void
  focusNext: (current?: HTMLElement) => void
  focusPrevious: (current?: HTMLElement) => void
}>({
  registerFocusable: () => {},
  unregisterFocusable: () => {},
  focusFirst: () => {},
  focusLast: () => {},
  focusNext: () => {},
  focusPrevious: () => {},
})

interface FocusableElement {
  element: HTMLElement
  priority: number
}

export const KeyboardNavigationProvider: React.FC<KeyboardNavigationProps> = ({
  children,
  trapFocus = false,
  restoreFocus = false,
  autoFocus = false,
  onEscape,
  onEnter,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const focusableElements = React.useRef<FocusableElement[]>([])
  const previouslyFocused = React.useRef<HTMLElement | null>(null)

  // Register focusable element
  const registerFocusable = React.useCallback((element: HTMLElement, priority = 0) => {
    focusableElements.current.push({ element, priority })
    focusableElements.current.sort((a, b) => a.priority - b.priority)
  }, [])

  // Unregister focusable element
  const unregisterFocusable = React.useCallback((element: HTMLElement) => {
    focusableElements.current = focusableElements.current.filter(
      item => item.element !== element
    )
  }, [])

  // Focus management functions
  const focusFirst = React.useCallback(() => {
    const first = focusableElements.current[0]?.element
    if (first) {
      first.focus()
      return true
    }
    return false
  }, [])

  const focusLast = React.useCallback(() => {
    const last = focusableElements.current[focusableElements.current.length - 1]?.element
    if (last) {
      last.focus()
      return true
    }
    return false
  }, [])

  const focusNext = React.useCallback((current?: HTMLElement) => {
    const currentIndex = current 
      ? focusableElements.current.findIndex(item => item.element === current)
      : -1
    
    const nextIndex = currentIndex + 1
    if (nextIndex < focusableElements.current.length) {
      focusableElements.current[nextIndex].element.focus()
      return true
    }
    return focusFirst()
  }, [focusFirst])

  const focusPrevious = React.useCallback((current?: HTMLElement) => {
    const currentIndex = current 
      ? focusableElements.current.findIndex(item => item.element === current)
      : focusableElements.current.length
    
    const previousIndex = currentIndex - 1
    if (previousIndex >= 0) {
      focusableElements.current[previousIndex].element.focus()
      return true
    }
    return focusLast()
  }, [focusLast])

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement

    switch (event.key) {
      case 'Tab':
        if (trapFocus) {
          event.preventDefault()
          if (event.shiftKey) {
            focusPrevious(activeElement as HTMLElement)
          } else {
            focusNext(activeElement as HTMLElement)
          }
        }
        break

      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
        }
        break

      case 'Enter':
        if (onEnter) {
          event.preventDefault()
          onEnter()
        }
        break

      case 'ArrowDown':
        event.preventDefault()
        focusNext(activeElement as HTMLElement)
        break

      case 'ArrowUp':
        event.preventDefault()
        focusPrevious(activeElement as HTMLElement)
        break

      case 'Home':
        event.preventDefault()
        focusFirst()
        break

      case 'End':
        event.preventDefault()
        focusLast()
        break
    }
  }, [trapFocus, onEscape, onEnter, focusNext, focusPrevious, focusFirst, focusLast])

  // Initialize focus trap
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (restoreFocus) {
      previouslyFocused.current = document.activeElement as HTMLElement
    }

    container.addEventListener('keydown', handleKeyDown)

    if (autoFocus) {
      // Focus first focusable element after a short delay
      setTimeout(() => {
        focusFirst()
      }, 100)
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      
      if (restoreFocus && previouslyFocused.current) {
        previouslyFocused.current.focus()
      }
    }
  }, [handleKeyDown, autoFocus, restoreFocus, focusFirst])

  const contextValue = React.useMemo(() => ({
    registerFocusable,
    unregisterFocusable,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
  }), [registerFocusable, unregisterFocusable, focusFirst, focusLast, focusNext, focusPrevious])

  return (
    <KeyboardNavigationContext.Provider value={contextValue}>
      <div ref={containerRef} className={trapFocus ? 'outline-none' : undefined}>
        {children}
      </div>
    </KeyboardNavigationContext.Provider>
  )
}

// Hook for components to use keyboard navigation
export const useKeyboardNavigation = () => {
  const context = React.useContext(KeyboardNavigationContext)
  return context
}

// Focusable component wrapper
export const Focusable: React.FC<{
  children: React.ReactNode
  priority?: number
  className?: string
  tabIndex?: number
}> = ({ children, priority = 0, className, tabIndex = 0 }) => {
  const { registerFocusable, unregisterFocusable } = useKeyboardNavigation()
  const ref = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const element = ref.current
    if (element) {
      registerFocusable(element, priority)
      return () => unregisterFocusable(element)
    }
  }, [registerFocusable, unregisterFocusable, priority])

  return React.cloneElement(children as React.ReactElement, {
    ref,
    className,
    tabIndex,
  })
}