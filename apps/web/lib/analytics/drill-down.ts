// Interactive Drill-down Analysis System
// Description: Multi-level drill-down navigation and contextual filtering system
// Author: Dev Agent
// Date: 2025-01-26

import { createClient } from '@supabase/supabase-js';
import type { DrillDownResult, FinancialKPI } from '@/lib/types/kpi-types';

export type DrillDownContext = {
  breadcrumbs: Array<{
    level: number;
    dimension: string;
    value?: string;
    label: string;
  }>;
  filters: Record<string, any>;
  aggregationLevel: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export type DrillDownPath = {
  currentLevel: number;
  maxLevels: number;
  availableDimensions: string[];
  nextLevelOptions?: string[];
};

export class DrillDownSystem {
  private readonly supabase;
  private readonly cache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.cache = new Map();
  }

  // Main drill-down execution
  async executeDrillDown(
    kpiId: string,
    dimension: string,
    filters: Record<string, any> = {},
    options: {
      aggregationLevel?: string;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      includeSubDimensions?: boolean;
      includeTransactionDetails?: boolean;
    } = {}
  ): Promise<{
    results: DrillDownResult[];
    context: DrillDownContext;
    path: DrillDownPath;
    totalCount: number;
    executionTime: number;
  }> {
    const startTime = Date.now();
    // Get KPI details
    const kpi = await this.getKPIDetails(kpiId);
    if (!kpi) {
      throw new Error('KPI not found');
    }

    // Determine drill-down strategy based on KPI category and dimension
    const _strategy = this.getDrillDownStrategy(kpi, dimension);

    // Execute drill-down analysis
    const results = await this.performDrillDown(
      kpi,
      dimension,
      filters,
      options
    );

    // Generate context and navigation path
    const context = this.buildDrillDownContext(dimension, filters, options);
    const path = this.buildDrillDownPath(
      kpi,
      dimension,
      context.breadcrumbs.length
    );

    // Add sub-dimensions if requested
    if (options.includeSubDimensions) {
      for (const result of results) {
        result.sub_dimensions = await this.getSubDimensions(
          kpi,
          dimension,
          result,
          filters
        );
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      results: results.slice(0, options.limit || 50),
      context,
      path,
      totalCount: results.length,
      executionTime,
    };
  }

  // Time-based drill-down
  async drillDownByTime(
    kpi: FinancialKPI,
    aggregationLevel: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year',
    filters: Record<string, any> = {}
  ): Promise<DrillDownResult[]> {
    const cacheKey = `time_drill_${kpi.id}_${aggregationLevel}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    let dateFormat: string;
    let groupBy: string;

    switch (aggregationLevel) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24:00:00';
        groupBy = "DATE_TRUNC('hour', created_at)";
        break;
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        groupBy = "DATE_TRUNC('day', created_at)";
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        groupBy = "DATE_TRUNC('week', created_at)";
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        groupBy = "DATE_TRUNC('month', created_at)";
        break;
      case 'quarter':
        dateFormat = 'YYYY-"Q"Q';
        groupBy = "DATE_TRUNC('quarter', created_at)";
        break;
      case 'year':
        dateFormat = 'YYYY';
        groupBy = "DATE_TRUNC('year', created_at)";
        break;
    }

    const results: DrillDownResult[] = [];

    if (kpi.kpi_category === 'revenue') {
      const query = `
        SELECT 
          TO_CHAR(${groupBy}, '${dateFormat}') as period,
          SUM(amount) as value,
          COUNT(*) as transaction_count
        FROM invoices 
        WHERE status = 'paid'
        ${filters.start_date ? `AND created_at >= '${filters.start_date}'` : ''}
        ${filters.end_date ? `AND created_at <= '${filters.end_date}'` : ''}
        ${filters.service_types ? `AND service_type = ANY(ARRAY[${filters.service_types.map((s: string) => `'${s}'`).join(',')}])` : ''}
        GROUP BY ${groupBy}
        ORDER BY ${groupBy} DESC
      `;

      const { data, error } = await this.supabase.rpc('execute_sql', { query });
      if (error) {
        throw error;
      }

      const totalValue = data.reduce(
        (sum: number, row: any) => sum + Number.parseFloat(row.value),
        0
      );

      results.push(
        ...data.map((row: any) => ({
          dimension_value: row.period,
          value: Number.parseFloat(row.value),
          percentage_of_total: totalValue
            ? (Number.parseFloat(row.value) / totalValue) * 100
            : 0,
          transaction_count: Number.parseInt(row.transaction_count, 10),
          metadata: {
            aggregation_level: aggregationLevel,
            period_start: row.period,
          },
        }))
      );
    }

    this.setCache(cacheKey, results);
    return results;
  }

  // Service type drill-down
  async drillDownByServiceType(
    kpi: FinancialKPI,
    filters: Record<string, any> = {}
  ): Promise<DrillDownResult[]> {
    const cacheKey = `service_drill_${kpi.id}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const results: DrillDownResult[] = [];

    if (
      kpi.kpi_category === 'revenue' ||
      kpi.kpi_category === 'profitability'
    ) {
      let query = this.supabase
        .from('invoices')
        .select('service_type, amount, direct_costs')
        .eq('status', 'paid');

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      if (filters.providers?.length) {
        query = query.in('provider_id', filters.providers);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      // Group by service type
      const serviceGroups = data.reduce(
        (acc, invoice) => {
          const service = invoice.service_type || 'Unknown';
          if (!acc[service]) {
            acc[service] = {
              revenue: 0,
              costs: 0,
              count: 0,
            };
          }
          acc[service].revenue += invoice.amount;
          acc[service].costs += invoice.direct_costs || 0;
          acc[service].count += 1;
          return acc;
        },
        {} as Record<string, any>
      );

      const totalRevenue = Object.values(serviceGroups).reduce(
        (sum: number, group: any) => sum + group.revenue,
        0
      );

      results.push(
        ...Object.entries(serviceGroups).map(
          ([service, data]: [string, any]) => ({
            dimension_value: service,
            value:
              kpi.kpi_name === 'Gross Profit Margin'
                ? data.revenue
                  ? ((data.revenue - data.costs) / data.revenue) * 100
                  : 0
                : data.revenue,
            percentage_of_total: totalRevenue
              ? (data.revenue / totalRevenue) * 100
              : 0,
            transaction_count: data.count,
            metadata: {
              revenue: data.revenue,
              costs: data.costs,
              profit_margin: data.revenue
                ? ((data.revenue - data.costs) / data.revenue) * 100
                : 0,
            },
          })
        )
      );
    }

    this.setCache(cacheKey, results);
    return results;
  }

  // Provider drill-down
  async drillDownByProvider(
    kpi: FinancialKPI,
    filters: Record<string, any> = {}
  ): Promise<DrillDownResult[]> {
    const cacheKey = `provider_drill_${kpi.id}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const results: DrillDownResult[] = [];

    // Get provider performance data
    let query = this.supabase.from('appointments').select(`
        provider_id,
        providers(name),
        invoices(amount, direct_costs),
        status
      `);

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.service_types?.length) {
      query = query.in('service_type', filters.service_types);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    // Group by provider
    const providerGroups = data.reduce(
      (acc, appointment) => {
        const providerId = appointment.provider_id;
        const providerName = appointment.providers?.name || 'Unknown Provider';

        if (!acc[providerId]) {
          acc[providerId] = {
            name: providerName,
            revenue: 0,
            costs: 0,
            appointments: 0,
            completed: 0,
          };
        }

        acc[providerId].appointments += 1;
        if (appointment.status === 'completed') {
          acc[providerId].completed += 1;
          if (appointment.invoices) {
            acc[providerId].revenue += appointment.invoices.amount || 0;
            acc[providerId].costs += appointment.invoices.direct_costs || 0;
          }
        }

        return acc;
      },
      {} as Record<string, any>
    );

    const totalRevenue = Object.values(providerGroups).reduce(
      (sum: number, group: any) => sum + group.revenue,
      0
    );

    results.push(
      ...Object.entries(providerGroups).map(
        ([providerId, data]: [string, any]) => ({
          dimension_value: data.name,
          value:
            kpi.kpi_category === 'revenue'
              ? data.revenue
              : kpi.kpi_name === 'Appointment Utilization'
                ? data.appointments
                  ? (data.completed / data.appointments) * 100
                  : 0
                : data.revenue,
          percentage_of_total: totalRevenue
            ? (data.revenue / totalRevenue) * 100
            : 0,
          transaction_count: data.appointments,
          metadata: {
            provider_id: providerId,
            revenue: data.revenue,
            costs: data.costs,
            appointments: data.appointments,
            completion_rate: data.appointments
              ? (data.completed / data.appointments) * 100
              : 0,
          },
        })
      )
    );

    this.setCache(cacheKey, results);
    return results;
  }

  // Patient segment drill-down
  async drillDownByPatientSegment(
    kpi: FinancialKPI,
    filters: Record<string, any> = {}
  ): Promise<DrillDownResult[]> {
    const cacheKey = `patient_drill_${kpi.id}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const results: DrillDownResult[] = [];

    // Get patient data with segmentation
    let query = this.supabase.from('patients').select(`
        id,
        age,
        gender,
        insurance_type,
        created_at,
        appointments(count),
        invoices(amount)
      `);

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    // Segment patients by age groups
    const ageSegments = data.reduce(
      (acc, patient) => {
        let ageGroup: string;
        const age = patient.age || 0;

        if (age < 18) {
          ageGroup = 'Under 18';
        } else if (age < 30) {
          ageGroup = '18-29';
        } else if (age < 45) {
          ageGroup = '30-44';
        } else if (age < 60) {
          ageGroup = '45-59';
        } else {
          ageGroup = '60+';
        }

        if (!acc[ageGroup]) {
          acc[ageGroup] = {
            count: 0,
            revenue: 0,
            appointments: 0,
          };
        }

        acc[ageGroup].count += 1;
        acc[ageGroup].revenue +=
          patient.invoices?.reduce(
            (sum: number, inv: any) => sum + (inv.amount || 0),
            0
          ) || 0;
        acc[ageGroup].appointments += patient.appointments?.length || 0;

        return acc;
      },
      {} as Record<string, any>
    );

    const totalPatients = Object.values(ageSegments).reduce(
      (sum: number, segment: any) => sum + segment.count,
      0
    );

    results.push(
      ...Object.entries(ageSegments).map(([segment, data]: [string, any]) => ({
        dimension_value: segment,
        value:
          kpi.kpi_name === 'Revenue Per Patient'
            ? data.count
              ? data.revenue / data.count
              : 0
            : data.count,
        percentage_of_total: totalPatients
          ? (data.count / totalPatients) * 100
          : 0,
        transaction_count: data.appointments,
        metadata: {
          patient_count: data.count,
          total_revenue: data.revenue,
          total_appointments: data.appointments,
          avg_revenue_per_patient: data.count ? data.revenue / data.count : 0,
        },
      }))
    );

    this.setCache(cacheKey, results);
    return results;
  }

  // Navigation and context management
  private buildDrillDownContext(
    dimension: string,
    filters: Record<string, any>,
    options: any
  ): DrillDownContext {
    const breadcrumbs = [
      {
        level: 0,
        dimension: 'overview',
        label: 'KPI Overview',
      },
      {
        level: 1,
        dimension,
        label: this.getDimensionLabel(dimension),
      },
    ];

    return {
      breadcrumbs,
      filters,
      aggregationLevel: options.aggregationLevel || 'month',
      sortBy: options.sortBy || 'value',
      sortOrder: options.sortOrder || 'desc',
    };
  }

  private buildDrillDownPath(
    kpi: FinancialKPI,
    currentDimension: string,
    currentLevel: number
  ): DrillDownPath {
    const availableDimensions = this.getAvailableDimensions(kpi);
    const maxLevels = this.getMaxDrillLevels(kpi);
    const nextLevelOptions = this.getNextLevelOptions(
      currentDimension,
      currentLevel
    );

    return {
      currentLevel,
      maxLevels,
      availableDimensions,
      nextLevelOptions,
    };
  }

  // Helper methods
  private getDrillDownStrategy(kpi: FinancialKPI, dimension: string): string {
    // Return optimal strategy based on KPI type and dimension
    return `${kpi.kpi_category}_${dimension}`;
  }

  private async performDrillDown(
    kpi: FinancialKPI,
    dimension: string,
    filters: Record<string, any>,
    options: any
  ): Promise<DrillDownResult[]> {
    switch (dimension) {
      case 'time':
        return this.drillDownByTime(
          kpi,
          options.aggregationLevel || 'month',
          filters
        );
      case 'service_type':
        return this.drillDownByServiceType(kpi, filters);
      case 'provider':
        return this.drillDownByProvider(kpi, filters);
      case 'patient_segment':
        return this.drillDownByPatientSegment(kpi, filters);
      default:
        throw new Error(`Unsupported drill-down dimension: ${dimension}`);
    }
  }

  private async getSubDimensions(
    kpi: FinancialKPI,
    parentDimension: string,
    parentResult: DrillDownResult,
    filters: Record<string, any>
  ): Promise<DrillDownResult[]> {
    // Get sub-dimensions for the current drill-down level
    const subFilters = {
      ...filters,
      [parentDimension]: parentResult.dimension_value,
    };

    // Determine next dimension based on current one
    const nextDimension = this.getNextDimension(parentDimension);
    if (!nextDimension) {
      return [];
    }

    return this.performDrillDown(kpi, nextDimension, subFilters, { limit: 5 });
  }

  private getAvailableDimensions(kpi: FinancialKPI): string[] {
    const baseDimensions = ['time', 'service_type'];

    if (kpi.kpi_category === 'operational') {
      baseDimensions.push('provider', 'patient_segment');
    }

    if (
      kpi.kpi_category === 'revenue' ||
      kpi.kpi_category === 'profitability'
    ) {
      baseDimensions.push('provider', 'patient_segment');
    }

    return baseDimensions;
  }

  private getMaxDrillLevels(_kpi: FinancialKPI): number {
    // Most KPIs support 3-4 drill levels
    return 4;
  }

  private getNextLevelOptions(
    dimension: string,
    _level: number
  ): string[] | undefined {
    const dimensionHierarchy: Record<string, string[]> = {
      time: ['service_type', 'provider'],
      service_type: ['provider', 'patient_segment'],
      provider: ['patient_segment', 'time'],
      patient_segment: ['service_type', 'time'],
    };

    return dimensionHierarchy[dimension];
  }

  private getNextDimension(currentDimension: string): string | null {
    const nextDimensions: Record<string, string> = {
      time: 'service_type',
      service_type: 'provider',
      provider: 'patient_segment',
    };

    return nextDimensions[currentDimension] || null;
  }

  private getDimensionLabel(dimension: string): string {
    const labels: Record<string, string> = {
      time: 'Time Period',
      service_type: 'Service Type',
      provider: 'Provider',
      patient_segment: 'Patient Segment',
      location: 'Location',
    };

    return labels[dimension] || dimension;
  }

  // Cache and database helpers
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > 300_000) {
      // 5 minutes
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private async getKPIDetails(id: string): Promise<FinancialKPI | null> {
    const { data, error } = await this.supabase
      .from('financial_kpis')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }
    return data;
  }
}

// Export singleton instance
export const drillDownSystem = new DrillDownSystem();
