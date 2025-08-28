'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  PerformanceMetrics,
  DashboardKPI,
  PerformanceDashboard,
  StaffPerformanceReport,
  ROICalculation,
  DashboardFilters,
  ExportOptions
} from '@/types/performance-monitoring';

interface UsePerformanceMonitoringOptions {
  clinicId?: string;
  departmentIds?: string[];
  refreshInterval?: number; // milliseconds
  realTimeUpdates?: boolean;
  autoRefresh?: boolean;
}

interface UsePerformanceMonitoringReturn {
  // Data
  metrics: PerformanceMetrics[];
  kpis: DashboardKPI[];
  dashboard: PerformanceDashboard | null;
  staffReports: StaffPerformanceReport[];
  roiCalculation: ROICalculation | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  filters: DashboardFilters;
  
  // Methods
  fetchMetrics: (filters?: DashboardFilters) => Promise<void>;
  fetchKPIs: (period?: string) => Promise<void>;
  fetchStaffReports: (filters?: DashboardFilters) => Promise<void>;
  calculateROI: (period: { start: Date; end: Date }) => Promise<void>;
  exportReport: (options: ExportOptions) => Promise<void>;
  
  // Filters and configuration
  setFilters: (filters: DashboardFilters) => void;
  updateRefreshRate: (minutes: number) => void;
  
  // Real-time updates
  subscribeToUpdates: () => () => void;
  refreshData: () => Promise<void>;
}

/**
 * Hook for managing performance monitoring data and dashboards
 */
