/**
 * 500 Server Error Page
 *
 * User-friendly 500 error page for server errors with healthcare-appropriate messaging
 */

import { Button } from '@neonpro/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, Home, Phone, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface ServerErrorPageProps {
  error?: Error;
  errorId?: string;
}

export function ServerErrorPage({ error, errorId }: ServerErrorPageProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Wait a moment to show the loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.reload();
    } catch {
      setIsRefreshing(false);
    }
  };

  const errorMessage = error?.message || 'Ocorreu um erro interno no servidor';
  const displayErrorId = errorId || `ERR-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4'>
      <Card className='w-full max-w-md text-center shadow-lg'>
        <CardHeader className='pb-4'>
          <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
            <AlertTriangle className='h-10 w-10 text-red-600' />
          </div>
          <CardTitle className='text-2xl font-bold text-gray-900'>
            Erro do Servidor
          </CardTitle>
          <CardDescription className='text-gray-600'>
            Ocorreu um problema técnico. Nossa equipe foi notificada automaticamente.
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='text-sm text-gray-500 mb-6'>
            <p>Código do erro: 500</p>
            <p className='text-xs mt-2 font-mono bg-gray-100 p-2 rounded'>
              ID: {displayErrorId}
            </p>

            {import.meta.env?.NODE_ENV === 'development' && error && (
              <details className='mt-4 text-left'>
                <summary className='cursor-pointer text-red-600 hover:text-red-800'>
                  Detalhes técnicos (desenvolvimento)
                </summary>
                <pre className='mt-2 text-xs bg-red-50 p-2 rounded overflow-auto max-h-32'>
                  {errorMessage}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>

          <div className='space-y-3'>
            <Button
              onClick={handleRefresh}
              variant='default'
              className='w-full'
              disabled={isRefreshing}
            >
              {isRefreshing
                ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    Recarregando...
                  </>
                )
                : (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Tentar Novamente
                  </>
                )}
            </Button>

            <Button
              asChild
              variant='outline'
              className='w-full'
            >
              <Link to='/'>
                <Home className='mr-2 h-4 w-4' />
                Ir para Início
              </Link>
            </Button>
          </div>

          <div className='pt-4 border-t border-gray-200'>
            <p className='text-xs text-gray-500 mb-2'>
              O problema persiste?
            </p>
            <div className='space-y-2'>
              <Button
                asChild
                variant='ghost'
                size='sm'
                className='text-blue-600 hover:text-blue-800 w-full'
              >
                <a
                  href={'mailto:suporte@neonpro.com.br?subject=Erro%20do%20Servidor&body=ID%20do%20Erro:%20'
                    + encodeURIComponent(displayErrorId)}
                  rel='noopener noreferrer'
                >
                  <Phone className='mr-2 h-3 w-3' />
                  Reportar Problema
                </a>
              </Button>

              <p className='text-xs text-gray-400'>
                Inclua o ID do erro ao entrar em contato
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ServerErrorPage;
