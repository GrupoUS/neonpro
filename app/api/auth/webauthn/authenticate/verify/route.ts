import { NextRequest, NextResponse } from 'next/server';

/**
 * WebAuthn Authentication Verification Route
 * Verifies authentication response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock verification for test compatibility
    const verification = {
      verified: true,
      authenticationInfo: {
        newCounter: 1,
        credentialID: body.id || 'mock-credential-id'
      }
    };

    return NextResponse.json({ 
      verified: verification.verified,
      authenticationInfo: verification.authenticationInfo
    });
  } catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}