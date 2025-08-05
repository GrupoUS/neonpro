/**
 * WebAuthn Credentials Management API
 * TASK-002: Multi-Factor Authentication Enhancement
 * 
 * Provides CRUD operations for WebAuthn credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createwebAuthnService } from '@/lib/auth/webauthn-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's WebAuthn credentials
    const credentials = await createwebAuthnService().getUserCredentials(session.user.id);

    return NextResponse.json({
      success: true,
      credentials,
    });

  } catch (error) {
    console.error('Failed to fetch WebAuthn credentials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credentials' },
      { status: 500 }
    );
  }
}
