import { supabase } from '@/integrations/supabase/client';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

function AuthCallbackComponent() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle OAuth callback - supports both code flow and implicit flow
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const accessToken = url.hash.match(/access_token=([^&]+)/)?.[1];

        console.log('Auth callback - URL:', url.href);
        console.log('Auth callback - Code:', !!code, 'Access Token:', !!accessToken);

        // Handle code flow (PKCE)
        if (code) {
          console.log('Processing PKCE flow with code');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Auth callback error:', error);
            setStatus('error');
            setTimeout(() => {
              router.navigate({
                to: '/' as const,
                search: { error: 'auth_callback_failed' } as any,
              });
            }, 1500);
            return;
          }

          if (data.session) {
            console.log('Auth callback successful (code flow), redirecting to dashboard');
            setStatus('success');
            setTimeout(() => {
              router.navigate({ to: '/dashboard' });
            }, 800);
            return;
          }
        }

        // Handle implicit flow (access_token in hash)
        if (accessToken) {
          console.log('Processing implicit flow with access_token');

          // Force redirect to dashboard immediately
          // The Supabase client should have already processed the hash automatically
          console.log('Access token found, redirecting to dashboard immediately');
          setStatus('success');

          // Clean the URL hash before redirecting
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState({}, document.title, cleanUrl);

          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 800);

          return;
        }

        // No code or access_token found
        console.error('No authentication parameters found in callback URL');
        setStatus('error');
        setTimeout(() => {
          router.navigate({ to: '/' as const, search: { error: 'auth_callback_failed' } as any });
        }, 1500);
      } catch (error) {
        console.error('Auth callback exception:', error);
        setStatus('error');
        setTimeout(() => {
          router.navigate({ to: '/' as const, search: { error: 'auth_exception' } as any });
        }, 1500);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className='flex min-h-full h-full items-center justify-center bg-background'>
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
