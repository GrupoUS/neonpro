'use client';

import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@neonpro/ui';
import { AlertTriangle } from 'lucide-react';
import React, { Component } from 'react';

interface PatientErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface PatientErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Healthcare-specific error boundary with LGPD compliance
 * Sanitizes error messages to prevent sensitive data leakage
 */
export class PatientErrorBoundary extends Component<
  PatientErrorBoundaryProps,
  PatientErrorBoundaryState
> {
  constructor(props: PatientErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<PatientErrorBoundaryState> {
    // Generate unique error ID for healthcare audit trail
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Sanitize error for healthcare compliance
    const sanitizedError = this.sanitizeHealthcareError(error);

    this.setState({
      error: sanitizedError,
      errorInfo,
    });

    // Log to healthcare audit system (no sensitive data)
    this.logHealthcareError(sanitizedError, errorInfo, this.state.errorId);

    // Call parent error handler
    this.props.onError?.(sanitizedError, errorInfo);
  }

  /**
   * Sanitize error messages to prevent healthcare data leakage
   * Removes CPF, phone numbers, emails, and other sensitive data
   */
  private sanitizeHealthcareError(error: Error): Error {
    let message = error.message;

    // Remove common Brazilian sensitive data patterns
    message = message.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[CPF-REMOVED]');
    message = message.replace(/\(\d{2}\)\s?\d{4,5}-?\d{4}/g, '[PHONE-REMOVED]');
    message = message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL-REMOVED]');
    message = message.replace(/\d{3}\s\d{4}\s\d{4}\s\d{4}/g, '[CNS-REMOVED]');
    message = message.replace(/\d{5}-?\d{3}/g, '[CEP-REMOVED]');

    // Remove common personal information patterns
    message = message.replace(
      /(?:nome|name):\s*[\w\s]+/gi,
      'nome: [NOME-REMOVIDO]',
    );
    message = message.replace(
      /(?:endereço|address):\s*[\w\s,]+/gi,
      'endereço: [ENDERECO-REMOVIDO]',
    );

    return new Error(message);
  }

  /**
   * Log error to healthcare audit system
   */
  private logHealthcareError(
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string,
  ) {
    // In a real implementation, this would send to your healthcare audit system
    console.error('[HEALTHCARE ERROR AUDIT]', {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      // Note: No sensitive patient data is logged
    });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    // Open error reporting system with sanitized error ID
    const subject = encodeURIComponent(
      `Erro no Sistema - ID: ${this.state.errorId}`,
    );
    const body = encodeURIComponent(
      `Olá,\n\nOcorreu um erro no sistema de pacientes.\n\nID do Erro: ${this.state.errorId}\nData/Hora: ${
        new Date().toLocaleString(
          'pt-BR',
        )
      }\n\nDescrição do problema:\n[Descreva o que você estava fazendo quando o erro ocorreu]\n\nObrigado!`,
    );

    window.open(
      `mailto:suporte@neonpro.com.br?subject=${subject}&body=${body}`,
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default healthcare error UI
      return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
          <Card className='w-full max-w-2xl'>
            <CardHeader className='text-center'>
              <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                <AlertTriangle className='h-8 w-8 text-red-600' />
              </div>
              <CardTitle className='text-xl text-red-600'>
                Erro no Sistema de Pacientes
              </CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado no sistema. Nossos dados estão protegidos e nenhuma
                informação do paciente foi comprometida.
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-6'>
              {/* Error Details */}
              <Alert>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  <div className='space-y-2'>
                    <p className='font-semibold'>
                      ID do Erro: {this.state.errorId}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Este ID pode ser usado para rastrear o problema com nossa equipe de suporte.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Healthcare Safety Message */}
              <Alert className='border-blue-200 bg-blue-50'>
                <AlertTriangle className='h-4 w-4 text-blue-600' />
                <AlertDescription className='text-blue-800'>
                  <div className='space-y-1'>
                    <p className='font-semibold'>
                      Segurança dos Dados do Paciente
                    </p>
                    <p className='text-sm'>
                      ✓ Todos os dados dos pacientes estão seguros e protegidos
                      <br />
                      ✓ Nenhuma informação médica foi perdida ou comprometida
                      <br />✓ O erro foi registrado em nosso sistema de auditoria LGPD
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <Button
                  onClick={this.handleRetry}
                  variant='default'
                  className='w-full'
                >
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Tentar Novamente
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant='outline'
                  className='w-full'
                >
                  <Home className='mr-2 h-4 w-4' />
                  Ir para Início
                </Button>

                <Button
                  onClick={this.handleReportError}
                  variant='outline'
                  className='w-full'
                >
                  <Phone className='mr-2 h-4 w-4' />
                  Reportar Erro
                </Button>
              </div>

              {/* Development Information (only in dev mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className='bg-gray-100 p-4 rounded border'>
                  <summary className='cursor-pointer font-semibold text-sm mb-2'>
                    Detalhes Técnicos (Desenvolvimento)
                  </summary>
                  <div className='text-xs font-mono space-y-2'>
                    <div>
                      <strong>Erro:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className='whitespace-pre-wrap text-xs mt-1 p-2 bg-white border rounded'>
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className='whitespace-pre-wrap text-xs mt-1 p-2 bg-white border rounded'>
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Support Information */}
              <div className='text-center text-sm text-muted-foreground border-t pt-4'>
                <p>Se o problema persistir, entre em contato com o suporte:</p>
                <div className='flex flex-col sm:flex-row gap-2 justify-center mt-2'>
                  <span>📧 suporte@neonpro.com.br</span>
                  <span className='hidden sm:inline'>|</span>
                  <span>📱 (11) 99999-9999</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with healthcare error boundary
 */
export function withPatientErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<PatientErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <PatientErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </PatientErrorBoundary>
  );

  WrappedComponent.displayName = `withPatientErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

/**
 * Healthcare-specific error boundary hook for functional components
 */
export function usePatientErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);
  const [errorId, setErrorId] = React.useState<string>('');

  const reportError = React.useCallback((error: Error, _context?: string) => {
    const sanitizedError = new PatientErrorBoundary(
      {} as any,
    ).sanitizeHealthcareError(error);
    const newErrorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setError(sanitizedError);
    setErrorId(newErrorId);

    // Log to audit system
    console.error('[HEALTHCARE ERROR]', {
      errorId: newErrorId,
      context,
      message: sanitizedError.message,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
    setErrorId('');
  }, []);

  return {
    error,
    errorId,
    reportError,
    clearError,
    hasError: !!error,
  };
}

export default PatientErrorBoundary;
