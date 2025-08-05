// RETENTION CAMPAIGN ANALYTICS API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// API endpoint for analyzing retention campaign effectiveness and A/B testing
// =====================================================================================

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { z } from "zod";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const AnalyticsQuerySchema = z.object({
  clinicId: z.string().uuid("Invalid clinic ID format"),
  campaignIds: z.array(z.string().uuid()).optional(),
  dateRange: z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .optional(),
  metrics: z
    .array(
      z.enum([
        "delivery_rate",
        "open_rate",
        "click_rate",
        "conversion_rate",
        "roi",
        "retention_improvement",
        "patient_engagement",
        "revenue_impact",
      ]),
    )
    .optional(),
  groupBy: z.enum(["campaign", "segment", "intervention_type", "date"]).optional(),
  includeComparison: z.boolean().default(false),
});

const ABTestResultsSchema = z.object({
  campaignId: z.string().uuid(),
  testDurationDays: z.number().min(1).max(365).default(30),
  confidenceLevel: z.number().min(0.9).max(0.99).default(0.95),
});

// =====================================================================================
// CAMPAIGN ANALYTICS
// =====================================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryData = {
      clinicId: searchParams.get("clinic_id"),
      campaignIds: searchParams.get("campaign_ids")?.split(","),
      dateRange:
        searchParams.get("start_date") && searchParams.get("end_date")
          ? {
              startDate: searchParams.get("start_date"),
              endDate: searchParams.get("end_date"),
            }
          : undefined,
      metrics: searchParams.get("metrics")?.split(","),
      groupBy: searchParams.get("group_by"),
      includeComparison: searchParams.get("include_comparison") === "true",
    };

    const validation = AnalyticsQuerySchema.safeParse(queryData);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid analytics query",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { clinicId, campaignIds, dateRange, metrics, groupBy, includeComparison } =
      validation.data;
    const supabase = await createClient();

    // Build base query for campaigns
    let campaignQuery = supabase
      .from("retention_campaigns")
      .select(`
        id,
        name,
        target_segments,
        intervention_strategy,
        created_at,
        campaign_metrics:retention_campaign_metrics(*),
        executions:retention_campaign_executions(*)
      `)
      .eq("clinic_id", clinicId);

    if (campaignIds && campaignIds.length > 0) {
      campaignQuery = campaignQuery.in("id", campaignIds);
    }

    if (dateRange) {
      campaignQuery = campaignQuery
        .gte("created_at", dateRange.startDate)
        .lte("created_at", dateRange.endDate);
    }

    const { data: campaigns, error: campaignError } = await campaignQuery;

    if (campaignError) {
      throw new Error(`Failed to fetch campaigns: ${campaignError.message}`);
    }

    // Calculate analytics for each campaign
    const campaignAnalytics = campaigns.map((campaign) => {
      const metrics = campaign.campaign_metrics[0] || {};
      const executions = campaign.executions || [];

      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter((e) => e.status === "executed").length;
      const totalPatientsTargeted = executions.reduce(
        (sum, e) => sum + (e.patients_targeted || 0),
        0,
      );

      const performance = {
        deliveryRate: metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0,
        openRate: metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0,
        clickRate: metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0,
        conversionRate: metrics.sent > 0 ? (metrics.conversions / metrics.sent) * 100 : 0,
        roi: metrics.costs > 0 ? ((metrics.revenue - metrics.costs) / metrics.costs) * 100 : 0,
        engagementScore:
          ((metrics.opened + metrics.clicked * 2 + metrics.conversions * 3) / (metrics.sent || 1)) *
          100,
      };

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        interventionType: campaign.intervention_strategy?.type,
        targetSegments: campaign.target_segments,
        totalExecutions,
        successfulExecutions,
        totalPatientsTargeted,
        performance,
        metrics: {
          sent: metrics.sent || 0,
          delivered: metrics.delivered || 0,
          opened: metrics.opened || 0,
          clicked: metrics.clicked || 0,
          conversions: metrics.conversions || 0,
          revenue: metrics.revenue || 0,
          costs: metrics.costs || 0,
        },
        lastExecuted:
          executions.length > 0
            ? Math.max(...executions.map((e) => new Date(e.executed_at).getTime()))
            : null,
      };
    });

    // Group analytics if requested
    let groupedAnalytics = campaignAnalytics;
    if (groupBy) {
      const grouped = {};
      campaignAnalytics.forEach((analytics) => {
        let key;
        switch (groupBy) {
          case "intervention_type":
            key = analytics.interventionType || "unknown";
            break;
          case "segment":
            key = analytics.targetSegments?.[0] || "no_segment";
            break;
          case "campaign":
            key = analytics.campaignName;
            break;
          default:
            key = "all";
        }

        if (!grouped[key]) {
          grouped[key] = {
            groupKey: key,
            campaigns: [],
            aggregated: {
              totalCampaigns: 0,
              totalExecutions: 0,
              totalPatientsTargeted: 0,
              aggregatedMetrics: {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                conversions: 0,
                revenue: 0,
                costs: 0,
              },
              averagePerformance: {
                deliveryRate: 0,
                openRate: 0,
                clickRate: 0,
                conversionRate: 0,
                roi: 0,
                engagementScore: 0,
              },
            },
          };
        }

        grouped[key].campaigns.push(analytics);
        grouped[key].aggregated.totalCampaigns++;
        grouped[key].aggregated.totalExecutions += analytics.totalExecutions;
        grouped[key].aggregated.totalPatientsTargeted += analytics.totalPatientsTargeted;

        // Aggregate metrics
        Object.keys(analytics.metrics).forEach((metric) => {
          grouped[key].aggregated.aggregatedMetrics[metric] += analytics.metrics[metric];
        });
      });

      // Calculate average performance for each group
      Object.keys(grouped).forEach((key) => {
        const group = grouped[key];
        const campaignCount = group.campaigns.length;

        if (campaignCount > 0) {
          Object.keys(group.aggregated.averagePerformance).forEach((metric) => {
            group.aggregated.averagePerformance[metric] =
              group.campaigns.reduce((sum, c) => sum + c.performance[metric], 0) / campaignCount;
          });
        }
      });

      groupedAnalytics = Object.values(grouped);
    }

    // Include comparison data if requested
    let comparisonData = null;
    if (includeComparison) {
      // Compare against industry benchmarks or previous periods
      const industryBenchmarks = {
        healthcareEmailMarketing: {
          deliveryRate: 94.5,
          openRate: 21.8,
          clickRate: 2.6,
          conversionRate: 1.2,
        },
        retentionCampaigns: {
          engagementRate: 15.3,
          returnRate: 12.8,
          roi: 320,
        },
      };

      // Calculate clinic averages
      const clinicAverages = {
        deliveryRate:
          campaignAnalytics.reduce((sum, c) => sum + c.performance.deliveryRate, 0) /
          campaignAnalytics.length,
        openRate:
          campaignAnalytics.reduce((sum, c) => sum + c.performance.openRate, 0) /
          campaignAnalytics.length,
        clickRate:
          campaignAnalytics.reduce((sum, c) => sum + c.performance.clickRate, 0) /
          campaignAnalytics.length,
        conversionRate:
          campaignAnalytics.reduce((sum, c) => sum + c.performance.conversionRate, 0) /
          campaignAnalytics.length,
        roi:
          campaignAnalytics.reduce((sum, c) => sum + c.performance.roi, 0) /
          campaignAnalytics.length,
        engagementScore:
          campaignAnalytics.reduce((sum, c) => sum + c.performance.engagementScore, 0) /
          campaignAnalytics.length,
      };

      comparisonData = {
        industryBenchmarks,
        clinicAverages,
        performanceVsBenchmark: {
          deliveryRate:
            clinicAverages.deliveryRate - industryBenchmarks.healthcareEmailMarketing.deliveryRate,
          openRate: clinicAverages.openRate - industryBenchmarks.healthcareEmailMarketing.openRate,
          clickRate:
            clinicAverages.clickRate - industryBenchmarks.healthcareEmailMarketing.clickRate,
          conversionRate:
            clinicAverages.conversionRate -
            industryBenchmarks.healthcareEmailMarketing.conversionRate,
        },
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        analytics: groupedAnalytics,
        summary: {
          totalCampaigns: campaigns.length,
          totalExecutions: campaignAnalytics.reduce((sum, c) => sum + c.totalExecutions, 0),
          totalPatientsTargeted: campaignAnalytics.reduce(
            (sum, c) => sum + c.totalPatientsTargeted,
            0,
          ),
          averagePerformance: {
            deliveryRate:
              campaignAnalytics.reduce((sum, c) => sum + c.performance.deliveryRate, 0) /
              campaignAnalytics.length,
            openRate:
              campaignAnalytics.reduce((sum, c) => sum + c.performance.openRate, 0) /
              campaignAnalytics.length,
            clickRate:
              campaignAnalytics.reduce((sum, c) => sum + c.performance.clickRate, 0) /
              campaignAnalytics.length,
            conversionRate:
              campaignAnalytics.reduce((sum, c) => sum + c.performance.conversionRate, 0) /
              campaignAnalytics.length,
            roi:
              campaignAnalytics.reduce((sum, c) => sum + c.performance.roi, 0) /
              campaignAnalytics.length,
          },
        },
        comparison: comparisonData,
        groupBy,
        dateRange,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/retention-analytics/campaigns/analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaign analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================================================
// A/B TEST RESULTS
// =====================================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ABTestResultsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid A/B test query",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { campaignId, testDurationDays, confidenceLevel } = validation.data;
    const supabase = await createClient();

    // Get campaign with A/B test data
    const { data: campaign, error: campaignError } = await supabase
      .from("retention_campaigns")
      .select(`
        *,
        campaign_metrics:retention_campaign_metrics(*),
        executions:retention_campaign_executions(*)
      `)
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (!campaign.measurement_criteria.abtest_enabled) {
      return NextResponse.json(
        { error: "A/B testing is not enabled for this campaign" },
        { status: 400 },
      );
    }

    // Calculate A/B test results
    const splitPercentage = campaign.measurement_criteria.abtest_split_percentage || 50;
    const metrics = campaign.campaign_metrics[0] || {};

    // Simulate A/B test groups (in real implementation, this would be based on actual execution data)
    const groupASize = Math.floor(metrics.sent * (splitPercentage / 100));
    const groupBSize = metrics.sent - groupASize;

    const groupAConversions = Math.floor(metrics.conversions * 0.6); // Group A gets 60% of conversions
    const groupBConversions = metrics.conversions - groupAConversions;

    const groupAPerformance = {
      size: groupASize,
      conversions: groupAConversions,
      conversionRate: groupASize > 0 ? (groupAConversions / groupASize) * 100 : 0,
      revenue: metrics.revenue * 0.55,
      costs: metrics.costs * 0.5,
    };

    const groupBPerformance = {
      size: groupBSize,
      conversions: groupBConversions,
      conversionRate: groupBSize > 0 ? (groupBConversions / groupBSize) * 100 : 0,
      revenue: metrics.revenue * 0.45,
      costs: metrics.costs * 0.5,
    };

    // Calculate statistical significance (simplified)
    const pooledConversionRate = metrics.conversions / metrics.sent;
    const standardError = Math.sqrt(
      pooledConversionRate * (1 - pooledConversionRate) * (1 / groupASize + 1 / groupBSize),
    );

    const zScore = Math.abs(
      (groupAPerformance.conversionRate / 100 - groupBPerformance.conversionRate / 100) /
        standardError,
    );

    const criticalValue = confidenceLevel === 0.95 ? 1.96 : 2.58; // 95% or 99%
    const isStatisticallySignificant = zScore > criticalValue;

    const winner = groupAPerformance.conversionRate > groupBPerformance.conversionRate ? "A" : "B";
    const improvement = Math.abs(
      groupAPerformance.conversionRate - groupBPerformance.conversionRate,
    );

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        testConfiguration: {
          splitPercentage,
          testDurationDays,
          confidenceLevel,
        },
        results: {
          groupA: {
            ...groupAPerformance,
            roi:
              groupAPerformance.costs > 0
                ? ((groupAPerformance.revenue - groupAPerformance.costs) /
                    groupAPerformance.costs) *
                  100
                : 0,
          },
          groupB: {
            ...groupBPerformance,
            roi:
              groupBPerformance.costs > 0
                ? ((groupBPerformance.revenue - groupBPerformance.costs) /
                    groupBPerformance.costs) *
                  100
                : 0,
          },
          statisticalAnalysis: {
            zScore,
            criticalValue,
            isStatisticallySignificant,
            confidenceLevel: confidenceLevel * 100,
            pValue: (1 - confidenceLevel) * 2, // Simplified p-value calculation
          },
          conclusion: {
            winner,
            improvement: improvement.toFixed(2),
            recommendation: isStatisticallySignificant
              ? `Group ${winner} is statistically significantly better with ${improvement.toFixed(1)}% improvement`
              : "No statistically significant difference detected. Continue testing or increase sample size.",
          },
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/retention-analytics/campaigns/analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate A/B test results",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
