import { useAuth } from '@/hooks/useAuth';
import { GoogleCalendarService } from '@/services/google-calendar';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/google-calendar/auth')({
  component: GoogleCalendarAuth,
  loader: () => {
    // Check if we have authorization code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    return { code, state, error };
  },
});

function GoogleCalendarAuth() {
  const { code, state, error } = Route.useLoaderData();
  const navigate = useNavigate();
  const { user } = useAuth();

  const callbackMutation = useMutation({
    mutationFn: async () => {
      if (!code || !state) {
        throw new Error('Missing required parameters');
      }

      // Parse state to get userId and clinicId
      const stateData = JSON.parse(atob(state));
      const { userId, clinicId, lgpdConsent } = stateData;

      if (!userId || !clinicId) {
        throw new Error('Invalid state parameters');
      }

      const service = new GoogleCalendarService({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
        clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET!,
        redirectUri: `${window.location.origin}/google-calendar/auth`,
      });

      return await service.initializeIntegration(
        userId,
        clinicId,
        code,
        lgpdConsent,
      );
    },
    onSuccess: () => {
      // Redirect back to settings page
      navigate({ to: '/settings/calendar', search: { success: 'true' } });
    },
    onError: error => {
      console.error('OAuth callback error:', error);
      navigate({ to: '/settings/calendar', search: { error: 'oauth_failed' } });
    },
  });

  useEffect(() => {
    if (error) {
      // Handle OAuth error
      navigate({
        to: '/settings/calendar',
        search: { error: 'oauth_denied' },
      });
      return;
    }

    if (code && state && user) {
      callbackMutation.mutate();
    }
  }, [code, state, error, user]);

  if (callbackMutation.isPending) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'>
          </div>
          <h2 className='text-xl font-semibold mb-2'>
            Conectando ao Google Calendar
          </h2>
          <p className='text-gray-600'>
            Por favor, aguarde enquanto finalizamos a integração...
          </p>
        </div>
      </div>
    );
  }

  if (callbackMutation.isError) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center max-w-md'>
          <div className='text-red-500 mb-4'>
            <svg
              className='w-16 h-16 mx-auto'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-semibold mb-2 text-red-600'>
            Erro na Conexão
          </h2>
          <p className='text-gray-600 mb-4'>
            Não foi possível conectar sua conta do Google Calendar. Por favor, tente novamente.
          </p>
          <button
            onClick={() => navigate({ to: '/settings/calendar' })}
            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
          >
            Voltar para Configurações
          </button>
        </div>
      </div>
    );
  }

  return null;
}
