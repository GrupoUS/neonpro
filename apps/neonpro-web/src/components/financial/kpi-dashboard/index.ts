// Main Components
export { default as FinancialKPIDashboard } from "./FinancialKPIDashboard";
export { default as KPIFilters } from "./KPIFilters";
export { default as KPIDrillDown } from "./KPIDrillDown";

// Hooks
export { default as useFinancialKPIs } from "./hooks/useFinancialKPIs";

// Services
export {
  FinancialKPIService,
  SupabaseKPIService,
  PerformanceService,
} from "./services";

// Types
export type {
  KPIMetric,
  KPIAlert,
  KPIBenchmark,
  KPIForecast,
  DateRange,
  KPIFilter,
  KPIWidget,
  DashboardLayout,
  FinancialData,
  ServiceMetrics,
  ProviderMetrics,
  LocationMetrics,
  PatientSegmentMetrics,
  FinancialReport,
  ExportOptions,
  ShareOptions,
  KPIConfiguration,
  DrillDownData,
  TimeSeriesPoint,
  ChartConfiguration,
  AlertRule,
  UserPreferences,
  PerformanceMetrics,
  APIResponse,
  APIError,
  PaginatedResponse,
  SortOrder,
  FilterOperator,
  KPIStatus,
  KPITrend,
  AlertSeverity,
  ChartType,
  ExportFormat,
  SharePermission,
  WidgetSize,
  DashboardTheme,
  NotificationSettings,
  SecuritySettings,
  AuditLog,
  SystemHealth,
  DataQuality,
  ComplianceStatus,
  BackupStatus,
  IntegrationStatus,
  UtilityTypes,
  EventTypes,
  HookReturnTypes,
  ComponentProps,
  ErrorTypes,
  ConfigTypes,
} from "./types";

// Utilities
export {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatDate,
  formatDateRange,
  calculateTrend,
  calculatePercentageChange,
  calculateGrowthRate,
  calculateCAGR,
  calculateMovingAverage,
  getKPIStatus,
  getKPIStatusColor,
  getTrendColor,
  getDateRangePreset,
  sortKPIs,
  filterAlerts,
  generateMockTimeSeries,
  calculateStatistics,
  detectAnomalies,
  calculateCorrelation,
} from "./utils";

// Configuration
export {
  DASHBOARD_CONFIG,
  API_CONFIG,
  CHART_COLORS,
  CHART_PALETTES,
  KPI_THRESHOLDS,
  DEFAULT_KPI_CONFIGS,
  DEFAULT_CHART_CONFIGS,
  DEFAULT_ALERT_RULES,
  WIDGET_SIZES,
  EXPORT_FORMATS,
  DATE_RANGE_PRESETS,
  PERFORMANCE_BENCHMARKS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  API_ENDPOINTS,
  CACHE_KEYS,
  STORAGE_KEYS,
  ANIMATIONS,
} from "./config";

// Re-export default configuration
export { default as config } from "./config";
export { default as services } from "./services";

// Component Props Types for easier importing
export type FinancialKPIDashboardProps = {
  className?: string;
  initialFilters?: Partial<KPIFilter>;
  enableRealtime?: boolean;
  enableExport?: boolean;
  enableSharing?: boolean;
  customWidgets?: KPIWidget[];
  onFilterChange?: (filters: KPIFilter) => void;
  onExport?: (options: ExportOptions) => void;
  onShare?: (options: ShareOptions) => void;
};

export type KPIFiltersProps = {
  filters: KPIFilter;
  onFiltersChange: (filters: KPIFilter) => void;
  className?: string;
  enablePresets?: boolean;
  enableCustomDateRange?: boolean;
  availableServices?: string[];
  availableProviders?: string[];
  availableLocations?: string[];
};

export type KPIDrillDownProps = {
  kpi: KPIMetric;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  enableExport?: boolean;
  enableComparison?: boolean;
};

// Hook Props Types
export type UseFinancialKPIsProps = {
  initialFilters?: Partial<KPIFilter>;
  enableRealtime?: boolean;
  refreshInterval?: number;
  enableCaching?: boolean;
};

