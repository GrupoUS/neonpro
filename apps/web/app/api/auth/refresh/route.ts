import { RealAuthService } from "@neonpro/security/auth/RealAuthService";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const authService = new RealAuthService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  process.env.JWT_SECRET!,
);

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("neonpro_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token provided" },
        { status: 401 },
      );
    }

    const result = await authService.refreshToken(refreshToken);

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
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
