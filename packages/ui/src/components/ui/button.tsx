import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/30 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/30 active:bg-destructive/95",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/90",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:ring-0",

        // NEONPROV1 Healthcare-specific variants
        medical:
          "bg-gradient-primary text-primary-foreground shadow-healthcare-md transition-all duration-300 hover:shadow-healthcare-lg focus-visible:ring-primary/30 active:scale-[0.98]",
        emergency:
          "animate-pulse-healthcare bg-gradient-to-br from-destructive via-destructive/80 to-destructive text-destructive-foreground shadow-healthcare-lg transition-all duration-300 hover:shadow-healthcare-xl focus-visible:ring-destructive/30 active:scale-[0.98]",
        success:
          "bg-gradient-to-br from-success via-success/80 to-success text-success-foreground shadow-healthcare-md transition-all duration-300 hover:shadow-healthcare-lg focus-visible:ring-success/30 active:scale-[0.98]",
        warning:
          "bg-gradient-to-br from-warning via-warning/80 to-warning text-warning-foreground shadow-healthcare-md transition-all duration-300 hover:shadow-healthcare-lg focus-visible:ring-warning/30 active:scale-[0.98]",
        info: "bg-gradient-to-br from-accent via-accent/80 to-accent text-accent-foreground shadow-healthcare-md transition-all duration-300 hover:shadow-healthcare-lg focus-visible:ring-accent/30 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  // Healthcare-specific props
  priority?: "low" | "normal" | "high" | "critical";
  confirmAction?: boolean;
  confirmMessage?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      priority = "normal",
      confirmAction = false,
      confirmMessage = "Are you sure you want to perform this action?",
      disabled,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (confirmAction && !loading) {
        if (window.confirm(confirmMessage)) {
          onClick?.(e);
        }
      } else if (!loading) {
        onClick?.(e);
      }
    };

    // Auto-map priority to variant if variant not specified
    const finalVariant =
      variant ||
      (priority === "critical"
        ? "emergency"
        : priority === "high"
          ? "warning"
          : priority === "low"
            ? "ghost"
            : "default");

    const isDisabled = disabled || loading;

    return (
      <Comp
        aria-disabled={isDisabled}
        aria-label={loading ? loadingText || "Loading..." : undefined}
        className={cn(
          buttonVariants({ variant: finalVariant, size, className }),
          fullWidth && "w-full",
          loading && "cursor-wait",
        )}
        data-loading={loading}
        data-priority={priority}
        data-slot="button"
        disabled={isDisabled}
        onClick={handleClick}
        ref={ref}
        role="button"
        {...props}
      >
        {leftIcon && !loading && (
          <span aria-hidden="true" className="flex items-center justify-center">
            {leftIcon}
          </span>
        )}

        {loading && (
          <svg
            aria-hidden="true"
            className="-ml-1 mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
        )}

        {loading ? loadingText || "Loading..." : children}

        {rightIcon && !loading && (
          <span aria-hidden="true" className="flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, type ButtonProps, buttonVariants };
