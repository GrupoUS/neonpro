import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils.ts'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: '',
        required: 'after:content-["*"] after:ml-0.5 after:text-red-500',
        optional: 'after:content-["(opcional)"] after:ml-0.5 after:text-muted-foreground',
        healthcare: 'font-semibold text-healthcare-primary',
      },
      size: {
        default: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface AccessibilityLabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
  VariantProps<typeof labelVariants> {
  required?: boolean
  optional?: boolean
  healthcareContext?: boolean
  helperText?: string
  errorId?: string
}

const AccessibilityLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  AccessibilityLabelProps
>(({ 
  className, 
  variant,
  size,
  required = false,
  optional = false,
  healthcareContext = false,
  helperText,
  errorId,
  children,
  ...props 
}, ref) => {
  // Determine variant based on props
  const labelVariant = variant || (required ? 'required' : optional ? 'optional' : healthcareContext ? 'healthcare' : 'default')
  
  // Generate ID for helper text
  const helperId = helperText ? `helper-${React.useId()}` : undefined

  return (
    <div className="space-y-1">
      <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants({ variant: labelVariant, size, className }))}
        aria-required={required}
        {...props}
      >
        {children}
      </LabelPrimitive.Root>
      
      {helperText && (
        <span 
          id={helperId}
          className="text-xs text-muted-foreground block"
        >
          {helperText}
        </span>
      )}
    </div>
  )
})
AccessibilityLabel.displayName = LabelPrimitive.Root.displayName

export { AccessibilityLabel, labelVariants }