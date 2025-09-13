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
      console.log('🔍 useAuth: Getting initial session...');
      try {
        // Add timeout to prevent hanging
        const sessionPromise = getCurrentSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        );

        const currentSession = await Promise.race([sessionPromise, timeoutPromise]) as any;
        console.log('🔍 useAuth: Current session:', currentSession ? 'Found' : 'None');
        setSession(currentSession);
        setUser(currentSession?.user || null);

        // Load user profile if authenticated
        if (currentSession?.user) {
          console.log('🔍 useAuth: Loading profile for user:', currentSession.user.id);
          try {
            const userProfile = await userProfileService.getUserProfile(currentSession.user.id);
            console.log('✅ useAuth: Profile loaded:', userProfile ? 'Success' : 'Failed');
            setProfile(userProfile);
          } catch (profileError) {
            console.error('❌ useAuth: Error loading user profile:', profileError);
            // Create fallback profile instead of setting null
            const fallbackProfile = await userProfileService.getUserProfile('fallback-user');
            setProfile(fallbackProfile);
          }
        } else {
          console.log('⚠️ useAuth: No authenticated user, creating fallback profile');
          // Create fallback profile for development
          const fallbackProfile = await userProfileService.getUserProfile('fallback-user');
          setProfile(fallbackProfile);
        }
      } catch (error) {
        console.error('❌ useAuth: Error getting initial session:', error);
        setSession(null);
        setUser(null);
        // Create fallback profile even on error
        try {
          const fallbackProfile = await userProfileService.getUserProfile('fallback-user');
          setProfile(fallbackProfile);
        } catch (fallbackError) {
          console.error('❌ useAuth: Failed to create fallback profile:', fallbackError);
          setProfile(null);
        }
      } finally {
        console.log('✅ useAuth: Initial session loading complete');
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
