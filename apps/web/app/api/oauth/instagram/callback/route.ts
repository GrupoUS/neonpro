import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { InstagramOAuthHandler } from '@/lib/oauth/platforms/instagram-handler';

/**
 * Instagram OAuth Callback Endpoint
 * Handles the OAuth callback from Instagram with authorization code
 * Exchanges code for tokens and stores encrypted credentials
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors from Instagram
    if (error) {
      console.error('Instagram OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/dashboard/social-media?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`,
          request.url
        )
      );
    }

    // Validate required parameters
    if (!(code && state)) {
      return NextResponse.redirect(
        new URL('/dashboard/social-media?error=missing_parameters', request.url)
      );
    }

    const supabase = await createClient();
    const instagramHandler = new InstagramOAuthHandler();

    // Exchange authorization code for tokens
    const tokens = await instagramHandler.exchangeCodeForTokens(code, state);

    // Get user profile from Instagram
    const profile = await instagramHandler.getUserProfile(tokens.accessToken);

    // Validate OAuth state and get user context
    const oauthState = await instagramHandler.validateOAuthState(state);
    if (!oauthState) {
      return NextResponse.redirect(
        new URL('/dashboard/social-media?error=invalid_state', request.url)
      );
    }

    // Store encrypted tokens and account information
    const accountId = await instagramHandler.storeTokens(
      oauthState.userId,
      oauthState.clinicId,
      tokens,
      profile
    );

    // Log successful connection
    await supabase.from('activity_logs').insert({
      user_id: oauthState.userId,
      clinic_id: oauthState.clinicId,
      action: 'social_media_connected',
      entity_type: 'social_media_account',
      entity_id: accountId,
      details: {
        platform: 'instagram',
        username: profile.username,
        account_id: accountId,
      },
    });

    // Redirect to success page with account information
    const redirectUrl = new URL(
      oauthState.redirectTo || '/dashboard/social-media',
      request.url
    );
    redirectUrl.searchParams.set('success', 'instagram_connected');
    redirectUrl.searchParams.set('username', profile.username || profile.name);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Instagram OAuth callback error:', error);

    // Redirect to error page with details
    const errorUrl = new URL('/dashboard/social-media', request.url);
    errorUrl.searchParams.set('error', 'callback_failed');
    errorUrl.searchParams.set(
      'error_description',
      error instanceof Error ? error.message : 'Unknown error'
    );

    return NextResponse.redirect(errorUrl);
  }
}

/**
 * Handle POST requests for webhook verification (future implementation)
 */
export async function POST(_request: NextRequest) {
  try {
    // Instagram webhook verification logic will be implemented here
    // This is for future webhook integration with Instagram Graph API
    return NextResponse.json({
      message: 'Webhook endpoint - implementation pending',
    });
  } catch (error) {
    console.error('Instagram webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
