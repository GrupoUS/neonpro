import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

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
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        // Healthcare-specific touch-optimized sizes
        'mobile-lg': 'h-14 px-6 py-4 text-base', // 56px minimum for medical workflows
        'accessibility-xl': 'h-12 px-6 py-3 text-lg', // Enhanced accessibility
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface AccessibilityButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  healthcareContext?: 'medical' | 'emergency' | 'admin' | 'patient'
}

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
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    // Healthcare-specific ARIA attributes
    const healthcareAria = healthcareContext ? {
      'aria-role': healthcareContext === 'emergency' ? 'alert' : undefined,
      'aria-atomic': healthcareContext === 'emergency',
    } : {}

    const isLoading = loading && !disabled

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          // Mobile touch optimization for healthcare
          size === 'mobile-lg' && 'min-h-[56px] min-w-[56px] touch-action-manipulation',
          isLoading && 'cursor-not-allowed opacity-70',
        )}
        ref={ref}
        disabled={isLoading || disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={isLoading}
        {...healthcareAria}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
            {loadingText || 'Carregando...'}
          </span>
        ) : children}
      </Comp>
    )
  },
)
AccessibilityButton.displayName = 'AccessibilityButton'

export { AccessibilityButton, buttonVariants }