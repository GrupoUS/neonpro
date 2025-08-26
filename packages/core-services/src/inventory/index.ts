// Inventory module exports

export type { InventoryRepository } from './service';
export * from './service';
export { InventoryService } from './service';
// Re-export commonly used types
export type {
  AlertFilters,
  CreateProductData,
  CreateStockItemData,
  CreateSupplierData,
  InventoryAlert,
  InventoryStats,
  Product,
  ProductFilters,
  PurchaseOrder,
  PurchaseOrderFilters,
  RegulatoryInfo,
  StockItem,
  StockMovement,
  StorageLocation,
  StorageRequirements,
  Supplier,
} from './types';
export * from './types';
export {
  AlertSeverity,
  AlertType,
  MovementType,
  OrderStatus,
  ProductCategory,
  ProductType,
  UnitOfMeasure,
} from './types';