// Utility function to create a complete KPI dashboard setup
export const createKPIDashboard = ({
  containerId,
  initialFilters = {},
  enableRealtime = true,
  enableExport = true,
  enableSharing = true,
  customConfig = {},
}: {
  containerId: string;
  initialFilters?: Partial<KPIFilter>;
  enableRealtime?: boolean;
  enableExport?: boolean;
  enableSharing?: boolean;
  customConfig?: Partial<typeof DASHBOARD_CONFIG>;
}) => {
  // Merge custom configuration
  const config = {
    ...DASHBOARD_CONFIG,
    ...customConfig,
  };

  return {
    containerId,
    config,
    props: {
      initialFilters,
      enableRealtime,
      enableExport,
      enableSharing,
    },
  };
};

// Utility function to validate KPI configuration
export const validateKPIConfig = (config: Partial<KPIConfiguration>): boolean => {
  const required = ["id", "name", "formula", "dataSource"];
  return required.every((field) => field in config && config[field as keyof KPIConfiguration]);
};

// Utility function to create custom alert rules
export const createAlertRule = ({
  kpiId,
  name,
  condition,
  severity = "warning",
  notifications = { email: true, sms: false, push: true },
}: {
  kpiId: string;
  name: string;
  condition: AlertRule["condition"];
  severity?: AlertSeverity;
  notifications?: AlertRule["notifications"];
}): AlertRule => {
  return {
    id: `alert-${Date.now()}`,
    name,
    kpiId,
    condition,
    severity,
    notifications,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Utility function to create custom chart configuration
export const createChartConfig = ({
  type,
  title,
  subtitle,
  xAxisLabel,
  yAxisLabel,
  series,
  colors = CHART_COLORS,
}: {
  type: ChartType;
  title: string;
  subtitle?: string;
  xAxisLabel: string;
  yAxisLabel: string;
  series: ChartConfiguration["series"];
  colors?: typeof CHART_COLORS;
}): ChartConfiguration => {
  return {
    type,
    title,
    subtitle,
    xAxis: {
      label: xAxisLabel,
      type: type === "pie" ? "category" : "datetime",
    },
    yAxis: {
      label: yAxisLabel,
      format: yAxisLabel.includes("R$")
        ? "currency"
        : yAxisLabel.includes("%")
          ? "percentage"
          : "number",
    },
    series,
    legend: true,
    grid: type !== "pie",
    tooltip: true,
    zoom: type === "line",
    responsive: true,
  };
};

// Version information
export const VERSION = "1.0.0";
export const BUILD_DATE = new Date().toISOString();

// Feature detection
export const FEATURES = {
  REALTIME_UPDATES: typeof WebSocket !== "undefined",
  LOCAL_STORAGE: typeof localStorage !== "undefined",
  NOTIFICATIONS: typeof Notification !== "undefined",
  PERFORMANCE_API: typeof performance !== "undefined",
  INTERSECTION_OBSERVER: typeof IntersectionObserver !== "undefined",
};

// Browser compatibility check
export const checkBrowserCompatibility = (): {
  isCompatible: boolean;
  missingFeatures: string[];
} => {
  const requiredFeatures = {
    "ES6 Modules": typeof window !== "undefined" && "modules" in HTMLScriptElement.prototype,
    "Fetch API": typeof fetch !== "undefined",
    Promise: typeof Promise !== "undefined",
    "Local Storage": typeof localStorage !== "undefined",
  };

  const missingFeatures = Object.entries(requiredFeatures)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  return {
    isCompatible: missingFeatures.length === 0,
    missingFeatures,
  };
};

// Debug utilities (only in development)
if (process.env.NODE_ENV === "development") {
  (window as any).KPIDashboardDebug = {
    config: DASHBOARD_CONFIG,
    services: { FinancialKPIService, SupabaseKPIService, PerformanceService },
    utils: { formatCurrency, formatPercentage, calculateTrend },
    features: FEATURES,
    version: VERSION,
  };
}

// Default export for convenience
export default {
  FinancialKPIDashboard,
  KPIFilters,
  KPIDrillDown,
  useFinancialKPIs,
  FinancialKPIService,
  SupabaseKPIService,
  PerformanceService,
  config: DASHBOARD_CONFIG,
  version: VERSION,
};
