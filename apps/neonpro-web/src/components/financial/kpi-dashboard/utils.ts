import type {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  addDays,
} from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  KPIMetric,
  KPIAlert,
  FinancialData,
  DateRange,
  TrendDirection,
  KPIStatus,
  TimeSeriesPoint,
  DrillDownData,
} from "./types";

// Currency formatting
export const formatCurrency = (value: number, currency = "BRL"): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Percentage formatting
export const formatPercentage = (value: number, precision = 1): string => {
  return `${value.toFixed(precision)}%`;
};

// Number formatting
export const formatNumber = (value: number, precision = 0): string => {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};

// Compact number formatting (K, M, B)
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};

// Date formatting
export const formatDate = (date: Date, formatStr = "dd/MM/yyyy"): string => {
  return format(date, formatStr, { locale: ptBR });
};

// Relative date formatting
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInDays = differenceInDays(now, date);

  if (diffInDays === 0) return "Hoje";
  if (diffInDays === 1) return "Ontem";
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;

  return `${Math.floor(diffInDays / 365)} anos atrás`;
};

// KPI value formatting based on type
export const formatKPIValue = (kpi: KPIMetric): string => {
  switch (kpi.format) {
    case "currency":
      return formatCurrency(kpi.value);
    case "percentage":
      return formatPercentage(kpi.value, kpi.precision || 1);
    case "number":
      return formatNumber(kpi.value, kpi.precision || 0);
    default:
      return kpi.value.toString();
  }
};

