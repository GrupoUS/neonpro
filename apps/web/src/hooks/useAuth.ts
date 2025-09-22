import { getCurrentSession, supabase } from '@/integrations/supabase/client';
import { type UserProfile, userProfileService } from '@/services/user-profile.service';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: keyof UserProfile['permissions']) => boolean;
  isRole: (_role: UserProfile['role']) => boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session and profile
    const getInitialSession = async () => {
      console.log('🔍 useAuth: Getting initial session...');
      try {
        // Add timeout to prevent hanging
        const sessionPromise = getCurrentSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 3000)
        );

        const currentSession = (await Promise.race([
          sessionPromise,
          timeoutPromise,
        ])) as any;
        console.log(
          '🔍 useAuth: Current session:',
          currentSession ? 'Found' : 'None',
        );
        setSession(currentSession);
        setUser(currentSession?.user || null);

        // Load user profile if authenticated
        if (currentSession?.user) {
          console.log(
            '🔍 useAuth: Loading profile for user:',
            currentSession.user.id,
          );
          try {
            const profilePromise = userProfileService.getUserProfile(
              currentSession.user.id,
            );
            const profileTimeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Profile loading timeout')), 3000)
            );

            const userProfile = (await Promise.race([
              profilePromise,
              profileTimeoutPromise,
            ])) as any;
            console.log(
              '✅ useAuth: Profile loaded:',
              userProfile ? 'Success' : 'Failed',
            );
            setProfile(userProfile);
          } catch (_profileError) {
            console.error(
              '❌ useAuth: Error loading user profile:',
              profileError,
            );
            // Set null profile instead of trying fallback to prevent infinite loading
            setProfile(null);
          }
        } else {
          console.log(
            '⚠️ useAuth: No authenticated user, setting null profile',
          );
          // Don't create fallback profile - just set null to allow app to work
          setProfile(null);
        }
      } catch (_error) {
        console.error('❌ useAuth: Error getting initial session:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        console.log('✅ useAuth: Initial session loading complete');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      setSession(session);
      setUser(session?.user || null);

      // Load user profile for authenticated users
      if (session?.user) {
        try {
          const profilePromise = userProfileService.getUserProfile(
            session.user.id,
          );
          const profileTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile loading timeout')), 3000)
          );

          const userProfile = (await Promise.race([
            profilePromise,
            profileTimeoutPromise,
          ])) as any;
          setProfile(userProfile);
        } catch (_profileError) {
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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper functions
  const hasPermission = (
    permission: keyof UserProfile['permissions'],
  ): boolean => {
    return profile?.permissions[permission] || false;
  };

  const isRole = (_role: UserProfile['role']): boolean => {
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
