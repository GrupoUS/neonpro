"use strict";
/**
 * Forecasting System Type Definitions
 * Epic 11 - Story 11.1: Consolidated types for demand forecasting system
 *
 * Comprehensive type definitions for:
 * - Core forecasting types and interfaces
 * - Model management and training types
 * - Resource allocation and optimization types
 * - Configuration and validation types
 * - API request/response types
 * - Database schema types
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_STATUSES =
  exports.PLAN_STATUSES =
  exports.RESOURCE_TYPES =
  exports.OPTIMIZATION_OBJECTIVES =
  exports.SEVERITY_LEVELS =
  exports.ALERT_TYPES =
  exports.MODEL_TYPES =
  exports.FORECAST_TYPES =
    void 0;
/**
 * Enum-like Types
 */
exports.FORECAST_TYPES = {
  APPOINTMENTS: "appointments",
  SERVICE_DEMAND: "service_demand",
  EQUIPMENT_USAGE: "equipment_usage",
  STAFF_WORKLOAD: "staff_workload",
};
exports.MODEL_TYPES = {
  ARIMA: "arima",
  LSTM: "lstm",
  PROPHET: "prophet",
  ENSEMBLE: "ensemble",
  LINEAR_REGRESSION: "linear_regression",
};
exports.ALERT_TYPES = {
  DEMAND_SPIKE: "demand_spike",
  CAPACITY_SHORTAGE: "capacity_shortage",
  RESOURCE_CONSTRAINT: "resource_constraint",
  ACCURACY_DEGRADATION: "accuracy_degradation",
};
exports.SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};
exports.OPTIMIZATION_OBJECTIVES = {
  MINIMIZE_COST: "minimize_cost",
  MAXIMIZE_REVENUE: "maximize_revenue",
  MAXIMIZE_UTILIZATION: "maximize_utilization",
  MINIMIZE_WAIT_TIME: "minimize_wait_time",
  BALANCE_WORKLOAD: "balance_workload",
};
exports.RESOURCE_TYPES = {
  STAFF: "staff",
  EQUIPMENT: "equipment",
  ROOM: "room",
  INVENTORY: "inventory",
};
exports.PLAN_STATUSES = {
  DRAFT: "draft",
  APPROVED: "approved",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};
exports.JOB_STATUSES = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};
