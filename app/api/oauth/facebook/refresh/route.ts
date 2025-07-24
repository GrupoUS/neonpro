import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { FacebookOAuthHandler } from '@/lib/oauth/platforms/facebook-handler';
import { TokenEncryptionService } from '@/lib/oauth/token-encryption';

/**
 * Facebook OAuth Token Refresh Endpoint
 * Refreshes Facebook access tokens using fb_exchange_token
 * 
 * Features:
 * - Long-lived token exchange (60-day tokens)
 * - Automatic token encryption and storage
 * - Error handling and fallback mechanisms
 * - Audit logging for security compliance
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to refresh tokens' },
        { status: 401 }
      );
    }

    // Parse request body
    const { accountId } = await request.json();
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get social media account
    const { data: account, error: accountError } = await supabase
      .from('social_media_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', session.user.id)
      .eq('platform_id', 'facebook')
      .eq('is_active', true)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Facebook account not found or access denied' },
        { status: 404 }
      );
    }

    // Decrypt current tokens
    const encryptedAccessToken = JSON.parse(account.encrypted_access_token);
    const currentAccessToken = TokenEncryptionService.decryptToken(encryptedAccessToken);

    // Initialize Facebook OAuth handler
    const facebookHandler = new FacebookOAuthHandler();

    // Refresh tokens using Facebook's token exchange
    const newTokens = await facebookHandler.refreshTokens(currentAccessToken);

    // Encrypt new tokens
    const newEncryptedAccessToken = TokenEncryptionService.encryptToken(newTokens.accessToken);

    // Update account with new tokens
    const { error: updateError } = await supabase
      .from('social_media_accounts')
      .update({
        encrypted_access_token: JSON.stringify(newEncryptedAccessToken),
        token_expires_at: newTokens.expiresAt.toISOString(),
        token_scopes: newTokens.scope ? newTokens.scope.split(' ') : account.token_scopes,
        last_sync_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (updateError) {
      throw new Error(`Failed to update tokens: ${updateError.message}`);
    }

    // Log successful token refresh
    console.log(`Facebook tokens refreshed successfully for account ${accountId}, user ${session.user.id}`);

    // Update platform last activity
    await supabase
      .from('social_media_platforms')
      .upsert({
        platform: 'facebook',
        last_token_refresh: new Date().toISOString()
      }, { onConflict: 'platform' });

    return NextResponse.json({
      success: true,
      message: 'Facebook tokens refreshed successfully',
      expiresAt: newTokens.expiresAt.toISOString(),
      expiresIn: newTokens.expiresIn
    });

  } catch (error) {
    console.error('Facebook token refresh error:', error);
    
    // Log error for debugging
    try {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('oauth_errors').insert({
          user_id: session.user.id,
          platform: 'facebook',
          error_type: 'token_refresh_error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          occurred_at: new Date().toISOString()
        });
      }
    } catch (logError) {
      console.error('Failed to log token refresh error:', logError);
    }

    return NextResponse.json(
      { 
        error: 'Failed to refresh Facebook tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}