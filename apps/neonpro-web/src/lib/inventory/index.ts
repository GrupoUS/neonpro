/**
 * Story 11.3: Centralized Inventory Module Exports
 * Barrel export file for the Stock Output and Consumption Control System
 */

// Core management classes
export { StockOutputManager } from "./stock-output-management";
export { FIFOManager, fifoManager } from "./fifo-management";
export { ConsumptionAnalyzer, consumptionAnalyzer } from "./consumption-analytics";

// Configuration and utilities
export {
  InventoryConfigManager,
  InventoryDashboardProvider,
  InventoryIntegrationManager,
  InventoryUtils,
  inventoryConfigManager,
  inventoryDashboardProvider,
  inventoryIntegrationManager,
} from "./config";

// Types
export type {
  // Stock output types
  StockOutput,
  StockOutputItem,
  StockRequest,
  StockRequestStatus,
  AutoApprovalRule,
  StockTransfer,
  TransferItem,
  StockAlert,
  BatchStock,
  FIFOResult,
  LowStockAlert,
  ExpiryMonitoring,
  ConsumptionPattern as BaseConsumptionPattern,
  StockMovement,
  QualityCheck,
  RegulatoryCompliance,
  // FIFO management types
  FIFOAnalysis,
  FIFORecommendation,
  ExpiryAlert,
  ExpiryAction,
  BatchMovement,
  FIFOOptimizationConfig,
  // Consumption analytics types
  ConsumptionAnalytics,
  ProductConsumption,
  ConsumptionTrend,
  CostEfficiency,
  EfficiencyOpportunity,
  ConsumptionAlert,
  ConsumptionForecast,
  PurchaseRecommendation,
  ConsumptionPattern,
  ProductCorrelation,
  // Configuration types
  InventoryConfig,
  InventoryDashboardSummary,
  InventoryWorkflow,
  WorkflowStep,
  SystemIntegration,
  InventoryMetrics,
  InventoryAuditLog,
  // Utility types
  DateRange,
  ValueWithChange,
  PaginatedResponse,
  ApiResponse,
} from "./types";

// Constants and enums
export {
  DEFAULT_INVENTORY_CONFIG,
  StockOutputStatus,
  BatchStatus,
  AlertType,
  TransferStatus,
} from "./types";

// Default instances for easy access
export const inventoryManagers = {
  stockOutput: new StockOutputManager(),
  fifo: fifoManager,
  consumption: consumptionAnalyzer,
  config: inventoryConfigManager,
  dashboard: inventoryDashboardProvider,
  integration: inventoryIntegrationManager,
} as const;
