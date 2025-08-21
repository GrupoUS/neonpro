import type * as SelectPrimitive from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Search,
  User,
} from 'lucide-react';
import type * as React from 'react';
import { cn } from '../../lib/utils';

const selectTriggerVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: 'border-input',
        medical:
          'border-primary/30 bg-blue-50/30 focus:ring-primary/30 dark:bg-blue-950/10',
        professional:
          'border-purple-300 bg-purple-50/30 focus:ring-purple-500/30 dark:bg-purple-950/10',
        appointment:
          'border-green-300 bg-green-50/30 focus:ring-green-500/30 dark:bg-green-950/10',
        critical:
          'border-red-300 bg-red-50/30 focus:ring-red-500/30 dark:bg-red-950/10',
        success:
          'border-green-300 bg-green-50/30 focus:ring-green-500/30 dark:bg-green-950/10',
      },
      selectSize: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'default',
    },
  }
);

// Healthcare-specific select types
interface HealthcareSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  metadata?: {
    specialty?: string;
    availability?: 'available' | 'busy' | 'offline';
    urgency?: 'low' | 'normal' | 'high' | 'critical';
    category?: string;
  };
}

interface SelectProps
  extends React.ComponentProps<typeof SelectPrimitive.Root>,
    VariantProps<typeof selectTriggerVariants> {
  placeholder?: string;
  searchable?: boolean;
  options?: HealthcareSelectOption[];
  selectType?:
    | 'professional'
    | 'specialty'
    | 'appointment-status'
    | 'priority'
    | 'general';
  showIcons?: boolean;
  showMetadata?: boolean;
  emptyMessage?: string;
}

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

import * as SelectPrimitive from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Search,
  User,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils';

const selectTriggerVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: 'border-input',
        medical:
          'border-primary/30 bg-blue-50/30 focus:ring-primary/30 dark:bg-blue-950/10',
        professional:
          'border-purple-300 bg-purple-50/30 focus:ring-purple-500/30 dark:bg-purple-950/10',
        appointment:
          'border-green-300 bg-green-50/30 focus:ring-green-500/30 dark:bg-green-950/10',
        critical:
          'border-red-300 bg-red-50/30 focus:ring-red-500/30 dark:bg-red-950/10',
        success:
          'border-green-300 bg-green-50/30 focus:ring-green-500/30 dark:bg-green-950/10',
      },
      selectSize: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'default',
    },
  }
);

// Healthcare-specific select types
interface HealthcareSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  metadata?: {
    specialty?: string;
    availability?: 'available' | 'busy' | 'offline';
    urgency?: 'low' | 'normal' | 'high' | 'critical';
    category?: string;
  };
}

interface SelectProps
  extends React.ComponentProps<typeof SelectPrimitive.Root>,
    VariantProps<typeof selectTriggerVariants> {
  placeholder?: string;
  searchable?: boolean;
  options?: HealthcareSelectOption[];
  selectType?:
    | 'professional'
    | 'specialty'
    | 'appointment-status'
    | 'priority'
    | 'general';
  showIcons?: boolean;
  showMetadata?: boolean;
  emptyMessage?: string;
}

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> &
    VariantProps<typeof selectTriggerVariants>
>(({ className, variant, selectSize, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    className={cn(selectTriggerVariants({ variant, selectSize }), className)}
    ref={ref}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    ref={ref}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className
    )}
    ref={ref}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
        position === 'popper' &&
          'data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1',
        className
      )}
      position={position}
      ref={ref}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    className={cn('py-1.5 pr-2 pl-8 font-semibold text-sm', className)}
    ref={ref}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    showIcon?: boolean;
    icon?: React.ReactNode;
    description?: string;
    metadata?: HealthcareSelectOption['metadata'];
  }
