/**
 * Waitlist Management API Route
 * Story 2.2: Intelligent conflict detection and resolution - Waitlist functionality
 *
 * POST /api/scheduling/waitlist
 * Manages patient waitlist for appointment availability
 */

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { cookies } from "next/headers";
import type { WaitlistService, TimeSlot, UrgencyLevel } from "@/lib/scheduling/conflict-resolution";
import type { AuditLogger } from "@/lib/auth/audit/audit-logger";

interface WaitlistRequest {
  action: "add" | "process" | "notify";
  patientId: string;
  treatmentType: string;
  preferredDateRange?: {
    start: string; // ISO string
    end: string; // ISO string
  };
  preferredTimeSlots?: TimeSlot[];
  urgencyLevel?: UrgencyLevel;
  specialRequirements?: Record<string, any>;
  // For process action
  availableStart?: string;
  availableEnd?: string;
  professionalId?: string;
  // For notify action
  waitlistEntryId?: string;
  availableSlots?: any[];
}

export async function POST(request: NextRequest) {
  const auditLogger = new AuditLogger();

  try {
    // Get user session
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: WaitlistRequest = await request.json();

    // Validate required fields
    if (!body.action || !body.patientId || !body.treatmentType) {
      return NextResponse.json(
        { error: "Missing required fields: action, patientId, treatmentType" },
        { status: 400 },
      );
    }

    // Initialize waitlist service
    const waitlistService = new WaitlistService();

    let result: any;

    switch (body.action) {
      case "add":
        // Add patient to waitlist
        if (!body.preferredDateRange) {
          return NextResponse.json(
            { error: "preferredDateRange is required for add action" },
            { status: 400 },
          );
        }

        result = await waitlistService.addToWaitlist(
          body.patientId,
          body.treatmentType,
          {
            start: new Date(body.preferredDateRange.start),
            end: new Date(body.preferredDateRange.end),
          },
          body.preferredTimeSlots || [],
          body.urgencyLevel || "normal",
          body.specialRequirements || {},
        );

        await auditLogger.logActivity(
          "waitlist_added",
          `Patient ${body.patientId} added to waitlist`,
          {
            userId: session.user.id,
            waitlistEntryId: result.id,
            treatmentType: body.treatmentType,
            urgencyLevel: body.urgencyLevel,
          },
        );
        break;

      case "process":
        // Process waitlist for available slot
        if (!body.availableStart || !body.availableEnd || !body.professionalId) {
          return NextResponse.json(
            {
              error:
                "availableStart, availableEnd, and professionalId are required for process action",
            },
            { status: 400 },
          );
        }

        result = await waitlistService.processWaitlistForSlot(
          new Date(body.availableStart),
          new Date(body.availableEnd),
          body.professionalId,
          body.treatmentType,
        );

        await auditLogger.logActivity(
          "waitlist_processed",
          `Waitlist processed for available slot`,
          {
            userId: session.user.id,
            professionalId: body.professionalId,
            treatmentType: body.treatmentType,
            matchesFound: result.length,
          },
        );
        break;

      case "notify":
        // Send notifications to waitlist patients
        if (!body.waitlistEntryId || !body.availableSlots) {
          return NextResponse.json(
            { error: "waitlistEntryId and availableSlots are required for notify action" },
            { status: 400 },
          );
        }

        result = await waitlistService.sendWaitlistNotifications(
          body.waitlistEntryId,
          body.availableSlots,
        );

        await auditLogger.logActivity(
          "waitlist_notification",
          `Notification sent to waitlist entry ${body.waitlistEntryId}`,
          {
            userId: session.user.id,
            waitlistEntryId: body.waitlistEntryId,
            availableSlots: body.availableSlots.length,
          },
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Must be add, process, or notify" },
          { status: 400 },
        );
    }

    // Return results
    return NextResponse.json({
      success: true,
      action: body.action,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        apiVersion: "2.2.0",
      },
    });
  } catch (error) {
    console.error("Waitlist management error:", error);

    await auditLogger.logError("Waitlist management API failed", error);

    return NextResponse.json(
      {
        error: "Internal server error during waitlist management",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}

// GET handler for retrieving waitlist entries
export async function GET(request: NextRequest) {
  const auditLogger = new AuditLogger();

  try {
    // Get user session
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query parameters
    const url = new URL(request.url);
    const treatmentType = url.searchParams.get("treatmentType");
    const status = url.searchParams.get("status") || "active";
    const limit = parseInt(url.searchParams.get("limit") || "50");

    // Build query
    let query = supabase
      .from("waitlist_entries")
      .select("*")
      .eq("status", status)
      .order("priority_score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(limit);

    if (treatmentType) {
      query = query.eq("treatment_type", treatmentType);
    }

    const { data: waitlistEntries, error } = await query;

    if (error) {
      throw error;
    }

    await auditLogger.logActivity(
      "waitlist_retrieved",
      `Retrieved ${waitlistEntries.length} waitlist entries`,
      {
        userId: session.user.id,
        treatmentType,
        status,
        count: waitlistEntries.length,
      },
    );

    return NextResponse.json({
      success: true,
      data: waitlistEntries,
      metadata: {
        count: waitlistEntries.length,
        timestamp: new Date().toISOString(),
        apiVersion: "2.2.0",
      },
    });
  } catch (error) {
    console.error("Waitlist retrieval error:", error);

    await auditLogger.logError("Waitlist retrieval API failed", error);

    return NextResponse.json(
      {
        error: "Internal server error during waitlist retrieval",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}

// Options handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
