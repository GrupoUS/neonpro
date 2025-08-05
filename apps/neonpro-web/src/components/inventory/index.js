/**
 * Story 11.3: Inventory Components Index
 * Central export point for all inventory-related components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryConfigComponents =
  exports.InventoryAnalyticsComponents =
  exports.InventoryManagementComponents =
  exports.InventoryComponents =
  exports.InventoryConfiguration =
  exports.InventoryMetrics =
  exports.StockTransfers =
  exports.ConsumptionAnalytics =
  exports.FIFOManagement =
  exports.StockOutputManagement =
  exports.InventoryOverview =
  exports.InventoryPage =
    void 0;
// Main Dashboard Page
var page_1 = require("../app/(dashboard)/inventory/page");
Object.defineProperty(exports, "InventoryPage", {
  enumerable: true,
  get: () => page_1.default,
});
// Core Components
var inventory_overview_1 = require("./inventory-overview");
Object.defineProperty(exports, "InventoryOverview", {
  enumerable: true,
  get: () => inventory_overview_1.InventoryOverview,
});
var stock_output_management_1 = require("./stock-output-management");
Object.defineProperty(exports, "StockOutputManagement", {
  enumerable: true,
  get: () => stock_output_management_1.StockOutputManagement,
});
var fifo_management_1 = require("./fifo-management");
Object.defineProperty(exports, "FIFOManagement", {
  enumerable: true,
  get: () => fifo_management_1.FIFOManagement,
});
var consumption_analytics_1 = require("./consumption-analytics");
Object.defineProperty(exports, "ConsumptionAnalytics", {
  enumerable: true,
  get: () => consumption_analytics_1.ConsumptionAnalytics,
});
var stock_transfers_1 = require("./stock-transfers");
Object.defineProperty(exports, "StockTransfers", {
  enumerable: true,
  get: () => stock_transfers_1.StockTransfers,
});
var inventory_metrics_1 = require("./inventory-metrics");
Object.defineProperty(exports, "InventoryMetrics", {
  enumerable: true,
  get: () => inventory_metrics_1.InventoryMetrics,
});
var inventory_configuration_1 = require("./inventory-configuration");
Object.defineProperty(exports, "InventoryConfiguration", {
  enumerable: true,
  get: () => inventory_configuration_1.InventoryConfiguration,
});
// Component groups for easier importing
exports.InventoryComponents = {
  Overview: InventoryOverview,
  StockOutput: StockOutputManagement,
  FIFO: FIFOManagement,
  Analytics: ConsumptionAnalytics,
  Transfers: StockTransfers,
  Metrics: InventoryMetrics,
  Configuration: InventoryConfiguration,
};
exports.InventoryManagementComponents = {
  StockOutput: StockOutputManagement,
  FIFO: FIFOManagement,
  Transfers: StockTransfers,
};
exports.InventoryAnalyticsComponents = {
  Overview: InventoryOverview,
  Analytics: ConsumptionAnalytics,
  Metrics: InventoryMetrics,
};
exports.InventoryConfigComponents = {
  Configuration: InventoryConfiguration,
};
