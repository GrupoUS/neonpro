/**
 * Supabase Authentication Configuration
 * Healthcare-grade authentication with LGPD compliance
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/app usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface HealthcareUser {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin' | 'receptionist';
  profile: {
    full_name: string;
    cpf?: string;
    phone?: string;
    birth_date?: string;
    professional_license?: string; // CRM, COREN, etc.
  };
  permissions: string[];
  clinic_id?: string;
  last_login: string;
  created_at: string;
}

export class HealthcareAuth {
  static async getCurrentUser(): Promise<HealthcareUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        return null;
      }

      // Get user profile with role and permissions
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!inner(
            role_name,
            permissions
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        role: profile.user_roles.role_name,
        profile: {
          full_name: profile.full_name,
          cpf: profile.cpf,
          phone: profile.phone,
          birth_date: profile.birth_date,
          professional_license: profile.professional_license,
        },
        permissions: profile.user_roles.permissions || [],
        clinic_id: profile.clinic_id,
        last_login: profile.last_login,
        created_at: profile.created_at,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async signIn(
    email: string,
    password: string
  ): Promise<{
    user: HealthcareUser | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Update last login
      if (data.user) {
        await supabase
          .from('user_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', data.user.id);
      }

      const user = await HealthcareAuth.getCurrentUser();

      // Log authentication for audit
      console.log(`Healthcare auth: User ${user?.email} signed in`);

      return { user, error: null };
    } catch (_error) {
      return { user: null, error: 'Authentication failed' };
    }
  }

  static async signUp(
    email: string,
    password: string,
    userData: {
      full_name: string;
      role: 'patient' | 'doctor' | 'nurse' | 'receptionist';
      cpf?: string;
      phone?: string;
      professional_license?: string;
      clinic_id?: string;
    }
  ): Promise<{
    user: HealthcareUser | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Create user profile
      if (data.user) {
        await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name,
          cpf: userData.cpf,
          phone: userData.phone,
          professional_license: userData.professional_license,
          clinic_id: userData.clinic_id,
          created_at: new Date().toISOString(),
        });

        // Assign role
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role_name: userData.role,
        });
      }

      const user = await HealthcareAuth.getCurrentUser();

      console.log(
        `Healthcare auth: User ${user?.email} signed up with role ${userData.role}`
      );

      return { user, error: null };
    } catch (_error) {
      return { user: null, error: 'Registration failed' };
    }
  }

  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: error.message };
      }

      console.log('Healthcare auth: User signed out');
      return { error: null };
    } catch (_error) {
      return { error: 'Sign out failed' };
    }
  }

  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXTAUTH_URL}/auth/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      console.log(`Healthcare auth: Password reset requested for ${email}`);
      return { error: null };
    } catch (_error) {
      return { error: 'Password reset failed' };
    }
  }

  static async updatePassword(
    newPassword: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: error.message };
      }

      console.log('Healthcare auth: Password updated successfully');
      return { error: null };
    } catch (_error) {
      return { error: 'Password update failed' };
    }
  }

  static onAuthStateChange(callback: (user: HealthcareUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await HealthcareAuth.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}
