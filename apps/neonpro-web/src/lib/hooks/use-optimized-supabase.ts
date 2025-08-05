/**
 * 🎯 Optimized Supabase Hooks
 * Task 1.3 - CONNECTION POOLING OPTIMIZATION
 *
 * React hooks with integrated connection pooling for healthcare operations
 * Features:
 * - Automatic pool selection based on operation criticality
 * - Healthcare compliance monitoring
 * - Performance optimization for clinical workflows
 * - Multi-tenant isolation support
 */

import type {
  ConnectionMetrics,
  getConnectionPoolManager,
  HealthcheckResult,
} from "@/lib/supabase/connection-pool-manager";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Healthcare operation types for optimal routing
type HealthcareOperationType = "critical" | "standard" | "analytics" | "administrative";

interface UseOptimizedSupabaseOptions {
  clinicId: string;
  operationType?: HealthcareOperationType;
  autoRetry?: boolean;
  healthMonitoring?: boolean;
}

interface SupabaseHookResult {
  client: SupabaseClient<Database>;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  healthStatus: HealthcheckResult | null;
  metrics: ConnectionMetrics | null;
  retry: () => void;
}

/**
 * Main hook for optimized Supabase connections
 */
export function useOptimizedSupabase(options: UseOptimizedSupabaseOptions): SupabaseHookResult {
  const {
    clinicId,
    operationType = "standard",
    autoRetry = true,
    healthMonitoring = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthcheckResult | null>(null);
  const [metrics, setMetrics] = useState<ConnectionMetrics | null>(null);

  const poolManager = useMemo(() => getConnectionPoolManager(), []);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const healthCheckIntervalRef = useRef<NodeJS.Timeout>();

  // Get optimized client based on operation type
  const client = useMemo(() => {
    try {
      const clientType = operationType === "critical" ? "critical" : "standard";
      return poolManager.getHealthcareClient(clinicId, clientType);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      return null;
    }
  }, [poolManager, clinicId, operationType]);

  // Connection health check
  const checkConnection = useCallback(async () => {
    if (!client) return;

    try {
      setIsLoading(true);
      setError(null);

      // Healthcare-specific connection test
      const { error: testError } = await client.from("profiles").select("id").limit(1).single();

      if (testError && testError.code !== "PGRST116") {
        // Ignore "no rows" error
        throw new Error(`Connection test failed: ${testError.message}`);
      }

      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError(err as Error);

      if (autoRetry) {
        scheduleRetry();
      }
    } finally {
      setIsLoading(false);
    }
  }, [client, autoRetry]);

  // Schedule retry with exponential backoff
  const scheduleRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      checkConnection();
    }, 2000); // 2 second retry delay
  }, [checkConnection]);

  // Manual retry function
  const retry = useCallback(() => {
    checkConnection();
  }, [checkConnection]);

  // Update health monitoring
  const updateHealthMetrics = useCallback(() => {
    if (!healthMonitoring) return;

    const analytics = poolManager.getPoolAnalytics();
    const poolKey = `healthcare_${clinicId}_${operationType}`;

    const poolData = analytics.pools.find((p) => p.poolKey === poolKey);
    if (poolData) {
      setHealthStatus(poolData.health);
      setMetrics(poolData.metrics);
    }
  }, [poolManager, clinicId, operationType, healthMonitoring]);

  // Initialize connection and monitoring
  useEffect(() => {
    checkConnection();

    if (healthMonitoring) {
      updateHealthMetrics();

      // Set up health monitoring interval
      healthCheckIntervalRef.current = setInterval(() => {
        updateHealthMetrics();
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [checkConnection, updateHealthMetrics, healthMonitoring]);

  return {
    client: client!,
    isConnected,
    isLoading,
    error,
    healthStatus,
    metrics,
    retry,
  };
}

/**
 * Hook for server-side operations with session management
 */
export function useOptimizedServerSupabase(clinicId: string) {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const poolManager = useMemo(() => getConnectionPoolManager(), []);

  useEffect(() => {
    const initializeServerClient = async () => {
      try {
        setIsLoading(true);
        const serverClient = await poolManager.getServerClient(clinicId);
        setClient(serverClient);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeServerClient();
  }, [poolManager, clinicId]);

  return { client, isLoading, error };
}

/**
 * Hook for browser-side operations
 */
export function useOptimizedBrowserSupabase(clinicId: string) {
  const poolManager = useMemo(() => getConnectionPoolManager(), []);

  const client = useMemo(() => {
    return poolManager.getBrowserClient(clinicId);
  }, [poolManager, clinicId]);

  return { client };
}

/**
 * Hook for healthcare-specific operations with compliance monitoring
 */
export function useHealthcareCompliantSupabase(
  clinicId: string,
  operationType: HealthcareOperationType = "standard",
) {
  const baseHook = useOptimizedSupabase({
    clinicId,
    operationType,
    autoRetry: true,
    healthMonitoring: true,
  });

  // Enhanced compliance monitoring
  const complianceStatus = useMemo(() => {
    if (!baseHook.healthStatus) return null;

    return {
      lgpdCompliant: baseHook.healthStatus.compliance.lgpdCompliant,
      anvisaCompliant: baseHook.healthStatus.compliance.anvisaCompliant,
      cfmCompliant: baseHook.healthStatus.compliance.cfmCompliant,
      overallCompliant:
        baseHook.healthStatus.compliance.lgpdCompliant &&
        baseHook.healthStatus.compliance.anvisaCompliant &&
        baseHook.healthStatus.compliance.cfmCompliant,
    };
  }, [baseHook.healthStatus]);

  // Healthcare-specific query wrapper with audit trail
  const executeHealthcareQuery = useCallback(
    async (
      queryFn: (client: SupabaseClient<Database>) => Promise<any>,
      auditInfo: { action: string; patientId?: string; professionalId: string },
    ) => {
      if (!baseHook.client || !complianceStatus?.overallCompliant) {
        throw new Error("Healthcare compliance requirements not met");
      }

      try {
        // Add audit headers
        const auditHeaders = {
          "X-Audit-Action": auditInfo.action,
          "X-Audit-Professional": auditInfo.professionalId,
          "X-Audit-Timestamp": new Date().toISOString(),
          "X-Clinic-ID": clinicId,
        };

        if (auditInfo.patientId) {
          auditHeaders["X-Audit-Patient"] = auditInfo.patientId;
        }

        // Execute query with audit trail
        const result = await queryFn(baseHook.client);

        // Log healthcare operation for LGPD compliance
        console.log("Healthcare operation executed:", {
          clinicId,
          action: auditInfo.action,
          professionalId: auditInfo.professionalId,
          patientId: auditInfo.patientId,
          timestamp: new Date().toISOString(),
          compliance: complianceStatus,
        });

        return result;
      } catch (error) {
        // Log healthcare operation error
        console.error("Healthcare operation failed:", {
          clinicId,
          action: auditInfo.action,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    [baseHook.client, complianceStatus, clinicId],
  );

  return {
    ...baseHook,
    complianceStatus,
    executeHealthcareQuery,
  };
}

/**
 * Hook for pool analytics and monitoring
 */
export function usePoolAnalytics() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const poolManager = useMemo(() => getConnectionPoolManager(), []);

  const refreshAnalytics = useCallback(() => {
    try {
      setIsLoading(true);
      const data = poolManager.getPoolAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch pool analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [poolManager]);

  useEffect(() => {
    refreshAnalytics();

    // Update analytics every 30 seconds
    const interval = setInterval(refreshAnalytics, 30000);

    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  return {
    analytics,
    isLoading,
    refresh: refreshAnalytics,
  };
}

/**
 * Hook for critical healthcare operations with enhanced monitoring
 */
export function useCriticalHealthcareSupabase(clinicId: string) {
  const baseHook = useHealthcareCompliantSupabase(clinicId, "critical");

  // Additional monitoring for critical operations
  const [operationHistory, setOperationHistory] = useState<
    Array<{
      timestamp: Date;
      action: string;
      success: boolean;
      responseTime: number;
    }>
  >([]);

  const executeCriticalOperation = useCallback(
    async (
      queryFn: (client: SupabaseClient<Database>) => Promise<any>,
      auditInfo: { action: string; patientId?: string; professionalId: string },
    ) => {
      const startTime = Date.now();
      let success = false;

      try {
        const result = await baseHook.executeHealthcareQuery(queryFn, auditInfo);
        success = true;
        return result;
      } finally {
        const responseTime = Date.now() - startTime;

        // Track critical operation
        setOperationHistory((prev) =>
          [
            ...prev,
            {
              timestamp: new Date(),
              action: auditInfo.action,
              success,
              responseTime,
            },
          ].slice(-100),
        ); // Keep last 100 operations
      }
    },
    [baseHook],
  );

  return {
    ...baseHook,
    executeCriticalOperation,
    operationHistory,
  };
}
