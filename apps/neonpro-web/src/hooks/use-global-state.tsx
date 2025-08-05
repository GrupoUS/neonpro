"use client";

import type { useState, useEffect, useCallback, useRef } from "react";
import type { createContext, useContext, ReactNode } from "react";

// =====================================================================================
// GLOBAL STATE MANAGEMENT HOOK
// Optimized state management with performance enhancements
// =====================================================================================

type StateUpdater<T> = (prevState: T) => T;
type StateSetter<T> = (newState: T | StateUpdater<T>) => void;

interface GlobalStateContextType {
  getState: <T>(key: string) => T | undefined;
  setState: <T>(key: string, value: T | StateUpdater<T>) => void;
  subscribe: (key: string, callback: (value: any) => void) => () => void;
  clearState: (key: string) => void;
  clearAllState: () => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | null>(null);

// =====================================================================================
// GLOBAL STATE PROVIDER
// =====================================================================================

interface GlobalStateProviderProps {
  children: ReactNode;
  persistKeys?: string[]; // Keys to persist in localStorage
}

export function GlobalStateProvider({ children, persistKeys = [] }: GlobalStateProviderProps) {
  const stateRef = useRef<Map<string, any>>(new Map());
  const subscribersRef = useRef<Map<string, Set<(value: any) => void>>>(new Map());
  const [, forceUpdate] = useState({});

  // Initialize persisted state
  useEffect(() => {
    if (typeof window !== "undefined") {
      persistKeys.forEach((key) => {
        try {
          const stored = localStorage.getItem(`neonpro_state_${key}`);
          if (stored) {
            stateRef.current.set(key, JSON.parse(stored));
          }
        } catch (error) {
          console.warn(`Failed to load persisted state for key: ${key}`, error);
        }
      });
    }
  }, [persistKeys]);

  const getState = useCallback(function <T>(key: string): T | undefined {
    return stateRef.current.get(key);
  }, []);

  const setState = useCallback(
    function <T>(key: string, value: T | StateUpdater<T>) {
      const currentValue = stateRef.current.get(key);
      const newValue =
        typeof value === "function" ? (value as StateUpdater<T>)(currentValue) : value;

      stateRef.current.set(key, newValue);

      // Persist if key is in persistKeys
      if (persistKeys.includes(key) && typeof window !== "undefined") {
        try {
          localStorage.setItem(`neonpro_state_${key}`, JSON.stringify(newValue));
        } catch (error) {
          console.warn(`Failed to persist state for key: ${key}`, error);
        }
      }

      // Notify subscribers
      const subscribers = subscribersRef.current.get(key);
      if (subscribers) {
        subscribers.forEach((callback) => {
          try {
            callback(newValue);
          } catch (error) {
            console.error(`Error in state subscriber for key: ${key}`, error);
          }
        });
      }
    },
    [persistKeys],
  );

  const subscribe = useCallback((key: string, callback: (value: any) => void) => {
    if (!subscribersRef.current.has(key)) {
      subscribersRef.current.set(key, new Set());
    }

    const subscribers = subscribersRef.current.get(key)!;
    subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        subscribersRef.current.delete(key);
      }
    };
  }, []);

  const clearState = useCallback(
    (key: string) => {
      stateRef.current.delete(key);

      if (persistKeys.includes(key) && typeof window !== "undefined") {
        localStorage.removeItem(`neonpro_state_${key}`);
      }

      // Notify subscribers
      const subscribers = subscribersRef.current.get(key);
      if (subscribers) {
        subscribers.forEach((callback) => callback(undefined));
      }
    },
    [persistKeys],
  );

  const clearAllState = useCallback(() => {
    const keys = Array.from(stateRef.current.keys());
    stateRef.current.clear();

    if (typeof window !== "undefined") {
      persistKeys.forEach((key) => {
        localStorage.removeItem(`neonpro_state_${key}`);
      });
    }

    // Notify all subscribers
    keys.forEach((key) => {
      const subscribers = subscribersRef.current.get(key);
      if (subscribers) {
        subscribers.forEach((callback) => callback(undefined));
      }
    });
  }, [persistKeys]);

  const contextValue: GlobalStateContextType = {
    getState,
    setState,
    subscribe,
    clearState,
    clearAllState,
  };

  return <GlobalStateContext.Provider value={contextValue}>{children}</GlobalStateContext.Provider>;
}

// =====================================================================================
// GLOBAL STATE HOOK
// =====================================================================================

export function useGlobalState<T>(key: string, initialValue?: T): [T | undefined, StateSetter<T>] {
  const context = useContext(GlobalStateContext);

  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }

  const { getState, setState, subscribe } = context;
  const [localState, setLocalState] = useState<T | undefined>(() => {
    const existing = getState<T>(key);
    return existing !== undefined ? existing : initialValue;
  });

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = subscribe(key, (newValue: T) => {
      setLocalState(newValue);
    });

    return unsubscribe;
  }, [key, subscribe]);

  // Initialize state if it doesn't exist
  useEffect(() => {
    if (initialValue !== undefined && getState(key) === undefined) {
      setState(key, initialValue);
    }
  }, [key, initialValue, getState, setState]);

  const setGlobalState = useCallback<StateSetter<T>>(
    (value) => {
      setState(key, value);
    },
    [key, setState],
  );

  return [localState, setGlobalState];
}

// =====================================================================================
// SPECIALIZED HOOKS
// =====================================================================================

// User preferences hook
export function useUserPreferences() {
  return useGlobalState("userPreferences", {
    theme: "light" as "light" | "dark",
    language: "pt-BR",
    notifications: true,
    autoSave: true,
    compactMode: false,
  });
}

// App settings hook
export function useAppSettings() {
  return useGlobalState("appSettings", {
    sidebarCollapsed: false,
    defaultView: "dashboard" as string,
    refreshInterval: 30000,
    maxRetries: 3,
    timeout: 10000,
  });
}

// Current user hook
export function useCurrentUser() {
  return useGlobalState("currentUser", null as any);
}

// Loading states hook
export function useLoadingStates() {
  return useGlobalState("loadingStates", {} as Record<string, boolean>);
}

// Error states hook
export function useErrorStates() {
  return useGlobalState("errorStates", {} as Record<string, string | null>);
}

// =====================================================================================
// UTILITY HOOKS
// =====================================================================================

// Hook for managing loading state of specific operations
export function useOperationState(operationKey: string) {
  const [loadingStates, setLoadingStates] = useLoadingStates();
  const [errorStates, setErrorStates] = useErrorStates();

  const setLoading = useCallback(
    (loading: boolean) => {
      setLoadingStates((prev) => ({ ...prev, [operationKey]: loading }));
    },
    [operationKey, setLoadingStates],
  );

  const setError = useCallback(
    (error: string | null) => {
      setErrorStates((prev) => ({ ...prev, [operationKey]: error }));
    },
    [operationKey, setErrorStates],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    isLoading: loadingStates?.[operationKey] || false,
    error: errorStates?.[operationKey] || null,
    setLoading,
    setError,
    clearError,
  };
}

// Hook for temporary state that auto-clears
export function useTemporaryState<T>(key: string, initialValue: T, timeoutMs: number = 5000) {
  const [state, setState] = useGlobalState(key, initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setTemporaryState = useCallback(
    (value: T | StateUpdater<T>) => {
      setState(value);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to reset state
      timeoutRef.current = setTimeout(() => {
        setState(initialValue);
      }, timeoutMs);
    },
    [setState, initialValue, timeoutMs],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, setTemporaryState] as const;
}

export default useGlobalState;
