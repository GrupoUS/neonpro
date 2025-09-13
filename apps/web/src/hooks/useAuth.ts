import { getCurrentSession, supabase } from '@/integrations/supabase/client';
import { type UserProfile, userProfileService } from '@/services/user-profile.service';
import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: keyof UserProfile['permissions']) => boolean;
  isRole: (role: UserProfile['role']) => boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session and profile
    const getInitialSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        // Load user profile if authenticated
        if (currentSession?.user) {
          try {
            const userProfile = await userProfileService.getUserProfile(currentSession.user.id);
            setProfile(userProfile);
          } catch (profileError) {
            console.error('Error loading user profile:', profileError);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user || null);

        // Load user profile for authenticated users
        if (session?.user) {
          try {
            const userProfile = await userProfileService.getUserProfile(session.user.id);
            setProfile(userProfile);
          } catch (profileError) {
            console.error('Error loading user profile:', profileError);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);

        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in:', session?.user?.email);
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            setProfile(null);
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed for user:', session?.user?.email);
            break;
          case 'USER_UPDATED':
            console.log('User updated:', session?.user?.email);
            break;
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper functions
  const hasPermission = (permission: keyof UserProfile['permissions']): boolean => {
    return profile?.permissions[permission] || false;
  };

  const isRole = (role: UserProfile['role']): boolean => {
    return profile?.role === role;
  };

  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!session && !!user,
    hasPermission,
    isRole,
  };
}
