import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs transition-all duration-200 hover:bg-primary/90 hover:shadow-neonpro-glow/30",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-neonpro-card dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        neonpro:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-neonpro-card transition-all duration-300 hover:scale-105 hover:shadow-neonpro-glow",

        // Healthcare-Specific Button Variants
        medical:
          "bg-success text-success-foreground shadow-xs hover:bg-success/90 focus-visible:ring-success/50 border border-success/20",
        emergency:
          "bg-status-critical text-white shadow-md hover:bg-status-critical/90 focus-visible:ring-status-critical/50 font-semibold border-2 border-status-critical/30 pulse-emergency",
        warning:
          "bg-warning text-warning-foreground shadow-xs hover:bg-warning/90 focus-visible:ring-warning/50 border border-warning/20",
        lgpd:
          "bg-lgpd-compliant text-white shadow-xs hover:bg-lgpd-compliant/90 focus-visible:ring-lgpd-compliant/50",
        "patient-safe":
          "bg-healthcare-success text-white shadow-sm hover:bg-healthcare-success/90 focus-visible:ring-healthcare-success/50 border border-healthcare-success/20",
        critical:
          "bg-healthcare-critical text-white shadow-lg hover:bg-healthcare-critical/90 focus-visible:ring-healthcare-critical/50 font-bold border-2 border-white animate-pulse",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base", // Healthcare forms
        icon: "size-9",

        // Healthcare Touch Targets - WCAG 2.1 AA Compliant
        touch: "min-h-[44px] min-w-[44px] px-4 py-2", // Minimum touch target
        "touch-lg": "min-h-[56px] min-w-[56px] px-6 py-3 text-base", // Emergency scenarios
        "touch-xl": "min-h-[64px] min-w-[64px] px-8 py-4 text-lg font-semibold", // Critical situations

        // Mobile Emergency Interface
        "mobile-emergency":
          "min-h-[56px] min-w-full px-6 py-4 text-lg font-bold rounded-lg touch-manipulation",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface HealthcareButtonProps {
  /** Healthcare-specific loading state for patient data operations */
  isLoading?: boolean;
  /** Medical urgency level for appropriate styling */
  urgency?: "low" | "medium" | "high" | "critical";
  /** LGPD compliance indicator */
  lgpdCompliant?: boolean;
  /** Emergency mode compatibility */
  emergencyMode?: boolean;
  /** Screen reader announcement for critical actions */
  srAnnouncement?: string;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading,
  urgency,
  lgpdCompliant,
  emergencyMode,
  srAnnouncement,
  children,
  ...props
}:
  & React.ComponentProps<"button">
  & VariantProps<typeof buttonVariants>
  & HealthcareButtonProps
  & {
    asChild?: boolean;
  })
{
  const Comp = asChild ? Slot : "button";

  // Auto-adjust variant based on urgency for healthcare contexts
  let resolvedVariant = variant;
  if (urgency && !variant) {
    switch (urgency) {
      case "critical":
        resolvedVariant = "critical";
        break;
      case "high":
        resolvedVariant = "emergency";
        break;
      case "medium":
        resolvedVariant = "warning";
        break;
      case "low":
        resolvedVariant = "medical";
        break;
    }
  }

  // Auto-adjust size for emergency mode
  let resolvedSize = size;
  if (emergencyMode && !size) {
    resolvedSize = "touch-lg";
  }

  // LGPD compliance styling
  if (lgpdCompliant && !resolvedVariant) {
    resolvedVariant = "lgpd";
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Screen reader announcement for critical actions
    if (srAnnouncement) {
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "assertive");
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      announcement.textContent = srAnnouncement;
      document.body.append(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }

    // Call original onClick if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Comp
      className={cn(
        buttonVariants({ variant: resolvedVariant, size: resolvedSize }),
        // Loading state styling
        isLoading && "opacity-70 cursor-wait",
        // Emergency mode enhancements
        emergencyMode && "shadow-emergency-glow border-2 border-white font-bold",
        // High contrast mode compatibility
        "high-contrast:border-2 high-contrast:border-current",
        className,
      )}
      data-slot="button"
      data-urgency={urgency}
      data-lgpd-compliant={lgpdCompliant}
      data-emergency-mode={emergencyMode}
      disabled={isLoading || props.disabled}
      onClick={handleClick}
      // Enhanced accessibility for healthcare contexts
      aria-describedby={urgency === "critical" || urgency === "high"
        ? "healthcare-critical-action-warning"
        : undefined}
      {...props}
    >
      {isLoading && (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Processando...</span>
        </>
      )}
      {children}

      {/* Hidden accessibility warning for critical actions */}
      {(urgency === "critical" || urgency === "high") && (
        <div
          id="healthcare-critical-action-warning"
          className="sr-only"
          aria-live="polite"
        >
          Ação médica crítica. Confirme antes de prosseguir.
        </div>
      )}
    </Comp>
  );
}

export { Button, buttonVariants, type HealthcareButtonProps };
