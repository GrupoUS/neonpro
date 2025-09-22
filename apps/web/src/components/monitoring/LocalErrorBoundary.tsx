import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<any>;
}

function DefaultFallback({
  error,resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
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
          <p className='text-gray-600 mb-6'>Ocorreu um erro inesperado.</p>
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
                Detalhes do erro (dev)
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

export class LocalErrorBoundary extends React.Component<
  Props,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // No-op: intentionally not reporting to Sentry in this local boundary
    // to avoid bundling '@sentry/react' in environments where it may not resolve.
    console.error('[LocalErrorBoundary] Caught error:', error);
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback ?? DefaultFallback;
      return <Fallback error={this.state.error!} resetError={this.reset} />;
    }
    return this.props.children;
  }
}

export default LocalErrorBoundary;
