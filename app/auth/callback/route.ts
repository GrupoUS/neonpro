import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface AuthError extends Error {
  code?: string;
  message: string;
}

export async function GET(request: Request) {
  console.log("=== OAuth Callback Started ===");

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("Callback params:", {
    hasCode: !!code,
    hasError: !!error,
    next,
    origin,
  });

  // Validate environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error("Missing Supabase environment variables");
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  if (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    console.error("No authorization code provided");
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=no_code`
    );
  }

  try {
    console.log("Creating Supabase client for code exchange");
    const supabase = await createClient();

    console.log("Exchanging code for session...");
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Exchange code error:", {
        message: exchangeError.message,
        code: (exchangeError as AuthError).code,
      });
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=exchange_failed`
      );
    }

    if (data?.session) {
      console.log("Session created successfully for user:", data.user?.email);

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      let redirectUrl: string;

      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`;
        console.log("Local redirect to:", redirectUrl);
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`;
        console.log("Production redirect (forwarded host) to:", redirectUrl);
      } else {
        redirectUrl = `${origin}${next}`;
        console.log("Production redirect (origin) to:", redirectUrl);
      }

      return NextResponse.redirect(redirectUrl);
    } else {
      console.error("No session created despite successful exchange");
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=no_session`
      );
    }
  } catch (error) {
    console.error("Unexpected error in OAuth callback:", error);
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=unexpected`
    );
  }
}