>(
  (
    { className, children, showIcon, icon, description, metadata, ...props },
    ref
  ) => {
    const getAvailabilityColor = (availability?: string) => {
      switch (availability) {
        case 'available':
          return 'text-green-500';
        case 'busy':
          return 'text-orange-500';
        case 'offline':
          return 'text-red-500';
        default:
          return 'text-muted-foreground';
      }
    };

    const getUrgencyColor = (urgency?: string) => {
      switch (urgency) {
        case 'critical':
          return 'text-red-500';
        case 'high':
          return 'text-orange-500';
        case 'normal':
          return 'text-blue-500';
        case 'low':
          return 'text-green-500';
        default:
          return 'text-muted-foreground';
      }
    };

    return (
      <SelectPrimitive.Item
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <SelectPrimitive.ItemIndicator>
            <Check className="h-4 w-4" />
          </SelectPrimitive.ItemIndicator>
        </span>

        <div className="flex w-full items-center gap-2">
          {(showIcon || icon) && (
            <div className="flex-shrink-0 text-muted-foreground">
              {icon || <User className="h-4 w-4" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <SelectPrimitive.ItemText>
              <div className="flex items-center justify-between">
                <span className="truncate">{children}</span>

                {metadata?.availability && (
                  <span
                    className={cn(
                      'ml-2 font-medium text-xs',
                      getAvailabilityColor(metadata.availability)
                    )}
                  >
                    {metadata.availability === 'available' && 'Disponível'}
                    {metadata.availability === 'busy' && 'Ocupado'}
                    {metadata.availability === 'offline' && 'Offline'}
                  </span>
                )}

                {metadata?.urgency && (
                  <span
                    className={cn(
                      'ml-2 font-medium text-xs',
                      getUrgencyColor(metadata.urgency)
                    )}
                  >
                    {metadata.urgency === 'critical' && 'Crítico'}
                    {metadata.urgency === 'high' && 'Alto'}
                    {metadata.urgency === 'normal' && 'Normal'}
                    {metadata.urgency === 'low' && 'Baixo'}
                  </span>
                )}
              </div>
            </SelectPrimitive.ItemText>

            {description && (
              <div className="mt-0.5 truncate text-muted-foreground text-xs">
                {description}
              </div>
            )}

            {metadata?.specialty && (
              <div className="mt-0.5 truncate text-blue-600 text-xs dark:text-blue-400">
                {metadata.specialty}
              </div>
            )}
          </div>
        </div>
      </SelectPrimitive.Item>
    );
  }
);
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    ref={ref}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// Healthcare-specific Select components
interface HealthcareProfessionalSelectProps extends SelectProps {
  professionals?: Array<{
    id: string;
    name: string;
    specialty: string;
    availability: 'available' | 'busy' | 'offline';
    crm?: string;
  }>;
}

const ProfessionalSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  HealthcareProfessionalSelectProps
>(
  (
    { professionals = [], placeholder = 'Selecione um profissional', ...props },
    ref
  ) => {
    return (
      <Select {...props}>
        <SelectTrigger variant="professional">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Profissionais de Saúde</SelectLabel>
            {professionals.length === 0 ? (
              <SelectItem disabled value="none">
                Nenhum profissional disponível
              </SelectItem>
            ) : (
              professionals.map((professional) => (
                <SelectItem
                  description={
                    professional.crm ? `CRM: ${professional.crm}` : undefined
                  }
                  icon={<User className="h-4 w-4" />}
                  key={professional.id}
                  metadata={{
                    specialty: professional.specialty,
                    availability: professional.availability,
                  }}
                  showIcon
                  value={professional.id}
                >
                  {professional.name}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }
);
ProfessionalSelect.displayName = 'ProfessionalSelect';
interface AppointmentStatusSelectProps extends SelectProps {
  statuses?: Array<{
    value: string;
    label: string;
    color: 'green' | 'blue' | 'orange' | 'red' | 'gray';
  }>;
}

const AppointmentStatusSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  AppointmentStatusSelectProps
>(({ statuses, placeholder = 'Status do agendamento', ...props }, ref) => {
  const defaultStatuses = [
    { value: 'scheduled', label: 'Agendado', color: 'blue' as const },
    { value: 'confirmed', label: 'Confirmado', color: 'green' as const },
    { value: 'in-progress', label: 'Em andamento', color: 'orange' as const },
    { value: 'completed', label: 'Concluído', color: 'green' as const },
    { value: 'cancelled', label: 'Cancelado', color: 'red' as const },
    { value: 'no-show', label: 'Faltou', color: 'gray' as const },
  ];

  const statusOptions = statuses || defaultStatuses;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'confirmed':
        return <Check className="h-4 w-4" />;
      case 'in-progress':
        return <Heart className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Select {...props}>
      <SelectTrigger variant="appointment">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status do Agendamento</SelectLabel>
          {statusOptions.map((status) => (
            <SelectItem
              icon={getStatusIcon(status.value)}
              key={status.value}
              showIcon
              value={status.value}
            >
              {status.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});
AppointmentStatusSelect.displayName = 'AppointmentStatusSelect';

interface PrioritySelectProps extends SelectProps {
  priorities?: Array<{
    value: string;
    label: string;
    urgency: 'low' | 'normal' | 'high' | 'critical';
  }>;
}

const PrioritySelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  PrioritySelectProps
>(({ priorities, placeholder = 'Selecione a prioridade', ...props }, ref) => {
  const defaultPriorities = [
    { value: 'low', label: 'Baixa Prioridade', urgency: 'low' as const },
    { value: 'normal', label: 'Prioridade Normal', urgency: 'normal' as const },
    { value: 'high', label: 'Alta Prioridade', urgency: 'high' as const },
    {
      value: 'critical',
      label: 'Prioridade Crítica',
      urgency: 'critical' as const,
    },
  ];

  const priorityOptions = priorities || defaultPriorities;

  return (
    <Select {...props}>
      <SelectTrigger variant="critical">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Nível de Prioridade</SelectLabel>
          {priorityOptions.map((priority) => (
            <SelectItem
              icon={<AlertCircle className="h-4 w-4" />}
              key={priority.value}
              metadata={{ urgency: priority.urgency }}
              showIcon
              value={priority.value}
            >
              {priority.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});
PrioritySelect.displayName = 'PrioritySelect';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  // Healthcare-specific exports
  ProfessionalSelect,
  AppointmentStatusSelect,
  PrioritySelect,
  selectTriggerVariants,
  type SelectProps,
  type HealthcareSelectOption,
  type HealthcareProfessionalSelectProps,
  type AppointmentStatusSelectProps,
  type PrioritySelectProps,
};
