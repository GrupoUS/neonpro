/**
 * ❌ Router Error Component - NeonPro Healthcare
 * ============================================
 * 
 * Global error boundary for routing errors
 * with recovery options and error reporting.
 */

'use client';

import React from 'react';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RouterErrorProps {
  error: Error;
  reset?: () => void;
}

export function RouterError({ error, reset }: RouterErrorProps) {
  const handleRefresh = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  const handleReportError = () => {
    // Log error for monitoring (implement based on your error tracking service)
    console.error('Router Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
    
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Erro de Navegação</h1>
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado durante a navegação.
          </p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Detalhes do Erro</AlertTitle>
          <AlertDescription className="mt-2">
            <code className="text-sm bg-muted p-2 rounded block">
              {error.message}
            </code>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRefresh} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
          
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            Se o problema persistir, entre em contato com o suporte.
          </p>
          <Button 
            onClick={handleReportError}
            variant="ghost" 
            size="sm"
            className="text-xs"
          >
            Reportar Erro
          </Button>
        </div>
      </div>
    </div>
  );
}