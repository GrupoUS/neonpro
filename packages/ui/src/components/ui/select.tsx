// Direct fixes for ForwardRef components

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
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-healthcare-sm ring-offset-background backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground hover:shadow-healthcare-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default:
          'border-input bg-background/80 hover:bg-background focus-visible:bg-background',
        medical:
          'border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent backdrop-blur-sm hover:from-primary/8 hover:via-primary/5 focus:border-primary/50 focus:ring-primary/40',
        professional:
          'border-info/30 bg-gradient-to-br from-info/5 via-info/3 to-transparent backdrop-blur-sm hover:from-info/8 hover:via-info/5 focus:border-info/50 focus:ring-info/40',
        appointment:
          'border-secondary/30 bg-gradient-to-br from-secondary/5 via-secondary/3 to-transparent backdrop-blur-sm hover:from-secondary/8 hover:via-secondary/5 focus:border-secondary/50 focus:ring-secondary/40',
        critical:
          'border-destructive/30 bg-gradient-to-br from-destructive/8 via-destructive/5 to-transparent backdrop-blur-sm hover:from-destructive/12 hover:via-destructive/8 focus:border-destructive/50 focus:ring-destructive/40',
        success:
          'border-success/30 bg-gradient-to-br from-success/5 via-success/3 to-transparent backdrop-blur-sm hover:from-success/8 hover:via-success/5 focus:border-success/50 focus:ring-success/40',
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

// NEONPROV1 Healthcare-specific select types
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
      <ChevronDown className="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
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
      'flex cursor-default items-center justify-center py-1 text-muted-foreground transition-colors hover:text-foreground',
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
      'flex cursor-default items-center justify-center py-1 text-muted-foreground transition-colors hover:text-foreground',
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
  }
