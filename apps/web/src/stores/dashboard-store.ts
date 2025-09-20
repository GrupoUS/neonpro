/**
 * Dashboard Store
 * Zustand store for managing dashboard state, filters, and real-time data synchronization
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { DashboardData, DashboardFilters, RealTimeMetrics } from '@/services/dashboard-data';

export interface DashboardState {
  // Current state
  data: DashboardData | null;
  filters: DashboardFilters;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Real-time state
  realTimeEnabled: boolean;
  realTimeData: RealTimeMetrics | null;
  autoRefreshInterval: number; // in milliseconds

  // UI state
  selectedPeriod: "daily" | "weekly" | "monthly" | "yearly";
  comparisonMode: boolean;
  expandedSections: string[];
  viewMode: "cards" | "charts" | "table";
  
  // Filter presets
  filterPresets: Record<string, DashboardFilters>;
  activePreset: string | null;
}

export interface DashboardActions {
  // Data actions
  setData: (data: DashboardData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;

  // Filter actions
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  applyFilterPreset: (presetName: string) => void;
  saveFilterPreset: (name: string, filters: DashboardFilters) => void;
  deleteFilterPreset: (name: string) => void;

  // Real-time actions
  enableRealTime: () => void;
  disableRealTime: () => void;
  setRealTimeData: (data: RealTimeMetrics) => void;
  setAutoRefreshInterval: (interval: number) => void;

  // UI actions
  setPeriod: (period: "daily" | "weekly" | "monthly" | "yearly") => void;
  toggleComparison: () => void;
  expandSection: (sectionId: string) => void;
  collapseSection: (sectionId: string) => void;
  setViewMode: (mode: "cards" | "charts" | "table") => void;

  // Utility actions
  refresh: () => void;
  reset: () => void;
}// Default state
const createDefaultFilters = (): DashboardFilters => {
  const now = new Date();
  const startDate = new Date();
  startDate.setMonth(now.getMonth() - 1); // Default to last month

  return {
    period: "monthly",
    startDate,
    endDate: now,
    clinicId: "", // Will be set by the application
    includeComparisons: true,
    includeRealTime: true,
    metricCategories: ["revenue", "expenses", "profit", "patients", "appointments"],
  };
};

const initialState: DashboardState = {
  data: null,
  filters: createDefaultFilters(),
  loading: false,
  error: null,
  lastUpdated: null,
  
  realTimeEnabled: true,
  realTimeData: null,
  autoRefreshInterval: 30000, // 30 seconds
  
  selectedPeriod: "monthly",
  comparisonMode: true,
  expandedSections: ["overview", "metrics"],
  viewMode: "cards",
  
  filterPresets: {
    "ultimo-mes": createDefaultFilters(),
    "ultimo-trimestre": {
      ...createDefaultFilters(),
      period: "monthly",
      startDate: (() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 3);
        return date;
      })(),
    },
    "ano-atual": {
      ...createDefaultFilters(),
      period: "monthly",
      startDate: new Date(new Date().getFullYear(), 0, 1),
    },
  },
  activePreset: "ultimo-mes",
};

export type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // Data actions
      setData: (data: DashboardData) =>
        set((state) => {
          state.data = data;
          state.lastUpdated = new Date();
          state.error = null;
        }),

      setLoading: (loading: boolean) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error: string | null) =>
        set((state) => {
          state.error = error;
          state.loading = false;
        }),

      clearData: () =>
        set((state) => {
          state.data = null;
          state.lastUpdated = null;
          state.error = null;
        }),      // Filter actions
      setFilters: (filters: Partial<DashboardFilters>) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters };
          state.activePreset = null; // Clear active preset when manually changing filters
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = createDefaultFilters();
          state.activePreset = "ultimo-mes";
        }),

      applyFilterPreset: (presetName: string) =>
        set((state) => {
          const preset = state.filterPresets[presetName];
          if (preset) {
            state.filters = { ...preset };
            state.activePreset = presetName;
          }
        }),

      saveFilterPreset: (name: string, filters: DashboardFilters) =>
        set((state) => {
          state.filterPresets[name] = { ...filters };
        }),

      deleteFilterPreset: (name: string) =>
        set((state) => {
          delete state.filterPresets[name];
          if (state.activePreset === name) {
            state.activePreset = null;
          }
        }),

      // Real-time actions
      enableRealTime: () =>
        set((state) => {
          state.realTimeEnabled = true;
          state.filters.includeRealTime = true;
        }),

      disableRealTime: () =>
        set((state) => {
          state.realTimeEnabled = false;
          state.filters.includeRealTime = false;
        }),

      setRealTimeData: (data: RealTimeMetrics) =>
        set((state) => {
          state.realTimeData = data;
        }),

      setAutoRefreshInterval: (interval: number) =>
        set((state) => {
          state.autoRefreshInterval = Math.max(10000, interval); // Minimum 10 seconds
        }),      // UI actions
      setPeriod: (period: "daily" | "weekly" | "monthly" | "yearly") =>
        set((state) => {
          state.selectedPeriod = period;
          state.filters.period = period;
          
          // Update date range based on period
          const now = new Date();
          const startDate = new Date();
          
          switch (period) {
            case "daily":
              startDate.setDate(now.getDate() - 30); // Last 30 days
              break;
            case "weekly":
              startDate.setDate(now.getDate() - 7 * 12); // Last 12 weeks
              break;
            case "monthly":
              startDate.setMonth(now.getMonth() - 12); // Last 12 months
              break;
            case "yearly":
              startDate.setFullYear(now.getFullYear() - 5); // Last 5 years
              break;
          }
          
          state.filters.startDate = startDate;
          state.filters.endDate = now;
        }),

      toggleComparison: () =>
        set((state) => {
          state.comparisonMode = !state.comparisonMode;
          state.filters.includeComparisons = state.comparisonMode;
        }),

      expandSection: (sectionId: string) =>
        set((state) => {
          if (!state.expandedSections.includes(sectionId)) {
            state.expandedSections.push(sectionId);
          }
        }),

      collapseSection: (sectionId: string) =>
        set((state) => {
          state.expandedSections = state.expandedSections.filter(id => id !== sectionId);
        }),

      setViewMode: (mode: "cards" | "charts" | "table") =>
        set((state) => {
          state.viewMode = mode;
        }),

      // Utility actions
      refresh: () =>
        set((state) => {
          state.lastUpdated = null; // This will trigger a refetch
        }),

      reset: () =>
        set(() => ({ ...initialState })),
    }))
  )
);

// Selectors for common patterns
export const useDashboardData = () => useDashboardStore((state) => state.data);
export const useDashboardFilters = () => useDashboardStore((state) => state.filters);
export const useDashboardLoading = () => useDashboardStore((state) => state.loading);
export const useDashboardError = () => useDashboardStore((state) => state.error);
export const useRealTimeData = () => useDashboardStore((state) => state.realTimeData);
export const useRealTimeEnabled = () => useDashboardStore((state) => state.realTimeEnabled);

// Action selectors
export const useDashboardActions = () => useDashboardStore((state) => ({
  setData: state.setData,
  setLoading: state.setLoading,
  setError: state.setError,
  setFilters: state.setFilters,
  resetFilters: state.resetFilters,
  enableRealTime: state.enableRealTime,
  disableRealTime: state.disableRealTime,
  setPeriod: state.setPeriod,
  refresh: state.refresh,
  reset: state.reset,
}));