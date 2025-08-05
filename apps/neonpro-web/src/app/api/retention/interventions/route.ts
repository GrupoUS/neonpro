// API endpoint for retention interventions
// Story 7.4: Advanced patient retention analytics with predictive modeling

import type { NextRequest, NextResponse } from "next/server";
import type { RetentionService } from "../../../lib/services/retention";
import type {
  CreateRetentionInterventionSchema,
  InterventionQuerySchema,
} from "../../../lib/validations/retention";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = InterventionQuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      sort_by: searchParams.get("sort_by"),
      sort_order: searchParams.get("sort_order"),
      status: searchParams.get("status"),
      channel: searchParams.get("channel"),
      intervention_type: searchParams.get("intervention_type"),
    });

    // Parse additional filters
    const patient_id = searchParams.get("patient_id");

    const filters: any = { ...queryParams };

    if (patient_id) {
      filters.patient_id = patient_id;
    }

    const result = await RetentionService.getRetentionInterventions(filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in retention interventions GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch retention interventions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = CreateRetentionInterventionSchema.parse(body);

    const intervention = await RetentionService.createRetentionIntervention(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: intervention,
        message: "Retention intervention created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in retention interventions POST:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create retention intervention",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
