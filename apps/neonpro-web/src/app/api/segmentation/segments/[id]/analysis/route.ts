import { patientSegmentationService } from "@/app/lib/services/patient-segmentation-service";
import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get patient behavior analysis for segmentation
    const analysis = await patientSegmentationService.analyzePatientsForSegmentation(id);

    return NextResponse.json({
      success: true,
      data: analysis,
      total: analysis.length,
    });
  } catch (error) {
    console.error("Error fetching patient analysis:", error);
    return NextResponse.json({ error: "Failed to fetch patient analysis" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: RouteParams }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Update segment memberships
    await patientSegmentationService.updateSegmentMemberships(body.updates);

    return NextResponse.json({
      success: true,
      message: "Segment memberships updated successfully",
    });
  } catch (error) {
    console.error("Error updating segment memberships:", error);
    return NextResponse.json({ error: "Failed to update segment memberships" }, { status: 500 });
  }
}
