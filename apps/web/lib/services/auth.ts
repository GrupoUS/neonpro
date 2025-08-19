// Migrated from src/services/auth.ts

import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthUser extends User {
  tenant_id?: string;
  role?: string;
}

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
};

export class AuthService {
  async login(credentials: LoginCredentials): Promise<{
    user?: AuthUser;
    session?: Session;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { error: error.message };
      }

      // Get user role and tenant information
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('tenant_id, role')
        .eq('user_id', data.user.id)
        .single();

      const authUser: AuthUser = {
        ...data.user,
        tenant_id: userProfile?.tenant_id,
        role: userProfile?.role,
      };

      return { user: authUser, session: data.session };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async register(userData: RegisterData): Promise<{
    user?: AuthUser;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            tenant_id: userData.tenantId,
            role: 'user',
            first_name: userData.firstName,
            last_name: userData.lastName,
          });

        if (profileError) {
        }
      }

      return { user: data.user as AuthUser };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  async logout(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  async getCurrentUser(): Promise<{ user?: AuthUser; error?: string }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return { error: error?.message || 'No user found' };
      }

      // Get user profile data
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('tenant_id, role')
        .eq('user_id', user.id)
        .single();

      const authUser: AuthUser = {
        ...user,
        tenant_id: userProfile?.tenant_id,
        role: userProfile?.role,
      };

      return { user: authUser };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to get user',
      };
    }
  }

  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Reset failed',
      };
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('tenant_id, role')
          .eq('user_id', session.user.id)
          .single();

        const authUser: AuthUser = {
          ...session.user,
          tenant_id: userProfile?.tenant_id,
          role: userProfile?.role,
        };

        callback(authUser);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
