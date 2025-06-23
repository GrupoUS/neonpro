/**
 * Google OAuth Callback Workaround
 * This endpoint receives the OAuth callback from Google and forwards it to Supabase
 * Solves the "domain invalid" error by using our app domain as intermediary
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  
  console.log("=== Google OAuth Callback Workaround ===");
  console.log("Received callback from Google");
  console.log("Search params:", Object.fromEntries(searchParams.entries()));
  
  // Get OAuth parameters from Google
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  
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
  
  // If we have a code, forward it to Supabase
  if (code) {
    console.log("Forwarding OAuth code to Supabase...");
    
    // Build Supabase callback URL
    const supabaseCallbackUrl = new URL(
      "https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback"
    );
    
    // Forward all parameters to Supabase
    supabaseCallbackUrl.searchParams.set("code", code);
    if (state) {
      supabaseCallbackUrl.searchParams.set("state", state);
    }
    
    console.log("Redirecting to Supabase:", supabaseCallbackUrl.toString());
    
    // Redirect to Supabase for processing
    return NextResponse.redirect(supabaseCallbackUrl.toString());
  }
  
  // No code and no error - invalid callback
  console.error("Invalid callback - no code or error parameter");
  const errorUrl = new URL("/auth/auth-code-error", origin);
  errorUrl.searchParams.set("error", "invalid_callback");
  errorUrl.searchParams.set("description", "No authorization code received from Google");
  return NextResponse.redirect(errorUrl.toString());
}
