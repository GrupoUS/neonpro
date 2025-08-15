// NeonPro - Offline Page
// VIBECODE V1.0 - Healthcare PWA Pattern
// Purpose: Fallback page when user is offline

import { CheckCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Offline - NeonPro',
  description: 'You are currently offline. Some features may be limited.',
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl">Você está offline</CardTitle>
            <CardDescription className="mt-2">
              Sem conexão com a internet. Algumas funcionalidades podem estar
              limitadas.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Offline Features Available */}
          <div className="space-y-3">
            <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
              Disponível offline
            </h4>

            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Ver agendamentos salvos</span>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Acessar perfil do paciente</span>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Navegar no portal</span>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
              Status de sincronização
            </h4>

            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Aguardando conexão</p>
                <p className="text-muted-foreground text-xs">
                  Suas ações serão sincronizadas automaticamente
                </p>
              </div>
              <Badge variant="secondary">0 pendentes</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => window.location.reload()}
              size="lg"
            >
              <Wifi className="mr-2 h-4 w-4" />
              Tentar reconectar
            </Button>

            <Button
              className="w-full"
              onClick={() => window.history.back()}
              size="lg"
              variant="outline"
            >
              Voltar à página anterior
            </Button>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-muted-foreground text-xs">
              Suas ações serão salvas localmente e sincronizadas quando a
              conexão for restaurada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
