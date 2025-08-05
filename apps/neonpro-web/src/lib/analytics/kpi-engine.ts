// KPI Calculation and Monitoring Engine
// Description: High-performance KPI calculation engine with real-time monitoring
// Author: Dev Agent
// Date: 2025-01-26

import { createClient } from '@supabase/supabase-js';
import type {
  FinancialKPI,
  KPICalculationRequest,
  KPICalculationResult,
  KPIThreshold,
  KPIAlert,
  KPIHistory,
  DrillDownRequest,
  DrillDownResult,
} from '@/lib/types/kpi-types';

export class KPIEngine {
  private supabase;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    this.cache = new Map();
  }

  // Core KPI Calculation Methods
  async calculateKPIs(request: KPICalculationRequest): Promise<KPICalculationResult[]> {
    const startTime = Date.now();
    
    try {
      // Get KPIs to calculate
      const kpisToCalculate = request.kpi_ids 
        ? await this.getKPIsByIds(request.kpi_ids)
        : await this.getAllKPIs();

      const results: KPICalculationResult[] = [];

      // Calculate each KPI in parallel for performance
      const calculations = kpisToCalculate.map(kpi => 
        this.calculateSingleKPI(kpi, request)
      );

      const calculationResults = await Promise.all(calculations);
      results.push(...calculationResults);

      // Update KPI values and history
      if (!request.force_recalculation) {
        await this.updateKPIValues(results);
        await this.recordKPIHistory(results);
      }

      // Check thresholds and generate alerts
      await this.checkThresholds(results);

      console.log(`KPI calculation completed in ${Date.now() - startTime}ms`);
      return results;

    } catch (error) {
      console.error('KPI calculation error:', error);
      throw error;
    }
  }

  private async calculateSingleKPI(
    kpi: FinancialKPI, 
    request: KPICalculationRequest
  ): Promise<KPICalculationResult> {
    const { start_date, end_date } = request.time_period;
    let calculatedValue = 0;
    let dataPointsUsed = 0;
    let breakdown: Array<{ dimension: string; value: number; percentage: number }> = [];

    try {
      switch (kpi.kpi_category) {
        case 'revenue':
          ({ value: calculatedValue, dataPoints: dataPointsUsed, breakdown } = 
            await this.calculateRevenueKPI(kpi, start_date, end_date, request.filters));
          break;
        
        case 'profitability':
          ({ value: calculatedValue, dataPoints: dataPointsUsed, breakdown } = 
            await this.calculateProfitabilityKPI(kpi, start_date, end_date, request.filters));
          break;
        
        case 'operational':
          ({ value: calculatedValue, dataPoints: dataPointsUsed, breakdown } = 
            await this.calculateOperationalKPI(kpi, start_date, end_date, request.filters));
          break;
        
        case 'financial_health':
          ({ value: calculatedValue, dataPoints: dataPointsUsed, breakdown } = 
            await this.calculateFinancialHealthKPI(kpi, start_date, end_date, request.filters));
          break;
      }

      // Calculate variance and trend
      const previousValue = request.include_variance ? 
        await this.getPreviousPeriodValue(kpi, start_date, end_date) : undefined;
      
      const variancePercent = previousValue ? 
        ((calculatedValue - previousValue) / previousValue) * 100 : undefined;

      const trendDirection = this.determineTrendDirection(calculatedValue, previousValue);

      return {
        kpi_id: kpi.id,
        kpi_name: kpi.kpi_name,
        calculated_value: calculatedValue,
        previous_value: previousValue,
        variance_percent: variancePercent,
        trend_direction: trendDirection,
        calculation_timestamp: new Date().toISOString(),
        data_points_used: dataPointsUsed,
        confidence_score: this.calculateConfidenceScore(dataPointsUsed, kpi.kpi_category),
        breakdown,
      };

    } catch (error) {
      console.error(`Error calculating KPI ${kpi.kpi_name}:`, error);
      return {
        kpi_id: kpi.id,
        kpi_name: kpi.kpi_name,
        calculated_value: 0,
        trend_direction: 'stable',
        calculation_timestamp: new Date().toISOString(),
        data_points_used: 0,
        confidence_score: 0,
      };
    }
  }

  // Revenue KPI Calculations
  private async calculateRevenueKPI(
    kpi: FinancialKPI, 
    startDate: string, 
    endDate: string, 
    filters?: any
  ) {
    const cacheKey = `revenue_${kpi.kpi_name}_${startDate}_${endDate}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let query = this.supabase
      .from('invoices')
      .select('amount, created_at, service_type')
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (filters?.service_types?.length) {
      query = query.in('service_type', filters.service_types);
    }

    const { data: invoices, error } = await query;
    if (error) throw error;

    let value = 0;
    const breakdown: Array<{ dimension: string; value: number; percentage: number }> = [];

    if (kpi.kpi_name === 'Total Revenue') {
      value = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      
      // Create breakdown by service type
      const serviceBreakdown = invoices.reduce((acc, inv) => {
        acc[inv.service_type] = (acc[inv.service_type] || 0) + inv.amount;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(serviceBreakdown).forEach(([service, amount]) => {
        breakdown.push({
          dimension: service,
          value: amount,
          percentage: (amount / value) * 100,
        });
      });

    } else if (kpi.kpi_name === 'Revenue Per Patient') {
      const { data: patients } = await this.supabase
        .from('patients')
        .select('id')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      value = patients?.length ? totalRevenue / patients.length : 0;
    }

    const result = { value, dataPoints: invoices.length, breakdown };
    this.setCache(cacheKey, result);
    return result;
  }

  // Profitability KPI Calculations
  private async calculateProfitabilityKPI(
    kpi: FinancialKPI, 
    startDate: string, 
    endDate: string, 
    filters?: any
  ) {
    const cacheKey = `profitability_${kpi.kpi_name}_${startDate}_${endDate}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Get revenue data
    const { data: invoices } = await this.supabase
      .from('invoices')
      .select('amount, direct_costs, created_at')
      .eq('status', 'paid')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Get expense data
    const { data: expenses } = await this.supabase
      .from('expenses')
      .select('amount, category, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    const totalDirectCosts = invoices?.reduce((sum, inv) => sum + (inv.direct_costs || 0), 0) || 0;
    const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

    let value = 0;
    const breakdown: Array<{ dimension: string; value: number; percentage: number }> = [];

    if (kpi.kpi_name === 'Gross Profit Margin') {
      value = totalRevenue ? ((totalRevenue - totalDirectCosts) / totalRevenue) * 100 : 0;
    } else if (kpi.kpi_name === 'EBITDA') {
      value = totalRevenue - totalDirectCosts - totalExpenses;
    } else if (kpi.kpi_name === 'Net Profit Margin') {
      const netProfit = totalRevenue - totalDirectCosts - totalExpenses;
      value = totalRevenue ? (netProfit / totalRevenue) * 100 : 0;
    }

    // Create expense breakdown
    const expenseBreakdown = expenses?.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>) || {};

    Object.entries(expenseBreakdown).forEach(([category, amount]) => {
      breakdown.push({
        dimension: category,
        value: amount,
        percentage: totalExpenses ? (amount / totalExpenses) * 100 : 0,
      });
    });

    const result = { 
      value, 
      dataPoints: (invoices?.length || 0) + (expenses?.length || 0), 
      breakdown 
    };
    this.setCache(cacheKey, result);
    return result;
  }

  // Operational KPI Calculations
  private async calculateOperationalKPI(
    kpi: FinancialKPI, 
    startDate: string, 
    endDate: string, 
    filters?: any
  ) {
    const cacheKey = `operational_${kpi.kpi_name}_${startDate}_${endDate}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let value = 0;
    let dataPoints = 0;
    const breakdown: Array<{ dimension: string; value: number; percentage: number }> = [];

    if (kpi.kpi_name === 'Patient Retention Rate') {
      const { data: patients } = await this.supabase
        .from('patients')
        .select('id, created_at');

      const { data: appointments } = await this.supabase
        .from('appointments')
        .select('patient_id, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const returningPatients = new Set(appointments?.map(a => a.patient_id) || []);
      const totalPatients = patients?.length || 0;
      
      value = totalPatients ? (returningPatients.size / totalPatients) * 100 : 0;
      dataPoints = totalPatients;

    } else if (kpi.kpi_name === 'Appointment Utilization') {
      const { data: appointments } = await this.supabase
        .from('appointments')
        .select('id, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const totalSlots = appointments?.length || 0;
      const bookedSlots = appointments?.filter(a => a.status !== 'cancelled')?.length || 0;
      
      value = totalSlots ? (bookedSlots / totalSlots) * 100 : 0;
      dataPoints = totalSlots;

    } else if (kpi.kpi_name === 'Cost Per Patient Acquisition') {
      const { data: expenses } = await this.supabase
        .from('expenses')
        .select('amount')
        .eq('category', 'marketing')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: newPatients } = await this.supabase
        .from('patients')
        .select('id')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const marketingCosts = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const newPatientCount = newPatients?.length || 0;
      
      value = newPatientCount ? marketingCosts / newPatientCount : 0;
      dataPoints = newPatientCount;
    }

    const result = { value, dataPoints, breakdown };
    this.setCache(cacheKey, result);
    return result;
  }

  // Financial Health KPI Calculations
  private async calculateFinancialHealthKPI(
    kpi: FinancialKPI, 
    startDate: string, 
    endDate: string, 
    filters?: any
  ) {
    const cacheKey = `financial_health_${kpi.kpi_name}_${startDate}_${endDate}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let value = 0;
    let dataPoints = 0;
    const breakdown: Array<{ dimension: string; value: number; percentage: number }> = [];

    if (kpi.kpi_name === 'Cash Flow Ratio') {
      // Simplified calculation - would need more complex cash flow tracking
      const { data: revenue } = await this.supabase
        .from('invoices')
        .select('amount')
        .eq('status', 'paid')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const { data: expenses } = await this.supabase
        .from('expenses')
        .select('amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const operatingCashFlow = (revenue?.reduce((sum, r) => sum + r.amount, 0) || 0) -
                               (expenses?.reduce((sum, e) => sum + e.amount, 0) || 0);
      
      // Assuming current liabilities as 30% of monthly expenses
      const monthlyExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
      const currentLiabilities = monthlyExpenses * 0.3;
      
      value = currentLiabilities ? operatingCashFlow / currentLiabilities : 0;
      dataPoints = (revenue?.length || 0) + (expenses?.length || 0);

    } else if (kpi.kpi_name === 'Accounts Receivable Turnover') {
      const { data: invoices } = await this.supabase
        .from('invoices')
        .select('amount, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      const pendingReceivables = invoices?.filter(inv => inv.status === 'pending')
                                          ?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      
      value = pendingReceivables ? totalRevenue / pendingReceivables : 0;
      dataPoints = invoices?.length || 0;
    }

    const result = { value, dataPoints, breakdown };
    this.setCache(cacheKey, result);
    return result;
  }

  // Drill-down Analysis
  async performDrillDown(request: DrillDownRequest): Promise<DrillDownResult[]> {
    const startTime = Date.now();
    
    try {
      const kpi = await this.getKPIById(request.kpi_id);
      if (!kpi) throw new Error('KPI not found');

      let results: DrillDownResult[] = [];

      switch (request.dimension) {
        case 'time':
          results = await this.drillDownByTime(kpi, request);
          break;
        case 'service_type':
          results = await this.drillDownByServiceType(kpi, request);
          break;
        case 'provider':
          results = await this.drillDownByProvider(kpi, request);
          break;
        case 'patient_segment':
          results = await this.drillDownByPatientSegment(kpi, request);
          break;
        default:
          throw new Error(`Unsupported drill-down dimension: ${request.dimension}`);
      }

      console.log(`Drill-down analysis completed in ${Date.now() - startTime}ms`);
      return results.slice(0, request.limit || 50);

    } catch (error) {
      console.error('Drill-down analysis error:', error);
      throw error;
    }
  }

  // Helper Methods
  private determineTrendDirection(current: number, previous?: number): 'increasing' | 'decreasing' | 'stable' {
    if (!previous) return 'stable';
    const threshold = 0.05; // 5% threshold for stability
    const change = Math.abs((current - previous) / previous);
    
    if (change < threshold) return 'stable';
    return current > previous ? 'increasing' : 'decreasing';
  }

  private calculateConfidenceScore(dataPoints: number, category: string): number {
    // Simple confidence scoring based on data points and category
    const baseScore = Math.min(dataPoints / 100, 1); // More data points = higher confidence
    const categoryMultiplier = category === 'revenue' ? 1.2 : 1.0; // Revenue data typically more reliable
    
    return Math.min(baseScore * categoryMultiplier, 1) * 100;
  }

  // Cache Management
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  // Database Helper Methods
  private async getKPIsByIds(ids: string[]): Promise<FinancialKPI[]> {
    const { data, error } = await this.supabase
      .from('financial_kpis')
      .select('*')
      .in('id', ids);
    
    if (error) throw error;
    return data || [];
  }

  private async getAllKPIs(): Promise<FinancialKPI[]> {
    const { data, error } = await this.supabase
      .from('financial_kpis')
      .select('*')
      .order('kpi_category', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  private async getKPIById(id: string): Promise<FinancialKPI | null> {
    const { data, error } = await this.supabase
      .from('financial_kpis')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  private async updateKPIValues(results: KPICalculationResult[]): Promise<void> {
    const updates = results.map(result => ({
      id: result.kpi_id,
      current_value: result.calculated_value,
      previous_value: result.previous_value || null,
      variance_percent: result.variance_percent || null,
      trend_direction: result.trend_direction,
      last_updated: result.calculation_timestamp,
    }));

    for (const update of updates) {
      await this.supabase
        .from('financial_kpis')
        .update(update)
        .eq('id', update.id);
    }
  }

  private async recordKPIHistory(results: KPICalculationResult[]): Promise<void> {
    const historyRecords = results.map(result => ({
      kpi_id: result.kpi_id,
      value: result.calculated_value,
      recorded_at: result.calculation_timestamp,
      calculation_metadata: {
        data_points_used: result.data_points_used,
        confidence_score: result.confidence_score,
        breakdown: result.breakdown,
      },
    }));

    await this.supabase
      .from('kpi_history')
      .insert(historyRecords);
  }

  private async checkThresholds(results: KPICalculationResult[]): Promise<void> {
    for (const result of results) {
      const { data: thresholds } = await this.supabase
        .from('kpi_thresholds')
        .select('*')
        .eq('kpi_id', result.kpi_id)
        .eq('notification_enabled', true);

      if (!thresholds?.length) continue;

      for (const threshold of thresholds) {
        const breached = this.checkThresholdBreach(result.calculated_value, threshold);
        
        if (breached) {
          await this.createAlert(result, threshold);
        }
      }
    }
  }

  private checkThresholdBreach(value: number, threshold: KPIThreshold): boolean {
    const { threshold_value, comparison_operator } = threshold;
    
    switch (comparison_operator) {
      case 'gt': return value > threshold_value;
      case 'lt': return value < threshold_value;
      case 'eq': return value === threshold_value;
      case 'gte': return value >= threshold_value;
      case 'lte': return value <= threshold_value;
      default: return false;
    }
  }

  private async createAlert(result: KPICalculationResult, threshold: KPIThreshold): Promise<void> {
    const alert = {
      kpi_id: result.kpi_id,
      threshold_id: threshold.id,
      alert_type: threshold.threshold_type as 'warning' | 'critical',
      alert_message: `KPI ${result.kpi_name} ${threshold.threshold_type} threshold breached`,
      alert_value: result.calculated_value,
      threshold_value: threshold.threshold_value,
      is_acknowledged: false,
    };

    await this.supabase
      .from('kpi_alerts')
      .insert(alert);
  }

  private async getPreviousPeriodValue(
    kpi: FinancialKPI, 
    startDate: string, 
    endDate: string
  ): Promise<number | undefined> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const periodLength = end.getTime() - start.getTime();
    
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(start.getTime());

    const { data } = await this.supabase
      .from('kpi_history')
      .select('value')
      .eq('kpi_id', kpi.id)
      .gte('recorded_at', previousStart.toISOString())
      .lte('recorded_at', previousEnd.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(1);

    return data?.[0]?.value;
  }

  // Drill-down implementations (simplified)
  private async drillDownByTime(kpi: FinancialKPI, request: DrillDownRequest): Promise<DrillDownResult[]> {
    // Implementation would vary based on aggregation level (day, week, month, etc.)
    return [];
  }

  private async drillDownByServiceType(kpi: FinancialKPI, request: DrillDownRequest): Promise<DrillDownResult[]> {
    // Implementation for service type breakdown
    return [];
  }

  private async drillDownByProvider(kpi: FinancialKPI, request: DrillDownRequest): Promise<DrillDownResult[]> {
    // Implementation for provider breakdown
    return [];
  }

  private async drillDownByPatientSegment(kpi: FinancialKPI, request: DrillDownRequest): Promise<DrillDownResult[]> {
    // Implementation for patient segment breakdown
    return [];
  }
}

// Export singleton instance
export const kpiEngine = new KPIEngine();

