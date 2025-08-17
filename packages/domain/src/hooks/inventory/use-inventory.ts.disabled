/**
 * Inventory Management Hook
 * React hook for real-time inventory management
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */

'use client';

import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addScannedItem,
  completeBarcodeSession,
  createBarcodeSession,
  getInventoryCategories,
  getInventoryItemByBarcode,
  getInventoryItems,
  getInventoryLocations,
  getStockAlerts,
  resolveStockAlert,
  subscribeToInventoryUpdates,
  subscribeToStockAlerts,
  updateStockLevel,
} // Missing module - placeholder needed
import type {
  BarcodeSession,
  InventoryItem,
  InventoryState,
  MovementType,
  ScannedItem,
  SessionType,
} // Missing module - placeholder needed
import { AlertStatus, ConnectionStatus } // Missing module - placeholder needed

type UseInventoryOptions = {
  enableRealTime?: boolean;
  autoLoadData?: boolean;
  alertRefreshInterval?: number;
};

type UseInventoryReturn = {
  // State
  state: InventoryState;

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;

  // Data actions
  loadInventoryItems: (filters?: any) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadLocations: () => Promise<void>;
  loadAlerts: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Stock management
  updateStock: (
    itemId: string,
    quantity: number,
    movementType: MovementType,
    locationId: string,
    options?: any
  ) => Promise<boolean>;

  // Barcode scanning
  scanBarcode: (barcodeValue: string) => Promise<{
    success: boolean;
    item?: InventoryItem;
    message?: string;
  }>;

  // Session management
  startSession: (sessionType: SessionType, locationId: string) => Promise<BarcodeSession | null>;
  addScanToSession: (sessionId: string, barcodeValue: string) => Promise<ScannedItem | null>;
  endSession: (sessionId: string, notes?: string) => Promise<boolean>;

  // Alert management
  resolveAlert: (alertId: string, notes?: string) => Promise<boolean>;

  // Filters
  setLocationFilter: (locationId?: string) => void;
  setCategoryFilter: (categoryId?: string) => void;
  setSearchQuery: (query?: string) => void;

  // Real-time connection
  connectionStatus: ConnectionStatus;
  reconnect: () => void;
};

