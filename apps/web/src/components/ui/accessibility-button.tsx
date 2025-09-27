import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils.js'

// Enhanced button variants with healthcare-specific styling
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // Healthcare-specific variants
        medical: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        emergency: 'bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-500 animate-pulse',
        success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500',
        info: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        // Healthcare-specific touch-optimized sizes (WCAG 2.1 AA+ compliant)
        'mobile-lg': 'h-14 px-6 py-4 text-base', // 56px minimum for medical workflows
        'accessibility-xl': 'h-12 px-6 py-3 text-lg', // Enhanced accessibility
        'touch-xl': 'h-16 px-8 py-5 text-lg', // 64px for motor accessibility
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

// Enhanced accessibility button props with healthcare compliance
export interface AccessibilityButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  healthcareContext?: 'medical' | 'emergency' | 'admin' | 'patient' | 'aesthetic'
  // Enhanced accessibility features
  shortcutKey?: string
  announcement?: string
  roleOverride?: string
  // LGPD compliance
  lgpdAction?: 'data_access' | 'data_deletion' | 'data_consent' | 'data_export'
  // Healthcare workflow support
  requiresConfirmation?: boolean
  confirmationMessage?: string
  highContrastMode?: boolean
  reducedMotion?: boolean
  // Screen reader enhancements
  screenReaderOnly?: boolean
  liveRegion?: 'polite' | 'assertive'
}

// Healthcare-specific action types
type HealthcareAction =
  | 'emergency_call'
  | 'medical_procedure'
  | 'patient_alert'
  | 'admin_action'
  | 'consent_management'
  | 'data_access'

