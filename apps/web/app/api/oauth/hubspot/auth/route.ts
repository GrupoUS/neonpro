import { randomBytes } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { Logger } from '@/lib/logger';
import { HubSpotOAuthHandler } from '@/lib/oauth/platforms/hubspot-handler';

export async function GET(request: NextRequest) {
  const requestId = randomBytes(16).toString('hex');

  try {
    Logger.info('HubSpot OAuth authorization request initiated', {
      requestId,
      provider: 'hubspot',
      userAgent: request.headers.get('user-agent'),
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
    });

    // Verify user session
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      Logger.warn(
        'HubSpot OAuth authorization attempted without valid session',
        {
          requestId,
          provider: 'hubspot',
          error: sessionError?.message,
        }
      );

      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check for existing HubSpot connection
    const { data: existingConnection } = await supabase
      .from('marketing_platform_connections')
      .select('id, status, connected_at')
      .eq('profile_id', session.user.id)
      .eq('platform_type', 'hubspot')
      .single();

    if (existingConnection?.status === 'connected') {
      Logger.info('HubSpot account already connected', {
        requestId,
        provider: 'hubspot',
        userId: session.user.id,
        connectionId: existingConnection.id,
      });

      return NextResponse.json(
        {
          error: 'HubSpot account already connected',
          connectionId: existingConnection.id,
          connectedAt: existingConnection.connected_at,
        },
        { status: 409 }
      );
    }

    // Generate secure state parameter
    const state = randomBytes(32).toString('hex');
    const stateData = {
      userId: session.user.id,
      provider: 'hubspot',
      timestamp: Date.now(),
      requestId,
    };

    // Store state in session
    const { error: stateError } = await supabase.from('oauth_states').insert({
      state,
      data: stateData,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    if (stateError) {
      Logger.error('Failed to store HubSpot OAuth state', {
        requestId,
        provider: 'hubspot',
        error: stateError.message,
      });

      return NextResponse.json(
        { error: 'Failed to initialize OAuth flow' },
        { status: 500 }
      );
    }

    // Generate authorization URL
    const oauthHandler = new HubSpotOAuthHandler();
    const authorizationUrl = await oauthHandler.getAuthorizationUrl(state);

    // Log OAuth initiation
    await supabase.from('oauth_audit_log').insert({
      profile_id: session.user.id,
      provider: 'hubspot',
      action: 'authorization_initiated',
      request_id: requestId,
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      details: {
        state,
        authorizationUrl: authorizationUrl.split('?')[0], // Log base URL only for security
      },
    });

    Logger.info('HubSpot OAuth authorization URL generated successfully', {
      requestId,
      provider: 'hubspot',
      userId: session.user.id,
      state,
    });

    return NextResponse.json({
      authorizationUrl,
      state,
      provider: 'hubspot',
      expiresIn: 600, // 10 minutes
    });
  } catch (error) {
    Logger.error('HubSpot OAuth authorization error', {
      requestId,
      provider: 'hubspot',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'Failed to initiate HubSpot OAuth flow',
        requestId,
      },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
