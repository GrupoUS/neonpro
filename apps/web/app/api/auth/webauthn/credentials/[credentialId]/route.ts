/**
 * WebAuthn Credential Management API
 * TASK-002: Multi-Factor Authentication Enhancement
 *
 * Handles individual credential operations (delete, update)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { webAuthnService } from '@/lib/auth/webauthn-service';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ credentialId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { credentialId } = resolvedParams;

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Credential ID required' },
        { status: 400 }
      );
    }

    // Remove the credential
    await webAuthnService.removeCredential(session.user.id, credentialId);

    return NextResponse.json({
      success: true,
      message: 'Credential removed successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to remove credential',
      },
      { status: 500 }
    );
  }
}
