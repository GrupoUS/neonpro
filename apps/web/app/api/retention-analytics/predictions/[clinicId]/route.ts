// =====================================================================================
// CHURN PREDICTIONS API ENDPOINTS
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoints for churn prediction generation and management
// =====================================================================================

import { RetentionAnalyticsService } from "@/app/lib/services/retention-analytics-service";
import {
  ChurnModelType,
  ChurnRiskLevel,
} from "@/app/types/retention-analytics";
import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from "zod";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const PredictionsParamsSchema = z.object({
  clinicId: z.string().uuid("Invalid clinic ID format"),
});

const PredictionsQuerySchema = z.object({
  riskLevel: z.nativeEnum(ChurnRiskLevel).optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z
    .enum(["prediction_date", "churn_probability", "risk_level"])
    .default("prediction_date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const GeneratePredictionSchema = z
  .object({
    patientId: z.string().uuid("Invalid patient ID format").optional(),
    patientIds: z.array(z.string().uuid()).optional(),
    modelType: z.nativeEnum(ChurnModelType).default(ChurnModelType.ENSEMBLE),
    forceRegenerate: z.boolean().default(false),
  })
  .refine(
    (data) => data.patientId || (data.patientIds && data.patientIds.length > 0),
    {
      message: "Either patientId or patientIds must be provided",
    },
  );

// =====================================================================================
// GET CHURN PREDICTIONS
// =====================================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> },
) {
  try {
    const resolvedParams = await params;
    // Validate clinic ID parameter
    const clinicValidation = PredictionsParamsSchema.safeParse({
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
    const queryValidation = PredictionsQuerySchema.safeParse({
      riskLevel: searchParams.get("riskLevel"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
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

    const { riskLevel, limit, offset, startDate, endDate, sortBy, sortOrder } =
      queryValidation.data;

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

    // Get churn predictions
    const retentionService = new RetentionAnalyticsService();
    const predictions = await retentionService.getChurnPredictions(
      clinicId,
      riskLevel,
      limit,
      offset,
    );

    // Apply additional filters and sorting
    let filteredPredictions = predictions;

    // Date filtering
    if (startDate || endDate) {
      filteredPredictions = predictions.filter((prediction) => {
        const predictionDate = new Date(prediction.prediction_date);
        if (startDate && predictionDate < new Date(startDate)) {
          return false;
        }
        if (endDate && predictionDate > new Date(endDate)) {
          return false;
        }
        return true;
      });
    }

    // Sorting
    filteredPredictions.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case "prediction_date": {
          valueA = new Date(a.prediction_date);
          valueB = new Date(b.prediction_date);
          break;
        }
        case "churn_probability": {
          valueA = a.churn_probability;
          valueB = b.churn_probability;
          break;
        }
        case "risk_level": {
          const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          valueA = riskOrder[a.risk_level];
          valueB = riskOrder[b.risk_level];
          break;
        }
        default: {
          valueA = a.prediction_date;
          valueB = b.prediction_date;
        }
      }

      if (sortOrder === "desc") {
        return valueA > valueB ? -1 : (valueA < valueB ? 1 : 0);
      }
      return valueA < valueB ? -1 : (valueA > valueB ? 1 : 0);
    });

    // Pagination
    const paginatedPredictions = filteredPredictions.slice(
      offset,
      offset + limit,
    );

    // Calculate summary statistics
    const summary = {
      total_predictions: filteredPredictions.length,
      risk_distribution: {
        low: filteredPredictions.filter(
          (p) => p.risk_level === ChurnRiskLevel.LOW,
        ).length,
        medium: filteredPredictions.filter(
          (p) => p.risk_level === ChurnRiskLevel.MEDIUM,
        ).length,
        high: filteredPredictions.filter(
          (p) => p.risk_level === ChurnRiskLevel.HIGH,
        ).length,
        critical: filteredPredictions.filter(
          (p) => p.risk_level === ChurnRiskLevel.CRITICAL,
        ).length,
      },
      average_churn_probability:
        filteredPredictions.reduce((sum, p) => sum + p.churn_probability, 0) /
          filteredPredictions.length || 0,
      high_risk_patients: filteredPredictions.filter((p) =>
        ["high", "critical"].includes(p.risk_level),
      ).length,
      recent_predictions: filteredPredictions.filter((p) => {
        const predictionDate = new Date(p.prediction_date);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return predictionDate > dayAgo;
      }).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        predictions: paginatedPredictions,
        summary,
        pagination: {
          limit,
          offset,
          total: filteredPredictions.length,
          hasMore: offset + limit < filteredPredictions.length,
        },
        filters: {
          riskLevel,
          startDate,
          endDate,
          sortBy,
          sortOrder,
        },
      },
      timestamp: new Date().toISOString(),
    });
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

// =====================================================================================
// GENERATE CHURN PREDICTIONS
// =====================================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> },
) {
  try {
    const resolvedParams = await params;
    // Validate clinic ID parameter
    const clinicValidation = PredictionsParamsSchema.safeParse({
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

    // Parse and validate request body
    const body = await request.json();
    const validation = GeneratePredictionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { patientId, patientIds, modelType, forceRegenerate } =
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

    // Check permissions for generating predictions
    const allowedRoles = ["admin", "manager", "analyst", "professional"];
    if (!allowedRoles.includes(userProfile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to generate predictions" },
        {
          status: 403,
        },
      );
    }

    // Prepare patient IDs for processing
    const targetPatientIds = patientId ? [patientId] : patientIds!;

    // Validate that all patients belong to the clinic
    const { data: validPatients, error: validationError } = await supabase
      .from("patients")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .in("id", targetPatientIds);

    if (validationError) {
      throw new Error(
        `Failed to validate patients: ${validationError.message}`,
      );
    }

    if (validPatients.length !== targetPatientIds.length) {
      const invalidIds = targetPatientIds.filter(
        (id) => !validPatients.some((p) => p.id === id),
      );
      return NextResponse.json(
        {
          error: "Some patients do not belong to the specified clinic",
          invalidPatientIds: invalidIds,
        },
        { status: 400 },
      );
    }

    // Generate predictions
    const retentionService = new RetentionAnalyticsService();
    const results = [];
    const errors = [];

    // Process in batches for better performance
    const batchSize = 5; // Smaller batch for ML predictions

    for (let i = 0; i < targetPatientIds.length; i += batchSize) {
      const batch = targetPatientIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async (patientId) => {
        try {
          const prediction = await retentionService.generateChurnPrediction(
            patientId,
            clinicId,
            modelType,
          );
          return { patientId, prediction, success: true };
        } catch (error) {
          return {
            patientId,
            error: error instanceof Error ? error.message : "Unknown error",
            success: false,
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            results.push(result.value);
          } else {
            errors.push(result.value);
          }
        } else {
          errors.push({
            patientId: "unknown",
            error: result.reason?.message || "Promise rejected",
            success: false,
          });
        }
      });
    }

    // Calculate summary
    const summary = {
      total_processed: targetPatientIds.length,
      successful: results.length,
      failed: errors.length,
      success_rate: results.length / targetPatientIds.length,
      model_type: modelType,
      high_risk_detected: results.filter((r) =>
        ["high", "critical"].includes(r.prediction.risk_level),
      ).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        predictions: results.map((r) => r.prediction),
        summary,
        errors: errors.length > 0 ? errors : undefined,
      },
      message: `Generated ${results.length} predictions successfully, ${errors.length} failed`,
      timestamp: new Date().toISOString(),
    });
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
