
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Check, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { newPasswordSchema, NewPasswordFormValues } from '@/components/auth/schemas';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { FormHeader } from '@/components/auth/FormHeader';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';

const ResetPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkResetParams = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      if (!params.get('type') || params.get('type') !== 'recovery') {
        setHasError(true);
        setErrorMessage('Link de redefinição de senha inválido ou expirado');
        toast.error('Link de redefinição de senha inválido');
      }
    };
    
    checkResetParams();
  }, [navigate]);
  
  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: NewPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success('Senha atualizada com sucesso!');
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error.message);
      setHasError(true);
      setErrorMessage(error.message === 'User not found' 
        ? 'O link de redefinição de senha expirou. Por favor, solicite um novo.' 
        : 'Erro ao redefinir senha. Tente novamente ou solicite um novo link.');
      toast.error('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Helmet>
        <title>Redefinir Senha | NEON PRO</title>
        <meta name="description" content="Redefinir sua senha do NEON PRO - Sistema premium de gestão para clínicas de estética." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="w-full max-w-md card-neon animate-fade-in">
        <AuthHeader />
        
        {isSuccess ? (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-accent/20 p-4 mb-4">
                <Check className="h-6 w-6 text-accent" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Senha Atualizada!
            </h2>
            <p className="text-sm text-muted-foreground mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login em instantes.
            </p>
            <Button 
              type="button" 
              onClick={() => navigate('/auth')} 
              className="btn-neon-primary w-full"
            >
              Ir para Login
            </Button>
          </div>
        ) : hasError ? (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/20 p-4 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Ops! Algo deu errado
            </h2>
            <p className="text-sm text-muted-foreground mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              {errorMessage}
            </p>
            <Button 
              type="button" 
              onClick={() => navigate('/auth')} 
              className="btn-neon-primary w-full"
            >
              Voltar para Login
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormHeader 
              title="Redefinir Senha"
              subtitle="Digite sua nova senha abaixo."
            />
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <PasswordInput
                  control={form.control}
                  name="password"
                  label="Nova Senha"
                  placeholder="••••••"
                />
                
                <PasswordInput
                  control={form.control}
                  name="confirmPassword"
                  label="Confirmar Nova Senha"
                  placeholder="••••••"
                />
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="btn-neon-primary w-full h-12" 
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner /> : 'Atualizar Senha'}
                  </Button>
                </div>
                
                <div className="text-center pt-2">
                  <Button 
                    variant="link" 
                    type="button" 
                    onClick={() => navigate('/auth')} 
                    className="text-muted-foreground hover:text-accent"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Voltar para Login
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
      
      <AuthFooter />
    </div>
  );
};

export default ResetPasswordPage;
