import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { InstagramOAuthHandler } from "@/lib/oauth/platforms/instagram-handler";
import type { TokenEncryptionService } from "@/lib/oauth/token-encryption";
import type { OAuthState } from "@/lib/oauth/types";

/**
 * Instagram OAuth Authentication Initiation Endpoint
 * Initiates the OAuth flow by redirecting users to Instagram authorization
 * Research-backed implementation following Meta Graph API best practices
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { user } = session;
    const searchParams = request.nextUrl.searchParams;
    const redirectTo = searchParams.get("redirect_to") || "/dashboard/social-media";

    // Get user's clinic context
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: "User clinic context not found" }, { status: 400 });
    }

    // Generate secure state for CSRF protection
    const state: OAuthState = {
      userId: user.id,
      clinicId: profile.clinic_id,
      platform: "instagram",
      nonce: TokenEncryptionService.generateSecureState(),
      createdAt: new Date(),
      redirectTo,
    };

    // Initialize Instagram OAuth handler
    const instagramHandler = new InstagramOAuthHandler();

    // Generate authorization URL
    const authUrl = instagramHandler.getAuthorizationUrl(state);

    // Return authorization URL for client-side redirect
    return NextResponse.json({
      success: true,
      authUrl,
      state: state.nonce,
    });
  } catch (error) {
    console.error("Instagram OAuth initiation error:", error);

    return NextResponse.json(
      {
        error: "Failed to initiate Instagram authentication",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle preflight OPTIONS requests for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
