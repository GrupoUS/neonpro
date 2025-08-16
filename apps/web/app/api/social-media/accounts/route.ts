import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

/**
 * Social Media Accounts API Route
 *
 * Handles CRUD operations for social media account connections
 * Manages OAuth tokens, sync status, and account metadata
 *
 * Research-backed implementation following:
 * - Instagram Basic Display API authentication
 * - Facebook Pages API connection patterns
 * - WhatsApp Business API account management
 * - Secure token storage best practices
 */

// Validation schemas
const createAccountSchema = z.object({
  platform_name: z.string().min(1),
  account_name: z.string().min(1).max(255),
  account_handle: z.string().max(255).optional(),
  account_id: z.string().max(255).optional(),
  access_token: z.string().optional(), // Will be encrypted
  refresh_token: z.string().optional(), // Will be encrypted
  token_expires_at: z.string().datetime().optional(),
  account_metadata: z.record(z.any()).default({}),
  sync_settings: z.record(z.any()).default({}),
});

const updateAccountSchema = z.object({
  account_name: z.string().min(1).max(255).optional(),
  account_handle: z.string().max(255).optional(),
  sync_settings: z.record(z.any()).optional(),
  sync_status: z.enum(['active', 'error', 'paused', 'disconnected']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'deleted']).optional(),
});

type CreateAccountData = z.infer<typeof createAccountSchema>;
type UpdateAccountData = z.infer<typeof updateAccountSchema>;

/**
 * GET /api/social-media/accounts
 *
 * Retrieves all social media accounts for the user's clinic
 * Supports filtering by platform and status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
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
        { status: 403 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const syncStatus = searchParams.get('sync_status');

    // Build query
    let query = supabase
      .from('social_media_accounts')
      .select(
        `
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
        created_at,
        updated_at,
        created_by,
        social_media_platforms!inner(
          platform_display_name,
          platform_icon_url,
          supported_features
        )
      `,
      )
      .eq('clinic_id', profile.clinic_id);

    // Apply filters
    if (platform) {
      query = query.eq('platform_name', platform);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (syncStatus) {
      query = query.eq('sync_status', syncStatus);
    }

    const { data: accounts, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 },
      );
    }

    // Remove sensitive token data from response
    const sanitizedAccounts = accounts?.map((account) => ({
      ...account,
      has_access_token: Boolean(account.access_token),
      has_refresh_token: Boolean(account.refresh_token),
      access_token: undefined,
      refresh_token: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedAccounts,
      total: accounts?.length || 0,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/social-media/accounts
 *
 * Creates a new social media account connection
 * Typically called after OAuth flow completion
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
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
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createAccountSchema.parse(body);

    // Verify platform exists
    const { data: platform } = await supabase
      .from('social_media_platforms')
      .select('id')
      .eq('platform_name', validatedData.platform_name)
      .single();

    if (!platform) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    // Check for existing account with same platform and account_id
    if (validatedData.account_id) {
      const { data: existingAccount } = await supabase
        .from('social_media_accounts')
        .select('id')
        .eq('clinic_id', profile.clinic_id)
        .eq('platform_name', validatedData.platform_name)
        .eq('account_id', validatedData.account_id)
        .single();

      if (existingAccount) {
        return NextResponse.json(
          { error: 'Account already connected' },
          { status: 409 },
        );
      }
    }

    // Create new account connection
    const accountData = {
      ...validatedData,
      clinic_id: profile.clinic_id,
      created_by: session.user.id,
      // Note: In production, tokens should be encrypted before storage
      // TODO: Implement token encryption using a secure key management system
    };

    const { data: newAccount, error } = await supabase
      .from('social_media_accounts')
      .insert([accountData])
      .select(
        `
        id,
        platform_name,
        account_name,
        account_handle,
        account_id,
        account_metadata,
        sync_settings,
        sync_status,
        status,
        created_at,
        social_media_platforms!inner(
          platform_display_name,
          platform_icon_url
        )
      `,
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create account connection' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newAccount,
        message: 'Social media account connected successfully',
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
