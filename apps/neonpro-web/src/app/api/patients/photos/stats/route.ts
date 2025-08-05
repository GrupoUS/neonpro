/**
 * Photo Recognition Statistics API
 * Provides analytics and statistics for photo recognition system
 *
 * @route GET /api/patients/photos/stats
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

    // Check user permissions (admin or manager only)
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !userProfile || !["admin", "manager"].includes(userProfile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "30d"; // 7d, 30d, 90d, 1y
    const patientId = searchParams.get("patientId"); // Optional: stats for specific patient

    // Get recognition statistics
    const stats = await photoManager.getRecognitionStats(timeframe, patientId || undefined);

    // Get additional system-wide statistics
    const systemStats = await getSystemPhotoStats(timeframe);

    return NextResponse.json({
      success: true,
      data: {
        recognition: stats,
        system: systemStats,
        timeframe,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Get photo stats error:", error);

    return NextResponse.json(
      {
        error: "Failed to get statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper function to get system-wide photo statistics
async function getSystemPhotoStats(timeframe: string) {
  const timeframeDays =
    {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    }[timeframe] || 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframeDays);

  try {
    // Total photos uploaded
    const { count: totalPhotos } = await supabase
      .from("patient_photos")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString());

    // Photos by type
    const { data: photosByType } = await supabase
      .from("patient_photos")
      .select("photo_type")
      .gte("created_at", startDate.toISOString());

    const typeDistribution =
      photosByType?.reduce((acc: any, photo) => {
        acc[photo.photo_type] = (acc[photo.photo_type] || 0) + 1;
        return acc;
      }, {}) || {};

    // Verification attempts
    const { count: verificationAttempts } = await supabase
      .from("patient_photo_verifications")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString());

    // Successful verifications
    const { count: successfulVerifications } = await supabase
      .from("patient_photo_verifications")
      .select("*", { count: "exact", head: true })
      .eq("verified", true)
      .gte("created_at", startDate.toISOString());

    // Average confidence scores
    const { data: confidenceData } = await supabase
      .from("patient_photo_verifications")
      .select("confidence")
      .gte("created_at", startDate.toISOString())
      .not("confidence", "is", null);

    const avgConfidence = confidenceData?.length
      ? confidenceData.reduce((sum, item) => sum + (item.confidence || 0), 0) /
        confidenceData.length
      : 0;

    // Privacy settings distribution
    const { data: privacyData } = await supabase
      .from("patient_photo_privacy")
      .select("allow_facial_recognition, allow_photo_sharing");

    const privacyStats = privacyData?.reduce(
      (acc: any, privacy) => {
        acc.facialRecognitionEnabled += privacy.allow_facial_recognition ? 1 : 0;
        acc.photoSharingEnabled += privacy.allow_photo_sharing ? 1 : 0;
        acc.total += 1;
        return acc;
      },
      { facialRecognitionEnabled: 0, photoSharingEnabled: 0, total: 0 },
    ) || { facialRecognitionEnabled: 0, photoSharingEnabled: 0, total: 0 };

    // Storage usage
    const { data: storageData } = await supabase
      .from("patient_photos")
      .select("file_size")
      .gte("created_at", startDate.toISOString());

    const totalStorageUsed =
      storageData?.reduce((sum, photo) => sum + (photo.file_size || 0), 0) || 0;

    return {
      uploads: {
        total: totalPhotos || 0,
        byType: typeDistribution,
        storageUsed: totalStorageUsed,
      },
      verifications: {
        total: verificationAttempts || 0,
        successful: successfulVerifications || 0,
        successRate: verificationAttempts
          ? (successfulVerifications || 0) / verificationAttempts
          : 0,
        averageConfidence: Math.round(avgConfidence * 100) / 100,
      },
      privacy: {
        facialRecognitionOptIn: privacyStats.total
          ? privacyStats.facialRecognitionEnabled / privacyStats.total
          : 0,
        photoSharingOptIn: privacyStats.total
          ? privacyStats.photoSharingEnabled / privacyStats.total
          : 0,
        totalPatientsWithSettings: privacyStats.total,
      },
    };
  } catch (error) {
    console.error("Error getting system photo stats:", error);
    return {
      uploads: { total: 0, byType: {}, storageUsed: 0 },
      verifications: { total: 0, successful: 0, successRate: 0, averageConfidence: 0 },
      privacy: { facialRecognitionOptIn: 0, photoSharingOptIn: 0, totalPatientsWithSettings: 0 },
    };
  }
}
