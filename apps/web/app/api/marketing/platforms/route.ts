import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

/**
 * Marketing Platforms API Route
 *
 * Handles CRUD operations for available marketing platforms
 * Manages platform configurations and integration capabilities
 *
 * Research-backed implementation following:
 * - HubSpot API integration patterns
 * - Mailchimp API best practices
 * - RD Station API guidelines
 * - ActiveCampaign integration standards
 */

// Validation schema for creating marketing platforms
const createPlatformSchema = z.object({
  platform_name: z.string().min(1).max(50),
  platform_type: z.enum([
    'crm',
    'email_marketing',
    'automation',
    'analytics',
    'lead_generation',
  ]),
  api_base_url: z.string().url().optional(),
  oauth_config: z.record(z.any()).default({}),
  webhook_capabilities: z.record(z.any()).default({}),
  features_supported: z.record(z.boolean()).default({}),
  pricing_model: z.string().max(50).optional(),
  integration_complexity: z.enum(['low', 'medium', 'high']).default('medium'),
  documentation_url: z.string().url().optional(),
  status: z.enum(['active', 'deprecated', 'beta']).default('active'),
});

type CreatePlatformData = z.infer<typeof createPlatformSchema>;

/**
 * GET /api/marketing/platforms
 *
 * Retrieves all available marketing platforms with their configurations
 * Includes connection status for the user's clinic
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const platformType = searchParams.get('type');
    const status = searchParams.get('status');

    // Build query for marketing platforms
    let query = supabase.from('marketing_platforms').select(`
        id,
        platform_name,
        platform_type,
        api_base_url,
        oauth_config,
        webhook_capabilities,
        features_supported,
        pricing_model,
        integration_complexity,
        documentation_url,
        status,
        created_at,
        updated_at
      `);

    // Apply filters
    if (platformType) {
      query = query.eq('platform_type', platformType);
    }
    if (status) {
      query = query.eq('status', status);
    } else {
      // Default to only active platforms
      query = query.eq('status', 'active');
    }

    const { data: platforms, error } = await query.order('platform_name');

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch platforms' },
        { status: 500 }
      );
    }

    // Get existing connections for this clinic
    const { data: connections } = await supabase
      .from('marketing_platform_connections')
      .select(
        'platform_id, connection_name, sync_status, connection_health_score'
      )
      .eq('clinic_id', profile.clinic_id);

    // Enhance platforms with connection status
    const platformsWithStatus = platforms?.map((platform) => {
      const connection = connections?.find(
        (conn) => conn.platform_id === platform.id
      );
      return {
        ...platform,
        connection_status: connection || null,
        is_connected: Boolean(connection),
        connection_health: connection?.connection_health_score || null,
      };
    });

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
 * POST /api/marketing/platforms
 *
 * Creates a new marketing platform (admin only)
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
      .from('marketing_platforms')
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
      .from('marketing_platforms')
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
        message: 'Marketing platform created successfully',
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
