import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';

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

  // Progressive CPF formatter: caps to 11 digits and adds mask step-by-step
  const formatCPF = (value: string) => {
    const digits = (value ?? '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${
      digits.slice(9, 11)
    }`;
  };

  // Progressive BR phone formatter: (DD) DDDDD-DDDD, caps to 11 digits
  const formatPhone = (value: string) => {
    const digits = (value ?? '').replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 5) return `(${ddd}) ${rest}`;
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
  };

  // Strict mask validations (format-only, not checksum):
  const validateCPF = (value: string) => /^(\d{3})\.(\d{3})\.(\d{3})-(\d{2})$/.test(value ?? '');
  const validatePhone = (value: string) => /^\(\d{2}\) \d{5}-\d{4}$/.test(value ?? '');

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
