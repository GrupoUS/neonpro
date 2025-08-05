"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

// =====================================================================================
// ERROR BOUNDARY COMPONENT
// Catches JavaScript errors anywhere in the child component tree
// =====================================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (e.g., Sentry)
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-6 w-6 mr-2" />
                Oops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para
                  resolver o problema.
                </AlertDescription>
              </Alert>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Detalhes do Erro (Desenvolvimento):</h4>
                  <pre className="text-sm text-red-600 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Stack Trace</summary>
                      <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// =====================================================================================
// HOOK-BASED ERROR BOUNDARY (for functional components)
// =====================================================================================

export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error("Error caught by useErrorHandler:", error, errorInfo);

    // Report to error tracking service
    // reportError(error, errorInfo);

    // You could also trigger a toast notification here
    // toast.error('Ocorreu um erro inesperado');
  };
}

// =====================================================================================
// SPECIALIZED ERROR BOUNDARIES
// =====================================================================================

// Dashboard Error Boundary
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro no dashboard. Recarregue a página ou tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error("Dashboard Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Form Error Boundary
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro no formulário. Verifique os dados e tente novamente.
          </AlertDescription>
        </Alert>
      }
      onError={(error, errorInfo) => {
        console.error("Form Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// API Error Boundary
export function APIErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro de conexão. Verifique sua internet e tente novamente.
          </AlertDescription>
        </Alert>
      }
      onError={(error, errorInfo) => {
        console.error("API Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
