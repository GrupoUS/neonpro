import type { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type SupabaseClient = ReturnType<typeof createClient>;

// Core Analytics Interfaces
export interface SchedulingMetrics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  averageAppointmentDuration: number;
  utilizationRate: number;
  revenueGenerated: number;
  patientSatisfactionScore: number;
  staffEfficiencyScore: number;
  peakHours: string[];
  bottleneckIdentified: string[];
}

export interface AppointmentPattern {
  dayOfWeek: string;
  hour: number;
  appointmentCount: number;
  averageDuration: number;
  cancellationRate: number;
  noShowRate: number;
  revenuePerHour: number;
  staffUtilization: number;
}

export interface SeasonalTrend {
  period: string; // 'daily' | 'weekly' | 'monthly' | 'quarterly'
  date: string;
  appointmentVolume: number;
  revenueVolume: number;
  averageValue: number;
  growthRate: number;
  seasonalIndex: number;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  appointmentsCompleted: number;
  averageAppointmentDuration: number;
  utilizationRate: number;
  patientSatisfactionScore: number;
  revenueGenerated: number;
  efficiencyScore: number;
  skillUtilizationRate: number;
  workloadBalance: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenuePerAppointment: number;
  revenuePerHour: number;
  revenuePerStaff: number;
  profitMargin: number;
  appointmentValueDistribution: { range: string; count: number; revenue: number }[];
  treatmentTypeRevenue: { type: string; revenue: number; count: number }[];
  patientLifetimeValue: number;
  forecastedRevenue: number;
}

export interface OperationalEfficiency {
  averageWaitTime: number;
  appointmentAccuracy: number; // actual vs scheduled duration
  resourceUtilization: number;
  bottlenecks: { location: string; severity: number; impact: string }[];
  patientFlowRate: number;
  operationalCostPerAppointment: number;
  capacityUtilization: number;
}

export interface PredictiveInsights {
  demandForecast: { date: string; predictedAppointments: number; confidence: number }[];
  capacityRecommendations: { period: string; recommendedCapacity: number; reasoning: string }[];
  staffingOptimization: { date: string; recommendedStaff: number; skillMix: string[] }[];
  revenueProjection: { period: string; projectedRevenue: number; factors: string[] }[];
  riskAlerts: { type: string; severity: "low" | "medium" | "high"; description: string }[];
}

export interface BenchmarkData {
  metricName: string;
  industryAverage: number;
  clinicValue: number;
  percentileRank: number;
  performanceGap: number;
  improvementPotential: number;
}

export interface AnalyticsFilter {
  startDate: Date;
  endDate: Date;
  staffIds?: string[];
  appointmentTypes?: string[];
  departments?: string[];
  patientSegments?: string[];
  granularity: "hour" | "day" | "week" | "month" | "quarter";
}

export interface AnalyticsAlert {
  id: string;
  type: "performance" | "revenue" | "efficiency" | "capacity";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  trend: "improving" | "declining" | "stable";
  actionRequired: boolean;
  recommendations: string[];
  createdAt: Date;
}

/**
 * Advanced Scheduling Analytics System
 * Provides comprehensive analytics, insights, and predictive capabilities
 * for clinic scheduling optimization and business intelligence
 */
