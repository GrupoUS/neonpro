import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { FacebookOAuthHandler } from '@/lib/oauth/platforms/facebook-handler';

/**
 * Facebook OAuth Callback Endpoint
 * Handles the OAuth 2.0 authorization code callback from Facebook
 *
 * Features:
 * - State validation for CSRF protection
 * - Token exchange and secure storage
 * - User profile synchronization
 * - Comprehensive error handling
 * - Audit logging
 */

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors from Facebook
    if (error) {
      const redirectUrl = `/dashboard/social-media?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || 'Facebook authorization failed')}`;
      return redirect(redirectUrl);
    }

    // Validate required parameters
    if (!(code && state)) {
      return redirect(
        '/dashboard/social-media?error=invalid_request&message=Missing authorization code or state'
      );
    }

    // Initialize Facebook OAuth handler
    const facebookHandler = new FacebookOAuthHandler();

    // Exchange code for tokens with state validation
    const tokens = await facebookHandler.exchangeCodeForTokens(code, state);

    // Get user profile from Facebook
    const profile = await facebookHandler.getUserProfile(tokens.accessToken);

    // Verify user is still authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return redirect(
        '/login?error=session_expired&message=Please log in again'
      );
    }

    // Get user's clinic information
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!userProfile?.clinic_id) {
      return redirect(
        '/dashboard/social-media?error=clinic_not_found&message=Clinic configuration missing'
      );
    }

    // Store encrypted tokens and account information
    const _accountId = await facebookHandler.storeTokens(
      session.user.id,
      userProfile.clinic_id,
      tokens,
      profile
    );

    // Update social media platform status
    await supabase.from('social_media_platforms').upsert(
      {
        platform: 'facebook',
        is_enabled: true,
        last_connected_at: new Date().toISOString(),
        connection_count: supabase.sql`connection_count + 1`,
      },
      { onConflict: 'platform' }
    );

    // Redirect to success page
    return redirect(
      '/dashboard/social-media?success=true&platform=facebook&message=Facebook account connected successfully'
    );
  } catch (error) {
    // Store error for debugging
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('oauth_errors').insert({
          user_id: session.user.id,
          platform: 'facebook',
          error_type: 'callback_error',
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
          occurred_at: new Date().toISOString(),
        });
      }
    } catch (_logError) {}

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return redirect(
      `/dashboard/social-media?error=connection_failed&message=${encodeURIComponent(errorMessage)}`
    );
  }
}
