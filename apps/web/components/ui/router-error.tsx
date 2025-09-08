/**
 * ❌ Router Error Component - NeonPro Healthcare
 * ============================================
 *
 * Global error boundary for routing errors
 * with recovery options and error reporting.
 */

'use client'

import { Alert, AlertDescription, AlertTitle, } from '@/components/ui/alert'
import { Button, } from '@/components/ui/button'
import { Link, } from '@tanstack/react-router'
import { AlertTriangle, Home, RefreshCw, } from 'lucide-react'

interface RouterErrorProps {
  error: Error
  reset?: () => void
}

export function RouterError({ error, reset, }: RouterErrorProps,) {
  const handleRefresh = () => {
    if (reset) {
      reset()
    } else {
      window.location.reload()
    }
  }

  const handleReportError = () => {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-bold text-2xl">Erro de Navegação</h1>
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado durante a navegação.
          </p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Detalhes do Erro</AlertTitle>
          <AlertDescription className="mt-2">
            <code className="block rounded bg-muted p-2 text-sm">
              {error.message}
            </code>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={handleRefresh} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>

          <Button asChild variant="outline">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
        </div>

        <div className="border-t pt-4">
          <p className="mb-2 text-muted-foreground text-sm">
            Se o problema persistir, entre em contato com o suporte.
          </p>
          <Button
            className="text-xs"
            onClick={handleReportError}
            size="sm"
            variant="ghost"
          >
            Reportar Erro
          </Button>
        </div>
      </div>
    </div>
  )
}
