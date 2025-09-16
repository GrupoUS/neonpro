import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { formatCPF as formatCPFUtil, validateCPFMask, formatBRPhone, validateBRPhoneMask } from '@neonpro/utils';

export type AdvancedFilters = {
  query?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  status: string[];
  dateRange: { start: Date | null; end: Date | null };
};

export type AdvancedSearchMetrics = {
  totalFilters: number;
  lastSearchAt?: Date;
  searchTime: number;
};

export interface UseAdvancedSearchResult {
  filters: AdvancedFilters;
  setFilters: Dispatch<SetStateAction<AdvancedFilters>>;
  clearFilters: () => void;
  formatCPF: (value: string) => string;
  formatPhone: (value: string) => string;
  validateCPF: (value: string) => boolean;
  validatePhone: (value: string) => boolean;
  metrics: AdvancedSearchMetrics;
}

export function useAdvancedSearch(
  initial: AdvancedFilters = { status: [], dateRange: { start: null, end: null } },
): UseAdvancedSearchResult {
  const [filters, setFilters] = useState<AdvancedFilters>(initial);

  const formatCPF = (value: string) => formatCPFUtil(value);
  const formatPhone = (value: string) => formatBRPhone(value);
  const validateCPF = (value: string) => validateCPFMask(value);
  const validatePhone = (value: string) => validateBRPhoneMask(value);

  const metrics: AdvancedSearchMetrics = useMemo(() => {
    const nonEmpty = [
      filters.query && filters.query.trim() !== '' ? 1 : 0,
      filters.email && filters.email.trim() !== '' ? 1 : 0,
      filters.cpf && filters.cpf.trim() !== '' ? 1 : 0,
      filters.phone && filters.phone.trim() !== '' ? 1 : 0,
      (filters.status?.length ?? 0) > 0 ? 1 : 0,
      filters.dateRange?.start ? 1 : 0,
      filters.dateRange?.end ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
    return {
      totalFilters: nonEmpty,
      lastSearchAt: undefined,
      searchTime: 0,
    };
  }, [filters]);

  const clearFilters = () =>
    setFilters({
      query: '',
      email: '',
      cpf: '',
      phone: '',
      status: [],
      dateRange: { start: null, end: null },
    });

  return {
    filters,
    setFilters,
    clearFilters,
    formatCPF,
    formatPhone,
    validateCPF,
    validatePhone,
    metrics,
  };
}
