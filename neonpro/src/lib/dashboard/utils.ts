import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ValueFormat,
  TrendDirection,
  KPIStatus,
  AlertSeverity,
  DateRange,
  KPIMetric,
  PerformanceMetric,
  ChartDataPoint,
  DashboardWidget,
  Alert
} from './types';

// Value Formatting Utilities
export function formatValue(
  value: number,
  format: ValueFormat,
  options: {
    decimals?: number;
    currency?: string;
    locale?: string;
    compact?: boolean;
  } = {}
): string {
  const {
    decimals = 2,
    currency = 'BRL',
    locale = 'pt-BR',
    compact = false
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }

  try {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
          notation: compact ? 'compact' : 'standard'
        }).format(value);

      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(value / 100);

      case 'duration':
        return formatDuration(value);

      case 'bytes':
        return formatBytes(value, decimals);

      case 'decimal':
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
          notation: compact ? 'compact' : 'standard'
        }).format(value);

      case 'integer':
        return new Intl.NumberFormat(locale, {
          maximumFractionDigits: 0,
          notation: compact ? 'compact' : 'standard'
        }).format(value);

      case 'number':
      default:
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: value % 1 === 0 ? 0 : decimals,
          maximumFractionDigits: decimals,
          notation: compact ? 'compact' : 'standard'
        }).format(value);
    }
  } catch (error) {
    console.error('Error formatting value:', error);
    return value.toString();
  }
}

// Duration formatting (in minutes)
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (hours < 24) {
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0
    ? `${days}d ${remainingHours}h`
    : `${days}d`;
}

// Bytes formatting
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Date Formatting Utilities
export function formatDate(
  date: Date | string,
  formatString: string = 'PPp',
  options: { locale?: Locale } = {}
): string {
  const { locale = ptBR } = options;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return '--';
    }
    
    return format(dateObj, formatString, { locale });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '--';
  }
}

export function formatRelativeTime(
  date: Date | string,
  options: { locale?: Locale; addSuffix?: boolean } = {}
): string {
  const { locale = ptBR, addSuffix = true } = options;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return '--';
    }
    
    return formatDistanceToNow(dateObj, { locale, addSuffix });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '--';
  }
}

// Trend Calculation Utilities
export function calculateTrend(
  current: number,
  previous: number,
  threshold: number = 0.01
): TrendDirection {
  if (previous === 0 || current === previous) {
    return 'stable';
  }
  
  const changePercent = Math.abs((current - previous) / previous);
  
  if (changePercent < threshold) {
    return 'stable';
  }
  
  return current > previous ? 'up' : 'down';
}

export function calculateTrendPercentage(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  return ((current - previous) / previous) * 100;
}

// KPI Status Calculation
export function calculateKPIStatus(
  value: number,
  target?: number,
  thresholds?: {
    excellent: { min?: number; max?: number };
    good: { min?: number; max?: number };
    warning: { min?: number; max?: number };
    critical: { min?: number; max?: number };
  }
): KPIStatus {
  // If custom thresholds are provided, use them
  if (thresholds) {
    if (isInRange(value, thresholds.excellent)) return 'excellent';
    if (isInRange(value, thresholds.good)) return 'good';
    if (isInRange(value, thresholds.warning)) return 'warning';
    if (isInRange(value, thresholds.critical)) return 'critical';
  }
  
  // Default logic based on target
  if (target) {
    const percentage = (value / target) * 100;
    
    if (percentage >= 100) return 'excellent';
    if (percentage >= 90) return 'good';
    if (percentage >= 70) return 'warning';
    return 'critical';
  }
  
  return 'unknown';
}

function isInRange(
  value: number,
  range: { min?: number; max?: number }
): boolean {
  const { min, max } = range;
  
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  
  return true;
}

// Color Utilities
export function getStatusColor(status: KPIStatus): string {
  switch (status) {
    case 'excellent':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'good':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-600';
    default:
      return 'text-gray-400';
  }
}

export function getAlertColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Chart Utilities
export function generateChartColors(count: number): string[] {
  const baseColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#ec4899', // pink
    '#6b7280'  // gray
  ];
  
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
}

export function processChartData(
  data: any[],
  xField: string,
  yField: string,
  groupField?: string
): ChartDataPoint[] {
  return data.map(item => ({
    x: item[xField],
    y: Number(item[yField]) || 0,
    label: groupField ? item[groupField] : undefined,
    metadata: item
  }));
}

