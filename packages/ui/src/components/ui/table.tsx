import { cva, type VariantProps } from 'class-variance-authority';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils';

const tableVariants = cva('w-full border-collapse', {
  variants: {
    variant: {
      default: 'overflow-hidden rounded-lg border border-border',
      medical:
        'overflow-hidden rounded-lg border-2 border-primary/20 bg-blue-50/30 dark:bg-blue-950/10',
      patient:
        'overflow-hidden rounded-lg border-2 border-secondary/20 bg-green-50/30 dark:bg-green-950/10',
      simple: 'border-0',
    },
    size: {
      default: '',
      sm: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & VariantProps<typeof tableVariants>
>(({ className, variant, size, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn(tableVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    className={cn('border-border bg-muted/50 [&_tr]:border-b', className)}
    ref={ref}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    className={cn('[&_tr:last-child]:border-0', className)}
    ref={ref}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    ref={ref}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    priority?: 'low' | 'normal' | 'high' | 'critical';
    interactive?: boolean;
    selected?: boolean;
  }
>(
  (
    { className, priority = 'normal', interactive, selected, ...props },
    ref
  ) => (
    <tr
      className={cn(
        'border-b transition-colors data-[state=selected]:bg-muted',
        priority === 'critical' &&
          'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20',
        priority === 'high' && 'bg-orange-50/50 dark:bg-orange-950/20',
        priority === 'low' && 'opacity-75',
        interactive && 'cursor-pointer hover:bg-muted/50',
        selected && 'border-primary/20 bg-primary/10',
        className
      )}
      data-priority={priority}
      data-state={selected ? 'selected' : undefined}
      ref={ref}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
    onSort?: () => void;
  }
>(({ className, sortable, sortDirection, onSort, children, ...props }, ref) => (
  <th
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      sortable &&
        'cursor-pointer select-none transition-colors hover:bg-muted/20',
      className
    )}
    onClick={sortable ? onSort : undefined}
    ref={ref}
    {...props}
  >
    <div className="flex items-center gap-2">
      {children}
      {sortable && (
        <div className="flex flex-col">
          {sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : sortDirection === 'desc' ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <div className="h-4 w-4 opacity-50">
              <ChevronUp className="h-2 w-2" />
              <ChevronDown className="h-2 w-2" />
            </div>
          )}
        </div>
      )}
    </div>
  </th>
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    sensitive?: boolean;
    lgpdProtected?: boolean;
  }
>(({ className, sensitive, lgpdProtected, children, ...props }, ref) => (
  <td
    className={cn(
      'p-4 align-middle [&:has([role=checkbox])]:pr-0',
      sensitive && 'bg-orange-50/30 dark:bg-orange-950/10',
      lgpdProtected && 'bg-green-50/30 dark:bg-green-950/10',
      className
    )}
    data-lgpd-protected={lgpdProtected}
    data-sensitive={sensitive}
    ref={ref}
    {...props}
  >
    {sensitive && (
      <div className="mb-1 flex items-center gap-1 text-orange-600 text-xs dark:text-orange-400">
        <div className="h-2 w-2 rounded-full bg-orange-500" />
        Dados Sensíveis
      </div>
    )}
    {children}
    {lgpdProtected && (
      <div className="mt-1 text-green-600 text-xs opacity-60 dark:text-green-400">
        Protegido pela LGPD
      </div>
    )}
  </td>
));
TableCell.displayName = 'TableCell';
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    className={cn('mt-4 text-muted-foreground text-sm', className)}
    ref={ref}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

// Healthcare-specific table components

interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  email: string;
  lastVisit?: Date;
  nextAppointment?: Date;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'pending';
}

interface PatientTableProps {
  patients: Patient[];
  onPatientSelect?: (patient: Patient) => void;
  onPatientEdit?: (patient: Patient) => void;
  showSensitiveData?: boolean;
  lgpdCompliant?: boolean;
  searchTerm?: string;
  sortBy?: keyof Patient;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: keyof Patient) => void;
}

const PatientTable = React.forwardRef<HTMLTableElement, PatientTableProps>(
  (
    {
      patients,
      onPatientSelect,
      onPatientEdit,
      showSensitiveData = false,
      lgpdCompliant = true,
      searchTerm,
      sortBy,
      sortDirection,
      onSort,
    },
    ref
  ) => {
    const filteredPatients = React.useMemo(() => {
      if (!searchTerm) return patients;

      return patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.cpf.includes(searchTerm) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [patients, searchTerm]);

    const maskCPF = (cpf: string) => {
      if (!showSensitiveData) {
        return `***.***.***-${cpf.slice(-2)}`;
      }
      return cpf;
    };

    const maskEmail = (email: string) => {
      if (!showSensitiveData) {
        const [user, domain] = email.split('@');
        return `${user.slice(0, 2)}***@${domain}`;
      }
      return email;
    };

    return (
      <div className="space-y-4">
        {lgpdCompliant && (
          <div className="flex items-center justify-between rounded-lg bg-green-50/50 p-3 dark:bg-green-950/20">
            <div className="flex items-center gap-2 text-green-700 text-sm dark:text-green-300">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Dados protegidos pela LGPD</span>
            </div>
            {!showSensitiveData && (
              <div className="text-muted-foreground text-xs">
                Dados sensíveis mascarados
              </div>
            )}
          </div>
        )}

        <Table ref={ref} variant="patient">
          <TableHeader>
            <TableRow>
              <TableHead
                onSort={() => onSort?.('name')}
                sortable
                sortDirection={sortBy === 'name' ? sortDirection : null}
              >
                Nome
              </TableHead>
              <TableHead
                onSort={() => onSort?.('cpf')}
                sortable
                sortDirection={sortBy === 'cpf' ? sortDirection : null}
              >
                CPF
              </TableHead>
              <TableHead>Data Nasc.</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead
                onSort={() => onSort?.('lastVisit')}
                sortable
                sortDirection={sortBy === 'lastVisit' ? sortDirection : null}
              >
                Última Visita
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow
                interactive
                key={patient.id}
                onClick={() => onPatientSelect?.(patient)}
                priority={patient.priority}
              >
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell
                  lgpdProtected={lgpdCompliant}
                  sensitive={showSensitiveData}
                >
                  {maskCPF(patient.cpf)}
                </TableCell>
                <TableCell>
                  {patient.birthDate.toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell
                  lgpdProtected={lgpdCompliant}
                  sensitive={showSensitiveData}
                >
                  <div className="space-y-1">
                    <div>{patient.phone}</div>
                    <div className="text-muted-foreground text-xs">
                      {maskEmail(patient.email)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {patient.lastVisit?.toLocaleDateString('pt-BR') || 'Nunca'}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-1 font-medium text-xs',
                      patient.status === 'active' &&
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                      patient.status === 'inactive' &&
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                      patient.status === 'pending' &&
                        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    )}
                  >
                    {patient.status === 'active' && 'Ativo'}
                    {patient.status === 'inactive' && 'Inativo'}
                    {patient.status === 'pending' && 'Pendente'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md p-2 transition-colors hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPatientSelect?.(patient);
                      }}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-md p-2 transition-colors hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPatientEdit?.(patient);
                      }}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPatients.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            {searchTerm
              ? 'Nenhum paciente encontrado para a busca.'
              : 'Nenhum paciente cadastrado.'}
          </div>
        )}
      </div>
    );
  }
);
PatientTable.displayName = 'PatientTable';
interface Appointment {
  id: string;
  patientName: string;
  professionalName: string;
  datetime: Date;
  duration: number;
  status:
    | 'scheduled'
    | 'confirmed'
    | 'in-progress'
    | 'completed'
    | 'cancelled'
    | 'no-show';
  priority: 'low' | 'normal' | 'high' | 'critical';
  type: string;
  notes?: string;
}

