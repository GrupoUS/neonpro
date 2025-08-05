// Financial KPI Dashboard Types

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target?: number;
  change: number;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
  format: "currency" | "percentage" | "number";
  category: "revenue" | "profitability" | "efficiency" | "growth";
  description?: string;
  unit?: string;
  precision?: number;
}

export interface KPIAlert {
  id: string;
  kpiId: string;
  type: "target_missed" | "trend_negative" | "threshold_exceeded" | "anomaly_detected";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionRequired: boolean;
  suggestedActions?: string[];
}

export interface KPIBenchmark {
  id: string;
  kpiId: string;
  industry: string;
  segment: string;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  source: string;
  lastUpdated: Date;
}

export interface KPIForecast {
  id: string;
  kpiId: string;
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  predictions: {
    date: Date;
    value: number;
    confidence: number;
    lowerBound: number;
    upperBound: number;
  }[];
  model: string;
  accuracy: number;
  lastUpdated: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
  preset: string;
}

export interface KPIFilter {
  dateRange: DateRange;
  services: string[];
  providers: string[];
  locations: string[];
  patientSegments: string[];
  compareWithPrevious?: boolean;
  comparisonPeriod?: DateRange;
}

export interface KPIWidget {
  id: string;
  kpiId: string;
  type: "metric" | "chart" | "table" | "gauge";
  size: "small" | "medium" | "large";
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: {
    showTrend?: boolean;
    showTarget?: boolean;
    showComparison?: boolean;
    chartType?: "line" | "bar" | "area" | "pie";
    timeframe?: string;
    customTitle?: string;
  };
  isVisible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: KPIWidget[];
  filters: KPIFilter;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FinancialData {
  // Revenue metrics
  totalRevenue: number;
  recurringRevenue: number;
  newPatientRevenue: number;
  averageTicket: number;
  revenuePerProvider: number;
  revenuePerLocation: number;

  // Profitability metrics
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  ebitda: number;
  ebitdaMargin: number;

  // Cash flow metrics
  operatingCashFlow: number;
  freeCashFlow: number;
  cashPosition: number;
  accountsReceivable: number;
  accountsPayable: number;

  // Efficiency metrics
  costPerAcquisition: number;
  lifetimeValue: number;
  paybackPeriod: number;
  utilizationRate: number;

  // Growth metrics
  revenueGrowthRate: number;
  patientGrowthRate: number;
  marketShare: number;

  // Operational metrics
  appointmentValue: number;
  conversionRate: number;
  retentionRate: number;
  churnRate: number;
}

export interface ServiceMetrics {
  id: string;
  name: string;
  category: string;
  revenue: number;
  sessions: number;
  averagePrice: number;
  margin: number;
  growth: number;
  popularity: number;
  seasonality: number[];
}

export interface ProviderMetrics {
  id: string;
  name: string;
  specialization: string;
  revenue: number;
  patients: number;
  sessions: number;
  averageTicket: number;
  utilization: number;
  satisfaction: number;
  efficiency: number;
}

export interface LocationMetrics {
  id: string;
  name: string;
  address: string;
  revenue: number;
  patients: number;
  capacity: number;
  utilization: number;
  profitability: number;
  growth: number;
}

export interface PatientSegmentMetrics {
  id: string;
  name: string;
  count: number;
  revenue: number;
  averageTicket: number;
  frequency: number;
  retention: number;
  acquisition: number;
  lifetime: number;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: "summary" | "detailed" | "comparative" | "forecast";
  period: DateRange;
  data: FinancialData;
  services: ServiceMetrics[];
  providers: ProviderMetrics[];
  locations: LocationMetrics[];
  segments: PatientSegmentMetrics[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ExportOptions {
  format: "pdf" | "excel" | "csv" | "json";
  includeCharts: boolean;
  includeRawData: boolean;
  includeComparisons: boolean;
  customFields?: string[];
  template?: string;
}

export interface ShareOptions {
  recipients: string[];
  message?: string;
  includeLink: boolean;
  expiresAt?: Date;
  permissions: "view" | "comment" | "edit";
}

export interface KPIConfiguration {
  id: string;
  name: string;
  formula: string;
  dataSource: string;
  updateFrequency: "realtime" | "hourly" | "daily" | "weekly";
  thresholds: {
    critical: number;
    warning: number;
    good: number;
  };
  targets: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    quarterly?: number;
    yearly?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrillDownData {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  category: string;
  subcategory?: string;
  details: Record<string, any>;
  children?: DrillDownData[];
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  target?: number;
  previous?: number;
  forecast?: number;
  confidence?: number;
}

export interface ChartConfiguration {
  type: "line" | "bar" | "area" | "pie" | "gauge" | "table";
  title: string;
  subtitle?: string;
  xAxis: {
    label: string;
    type: "category" | "datetime" | "numeric";
    format?: string;
  };
  yAxis: {
    label: string;
    format: "currency" | "percentage" | "number";
    min?: number;
    max?: number;
  };
  series: {
    name: string;
    dataKey: string;
    color: string;
    type?: "line" | "bar" | "area";
  }[];
  legend: boolean;
  grid: boolean;
  tooltip: boolean;
  zoom: boolean;
  responsive: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  kpiId: string;
  condition: {
    operator: "gt" | "lt" | "eq" | "gte" | "lte" | "between";
    value: number | [number, number];
    duration?: number; // minutes
  };
  severity: "low" | "medium" | "high" | "critical";
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    webhook?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  defaultLayout: string;
  defaultFilters: KPIFilter;
  favoriteKPIs: string[];
  alertSettings: {
    email: boolean;
    push: boolean;
    frequency: "immediate" | "hourly" | "daily";
  };
  displaySettings: {
    currency: string;
    dateFormat: string;
    numberFormat: string;
    timezone: string;
  };
  updatedAt: Date;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  dataFreshness: Date;
  cacheHitRate: number;
  errorRate: number;
  userSatisfaction: number;
}

// API Response Types
export interface KPIResponse {
  success: boolean;
  data: KPIMetric[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastUpdated: Date;
  };
  performance: PerformanceMetrics;
}

export interface AlertResponse {
  success: boolean;
  data: KPIAlert[];
  meta: {
    total: number;
    unread: number;
    critical: number;
  };
}

export interface ReportResponse {
  success: boolean;
  data: FinancialReport;
  downloadUrl?: string;
  expiresAt?: Date;
}

// Utility Types
export type KPIStatus = "good" | "warning" | "critical";
export type TrendDirection = "up" | "down" | "stable";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type ChartType = "line" | "bar" | "area" | "pie" | "gauge" | "table";
export type WidgetSize = "small" | "medium" | "large";
export type ExportFormat = "pdf" | "excel" | "csv" | "json";
export type UpdateFrequency = "realtime" | "hourly" | "daily" | "weekly";
export type TimePeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

// Event Types
export interface KPIEvent {
  type: "kpi_updated" | "alert_triggered" | "threshold_exceeded" | "target_achieved";
  kpiId: string;
  timestamp: Date;
  data: any;
  userId?: string;
}

export interface DashboardEvent {
  type: "layout_changed" | "filter_applied" | "widget_added" | "widget_removed";
  dashboardId: string;
  timestamp: Date;
  data: any;
  userId: string;
}

// Hook Return Types
export interface UseFinancialKPIsReturn {
  kpis: KPIMetric[];
  alerts: KPIAlert[];
  benchmarks: KPIBenchmark[];
  forecasts: KPIForecast[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  updateFilters: (filters: Partial<KPIFilter>) => void;
  markAlertAsRead: (alertId: string) => void;
  exportData: (options: ExportOptions) => Promise<string>;
  shareReport: (options: ShareOptions) => Promise<void>;
}

export interface UseDashboardLayoutReturn {
  layout: DashboardLayout;
  widgets: KPIWidget[];
  isLoading: boolean;
  error: string | null;
  updateLayout: (layout: Partial<DashboardLayout>) => void;
  addWidget: (widget: Omit<KPIWidget, "id">) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<KPIWidget>) => void;
  saveLayout: () => Promise<void>;
  loadLayout: (layoutId: string) => Promise<void>;
}

// Component Props Types
export interface KPICardProps {
  kpi: KPIMetric;
  size?: WidgetSize;
  showTrend?: boolean;
  showTarget?: boolean;
  onClick?: (kpi: KPIMetric) => void;
  className?: string;
}

export interface KPIChartProps {
  data: TimeSeriesPoint[];
  config: ChartConfiguration;
  height?: number;
  isLoading?: boolean;
  className?: string;
}

export interface KPITableProps {
  data: DrillDownData[];
  columns: string[];
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  className?: string;
}

export interface AlertPanelProps {
  alerts: KPIAlert[];
  onAlertClick?: (alert: KPIAlert) => void;
  onMarkAsRead?: (alertId: string) => void;
  showFilters?: boolean;
  className?: string;
}

export interface FilterPanelProps {
  filters: KPIFilter;
  onFiltersChange: (filters: Partial<KPIFilter>) => void;
  availableOptions: {
    services: { id: string; name: string }[];
    providers: { id: string; name: string }[];
    locations: { id: string; name: string }[];
    segments: { id: string; name: string }[];
  };
  className?: string;
}

export interface DrillDownProps {
  kpi: KPIMetric;
  data: DrillDownData[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Error Types
export interface KPIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Configuration Types
export interface DashboardConfig {
  refreshInterval: number;
  maxAlerts: number;
  defaultDateRange: string;
  enableRealtime: boolean;
  enableNotifications: boolean;
  theme: "light" | "dark" | "auto";
  locale: string;
  currency: string;
}

export interface APIConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  cacheTimeout: number;
  enableMocking: boolean;
}
