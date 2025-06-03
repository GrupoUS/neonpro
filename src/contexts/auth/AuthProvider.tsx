
import React, { createContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
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
    const handleInitialSession = async () => {
      setIsLoading(true); // Start loading
      console.log('Auth: Starting initial session check. isLoading = true');

      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        await fetchProfile(initialSession.user.id); // Wait for profile
        console.log('Auth: Initial session has user. Profile fetched. isLoading = false');
        // If user is authenticated and on auth page, redirect to dashboard
        if (location.pathname === '/auth' || location.pathname.includes('access_token') || location.hash) {
          navigate('/', { replace: true });
        }
      } else {
        console.log('Auth: Initial session has no user. isLoading = false');
        // If no user and not on auth page, redirect to auth
        if (location.pathname !== '/auth') {
          navigate('/auth', { replace: true });
        }
      }
      setIsLoading(false); // End loading after all checks
    };

    handleInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state change:', event, currentSession?.user?.id);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsLoading(false);
        console.log('Auth: Signed out. isLoading = false');
        navigate('/auth', { replace: true });
      } else if (currentSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setIsLoading(true); // Start loading for profile fetch
        console.log('Auth: Signed in/refreshed. Starting profile fetch. isLoading = true');
        await fetchProfile(currentSession.user.id); // Wait for profile
        console.log('Auth: Profile fetched after state change. isLoading = false');
        setIsLoading(false); // End loading
        
        if (event === 'SIGNED_IN') {
          const cleanPath = location.pathname === '/auth' ? '/' : location.pathname;
          navigate(cleanPath, { replace: true });
        }
      } else {
        setIsLoading(false);
        console.log('Auth: No user after state change. isLoading = false');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, fetchProfile]); // Add fetchProfile to dependencies

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
