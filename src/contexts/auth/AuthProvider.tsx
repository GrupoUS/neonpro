
import React, { createContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOperations } from './useAuthOperations';
import { AuthContextProps } from './types';

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    session,
    setSession,
    user,
    setUser,
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    fetchProfile,
    createProfile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile
  } = useAuthOperations();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state change:', event, currentSession?.user?.id);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsLoading(false);
        // Redirect to auth page on sign out
        navigate('/auth', { replace: true });
      } else if (currentSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        // Defer profile fetching to avoid blocking the auth state change
        setTimeout(() => {
          fetchProfile(currentSession.user.id);
        }, 100);
        
        // Handle redirect after successful login
        if (event === 'SIGNED_IN') {
          // Clean any hash from URL and redirect to dashboard
          const cleanPath = location.pathname === '/auth' ? '/' : location.pathname;
          navigate(cleanPath, { replace: true });
        }
      } else {
        setIsLoading(false);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session:', initialSession?.user?.id);
      
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id);
        
        // If user is authenticated and on auth page, redirect to dashboard
        if (location.pathname === '/auth' || location.pathname.includes('access_token') || location.hash) {
          navigate('/', { replace: true });
        }
      } else {
        setIsLoading(false);
        // If no user and not on auth page, redirect to auth
        if (location.pathname !== '/auth') {
          navigate('/auth', { replace: true });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Handle OAuth redirects and errors
  useEffect(() => {
    const handleAuthRedirect = () => {
      const url = new URL(window.location.href);
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      if (error) {
        console.error('Auth error:', error, errorDescription);
        // Clean the URL and redirect to auth page
        navigate('/auth', { replace: true });
      }
      
      // Clean hash and search params from OAuth redirects
      if (url.hash || url.searchParams.has('access_token') || url.searchParams.has('refresh_token')) {
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
