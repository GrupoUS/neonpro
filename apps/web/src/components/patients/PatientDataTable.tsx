'use client';

import { useNavigate } from '@tanstack/react-router';
import {
  Calendar,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  Download,
  EllipsisIcon,
  Eye,
  FileText,
  FilterIcon,
  ListFilterIcon,
  Mail,
  Phone,
  PlusIcon,
  Stethoscope,
  TrashIcon,
  User,
  UserCheck,
} from 'lucide-react';
import { lazy, Suspense, useId, useMemo, useRef, useState } from 'react';

import { cn } from '@/components/ui';
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Label,
  Pagination,
  PaginationContent,
  PaginationItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { EnhancedTable } from '@/components/ui';

import { useDataExport } from '@/hooks/useDataExport';
import {
  type PatientTableData,
  useBulkDeletePatients,
  usePatientsTable,
} from '@/hooks/usePatients';
import { HealthcareLoadingFallback } from '@/lib/lazy-loading';
import { toast } from 'sonner';
import { AdvancedSearchDialog } from './AdvancedSearchDialog';
import { PatientCreationForm } from './PatientCreationForm';

// Lazy load TanStack Table for better bundle splitting
const TanStackTable = lazy(() => import('@tanstack/react-table'));

// Import types from lazy-loaded module
type ColumnDef<_T> = any;
type ColumnFiltersState = any;
type FilterFn = any;
type PaginationState = any;
type Row<_T> = any;
type SortingState = any;
type VisibilityState = any;

interface PatientDataTableProps {
  clinicId: string;
}

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<PatientTableData> = (row, _columnId, filterValue: string) => {
  const searchableRowContent = `${row.original.fullName} ${row.original.email || ''} ${
    row.original.phone || ''
  }`.toLowerCase();
  const searchTerm = (filterValue ?? '').toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<PatientTableData> = (row, _columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(_columnId) as string;
  return filterValue.includes(status);
};

import { formatBRPhone } from '@/utils';

const formatPhone = (phone: string | undefined): string => {
  if (!phone) return '';
  return formatBRPhone(phone);
};

const formatDate = (date: string | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
};

export function PatientDataTable({ clinicId }: PatientDataTableProps) {
  const id = useId();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'fullName',
      desc: false,
    },
  ]);

  // Patient creation dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Advanced search dialog state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Search and filter state
  const searchFilter = (columnFilters.find(f => f.id === 'fullName')?.value as string) || '';
  const statusFilter = (columnFilters.find(f => f.id === 'status')?.value as string[]) || [];

  return (
    <Suspense fallback={<HealthcareLoadingFallback />}>
      <PatientDataTableContent
        clinicId={clinicId}
        id={id}
        navigate={navigate}
        inputRef={inputRef}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
        showAdvancedSearch={showAdvancedSearch}
        setShowAdvancedSearch={setShowAdvancedSearch}
        searchFilter={searchFilter}
        statusFilter={statusFilter}
      />
    </Suspense>
  );
}

