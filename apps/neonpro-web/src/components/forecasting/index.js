"use strict";
/**
 * Forecasting Components Index
 * Epic 11 - Story 11.1: Centralized exports for demand forecasting components
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastingComponents = exports.ForecastConfiguration = exports.ForecastAlerts = exports.ModelPerformance = exports.ResourceAllocation = exports.ForecastMetrics = exports.ForecastChart = void 0;
// Main forecasting components
var forecast_chart_1 = require("./forecast-chart");
Object.defineProperty(exports, "ForecastChart", { enumerable: true, get: function () { return forecast_chart_1.ForecastChart; } });
var forecast_metrics_1 = require("./forecast-metrics");
Object.defineProperty(exports, "ForecastMetrics", { enumerable: true, get: function () { return forecast_metrics_1.ForecastMetrics; } });
var resource_allocation_1 = require("./resource-allocation");
Object.defineProperty(exports, "ResourceAllocation", { enumerable: true, get: function () { return resource_allocation_1.ResourceAllocation; } });
var model_performance_1 = require("./model-performance");
Object.defineProperty(exports, "ModelPerformance", { enumerable: true, get: function () { return model_performance_1.ModelPerformance; } });
var forecast_alerts_1 = require("./forecast-alerts");
Object.defineProperty(exports, "ForecastAlerts", { enumerable: true, get: function () { return forecast_alerts_1.ForecastAlerts; } });
var forecast_configuration_1 = require("./forecast-configuration");
Object.defineProperty(exports, "ForecastConfiguration", { enumerable: true, get: function () { return forecast_configuration_1.ForecastConfiguration; } });
// Export all components as a single object for convenient importing
exports.ForecastingComponents = require("./index");
