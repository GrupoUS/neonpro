
import React, { createContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Auth: Inicializando autenticação...');
        
        // Buscar sessão atual primeiro
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (initialSession?.user) {
          console.log('Auth: Sessão encontrada, carregando perfil...');
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Buscar perfil de forma assíncrona
          fetchProfile(initialSession.user.id).finally(() => {
            if (mounted) {
              setIsLoading(false);
              console.log('Auth: Perfil carregado, loading = false');
            }
          });
          
          // Redirecionar se necessário
          if (location.pathname === '/auth' || location.pathname.includes('access_token')) {
            navigate('/', { replace: true });
          }
        } else {
          console.log('Auth: Nenhuma sessão encontrada');
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          
          // Redirecionar para auth se não estiver lá
          if (location.pathname !== '/auth') {
            navigate('/auth', { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth: Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      console.log('Auth: Mudança de estado:', event, currentSession?.user?.id);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setIsLoading(false);
        navigate('/auth', { replace: true });
      } else if (currentSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        // Buscar perfil de forma assíncrona
        fetchProfile(currentSession.user.id).finally(() => {
          if (mounted) {
            setIsLoading(false);
          }
        });
        
        if (event === 'SIGNED_IN') {
          const targetPath = location.pathname === '/auth' ? '/' : location.pathname;
          navigate(targetPath, { replace: true });
        }
      } else if (!currentSession) {
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Inicializar
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, fetchProfile, setSession, setUser, setProfile, setIsLoading]);

  // Limpar parâmetros OAuth da URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasAuthParams = url.hash || url.searchParams.has('access_token') || url.searchParams.has('refresh_token');
    
    if (hasAuthParams) {
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

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
