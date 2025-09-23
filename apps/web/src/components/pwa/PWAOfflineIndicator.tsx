import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePWA } from "@/hooks/usePWA";
import { 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Smartphone,
  Bell,
  X,
  Trash2
} from "lucide-react";

export interface PWAOfflineIndicatorProps {
  className?: string;
}

export const PWAOfflineIndicator: React.FC<PWAOfflineIndicatorProps> = ({ className }) => {
  const {
    isOnline,
    isInstalled,
    hasOfflineData,
    offlineDataCount,
    syncStatus,
    lastSyncTime,
    syncOfflineData,
    clearAllData,
    requestNotificationPermission,
    notificationPermission
  } = usePWA();

  const [expanded, setExpanded] = React.useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = React.useState(false);

  React.useEffect(() => {
    // Show notification permission prompt if not granted
    if (notificationPermission === 'default' && isOnline) {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [notificationPermission, isOnline]);

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      setShowNotificationPrompt(false);
    }
  };

  const handleClearData = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados offline? Esta ação não pode ser desfeita.')) {
      await clearAllData();
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes} min atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;
    return `${Math.floor(minutes / 1440)}d atrás`;
  };

  if (isOnline && !hasOfflineData && !showNotificationPrompt) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <CardTitle className="text-sm">
                {isOnline ? "Conectado" : "Modo Offline"}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {isInstalled && (
                <Smartphone className="h-4 w-4 text-blue-500" />
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <X className="h-4 w-4" /> : <Database className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Notification Permission Prompt */}
          {showNotificationPrompt && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900">
                    Ativar notificações
                  </h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Receba lembretes de consultas e atualizações importantes
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      size="sm"
                      onClick={handleEnableNotifications}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Ativar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNotificationPrompt(false)}
                    >
                      Agora não
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Offline Data Status */}
          {hasOfflineData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">
                    Dados Offline
                  </span>
                </div>
                <Badge variant="secondary">
                  {offlineDataCount} item(s)
                </Badge>
              </div>

              {expanded && (
                <div className="space-y-3">
                  {/* Sync Status */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700">
                        Status da Sincronização
                      </span>
                      {syncStatus === 'syncing' ? (
                        <Badge variant="secondary">
                          <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                          Sincronizando
                        </Badge>
                      ) : syncStatus === 'error' ? (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Erro
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aguardando
                        </Badge>
                      )}
                    </div>
                    
                    {lastSyncTime && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Última sincronização: {formatTime(lastSyncTime)}
                      </div>
                    )}
                  </div>

                  {/* Data Types Breakdown */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-700">
                      Tipos de dados aguardando sincronização:
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-purple-50 rounded text-xs">
                        <span className="font-medium">Consultas</span>
                        <div className="text-gray-600">
                          {Math.floor(offlineDataCount * 0.3)} item(s)
                        </div>
                      </div>
                      <div className="p-2 bg-green-50 rounded text-xs">
                        <span className="font-medium">Pacientes</span>
                        <div className="text-gray-600">
                          {Math.floor(offlineDataCount * 0.2)} item(s)
                        </div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded text-xs">
                        <span className="font-medium">Estoque</span>
                        <div className="text-gray-600">
                          {Math.floor(offlineDataCount * 0.4)} item(s)
                        </div>
                      </div>
                      <div className="p-2 bg-orange-50 rounded text-xs">
                        <span className="font-medium">Outros</span>
                        <div className="text-gray-600">
                          {Math.floor(offlineDataCount * 0.1)} item(s)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {isOnline && (
                      <Button
                        size="sm"
                        onClick={syncOfflineData}
                        disabled={syncStatus === 'syncing'}
                        className="flex-1"
                      >
                        {syncStatus === 'syncing' ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Sincronizar Agora
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleClearData}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Warning Message */}
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-xs text-yellow-800">
                        <strong>Atenção:</strong> Limpar os dados offline irá remover permanentemente 
                        todas as alterações não sincronizadas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Offline Mode Info */}
          {!isOnline && !hasOfflineData && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <WifiOff className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Modo Offline Ativado
                  </h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Você pode continuar usando o sistema. Todas as alterações 
                    serão salvas localmente e sincronizadas quando voltar a ficar online.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAOfflineIndicator;