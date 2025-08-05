import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WhatsAppOAuthHandler } from '@/lib/oauth/platforms/whatsapp-handler';
import { Logger } from '@/lib/logger';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const requestId = randomBytes(16).toString('hex');
  
  try {
    Logger.info('WhatsApp OAuth authorization request initiated', {
      requestId,
      provider: 'whatsapp',
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    // Verify user session
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      Logger.warn('WhatsApp OAuth authorization attempted without valid session', {
        requestId,
        provider: 'whatsapp',
        error: sessionError?.message
      });
      
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check for existing WhatsApp connection
    const { data: existingConnection } = await supabase
      .from('marketing_platform_connections')
      .select('id, status, connected_at')
      .eq('profile_id', session.user.id)
      .eq('platform_type', 'whatsapp')
      .single();

    if (existingConnection?.status === 'connected') {
      Logger.info('WhatsApp account already connected', {
        requestId,
        provider: 'whatsapp',
        userId: session.user.id,
        connectionId: existingConnection.id
      });
      
      return NextResponse.json({
        error: 'WhatsApp account already connected',
        connectionId: existingConnection.id,
        connectedAt: existingConnection.connected_at
      }, { status: 409 });
    }

    // Generate secure state parameter
    const state = randomBytes(32).toString('hex');
    const stateData = {
      userId: session.user.id,
      provider: 'whatsapp',
      timestamp: Date.now(),
      requestId
    };

    // Store state in session
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        state,
        data: stateData,
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

    if (stateError) {
      Logger.error('Failed to store WhatsApp OAuth state', {
        requestId,
        provider: 'whatsapp',
        error: stateError.message
      });
      
      return NextResponse.json(
        { error: 'Failed to initialize OAuth flow' },
        { status: 500 }
      );
    }

    // Generate authorization URL
    const oauthHandler = new WhatsAppOAuthHandler();
    const authorizationUrl = await oauthHandler.getAuthorizationUrl(state);

    // Log OAuth initiation
    await supabase
      .from('oauth_audit_log')
      .insert({
        profile_id: session.user.id,
        provider: 'whatsapp',
        action: 'authorization_initiated',
        request_id: requestId,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        details: {
          state,
          authorizationUrl: authorizationUrl.split('?')[0] // Log base URL only for security
        }
      });

    Logger.info('WhatsApp OAuth authorization URL generated successfully', {
      requestId,
      provider: 'whatsapp',
      userId: session.user.id,
      state
    });

    return NextResponse.json({
      authorizationUrl,
      state,
      provider: 'whatsapp',
      expiresIn: 600 // 10 minutes
    });

  } catch (error) {
    Logger.error('WhatsApp OAuth authorization error', {
      requestId,
      provider: 'whatsapp',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to initiate WhatsApp OAuth flow',
        requestId 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
