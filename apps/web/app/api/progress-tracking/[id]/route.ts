// Story 10.2: Progress Tracking through Computer Vision - Individual Progress Tracking API
// API endpoint for individual progress tracking operations

import { progressTrackingService } from "@/app/lib/services/progress-tracking";
import { updateProgressTrackingSchema } from "@/app/lib/validations/progress-tracking";
import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = resolvedParams;

    // Get progress tracking by ID
    const tracking = await progressTrackingService.getProgressTrackingById(id);

    if (!tracking) {
      return NextResponse.json(
        { error: "Progress tracking not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(tracking);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch progress tracking" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = resolvedParams;
    const body = await request.json();

    // Validate request body
    const validatedData = updateProgressTrackingSchema.parse(body);

    // Update progress tracking
    const tracking = await progressTrackingService.updateProgressTracking(
      id,
      validatedData,
    );

    return NextResponse.json(tracking);
  } catch (error: unknown) {
    const errorObj = error as { name?: string; errors?: unknown };
    if (errorObj.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: errorObj.errors },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      { error: "Failed to update progress tracking" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = resolvedParams;

    // Delete progress tracking
    await progressTrackingService.deleteProgressTracking(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete progress tracking" },
      { status: 500 },
    );
  }
}
