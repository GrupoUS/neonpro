// Analytics Types - NeonPro Healthcare Platform
// Type-safe definitions for analytics and retention data

export interface RetentionMetric {
  clinicId: string;
  date: string;
  newPatients: number;
  returningPatients: number;
  retentionRate: number;
  totalPatients: number;
}

export interface RetentionPrediction {
  patientId: string;
  clinicId: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  factors: string[];
  recommendations: string[];
  confidence: number;
  lastVisit: string;
  nextPredictedVisit?: string;
}

export interface RetentionStrategy {
  id: string;
  clinicId: string;
  name: string;
  description: string;
  targetSegment: string;
  effectiveness: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface DatabaseRow {
  [key: string]: any;
}

// Type guards for runtime validation
export function isRetentionMetric(obj: unknown): obj is RetentionMetric {
  return (
    typeof obj === "object"
    && obj !== null
    && typeof (obj as RetentionMetric).clinicId === "string"
    && typeof (obj as RetentionMetric).date === "string"
    && typeof (obj as RetentionMetric).newPatients === "number"
    && typeof (obj as RetentionMetric).returningPatients === "number"
    && typeof (obj as RetentionMetric).retentionRate === "number"
    && typeof (obj as RetentionMetric).totalPatients === "number"
  );
}

export function isRetentionPrediction(obj: unknown): obj is RetentionPrediction {
  return (
    typeof obj === "object"
    && obj !== null
    && typeof (obj as RetentionPrediction).patientId === "string"
    && typeof (obj as RetentionPrediction).clinicId === "string"
    && typeof (obj as RetentionPrediction).riskScore === "number"
    && ["low", "medium", "high"].includes((obj as RetentionPrediction).riskLevel)
    && Array.isArray((obj as RetentionPrediction).factors)
    && Array.isArray((obj as RetentionPrediction).recommendations)
    && typeof (obj as RetentionPrediction).confidence === "number"
    && typeof (obj as RetentionPrediction).lastVisit === "string"
  );
}

export function isRetentionStrategy(obj: unknown): obj is RetentionStrategy {
  return (
    typeof obj === "object"
    && obj !== null
    && typeof (obj as RetentionStrategy).id === "string"
    && typeof (obj as RetentionStrategy).clinicId === "string"
    && typeof (obj as RetentionStrategy).name === "string"
    && typeof (obj as RetentionStrategy).description === "string"
    && typeof (obj as RetentionStrategy).targetSegment === "string"
    && typeof (obj as RetentionStrategy).effectiveness === "number"
    && typeof (obj as RetentionStrategy).isActive === "boolean"
    && typeof (obj as RetentionStrategy).createdAt === "string"
    && typeof (obj as RetentionStrategy).updatedAt === "string"
  );
}

// Helper functions for array validation
export function isArrayOfRetentionMetrics(arr: unknown[]): arr is RetentionMetric[] {
  return arr.every(isRetentionMetric);
}

export function isArrayOfRetentionPredictions(arr: unknown[]): arr is RetentionPrediction[] {
  return arr.every(isRetentionPrediction);
}

export function isArrayOfRetentionStrategies(arr: unknown[]): arr is RetentionStrategy[] {
  return arr.every(isRetentionStrategy);
}

// Safe parsing utilities
export function safeParseNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return defaultValue;
}

export function safeParseDate(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date().toISOString();
}
