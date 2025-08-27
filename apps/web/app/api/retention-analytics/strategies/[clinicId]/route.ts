// =====================================================================================
// RETENTION STRATEGIES API ENDPOINTS
// Epic 7.4: Patient Retention Analytics + Predictions
// API endpoints for retention strategy management and execution
// =====================================================================================

import { RetentionAnalyticsService } from "@/app/lib/services/retention-analytics-service";
import { RetentionStrategyStatus, RetentionStrategyType } from "@/app/types/retention-analytics";
import { createClient } from "@/app/utils/supabase/server";
import { safeParseNumber } from "@/src/types/analytics";
import type { DatabaseRow, RetentionStrategy } from "@/src/types/analytics";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================

interface StrategyData {
  id: string;
  name: string;
  type: string;
  strategy_type: string;
  status: string;
  target_risk_level: string;
  effectiveness_score: number;
  is_active: boolean;
  execution_count: number;
  successful_executions: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
  last_executed: string;
}

// Type guard for strategy data
function isStrategyData(obj: unknown): obj is StrategyData {
  return (
    typeof obj === "object"
    && obj !== null
    && typeof (obj as StrategyData).id === "string"
    && typeof (obj as StrategyData).name === "string"
    && typeof (obj as StrategyData).type === "string"
    && typeof (obj as StrategyData).strategy_type === "string"
    && typeof (obj as StrategyData).status === "string"
    && typeof (obj as StrategyData).target_risk_level === "string"
    && typeof (obj as StrategyData).effectiveness_score === "number"
    && typeof (obj as StrategyData).is_active === "boolean"
    && typeof (obj as StrategyData).execution_count === "number"
    && typeof (obj as StrategyData).successful_executions === "number"
    && typeof (obj as StrategyData).success_rate === "number"
    && typeof (obj as StrategyData).created_at === "string"
    && typeof (obj as StrategyData).updated_at === "string"
    && typeof (obj as StrategyData).last_executed === "string"
  );
}

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
// =====================================================================================
// GET RETENTION STRATEGIES
// =====================================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string; }>; },
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
    let filteredStrategies = strategies.strategies as StrategyData[];

    if (strategyType) {
      filteredStrategies = (strategies.strategies as StrategyData[]).filter(
        (s: StrategyData) => s.strategy_type === strategyType,
      );
    }

    if (status) {
      filteredStrategies = filteredStrategies.filter(
        (s: StrategyData) => (s as any).status === status,
      );
    }

    // Apply sorting
    filteredStrategies.sort((a: StrategyData, b: StrategyData) => {
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
          valueA = a.name;
          valueB = b.name;
          break;
        }
        case "success_rate": {
          valueA = safeParseNumber(a.success_rate);
          valueB = safeParseNumber(b.success_rate);
          break;
        }
        default: {
          valueA = a.created_at;
          valueB = b.created_at;
        }
      }

      if (sortOrder === "desc") {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    });

    // Pagination
    const paginatedStrategies = filteredStrategies.slice(
      offset,
      offset + limit,
    );

    // Calculate summary statistics
    const summary = {
      total_strategies: filteredStrategies.length,
      active_strategies: filteredStrategies.filter((s: StrategyData) => s.is_active).length,
      strategy_types: Object.values(RetentionStrategyType).map((type) => ({
        type,
        count: filteredStrategies.filter((s: StrategyData) => s.strategy_type === type)
          .length,
      })),
      average_success_rate: filteredStrategies.length > 0
        ? filteredStrategies.reduce(
          (sum: number, s: StrategyData) => sum + safeParseNumber(s.success_rate, 0),
          0,
        ) / filteredStrategies.length
        : 0,
      total_executions: filteredStrategies.reduce(
        (sum: number, s: StrategyData) => sum + safeParseNumber((s as any).execution_count, 0),
        0,
      ),
      successful_executions: filteredStrategies.reduce(
        (sum: number, s: StrategyData) =>
          sum + safeParseNumber((s as any).successful_executions, 0),
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
  { params }: { params: Promise<{ clinicId: string; }>; },
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

    const { data: strategyData } = validation;

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
    const createData: unknown = {
      ...strategyData,
      clinic_id: clinicId,
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