// Data Aggregation Utilities
export function aggregateData(
  data: any[],
  groupBy: string,
  valueField: string,
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum'
): Record<string, number> {
  const groups = data.reduce((acc, item) => {
    const key = item[groupBy];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item[valueField]);
    return acc;
  }, {} as Record<string, number[]>);
  
  const result: Record<string, number> = {};
  
  Object.entries(groups).forEach(([key, values]) => {
    switch (aggregation) {
      case 'sum':
        result[key] = values.reduce((sum, val) => sum + (Number(val) || 0), 0);
        break;
      case 'avg':
        result[key] = values.reduce((sum, val) => sum + (Number(val) || 0), 0) / values.length;
        break;
      case 'count':
        result[key] = values.length;
        break;
      case 'min':
        result[key] = Math.min(...values.map(v => Number(v) || 0));
        break;
      case 'max':
        result[key] = Math.max(...values.map(v => Number(v) || 0));
        break;
    }
  });
  
  return result;
}

// Validation Utilities
export function validateDateRange(dateRange: DateRange): boolean {
  const { from, to } = dateRange;
  
  if (!isValid(from) || !isValid(to)) {
    return false;
  }
  
  return from <= to;
}

export function validateKPIMetric(metric: Partial<KPIMetric>): string[] {
  const errors: string[] = [];
  
  if (!metric.name?.trim()) {
    errors.push('Nome da métrica é obrigatório');
  }
  
  if (typeof metric.value !== 'number' || isNaN(metric.value)) {
    errors.push('Valor da métrica deve ser um número válido');
  }
  
  if (!metric.unit?.trim()) {
    errors.push('Unidade da métrica é obrigatória');
  }
  
  if (!metric.category?.trim()) {
    errors.push('Categoria da métrica é obrigatória');
  }
  
  return errors;
}

export function validateWidget(widget: Partial<DashboardWidget>): string[] {
  const errors: string[] = [];
  
  if (!widget.title?.trim()) {
    errors.push('Título do widget é obrigatório');
  }
  
  if (!widget.type) {
    errors.push('Tipo do widget é obrigatório');
  }
  
  if (!widget.position) {
    errors.push('Posição do widget é obrigatória');
  } else {
    const { x, y, w, h } = widget.position;
    
    if (typeof x !== 'number' || x < 0) {
      errors.push('Posição X deve ser um número não negativo');
    }
    
    if (typeof y !== 'number' || y < 0) {
      errors.push('Posição Y deve ser um número não negativo');
    }
    
    if (typeof w !== 'number' || w <= 0) {
      errors.push('Largura deve ser um número positivo');
    }
    
    if (typeof h !== 'number' || h <= 0) {
      errors.push('Altura deve ser um número positivo');
    }
  }
  
  return errors;
}

// Search and Filter Utilities
export function filterAlerts(
  alerts: Alert[],
  filters: {
    search?: string;
    severity?: AlertSeverity[];
    category?: string[];
    acknowledged?: boolean;
    dateRange?: DateRange;
  }
): Alert[] {
  return alerts.filter(alert => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        alert.title.toLowerCase().includes(searchLower) ||
        alert.message.toLowerCase().includes(searchLower) ||
        alert.category.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Severity filter
    if (filters.severity && filters.severity.length > 0) {
      if (!filters.severity.includes(alert.severity)) return false;
    }
    
    // Category filter
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(alert.category)) return false;
    }
    
    // Acknowledged filter
    if (typeof filters.acknowledged === 'boolean') {
      if (alert.acknowledged !== filters.acknowledged) return false;
    }
    
    // Date range filter
    if (filters.dateRange) {
      const alertDate = new Date(alert.timestamp);
      if (alertDate < filters.dateRange.from || alertDate > filters.dateRange.to) {
        return false;
      }
    }
    
    return true;
  });
}

export function sortData<T>(
  data: T[],
  sortBy: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (aVal === bVal) return 0;
    
    let comparison = 0;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime();
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

// Performance Utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Cache Utilities
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();
  
  set(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// Export Utilities
export function generateCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return '';
  
  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = data.map(row => 
    csvHeaders.map(header => {
      const value = row[header];
      const stringValue = value?.toString() || '';
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      return /[,"\n]/.test(stringValue) 
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    }).join(',')
  );
  
  return [csvHeaders.join(','), ...csvRows].join('\n');
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

// URL Utilities
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

export function parseQueryString(queryString: string): Record<string, any> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, any> = {};
  
  for (const [key, value] of params.entries()) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// Error Handling Utilities
export function createErrorHandler(context: string) {
  return (error: any) => {
    console.error(`Error in ${context}:`, error);
    
    // You can extend this to send errors to a logging service
    // logErrorToService(error, context);
    
    return {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        context
      }
    };
  };
}

export function isNetworkError(error: any): boolean {
  return (
    error.name === 'NetworkError' ||
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('fetch') ||
    error.message?.includes('network')
  );
}

// Local Storage Utilities
export function saveToLocalStorage(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
}