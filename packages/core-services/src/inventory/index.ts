// Inventory module exports
export * from './types';
export * from './service';

// Re-export commonly used types
export type {
  Product,
  StockItem,
  StockMovement,
  Supplier,
  PurchaseOrder,
  InventoryAlert,
  CreateProductData,
  CreateStockItemData,
  CreateSupplierData,
  StorageLocation,
  StorageRequirements,
  RegulatoryInfo,
  ProductFilters,
  PurchaseOrderFilters,
  AlertFilters,
  InventoryStats
} from './types';

export { InventoryService } from './service';
export { 
  ProductCategory,
  ProductType,
  UnitOfMeasure,
  MovementType,
  OrderStatus,
  AlertType,
  AlertSeverity
} from './types';

export type { InventoryRepository } from './service';