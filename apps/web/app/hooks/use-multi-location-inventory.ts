import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { MultiLocationInventoryService } from '@/app/lib/services/multi-location-inventory-service';
import type {
  CreateInventoryItem,
  CreateStockTransfer,
  InventoryFilters,
  StockTransactionFilters,
  StockTransferFilters,
  UpdateInventoryItem,
  UpdateInventoryStock,
  UpdateStockTransfer,
} from '@/app/lib/types/inventory';

const inventoryService = new MultiLocationInventoryService();

// ===== INVENTORY ITEMS HOOKS =====

export function useInventoryItems(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: ['inventory-items', filters],
    queryFn: () => inventoryService.getInventoryItems(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory-item', id],
    queryFn: () => inventoryService.getInventoryItem(id),
    enabled: Boolean(id),
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: CreateInventoryItem) =>
      inventoryService.createInventoryItem(item),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success(`Item "${data.name}" criado com sucesso!`);
    },
    onError: (_error) => {
      toast.error('Erro ao criar item do inventário');
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: UpdateInventoryItem) =>
      inventoryService.updateInventoryItem(item),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item', data.id] });
      toast.success(`Item "${data.name}" atualizado com sucesso!`);
    },
    onError: (_error) => {
      toast.error('Erro ao atualizar item do inventário');
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Item removido com sucesso!');
    },
    onError: (_error) => {
      toast.error('Erro ao remover item do inventário');
    },
  });
}

// ===== INVENTORY STOCK HOOKS =====

export function useInventoryStock(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: ['inventory-stock', filters],
    queryFn: () => inventoryService.getInventoryStock(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useStockByLocation(clinic_id: string, room_id?: string) {
  return useQuery({
    queryKey: ['stock-by-location', clinic_id, room_id],
    queryFn: () => inventoryService.getStockByLocation(clinic_id, room_id),
    enabled: Boolean(clinic_id),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stock: UpdateInventoryStock) =>
      inventoryService.updateStock(stock),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-by-location'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
      toast.success('Estoque atualizado com sucesso!');
    },
    onError: (_error) => {
      toast.error('Erro ao atualizar estoque');
    },
  });
}

export function useBulkUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateInventoryStock[]) =>
      inventoryService.bulkUpdateStock(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-by-location'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
      toast.success('Estoque atualizado em lote com sucesso!');
    },
    onError: (_error) => {
      toast.error('Erro ao atualizar estoque em lote');
    },
  });
} // ===== STOCK TRANSFERS HOOKS =====

export function useStockTransfers(filters: StockTransferFilters = {}) {
  return useQuery({
    queryKey: ['stock-transfers', filters],
    queryFn: () => inventoryService.getStockTransfers(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transfer: CreateStockTransfer) =>
      inventoryService.createStockTransfer(transfer),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stock'] });
      toast.success(
        `Transferência ${data.transfer_number} criada com sucesso!`
      );
    },
    onError: (_error) => {
      toast.error('Erro ao criar transferência de estoque');
    },
  });
}

export function useUpdateStockTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transfer: UpdateStockTransfer) =>
      inventoryService.updateStockTransfer(transfer),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] });

      const statusMessages = {
        approved: 'Transferência aprovada!',
        in_transit: 'Transferência em trânsito!',
        completed: 'Transferência concluída!',
        cancelled: 'Transferência cancelada!',
      };

      toast.success(
        statusMessages[data.status as keyof typeof statusMessages] ||
          'Transferência atualizada!'
      );
    },
    onError: (_error) => {
      toast.error('Erro ao atualizar transferência');
    },
  });
}

export function useTransferStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      inventory_item_id: string;
      from_clinic_id: string;
      to_clinic_id: string;
      quantity: number;
      from_room_id?: string;
      to_room_id?: string;
      notes?: string;
    }) =>
      inventoryService.transferStock(
        params.inventory_item_id,
        params.from_clinic_id,
        params.to_clinic_id,
        params.quantity,
        params.from_room_id,
        params.to_room_id,
        params.notes
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stock'] });
      toast.success(`Transferência ${data.transfer_number} iniciada!`);
    },
    onError: (_error) => {
      toast.error('Erro ao transferir estoque');
    },
  });
}

// ===== STOCK TRANSACTIONS HOOKS =====

export function useStockTransactions(filters: StockTransactionFilters = {}) {
  return useQuery({
    queryKey: ['stock-transactions', filters],
    queryFn: () => inventoryService.getStockTransactions(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// ===== DASHBOARD & ANALYTICS HOOKS =====

export function useLocationStockSummary(clinic_id?: string) {
  return useQuery({
    queryKey: ['location-stock-summary', clinic_id],
    queryFn: () => inventoryService.getLocationStockSummary(clinic_id),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useInventoryMovementSummary(clinic_id?: string, days = 30) {
  return useQuery({
    queryKey: ['inventory-movement-summary', clinic_id, days],
    queryFn: () =>
      inventoryService.getInventoryMovementSummary(clinic_id, days),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useLowStockAlerts(clinic_id?: string) {
  return useQuery({
    queryKey: ['low-stock-alerts', clinic_id],
    queryFn: () => inventoryService.getLowStockAlerts(clinic_id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpiringItems(clinic_id?: string, days = 30) {
  return useQuery({
    queryKey: ['expiring-items', clinic_id, days],
    queryFn: () => inventoryService.getExpiringItems(clinic_id, days),
    staleTime: 10 * 60 * 1000,
  });
}

// ===== REAL-TIME SUBSCRIPTIONS =====

export function useRealtimeInventoryStock(clinic_id?: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const channel = inventoryService.supabase
      .channel('inventory-stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_stock',
          filter: clinic_id ? `clinic_id=eq.${clinic_id}` : undefined,
        },
        (_payload) => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['inventory-stock'] });
          queryClient.invalidateQueries({ queryKey: ['stock-by-location'] });
          queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
        }
      )
      .subscribe();

    return () => {
      inventoryService.supabase.removeChannel(channel);
    };
  }, [clinic_id, queryClient]);
}

export function useRealtimeStockTransfers(clinic_id?: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const channel = inventoryService.supabase
      .channel('stock-transfers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_transfers',
          filter: clinic_id
            ? `or(from_clinic_id.eq.${clinic_id},to_clinic_id.eq.${clinic_id})`
            : undefined,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });

          // Show real-time notifications for status changes
          if (payload.eventType === 'UPDATE' && payload.new?.status) {
            const status = payload.new.status;
            const transferNumber = payload.new.transfer_number;

            const statusMessages = {
              approved: `Transferência ${transferNumber} foi aprovada`,
              in_transit: `Transferência ${transferNumber} está em trânsito`,
              completed: `Transferência ${transferNumber} foi concluída`,
              cancelled: `Transferência ${transferNumber} foi cancelada`,
            };

            if (statusMessages[status as keyof typeof statusMessages]) {
              toast.info(statusMessages[status as keyof typeof statusMessages]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      inventoryService.supabase.removeChannel(channel);
    };
  }, [clinic_id, queryClient]);
}
