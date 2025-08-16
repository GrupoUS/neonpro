/**
 * WebAuthn Authentication Verification API
 * TASK-002: Multi-Factor Authentication Enhancement
 *
 * Verifies WebAuthn authentication and creates session
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { trackLoginPerformance } from '@/lib/auth/performance-tracker';
import { webAuthnService } from '@/lib/auth/webauthn-service';

export async function POST(request: NextRequest) {
  return trackLoginPerformance(
    async () => {
      try {
        const { response, userIdentifier } = await request.json();

        if (!response) {
          return NextResponse.json(
            { error: 'Authentication response required' },
            { status: 400 },
          );
        }

        // Verify authentication response
        const verification = await webAuthnService.verifyAuthenticationResponse(
          response,
          userIdentifier,
        );

        if (!verification.verified) {
          return NextResponse.json(
            { error: 'Authentication verification failed' },
            { status: 400 },
          );
        }

        // Create or update session with Supabase Auth
        const supabase = await createClient();

        // Get user details for session creation
        const { data: user, error: userError } =
          await supabase.auth.admin.getUserById(verification.userId);

        if (userError || !user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 },
          );
        }

        // For WebAuthn, we need to create a custom session or integrate with existing auth flow
        // This is a simplified example - you might want to issue JWT tokens or update session
        return NextResponse.json({
          success: true,
          verified: verification.verified,
          userId: verification.userId,
          message: 'WebAuthn authentication successful',
        });
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : 'Authentication verification failed',
          },
          { status: 500 },
        );
      }
    },
    {
      method: 'webauthn',
      additionalData: { operation: 'authentication_verification' },
    },
  );
}
