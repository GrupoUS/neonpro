/**
 * Service Management Page
 * Comprehensive service management with CRUD operations
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Search } from 'lucide-react';

import { Button } from '@neonpro/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui';
import { Input } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@neonpro/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@neonpro/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@neonpro/ui';

import { useAuth } from '@/hooks/useAuth';
import { useServices, useDeleteService } from '@/hooks/useServices';
import type { Service } from '@/types/service';
import { ServiceForm } from '@/components/services/ServiceForm';
import { toast } from 'sonner';

// Service table columns definition
const createColumns = (
  onEdit: (service: Service) => void,
  onDelete: (service: Service) => void,
): ColumnDef<Service>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='h-auto p-0 font-semibold'
      >
        Nome do Serviço
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'duration_minutes',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='h-auto p-0 font-semibold'
      >
        Duração
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => (
      <div className='text-center'>
        {row.getValue('duration_minutes')} min
      </div>
    ),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='h-auto p-0 font-semibold'
      >
        Preço
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price);

      return <div className='text-right font-medium'>{formatted}</div>;
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null;
      return (
        <div className='max-w-[200px] truncate text-sm text-muted-foreground'>
          {description || 'Sem descrição'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const service = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Abrir menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(service)}>
              Editar serviço
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(service)}
              className='text-destructive'
            >
              Excluir serviço
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function ServicesPage() {
  const { profile: userProfile } = useAuth(); // fix property name (was userProfile)
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Fetch services
  const {
    data: servicesResponse,
    isLoading,
    error,
  } = useServices({
    clinic_id: userProfile?.clinicId,
  });

  const deleteServiceMutation = useDeleteService();

  const services = servicesResponse?.data || [];

  const handleEdit = (service: Service) => {
    setEditingService(service);
  };

  const handleDelete = async (service: Service) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
      try {
        await deleteServiceMutation.mutateAsync(service.id);
        toast.success('Serviço excluído com sucesso!');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Erro ao excluir serviço');
      }
    }
  };

  const columns = createColumns(handleEdit, handleDelete);

  const table = useReactTable({
    data: services,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (error) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center text-destructive'>
              Erro ao carregar serviços: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Gerenciar Serviços</h1>
            <p className='text-muted-foreground'>
              Gerencie os serviços oferecidos pela sua clínica
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className='gap-2'>
                <Plus className='h-4 w-4' />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Criar Novo Serviço</DialogTitle>
                <DialogDescription>
                  Preencha as informações do novo serviço
                </DialogDescription>
              </DialogHeader>
              <ServiceForm
                onSuccess={() => setShowCreateDialog(false)}
                clinicId={userProfile?.clinicId || ''}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Serviços</CardTitle>
            <CardDescription>
              {services.length} serviço{services.length !== 1 ? 's' : ''} encontrado{services.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Table Controls */}
            <div className='flex items-center justify-between py-4'>
              <div className='flex items-center gap-2'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Buscar serviços...'
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                      table.getColumn('name')?.setFilterValue(event.target.value)
                    }
                    className='max-w-sm pl-9'
                  />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='gap-2'>
                    Colunas <ChevronDown className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className='capitalize'
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Data Table */}
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='h-24 text-center'>
                        Carregando serviços...
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className='h-24 text-center'
                      >
                        Nenhum serviço encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className='flex items-center justify-end space-x-2 py-4'>
              <div className='text-muted-foreground flex-1 text-sm'>
                {table.getFilteredSelectedRowModel().rows.length} de{' '}
                {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
              </div>
              <div className='space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Anterior
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Service Dialog */}
      <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
            <DialogDescription>
              Atualize as informações do serviço
            </DialogDescription>
          </DialogHeader>
          {editingService && (
            <ServiceForm
              service={editingService}
              onSuccess={() => setEditingService(null)}
              clinicId={userProfile?.clinicId || ''}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute('/services')({
  component: ServicesPage,
});
