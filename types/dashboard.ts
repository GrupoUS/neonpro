// Dashboard Executive System Types

// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  clinicId: string;
}

// Dashboard Layout Types
export interface DashboardLayout extends BaseEntity {
  name: string;
  description?: string;
  isDefault: boolean;
  layoutConfig: LayoutConfiguration;
  createdBy: string;
}

export interface LayoutConfiguration {
  grid: {
    columns: number;
    rows: number;
    gap: number;
  };
  widgets: WidgetPosition[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  responsive?: {
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
  };
}

export interface WidgetPosition {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

// Widget Types
export interface Widget extends BaseEntity {
  layoutId: string;
  title: string;
  type: WidgetType;
  category: WidgetCategory;
  dataSource: string;
  configuration: WidgetConfiguration;
  position: WidgetPosition;
  refreshInterval: number; // in seconds
  cacheDuration: number; // in seconds
  isActive: boolean;
  createdBy: string;
}

export type WidgetType =
  | "chart"
  | "table"
  | "metric"
  | "gauge"
  | "progress"
  | "list"
  | "calendar"
  | "map"
  | "iframe"
  | "custom";

export type WidgetCategory =
  | "kpi"
  | "financial"
  | "operational"
  | "patients"
  | "staff"
  | "quality"
  | "compliance"
  | "analytics";

export interface WidgetConfiguration {
  chartType?: ChartType;
  dataQuery?: string;
  filters?: WidgetFilter[];
  formatting?: WidgetFormatting;
  display?: WidgetDisplay;
  interactions?: WidgetInteraction[];
  customProps?: Record<string, any>;
}

export type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "doughnut"
  | "area"
  | "scatter"
  | "radar"
  | "polar"
  | "bubble"
  | "heatmap";

export interface WidgetFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_equal"
  | "less_equal"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "in"
  | "not_in"
  | "between"
  | "is_null"
  | "is_not_null";

export interface WidgetFormatting {
  numberFormat?: {
    style: "decimal" | "currency" | "percent";
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  };
  dateFormat?: string;
  colorScheme?: string[];
  conditionalFormatting?: ConditionalFormat[];
}

export interface ConditionalFormat {
  condition: {
    field: string;
    operator: FilterOperator;
    value: any;
  };
  style: {
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: string;
    icon?: string;
  };
}

export interface WidgetDisplay {
  showTitle?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltips?: boolean;
  showLabels?: boolean;
  orientation?: "horizontal" | "vertical";
  animation?: boolean;
  responsive?: boolean;
}

export interface WidgetInteraction {
  type: "click" | "hover" | "select";
  action: "drill_down" | "filter" | "navigate" | "modal" | "custom";
  target?: string;
  parameters?: Record<string, any>;
}

// Widget Data Types
export interface WidgetData {
  widgetId: string;
  data: any;
  metadata: {
    lastUpdated: string;
    recordCount: number;
    executionTime: number;
    cacheHit: boolean;
  };
  error?: string;
}

export interface WidgetCache extends BaseEntity {
  widgetId: string;
  data: any;
  expiresAt: string;
  size: number;
}

// KPI Types
export interface KPIDefinition extends BaseEntity {
  name: string;
  description?: string;
  category: KPICategory;
  formula: string;
  dataSource: string;
  format: KPIFormat;
  target?: number;
  thresholds?: KPIThreshold[];
  isActive: boolean;
  calculationMethod: "real_time" | "scheduled" | "on_demand";
  refreshInterval?: number;
  tags?: string[];
}

export type KPICategory =
  | "financial"
  | "operational"
  | "quality"
  | "patient_satisfaction"
  | "staff_performance"
  | "compliance"
  | "efficiency"
  | "growth";

export type KPIFormat = "number" | "currency" | "percentage" | "duration" | "ratio" | "score";

export interface KPIThreshold {
  name: string;
  operator: FilterOperator;
  value: number;
  color: string;
  severity: "info" | "warning" | "critical";
}

export interface KPIValue extends BaseEntity {
  kpiId: string;
  value: number;
  period: {
    start: string;
    end: string;
  };
  calculatedAt: string;
  trend?: number; // percentage change from previous period
  metadata?: {
    dataPoints: number;
    confidence: number;
    factors?: Record<string, any>;
  };
}

// Alert Types
export interface AlertRule extends BaseEntity {
  name: string;
  description?: string;
  type: AlertType;
  condition: AlertCondition;
  severity: AlertSeverity;
  isActive: boolean;
  recipients: AlertRecipient[];
  throttle?: {
    enabled: boolean;
    interval: number; // in minutes
    maxAlerts: number;
  };
  schedule?: {
    enabled: boolean;
    timezone: string;
    activeHours: {
      start: string;
      end: string;
    };
    activeDays: number[]; // 0-6, Sunday-Saturday
  };
  createdBy: string;
}

export type AlertType = "threshold" | "anomaly" | "trend" | "data_quality" | "system" | "custom";

export interface AlertCondition {
  kpiId?: string;
  metric?: string;
  operator: FilterOperator;
  value: any;
  timeWindow?: {
    duration: number; // in minutes
    aggregation: "avg" | "sum" | "min" | "max" | "count";
  };
  customQuery?: string;
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertRecipient {
  type: "email" | "sms" | "webhook" | "in_app";
  address: string;
  name?: string;
}

export interface AlertInstance extends BaseEntity {
  ruleId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  data?: any;
  metadata?: {
    triggerValue: any;
    threshold: any;
    context?: Record<string, any>;
  };
}

export type AlertStatus = "active" | "acknowledged" | "resolved" | "suppressed";

export interface AlertNotification extends BaseEntity {
  alertId: string;
  recipient: AlertRecipient;
  status: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  retryCount: number;
}

export type NotificationStatus = "pending" | "sent" | "delivered" | "failed" | "cancelled";

// Report Types
export interface ReportTemplate extends BaseEntity {
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  template: ReportTemplateConfig;
  parameters: ReportParameter[];
  isActive: boolean;
  isPublic: boolean;
  createdBy: string;
  tags?: string[];
}

export type ReportType =
  | "executive_summary"
  | "financial"
  | "operational"
  | "clinical"
  | "compliance"
  | "custom";

export type ReportCategory =
  | "dashboard"
  | "analytics"
  | "regulatory"
  | "management"
  | "operational";

export interface ReportTemplateConfig {
  layout: {
    orientation: "portrait" | "landscape";
    pageSize: "A4" | "A3" | "letter" | "legal";
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  sections: ReportSection[];
  styling: {
    fonts: {
      primary: string;
      secondary: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logo?: string;
  };
}

export interface ReportSection {
  id: string;
  type: "header" | "footer" | "content" | "chart" | "table" | "kpi" | "text";
  title?: string;
  content?: any;
  dataSource?: string;
  configuration?: any;
  order: number;
  pageBreak?: "before" | "after" | "avoid";
}

export interface ReportParameter {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "boolean" | "select" | "multiselect";
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validation?: {
    min?: any;
    max?: any;
    pattern?: string;
  };
}

export interface ReportSchedule extends BaseEntity {
  templateId: string;
  name: string;
  description?: string;
  schedule: {
    frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    interval: number;
    dayOfWeek?: number; // 0-6, Sunday-Saturday
    dayOfMonth?: number; // 1-31
    time: string; // HH:mm format
    timezone: string;
  };
  parameters: Record<string, any>;
  format: ReportFormat;
  recipients: ReportRecipient[];
  isActive: boolean;
  nextRun?: string;
  lastRun?: string;
  createdBy: string;
}

export type ReportFormat = "pdf" | "excel" | "csv" | "html" | "json";

export interface ReportRecipient {
  type: "email" | "ftp" | "sftp" | "s3" | "webhook";
  address: string;
  name?: string;
  configuration?: Record<string, any>;
}

export interface ReportInstance extends BaseEntity {
  templateId: string;
  scheduleId?: string;
  name: string;
  format: ReportFormat;
  status: ReportStatus;
  parameters: Record<string, any>;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: string;
  generatedBy: string;
  metadata?: {
    executionTime: number;
    recordCount: number;
    pageCount?: number;
  };
}

export type ReportStatus = "pending" | "generating" | "completed" | "failed" | "cancelled";

// Dashboard Filters
export interface DashboardFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  department?: string;
  service?: string;
  provider?: string;
  location?: string;
  customFilters?: Record<string, any>;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  metadata: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    totalPages: number;
  };
}

// Service Interfaces
export interface DashboardService {
  getLayouts(): Promise<DashboardLayout[]>;
  getLayout(id: string): Promise<DashboardLayout>;
  createLayout(
    layout: Omit<DashboardLayout, "id" | "createdAt" | "updatedAt">,
  ): Promise<DashboardLayout>;
  updateLayout(id: string, layout: Partial<DashboardLayout>): Promise<DashboardLayout>;
  deleteLayout(id: string): Promise<void>;
}

export interface WidgetService {
  getWidgets(layoutId?: string): Promise<Widget[]>;
  getWidget(id: string): Promise<Widget>;
  getWidgetData(id: string, filters?: DashboardFilters): Promise<WidgetData>;
  createWidget(widget: Omit<Widget, "id" | "createdAt" | "updatedAt">): Promise<Widget>;
  updateWidget(id: string, widget: Partial<Widget>): Promise<Widget>;
  deleteWidget(id: string): Promise<void>;
  refreshWidget(id: string): Promise<WidgetData>;
}

export interface KPIService {
  getDefinitions(): Promise<KPIDefinition[]>;
  getDefinition(id: string): Promise<KPIDefinition>;
  getValues(kpiId: string, period?: { start: Date; end: Date }): Promise<KPIValue[]>;
  calculateKPI(kpiId: string, period: { start: Date; end: Date }): Promise<KPIValue>;
  createDefinition(
    definition: Omit<KPIDefinition, "id" | "createdAt" | "updatedAt">,
  ): Promise<KPIDefinition>;
  updateDefinition(id: string, definition: Partial<KPIDefinition>): Promise<KPIDefinition>;
  deleteDefinition(id: string): Promise<void>;
}

export interface AlertService {
  getRules(): Promise<AlertRule[]>;
  getRule(id: string): Promise<AlertRule>;
  getInstances(filters?: {
    status?: AlertStatus;
    severity?: AlertSeverity;
  }): Promise<AlertInstance[]>;
  createRule(rule: Omit<AlertRule, "id" | "createdAt" | "updatedAt">): Promise<AlertRule>;
  updateRule(id: string, rule: Partial<AlertRule>): Promise<AlertRule>;
  deleteRule(id: string): Promise<void>;
  acknowledgeAlert(id: string): Promise<AlertInstance>;
  resolveAlert(id: string): Promise<AlertInstance>;
}

export interface ReportService {
  getTemplates(): Promise<ReportTemplate[]>;
  getTemplate(id: string): Promise<ReportTemplate>;
  getSchedules(): Promise<ReportSchedule[]>;
  getInstances(filters?: { status?: ReportStatus; templateId?: string }): Promise<ReportInstance[]>;
  generateReport(
    templateId: string,
    parameters: Record<string, any>,
    format: ReportFormat,
  ): Promise<ReportInstance>;
  createTemplate(
    template: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReportTemplate>;
  createSchedule(
    schedule: Omit<ReportSchedule, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReportSchedule>;
  downloadReport(instanceId: string): Promise<Blob>;
}
