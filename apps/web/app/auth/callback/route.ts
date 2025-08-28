import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_failed`,
    );
  }

  if (code) {
    try {
      const { error: authError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (authError) {
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=exchange_failed`,
        );
      }

      // Successful authentication - redirect to dashboard
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } catch {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=unexpected`,
      );
    }
  }

  // No code parameter - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
