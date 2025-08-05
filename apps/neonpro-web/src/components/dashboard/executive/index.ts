/**
 * Executive Dashboard Components
 *
 * Centralized exports for all executive dashboard components
 * and related utilities.
 */

// Re-export types for convenience
export type {
  AlertCategory,
  AlertSeverity,
  ChartType,
  DashboardAlert,
  DashboardFilters,
  DashboardLayout,
  DashboardPermissions,
  DashboardReport,
  DashboardTheme,
  DashboardWidget,
  DataSourceConfig,
  ExecutiveDashboard as ExecutiveDashboardType,
  KPICategory,
  KPIMetric,
  ReportSchedule,
  ReportTemplate,
  TimeRange,
  WidgetType,
} from "@/lib/dashboard/types";
export { AlertPanel, default as AlertPanelDefault } from "./AlertPanel";
export { ChartWidget, default as ChartWidgetDefault } from "./ChartWidget";
// Main Dashboard Component
export { default as ExecutiveDashboardDefault, ExecutiveDashboard } from "./ExecutiveDashboard";
// Individual Components
export { default as KPICardDefault, KPICard } from "./KPICard";
export { default as ReportGeneratorDefault, ReportGenerator } from "./ReportGenerator";
