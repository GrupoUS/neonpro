import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * WebAuthn Individual Credential API Route
 * Handles operations on specific WebAuthn credentials
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { credentialId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { credentialId } = params;
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get specific WebAuthn credential
    const { data: credential, error } = await supabase
      .from('webauthn_credentials')
      .select('id, credential_id, name, created_at, last_used_at, transports, counter')
      .eq('user_id', user.id)
      .eq('credential_id', credentialId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
      }
      console.error('Error fetching WebAuthn credential:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ credential });
  } catch (error) {
    console.error('WebAuthn credential GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}