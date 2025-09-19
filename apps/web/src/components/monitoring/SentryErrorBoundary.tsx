import * as Sentry from '@sentry/react';
import React from 'react';

interface SentryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
}

/**
 * Sentry-integrated Error Boundary that automatically reports React errors
 * Wraps the Sentry Error Boundary with our custom fallback UI
 */
export function SentryErrorBoundary({ children, fallback }: SentryErrorBoundaryProps) {
  // Use Sentry's built-in Error Boundary with custom fallback
  return (
    <Sentry.ErrorBoundary
      fallback={fallback || SentryErrorFallback}
      beforeCapture={(scope, error, errorInfo) => {
        // Add React-specific context before sending to Sentry
        scope.setTag('errorBoundary', 'react');
        scope.setContext('react', {
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
} /**
 * Default fallback UI for Sentry Error Boundary
 * Shows user-friendly error message while reporting to Sentry
 */

function SentryErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full mx-auto p-6'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 text-red-500 mb-4'>
            <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h1 className='text-xl font-semibold text-gray-900 mb-2'>
            Algo deu errado
          </h1>
          <p className='text-gray-600 mb-6'>
            Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
          </p>

          <div className='space-y-3'>
            <button
              onClick={resetError}
              className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
            >
              Tentar novamente
            </button>

            <button
              onClick={() => window.location.reload()}
              className='w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors'
            >
              Recarregar página
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className='mt-6 text-left'>
              <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40 text-red-600'>
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
