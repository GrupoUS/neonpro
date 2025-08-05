/**
 * Patient Identity Verification API
 * Handles facial recognition verification for patient identity
 *
 * @route POST /api/patients/photos/verify
 * @author APEX Master Developer
 */

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@supabase/supabase-js";
import type {
  PhotoRecognitionManager,
  defaultPhotoRecognitionConfig,
} from "../../../../../lib/patients/photo-recognition/photo-recognition-manager";
import type { AuditLogger } from "../../../../../lib/audit/audit-logger";
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

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const photoFile = formData.get("photo") as File;
    const patientId = formData.get("patientId") as string;
    const verificationContext = (formData.get("context") as string) || "identity_check";

    if (!photoFile || !patientId) {
      return NextResponse.json(
        { error: "Photo file and patient ID are required" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(photoFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 },
      );
    }

    // Validate file size (5MB max for verification)
    if (photoFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB for verification" },
        { status: 400 },
      );
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

    // Perform identity verification
    const verificationResult = await photoManager.verifyPatientIdentity(
      patientId,
      photoFile,
      user.id,
      verificationContext,
    );

    return NextResponse.json({
      success: true,
      data: {
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        matchedPhotos: verificationResult.matchedPhotos.map((photo) => ({
          id: photo.id,
          type: photo.type,
          confidence: photo.confidence,
          uploadedAt: photo.uploadedAt,
        })),
        verificationId: verificationResult.verificationId,
        timestamp: verificationResult.timestamp,
        recommendations: verificationResult.recommendations,
      },
    });
  } catch (error) {
    console.error("Identity verification error:", error);

    return NextResponse.json(
      {
        error: "Verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint for verification history
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Get verification history
    const { data: verifications, error: verificationError } = await supabase
      .from("patient_photo_verifications")
      .select(`
        id,
        verified,
        confidence,
        context,
        created_at,
        verified_by
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (verificationError) {
      throw verificationError;
    }

    return NextResponse.json({
      success: true,
      data: verifications || [],
      pagination: {
        limit,
        offset,
        hasMore: (verifications?.length || 0) === limit,
      },
    });
  } catch (error) {
    console.error("Get verification history error:", error);

    return NextResponse.json(
      {
        error: "Failed to get verification history",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
