import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { HubSpotOAuthHandler } from '@/lib/oauth/platforms/hubspot-handler';
import { Logger } from '@/lib/logger';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const requestId = randomBytes(16).toString('hex');
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  try {
    Logger.info('HubSpot OAuth callback received', {
      requestId,
      provider: 'hubspot',
      hasCode: !!code,
      hasState: !!state,
      hasError: !!error,
      errorDescription,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    // Handle OAuth errors
    if (error) {
      Logger.warn('HubSpot OAuth error received', {
        requestId,
        provider: 'hubspot',
        error,
        errorDescription
      });

      return NextResponse.redirect(
        new URL(`/dashboard/settings/integrations?error=oauth_error&provider=hubspot&message=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      Logger.error('HubSpot OAuth callback missing required parameters', {
        requestId,
        provider: 'hubspot',
        hasCode: !!code,
        hasState: !!state
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=invalid_callback&provider=hubspot', request.url)
      );
    }

    const supabase = await createClient();

    // Verify and retrieve state
    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_states')
      .select('data, expires_at')
      .eq('state', state)
      .single();

    if (stateError || !stateRecord) {
      Logger.error('HubSpot OAuth invalid or expired state', {
        requestId,
        provider: 'hubspot',
        state,
        error: stateError?.message
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=invalid_state&provider=hubspot', request.url)
      );
    }

    // Check state expiration
    if (new Date(stateRecord.expires_at) < new Date()) {
      Logger.error('HubSpot OAuth state expired', {
        requestId,
        provider: 'hubspot',
        state,
        expiresAt: stateRecord.expires_at
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=state_expired&provider=hubspot', request.url)
      );
    }

    const stateData = stateRecord.data as any;
    const userId = stateData.userId;

    // Verify user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user || session.user.id !== userId) {
      Logger.error('HubSpot OAuth session mismatch', {
        requestId,
        provider: 'hubspot',
        expectedUserId: userId,
        actualUserId: session?.user?.id,
        error: sessionError?.message
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=session_mismatch&provider=hubspot', request.url)
      );
    }

    // Exchange code for tokens
    const oauthHandler = new HubSpotOAuthHandler();
    const encryptedToken = await oauthHandler.exchangeCodeForTokens(code, state);

    // Get user info from HubSpot
    const userInfo = await oauthHandler.getUserInfo(encryptedToken.encryptedData);

    // Get portal info
    const portalInfo = await oauthHandler.getPortalInfo(encryptedToken.encryptedData);

    // Get account info
    const accountInfo = await oauthHandler.getAccountInfo(encryptedToken.encryptedData);

    // Create or update marketing platform connection
    const connectionData = {
      profile_id: userId,
      platform_type: 'hubspot',
      platform_user_id: userInfo.user_id?.toString() || userInfo.user,
      platform_username: portalInfo.domain || accountInfo.domain,
      encrypted_token: encryptedToken.encryptedData,
      token_expires_at: encryptedToken.expiresAt,
      scopes: [
        'crm.objects.contacts.read',
        'crm.objects.contacts.write',
        'crm.objects.companies.read',
        'crm.objects.companies.write',
        'marketing-events.read',
        'marketing-events.write',
        'automation.read',
        'forms.read',
        'oauth.read'
      ],
      status: 'connected',
      connected_at: new Date().toISOString(),
      platform_data: {
        userInfo,
        portalInfo,
        accountInfo: {
          portalId: accountInfo.portalId,
          domain: accountInfo.domain,
          currencyCode: accountInfo.currencyCode,
          timeZone: accountInfo.timeZone
        }
      }
    };

    const { data: connection, error: connectionError } = await supabase
      .from('marketing_platform_connections')
      .upsert(connectionData, {
        onConflict: 'profile_id,platform_type'
      })
      .select()
      .single();

    if (connectionError) {
      Logger.error('Failed to save HubSpot connection', {
        requestId,
        provider: 'hubspot',
        userId,
        error: connectionError.message
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=save_failed&provider=hubspot', request.url)
      );
    }

    // Clean up OAuth state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    // Log successful connection
    await supabase
      .from('oauth_audit_log')
      .insert({
        profile_id: userId,
        provider: 'hubspot',
        action: 'connection_completed',
        request_id: requestId,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        details: {
          connectionId: connection.id,
          platformUserId: userInfo.user_id || userInfo.user,
          portalId: portalInfo.portalId,
          domain: portalInfo.domain
        }
      });

    Logger.info('HubSpot OAuth connection successful', {
      requestId,
      provider: 'hubspot',
      userId,
      connectionId: connection.id,
      platformUserId: userInfo.user_id || userInfo.user,
      portalId: portalInfo.portalId
    });

    return NextResponse.redirect(
      new URL('/dashboard/settings/integrations?success=hubspot_connected', request.url)
    );

  } catch (error) {
    Logger.error('HubSpot OAuth callback error', {
      requestId,
      provider: 'hubspot',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.redirect(
      new URL(`/dashboard/settings/integrations?error=callback_failed&provider=hubspot&requestId=${requestId}`, request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}