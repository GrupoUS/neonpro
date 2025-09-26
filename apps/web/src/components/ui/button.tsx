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
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/**
 * Extended props interface for Button component
 * @interface ButtonProps
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement>
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants>
{
  /** When true, renders the component as a Slot component for compound components */
  asChild?: boolean
}

/**
 * Button Component
 * 
 * A versatile button component built with Radix UI primitives and CVA for
 * consistent styling across the healthcare application. Supports multiple variants,
 * sizes, and accessibility features.
 * 
 * Features:
 * - Multiple visual variants (default, destructive, outline, secondary, ghost, link)
 * - Size variants (default, sm, lg, icon)
 * - Full accessibility support with ARIA attributes
 * - Forward ref support for compound components
 * - Consistent styling with healthcare design system
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Button>Save Patient</Button>
 * 
 * // With variant and size
 * <Button variant="destructive" size="lg">Delete Record</Button>
 * 
 * // As a link button
 * <Button variant="link">View Details</Button>
 * 
 * // With accessibility considerations
 * <Button aria-label="Add new patient">+ Patient</Button>
 * ```
 * 
 * LGPD Compliance Note: Button labels should be clear and descriptive when
 * handling patient data operations (e.g., "Export Patient Data" vs "Export").
 * 
 * @param {ButtonProps} props - Component props
 * @returns {JSX.Element} Rendered button component
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

/**
 * Button variants configuration using CVA (Class Variance Authority)
 * Provides consistent styling variants for different button states and purposes.
 * 
 * @type {VariantProps<typeof buttonVariants>}
 */
