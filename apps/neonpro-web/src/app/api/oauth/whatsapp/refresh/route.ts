import type { randomBytes } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { Logger } from "@/lib/logger";
import type { WhatsAppOAuthHandler } from "@/lib/oauth/platforms/whatsapp-handler";
import type { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const requestId = randomBytes(16).toString("hex");

  try {
    Logger.info("WhatsApp OAuth token refresh request initiated", {
      requestId,
      provider: "whatsapp",
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
      Logger.warn("WhatsApp OAuth token refresh attempted without valid session", {
        requestId,
        provider: "whatsapp",
        error: sessionError?.message,
      });

      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get existing WhatsApp connection
    const { data: connection, error: connectionError } = await supabase
      .from("marketing_platform_connections")
      .select("id, encrypted_token, token_expires_at, status")
      .eq("profile_id", session.user.id)
      .eq("platform_type", "whatsapp")
      .single();

    if (connectionError || !connection) {
      Logger.error("WhatsApp connection not found for token refresh", {
        requestId,
        provider: "whatsapp",
        userId: session.user.id,
        error: connectionError?.message,
      });

      return NextResponse.json({ error: "WhatsApp connection not found" }, { status: 404 });
    }

    if (connection.status !== "connected") {
      Logger.warn("Attempted to refresh token for disconnected WhatsApp account", {
        requestId,
        provider: "whatsapp",
        userId: session.user.id,
        connectionId: connection.id,
        status: connection.status,
      });

      return NextResponse.json({ error: "WhatsApp account not connected" }, { status: 400 });
    }

    // Check if token actually needs refresh
    const tokenExpiresAt = new Date(connection.token_expires_at);
    const now = new Date();
    const timeUntilExpiry = tokenExpiresAt.getTime() - now.getTime();
    const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

    if (hoursUntilExpiry > 24) {
      Logger.info("WhatsApp token still valid, refresh not needed", {
        requestId,
        provider: "whatsapp",
        userId: session.user.id,
        connectionId: connection.id,
        expiresAt: tokenExpiresAt,
        hoursUntilExpiry: Math.round(hoursUntilExpiry),
      });

      return NextResponse.json({
        message: "Token still valid",
        expiresAt: tokenExpiresAt,
        hoursUntilExpiry: Math.round(hoursUntilExpiry),
      });
    }

    // Refresh the token
    const oauthHandler = new WhatsAppOAuthHandler();
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
      Logger.error("Failed to update WhatsApp connection with refreshed token", {
        requestId,
        provider: "whatsapp",
        userId: session.user.id,
        connectionId: connection.id,
        error: updateError.message,
      });

      return NextResponse.json({ error: "Failed to save refreshed token" }, { status: 500 });
    }

    // Log token refresh
    await supabase.from("oauth_audit_log").insert({
      profile_id: session.user.id,
      provider: "whatsapp",
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

    Logger.info("WhatsApp OAuth token refresh successful", {
      requestId,
      provider: "whatsapp",
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
    Logger.error("WhatsApp OAuth token refresh error", {
      requestId,
      provider: "whatsapp",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to refresh WhatsApp token",
        requestId,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
