import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";

const cardVariants = cva(
  "flex flex-col gap-6 rounded-lg border bg-card text-card-foreground shadow-healthcare-sm backdrop-blur-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border bg-gradient-card",
        patient:
          "border-l-4 border-l-primary bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-healthcare-md backdrop-blur-sm",
        appointment:
          "border-l-4 border-l-secondary bg-gradient-to-br from-secondary/5 via-secondary/3 to-transparent shadow-healthcare-md backdrop-blur-sm",
        professional:
          "border-l-4 border-l-info bg-gradient-to-br from-info/5 via-info/3 to-transparent shadow-healthcare-md backdrop-blur-sm",
        alert:
          "border-l-4 border-l-destructive bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent shadow-healthcare-lg backdrop-blur-sm",
        warning:
          "border-l-4 border-l-warning bg-gradient-to-br from-warning/10 via-warning/5 to-transparent shadow-healthcare-md backdrop-blur-sm",
        success:
          "border-l-4 border-l-success bg-gradient-to-br from-success/5 via-success/3 to-transparent shadow-healthcare-md backdrop-blur-sm",
        info:
          "border-l-4 border-l-info bg-gradient-to-br from-info/5 via-info/3 to-transparent shadow-healthcare-md backdrop-blur-sm",
        elevated:
          "border-border/50 bg-gradient-card shadow-healthcare-lg backdrop-blur-md hover:shadow-healthcare-xl",
        interactive:
          "cursor-pointer border-border/50 bg-gradient-card backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-primary/30 hover:shadow-healthcare-lg",
      },
      padding: {
        default: "py-6",
        compact: "py-4",
        spacious: "py-8",
        none: "py-0",
      },
      priority: {
        normal: "",
        high: "ring-2 ring-warning/20",
        critical: "shadow-lg ring-2 ring-destructive/20",
        low: "opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      priority: "normal",
    },
  },
);

interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {
  interactive?: boolean;
  loading?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      priority,
      interactive,
      loading,
      onClick,
      ...props
    },
    ref,
  ) => {
    const finalVariant = interactive ? "interactive" : variant;

    return (
      <div
        className={cn(
          cardVariants({ variant: finalVariant, padding, priority, className }),
          loading && "pointer-events-none animate-pulse",
          interactive && "focus-within:ring-2 focus-within:ring-primary/20",
        )}
        data-interactive={interactive}
        data-loading={loading}
        data-priority={priority}
        data-slot="card"
        onClick={onClick}
        ref={ref}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      data-slot="card-header"
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("font-semibold leading-none", className)}
      data-slot="card-title"
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="card-description"
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      data-slot="card-action"
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("px-6", className)}
      data-slot="card-content"
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      data-slot="card-footer"
      {...props}
    />
  );
}

// Healthcare-specific card types for better UX
interface PatientCardProps extends CardProps {
  patientId?: string;
  urgency?: "low" | "normal" | "high" | "critical";
  lastVisit?: Date;
}

interface AppointmentCardProps extends CardProps {
  appointmentId?: string;
  status?:
    | "scheduled"
    | "confirmed"
    | "in-progress"
    | "completed"
    | "cancelled";
  datetime?: Date;
}

interface ProfessionalCardProps extends CardProps {
  professionalId?: string;
  specialization?: string;
  availability?: "available" | "busy" | "offline";
}

const PatientCard = forwardRef<HTMLDivElement, PatientCardProps>(
  ({ urgency = "normal", className, ...props }, ref) => {
    const priorityMap = {
      low: "low" as const,
      normal: "normal" as const,
      high: "high" as const,
      critical: "critical" as const,
    };

    return (
      <Card
        className={cn("patient-card", className)}
        data-urgency={urgency}
        priority={priorityMap[urgency]}
        ref={ref}
        variant="patient"
        {...props}
      />
    );
  },
);

PatientCard.displayName = "PatientCard";

const AppointmentCard = forwardRef<HTMLDivElement, AppointmentCardProps>(
  ({ status = "scheduled", className, ...props }, ref) => {
    return (
      <Card
        className={cn("appointment-card", className)}
        data-status={status}
        ref={ref}
        variant="appointment"
        {...props}
      />
    );
  },
);

AppointmentCard.displayName = "AppointmentCard";

const ProfessionalCard = forwardRef<HTMLDivElement, ProfessionalCardProps>(
  ({ availability = "available", className, ...props }, ref) => {
    return (
      <Card
        className={cn("professional-card", className)}
        data-availability={availability}
        ref={ref}
        variant="professional"
        {...props}
      />
    );
  },
);

ProfessionalCard.displayName = "ProfessionalCard";

export {
  AppointmentCard,
  type AppointmentCardProps,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  type CardProps,
  CardTitle,
  cardVariants,
  // Healthcare-specific exports
  PatientCard,
  type PatientCardProps,
  ProfessionalCard,
  type ProfessionalCardProps,
};
