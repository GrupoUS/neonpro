import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';

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

  const formatCPF = (value: string) =>
    value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  const formatPhone = (value: string) =>
    value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{4})$/, '$1-$2')
      .slice(0, 15);
  const validateCPF = (value: string) => /\d{3}\.\d{3}\.\d{3}-\d{2}/.test(value);
  const validatePhone = (value: string) => /\(\d{2}\) \d{5}-\d{4}/.test(value);

  const metrics: AdvancedSearchMetrics = useMemo(
    () => ({
      totalFilters: Object.values(filters).filter(Boolean).length,
      lastSearchAt: undefined,
      searchTime: 0,
    }),
    [filters],
  );

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
