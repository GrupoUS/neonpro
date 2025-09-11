'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { type AuthFormData, authFormSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBrandGoogle } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function SignupFormDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);

        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, redirecting to dashboard...');
          // Small delay to ensure the session is fully established
          setTimeout(() => {
            router.navigate({ to: '/dashboard' });
          }, 100);
        }

        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }

        // Handle OAuth callback tokens in URL
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          if (hashParams.get('access_token')) {
            console.log('OAuth tokens detected in URL, cleaning up...');
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      },
    );

    // Also check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('User already signed in, redirecting to dashboard...');
        router.navigate({ to: '/dashboard' });
      }
    };

    checkUser();

    return () => subscription.unsubscribe();
  }, [router]);

  // Configuração do react-hook-form com validação Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authFormSchema),
    mode: 'onBlur', // Valida quando o campo perde o foco
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      crm: '',
    },
  });

  // Função para submissão do formulário
  const onSubmit = async (data: AuthFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Dados do formulário validados:', data);

      // Simula processo de autenticação
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reset do formulário após sucesso
      reset();

      // Redireciona para o dashboard após login bem-sucedido
      router.navigate({ to: '/dashboard' });
    } catch (err) {
      setError('Erro ao processar o formulário. Tente novamente.');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setError(`Erro no login com Google: ${error.message}`);
        setIsLoading(false);
      }
      // Note: Don't set loading to false here if successful,
      // as the page will redirect
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
      console.error('Google sign-in error:', err);
      setIsLoading(false);
    }
  };
  return (
    <div className='shadow-input mx-auto w-full max-w-md rounded-none bg-background p-4 md:rounded-2xl md:p-8 border border-border/50'>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent'>
          NEON PRO
        </h2>
        <p className='text-xs text-muted-foreground mt-1 font-medium'>
          AI-First SaaS • Clínicas de Estética
        </p>
      </div>
      <h3 className='text-lg font-semibold text-foreground mb-2'>
        Acesse sua conta
      </h3>
      <p className='text-sm text-muted-foreground mb-6'>
        Entre com suas credenciais para acessar o sistema de gestão de clínicas de estética mais
        avançado do Brasil.
      </p>

      <form className='my-8' onSubmit={handleSubmit(onSubmit)}>
        <div className='mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2'>
          <LabelInputContainer>
            <Label htmlFor='firstname'>Nome</Label>
            <Input
              id='firstname'
              placeholder='Dr. João'
              type='text'
              {...register('firstname')}
              className={cn(
                errors.firstname && 'border-destructive focus-visible:ring-destructive/20',
              )}
            />
            {errors.firstname && (
              <p className='text-xs text-destructive mt-1'>{errors.firstname.message}</p>
            )}
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor='lastname'>Sobrenome</Label>
            <Input
              id='lastname'
              placeholder='Silva'
              type='text'
              {...register('lastname')}
              className={cn(
                errors.lastname && 'border-destructive focus-visible:ring-destructive/20',
              )}
            />
            {errors.lastname && (
              <p className='text-xs text-destructive mt-1'>{errors.lastname.message}</p>
            )}
          </LabelInputContainer>
        </div>
        <LabelInputContainer className='mb-4'>
          <Label htmlFor='email'>E-mail Profissional</Label>
          <Input
            id='email'
            placeholder='dr.joao@clinicaestetica.com.br'
            type='email'
            {...register('email')}
            className={cn(errors.email && 'border-destructive focus-visible:ring-destructive/20')}
          />
          {errors.email && <p className='text-xs text-destructive mt-1'>{errors.email.message}</p>}
        </LabelInputContainer>
        <LabelInputContainer className='mb-4'>
          <Label htmlFor='password'>Senha</Label>
          <Input
            id='password'
            placeholder='••••••••'
            type='password'
            {...register('password')}
            className={cn(
              errors.password && 'border-destructive focus-visible:ring-destructive/20',
            )}
          />
          {errors.password && (
            <p className='text-xs text-destructive mt-1'>{errors.password.message}</p>
          )}
        </LabelInputContainer>
        <LabelInputContainer className='mb-8'>
          <Label htmlFor='crm'>CRM (Opcional)</Label>
          <Input
            id='crm'
            placeholder='CRM/SP 123456'
            type='text'
            {...register('crm')}
            className={cn(errors.crm && 'border-destructive focus-visible:ring-destructive/20')}
          />
          {errors.crm && <p className='text-xs text-destructive mt-1'>{errors.crm.message}</p>}
        </LabelInputContainer>

        <button
          className='group/btn relative block h-12 w-full rounded-md bg-gradient-to-r from-primary via-primary/95 to-primary/90 font-medium text-primary-foreground shadow-lg hover:from-primary/90 hover:via-primary/85 hover:to-primary/80 hover:shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
          type='submit'
          disabled={isLoading || isSubmitting}
        >
          {isLoading || isSubmitting ? 'Processando...' : 'Entrar na Plataforma'} &rarr;
          <BottomGradient />
        </button>

        <div className='my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700' />

        {error && (
          <div className='mb-4 p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800'>
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          </div>
        )}

        <div className='flex flex-col space-y-4'>
          <button
            className='group/btn shadow-input relative flex h-12 w-full items-center justify-center space-x-3 rounded-md bg-white border-2 border-gray-200 px-4 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 dark:shadow-[0px_0px_1px_1px_#262626] disabled:opacity-50 disabled:cursor-not-allowed'
            type='button'
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <IconBrandGoogle className='h-5 w-5 text-[#4285f4]' />
            <span className='text-sm font-medium'>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
            <BottomGradient />
          </button>
        </div>

        {/* Subtle Compliance Indicator */}
        <div className='mt-4 text-center'>
          <p className='text-xs text-muted-foreground'>
            🔒 Plataforma certificada • LGPD • CFM • ANVISA
          </p>
        </div>

        <p className='text-center text-xs text-muted-foreground mt-4'>
          Ao continuar, você concorda com nossos{' '}
          <a href='#' className='text-primary hover:underline'>
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href='#' className='text-primary hover:underline'>
            Política de Privacidade
          </a>
          .
        </p>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className='absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100' />
      <span className='absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100' />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex w-full flex-col space-y-2', className)}>
      {children}
    </div>
  );
};
