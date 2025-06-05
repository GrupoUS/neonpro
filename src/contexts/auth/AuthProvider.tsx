
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
        console.log('🔐 Auth: Iniciando autenticação...');
        
        // Buscar sessão atual primeiro
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (initialSession?.user) {
          console.log('✅ Auth: Sessão encontrada, carregando perfil...', {
            userId: initialSession.user.id,
            email: initialSession.user.email
          });
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Buscar perfil de forma assíncrona
          fetchProfile(initialSession.user.id).finally(() => {
            if (mounted) {
              setIsLoading(false);
              console.log('✅ Auth: Perfil carregado, loading = false');
            }
          });
          
          // Redirecionar para dashboard se estiver na página de auth
          const currentPath = location.pathname;
          console.log('🔀 Auth: Verificando redirecionamento...', { currentPath });
          
          if (currentPath === '/auth' || currentPath === '/' || currentPath.includes('access_token')) {
            console.log('🔀 Auth: Redirecionando para dashboard...');
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('❌ Auth: Nenhuma sessão encontrada');
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          
          // Redirecionar para auth se não estiver lá e não estiver em rotas autenticadas
          const publicRoutes = ['/auth'];
          if (!publicRoutes.includes(location.pathname)) {
            console.log('🔀 Auth: Redirecionando para auth...');
            navigate('/auth', { replace: true });
          }
        }
      } catch (error) {
        console.error('❌ Auth: Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      console.log('🔔 Auth: Mudança de estado:', event, {
        userId: currentSession?.user?.id,
        hasSession: !!currentSession,
        currentPath: location.pathname
      });
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 Auth: Usuário deslogado');
        setProfile(null);
        setIsLoading(false);
        navigate('/auth', { replace: true });
      } else if (currentSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('✅ Auth: Usuário logado/token renovado');
        
        // Buscar perfil de forma assíncrona
        fetchProfile(currentSession.user.id).finally(() => {
          if (mounted) {
            setIsLoading(false);
          }
        });
        
        if (event === 'SIGNED_IN') {
          // Sempre redirecionar para o dashboard após login bem-sucedido
          console.log('🔀 Auth: Login bem-sucedido, redirecionando para dashboard...');
          navigate('/dashboard', { replace: true });
        }
      } else if (!currentSession) {
        console.log('❌ Auth: Sessão perdida');
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
      console.log('🧹 Auth: Limpando parâmetros OAuth da URL');
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