// Calculate trend direction
export const calculateTrend = (current: number, previous: number): TrendDirection => {
  const threshold = 0.01; // 1% threshold for stability
  const change = ((current - previous) / previous) * 100;

  if (Math.abs(change) < threshold) return "stable";
  return change > 0 ? "up" : "down";
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Determine KPI status based on value and thresholds
export const determineKPIStatus = (
  value: number,
  target?: number,
  thresholds?: { critical: number; warning: number; good: number },
): KPIStatus => {
  if (thresholds) {
    if (value <= thresholds.critical) return "critical";
    if (value <= thresholds.warning) return "warning";
    return "good";
  }

  if (target) {
    const achievement = (value / target) * 100;
    if (achievement < 70) return "critical";
    if (achievement < 90) return "warning";
    return "good";
  }

  return "good";
};

// Generate color based on status
export const getStatusColor = (status: KPIStatus): string => {
  switch (status) {
    case "good":
      return "text-green-600";
    case "warning":
      return "text-yellow-600";
    case "critical":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

// Generate background color based on status
export const getStatusBgColor = (status: KPIStatus): string => {
  switch (status) {
    case "good":
      return "bg-green-50 border-green-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "critical":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

// Generate trend color
export const getTrendColor = (trend: TrendDirection, isPositive = true): string => {
  if (trend === "stable") return "text-gray-600";

  const isGoodTrend = (trend === "up" && isPositive) || (trend === "down" && !isPositive);
  return isGoodTrend ? "text-green-600" : "text-red-600";
};

// Calculate moving average
export const calculateMovingAverage = (data: number[], window: number): number[] => {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    const average = subset.reduce((sum, val) => sum + val, 0) / subset.length;
    result.push(average);
  }

  return result;
};

// Calculate growth rate
export const calculateGrowthRate = (current: number, previous: number, periods = 1): number => {
  if (previous === 0) return 0;
  return (Math.pow(current / previous, 1 / periods) - 1) * 100;
};

// Calculate compound annual growth rate (CAGR)
export const calculateCAGR = (endValue: number, startValue: number, years: number): number => {
  if (startValue === 0 || years === 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
};

// Generate date range presets
export const getDateRangePresets = (): { [key: string]: DateRange } => {
  const now = new Date();

  return {
    today: {
      start: now,
      end: now,
      preset: "today",
    },
    yesterday: {
      start: addDays(now, -1),
      end: addDays(now, -1),
      preset: "yesterday",
    },
    "last-7-days": {
      start: addDays(now, -6),
      end: now,
      preset: "last-7-days",
    },
    "last-30-days": {
      start: addDays(now, -29),
      end: now,
      preset: "last-30-days",
    },
    "current-month": {
      start: startOfMonth(now),
      end: endOfMonth(now),
      preset: "current-month",
    },
    "last-month": {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1)),
      preset: "last-month",
    },
  };
};

// Validate date range
export const validateDateRange = (dateRange: DateRange): boolean => {
  return dateRange.start <= dateRange.end;
};

// Calculate date range duration in days
export const getDateRangeDuration = (dateRange: DateRange): number => {
  return differenceInDays(dateRange.end, dateRange.start) + 1;
};

// Generate comparison period
export const getComparisonPeriod = (dateRange: DateRange): DateRange => {
  const duration = getDateRangeDuration(dateRange);
  const comparisonEnd = addDays(dateRange.start, -1);
  const comparisonStart = addDays(comparisonEnd, -duration + 1);

  return {
    start: comparisonStart,
    end: comparisonEnd,
    preset: "comparison",
  };
};

// Sort KPIs by priority
export const sortKPIsByPriority = (kpis: KPIMetric[]): KPIMetric[] => {
  const priorityOrder = { critical: 0, warning: 1, good: 2 };

  return [...kpis].sort((a, b) => {
    // First by status priority
    const statusDiff = priorityOrder[a.status] - priorityOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Then by absolute change (descending)
    return Math.abs(b.change) - Math.abs(a.change);
  });
};

// Filter alerts by severity
export const filterAlertsBySeverity = (
  alerts: KPIAlert[],
  minSeverity: "low" | "medium" | "high" | "critical",
): KPIAlert[] => {
  const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  const minLevel = severityOrder[minSeverity];

  return alerts.filter((alert) => severityOrder[alert.severity] >= minLevel);
};

// Generate mock time series data
export const generateMockTimeSeries = (
  baseValue: number,
  days: number,
  volatility = 0.1,
  trend = 0,
): TimeSeriesPoint[] => {
  const data: TimeSeriesPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(now, -i);
    const trendEffect = (days - i) * trend;
    const randomEffect = (Math.random() - 0.5) * volatility * baseValue;
    const value = baseValue + trendEffect + randomEffect;

    data.push({
      timestamp: date,
      value: Math.max(0, value),
      target: baseValue * 1.1, // 10% above base as target
      previous: baseValue * 0.95, // 5% below base as previous period
    });
  }

  return data;
};

// Calculate statistical measures
export const calculateStatistics = (values: number[]) => {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      variance: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stdDev,
    variance,
  };
};

// Detect anomalies using z-score
export const detectAnomalies = (values: number[], threshold = 2): number[] => {
  const stats = calculateStatistics(values);

  return values
    .map((value, index) => {
      const zScore = Math.abs((value - stats.mean) / stats.stdDev);
      return zScore > threshold ? index : -1;
    })
    .filter((index) => index !== -1);
};

// Calculate correlation between two series
export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

// Generate drill-down hierarchy
export const generateDrillDownHierarchy = (data: DrillDownData[]): DrillDownData[] => {
  const hierarchy: { [key: string]: DrillDownData[] } = {};

  // Group by category
  data.forEach((item) => {
    if (!hierarchy[item.category]) {
      hierarchy[item.category] = [];
    }
    hierarchy[item.category].push(item);
  });

  // Create category nodes with children
  return Object.entries(hierarchy).map(([category, items]) => ({
    id: `category-${category}`,
    label: category,
    value: items.reduce((sum, item) => sum + item.value, 0),
    change: items.reduce((sum, item) => sum + item.change, 0) / items.length,
    trend: "stable" as TrendDirection,
    category,
    details: {
      itemCount: items.length,
      avgValue: items.reduce((sum, item) => sum + item.value, 0) / items.length,
    },
    children: items,
  }));
};

// Export utilities for external use
export const kpiUtils = {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatCompactNumber,
  formatDate,
  formatRelativeDate,
  formatKPIValue,
  calculateTrend,
  calculatePercentageChange,
  determineKPIStatus,
  getStatusColor,
  getStatusBgColor,
  getTrendColor,
  calculateMovingAverage,
  calculateGrowthRate,
  calculateCAGR,
  getDateRangePresets,
  validateDateRange,
  getDateRangeDuration,
  getComparisonPeriod,
  sortKPIsByPriority,
  filterAlertsBySeverity,
  generateMockTimeSeries,
  calculateStatistics,
  detectAnomalies,
  calculateCorrelation,
  generateDrillDownHierarchy,
};

export default kpiUtils;
