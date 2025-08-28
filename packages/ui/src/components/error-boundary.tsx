import type React from "react";
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

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
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-destructive/30 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent p-8 shadow-healthcare-md backdrop-blur-sm">
          <h2 className="mb-4 font-bold text-2xl text-destructive">
            Oops! Algo deu errado
          </h2>
          <p className="mb-6 max-w-md text-center text-muted-foreground">
            Um erro inesperado aconteceu. Nossa equipe foi notificada.
          </p>

          <button
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground text-sm shadow-healthcare-sm transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
            onClick={this.handleRetry}
          >
            Tentar novamente
          </button>

          {this.props.showDetails && this.state.error && (
            <details className="mt-6 w-full max-w-2xl">
              <summary className="cursor-pointer font-medium text-muted-foreground text-sm hover:text-foreground">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-4 text-foreground text-xs">
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
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-destructive/20 via-destructive/10 to-transparent p-8">
          <div className="w-full max-w-md space-y-6 rounded-lg border border-destructive bg-card p-8 text-center shadow-healthcare-lg backdrop-blur-sm">
            <div className="space-y-2">
              <h1 className="font-bold text-3xl text-destructive">
                Erro Crítico
              </h1>
              <h2 className="font-semibold text-foreground text-xl">
                {this.props.title}
              </h2>
            </div>

            <p className="text-muted-foreground">
              Um erro crítico ocorreu nesta seção. Recarregue a página para
              tentar novamente.
            </p>

            <button
              className="inline-flex items-center justify-center rounded-md bg-destructive px-6 py-3 font-medium text-destructive-foreground text-sm shadow-healthcare-md transition-all duration-200 hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive/20"
              onClick={this.handleReload}
            >
              Recarregar página
            </button>

            {this.state.error && (
              <details className="mt-8 w-full text-left">
                <summary className="cursor-pointer font-medium text-muted-foreground text-sm hover:text-foreground">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-4 text-foreground text-xs">
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
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ErrorBoundary;
