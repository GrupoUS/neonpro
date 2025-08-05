"use strict";
/**
 * Story 11.3: Centralized Inventory Module Exports
 * Barrel export file for the Stock Output and Consumption Control System
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryManagers =
  exports.TransferStatus =
  exports.AlertType =
  exports.BatchStatus =
  exports.StockOutputStatus =
  exports.DEFAULT_INVENTORY_CONFIG =
  exports.inventoryIntegrationManager =
  exports.inventoryDashboardProvider =
  exports.inventoryConfigManager =
  exports.InventoryUtils =
  exports.InventoryIntegrationManager =
  exports.InventoryDashboardProvider =
  exports.InventoryConfigManager =
  exports.consumptionAnalyzer =
  exports.ConsumptionAnalyzer =
  exports.fifoManager =
  exports.FIFOManager =
  exports.StockOutputManager =
    void 0;
// Core management classes
var stock_output_management_1 = require("./stock-output-management");
Object.defineProperty(exports, "StockOutputManager", {
  enumerable: true,
  get: function () {
    return stock_output_management_1.StockOutputManager;
  },
});
var fifo_management_1 = require("./fifo-management");
Object.defineProperty(exports, "FIFOManager", {
  enumerable: true,
  get: function () {
    return fifo_management_1.FIFOManager;
  },
});
Object.defineProperty(exports, "fifoManager", {
  enumerable: true,
  get: function () {
    return fifo_management_1.fifoManager;
  },
});
var consumption_analytics_1 = require("./consumption-analytics");
Object.defineProperty(exports, "ConsumptionAnalyzer", {
  enumerable: true,
  get: function () {
    return consumption_analytics_1.ConsumptionAnalyzer;
  },
});
Object.defineProperty(exports, "consumptionAnalyzer", {
  enumerable: true,
  get: function () {
    return consumption_analytics_1.consumptionAnalyzer;
  },
});
// Configuration and utilities
var config_1 = require("./config");
Object.defineProperty(exports, "InventoryConfigManager", {
  enumerable: true,
  get: function () {
    return config_1.InventoryConfigManager;
  },
});
Object.defineProperty(exports, "InventoryDashboardProvider", {
  enumerable: true,
  get: function () {
    return config_1.InventoryDashboardProvider;
  },
});
Object.defineProperty(exports, "InventoryIntegrationManager", {
  enumerable: true,
  get: function () {
    return config_1.InventoryIntegrationManager;
  },
});
Object.defineProperty(exports, "InventoryUtils", {
  enumerable: true,
  get: function () {
    return config_1.InventoryUtils;
  },
});
Object.defineProperty(exports, "inventoryConfigManager", {
  enumerable: true,
  get: function () {
    return config_1.inventoryConfigManager;
  },
});
Object.defineProperty(exports, "inventoryDashboardProvider", {
  enumerable: true,
  get: function () {
    return config_1.inventoryDashboardProvider;
  },
});
Object.defineProperty(exports, "inventoryIntegrationManager", {
  enumerable: true,
  get: function () {
    return config_1.inventoryIntegrationManager;
  },
});
// Constants and enums
var types_1 = require("./types");
Object.defineProperty(exports, "DEFAULT_INVENTORY_CONFIG", {
  enumerable: true,
  get: function () {
    return types_1.DEFAULT_INVENTORY_CONFIG;
  },
});
Object.defineProperty(exports, "StockOutputStatus", {
  enumerable: true,
  get: function () {
    return types_1.StockOutputStatus;
  },
});
Object.defineProperty(exports, "BatchStatus", {
  enumerable: true,
  get: function () {
    return types_1.BatchStatus;
  },
});
Object.defineProperty(exports, "AlertType", {
  enumerable: true,
  get: function () {
    return types_1.AlertType;
  },
});
Object.defineProperty(exports, "TransferStatus", {
  enumerable: true,
  get: function () {
    return types_1.TransferStatus;
  },
});
// Default instances for easy access
exports.inventoryManagers = {
  stockOutput: new StockOutputManager(),
  fifo: fifoManager,
  consumption: consumptionAnalyzer,
  config: inventoryConfigManager,
  dashboard: inventoryDashboardProvider,
  integration: inventoryIntegrationManager,
};
