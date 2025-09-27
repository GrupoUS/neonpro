import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils.js'

// Mobile-optimized button variants for healthcare workflows (WCAG 2.1 AA+ compliant)
const mobileButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // Healthcare-specific variants with enhanced mobile contrast
        medical: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600',
        emergency: 'bg-orange-700 text-white hover:bg-orange-800 focus-visible:ring-orange-600',
        success: 'bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-600',
        warning: 'bg-yellow-600 text-gray-900 hover:bg-yellow-700 focus-visible:ring-yellow-600',
        info: 'bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-600',
        // LGPD compliance variants
        lgpd: 'bg-purple-700 text-white hover:bg-purple-800 focus-visible:ring-purple-600',
      },
      size: {
        // WCAG 2.1 AA+ compliant touch targets (44-80px minimum)
        mobile: 'h-11 min-h-[44px] px-4 py-3 text-base', // 44px minimum
        'mobile-lg': 'h-14 min-h-[56px] px-6 py-4 text-lg', // 56px for medical workflows
        'mobile-xl': 'h-16 min-h-[64px] px-8 py-5 text-lg', // 64px for enhanced accessibility
        'touch-xl': 'h-20 min-h-[80px] px-10 py-6 text-xl', // 80px maximum for motor accessibility
        // Medical glove compatibility sizes
        'medical-glove': 'h-18 min-h-[72px] px-8 py-5 text-lg', // 72px for medical gloves
        'emergency': 'h-20 min-h-[80px] px-10 py-6 text-xl font-bold', // 80px for emergency situations
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'mobile',
    },
  },
)

export interface MobileHealthcareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  // Healthcare-specific accessibility
  healthcareContext?: 'medical' | 'emergency' | 'admin' | 'patient' | 'aesthetic'
  // Enhanced accessibility features
  ariaLabel?: string
  ariaDescribedBy?: string
  // Touch optimization
  hapticFeedback?: boolean
  touchFeedback?: boolean
  // Screen reader support
  screenReaderAnnouncement?: string
  // LGPD compliance
  lgpdAction?: 'data_access' | 'data_deletion' | 'data_consent' | 'data_export'
  // Healthcare workflow support
  emergencyLevel?: 'low' | 'medium' | 'high' | 'critical'
  requiresConfirmation?: boolean
}

