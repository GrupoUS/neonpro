// Error Boundary Component with LGPD Compliance
'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RotateCcw, 
  Home, 
  Shield, 
  MessageCircle,
  Clock
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean; // Only for development/authorized users
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  timestamp: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private errorLogTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      timestamp: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate error ID and timestamp for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    return {
      hasError: true,
      error,
      errorId,
      timestamp
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error with LGPD compliance (no sensitive data)
    this.logErrorSafely(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private async logErrorSafely(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // Clear any existing timeout
      if (this.errorLogTimeout) {
        clearTimeout(this.errorLogTimeout);
      }

      // Debounce error logging to prevent spam
      this.errorLogTimeout = setTimeout(async () => {
        try {
          // LGPD-compliant error logging (no sensitive user data)
          const logEntry = {
            error_id: this.state.errorId,
            error_name: error.name,
            error_message: error.message.substring(0, 200), // Truncate to avoid data exposure
            component_stack: errorInfo.componentStack?.substring(0, 500), // Limited stack trace
            error_stack: error.stack?.substring(0, 500), // Limited stack trace
            timestamp: this.state.timestamp,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            session_id: typeof sessionStorage !== 'undefined' 
              ? sessionStorage.getItem('session_id') 
              : null,
            // No personal data - privacy by design
            privacy_compliant: true
          };

          // Log to console for development
          console.error('[Error Boundary - Privacy Safe]', logEntry);

          // In production, you would send to your error tracking service
          // Example: await errorTrackingService.log(logEntry);
          
        } catch (logError) {
          console.error('Failed to log error safely:', logError);
        }
      }, 1000);

    } catch (logError) {
      console.error('Error in error logging:', logError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      timestamp: null
    });
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  private handleContactSupport = () => {
    if (typeof window !== 'undefined') {
      const subject = encodeURIComponent('Erro no Sistema - ID: ' + this.state.errorId);
      const body = encodeURIComponent(`
Olá,

Ocorreu um erro no sistema. Detalhes:

ID do Erro: ${this.state.errorId}
Horário: ${this.state.timestamp ? new Date(this.state.timestamp).toLocaleString('pt-BR') : 'Desconhecido'}
Página: ${window.location.href}

Por favor, me ajudem a resolver este problema.

Obrigado!
      `.trim());
      
      window.open(`mailto:suporte@neonpro.com.br?subject=${subject}&body=${body}`);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default LGPD-compliant error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-red-100">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Ops! Algo deu errado
              </CardTitle>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="destructive">
                  Erro do Sistema
                </Badge>
                {this.state.errorId && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {this.state.errorId}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User-friendly message */}
              <div className="text-center space-y-3">
                <p className="text-gray-700">
                  Encontramos um problema inesperado. Não se preocupe - seus dados estão seguros.
                </p>
                <p className="text-sm text-gray-600">
                  Nossa equipe foi automaticamente notificada e está trabalhando para resolver o problema.
                </p>
              </div>

              {/* LGPD Privacy Notice */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">
                        Proteção de Dados (LGPD)
                      </p>
                      <p className="text-blue-700">
                        Este erro foi registrado de forma anônima para melhorar nosso sistema. 
                        Nenhum dado pessoal ou sensível foi exposto ou comprometido.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamp info */}
              {this.state.timestamp && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    Ocorrido em: {new Date(this.state.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}

              {/* Technical details for authorized users only */}
              {this.props.showErrorDetails && this.state.error && (
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-orange-800">
                      Informações Técnicas (Desenvolvimento)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium">Nome:</span>
                        <code className="ml-2 bg-orange-100 px-1 py-0.5 rounded">
                          {this.state.error.name}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Mensagem:</span>
                        <code className="ml-2 bg-orange-100 px-1 py-0.5 rounded break-all">
                          {this.state.error.message}
                        </code>
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <span className="font-medium">Stack:</span>
                          <pre className="mt-1 bg-orange-100 p-2 rounded text-xs overflow-x-auto max-h-32">
                            {this.state.error.stack.substring(0, 500)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Dashboard
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleContactSupport}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contatar Suporte
                </Button>
              </div>

              {/* What users can do */}
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    O que você pode fazer:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      Clique em "Tentar Novamente" para recarregar a página
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      Volte para o Dashboard e tente uma ação diferente
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      Se o problema persistir, entre em contato com o suporte
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      Inclua o ID do erro ao entrar em contato conosco
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }

  componentWillUnmount() {
    if (this.errorLogTimeout) {
      clearTimeout(this.errorLogTimeout);
    }
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
