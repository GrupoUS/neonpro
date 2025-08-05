/**
 * Patient Photo Privacy Management API
 * Handles privacy controls and LGPD compliance for patient photos
 *
 * @route GET/PUT /api/patients/photos/privacy
 * @author APEX Master Developer
 */

import type { createClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";
import type { AuditLogger } from "../../../../../lib/audit/audit-logger";
import type {
  defaultPhotoRecognitionConfig,
  PhotoRecognitionManager,
} from "../../../../../lib/patients/photo-recognition/photo-recognition-manager";
import type { LGPDManager } from "../../../../../lib/security/lgpd-manager";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const auditLogger = new AuditLogger(supabase);
const lgpdManager = new LGPDManager(supabase, auditLogger);
const photoManager = new PhotoRecognitionManager(
  supabase,
  auditLogger,
  lgpdManager,
  defaultPhotoRecognitionConfig,
);

// GET - Retrieve privacy controls
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Check if patient exists
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, name")
      .eq("id", patientId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Get privacy controls
    const privacyControls = await photoManager.getPatientPrivacyControls(patientId);

    return NextResponse.json({
      success: true,
      data: privacyControls,
    });
  } catch (error) {
    console.error("Get privacy controls error:", error);

    return NextResponse.json(
      {
        error: "Failed to get privacy controls",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT - Update privacy controls
export async function PUT(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { patientId, privacyControls } = body;

    if (!patientId || !privacyControls) {
      return NextResponse.json(
        { error: "Patient ID and privacy controls are required" },
        { status: 400 },
      );
    }

    // Validate privacy controls structure
    const requiredFields = ["allowFacialRecognition", "allowPhotoSharing", "dataRetentionPeriod"];
    for (const field of requiredFields) {
      if (!(field in privacyControls)) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check if patient exists
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, name")
      .eq("id", patientId)
      .single();

    if (patientError || !patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update privacy controls
    const updatedControls = await photoManager.updatePatientPrivacyControls(
      patientId,
      privacyControls,
      user.id,
    );

    return NextResponse.json({
      success: true,
      data: updatedControls,
    });
  } catch (error) {
    console.error("Update privacy controls error:", error);

    return NextResponse.json(
      {
        error: "Failed to update privacy controls",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete patient photo
export async function DELETE(request: NextRequest) {
  try {
    // Get user session
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("photoId");
    const reason = searchParams.get("reason") || "user_request";

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }

    // Delete photo
    const result = await photoManager.deletePatientPhoto(photoId, user.id, reason);

    return NextResponse.json({
      success: true,
      data: {
        deleted: result.deleted,
        deletedAt: result.deletedAt,
      },
    });
  } catch (error) {
    console.error("Delete photo error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete photo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
