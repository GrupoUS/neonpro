import { cn } from "../../lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-target healthcare-focus-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // NeonPro specific variants from @apex-ui-ux-designer.md
        neonpro: "bg-neonpro-primary text-white hover:bg-neonpro-primary/90 focus:ring-neonpro-primary neonpro-neumorphic",
        "neonpro-accent": "bg-neonpro-accent text-neonpro-deep-blue hover:bg-neonpro-accent/90 focus:ring-neonpro-accent neonpro-neumorphic",
        "neonpro-medical": "bg-neonpro-deep-blue text-white hover:bg-neonpro-deep-blue/90 focus:ring-neonpro-deep-blue neonpro-neumorphic",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Touch-friendly sizes for mobile
        touch: "h-12 px-6 py-3 text-base", // 48px height for touch accessibility
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  // NeonPro Healthcare Props from @apex-ui-ux-designer.md
  readonly clientId?: string
  readonly userRole?: 'admin' | 'aesthetician' | 'coordinator'
  readonly lgpdCompliant?: boolean
  readonly onAuditLog?: (action: string, details?: Record<string, any>) => void
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, clientId, userRole, lgpdCompliant = true, onAuditLog, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      // Healthcare audit logging
      if (onAuditLog && lgpdCompliant) {
        onAuditLog('button_click', {
          userRole,
          clientId,
          variant,
          timestamp: new Date().toISOString(),
          component: 'Button'
        })
      }

      props.onClick?.(e)
    }, [onAuditLog, lgpdCompliant, userRole, clientId, variant, props])

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        onClick={handleClick}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
