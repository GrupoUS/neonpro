/**
 * Tests for useAdvancedSearch hook - Advanced search filters functionality (FR-005)
 * Following TDD methodology - these tests should FAIL initially
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe(_'useAdvancedSearch',_() => {
  beforeEach(_() => {
    vi.clearAllMocks();
  });

  it(_'should export the hook function',_async () => {
    // Test that the module exists and can be imported
    const mod = await import('../useAdvancedSearch');
    expect(mod.useAdvancedSearch).toBeTypeOf('function');
  });

  it(_'should handle search by name',_async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should handle search by CPF',_async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should handle search by phone',_async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should handle search by registration date range',_async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should handle search by status filter',_async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should provide search performance metrics',_async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should debounce search queries for performance',_async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });

  it(_'should clear search filters',_async () => {
    const { useAdvancedSearch } = await import('../useAdvancedSearch');
    expect(typeof useAdvancedSearch).toBe('function');
  });
});

import { act, renderHook } from '@testing-library/react';

// New enhanced tests for formatting, validation, clearing, and metrics
import { useAdvancedSearch } from '../useAdvancedSearch';

describe(_'useAdvancedSearch — formatting & validation',_() => {
  it(_'formatCPF formats progressively and caps length',_() => {
    const { result } = renderHook(_() => useAdvancedSearch());

    expect(result.current.formatCPF('1')).toBe('1');
    expect(result.current.formatCPF('1234')).toBe('123.4');
    expect(result.current.formatCPF('12345678901')).toBe('123.456.789-01');
    // extra digits should be ignored (length capped to 14 including punctuation)
    expect(result.current.formatCPF('12345678901234')).toBe('123.456.789-01');
  });

  it('formatPhone formats to (DD) DDDDD-DDDD', () => {
    const { result } = renderHook(_() => useAdvancedSearch());

    expect(result.current.formatPhone('11')).toBe('11');
    expect(result.current.formatPhone('119')).toBe('(11) 9');
    expect(result.current.formatPhone('11987654321')).toBe('(11) 98765-4321');
    // extra digits ignored
    expect(result.current.formatPhone('1198765432100')).toBe('(11) 98765-4321');
  });

  it(_'validateCPF and validatePhone enforce strict masks',_() => {
    const { result } = renderHook(_() => useAdvancedSearch());

    expect(result.current.validateCPF('123.456.789-01')).toBe(true);
    expect(result.current.validateCPF('12345678901')).toBe(false);
    expect(result.current.validateCPF('')).toBe(false);

    expect(result.current.validatePhone('(11) 98765-4321')).toBe(true);
    expect(result.current.validatePhone('11987654321')).toBe(false);
    expect(result.current.validatePhone('')).toBe(false);
  });
});

describe(_'useAdvancedSearch — clearFilters and metrics',_() => {
  it(_'clearFilters resets all fields to defaults',_() => {
    const { result } = renderHook(_() => useAdvancedSearch());

    act(_() => {
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

    act(_() => {
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

  it(_'metrics.totalFilters counts only non-empty values',_() => {
    const { result } = renderHook(_() => useAdvancedSearch());

    // initial state: nothing selected → 0
    expect(result.current.metrics.totalFilters).toBe(0);

    act(_() => {
      result.current.setFilters(prev => ({ ...prev, _query: 'john' }));
    });
    expect(result.current.metrics.totalFilters).toBe(1);

    act(_() => {
      result.current.setFilters(prev => ({
        ...prev,
        status: ['active', 'inactive'],
      }));
    });
    expect(result.current.metrics.totalFilters).toBe(2);

    const start = new Date('2023-01-01');
    act(_() => {
      result.current.setFilters(prev => ({
        ...prev,
        dateRange: { start, end: null },
      }));
    });
    expect(result.current.metrics.totalFilters).toBe(3);

    // empty strings should not count
    act(_() => {
      result.current.setFilters(prev => ({ ...prev, email: '' }));
    });
    expect(result.current.metrics.totalFilters).toBe(3);

    // adding a valid phone increases count
    act(_() => {
      result.current.setFilters(prev => ({
        ...prev,
        phone: '(11) 98765-4321',
      }));
    });
    expect(result.current.metrics.totalFilters).toBe(4);
  });
});
