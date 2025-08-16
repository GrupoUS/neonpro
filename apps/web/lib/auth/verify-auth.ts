import type { User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export interface AuthVerificationResult {
  success: boolean;
  user?: User;
  error?: string;
}

export async function verifyAuth(): Promise<AuthVerificationResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function verifyAuthFromRequest(
  request: NextRequest,
): Promise<AuthVerificationResult> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header',
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const supabase = createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!user) {
      return {
        success: false,
        error: 'Invalid token',
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function requireAuth(authResult: AuthVerificationResult): User {
  if (!authResult.success || !authResult.user) {
    throw new Error(authResult.error || 'Authentication required');
  }
  return authResult.user;
}
