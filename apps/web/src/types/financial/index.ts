/**
 * Financial Dashboard Type Definitions
 * Enhanced TypeScript types for financial data safety and LGPD compliance
 */

// Currency handling with Brazilian Real support
export type Currency = "BRL" | "USD" | "EUR";

export interface MonetaryValue {
  readonly amount: number;
  readonly currency: Currency;
  readonly formatted?: string;
}

// Financial metrics for dashboard
export interface FinancialMetrics {
  readonly id: string;
  readonly period: DatePeriod;
  readonly mrr: MonetaryValue; // Monthly Recurring Revenue
  readonly arr: MonetaryValue; // Annual Recurring Revenue
  readonly churnRate: number; // Percentage (0-100)
  readonly customerCount: number;
  readonly averageTicket: MonetaryValue;
  readonly growth: GrowthMetrics;
  readonly updatedAt: Date;
}

export interface GrowthMetrics {
  readonly mrrGrowth: number; // Percentage
  readonly customerGrowth: number; // Percentage
  readonly periodComparison: "month" | "quarter" | "year";
}

export interface DatePeriod {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly label: string; // Human-readable label
}

// Chart data types for Recharts integration
export interface ChartDataPoint {
  readonly date: string; // ISO date string
  readonly value: number;
  readonly formatted?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface MRRChartData extends ChartDataPoint {
  readonly mrr: number;
  readonly previousMrr?: number;
  readonly growth?: number;
}

export interface ChurnChartData extends ChartDataPoint {
  readonly churnRate: number;
  readonly customersLost: number;
  readonly customersRetained: number;
}

export interface RevenueSegmentData {
  readonly segment: string;
  readonly value: number;
  readonly percentage: number;
  readonly color: string;
}

// Dashboard state management
export interface DashboardState {
  readonly selectedPeriod: DatePeriod;
  readonly metrics: FinancialMetrics | null;
  readonly chartData: {
    readonly mrr: MRRChartData[];
    readonly churn: ChurnChartData[];
    readonly segments: RevenueSegmentData[];
  };
  readonly filters: DashboardFilters;
  readonly loading: boolean;
  readonly error: string | null;
}

export interface DashboardFilters {
  readonly dateRange: DatePeriod;
  readonly clinicIds?: readonly string[];
  readonly serviceTypes?: readonly string[];
  readonly comparisonPeriod?: DatePeriod;
}

// API response types with LGPD compliance
export interface FinancialAPIResponse<T> {
  readonly data: T;
  readonly metadata: ResponseMetadata;
  readonly audit: AuditInfo;
}

export interface ResponseMetadata {
  readonly requestId: string;
  readonly timestamp: Date;
  readonly version: string;
  readonly cached: boolean;
}

export interface AuditInfo {
  readonly userId: string;
  readonly action: string;
  readonly lgpdConsent: boolean;
  readonly dataAccess: readonly string[];
}

// Export options
export interface ExportOptions {
  readonly format: "PDF" | "Excel" | "CSV";
  readonly period: DatePeriod;
  readonly includeCharts: boolean;
  readonly clinicBranding: boolean;
  readonly complianceLevel: "summary" | "detailed" | "full";
}

// Error types for financial operations
export class FinancialDataError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "FinancialDataError";
  }
}

export class LGPDComplianceError extends Error {
  constructor(
    message: string,
    public readonly violation: string,
    public readonly requiredConsent?: readonly string[],
  ) {
    super(message);
    this.name = "LGPDComplianceError";
  }
}

// Type guards for runtime validation
export function isMonetaryValue(value: unknown): value is MonetaryValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "amount" in value &&
    "currency" in value &&
    typeof (value as MonetaryValue).amount === "number" &&
    typeof (value as MonetaryValue).currency === "string"
  );
}

export function isFinancialMetrics(value: unknown): value is FinancialMetrics {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "mrr" in value &&
    "arr" in value &&
    isMonetaryValue((value as FinancialMetrics).mrr) &&
    isMonetaryValue((value as FinancialMetrics).arr)
  );
}

// Utility types for strict typing
export type StrictFinancialData<T> = {
  readonly [K in keyof T]: T[K] extends number
    ? T[K] extends infer U
      ? U extends number
        ? number & { readonly __brand: "FinancialNumber" }
        : T[K]
      : never
    : T[K];
};

export type LGPDCompliantData<T> = T & {
  readonly __lgpdConsent: true;
  readonly __auditTrail: readonly string[];
};
