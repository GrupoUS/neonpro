import type React from 'react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-96 p-8 rounded-lg border border-destructive/30 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent shadow-healthcare-md backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-destructive mb-4">Oops! Algo deu errado</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">Um erro inesperado aconteceu. Nossa equipe foi notificada.</p>

          <button 
            onClick={this.handleRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2 text-sm font-medium shadow-healthcare-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          >
            Tentar novamente
          </button>

          {this.props.showDetails && this.state.error && (
            <details className="mt-6 w-full max-w-2xl">
              <summary className="cursor-pointer text-muted-foreground text-sm font-medium hover:text-foreground">Detalhes técnicos</summary>
              <pre className="mt-2 p-4 bg-muted/50 border border-border rounded-md text-xs overflow-auto whitespace-pre-wrap text-foreground">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

interface CriticalErrorBoundaryProps extends Props {
  title: string;
}

export class CriticalErrorBoundary extends Component<
  CriticalErrorBoundaryProps,
  State
> {
  constructor(props: CriticalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Critical error logging
    console.error('CriticalErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-destructive/20 via-destructive/10 to-transparent">
          <div className="max-w-md w-full text-center space-y-6 rounded-lg border border-destructive bg-card p-8 shadow-healthcare-lg backdrop-blur-sm">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-destructive">Erro Crítico</h1>
              <h2 className="text-xl font-semibold text-foreground">{this.props.title}</h2>
            </div>
            
            <p className="text-muted-foreground">
              Um erro crítico ocorreu nesta seção. Recarregue a página para tentar novamente.
            </p>

            <button 
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-md bg-destructive text-destructive-foreground px-6 py-3 text-sm font-medium shadow-healthcare-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive/20 transition-all duration-200"
            >
              Recarregar página
            </button>

            {this.state.error && (
              <details className="mt-8 w-full text-left">
                <summary className="cursor-pointer text-muted-foreground text-sm font-medium hover:text-foreground">Detalhes do erro</summary>
                <pre className="mt-2 p-4 bg-muted/50 border border-border rounded-md text-xs overflow-auto whitespace-pre-wrap text-foreground">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para facilitar o uso
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

export default ErrorBoundary;
