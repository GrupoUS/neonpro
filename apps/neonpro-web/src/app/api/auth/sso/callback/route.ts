// SSO Callback Route
// Story 1.3: SSO Integration - OAuth Callback Processing

import type { NextRequest, NextResponse } from "next/server";
import type { ssoManager } from "@/lib/auth/sso/sso-manager";
import type { logger } from "@/lib/logger";
import type { z } from "zod";
import type { cookies } from "next/headers";

const callbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().optional(),
  provider: z.string().min(1, "Provider is required"),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check for OAuth errors first
    const error = searchParams.get("error");
    if (error) {
      const errorDescription = searchParams.get("error_description");

      logger.warn("SSO callback: OAuth error received", {
        error,
        errorDescription,
        provider: searchParams.get("provider"),
      });

      // Redirect to login with error
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("error", "sso_failed");
      loginUrl.searchParams.set("message", errorDescription || "SSO authentication failed");

      return NextResponse.redirect(loginUrl);
    }

    // Validate callback parameters
    const validationResult = callbackSchema.safeParse({
      code: searchParams.get("code"),
      state: searchParams.get("state"),
      provider: searchParams.get("provider"),
      error: searchParams.get("error"),
      error_description: searchParams.get("error_description"),
    });

    if (!validationResult.success) {
      logger.warn("SSO callback: Invalid parameters", {
        errors: validationResult.error.errors,
        params: Object.fromEntries(searchParams.entries()),
      });

      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("error", "invalid_callback");
      loginUrl.searchParams.set("message", "Invalid callback parameters");

      return NextResponse.redirect(loginUrl);
    }

    const { code, state, provider: providerId } = validationResult.data;

    // Process the callback
    const result = await ssoManager.handleCallback(providerId, {
      code,
      state,
    });

    if (!result.success) {
      logger.error("SSO callback: Authentication failed", {
        providerId,
        error: result.error,
      });

      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("error", "auth_failed");
      loginUrl.searchParams.set("message", result.error?.message || "Authentication failed");

      return NextResponse.redirect(loginUrl);
    }

    // Set session cookies
    // Cookie instantiation moved inside request handlers;

    if (result.session) {
      // Set session cookie
      cookieStore.set("sso_session", result.session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: result.session.expiresAt
          ? Math.floor((new Date(result.session.expiresAt).getTime() - Date.now()) / 1000)
          : 60 * 60 * 24 * 7, // 7 days default
        path: "/",
      });

      // Set user info cookie (non-sensitive data only)
      cookieStore.set(
        "sso_user",
        JSON.stringify({
          id: result.user?.id,
          email: result.user?.email,
          name: result.user?.name,
          provider: providerId,
        }),
        {
          httpOnly: false, // Accessible to client-side
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        },
      );
    }

    logger.info("SSO callback: Authentication successful", {
      providerId,
      userId: result.user?.id,
      email: result.user?.email,
      isNewUser: result.isNewUser,
    });

    // Determine redirect URL
    let redirectUrl = "/dashboard"; // Default redirect

    if (state) {
      try {
        const stateParams = new URLSearchParams(state);
        const redirectTo = stateParams.get("redirect_to");
        if (redirectTo) {
          // Validate redirect URL is safe (same origin)
          const redirectUrlObj = new URL(redirectTo, request.url);
          if (redirectUrlObj.origin === new URL(request.url).origin) {
            redirectUrl = redirectTo;
          }
        }
      } catch (error) {
        logger.warn("SSO callback: Invalid state parameter", { state, error: error.message });
      }
    }

    // Add success parameters for new users
    const finalUrl = new URL(redirectUrl, request.url);
    if (result.isNewUser) {
      finalUrl.searchParams.set("welcome", "true");
    }
    finalUrl.searchParams.set("sso_success", "true");

    return NextResponse.redirect(finalUrl);
  } catch (error) {
    logger.error("SSO callback: Unexpected error", {
      error: error.message,
      stack: error.stack,
    });

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("error", "server_error");
    loginUrl.searchParams.set("message", "An unexpected error occurred");

    return NextResponse.redirect(loginUrl);
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: "METHOD_NOT_ALLOWED", message: "POST method not allowed" },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "METHOD_NOT_ALLOWED", message: "PUT method not allowed" },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "METHOD_NOT_ALLOWED", message: "DELETE method not allowed" },
    { status: 405 },
  );
}
