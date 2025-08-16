import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { FacebookOAuthHandler } from '@/lib/oauth/platforms/facebook-handler';
import { TokenEncryptionService } from '@/lib/oauth/token-encryption';

/**
 * Facebook OAuth Account Management Endpoint
 * Handles individual Facebook account operations
 *
 * Features:
 * - Account status retrieval
 * - Token validation and refresh
 * - Account disconnection
 * - Comprehensive error handling
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access account information' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const accountId = id;

    // Get Facebook account details
    const { data: account, error: accountError } = await supabase
      .from('social_media_accounts')
      .select(
        `
        id,
        platform_user_id,
        platform_username,
        platform_name,
        profile_picture_url,
        follower_count,
        is_verified,
        token_expires_at,
        token_scopes,
        is_active,
        last_sync_at,
        created_at
      `
      )
      .eq('id', accountId)
      .eq('user_id', session.user.id)
      .eq('platform_id', 'facebook')
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Facebook account not found or access denied' },
        { status: 404 }
      );
    }

    // Check token expiration status
    const tokenExpiresAt = new Date(account.token_expires_at);
    const now = new Date();
    const hoursUntilExpiry =
      (tokenExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isExpiringSoon = hoursUntilExpiry < 24;
    const isExpired = hoursUntilExpiry < 0;

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        platformUserId: account.platform_user_id,
        username: account.platform_username,
        name: account.platform_name,
        profilePicture: account.profile_picture_url,
        followerCount: account.follower_count,
        isVerified: account.is_verified,
        scopes: account.token_scopes,
        isActive: account.is_active,
        lastSync: account.last_sync_at,
        connectedAt: account.created_at,
        tokenStatus: {
          expiresAt: account.token_expires_at,
          hoursUntilExpiry: Math.max(0, hoursUntilExpiry),
          isExpired,
          isExpiringSoon,
          needsRefresh: isExpiringSoon,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve Facebook account information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Verify user authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to disconnect account' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const accountId = id;

    // Get account with encrypted tokens for revocation
    const { data: account, error: accountError } = await supabase
      .from('social_media_accounts')
      .select('encrypted_access_token, platform_username')
      .eq('id', accountId)
      .eq('user_id', session.user.id)
      .eq('platform_id', 'facebook')
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Facebook account not found or access denied' },
        { status: 404 }
      );
    }

    // Decrypt access token for revocation
    let accessToken: string;
    try {
      const encryptedAccessToken = JSON.parse(account.encrypted_access_token);
      accessToken = TokenEncryptionService.decryptToken(encryptedAccessToken);
    } catch (_decryptError) {
      // Continue with disconnection even if token decryption fails
    }

    // Attempt to revoke tokens at Facebook
    if (accessToken) {
      try {
        const facebookHandler = new FacebookOAuthHandler();
        await facebookHandler.revokeTokens(accessToken);
      } catch (_revokeError) {
        // Continue with local disconnection even if remote revocation fails
      }
    }

    // Deactivate the account (soft delete)
    const { error: deactivateError } = await supabase
      .from('social_media_accounts')
      .update({
        is_active: false,
        disconnected_at: new Date().toISOString(),
      })
      .eq('id', accountId);

    if (deactivateError) {
      throw new Error(
        `Failed to disconnect account: ${deactivateError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Facebook account disconnected successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to disconnect Facebook account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
