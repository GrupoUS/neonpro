// RETENTION-CAMPAIGNS INTEGRATION API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// API endpoint for integrating retention interventions with CRM campaigns
// =====================================================================================

import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { createClient } from "@/lib/supabase/server";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const CreateRetentionCampaignSchema = z.object({
  clinicId: z.string().uuid("Invalid clinic ID format"),
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  targetSegments: z.array(z.string()).min(1, "At least one target segment required"),
  triggerConditions: z.object({
    churnProbabilityThreshold: z.number().min(0).max(1),
    daysSinceLastVisit: z.number().min(1),
    minimumLTV: z.number().min(0).optional(),
    riskLevel: z.enum(["low", "medium", "high"]),
  }),
  interventionStrategy: z.object({
    type: z.enum(["email", "sms", "phone_call", "in_app", "multi_channel"]),
    template: z.string().min(1, "Template is required"),
    scheduling: z.object({
      immediate: z.boolean().default(false),
      delayHours: z.number().min(0).optional(),
      maxRetries: z.number().min(1).max(5).default(3),
      retryIntervalHours: z.number().min(1).default(24),
    }),
    personalization: z.object({
      includeName: z.boolean().default(true),
      includeLastService: z.boolean().default(true),
      includeSpecialOffer: z.boolean().default(false),
      customVariables: z.record(z.string()).optional(),
    }),
  }),
  measurementCriteria: z.object({
    successMetrics: z.array(
      z.enum(["return_visit", "booking_scheduled", "payment_made", "engagement_rate"]),
    ),
    trackingPeriodDays: z.number().min(1).max(365).default(30),
    abtestEnabled: z.boolean().default(false),
    abtestSplitPercentage: z.number().min(10).max(90).optional(),
  }),
  isActive: z.boolean().default(true),
});

const UpdateCampaignMetricsSchema = z.object({
  campaignId: z.string().uuid(),
  metrics: z.object({
    sent: z.number().min(0).optional(),
    delivered: z.number().min(0).optional(),
    opened: z.number().min(0).optional(),
    clicked: z.number().min(0).optional(),
    conversions: z.number().min(0).optional(),
    revenue: z.number().min(0).optional(),
    costs: z.number().min(0).optional(),
  }),
  timestamp: z.string().datetime().optional(),
});

// =====================================================================================
// GET RETENTION CAMPAIGNS
// =====================================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinic_id");
    const status = searchParams.get("status");
    const segment = searchParams.get("segment");

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Build the query
    let query = supabase
      .from("retention_campaigns")
      .select(`
        *,
        campaign_metrics:retention_campaign_metrics(*),
        executions:retention_campaign_executions(
          count
        )
      `)
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (segment) {
      query = query.contains("target_segments", [segment]);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch retention campaigns: ${error.message}`);
    }

    // Calculate campaign performance metrics
    const enrichedCampaigns = campaigns.map((campaign) => {
      const metrics = campaign.campaign_metrics[0] || {};
      const executions = campaign.executions[0]?.count || 0;

      return {
        ...campaign,
        performance: {
          deliveryRate: metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0,
          openRate: metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0,
          clickRate: metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0,
          conversionRate: metrics.sent > 0 ? (metrics.conversions / metrics.sent) * 100 : 0,
          roi: metrics.costs > 0 ? ((metrics.revenue - metrics.costs) / metrics.costs) * 100 : 0,
          totalExecutions: executions,
        },
        lastExecuted: campaign.executions[0]?.executed_at || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedCampaigns,
      total: enrichedCampaigns.length,
    });
  } catch (error) {
    console.error("GET /api/retention-analytics/campaigns error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch retention campaigns",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================================================
// CREATE RETENTION CAMPAIGN
// =====================================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateRetentionCampaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid campaign data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validation.data;
    const supabase = await createClient();

    // Verify clinic exists and user has access
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("id", data.clinicId)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Clinic not found or access denied" }, { status: 404 });
    }

    // Create retention campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("retention_campaigns")
      .insert({
        clinic_id: data.clinicId,
        name: data.name,
        description: data.description,
        target_segments: data.targetSegments,
        trigger_conditions: data.triggerConditions,
        intervention_strategy: data.interventionStrategy,
        measurement_criteria: data.measurementCriteria,
        is_active: data.isActive,
        status: "draft",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (campaignError) {
      throw new Error(`Failed to create retention campaign: ${campaignError.message}`);
    }

    // Initialize campaign metrics
    const { error: metricsError } = await supabase.from("retention_campaign_metrics").insert({
      campaign_id: campaign.id,
      clinic_id: data.clinicId,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      conversions: 0,
      revenue: 0,
      costs: 0,
      created_at: new Date().toISOString(),
    });

    if (metricsError) {
      console.error("Failed to initialize campaign metrics:", metricsError);
    }

    return NextResponse.json(
      {
        success: true,
        data: campaign,
        message: "Retention campaign created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/retention-analytics/campaigns error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create retention campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================================================
// UPDATE CAMPAIGN METRICS
// =====================================================================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = UpdateCampaignMetricsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid metrics data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { campaignId, metrics, timestamp } = validation.data;
    const supabase = await createClient();

    // Update campaign metrics
    const { data: updatedMetrics, error } = await supabase
      .from("retention_campaign_metrics")
      .update({
        ...metrics,
        updated_at: timestamp || new Date().toISOString(),
      })
      .eq("campaign_id", campaignId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update campaign metrics: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: updatedMetrics,
      message: "Campaign metrics updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/retention-analytics/campaigns error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update campaign metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
