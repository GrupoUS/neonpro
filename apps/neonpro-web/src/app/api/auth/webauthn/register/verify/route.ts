/**
 * WebAuthn Registration Verification API
 * TASK-002: Multi-Factor Authentication Enhancement
 * 
 * Verifies and stores WebAuthn credential after registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createwebAuthnService } from '@/lib/auth/webauthn-service';
import { trackLoginPerformance } from '@/lib/auth/performance-tracker';

export async function POST(request: NextRequest) {
  return trackLoginPerformance(async () => {
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

      const { response, deviceName } = await request.json();

      if (!response) {
        return NextResponse.json(
          { error: 'Registration response required' },
          { status: 400 }
        );
      }

      // Verify registration response and store credential
      const verification = await createwebAuthnService().verifyRegistrationResponse(
        session.user.id,
        response,
        deviceName
      );

      if (!verification.verified) {
        return NextResponse.json(
          { error: 'Registration verification failed' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: verification.verified,
        message: 'WebAuthn credential registered successfully',
      });

    } catch (error) {
      console.error('WebAuthn registration verification error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Registration verification failed' },
        { status: 500 }
      );
    }
  }, {
    method: 'webauthn',
    additionalData: { operation: 'registration_verification' },
  });
}
