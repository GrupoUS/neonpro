"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Cloud,
  CloudOff,
  Database,
  Download,
  RefreshCw,
  Upload,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Types para offline sync
interface PatientCacheEntry {
  id: string;
  data: Record<string, unknown>;
  lastAccessed: Date;
  lastModified: Date;
  priority: "critical" | "high" | "normal" | "low";
  size: number;
}

interface SyncAction {
  id: string;
  type: "create" | "update" | "delete";
  entity: "patient" | "appointment" | "vital_signs" | "notes";
  entityId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
  priority: "critical" | "high" | "normal";
}

interface SyncStats {
  cacheSize: number;
  maxCacheSize: number;
  patientsCount: number;
  maxPatients: number;
  pendingActions: number;
  lastSyncTime?: Date;
  networkStatus: "online" | "offline" | "limited";
  syncInProgress: boolean;
}

// Hook para gerenciar offline sync
const useOfflineSyncManager = () => {
  const [syncStats, setSyncStats] = useState<SyncStats>({
    cacheSize: 0,
    maxCacheSize: 50 * 1024 * 1024, // 50MB max
    patientsCount: 0,
    maxPatients: 200,
    pendingActions: 0,
    networkStatus: "online",
    syncInProgress: false,
  });

  const [patientCache, setPatientCache] = useState<PatientCacheEntry[]>([]);
  const [actionQueue, setActionQueue] = useState<SyncAction[]>([]);

  // Processing lock to prevent concurrent sync operations
  const processingLock = useRef(false);

  // Network status detection
  useEffect(() => {
    const updateNetworkStatus = () => {
      const status = navigator.onLine ? "online" : "offline";
      setSyncStats(prev => ({ ...prev, networkStatus: status }));
    };

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);
    updateNetworkStatus();

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);

  // Simulate IndexedDB operations
  const initializeCache = useCallback(async () => {
    try {
      // Simulate loading 200 emergency patients
      const mockPatients: PatientCacheEntry[] = Array.from({ length: 200 }, (_, i) => ({
        id: `P${String(i + 1).padStart(3, "0")}`,
        data: {
          name: `Paciente ${i + 1}`,
          cpf: `${String(i + 1).padStart(3, "0")}.000.000-0${(i % 10)}`,
          bloodType: ["A+", "B+", "AB+", "O+"][i % 4],
          allergies: i % 3 === 0 ? ["Penicilina"] : [],
          emergencyContact: `(11) 9999${String(i).padStart(4, "0")}`,
          lastVitals: {
            heartRate: 60 + (i % 40),
            bloodPressure: `${120 + (i % 30)}/${80 + (i % 20)}`,
            temperature: 36 + (i % 20) / 10,
          },
        },
        lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        priority: i < 50 ? "critical" : i < 100 ? "high" : "normal" as any,
        size: 2048 + Math.floor(Math.random() * 1024), // ~2-3KB per patient
      }));

      setPatientCache(mockPatients);

      // Update stats
      const totalSize = mockPatients.reduce((sum, p) => sum + p.size, 0);
      setSyncStats(prev => ({
        ...prev,
        patientsCount: mockPatients.length,
        cacheSize: totalSize,
      }));

      console.log(
        `Emergency cache initialized: ${mockPatients.length} patients, ${
          (totalSize / 1024).toFixed(1)
        }KB`,
      );
    } catch (error) {
      console.error("Failed to initialize cache:", error);
    }
  }, []);

  // Queue action for later sync
  const queueAction = useCallback((action: Omit<SyncAction, "id" | "timestamp" | "retryCount">) => {
    const newAction: SyncAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
    };

    setActionQueue(prev => {
      const updated = [...prev, newAction].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, normal: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setSyncStats(prevStats => ({
        ...prevStats,
        pendingActions: updated.length,
      }));

      return updated;
    });

    console.log(`Action queued: ${action.type} ${action.entity} (${action.priority} priority)`);
  }, []);

  // Process sync queue
  const processSyncQueue = useCallback(async () => {
    // Check processing lock first
    if (processingLock.current) {
      return;
    }

    if (syncStats.networkStatus !== "online" || actionQueue.length === 0) {
      return;
    }

    // Set processing lock
    processingLock.current = true;
    setSyncStats(prev => ({ ...prev, syncInProgress: true }));

    try {
      // Process actions in priority order
      const criticalActions = actionQueue.filter(a => a.priority === "critical");
      const highActions = actionQueue.filter(a => a.priority === "high");
      const normalActions = actionQueue.filter(a => a.priority === "normal");

      let processed = 0;
      let failed = 0;

      for (const action of [...criticalActions, ...highActions, ...normalActions]) {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

          // Simulate 95% success rate
          if (Math.random() > 0.05) {
            processed++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      // Remove processed actions
      setActionQueue(prev => {
        const remaining = prev.slice(processed);
        setSyncStats(prevStats => ({
          ...prevStats,
          pendingActions: remaining.length,
          lastSyncTime: new Date(),
        }));
        return remaining;
      });

      console.log(`Sync completed: ${processed} processed, ${failed} failed`);
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      // Clear processing lock and sync status
      processingLock.current = false;
      setSyncStats(prev => ({ ...prev, syncInProgress: false }));
    }
  }, [syncStats.networkStatus, actionQueue]);

  // Auto-sync when coming online
  useEffect(() => {
    if (syncStats.networkStatus === "online" && actionQueue.length > 0) {
      const timeoutId = setTimeout(processSyncQueue, 2000); // 2s delay
      return () => clearTimeout(timeoutId);
    }
  }, [syncStats.networkStatus, actionQueue.length, processSyncQueue]);

  // LRU cache management
  const optimizeCache = useCallback(() => {
    if (patientCache.length <= syncStats.maxPatients) {return;}

    // Sort by priority and last accessed
    const sorted = [...patientCache].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

      if (priorityDiff !== 0) {return priorityDiff;}

      return b.lastAccessed.getTime() - a.lastAccessed.getTime(); // Most recent first
    });

    // Keep top 200 patients
    const optimized = sorted.slice(0, syncStats.maxPatients);
    setPatientCache(optimized);

    const totalSize = optimized.reduce((sum, p) => sum + p.size, 0);
    setSyncStats(prev => ({
      ...prev,
      patientsCount: optimized.length,
      cacheSize: totalSize,
    }));
  }, [patientCache, syncStats.maxPatients]);

  // Initialize on mount
  useEffect(() => {
    initializeCache();
  }, [initializeCache]);

  return {
    syncStats,
    patientCache,
    actionQueue,
    queueAction,
    processSyncQueue,
    optimizeCache,
  };
};

