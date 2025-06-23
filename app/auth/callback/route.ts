import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log(
    "OAuth Callback - Code:",
    !!code,
    "Error:",
    error,
    "Description:",
    errorDescription
  );

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
      const supabase = createClient();
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      console.log(
        "Code Exchange - Success:",
        !!data.session,
        "Error:",
        exchangeError?.message
      );

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

        console.log("Redirecting to:", redirectUrl);
        return NextResponse.redirect(redirectUrl);
      } else {
        console.error("Code exchange failed:", exchangeError);
        const errorUrl = new URL("/auth/auth-code-error", origin);
        errorUrl.searchParams.set("error", "exchange_failed");
        errorUrl.searchParams.set(
          "description",
          exchangeError?.message || "Failed to exchange code for session"
        );
        return NextResponse.redirect(errorUrl.toString());
      }
    } catch (err: any) {
      console.error("Unexpected error during code exchange:", err);
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
