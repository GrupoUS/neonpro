// NeonPro - Offline Page
// VIBECODE V1.0 - Healthcare PWA Pattern
// Purpose: Fallback page when user is offline

"use client";

import type { CheckCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl">Você está offline</CardTitle>
            <CardDescription className="mt-2">
              Sem conexão com a internet. Algumas funcionalidades podem estar limitadas.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Offline Features Available */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Disponível offline
            </h4>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Ver agendamentos salvos</span>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Acessar perfil do paciente</span>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Navegar no portal</span>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Status de sincronização
            </h4>

            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Aguardando conexão</p>
                <p className="text-xs text-muted-foreground">
                  Suas ações serão sincronizadas automaticamente
                </p>
              </div>
              <Badge variant="secondary">0 pendentes</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full" size="lg">
              <Wifi className="w-4 h-4 mr-2" />
              Tentar reconectar
            </Button>

            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Voltar à página anterior
            </Button>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Suas ações serão salvas localmente e sincronizadas quando a conexão for restaurada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