export function useInventory(options: UseInventoryOptions = {}): UseInventoryReturn {
  const {
    enableRealTime = true,
    autoLoadData = true,
    alertRefreshInterval = 30_000, // 30 seconds
  } = options;

  // State
  const [state, setState] = useState<InventoryState>({
    items: [],
    locations: [],
    categories: [],
    movements: [],
    alerts: [],
    activeSessions: [],
    loading: false,
    error: null,
    lastUpdated: new Date().toISOString(),
    isRealTimeEnabled: enableRealTime,
    connectionStatus: ConnectionStatus.DISCONNECTED,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Refs for real-time subscriptions
  const inventoryChannel = useRef<RealtimeChannel | null>(null);
  const alertsChannel = useRef<RealtimeChannel | null>(null);
  const alertInterval = useRef<NodeJS.Timeout | null>(null);

  // Load inventory items with filters
  const loadInventoryItems = useCallback(
    async (filters?: {
      category_id?: string;
      location_id?: string;
      status?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }) => {
      try {
        setIsLoading(true);
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await getInventoryItems(filters);

        if (response.success) {
          setState((prev) => ({
            ...prev,
            items: response.data,
            loading: false,
            lastUpdated: new Date().toISOString(),
          }));
        } else {
          throw new Error(response.message || 'Failed to load inventory items');
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await getInventoryCategories();

      if (response.success) {
        setState((prev) => ({
          ...prev,
          categories: response.data,
        }));
      }
    } catch (_error) {}
  }, []);

  // Load locations
  const loadLocations = useCallback(async () => {
    try {
      const response = await getInventoryLocations();

      if (response.success) {
        setState((prev) => ({
          ...prev,
          locations: response.data,
        }));
      }
    } catch (_error) {}
  }, []);

  // Load alerts
  const loadAlerts = useCallback(async () => {
    try {
      const response = await getStockAlerts({
        status: AlertStatus.ACTIVE,
        limit: 50,
      });

      if (response.success) {
        setState((prev) => ({
          ...prev,
          alerts: response.data,
        }));
      }
    } catch (_error) {}
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadInventoryItems({
        category_id: state.selectedCategory,
        location_id: state.selectedLocation,
        search: state.searchQuery,
      }),
      loadCategories(),
      loadLocations(),
      loadAlerts(),
    ]);
  }, [
    loadInventoryItems,
    loadCategories,
    loadLocations,
    loadAlerts,
    state.selectedCategory,
    state.selectedLocation,
    state.searchQuery,
  ]);

  // Update stock level
  const updateStock = useCallback(
    async (
      itemId: string,
      quantity: number,
      movementType: MovementType,
      locationId: string,
      options?: {
        referenceType?: string;
        referenceId?: string;
        notes?: string;
        batchNumber?: string;
        expirationDate?: string;
      }
    ): Promise<boolean> => {
      try {
        setIsUpdating(true);

        const response = await updateStockLevel(
          itemId,
          quantity,
          movementType,
          locationId,
          options
        );

        if (response.success) {
          // Refresh inventory items to get updated stock levels
          await loadInventoryItems({
            category_id: state.selectedCategory,
            location_id: state.selectedLocation,
            search: state.searchQuery,
          });

          // Refresh alerts as stock changes might trigger new alerts
          await loadAlerts();

          return true;
        }
        throw new Error(response.message || 'Failed to update stock');
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [
      loadInventoryItems,
      loadAlerts,
      state.selectedCategory,
      state.selectedLocation,
      state.searchQuery,
    ]
  );

  // Scan barcode
  const scanBarcode = useCallback(
    async (
      barcodeValue: string
    ): Promise<{
      success: boolean;
      item?: InventoryItem;
      message?: string;
    }> => {
      try {
        const response = await getInventoryItemByBarcode(barcodeValue);

        if (response.success && response.data) {
          return {
            success: true,
            item: response.data,
            message: 'Item found successfully',
          };
        }
        return {
          success: false,
          message: 'Item not found for this barcode',
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    []
  );

  // Start barcode session
  const startSession = useCallback(
    async (sessionType: SessionType, locationId: string): Promise<BarcodeSession | null> => {
      try {
        const response = await createBarcodeSession(sessionType, locationId);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            activeSessions: [...prev.activeSessions, response.data!],
          }));

          return response.data;
        }

        return null;
      } catch (_error) {
        return null;
      }
    },
    []
  );

  // Add scan to session
  const addScanToSession = useCallback(
    async (sessionId: string, barcodeValue: string): Promise<ScannedItem | null> => {
      try {
        // First, try to find the item
        const scanResult = await scanBarcode(barcodeValue);

        const response = await addScannedItem(
          sessionId,
          barcodeValue,
          scanResult.success ? 'success' : 'item_not_found',
          scanResult.item?.id,
          scanResult.success ? undefined : scanResult.message
        );

        if (response.success && response.data) {
          return response.data;
        }

        return null;
      } catch (_error) {
        return null;
      }
    },
    [scanBarcode]
  );

  // End session
  const endSession = useCallback(async (sessionId: string, notes?: string): Promise<boolean> => {
    try {
      const response = await completeBarcodeSession(sessionId, notes);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          activeSessions: prev.activeSessions.filter((session) => session.id !== sessionId),
        }));

        return true;
      }

      return false;
    } catch (_error) {
      return false;
    }
  }, []);

  // Resolve alert
  const resolveAlert = useCallback(async (alertId: string, notes?: string): Promise<boolean> => {
    try {
      const response = await resolveStockAlert(alertId, notes);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          alerts: prev.alerts.filter((alert) => alert.id !== alertId),
        }));

        return true;
      }

      return false;
    } catch (_error) {
      return false;
    }
  }, []);

  // Filter setters
  const setLocationFilter = useCallback((locationId?: string) => {
    setState((prev) => ({ ...prev, selectedLocation: locationId }));
  }, []);

  const setCategoryFilter = useCallback((categoryId?: string) => {
    setState((prev) => ({ ...prev, selectedCategory: categoryId }));
  }, []);

  const setSearchQuery = useCallback((query?: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  // Real-time connection management
  const reconnect = useCallback(() => {
    if (enableRealTime) {
      setupRealTimeSubscriptions();
    }
  }, [enableRealTime, setupRealTimeSubscriptions]);

  // Setup real-time subscriptions
  const setupRealTimeSubscriptions = useCallback(() => {
    try {
      setState((prev) => ({
        ...prev,
        connectionStatus: ConnectionStatus.RECONNECTING,
      }));

      // Subscribe to inventory updates
      inventoryChannel.current = subscribeToInventoryUpdates((_payload) => {
        // Refresh data when changes occur
        refreshData();

        setState((prev) => ({
          ...prev,
          lastUpdated: new Date().toISOString(),
          connectionStatus: ConnectionStatus.CONNECTED,
        }));
      });

      // Subscribe to new alerts
      alertsChannel.current = subscribeToStockAlerts((payload) => {
        // Add new alert to state
        if (payload.eventType === 'INSERT' && payload.new) {
          setState((prev) => ({
            ...prev,
            alerts: [payload.new, ...prev.alerts],
          }));
        }
      });

      setState((prev) => ({
        ...prev,
        connectionStatus: ConnectionStatus.CONNECTED,
      }));
    } catch (_error) {
      setState((prev) => ({
        ...prev,
        connectionStatus: ConnectionStatus.ERROR,
      }));
    }
  }, [refreshData]);

  // Cleanup real-time subscriptions
  const cleanupSubscriptions = useCallback(() => {
    if (inventoryChannel.current) {
      inventoryChannel.current.unsubscribe();
      inventoryChannel.current = null;
    }

    if (alertsChannel.current) {
      alertsChannel.current.unsubscribe();
      alertsChannel.current = null;
    }

    if (alertInterval.current) {
      clearInterval(alertInterval.current);
      alertInterval.current = null;
    }
  }, []);

  // Initialize hook
  useEffect(() => {
    if (autoLoadData) {
      refreshData();
    }

    if (enableRealTime) {
      setupRealTimeSubscriptions();
    }

    // Setup alert refresh interval
    alertInterval.current = setInterval(loadAlerts, alertRefreshInterval);

    return () => {
      cleanupSubscriptions();
    };
  }, [
    alertRefreshInterval,
    autoLoadData,
    cleanupSubscriptions,
    enableRealTime,
    loadAlerts,
    refreshData,
    setupRealTimeSubscriptions,
  ]);

  // Update filters effect
  useEffect(() => {
    if (autoLoadData) {
      loadInventoryItems({
        category_id: state.selectedCategory,
        location_id: state.selectedLocation,
        search: state.searchQuery,
      });
    }
  }, [
    state.selectedCategory,
    state.selectedLocation,
    state.searchQuery,
    autoLoadData,
    loadInventoryItems,
  ]);

  return {
    state,
    isLoading,
    isUpdating,
    loadInventoryItems,
    loadCategories,
    loadLocations,
    loadAlerts,
    refreshData,
    updateStock,
    scanBarcode,
    startSession,
    addScanToSession,
    endSession,
    resolveAlert,
    setLocationFilter,
    setCategoryFilter,
    setSearchQuery,
    connectionStatus: state.connectionStatus,
    reconnect,
  };
}
