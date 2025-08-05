// RETENTION CAMPAIGN EXECUTION API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions - Task 5
// API endpoint for executing individual retention campaigns
// =====================================================================================

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/app/utils/supabase/server";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const ExecuteCampaignSchema = z.object({
  patientIds: z.array(z.string().uuid()).optional(),
  dryRun: z.boolean().default(false),
  scheduledAt: z.string().datetime().optional(),
  overrideConditions: z.boolean().default(false),
});

const UpdateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  targetSegments: z.array(z.string()).optional(),
  triggerConditions: z
    .object({
      churnProbabilityThreshold: z.number().min(0).max(1),
      daysSinceLastVisit: z.number().min(1),
      minimumLTV: z.number().min(0).optional(),
      riskLevel: z.enum(["low", "medium", "high"]),
    })
    .optional(),
  interventionStrategy: z
    .object({
      type: z.enum(["email", "sms", "phone_call", "in_app", "multi_channel"]),
      template: z.string().min(1),
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
    })
    .optional(),
  measurementCriteria: z
    .object({
      successMetrics: z.array(
        z.enum(["return_visit", "booking_scheduled", "payment_made", "engagement_rate"]),
      ),
      trackingPeriodDays: z.number().min(1).max(365).default(30),
      abtestEnabled: z.boolean().default(false),
      abtestSplitPercentage: z.number().min(10).max(90).optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).optional(),
});

// =====================================================================================
// GET CAMPAIGN DETAILS
// =====================================================================================

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id;

    const supabase = await createClient();

    // Get campaign with metrics and recent executions
    const { data: campaign, error } = await supabase
      .from("retention_campaigns")
      .select(`
        *,
        campaign_metrics:retention_campaign_metrics(*),
        recent_executions:retention_campaign_executions(
          id,
          executed_at,
          patients_targeted,
          success_count,
          status,
          execution_summary
        )
      `)
      .eq("id", campaignId)
      .single();

    if (error) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Calculate performance metrics
    const metrics = campaign.campaign_metrics[0] || {};
    const performance = {
      deliveryRate: metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0,
      openRate: metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0,
      clickRate: metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0,
      conversionRate: metrics.sent > 0 ? (metrics.conversions / metrics.sent) * 100 : 0,
      roi: metrics.costs > 0 ? ((metrics.revenue - metrics.costs) / metrics.costs) * 100 : 0,
    };

    // Get eligible patients count
    const { count: eligiblePatients } = await supabase
      .from("retention_analytics")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", campaign.clinic_id)
      .gte("churn_probability", campaign.trigger_conditions.churnProbabilityThreshold)
      .eq("risk_level", campaign.trigger_conditions.riskLevel);

    return NextResponse.json({
      success: true,
      data: {
        ...campaign,
        performance,
        eligiblePatientsCount: eligiblePatients || 0,
      },
    });
  } catch (error) {
    console.error("GET /api/retention-analytics/campaigns/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaign details",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================================================
// UPDATE CAMPAIGN
// =====================================================================================

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id;
    const body = await request.json();
    const validation = UpdateCampaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid campaign data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const updates = validation.data;
    const supabase = await createClient();

    // Update campaign
    const { data: campaign, error } = await supabase
      .from("retention_campaigns")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: campaign,
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/retention-analytics/campaigns/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================================================
// EXECUTE CAMPAIGN
// =====================================================================================

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id;
    const body = await request.json();
    const validation = ExecuteCampaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid execution data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { patientIds, dryRun, scheduledAt, overrideConditions } = validation.data;
    const supabase = await createClient();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("retention_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (!campaign.is_active && !overrideConditions) {
      return NextResponse.json({ error: "Campaign is not active" }, { status: 400 });
    }

    // Determine target patients
    let targetPatients;
    if (patientIds && patientIds.length > 0) {
      // Execute for specific patients
      const { data: patients, error: patientsError } = await supabase
        .from("patients")
        .select("id, name, email, phone, clinic_id")
        .eq("clinic_id", campaign.clinic_id)
        .in("id", patientIds);

      if (patientsError) {
        throw new Error(`Failed to fetch target patients: ${patientsError.message}`);
      }

      targetPatients = patients;
    } else {
      // Execute for eligible patients based on campaign conditions
      const { data: patients, error: patientsError } = await supabase
        .from("retention_analytics")
        .select(`
          patient_id,
          churn_probability,
          risk_level,
          predicted_churn_date,
          patients!inner(id, name, email, phone, clinic_id)
        `)
        .eq("clinic_id", campaign.clinic_id)
        .gte("churn_probability", campaign.trigger_conditions.churnProbabilityThreshold)
        .eq("risk_level", campaign.trigger_conditions.riskLevel);

      if (patientsError) {
        throw new Error(`Failed to fetch eligible patients: ${patientsError.message}`);
      }

      targetPatients = patients.map((p) => p.patients);
    }

    if (targetPatients.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          executionId: null,
          patientsTargeted: 0,
          message: "No eligible patients found for this campaign",
        },
      });
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from("retention_campaign_executions")
      .insert({
        campaign_id: campaignId,
        clinic_id: campaign.clinic_id,
        executed_at: scheduledAt || new Date().toISOString(),
        patients_targeted: targetPatients.length,
        status: dryRun ? "dry_run" : "executed",
        execution_summary: {
          dryRun,
          targetConditions: campaign.trigger_conditions,
          interventionType: campaign.intervention_strategy.type,
          patientsTargeted: targetPatients.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
          })),
        },
        success_count: dryRun ? 0 : targetPatients.length,
      })
      .select()
      .single();

    if (executionError) {
      throw new Error(`Failed to create execution record: ${executionError.message}`);
    }

    // If not a dry run, update campaign metrics
    if (!dryRun) {
      const { error: metricsError } = await supabase
        .from("retention_campaign_metrics")
        .update({
          sent: targetPatients.length,
          updated_at: new Date().toISOString(),
        })
        .eq("campaign_id", campaignId);

      if (metricsError) {
        console.error("Failed to update campaign metrics:", metricsError);
      }

      // Update campaign status
      await supabase
        .from("retention_campaigns")
        .update({
          status: "active",
          last_executed_at: new Date().toISOString(),
        })
        .eq("id", campaignId);
    }

    return NextResponse.json({
      success: true,
      data: {
        executionId: execution.id,
        patientsTargeted: targetPatients.length,
        dryRun,
        scheduledAt: execution.executed_at,
        interventionType: campaign.intervention_strategy.type,
        message: dryRun ? "Dry run completed successfully" : "Campaign executed successfully",
      },
    });
  } catch (error) {
    console.error("POST /api/retention-analytics/campaigns/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// =====================================================================================
// DELETE CAMPAIGN
// =====================================================================================

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id;
    const supabase = await createClient();

    // Check if campaign has active executions
    const { data: activeExecutions, error: executionsError } = await supabase
      .from("retention_campaign_executions")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("status", "executed")
      .limit(1);

    if (executionsError) {
      throw new Error(`Failed to check active executions: ${executionsError.message}`);
    }

    if (activeExecutions && activeExecutions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete campaign with active executions. Archive it instead." },
        { status: 400 },
      );
    }

    // Delete campaign (cascade will handle related records)
    const { error } = await supabase.from("retention_campaigns").delete().eq("id", campaignId);

    if (error) {
      throw new Error(`Failed to delete campaign: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/retention-analytics/campaigns/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