export class SchedulingAnalytics {
  private supabase: SupabaseClient;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.supabase = createClient();
    this.cache = new Map();
  }

  /**
   * Get comprehensive scheduling metrics for dashboard
   */
  async getSchedulingMetrics(filter: AnalyticsFilter): Promise<SchedulingMetrics> {
    const cacheKey = `metrics_${JSON.stringify(filter)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get appointment data
      const { data: appointments, error } = await this.supabase
        .from("appointments")
        .select(`
          *,
          patients(id, name),
          staff(id, name),
          services(id, name, duration, price)
        `)
        .gte("scheduled_at", filter.startDate.toISOString())
        .lte("scheduled_at", filter.endDate.toISOString());

      if (error) throw error;

      // Calculate metrics
      const totalAppointments = appointments?.length || 0;
      const completedAppointments =
        appointments?.filter((a) => a.status === "completed").length || 0;
      const cancelledAppointments =
        appointments?.filter((a) => a.status === "cancelled").length || 0;
      const noShowAppointments = appointments?.filter((a) => a.status === "no_show").length || 0;

      const avgDuration =
        appointments?.reduce(
          (sum, a) => sum + (a.actual_duration || a.scheduled_duration || 0),
          0,
        ) / totalAppointments || 0;

      // Calculate utilization rate
      const totalScheduledHours = this.calculateTotalScheduledHours(filter);
      const totalUsedHours =
        appointments?.reduce(
          (sum, a) => sum + (a.actual_duration || a.scheduled_duration || 0) / 60,
          0,
        ) || 0;
      const utilizationRate =
        totalScheduledHours > 0 ? (totalUsedHours / totalScheduledHours) * 100 : 0;

      // Calculate revenue
      const revenueGenerated =
        appointments?.reduce((sum, a) => {
          return sum + (a.services?.price || 0);
        }, 0) || 0;

      // Get satisfaction and efficiency scores
      const patientSatisfactionScore = await this.calculatePatientSatisfaction(filter);
      const staffEfficiencyScore = await this.calculateStaffEfficiency(filter);

      // Identify peak hours and bottlenecks
      const peakHours = await this.identifyPeakHours(filter);
      const bottleneckIdentified = await this.identifyBottlenecks(filter);

      const metrics: SchedulingMetrics = {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        averageAppointmentDuration: avgDuration,
        utilizationRate,
        revenueGenerated,
        patientSatisfactionScore,
        staffEfficiencyScore,
        peakHours,
        bottleneckIdentified,
      };

      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error("Error getting scheduling metrics:", error);
      throw new Error("Failed to retrieve scheduling metrics");
    }
  }

  /**
   * Analyze appointment patterns and trends
   */
  async getAppointmentPatterns(filter: AnalyticsFilter): Promise<AppointmentPattern[]> {
    const cacheKey = `patterns_${JSON.stringify(filter)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data: appointments, error } = await this.supabase
        .from("appointments")
        .select(`
          scheduled_at,
          actual_duration,
          scheduled_duration,
          status,
          services(price)
        `)
        .gte("scheduled_at", filter.startDate.toISOString())
        .lte("scheduled_at", filter.endDate.toISOString());

      if (error) throw error;

      // Group by day of week and hour
      const patterns = new Map<
        string,
        {
          appointments: any[];
          totalDuration: number;
          cancelled: number;
          noShows: number;
          revenue: number;
        }
      >();

      appointments?.forEach((appointment) => {
        const date = new Date(appointment.scheduled_at);
        const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
        const hour = date.getHours();
        const key = `${dayOfWeek}_${hour}`;

        if (!patterns.has(key)) {
          patterns.set(key, {
            appointments: [],
            totalDuration: 0,
            cancelled: 0,
            noShows: 0,
            revenue: 0,
          });
        }

        const pattern = patterns.get(key)!;
        pattern.appointments.push(appointment);
        pattern.totalDuration += appointment.actual_duration || appointment.scheduled_duration || 0;

        if (appointment.status === "cancelled") pattern.cancelled++;
        if (appointment.status === "no_show") pattern.noShows++;

        pattern.revenue += appointment.services?.price || 0;
      });

      // Convert to array format
      const result: AppointmentPattern[] = Array.from(patterns.entries()).map(([key, data]) => {
        const [dayOfWeek, hourStr] = key.split("_");
        const hour = parseInt(hourStr);
        const appointmentCount = data.appointments.length;

        return {
          dayOfWeek,
          hour,
          appointmentCount,
          averageDuration: appointmentCount > 0 ? data.totalDuration / appointmentCount : 0,
          cancellationRate: appointmentCount > 0 ? (data.cancelled / appointmentCount) * 100 : 0,
          noShowRate: appointmentCount > 0 ? (data.noShows / appointmentCount) * 100 : 0,
          revenuePerHour: data.revenue,
          staffUtilization: await this.calculateHourlyStaffUtilization(dayOfWeek, hour, filter),
        };
      });

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error analyzing appointment patterns:", error);
      throw new Error("Failed to analyze appointment patterns");
    }
  }

  /**
   * Generate seasonal trends analysis
   */
  async getSeasonalTrends(filter: AnalyticsFilter): Promise<SeasonalTrend[]> {
    const cacheKey = `trends_${JSON.stringify(filter)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data: appointments, error } = await this.supabase
        .from("appointments")
        .select(`
          scheduled_at,
          status,
          services(price)
        `)
        .gte("scheduled_at", filter.startDate.toISOString())
        .lte("scheduled_at", filter.endDate.toISOString())
        .order("scheduled_at");

      if (error) throw error;

      // Group by period
      const trends = this.groupByPeriod(appointments || [], filter.granularity);

      // Calculate seasonal indices and growth rates
      const result: SeasonalTrend[] = trends.map((trend, index) => {
        const previousTrend = index > 0 ? trends[index - 1] : null;
        const growthRate = previousTrend
          ? ((trend.appointmentVolume - previousTrend.appointmentVolume) /
              previousTrend.appointmentVolume) *
            100
          : 0;

        // Calculate seasonal index (current period vs average)
        const averageVolume =
          trends.reduce((sum, t) => sum + t.appointmentVolume, 0) / trends.length;
        const seasonalIndex = averageVolume > 0 ? trend.appointmentVolume / averageVolume : 1;

        return {
          ...trend,
          growthRate,
          seasonalIndex,
        };
      });

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error analyzing seasonal trends:", error);
      throw new Error("Failed to analyze seasonal trends");
    }
  }

  /**
   * Get staff performance analytics
   */
  async getStaffPerformance(filter: AnalyticsFilter): Promise<StaffPerformance[]> {
    const cacheKey = `staff_performance_${JSON.stringify(filter)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data: staffData, error } = await this.supabase.from("staff").select(`
          id,
          name,
          appointments(
            id,
            scheduled_at,
            actual_duration,
            scheduled_duration,
            status,
            services(price),
            patient_feedback(rating)
          )
        `);

      if (error) throw error;

      const result: StaffPerformance[] = await Promise.all(
        (staffData || []).map(async (staff) => {
          const appointments =
            staff.appointments?.filter((a) => {
              const appointmentDate = new Date(a.scheduled_at);
              return appointmentDate >= filter.startDate && appointmentDate <= filter.endDate;
            }) || [];

          const completedAppointments = appointments.filter((a) => a.status === "completed");
          const totalDuration = appointments.reduce(
            (sum, a) => sum + (a.actual_duration || a.scheduled_duration || 0),
            0,
          );
          const avgDuration = appointments.length > 0 ? totalDuration / appointments.length : 0;

          // Calculate utilization rate for this staff member
          const utilizationRate = await this.calculateStaffUtilization(staff.id, filter);

          // Calculate patient satisfaction
          const ratings = appointments.flatMap(
            (a) => a.patient_feedback?.map((f) => f.rating) || [],
          );
          const avgRating =
            ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

          // Calculate revenue generated
          const revenueGenerated = appointments.reduce(
            (sum, a) => sum + (a.services?.price || 0),
            0,
          );

          // Calculate efficiency score (completed appointments / total scheduled)
          const efficiencyScore =
            appointments.length > 0
              ? (completedAppointments.length / appointments.length) * 100
              : 0;

          // Calculate skill utilization and workload balance
          const skillUtilizationRate = await this.calculateSkillUtilization(staff.id, filter);
          const workloadBalance = await this.calculateWorkloadBalance(staff.id, filter);

          return {
            staffId: staff.id,
            staffName: staff.name,
            appointmentsCompleted: completedAppointments.length,
            averageAppointmentDuration: avgDuration,
            utilizationRate,
            patientSatisfactionScore: avgRating,
            revenueGenerated,
            efficiencyScore,
            skillUtilizationRate,
            workloadBalance,
          };
        }),
      );

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error getting staff performance:", error);
      throw new Error("Failed to retrieve staff performance data");
    }
  }

  /**
   * Generate revenue analytics and optimization insights
   */
  async getRevenueAnalytics(filter: AnalyticsFilter): Promise<RevenueAnalytics> {
    const cacheKey = `revenue_${JSON.stringify(filter)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data: appointments, error } = await this.supabase
        .from("appointments")
        .select(`
          *,
          services(id, name, price, cost),
          patients(id, created_at)
        `)
        .gte("scheduled_at", filter.startDate.toISOString())
        .lte("scheduled_at", filter.endDate.toISOString())
        .eq("status", "completed");

      if (error) throw error;

      const totalRevenue = appointments?.reduce((sum, a) => sum + (a.services?.price || 0), 0) || 0;
      const totalCost = appointments?.reduce((sum, a) => sum + (a.services?.cost || 0), 0) || 0;
      const appointmentCount = appointments?.length || 0;

      // Calculate various revenue metrics
      const revenuePerAppointment = appointmentCount > 0 ? totalRevenue / appointmentCount : 0;
      const totalHours = this.calculateTotalHours(filter);
      const revenuePerHour = totalHours > 0 ? totalRevenue / totalHours : 0;

      // Get unique staff count
      const uniqueStaff = new Set(appointments?.map((a) => a.staff_id)).size;
      const revenuePerStaff = uniqueStaff > 0 ? totalRevenue / uniqueStaff : 0;

      const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

      // Appointment value distribution
      const valueRanges = [
        { range: "$0-$100", min: 0, max: 100 },
        { range: "$100-$300", min: 100, max: 300 },
        { range: "$300-$500", min: 300, max: 500 },
        { range: "$500-$1000", min: 500, max: 1000 },
        { range: "$1000+", min: 1000, max: Infinity },
      ];

      const appointmentValueDistribution = valueRanges.map((range) => {
        const appointmentsInRange =
          appointments?.filter((a) => {
            const price = a.services?.price || 0;
            return price >= range.min && price < range.max;
          }) || [];

        return {
          range: range.range,
          count: appointmentsInRange.length,
          revenue: appointmentsInRange.reduce((sum, a) => sum + (a.services?.price || 0), 0),
        };
      });

      // Treatment type revenue analysis
      const treatmentRevenue = new Map<string, { revenue: number; count: number }>();
      appointments?.forEach((appointment) => {
        const serviceName = appointment.services?.name || "Unknown";
        const price = appointment.services?.price || 0;

        if (!treatmentRevenue.has(serviceName)) {
          treatmentRevenue.set(serviceName, { revenue: 0, count: 0 });
        }

        const current = treatmentRevenue.get(serviceName)!;
        current.revenue += price;
        current.count += 1;
      });

      const treatmentTypeRevenue = Array.from(treatmentRevenue.entries()).map(([type, data]) => ({
        type,
        revenue: data.revenue,
        count: data.count,
      }));

      // Calculate patient lifetime value
      const patientLifetimeValue = await this.calculatePatientLifetimeValue(filter);

      // Generate revenue forecast
      const forecastedRevenue = await this.forecastRevenue(filter);

      const result: RevenueAnalytics = {
        totalRevenue,
        revenuePerAppointment,
        revenuePerHour,
        revenuePerStaff,
        profitMargin,
        appointmentValueDistribution,
        treatmentTypeRevenue,
        patientLifetimeValue,
        forecastedRevenue,
      };

      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error generating revenue analytics:", error);
      throw new Error("Failed to generate revenue analytics");
    }
  }

  // Helper methods
  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async calculateTotalScheduledHours(filter: AnalyticsFilter): Promise<number> {
    // Implementation for calculating total scheduled hours
    // This would involve getting staff schedules and calculating available hours
    return 0; // Placeholder
  }

  private async calculatePatientSatisfaction(filter: AnalyticsFilter): Promise<number> {
    // Implementation for calculating patient satisfaction score
    return 0; // Placeholder
  }

  private async calculateStaffEfficiency(filter: AnalyticsFilter): Promise<number> {
    // Implementation for calculating staff efficiency score
    return 0; // Placeholder
  }

  private async identifyPeakHours(filter: AnalyticsFilter): Promise<string[]> {
    // Implementation for identifying peak hours
    return []; // Placeholder
  }

  private async identifyBottlenecks(filter: AnalyticsFilter): Promise<string[]> {
    // Implementation for identifying bottlenecks
    return []; // Placeholder
  }

  private async calculateHourlyStaffUtilization(
    dayOfWeek: string,
    hour: number,
    filter: AnalyticsFilter,
  ): Promise<number> {
    // Implementation for calculating hourly staff utilization
    return 0; // Placeholder
  }

  private groupByPeriod(appointments: any[], granularity: string): SeasonalTrend[] {
    // Implementation for grouping appointments by period
    return []; // Placeholder
  }

  private async calculateStaffUtilization(
    staffId: string,
    filter: AnalyticsFilter,
  ): Promise<number> {
    // Implementation for calculating staff utilization
    return 0; // Placeholder
  }

  private async calculateSkillUtilization(
    staffId: string,
    filter: AnalyticsFilter,
  ): Promise<number> {
    // Implementation for calculating skill utilization
    return 0; // Placeholder
  }

  private async calculateWorkloadBalance(
    staffId: string,
    filter: AnalyticsFilter,
  ): Promise<number> {
    // Implementation for calculating workload balance
    return 0; // Placeholder
  }

  private calculateTotalHours(filter: AnalyticsFilter): number {
    // Implementation for calculating total hours in period
    const diffTime = Math.abs(filter.endDate.getTime() - filter.startDate.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
  }

  private async calculatePatientLifetimeValue(filter: AnalyticsFilter): Promise<number> {
    // Implementation for calculating patient lifetime value
    return 0; // Placeholder
  }

  private async forecastRevenue(filter: AnalyticsFilter): Promise<number> {
    // Implementation for revenue forecasting
    return 0; // Placeholder
  }
}

export default SchedulingAnalytics;
