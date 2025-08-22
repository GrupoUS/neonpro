import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  if (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_failed`
    );
  }

  if (code) {
    try {
      const { error: authError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (authError) {
        console.error('Exchange code error:', authError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=exchange_failed`
        );
      }

      // Successful authentication - redirect to dashboard
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } catch (err) {
      console.error('Unexpected auth error:', err);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=unexpected`
      );
    }
  }

  // No code parameter - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
