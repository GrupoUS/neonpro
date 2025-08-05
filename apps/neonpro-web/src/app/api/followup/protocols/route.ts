// Follow-up Protocols API
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { createtreatmentFollowupService } from "@/app/lib/services/treatment-followup-service";
import type { createFollowupProtocolSchema } from "@/app/lib/validations/followup";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      treatment_type: searchParams.get("treatment_type") || undefined,
      specialty: searchParams.get("specialty") || undefined,
      is_active: searchParams.get("is_active")
        ? searchParams.get("is_active") === "true"
        : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
    };

    const protocols = await createtreatmentFollowupService().getFollowupProtocols(filters);

    return NextResponse.json({
      success: true,
      data: protocols,
      total: protocols.length,
    });
  } catch (error) {
    console.error("Error fetching follow-up protocols:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch follow-up protocols",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request data
    const validatedData = createFollowupProtocolSchema.parse(body);

    // Create protocol
    const protocol = await createtreatmentFollowupService().createFollowupProtocol(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: protocol,
        message: "Follow-up protocol created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Error creating follow-up protocol:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create follow-up protocol",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
