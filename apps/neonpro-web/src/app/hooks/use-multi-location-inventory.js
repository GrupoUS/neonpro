Object.defineProperty(exports, "__esModule", { value: true });
exports.useInventoryItems = useInventoryItems;
exports.useInventoryItem = useInventoryItem;
exports.useCreateInventoryItem = useCreateInventoryItem;
exports.useUpdateInventoryItem = useUpdateInventoryItem;
exports.useDeleteInventoryItem = useDeleteInventoryItem;
exports.useInventoryStock = useInventoryStock;
exports.useStockByLocation = useStockByLocation;
exports.useUpdateStock = useUpdateStock;
exports.useBulkUpdateStock = useBulkUpdateStock;
exports.useStockTransfers = useStockTransfers;
exports.useCreateStockTransfer = useCreateStockTransfer;
exports.useUpdateStockTransfer = useUpdateStockTransfer;
exports.useTransferStock = useTransferStock;
exports.useStockTransactions = useStockTransactions;
exports.useLocationStockSummary = useLocationStockSummary;
exports.useInventoryMovementSummary = useInventoryMovementSummary;
exports.useLowStockAlerts = useLowStockAlerts;
exports.useExpiringItems = useExpiringItems;
exports.useRealtimeInventoryStock = useRealtimeInventoryStock;
exports.useRealtimeStockTransfers = useRealtimeStockTransfers;
var react_query_1 = require("@tanstack/react-query");
var multi_location_inventory_service_1 = require("@/app/lib/services/multi-location-inventory-service");
var react_hot_toast_1 = require("react-hot-toast");
var inventoryService = new multi_location_inventory_service_1.MultiLocationInventoryService();
// ===== INVENTORY ITEMS HOOKS =====
function useInventoryItems(filters) {
  if (filters === void 0) {
    filters = {};
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["inventory-items", filters],
    queryFn: () => inventoryService.getInventoryItems(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
function useInventoryItem(id) {
  return (0, react_query_1.useQuery)({
    queryKey: ["inventory-item", id],
    queryFn: () => inventoryService.getInventoryItem(id),
    enabled: !!id,
  });
}
function useCreateInventoryItem() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (item) => inventoryService.createInventoryItem(item),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      react_hot_toast_1.toast.success('Item "'.concat(data.name, '" criado com sucesso!'));
    },
    onError: (error) => {
      console.error("Error creating inventory item:", error);
      react_hot_toast_1.toast.error("Erro ao criar item do inventário");
    },
  });
}
function useUpdateInventoryItem() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (item) => inventoryService.updateInventoryItem(item),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-item", data.id] });
      react_hot_toast_1.toast.success('Item "'.concat(data.name, '" atualizado com sucesso!'));
    },
    onError: (error) => {
      console.error("Error updating inventory item:", error);
      react_hot_toast_1.toast.error("Erro ao atualizar item do inventário");
    },
  });
}
function useDeleteInventoryItem() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (id) => inventoryService.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      react_hot_toast_1.toast.success("Item removido com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting inventory item:", error);
      react_hot_toast_1.toast.error("Erro ao remover item do inventário");
    },
  });
}
// ===== INVENTORY STOCK HOOKS =====
function useInventoryStock(filters) {
  if (filters === void 0) {
    filters = {};
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["inventory-stock", filters],
    queryFn: () => inventoryService.getInventoryStock(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
function useStockByLocation(clinic_id, room_id) {
  return (0, react_query_1.useQuery)({
    queryKey: ["stock-by-location", clinic_id, room_id],
    queryFn: () => inventoryService.getStockByLocation(clinic_id, room_id),
    enabled: !!clinic_id,
    staleTime: 2 * 60 * 1000,
  });
}
function useUpdateStock() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (stock) => inventoryService.updateStock(stock),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-by-location"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock-alerts"] });
      react_hot_toast_1.toast.success("Estoque atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating stock:", error);
      react_hot_toast_1.toast.error("Erro ao atualizar estoque");
    },
  });
}
function useBulkUpdateStock() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (updates) => inventoryService.bulkUpdateStock(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-by-location"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock-alerts"] });
      react_hot_toast_1.toast.success("Estoque atualizado em lote com sucesso!");
    },
    onError: (error) => {
      console.error("Error bulk updating stock:", error);
      react_hot_toast_1.toast.error("Erro ao atualizar estoque em lote");
    },
  });
} // ===== STOCK TRANSFERS HOOKS =====
function useStockTransfers(filters) {
  if (filters === void 0) {
    filters = {};
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["stock-transfers", filters],
    queryFn: () => inventoryService.getStockTransfers(filters),
    staleTime: 2 * 60 * 1000,
  });
}
function useCreateStockTransfer() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (transfer) => inventoryService.createStockTransfer(transfer),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      react_hot_toast_1.toast.success(
        "Transfer\u00EAncia ".concat(data.transfer_number, " criada com sucesso!"),
      );
    },
    onError: (error) => {
      console.error("Error creating stock transfer:", error);
      react_hot_toast_1.toast.error("Erro ao criar transferência de estoque");
    },
  });
}
function useUpdateStockTransfer() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (transfer) => inventoryService.updateStockTransfer(transfer),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-transactions"] });
      var statusMessages = {
        approved: "Transferência aprovada!",
        in_transit: "Transferência em trânsito!",
        completed: "Transferência concluída!",
        cancelled: "Transferência cancelada!",
      };
      react_hot_toast_1.toast.success(statusMessages[data.status] || "Transferência atualizada!");
    },
    onError: (error) => {
      console.error("Error updating stock transfer:", error);
      react_hot_toast_1.toast.error("Erro ao atualizar transferência");
    },
  });
}
function useTransferStock() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: (params) =>
      inventoryService.transferStock(
        params.inventory_item_id,
        params.from_clinic_id,
        params.to_clinic_id,
        params.quantity,
        params.from_room_id,
        params.to_room_id,
        params.notes,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      react_hot_toast_1.toast.success(
        "Transfer\u00EAncia ".concat(data.transfer_number, " iniciada!"),
      );
    },
    onError: (error) => {
      console.error("Error transferring stock:", error);
      react_hot_toast_1.toast.error("Erro ao transferir estoque");
    },
  });
}
// ===== STOCK TRANSACTIONS HOOKS =====
function useStockTransactions(filters) {
  if (filters === void 0) {
    filters = {};
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["stock-transactions", filters],
    queryFn: () => inventoryService.getStockTransactions(filters),
    staleTime: 5 * 60 * 1000,
  });
}
// ===== DASHBOARD & ANALYTICS HOOKS =====
function useLocationStockSummary(clinic_id) {
  return (0, react_query_1.useQuery)({
    queryKey: ["location-stock-summary", clinic_id],
    queryFn: () => inventoryService.getLocationStockSummary(clinic_id),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
function useInventoryMovementSummary(clinic_id, days) {
  if (days === void 0) {
    days = 30;
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["inventory-movement-summary", clinic_id, days],
    queryFn: () => inventoryService.getInventoryMovementSummary(clinic_id, days),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
function useLowStockAlerts(clinic_id) {
  return (0, react_query_1.useQuery)({
    queryKey: ["low-stock-alerts", clinic_id],
    queryFn: () => inventoryService.getLowStockAlerts(clinic_id),
    staleTime: 5 * 60 * 1000,
  });
}
function useExpiringItems(clinic_id, days) {
  if (days === void 0) {
    days = 30;
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["expiring-items", clinic_id, days],
    queryFn: () => inventoryService.getExpiringItems(clinic_id, days),
    staleTime: 10 * 60 * 1000,
  });
}
// ===== REAL-TIME SUBSCRIPTIONS =====
function useRealtimeInventoryStock(clinic_id) {
  var queryClient = (0, react_query_1.useQueryClient)();
  React.useEffect(() => {
    var channel = inventoryService["supabase"]
      .channel("inventory-stock-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory_stock",
          filter: clinic_id ? "clinic_id=eq.".concat(clinic_id) : undefined,
        },
        (payload) => {
          console.log("Stock change detected:", payload);
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
          queryClient.invalidateQueries({ queryKey: ["stock-by-location"] });
          queryClient.invalidateQueries({ queryKey: ["low-stock-alerts"] });
        },
      )
      .subscribe();
    return () => {
      inventoryService["supabase"].removeChannel(channel);
    };
  }, [clinic_id, queryClient]);
}
function useRealtimeStockTransfers(clinic_id) {
  var queryClient = (0, react_query_1.useQueryClient)();
  React.useEffect(() => {
    var channel = inventoryService["supabase"]
      .channel("stock-transfers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stock_transfers",
          filter: clinic_id
            ? "or(from_clinic_id.eq.".concat(clinic_id, ",to_clinic_id.eq.").concat(clinic_id, ")")
            : undefined,
        },
        (payload) => {
          var _a;
          console.log("Transfer change detected:", payload);
          queryClient.invalidateQueries({ queryKey: ["stock-transfers"] });
          // Show real-time notifications for status changes
          if (
            payload.eventType === "UPDATE" &&
            ((_a = payload.new) === null || _a === void 0 ? void 0 : _a.status)
          ) {
            var status_1 = payload.new.status;
            var transferNumber = payload.new.transfer_number;
            var statusMessages = {
              approved: "Transfer\u00EAncia ".concat(transferNumber, " foi aprovada"),
              in_transit: "Transfer\u00EAncia ".concat(
                transferNumber,
                " est\u00E1 em tr\u00E2nsito",
              ),
              completed: "Transfer\u00EAncia ".concat(transferNumber, " foi conclu\u00EDda"),
              cancelled: "Transfer\u00EAncia ".concat(transferNumber, " foi cancelada"),
            };
            if (statusMessages[status_1]) {
              react_hot_toast_1.toast.info(statusMessages[status_1]);
            }
          }
        },
      )
      .subscribe();
    return () => {
      inventoryService["supabase"].removeChannel(channel);
    };
  }, [clinic_id, queryClient]);
}
