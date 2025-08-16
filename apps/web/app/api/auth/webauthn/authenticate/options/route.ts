/**
 * WebAuthn Authentication Options API
 * TASK-002: Multi-Factor Authentication Enhancement
 *
 * Generates authentication options for WebAuthn login
 */

import { type NextRequest, NextResponse } from 'next/server';
import { trackLoginPerformance } from '@/lib/auth/performance-tracker';
import { webAuthnService } from '@/lib/auth/webauthn-service';

export async function POST(request: NextRequest) {
  return trackLoginPerformance(
    async () => {
      try {
        const { userIdentifier } = await request.json();

        // Generate authentication options
        const options = await webAuthnService.generateAuthenticationOptions({
          userId: userIdentifier,
          allowCredentials: true,
        });

        return NextResponse.json(options);
      } catch (_error) {
        return NextResponse.json(
          { error: 'Failed to generate authentication options' },
          { status: 500 }
        );
      }
    },
    {
      method: 'webauthn',
      additionalData: { operation: 'authentication_options' },
    }
  );
}
