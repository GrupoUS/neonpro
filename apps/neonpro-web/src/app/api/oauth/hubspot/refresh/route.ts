import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { HubSpotOAuthHandler } from "@/lib/oauth/platforms/hubspot-handler";
import type { Logger } from "@/lib/logger";
import type { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  const requestId = randomBytes(16).toString("hex");

  try {
    Logger.info("HubSpot OAuth token refresh request initiated", {
      requestId,
      provider: "hubspot",
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    });

    // Verify user session
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      Logger.warn("HubSpot OAuth token refresh attempted without valid session", {
        requestId,
        provider: "hubspot",
        error: sessionError?.message,
      });

      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get existing HubSpot connection
    const { data: connection, error: connectionError } = await supabase
      .from("marketing_platform_connections")
      .select("id, encrypted_token, token_expires_at, status")
      .eq("profile_id", session.user.id)
      .eq("platform_type", "hubspot")
      .single();

    if (connectionError || !connection) {
      Logger.error("HubSpot connection not found for token refresh", {
        requestId,
        provider: "hubspot",
        userId: session.user.id,
        error: connectionError?.message,
      });

      return NextResponse.json({ error: "HubSpot connection not found" }, { status: 404 });
    }

    if (connection.status !== "connected") {
      Logger.warn("Attempted to refresh token for disconnected HubSpot account", {
        requestId,
        provider: "hubspot",
        userId: session.user.id,
        connectionId: connection.id,
        status: connection.status,
      });

      return NextResponse.json({ error: "HubSpot account not connected" }, { status: 400 });
    }

    // Check if token actually needs refresh
    const tokenExpiresAt = new Date(connection.token_expires_at);
    const now = new Date();
    const timeUntilExpiry = tokenExpiresAt.getTime() - now.getTime();
    const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);

    if (minutesUntilExpiry > 5) {
      Logger.info("HubSpot token still valid, refresh not needed", {
        requestId,
        provider: "hubspot",
        userId: session.user.id,
        connectionId: connection.id,
        expiresAt: tokenExpiresAt,
        minutesUntilExpiry: Math.round(minutesUntilExpiry),
      });

      return NextResponse.json({
        message: "Token still valid",
        expiresAt: tokenExpiresAt,
        minutesUntilExpiry: Math.round(minutesUntilExpiry),
      });
    }

    // Refresh the token
    const oauthHandler = new HubSpotOAuthHandler();
    const newEncryptedToken = await oauthHandler.refreshToken(connection.encrypted_token);

    // Update connection with new token
    const { error: updateError } = await supabase
      .from("marketing_platform_connections")
      .update({
        encrypted_token: newEncryptedToken.encryptedData,
        token_expires_at: newEncryptedToken.expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", connection.id);

    if (updateError) {
      Logger.error("Failed to update HubSpot connection with refreshed token", {
        requestId,
        provider: "hubspot",
        userId: session.user.id,
        connectionId: connection.id,
        error: updateError.message,
      });

      return NextResponse.json({ error: "Failed to save refreshed token" }, { status: 500 });
    }

    // Log token refresh
    await supabase.from("oauth_audit_log").insert({
      profile_id: session.user.id,
      provider: "hubspot",
      action: "token_refreshed",
      request_id: requestId,
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
      details: {
        connectionId: connection.id,
        oldExpiresAt: connection.token_expires_at,
        newExpiresAt: newEncryptedToken.expiresAt,
      },
    });

    Logger.info("HubSpot OAuth token refresh successful", {
      requestId,
      provider: "hubspot",
      userId: session.user.id,
      connectionId: connection.id,
      newExpiresAt: newEncryptedToken.expiresAt,
    });

    return NextResponse.json({
      message: "Token refreshed successfully",
      expiresAt: newEncryptedToken.expiresAt,
      connectionId: connection.id,
    });
  } catch (error) {
    Logger.error("HubSpot OAuth token refresh error", {
      requestId,
      provider: "hubspot",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to refresh HubSpot token",
        requestId,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
