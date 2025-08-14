/**
 * NeonPro - Keyboard Navigation Provider
 * Enhanced keyboard navigation system for healthcare application
 * 
 * Features:
 * - Skip links for main sections
 * - Roving tabindex for complex widgets
 * - Arrow key navigation
 * - Focus trap management
 * - Screen reader announcements
 * - Healthcare-specific shortcuts
 */

'use client'

import { useTranslation } from '@/hooks/use-translation'
import {
    FocusManager,
    KEYBOARD_KEYS,
    KeyboardNavigation,
    announceToScreenReader
} from '@/lib/accessibility/accessibility-utils'
import { cn } from '@/lib/utils'
import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react'

interface KeyboardNavigationContextType {
  focusTrapStack: HTMLElement[]
  pushFocusTrap: (element: HTMLElement) => void
  popFocusTrap: () => void
  skipToContent: () => void
  skipToNavigation: () => void
  skipToSearch: () => void
  announceNavigation: (message: string) => void
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined)

/**
 * Skip Links Component
 * Essential for keyboard users to quickly navigate to main content
 */
export function SkipLinks() {
  const { t } = useTranslation()

  return (
    <div 
      className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-50 bg-primary text-primary-foreground p-2 space-x-2"
      role="navigation"
      aria-label="Links de navegação rápida"
    >
      <a
        href="#main-content"
        className="inline-block px-4 py-2 bg-primary-foreground text-primary rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        onClick={(e) => {
          e.preventDefault()
          const element = document.getElementById('main-content')
          element?.focus()
          element?.scrollIntoView({ behavior: 'smooth' })
          announceToScreenReader(t('accessibility.skipToContent'), 'assertive')
        }}
      >
        {t('accessibility.skipToContent')}
      </a>
      <a
        href="#main-navigation"
        className="inline-block px-4 py-2 bg-primary-foreground text-primary rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        onClick={(e) => {
          e.preventDefault()
          const element = document.getElementById('main-navigation')
          element?.focus()
          element?.scrollIntoView({ behavior: 'smooth' })
          announceToScreenReader(t('accessibility.skipToNavigation'), 'assertive')
        }}
      >
        {t('accessibility.skipToNavigation')}
      </a>
      <a
        href="#search"
        className="inline-block px-4 py-2 bg-primary-foreground text-primary rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        onClick={(e) => {
          e.preventDefault()
          const element = document.getElementById('search')
          element?.focus()
          element?.scrollIntoView({ behavior: 'smooth' })
          announceToScreenReader(t('accessibility.skipToSearch'), 'assertive')
        }}
      >
        {t('accessibility.skipToSearch')}
      </a>
    </div>
  )
}

/**
 * Keyboard Navigation Provider
 * Global keyboard navigation management
 */
interface KeyboardNavigationProviderProps {
  children: ReactNode
}

export function KeyboardNavigationProvider({ children }: KeyboardNavigationProviderProps) {
  const [focusTrapStack, setFocusTrapStack] = useState<HTMLElement[]>([])
  const { t } = useTranslation()

  const pushFocusTrap = useCallback((element: HTMLElement) => {
    setFocusTrapStack(prev => [...prev, element])
  }, [])

  const popFocusTrap = useCallback(() => {
    setFocusTrapStack(prev => prev.slice(0, -1))
  }, [])

  const skipToContent = useCallback(() => {
    const element = document.getElementById('main-content')
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth' })
      announceToScreenReader(t('accessibility.skipToContent'), 'assertive')
    }
  }, [t])

  const skipToNavigation = useCallback(() => {
    const element = document.getElementById('main-navigation')
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth' })
      announceToScreenReader(t('accessibility.skipToNavigation'), 'assertive')
    }
  }, [t])

  const skipToSearch = useCallback(() => {
    const element = document.getElementById('search')
    if (element) {
      element.focus()
      element.scrollIntoView({ behavior: 'smooth' })
      announceToScreenReader(t('accessibility.skipToSearch'), 'assertive')
    }
  }, [t])

  const announceNavigation = useCallback((message: string) => {
    announceToScreenReader(message, 'assertive')
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + 1: Skip to main content
      if (event.altKey && event.key === '1') {
        event.preventDefault()
        skipToContent()
        return
      }

      // Alt + 2: Skip to navigation
      if (event.altKey && event.key === '2') {
        event.preventDefault()
        skipToNavigation()
        return
      }

      // Alt + 3: Skip to search
      if (event.altKey && event.key === '3') {
        event.preventDefault()
        skipToSearch()
        return
      }

      // Escape: Close modal/dropdown (handled by focus trap)
      if (event.key === KEYBOARD_KEYS.ESCAPE && focusTrapStack.length > 0) {
        event.preventDefault()
        const currentTrap = focusTrapStack[focusTrapStack.length - 1]
        const closeButton = currentTrap.querySelector('[data-close-button]') as HTMLElement
        closeButton?.click()
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [focusTrapStack, skipToContent, skipToNavigation, skipToSearch])

  const value: KeyboardNavigationContextType = {
    focusTrapStack,
    pushFocusTrap,
    popFocusTrap,
    skipToContent,
    skipToNavigation,
    skipToSearch,
    announceNavigation,
  }

  return (
    <KeyboardNavigationContext.Provider value={value}>
      <SkipLinks />
      {children}
    </KeyboardNavigationContext.Provider>
  )
}

/**
 * Hook to use keyboard navigation context
 */
export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext)
  if (context === undefined) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider')
  }
  return context
}