export function usePerformanceMonitoring({
  clinicId,
  departmentIds = [],
  refreshInterval = 300_000, // 5 minutes
  realTimeUpdates = true,
  autoRefresh = true,
}: UsePerformanceMonitoringOptions = {}): UsePerformanceMonitoringReturn {

  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [kpis, setKpis] = useState<DashboardKPI[]>([]);
  const [dashboard, setDashboard] = useState<PerformanceDashboard | null>(null);
  const [staffReports, setStaffReports] = useState<StaffPerformanceReport[]>([]);
  const [roiCalculation, setRoiCalculation] = useState<ROICalculation | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [filters, setFiltersState] = useState<DashboardFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date(),
      preset: 'last30days',
    },
    departments: departmentIds,
    staffMembers: [],
    riskLevels: ['high', 'critical'],
    interventionTypes: [],
    appointmentTypes: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMetrics = useCallback(async (customFilters?: DashboardFilters) => {
    setIsLoading(true);
    try {
      setError(null);
      
      const queryFilters = customFilters || filters;
      
      const params = new URLSearchParams({
        ...(clinicId && { clinicId }),
        startDate: queryFilters.dateRange.start.toISOString(),
        endDate: queryFilters.dateRange.end.toISOString(),
        departments: queryFilters.departments.join(','),
        staffMembers: queryFilters.staffMembers.join(','),
      });

      const response = await fetch(`/api/performance-monitoring/metrics?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics || []);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.message || 'Failed to fetch metrics');
      }
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, [clinicId, filters]);

  const fetchKPIs = useCallback(async (period = 'last30days') => {
    try {
      setError(null);
      
      const params = new URLSearchParams({
        ...(clinicId && { clinicId }),
        period,
        departments: filters.departments.join(','),
      });

      const response = await fetch(`/api/performance-monitoring/kpis?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch KPIs: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setKpis(data.kpis || []);
      } else {
        throw new Error(data.message || 'Failed to fetch KPIs');
      }
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
    }
  }, [clinicId, filters.departments]);

  const fetchStaffReports = useCallback(async (customFilters?: DashboardFilters) => {
    try {
      setError(null);
      
      const queryFilters = customFilters || filters;
      
      const params = new URLSearchParams({
        ...(clinicId && { clinicId }),
        startDate: queryFilters.dateRange.start.toISOString(),
        endDate: queryFilters.dateRange.end.toISOString(),
        departments: queryFilters.departments.join(','),
        staffMembers: queryFilters.staffMembers.join(','),
      });

      const response = await fetch(`/api/performance-monitoring/staff-reports?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff reports: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStaffReports(data.reports || []);
      } else {
        throw new Error(data.message || 'Failed to fetch staff reports');
      }
    } catch (err) {
      console.error('Error fetching staff reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staff reports');
    }
  }, [clinicId, filters]);

  const calculateROI = useCallback(async (period: { start: Date; end: Date }) => {
    try {
      setError(null);
      
      const response = await fetch('/api/performance-monitoring/roi-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          startDate: period.start.toISOString(),
          endDate: period.end.toISOString(),
          departments: filters.departments,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate ROI: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setRoiCalculation(data.roiCalculation);
      } else {
        throw new Error(data.message || 'Failed to calculate ROI');
      }
    } catch (err) {
      console.error('Error calculating ROI:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate ROI');
    }
  }, [clinicId, filters.departments]);

  const exportReport = useCallback(async (options: ExportOptions) => {
    try {
      setError(null);
      
      const response = await fetch('/api/performance-monitoring/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          ...options,
          filters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export report: ${response.statusText}`);
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${Date.now()}.${options.format}`;
      document.body.append(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error exporting report:', err);
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  }, [clinicId, filters]);

  const setFilters = useCallback((newFilters: DashboardFilters) => {
    setFiltersState(newFilters);
    // Automatically refresh data when filters change
    fetchMetrics(newFilters);
    fetchKPIs();
    fetchStaffReports(newFilters);
  }, [fetchMetrics, fetchKPIs, fetchStaffReports]);

  const updateRefreshRate = useCallback((minutes: number) => {
    const newInterval = minutes * 60 * 1000;
    
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    // Set new interval if autoRefresh is enabled
    if (autoRefresh && newInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, newInterval);
    }
  }, [autoRefresh]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchMetrics(),
      fetchKPIs(),
      fetchStaffReports(),
    ]);
    
    // Recalculate ROI if we have a previous calculation
    if (roiCalculation) {
      await calculateROI({
        start: roiCalculation.period.start,
        end: roiCalculation.period.end,
      });
    }
  }, [fetchMetrics, fetchKPIs, fetchStaffReports, roiCalculation, calculateROI]);

  const subscribeToUpdates = useCallback(() => {
    if (!realTimeUpdates || typeof window === 'undefined') {
      return () => {};
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/performance-monitoring/websocket`;

    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('Performance monitoring WebSocket connected');
        
        // Send subscription with clinic and department filters
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          clinicId,
          departments: filters.departments,
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'metrics_updated':
              fetchMetrics();
              break;
            case 'kpi_updated':
              fetchKPIs();
              break;
            case 'staff_report_updated':
              fetchStaffReports();
              break;
            case 'alert_resolved':
              // Refresh metrics when alerts are resolved
              fetchMetrics();
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Performance monitoring WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Performance monitoring WebSocket closed');
        // Attempt to reconnect after 10 seconds
        setTimeout(() => {
          if (realTimeUpdates) {
            subscribeToUpdates();
          }
        }, 10_000);
      };

    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [realTimeUpdates, clinicId, filters.departments, fetchMetrics, fetchKPIs, fetchStaffReports]);

  // Initial data fetch
  useEffect(() => {
    fetchMetrics();
    fetchKPIs();
    fetchStaffReports();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (realTimeUpdates) {
      const unsubscribe = subscribeToUpdates();
      return unsubscribe;
    }
  }, [realTimeUpdates, subscribeToUpdates]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  // Calculate ROI automatically when metrics are loaded
  useEffect(() => {
    if (metrics.length > 0 && filters.dateRange) {
      calculateROI({
        start: filters.dateRange.start,
        end: filters.dateRange.end,
      });
    }
  }, [metrics, filters.dateRange, calculateROI]);

  return {
    // Data
    metrics,
    kpis,
    dashboard,
    staffReports,
    roiCalculation,
    
    // State
    isLoading,
    error,
    lastUpdated,
    filters,
    
    // Methods
    fetchMetrics,
    fetchKPIs,
    fetchStaffReports,
    calculateROI,
    exportReport,
    
    // Filters and configuration
    setFilters,
    updateRefreshRate,
    
    // Real-time updates
    subscribeToUpdates,
    refreshData,
  };
}