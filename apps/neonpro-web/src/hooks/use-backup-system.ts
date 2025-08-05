"use client";

import type { useCallback, useEffect, useState } from "react";
import type { BackupSystem } from "@/lib/backup";
import type {
  BackupAlert,
  BackupConfig,
  BackupMetrics,
  BackupRecord,
  BackupStatus,
  BackupType,
  RecoveryRequest,
  RecoveryStatus,
  StorageProvider,
} from "@/lib/backup/types";
import type { createClient } from "@/lib/supabase/client";

// Types for the hook
interface BackupSystemState {
  // System status
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Configurations
  configs: BackupConfig[];
  activeConfigs: BackupConfig[];

  // Backup records
  backups: BackupRecord[];
  recentBackups: BackupRecord[];

  // Recovery requests
  recoveries: RecoveryRequest[];
  activeRecoveries: RecoveryRequest[];

  // Metrics and monitoring
  metrics: BackupMetrics | null;
  alerts: BackupAlert[];

  // System health
  systemHealth: {
    overall: "healthy" | "warning" | "critical";
    storage: "healthy" | "warning" | "critical";
    scheduler: "healthy" | "warning" | "critical";
    lastCheck: Date | null;
  };
}

interface BackupSystemActions {
  // System management
  initializeSystem: () => Promise<void>;
  shutdownSystem: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Configuration management
  createConfig: (
    config: Omit<BackupConfig, "id" | "created_at" | "updated_at">,
  ) => Promise<BackupConfig>;
  updateConfig: (id: string, updates: Partial<BackupConfig>) => Promise<BackupConfig>;
  deleteConfig: (id: string) => Promise<void>;
  toggleConfig: (id: string, enabled: boolean) => Promise<void>;

  // Backup operations
  runManualBackup: (configId: string) => Promise<BackupRecord>;
  runQuickBackup: (type: BackupType, source: string) => Promise<BackupRecord>;
  cancelBackup: (backupId: string) => Promise<void>;

  // Recovery operations
  createRecovery: (
    request: Omit<RecoveryRequest, "id" | "created_at" | "updated_at">,
  ) => Promise<RecoveryRequest>;
  cancelRecovery: (recoveryId: string) => Promise<void>;

  // Monitoring
  acknowledgeAlert: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;

  // Testing
  testStorageConnection: (provider: StorageProvider, config: any) => Promise<boolean>;
  validateBackup: (backupId: string) => Promise<boolean>;
}

type UseBackupSystemReturn = BackupSystemState & BackupSystemActions;

// Mock data for development
const mockConfigs: BackupConfig[] = [
  {
    id: "1",
    name: "Daily Database Backup",
    description: "Automated daily backup of the main database",
    enabled: true,
    type: "FULL",
    source_type: "DATABASE",
    source_config: {
      database_url: "postgresql://localhost:5432/neonpro",
    },
    schedule_frequency: "DAILY",
    schedule_config: {
      time_of_day: "02:00",
      timezone: "UTC",
    },
    storage_provider: "S3",
    storage_config: {
      s3_bucket: "neonpro-backups",
      s3_region: "us-east-1",
    },
    retention_policy: {
      daily: 7,
      weekly: 4,
      monthly: 3,
      yearly: 1,
    },
    compression_enabled: true,
    compression_level: 6,
    encryption_enabled: true,
    notification_config: {
      on_success: false,
      on_failure: true,
      email_recipients: ["admin@neonpro.com"],
    },
    parallel_uploads: 3,
    chunk_size_mb: 64,
    verify_integrity: true,
    test_restore: false,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Weekly Files Backup",
    description: "Weekly backup of application files and uploads",
    enabled: true,
    type: "INCREMENTAL",
    source_type: "DIRECTORY",
    source_config: {
      directory_path: "/app/uploads",
      exclude_patterns: ["*.tmp", "*.log"],
    },
    schedule_frequency: "WEEKLY",
    schedule_config: {
      time_of_day: "01:00",
      day_of_week: 0,
      timezone: "UTC",
    },
    storage_provider: "LOCAL",
    storage_config: {
      local_path: "/backups/files",
    },
    retention_policy: {
      daily: 0,
      weekly: 8,
      monthly: 6,
      yearly: 2,
    },
    compression_enabled: true,
    compression_level: 4,
    encryption_enabled: false,
    notification_config: {
      on_success: true,
      on_failure: true,
    },
    parallel_uploads: 2,
    chunk_size_mb: 32,
    verify_integrity: true,
    test_restore: true,
    created_at: new Date("2024-01-05"),
    updated_at: new Date("2024-01-10"),
  },
];

