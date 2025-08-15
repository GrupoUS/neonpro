// Custom Hook for Intelligent Threshold Management
// Story 6.2: Automated Reorder Alerts + Threshold Management

import { useCallback, useEffect, useState } from 'react';
import type {
  DemandForecast,
  ReorderAlert,
  ReorderThreshold,
  ThresholdOptimization,
} from '@/app/types/reorder-alerts';

interface ThresholdFilters {
  item_category?: string[];
  auto_reorder_enabled?: boolean;
  needs_optimization?: boolean;
}

interface UseIntelligentThresholdsProps {
  clinicId: string;
  filters?: ThresholdFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useIntelligentThresholds({
  clinicId,
  filters,
  autoRefresh = false,
  refreshInterval = 30_000, // 30 seconds
}: UseIntelligentThresholdsProps) {
  const [thresholds, setThresholds] = useState<ReorderThreshold[]>([]);
  const [optimizations, setOptimizations] = useState<ThresholdOptimization[]>(
    []
  );
  const [alerts, _setAlerts] = useState<ReorderAlert[]>([]);
  const [alertStats, setAlertStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch thresholds with filters
  const fetchThresholds = useCallback(async () => {
    try {
      const params = new URLSearchParams({ clinic_id: clinicId });

      if (filters?.item_category?.length) {
        params.append('item_category', filters.item_category[0]); // API expects single category for now
      }
      if (filters?.auto_reorder_enabled !== undefined) {
        params.append(
          'auto_reorder_enabled',
          filters.auto_reorder_enabled.toString()
        );
      }
      if (filters?.needs_optimization !== undefined) {
        params.append(
          'needs_optimization',
          filters.needs_optimization.toString()
        );
      }

      const response = await fetch(`/api/inventory/thresholds?${params}`);
      if (!response.ok) throw new Error('Failed to fetch thresholds');

      const data = await response.json();
      setThresholds(data.data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [clinicId, filters]);

  // Fetch optimization analysis
  const fetchOptimizations = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/inventory/thresholds/optimize?clinic_id=${clinicId}`
      );
      if (!response.ok) throw new Error('Failed to fetch optimizations');

      const data = await response.json();
      setOptimizations(data.data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [clinicId]);

  // Fetch alert statistics
  const fetchAlertStats = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/inventory/alerts/stats?clinic_id=${clinicId}`
      );
      if (!response.ok) throw new Error('Failed to fetch alert stats');

      const data = await response.json();
      setAlertStats(data.data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [clinicId]);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchThresholds(),
        fetchOptimizations(),
        fetchAlertStats(),
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchThresholds, fetchOptimizations, fetchAlertStats]);

  // Create new threshold
  const createThreshold = useCallback(
    async (
      thresholdData: Omit<ReorderThreshold, 'id' | 'created_at' | 'updated_at'>
    ) => {
      try {
        const response = await fetch('/api/inventory/thresholds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(thresholdData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create threshold');
        }

        const data = await response.json();
        await fetchThresholds(); // Refresh list
        return data.data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [fetchThresholds]
  );

  // Update threshold
  const updateThreshold = useCallback(
    async (id: string, updates: Partial<ReorderThreshold>) => {
      try {
        const response = await fetch(`/api/inventory/thresholds/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update threshold');
        }

        const data = await response.json();
        await fetchThresholds(); // Refresh list
        return data.data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [fetchThresholds]
  );

  // Delete threshold (soft delete)
  const deleteThreshold = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/inventory/thresholds/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete threshold');
        }

        await fetchThresholds(); // Refresh list
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [fetchThresholds]
  );

  // Generate demand forecast
  const generateForecast = useCallback(
    async (
      itemId: string,
      forecastPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly',
      forecastDate?: Date
    ): Promise<DemandForecast> => {
      try {
        const response = await fetch('/api/inventory/forecasting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_id: itemId,
            clinic_id: clinicId,
            forecast_period: forecastPeriod,
            forecast_date:
              forecastDate?.toISOString() || new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate forecast');
        }

        const data = await response.json();
        return data.data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [clinicId]
  );

  // Bulk forecast generation
  const generateBulkForecast = useCallback(
    async (
      items: Array<{
        item_id: string;
        forecast_period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      }>,
      forecastDate?: Date
    ) => {
      try {
        const response = await fetch('/api/inventory/forecasting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            clinic_id: clinicId,
            forecast_date:
              forecastDate?.toISOString() || new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to generate bulk forecast'
          );
        }

        const data = await response.json();
        return data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [clinicId]
  );

  // Alert actions
  const acknowledgeAlert = useCallback(
    async (alertId: string, userId: string, notes?: string) => {
      try {
        const response = await fetch(
          `/api/inventory/alerts/${alertId}/acknowledge`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, notes }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to acknowledge alert');
        }

        await fetchAlertStats(); // Refresh stats
        return response.json();
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [fetchAlertStats]
  );

  const resolveAlert = useCallback(
    async (alertId: string, userId: string, notes?: string) => {
      try {
        const response = await fetch(
          `/api/inventory/alerts/${alertId}/resolve`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, notes }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to resolve alert');
        }

        await fetchAlertStats(); // Refresh stats
        return response.json();
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [fetchAlertStats]
  );

  const escalateAlert = useCallback(
    async (alertId: string, escalateTo: string, level: number) => {
      try {
        const response = await fetch(
          `/api/inventory/alerts/${alertId}/escalate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ escalate_to: escalateTo, level }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to escalate alert');
        }

        await fetchAlertStats(); // Refresh stats
        return response.json();
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [fetchAlertStats]
  );

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  return {
    // Data
    thresholds,
    optimizations,
    alerts,
    alertStats,

    // State
    loading,
    error,

    // Actions
    refresh: loadData,
    createThreshold,
    updateThreshold,
    deleteThreshold,
    generateForecast,
    generateBulkForecast,
    acknowledgeAlert,
    resolveAlert,
    escalateAlert,

    // Computed values
    totalThresholds: thresholds.length,
    activeThresholds: thresholds.filter((t) => t.is_active).length,
    autoReorderEnabled: thresholds.filter((t) => t.auto_reorder_enabled).length,
    optimizationOpportunities: optimizations.length,
    totalPotentialSavings: optimizations.reduce(
      (sum, opt) => sum + opt.potential_savings,
      0
    ),
  };
}
