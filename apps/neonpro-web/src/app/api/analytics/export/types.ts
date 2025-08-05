// Export Types and Interfaces
export type ExportFormat = "csv" | "excel" | "pdf" | "json";
export type ExportType = "cohort" | "forecast" | "insights" | "dashboard" | "realtime";

export interface ExportOptions {
  format: ExportFormat;
  type: ExportType;
  title?: string;
  includeCharts?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
  orientation?: "portrait" | "landscape";
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  compression?: boolean;
  password?: string;
}

export interface ExportResponse {
  success: boolean;
  data?: any;
  filename?: string;
  contentType?: string;
  size?: number;
  downloadUrl?: string;
  error?: string;
}

// Cohort Data Structures
export interface CohortMetric {
  cohortId: string;
  period: string | number;
  totalUsers: number;
  retentionRate: number;
  revenue: number;
  churnRate: number;
  timestamp?: string;
}

export interface CohortData {
  metrics: CohortMetric[];
  insights?: string[];
  statistics?: {
    averageRetention: number;
    bestCohort: string;
    worstCohort: string;
    trend: string;
  };
  heatmapData?: any[];
}

// Forecast Data Structures
export interface ForecastPrediction {
  date: string;
  value: number;
  lowerBound?: number;
  upperBound?: number;
  confidence?: number;
}

export interface ForecastData {
  model: string;
  predictions: ForecastPrediction[];
  evaluation?: {
    mape: number;
    rmse: number;
    r2: number;
    accuracy: number;
  };
  scenarios?: Record<
    string,
    {
      description: string;
      impact: string;
      probability: number;
    }
  >;
}

// Insights Data Structures
export interface Correlation {
  metric1: string;
  metric2: string;
  correlation: number;
  significance: string;
  strength: string;
  interpretation?: string;
}

export interface Anomaly {
  metric: string;
  timestamp: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  explanation?: string;
}

export interface Prediction {
  metric: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  factors?: string[];
  reasoning?: string;
}

export interface InsightsData {
  correlations?: Correlation[];
  anomalies?: Anomaly[];
  predictions?: Prediction[];
  recommendations?: Array<
    | string
    | {
        text: string;
        impact: string;
        effort: string;
      }
  >;
}

// Dashboard Data Structures
export interface DashboardKPIs {
  activeSubscriptions?: number;
  monthlyRecurringRevenue?: number;
  trialConversions?: number;
  churnRate?: number;
  newSignups?: number;
  conversionRate?: number;
  averageRevenuePerUser?: number;
  customerLifetimeValue?: number;
  [key: string]: any;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  cohorts?: CohortData[];
  forecasts?: ForecastData[];
  insights?: string[];
  lastUpdated?: string;
}

// Realtime Data Structures
export interface RealtimeMetrics {
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  trialConversions: number;
  churnRate: number;
  newSignups: number;
  timestamp: string;
}

export interface RealtimeData {
  metrics: RealtimeMetrics;
  alerts?: Array<{
    type: string;
    message: string;
    severity: string;
    timestamp: string;
  }>;
  events?: Array<{
    event: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
}

// API Request/Response Types
export interface ExportRequest {
  format: ExportFormat;
  type: ExportType;
  options?: Partial<ExportOptions>;
  data?: any; // Optional override data
}

export interface ExportErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface ExportSuccessResponse {
  success: true;
  filename: string;
  contentType: string;
  size: number;
  downloadUrl?: string;
  metadata?: {
    generated: string;
    format: ExportFormat;
    type: ExportType;
    recordCount?: number;
    compression?: boolean;
  };
}

// Validation Schemas (for runtime validation)
export const SUPPORTED_FORMATS: ExportFormat[] = ["csv", "excel", "pdf", "json"];
export const SUPPORTED_TYPES: ExportType[] = [
  "cohort",
  "forecast",
  "insights",
  "dashboard",
  "realtime",
];

export const CONTENT_TYPES: Record<ExportFormat, string> = {
  csv: "text/csv",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
  json: "application/json",
};

export const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  csv: ".csv",
  excel: ".xlsx",
  pdf: ".pdf",
  json: ".json",
};

