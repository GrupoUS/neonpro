/**
 * WebAuthn Authentication Options API
 * TASK-002: Multi-Factor Authentication Enhancement
 * 
 * Generates authentication options for WebAuthn login
 */

import { NextRequest, NextResponse } from 'next/server';
import { webAuthnService } from '@/lib/auth/webauthn-service';
import { trackLoginPerformance } from '@/lib/auth/performance-tracker';

export async function POST(request: NextRequest) {
  return trackLoginPerformance(async () => {
    try {
      const { userIdentifier } = await request.json();

      // Generate authentication options
      const options = await webAuthnService.generateAuthenticationOptions({
        userId: userIdentifier,
        allowCredentials: true,
      });

      return NextResponse.json(options);

    } catch (error) {
      console.error('WebAuthn authentication options error:', error);
      return NextResponse.json(
        { error: 'Failed to generate authentication options' },
        { status: 500 }
      );
    }
  }, {
    method: 'webauthn',
    additionalData: { operation: 'authentication_options' },
  });
}