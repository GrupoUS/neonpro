/**
 * Executive Dashboard React Hooks
 * Custom hooks for dashboard state management and data fetching
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  ExecutiveDashboard,
  KPIMetric,
  DashboardWidget,
  DashboardAlert,
  DashboardReport,
  DashboardFilters,
  RefreshInterval,
  ChartDataPoint
} from './types';
import { KPICalculatorService } from './kpi-calculator';
import { RealTimeService } from './real-time-service';
import { WidgetSystem } from './widget-system';
import { DASHBOARD_CONFIG } from './config';
import { performanceUtils } from './utils';

// Dashboard state hook
export const useDashboard = (dashboardId: string) => {
  const [dashboard, setDashboard] = useState<ExecutiveDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API call - replace with actual API
      const response = await fetch(`/api/dashboard/${dashboardId}`);
      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }
      
      const dashboardData = await response.json();
      setDashboard(dashboardData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  const updateDashboard = useCallback((updates: Partial<ExecutiveDashboard>) => {
    setDashboard(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    dashboard,
    loading,
    error,
    lastUpdated,
    reload: loadDashboard,
    update: updateDashboard
  };
};

// KPI metrics hook
export const useKPIMetrics = (kpiIds: string[], refreshInterval: RefreshInterval = 'normal') => {
  const [metrics, setMetrics] = useState<Record<string, KPIMetric>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const kpiService = useRef(new KPICalculatorService());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const newMetrics: Record<string, KPIMetric> = {};
      
      for (const kpiId of kpiIds) {
        const metric = await kpiService.current.calculateKPI(kpiId);
        newMetrics[kpiId] = metric;
      }
      
      setMetrics(newMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch KPI metrics');
    } finally {
      setLoading(false);
    }
  }, [kpiIds]);

  const debouncedFetch = useMemo(
    () => performanceUtils.debounce(fetchMetrics, 500),
    [fetchMetrics]
  );

  useEffect(() => {
    fetchMetrics();
    
    // Set up refresh interval
    const interval = DASHBOARD_CONFIG.REFRESH_INTERVALS[refreshInterval.toUpperCase() as keyof typeof DASHBOARD_CONFIG.REFRESH_INTERVALS];
    
    if (interval > 0) {
      intervalRef.current = setInterval(debouncedFetch, interval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMetrics, debouncedFetch, refreshInterval]);

  const refreshMetrics = useCallback(() => {
    setLoading(true);
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: refreshMetrics
  };
};

// Real-time updates hook
export const useRealTimeUpdates = (dashboardId: string, enabled: boolean = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const realTimeService = useRef<RealTimeService | null>(null);
  const callbacksRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    realTimeService.current = new RealTimeService();
    
    const handleConnect = () => {
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    
    const handleUpdate = (data: any) => {
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      
      // Call registered callbacks
      callbacksRef.current.forEach(callback => {
        callback(data);
      });
    };

    realTimeService.current.connect(dashboardId);
    realTimeService.current.on('connect', handleConnect);
    realTimeService.current.on('disconnect', handleDisconnect);
    realTimeService.current.on('update', handleUpdate);

    return () => {
      if (realTimeService.current) {
        realTimeService.current.disconnect();
        realTimeService.current = null;
      }
      setIsConnected(false);
    };
  }, [dashboardId, enabled]);

  const subscribe = useCallback((key: string, callback: (data: any) => void) => {
    callbacksRef.current.set(key, callback);
    
    return () => {
      callbacksRef.current.delete(key);
    };
  }, []);

  const sendUpdate = useCallback((data: any) => {
    if (realTimeService.current && isConnected) {
      realTimeService.current.sendUpdate(data);
    }
  }, [isConnected]);

  return {
    isConnected,
    lastUpdate,
    updateCount,
    subscribe,
    sendUpdate
  };
};

// Widget management hook
export const useWidgets = (dashboardId: string) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const widgetSystem = useRef(new WidgetSystem());

  const loadWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const widgetData = await widgetSystem.current.getWidgets(dashboardId);
      setWidgets(widgetData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load widgets');
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  const addWidget = useCallback(async (widget: Omit<DashboardWidget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newWidget = await widgetSystem.current.createWidget(dashboardId, widget);
      setWidgets(prev => [...prev, newWidget]);
      return newWidget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add widget');
      throw err;
    }
  }, [dashboardId]);

  const updateWidget = useCallback(async (widgetId: string, updates: Partial<DashboardWidget>) => {
    try {
      const updatedWidget = await widgetSystem.current.updateWidget(widgetId, updates);
      setWidgets(prev => prev.map(w => w.id === widgetId ? updatedWidget : w));
      return updatedWidget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update widget');
      throw err;
    }
  }, []);

  const removeWidget = useCallback(async (widgetId: string) => {
    try {
      await widgetSystem.current.deleteWidget(widgetId);
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove widget');
      throw err;
    }
  }, []);

  const reorderWidgets = useCallback((newOrder: DashboardWidget[]) => {
    setWidgets(newOrder);
    // Optionally save order to backend
  }, []);

  useEffect(() => {
    loadWidgets();
  }, [loadWidgets]);

  return {
    widgets,
    loading,
    error,
    addWidget,
    updateWidget,
    removeWidget,
    reorderWidgets,
    reload: loadWidgets
  };
};

// Alerts hook
export const useAlerts = (dashboardId: string, filters?: { severity?: string[]; resolved?: boolean }) => {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API call - replace with actual API
      const queryParams = new URLSearchParams();
      if (filters?.severity) {
        queryParams.append('severity', filters.severity.join(','));
      }
      if (filters?.resolved !== undefined) {
        queryParams.append('resolved', filters.resolved.toString());
      }
      
      const response = await fetch(`/api/dashboard/${dashboardId}/alerts?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to load alerts');
      }
      
      const alertData = await response.json();
      setAlerts(alertData);
      setUnreadCount(alertData.filter((alert: DashboardAlert) => !alert.acknowledged).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [dashboardId, filters]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await fetch(`/api/dashboard/alerts/${alertId}/acknowledge`, { method: 'POST' });
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      await fetch(`/api/dashboard/alerts/${alertId}/resolve`, { method: 'POST' });
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true, resolvedAt: new Date() } : alert
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  }, []);

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      await fetch(`/api/dashboard/alerts/${alertId}`, { method: 'DELETE' });
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss alert');
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return {
    alerts,
    loading,
    error,
    unreadCount,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    reload: loadAlerts
  };
};

// Chart data hook
export const useChartData = (dataSource: string, chartType: string, filters?: DashboardFilters) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ min: number; max: number; avg: number; total: number } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      queryParams.append('type', chartType);
      
      if (filters?.dateRange) {
        queryParams.append('startDate', filters.dateRange.start);
        queryParams.append('endDate', filters.dateRange.end);
      }
      
      if (filters?.departments?.length) {
        queryParams.append('departments', filters.departments.join(','));
      }
      
      const response = await fetch(`/api/dashboard/charts/${dataSource}?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to load chart data');
      }
      
      const chartData = await response.json();
      setData(chartData);
      
      // Calculate statistics
      if (chartData.length > 0) {
        const values = chartData.map((d: ChartDataPoint) => d.value);
        const total = values.reduce((sum: number, val: number) => sum + val, 0);
        setStats({
          min: Math.min(...values),
          max: Math.max(...values),
          avg: total / values.length,
          total
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  }, [dataSource, chartType, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    stats,
    reload: loadData
  };
};

// Reports hook
export const useReports = (dashboardId: string) => {
  const [reports, setReports] = useState<DashboardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<Set<string>>(new Set());

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/dashboard/${dashboardId}/reports`);
      if (!response.ok) {
        throw new Error('Failed to load reports');
      }
      
      const reportData = await response.json();
      setReports(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  const generateReport = useCallback(async (reportConfig: Omit<DashboardReport, 'id' | 'createdAt' | 'status'>) => {
    const tempId = `temp-${Date.now()}`;
    
    try {
      setGenerating(prev => new Set([...prev, tempId]));
      
      const response = await fetch(`/api/dashboard/${dashboardId}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportConfig)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const newReport = await response.json();
      setReports(prev => [newReport, ...prev]);
      
      return newReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      throw err;
    } finally {
      setGenerating(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    }
  }, [dashboardId]);

  const downloadReport = useCallback(async (reportId: string) => {
    try {
      const response = await fetch(`/api/dashboard/reports/${reportId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    }
  }, []);

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      await fetch(`/api/dashboard/reports/${reportId}`, { method: 'DELETE' });
      setReports(prev => prev.filter(report => report.id !== reportId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return {
    reports,
    loading,
    error,
    generating: Array.from(generating),
    generateReport,
    downloadReport,
    deleteReport,
    reload: loadReports
  };
};

// Local storage hook for dashboard preferences
export const useDashboardPreferences = (dashboardId: string) => {
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  
  const storageKey = `dashboard-preferences-${dashboardId}`;
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to load dashboard preferences:', err);
    }
  }, [storageKey]);
  
  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save dashboard preferences:', err);
      }
      return updated;
    });
  }, [storageKey]);
  
  const getPreference = useCallback((key: string, defaultValue?: any) => {
    return preferences[key] ?? defaultValue;
  }, [preferences]);
  
  return {
    preferences,
    updatePreference,
    getPreference
  };
};