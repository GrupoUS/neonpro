// =====================================================================================
// STRATEGY EXECUTION API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoint for executing retention strategies
// =====================================================================================

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { RetentionAnalyticsService } from "@/app/lib/services/retention-analytics-service";
import type { z } from "zod";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const ExecuteStrategySchema = z.object({
  strategyId: z.string().uuid("Invalid strategy ID format"),
  clinicId: z.string().uuid("Invalid clinic ID format"),
  patientIds: z.array(z.string().uuid()).min(1, "At least one patient ID required"),
  executeImmediately: z.boolean().default(false),
  scheduledAt: z.string().optional(),
  dryRun: z.boolean().default(false),
  notes: z.string().optional(),
});

// =====================================================================================
// EXECUTE RETENTION STRATEGY
// =====================================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = ExecuteStrategySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid execution data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { strategyId, clinicId, patientIds, executeImmediately, scheduledAt, dryRun, notes } =
      validation.data;

    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify clinic access and permissions
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("clinic_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 403 });
    }

    if (userProfile.clinic_id !== clinicId) {
      return NextResponse.json({ error: "Access denied to clinic data" }, { status: 403 });
    }

    // Check permissions for executing strategies
    const allowedRoles = ["admin", "manager", "professional", "analyst"];
    if (!allowedRoles.includes(userProfile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to execute strategies" },
        { status: 403 },
      );
    }

    // Verify strategy exists and belongs to clinic
    const retentionService = new RetentionAnalyticsService();
    const strategies = await retentionService.getRetentionStrategies(clinicId);
    const strategy = strategies.find((s) => s.id === strategyId);

    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found or does not belong to clinic" },
        { status: 404 },
      );
    }

    if (!strategy.is_active) {
      return NextResponse.json({ error: "Cannot execute inactive strategy" }, { status: 400 });
    }

    // Validate that all patients belong to the clinic
    const { data: validPatients, error: validationError } = await supabase
      .from("patients")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .in("id", patientIds);

    if (validationError) {
      throw new Error(`Failed to validate patients: ${validationError.message}`);
    }

    if (validPatients.length !== patientIds.length) {
      const invalidIds = patientIds.filter((id) => !validPatients.some((p) => p.id === id));
      return NextResponse.json(
        {
          error: "Some patients do not belong to the specified clinic",
          invalidPatientIds: invalidIds,
        },
        { status: 400 },
      );
    }

    // Validate scheduled execution time if provided
    if (scheduledAt && !executeImmediately) {
      const scheduledDate = new Date(scheduledAt);
      const now = new Date();

      if (scheduledDate <= now) {
        return NextResponse.json(
          { error: "Scheduled execution time must be in the future" },
          { status: 400 },
        );
      }
    }

    // Execute strategy (or simulate if dry run)
    if (dryRun) {
      // Simulate execution - return what would happen without actually executing
      const simulation = {
        strategy: {
          id: strategy.id,
          name: strategy.name,
          type: strategy.strategy_type,
          description: strategy.description,
        },
        targets: validPatients.map((p) => ({
          patientId: p.id,
          patientName: p.name,
          actions: strategy.action_sequence.map((action) => ({
            type: action.type,
            description: action.description || `${action.type} action`,
            channel: action.channel,
            estimated_execution_time: action.delay_minutes
              ? `${action.delay_minutes} minutes`
              : "Immediate",
          })),
        })),
        execution_plan: {
          total_patients: validPatients.length,
          total_actions: strategy.action_sequence.length * validPatients.length,
          estimated_duration: strategy.action_sequence.reduce(
            (sum, action) => sum + (action.delay_minutes || 0),
            0,
          ),
          scheduled_for: scheduledAt || (executeImmediately ? "Immediate" : "Not scheduled"),
          execution_type: "Simulation (Dry Run)",
        },
      };

      return NextResponse.json({
        success: true,
        data: simulation,
        message: "Strategy execution simulated successfully",
        isDryRun: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Actual execution
    const executionResult = await retentionService.executeRetentionStrategy(strategyId, patientIds);

    // Log the execution
    const { error: logError } = await supabase.from("retention_strategy_executions").insert({
      strategy_id: strategyId,
      clinic_id: clinicId,
      executed_by: user.id,
      patient_ids: patientIds,
      execution_status: executionResult.success ? "completed" : "failed",
      execution_results: executionResult,
      notes: notes,
      scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
      executed_at: executeImmediately ? new Date() : null,
    });

    if (logError) {
      console.error("Failed to log strategy execution:", logError);
      // Don't fail the request for logging errors
    }

    return NextResponse.json({
      success: true,
      data: {
        execution: executionResult,
        strategy: {
          id: strategy.id,
          name: strategy.name,
          type: strategy.strategy_type,
        },
        targets: validPatients,
        executionMetadata: {
          executed_by: user.id,
          executed_at: new Date().toISOString(),
          scheduled_at: scheduledAt,
          immediate: executeImmediately,
          notes: notes,
        },
      },
      message: `Strategy executed ${executionResult.success ? "successfully" : "with errors"} for ${validPatients.length} patients`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error executing retention strategy:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
