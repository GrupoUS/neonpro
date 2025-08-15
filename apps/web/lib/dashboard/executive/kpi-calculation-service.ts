import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';

// Types and Schemas
export const KPIDefinitionSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(255),
  category: z.enum(['financial', 'operational', 'patient', 'staff']),
  calculationMethod: z.string().min(1),
  targetValue: z.number().optional(),
  warningThreshold: z.number().optional(),
  criticalThreshold: z.number().optional(),
  unit: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const KPIValueSchema = z.object({
  id: z.string().uuid(),
  kpiId: z.string().uuid(),
  clinicId: z.string().uuid(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  value: z.number(),
  previousValue: z.number().optional(),
  targetValue: z.number().optional(),
  status: z.enum(['normal', 'warning', 'critical']).default('normal'),
  calculatedAt: z.string().datetime(),
});

export const KPICalculationResultSchema = z.object({
  kpi: KPIDefinitionSchema,
  currentValue: z.number(),
  previousValue: z.number().optional(),
  targetValue: z.number().optional(),
  variance: z.number().optional(),
  variancePercent: z.number().optional(),
  status: z.enum(['normal', 'warning', 'critical']),
  trend: z.enum(['up', 'down', 'stable']).optional(),
  formattedValue: z.string(),
  formattedPreviousValue: z.string().optional(),
  calculatedAt: z.string().datetime(),
});

export type KPIDefinition = z.infer<typeof KPIDefinitionSchema>;
export type KPIValue = z.infer<typeof KPIValueSchema>;
export type KPICalculationResult = z.infer<typeof KPICalculationResultSchema>;

// KPI Calculation Service
export class KPICalculationService {
  private readonly supabase = createClient();
  private readonly cache = new Map<string, KPICalculationResult>();
  private readonly cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Calculate all KPIs for a clinic
   */
  async calculateClinicKPIs(
    clinicId: string,
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<KPICalculationResult[]> {
    try {
      const period = this.normalizePeriod(periodStart, periodEnd);
      const cacheKey = `clinic_${clinicId}_${period.start.toISOString()}_${period.end.toISOString()}`;

      // Check cache
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return [cached];
      }

      // Get active KPI definitions
      const { data: kpiDefinitions, error } = await this.supabase
        .from('kpi_definitions')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        logger.error('Error fetching KPI definitions:', error);
        return [];
      }

      const results: KPICalculationResult[] = [];

      for (const kpiDef of kpiDefinitions) {
        const result = await this.calculateSingleKPI(
          kpiDef,
          period.start,
          period.end
        );
        if (result) {
          results.push(result);
          this.setCachedResult(
            `kpi_${kpiDef.id}_${period.start.toISOString()}`,
            result
          );
        }
      }

      return results;
    } catch (error) {
      logger.error('Error calculating clinic KPIs:', error);
      return [];
    }
  }

  /**
   * Calculate single KPI
   */
  async calculateSingleKPI(
    kpiDefinition: any,
    periodStart: Date,
    periodEnd: Date
  ): Promise<KPICalculationResult | null> {
    try {
      const cacheKey = `kpi_${kpiDefinition.id}_${periodStart.toISOString()}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      // Calculate current value
      const currentValue = await this.executeKPICalculation(
        kpiDefinition,
        periodStart,
        periodEnd
      );

      if (currentValue === null) {
        return null;
      }

      // Calculate previous period value for comparison
      const previousPeriod = this.getPreviousPeriod(periodStart, periodEnd);
      const previousValue = await this.executeKPICalculation(
        kpiDefinition,
        previousPeriod.start,
        previousPeriod.end
      );

      // Calculate variance and trend
      const variance =
        previousValue !== null ? currentValue - previousValue : undefined;
      const variancePercent =
        previousValue !== null && previousValue !== 0
          ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
          : undefined;

      const trend = this.calculateTrend(currentValue, previousValue);
      const status = this.calculateStatus(currentValue, kpiDefinition);

      // Format values
      const formattedValue = this.formatKPIValue(
        currentValue,
        kpiDefinition.unit
      );
      const formattedPreviousValue =
        previousValue !== null
          ? this.formatKPIValue(previousValue, kpiDefinition.unit)
          : undefined;

      const result: KPICalculationResult = {
        kpi: {
          id: kpiDefinition.id,
          clinicId: kpiDefinition.clinic_id,
          name: kpiDefinition.name,
          category: kpiDefinition.category,
          calculationMethod: kpiDefinition.calculation_method,
          targetValue: kpiDefinition.target_value,
          warningThreshold: kpiDefinition.warning_threshold,
          criticalThreshold: kpiDefinition.critical_threshold,
          unit: kpiDefinition.unit,
          isActive: kpiDefinition.is_active,
          createdAt: kpiDefinition.created_at,
          updatedAt: kpiDefinition.updated_at,
        },
        currentValue,
        previousValue,
        targetValue: kpiDefinition.target_value,
        variance,
        variancePercent,
        status,
        trend,
        formattedValue,
        formattedPreviousValue,
        calculatedAt: new Date().toISOString(),
      };

      // Store in database
      await this.storeKPIValue(result);

      // Cache result
      this.setCachedResult(cacheKey, result);

      return result;
    } catch (error) {
      logger.error('Error calculating single KPI:', error);
      return null;
    }
  }

  /**
   * Execute KPI calculation based on method
   */
  private async executeKPICalculation(
    kpiDefinition: any,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number | null> {
    try {
      const method = kpiDefinition.calculation_method;
      const clinicId = kpiDefinition.clinic_id;

      switch (method) {
        case 'financial.monthly_revenue':
          return await this.calculateMonthlyRevenue(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'financial.average_ticket':
          return await this.calculateAverageTicket(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'financial.profit_margin':
          return await this.calculateProfitMargin(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'patients.new_patients':
          return await this.calculateNewPatients(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'patients.retention_rate':
          return await this.calculateRetentionRate(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'patients.satisfaction_score':
          return await this.calculateSatisfactionScore(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'operations.occupancy_rate':
          return await this.calculateOccupancyRate(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'operations.no_show_rate':
          return await this.calculateNoShowRate(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'operations.average_wait_time':
          return await this.calculateAverageWaitTime(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'staff.utilization_rate':
          return await this.calculateStaffUtilization(
            clinicId,
            periodStart,
            periodEnd
          );

        case 'staff.productivity_score':
          return await this.calculateStaffProductivity(
            clinicId,
            periodStart,
            periodEnd
          );

        default:
          logger.warn(`Unknown KPI calculation method: ${method}`);
          return null;
      }
    } catch (error) {
      logger.error('Error executing KPI calculation:', error);
      return null;
    }
  }

  // Financial KPI Calculations
  private async calculateMonthlyRevenue(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('amount')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    if (error) {
      logger.error('Error calculating monthly revenue:', error);
      return 0;
    }

    return data.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  }

  private async calculateAverageTicket(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('amount')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    if (error || !data.length) {
      return 0;
    }

    const total = data.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    return total / data.length;
  }

  private async calculateProfitMargin(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    // This would need cost data - simplified calculation
    const revenue = await this.calculateMonthlyRevenue(
      clinicId,
      periodStart,
      periodEnd
    );
    // Assuming 30% cost ratio for now - this should come from actual cost data
    const estimatedCosts = revenue * 0.3;
    const profit = revenue - estimatedCosts;
    return revenue > 0 ? (profit / revenue) * 100 : 0;
  }

  // Patient KPI Calculations
  private async calculateNewPatients(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    const { data, error } = await this.supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', clinicId)
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    if (error) {
      logger.error('Error calculating new patients:', error);
      return 0;
    }

    return data.length;
  }

  private async calculateRetentionRate(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    // Calculate patients who had appointments in both current and previous periods
    const previousPeriod = this.getPreviousPeriod(periodStart, periodEnd);

    const { data: currentPatients, error: currentError } = await this.supabase
      .from('appointments')
      .select('patient_id')
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', periodStart.toISOString())
      .lte('scheduled_at', periodEnd.toISOString());

    const { data: previousPatients, error: previousError } = await this.supabase
      .from('appointments')
      .select('patient_id')
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', previousPeriod.start.toISOString())
      .lte('scheduled_at', previousPeriod.end.toISOString());

    if (currentError || previousError || !previousPatients.length) {
      return 0;
    }

    const currentPatientIds = new Set(currentPatients.map((p) => p.patient_id));
    const previousPatientIds = new Set(
      previousPatients.map((p) => p.patient_id)
    );

    const retainedPatients = Array.from(previousPatientIds).filter((id) =>
      currentPatientIds.has(id)
    ).length;

    return (retainedPatients / previousPatientIds.size) * 100;
  }

  private async calculateSatisfactionScore(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    // This would come from patient feedback/surveys
    // For now, return a mock value based on appointment completion rate
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select('status')
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', periodStart.toISOString())
      .lte('scheduled_at', periodEnd.toISOString());

    if (error || !appointments.length) {
      return 0;
    }

    const completedAppointments = appointments.filter(
      (a) => a.status === 'completed'
    ).length;
    const completionRate = (completedAppointments / appointments.length) * 100;

    // Convert completion rate to satisfaction score (simplified)
    return Math.min(completionRate * 0.05, 5); // Scale to 0-5
  }

  // Operational KPI Calculations
  private async calculateOccupancyRate(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    // Calculate total available slots vs booked slots
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select('status, duration')
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', periodStart.toISOString())
      .lte('scheduled_at', periodEnd.toISOString());

    if (error) {
      return 0;
    }

    // Simplified calculation - in reality would need room/staff availability data
    const totalSlots = appointments.length;
    const bookedSlots = appointments.filter((a) =>
      ['scheduled', 'confirmed', 'completed'].includes(a.status)
    ).length;

    return totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;
  }

  private async calculateNoShowRate(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select('status')
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', periodStart.toISOString())
      .lte('scheduled_at', periodEnd.toISOString());

    if (error || !appointments.length) {
      return 0;
    }

    const noShows = appointments.filter((a) => a.status === 'no_show').length;
    return (noShows / appointments.length) * 100;
  }

  private async calculateAverageWaitTime(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    // This would need actual wait time tracking
    // For now, return a mock calculation based on appointment density
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select('scheduled_at, duration')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .gte('scheduled_at', periodStart.toISOString())
      .lte('scheduled_at', periodEnd.toISOString())
      .order('scheduled_at');

    if (error || !appointments.length) {
      return 0;
    }

    // Simplified calculation - average 5 minutes wait time
    return 5;
  }

  // Staff KPI Calculations
  private async calculateStaffUtilization(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    // This would need staff schedule vs actual work data
    // Simplified calculation based on appointments
    const occupancyRate = await this.calculateOccupancyRate(
      clinicId,
      periodStart,
      periodEnd
    );
    return occupancyRate * 0.9; // Assuming 90% correlation
  }

  private async calculateStaffProductivity(
    clinicId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select('status, staff_id')
      .eq('clinic_id', clinicId)
      .gte('scheduled_at', periodStart.toISOString())
      .lte('scheduled_at', periodEnd.toISOString());

    if (error || !appointments.length) {
      return 0;
    }

    const completedAppointments = appointments.filter(
      (a) => a.status === 'completed'
    ).length;
    return (completedAppointments / appointments.length) * 100;
  }

  // Helper methods
  private normalizePeriod(start?: Date, end?: Date) {
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    return {
      start: start || defaultStart,
      end: end || defaultEnd,
    };
  }

  private getPreviousPeriod(start: Date, end: Date) {
    const duration = end.getTime() - start.getTime();
    return {
      start: new Date(start.getTime() - duration),
      end: new Date(start.getTime() - 1),
    };
  }

  private calculateTrend(
    current: number,
    previous: number | null
  ): 'up' | 'down' | 'stable' {
    if (previous === null) {
      return 'stable';
    }
    if (current > previous) {
      return 'up';
    }
    if (current < previous) {
      return 'down';
    }
    return 'stable';
  }

  private calculateStatus(
    value: number,
    kpiDefinition: any
  ): 'normal' | 'warning' | 'critical' {
    if (
      kpiDefinition.critical_threshold !== null &&
      value <= kpiDefinition.critical_threshold
    ) {
      return 'critical';
    }
    if (
      kpiDefinition.warning_threshold !== null &&
      value <= kpiDefinition.warning_threshold
    ) {
      return 'warning';
    }
    return 'normal';
  }

  private formatKPIValue(value: number, unit?: string): string {
    switch (unit) {
      case 'currency':
      case 'R$':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);

      case 'percent':
      case '%':
        return `${value.toFixed(1)}%`;

      case 'decimal':
        return value.toFixed(2);

      case 'count':
      case 'number':
        return Math.round(value).toString();

      default:
        return value.toString();
    }
  }

  private async storeKPIValue(result: KPICalculationResult): Promise<void> {
    try {
      await this.supabase.from('kpi_values').upsert(
        {
          id: crypto.randomUUID(),
          kpi_id: result.kpi.id,
          clinic_id: result.kpi.clinicId,
          period_start: new Date().toISOString(), // This should be the actual period
          period_end: new Date().toISOString(),
          value: result.currentValue,
          previous_value: result.previousValue,
          target_value: result.targetValue,
          status: result.status,
          calculated_at: result.calculatedAt,
        },
        {
          onConflict: 'kpi_id,period_start,period_end',
        }
      );
    } catch (error) {
      logger.error('Error storing KPI value:', error);
    }
  }

  // Cache management
  private getCachedResult(key: string): KPICalculationResult | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  private setCachedResult(key: string, result: KPICalculationResult): void {
    this.cache.set(key, result);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get real-time KPI updates for dashboard
   */
  async getRealTimeKPIs(clinicId: string): Promise<KPICalculationResult[]> {
    return await this.calculateClinicKPIs(clinicId);
  }
}

// Export singleton instance
export const kpiCalculationService = new KPICalculationService();
