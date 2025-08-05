import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InstagramOAuthHandler } from '@/lib/oauth/platforms/instagram-handler';
import { TokenEncryptionService } from '@/lib/oauth/token-encryption';

/**
 * Instagram Token Refresh Endpoint
 * Refreshes expired Instagram long-lived access tokens
 * Implements automatic token refresh for seamless user experience
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { accountId } = await request.json();
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get the social media account
    const { data: account, error: accountError } = await supabase
      .from('social_media_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', session.user.id)
      .eq('platform_id', 'instagram')
      .eq('is_active', true)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Instagram account not found or not accessible' },
        { status: 404 }
      );
    }

    // Decrypt current tokens
    const encryptedAccessToken = JSON.parse(account.encrypted_access_token);
    const currentAccessToken = TokenEncryptionService.decryptToken(encryptedAccessToken);

    // Initialize Instagram handler and refresh tokens
    const instagramHandler = new InstagramOAuthHandler();
    const newTokens = await instagramHandler.refreshTokens(currentAccessToken);

    // Encrypt new tokens
    const newEncryptedAccessToken = TokenEncryptionService.encryptToken(newTokens.accessToken);

    // Update account with new tokens
    const { error: updateError } = await supabase
      .from('social_media_accounts')
      .update({
        encrypted_access_token: JSON.stringify(newEncryptedAccessToken),
        token_expires_at: newTokens.expiresAt.toISOString(),
        last_sync_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (updateError) {
      throw new Error(`Failed to update tokens: ${updateError.message}`);
    }

    // Log token refresh activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: session.user.id,
        clinic_id: account.clinic_id,
        action: 'social_media_token_refreshed',
        entity_type: 'social_media_account',
        entity_id: accountId,
        details: {
          platform: 'instagram',
          username: account.platform_username,
          expires_at: newTokens.expiresAt.toISOString()
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Instagram tokens refreshed successfully',
      expiresAt: newTokens.expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Instagram token refresh error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh Instagram tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Check if Instagram tokens need refresh
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify user authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get account token expiration
    const { data: account, error } = await supabase
      .from('social_media_accounts')
      .select('token_expires_at, platform_username')
      .eq('id', accountId)
      .eq('user_id', session.user.id)
      .eq('platform_id', 'instagram')
      .eq('is_active', true)
      .single();

    if (error || !account) {
      return NextResponse.json(
        { error: 'Instagram account not found' },
        { status: 404 }
      );
    }

    const expiresAt = new Date(account.token_expires_at);
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const needsRefresh = (expiresAt.getTime() - now.getTime()) < twentyFourHours;

    return NextResponse.json({
      needsRefresh,
      expiresAt: expiresAt.toISOString(),
      username: account.platform_username,
      timeUntilExpiry: expiresAt.getTime() - now.getTime()
    });

  } catch (error) {
    console.error('Instagram token check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check Instagram token status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