/**
 * Roving Tabindex Hook
 * For lists and menus with arrow key navigation
 */
export function useRovingTabindex<T extends HTMLElement>(items: T[], activeIndex: number) {
  useEffect(() => {
    items.forEach((item, index) => {
      item.tabIndex = index === activeIndex ? 0 : -1
    })
  }, [items, activeIndex])
}

/**
 * Arrow Navigation Hook
 * Provides arrow key navigation for lists and menus
 */
export function useArrowNavigation() {
  const handleArrowNavigation = useCallback(
    (
      event: React.KeyboardEvent,
      items: HTMLElement[],
      currentIndex: number,
      onIndexChange: (newIndex: number) => void,
      options: {
        circular?: boolean
        orientation?: 'horizontal' | 'vertical' | 'both'
      } = {}
    ) => {
      const { circular = true, orientation = 'vertical' } = options

      KeyboardNavigation.handleArrowNavigation(
        event.nativeEvent,
        items,
        currentIndex,
        onIndexChange,
        circular
      )
    },
    []
  )

  return handleArrowNavigation
}

/**
 * Focus Trap Hook
 * Trap focus within a container for modals and dropdowns
 */
export function useFocusTrap(isActive: boolean = false) {
  const containerRef = useRef<HTMLElement>(null)
  const { pushFocusTrap, popFocusTrap } = useKeyboardNavigation()

  useEffect(() => {
    if (isActive && containerRef.current) {
      const container = containerRef.current
      pushFocusTrap(container)

      const cleanup = FocusManager.trapFocus({ current: container })

      return () => {
        cleanup?.()
        popFocusTrap()
      }
    }
  }, [isActive, pushFocusTrap, popFocusTrap])

  return containerRef
}

/**
 * Accessible Menu Component
 * Menu with full keyboard navigation support
 */
interface AccessibleMenuProps {
  items: Array<{
    id: string
    label: string
    href?: string
    onClick?: () => void
    disabled?: boolean
    icon?: React.ComponentType<{ className?: string }>
  }>
  orientation?: 'horizontal' | 'vertical'
  className?: string
  onClose?: () => void
}

