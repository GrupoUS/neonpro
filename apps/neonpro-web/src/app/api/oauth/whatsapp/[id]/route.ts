import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { WhatsAppOAuthHandler } from '@/lib/oauth/platforms/whatsapp-handler';
import { Logger } from '@/lib/logger';
import { randomBytes } from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomBytes(16).toString('hex');
  const { id } = await params;
  const connectionId = id;
  
  try {
    Logger.info('WhatsApp connection details request initiated', {
      requestId,
      provider: 'whatsapp',
      connectionId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    // Verify user session
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      Logger.warn('WhatsApp connection details request without valid session', {
        requestId,
        provider: 'whatsapp',
        connectionId,
        error: sessionError?.message
      });
      
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get WhatsApp connection
    const { data: connection, error: connectionError } = await supabase
      .from('marketing_platform_connections')
      .select('id, platform_type, platform_user_id, platform_username, status, connected_at, token_expires_at, scopes, platform_data')
      .eq('id', connectionId)
      .eq('profile_id', session.user.id)
      .eq('platform_type', 'whatsapp')
      .single();

    if (connectionError || !connection) {
      Logger.error('WhatsApp connection not found', {
        requestId,
        provider: 'whatsapp',
        connectionId,
        userId: session.user.id,
        error: connectionError?.message
      });
      
      return NextResponse.json(
        { error: 'WhatsApp connection not found' },
        { status: 404 }
      );
    }

    // Check token expiration
    const tokenExpiresAt = new Date(connection.token_expires_at);
    const now = new Date();
    const isTokenExpired = tokenExpiresAt < now;
    const hoursUntilExpiry = Math.round((tokenExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));

    Logger.info('WhatsApp connection details retrieved successfully', {
      requestId,
      provider: 'whatsapp',
      connectionId,
      userId: session.user.id,
      status: connection.status,
      isTokenExpired,
      hoursUntilExpiry
    });

    return NextResponse.json({
      id: connection.id,
      provider: 'whatsapp',
      platformUserId: connection.platform_user_id,
      platformUsername: connection.platform_username,
      status: connection.status,
      connectedAt: connection.connected_at,
      tokenExpiresAt: connection.token_expires_at,
      isTokenExpired,
      hoursUntilExpiry: isTokenExpired ? 0 : Math.max(0, hoursUntilExpiry),
      scopes: connection.scopes,
      platformData: connection.platform_data
    });

  } catch (error) {
    Logger.error('WhatsApp connection details error', {
      requestId,
      provider: 'whatsapp',
      connectionId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to retrieve WhatsApp connection details',
        requestId 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomBytes(16).toString('hex');
  const { id } = await params;
  const connectionId = id;
  
  try {
    Logger.info('WhatsApp connection disconnection request initiated', {
      requestId,
      provider: 'whatsapp',
      connectionId,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    // Verify user session
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      Logger.warn('WhatsApp disconnection request without valid session', {
        requestId,
        provider: 'whatsapp',
        connectionId,
        error: sessionError?.message
      });
      
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get WhatsApp connection
    const { data: connection, error: connectionError } = await supabase
      .from('marketing_platform_connections')
      .select('id, encrypted_token, status')
      .eq('id', connectionId)
      .eq('profile_id', session.user.id)
      .eq('platform_type', 'whatsapp')
      .single();

    if (connectionError || !connection) {
      Logger.error('WhatsApp connection not found for disconnection', {
        requestId,
        provider: 'whatsapp',
        connectionId,
        userId: session.user.id,
        error: connectionError?.message
      });
      
      return NextResponse.json(
        { error: 'WhatsApp connection not found' },
        { status: 404 }
      );
    }

    // Revoke token at WhatsApp
    try {
      const oauthHandler = new WhatsAppOAuthHandler();
      await oauthHandler.revokeToken(connection.encrypted_token);
    } catch (revokeError) {
      Logger.warn('Failed to revoke WhatsApp token, continuing with disconnection', {
        requestId,
        provider: 'whatsapp',
        connectionId,
        error: revokeError instanceof Error ? revokeError.message : 'Unknown error'
      });
    }

    // Update connection status to disconnected
    const { error: updateError } = await supabase
      .from('marketing_platform_connections')
      .update({
        status: 'disconnected',
        disconnected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId);

    if (updateError) {
      Logger.error('Failed to update WhatsApp connection status', {
        requestId,
        provider: 'whatsapp',
        connectionId,
        error: updateError.message
      });
      
      return NextResponse.json(
        { error: 'Failed to disconnect WhatsApp account' },
        { status: 500 }
      );
    }

    // Log disconnection
    await supabase
      .from('oauth_audit_log')
      .insert({
        profile_id: session.user.id,
        provider: 'whatsapp',
        action: 'connection_disconnected',
        request_id: requestId,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        details: {
          connectionId
        }
      });

    Logger.info('WhatsApp disconnection successful', {
      requestId,
      provider: 'whatsapp',
      connectionId,
      userId: session.user.id
    });

    return NextResponse.json({
      message: 'WhatsApp account disconnected successfully',
      connectionId
    });

  } catch (error) {
    Logger.error('WhatsApp disconnection error', {
      requestId,
      provider: 'whatsapp',
      connectionId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to disconnect WhatsApp account',
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

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}