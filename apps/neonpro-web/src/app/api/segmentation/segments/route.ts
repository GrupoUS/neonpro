import type { createpatientSegmentationService } from "@/app/lib/services/patient-segmentation-service";
import type { CreateSegmentSchema } from "@/app/lib/validations/segmentation";
import type { createClient } from "@/lib/supabase/server";
import type { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // For development: Skip auth check or use service role
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("is_active");
    const segmentType = searchParams.get("segment_type");

    // Simple query to match our database structure
    let query = supabase.from("patient_segments").select(`
        id,
        name,
        description,
        segment_type,
        is_active,
        created_at,
        ai_generated,
        criteria,
        accuracy_score,
        member_count
      `);

    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true");
    }

    if (segmentType) {
      query = query.eq("segment_type", segmentType);
    }

    const { data: segments, error } = await query;
    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: segments || [],
      total: segments?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching patient segments:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch patient segments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = CreateSegmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 },
      );
    }

    // Map validation schema to service interface
    const segmentData = {
      segment_name: validationResult.data.name,
      description: validationResult.data.description,
      criteria: validationResult.data.criteria as any, // Type casting for compatibility
      segment_type: validationResult.data.segment_type,
      ai_model: undefined,
      expected_accuracy: undefined,
    };

    const segment = await createpatientSegmentationService().createAISegment(segmentData);

    return NextResponse.json(
      {
        success: true,
        data: segment,
        message: "AI-powered segment created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating patient segment:", error);
    return NextResponse.json({ error: "Failed to create patient segment" }, { status: 500 });
  }
}
