import { supabase } from "@/lib/supabase";
import { CacheService } from "./cache";

export interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  category: "revenue" | "expenses" | "profit" | "patients" | "appointments";
  formattedValue: string;
  trend: "up" | "down" | "stable";
  timestamp: Date;
}

export interface MetricsCalculationOptions {
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate: Date;
  categories?: string[];
  includeComparisons?: boolean;
}

export interface MetricsHistory {
  metric: FinancialMetric;
  history: Array<{
    period: string;
    value: number;
    timestamp: Date;
  }>;
}

export class FinancialMetricsService {
  private static readonly CACHE_PREFIX = "financial_metrics";
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Calculate financial metrics for the specified period
   */
  static async calculateMetrics(
    options: MetricsCalculationOptions
  ): Promise<FinancialMetric[]> {
    const cacheKey = `${this.CACHE_PREFIX}_${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          patients (name, email),
          appointments (date, status)
        `)
        .gte('created_at', options.startDate.toISOString())
        .lte('created_at', options.endDate.toISOString());

      if (error) throw error;

      const metrics = this.processTransactionsToMetrics(data || [], options);
      
      // Cache the results
      await CacheService.set(cacheKey, metrics, this.CACHE_TTL);
      
      return metrics;
    } catch (error) {
      console.error('Error calculating financial metrics:', error);
      throw new Error('Failed to calculate financial metrics');
    }
  }

  /**
   * Get cached metrics if available
   */
  static async getCachedMetrics(
    options: MetricsCalculationOptions
  ): Promise<FinancialMetric[] | null> {
    const cacheKey = `${this.CACHE_PREFIX}_${JSON.stringify(options)}`;
    return await CacheService.get(cacheKey);
  }

  /**
   * Invalidate metrics cache
   */
  static async invalidateCache(pattern?: string): Promise<void> {
    const invalidatePattern = pattern || `${this.CACHE_PREFIX}_*`;
    await CacheService.invalidate(invalidatePattern);
  }

  /**
   * Aggregate financial data for dashboard
   */
  static async aggregateData(options: MetricsCalculationOptions): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    patientCount: number;
    appointmentCount: number;
    averageTransactionValue: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_financial_aggregates', {
          start_date: options.startDate.toISOString(),
          end_date: options.endDate.toISOString(),
          period: options.period
        });

      if (error) throw error;

      return data || {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        patientCount: 0,
        appointmentCount: 0,
        averageTransactionValue: 0
      };
    } catch (error) {
      console.error('Error aggregating financial data:', error);
      throw new Error('Failed to aggregate financial data');
    }
  }

  /**
   * Export metrics data
   */
  static async exportMetrics(
    options: MetricsCalculationOptions,
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const metrics = await this.calculateMetrics(options);
    
    switch (format) {
      case 'csv':
        return this.exportToCsv(metrics);
      case 'excel':
        return this.exportToExcel(metrics);
      case 'pdf':
        return this.exportToPdf(metrics);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Get metrics history for trend analysis
   */
  static async getMetricsHistory(
    metricName: string,
    period: "daily" | "weekly" | "monthly" | "yearly",
    months: number = 12
  ): Promise<MetricsHistory> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    try {
      const { data, error } = await supabase
        .from('financial_metrics_history')
        .select('*')
        .eq('metric_name', metricName)
        .eq('period', period)
        .gte('period_start', startDate.toISOString())
        .lte('period_end', endDate.toISOString())
        .order('period_start', { ascending: true });

      if (error) throw error;

      const currentMetric = await this.calculateSingleMetric(metricName, {
        period,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date()
      });

      return {
        metric: currentMetric,
        history: (data || []).map(record => ({
          period: record.period_start,
          value: record.value,
          timestamp: new Date(record.period_start)
        }))
      };
    } catch (error) {
      console.error('Error getting metrics history:', error);
      throw new Error('Failed to get metrics history');
    }
  }

  /**
   * Process raw transaction data into financial metrics
   */
  private static processTransactionsToMetrics(
    transactions: any[],
    options: MetricsCalculationOptions
  ): FinancialMetric[] {
    const metrics: FinancialMetric[] = [];

    // Calculate revenue metrics
    const revenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = revenue - expenses;

    // Create revenue metric
    metrics.push({
      id: 'revenue',
      name: 'Total Revenue',
      value: revenue,
      previousValue: 0, // TODO: Calculate from previous period
      change: 0, // TODO: Calculate from previous period
      changePercentage: 0, // TODO: Calculate from previous period
      period: options.period,
      category: 'revenue',
      formattedValue: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(revenue),
      trend: 'up',
      timestamp: new Date()
    });

    // Create expenses metric
    metrics.push({
      id: 'expenses',
      name: 'Total Expenses',
      value: expenses,
      previousValue: 0, // TODO: Calculate from previous period
      change: 0, // TODO: Calculate from previous period
      changePercentage: -5,
      period: options.period,
      category: 'expenses',
      formattedValue: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(expenses),
      trend: 'down',
      timestamp: new Date()
    });

    // Create profit metric
    metrics.push({
      id: 'profit',
      name: 'Net Profit',
      value: profit,
      previousValue: 0, // TODO: Calculate from previous period
      change: 0, // TODO: Calculate from previous period
      changePercentage: 0, // TODO: Calculate from previous period
      period: options.period,
      category: 'profit',
      formattedValue: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(profit),
      trend: profit > 0 ? 'up' : 'down',
      timestamp: new Date()
    });

    return metrics;
  }

  /**
   * Calculate a single metric by name
   */
  private static async calculateSingleMetric(
    metricName: string,
    options: MetricsCalculationOptions
  ): Promise<FinancialMetric> {
    const metrics = await this.calculateMetrics(options);
    const metric = metrics.find(m => m.id === metricName);
    
    if (!metric) {
      throw new Error(`Metric not found: ${metricName}`);
    }
    
    return metric;
  }

  /**
   * Export metrics to CSV format
   */
  private static exportToCsv(metrics: FinancialMetric[]): Blob {
    const headers = ['Name', 'Value', 'Previous Value', 'Change', 'Change %', 'Trend', 'Category'];
    const rows = metrics.map(metric => [
      metric.name,
      metric.value.toString(),
      metric.previousValue.toString(),
      metric.change.toString(),
      metric.changePercentage.toString(),
      metric.trend,
      metric.category
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Export metrics to Excel format (simplified)
   */
  private static exportToExcel(metrics: FinancialMetric[]): Blob {
    // For now, return CSV format with Excel MIME type
    // In a real implementation, you'd use a library like xlsx
    const csvBlob = this.exportToCsv(metrics);
    return new Blob([csvBlob], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Export metrics to PDF format (simplified)
   */
  private static exportToPdf(metrics: FinancialMetric[]): Blob {
    // For now, return a simple text format
    // In a real implementation, you'd use a library like jsPDF
    const content = metrics.map(metric => 
      `${metric.name}: ${metric.formattedValue} (${metric.changePercentage > 0 ? '+' : ''}${metric.changePercentage}%)`
    ).join('\n');

    return new Blob([content], { type: 'application/pdf' });
  }
}