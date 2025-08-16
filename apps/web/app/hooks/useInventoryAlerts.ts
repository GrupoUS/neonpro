// =====================================================================================
// NeonPro Inventory Alerts Hook
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// =====================================================================================
// TYPES & INTERFACES
// =====================================================================================

type InventoryAlert = {
  id: string;
  type:
    | 'low_stock'
    | 'out_of_stock'
    | 'expired'
    | 'expiring_soon'
    | 'overstock';
  title: string;
  message: string;
  item_name: string;
  item_id: string;
  location_name?: string;
  current_quantity?: number;
  min_quantity?: number;
  expiry_date?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  created_at: string;
};

type AlertFilters = {
  type?: string;
  severity?: string;
  is_read?: boolean;
  location_id?: string;
  limit?: number;
  offset?: number;
};

type UseAlertsResult = {
  alerts: InventoryAlert[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  criticalCount: number;
  loadAlerts: (filters?: AlertFilters) => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createAlert: (alertData: Partial<InventoryAlert>) => Promise<void>;
  refreshAlerts: () => Promise<void>;
};

// =====================================================================================
// CUSTOM HOOK
// =====================================================================================

export function useInventoryAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_mounted, setMounted] = useState(true);

  // =====================================================================================
  // COMPUTED VALUES
  // =====================================================================================

  const unreadCount = alerts.filter((alert) => !alert.is_read).length;
  const criticalCount = alerts.filter(
    (alert) => alert.severity === 'critical' || alert.severity === 'high'
  ).length;

  // =====================================================================================
  // LOAD ALERTS
  // =====================================================================================

  const loadAlerts = useCallback(async (filters: AlertFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();

      if (filters.type) {
        searchParams.set('type', filters.type);
      }
      if (filters.severity) {
        searchParams.set('severity', filters.severity);
      }
      if (filters.is_read !== undefined) {
        searchParams.set('is_read', filters.is_read.toString());
      }
      if (filters.location_id) {
        searchParams.set('location_id', filters.location_id);
      }
      if (filters.limit) {
        searchParams.set('limit', filters.limit.toString());
      }
      if (filters.offset) {
        searchParams.set('offset', filters.offset.toString());
      }

      const response = await fetch(
        `/api/inventory/alerts?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to load alerts');
      }

      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
      toast.error('Failed to load inventory alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================================================
  // MARK ALERT AS READ
  // =====================================================================================

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/inventory/alerts/${alertId}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark alert as read');
      }

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );

      toast.success('Alert marked as read');
    } catch (_err) {
      toast.error('Failed to mark alert as read');
    }
  }, []);

  // =====================================================================================
  // DISMISS ALERT
  // =====================================================================================

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/inventory/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss alert');
      }

      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      toast.success('Alert dismissed');
    } catch (_err) {
      toast.error('Failed to dismiss alert');
    }
  }, []);

  // =====================================================================================
  // MARK ALL AS READ
  // =====================================================================================

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/inventory/alerts/mark-all-read', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all alerts as read');
      }

      setAlerts((prev) => prev.map((alert) => ({ ...alert, is_read: true })));
      toast.success('All alerts marked as read');
    } catch (_err) {
      toast.error('Failed to mark all alerts as read');
    }
  }, []);

  // =====================================================================================
  // CREATE ALERT
  // =====================================================================================

  const createAlert = useCallback(
    async (alertData: Partial<InventoryAlert>) => {
      try {
        const response = await fetch('/api/inventory/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(alertData),
        });

        if (!response.ok) {
          throw new Error('Failed to create alert');
        }

        const newAlert = await response.json();
        setAlerts((prev) => [newAlert, ...prev]);

        // Show notification based on severity
        if (newAlert.severity === 'critical' || newAlert.severity === 'high') {
          toast.error(`Critical Alert: ${newAlert.title}`);
        } else {
          toast.warning(`New Alert: ${newAlert.title}`);
        }
      } catch (_err) {
        toast.error('Failed to create alert');
      }
    },
    []
  );

  // =====================================================================================
  // REFRESH ALERTS
  // =====================================================================================

  const refreshAlerts = useCallback(async () => {
    await loadAlerts();
  }, [loadAlerts]);

  // =====================================================================================
  // INITIAL LOAD
  // =====================================================================================

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // =====================================================================================
  // AUTO REFRESH (EVERY 30 SECONDS)
  // =====================================================================================

  useEffect(() => {
    const interval = setInterval(() => {
      loadAlerts();
    }, 30_000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loadAlerts]);

  // =====================================================================================
  // RETURN HOOK INTERFACE
  // =====================================================================================

  // =====================================================================================
  // CLEANUP EFFECT
  // =====================================================================================

  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  return {
    alerts,
    loading,
    error,
    unreadCount,
    criticalCount,
    loadAlerts,
    markAsRead,
    dismissAlert,
    markAllAsRead,
    createAlert,
    refreshAlerts,
  };
}

// =====================================================================================
// ALERT SEVERITY HELPERS
// =====================================================================================

export const AlertSeverity = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const,
};

export const AlertType = {
  LOW_STOCK: 'low_stock' as const,
  OUT_OF_STOCK: 'out_of_stock' as const,
  EXPIRED: 'expired' as const,
  EXPIRING_SOON: 'expiring_soon' as const,
  OVERSTOCK: 'overstock' as const,
};

// =====================================================================================
// ALERT UTILITIES
// =====================================================================================

export const alertUtils = {
  getSeverityColor: (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  },

  getSeverityBadgeColor: (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getTypeLabel: (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'expired':
        return 'Expired';
      case 'expiring_soon':
        return 'Expiring Soon';
      case 'overstock':
        return 'Overstock';
      default:
        return 'Unknown';
    }
  },

  shouldShowNotification: (alert: InventoryAlert) => {
    return alert.severity === 'critical' || alert.severity === 'high';
  },
};
