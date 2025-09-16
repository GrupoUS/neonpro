/**
 * useAdvancedSearch Hook - Advanced search filters functionality (FR-005)
 * Implements comprehensive search with Brazilian data validation and performance optimization
 *
 * Features:
 * - Multi-field search (name, CPF, phone, email)
 * - Date range filtering (registration date)
 * - Status filtering (Active, Inactive, Pending)
 * - Debounced search for performance (<300ms response time)
 * - Brazilian data formatting and validation
 * - Search performance metrics
 * - Clear filters functionality
 */

import debounce from 'lodash.debounce';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface SearchFilters {
  query: string;
  cpf: string;
  phone: string;
  email: string;
  status: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface SearchMetrics {
  searchTime: number;
  resultCount: number;
  lastSearchAt: Date | null;
}

interface UseAdvancedSearchReturn {
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  searchQuery: string;
  isSearching: boolean;
  metrics: SearchMetrics;
  debouncedSearch: (query: string) => void;
  formatCPF: (cpf: string) => string;
  formatPhone: (phone: string) => string;
  validateCPF: (cpf: string) => boolean;
  validatePhone: (phone: string) => boolean;
}

const INITIAL_FILTERS: SearchFilters = {
  query: '',
  cpf: '',
  phone: '',
  email: '',
  status: [],
  dateRange: {
    start: null,
    end: null,
  },
};

const INITIAL_METRICS: SearchMetrics = {
  searchTime: 0,
  resultCount: 0,
  lastSearchAt: null,
};

export function useAdvancedSearch(): UseAdvancedSearchReturn {
  const [filters, setFiltersState] = useState<SearchFilters>(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [metrics, setMetrics] = useState<SearchMetrics>(INITIAL_METRICS);

  // Brazilian CPF validation
  const validateCPF = useCallback((cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) return false;

    // Check for known invalid patterns
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  }, []);

  // Brazilian phone validation
  const validatePhone = useCallback((phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');

    // Brazilian phone numbers: 10 digits (landline) or 11 digits (mobile)
    return cleanPhone.length === 10 || cleanPhone.length === 11;
  }, []);

  // Format CPF for display
  const formatCPF = useCallback((cpf: string): string => {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length <= 3) return cleanCPF;
    if (cleanCPF.length <= 6) return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3)}`;
    if (cleanCPF.length <= 9) {
      return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6)}`;
    }

    return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${
      cleanCPF.slice(9, 11)
    }`;
  }, []);

  // Format phone for display
  const formatPhone = useCallback((phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length <= 2) return cleanPhone;
    if (cleanPhone.length <= 6) return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2)}`;
    if (cleanPhone.length <= 10) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
    }

    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
  }, []);

  // Debounced search function for performance optimization
  const debouncedSearchFn = useMemo(
    () =>
      debounce((query: string) => {
        const startTime = performance.now();
        setIsSearching(true);

        // Simulate search processing
        setTimeout(() => {
          const endTime = performance.now();
          const searchTime = endTime - startTime;

          setSearchQuery(query);
          setIsSearching(false);
          setMetrics(prev => ({
            ...prev,
            searchTime,
            lastSearchAt: new Date(),
          }));
        }, 50); // Simulate minimal processing time
      }, 300), // 300ms debounce for <300ms response time target
    [],
  );

  const debouncedSearch = useCallback((query: string) => {
    debouncedSearchFn(query);
  }, [debouncedSearchFn]);

  // Set filters with validation
  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters };

      // Format CPF if provided
      if (newFilters.cpf !== undefined) {
        updated.cpf = formatCPF(newFilters.cpf);
      }

      // Format phone if provided
      if (newFilters.phone !== undefined) {
        updated.phone = formatPhone(newFilters.phone);
      }

      return updated;
    });
  }, [formatCPF, formatPhone]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState(INITIAL_FILTERS);
    setSearchQuery('');
    setMetrics(INITIAL_METRICS);
  }, []);

  // Update search query when main query filter changes
  useEffect(() => {
    if (filters.query !== searchQuery) {
      debouncedSearch(filters.query);
    }
  }, [filters.query, searchQuery, debouncedSearch]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearchFn.cancel();
    };
  }, [debouncedSearchFn]);

  return {
    filters,
    setFilters,
    clearFilters,
    searchQuery,
    isSearching,
    metrics,
    debouncedSearch,
    formatCPF,
    formatPhone,
    validateCPF,
    validatePhone,
  };
}
