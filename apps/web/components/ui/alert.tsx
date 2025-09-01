import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm transition-all duration-200 has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border shadow-healthcare-xs",
        destructive:
          "bg-card text-destructive border-destructive/40 shadow-healthcare-sm *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
        neonpro:
          "bg-gradient-neonpro/10 text-primary-foreground border-primary/40 shadow-neonpro-card [&>svg]:text-primary",

        // Healthcare-specific alert variants
        medical:
          "bg-success/10 text-success-foreground border-success/40 shadow-healthcare-sm [&>svg]:text-success",
        emergency:
          "bg-status-critical/15 text-white border-status-critical/60 shadow-emergency-glow border-2 [&>svg]:text-status-critical animate-pulse-healthcare",
        patient:
          "bg-primary/10 text-primary-foreground border-primary/40 shadow-healthcare-sm [&>svg]:text-primary",
        lgpd:
          "bg-lgpd-compliant/10 text-white border-lgpd-compliant/50 shadow-healthcare-sm [&>svg]:text-lgpd-compliant",
        warning:
          "bg-warning/10 text-warning-foreground border-warning/50 shadow-healthcare-sm [&>svg]:text-warning",
        info:
          "bg-info/10 text-info-foreground border-info/40 shadow-healthcare-sm [&>svg]:text-info",

        // Healthcare vital signs alerts
        "vital-normal":
          "bg-status-normal/10 text-status-normal border-status-normal/40 shadow-healthcare-sm [&>svg]:text-status-normal",
        "vital-warning":
          "bg-status-warning/15 text-status-warning border-status-warning/50 shadow-healthcare-sm [&>svg]:text-status-warning",
        "vital-critical":
          "bg-status-critical/20 text-white border-status-critical/60 shadow-emergency-glow border-2 [&>svg]:text-status-critical pulse-emergency",
        "vital-urgent":
          "bg-status-urgent/15 text-white border-status-urgent/50 shadow-healthcare-md [&>svg]:text-status-urgent",

        // Compliance and regulatory alerts
        compliance:
          "bg-lgpd-compliant/10 text-white border-lgpd-compliant/50 shadow-healthcare-sm [&>svg]:text-lgpd-compliant",
        violation:
          "bg-lgpd-violation/15 text-white border-lgpd-violation/60 shadow-healthcare-md border-2 [&>svg]:text-lgpd-violation",

        // System status alerts
        success:
          "bg-success/10 text-success-foreground border-success/40 shadow-healthcare-sm [&>svg]:text-success",
        inactive:
          "bg-status-inactive/10 text-status-inactive border-status-inactive/30 shadow-healthcare-xs [&>svg]:text-status-inactive opacity-80",
      },
      size: {
        default: "px-4 py-3",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-4 text-base",
        xl: "px-8 py-6 text-lg",

        // Healthcare-optimized sizes
        compact: "px-3 py-2", // Dense medical information
        comfortable: "px-6 py-5", // Patient-facing alerts
        "touch-friendly": "px-4 py-4 min-h-[44px]", // Touch compliance
        "emergency-mode": "px-6 py-5 text-base font-semibold min-h-[56px]", // Emergency scenarios
      },
      priority: {
        low: "",
        medium: "border-2 font-medium",
        high: "border-2 font-semibold shadow-lg",
        critical: "border-4 font-bold shadow-2xl animate-pulse-healthcare",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      priority: "low",
    },
  },
);

interface HealthcareAlertProps {
  /** Medical urgency level affects styling and behavior */
  urgency?: "low" | "medium" | "high" | "critical";
  /** Healthcare context for appropriate styling */
  medicalContext?: "patient" | "emergency" | "vital-signs" | "medication" | "compliance" | "system";
  /** Vital signs status */
  vitalStatus?: "normal" | "warning" | "critical" | "urgent";
  /** Patient safety indicator */
  patientSafe?: boolean;
  /** LGPD compliance context */
  lgpdContext?: "compliant" | "warning" | "violation";
  /** Emergency mode compatibility */
  emergencyMode?: boolean;
  /** Auto-dismiss timeout (in seconds, 0 for no auto-dismiss) */
  autoDismiss?: number;
  /** Screen reader announcement level */
  announcementLevel?: "polite" | "assertive";
  /** Clinical decision support alert */
  clinicalAlert?: boolean;
  /** Medication alert type */
  medicationAlert?: "allergy" | "interaction" | "dosage" | "contraindication";
}

