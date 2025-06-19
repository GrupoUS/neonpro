/**
 * OAuth Callback Route for NEONPRO
 * Handles authentication callbacks from OAuth providers
 * Based on Supabase best practices
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  if (error) {
    // Handle OAuth errors
    console.error("OAuth error:", error, error_description);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (code) {
    const supabase = createClient();

    try {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      // Get the user to ensure the session is valid
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User fetch error:", userError);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(
            "Failed to authenticate user"
          )}`
        );
      }

      // Check if this is a new user that needs profile setup
      // @ts-ignore - Supabase generic types issue
      const { data: profile } = await supabase
        .from("neonpro_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // Create profile for new OAuth users
        // @ts-ignore - Supabase generic types issue
        const { error: profileError } = await supabase
          .from("neonpro_profiles")
          .insert({
            id: user.id,
            email: user.email!,
            full_name:
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            role: "admin", // Default role for new users
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      }

      // Successful authentication, redirect to the intended page
      return NextResponse.redirect(`${origin}${next}`);
    } catch (error) {
      console.error("Unexpected error during OAuth callback:", error);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          "An unexpected error occurred"
        )}`
      );
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
