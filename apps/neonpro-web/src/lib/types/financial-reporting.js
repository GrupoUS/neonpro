"use strict";
// =====================================================================================
// Advanced Financial Reporting Types
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.FINANCIAL_CONSTANTS =
  exports.DASHBOARD_REFRESH_INTERVALS =
  exports.FREQUENCY_TYPES =
  exports.ALERT_STATUS =
  exports.PERIOD_TYPES =
  exports.KPI_UNIT_TYPES =
  exports.REPORT_STATUS =
  exports.REPORT_FORMATS =
  exports.REPORT_TYPES =
    void 0;
// Core reporting enums and constants
exports.REPORT_TYPES = {
  PROFIT_LOSS: "profit_loss",
  BALANCE_SHEET: "balance_sheet",
  CASH_FLOW: "cash_flow",
  REVENUE_ANALYSIS: "revenue_analysis",
  EXPENSE_ANALYSIS: "expense_analysis",
  EXECUTIVE_SUMMARY: "executive_summary",
  SERVICE_PROFITABILITY: "service_profitability",
  PROVIDER_PERFORMANCE: "provider_performance",
};
exports.REPORT_FORMATS = {
  PDF: "pdf",
  EXCEL: "excel",
  CSV: "csv",
  JSON: "json",
};
exports.REPORT_STATUS = {
  GENERATING: "generating",
  GENERATED: "generated",
  FAILED: "failed",
  ARCHIVED: "archived",
};
exports.KPI_UNIT_TYPES = {
  CURRENCY: "currency",
  PERCENTAGE: "percentage",
  NUMBER: "number",
  RATIO: "ratio",
};
exports.PERIOD_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
  YEARLY: "yearly",
};
exports.ALERT_STATUS = {
  NORMAL: "normal",
  WARNING: "warning",
  CRITICAL: "critical",
};
exports.FREQUENCY_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
};
exports.DASHBOARD_REFRESH_INTERVALS = {
  REAL_TIME: 5000, // 5 seconds
  FREQUENT: 30000, // 30 seconds
  NORMAL: 60000, // 1 minute
  SLOW: 300000, // 5 minutes
  MANUAL: 0, // No auto refresh
};
// Constants for financial calculations
exports.FINANCIAL_CONSTANTS = {
  BRAZILIAN_TAX_RATES: {
    ISS: 0.05, // 5% typical ISS rate
    PIS: 0.0165, // 1.65% PIS rate
    COFINS: 0.076, // 7.6% COFINS rate
    IRPJ: 0.15, // 15% IRPJ base rate
    CSLL: 0.09, // 9% CSLL rate
  },
  CURRENCY: {
    DEFAULT: "BRL",
    SYMBOL: "R$",
    DECIMAL_PLACES: 2,
  },
  PERFORMANCE_THRESHOLDS: {
    DASHBOARD_LOAD_TIME_MS: 1000, // <1s load time requirement
    REPORT_GENERATION_TIME_MS: 3000, // <3s for standard reports
    REAL_TIME_UPDATE_INTERVAL_MS: 30000, // 30s real-time updates
  },
};
