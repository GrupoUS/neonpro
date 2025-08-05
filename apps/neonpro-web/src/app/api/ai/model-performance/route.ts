/**
 * AI Model Performance API Route
 * GET /api/ai/model-performance
 *
 * Provides access to ML model performance metrics and statistics
 */

import { type NextRequest, NextResponse } from "next/server";
import { AIABTestingService, ModelPerformanceService } from "@/lib/ai/duration-prediction";
import { createClient } from "@/lib/supabase/server";

// Response types
interface ModelPerformanceResponse {
  success: boolean;
  models?: Array<{
    version: string;
    accuracy: number;
    mae: number; // Mean Absolute Error
    rmse: number; // Root Mean Square Error
    confidenceThreshold: number;
    sampleCount: number;
    lastUpdated: string;
    isActive: boolean;
  }>;
  abTestStats?: {
    total: number;
    control: number;
    ai_prediction: number;
    split_percentage: {
      control: number;
      ai_prediction: number;
    };
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const modelVersion = searchParams.get("modelVersion");
    const includeABStats = searchParams.get("includeABStats") === "true";

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check user permissions (admin or manager required)
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "manager"])
      .single();

    if (roleError || !userRole) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Admin or Manager role required." },
        { status: 403 },
      );
    }

    // Initialize services
    const performanceService = new ModelPerformanceService();
    const abTestService = new AIABTestingService();

    // Get model performance data
    const models = await performanceService.getModelPerformance(modelVersion || undefined);

    // Prepare response
    const response: ModelPerformanceResponse = {
      success: true,
      models: models.map((model) => ({
        version: model.version,
        accuracy: model.accuracy,
        mae: model.mae,
        rmse: model.rmse,
        confidenceThreshold: model.confidenceThreshold,
        sampleCount: model.sampleCount || 0,
        lastUpdated: model.lastUpdated || new Date().toISOString(),
        isActive: model.isActive,
      })),
    };

    // Include A/B testing statistics if requested
    if (includeABStats) {
      try {
        const abStats = await abTestService.getABTestStats();
        response.abTestStats = abStats;
      } catch (abError) {
        console.error("Failed to get A/B test stats:", abError);
        // Don't fail the request for this optional data
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Model Performance API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred while retrieving model performance",
      },
      { status: 500 },
    );
  }
}

// Handle POST requests for updating model performance
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();
    const { modelVersion, action } = body;

    if (!modelVersion || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: modelVersion, action",
        },
        { status: 400 },
      );
    }

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check user permissions (admin required for model management)
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !userRole) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Admin role required." },
        { status: 403 },
      );
    }

    const performanceService = new ModelPerformanceService();

    switch (action) {
      case "update_performance": {
        // Update model performance metrics
        const updatedModel = await performanceService.updateModelPerformance(modelVersion);

        return NextResponse.json({
          success: true,
          message: "Model performance updated successfully",
          model: {
            version: updatedModel.version,
            accuracy: updatedModel.accuracy,
            mae: updatedModel.mae,
            rmse: updatedModel.rmse,
            confidenceThreshold: updatedModel.confidenceThreshold,
            isActive: updatedModel.isActive,
          },
        });
      }

      case "deploy_model": {
        // Deploy new model version
        const { hyperparameters, featureImportance, trainingDataCount } = body;

        if (!hyperparameters || !featureImportance || !trainingDataCount) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Missing required fields for model deployment: hyperparameters, featureImportance, trainingDataCount",
            },
            { status: 400 },
          );
        }

        await performanceService.deployNewModel(
          modelVersion,
          hyperparameters,
          featureImportance,
          trainingDataCount,
        );

        return NextResponse.json({
          success: true,
          message: `Model ${modelVersion} deployed successfully`,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported action: ${action}. Supported actions: update_performance, deploy_model`,
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Model Performance POST API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error occurred while processing model performance request",
      },
      { status: 500 },
    );
  }
}

// Handle unsupported HTTP methods
export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use GET to retrieve or POST to update." },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use GET to retrieve or POST to update." },
    { status: 405 },
  );
}
