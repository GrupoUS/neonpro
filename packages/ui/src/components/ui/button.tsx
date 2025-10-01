import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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
        // Healthcare-specific variants
        emergency: "bg-red-600 text-white hover:bg-red-700 shadow-lg",
        medical: "bg-blue-600 text-white hover:bg-blue-700",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-500 text-gray-900 hover:bg-yellow-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Healthcare-specific sizes
        xl: "h-12 rounded-lg px-10 text-base", // For emergency buttons
        accessible: "h-14 rounded-lg px-6 text-lg", // 44px+ touch targets
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
  // Healthcare-specific props
  emergency?: boolean
  accessible?: boolean
  ariaLabel?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      emergency,
      accessible,
      ariaLabel,
      onClick,
      onKeyDown,
      role,
      tabIndex,
      ...restProps
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"

    // Apply emergency/accessible variants
    let finalVariant = variant
    let finalSize = size

    if (emergency) {
      finalVariant = "emergency"
      finalSize = "xl"
    }

    if (accessible) {
      finalSize = "accessible"
    }

    const { ["aria-label"]: ariaLabelFromRest, ...otherRestProps } =
      restProps as React.ButtonHTMLAttributes<HTMLButtonElement>

    // Keyboard handler to satisfy accessibility linter when Button is used as a child (non-button semantic)
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const key = event.key
      const isActivationKey = key === "Enter" || key === " " || key === "Spacebar"
      if (isActivationKey) {
        // Prevent page scroll on Space
        event.preventDefault()
        if (typeof onClick === "function") {
          onClick(event as unknown as React.MouseEvent<HTMLButtonElement>)
        }
      }

      // Call user-provided onKeyDown if present
      if (typeof onKeyDown === "function") {
        onKeyDown(event)
      }
    }

    return (
      <Comp
        {...otherRestProps}
        className={cn(buttonVariants({ variant: finalVariant, size: finalSize }), className)}
        ref={ref}
        aria-label={ariaLabel ?? ariaLabelFromRest}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role={asChild ? role ?? "button" : role}
        tabIndex={asChild ? tabIndex ?? 0 : tabIndex}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
