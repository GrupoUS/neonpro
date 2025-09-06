import { RealAuthService } from "@neonpro/security/auth/RealAuthService";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const authService = new RealAuthService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  process.env.JWT_SECRET!,
);

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
