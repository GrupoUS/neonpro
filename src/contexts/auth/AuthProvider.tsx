
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
        console.log('🔐 Auth: Iniciando autenticação...', {
          currentPath: location.pathname,
          timestamp: new Date().toISOString()
        });
        
        // Buscar sessão atual primeiro
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth: Erro ao buscar sessão inicial:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (!mounted) return;

        if (initialSession?.user) {
          console.log('✅ Auth: Sessão encontrada, configurando usuário...', {
            userId: initialSession.user.id,
            email: initialSession.user.email,
            currentPath: location.pathname,
            timestamp: new Date().toISOString()
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
          
          // Lógica de redirecionamento melhorada
          const currentPath = location.pathname;
          const isAuthPath = currentPath === '/auth';
          const hasOAuthParams = currentPath.includes('access_token') || location.hash;
          
          console.log('🔀 Auth: Verificando redirecionamento...', { 
            currentPath, 
            isAuthPath, 
            hasOAuthParams,
            shouldRedirect: isAuthPath || hasOAuthParams
          });
          
          if (isAuthPath || hasOAuthParams) {
            console.log('🔀 Auth: Redirecionando usuário autenticado para dashboard...');
            setTimeout(() => {
              if (mounted) {
                navigate('/dashboard', { replace: true });
              }
            }, 100);
          }
        } else {
          console.log('❌ Auth: Nenhuma sessão encontrada');
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          
          // Redirecionar para auth se não estiver lá e não estiver em rotas públicas
          const publicRoutes = ['/auth'];
          const currentPath = location.pathname;
          
          if (!publicRoutes.includes(currentPath)) {
            console.log('🔀 Auth: Redirecionando para auth...');
            navigate('/auth', { replace: true });
          }
        }
      } catch (error) {
        console.error('❌ Auth: Erro na inicialização:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
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
        currentPath: location.pathname,
        timestamp: new Date().toISOString()
      });
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 Auth: Usuário deslogado');
        setProfile(null);
        setIsLoading(false);
        navigate('/auth', { replace: true });
      } else if (currentSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log(`✅ Auth: ${event} - Processando...`);
        
        // Buscar perfil de forma assíncrona
        fetchProfile(currentSession.user.id).finally(() => {
          if (mounted) {
            setIsLoading(false);
          }
        });
        
        if (event === 'SIGNED_IN') {
          // Verificar se estamos em uma página de auth ou com parâmetros OAuth
          const currentPath = location.pathname;
          const isAuthPath = currentPath === '/auth';
          const hasOAuthParams = currentPath.includes('access_token') || location.hash;
          
          console.log('🔀 Auth: Login detectado, verificando redirecionamento...', {
            currentPath,
            isAuthPath,
            hasOAuthParams,
            shouldRedirect: isAuthPath || hasOAuthParams || currentPath === '/'
          });
          
          // Redirecionar apenas se necessário
          if (isAuthPath || hasOAuthParams || currentPath === '/') {
            console.log('🔀 Auth: Redirecionando após login para dashboard...');
            setTimeout(() => {
              if (mounted) {
                navigate('/dashboard', { replace: true });
              }
            }, 100);
          }
        }
      } else if (!currentSession) {
        console.log('❌ Auth: Sessão perdida');
        setProfile(null);
        setIsLoading(false);
        
        // Redirecionar para auth apenas se não estivermos já lá
        if (location.pathname !== '/auth') {
          navigate('/auth', { replace: true });
        }
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
  }, [location.pathname]);

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