function Alert({
  className,
  variant,
  size,
  priority,
  urgency,
  medicalContext,
  vitalStatus,
  patientSafe,
  lgpdContext,
  emergencyMode,
  autoDismiss = 0,
  announcementLevel = "polite",
  clinicalAlert,
  medicationAlert,
  children,
  ...props
}:
  & React.ComponentProps<"div">
  & VariantProps<typeof alertVariants>
  & HealthcareAlertProps)
{
  // Auto-resolve variant based on medical context and vital status
  let resolvedVariant = variant;

  if (!variant) {
    if (vitalStatus) {
      switch (vitalStatus) {
        case "critical":
          resolvedVariant = "vital-critical";
          break;
        case "urgent":
          resolvedVariant = "vital-urgent";
          break;
        case "warning":
          resolvedVariant = "vital-warning";
          break;
        case "normal":
          resolvedVariant = "vital-normal";
          break;
      }
    } else if (lgpdContext) {
      switch (lgpdContext) {
        case "violation":
          resolvedVariant = "violation";
          break;
        case "warning":
          resolvedVariant = "warning";
          break;
        case "compliant":
          resolvedVariant = "compliance";
          break;
      }
    } else if (medicalContext) {
      switch (medicalContext) {
        case "emergency":
          resolvedVariant = "emergency";
          break;
        case "vital-signs":
          resolvedVariant = "vital-warning";
          break;
        case "patient":
          resolvedVariant = "patient";
          break;
        case "medication":
          resolvedVariant = medicationAlert === "allergy" || medicationAlert === "contraindication"
            ? "emergency"
            : "warning";
          break;
        case "compliance":
          resolvedVariant = "compliance";
          break;
        case "system":
          resolvedVariant = "info";
          break;
      }
    } else if (urgency) {
      switch (urgency) {
        case "critical":
          resolvedVariant = "emergency";
          break;
        case "high":
          resolvedVariant = "warning";
          break;
        case "medium":
          resolvedVariant = "medical";
          break;
        case "low":
          resolvedVariant = "info";
          break;
      }
    }
  }

  // Auto-resolve priority based on urgency or vital status
  let resolvedPriority = priority;
  if (!priority) {
    if (vitalStatus === "critical" || urgency === "critical" || medicationAlert === "allergy") {
      resolvedPriority = "critical";
    } else if (
      vitalStatus === "urgent" || urgency === "high" || medicationAlert === "contraindication"
    ) {
      resolvedPriority = "high";
    } else if (
      vitalStatus === "warning" || urgency === "medium" || medicationAlert === "interaction"
    ) {
      resolvedPriority = "medium";
    } else {
      resolvedPriority = "low";
    }
  }

  // Auto-resolve size for emergency mode
  let resolvedSize = size;
  if (emergencyMode && !size) {
    resolvedSize = "emergency-mode";
  }

  // Auto-dismiss functionality
  React.useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        // Emit custom event for dismissal
        const dismissEvent = new CustomEvent("alert-auto-dismiss", {
          detail: { urgency, medicalContext, vitalStatus },
        });
        document.dispatchEvent(dismissEvent);
      }, autoDismiss * 1000);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, urgency, medicalContext, vitalStatus]);

  return (
    <div
      className={cn(
        alertVariants({
          variant: resolvedVariant,
          size: resolvedSize,
          priority: resolvedPriority,
        }),
        // Emergency mode enhancements
        emergencyMode && "shadow-emergency-glow border-4 border-status-critical/70",
        // Clinical decision support styling
        clinicalAlert && "ring-2 ring-primary/30 shadow-healthcare-lg",
        // Patient safety indicator
        patientSafe && "ring-1 ring-success/40",
        // High contrast mode compatibility
        "high-contrast:border-4 high-contrast:border-current high-contrast:font-bold",
        className,
      )}
      data-slot="alert"
      data-urgency={urgency}
      data-medical-context={medicalContext}
      data-vital-status={vitalStatus}
      data-patient-safe={patientSafe}
      data-lgpd-context={lgpdContext}
      data-emergency-mode={emergencyMode}
      data-clinical-alert={clinicalAlert}
      data-medication-alert={medicationAlert}
      role="alert"
      aria-live={announcementLevel}
      aria-atomic="true"
      // Enhanced accessibility for healthcare contexts
      aria-describedby={clinicalAlert || urgency === "critical"
        ? "healthcare-critical-alert-warning"
        : undefined}
      {...props}
    >
      {/* Status indicators */}
      {patientSafe && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full shadow-sm"
          title="Aprovado para segurança do paciente"
          aria-label="Seguro para o paciente"
        />
      )}

      {clinicalAlert && (
        <div
          className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full shadow-sm animate-pulse"
          title="Alerta de suporte à decisão clínica"
          aria-label="Suporte à decisão clínica"
        />
      )}

      {medicationAlert === "allergy" && (
        <div
          className="absolute top-2 right-2 w-4 h-4 bg-status-critical text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse"
          title="Alerta de alergia medicamentosa"
          aria-label="Alerta de alergia"
        >
          !
        </div>
      )}

      {children}

      {/* Auto-dismiss progress indicator */}
      {autoDismiss > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-current/30 rounded-b-lg animate-pulse"
          style={{
            animation: `shrink ${autoDismiss}s linear forwards`,
            width: "100%",
          }}
          aria-label={`Auto-dismiss em ${autoDismiss} segundos`}
        />
      )}

      {/* Hidden accessibility warnings */}
      {(clinicalAlert || urgency === "critical" || vitalStatus === "critical") && (
        <div
          id="healthcare-critical-alert-warning"
          className="sr-only"
          aria-live="assertive"
        >
          Alerta médico crítico. Atenção imediata necessária.
        </div>
      )}
    </div>
  );
}

