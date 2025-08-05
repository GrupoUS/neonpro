/**
 * Story 11.3: Inventory Components Index
 * Central export point for all inventory-related components
 */

// Re-export inventory lib types for convenience
export type {
  AlertRule,
  AutomationRule,
  ConfigurationSettings,
  ConsumptionAnalytics,
  ConsumptionForecast,
  EfficiencyOpportunity,
  FIFOBatch,
  InventoryMetrics,
  StockAlert,
  StockItem,
  StockMovement,
  StockOutput,
  StockTransfer,
  TransferRequest,
} from "@/lib/inventory";
// Main Dashboard Page
export { default as InventoryPage } from "../app/(dashboard)/inventory/page";
export { ConsumptionAnalytics } from "./consumption-analytics";
export { FIFOManagement } from "./fifo-management";
export { InventoryConfiguration } from "./inventory-configuration";
export { InventoryMetrics } from "./inventory-metrics";
// Core Components
export { InventoryOverview } from "./inventory-overview";
export { StockOutputManagement } from "./stock-output-management";
export { StockTransfers } from "./stock-transfers";
// Component Types
export type {
  ConsumptionAnalyticsProps,
  FIFOManagementProps,
  InventoryConfigurationProps,
  InventoryMetricsProps,
  InventoryOverviewProps,
  StockOutputManagementProps,
  StockTransfersProps,
} from "./types";

// Component groups for easier importing
export const InventoryComponents = {
  Overview: InventoryOverview,
  StockOutput: StockOutputManagement,
  FIFO: FIFOManagement,
  Analytics: ConsumptionAnalytics,
  Transfers: StockTransfers,
  Metrics: InventoryMetrics,
  Configuration: InventoryConfiguration,
} as const;

export const InventoryManagementComponents = {
  StockOutput: StockOutputManagement,
  FIFO: FIFOManagement,
  Transfers: StockTransfers,
} as const;

export const InventoryAnalyticsComponents = {
  Overview: InventoryOverview,
  Analytics: ConsumptionAnalytics,
  Metrics: InventoryMetrics,
} as const;

export const InventoryConfigComponents = {
  Configuration: InventoryConfiguration,
} as const;
