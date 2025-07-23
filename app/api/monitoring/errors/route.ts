import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";
import { intelligentErrorHandler } from "@/lib/error-handling/intelligent-error-handler";

/**
 * 🔧 Error Monitoring & Management API
 * 
 * Provides real-time error analytics and management capabilities
 */

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeWindow = parseInt(searchParams.get("timeWindow") || "1800000"); // 30min default
    const errorId = searchParams.get("errorId");
    
    if (errorId) {
      // Get specific error details
      const error = intelligentErrorHandler.getError(errorId);
      if (!error) {
        return NextResponse.json({ error: "Error not found" }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        error,
        timestamp: Date.now(),
      });
    } else {
      // Get error summary
      const summary = intelligentErrorHandler.getErrorSummary(timeWindow);
      return NextResponse.json({
        success: true,
        timeWindow,
        summary,
        timestamp: Date.now(),
      });
    }

  } catch (error) {
    console.error("Error monitoring API failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}/**
 * 📝 Report client-side error
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, stack, route, severity, metadata } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Error message is required" },
        { status: 400 }
      );
    }

    const errorContext = intelligentErrorHandler.captureError(message, {
      stack,
      route,
      userId: user.id,
      severity: severity || 'medium',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        ...metadata,
        clientReported: true,
      },
    });

    return NextResponse.json({
      success: true,
      errorId: errorContext.errorId,
      recoveryAction: errorContext.recoveryAction,
    });

  } catch (error) {
    console.error("Error reporting failed:", error);
    return NextResponse.json(
      { error: "Failed to report error" },
      { status: 500 }
    );
  }
}/**
 * ✅ Mark error as resolved
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { errorId, resolution } = body;

    if (!errorId) {
      return NextResponse.json(
        { error: "Error ID is required" },
        { status: 400 }
      );
    }

    const resolved = intelligentErrorHandler.resolveError(errorId, resolution);
    
    if (!resolved) {
      return NextResponse.json({ error: "Error not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, resolved: true });

  } catch (error) {
    console.error("Error resolution failed:", error);
    return NextResponse.json(
      { error: "Failed to resolve error" },
      { status: 500 }
    );
  }
}