function AlertTitle({
  className,
  urgency,
  clinicalAlert = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  urgency?: "low" | "medium" | "high" | "critical";
  clinicalAlert?: boolean;
}) {
  return (
    <div
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        urgency === "critical" && "font-bold text-status-critical",
        urgency === "high" && "font-semibold text-warning",
        clinicalAlert && "font-semibold text-primary",
        className,
      )}
      data-slot="alert-title"
      data-urgency={urgency}
      data-clinical-alert={clinicalAlert}
      {...props}
    >
      {children}
    </div>
  );
}

function AlertDescription({
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
        "col-start-2 grid justify-items-start gap-1 text-muted-foreground text-sm [&_p]:leading-relaxed",
        medicalTerm && "medical-term font-medium text-foreground/90",
        className,
      )}
      data-slot="alert-description"
      data-medical-term={medicalTerm}
      {...props}
    >
      {children}
    </div>
  );
}

// Healthcare-specific alert icons
function AlertIcon({
  type,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  type?: "medical" | "emergency" | "vital" | "medication" | "compliance" | "patient";
}) {
  const getIconByType = () => {
    switch (type) {
      case "medical":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16.5a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5"
            />
          </svg>
        );
      case "emergency":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        );
      case "vital":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        );
      case "medication":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16.5a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5"
            />
          </svg>
        );
      case "compliance":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
            />
          </svg>
        );
      case "patient":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        );
      default:
        return children;
    }
  };

  if (children) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn("size-4 shrink-0", className)}
      data-slot="alert-icon"
      data-type={type}
      {...props}
    >
      {getIconByType()}
    </div>
  );
}

export { Alert, AlertDescription, AlertIcon, AlertTitle, type HealthcareAlertProps };
