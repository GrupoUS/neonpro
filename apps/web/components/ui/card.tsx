import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../lib/utils";

const cardVariants = cva(
  "flex flex-col gap-6 rounded-xl border text-card-foreground transition-all duration-200 relative",
  {
    variants: {
      variant: {
        default: "bg-card shadow-neonpro-card hover:shadow-neonpro-glow/20 border-border",
        neonpro:
          "bg-gradient-neonpro shadow-neonpro-glow border-primary/20 hover:shadow-neonpro-glow hover:border-primary/30",

        // Healthcare-specific card variants
        patient:
          "bg-card shadow-healthcare-sm border-primary/30 hover:shadow-healthcare-md hover:border-primary/50",
        emergency:
          "bg-status-critical/5 shadow-emergency-glow border-status-critical/40 hover:shadow-emergency-glow/80 border-2",
        medical:
          "bg-success/5 shadow-healthcare-sm border-success/30 hover:shadow-healthcare-md hover:border-success/50",
        lgpd:
          "bg-lgpd-compliant/5 shadow-healthcare-sm border-lgpd-compliant/30 hover:shadow-healthcare-md hover:border-lgpd-compliant/50",
        warning:
          "bg-warning/5 shadow-healthcare-sm border-warning/40 hover:shadow-healthcare-md hover:border-warning/60",
        critical:
          "bg-status-critical/10 shadow-emergency-glow border-status-critical/50 hover:shadow-emergency-glow border-2 pulse-healthcare",

        // Status-based variants
        normal: "bg-card shadow-healthcare-sm border-status-normal/30",
        inactive: "bg-muted/50 shadow-healthcare-xs border-status-inactive/20 opacity-75",
      },
      size: {
        default: "py-6",
        sm: "py-4",
        lg: "py-8",
        xl: "py-10",

        // Healthcare-optimized sizes
        compact: "py-3 gap-3", // For dense medical information
        comfortable: "py-8 gap-8", // For patient forms
        "touch-friendly": "py-6 gap-6 min-h-[44px]", // Touch target compliance
      },
      priority: {
        low: "",
        medium: "border-2",
        high: "border-2 shadow-lg",
        critical: "border-4 shadow-2xl animate-pulse-healthcare",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      priority: "low",
    },
  },
);

interface HealthcareCardProps {
  /** Medical urgency level affects styling and priority */
  urgency?: "low" | "medium" | "high" | "critical";
  /** Healthcare context for appropriate styling */
  medicalContext?: "patient" | "emergency" | "consultation" | "prescription" | "lgpd-compliance";
  /** Patient safety indicator */
  patientSafe?: boolean;
  /** LGPD sensitive data indicator */
  lgpdSensitive?: boolean;
  /** Emergency mode compatibility */
  emergencyMode?: boolean;
  /** Card status for healthcare workflows */
  status?: "normal" | "warning" | "critical" | "inactive";
  /** Screen reader announcement for critical cards */
  srAnnouncement?: string;
}

function Card({
  className,
  variant,
  size,
  priority,
  urgency,
  medicalContext,
  patientSafe,
  lgpdSensitive,
  emergencyMode,
  status,
  srAnnouncement,
  children,
  ...props
}:
  & React.ComponentProps<"div">
  & VariantProps<typeof cardVariants>
  & HealthcareCardProps)
{
  // Auto-resolve variant based on medical context
  let resolvedVariant = variant;
  if (!variant && medicalContext) {
    switch (medicalContext) {
      case "patient":
        resolvedVariant = "patient";
        break;
      case "emergency":
        resolvedVariant = "emergency";
        break;
      case "consultation":
        resolvedVariant = "medical";
        break;
      case "prescription":
        resolvedVariant = "medical";
        break;
      case "lgpd-compliance":
        resolvedVariant = "lgpd";
        break;
    }
  }

  // Auto-resolve based on urgency
  if (!resolvedVariant && urgency) {
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

  // Auto-resolve based on status
  if (!resolvedVariant && status) {
    switch (status) {
      case "critical":
        resolvedVariant = "critical";
        break;
      case "warning":
        resolvedVariant = "warning";
        break;
      case "normal":
        resolvedVariant = "normal";
        break;
      case "inactive":
        resolvedVariant = "inactive";
        break;
    }
  }

  // Auto-resolve priority based on urgency
  let resolvedPriority = priority;
  if (!priority && urgency) {
    switch (urgency) {
      case "critical":
        resolvedPriority = "critical";
        break;
      case "high":
        resolvedPriority = "high";
        break;
      case "medium":
        resolvedPriority = "medium";
        break;
      case "low":
        resolvedPriority = "low";
        break;
    }
  }

  // Auto-resolve size for emergency mode
  let resolvedSize = size;
  if (emergencyMode && !size) {
    resolvedSize = "touch-friendly";
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Screen reader announcement for critical cards
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
    <div
      className={cn(
        cardVariants({
          variant: resolvedVariant,
          size: resolvedSize,
          priority: resolvedPriority,
        }),
        // Emergency mode enhancements
        emergencyMode && "shadow-emergency-glow border-2 border-status-critical/50",
        // Patient safety indicator
        patientSafe && "ring-2 ring-success/30",
        // High contrast mode compatibility
        "high-contrast:border-4 high-contrast:border-current",
        className,
      )}
      data-slot="card"
      data-urgency={urgency}
      data-medical-context={medicalContext}
      data-patient-safe={patientSafe}
      data-lgpd-sensitive={lgpdSensitive}
      data-emergency-mode={emergencyMode}
      data-status={status}
      // Enhanced accessibility for healthcare contexts
      role={urgency === "critical" || status === "critical" ? "alert" : undefined}
      aria-label={medicalContext ? `Cartão médico: ${medicalContext}` : undefined}
      aria-describedby={urgency === "critical" || status === "critical"
        ? "healthcare-critical-card-warning"
        : undefined}
      onClick={handleClick}
      {...props}
    >
      {/* Status indicators */}
      {lgpdSensitive && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-lgpd-compliant rounded-full shadow-sm"
          title="Dados protegidos pela LGPD"
          aria-label="Dados sensíveis LGPD"
        />
      )}

      {patientSafe && (
        <div
          className="absolute -top-1 -left-1 w-3 h-3 bg-success rounded-full shadow-sm"
          title="Aprovado para segurança do paciente"
          aria-label="Seguro para o paciente"
        />
      )}

      {urgency === "critical" && (
        <div
          className="absolute top-2 right-2 w-2 h-2 bg-status-critical rounded-full animate-pulse"
          title="Atenção crítica necessária"
          aria-label="Urgência crítica"
        />
      )}

      {children}

      {/* Hidden accessibility warning for critical cards */}
      {(urgency === "critical" || status === "critical") && (
        <div
          id="healthcare-critical-card-warning"
          className="sr-only"
          aria-live="polite"
        >
          Cartão com informações médicas críticas. Atenção necessária.
        </div>
      )}
    </div>
  );
}

function CardHeader({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "emergency" | "compact";
}) {
  return (
    <div
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        variant === "emergency"
          && "bg-status-critical/10 -mx-6 px-6 py-3 rounded-t-xl border-b border-status-critical/20",
        variant === "compact" && "gap-1 py-2",
        className,
      )}
      data-slot="card-header"
      data-variant={variant}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({
  className,
  urgency,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  urgency?: "low" | "medium" | "high" | "critical";
}) {
  return (
    <div
      className={cn(
        "font-semibold leading-none",
        urgency === "critical" && "text-status-critical font-bold",
        urgency === "high" && "text-warning font-semibold",
        urgency === "medium" && "text-amber-600 font-medium",
        className,
      )}
      data-slot="card-title"
      data-urgency={urgency}
      {...props}
    >
      {children}
    </div>
  );
}

function CardDescription({
  className,
  medicalTerm = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  medicalTerm?: boolean;
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground text-sm",
        medicalTerm && "medical-term font-medium text-foreground/80",
        className,
      )}
      data-slot="card-description"
      data-medical-term={medicalTerm}
      {...props}
    >
      {children}
    </div>
  );
}

function CardAction({
  className,
  urgent = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  urgent?: boolean;
}) {
  return (
    <div
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        urgent && "animate-pulse-healthcare",
        className,
      )}
      data-slot="card-action"
      data-urgent={urgent}
      {...props}
    >
      {children}
    </div>
  );
}

function CardContent({
  className,
  spacing = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  spacing?: "compact" | "default" | "comfortable";
}) {
  return (
    <div
      className={cn(
        "px-6",
        spacing === "compact" && "py-2",
        spacing === "comfortable" && "py-4",
        className,
      )}
      data-slot="card-content"
      data-spacing={spacing}
      {...props}
    >
      {children}
    </div>
  );
}

function CardFooter({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "actions" | "status";
}) {
  return (
    <div
      className={cn(
        "flex items-center px-6 [.border-t]:pt-6",
        variant === "actions" && "justify-end gap-2",
        variant === "status"
          && "justify-between items-center bg-muted/30 -mx-6 px-6 py-3 rounded-b-xl border-t",
        className,
      )}
      data-slot="card-footer"
      data-variant={variant}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type HealthcareCardProps,
};