>(({ className, children, showIcon = true, ...props }, ref) => (
  <SelectPrimitive.Item
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  >
    {showIcon && (
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    )}
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
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
SelectSeparator.displayName = SelectPrimitive.Separator.displayName; // Healthcare Professional Select Component
interface HealthcareProfessionalSelectProps
  extends React.ComponentProps<typeof SelectPrimitive.Root> {
  professionals?: Array<{
    id: string;
    name: string;
    specialty: string;
    cfm?: string;
    availability: 'available' | 'busy' | 'offline';
    crm?: string;
  }>;
  placeholder?: string;
}

const ProfessionalSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  HealthcareProfessionalSelectProps
>(
  (
    { professionals = [], placeholder = 'Selecione um profissional', ...props },
    ref
  ) => {
    // Extract only valid SelectPrimitive.Root props
    const {
      value,
      defaultValue,
      onValueChange,
      open,
      defaultOpen,
      onOpenChange,
      dir,
      name,
      autoComplete,
      disabled,
      required,
    } = props;

    const selectRootProps = {
      value,
      defaultValue,
      onValueChange,
      open,
      defaultOpen,
      onOpenChange,
      dir,
      name,
      autoComplete,
      disabled,
      required,
    };

    return (
      <SelectPrimitive.Root {...selectRootProps}>
        <SelectTrigger ref={ref} variant="professional">
          <User className="mr-2 h-4 w-4" />
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {professionals.map((professional) => (
            <SelectItem key={professional.id} value={professional.id}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{professional.name}</span>
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      professional.availability === 'available' &&
                        'bg-green-500',
                      professional.availability === 'busy' && 'bg-yellow-500',
                      professional.availability === 'offline' && 'bg-red-500'
                    )}
                  />
                </div>
                <span className="text-muted-foreground text-xs">
                  {professional.specialty}
                  {professional.cfm && ` • CFM: ${professional.cfm}`}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPrimitive.Root>
    );
  }
) as React.ForwardRefExoticComponent<
  HealthcareProfessionalSelectProps &
    React.RefAttributes<React.ElementRef<typeof SelectPrimitive.Root>>
>;
ProfessionalSelect.displayName = 'ProfessionalSelect'; // Appointment Status Select Component
interface AppointmentStatusSelectProps
  extends React.ComponentProps<typeof SelectPrimitive.Root> {
  statuses?: Array<{
    value: string;
    label: string;
    color: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
    icon?: React.ReactNode;
  }>;
  placeholder?: string;
}

const AppointmentStatusSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  AppointmentStatusSelectProps
>(({ statuses, placeholder = 'Status do agendamento', ...props }, ref) => {
  const defaultStatuses = [
    {
      value: 'scheduled',
      label: 'Agendado',
      color: 'blue' as const,
      icon: undefined,
    },
    {
      value: 'confirmed',
      label: 'Confirmado',
      color: 'green' as const,
      icon: undefined,
    },
    {
      value: 'in_progress',
      label: 'Em Andamento',
      color: 'yellow' as const,
      icon: undefined,
    },
    {
      value: 'completed',
      label: 'Concluído',
      color: 'green' as const,
      icon: undefined,
    },
    {
      value: 'cancelled',
      label: 'Cancelado',
      color: 'red' as const,
      icon: undefined,
    },
    {
      value: 'no_show',
      label: 'Faltou',
      color: 'gray' as const,
      icon: undefined,
    },
  ];

  const statusOptions = statuses || defaultStatuses;

  // Extract only valid SelectPrimitive.Root props
  const {
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    dir,
    name,
    autoComplete,
    disabled,
    required,
  } = props;

  const selectRootProps = {
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    dir,
    name,
    autoComplete,
    disabled,
    required,
  };

  return (
    <SelectPrimitive.Root {...selectRootProps}>
      <SelectTrigger ref={ref} variant="appointment">
        <Calendar className="mr-2 h-4 w-4" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  status.color === 'green' && 'bg-green-500',
                  status.color === 'yellow' && 'bg-yellow-500',
                  status.color === 'blue' && 'bg-blue-500',
                  status.color === 'red' && 'bg-red-500',
                  status.color === 'gray' && 'bg-gray-500'
                )}
              />
              {status.icon && status.icon}
              <span>{status.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive.Root>
  );
}) as React.ForwardRefExoticComponent<
  AppointmentStatusSelectProps &
    React.RefAttributes<React.ElementRef<typeof SelectPrimitive.Root>>
>;
AppointmentStatusSelect.displayName = 'AppointmentStatusSelect'; // Priority Select Component
interface PrioritySelectProps
  extends React.ComponentProps<typeof SelectPrimitive.Root> {
  priorities?: Array<{
    value: string;
    label: string;
    urgency: 'low' | 'normal' | 'high' | 'critical';
    icon?: React.ReactNode;
  }>;
  placeholder?: string;
}

const PrioritySelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  PrioritySelectProps
>(({ priorities, placeholder = 'Selecione a prioridade', ...props }, ref) => {
  const defaultPriorities = [
    { value: 'low', label: 'Baixa', urgency: 'low' as const, icon: undefined },
    {
      value: 'normal',
      label: 'Normal',
      urgency: 'normal' as const,
      icon: undefined,
    },
    { value: 'high', label: 'Alta', urgency: 'high' as const, icon: undefined },
    {
      value: 'critical',
      label: 'Crítica',
      urgency: 'critical' as const,
      icon: undefined,
    },
  ];

  const priorityOptions = priorities || defaultPriorities;

  // Extract only valid SelectPrimitive.Root props
  const {
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    dir,
    name,
    autoComplete,
    disabled,
    required,
  } = props;

  const selectRootProps = {
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    dir,
    name,
    autoComplete,
    disabled,
    required,
  };

  return (
    <SelectPrimitive.Root {...selectRootProps}>
      <SelectTrigger ref={ref} variant="appointment">
        <AlertCircle className="mr-2 h-4 w-4" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {priorityOptions.map((priority) => (
          <SelectItem key={priority.value} value={priority.value}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  priority.urgency === 'low' && 'bg-green-500',
                  priority.urgency === 'normal' && 'bg-blue-500',
                  priority.urgency === 'high' && 'bg-yellow-500',
                  priority.urgency === 'critical' && 'bg-red-500'
                )}
              />
              {priority.icon && priority.icon}
              <span>{priority.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </SelectPrimitive.Root>
  );
}) as React.ForwardRefExoticComponent<
  PrioritySelectProps &
    React.RefAttributes<React.ElementRef<typeof SelectPrimitive.Root>>
>;
PrioritySelect.displayName = 'PrioritySelect'; // Exports
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
  ProfessionalSelect,
  AppointmentStatusSelect,
  PrioritySelect,
  type SelectProps,
  type HealthcareSelectOption,
  type HealthcareProfessionalSelectProps,
  type AppointmentStatusSelectProps,
  type PrioritySelectProps,
};
