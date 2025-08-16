/**
 * WebAuthn Registration Options API
 * TASK-002: Multi-Factor Authentication Enhancement
 *
 * Generates registration options for WebAuthn credential creation
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { trackLoginPerformance } from '@/lib/auth/performance-tracker';
import { webAuthnService } from '@/lib/auth/webauthn-service';

export async function POST(request: NextRequest) {
  return trackLoginPerformance(
    async () => {
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
            { status: 401 },
          );
        }

        const { deviceName } = await request.json();

        // Get user profile for display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', session.user.id)
          .single();

        const userName = session.user.email || 'user';
        const userDisplayName = profile
          ? `${profile.first_name} ${profile.last_name}`.trim() || profile.email
          : userName;

        // Generate registration options
        const options = await webAuthnService.generateRegistrationOptions({
          userId: session.user.id,
          userName,
          userDisplayName,
          deviceName,
        });

        return NextResponse.json(options);
      } catch (_error) {
        return NextResponse.json(
          { error: 'Failed to generate registration options' },
          { status: 500 },
        );
      }
    },
    {
      method: 'webauthn',
      additionalData: { operation: 'registration_options' },
    },
  );
}