export function AccessibleMenu({
  items,
  orientation = 'vertical',
  className,
  onClose,
}: AccessibleMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const handleArrowNavigation = useArrowNavigation()

  // Set up roving tabindex
  useRovingTabindex(itemRefs.current.filter(Boolean) as HTMLElement[], activeIndex)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const validItems = itemRefs.current.filter(Boolean) as HTMLElement[]

    // Arrow navigation
    if ([KEYBOARD_KEYS.ARROW_UP, KEYBOARD_KEYS.ARROW_DOWN, KEYBOARD_KEYS.ARROW_LEFT, KEYBOARD_KEYS.ARROW_RIGHT].includes(event.key as any)) {
      handleArrowNavigation(event, validItems, activeIndex, setActiveIndex, {
        orientation: 'both',
        circular: true,
      })
      return
    }

    // Home/End keys
    if (event.key === KEYBOARD_KEYS.HOME) {
      event.preventDefault()
      setActiveIndex(0)
      validItems[0]?.focus()
      return
    }

    if (event.key === KEYBOARD_KEYS.END) {
      event.preventDefault()
      const lastIndex = validItems.length - 1
      setActiveIndex(lastIndex)
      validItems[lastIndex]?.focus()
      return
    }

    // Enter/Space activation
    if (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE) {
      event.preventDefault()
      const activeItem = items[activeIndex]
      if (activeItem && !activeItem.disabled) {
        activeItem.onClick?.()
        onClose?.()
      }
      return
    }

    // Escape to close
    if (event.key === KEYBOARD_KEYS.ESCAPE) {
      event.preventDefault()
      onClose?.()
      return
    }

    // Letter navigation
    if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
      const letter = event.key.toLowerCase()
      const startIndex = (activeIndex + 1) % items.length
      
      for (let i = 0; i < items.length; i++) {
        const index = (startIndex + i) % items.length
        const item = items[index]
        if (item.label.toLowerCase().startsWith(letter) && !item.disabled) {
          setActiveIndex(index)
          validItems[index]?.focus()
          break
        }
      }
    }
  }

  return (
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        'space-y-1 p-1',
        orientation === 'horizontal' && 'flex space-y-0 space-x-1',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        
        return (
          <div
            key={item.id}
            ref={(el) => { itemRefs.current[index] = el }}
            role="menuitem"
            tabIndex={index === activeIndex ? 0 : -1}
            className={cn(
              'flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'hover:bg-accent hover:text-accent-foreground',
              item.disabled && 'opacity-50 cursor-not-allowed',
              index === activeIndex && 'bg-accent text-accent-foreground'
            )}
            aria-disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                item.onClick?.()
                onClose?.()
              }
            }}
            onFocus={() => setActiveIndex(index)}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {item.label}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Accessible Breadcrumb Navigation
 * WCAG compliant breadcrumb with keyboard navigation
 */
interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface AccessibleBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function AccessibleBreadcrumb({ items, className }: AccessibleBreadcrumbProps) {
  const { t } = useTranslation()

  return (
    <nav
      aria-label="Navegação estrutural"
      className={cn('flex', className)}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground" aria-hidden="true">
                  /
                </span>
              )}
              
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    'px-1',
                    isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                  aria-current={item.current || isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Accessible Tab Navigation
 * Full keyboard support for tab interfaces
 */
interface Tab {
  id: string
  label: string
  disabled?: boolean
}

interface AccessibleTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  children: ReactNode
  className?: string
}

export function AccessibleTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: AccessibleTabsProps) {
  const [focusedTab, setFocusedTab] = useState(activeTab)
  const tabRefs = useRef<(HTMLElement | null)[]>([])
  const handleArrowNavigation = useArrowNavigation()

  const activeIndex = tabs.findIndex(tab => tab.id === focusedTab)

  // Set up roving tabindex
  useRovingTabindex(tabRefs.current.filter(Boolean) as HTMLElement[], activeIndex)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const validTabs = tabRefs.current.filter(Boolean) as HTMLElement[]

    // Arrow key navigation
    if ([KEYBOARD_KEYS.ARROW_LEFT, KEYBOARD_KEYS.ARROW_RIGHT].includes(event.key as any)) {
      handleArrowNavigation(event, validTabs, activeIndex, (newIndex) => {
        const newTab = tabs[newIndex]
        if (newTab && !newTab.disabled) {
          setFocusedTab(newTab.id)
          validTabs[newIndex]?.focus()
        }
      }, { orientation: 'horizontal' })
      return
    }

    // Enter/Space to activate tab
    if (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE) {
      event.preventDefault()
      const focusedTabData = tabs.find(tab => tab.id === focusedTab)
      if (focusedTabData && !focusedTabData.disabled) {
        onTabChange(focusedTab)
      }
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        role="tablist"
        className="flex border-b border-border"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el }}
            role="tab"
            tabIndex={tab.id === focusedTab ? 0 : -1}
            aria-selected={tab.id === activeTab}
            aria-controls={`tabpanel-${tab.id}`}
            disabled={tab.disabled}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed',
              tab.id === activeTab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-border'
            )}
            onClick={() => {
              if (!tab.disabled) {
                onTabChange(tab.id)
                setFocusedTab(tab.id)
              }
            }}
            onFocus={() => setFocusedTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={activeTab}
        tabIndex={0}
        className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
      >
        {children}
      </div>
    </div>
  )
}
