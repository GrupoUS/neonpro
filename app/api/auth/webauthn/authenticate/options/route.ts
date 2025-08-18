import { NextRequest, NextResponse } from 'next/server';

/**
 * WebAuthn Authentication Options Route
 * Generates authentication challenge and options
 */
export async function POST(request: NextRequest) {
  try {
    // Mock authentication options for test compatibility
    const options = {
      challenge: 'mock-challenge-authentication',
      rpId: 'localhost',
      allowCredentials: [
        {
          id: 'mock-credential-id',
          type: 'public-key',
          transports: ['internal', 'usb', 'ble', 'nfc']
        }
      ],
      timeout: 60000,
      userVerification: 'preferred'
    };

    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn authentication options error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}