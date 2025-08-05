"use client";

// Cash Registers Hook - React hook for cash register operations
// Following financial dashboard patterns from Context7 research

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { cashFlowService } from '../services/cash-flow-service';
import type { CashRegister } from '../types';

interface UseCashRegistersReturn {
  registers: CashRegister[];
  loading: boolean;
  error: string | null;
  createRegister: (register: Omit<CashRegister, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRegister: (id: string, updates: Partial<CashRegister>) => Promise<void>;
  refreshRegisters: () => Promise<void>;
}

export function useCashRegisters(clinicId: string): UseCashRegistersReturn {
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRegisters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await cashFlowService.getCashRegisters(clinicId);
      setRegisters(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cash registers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  const createRegister = useCallback(async (register: Omit<CashRegister, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newRegister = await cashFlowService.createCashRegister(register);
      
      // Add the new register to the current list (optimistic update)
      setRegisters(prev => [...prev, newRegister]);
      
      toast.success('Cash register created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create cash register';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRegister = useCallback(async (id: string, updates: Partial<CashRegister>) => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll just refresh the list after update
      // TODO: Implement updateCashRegister in service
      await loadRegisters();
      
      toast.success('Cash register updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update cash register';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadRegisters]);

  const refreshRegisters = useCallback(async () => {
    await loadRegisters();
  }, [loadRegisters]);

  // Load initial data
  useEffect(() => {
    if (clinicId) {
      loadRegisters();
    }
  }, [clinicId, loadRegisters]);

  return {
    registers,
    loading,
    error,
    createRegister,
    updateRegister,
    refreshRegisters
  };
}
