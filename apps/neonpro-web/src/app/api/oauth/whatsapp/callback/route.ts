import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { WhatsAppOAuthHandler } from '@/lib/oauth/platforms/whatsapp-handler';
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
    Logger.info('WhatsApp OAuth callback received', {
      requestId,
      provider: 'whatsapp',
      hasCode: !!code,
      hasState: !!state,
      hasError: !!error,
      errorDescription,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    // Handle OAuth errors
    if (error) {
      Logger.warn('WhatsApp OAuth error received', {
        requestId,
        provider: 'whatsapp',
        error,
        errorDescription
      });

      return NextResponse.redirect(
        new URL(`/dashboard/settings/integrations?error=oauth_error&provider=whatsapp&message=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      Logger.error('WhatsApp OAuth callback missing required parameters', {
        requestId,
        provider: 'whatsapp',
        hasCode: !!code,
        hasState: !!state
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=invalid_callback&provider=whatsapp', request.url)
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
      Logger.error('WhatsApp OAuth invalid or expired state', {
        requestId,
        provider: 'whatsapp',
        state,
        error: stateError?.message
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=invalid_state&provider=whatsapp', request.url)
      );
    }

    // Check state expiration
    if (new Date(stateRecord.expires_at) < new Date()) {
      Logger.error('WhatsApp OAuth state expired', {
        requestId,
        provider: 'whatsapp',
        state,
        expiresAt: stateRecord.expires_at
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=state_expired&provider=whatsapp', request.url)
      );
    }

    const stateData = stateRecord.data as any;
    const userId = stateData.userId;

    // Verify user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user || session.user.id !== userId) {
      Logger.error('WhatsApp OAuth session mismatch', {
        requestId,
        provider: 'whatsapp',
        expectedUserId: userId,
        actualUserId: session?.user?.id,
        error: sessionError?.message
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=session_mismatch&provider=whatsapp', request.url)
      );
    }

    // Exchange code for tokens
    const oauthHandler = new WhatsAppOAuthHandler();
    const encryptedToken = await oauthHandler.exchangeCodeForTokens(code, state);

    // Get user info from WhatsApp
    const userInfo = await oauthHandler.getUserInfo(encryptedToken.encryptedData);

    // Get business accounts
    const businessAccounts = await oauthHandler.getBusinessAccounts(encryptedToken.encryptedData);

    // Create or update marketing platform connection
    const connectionData = {
      profile_id: userId,
      platform_type: 'whatsapp',
      platform_user_id: userInfo.id,
      platform_username: userInfo.name || userInfo.email,
      encrypted_token: encryptedToken.encryptedData,
      token_expires_at: encryptedToken.expiresAt,
      scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
      status: 'connected',
      connected_at: new Date().toISOString(),
      platform_data: {
        userInfo,
        businessAccounts: businessAccounts.map(account => ({
          id: account.id,
          name: account.name,
          verification_status: account.verification_status
        }))
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
      Logger.error('Failed to save WhatsApp connection', {
        requestId,
        provider: 'whatsapp',
        userId,
        error: connectionError.message
      });

      return NextResponse.redirect(
        new URL('/dashboard/settings/integrations?error=save_failed&provider=whatsapp', request.url)
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
        provider: 'whatsapp',
        action: 'connection_completed',
        request_id: requestId,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        details: {
          connectionId: connection.id,
          platformUserId: userInfo.id,
          businessAccountCount: businessAccounts.length
        }
      });

    Logger.info('WhatsApp OAuth connection successful', {
      requestId,
      provider: 'whatsapp',
      userId,
      connectionId: connection.id,
      platformUserId: userInfo.id,
      businessAccountCount: businessAccounts.length
    });

    return NextResponse.redirect(
      new URL('/dashboard/settings/integrations?success=whatsapp_connected', request.url)
    );

  } catch (error) {
    Logger.error('WhatsApp OAuth callback error', {
      requestId,
      provider: 'whatsapp',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.redirect(
      new URL(`/dashboard/settings/integrations?error=callback_failed&provider=whatsapp&requestId=${requestId}`, request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}