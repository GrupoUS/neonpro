// NeonPro - Offline Status Indicator Component
// VIBECODE V1.0 - Healthcare PWA Excellence Standards
// Purpose: Visual indicators for network status and sync queue

"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { useNetworkStatus } from "@/hooks/useNetworkStatus";
import type { cn } from "@/lib/utils";
import type {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Loader2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import type { useEffect, useState } from "react";

interface OfflineStatusProps {
  className?: string;
  variant?: "minimal" | "badge" | "banner" | "toast";
  showSyncQueue?: boolean;
}

export function OfflineStatus({
  className,
  variant = "badge",
  showSyncQueue = true,
}: OfflineStatusProps) {
  const { isOnline, isOffline, syncQueueCount, isSyncing, processSyncQueue, clearSyncQueue } =
    useNetworkStatus();

  const [showToast, setShowToast] = useState(false);
  const [lastStatus, setLastStatus] = useState<boolean>(true);

  // Show toast when status changes
  useEffect(() => {
    if (lastStatus !== isOnline) {
      setShowToast(true);
      setLastStatus(isOnline);

      // Auto hide toast after 5 seconds
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, lastStatus]);

  // Minimal variant - small icon only
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-600" />
        )}
        {syncQueueCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {syncQueueCount}
          </Badge>
        )}
      </div>
    );
  }

  // Badge variant - compact status
  if (variant === "badge") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              Offline
            </>
          )}
        </Badge>

        {showSyncQueue && syncQueueCount > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            {isSyncing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Sincronizando
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3" />
                {syncQueueCount} pendentes
              </>
            )}
          </Badge>
        )}
      </div>
    );
  }

  // Banner variant - full width notification
  if (variant === "banner") {
    if (isOnline && syncQueueCount === 0) return null;

    return (
      <div
        className={cn(
          "w-full p-3 border-b flex items-center justify-between",
          isOffline ? "bg-destructive/10 border-destructive/20" : "bg-blue-50 border-blue-200",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          {isOffline ? (
            <WifiOff className="w-4 h-4 text-destructive" />
          ) : (
            <Cloud className="w-4 h-4 text-blue-600" />
          )}

          <div>
            {isOffline ? (
              <>
                <p className="font-medium text-destructive">Você está offline</p>
                <p className="text-sm text-destructive/80">
                  Suas ações serão sincronizadas quando a conexão for restaurada
                </p>
              </>
            ) : syncQueueCount > 0 ? (
              <>
                <p className="font-medium text-blue-900">Sincronizando dados</p>
                <p className="text-sm text-blue-700">
                  {isSyncing ? "Enviando..." : `${syncQueueCount} ações pendentes`}
                </p>
              </>
            ) : null}
          </div>
        </div>

        {syncQueueCount > 0 && (
          <div className="flex items-center gap-2">
            {!isSyncing && isOnline && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => processSyncQueue()}
                className="text-xs"
              >
                Sincronizar agora
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => clearSyncQueue()}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Toast variant - floating notification
  if (variant === "toast" && showToast) {
    return (
      <div
        className={cn(
          "fixed top-4 right-4 z-50 transition-all duration-300",
          showToast ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
          className,
        )}
      >
        <Card className="w-80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {isOnline ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Conexão restaurada
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Conexão perdida
                  </>
                )}
              </CardTitle>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowToast(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <CardDescription>
              {isOnline
                ? syncQueueCount > 0
                  ? `Sincronizando ${syncQueueCount} ações pendentes...`
                  : "Todas as funcionalidades estão disponíveis."
                : "Algumas funcionalidades podem estar limitadas."}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

// Sync Queue Details Component
export function SyncQueueDetails({ className }: { className?: string }) {
  const { syncQueue, isSyncing, processSyncQueue, clearSyncQueue } = useNetworkStatus();

  if (syncQueue.length === 0) {
    return (
      <div className={cn("text-center p-4", className)}>
        <CloudOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma ação pendente</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium">Ações pendentes ({syncQueue.length})</h4>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => processSyncQueue()}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Sincronizando...
              </>
            ) : (
              "Sincronizar"
            )}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => clearSyncQueue()}
            disabled={isSyncing}
          >
            Limpar
          </Button>
        </div>
      </div>

      {syncQueue.map((item, index) => (
        <div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg">
          <Badge variant="outline" className="text-xs">
            {item.method}
          </Badge>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.url}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.timestamp).toLocaleString("pt-BR")}
              {item.retryCount > 0 && ` • ${item.retryCount} tentativas`}
            </p>
          </div>

          {item.retryCount > 0 && <AlertCircle className="w-4 h-4 text-amber-500" />}
        </div>
      ))}
    </div>
  );
}
