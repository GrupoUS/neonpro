import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { InstagramOAuthHandler } from '@/lib/oauth/platforms/instagram-handler';
import { TokenEncryptionService } from '@/lib/oauth/token-encryption';

/**
 * Instagram Account Management API
 * Handles Instagram account operations, media fetching, and insights
 * Research-backed implementation following Instagram Graph API patterns
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const accountId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'profile';

    // Get the Instagram account
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

    // Decrypt access token
    const encryptedAccessToken = JSON.parse(account.encrypted_access_token);
    const accessToken = TokenEncryptionService.decryptToken(encryptedAccessToken);

    const instagramHandler = new InstagramOAuthHandler();

    // Handle different actions
    switch (action) {
      case 'profile':
        const profile = await instagramHandler.getUserProfile(accessToken);
        return NextResponse.json({
          success: true,
          profile,
          account: {
            id: account.id,
            username: account.platform_username,
            isVerified: account.is_verified,
            followerCount: account.follower_count,
            lastSync: account.last_sync_at
          }
        });

      case 'media':
        const limit = parseInt(searchParams.get('limit') || '25');
        const media = await instagramHandler.getUserMedia(accessToken, limit);
        return NextResponse.json({
          success: true,
          media,
          count: media.length
        });

      case 'insights':
        const period = searchParams.get('period') as 'day' | 'week' | 'days_28' || 'day';
        const insights = await instagramHandler.getAccountInsights(accessToken, period);
        return NextResponse.json({
          success: true,
          insights,
          period
        });

      case 'validate':
        const isValid = await instagramHandler.validateTokens({
          accessToken,
          tokenType: 'Bearer',
          expiresIn: Math.floor((new Date(account.token_expires_at).getTime() - Date.now()) / 1000),
          expiresAt: new Date(account.token_expires_at)
        });
        return NextResponse.json({
          success: true,
          isValid,
          expiresAt: account.token_expires_at
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Instagram account API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process Instagram account request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Update Instagram account settings
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const accountId = params.id;
    const { isActive, autoPost, notificationsEnabled } = await request.json();

    // Update account settings
    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.is_active = isActive;
    if (typeof autoPost === 'boolean') updateData.auto_post = autoPost;
    if (typeof notificationsEnabled === 'boolean') updateData.notifications_enabled = notificationsEnabled;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('social_media_accounts')
      .update(updateData)
      .eq('id', accountId)
      .eq('user_id', session.user.id)
      .eq('platform_id', 'instagram')
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update account: ${error.message}`);
    }

    // Log account update
    await supabase
      .from('activity_logs')
      .insert({
        user_id: session.user.id,
        clinic_id: data.clinic_id,
        action: 'social_media_account_updated',
        entity_type: 'social_media_account',
        entity_id: accountId,
        details: {
          platform: 'instagram',
          changes: updateData
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Instagram account updated successfully',
      account: data
    });

  } catch (error) {
    console.error('Instagram account update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update Instagram account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Delete/disconnect Instagram account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const accountId = params.id;

    // Get account details before deletion
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('clinic_id, platform_username')
      .eq('id', accountId)
      .eq('user_id', session.user.id)
      .eq('platform_id', 'instagram')
      .single();

    // Soft delete the account
    const { error } = await supabase
      .from('social_media_accounts')
      .update({ 
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', accountId)
      .eq('user_id', session.user.id)
      .eq('platform_id', 'instagram');

    if (error) {
      throw new Error(`Failed to delete account: ${error.message}`);
    }

    // Log account deletion
    if (account) {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: session.user.id,
          clinic_id: account.clinic_id,
          action: 'social_media_account_deleted',
          entity_type: 'social_media_account',
          entity_id: accountId,
          details: {
            platform: 'instagram',
            username: account.platform_username
          }
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Instagram account disconnected successfully'
    });

  } catch (error) {
    console.error('Instagram account deletion error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to disconnect Instagram account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}