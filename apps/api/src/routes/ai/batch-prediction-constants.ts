// Constants for batch prediction endpoints
export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  MULTI_STATUS: 207,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const MILLISECONDS_IN_HOUR = 3_600_000;
export const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
export const MILLISECONDS_IN_WEEK = 7 * MILLISECONDS_IN_DAY;
export const MILLISECONDS_IN_MONTH = 30 * MILLISECONDS_IN_DAY;

export const BATCH_LIMITS = {
  DEFAULT_LIMIT: 50,
  MAX_BULK_JOBS: 10,
  MAX_RECENT_JOBS: 10,
} as const;

export const JOB_TEMPLATES = {
  DAILY_MORNING_PREDICTIONS: "daily_morning_predictions",
  HIGH_RISK_INTERVENTION: "high_risk_intervention",
  MONTHLY_RISK_ASSESSMENT: "monthly_risk_assessment",
  WEEKLY_FORECAST: "weekly_forecast",
} as const;

export const JOB_TYPES = {
  DAILY_PREDICTIONS: "daily_predictions",
  INTERVENTION_PLANNING: "intervention_planning",
  RISK_ASSESSMENT: "risk_assessment",
  WEEKLY_FORECAST: "weekly_forecast",
} as const;

export const PRIORITY_LEVELS = ["high", "urgent"] as const;

export const RISK_THRESHOLDS = {
  HIGH: 0.7,
  MEDIUM: 0.3,
} as const;

export const BATCH_SIZES = {
  HIGH_RISK: 50,
  DAILY: 100,
  MONTHLY: 200,
  WEEKLY: 500,
} as const;

export const PRIORITY_VALUES = {
  HIGH: 1,
  MEDIUM: 3,
  LOW: 4,
} as const;

// Additional exports needed by services
export const STATUS_CODES = HTTP_STATUS_CODES;

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Validation error",
  NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Internal server error",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
} as const;

export const JOB_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;
