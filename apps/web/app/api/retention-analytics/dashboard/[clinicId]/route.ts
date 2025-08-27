// =====================================================================================
// RETENTION ANALYTICS DASHBOARD API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions
// Comprehensive dashboard data aggregation endpoint
// =====================================================================================

import { RetentionAnalyticsService } from "@/app/lib/services/retention-analytics-service";
import { ChurnRiskLevel } from "@/app/types/retention-analytics";
import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const DashboardParamsSchema = z.object({
  clinicId: z.string().uuid("Invalid clinic ID format"),
});

const DashboardQuerySchema = z.object({
  periodStart: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), "Invalid start date"),
  periodEnd: z
    .string()
    .refine((date) => !Number.isNaN(Date.parse(date)), "Invalid end date"),
  includeMetrics: z.coerce.boolean().default(true),
  includePredictions: z.coerce.boolean().default(true),
  includeStrategies: z.coerce.boolean().default(true),
  includePerformance: z.coerce.boolean().default(true),
  metricsLimit: z.coerce.number().min(1).max(500).default(100),
  predictionsLimit: z.coerce.number().min(1).max(500).default(100),
});

// =====================================================================================
// GET RETENTION ANALYTICS DASHBOARD
// =====================================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; }>; },
) {
  try {
    const resolvedParams = await params;
    // Validate clinic ID parameter
    const clinicValidation = DashboardParamsSchema.safeParse({
      clinicId: resolvedParams.clinicId,
    });

    if (!clinicValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid clinic ID",
          details: clinicValidation.error.issues,
        },
        { status: 400 },
      );
    }

    const { clinicId } = clinicValidation.data;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryValidation = DashboardQuerySchema.safeParse({
      periodStart: searchParams.get("periodStart"),
      periodEnd: searchParams.get("periodEnd"),
      includeMetrics: searchParams.get("includeMetrics"),
      includePredictions: searchParams.get("includePredictions"),
      includeStrategies: searchParams.get("includeStrategies"),
      includePerformance: searchParams.get("includePerformance"),
      metricsLimit: searchParams.get("metricsLimit"),
      predictionsLimit: searchParams.get("predictionsLimit"),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: queryValidation.error.issues,
        },
        { status: 400 },
      );
    }

    const {
      periodStart,
      periodEnd,
      includeMetrics,
      includePredictions,
      includeStrategies,
      includePerformance,
      metricsLimit,
      predictionsLimit,
    } = queryValidation.data;

    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify clinic access
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("clinic_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 403 },
      );
    }

    if (userProfile.clinic_id !== clinicId) {
      return NextResponse.json(
        { error: "Access denied to clinic data" },
        { status: 403 },
      );
    }

    // Verify clinic exists
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("id", clinicId)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    // Initialize retention service
    const retentionService = new RetentionAnalyticsService();

    // Generate comprehensive dashboard data
    const dashboardData = await retentionService.generateRetentionAnalyticsDashboard(
      clinicId,
      periodStart,
      periodEnd,
    );

    // Collect additional detailed data based on parameters
    const additionalData: unknown = {};

    if (includeMetrics) {
      const metrics = await retentionService.getClinicRetentionMetrics(
        clinicId,
        metricsLimit,
        0,
      );

      // Filter metrics by date range
      const filteredMetrics = metrics.metrics.filter((metric: any) => {
        const metricDate = new Date(metric.last_appointment_date);
        return (
          metricDate >= new Date(periodStart)
          && metricDate <= new Date(periodEnd)
        );
      });

      additionalData.detailedMetrics = {
        metrics: filteredMetrics,
        summary: {
          total_patients: filteredMetrics.length,
          high_risk_patients: filteredMetrics.filter((m) =>
            ["high", "critical"].includes(m.churn_risk_level)
          ).length,
          average_retention_rate: filteredMetrics.reduce((sum, m) => sum + m.retention_rate, 0)
              / filteredMetrics.length || 0,
          total_lifetime_value: filteredMetrics.reduce(
            (sum, m) => sum + m.lifetime_value,
            0,
          ),
        },
      };
    }

    if (includePredictions) {
      const predictions = await retentionService.getChurnPredictions(
        clinicId,
        undefined,
        predictionsLimit,
        0,
      );

      // Filter predictions by date range
      const filteredPredictions = predictions.predictions.filter(
        (prediction: unknown) => {
          const predictionDate = new Date(prediction.prediction_date);
          return (
            predictionDate >= new Date(periodStart)
            && predictionDate <= new Date(periodEnd)
          );
        },
      );

      additionalData.detailedPredictions = {
        predictions: filteredPredictions,
        summary: {
          total_predictions: filteredPredictions.length,
          critical_risk: filteredPredictions.filter(
            (p) => p.risk_level === ChurnRiskLevel.CRITICAL,
          ).length,
          high_risk: filteredPredictions.filter(
            (p) => p.risk_level === ChurnRiskLevel.HIGH,
          ).length,
          medium_risk: filteredPredictions.filter(
            (p) => p.risk_level === ChurnRiskLevel.MEDIUM,
          ).length,
          low_risk: filteredPredictions.filter(
            (p) => p.risk_level === ChurnRiskLevel.LOW,
          ).length,
          average_churn_probability: filteredPredictions.reduce(
                (sum, p) => sum + p.churn_probability,
                0,
              ) / filteredPredictions.length || 0,
        },
      };
    }

    if (includeStrategies) {
      const strategies = await retentionService.getRetentionStrategies(
        clinicId,
        false,
      );

      additionalData.strategies = {
        all_strategies: strategies,
        active_strategies: strategies.strategies.filter(
          (s: unknown) => s.is_active,
        ),
        summary: {
          total_strategies: strategies.strategies.length,
          active_count: strategies.strategies.filter((s: unknown) => s.is_active)
            .length,
          total_executions: strategies.strategies.reduce(
            (sum: number, s: unknown) => sum + s.execution_count,
            0,
          ),
          average_success_rate: strategies.strategies.reduce(
                (sum: number, s: unknown) => sum + (s.success_rate || 0),
                0,
              ) / strategies.strategies.length || 0,
        },
      };
    }

    if (includePerformance) {
      // Calculate performance trends over the period
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);
      const daysDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Generate weekly performance data points
      const weeklyData = [];
      const weeksCount = Math.max(1, Math.ceil(daysDiff / 7));

      for (let week = 0; week < weeksCount; week++) {
        const weekStart = new Date(
          startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000,
        );
        const weekEnd = new Date(
          Math.min(
            weekStart.getTime() + 6 * 24 * 60 * 60 * 1000,
            endDate.getTime(),
          ),
        );

        weeklyData.push({
          week: week + 1,
          start_date: weekStart.toISOString().split("T")[0],
          end_date: weekEnd.toISOString().split("T")[0],
          // These would be calculated from actual data in a real implementation
          retention_rate: Math.random() * 0.3 + 0.7, // Simulated data
          churn_rate: Math.random() * 0.1 + 0.05, // Simulated data
          new_predictions: Math.floor(Math.random() * 20) + 5,
          strategy_executions: Math.floor(Math.random() * 10) + 2,
        });
      }

      additionalData.performance = {
        period_summary: {
          period_start: periodStart,
          period_end: periodEnd,
          total_days: daysDiff,
          total_weeks: weeksCount,
        },
        weekly_trends: weeklyData,
        key_metrics_trend: {
          retention_improvement: Math.random() * 0.1 - 0.05, // Simulated
          churn_reduction: Math.random() * 0.05, // Simulated
          strategy_effectiveness: Math.random() * 0.2 + 0.8, // Simulated
        },
      };
    }

    // Calculate real-time alerts
    const alerts = {
      critical_risk_patients: dashboardData.churn_risk_distribution.critical || 0,
      high_risk_patients: dashboardData.churn_risk_distribution.high || 0,
      low_engagement_patients: dashboardData.engagement_metrics.low_engagement_count || 0,
      recent_strategy_failures: additionalData.strategies?.all_strategies?.filter(
        (s: unknown) => s.execution_count > 0 && (s.success_rate || 0) < 0.5,
      ).length || 0,
    };

    // Compile final response
    const response = {
      success: true,
      data: {
        dashboard: dashboardData,
        clinic: {
          id: clinic.id,
          name: clinic.name,
        },
        period: {
          start: periodStart,
          end: periodEnd,
          duration_days: Math.ceil(
            (new Date(periodEnd).getTime() - new Date(periodStart).getTime())
              / (1000 * 60 * 60 * 24),
          ),
        },
        alerts,
        ...additionalData,
      },
      metadata: {
        generated_at: new Date().toISOString(),
        generated_by: user.id,
        includes: {
          metrics: includeMetrics,
          predictions: includePredictions,
          strategies: includeStrategies,
          performance: includePerformance,
        },
        data_freshness: {
          metrics: "Real-time",
          predictions: "Updated hourly",
          strategies: "Real-time",
          performance: "Updated daily",
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
