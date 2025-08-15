import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

/**
 * Individual Social Media Account API Route
 *
 * Handles operations for specific social media accounts:
 * - GET: Retrieve account details
 * - PUT: Update account settings
 * - DELETE: Disconnect account
 * - POST: Refresh/sync account data
 */

const updateAccountSchema = z.object({
  account_name: z.string().min(1).max(255).optional(),
  account_handle: z.string().max(255).optional(),
  sync_settings: z.record(z.any()).optional(),
  sync_status: z.enum(['active', 'error', 'paused', 'disconnected']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'deleted']).optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/social-media/accounts/[id]
 *
 * Retrieves specific social media account details
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's clinic access
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic access required' },
        { status: 403 }
      );
    }

    // Get account details
    const { data: account, error } = await supabase
      .from('social_media_accounts')
      .select(`
        id,
        platform_name,
        account_name,
        account_handle,
        account_id,
        account_metadata,
        sync_settings,
        last_sync_at,
        sync_status,
        sync_error_message,
        status,
        token_expires_at,
        created_at,
        updated_at,
        social_media_platforms!inner(
          platform_display_name,
          platform_icon_url,
          supported_features,
          oauth_config
        )
      `)
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Add token status information
    const accountWithTokenStatus = {
      ...account,
      has_access_token: !!account.access_token,
      has_refresh_token: !!account.refresh_token,
      token_valid: account.token_expires_at
        ? new Date(account.token_expires_at) > new Date()
        : null,
      access_token: undefined,
      refresh_token: undefined,
    };

    return NextResponse.json({
      success: true,
      data: accountWithTokenStatus,
    });
  } catch (error) {
    console.error('Social media account GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} /**
 * PUT /api/social-media/accounts/[id]
 *
 * Updates social media account settings
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's clinic access
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic access required' },
        { status: 403 }
      );
    }

    // Verify account exists and belongs to clinic
    const { data: existingAccount } = await supabase
      .from('social_media_accounts')
      .select('id')
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateAccountSchema.parse(body);

    // Update account
    const { data: updatedAccount, error } = await supabase
      .from('social_media_accounts')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .select(`
        id,
        platform_name,
        account_name,
        account_handle,
        account_id,
        account_metadata,
        sync_settings,
        sync_status,
        status,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error updating social media account:', error);
      return NextResponse.json(
        { error: 'Failed to update account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: 'Account updated successfully',
    });
  } catch (error) {
    console.error('Social media account PUT error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social-media/accounts/[id]
 *
 * Disconnects/deletes social media account
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's clinic access
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic access required' },
        { status: 403 }
      );
    }

    // Check if user has permission to delete (admin/owner/manager)
    if (!['admin', 'owner', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Verify account exists and belongs to clinic
    const { data: existingAccount } = await supabase
      .from('social_media_accounts')
      .select('id, platform_name, account_name')
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check for dependent records (posts, analytics)
    const { data: dependentPosts } = await supabase
      .from('social_media_posts')
      .select('id')
      .eq('account_id', id)
      .limit(1);

    if (dependentPosts && dependentPosts.length > 0) {
      // Soft delete - mark as deleted instead of hard delete
      const { error } = await supabase
        .from('social_media_accounts')
        .update({
          status: 'deleted',
          sync_status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('clinic_id', profile.clinic_id);

      if (error) {
        console.error('Error soft deleting social media account:', error);
        return NextResponse.json(
          { error: 'Failed to disconnect account' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Account disconnected successfully (data preserved)',
      });
    }
    // Hard delete - no dependent records
    const { error } = await supabase
      .from('social_media_accounts')
      .delete()
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id);

    if (error) {
      console.error('Error deleting social media account:', error);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Social media account DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} /**
 * POST /api/social-media/accounts/[id]
 *
 * Triggers account sync/refresh operations
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's clinic access
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic access required' },
        { status: 403 }
      );
    }

    // Parse action from request body
    const body = await request.json();
    const action = body.action; // 'sync', 'refresh_token', 'test_connection'

    // Verify account exists and belongs to clinic
    const { data: account } = await supabase
      .from('social_media_accounts')
      .select('*')
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    switch (action) {
      case 'sync': {
        // Update sync timestamp and status
        const { error: syncError } = await supabase
          .from('social_media_accounts')
          .update({
            last_sync_at: new Date().toISOString(),
            sync_status: 'active',
            sync_error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (syncError) {
          throw syncError;
        }

        // TODO: Implement actual platform sync logic
        // This would integrate with platform APIs to fetch latest data

        return NextResponse.json({
          success: true,
          message: 'Account sync initiated successfully',
        });
      }

      case 'test_connection':
        // TODO: Implement connection test logic
        // This would verify tokens and API connectivity

        return NextResponse.json({
          success: true,
          message: 'Connection test completed',
          data: {
            connection_status: 'active',
            last_tested: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Social media account POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