function PatientDataTableContent({
  clinicId,
  id,
  navigate,
  inputRef,
  columnFilters,
  setColumnFilters,
  columnVisibility,
  setColumnVisibility,
  pagination,
  setPagination,
  sorting,
  setSorting,
  showCreateDialog,
  setShowCreateDialog,
  showAdvancedSearch,
  setShowAdvancedSearch,
  searchFilter,
  statusFilter,
}: {
  clinicId: string;
  id: string;
  navigate: any;
  inputRef: React.RefObject<HTMLInputElement>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState) => void;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  showCreateDialog: boolean;
  setShowCreateDialog: (show: boolean) => void;
  showAdvancedSearch: boolean;
  setShowAdvancedSearch: (show: boolean) => void;
  searchFilter: string;
  statusFilter: string[];
}) {
  // Dynamically import TanStack Table hooks
  const {
    useReactTable,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    _flexRender,
  } = TanStackTable as any;

  // Fetch patients data with real-time updates
  const {
    data: patientsData,
    isLoading,
    error,
  } = usePatientsTable(clinicId, {
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id === 'fullName'
      ? 'full_name'
      : sorting[0]?.id || 'full_name',
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    filters: {
      search: searchFilter || undefined,
      status: statusFilter.length > 0 ? statusFilter : undefined,
    },
  });

  const bulkDeleteMutation = useBulkDeletePatients();
  const dataExport = useDataExport();

  const patients = patientsData?.data || [];
  const totalCount = patientsData?.count || 0;

  // Define table columns
  const columns: ColumnDef<PatientTableData>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()
            || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value: boolean | 'indeterminate') =>
            table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label='Selecionar todos'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean | 'indeterminate') => row.toggleSelected(Boolean(value))}
          aria-label='Selecionar linha'
        />
      ),
      size: 28,
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: 'Nome',
      accessorKey: 'fullName',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-muted'>
            <User className='size-4' />
          </div>
          <div>
            <div className='font-medium'>{row.getValue('fullName')}</div>
            {row.original.age && (
              <div className='text-muted-foreground text-sm'>
                {row.original.age} anos
              </div>
            )}
          </div>
        </div>
      ),
      size: 200,
      filterFn: multiColumnFilterFn,
      enableHiding: false,
    },
    {
      header: 'Contato',
      id: 'contact',
      cell: ({ row }) => (
        <div className='space-y-1'>
          {row.original.email && (
            <div className='flex items-center gap-2 text-sm'>
              <Mail className='size-3 text-muted-foreground' />
              <span>{row.original.email}</span>
            </div>
          )}
          {row.original.phone && (
            <div className='flex items-center gap-2 text-sm'>
              <Phone className='size-3 text-muted-foreground' />
              <span>{formatPhone(row.original.phone)}</span>
            </div>
          )}
        </div>
      ),
      size: 220,
    },
    {
      header: 'CPF',
      accessorKey: 'cpf',
      cell: ({ row }) => {
        const cpf = row.getValue('cpf') as string;
        if (!cpf) return <span className='text-muted-foreground'>—</span>;

        // Format CPF: 000.000.000-00
        const cleanCPF = cpf.replace(/\D/g, '');
        const formattedCPF = cleanCPF.replace(
          /(\d{3})(\d{3})(\d{3})(\d{2})/,
          '$1.$2.$3-$4',
        );
        return <span className='font-mono text-sm'>{formattedCPF}</span>;
      },
      size: 140,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge
            className={cn(
              status === 'Inactive'
                && 'bg-muted-foreground/60 text-primary-foreground',
              status === 'Pending'
                && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
              status === 'Active'
                && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            )}
          >
            {status === 'Active'
              ? 'Ativo'
              : status === 'Inactive'
              ? 'Inativo'
              : 'Pendente'}
          </Badge>
        );
      },
      size: 100,
      filterFn: statusFilterFn,
    },
    {
      header: 'Última Visita',
      accessorKey: 'lastVisit',
      cell: ({ row }) => {
        const lastVisit = row.getValue('lastVisit') as string;
        return lastVisit
          ? (
            <div className='flex items-center gap-2'>
              <Calendar className='size-3 text-muted-foreground' />
              <span className='text-sm'>{formatDate(lastVisit)}</span>
            </div>
          )
          : <span className='text-muted-foreground'>—</span>;
      },
      size: 120,
    },
    {
      header: 'Consultas',
      accessorKey: 'totalAppointments',
      cell: ({ row }) => {
        const total = row.getValue('totalAppointments') as number;
        return (
          <div className='flex items-center gap-2'>
            <Stethoscope className='size-3 text-muted-foreground' />
            <span className='text-sm font-medium'>{total}</span>
          </div>
        );
      },
      size: 100,
    },
    {
      id: 'actions',
      header: () => <span className='sr-only'>Ações</span>,
      cell: ({ row }) => <PatientRowActions row={row} onNavigate={navigate} />,
      size: 60,
      enableHiding: false,
    },
  ], [navigate]);

  const table = useReactTable({
    data: patients,
    columns,
    pageCount: patientsData?.pageCount ?? 0,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  // Get unique status values for filter
  const uniqueStatusValues = useMemo(() => ['Active', 'Inactive', 'Pending'], []);

  const selectedStatuses = useMemo(() => {
    return statusFilter;
  }, [statusFilter]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const newFilterValue = checked
      ? [...selectedStatuses, value]
      : selectedStatuses.filter(v => v !== value);

    table
      .getColumn('status')
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const patientIds = selectedRows.map(row => row.original.id);

    bulkDeleteMutation.mutate({ patientIds, clinicId }, {
      onSuccess: () => {
        table.resetRowSelection();
      },
    });
  };

  const handlePatientCreated = (_patient: any) => {
    toast.success(`Paciente criado com sucesso!`);
    // The real-time subscription will automatically update the table
  };

  // Export functions (FR-008)
  const handleExportCSV = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const dataToExport = selectedRows.length > 0
      ? selectedRows.map(row => row.original)
      : patients;

    if (dataToExport.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    await dataExport.exportData(dataToExport, {
      format: 'csv',
      filename: `pacientes_${new Date().toISOString().slice(0, 10)}`,
      includeHeaders: true,
      selectedFields: [
        'fullName',
        'email',
        'phone',
        'cpf',
        'birthDate',
        'createdAt',
      ],
    });
  };

  const handleExportPDF = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const dataToExport = selectedRows.length > 0
      ? selectedRows.map(row => row.original)
      : patients;

    if (dataToExport.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    await dataExport.exportData(dataToExport, {
      format: 'pdf',
      filename: `pacientes_${new Date().toISOString().slice(0, 10)}`,
      includeHeaders: true,
      selectedFields: [
        'fullName',
        'email',
        'phone',
        'cpf',
        'birthDate',
        'createdAt',
      ],
    });
  };

  // Advanced search handlers (FR-005)
  const handleApplyAdvancedFilters = (filters: any) => {
    // Apply filters to the table
    if (filters.query) {
      table.getColumn('fullName')?.setFilterValue(filters.query);
    }

    if (filters.status && filters.status.length > 0) {
      table.getColumn('status')?.setFilterValue(filters.status);
    }

    // Note: CPF, phone, email, and date range filters would need backend support
    // For now, we'll show a toast indicating advanced search is applied
    if (
      _filters.cpf
      || _filters.phone
      || _filters.email
      || _filters.dateRange?.start
      || _filters.dateRange?.end
    ) {
      toast.success(
        'Filtros avançados aplicados! Funcionalidade completa em desenvolvimento.',
      );
    }
  };

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <CircleAlertIcon className='mx-auto mb-4 size-12 text-muted-foreground' />
          <h3 className='mb-2 text-lg font-semibold'>
            Erro ao carregar pacientes
          </h3>
          <p className='text-muted-foreground mb-4'>
            {error.message || 'Ocorreu um erro inesperado'}
          </p>
          <Button onClick={() => window.location.reload()} variant='outline'>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Pacientes</h2>
          <p className='text-muted-foreground'>
            Gerencie os pacientes da sua clínica
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          {/* Search filter */}
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  'peer min-w-60 ps-9',
                  Boolean(table.getColumn('fullName')?.getFilterValue())
                    && 'pe-9',
                )}
                value={searchFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  table.getColumn('fullName')?.setFilterValue(e.target.value)}
                placeholder='Buscar por nome, email ou telefone...'
                type='text'
                aria-label='Buscar pacientes'
              />
              <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50'>
                <ListFilterIcon size={16} aria-hidden='true' />
              </div>
              {Boolean(searchFilter) && (
                <button
                  className='text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                  aria-label='Limpar busca'
                  onClick={() => {
                    table.getColumn('fullName')?.setFilterValue('');
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                >
                  <CircleXIcon size={16} aria-hidden='true' />
                </button>
              )}
            </div>

            {/* Advanced Search Button */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowAdvancedSearch(true)}
              className='flex items-center gap-2'
            >
              <FilterIcon className='h-4 w-4' />
              Busca Avançada
            </Button>
          </div>

          {/* Status filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline'>
                <FilterIcon
                  className='-ms-1 opacity-60'
                  size={16}
                  aria-hidden='true'
                />
                Status
                {selectedStatuses.length > 0 && (
                  <span className='bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium'>
                    {selectedStatuses.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto min-w-36 p-3' align='start'>
              <div className='space-y-3'>
                <div className='text-muted-foreground text-xs font-medium'>
                  Filtros
                </div>
                <div className='space-y-3'>
                  {uniqueStatusValues.map((value, i) => (
                    <div key={value} className='flex items-center gap-2'>
                      <Checkbox
                        id={`${id}-${i}`}
                        checked={selectedStatuses.includes(value)}
                        onCheckedChange={(checked: boolean) =>
                          handleStatusChange(checked, value)}
                      />
                      <Label
                        htmlFor={`${id}-${i}`}
                        className='flex grow justify-between gap-2 font-normal'
                      >
                        {value === 'Active'
                          ? 'Ativo'
                          : value === 'Inactive'
                          ? 'Inativo'
                          : 'Pendente'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                <Columns3Icon
                  className='-ms-1 opacity-60'
                  size={16}
                  aria-hidden='true'
                />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Alternar colunas</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                      onSelect={(event: Event) => event.preventDefault()}
                    >
                      {column.id === 'contact'
                        ? 'Contato'
                        : column.id === 'lastVisit'
                        ? 'Última Visita'
                        : column.id === 'totalAppointments'
                        ? 'Consultas'
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex items-center gap-3'>
          {/* Bulk delete button */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline' className='text-destructive'>
                  <TrashIcon
                    className='-ms-1 opacity-60'
                    size={16}
                    aria-hidden='true'
                  />
                  Remover
                  <span className='bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium'>
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div className='flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4'>
                  <div
                    className='flex size-9 shrink-0 items-center justify-center rounded-full border'
                    aria-hidden='true'
                  >
                    <CircleAlertIcon className='opacity-80' size={16} />
                  </div>
                  <DialogHeader>
                    <DialogTitle>Tem certeza absoluta?</DialogTitle>
                    <DialogDescription>
                      Esta ação não pode ser desfeita. Isso irá remover permanentemente{' '}
                      {table.getSelectedRowModel().rows.length} paciente(s) selecionado(s).
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <DialogFooter>
                  <Button variant='outline'>Cancelar</Button>
                  <Button
                    onClick={handleDeleteRows}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                    Remover
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Export buttons */}
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleExportCSV}
              disabled={dataExport.isExporting}
            >
              <Download className='w-4 h-4 mr-2' />
              {dataExport.isExporting && dataExport.status === 'exporting'
                ? 'Exportando...'
                : 'CSV'}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleExportPDF}
              disabled={dataExport.isExporting}
            >
              <FileText className='w-4 h-4 mr-2' />
              {dataExport.isExporting && dataExport.status === 'exporting'
                ? 'Exportando...'
                : 'PDF'}
            </Button>
          </div>

          {/* Add patient button */}
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusIcon
              className='-ms-1 opacity-60'
              size={16}
              aria-hidden='true'
            />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Table */}
      <EnhancedTable
        className='bg-background'
        table={table}
        loading={isLoading}
        columnsCount={columns.length}
        ariaLabel='Tabela de pacientes'
        emptyMessage='Nenhum paciente encontrado.'
        onRowClick={row => {
          navigate({
            to: '/patients/$patientId',
            params: { patientId: row.original.id },
          });
        }}
        stopRowClickPredicate={cell =>
          cell.column?.id === 'actions' || cell.column?.id === 'select'}
      />

      {/* Pagination */}
      <div className='flex items-center justify-between gap-8'>
        {/* Results per page */}
        <div className='flex items-center gap-3'>
          <Label htmlFor={`${id}-page-size`} className='max-sm:sr-only'>
            Linhas por página
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={value => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              id={`${id}-page-size`}
              className='w-fit whitespace-nowrap'
            >
              <SelectValue placeholder='Selecione o número de resultados' />
            </SelectTrigger>
            <SelectContent className='[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2'>
              {[5, 10, 25, 50].map(pageSize => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div className='text-muted-foreground flex grow justify-end text-sm whitespace-nowrap'>
          <p
            className='text-muted-foreground text-sm whitespace-nowrap'
            aria-live='polite'
          >
            <span className='text-foreground'>
              {table.getState().pagination.pageIndex
                  * table.getState().pagination.pageSize
                + 1}
              -
              {Math.min(
                (table.getState().pagination.pageIndex + 1)
                  * table.getState().pagination.pageSize,
                totalCount,
              )}
            </span>{' '}
            de <span className='text-foreground'>{totalCount}</span>
          </p>
        </div>

        {/* Pagination controls */}
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size='icon'
                  variant='outline'
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage() || isLoading}
                  aria-label='Ir para primeira página'
                >
                  <ChevronFirstIcon size={16} aria-hidden='true' />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size='icon'
                  variant='outline'
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage() || isLoading}
                  aria-label='Página anterior'
                >
                  <ChevronLeftIcon size={16} aria-hidden='true' />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size='icon'
                  variant='outline'
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage() || isLoading}
                  aria-label='Próxima página'
                >
                  <ChevronRightIcon size={16} aria-hidden='true' />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size='icon'
                  variant='outline'
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage() || isLoading}
                  aria-label='Ir para última página'
                >
                  <ChevronLastIcon size={16} aria-hidden='true' />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Patient creation dialog */}
      <PatientCreationForm
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        clinicId={clinicId}
        onPatientCreated={handlePatientCreated}
      />

      {/* Advanced search dialog */}
      <AdvancedSearchDialog
        open={showAdvancedSearch}
        onOpenChange={setShowAdvancedSearch}
        onApplyFilters={handleApplyAdvancedFilters}
      />
    </div>
  );
}