interface AppointmentTableProps {
  appointments: Appointment[];
  onAppointmentSelect?: (appointment: Appointment) => void;
  onAppointmentEdit?: (appointment: Appointment) => void;
  onStatusChange?: (
    appointment: Appointment,
    newStatus: Appointment['status']
  ) => void;
  dateFilter?: Date;
  statusFilter?: Appointment['status'];
  sortBy?: keyof Appointment;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: keyof Appointment) => void;
}

const AppointmentTable = React.forwardRef<
  HTMLTableElement,
  AppointmentTableProps
>(
  (
    {
      appointments,
      onAppointmentSelect,
      onAppointmentEdit,
      onStatusChange,
      dateFilter,
      statusFilter,
      sortBy,
      sortDirection,
      onSort,
    },
    ref
  ) => {
    const filteredAppointments = React.useMemo(() => {
      return appointments.filter((appointment) => {
        if (
          dateFilter &&
          appointment.datetime.toDateString() !== dateFilter.toDateString()
        ) {
          return false;
        }
        if (statusFilter && appointment.status !== statusFilter) {
          return false;
        }
        return true;
      });
    }, [appointments, dateFilter, statusFilter]);

    const getStatusColor = (status: Appointment['status']) => {
      switch (status) {
        case 'scheduled':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'confirmed':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'in-progress':
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        case 'completed':
          return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'cancelled':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'no-show':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      }
    };

    const getStatusLabel = (status: Appointment['status']) => {
      switch (status) {
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
          return 'Desconhecido';
      }
    };

    return (
      <Table ref={ref} variant="medical">
        <TableHeader>
          <TableRow>
            <TableHead
              onSort={() => onSort?.('datetime')}
              sortable
              sortDirection={sortBy === 'datetime' ? sortDirection : null}
            >
              Data/Hora
            </TableHead>
            <TableHead
              onSort={() => onSort?.('patientName')}
              sortable
              sortDirection={sortBy === 'patientName' ? sortDirection : null}
            >
              Paciente
            </TableHead>
            <TableHead
              onSort={() => onSort?.('professionalName')}
              sortable
              sortDirection={
                sortBy === 'professionalName' ? sortDirection : null
              }
            >
              Profissional
            </TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead
              onSort={() => onSort?.('status')}
              sortable
              sortDirection={sortBy === 'status' ? sortDirection : null}
            >
              Status
            </TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAppointments.map((appointment) => (
            <TableRow
              interactive
              key={appointment.id}
              onClick={() => onAppointmentSelect?.(appointment)}
              priority={appointment.priority}
            >
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div>{appointment.datetime.toLocaleDateString('pt-BR')}</div>
                  <div className="text-muted-foreground text-sm">
                    {appointment.datetime.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </TableCell>
              <TableCell>{appointment.patientName}</TableCell>
              <TableCell>{appointment.professionalName}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-900/30 dark:text-blue-400">
                  {appointment.type}
                </span>
              </TableCell>
              <TableCell>{appointment.duration} min</TableCell>
              <TableCell>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-1 font-medium text-xs',
                    getStatusColor(appointment.status)
                  )}
                >
                  {getStatusLabel(appointment.status)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md p-2 transition-colors hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentSelect?.(appointment);
                    }}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-md p-2 transition-colors hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentEdit?.(appointment);
                    }}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
);
AppointmentTable.displayName = 'AppointmentTable';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  // Healthcare-specific exports
  PatientTable,
  AppointmentTable,
  tableVariants,
  type Patient,
  type PatientTableProps,
  type Appointment,
  type AppointmentTableProps,
};
