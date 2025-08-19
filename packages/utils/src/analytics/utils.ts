import { format, isValid, parseISO, subDays } from 'date-fns';

/**
 * Format currency values with proper locale formatting
 */
export function formatAnalyticsCurrency(
  amount: number,
  currency = 'USD',
  precision = 2
): string {
  if (
    !amount ||
    Number.isNaN(amount) ||
    amount === null ||
    amount === undefined
  ) {
    return '$0.00';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  return formatter.format(amount);
}

/**
 * Format percentage values
 */
export function formatAnalyticsPercentage(
  value: number,
  precision = 2
): string {
  if (!value || Number.isNaN(value) || !Number.isFinite(value)) {
    return '0.00%';
  }

  return `${(value * 100).toFixed(precision)}%`;
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowthRate(previous: number, current: number): number {
  if (Number.isNaN(current) || Number.isNaN(previous)) {
    return Number.NaN;
  }

  if (previous === 0) {
    return current === 0 ? 0 : Number.POSITIVE_INFINITY;
  }

  if (current === 0) {
    return -1; // Complete loss = -100% decline
  }

  return (current - previous) / previous;
}

/**
 * Calculate churn rate
 */
export function calculateChurnRate(
  churned: number,
  startCustomers: number
): number {
  if (Number.isNaN(churned) || Number.isNaN(startCustomers)) {
    return Number.NaN;
  }

  if (churned < 0) {
    return 0;
  }

  if (startCustomers === 0) {
    return 0;
  }

  return churned / startCustomers;
}

/**
 * Calculate Customer Lifetime Value (LTV)
 */
export function calculateLTV(arpu: number, churnRate: number): number {
  if (Number.isNaN(arpu) || Number.isNaN(churnRate)) {
    return Number.NaN;
  }

  if (arpu < 0) {
    return 0;
  }

  if (churnRate === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return arpu / churnRate;
}

/**
 * Calculate Monthly Recurring Revenue (MRR)
 */
export function calculateMRR(subscriptions: any[]): number {
  if (!Array.isArray(subscriptions)) {
    return 0;
  }

  return subscriptions
    .filter(
      (sub) =>
        sub &&
        sub.status === 'active' &&
        typeof sub.amount === 'number' &&
        !Number.isNaN(sub.amount) &&
        Number.isFinite(sub.amount)
    )
    .reduce((total, sub) => total + sub.amount / 100, 0); // Convert from cents
}

/**
 * Calculate Annual Recurring Revenue (ARR)
 */
export function calculateARR(mrr: number): number {
  return mrr * 12;
}

// Removed local date utility functions to avoid conflicts with date-fns imports

/**
 * Aggregate metrics by period
 */
export function aggregateMetricsByPeriod<T>(
  data: T[],
  period: 'day' | 'week' | 'month',
  aggregationFn: (items: T[]) => number
): Array<{ period: string; value: number }> {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const formatString = period === 'month' ? 'MMM yyyy' : 'yyyy-MM-dd';

  // Simple groupBy implementation instead of lodash
  const grouped: Record<string, T[]> = {};
  for (const item of data) {
    // Parse date properly to avoid timezone issues
    const dateStr = (item as any).date;
    let date: Date;

    // For YYYY-MM-DD format, parse as local date to match test expectations
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      date = new Date(year, month - 1, day); // Local date
    } else {
      date = new Date(dateStr);
    }

    const key = format(date, formatString);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  }

  // Sort results by period chronologically
  const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
    // For month format like "Jan 2024", sort chronologically
    if (formatString === 'MMM yyyy') {
      const monthOrder = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const yearDiff = Number.parseInt(yearA, 10) - Number.parseInt(yearB, 10);
      if (yearDiff !== 0) {
        return yearDiff;
      }
      return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
    }
    // For date format, sort as strings (ISO format sorts correctly)
    return a.localeCompare(b);
  });

  return sortedEntries.map(([period, items]) => ({
    period,
    value: aggregationFn(items),
  }));
}

/**
 * Generate date range
 */
export function generateDateRange(start: Date, end: Date): Date[] {
  if (start > end) {
    throw new Error('Start date must be before or equal to end date');
  }

  const dates: Date[] = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Validate date range
 */
export function validateDateRange(start: Date, end: Date): boolean {
  if (!(isValid(start) && isValid(end))) {
    return false;
  }

  return start <= end;
}

/**
 * Parse analytics filters from URL parameters
 */
export function parseAnalyticsFilters(params: URLSearchParams): {
  period: string;
  metric: string;
  startDate: Date;
  endDate: Date;
  groupBy?: string;
  filters: Record<string, string>;
} {
  const period = params.get('period') || 'last_30_days';
  const metric = params.get('metric') || 'all';
  const startDateStr = params.get('start_date');
  const endDateStr = params.get('end_date');
  const groupBy = params.get('group_by') || undefined;

  // Validate period and metric
  const validPeriods = ['last_7_days', 'last_30_days', 'last_month', 'custom'];
  const validMetrics = ['all', 'subscriptions', 'revenue', 'users'];

  if (!(validPeriods.includes(period) && validMetrics.includes(metric))) {
    throw new Error('Invalid filter parameters');
  }

  // Parse dates
  let startDate: Date;
  let endDate: Date;

  if (startDateStr && endDateStr) {
    // Ensure UTC dates by appending 'T00:00:00.000Z' if no time is specified
    const startISO = startDateStr.includes('T')
      ? startDateStr
      : `${startDateStr}T00:00:00.000Z`;
    const endISO = endDateStr.includes('T')
      ? endDateStr
      : `${endDateStr}T00:00:00.000Z`;

    startDate = parseISO(startISO);
    endDate = parseISO(endISO);

    if (!(isValid(startDate) && isValid(endDate))) {
      throw new Error('Invalid filter parameters');
    }
  } else {
    // Default to last 30 days
    endDate = new Date();
    startDate = subDays(endDate, 30);
  }

  // Parse additional filters
  const filters: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith('filter[') && key.endsWith(']')) {
      const filterKey = key.slice(7, -1);
      filters[filterKey] = value;
    }
  }

  return {
    period,
    metric,
    startDate,
    endDate,
    groupBy,
    filters,
  };
}

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: any[],
  _filename: string,
  _options?: { filename?: string; includeTimestamp?: boolean }
): string {
  const XLSX = require('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(data);
  return XLSX.utils.sheet_to_csv(worksheet);
}

/**
 * Export data to PDF format
 */
export function exportToPDF(
  data: any[],
  title: string,
  _options?: { title?: string; fontSize?: number; margins?: any }
): string {
  const jsPDF = require('jspdf').default;
  const doc = new jsPDF();

  // Add title
  doc.text(title, 20, 20);

  // Add data (simplified implementation)
  data.forEach((item, index) => {
    if (index > 50) {
      // Pagination check
      doc.addPage();
    }
    doc.text(JSON.stringify(item), 20, 30 + index * 10);
  });

  return doc.output();
}

/**
 * Export data to Excel format
 */
export function exportToExcel(
  data: any,
  _filename: string,
  _options?: { formatting?: any }
): string {
  const XLSX = require('xlsx');
  const workbook = XLSX.utils.book_new();

  if (Array.isArray(data)) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  } else {
    // Multiple sheets
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const worksheet = XLSX.utils.json_to_sheet(sheetData as any[]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
  }

  return XLSX.write(workbook, { type: 'binary' });
}
