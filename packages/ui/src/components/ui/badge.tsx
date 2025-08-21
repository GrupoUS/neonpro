import { cva, type VariantProps } from 'class-variance-authority';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  Shield,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import type * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'border-border text-foreground',

        // Healthcare status variants
        patient:
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        appointment:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        professional:
          'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',

        // Medical priority variants
        critical:
          'animate-pulse border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        urgent:
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        normal:
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        low: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',

        // Appointment status variants
        scheduled:
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        confirmed:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'in-progress':
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        completed:
          'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        cancelled:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        'no-show':
          'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',

        // Professional availability variants
        available:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        busy: 'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        offline:
          'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',

        // LGPD compliance variants
        'lgpd-compliant':
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'lgpd-warning':
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        'lgpd-violation':
          'border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'rounded-sm px-2 py-0.5 text-xs',
        lg: 'rounded-lg px-3 py-1 text-sm',
      },
      withIcon: {
        true: 'gap-1',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      withIcon: false,
    },
  }
);

interface BadgeProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  pulse?: boolean;
  interactive?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      withIcon,
      icon,
      pulse,
      interactive,
      onClick,
      ...props
    },
    ref
  ) => {
    const hasIcon = Boolean(icon);

    return (
      <div
        className={cn(
          badgeVariants({ variant, size, withIcon: hasIcon }),
          pulse && 'animate-pulse',
          interactive && 'cursor-pointer transition-shadow hover:shadow-sm',
          className
        )}
        data-interactive={interactive}
        data-variant={variant}
        onClick={onClick}
        ref={ref}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {icon && (
          <span aria-hidden="true" className="flex items-center justify-center">
            {icon}
          </span>
        )}
        {props.children}
      </div>
    );
  }
);
Badge.displayName = 'Badge'; // Healthcare-specific badge components

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status:
    | 'critical'
    | 'urgent'
    | 'normal'
    | 'low'
    | 'scheduled'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled'
    | 'no-show';
  showIcon?: boolean;
}

