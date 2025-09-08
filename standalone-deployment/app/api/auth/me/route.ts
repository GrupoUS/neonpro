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

// Lazy getter and guard for auth service
let authService: RealAuthService | undefined;
function getAuthService(): RealAuthService {
  if (!authService) {
    const { supabaseUrl, supabaseAnonKey, jwtSecret } = validateEnvironmentVariables();
    authService = new RealAuthService(supabaseUrl, supabaseAnonKey, jwtSecret);
  }
  return authService;
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

    const svc = getAuthService();
    const user = await svc.getCurrentUser();

    if (user) {
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Get current user API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Missing required environment variables") ? 500 : 500;
    return NextResponse.json(
      {
        success: false,
        error: message.includes("Missing required environment variables")
          ? "Auth service unavailable"
          : "Internal server error",
      },
      { status },
    );
  }
}
