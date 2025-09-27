import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils.js'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',        // 40px - standard
        sm: 'h-9 rounded-md px-3',        // 36px - small
        lg: 'h-11 rounded-md px-8',       // 44px - large
        icon: 'h-10 w-10',               // 40px - icon
        // Mobile and accessibility sizes (WCAG 2.1 AA+ compliant)
        mobile: 'h-12 px-6 py-3',         // 48px - mobile touch target
        'mobile-lg': 'h-14 px-8 py-4',    // 56px - large mobile touch target
        'accessibility-xl': 'h-16 px-8 py-5 text-lg', // 64px - accessibility extra large
        'touch-xl': 'h-20 px-10 py-6 text-lg', // 80px - motor accessibility
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  // Enhanced accessibility props
  ariaLabel?: string
  ariaDescribedBy?: string
  // Mobile optimization
  touchOptimized?: boolean
  // Healthcare context styling
  healthcareContext?: 'medical' | 'administrative' | 'emergency' | 'patient'
  // Loading state
  loading?: boolean
  loadingText?: string
  // Reduce motion for accessibility
  reduceMotion?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    ariaLabel,
    ariaDescribedBy,
    touchOptimized = false,
    healthcareContext,
    loading = false,
    loadingText,
    reduceMotion = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'

    // Healthcare-specific styling
    const healthcareStyles = {
      medical: 'border-l-4 border-red-500',
      administrative: 'border-l-4 border-blue-500',
      emergency: 'border-l-4 border-orange-500 animate-pulse',
      patient: 'border-l-4 border-green-500',
    }

    // Touch optimization classes
    const touchOptimizationClasses = touchOptimized ? [
      'min-h-[44px]',  // WCAG 2.1 AA+ minimum touch target
      'min-w-[44px]',
      'touch-action-manipulation',
      'select-none',
    ] : []

    // Reduced motion classes
    const motionClasses = reduceMotion ? 'transition-none' : ''

    // Combine all classes
    const combinedClasses = cn(
      buttonVariants({ variant, size, className }),
      healthcareStyles[healthcareContext] || '',
      touchOptimizationClasses.join(' '),
      motionClasses,
      loading && 'cursor-not-allowed opacity-70'
    )

    // Accessibility attributes
    const accessibilityProps = {
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-busy': loading,
      'aria-disabled': disabled || loading,
    }

    return (
      <Comp
        className={combinedClasses}
        ref={ref}
        disabled={disabled || loading}
        {...accessibilityProps}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className={`animate-spin rounded-full h-4 w-4 border-b-2 border-current ${reduceMotion ? 'animate-none' : ''}`}></span>
            {loadingText || 'Carregando...'}
          </span>
        ) : children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }