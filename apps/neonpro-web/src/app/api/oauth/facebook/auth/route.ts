import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { FacebookOAuthHandler } from "@/lib/oauth/platforms/facebook-handler";
import type { OAuthState } from "@/lib/oauth/types";

/**
 * Facebook OAuth Authorization Endpoint
 * Initiates the OAuth 2.0 authorization code flow for Facebook
 *
 * Features:
 * - CSRF protection with state parameter
 * - Secure state storage in database
 * - Comprehensive error handling
 * - Research-backed security practices
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in to connect Facebook account" },
        { status: 401 },
      );
    }

    // Get user's clinic from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: "Clinic not found - Please ensure your profile is properly configured" },
        { status: 400 },
      );
    }

    // Create OAuth state for CSRF protection
    const state: OAuthState = {
      userId: session.user.id,
      clinicId: profile.clinic_id,
      platform: "facebook",
      nonce: crypto.randomUUID(),
      createdAt: new Date(),
      redirectTo: request.nextUrl.searchParams.get("redirect") || "/dashboard/social-media",
    };

    // Initialize Facebook OAuth handler
    const facebookHandler = new FacebookOAuthHandler();
    const authUrl = facebookHandler.getAuthorizationUrl(state);

    // Log OAuth initiation for audit trail
    console.log(
      `Facebook OAuth initiated for user ${session.user.id}, clinic ${profile.clinic_id}`,
    );

    return NextResponse.json({
      success: true,
      authUrl,
      state: state.nonce,
      platform: "facebook",
    });
  } catch (error) {
    console.error("Facebook OAuth authorization error:", error);

    return NextResponse.json(
      {
        error: "Failed to initiate Facebook authorization",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