const AccessibilityButton = React.forwardRef<HTMLButtonElement, AccessibilityButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    ariaLabel,
    ariaDescribedBy,
    healthcareContext,
    disabled,
    children,
    shortcutKey,
    announcement,
    roleOverride,
    lgpdAction,
    requiresConfirmation = false,
    confirmationMessage,
    highContrastMode = false,
    reducedMotion = false,
    screenReaderOnly = false,
    liveRegion,
    onClick,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const [isConfirmed, setIsConfirmed] = React.useState(false)
    const [showConfirmation, setShowConfirmation] = React.useState(false)

    // Healthcare-specific ARIA attributes and roles
    const healthcareAria = React.useMemo(() => {
      const baseAria: Record<string, string | boolean | undefined> = {
        'role': roleOverride || (healthcareContext === 'emergency' ? 'alert' : 'button'),
        'aria-atomic': healthcareContext === 'emergency',
      }

      // Add healthcare-specific attributes
      if (healthcareContext === 'emergency') {
        baseAria['aria-live'] = 'assertive'
        baseAria['aria-atomic'] = true
      }

      if (lgpdAction) {
        baseAria['aria-describedby'] = `lgpd-${lgpdAction}-help`
      }

      return baseAria
    }, [healthcareContext, roleOverride, lgpdAction])

    // Keyboard shortcut handling
    React.useEffect(() => {
      if (shortcutKey && !disabled && !loading) {
        const handleKeyPress = (event: KeyboardEvent) => {
          if (event.key === shortcutKey || (event.ctrlKey && event.key === shortcutKey)) {
            event.preventDefault()
            event.stopPropagation()

            if (requiresConfirmation && !isConfirmed) {
              setShowConfirmation(true)
              return
            }

            const syntheticEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
            })

            const button = ref as React.RefObject<HTMLButtonElement>
            button.current?.dispatchEvent(syntheticEvent)
          }
        }

        document.addEventListener('keydown', handleKeyPress)
        return () => document.removeEventListener('keydown', handleKeyPress)
      }
    }, [shortcutKey, disabled, loading, requiresConfirmation, isConfirmed, ref])

    // Handle confirmation workflow
    const handleConfirmation = () => {
      setIsConfirmed(true)
      setShowConfirmation(false)

      // Trigger the original click
      setTimeout(() => {
        const syntheticEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        })
        const button = ref as React.RefObject<HTMLButtonElement>
        button.current?.dispatchEvent(syntheticEvent)
        setIsConfirmed(false)
      }, 100)
    }

    const handleCancelConfirmation = () => {
      setShowConfirmation(false)
      setIsConfirmed(false)
    }

    // Enhanced click handler with announcement support
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (requiresConfirmation && !isConfirmed) {
        event.preventDefault()
        setShowConfirmation(true)
        return
      }

      // Screen reader announcement
      if (announcement && liveRegion) {
        const announcementElement = document.createElement('div')
        announcementElement.setAttribute('role', 'status')
        announcementElement.setAttribute('aria-live', liveRegion)
        announcementElement.className = 'sr-only'
        announcementElement.textContent = announcement
        document.body.appendChild(announcementElement)

        setTimeout(() => {
          document.body.removeChild(announcementElement)
        }, 1000)
      }

      onClick?.(event)
    }

    const isLoading = loading && !disabled
    const isDisabled = isLoading || disabled || (requiresConfirmation && showConfirmation)

    // Healthcare-specific styling classes
    const healthcareClasses = React.useMemo(() => {
      const classes: string[] = []

      if (healthcareContext === 'emergency') {
        classes.push('border-2 border-red-300 shadow-lg')
      }

      if (lgpdAction) {
        classes.push('border-l-4 border-purple-500')
      }

      if (highContrastMode) {
        classes.push('border-2 border-current bg-black text-white')
      }

      if (screenReaderOnly) {
        classes.push('sr-only')
      }

      return classes.join(' ')
    }, [healthcareContext, lgpdAction, highContrastMode, screenReaderOnly])

    // Reduced motion animation classes
    const animationClasses = reducedMotion ? 'transition-none' : ''

    if (screenReaderOnly) {
      return (
        <Comp
          ref={ref}
          className={cn(
            buttonVariants({ variant, size, className }),
            healthcareClasses,
            animationClasses
          )}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-busy={isLoading}
          onClick={handleClick}
          {...healthcareAria}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <>
        <Comp
          ref={ref}
          className={cn(
            buttonVariants({ variant, size, className }),
            // Mobile touch optimization for healthcare (WCAG 2.1 AA+)
            size && ['mobile-lg', 'touch-xl'].includes(size) && 'min-h-[56px] min-w-[56px] touch-action-manipulation',
            isLoading && 'cursor-not-allowed opacity-70',
            healthcareClasses,
            animationClasses
          )}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-busy={isLoading}
          onClick={handleClick}
          {...healthcareAria}
          {...props}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className={`animate-spin rounded-full h-4 w-4 border-b-2 border-current ${reducedMotion ? 'animate-none' : ''}`}></span>
              {loadingText || 'Carregando...'}
            </span>
          ) : showConfirmation ? (
            <span className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              Confirmar?
            </span>
          ) : (
            children
          )}

          {/* Shortcut key indicator */}
          {shortcutKey && (
            <span className="ml-2 text-xs opacity-60 bg-gray-200 px-1 py-0.5 rounded">
              {shortcutKey}
            </span>
          )}
        </Comp>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Confirmar Ação
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmationMessage || 'Tem certeza que deseja realizar esta ação?'}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelConfirmation}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmation}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LGPD Help Text */}
        {lgpdAction && (
          <div
            id={`lgpd-${lgpdAction}-help`}
            className="sr-only"
          >
            {lgpdAction === 'data_access' && 'Acessar dados pessoais do paciente conforme LGPD'}
            {lgpdAction === 'data_deletion' && 'Excluir dados pessoais do paciente conforme LGPD'}
            {lgpdAction === 'data_consent' && 'Gerenciar consentimento de dados conforme LGPD'}
            {lgpdAction === 'data_export' && 'Exportar dados pessoais do paciente conforme LGPD'}
          </div>
        )}
      </>
    )
  },
)
AccessibilityButton.displayName = 'AccessibilityButton'

// Healthcare-specific button presets
export const HealthcareButtons = {
  Emergency: (props: Omit<AccessibilityButtonProps, 'variant' | 'healthcareContext'>) => (
    <AccessibilityButton
      variant="emergency"
      healthcareContext="emergency"
      {...props}
    />
  ),

  Medical: (props: Omit<AccessibilityButtonProps, 'variant' | 'healthcareContext'>) => (
    <AccessibilityButton
      variant="medical"
      healthcareContext="medical"
      {...props}
    />
  ),

  Success: (props: Omit<AccessibilityButtonProps, 'variant'>) => (
    <AccessibilityButton
      variant="success"
      {...props}
    />
  ),

  Warning: (props: Omit<AccessibilityButtonProps, 'variant'>) => (
    <AccessibilityButton
      variant="warning"
      {...props}
    />
  ),

  Info: (props: Omit<AccessibilityButtonProps, 'variant'>) => (
    <AccessibilityButton
      variant="info"
      {...props}
    />
  ),

  LGPD: (props: Omit<AccessibilityButtonProps, 'lgpdAction'> & { lgpdAction: AccessibilityButtonProps['lgpdAction'] }) => (
    <AccessibilityButton
      variant="outline"
      {...props}
    />
  ),
}

export { AccessibilityButton, buttonVariants }