const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, showIcon = true, ...props }, ref) => {
    const getStatusIcon = () => {
      if (!showIcon) return;

      switch (status) {
        case 'critical':
          return <AlertCircle className="h-3 w-3" />;
        case 'urgent':
          return <Zap className="h-3 w-3" />;
        case 'normal':
          return <Activity className="h-3 w-3" />;
        case 'low':
          return <Clock className="h-3 w-3" />;
        case 'scheduled':
          return <Calendar className="h-3 w-3" />;
        case 'confirmed':
          return <CheckCircle className="h-3 w-3" />;
        case 'in-progress':
          return <Activity className="h-3 w-3" />;
        case 'completed':
          return <CheckCircle className="h-3 w-3" />;
        case 'cancelled':
          return <XCircle className="h-3 w-3" />;
        case 'no-show':
          return <XCircle className="h-3 w-3" />;
        default:
          return <Clock className="h-3 w-3" />;
      }
    };

    const getStatusLabel = () => {
      switch (status) {
        case 'critical':
          return 'Crítico';
        case 'urgent':
          return 'Urgente';
        case 'normal':
          return 'Normal';
        case 'low':
          return 'Baixa';
        case 'scheduled':
          return 'Agendado';
        case 'confirmed':
          return 'Confirmado';
        case 'in-progress':
          return 'Em Andamento';
        case 'completed':
          return 'Concluído';
        case 'cancelled':
          return 'Cancelado';
        case 'no-show':
          return 'Faltou';
        default:
          return 'Status';
      }
    };

    return (
      <Badge
        icon={getStatusIcon()}
        pulse={status === 'critical'}
        ref={ref}
        variant={status}
        {...props}
      >
        {props.children || getStatusLabel()}
      </Badge>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

interface ProfessionalBadgeProps extends Omit<BadgeProps, 'variant'> {
  availability: 'available' | 'busy' | 'offline';
  specialty?: string;
  showIcon?: boolean;
}

const ProfessionalBadge = forwardRef<HTMLDivElement, ProfessionalBadgeProps>(
  ({ availability, specialty, showIcon = true, ...props }, ref) => {
    const getAvailabilityIcon = () => {
      if (!showIcon) return;

      switch (availability) {
        case 'available':
          return <CheckCircle className="h-3 w-3" />;
        case 'busy':
          return <Clock className="h-3 w-3" />;
        case 'offline':
          return <XCircle className="h-3 w-3" />;
        default:
          return <User className="h-3 w-3" />;
      }
    };

    const getAvailabilityLabel = () => {
      switch (availability) {
        case 'available':
          return 'Disponível';
        case 'busy':
          return 'Ocupado';
        case 'offline':
          return 'Offline';
        default:
          return 'Status';
      }
    };

    return (
      <Badge
        icon={getAvailabilityIcon()}
        ref={ref}
        title={
          specialty
            ? `${getAvailabilityLabel()} - ${specialty}`
            : getAvailabilityLabel()
        }
        variant={availability}
        {...props}
      >
        {props.children || getAvailabilityLabel()}
      </Badge>
    );
  }
);
ProfessionalBadge.displayName = 'ProfessionalBadge';
interface LGPDBadgeProps extends Omit<BadgeProps, 'variant'> {
  compliance: 'compliant' | 'warning' | 'violation';
  score?: number;
  showIcon?: boolean;
}

const LGPDBadge = forwardRef<HTMLDivElement, LGPDBadgeProps>(
  ({ compliance, score, showIcon = true, ...props }, ref) => {
    const getComplianceIcon = () => {
      if (!showIcon) return;

      switch (compliance) {
        case 'compliant':
          return <Shield className="h-3 w-3" />;
        case 'warning':
          return <AlertCircle className="h-3 w-3" />;
        case 'violation':
          return <XCircle className="h-3 w-3" />;
        default:
          return <Shield className="h-3 w-3" />;
      }
    };

    const getComplianceLabel = () => {
      switch (compliance) {
        case 'compliant':
          return score ? `LGPD Conforme (${score}%)` : 'LGPD Conforme';
        case 'warning':
          return score ? `LGPD Atenção (${score}%)` : 'LGPD Atenção';
        case 'violation':
          return score ? `LGPD Violação (${score}%)` : 'LGPD Violação';
        default:
          return 'LGPD';
      }
    };

    const getVariant = () => {
      switch (compliance) {
        case 'compliant':
          return 'lgpd-compliant';
        case 'warning':
          return 'lgpd-warning';
        case 'violation':
          return 'lgpd-violation';
        default:
          return 'lgpd-compliant';
      }
    };

    return (
      <Badge
        icon={getComplianceIcon()}
        pulse={compliance === 'violation'}
        ref={ref}
        variant={getVariant() as any}
        {...props}
      >
        {props.children || getComplianceLabel()}
      </Badge>
    );
  }
);
LGPDBadge.displayName = 'LGPDBadge';

interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: 'critical' | 'urgent' | 'normal' | 'low';
  showIcon?: boolean;
}

const PriorityBadge = forwardRef<HTMLDivElement, PriorityBadgeProps>(
  ({ priority, showIcon = true, ...props }, ref) => {
    const getPriorityIcon = () => {
      if (!showIcon) return;

      switch (priority) {
        case 'critical':
          return <AlertCircle className="h-3 w-3" />;
        case 'urgent':
          return <Zap className="h-3 w-3" />;
        case 'normal':
          return <Activity className="h-3 w-3" />;
        case 'low':
          return <Clock className="h-3 w-3" />;
        default:
          return <Activity className="h-3 w-3" />;
      }
    };

    const getPriorityLabel = () => {
      switch (priority) {
        case 'critical':
          return 'Crítico';
        case 'urgent':
          return 'Urgente';
        case 'normal':
          return 'Normal';
        case 'low':
          return 'Baixa';
        default:
          return 'Normal';
      }
    };

    return (
      <Badge
        icon={getPriorityIcon()}
        pulse={priority === 'critical'}
        ref={ref}
        variant={priority}
        {...props}
      >
        {props.children || getPriorityLabel()}
      </Badge>
    );
  }
);
PriorityBadge.displayName = 'PriorityBadge';

export {
  Badge,
  StatusBadge,
  ProfessionalBadge,
  LGPDBadge,
  PriorityBadge,
  badgeVariants,
  type BadgeProps,
  type StatusBadgeProps,
  type ProfessionalBadgeProps,
  type LGPDBadgeProps,
  type PriorityBadgeProps,
};
