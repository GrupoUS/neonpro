/**
 * Financial Dashboard Engine
 * 
 * Core engine for real-time financial dashboard with KPIs, metrics,
 * and business intelligence capabilities.
 * 
 * Features:
 * - Real-time financial metrics calculation
 * - KPI tracking and monitoring
 * - Performance optimization (<2s load time)
 * - Mobile-responsive data delivery
 * - Caching and data refresh management
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Types for Financial Dashboard
export interface FinancialKPI {
  id: string;
  kpi_name: string;
  current_value: number;
  target_value: number;
  calculation_date: string;
  trend_direction: 'up' | 'down' | 'stable';
  percentage_change: number;
  period_comparison: string;
}

export interface DashboardMetrics {
  revenue: {
    total: number;
    monthly: number;
    growth_rate: number;
    trend: 'up' | 'down' | 'stable';
  };
  expenses: {
    total: number;
    monthly: number;
    categories: Record<string, number>;
  };
  profit: {
    gross: number;
    net: number;
    margin_percentage: number;
  };
  cash_flow: {
    current: number;
    projected: number;
    burn_rate: number;
  };
  patients: {
    total_active: number;
    new_this_month: number;
    retention_rate: number;
  };
  treatments: {
    total_performed: number;
    average_value: number;
    most_profitable: string;
  };
}

export interface DashboardConfig {
  clinic_id: string;
  user_role: string;
  refresh_interval: number;
  cache_duration: number;
  mobile_optimized: boolean;
  custom_kpis: string[];
}

export interface PerformanceMetrics {
  load_time: number;
  data_freshness: number;
  cache_hit_rate: number;
  api_response_time: number;
}

class FinancialDashboardEngine {
  private supabase: ReturnType<typeof createClient<Database>>;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private config: DashboardConfig;
  private performanceMetrics: PerformanceMetrics;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: DashboardConfig
  ) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.cache = new Map();
    this.config = config;
    this.performanceMetrics = {
      load_time: 0,
      data_freshness: 0,
      cache_hit_rate: 0,
      api_response_time: 0
    };
  }

  /**
   * Get comprehensive dashboard metrics with performance optimization
   */
  async getDashboardMetrics(): Promise<{
    metrics: DashboardMetrics;
    kpis: FinancialKPI[];
    performance: PerformanceMetrics;
  }> {
    const startTime = Date.now();
    
    try {
      // Check cache first for performance
      const cacheKey = `dashboard_metrics_${this.config.clinic_id}`;
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        this.updatePerformanceMetrics('cache_hit', Date.now() - startTime);
        return cached;
      }

      // Fetch data in parallel for optimal performance
      const [metrics, kpis] = await Promise.all([
        this.calculateDashboardMetrics(),
        this.getFinancialKPIs()
      ]);

      const result = {
        metrics,
        kpis,
        performance: this.performanceMetrics
      };

      // Cache the result
      this.setCache(cacheKey, result, this.config.cache_duration);
      
      this.updatePerformanceMetrics('database_fetch', Date.now() - startTime);
      return result;

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw new Error('Failed to load dashboard metrics');
    }
  }

  /**
   * Calculate real-time dashboard metrics
   */
  private async calculateDashboardMetrics(): Promise<DashboardMetrics> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Revenue calculations
    const [currentRevenue, lastMonthRevenue] = await Promise.all([
      this.calculateRevenue(firstDayOfMonth, currentDate),
      this.calculateRevenue(lastMonth, lastMonthEnd)
    ]);

    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Expense calculations
    const expenses = await this.calculateExpenses(firstDayOfMonth, currentDate);
    
    // Profit calculations
    const grossProfit = currentRevenue - expenses.direct_costs;
    const netProfit = grossProfit - expenses.indirect_costs;
    const profitMargin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0;

    // Cash flow calculations
    const cashFlow = await this.calculateCashFlow();
    
    // Patient metrics
    const patientMetrics = await this.calculatePatientMetrics();
    
    // Treatment metrics
    const treatmentMetrics = await this.calculateTreatmentMetrics();

    return {
      revenue: {
        total: await this.calculateTotalRevenue(),
        monthly: currentRevenue,
        growth_rate: revenueGrowth,
        trend: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'stable'
      },
      expenses: {
        total: expenses.total,
        monthly: expenses.monthly,
        categories: expenses.categories
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin_percentage: profitMargin
      },
      cash_flow: cashFlow,
      patients: patientMetrics,
      treatments: treatmentMetrics
    };
  }

  /**
   * Calculate revenue for a specific period
   */
  private async calculateRevenue(startDate: Date, endDate: Date): Promise<number> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('total_amount')
      .eq('clinic_id', this.config.clinic_id)
      .eq('status', 'paid')
      .gte('paid_date', startDate.toISOString())
      .lte('paid_date', endDate.toISOString());

    if (error) throw error;
    
    return data?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;
  }

  /**
   * Calculate total revenue (all time)
   */
  private async calculateTotalRevenue(): Promise<number> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('total_amount')
      .eq('clinic_id', this.config.clinic_id)
      .eq('status', 'paid');

    if (error) throw error;
    
    return data?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;
  }

  /**
   * Calculate expenses with categorization
   */
  private async calculateExpenses(startDate: Date, endDate: Date): Promise<{
    total: number;
    monthly: number;
    direct_costs: number;
    indirect_costs: number;
    categories: Record<string, number>;
  }> {
    const { data, error } = await this.supabase
      .from('expenses')
      .select('amount, category, expense_type')
      .eq('clinic_id', this.config.clinic_id)
      .gte('expense_date', startDate.toISOString())
      .lte('expense_date', endDate.toISOString());

    if (error) throw error;

    const expenses = data || [];
    const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const directCosts = expenses
      .filter(e => e.expense_type === 'direct')
      .reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const indirectCosts = total - directCosts;

    // Categorize expenses
    const categories: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categories[category] = (categories[category] || 0) + (expense.amount || 0);
    });

    return {
      total,
      monthly: total,
      direct_costs: directCosts,
      indirect_costs: indirectCosts,
      categories
    };
  }

  /**
   * Calculate cash flow metrics
   */
  private async calculateCashFlow(): Promise<{
    current: number;
    projected: number;
    burn_rate: number;
  }> {
    // Get current cash position
    const { data: cashData, error: cashError } = await this.supabase
      .from('cash_flow')
      .select('balance')
      .eq('clinic_id', this.config.clinic_id)
      .order('date', { ascending: false })
      .limit(1);

    if (cashError) throw cashError;

    const currentCash = cashData?.[0]?.balance || 0;

    // Calculate burn rate (average monthly expenses)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const { data: expenseData, error: expenseError } = await this.supabase
      .from('expenses')
      .select('amount')
      .eq('clinic_id', this.config.clinic_id)
      .gte('expense_date', threeMonthsAgo.toISOString());

    if (expenseError) throw expenseError;

    const totalExpenses = expenseData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
    const burnRate = totalExpenses / 3; // Average monthly burn

    // Project cash flow (simple projection based on current trends)
    const projectedCash = currentCash - burnRate;

    return {
      current: currentCash,
      projected: projectedCash,
      burn_rate: burnRate
    };
  }

  /**
   * Calculate patient metrics
   */
  private async calculatePatientMetrics(): Promise<{
    total_active: number;
    new_this_month: number;
    retention_rate: number;
  }> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Total active patients
    const { data: activePatients, error: activeError } = await this.supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', this.config.clinic_id)
      .eq('status', 'active');

    if (activeError) throw activeError;

    // New patients this month
    const { data: newPatients, error: newError } = await this.supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', this.config.clinic_id)
      .gte('created_at', firstDayOfMonth.toISOString());

    if (newError) throw newError;

    // Calculate retention rate (simplified)
    const totalActive = activePatients?.length || 0;
    const newThisMonth = newPatients?.length || 0;
    const retentionRate = totalActive > 0 ? ((totalActive - newThisMonth) / totalActive) * 100 : 0;

    return {
      total_active: totalActive,
      new_this_month: newThisMonth,
      retention_rate: retentionRate
    };
  }

  /**
   * Calculate treatment metrics
   */
  private async calculateTreatmentMetrics(): Promise<{
    total_performed: number;
    average_value: number;
    most_profitable: string;
  }> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Get treatment data with revenue
    const { data: treatments, error } = await this.supabase
      .from('appointments')
      .select(`
        id,
        treatment_type,
        invoice:invoices(total_amount)
      `)
      .eq('clinic_id', this.config.clinic_id)
      .eq('status', 'completed')
      .gte('appointment_date', firstDayOfMonth.toISOString());

    if (error) throw error;

    const treatmentData = treatments || [];
    const totalPerformed = treatmentData.length;
    
    // Calculate average value
    const totalRevenue = treatmentData.reduce((sum, treatment) => {
      const invoiceAmount = Array.isArray(treatment.invoice) 
        ? treatment.invoice[0]?.total_amount || 0
        : treatment.invoice?.total_amount || 0;
      return sum + invoiceAmount;
    }, 0);
    
    const averageValue = totalPerformed > 0 ? totalRevenue / totalPerformed : 0;

    // Find most profitable treatment type
    const treatmentRevenue: Record<string, number> = {};
    treatmentData.forEach(treatment => {
      const type = treatment.treatment_type || 'Unknown';
      const invoiceAmount = Array.isArray(treatment.invoice) 
        ? treatment.invoice[0]?.total_amount || 0
        : treatment.invoice?.total_amount || 0;
      treatmentRevenue[type] = (treatmentRevenue[type] || 0) + invoiceAmount;
    });

    const mostProfitable = Object.entries(treatmentRevenue)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      total_performed: totalPerformed,
      average_value: averageValue,
      most_profitable: mostProfitable
    };
  }

  /**
   * Get financial KPIs
   */
  private async getFinancialKPIs(): Promise<FinancialKPI[]> {
    const { data, error } = await this.supabase
      .from('financial_kpis')
      .select('*')
      .eq('clinic_id', this.config.clinic_id)
      .order('calculation_date', { ascending: false })
      .limit(20);

    if (error) throw error;

    return data?.map(kpi => ({
      ...kpi,
      percentage_change: this.calculatePercentageChange(
        kpi.current_value, 
        kpi.target_value
      ),
      period_comparison: this.getPeriodComparison(kpi.calculation_date)
    })) || [];
  }

  /**
   * Update financial KPIs
   */
  async updateFinancialKPIs(kpis: Partial<FinancialKPI>[]): Promise<void> {
    try {
      const updates = kpis.map(kpi => ({
        ...kpi,
        clinic_id: this.config.clinic_id,
        calculation_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('financial_kpis')
        .upsert(updates);

      if (error) throw error;

      // Invalidate cache
      this.invalidateCache(`dashboard_metrics_${this.config.clinic_id}`);
      
    } catch (error) {
      console.error('Error updating financial KPIs:', error);
      throw new Error('Failed to update financial KPIs');
    }
  }

  /**
   * Get real-time dashboard data with WebSocket support
   */
  subscribeToRealTimeUpdates(callback: (data: any) => void): () => void {
    const subscription = this.supabase
      .channel('financial_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `clinic_id=eq.${this.config.clinic_id}`
        },
        () => {
          // Invalidate cache and fetch new data
          this.invalidateCache(`dashboard_metrics_${this.config.clinic_id}`);
          this.getDashboardMetrics().then(callback);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `clinic_id=eq.${this.config.clinic_id}`
        },
        () => {
          this.invalidateCache(`dashboard_metrics_${this.config.clinic_id}`);
          this.getDashboardMetrics().then(callback);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Performance monitoring
   */
  private updatePerformanceMetrics(type: 'cache_hit' | 'database_fetch', duration: number): void {
    if (type === 'cache_hit') {
      this.performanceMetrics.cache_hit_rate += 1;
    }
    
    this.performanceMetrics.load_time = duration;
    this.performanceMetrics.api_response_time = duration;
    this.performanceMetrics.data_freshness = Date.now();
  }

  /**
   * Utility methods
   */
  private calculatePercentageChange(current: number, target: number): number {
    if (target === 0) return 0;
    return ((current - target) / target) * 100;
  }

  private getPeriodComparison(date: string): string {
    const kpiDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - kpiDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update dashboard configuration
   */
  updateConfig(newConfig: Partial<DashboardConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Clear cache when config changes
    this.cache.clear();
  }
}

export default FinancialDashboardEngine;
export type { DashboardMetrics, FinancialKPI, DashboardConfig, PerformanceMetrics };