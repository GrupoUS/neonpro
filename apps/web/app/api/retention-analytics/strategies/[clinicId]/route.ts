// =====================================================================================
// RETENTION STRATEGIES API ENDPOINTS
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoints for retention strategy management and execution
// =====================================================================================

import { RetentionAnalyticsService } from "@/app/lib/services/retention-analytics-service";
import {
  RetentionStrategyStatus,
  RetentionStrategyType,
} from "@/app/types/retention-analytics";
import type { CreateRetentionStrategy } from "@/app/types/retention-analytics";
import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

const StrategiesParamsSchema = z.object({
  clinicId: z.string().uuid("Invalid clinic ID format"),
});

const StrategiesQuerySchema = z.object({
  activeOnly: z.coerce.boolean().default(false),
  strategyType: z.nativeEnum(RetentionStrategyType).optional(),
  status: z.nativeEnum(RetentionStrategyStatus).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z
    .enum(["created_at", "updated_at", "name", "success_rate"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const CreateStrategySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  strategy_type: z.nativeEnum(RetentionStrategyType),
  trigger_conditions: z.record(z.any()),
  action_sequence: z.array(z.record(z.any())),
  target_criteria: z.record(z.any()),
  priority: z.number().min(1).max(10).default(5),
  is_active: z.boolean().default(true),
  schedule_config: z.record(z.any()).optional(),
});

const _ExecuteStrategySchema = z.object({
  strategyId: z.string().uuid("Invalid strategy ID format"),
  patientIds: z.array(z.string().uuid()).min(1),
  executeImmediately: z.boolean().default(false),
  scheduledAt: z.string().optional(),
});

// =====================================================================================
// GET RETENTION STRATEGIES
// =====================================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> },
) {
  try {
    const resolvedParams = await params;
    // Validate clinic ID parameter
    const clinicValidation = StrategiesParamsSchema.safeParse({
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
    const queryValidation = StrategiesQuerySchema.safeParse({
      activeOnly: searchParams.get("activeOnly"),
      strategyType: searchParams.get("strategyType"),
      status: searchParams.get("status"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
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

    const {
      activeOnly,
      strategyType,
      status,
      limit,
      offset,
      sortBy,
      sortOrder,
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

    // Get retention strategies
    const retentionService = new RetentionAnalyticsService();
    const strategies = await retentionService.getRetentionStrategies(
      clinicId,
      activeOnly,
    );

    // Apply additional filters
    let filteredStrategies = strategies;

    if (strategyType) {
      filteredStrategies = filteredStrategies.filter(
        (s) => s.strategy_type === strategyType,
      );
    }

    if (status) {
      filteredStrategies = filteredStrategies.filter(
        (s) => s.status === status,
      );
    }

    // Apply sorting
    filteredStrategies.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case "created_at": {
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
          break;
        }
        case "updated_at": {
          valueA = new Date(a.updated_at);
          valueB = new Date(b.updated_at);
          break;
        }
        case "name": {
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        }
        case "success_rate": {
          valueA = a.success_rate || 0;
          valueB = b.success_rate || 0;
          break;
        }
        default: {
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
        }
      }

      if (sortOrder === "desc") {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    });

    // Apply pagination
    const paginatedStrategies = filteredStrategies.slice(
      offset,
      offset + limit,
    );

    // Calculate summary statistics
    const summary = {
      total_strategies: filteredStrategies.length,
      active_strategies: filteredStrategies.filter((s) => s.is_active).length,
      strategy_types: Object.values(RetentionStrategyType).map((type) => ({
        type,
        count: filteredStrategies.filter((s) => s.strategy_type === type)
          .length,
      })),
      average_success_rate:
        filteredStrategies.reduce((sum, s) => sum + (s.success_rate || 0), 0) /
          filteredStrategies.length || 0,
      total_executions: filteredStrategies.reduce(
        (sum, s) => sum + s.execution_count,
        0,
      ),
      successful_executions: filteredStrategies.reduce(
        (sum, s) => sum + s.successful_executions,
        0,
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        strategies: paginatedStrategies,
        summary,
        pagination: {
          limit,
          offset,
          total: filteredStrategies.length,
          hasMore: offset + limit < filteredStrategies.length,
        },
        filters: {
          activeOnly,
          strategyType,
          status,
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
// CREATE RETENTION STRATEGY
// =====================================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> },
) {
  try {
    const resolvedParams = await params;
    // Validate clinic ID parameter
    const clinicValidation = StrategiesParamsSchema.safeParse({
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
    const validation = CreateStrategySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid strategy data",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const strategyData = validation.data;

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

    // Check permissions for creating strategies
    const allowedRoles = ["admin", "manager", "analyst"];
    if (!allowedRoles.includes(userProfile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions to create strategies" },
        {
          status: 403,
        },
      );
    }

    // Create retention strategy
    const retentionService = new RetentionAnalyticsService();
    const createData: CreateRetentionStrategy = {
      ...strategyData,
      clinic_id: clinicId,
      created_by: user.id,
    };

    const strategy = await retentionService.createRetentionStrategy(createData);

    return NextResponse.json({
      success: true,
      data: strategy,
      message: "Retention strategy created successfully",
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
