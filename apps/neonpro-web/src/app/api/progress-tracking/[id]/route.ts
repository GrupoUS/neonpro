// Story 10.2: Progress Tracking through Computer Vision - Individual Progress Tracking API
// API endpoint for individual progress tracking operations

import { progressTrackingService } from "@/app/lib/services/progress-tracking";
import { updateProgressTrackingSchema } from "@/app/lib/validations/progress-tracking";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Get progress tracking by ID
    const tracking = await progressTrackingService.getProgressTrackingById(id);

    if (!tracking) {
      return NextResponse.json({ error: "Progress tracking not found" }, { status: 404 });
    }

    return NextResponse.json(tracking);
  } catch (error: any) {
    console.error("Error fetching progress tracking:", error);
    return NextResponse.json({ error: "Failed to fetch progress tracking" }, { status: 500 });
  }
}

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
    const validatedData = updateProgressTrackingSchema.parse(body);

    // Update progress tracking
    const tracking = await progressTrackingService.updateProgressTracking(id, validatedData);

    return NextResponse.json(tracking);
  } catch (error: any) {
    console.error("Error updating progress tracking:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Failed to update progress tracking" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Delete progress tracking
    await progressTrackingService.deleteProgressTracking(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting progress tracking:", error);
    return NextResponse.json({ error: "Failed to delete progress tracking" }, { status: 500 });
  }
}