const MobileHealthcareButton = React.forwardRef<HTMLButtonElement, MobileHealthcareButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    healthcareContext,
    disabled,
    children,
    ariaLabel,
    ariaDescribedBy,
    hapticFeedback = false,
    touchFeedback = true,
    screenReaderAnnouncement,
    lgpdAction,
    emergencyLevel,
    requiresConfirmation = false,
    onClick,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const [isPressed, setIsPressed] = React.useState(false)
    const [showConfirmation, setShowConfirmation] = React.useState(false)

    // Healthcare-specific ARIA attributes
    const healthcareAria = React.useMemo(() => {
      const baseAria: Record<string, string | boolean | undefined> = {
        'role': healthcareContext === 'emergency' ? 'alert' : 'button',
        'aria-live': healthcareContext === 'emergency' ? 'assertive' : undefined,
        'aria-atomic': healthcareContext === 'emergency',
      }

      if (emergencyLevel === 'critical') {
        baseAria['aria-atomic'] = true
      }

      if (lgpdAction) {
        baseAria['aria-describedby'] = `lgpd-${lgpdAction}-help`
      }

      return baseAria
    }, [healthcareContext, emergencyLevel, lgpdAction])

    // Handle touch feedback for medical gloves
    const handleTouchStart = React.useCallback(() => {
      if (touchFeedback && !disabled && !loading) {
        setIsPressed(true)
        // Haptic feedback if supported
        if (hapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }
    }, [touchFeedback, disabled, loading, hapticFeedback])

    const handleTouchEnd = React.useCallback(() => {
      setIsPressed(false)
    }, [])

    // Handle screen reader announcements
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (requiresConfirmation && !showConfirmation) {
        event.preventDefault()
        setShowConfirmation(true)
        return
      }

      if (screenReaderAnnouncement) {
        const announcement = document.createElement('div')
        announcement.setAttribute('role', 'status')
        announcement.setAttribute('aria-live', 'polite')
        announcement.setAttribute('aria-atomic', 'true')
        announcement.className = 'sr-only'
        announcement.textContent = screenReaderAnnouncement
        document.body.appendChild(announcement)

        setTimeout(() => {
          document.body.removeChild(announcement)
        }, 1000)
      }

      onClick?.(event)
    }

    const isLoading = loading && !disabled
    const isDisabled = isLoading || disabled || (requiresConfirmation && showConfirmation)

    // Healthcare-specific styling classes
    const healthcareClasses = React.useMemo(() => {
      const classes: string[] = []

      // Emergency styling with enhanced contrast
      if (healthcareContext === 'emergency') {
        classes.push('border-2 border-red-500 shadow-lg')
        if (emergencyLevel === 'critical') {
          classes.push('animate-pulse border-red-700')
        }
      }

      // LGPD compliance styling
      if (lgpdAction) {
        classes.push('border-l-4 border-purple-500')
      }

      // Touch feedback states
      if (isPressed && touchFeedback) {
        classes.push('scale-95 opacity-80')
      }

      // Emergency level styling
      if (emergencyLevel === 'critical') {
        classes.push('font-bold')
      }

      return classes.join(' ')
    }, [healthcareContext, lgpdAction, emergencyLevel, isPressed, touchFeedback])

    return (
      <>
        <Comp
          ref={ref}
          className={cn(
            mobileButtonVariants({ variant, size, className }),
            // Mobile optimization classes
            'touch-manipulation select-none active:scale-95 transition-transform',
            // Healthcare-specific classes
            healthcareClasses,
            // Disabled state styling
            isDisabled && 'cursor-not-allowed opacity-50'
          )}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-busy={isLoading}
          aria-disabled={isDisabled}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={handleClick}
          {...healthcareAria}
          {...props}
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></span>
              {loadingText || 'Carregando...'}
            </span>
          ) : showConfirmation ? (
            <span className="flex items-center gap-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              Confirmar?
            </span>
          ) : (
            children
          )}
        </Comp>

        {/* Confirmation Modal for Critical Actions */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border-2 border-gray-300">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  Confirmar Ação Crítica
                </h3>
                <p className="text-gray-600 mb-6">
                  Esta ação requer confirmação devido à sua importância. Tem certeza que deseja continuar?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors h-12 min-h-[48px] touch-manipulation"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmation(false)
                      onClick?.(new MouseEvent('click') as any)
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors h-12 min-h-[48px] touch-manipulation"
                  >
                    Confirmar
                  </button>
                </div>
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
            {lgpdAction === 'data_access' && 'Acessar dados pessoais do paciente conforme Lei Geral de Proteção de Dados'}
            {lgpdAction === 'data_deletion' && 'Excluir dados pessoais do paciente conforme LGPD'}
            {lgpdAction === 'data_consent' && 'Gerenciar consentimento de dados conforme LGPD'}
            {lgpdAction === 'data_export' && 'Exportar dados pessoais do paciente conforme LGPD'}
          </div>
        )}
      </>
    )
  },
)
MobileHealthcareButton.displayName = 'MobileHealthcareButton'

// Healthcare-specific button presets
export const HealthcareMobileButtons = {
  Emergency: (props: Omit<MobileHealthcareButtonProps, 'variant' | 'healthcareContext' | 'size'>) => (
    <MobileHealthcareButton
      variant="emergency"
      healthcareContext="emergency"
      size="emergency"
      emergencyLevel="critical"
      {...props}
    />
  ),

  Medical: (props: Omit<MobileHealthcareButtonProps, 'variant' | 'healthcareContext' | 'size'>) => (
    <MobileHealthcareButton
      variant="medical"
      healthcareContext="medical"
      size="medical-glove"
      {...props}
    />
  ),

  LGPD: (props: Omit<MobileHealthcareButtonProps, 'lgpdAction' | 'variant' | 'size'> & { lgpdAction: MobileHealthcareButtonProps['lgpdAction'] }) => (
    <MobileHealthcareButton
      variant="lgpd"
      size="mobile-lg"
      {...props}
    />
  ),

  Success: (props: Omit<MobileHealthcareButtonProps, 'variant' | 'size'>) => (
    <MobileHealthcareButton
      variant="success"
      size="mobile-lg"
      {...props}
    />
  ),

  Warning: (props: Omit<MobileHealthcareButtonProps, 'variant' | 'size'>) => (
    <MobileHealthcareButton
      variant="warning"
      size="mobile-lg"
      {...props}
    />
  ),

  Info: (props: Omit<MobileHealthcareButtonProps, 'variant' | 'size'>) => (
    <MobileHealthcareButton
      variant="info"
      size="mobile"
      {...props}
    />
  ),
}

export { MobileHealthcareButton, mobileButtonVariants }