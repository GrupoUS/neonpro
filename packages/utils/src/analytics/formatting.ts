/**
 * @file Analytics formatting and export utilities
 */

const PERCENTAGE_MULTIPLIER = 100;
const ZERO = 0;
const DEFAULT_PRECISION = 2;

interface AnalyticsData {
  metadata?: Record<string, unknown>;
  metric: string;
  timestamp: Date;
  value: number;
}

interface ExportOptions {
  dateRange?: {
    end: Date;
    start: Date;
  };
  format: "csv" | "excel" | "pdf";
  includeMetadata?: boolean;
}

interface FilterParams {
  dateRange?: string;
  metric?: string;
  period?: string;
}

/**
 * Format analytics percentage with proper precision
 * @param {number | null | undefined} value Value to format
 * @param {number} precision Decimal precision
 * @returns {string} Formatted percentage string
 */
const formatAnalyticsPercentage = (
  value: number | null | undefined,
  precision = DEFAULT_PRECISION,
): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    if (precision > ZERO) {
      return "0.00%";
    }
    return "0%";
  }
  if (!Number.isFinite(value)) {
    if (precision > ZERO) {
      return "0.00%";
    }
    return "0%";
  }
  return `${(value * PERCENTAGE_MULTIPLIER).toFixed(precision)}%`;
};

/**
 * Parse analytics filter parameters
 * @param {URLSearchParams | Record<string, unknown>} params URL search params or object
 * @returns {FilterParams} Parsed filter parameters
 */
const parseAnalyticsFilters = (
  params: URLSearchParams | Record<string, unknown>,
): FilterParams => {
  const getValue = (key: string, defaultValue?: string) => {
    if (params instanceof URLSearchParams) {
      return params.get(key) || defaultValue;
    }
    return (params[key] as string) || defaultValue;
  };

  const result: FilterParams = {};

  const dateRange = getValue("dateRange");
  if (dateRange) {
    result.dateRange = dateRange;
  }

  const metric = getValue("metric");
  if (metric) {
    result.metric = metric;
  }

  const period = getValue("period");
  if (period) {
    result.period = period;
  }

  return result;
};

/**
 * Export data to CSV format
 * @param {Record<string, unknown>[]} data Data to export
 * @param {string} _filename Export filename
 * @returns {string} CSV formatted string
 */
const exportToCSV = (
  data: Record<string, unknown>[],
  _filename = "export.csv",
): string => {
  if (data.length === ZERO) {
    return "";
  }

  const headers = Object.keys(data[ZERO] ?? {});
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "string") {
            return `"${value}"`;
          }
          return String(value);
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
};

/**
 * Export data to PDF format (placeholder)
 * @param {Record<string, unknown>[]} _data Data to export
 * @param {Record<string, unknown>} _options Export options
 * @returns {string} PDF export message
 */
const exportToPDF = (
  _data: Record<string, unknown>[],
  _options?: Record<string, unknown>,
): string => "PDF export not implemented yet";

export {
  type AnalyticsData,
  type ExportOptions,
  exportToCSV,
  exportToPDF,
  type FilterParams,
  formatAnalyticsPercentage,
  parseAnalyticsFilters,
};
