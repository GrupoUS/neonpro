// GET/POST /api/treatment-prediction/patient-factors/[patientId] - Patient factors management
import { TreatmentPredictionService } from "@/app/lib/services/treatment-prediction";
import { createServerClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { patientId: string };
}

// GET /api/treatment-prediction/patient-factors/[patientId] - Get patient factors
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify patient exists and user has access
    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("id", params.patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const predictionService = new TreatmentPredictionService();
    const factors = await predictionService.getPatientFactors(params.patientId);

    if (!factors) {
      return NextResponse.json(
        { error: "Patient factors not found. Please complete patient assessment first." },
        { status: 404 },
      );
    }

    return NextResponse.json({ factors });
  } catch (error) {
    console.error("Error fetching patient factors:", error);
    return NextResponse.json({ error: "Failed to fetch patient factors" }, { status: 500 });
  }
}

// POST /api/treatment-prediction/patient-factors/[patientId] - Create/Update patient factors
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify patient exists and user has access
    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("id", params.patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.age || !body.gender) {
      return NextResponse.json({ error: "Missing required fields: age, gender" }, { status: 400 });
    }

    // Prepare factors data
    const factorsData = {
      ...body,
      patient_id: params.patientId,
    };

    const predictionService = new TreatmentPredictionService();
    const factors = await predictionService.upsertPatientFactors(factorsData);

    return NextResponse.json({
      factors,
      message: "Patient factors updated successfully",
    });
  } catch (error) {
    console.error("Error updating patient factors:", error);
    return NextResponse.json({ error: "Failed to update patient factors" }, { status: 500 });
  }
}
