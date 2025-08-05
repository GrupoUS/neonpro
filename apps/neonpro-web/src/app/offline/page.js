// NeonPro - Offline Page
// VIBECODE V1.0 - Healthcare PWA Pattern
// Purpose: Fallback page when user is offline
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OfflinePage;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
      <card_1.Card className="w-full max-w-md mx-auto">
        <card_1.CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <lucide_react_1.WifiOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <card_1.CardTitle className="text-xl">Você está offline</card_1.CardTitle>
            <card_1.CardDescription className="mt-2">
              Sem conexão com a internet. Algumas funcionalidades podem estar limitadas.
            </card_1.CardDescription>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent className="space-y-6">
          {/* Offline Features Available */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Disponível offline
            </h4>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <lucide_react_1.CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Ver agendamentos salvos</span>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <lucide_react_1.CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Acessar perfil do paciente</span>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <lucide_react_1.CheckCircle className="w-4 h-4 text-green-600" />
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
              <lucide_react_1.Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Aguardando conexão</p>
                <p className="text-xs text-muted-foreground">
                  Suas ações serão sincronizadas automaticamente
                </p>
              </div>
              <badge_1.Badge variant="secondary">0 pendentes</badge_1.Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button_1.Button
              onClick={function () {
                return window.location.reload();
              }}
              className="w-full"
              size="lg"
            >
              <lucide_react_1.Wifi className="w-4 h-4 mr-2" />
              Tentar reconectar
            </button_1.Button>

            <button_1.Button
              onClick={function () {
                return window.history.back();
              }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Voltar à página anterior
            </button_1.Button>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Suas ações serão salvas localmente e sincronizadas quando a conexão for restaurada.
            </p>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
