import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${origin}/login?error=auth_error`);
      }
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        // In development, redirect to localhost
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        // In production, redirect to the forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      // Fallback to origin
      return NextResponse.redirect(`${origin}${next}`);
    } catch (err) {
      console.error('Unexpected auth callback error:', err);
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
}
