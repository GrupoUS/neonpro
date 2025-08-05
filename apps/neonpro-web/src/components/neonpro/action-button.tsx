/**
 * NEONPROV1 Design System - ActionButton Component
 * Healthcare-optimized buttons with NEONPROV1 styling
 */

import type { Loader2 } from "lucide-react";
import React from "react";
import type { Button, ButtonProps } from "@/components/ui/button";
import type { cn } from "@/lib/utils";

interface ActionButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost" | "outline";
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      loading = false,
      disabled,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      ...props
    },
    ref,
  ) => {
    const getVariantStyles = () => {
      const variants = {
        primary: cn(
          "neon-button-primary",
          "bg-neon-primary hover:bg-blue-700 focus:ring-neon-accent",
          "text-white font-medium",
          "disabled:bg-slate-300 disabled:text-slate-500",
        ),
        secondary: cn(
          "neon-button-secondary",
          "bg-neon-secondary hover:bg-blue-600 focus:ring-neon-accent",
          "text-white font-medium",
          "disabled:bg-slate-300 disabled:text-slate-500",
        ),
        success: cn(
          "bg-healthcare-completed hover:bg-green-700 focus:ring-green-400",
          "text-white font-medium",
          "disabled:bg-slate-300 disabled:text-slate-500",
        ),
        warning: cn(
          "bg-healthcare-urgent hover:bg-orange-700 focus:ring-orange-400",
          "text-white font-medium",
          "disabled:bg-slate-300 disabled:text-slate-500",
        ),
        danger: cn(
          "bg-healthcare-critical hover:bg-red-700 focus:ring-red-400",
          "text-white font-medium",
          "disabled:bg-slate-300 disabled:text-slate-500",
        ),
        ghost: cn(
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
          "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100",
          "border-0 focus:ring-neon-accent",
          "disabled:text-slate-400 disabled:hover:bg-transparent",
        ),
        outline: cn(
          "bg-transparent hover:bg-neon-primary hover:text-white",
          "text-neon-primary border-neon-primary border-2",
          "focus:ring-neon-accent",
          "disabled:text-slate-400 disabled:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-slate-400",
        ),
      };

      return variants[variant];
    };

    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        className={cn(
          "neon-transition neon-focus",
          "px-4 py-2 rounded-md font-medium",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          getVariantStyles(),
          {
            "w-full": fullWidth,
          },
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}

          {Icon && !loading && iconPosition === "left" && <Icon className="w-4 h-4" />}

          {children && (
            <span
              className={cn("truncate", {
                "sr-only": loading && !children,
              })}
            >
              {children}
            </span>
          )}

          {Icon && !loading && iconPosition === "right" && <Icon className="w-4 h-4" />}
        </div>
      </Button>
    );
  },
);

ActionButton.displayName = "ActionButton";
