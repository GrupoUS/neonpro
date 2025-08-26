"use client";

/**
 * 🔄 Real-time Provider - NeonPro Healthcare
 * ==========================================
 *
 * React context provider for managing Supabase real-time subscriptions
 * with TanStack Query integration and LGPD compliance
 */

import { defaultRealtimeConfig, RealtimeQueryManager } from '@/lib/query/realtime-query-utils';
import type { RealtimeQueryConfig } from '@/lib/query/realtime-query-utils';
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Real-time context interface
interface RealtimeContextValue {
  supabaseClient: SupabaseClient;
  manager: RealtimeQueryManager | null;
  isEnabled: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  enableRealtime: () => void;
  disableRealtime: () => void;
  getConfig: () => RealtimeQueryConfig;
  updateConfig: (config: Partial<RealtimeQueryConfig>) => void;
}

// Create context
const RealtimeContext = createContext<RealtimeContextValue | null>(undefined);

// Provider component
export function RealtimeProvider({
  children,
  config = defaultRealtimeConfig,
}: {
  children: React.ReactNode;
  config?: RealtimeQueryConfig;
}) {
  const queryClient = useQueryClient();
  const [supabaseClient] = useState(() => createClient());
  const [manager, setManager] = useState<RealtimeQueryManager | null>(
    );
  const [isEnabled, setIsEnabled] = useState(config.enabled);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [currentConfig, setCurrentConfig] = useState(config);
  const managerRef = useRef<RealtimeQueryManager | null>(null);

  // Initialize realtime manager
  useEffect(() => {
    if (isEnabled && !manager) {
      const newManager = new RealtimeQueryManager(queryClient, supabaseClient);
      setManager(newManager);
      managerRef.current = newManager;
      setConnectionStatus("connecting");

      // Set up connection monitoring
      const checkConnection = () => {
        // Simple connection check - in production, you might want more sophisticated monitoring
        setConnectionStatus("connected");
      };

      // Check connection after a brief delay
      const timeout = setTimeout(checkConnection, 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
    if (!isEnabled && manager) {
      // Clean up manager when disabled
      manager.cleanup();
      setManager(undefined);
      managerRef.current = undefined;
      setConnectionStatus("disconnected");
    }
  }, [isEnabled, manager, queryClient, supabaseClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.cleanup();
      }
    };
  }, []);

  // Context value
  const contextValue: RealtimeContextValue = {
    supabaseClient,
    manager,
    isEnabled,
    connectionStatus,
    enableRealtime: () => setIsEnabled(true),
    disableRealtime: () => setIsEnabled(false),
    getConfig: () => currentConfig,
    updateConfig: (newConfig) => {
      setCurrentConfig({ ...currentConfig, ...newConfig });
      if (newConfig.enabled !== undefined) {
        setIsEnabled(newConfig.enabled);
      }
    },
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}

// Hook to use realtime context
export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error(
      "useRealtimeContext must be used within a RealtimeProvider",
    );
  }
  return context;
}

// Convenience hooks for specific realtime functionality
export function useRealtimeStatus() {
  const { isEnabled, connectionStatus } = useRealtimeContext();
  return { isEnabled, connectionStatus };
}

export function useRealtimeManager() {
  const { manager } = useRealtimeContext();
  return manager;
}

export function useSupabaseRealtime() {
  const { supabaseClient } = useRealtimeContext();
  return supabaseClient;
}

// Hook to toggle realtime functionality
export function useRealtimeToggle() {
  const { isEnabled, enableRealtime, disableRealtime } = useRealtimeContext();

  const toggle = () => {
    if (isEnabled) {
      disableRealtime();
    } else {
      enableRealtime();
    }
  };

  return {
    isEnabled,
    toggle,
    enable: enableRealtime,
    disable: disableRealtime,
  };
}

// Hook to update realtime configuration
export function useRealtimeConfig() {
  const { getConfig, updateConfig } = useRealtimeContext();
  return { config: getConfig(), updateConfig };
}
