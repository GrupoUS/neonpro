// Executive Dashboard Types

// Core Dashboard Types
export interface DashboardConfig {
  clinicId: string;
  userId: string;
  dateRange: DateRange;
  filters: DashboardFilters;
  realTimeEnabled: boolean;
  refreshInterval: number;
  theme?: 'light' | 'dark' | 'auto';
  timezone?: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardFilters {
  categories: string[];
  departments: string[];
  providers: string[];
  patientTypes: string[];
  locations?: string[];
  services?: string[];
  insuranceTypes?: string[];
}

// Widget Types
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  config: WidgetConfig;
  visible: boolean;
  locked: boolean;
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  resizable?: boolean;
  draggable?: boolean;
  refreshInterval?: number;
  lastUpdated?: Date;
}

export type WidgetType = 
  | 'metric' 
  | 'chart' 
  | 'kpi' 
  | 'alert' 
  | 'summary' 
  | 'table' 
  | 'gauge' 
  | 'progress' 
  | 'calendar' 
  | 'map';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  [key: string]: any;
  dataSource?: string;
  refreshInterval?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  interactive?: boolean;
  exportable?: boolean;
}

// KPI Types
export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target?: number;
  previousValue?: number;
  unit: string;
  format: ValueFormat;
  trend: TrendDirection;
  status: KPIStatus;
  category: string;
  description?: string;
  calculation?: string;
  benchmark?: number;
  threshold?: KPIThreshold;
  lastUpdated: Date;
}

export type ValueFormat = 
  | 'number' 
  | 'currency' 
  | 'percentage' 
  | 'duration' 
  | 'bytes' 
  | 'decimal' 
  | 'integer';

export type TrendDirection = 'up' | 'down' | 'stable' | 'unknown';

export type KPIStatus = 
  | 'excellent' 
  | 'good' 
  | 'warning' 
  | 'critical' 
  | 'unknown';

export interface KPIThreshold {
  excellent: { min?: number; max?: number };
  good: { min?: number; max?: number };
  warning: { min?: number; max?: number };
  critical: { min?: number; max?: number };
}

// Alert Types
export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
  actions?: AlertAction[];
}

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface AlertAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'dropdown';
  action: string;
  params?: Record<string, any>;
  icon?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

// Chart Types
export interface ChartConfig {
  type: ChartType;
  dataSource: string;
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
  series?: ChartSeries[];
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  animated?: boolean;
  responsive?: boolean;
  timeRange?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy?: string;
}

export type ChartType = 
  | 'line' 
  | 'area' 
  | 'bar' 
  | 'column' 
  | 'pie' 
  | 'donut' 
  | 'scatter' 
  | 'bubble' 
  | 'heatmap' 
  | 'gauge' 
  | 'funnel';

export interface ChartAxis {
  label?: string;
  type?: 'category' | 'value' | 'time' | 'log';
  min?: number;
  max?: number;
  format?: string;
  rotation?: number;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: ChartType;
  yAxisIndex?: number;
}

export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

// Performance Metrics
export interface PerformanceMetric {
  id: string;
  name: string;
  category: string;
  value: number;
  target?: number;
  benchmark?: number;
  previousValue?: number;
  unit: string;
  format: ValueFormat;
  trend: TrendDirection;
  status: KPIStatus;
  description?: string;
  calculation?: string;
  period: string;
  lastUpdated: Date;
  history?: PerformanceDataPoint[];
}

export interface PerformanceDataPoint {
  date: Date;
  value: number;
  target?: number;
  benchmark?: number;
}

export interface PerformanceSummary {
  totalMetrics: number;
  excellentCount: number;
  goodCount: number;
  warningCount: number;
  criticalCount: number;
  averageScore: number;
  trendDirection: TrendDirection;
  lastUpdated: Date;
}

// Executive Summary Types
export interface ExecutiveSummaryData {
  keyMetrics: KeyMetric[];
  insights: Insight[];
  recommendations: Recommendation[];
  alerts: Alert[];
  achievements: Achievement[];
  trends: TrendAnalysis[];
  financialSummary: FinancialSummary;
  operationalSummary: OperationalSummary;
  clinicalSummary: ClinicalSummary;
  period: DateRange;
  generatedAt: Date;
}

export interface KeyMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit: string;
  format: ValueFormat;
  trend: TrendDirection;
  status: KPIStatus;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  source: string;
  relatedMetrics: string[];
  timestamp: Date;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: string;
  actions: RecommendationAction[];
  relatedMetrics: string[];
  expectedOutcome?: string;
  roi?: number;
}

export interface RecommendationAction {
  id: string;
  title: string;
  description: string;
  type: 'immediate' | 'short_term' | 'long_term';
  assignee?: string;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'milestone' | 'improvement' | 'goal_achieved' | 'benchmark_exceeded';
  value?: number;
  unit?: string;
  date: Date;
  relatedMetrics: string[];
}

export interface TrendAnalysis {
  id: string;
  metric: string;
  direction: TrendDirection;
  strength: 'strong' | 'moderate' | 'weak';
  duration: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  forecast?: TrendForecast;
}

export interface TrendForecast {
  nextPeriod: number;
  confidence: number;
  range: { min: number; max: number };
  factors: string[];
}

