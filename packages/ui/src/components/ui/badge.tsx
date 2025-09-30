import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Healthcare-specific variants
        medical:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100",
        emergency:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  // Healthcare-specific props
  healthcare?: boolean
  compliance?: boolean
  ariaLabel?: string
}

function Badge({
  className,
  variant,
  healthcare = false,
  compliance = false,
  ariaLabel,
  children,
  ...props
}: BadgeProps) {
  // Auto-apply healthcare variants when in healthcare mode
  let effectiveVariant = variant
  if (healthcare && !variant) {
    effectiveVariant = "medical"
  }
  if (compliance && !variant) {
    effectiveVariant = "success"
  }

  return (
    <div
      className={cn(badgeVariants({ variant: effectiveVariant }), className)}
      aria-label={ariaLabel}
      role="status"
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge, badgeVariants }