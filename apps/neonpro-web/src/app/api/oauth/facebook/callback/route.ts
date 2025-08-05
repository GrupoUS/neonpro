import type { redirect } from "next/navigation";
import type { NextRequest, NextResponse } from "next/server";
import type { FacebookOAuthHandler } from "@/lib/oauth/platforms/facebook-handler";
import type { createClient } from "@/lib/supabase/server";

/**
 * Facebook OAuth Callback Endpoint
 * Handles the OAuth 2.0 authorization code callback from Facebook
 *
 * Features:
 * - State validation for CSRF protection
 * - Token exchange and secure storage
 * - User profile synchronization
 * - Comprehensive error handling
 * - Audit logging
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors from Facebook
    if (error) {
      console.error("Facebook OAuth error:", { error, errorDescription });
      const redirectUrl = `/dashboard/social-media?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || "Facebook authorization failed")}`;
      return redirect(redirectUrl);
    }

    // Validate required parameters
    if (!code || !state) {
      console.error("Missing required OAuth parameters:", { code: !!code, state: !!state });
      return redirect(
        "/dashboard/social-media?error=invalid_request&message=Missing authorization code or state",
      );
    }

    // Initialize Facebook OAuth handler
    const facebookHandler = new FacebookOAuthHandler();

    // Exchange code for tokens with state validation
    const tokens = await facebookHandler.exchangeCodeForTokens(code, state);

    // Get user profile from Facebook
    const profile = await facebookHandler.getUserProfile(tokens.accessToken);

    // Verify user is still authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error("User session expired during OAuth callback");
      return redirect("/login?error=session_expired&message=Please log in again");
    }

    // Get user's clinic information
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", session.user.id)
      .single();

    if (!userProfile?.clinic_id) {
      console.error("User clinic not found during Facebook OAuth callback");
      return redirect(
        "/dashboard/social-media?error=clinic_not_found&message=Clinic configuration missing",
      );
    }

    // Store encrypted tokens and account information
    const accountId = await facebookHandler.storeTokens(
      session.user.id,
      userProfile.clinic_id,
      tokens,
      profile,
    );

    // Log successful connection for audit trail
    console.log(
      `Facebook account connected successfully for user ${session.user.id}, clinic ${userProfile.clinic_id}, account ${accountId}`,
    );

    // Update social media platform status
    await supabase.from("social_media_platforms").upsert(
      {
        platform: "facebook",
        is_enabled: true,
        last_connected_at: new Date().toISOString(),
        connection_count: supabase.sql`connection_count + 1`,
      },
      { onConflict: "platform" },
    );

    // Redirect to success page
    return redirect(
      "/dashboard/social-media?success=true&platform=facebook&message=Facebook account connected successfully",
    );
  } catch (error) {
    console.error("Facebook OAuth callback error:", error);

    // Store error for debugging
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from("oauth_errors").insert({
          user_id: session.user.id,
          platform: "facebook",
          error_type: "callback_error",
          error_message: error instanceof Error ? error.message : "Unknown error",
          occurred_at: new Date().toISOString(),
        });
      }
    } catch (logError) {
      console.error("Failed to log OAuth error:", logError);
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return redirect(
      `/dashboard/social-media?error=connection_failed&message=${encodeURIComponent(errorMessage)}`,
    );
  }
}
