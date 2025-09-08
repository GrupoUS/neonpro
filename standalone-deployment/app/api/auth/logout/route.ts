import { RealAuthService } from "@neonpro/security";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Validate required environment variables
function validateEnvironmentVariables(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
  jwtSecret: string;
} {
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

  return { supabaseUrl: supabaseUrl!, supabaseAnonKey: supabaseAnonKey!, jwtSecret: jwtSecret! };
}

// Lazy getter and guarded usage of auth service
let authService: RealAuthService | undefined;
function getAuthService(): RealAuthService {
  if (!authService) {
    const { supabaseUrl, supabaseAnonKey, jwtSecret } = validateEnvironmentVariables();
    authService = new RealAuthService(supabaseUrl, supabaseAnonKey, jwtSecret);
  }
  return authService;
}

export async function POST(request: NextRequest) {
  let svc: RealAuthService | undefined;
  try {
    svc = getAuthService();
  } catch (initError) {
    console.error("Auth service initialization failed:", initError);
    const response = NextResponse.json(
      { success: false, error: "Auth service unavailable" },
      { status: 500 },
    );
    // Clear auth cookies even if init failed
    response.cookies.delete("neonpro_access_token");
    response.cookies.delete("neonpro_refresh_token");
    response.cookies.delete("neonpro_session_id");
    return response;
  }

  try {
    const sessionId = request.cookies.get("neonpro_session_id")?.value;

    if (sessionId) {
      await svc.logout(sessionId);
    }

    const response = NextResponse.json({ success: true });

    // Clear auth cookies
    response.cookies.delete("neonpro_access_token");
    response.cookies.delete("neonpro_refresh_token");
    response.cookies.delete("neonpro_session_id");

    return response;
  } catch (error) {
    console.error("Logout API error:", error);

    const response = NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 },
    );
    // Still clear cookies even if logout fails
    response.cookies.delete("neonpro_access_token");
    response.cookies.delete("neonpro_refresh_token");
    response.cookies.delete("neonpro_session_id");

    return response;
  }
}