export interface FinancialSummary {
  revenue: {
    current: number;
    previous: number;
    target: number;
    trend: TrendDirection;
  };
  expenses: {
    current: number;
    previous: number;
    budget: number;
    trend: TrendDirection;
  };
  profit: {
    current: number;
    previous: number;
    target: number;
    margin: number;
  };
  collections: {
    rate: number;
    amount: number;
    outstanding: number;
  };
  topServices: ServiceRevenue[];
  topProviders: ProviderRevenue[];
}

export interface ServiceRevenue {
  service: string;
  revenue: number;
  volume: number;
  avgPrice: number;
  trend: TrendDirection;
}

export interface ProviderRevenue {
  provider: string;
  revenue: number;
  patients: number;
  avgRevenue: number;
  trend: TrendDirection;
}

export interface OperationalSummary {
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShows: number;
    utilizationRate: number;
  };
  efficiency: {
    avgWaitTime: number;
    avgVisitDuration: number;
    roomUtilization: number;
    staffUtilization: number;
  };
  capacity: {
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    utilizationRate: number;
  };
  quality: {
    patientSatisfaction: number;
    complaintRate: number;
    resolutionTime: number;
  };
}

export interface ClinicalSummary {
  patients: {
    total: number;
    new: number;
    returning: number;
    demographics: PatientDemographics;
  };
  outcomes: {
    treatmentSuccess: number;
    complicationRate: number;
    readmissionRate: number;
    mortalityRate: number;
  };
  quality: {
    adherenceRate: number;
    protocolCompliance: number;
    safetyScore: number;
  };
  topDiagnoses: DiagnosisStats[];
  topProcedures: ProcedureStats[];
}

export interface PatientDemographics {
  ageGroups: { group: string; count: number; percentage: number }[];
  gender: { male: number; female: number; other: number };
  insurance: { type: string; count: number; percentage: number }[];
  geography: { region: string; count: number; percentage: number }[];
}

export interface DiagnosisStats {
  diagnosis: string;
  code: string;
  count: number;
  percentage: number;
  avgCost: number;
  avgDuration: number;
}

export interface ProcedureStats {
  procedure: string;
  code: string;
  count: number;
  percentage: number;
  avgCost: number;
  avgDuration: number;
  successRate: number;
}

// Report Types
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: ReportType;
  format: ReportFormat;
  sections: ReportSection[];
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  recipients?: string[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportType = 
  | 'executive' 
  | 'financial' 
  | 'operational' 
  | 'clinical' 
  | 'quality' 
  | 'compliance' 
  | 'custom';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html';

export interface ReportSection {
  id: string;
  name: string;
  type: 'summary' | 'metrics' | 'chart' | 'table' | 'text' | 'image';
  config: Record<string, any>;
  order: number;
  visible: boolean;
}

export interface ReportParameter {
  id: string;
  name: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'text' | 'number' | 'boolean';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: { value: any; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  time: string; // HH:mm format
  timezone: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  format: ReportFormat;
  parameters: Record<string, any>;
  status: 'generating' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  fileUrl?: string;
  fileSize?: number;
  generatedBy: string;
  generatedAt: Date;
  expiresAt?: Date;
  error?: string;
}

// Dashboard Layout Types
export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  breakpoints: LayoutBreakpoints;
  isDefault: boolean;
  isShared: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayoutBreakpoints {
  lg: WidgetPosition[];
  md: WidgetPosition[];
  sm: WidgetPosition[];
  xs: WidgetPosition[];
  xxs: WidgetPosition[];
}

// Real-time Update Types
export interface RealTimeConfig {
  enabled: boolean;
  interval: number;
  channels: string[];
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface RealTimeUpdate {
  type: 'metric' | 'alert' | 'widget' | 'dashboard';
  id: string;
  data: any;
  timestamp: Date;
  source: string;
}

// Export Configuration
export interface ExportConfig {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeCharts: boolean;
  includeData: boolean;
  includeMetadata: boolean;
  dateRange?: DateRange;
  filters?: DashboardFilters;
  compression?: 'none' | 'zip' | 'gzip';
}

// Error Types
export interface DashboardError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: Date;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    timestamp: Date;
  };
}

// Dashboard State Types
export interface DashboardState {
  config: DashboardConfig;
  data: any;
  widgets: DashboardWidget[];
  kpis: KPIMetric[];
  alerts: Alert[];
  layout: DashboardLayout;
  isLoading: boolean;
  error: DashboardError | null;
  lastUpdated: Date | null;
  realTimeEnabled: boolean;
  autoRefresh: boolean;
}

export interface DashboardActions {
  loadData: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  addWidget: (widget: DashboardWidget) => void;
  removeWidget: (widgetId: string) => void;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  updateConfig: (config: Partial<DashboardConfig>) => void;
  exportData: (config: ExportConfig) => Promise<string>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
}

// Component Props Types
export interface DashboardComponentProps {
  clinicId: string;
  userId?: string;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showHeader?: boolean;
  showFilters?: boolean;
  defaultTab?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface WidgetComponentProps {
  widget: DashboardWidget;
  data?: any;
  isLoading?: boolean;
  error?: string | null;
  onUpdate?: (updates: Partial<DashboardWidget>) => void;
  onRemove?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export interface ChartComponentProps {
  id: string;
  title: string;
  type: ChartType;
  data?: ChartDataPoint[];
  config?: Partial<ChartConfig>;
  isLoading?: boolean;
  error?: string | null;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  className?: string;
}

export interface MetricComponentProps {
  metric: KPIMetric;
  showTrend?: boolean;
  showTarget?: boolean;
  showBenchmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  onClick?: () => void;
  className?: string;
}