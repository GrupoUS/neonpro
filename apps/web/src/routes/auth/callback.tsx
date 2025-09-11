import { supabase } from '@/integrations/supabase/client';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

function AuthCallbackComponent() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL to check for parameters
        const url = new URL(window.location.href);
        const nextUrl = url.searchParams.get('next');

        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setTimeout(() => {
            router.navigate({ to: '/login', search: { error: 'auth_callback_failed' } as any });
          }, 1500);
          return;
        }

        if (data.session) {
          console.log('Auth callback successful, redirecting to dashboard');
          setStatus('success');

          // Redirect to next URL or default to dashboard
          const redirectUrl = nextUrl ? decodeURIComponent(nextUrl) : '/dashboard';
          setTimeout(() => {
            router.navigate({ to: redirectUrl as any });
          }, 800);
        } else {
          console.log('No session found, redirecting to login');
          setStatus('error');
          setTimeout(() => {
            router.navigate({ to: '/login' });
          }, 1500);
        }
      } catch (error) {
        console.error('Auth callback exception:', error);
        setStatus('error');
        setTimeout(() => {
          router.navigate({ to: '/login', search: { error: 'auth_exception' } as any });
        }, 1500);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='text-center space-y-4'>
        {status === 'loading' && (
          <>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'>
            </div>
            <p className='text-sm text-muted-foreground'>Processando autenticação...</p>
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
            <p className='text-sm text-green-600'>Autenticação realizada com sucesso!</p>
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
            <p className='text-sm text-red-600'>Erro na autenticação</p>
            <p className='text-xs text-muted-foreground'>Redirecionando para login...</p>
          </>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackComponent,
});
