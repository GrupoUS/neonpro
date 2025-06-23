import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface AuthError extends Error {
  code?: string;
  message: string;
}

export async function GET(request: Request) {
  console.log("=== OAuth Callback Started ===");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  console.log("Callback URL:", requestUrl.toString());
  console.log("Callback params:", {
    hasCode: !!code,
    hasError: !!error,
    error,
    error_description,
    next,
    origin: requestUrl.origin,
    host: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
  });

  // Check for OAuth errors first
  if (error) {
    console.error("OAuth Error:", error, error_description);

    // Special handling for common OAuth errors
    if (error === "redirect_uri_mismatch") {
      console.error(
        "CRITICAL: Redirect URI mismatch! Check Google Console configuration."
      );
      return NextResponse.redirect(
        `${
          requestUrl.origin
        }/auth/auth-code-error?error=redirect_uri_mismatch&description=${encodeURIComponent(
          "Google OAuth redirect URI não está configurado corretamente. Verifique o Google Console."
        )}`
      );
    }

    return NextResponse.redirect(
      `${
        requestUrl.origin
      }/auth/auth-code-error?error=${error}&description=${encodeURIComponent(
        error_description || "OAuth error occurred"
      )}`
    );
  }

  // Validate environment variables (check both possible env var names)
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      nodeEnv: process.env.NODE_ENV,
    });
    return NextResponse.redirect(
      `${
        requestUrl.origin
      }/auth/auth-code-error?error=config&description=${encodeURIComponent(
        "Configuração do servidor inválida - variáveis de ambiente ausentes"
      )}`
    );
  }

  if (!code) {
    console.error("No authorization code received!");
    console.error("Request URL:", requestUrl.toString());
    console.error(
      "All search params:",
      Object.fromEntries(requestUrl.searchParams.entries())
    );
    console.error("This usually means:");
    console.error("1. Redirect URI mismatch in Google Console");
    console.error("2. Wrong callback URL in Supabase settings");
    console.error("3. User cancelled the OAuth flow");
    console.error("4. OAuth state parameter issues");

    // Check if there are any other parameters that might indicate the issue
    const allParams = Object.fromEntries(requestUrl.searchParams.entries());
    const diagnosticInfo = {
      url: requestUrl.toString(),
      params: allParams,
      hasState: !!requestUrl.searchParams.get("state"),
      hasError: !!requestUrl.searchParams.get("error"),
      origin: requestUrl.origin,
      pathname: requestUrl.pathname,
    };

    console.error("Diagnostic info:", JSON.stringify(diagnosticInfo, null, 2));

    return NextResponse.redirect(
      `${
        requestUrl.origin
      }/auth/auth-code-error?error=no_code&description=${encodeURIComponent(
        "Código de autorização não recebido. Verifique as configurações do Google OAuth."
      )}&debug=${encodeURIComponent(JSON.stringify(diagnosticInfo))}`
    );
  }

  try {
    const supabase = await createClient();

    console.log("Exchanging code for session...");
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const authError = exchangeError as AuthError;
      console.error("Exchange code error:", {
        code: authError.code,
        message: authError.message,
        fullError: exchangeError,
      });

      return NextResponse.redirect(
        `${requestUrl.origin}/auth/auth-code-error?error=${
          authError.code || "exchange_failed"
        }&description=${encodeURIComponent(authError.message)}`
      );
    }

    if (!data?.session) {
      console.error("No session created after code exchange");
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/auth-code-error?error=no_session`
      );
    }

    console.log("Session created successfully!", {
      userId: data.session.user.id,
      email: data.session.user.email,
    });

    // Create or update user profile in the database
    const user = data.session.user;
    const profileData = {
      id: user.id,
      email: user.email!,
      full_name:
        user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url:
        user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      updated_at: new Date().toISOString(),
    };

    console.log("Creating/updating user profile:", profileData);

    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is fine for new users
      console.error("Error checking profile:", profileCheckError);
    }

    if (!existingProfile) {
      // Create new profile
      const { error: createError } = await supabase
        .from("profiles")
        .insert([profileData]);

      if (createError) {
        console.error("Error creating profile:", createError);
        // Don't fail the auth flow if profile creation fails
        // The app can handle missing profiles gracefully
      } else {
        console.log("Profile created successfully");
      }
    } else {
      // Update existing profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          email: profileData.email,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          updated_at: profileData.updated_at,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
      } else {
        console.log("Profile updated successfully");
      }
    }

    // Determine redirect URL based on environment
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    let redirectTo = next;
    if (!redirectTo.startsWith("/")) {
      redirectTo = "/dashboard";
    }

    if (isLocalEnv) {
      return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
    } else {
      return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
    }
  } catch (error) {
    const authError = error as AuthError;
    console.error("Unexpected error in OAuth callback:", {
      error: authError.message,
      stack: authError.stack,
    });

    return NextResponse.redirect(
      `${
        requestUrl.origin
      }/auth/auth-code-error?error=unexpected&description=${encodeURIComponent(
        "Erro inesperado durante autenticação"
      )}`
    );
  }
}
