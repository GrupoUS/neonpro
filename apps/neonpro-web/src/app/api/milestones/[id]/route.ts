// Story 10.2: Progress Tracking through Computer Vision - Individual Milestone API
// API endpoint for individual milestone operations

import { progressTrackingService } from "@/app/lib/services/progress-tracking";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const validateMilestoneSchema = z.object({
  validation_status: z.enum(["confirmed", "false_positive"]),
  notes: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Validate request body
    const { validation_status, notes } = validateMilestoneSchema.parse(body);

    // Validate milestone
    const milestone = await progressTrackingService.validateMilestone(id, validation_status, notes);

    return NextResponse.json(milestone);
  } catch (error: any) {
    console.error("Error validating milestone:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Failed to validate milestone" }, { status: 500 });
  }
}
