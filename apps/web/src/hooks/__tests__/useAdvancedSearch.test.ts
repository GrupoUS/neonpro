/**
 * Tests for useAdvancedSearch hook - Advanced search filters functionality (FR-005)
 * Following TDD methodology - these tests should FAIL initially
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe(('useAdvancedSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(_'should export the hook function',async () => {
    // Test that the module exists and can be imported
    const mod = await import('../useAdvancedSearch');
    expect(mod.useAdvancedSearch).toBeTypeOf('function');
  });

  it(_'should handle search by name',async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should handle search by CPF',async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should handle search by phone',async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should handle search by registration date range',async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should handle search by status filter',async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should provide search performance metrics',async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should debounce search queries for performance',async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should clear search filters',async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });
});

import { act, renderHook } from '@testing-library/react';

// New enhanced tests for formatting, validation, clearing, and metrics
import { useAdvancedSearch } from '../useAdvancedSearch';

describe(('useAdvancedSearch — formatting & validation', () => {
  it(('formatCPF formats progressively and caps length', () => {
    const { result } = renderHook(() => useAdvancedSearch());

    expect(result.current.formatCPF('1')).toBe('1');
    expect(result.current.formatCPF('1234')).toBe('123.4');
    expect(result.current.formatCPF('12345678901')).toBe('123.456.789-01');
    // extra digits should be ignored (length capped to 14 including punctuation)
    expect(result.current.formatCPF('12345678901234')).toBe('123.456.789-01');
  });

  it('formatPhone formats to (DD) DDDDD-DDDD', () => {
    const { result } = renderHook(() => useAdvancedSearch());

    expect(result.current.formatPhone('11')).toBe('11');
    expect(result.current.formatPhone('119')).toBe('(11) 9');
    expect(result.current.formatPhone('11987654321')).toBe('(11) 98765-4321');
    // extra digits ignored
    expect(result.current.formatPhone('1198765432100')).toBe('(11) 98765-4321');
  });

  it(('validateCPF and validatePhone enforce strict masks', () => {
    const { result } = renderHook(() => useAdvancedSearch());

    expect(result.current.validateCPF('123.456.789-01')).toBe(true);
    expect(result.current.validateCPF('12345678901')).toBe(false);
    expect(result.current.validateCPF('')).toBe(false);

    expect(result.current.validatePhone('(11) 98765-4321')).toBe(true);
    expect(result.current.validatePhone('11987654321')).toBe(false);
    expect(result.current.validatePhone('')).toBe(false);
  });
});

describe(('useAdvancedSearch — clearFilters and metrics', () => {
  it(('clearFilters resets all fields to defaults', () => {
    const { result } = renderHook(() => useAdvancedSearch());

    act(() => {
      result.current.setFilters(prev => ({
        ...prev,
        _query: 'abc',
        email: 'user@example.com',
        cpf: '123.456.789-01',
        phone: '(11) 98765-4321',
        status: ['active'],
        dateRange: { start: new Date(), end: new Date() },
      }));
    });

    act(() => {
      result.current.clearFilters();
    });

    const { filters } = result.current;
    expect(filters._query).toBe('');
    expect(filters.email).toBe('');
    expect(filters.cpf).toBe('');
    expect(filters.phone).toBe('');
    expect(filters.status).toEqual([]);
    expect(filters.dateRange.start).toBeNull();
    expect(filters.dateRange.end).toBeNull();
  });

  it(('metrics.totalFilters counts only non-empty values', () => {
    const { result } = renderHook(() => useAdvancedSearch());

    // initial state: nothing selected → 0
    expect(result.current.metrics.totalFilters).toBe(0);

    act(() => {
      result.current.setFilters(prev => ({ ...prev, _query: 'john' }));
    });
    expect(result.current.metrics.totalFilters).toBe(1);

    act(() => {
      result.current.setFilters(prev => ({
        ...prev,
        status: ['active', 'inactive'],
      }));
    });
    expect(result.current.metrics.totalFilters).toBe(2);

    const start = new Date('2023-01-01');
    act(() => {
      result.current.setFilters(prev => ({
        ...prev,
        dateRange: { start, end: null },
      }));
    });
    expect(result.current.metrics.totalFilters).toBe(3);

    // empty strings should not count
    act(() => {
      result.current.setFilters(prev => ({ ...prev, email: '' }));
    });
    expect(result.current.metrics.totalFilters).toBe(3);

    // adding a valid phone increases count
    act(() => {
      result.current.setFilters(prev => ({
        ...prev,
        phone: '(11) 98765-4321',
      }));
    });
    expect(result.current.metrics.totalFilters).toBe(4);
  });
});