interface OfflineSyncManagerProps {
  className?: string;
  emergencyMode?: boolean;
}

export function OfflineSyncManager({ className, emergencyMode = false }: OfflineSyncManagerProps) {
  const {
    syncStats,
    patientCache,
    actionQueue,
    queueAction,
    processSyncQueue,
    optimizeCache,
  } = useOfflineSyncManager();

  const cacheUsagePercent = (syncStats.cacheSize / syncStats.maxCacheSize) * 100;
  const patientsPercent = (syncStats.patientsCount / syncStats.maxPatients) * 100;

  const getNetworkStatusColor = () => {
    switch (syncStats.networkStatus) {
      case "online":
        return "text-green-600";
      case "offline":
        return "text-red-600";
      case "limited":
        return "text-amber-600";
      default:
        return "text-gray-600";
    }
  };

  const getNetworkIcon = () => {
    switch (syncStats.networkStatus) {
      case "online":
        return <Wifi className="h-5 w-5" />;
      case "offline":
        return <WifiOff className="h-5 w-5" />;
      default:
        return <Cloud className="h-5 w-5" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) {return "0 B";}
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Card
      className={cn(
        "w-full max-w-md",
        emergencyMode && "border-2 border-blue-500",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "pb-4",
          emergencyMode && "bg-blue-50",
        )}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Cache Emergencial
          </div>

          <div
            className={cn(
              "flex items-center gap-2",
              getNetworkStatusColor(),
            )}
          >
            {getNetworkIcon()}
            <Badge variant={syncStats.networkStatus === "online" ? "default" : "destructive"}>
              {syncStats.networkStatus === "online" ? "ONLINE" : "OFFLINE"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cache status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pacientes
            </span>
            <span className="font-medium">
              {syncStats.patientsCount}/{syncStats.maxPatients}
            </span>
          </div>
          <Progress
            value={patientsPercent}
            className={cn(
              "h-2",
              patientsPercent > 90 && "bg-red-100",
            )}
          />

          <div className="flex items-center justify-between text-sm">
            <span>Armazenamento</span>
            <span className="font-medium">
              {formatBytes(syncStats.cacheSize)}/{formatBytes(syncStats.maxCacheSize)}
            </span>
          </div>
          <Progress
            value={cacheUsagePercent}
            className={cn(
              "h-2",
              cacheUsagePercent > 80 && "bg-amber-100",
            )}
          />
        </div>

        {/* Pending actions */}
        {syncStats.pendingActions > 0 && (
          <div
            className={cn(
              "p-3 rounded-lg border",
              syncStats.networkStatus === "online"
                ? "bg-blue-50 border-blue-200"
                : "bg-amber-50 border-amber-200",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {syncStats.pendingActions} ações pendentes
                </span>
              </div>

              {syncStats.syncInProgress && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>

            {syncStats.networkStatus === "offline" && (
              <p className="text-xs text-amber-700 mt-1">
                Serão sincronizadas quando voltar online
              </p>
            )}
          </div>
        )}

        {/* Last sync time */}
        {syncStats.lastSyncTime && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Última sinc: {syncStats.lastSyncTime.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={processSyncQueue}
            disabled={syncStats.networkStatus !== "online" || syncStats.syncInProgress
              || syncStats.pendingActions === 0}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {syncStats.syncInProgress
              ? <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              : <Upload className="h-4 w-4 mr-2" />}
            Sincronizar
          </Button>

          <Button
            onClick={optimizeCache}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Database className="h-4 w-4 mr-2" />
            Otimizar
          </Button>
        </div>

        {/* Emergency mode indicators */}
        {emergencyMode && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Modo Emergencial Ativo
              </span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Cache priorizado para dados críticos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OfflineSyncManager;
