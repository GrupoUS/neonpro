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
    const body = await request.json();
    const { email, password, deviceInfo } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    const result = await authService.login({
      email,
      password,
      deviceInfo: deviceInfo || {
        userAgent: request.headers.get("user-agent") || "Unknown",
        ip: request.headers.get("x-forwarded-for")
          || request.headers.get("x-real-ip")
          || "127.0.0.1",
      },
    });

    if (result.success) {
      const response = NextResponse.json(result);

      // Set secure cookies for tokens
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

      if (result.sessionId) {
        response.cookies.set("neonpro_session_id", result.sessionId, {
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
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
