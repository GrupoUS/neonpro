import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cn } from '../../lib/utils';

const cardVariants = cva(
  'flex flex-col gap-6 rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border',
        patient:
          'border-l-4 border-l-primary bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20',
        appointment:
          'border-l-4 border-l-secondary bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20',
        professional:
          'border-l-4 border-l-info bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20',
        alert:
          'border-l-4 border-l-destructive bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20',
        warning:
          'border-l-4 border-l-warning bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20',
        success:
          'border-l-4 border-l-success bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20',
        info: 'border-l-4 border-l-info bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20',
        elevated: 'border-border shadow-md hover:shadow-lg',
        interactive:
          'cursor-pointer border-border transition-all duration-200 hover:border-primary/50 hover:shadow-md',
      },
      padding: {
        default: 'py-6',
        compact: 'py-4',
        spacious: 'py-8',
        none: 'py-0',
      },
      priority: {
        normal: '',
        high: 'ring-2 ring-warning/20',
        critical: 'shadow-lg ring-2 ring-destructive/20',
        low: 'opacity-90',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      priority: 'normal',
    },
  }
);

interface CardProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof cardVariants> {
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
    ref
  ) => {
    const finalVariant = interactive ? 'interactive' : variant;

    return (
      <div
        className={cn(
          cardVariants({ variant: finalVariant, padding, priority, className }),
          loading && 'pointer-events-none animate-pulse',
          interactive && 'focus-within:ring-2 focus-within:ring-primary/20'
        )}
        data-interactive={interactive}
        data-loading={loading}
        data-priority={priority}
        data-slot="card"
        onClick={onClick}
        ref={ref}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      data-slot="card-header"
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('font-semibold leading-none', className)}
      data-slot="card-title"
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-muted-foreground text-sm', className)}
      data-slot="card-description"
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      data-slot="card-action"
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-6', className)}
      data-slot="card-content"
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      data-slot="card-footer"
      {...props}
    />
  );
}

// Healthcare-specific card types for better UX
interface PatientCardProps extends CardProps {
  patientId?: string;
  urgency?: 'low' | 'normal' | 'high' | 'critical';
  lastVisit?: Date;
}

interface AppointmentCardProps extends CardProps {
  appointmentId?: string;
  status?:
    | 'scheduled'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled';
  datetime?: Date;
}

interface ProfessionalCardProps extends CardProps {
  professionalId?: string;
  specialization?: string;
  availability?: 'available' | 'busy' | 'offline';
}

const PatientCard = forwardRef<HTMLDivElement, PatientCardProps>(
  ({ urgency = 'normal', className, ...props }, ref) => {
    const priorityMap = {
      low: 'low' as const,
      normal: 'normal' as const,
      high: 'high' as const,
      critical: 'critical' as const,
    };

    return (
      <Card
        className={cn('patient-card', className)}
        data-urgency={urgency}
        priority={priorityMap[urgency]}
        ref={ref}
        variant="patient"
        {...props}
      />
    );
  }
);

PatientCard.displayName = 'PatientCard';

const AppointmentCard = forwardRef<HTMLDivElement, AppointmentCardProps>(
  ({ status = 'scheduled', className, ...props }, ref) => {
    return (
      <Card
        className={cn('appointment-card', className)}
        data-status={status}
        ref={ref}
        variant="appointment"
        {...props}
      />
    );
  }
);

AppointmentCard.displayName = 'AppointmentCard';

const ProfessionalCard = forwardRef<HTMLDivElement, ProfessionalCardProps>(
  ({ availability = 'available', className, ...props }, ref) => {
    return (
      <Card
        className={cn('professional-card', className)}
        data-availability={availability}
        ref={ref}
        variant="professional"
        {...props}
      />
    );
  }
);

ProfessionalCard.displayName = 'ProfessionalCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  // Healthcare-specific exports
  PatientCard,
  AppointmentCard,
  ProfessionalCard,
  type CardProps,
  type PatientCardProps,
  type AppointmentCardProps,
  type ProfessionalCardProps,
};
