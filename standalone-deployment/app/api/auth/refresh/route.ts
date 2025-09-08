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

// Lazy, typed getter for auth service
let authService: RealAuthService | undefined;
function getAuthService(): RealAuthService {
  if (!authService) {
    const { supabaseUrl, supabaseAnonKey, jwtSecret } = validateEnvironmentVariables();
    authService = new RealAuthService(supabaseUrl, supabaseAnonKey, jwtSecret);
  }
  return authService;
}

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("neonpro_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token provided" },
        { status: 401 },
      );
    }

    const svc = getAuthService();
    const result = await svc.refreshToken(refreshToken);

    if (result.success) {
      const response = NextResponse.json(result);

      // Update cookies with new tokens
      if (result.accessToken) {
        response.cookies.set("neonpro_access_token", result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24, // 24 hours
        });
      }

      if (result.refreshToken) {
        response.cookies.set("neonpro_refresh_token", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }

      return response;
    }

    return NextResponse.json(result, { status: 401 });
  } catch (error) {
    console.error("Refresh API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const isConfig = message.includes("Missing required environment variables");
    return NextResponse.json(
      {
        success: false,
        error: isConfig ? "Service unavailable: configuration error" : "Internal server error",
      },
      { status: isConfig ? 503 : 500 },
    );
  }
}
