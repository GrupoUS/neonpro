
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import LoginForm from "../components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Helmet } from "react-helmet";
import { useAuth } from "../hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle redirection after login with improved logging
  useEffect(() => {
    console.log('🔍 AuthPage: Verificando estado de autenticação...', {
      hasSession: !!session,
      hasUser: !!user,
      currentPath: location.pathname,
      timestamp: new Date().toISOString()
    });

    if (session && user) {
      console.log('🔀 AuthPage: Usuário autenticado detectado, redirecionando para dashboard');
      // Adicionar um pequeno delay para garantir que a navegação aconteça
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 50);
    }
  }, [session, user, navigate, location.pathname]);

  // Clean up URL parameters from OAuth redirects with improved handling
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasAuthParams = url.searchParams.has('access_token') || 
                         url.searchParams.has('refresh_token') || 
                         url.searchParams.has('error') ||
                         url.hash;
    
    if (hasAuthParams) {
      console.log('🧹 AuthPage: Limpando parâmetros OAuth da URL', {
        hash: url.hash,
        searchParams: url.search,
        timestamp: new Date().toISOString()
      });
      
      // Clean the URL without triggering a page reload
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Handle Google Sign In with improved error handling
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('🔑 AuthPage: Iniciando Google OAuth...', {
        redirectTo: `${window.location.origin}/dashboard`,
        timestamp: new Date().toISOString()
      });
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ AuthPage: Google OAuth iniciado com sucesso');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ AuthPage: Erro no Google OAuth:', errorMessage);
      toast.error(`Erro ao entrar com Google: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = () => {
    setShowResetPassword(true);
  };

  // Handle login success
  const handleLoginSuccess = () => {
    console.log('✅ AuthPage: Login bem-sucedido');
    toast.success("Login realizado com sucesso!");
  };

  // Se o usuário está autenticado, não renderizar a página de auth
  if (session && user) {
    console.log('🔄 AuthPage: Usuário autenticado, não renderizando página de auth');
    return null;
  }

  if (showResetPassword) {
    return (
      <>
        <Helmet>
          <title>Recuperar Senha | NEON PRO</title>
          <meta name="description" content="Recupere sua senha para acessar o NEON PRO - Sistema premium de gestão para clínicas de estética." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
          <AuthHeader />
          
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="card-neon-enhanced animate-fade-in">
                <ResetPasswordForm 
                  onCancel={() => setShowResetPassword(false)} 
                  onSuccess={() => setShowResetPassword(false)}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
            </div>
          </main>
          
          <AuthFooter />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Login | NEON PRO</title>
        <meta name="description" content="Faça login no NEON PRO - Sistema premium completo para gestão de clínicas de estética." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
        <AuthHeader />
        
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="card-neon-enhanced animate-fade-in backdrop-blur-sm">
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="transition-all duration-300">
                <TabsList className="grid grid-cols-2 w-full mb-8 bg-muted/50 border border-border/50 rounded-xl h-12">
                  <TabsTrigger 
                    value="login" 
                    className="transition-all data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-foreground font-semibold rounded-lg h-10"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="transition-all data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-foreground font-semibold rounded-lg h-10"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Cadastro
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="animate-fade-in">
                  <LoginForm 
                    onSuccess={handleLoginSuccess} 
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    handleGoogleSignIn={handleGoogleSignIn}
                    onResetPassword={handleResetPassword}
                  />
                </TabsContent>
                
                <TabsContent value="register" className="animate-fade-in">
                  <RegisterForm 
                    onSuccess={() => setActiveTab("login")} 
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    handleGoogleSignIn={handleGoogleSignIn}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        
        <AuthFooter />
      </div>
    </>
  );
};

export default AuthPage;