const mockBackups: BackupRecord[] = [
  {
    id: "1",
    config_id: "1",
    type: "FULL",
    status: "COMPLETED",
    started_at: new Date("2024-01-15T02:00:00Z"),
    completed_at: new Date("2024-01-15T02:45:00Z"),
    size_bytes: 1024 * 1024 * 1024 * 2.5, // 2.5 GB
    compressed_size_bytes: 1024 * 1024 * 1024 * 0.8, // 800 MB
    file_count: 15420,
    storage_path: "s3://neonpro-backups/2024/01/15/full-backup-20240115-020000.tar.gz",
    checksum: "sha256:abc123...",
    metadata: {
      duration_seconds: 2700,
      compression_ratio: 0.32,
      upload_speed_mbps: 12.5,
    },
    created_at: new Date("2024-01-15T02:00:00Z"),
    updated_at: new Date("2024-01-15T02:45:00Z"),
  },
  {
    id: "2",
    config_id: "1",
    type: "INCREMENTAL",
    status: "COMPLETED",
    started_at: new Date("2024-01-14T02:00:00Z"),
    completed_at: new Date("2024-01-14T02:15:00Z"),
    size_bytes: 1024 * 1024 * 256, // 256 MB
    compressed_size_bytes: 1024 * 1024 * 64, // 64 MB
    file_count: 1250,
    storage_path: "s3://neonpro-backups/2024/01/14/incremental-backup-20240114-020000.tar.gz",
    checksum: "sha256:def456...",
    metadata: {
      duration_seconds: 900,
      compression_ratio: 0.25,
      upload_speed_mbps: 15.2,
    },
    created_at: new Date("2024-01-14T02:00:00Z"),
    updated_at: new Date("2024-01-14T02:15:00Z"),
  },
  {
    id: "3",
    config_id: "2",
    type: "INCREMENTAL",
    status: "RUNNING",
    started_at: new Date(),
    size_bytes: 0,
    file_count: 0,
    progress_percentage: 65,
    current_operation: "Uploading files to storage",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockRecoveries: RecoveryRequest[] = [
  {
    id: "1",
    backup_id: "1",
    type: "FULL",
    status: "COMPLETED",
    target_location: "/restore/2024-01-15",
    requested_by: "admin@neonpro.com",
    started_at: new Date("2024-01-15T10:00:00Z"),
    completed_at: new Date("2024-01-15T10:30:00Z"),
    progress_percentage: 100,
    metadata: {
      restored_files: 15420,
      restored_size_bytes: 1024 * 1024 * 1024 * 2.5,
      duration_seconds: 1800,
    },
    created_at: new Date("2024-01-15T09:55:00Z"),
    updated_at: new Date("2024-01-15T10:30:00Z"),
  },
];

const mockMetrics: BackupMetrics = {
  id: "1",
  date: new Date(),
  total_backups: 156,
  successful_backups: 152,
  failed_backups: 4,
  total_size_bytes: 1024 * 1024 * 1024 * 1024 * 2.8, // 2.8 TB
  compressed_size_bytes: 1024 * 1024 * 1024 * 1024 * 0.9, // 900 GB
  average_duration_seconds: 1800,
  storage_usage_bytes: 1024 * 1024 * 1024 * 1024 * 0.9,
  active_configs: 8,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockAlerts: BackupAlert[] = [
  {
    id: "1",
    type: "BACKUP_FAILED",
    severity: "HIGH",
    title: "Database Backup Failed",
    message: "The daily database backup failed due to connection timeout",
    config_id: "1",
    backup_id: "3",
    acknowledged: false,
    resolved: false,
    metadata: {
      error_code: "TIMEOUT",
      retry_count: 3,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    updated_at: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    type: "STORAGE_WARNING",
    severity: "MEDIUM",
    title: "Storage Space Warning",
    message: "Backup storage is 85% full. Consider cleaning up old backups.",
    acknowledged: false,
    resolved: false,
    metadata: {
      usage_percentage: 85,
      available_space_gb: 150,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

export const useBackupSystem = (): UseBackupSystemReturn => {
  // State
  const [state, setState] = useState<BackupSystemState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    configs: [],
    activeConfigs: [],
    backups: [],
    recentBackups: [],
    recoveries: [],
    activeRecoveries: [],
    metrics: null,
    alerts: [],
    systemHealth: {
      overall: "healthy",
      storage: "healthy",
      scheduler: "healthy",
      lastCheck: null,
    },
  });

  const [backupSystem, setBackupSystem] = useState<BackupSystem | null>(null);
  const supabase = await createClient();

  // Initialize the backup system
  const initializeSystem = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // In a real implementation, this would initialize the actual BackupSystem
      // For now, we'll use mock data
      const system = new BackupSystem();
      await system.initialize();
      setBackupSystem(system);

      // Load initial data
      setState((prev) => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        configs: mockConfigs,
        activeConfigs: mockConfigs.filter((c) => c.enabled),
        backups: mockBackups,
        recentBackups: mockBackups.slice(0, 10),
        recoveries: mockRecoveries,
        activeRecoveries: mockRecoveries.filter((r) => r.status === "RUNNING"),
        metrics: mockMetrics,
        alerts: mockAlerts,
        systemHealth: {
          overall: "healthy",
          storage: "warning", // Based on storage alert
          scheduler: "healthy",
          lastCheck: new Date(),
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to initialize backup system",
      }));
    }
  }, []);

  // Shutdown the backup system
  const shutdownSystem = useCallback(async () => {
    try {
      if (backupSystem) {
        await backupSystem.shutdown();
        setBackupSystem(null);
      }
      setState((prev) => ({ ...prev, isInitialized: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to shutdown backup system",
      }));
    }
  }, [backupSystem]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // In a real implementation, this would fetch from the database
      // For now, we'll simulate a refresh with updated mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({
        ...prev,
        isLoading: false,
        configs: mockConfigs,
        activeConfigs: mockConfigs.filter((c) => c.enabled),
        backups: mockBackups,
        recentBackups: mockBackups.slice(0, 10),
        recoveries: mockRecoveries,
        activeRecoveries: mockRecoveries.filter((r) => r.status === "RUNNING"),
        metrics: mockMetrics,
        alerts: mockAlerts,
        systemHealth: {
          ...prev.systemHealth,
          lastCheck: new Date(),
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to refresh data",
      }));
    }
  }, []);

  // Configuration management
  const createConfig = useCallback(
    async (
      configData: Omit<BackupConfig, "id" | "created_at" | "updated_at">,
    ): Promise<BackupConfig> => {
      try {
        // In a real implementation, this would save to the database
        const newConfig: BackupConfig = {
          ...configData,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date(),
          updated_at: new Date(),
        };

        setState((prev) => ({
          ...prev,
          configs: [...prev.configs, newConfig],
          activeConfigs: newConfig.enabled
            ? [...prev.activeConfigs, newConfig]
            : prev.activeConfigs,
        }));

        return newConfig;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to create config");
      }
    },
    [],
  );

  const updateConfig = useCallback(
    async (id: string, updates: Partial<BackupConfig>): Promise<BackupConfig> => {
      try {
        const updatedConfig = {
          ...state.configs.find((c) => c.id === id)!,
          ...updates,
          updated_at: new Date(),
        };

        setState((prev) => ({
          ...prev,
          configs: prev.configs.map((c) => (c.id === id ? updatedConfig : c)),
          activeConfigs: prev.activeConfigs.map((c) => (c.id === id ? updatedConfig : c)),
        }));

        return updatedConfig;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to update config");
      }
    },
    [state.configs],
  );

  const deleteConfig = useCallback(async (id: string): Promise<void> => {
    try {
      setState((prev) => ({
        ...prev,
        configs: prev.configs.filter((c) => c.id !== id),
        activeConfigs: prev.activeConfigs.filter((c) => c.id !== id),
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to delete config");
    }
  }, []);

  const toggleConfig = useCallback(
    async (id: string, enabled: boolean): Promise<void> => {
      try {
        await updateConfig(id, { enabled });
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to toggle config");
      }
    },
    [updateConfig],
  );

  // Backup operations
  const runManualBackup = useCallback(
    async (configId: string): Promise<BackupRecord> => {
      try {
        if (!backupSystem) {
          throw new Error("Backup system not initialized");
        }

        // In a real implementation, this would trigger the actual backup
        const newBackup: BackupRecord = {
          id: Math.random().toString(36).substr(2, 9),
          config_id: configId,
          type: "FULL",
          status: "RUNNING",
          started_at: new Date(),
          size_bytes: 0,
          file_count: 0,
          progress_percentage: 0,
          current_operation: "Initializing backup...",
          created_at: new Date(),
          updated_at: new Date(),
        };

        setState((prev) => ({
          ...prev,
          backups: [newBackup, ...prev.backups],
          recentBackups: [newBackup, ...prev.recentBackups.slice(0, 9)],
        }));

        return newBackup;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to run manual backup");
      }
    },
    [backupSystem],
  );

  const runQuickBackup = useCallback(
    async (type: BackupType, source: string): Promise<BackupRecord> => {
      try {
        if (!backupSystem) {
          throw new Error("Backup system not initialized");
        }

        // Create a temporary config for the quick backup
        const quickConfig: BackupConfig = {
          id: "quick-" + Math.random().toString(36).substr(2, 9),
          name: `Quick ${type} Backup`,
          description: `Quick backup of ${source}`,
          enabled: true,
          type,
          source_type: "DIRECTORY",
          source_config: { directory_path: source },
          schedule_frequency: "DAILY",
          schedule_config: { timezone: "UTC" },
          storage_provider: "LOCAL",
          storage_config: { local_path: "/tmp/quick-backups" },
          retention_policy: { daily: 1, weekly: 0, monthly: 0, yearly: 0 },
          compression_enabled: true,
          compression_level: 6,
          encryption_enabled: false,
          notification_config: { on_success: false, on_failure: true },
          parallel_uploads: 1,
          chunk_size_mb: 64,
          verify_integrity: true,
          test_restore: false,
          created_at: new Date(),
          updated_at: new Date(),
        };

        return await runManualBackup(quickConfig.id);
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to run quick backup");
      }
    },
    [backupSystem, runManualBackup],
  );

  const cancelBackup = useCallback(async (backupId: string): Promise<void> => {
    try {
      setState((prev) => ({
        ...prev,
        backups: prev.backups.map((b) =>
          b.id === backupId
            ? { ...b, status: "CANCELLED" as BackupStatus, completed_at: new Date() }
            : b,
        ),
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to cancel backup");
    }
  }, []);

  // Recovery operations
  const createRecovery = useCallback(
    async (
      requestData: Omit<RecoveryRequest, "id" | "created_at" | "updated_at">,
    ): Promise<RecoveryRequest> => {
      try {
        const newRecovery: RecoveryRequest = {
          ...requestData,
          id: Math.random().toString(36).substr(2, 9),
          status: "PENDING",
          progress_percentage: 0,
          created_at: new Date(),
          updated_at: new Date(),
        };

        setState((prev) => ({
          ...prev,
          recoveries: [newRecovery, ...prev.recoveries],
          activeRecoveries: [newRecovery, ...prev.activeRecoveries],
        }));

        return newRecovery;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to create recovery request",
        );
      }
    },
    [],
  );

  const cancelRecovery = useCallback(async (recoveryId: string): Promise<void> => {
    try {
      setState((prev) => ({
        ...prev,
        recoveries: prev.recoveries.map((r) =>
          r.id === recoveryId
            ? { ...r, status: "CANCELLED" as RecoveryStatus, completed_at: new Date() }
            : r,
        ),
        activeRecoveries: prev.activeRecoveries.filter((r) => r.id !== recoveryId),
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to cancel recovery");
    }
  }, []);

  // Monitoring
  const acknowledgeAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      setState((prev) => ({
        ...prev,
        alerts: prev.alerts.map((a) =>
          a.id === alertId ? { ...a, acknowledged: true, updated_at: new Date() } : a,
        ),
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to acknowledge alert");
    }
  }, []);

  const dismissAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      setState((prev) => ({
        ...prev,
        alerts: prev.alerts.filter((a) => a.id !== alertId),
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to dismiss alert");
    }
  }, []);

  // Testing
  const testStorageConnection = useCallback(
    async (provider: StorageProvider, config: any): Promise<boolean> => {
      try {
        // Simulate connection test
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return Math.random() > 0.2; // 80% success rate for demo
      } catch (error) {
        return false;
      }
    },
    [],
  );

  const validateBackup = useCallback(async (backupId: string): Promise<boolean> => {
    try {
      // Simulate backup validation
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return Math.random() > 0.1; // 90% success rate for demo
    } catch (error) {
      return false;
    }
  }, []);

  // Auto-refresh data every 30 seconds when initialized
  useEffect(() => {
    if (!state.isInitialized) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [state.isInitialized, refreshData]);

  // Initialize on mount
  useEffect(() => {
    initializeSystem();

    return () => {
      shutdownSystem();
    };
  }, []);

  return {
    // State
    ...state,

    // Actions
    initializeSystem,
    shutdownSystem,
    refreshData,
    createConfig,
    updateConfig,
    deleteConfig,
    toggleConfig,
    runManualBackup,
    runQuickBackup,
    cancelBackup,
    createRecovery,
    cancelRecovery,
    acknowledgeAlert,
    dismissAlert,
    testStorageConnection,
    validateBackup,
  };
};

export default useBackupSystem;
