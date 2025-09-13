/**
 * Service Analytics Types
 * Types for service usage statistics, revenue tracking, and reporting
 */

export interface ServiceAnalytics {
  service_id: string;
  service_name: string;
  category_name?: string;
  
  // Usage Statistics
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  
  // Revenue Metrics
  total_revenue: number;
  average_price: number;
  highest_price: number;
  lowest_price: number;
  
  // Time-based Metrics
  avg_duration_minutes: number;
  total_duration_hours: number;
  
  // Performance Metrics
  completion_rate: number; // percentage
  cancellation_rate: number; // percentage
  no_show_rate: number; // percentage
  
  // Popularity Metrics
  bookings_this_month: number;
  bookings_last_month: number;
  growth_rate: number; // percentage change
  
  // Professional Metrics
  unique_professionals: number;
  most_popular_professional?: string;
  
  // Client Metrics
  unique_clients: number;
  repeat_clients: number;
  repeat_rate: number; // percentage
  
  // Temporal Data
  period_start: string;
  period_end: string;
  last_updated: string;
}

export interface RevenueAnalytics {
  clinic_id: string;
  
  // Total Revenue
  total_revenue: number;
  total_appointments: number;
  average_appointment_value: number;
  
  // Period Comparisons
  current_period_revenue: number;
  previous_period_revenue: number;
  revenue_growth_rate: number;
  
  // Revenue by Category
  revenue_by_category: {
    category_id: string;
    category_name: string;
    revenue: number;
    appointments: number;
    percentage_of_total: number;
  }[];
  
  // Revenue by Professional
  revenue_by_professional: {
    professional_id: string;
    professional_name: string;
    revenue: number;
    appointments: number;
    average_value: number;
  }[];
  
  // Revenue by Service
  top_services: {
    service_id: string;
    service_name: string;
    revenue: number;
    appointments: number;
    growth_rate: number;
  }[];
  
  // Time-based Revenue
  daily_revenue: {
    date: string;
    revenue: number;
    appointments: number;
  }[];
  
  monthly_revenue: {
    month: string;
    revenue: number;
    appointments: number;
  }[];
}

export interface UsageStatistics {
  clinic_id: string;
  
  // Overall Statistics
  total_services: number;
  active_services: number;
  total_appointments: number;
  
  // Service Performance
  most_popular_services: {
    service_id: string;
    service_name: string;
    appointment_count: number;
    revenue: number;
  }[];
  
  least_popular_services: {
    service_id: string;
    service_name: string;
    appointment_count: number;
    last_booked: string | null;
  }[];
  
  // Category Performance
  category_performance: {
    category_id: string;
    category_name: string;
    service_count: number;
    appointment_count: number;
    revenue: number;
    avg_price: number;
  }[];
  
  // Time-based Usage
  peak_hours: {
    hour: number;
    appointment_count: number;
    percentage: number;
  }[];
  
  peak_days: {
    day_of_week: number;
    day_name: string;
    appointment_count: number;
    percentage: number;
  }[];
  
  // Seasonal Trends
  seasonal_trends: {
    month: number;
    month_name: string;
    appointment_count: number;
    revenue: number;
    year_over_year_growth: number;
  }[];
}

export interface ProfessionalPerformance {
  professional_id: string;
  professional_name: string;
  
  // Service Metrics
  total_services: number;
  total_appointments: number;
  completed_appointments: number;
  
  // Revenue Metrics
  total_revenue: number;
  average_appointment_value: number;
  
  // Performance Metrics
  completion_rate: number;
  client_satisfaction: number | null;
  repeat_client_rate: number;
  
  // Efficiency Metrics
  avg_appointment_duration: number;
  appointments_per_day: number;
  utilization_rate: number; // percentage of available time booked
  
  // Service Specialization
  top_services: {
    service_id: string;
    service_name: string;
    appointment_count: number;
    revenue: number;
    proficiency_level: string;
  }[];
  
  // Time Analysis
  peak_performance_hours: {
    hour: number;
    appointment_count: number;
    revenue: number;
  }[];
}

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
  service_ids?: string[];
  category_ids?: string[];
  professional_ids?: string[];
  appointment_status?: ('scheduled' | 'completed' | 'cancelled' | 'no_show')[];
  comparison_period?: 'previous_month' | 'previous_quarter' | 'previous_year' | 'same_period_last_year';
}

export interface AnalyticsDashboard {
  clinic_id: string;
  period: {
    start_date: string;
    end_date: string;
    label: string;
  };
  
  // Key Performance Indicators
  kpis: {
    total_revenue: number;
    total_appointments: number;
    average_appointment_value: number;
    completion_rate: number;
    growth_rate: number;
    client_satisfaction: number | null;
  };
  
  // Charts Data
  revenue_trend: {
    date: string;
    revenue: number;
    appointments: number;
  }[];
  
  service_performance: ServiceAnalytics[];
  category_breakdown: {
    category_name: string;
    revenue: number;
    appointments: number;
    percentage: number;
  }[];
  
  professional_performance: ProfessionalPerformance[];
  
  // Insights and Recommendations
  insights: {
    type: 'growth' | 'decline' | 'opportunity' | 'warning';
    title: string;
    description: string;
    metric_value?: number;
    recommendation?: string;
  }[];
}

export type AnalyticsTimeRange = 
  | 'today'
  | 'yesterday' 
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom';

export interface AnalyticsExportRequest {
  clinic_id: string;
  report_type: 'service_analytics' | 'revenue_report' | 'usage_statistics' | 'professional_performance';
  filters: AnalyticsFilters;
  format: 'csv' | 'excel' | 'pdf';
  include_charts?: boolean;
}

// Utility functions for analytics calculations
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return (completed / total) * 100;
}

export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getTimeRangeDates(range: AnalyticsTimeRange): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return { start: today, end: now };
    
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: today };
    
    case 'last_7_days':
      const week = new Date(today);
      week.setDate(week.getDate() - 7);
      return { start: week, end: now };
    
    case 'last_30_days':
      const month = new Date(today);
      month.setDate(month.getDate() - 30);
      return { start: month, end: now };
    
    case 'last_90_days':
      const quarter = new Date(today);
      quarter.setDate(quarter.getDate() - 90);
      return { start: quarter, end: now };
    
    case 'this_month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: monthStart, end: now };
    
    case 'last_month':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: lastMonthStart, end: lastMonthEnd };
    
    default:
      return { start: today, end: now };
  }
}
