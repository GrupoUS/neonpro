
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle redirection after login
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Clean up URL parameters from OAuth redirects
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasAuthParams = url.searchParams.has('access_token') || 
                         url.searchParams.has('refresh_token') || 
                         url.searchParams.has('error') ||
                         url.hash;
    
    if (hasAuthParams) {
      // Clean the URL without triggering a page reload
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
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
    toast.success("Login realizado com sucesso!");
  };

  if (showResetPassword) {
    return (
      <>
        <Helmet>
          <title>Recuperar Senha | NEON PRO</title>
          <meta name="description" content="Recupere sua senha para acessar o NEON PRO - Sistema premium de gestão para clínicas de estética." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="flex flex-col min-h-screen bg-gradient-sacha-cosmic transition-colors duration-300">
          <AuthHeader />
          
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md card-sacha-gold animate-fade-in">
              <ResetPasswordForm 
                onCancel={() => setShowResetPassword(false)} 
                onSuccess={() => setShowResetPassword(false)}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
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
      <div className="flex flex-col min-h-screen bg-gradient-sacha-cosmic transition-colors duration-300">
        <AuthHeader />
        
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md card-sacha-gold animate-fade-in backdrop-blur-sm">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="transition-all duration-300">
              <TabsList className="grid grid-cols-2 w-full mb-8 bg-sacha-dark-blue/20 dark:bg-sacha-blue/30 border border-sacha-gold/30 rounded-lg">
                <TabsTrigger 
                  value="login" 
                  className="transition-all data-[state=active]:bg-sacha-gold data-[state=active]:text-sacha-dark-blue text-sacha-dark-blue dark:text-sacha-gray-light font-semibold"
                  style={{ fontFamily: 'Optima, Inter, sans-serif' }}
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="transition-all data-[state=active]:bg-sacha-gold data-[state=active]:text-sacha-dark-blue text-sacha-dark-blue dark:text-sacha-gray-light font-semibold"
                  style={{ fontFamily: 'Optima, Inter, sans-serif' }}
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
        </main>
        
        <AuthFooter />
      </div>
    </>
  );
};

export default AuthPage;
