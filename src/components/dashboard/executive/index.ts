/**
 * Executive Dashboard Components
 * 
 * Centralized exports for all executive dashboard components
 * and related utilities.
 */

// Main Dashboard Component
export { ExecutiveDashboard } from './ExecutiveDashboard';
export { default as ExecutiveDashboardDefault } from './ExecutiveDashboard';

// Individual Components
export { KPICard } from './KPICard';
export { default as KPICardDefault } from './KPICard';

export { ChartWidget } from './ChartWidget';
export { default as ChartWidgetDefault } from './ChartWidget';

export { AlertPanel } from './AlertPanel';
export { default as AlertPanelDefault } from './AlertPanel';

export { ReportGenerator } from './ReportGenerator';
export { default as ReportGeneratorDefault } from './ReportGenerator';

// Re-export types for convenience
export type {
  ExecutiveDashboard as ExecutiveDashboardType,
  DashboardLayout,
  DashboardWidget,
  KPIMetric,
  DataSourceConfig,
  DashboardAlert,
  DashboardReport,
  DashboardFilters,
  DashboardPermissions,
  ReportTemplate,
  ReportSchedule,
  AlertSeverity,
  AlertCategory,
  WidgetType,
  KPICategory,
  ChartType,
  TimeRange,
  DashboardTheme
} from '@/lib/dashboard/types';
