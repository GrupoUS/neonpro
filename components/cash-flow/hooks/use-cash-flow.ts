"use client";

// Cash Flow Hook - React hook for cash flow operations
// Following financial dashboard patterns from Context7 research

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { cashFlowService } from '../services/cash-flow-service';
import type { 
  CashFlowEntry, 
  CashFlowFilters,
  CashFlowAnalytics 
} from '../types';

interface UseCashFlowReturn {
  entries: CashFlowEntry[];
  analytics: CashFlowAnalytics | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  createEntry: (entry: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<CashFlowEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loadEntries: (filters?: CashFlowFilters, page?: number) => Promise<void>;
  loadAnalytics: (periodStart: string, periodEnd: string, registerId?: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCashFlow(clinicId: string, initialFilters?: CashFlowFilters): UseCashFlowReturn {
  const [entries, setEntries] = useState<CashFlowEntry[]>([]);
  const [analytics, setAnalytics] = useState<CashFlowAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CashFlowFilters | undefined>(initialFilters);

  const loadEntries = useCallback(async (newFilters?: CashFlowFilters, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = newFilters || filters;
      setFilters(filtersToUse);
      setCurrentPage(page);

      const result = await cashFlowService.getCashFlowEntries(clinicId, filtersToUse, page);
      
      setEntries(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cash flow entries';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clinicId, filters]);

  const loadAnalytics = useCallback(async (
    periodStart: string, 
    periodEnd: string, 
    registerId?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const analyticsData = await cashFlowService.getCashFlowAnalytics(
        clinicId, 
        periodStart, 
        periodEnd, 
        registerId
      );
      
      setAnalytics(analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);  const createEntry = useCallback(async (entry: Omit<CashFlowEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newEntry = await cashFlowService.createCashFlowEntry(entry);
      
      // Add the new entry to the current list (optimistic update)
      setEntries(prev => [newEntry, ...prev]);
      
      toast.success('Transaction created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<CashFlowEntry>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedEntry = await cashFlowService.updateCashFlowEntry(id, updates);
      
      // Update the entry in the current list (optimistic update)
      setEntries(prev => prev.map(entry => 
        entry.id === id ? updatedEntry : entry
      ));
      
      toast.success('Transaction updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await cashFlowService.deleteCashFlowEntry(id);
      
      // Remove the entry from the current list (optimistic update)
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast.success('Transaction deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await loadEntries(filters, currentPage);
  }, [loadEntries, filters, currentPage]);

  // Load initial data
  useEffect(() => {
    if (clinicId) {
      loadEntries(initialFilters);
    }
  }, [clinicId, loadEntries, initialFilters]);

  return {
    entries,
    analytics,
    loading,
    error,
    totalPages,
    currentPage,
    createEntry,
    updateEntry,
    deleteEntry,
    loadEntries,
    loadAnalytics,
    refetch
  };
}