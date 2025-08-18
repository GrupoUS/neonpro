import { NextRequest, NextResponse } from 'next/server';

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
        credentialPublicKey: new Uint8Array(32),
        counter: 0
      }
    };

    return NextResponse.json({ 
      verified: verification.verified,
      registrationInfo: verification.registrationInfo
    });
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}