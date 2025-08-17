/**
 * Modern Supabase Auth Callback Handler for NeonPro Healthcare
 * Handles OAuth callbacks and email confirmations
 * Healthcare compliance with audit trails and security
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Healthcare Auth Error:', { error, error_description });
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(error_description || '')}`,
    );
  }

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
        global: {
          headers: {
            'X-Client-Type': 'neonpro-healthcare-auth',
            'X-Compliance': 'LGPD-ANVISA-CFM',
          },
        },
      },
    );

    try {
      // Exchange code for session
      const {
        data: { session },
        error: exchangeError,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Healthcare session exchange error:', exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/error?error=session_exchange_failed`,
        );
      }

      if (session?.user) {
        // Healthcare audit logging for successful authentication
        await logHealthcareAuthentication(
          session.user.id,
          'oauth_callback_success',
          {
            provider: session.user.app_metadata?.provider || 'unknown',
            ip_address: request.ip || 'unknown',
            user_agent: request.headers.get('user-agent') || 'unknown',
          },
        );

        // Check if user has healthcare profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, tenant_id')
          .eq('id', session.user.id)
          .single();

        // Redirect based on user role and profile status
        if (profile) {
          switch (profile.role) {
            case 'doctor':
            case 'nurse':
            case 'admin':
            case 'receptionist':
              return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
            case 'patient':
              return NextResponse.redirect(
                `${requestUrl.origin}/patient-portal`,
              );
            default:
              return NextResponse.redirect(
                `${requestUrl.origin}/complete-profile`,
              );
          }
        } else {
          // New user - redirect to profile setup
          return NextResponse.redirect(`${requestUrl.origin}/complete-profile`);
        }
      }
    } catch (error) {
      console.error('Critical healthcare auth error:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?error=critical_auth_error`,
      );
    }
  }

  // No code parameter - invalid callback
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/login?error=invalid_callback`,
  );
}

/**
 * Healthcare audit logging for authentication events
 * LGPD compliance requires comprehensive access logging
 */
async function logHealthcareAuthentication(
  userId: string,
  action: string,
  metadata: Record<string, any>,
): Promise<void> {
  try {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    await supabase.from('healthcare_audit_logs').insert({
      user_id: userId,
      action,
      resource_type: 'authentication',
      metadata,
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Healthcare audit logging failed:', error);
    // Don't throw - audit logging failure shouldn't block auth
  }
}
