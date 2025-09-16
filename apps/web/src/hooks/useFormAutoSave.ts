/**
 * useFormAutoSave Hook - Auto-save form progress functionality
 * Implements FR-004: Auto-save form progress and allow recovery after browser refresh
 *
 * Features:
 * - Debounced auto-save to localStorage
 * - Form data recovery after page refresh
 * - Expiration of old saved data (24 hours)
 * - Recovery status and age tracking
 * - Error handling for corrupted data
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface SavedFormData {
  data: Record<string, any>;
  timestamp: number;
  version: string;
}

interface UseFormAutoSaveReturn {
  saveFormData: (data: Record<string, any>) => void;
  savedData: Record<string, any> | null;
  hasSavedData: boolean;
  lastSaved: Date | null;
  clearSavedData: () => void;
  canRecover: boolean;
  recoveryAge: number | null;
}

const STORAGE_PREFIX = 'form-autosave-';
const DEBOUNCE_DELAY = 1000; // 1 second
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours
const CURRENT_VERSION = '1.0';

export function useFormAutoSave(formKey: string): UseFormAutoSaveReturn {
  const [savedData, setSavedData] = useState<Record<string, any> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `${STORAGE_PREFIX}${formKey}`;

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedData: SavedFormData = JSON.parse(saved);
        const now = Date.now();

        // Check if data is expired
        if (now - parsedData.timestamp > EXPIRATION_TIME) {
          localStorage.removeItem(storageKey);
          setSavedData(null);
          setLastSaved(null);
          return;
        }

        setSavedData(parsedData.data);
        setLastSaved(new Date(parsedData.timestamp));
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
      // Clear corrupted data
      localStorage.removeItem(storageKey);
      setSavedData(null);
      setLastSaved(null);
    }
  }, [storageKey]);

  // Debounced save function
  const saveFormData = useCallback((data: Record<string, any>) => {
    // Don't save empty data
    if (!data || Object.keys(data).length === 0) {
      return;
    }

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      try {
        const saveData: SavedFormData = {
          data,
          timestamp: Date.now(),
          version: CURRENT_VERSION,
        };

        localStorage.setItem(storageKey, JSON.stringify(saveData));
        setSavedData(data);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save form data:', error);
      }
    }, DEBOUNCE_DELAY);
  }, [storageKey]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setSavedData(null);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear saved form data:', error);
    }
  }, [storageKey]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Calculate recovery status
  const hasSavedData = savedData !== null;
  const canRecover = hasSavedData && lastSaved !== null;
  const recoveryAge = lastSaved ? Date.now() - lastSaved.getTime() : null;

  return {
    saveFormData,
    savedData,
    hasSavedData,
    lastSaved,
    clearSavedData,
    canRecover,
    recoveryAge,
  };
}
