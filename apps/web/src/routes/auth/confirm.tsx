import { supabase } from '@/integrations/supabase/client';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

interface ConfirmSearchParams {
  email?: string;
  next?: string;
  error?: string;
  error_description?: string;
}

function AuthConfirmComponent() {
  const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const search = useSearch({ from: '/auth/confirm' }) as ConfirmSearchParams;

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Get the current URL to check for parameters
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const nextUrl = url.searchParams.get('next') || search.next;
        const email = url.searchParams.get('email') || search.email;

        // Check for error from OAuth/magic link
        const errorParam = url.searchParams.get('error') || hashParams.get('error') || search.error;
        const errorDescription = url.searchParams.get('error_description') ||
          hashParams.get('error_description') || search.error_description;

        if (errorParam) {
          console.error('Auth error:', errorParam, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Erro na autenticação');
          setTimeout(() => {
            window.location.href = '/login?error=auth_failed';
          }, 3000);
          return;
        }

        // If we have an email param but no hash/tokens, this is post-signup
        // Show "check your email" message
        if (email && !url.hash) {
          console.log('Post-signup state, waiting for email confirmation');
          setStatus('pending');
          setMessage(`Enviamos um link de confirmação para ${decodeURIComponent(email)}`);
          return;
        }

        // Check for access_token in hash (magic link or OAuth callback)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session from the tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Erro ao criar sessão');
            setTimeout(() => {
              window.location.href = '/login?error=session_failed';
            }, 3000);
            return;
          }

          console.log('Email confirmed successfully via token');
          setStatus('success');
          setMessage('Email confirmado com sucesso!');

          // Redirect to next URL or default to dashboard
          const redirectUrl = nextUrl ? decodeURIComponent(nextUrl) : '/dashboard';
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
          return;
        }

        // Try to get existing session (in case of page refresh after confirmation)
        const { data, error } = await supabase.auth.getSession();

        if (data.session) {
          console.log('Existing session found');
          setStatus('success');
          setMessage('Você já está autenticado!');

          const redirectUrl = nextUrl ? decodeURIComponent(nextUrl) : '/dashboard';
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
          return;
        }

        // No session, no tokens, no email - redirect to login
        if (!email) {
          console.log('No session, redirecting to login');
          window.location.href = '/login';
          return;
        }

        // Email provided but no session - show pending state
        setStatus('pending');
        setMessage(`Aguardando confirmação de ${decodeURIComponent(email)}`);

      } catch (error) {
        console.error('Email confirmation exception:', error);
        setStatus('error');
        setMessage('Erro inesperado');
        setTimeout(() => {
          window.location.href = '/login?error=confirmation_exception';
        }, 3000);
      }
    };

    handleConfirmation();
  }, [search]);

  return (
    <div className='flex min-h-full h-full items-center justify-center bg-background'>
      <div className='text-center space-y-4 max-w-md px-4'>
        {status === 'loading' && (
          <>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'>
            </div>
            <p className='text-sm text-muted-foreground'>Verificando...</p>
          </>
        )}
        {status === 'pending' && (
          <>
            <div className='h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
              <svg
                className='h-6 w-6 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
            </div>
            <p className='text-sm text-blue-600 font-medium'>Verifique seu email</p>
            <p className='text-xs text-muted-foreground'>{message}</p>
            <p className='text-xs text-muted-foreground mt-4'>
              Clique no link enviado para confirmar sua conta.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className='mt-4 text-sm text-primary hover:underline'
            >
              Voltar para login
            </button>
          </>
        )}
        {status === 'success' && (
          <>
            <div className='h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
              <svg
                className='h-6 w-6 text-green-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <p className='text-sm text-green-600'>{message}</p>
            <p className='text-xs text-muted-foreground'>Redirecionando para o dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className='h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto'>
              <svg
                className='h-6 w-6 text-red-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </div>
            <p className='text-sm text-red-600'>{message || 'Erro na confirmação do email'}</p>
            <p className='text-xs text-muted-foreground'>Redirecionando para login...</p>
          </>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/auth/confirm')({
  component: AuthConfirmComponent,
});

