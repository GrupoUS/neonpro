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
