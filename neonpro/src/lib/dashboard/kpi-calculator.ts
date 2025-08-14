/**
 * KPI Calculation Service
 * 
 * Comprehensive service for calculating Key Performance Indicators (KPIs)
 * for the executive dashboard with real-time updates and trend analysis.
 */

import { 
  KPIMetric, 
  KPICategory, 
  TrendDirection, 
  KPIStatus,
  DateRangeFilter,
  ComparisonData,
  TrendData
} from './types';

// ============================================================================
// KPI CALCULATION ENGINE
// ============================================================================

export class KPICalculator {
  private cache: Map<string, { data: any; timestamp: Date; ttl: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Calculate all KPIs for a clinic within a date range
   */
  async calculateAllKPIs(
    clinicId: string, 
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric[]> {
    const cacheKey = `all-kpis-${clinicId}-${dateRange.start.getTime()}-${dateRange.end.getTime()}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const [financialKPIs, operationalKPIs, patientKPIs, staffKPIs] = await Promise.all([
        this.calculateFinancialKPIs(clinicId, dateRange, compareWith),
        this.calculateOperationalKPIs(clinicId, dateRange, compareWith),
        this.calculatePatientKPIs(clinicId, dateRange, compareWith),
        this.calculateStaffKPIs(clinicId, dateRange, compareWith)
      ]);

      const allKPIs = [
        ...financialKPIs,
        ...operationalKPIs,
        ...patientKPIs,
        ...staffKPIs
      ];

      // Cache the results
      this.setCache(cacheKey, allKPIs);
      
      return allKPIs;
    } catch (error) {
      console.error('Error calculating KPIs:', error);
      throw new Error('Failed to calculate KPIs');
    }
  }

  /**
   * Calculate Financial KPIs
   */
  async calculateFinancialKPIs(
    clinicId: string,
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric[]> {
    const [revenue, profit, avgTicket, growth] = await Promise.all([
      this.calculateTotalRevenue(clinicId, dateRange, compareWith),
      this.calculateProfitMargin(clinicId, dateRange, compareWith),
      this.calculateAverageTicket(clinicId, dateRange, compareWith),
      this.calculateMonthlyGrowth(clinicId, dateRange, compareWith)
    ]);

    return [revenue, profit, avgTicket, growth];
  }

  /**
   * Calculate Operational KPIs
   */
  async calculateOperationalKPIs(
    clinicId: string,
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric[]> {
    const [occupancy, productivity, avgTime] = await Promise.all([
      this.calculateOccupancyRate(clinicId, dateRange, compareWith),
      this.calculateProductivityRate(clinicId, dateRange, compareWith),
      this.calculateAverageServiceTime(clinicId, dateRange, compareWith)
    ]);

    return [occupancy, productivity, avgTime];
  }

  /**
   * Calculate Patient KPIs
   */
  async calculatePatientKPIs(
    clinicId: string,
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric[]> {
    const [newPatients, retention, satisfaction, noShows] = await Promise.all([
      this.calculateNewPatients(clinicId, dateRange, compareWith),
      this.calculateRetentionRate(clinicId, dateRange, compareWith),
      this.calculateSatisfactionScore(clinicId, dateRange, compareWith),
      this.calculateNoShowRate(clinicId, dateRange, compareWith)
    ]);

    return [newPatients, retention, satisfaction, noShows];
  }

  /**
   * Calculate Staff KPIs
   */
  async calculateStaffKPIs(
    clinicId: string,
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric[]> {
    const [utilization, productivity, satisfaction] = await Promise.all([
      this.calculateStaffUtilization(clinicId, dateRange, compareWith),
      this.calculateStaffProductivity(clinicId, dateRange, compareWith),
      this.calculateStaffSatisfaction(clinicId, dateRange, compareWith)
    ]);

    return [utilization, productivity, satisfaction];
  }

  // ============================================================================
  // FINANCIAL KPI CALCULATIONS
  // ============================================================================

  private async calculateTotalRevenue(
    clinicId: string,
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric> {
    // Mock calculation - replace with actual database query
    const currentRevenue = await this.queryDatabase(`
      SELECT COALESCE(SUM(amount), 0) as total_revenue
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      WHERE a.clinic_id = $1 
        AND p.status = 'completed'
        AND p.created_at BETWEEN $2 AND $3
    `, [clinicId, dateRange.start, dateRange.end]);

    let previousRevenue = 0;
    if (compareWith) {
      const prevResult = await this.queryDatabase(`
        SELECT COALESCE(SUM(amount), 0) as total_revenue
        FROM payments p
        JOIN appointments a ON p.appointment_id = a.id
        WHERE a.clinic_id = $1 
          AND p.status = 'completed'
          AND p.created_at BETWEEN $2 AND $3
      `, [clinicId, compareWith.start, compareWith.end]);
      previousRevenue = prevResult.total_revenue;
    }

    const value = currentRevenue.total_revenue;
    const changeAbsolute = value - previousRevenue;
    const changePercent = previousRevenue > 0 ? (changeAbsolute / previousRevenue) * 100 : 0;
    const trend = this.determineTrend(changePercent);
    const status = this.determineKPIStatus('revenue', value, changePercent);

    return {
      id: 'total-revenue',
      name: 'Receita Total',
      category: 'financial',
      value,
      previousValue: previousRevenue,
      target: 100000, // Example target
      unit: 'BRL',
      format: 'currency',
      trend,
      changePercent,
      changeAbsolute,
      status,
      lastUpdated: new Date(),
      metadata: {
        description: 'Receita total gerada no período',
        calculation: 'Soma de todos os pagamentos confirmados',
        dataSource: 'payments table',
        updateFrequency: 'Real-time',
        businessImpact: 'Indicador principal de performance financeira'
      }
    };
  }

  private async calculateProfitMargin(
    clinicId: string,
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric> {
    // Mock calculation - replace with actual database query
    const revenueAndCosts = await this.queryDatabase(`
      SELECT 
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COALESCE(SUM(c.amount), 0) as total_costs
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      LEFT JOIN costs c ON c.clinic_id = a.clinic_id 
        AND c.created_at BETWEEN $2 AND $3
      WHERE a.clinic_id = $1 
        AND p.status = 'completed'
        AND p.created_at BETWEEN $2 AND $3
    `, [clinicId, dateRange.start, dateRange.end]);

    const revenue = revenueAndCosts.total_revenue;
    const costs = revenueAndCosts.total_costs;
    const profit = revenue - costs;
    const value = revenue > 0 ? (profit / revenue) * 100 : 0;

    let previousValue = 0;
    if (compareWith) {
      const prevResult = await this.queryDatabase(`
        SELECT 
          COALESCE(SUM(p.amount), 0) as total_revenue,
          COALESCE(SUM(c.amount), 0) as total_costs
        FROM payments p
        JOIN appointments a ON p.appointment_id = a.id
        LEFT JOIN costs c ON c.clinic_id = a.clinic_id 
          AND c.created_at BETWEEN $2 AND $3
        WHERE a.clinic_id = $1 
          AND p.status = 'completed'
          AND p.created_at BETWEEN $2 AND $3
      `, [clinicId, compareWith.start, compareWith.end]);
      
      const prevRevenue = prevResult.total_revenue;
      const prevCosts = prevResult.total_costs;
      const prevProfit = prevRevenue - prevCosts;
      previousValue = prevRevenue > 0 ? (prevProfit / prevRevenue) * 100 : 0;
    }

    const changeAbsolute = value - previousValue;
    const changePercent = previousValue > 0 ? (changeAbsolute / previousValue) * 100 : 0;
    const trend = this.determineTrend(changePercent);
    const status = this.determineKPIStatus('profit_margin', value, changePercent);

    return {
      id: 'profit-margin',
      name: 'Margem de Lucro',
      category: 'financial',
      value,
      previousValue,
      target: 30, // 30% target margin
      unit: '%',
      format: 'percentage',
      trend,
      changePercent,
      changeAbsolute,
      status,
      lastUpdated: new Date(),
      metadata: {
        description: 'Margem de lucro sobre a receita total',
        calculation: '(Receita - Custos) / Receita * 100',
        dataSource: 'payments and costs tables',
        updateFrequency: 'Real-time',
        businessImpact: 'Indica eficiência operacional e rentabilidade'
      }
    };
  }

  private async calculateAverageTicket(
    clinicId: string,
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric> {
    const result = await this.queryDatabase(`
      SELECT 
        COALESCE(AVG(p.amount), 0) as avg_ticket,
        COUNT(p.id) as total_payments
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      WHERE a.clinic_id = $1 
        AND p.status = 'completed'
        AND p.created_at BETWEEN $2 AND $3
    `, [clinicId, dateRange.start, dateRange.end]);

    const value = result.avg_ticket;
    let previousValue = 0;

    if (compareWith) {
      const prevResult = await this.queryDatabase(`
        SELECT COALESCE(AVG(p.amount), 0) as avg_ticket
        FROM payments p
        JOIN appointments a ON p.appointment_id = a.id
        WHERE a.clinic_id = $1 
          AND p.status = 'completed'
          AND p.created_at BETWEEN $2 AND $3
      `, [clinicId, compareWith.start, compareWith.end]);
      previousValue = prevResult.avg_ticket;
    }

    const changeAbsolute = value - previousValue;
    const changePercent = previousValue > 0 ? (changeAbsolute / previousValue) * 100 : 0;
    const trend = this.determineTrend(changePercent);
    const status = this.determineKPIStatus('avg_ticket', value, changePercent);

    return {
      id: 'average-ticket',
      name: 'Ticket Médio',
      category: 'financial',
      value,
      previousValue,
      target: 500, // Example target
      unit: 'BRL',
      format: 'currency',
      trend,
      changePercent,
      changeAbsolute,
      status,
      lastUpdated: new Date(),
      metadata: {
        description: 'Valor médio por transação',
        calculation: 'Receita Total / Número de Pagamentos',
        dataSource: 'payments table',
        updateFrequency: 'Real-time',
        businessImpact: 'Indica valor percebido dos serviços'
      }
    };
  }

  private async calculateMonthlyGrowth(
    clinicId: string,
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric> {
    // Calculate month-over-month growth
    const currentMonth = await this.queryDatabase(`
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      WHERE a.clinic_id = $1 
        AND p.status = 'completed'
        AND p.created_at BETWEEN $2 AND $3
    `, [clinicId, dateRange.start, dateRange.end]);

    // Get previous month for comparison
    const prevMonthStart = new Date(dateRange.start);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(dateRange.end);
    prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);

    const previousMonth = await this.queryDatabase(`
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.id
      WHERE a.clinic_id = $1 
        AND p.status = 'completed'
        AND p.created_at BETWEEN $2 AND $3
    `, [clinicId, prevMonthStart, prevMonthEnd]);

    const currentRevenue = currentMonth.revenue;
    const previousRevenue = previousMonth.revenue;
    const value = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const trend = this.determineTrend(value);
    const status = this.determineKPIStatus('growth', value, 0);

    return {
      id: 'monthly-growth',
      name: 'Crescimento Mensal',
      category: 'financial',
      value,
      previousValue: 0, // Growth is already a comparison
      target: 10, // 10% monthly growth target
      unit: '%',
      format: 'percentage',
      trend,
      changePercent: 0,
      changeAbsolute: 0,
      status,
      lastUpdated: new Date(),
      metadata: {
        description: 'Crescimento da receita mês a mês',
        calculation: '(Receita Atual - Receita Anterior) / Receita Anterior * 100',
        dataSource: 'payments table',
        updateFrequency: 'Monthly',
        businessImpact: 'Indica tendência de crescimento do negócio'
      }
    };
  }

  // ============================================================================
  // OPERATIONAL KPI CALCULATIONS
  // ============================================================================

  private async calculateOccupancyRate(
    clinicId: string,
    dateRange: DateRangeFilter,
    compareWith?: DateRangeFilter
  ): Promise<KPIMetric> {
    const result = await this.queryDatabase(`
      SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(*) as total_slots
      FROM appointments
      WHERE clinic_id = $1 
        AND scheduled_at BETWEEN $2 AND $3
    `, [clinicId, dateRange.start, dateRange.end]);

    const value = result.total_slots > 0 ? (result.completed_appointments / result.total_slots) * 100 : 0;
    let previousValue = 0;

    if (compareWith) {
      const prevResult = await this.queryDatabase(`
        SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
          COUNT(*) as total_slots
        FROM appointments
        WHERE clinic_id = $1 
          AND scheduled_at BETWEEN $2 AND $3
      `, [clinicId, compareWith.start, compareWith.end]);
      previousValue = prevResult.total_slots > 0 ? (prevResult.completed_appointments / prevResult.total_slots) * 100 : 0;
    }

    const changeAbsolute = value - previousValue;
    const changePercent = previousValue > 0 ? (changeAbsolute / previousValue) * 100 : 0;
    const trend = this.determineTrend(changePercent);
    const status = this.determineKPIStatus('occupancy', value, changePercent);

    return {
      id: 'occupancy-rate',
      name: 'Taxa de Ocupação',
      category: 'operational',
      value,
      previousValue,
      target: 85, // 85% target occupancy
      unit: '%',
      format: 'percentage',
      trend,
      changePercent,
      changeAbsolute,
      status,
      lastUpdated: new Date(),
      metadata: {
        description: 'Percentual de horários ocupados',
        calculation: 'Agendamentos Realizados / Total de Slots * 100',
        dataSource: 'appointments table',
        updateFrequency: 'Real-time',
        businessImpact: 'Indica eficiência na utilização da capacidade'
      }
    };
  }

  // Continue with other KPI calculations...
  // (Due to length constraints, I'll implement the remaining methods in the next chunk)

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private determineTrend(changePercent: number): TrendDirection {
    if (Math.abs(changePercent) < 1) return 'stable';
    return changePercent > 0 ? 'up' : 'down';
  }

  private determineKPIStatus(kpiType: string, value: number, changePercent: number): KPIStatus {
    // Define status thresholds based on KPI type
    const thresholds = {
      revenue: { excellent: 0.2, good: 0.1, warning: -0.05 },
      profit_margin: { excellent: 30, good: 20, warning: 10 },
      avg_ticket: { excellent: 0.15, good: 0.05, warning: -0.1 },
      growth: { excellent: 15, good: 5, warning: 0 },
      occupancy: { excellent: 90, good: 80, warning: 70 },
      // Add more thresholds as needed
    };

    const threshold = thresholds[kpiType as keyof typeof thresholds];
    if (!threshold) return 'unknown';

    if (kpiType === 'growth' || kpiType.includes('rate') || kpiType.includes('margin')) {
      if (value >= threshold.excellent) return 'excellent';
      if (value >= threshold.good) return 'good';
      if (value >= threshold.warning) return 'warning';
      return 'critical';
    } else {
      // For change-based metrics
      if (changePercent >= threshold.excellent) return 'excellent';
      if (changePercent >= threshold.good) return 'good';
      if (changePercent >= threshold.warning) return 'warning';
      return 'critical';
    }
  }

  private async queryDatabase(query: string, params: any[]): Promise<any> {
    // Mock database query - replace with actual Supabase client
    // This is a placeholder that returns mock data
    console.log('Executing query:', query, 'with params:', params);
    
    // Return mock data based on query type
    if (query.includes('total_revenue')) {
      return { total_revenue: Math.random() * 100000 };
    }
    if (query.includes('avg_ticket')) {
      return { avg_ticket: Math.random() * 1000, total_payments: Math.floor(Math.random() * 100) };
    }
    if (query.includes('completed_appointments')) {
      return { 
        completed_appointments: Math.floor(Math.random() * 80), 
        total_slots: 100 
      };
    }
    
    return {};
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp.getTime() > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl
    });
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const kpiCalculator = new KPICalculator();
