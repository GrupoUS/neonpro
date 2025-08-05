/**
 * Story 11.3: Inventory Components Index
 * Central export point for all inventory-related components
 */

// Main Dashboard Page
export { default as InventoryPage } from '../app/(dashboard)/inventory/page';

// Core Components
export { InventoryOverview } from './inventory-overview';
export { StockOutputManagement } from './stock-output-management';
export { FIFOManagement } from './fifo-management';
export { ConsumptionAnalytics } from './consumption-analytics';
export { StockTransfers } from './stock-transfers';
export { InventoryMetrics } from './inventory-metrics';
export { InventoryConfiguration } from './inventory-configuration';

// Component Types
export type {
  InventoryOverviewProps,
  StockOutputManagementProps,
  FIFOManagementProps,
  ConsumptionAnalyticsProps,
  StockTransfersProps,
  InventoryMetricsProps,
  InventoryConfigurationProps
} from './types';

// Re-export inventory lib types for convenience
export type {
  StockItem,
  StockMovement,
  StockOutput,
  StockTransfer,
  FIFOBatch,
  ConsumptionAnalytics,
  ConsumptionForecast,
  EfficiencyOpportunity,
  InventoryMetrics,
  StockAlert,
  ConfigurationSettings,
  AlertRule,
  AutomationRule,
  TransferRequest
} from '@/lib/inventory';

// Component groups for easier importing
export const InventoryComponents = {
  Overview: InventoryOverview,
  StockOutput: StockOutputManagement,
  FIFO: FIFOManagement,
  Analytics: ConsumptionAnalytics,
  Transfers: StockTransfers,
  Metrics: InventoryMetrics,
  Configuration: InventoryConfiguration
} as const;

export const InventoryManagementComponents = {
  StockOutput: StockOutputManagement,
  FIFO: FIFOManagement,
  Transfers: StockTransfers
} as const;

export const InventoryAnalyticsComponents = {
  Overview: InventoryOverview,
  Analytics: ConsumptionAnalytics,
  Metrics: InventoryMetrics
} as const;

export const InventoryConfigComponents = {
  Configuration: InventoryConfiguration
} as const;
