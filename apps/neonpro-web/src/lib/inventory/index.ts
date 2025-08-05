/**
 * Story 11.3: Centralized Inventory Module Exports
 * Barrel export file for the Stock Output and Consumption Control System
 */

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
export { ConsumptionAnalyzer, consumptionAnalyzer } from "./consumption-analytics";
export { FIFOManager, fifoManager } from "./fifo-management";
// Core management classes
export { StockOutputManager } from "./stock-output-management";

// Types
export type {
  ApiResponse,
  AutoApprovalRule,
  BatchMovement,
  BatchStock,
  ConsumptionAlert,
  // Consumption analytics types
  ConsumptionAnalytics,
  ConsumptionForecast,
  ConsumptionPattern as BaseConsumptionPattern,
  ConsumptionPattern,
  ConsumptionTrend,
  CostEfficiency,
  // Utility types
  DateRange,
  EfficiencyOpportunity,
  ExpiryAction,
  ExpiryAlert,
  ExpiryMonitoring,
  // FIFO management types
  FIFOAnalysis,
  FIFOOptimizationConfig,
  FIFORecommendation,
  FIFOResult,
  InventoryAuditLog,
  // Configuration types
  InventoryConfig,
  InventoryDashboardSummary,
  InventoryMetrics,
  InventoryWorkflow,
  LowStockAlert,
  PaginatedResponse,
  ProductConsumption,
  ProductCorrelation,
  PurchaseRecommendation,
  QualityCheck,
  RegulatoryCompliance,
  StockAlert,
  StockMovement,
  // Stock output types
  StockOutput,
  StockOutputItem,
  StockRequest,
  StockRequestStatus,
  StockTransfer,
  SystemIntegration,
  TransferItem,
  ValueWithChange,
  WorkflowStep,
} from "./types";

// Constants and enums
export {
  AlertType,
  BatchStatus,
  DEFAULT_INVENTORY_CONFIG,
  StockOutputStatus,
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
