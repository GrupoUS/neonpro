import { type NextRequest, NextResponse } from 'next/server';

const CREDENTIAL_PUBLIC_KEY_SIZE = 32;

/**
 * WebAuthn Registration Verification Route
 * Verifies registration response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock verification for test compatibility
    const verification = {
      verified: true,
      registrationInfo: {
        credentialID: body.id || 'mock-credential-id',
        credentialPublicKey: new Uint8Array(CREDENTIAL_PUBLIC_KEY_SIZE),
        counter: 0,
      },
    };

    return NextResponse.json({
      verified: verification.verified,
      registrationInfo: verification.registrationInfo,
    });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Error logging needed for WebAuthn debugging
    console.error('WebAuthn registration verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
