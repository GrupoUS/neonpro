'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { 
  useStockTransfers, 
  useCreateStockTransfer,
  useUpdateStockTransfer,
  useInventoryItems,
  useRealtimeStockTransfers
} from '@/app/hooks/use-multi-location-inventory';
import type { CreateStockTransfer, StockTransferFilters } from '@/app/lib/types/inventory';
import { 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  Package,
  Building2,
  Filter
} from 'lucide-react';

interface StockTransferManagerProps {
  clinic_id?: string;
}

export function StockTransferManager({ clinic_id }: StockTransferManagerProps) {
  const [filters, setFilters] = useState<StockTransferFilters>({ clinic_id });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: transfers, isLoading } = useStockTransfers(filters);
  const { data: inventoryItems } = useInventoryItems({ clinic_id, active_only: true });
  const createTransfer = useCreateStockTransfer();
  const updateTransfer = useUpdateStockTransfer();
  
  // Real-time updates
  useRealtimeStockTransfers(clinic_id);

  const handleCreateTransfer = async (data: CreateStockTransfer) => {
    try {
      await createTransfer.mutateAsync(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating transfer:', error);
    }
  };

  const handleUpdateTransferStatus = async (transferId: string, status: string) => {
    try {
      await updateTransfer.mutateAsync({ id: transferId, status });
    } catch (error) {
      console.error('Error updating transfer:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transferências de Estoque</h2>
          <p className="text-muted-foreground">
            Gerencie transferências entre localizações
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transferência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Transferência de Estoque</DialogTitle>
              <DialogDescription>
                Crie uma nova transferência entre localizações
              </DialogDescription>
            </DialogHeader>
            <CreateTransferForm 
              onSubmit={handleCreateTransfer}
              inventoryItems={inventoryItems || []}
              isSubmitting={createTransfer.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                status: value === 'all' ? undefined : value 
              }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="in_transit">Em Trânsito</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.transfer_type || 'all'}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                transfer_type: value === 'all' ? undefined : value 
              }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="internal">Interno</SelectItem>
                <SelectItem value="inter_clinic">Entre Clínicas</SelectItem>
                <SelectItem value="supplier_delivery">Entrega de Fornecedor</SelectItem>
                <SelectItem value="disposal">Descarte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transferências</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers?.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{transfer.transfer_number}</span>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <p className="font-medium">{transfer.inventory_item?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transfer.inventory_item?.sku && `SKU: ${transfer.inventory_item.sku}`}
                      </p>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {transfer.from_clinic ? (
                      <div>
                        <p className="font-medium">{transfer.from_clinic.clinic_name}</p>
                        {transfer.from_room && (
                          <p className="text-sm text-muted-foreground">{transfer.from_room.name}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Fornecedor</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {transfer.to_clinic ? (
                      <div>
                        <p className="font-medium">{transfer.to_clinic.clinic_name}</p>
                        {transfer.to_room && (
                          <p className="text-sm text-muted-foreground">{transfer.to_room.name}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Descarte</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium">{transfer.quantity}</span>
                  </TableCell>
                  
                  <TableCell>
                    <TransferStatusBadge status={transfer.status} />
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(transfer.created_at).toLocaleDateString('pt-BR')}</p>
                      <p className="text-muted-foreground">
                        {new Date(transfer.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transfer.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateTransferStatus(transfer.id, 'approved')}
                            disabled={updateTransfer.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateTransferStatus(transfer.id, 'cancelled')}
                            disabled={updateTransfer.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {transfer.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTransferStatus(transfer.id, 'in_transit')}
                          disabled={updateTransfer.isPending}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {transfer.status === 'in_transit' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateTransferStatus(transfer.id, 'completed')}
                          disabled={updateTransfer.isPending}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {transfers?.length === 0 && (
            <div className="text-center py-8">
              <ArrowRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma transferência encontrada
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TransferStatusBadgeProps {
  status: string;
}

function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
  const statusConfig = {
    pending: { label: 'Pendente', variant: 'outline' as const, icon: Clock },
    approved: { label: 'Aprovado', variant: 'secondary' as const, icon: CheckCircle },
    in_transit: { label: 'Em Trânsito', variant: 'default' as const, icon: Truck },
    completed: { label: 'Concluído', variant: 'default' as const, icon: Package },
    cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}