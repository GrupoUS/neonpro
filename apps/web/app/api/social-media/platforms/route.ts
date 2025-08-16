import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

/**
 * Social Media Platforms API Route
 *
 * GET: Retrieve all available social media platforms with their configurations
 * POST: Add a new social media platform (admin only)
 *
 * Research-backed implementation following:
 * - WhatsApp Business API best practices
 * - Instagram Graph API guidelines
 * - Facebook Graph API patterns
 * - Next.js 15 App Router conventions
 */

// Validation schemas
const createPlatformSchema = z.object({
  platform_name: z.string().min(1).max(50),
  platform_display_name: z.string().min(1).max(100),
  platform_icon_url: z.string().url().optional(),
  api_base_url: z.string().url().optional(),
  oauth_config: z.record(z.any()).default({}),
  api_rate_limits: z.record(z.any()).default({}),
  supported_features: z.record(z.boolean()).default({}),
  webhook_capabilities: z.record(z.any()).default({}),
});

type CreatePlatformData = z.infer<typeof createPlatformSchema>;

/**
 * GET /api/social-media/platforms
 *
 * Retrieves all available social media platforms with their configurations
 * Includes OAuth settings, supported features, and API configurations
 */
export async function GET(_request: NextRequest) {
  try {
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

    // Retrieve all social media platforms
    const { data: platforms, error } = await supabase
      .from('social_media_platforms')
      .select(
        `
        id,
        platform_name,
        platform_display_name,
        platform_icon_url,
        api_base_url,
        oauth_config,
        api_rate_limits,
        supported_features,
        webhook_capabilities,
        created_at,
        updated_at
      `
      )
      .order('platform_display_name');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch platforms' },
        { status: 500 }
      );
    }

    // Get connected accounts for this clinic to show connection status
    const { data: connectedAccounts } = await supabase
      .from('social_media_accounts')
      .select('platform_name, status, sync_status')
      .eq('clinic_id', profile.clinic_id)
      .eq('status', 'active');

    // Enhance platforms with connection status
    const platformsWithStatus = platforms?.map((platform) => ({
      ...platform,
      connection_status:
        connectedAccounts?.find(
          (account) => account.platform_name === platform.platform_name
        ) || null,
      is_connected: connectedAccounts?.some(
        (account) =>
          account.platform_name === platform.platform_name &&
          account.status === 'active'
      ),
    }));

    return NextResponse.json({
      success: true,
      data: platformsWithStatus,
      total: platforms?.length || 0,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social-media/platforms
 *
 * Creates a new social media platform (admin only)
 * Used for adding new platforms or custom integrations
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
        { status: 401 }
      );
    }

    // Check admin privileges
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'owner') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createPlatformSchema.parse(body);

    // Check if platform already exists
    const { data: existingPlatform } = await supabase
      .from('social_media_platforms')
      .select('id')
      .eq('platform_name', validatedData.platform_name)
      .single();

    if (existingPlatform) {
      return NextResponse.json(
        { error: 'Platform already exists' },
        { status: 409 }
      );
    }

    // Create new platform
    const { data: newPlatform, error } = await supabase
      .from('social_media_platforms')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create platform' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newPlatform,
        message: 'Social media platform created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
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
