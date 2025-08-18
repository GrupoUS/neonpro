import { type NextRequest, NextResponse } from 'next/server';

/**
 * WebAuthn Registration Options Route
 * Generates registration challenge and options
 */
export function POST(_request: NextRequest) {
  try {
    // Mock registration options for test compatibility
    const options = {
      challenge: 'mock-challenge-registration',
      rp: {
        name: 'NeonPro',
        id: 'localhost',
      },
      user: {
        id: 'mock-user-id',
        name: 'mock-user@example.com',
        displayName: 'Mock User',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      timeout: 60_000,
      attestation: 'none',
    };

    return NextResponse.json(options);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Error logging needed for WebAuthn debugging
    console.error('WebAuthn registration options error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
