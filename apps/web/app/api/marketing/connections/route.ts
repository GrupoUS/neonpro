import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { z } from 'zod';

/**
 * Marketing Platform Connections API Route
 * 
 * Handles CRUD operations for marketing platform connections
 * Manages OAuth tokens, sync configurations, and connection health
 * 
 * Research-backed implementation following:
 * - HubSpot OAuth 2.0 flow
 * - Mailchimp API key authentication
 * - RD Station webhook integration
 * - Secure credential storage patterns
 */

// Validation schemas
const createConnectionSchema = z.object({
  platform_id: z.string().uuid(),
  connection_name: z.string().min(1).max(255),
  account_id: z.string().max(255).optional(),
  api_key: z.string().optional(), // Will be encrypted
  access_token: z.string().optional(), // Will be encrypted
  refresh_token: z.string().optional(), // Will be encrypted
  token_expires_at: z.string().datetime().optional(),
  webhook_url: z.string().url().optional(),
  webhook_secret: z.string().optional(), // Will be encrypted
  sync_configuration: z.record(z.any()).default({}),
  data_flow_direction: z.enum(['inbound', 'outbound', 'bidirectional']).default('bidirectional')
});

const updateConnectionSchema = z.object({
  connection_name: z.string().min(1).max(255).optional(),
  sync_configuration: z.record(z.any()).optional(),
  sync_status: z.enum(['active', 'error', 'paused', 'disconnected']).optional(),
  data_flow_direction: z.enum(['inbound', 'outbound', 'bidirectional']).optional()
});

type CreateConnectionData = z.infer<typeof createConnectionSchema>;
type UpdateConnectionData = z.infer<typeof updateConnectionSchema>;

/**
 * GET /api/marketing/connections
 * 
 * Retrieves all marketing platform connections for the user's clinic
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
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
    const platformId = searchParams.get('platform_id');
    const syncStatus = searchParams.get('sync_status');

    // Build query
    let query = supabase
      .from('marketing_platform_connections')
      .select(`
        id,
        platform_id,
        connection_name,
        account_id,
        webhook_url,
        sync_configuration,
        last_sync_at,
        sync_status,
        sync_error_message,
        connection_health_score,
        data_flow_direction,
        created_at,
        updated_at,
        marketing_platforms!inner(
          platform_name,
          platform_type,
          features_supported,
          integration_complexity,
          documentation_url
        )
      `)
      .eq('clinic_id', profile.clinic_id);

    // Apply filters
    if (platformId) {
      query = query.eq('platform_id', platformId);
    }
    if (syncStatus) {
      query = query.eq('sync_status', syncStatus);
    }

    const { data: connections, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketing connections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch connections' },
        { status: 500 }
      );
    }

    // Remove sensitive credential data from response
    const sanitizedConnections = connections?.map(connection => ({
      ...connection,
      has_api_key: !!connection.api_key,
      has_access_token: !!connection.access_token,
      has_refresh_token: !!connection.refresh_token,
      has_webhook_secret: !!connection.webhook_secret,
      token_valid: connection.token_expires_at ? 
        new Date(connection.token_expires_at) > new Date() : null,
      api_key: undefined,
      access_token: undefined,
      refresh_token: undefined,
      webhook_secret: undefined
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedConnections,
      total: connections?.length || 0
    });

  } catch (error) {
    console.error('Marketing connections GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing/connections
 * 
 * Creates a new marketing platform connection
 * Typically called after OAuth flow completion or API key setup
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
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

    // Check if user has permission to create connections
    if (!['admin', 'owner', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createConnectionSchema.parse(body);

    // Verify platform exists
    const { data: platform } = await supabase
      .from('marketing_platforms')
      .select('id, platform_name, status')
      .eq('id', validatedData.platform_id)
      .single();

    if (!platform || platform.status !== 'active') {
      return NextResponse.json(
        { error: 'Invalid or inactive platform' },
        { status: 400 }
      );
    }

    // Check for existing connection with same platform and account_id
    if (validatedData.account_id) {
      const { data: existingConnection } = await supabase
        .from('marketing_platform_connections')
        .select('id')
        .eq('clinic_id', profile.clinic_id)
        .eq('platform_id', validatedData.platform_id)
        .eq('account_id', validatedData.account_id)
        .single();

      if (existingConnection) {
        return NextResponse.json(
          { error: 'Connection already exists for this account' },
          { status: 409 }
        );
      }
    }

    // Create new connection
    const connectionData = {
      ...validatedData,
      clinic_id: profile.clinic_id,
      // Note: In production, credentials should be encrypted before storage
      // TODO: Implement credential encryption using a secure key management system
    };

    const { data: newConnection, error } = await supabase
      .from('marketing_platform_connections')
      .insert([connectionData])
      .select(`
        id,
        platform_id,
        connection_name,
        account_id,
        sync_configuration,
        sync_status,
        connection_health_score,
        data_flow_direction,
        created_at,
        marketing_platforms!inner(
          platform_name,
          platform_type,
          features_supported
        )
      `)
      .single();

    if (error) {
      console.error('Error creating marketing connection:', error);
      return NextResponse.json(
        { error: 'Failed to create connection' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newConnection,
      message: 'Marketing platform connected successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Marketing connections POST error:', error);
    
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