function PatientRowActions({
  row,
  onNavigate,
}: {
  row: Row<PatientTableData>;
  onNavigate: any;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex justify-end'>
          <Button
            size='icon'
            variant='ghost'
            className='shadow-none'
            aria-label='Ações do paciente'
          >
            <EllipsisIcon size={16} aria-hidden='true' />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              onNavigate({
                to: '/patients/$patientId',
                params: { patientId: row.original.id },
              })}
          >
            <Eye className='mr-2 size-4' />
            <span>Visualizar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              onNavigate({
                to: '/patients/$patientId/edit',
                params: { patientId: row.original.id },
              })}
          >
            <User className='mr-2 size-4' />
            <span>Editar</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() =>
              onNavigate({
                to: '/appointments/new',
                search: { patientId: row.original.id },
              })}
          >
            <Calendar className='mr-2 size-4' />
            <span>Agendar Consulta</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserCheck className='mr-2 size-4' />
              Mais opções
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() =>
                    onNavigate({
                      to: '/patients/$patientId/history',
                      params: { patientId: row.original.id },
                    })}
                >
                  Histórico Médico
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    onNavigate({
                      to: '/patients/$patientId/documents',
                      params: { patientId: row.original.id },
                    })}
                >
                  Documentos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Exportar dados</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Mail className='mr-2 size-4' />
            <span>Enviar Email</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Phone className='mr-2 size-4' />
            <span>Fazer Chamada</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