// Default Export Options
export const DEFAULT_EXPORT_OPTIONS: Partial<ExportOptions> = {
  includeHeader: true,
  includeFooter: true,
  orientation: "portrait",
  compression: false,
};

// Error Codes
export enum ExportErrorCode {
  INVALID_FORMAT = "INVALID_FORMAT",
  INVALID_TYPE = "INVALID_TYPE",
  MISSING_DATA = "MISSING_DATA",
  GENERATION_FAILED = "GENERATION_FAILED",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  UNAUTHORIZED = "UNAUTHORIZED",
  RATE_LIMITED = "RATE_LIMITED",
  SERVER_ERROR = "SERVER_ERROR",
}

// Utility Types
export type ExportHandler = (data: any, options: ExportOptions) => Buffer | string;
export type ValidationResult = { valid: true } | { valid: false; errors: string[] };

// Function Type Definitions
export interface ExportGenerators {
  csv: {
    cohort: (data: CohortData) => string;
    forecast: (data: ForecastData) => string;
    insights: (data: InsightsData) => string;
    dashboard: (data: DashboardData) => string;
    realtime: (data: RealtimeData) => string;
  };
  excel: {
    cohort: (data: CohortData, options: ExportOptions) => Buffer;
    forecast: (data: ForecastData, options: ExportOptions) => Buffer;
    insights: (data: InsightsData, options: ExportOptions) => Buffer;
    dashboard: (data: DashboardData, options: ExportOptions) => Buffer;
    realtime: (data: RealtimeData, options: ExportOptions) => Buffer;
  };
  pdf: {
    cohort: (data: CohortData, options: ExportOptions) => Buffer;
    forecast: (data: ForecastData, options: ExportOptions) => Buffer;
    insights: (data: InsightsData, options: ExportOptions) => Buffer;
    dashboard: (data: DashboardData, options: ExportOptions) => Buffer;
    realtime: (data: RealtimeData, options: ExportOptions) => Buffer;
  };
  json: {
    cohort: (data: CohortData) => string;
    forecast: (data: ForecastData) => string;
    insights: (data: InsightsData) => string;
    dashboard: (data: DashboardData) => string;
    realtime: (data: RealtimeData) => string;
  };
}

// Validation Functions Type
export interface ExportValidators {
  validateFormat: (format: string) => ValidationResult;
  validateType: (type: string) => ValidationResult;
  validateOptions: (options: any) => ValidationResult;
  validateData: (data: any, type: ExportType) => ValidationResult;
}

// Service Layer Types
export interface ExportService {
  generateExport: (request: ExportRequest) => Promise<ExportSuccessResponse>;
  validateRequest: (request: ExportRequest) => ValidationResult;
  getExportHistory: (userId: string) => Promise<ExportHistory[]>;
  cleanupExpiredExports: () => Promise<number>;
}

export interface ExportHistory {
  id: string;
  userId: string;
  format: ExportFormat;
  type: ExportType;
  filename: string;
  size: number;
  createdAt: string;
  expiresAt: string;
  downloadCount: number;
  status: "pending" | "completed" | "failed" | "expired";
}

// Analytics Data Source Types
export interface AnalyticsDataSource {
  getCohortData: (options?: any) => Promise<CohortData>;
  getForecastData: (options?: any) => Promise<ForecastData>;
  getInsightsData: (options?: any) => Promise<InsightsData>;
  getDashboardData: (options?: any) => Promise<DashboardData>;
  getRealtimeData: (options?: any) => Promise<RealtimeData>;
}

// Configuration Types
export interface ExportConfig {
  maxFileSize: number; // in bytes
  allowedFormats: ExportFormat[];
  allowedTypes: ExportType[];
  rateLimit: {
    maxExportsPerHour: number;
    maxExportsPerDay: number;
  };
  storage: {
    provider: "local" | "s3" | "gcs";
    bucket?: string;
    ttl: number; // Time to live in seconds
  };
  security: {
    requireAuth: boolean;
    allowedRoles: string[];
    encryptionEnabled: boolean;
  };
}
