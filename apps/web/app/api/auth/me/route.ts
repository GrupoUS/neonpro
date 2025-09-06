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

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("neonpro_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "No access token provided" },
        { status: 401 },
      );
    }

    const user = await authService.getCurrentUser();

    if (user) {
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Get current user API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
