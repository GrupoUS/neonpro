import { useMediaQuery, } from '@/hooks/use-media-query'
import type React from 'react'
import { createContext, useContext, useEffect, useState, } from 'react'

// Healthcare context types for responsive behavior
export type HealthcareContext =
  | 'normal' // Standard patient consultation
  | 'emergency' // Emergency/urgent care
  | 'post-procedure' // Post-procedure recovery
  | 'one-handed' // One-handed operation mode
  | 'high-contrast' // High contrast for visual impairments

// Layout variant based on screen size and context
export type LayoutVariant =
  | 'mobile-emergency' // 320px - Emergency interface only
  | 'mobile-standard' // 375px - Full patient interface
  | 'tablet-dual' // 768px - Dual pane layouts
  | 'desktop-dashboard' // 1024px - Full dashboard with sidebar

interface ResponsiveContextValue {
  variant: LayoutVariant
  healthcareContext: HealthcareContext
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  touchOptimized: boolean
  setHealthcareContext: (context: HealthcareContext,) => void
}

const ResponsiveContext = createContext<ResponsiveContextValue | null>(null,)

export function useResponsive() {
  const context = useContext(ResponsiveContext,)
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider',)
  }
  return context
}

interface ResponsiveProviderProps {
  children: React.ReactNode
  defaultHealthcareContext?: HealthcareContext
}

export function ResponsiveProvider({
  children,
  defaultHealthcareContext = 'normal',
}: ResponsiveProviderProps,) {
  const [healthcareContext, setHealthcareContext,] = useState<HealthcareContext>(
    defaultHealthcareContext,
  )

  // Media queries for healthcare-optimized breakpoints
  const isMobileSmall = useMediaQuery('(max-width: 374px)',)
  const isMobileStandard = useMediaQuery('(min-width: 375px) and (max-width: 767px)',)
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)',)
  const isDesktop = useMediaQuery('(min-width: 1024px)',)

  // Derived states
  const isMobile = isMobileSmall || isMobileStandard
  const touchOptimized = isMobile || isTablet

  // Determine layout variant based on screen size and healthcare context
  const variant: LayoutVariant = isMobileSmall || healthcareContext === 'emergency'
    ? 'mobile-emergency'
    : isMobileStandard
    ? 'mobile-standard'
    : isTablet
    ? 'tablet-dual'
    : 'desktop-dashboard'

  // Auto-detect healthcare context based on user preferences
  useEffect(() => {
    // High contrast preference detection
    if (window.matchMedia('(prefers-contrast: high)',).matches) {
      setHealthcareContext('high-contrast',)
    }

    // Touch device detection for post-procedure mode
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)',).matches
    const hasLimitedAccuracy = window.matchMedia('(any-hover: none)',).matches

    if (hasCoarsePointer && hasLimitedAccuracy && isMobile) {
      // Could indicate bandaged hands or motor difficulties
      // This is just a hint, user should explicitly enable if needed
    }
  }, [isMobile,],)

  const contextValue: ResponsiveContextValue = {
    variant,
    healthcareContext,
    isMobile,
    isTablet,
    isDesktop,
    touchOptimized,
    setHealthcareContext,
  }

  return (
    <ResponsiveContext.Provider value={contextValue}>
      <div
        className={`responsive-layout responsive-layout--${variant} healthcare-context--${healthcareContext}`}
        data-variant={variant}
        data-healthcare-context={healthcareContext}
        data-touch-optimized={touchOptimized}
      >
        {children}
      </div>
    </ResponsiveContext.Provider>
  )
}

interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function ResponsiveLayout({
  children,
  sidebar,
  header,
  className = '',
}: ResponsiveLayoutProps,) {
  const { variant, healthcareContext, touchOptimized, } = useResponsive()

  // Mobile emergency layout - simplified interface
  if (variant === 'mobile-emergency') {
    return (
      <div className={`layout-emergency ${className}`}>
        {header && (
          <header className="emergency-header">
            {header}
          </header>
        )}
        <main className="emergency-main">
          {children}
        </main>
      </div>
    )
  }

  // Mobile standard layout - full patient interface
  if (variant === 'mobile-standard') {
    return (
      <div className={`layout-mobile ${className}`}>
        {header && (
          <header className="mobile-header">
            {header}
          </header>
        )}
        <main className="mobile-main">
          {children}
        </main>
      </div>
    )
  }

  // Tablet dual-pane layout
  if (variant === 'tablet-dual') {
    return (
      <div className={`layout-tablet dual-pane ${className}`}>
        {sidebar && (
          <aside className="tablet-sidebar">
            {sidebar}
          </aside>
        )}
        <div className="tablet-content">
          {header && (
            <header className="tablet-header">
              {header}
            </header>
          )}
          <main className="tablet-main">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Desktop dashboard layout
  return (
    <div className={`layout-desktop dashboard-layout ${className}`}>
      {sidebar && (
        <aside className="sidebar">
          {sidebar}
        </aside>
      )}
      {header && (
        <header className="header">
          {header}
        </header>
      )}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

// Healthcare context switcher component for manual control
interface HealthcareContextSwitcherProps {
  className?: string
}

export function HealthcareContextSwitcher({ className = '', }: HealthcareContextSwitcherProps,) {
  const { healthcareContext, setHealthcareContext, } = useResponsive()

  const contexts: { value: HealthcareContext; label: string; description: string }[] = [
    { value: 'normal', label: 'Normal', description: 'Standard consultation mode', },
    { value: 'emergency', label: 'Emergency', description: 'Urgent care with large targets', },
    { value: 'post-procedure', label: 'Post-Procedure', description: 'Enhanced accessibility', },
    { value: 'one-handed', label: 'One-Handed', description: 'Single-hand operation', },
    { value: 'high-contrast', label: 'High Contrast', description: 'Enhanced visibility', },
  ]

  return (
    <div className={`healthcare-context-switcher ${className}`}>
      <label htmlFor="healthcare-context" className="context-label">
        Accessibility Mode:
      </label>
      <select
        id="healthcare-context"
        value={healthcareContext}
        onChange={(e,) => setHealthcareContext(e.target.value as HealthcareContext,)}
        className="context-select touch-target"
      >
        {contexts.map((context,) => (
          <option key={context.value} value={context.value}>
            {context.label} - {context.description}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ResponsiveLayout
