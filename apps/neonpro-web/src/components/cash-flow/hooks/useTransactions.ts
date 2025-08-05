"use client";

// Temporary transaction hooks for cash flow development
// These will be replaced with proper Supabase implementation

import type { useState } from "react";
import type { CashFlowEntry } from "../types";

export function useTransactionEntry(clinicId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEntry = async (
    entry: Omit<CashFlowEntry, "id" | "clinic_id" | "created_at" | "updated_at">,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newEntry: CashFlowEntry = {
        ...entry,
        id: Math.random().toString(36).substr(2, 9),
        clinic_id: clinicId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setIsLoading(false);
      return { data: newEntry, error: null };
    } catch (err) {
      setError("Failed to create transaction entry");
      setIsLoading(false);
      return { data: null, error: "Failed to create transaction entry" };
    }
  };

  const updateEntry = async (id: string, updates: Partial<CashFlowEntry>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsLoading(false);
      return { data: { id, ...updates }, error: null };
    } catch (err) {
      setError("Failed to update transaction entry");
      setIsLoading(false);
      return { data: null, error: "Failed to update transaction entry" };
    }
  };

  const deleteEntry = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsLoading(false);
      return { error: null };
    } catch (err) {
      setError("Failed to delete transaction entry");
      setIsLoading(false);
      return { error: "Failed to delete transaction entry" };
    }
  };

  return {
    createEntry,
    updateEntry,
    deleteEntry,
    isLoading,
    error,
  };
}
