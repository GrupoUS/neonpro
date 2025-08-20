/**
 * Analytics Utilities for NeonPro Healthcare System
 * Provides utility functions for analytics and data processing
 */

export interface AnalyticsData {
  timestamp: Date;
  metric: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeMetadata?: boolean;
}

/**
 * Calculate growth percentage between two values
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Additional function expected by tests
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return Number.POSITIVE_INFINITY;
  return ((current - previous) / previous) * 100;
};

export const formatAnalyticsCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatAnalyticsPercentage = (value: number | null | undefined, precision: number = 2): string => {
  if (value == null) return '0%';
  return `${value.toFixed(precision)}%`;
};

export const calculateMRR = (subscriptions: any[] | null | undefined): number => {
  if (!Array.isArray(subscriptions)) return 0;
  return subscriptions
    .filter(sub => sub?.status === 'active')
    .reduce((sum, sub) => sum + (sub?.price || 0), 0);
};

export const calculateARR = (mrr: number): number => {
  return mrr * 12;
};

export const calculateChurnRate = (totalCustomers: number, churnedCustomers: number): number => {
  if (totalCustomers === 0) return 0;
  if (isNaN(totalCustomers) || isNaN(churnedCustomers)) return NaN;
  return churnedCustomers / totalCustomers;
};

export const calculateLTV = (averageRevenue: number, churnRate: number): number => {
  if (churnRate === 0) return Number.POSITIVE_INFINITY;
  if (isNaN(averageRevenue) || isNaN(churnRate)) return NaN;
  return averageRevenue / churnRate;
};

export const aggregateMetricsByPeriod = (
  data: any[],
  period: 'day' | 'month' | 'year',
  aggregator: (items: any[]) => number
): any[] => {
  if (!Array.isArray(data)) return [];
  
  const grouped = data.reduce((acc, item) => {
    if (!item?.date) return acc;
    
    const date = new Date(item.date);
    let key: string;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
    }
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);
  
  return Object.entries(grouped).map(([period, items]) => ({
    period,
    value: aggregator(items),
    count: items.length
  }));
};

export const generateDateRange = (start: Date, end: Date): Date[] => {
  const dates = [];
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const validateDateRange = (start: Date, end: Date): boolean => {
  if (!start || !end || !(start instanceof Date) || !(end instanceof Date)) {
    return false;
  }
  return start <= end;
};

export const parseAnalyticsFilters = (params: URLSearchParams): any => {
  return {
    period: params.get('period') || 'month',
    metric: params.get('metric') || 'revenue',
    startDate: params.get('startDate') ? new Date(params.get('startDate')!) : new Date(),
    endDate: params.get('endDate') ? new Date(params.get('endDate')!) : new Date()
  };
};

export const exportToCSV = (data: any[], filename: string = 'export.csv'): string => {
  if (!Array.isArray(data) || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  return csvContent;
};

/**
 * Format analytics data for export
 */
export function formatAnalyticsData(
  data: AnalyticsData[],
  options: ExportOptions
): string {
  if (options.format === 'csv') {
    const headers = ['timestamp', 'metric', 'value'];
    const rows = data.map(item => [
      item.timestamp.toISOString(),
      item.metric,
      item.value.toString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  // For other formats, return JSON for now
  return JSON.stringify(data, null, 2);
}

/**
 * Aggregate analytics data by time period
 */
export function aggregateByPeriod(
  data: AnalyticsData[],
  period: 'day' | 'week' | 'month'
): Record<string, number> {
  const aggregated: Record<string, number> = {};
  
  data.forEach(item => {
    let key: string;
    const date = new Date(item.timestamp);
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    aggregated[key] = (aggregated[key] || 0) + item.value;
  });
  
  return aggregated;
}