import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  MoreHorizontal,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '../utils/cn';
import { formatDate, formatPhone } from '../utils/formatters';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { PatientCard, type PatientData } from './PatientCard';
import type { FilterOption } from './SearchBox';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export interface PatientTableColumn {
  key: keyof PatientData | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (patient: PatientData) => React.ReactNode;
}

export interface PatientTableProps {
  patients: PatientData[];
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  selectedPatients?: string[];
  onSelectionChange?: (patientIds: string[]) => void;
  onPatientClick?: (patient: PatientData) => void;
  onPatientAction?: (action: string, patient: PatientData) => void;
  pagination?: PaginationProps;
  filters?: FilterOption[];
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  columns?: PatientTableColumn[];
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
  className?: string;
}

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to format relative time
const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hoje';
  }
  if (diffDays === 1) {
    return 'Ontem';
  }
  if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} semanas atrás`;
  }
  return formatDate(dateString);
};
const defaultColumns: PatientTableColumn[] = [
  { key: 'name', label: 'Paciente', sortable: true },
  { key: 'phone', label: 'Telefone', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'lastVisit', label: 'Última Consulta', sortable: true },
  { key: 'nextAppointment', label: 'Próxima Consulta', sortable: true },
  { key: 'actions', label: 'Ações', sortable: false, width: '120px' },
];

const PatientTable = React.forwardRef<HTMLDivElement, PatientTableProps>(
  (
    {
      patients,
      loading = false,
      searchValue = '',
      onSearchChange,
      sortBy,
      sortDirection = 'asc',
      onSort,
      selectedPatients = [],
      onSelectionChange,
      onPatientClick,
      onPatientAction,
      pagination,
      filters = [],
      activeFilters = [],
      onFilterChange,
      columns = defaultColumns,
      viewMode = 'table',
      onViewModeChange,
      className,
      ...props
    },
    _ref
  ) => {
    const handleSort = (column: string) => {
      if (!onSort) {
        return;
      }

      const newDirection =
        sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(column, newDirection);
    };

    const handleSelectAll = () => {
      if (!onSelectionChange) {
        return;
      }

      if (selectedPatients.length === patients.length) {
        onSelectionChange([]);
      } else {
        onSelectionChange(patients.map((p) => p.id));
      }
    };

    const handleSelectPatient = (patientId: string) => {
      if (!onSelectionChange) {
        return;
      }

      if (selectedPatients.includes(patientId)) {
        onSelectionChange(selectedPatients.filter((id) => id !== patientId));
      } else {
        onSelectionChange([...selectedPatients, patientId]);
      }
    };
    const getStatusVariant = (status: string) => {
      switch (status) {
        case 'active':
          return 'confirmed';
        case 'inactive':
          return 'pending';
        case 'blocked':
          return 'cancelled';
        default:
          return 'default';
      }
    };

    const renderTableCell = (
      column: PatientTableColumn,
      patient: PatientData
    ) => {
      if (column.render) {
        return column.render(patient);
      }

      switch (column.key) {
        case 'name':
          return (
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarImage alt={patient.name} src={patient.avatar} />
                <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{patient.name}</div>
                {patient.email && (
                  <div className="text-muted-foreground text-sm">
                    {patient.email}
                  </div>
                )}
              </div>
            </div>
          );

        case 'phone':
          return patient.phone ? formatPhone(patient.phone) : '-';

        case 'status': {
          const statusVariant = getStatusVariant(patient.status);
          const statusLabel =
            patient.status === 'active'
              ? 'Ativo'
              : patient.status === 'inactive'
                ? 'Inativo'
                : 'Bloqueado';
          return <Badge variant={statusVariant}>{statusLabel}</Badge>;
        }

        case 'lastVisit':
          return formatRelativeTime(patient.lastVisit);

        case 'nextAppointment':
          return patient.nextAppointment ? (
            <span className="font-medium text-primary">
              {formatDate(patient.nextAppointment)}
            </span>
          ) : (
            '-'
          );

        case 'actions':
          return (
            <div className="flex items-center gap-1">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onPatientAction?.('view', patient);
                }}
                size="sm"
                variant="ghost"
              >
                Ver
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onPatientAction?.('menu', patient);
                }}
                size="sm"
                variant="ghost"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          );

        default:
          return patient[column.key as keyof PatientData] || '-';
      }
    }; // Sort data
    const sortedData = React.useMemo(() => {
      if (!sort) {
        return filteredData;
      }

      return [...filteredData].sort((a, b) => {
        const aValue = a[sort.key as keyof PatientData];
        const bValue = b[sort.key as keyof PatientData];

        if (!(aValue || bValue)) {
          return 0;
        }
        if (!aValue) {
          return 1;
        }
        if (!bValue) {
          return -1;
        }

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue, 'pt-BR');
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue), 'pt-BR');
        }

        return sort.direction === 'desc' ? -comparison : comparison;
      });
    }, []);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pagination.pageSize);
    const paginatedData = sortedData.slice(
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize
    );

    const handleSort = (key: string) => {
      setSort((prev) => ({
        key,
        direction:
          prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
    };

    const handleSelectAll = () => {
      if (selectedPatients.length === paginatedData.length) {
        setSelectedPatients([]);
      } else {
        setSelectedPatients(paginatedData.map((p) => p.id));
      }
    };

    const handleSelectPatient = (patientId: string) => {
      setSelectedPatients((prev) =>
        prev.includes(patientId)
          ? prev.filter((id) => id !== patientId)
          : [...prev, patientId]
      );
    };

    const handleRowClick = (patient: PatientData) => {
      if (onPatientSelect) {
        onPatientSelect(patient);
      }
    }; // Table view
    const renderTableView = () => (
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                {enableSelection && (
                  <th className="w-12 px-4 py-3 text-left">
                    <Checkbox
                      aria-label="Selecionar todos"
                      checked={
                        selectedPatients.length === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    className={cn(
                      'px-4 py-3 text-left font-medium text-muted-foreground text-sm',
                      column.sortable && 'cursor-pointer hover:text-foreground',
                      column.width && `w-${column.width}`
                    )}
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable &&
                        sort?.key === column.key &&
                        (sort.direction === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((patient) => (
                <tr
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    onPatientSelect && 'cursor-pointer',
                    selectedPatients.includes(patient.id) && 'bg-muted/30'
                  )}
                  key={patient.id}
                  onClick={() => handleRowClick(patient)}
                >
                  {enableSelection && (
                    <td className="px-4 py-3">
                      <Checkbox
                        aria-label={`Selecionar ${patient.name}`}
                        checked={selectedPatients.includes(patient.id)}
                        onCheckedChange={() => handleSelectPatient(patient.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td className="px-4 py-3 text-sm" key={column.key}>
                      {renderTableCell(column, patient)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ); // Card view
    const renderCardView = () => (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedData.map((patient) => (
          <PatientCard
            className={cn(
              'transition-all',
              onPatientSelect && 'cursor-pointer hover:shadow-md'
            )}
            key={patient.id}
            onClick={() => handleRowClick(patient)}
            onSelect={
              enableSelection
                ? () => handleSelectPatient(patient.id)
                : undefined
            }
            patient={patient}
            selected={selectedPatients.includes(patient.id)}
          />
        ))}
      </div>
    );

    // Pagination controls
    const renderPagination = () => (
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Mostrando {paginatedData.length} de {sortedData.length} pacientes
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={pagination.page === 1}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm">
            Página {pagination.page} de {totalPages || 1}
          </span>
          <Button
            disabled={pagination.page >= totalPages}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            size="sm"
            variant="outline"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );

    return (
      <div className={cn('space-y-4', className)}>
        {/* Header with actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-lg">Pacientes</h3>
            {selectedPatients.length > 0 && (
              <Badge variant="secondary">
                {selectedPatients.length} selecionado
                {selectedPatients.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                setViewMode(viewMode === 'table' ? 'card' : 'table')
              }
              size="sm"
              variant="outline"
            >
              {viewMode === 'table' ? (
                <>
                  <Grid3X3 className="h-4 w-4" />
                  Cards
                </>
              ) : (
                <>
                  <List className="h-4 w-4" />
                  Tabela
                </>
              )}
            </Button>
            {onRefresh && (
              <Button
                disabled={loading}
                onClick={onRefresh}
                size="sm"
                variant="outline"
              >
                <RefreshCw
                  className={cn('h-4 w-4', loading && 'animate-spin')}
                />
                Atualizar
              </Button>
            )}
          </div>
        </div>{' '}
        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground text-sm">
                Carregando pacientes...
              </span>
            </div>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h4 className="mb-2 font-medium text-lg">
              Nenhum paciente encontrado
            </h4>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece adicionando um novo paciente.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? renderTableView() : renderCardView()}
            {totalPages > 1 && renderPagination()}
          </>
        )}
      </div>
    );
  }
);

PatientTable.displayName = 'PatientTable';

export { PatientTable };
export type {
  PatientTableProps,
  PatientTableColumn,
  PatientTableViewMode,
  PatientTableSort,
  PatientTablePagination,
  PatientTableAction,
};
