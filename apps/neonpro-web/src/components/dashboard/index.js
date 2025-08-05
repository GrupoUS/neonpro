"use strict";
// Dashboard Components Export - STORY-SUB-002 Task 4
// Main export file for all dashboard components
// Created: 2025-01-22
// Updated: 2025-01-23 - Added Stock Alerts and Reports components (Story 11.4)
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.StockPerformanceDashboard = exports.StockReports = exports.StockAlertsManagement = exports.AppointmentManagementDashboard = exports.TrialManagement = exports.ConversionCharts = exports.AnalyticsOverview = exports.Dashboard = void 0;
// Main Dashboard Layout
var dashboard_1 = require("./dashboard");
Object.defineProperty(exports, "Dashboard", { enumerable: true, get: function () { return dashboard_1.Dashboard; } });
// Analytics Components
var analytics_overview_1 = require("./analytics/analytics-overview");
Object.defineProperty(exports, "AnalyticsOverview", { enumerable: true, get: function () { return analytics_overview_1.AnalyticsOverview; } });
var conversion_charts_1 = require("./analytics/conversion-charts");
Object.defineProperty(exports, "ConversionCharts", { enumerable: true, get: function () { return conversion_charts_1.ConversionCharts; } });
// Trial Management Components
var trial_management_1 = require("./trial-management/trial-management");
Object.defineProperty(exports, "TrialManagement", { enumerable: true, get: function () { return trial_management_1.TrialManagement; } });
// Appointment Management Components
var appointment_management_dashboard_1 = require("./appointment-management-dashboard");
Object.defineProperty(exports, "AppointmentManagementDashboard", { enumerable: true, get: function () { return appointment_management_dashboard_1.AppointmentManagementDashboard; } });
// Stock Management Components (Story 11.4)
var stock_alerts_management_1 = require("./stock-alerts-management");
Object.defineProperty(exports, "StockAlertsManagement", { enumerable: true, get: function () { return stock_alerts_management_1.StockAlertsManagement; } });
var stock_reports_1 = require("./stock-reports");
Object.defineProperty(exports, "StockReports", { enumerable: true, get: function () { return stock_reports_1.StockReports; } });
var stock_performance_dashboard_1 = require("./stock-performance-dashboard");
Object.defineProperty(exports, "StockPerformanceDashboard", { enumerable: true, get: function () { return stock_performance_dashboard_1.default; } });
// Default export for main dashboard
var dashboard_2 = require("./dashboard");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return dashboard_2.Dashboard; } });
