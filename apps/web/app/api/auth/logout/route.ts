import { RealAuthService } from "@neonpro/security";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Validate required environment variables
function validateEnvironmentVariables() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  const missingVars: string[] = [];

  if (!supabaseUrl) missingVars.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingVars.push("SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!jwtSecret) missingVars.push("JWT_SECRET");

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }

  return { supabaseUrl, supabaseAnonKey, jwtSecret };
}

// Initialize auth service with validated environment variables
let authService: RealAuthService;
try {
  const { supabaseUrl, supabaseAnonKey, jwtSecret } = validateEnvironmentVariables();
  authService = new RealAuthService(supabaseUrl, supabaseAnonKey, jwtSecret);
} catch (error) {
  console.error("Auth service initialization failed:", error);
  // AuthService will be undefined, causing 500 errors which is appropriate
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("neonpro_session_id")?.value;

    if (sessionId) {
      await authService.logout(sessionId);
    }

    const response = NextResponse.json({ success: true });

    // Clear auth cookies
    response.cookies.delete("neonpro_access_token");
    response.cookies.delete("neonpro_refresh_token");
    response.cookies.delete("neonpro_session_id");

    return response;
  } catch (error) {
    console.error("Logout API error:", error);

    // Still clear cookies even if logout fails
    const response = NextResponse.json({ success: true });
    response.cookies.delete("neonpro_access_token");
    response.cookies.delete("neonpro_refresh_token");
    response.cookies.delete("neonpro_session_id");

    return response;
  }
}
