import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  // Enhanced logging for debugging
  console.log("=== OAuth Callback Debug Info ===");
  console.log("Full URL:", request.url);
  console.log("Origin:", origin);
  console.log("Code present:", !!code);
  console.log("Error:", error);
  console.log("Error Description:", errorDescription);
  console.log("Next URL:", next);
  console.log("All search params:", Object.fromEntries(searchParams.entries()));

  // Handle OAuth errors from Google
  if (error) {
    console.error("OAuth Error from Google:", error, errorDescription);
    const errorUrl = new URL("/auth/auth-code-error", origin);
    errorUrl.searchParams.set("error", error);
    if (errorDescription) {
      errorUrl.searchParams.set("description", errorDescription);
    }
    return NextResponse.redirect(errorUrl.toString());
  }

  if (code) {
    try {
      console.log("=== Starting Code Exchange ===");
      const supabase = createClient();

      // Enhanced logging before exchange
      console.log("Supabase client created successfully");
      console.log(
        "Attempting to exchange code:",
        code.substring(0, 10) + "..."
      );

      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      // Enhanced logging after exchange
      console.log("=== Code Exchange Results ===");
      console.log("Exchange successful:", !exchangeError);
      console.log("Session present:", !!data?.session);
      console.log("User present:", !!data?.user);
      if (exchangeError) {
        console.error("Exchange error details:", {
          message: exchangeError.message,
          status: exchangeError.status,
          details: exchangeError,
        });
      }

      if (!exchangeError && data.session) {
        // Successful authentication
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        let redirectUrl: string;
        if (isLocalEnv) {
          redirectUrl = `${origin}${next}`;
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`;
        } else {
          redirectUrl = `${origin}${next}`;
        }

        console.log("=== Successful Authentication ===");
        console.log("User ID:", data.user?.id);
        console.log("User Email:", data.user?.email);
        console.log("Redirecting to:", redirectUrl);

        // Create response with proper headers
        const response = NextResponse.redirect(redirectUrl);

        // Set session cookies manually if needed
        if (data.session.access_token) {
          response.cookies.set("sb-access-token", data.session.access_token, {
            httpOnly: true,
            secure: !isLocalEnv,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
        }

        if (data.session.refresh_token) {
          response.cookies.set("sb-refresh-token", data.session.refresh_token, {
            httpOnly: true,
            secure: !isLocalEnv,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
          });
        }

        return response;
      } else {
        console.error("=== Code Exchange Failed ===");
        console.error("Exchange error:", exchangeError);
        const errorUrl = new URL("/auth/auth-code-error", origin);
        errorUrl.searchParams.set("error", "exchange_failed");
        errorUrl.searchParams.set(
          "description",
          exchangeError?.message || "Failed to exchange code for session"
        );
        return NextResponse.redirect(errorUrl.toString());
      }
    } catch (err: any) {
      console.error("=== Unexpected Error During Code Exchange ===");
      console.error("Error details:", err);
      console.error("Error stack:", err.stack);
      const errorUrl = new URL("/auth/auth-code-error", origin);
      errorUrl.searchParams.set("error", "unexpected_error");
      errorUrl.searchParams.set(
        "description",
        err.message || "Unexpected error occurred"
      );
      return NextResponse.redirect(errorUrl.toString());
    }
  }

  // No code and no error - invalid callback
  console.error("Invalid callback - no code or error parameter");
  const errorUrl = new URL("/auth/auth-code-error", origin);
  errorUrl.searchParams.set("error", "invalid_callback");
  errorUrl.searchParams.set("description", "No authorization code received");
  return NextResponse.redirect(errorUrl.toString());
}
