import {
  QueryClient,
  QueryClient,
  QueryClientProvider,
  QueryClientProvider,
} from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { mockAnalyticsData, mockErrorResponse } from '@/../../__tests__/utils/mockData';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';

// Mock Supabase client
vi.Mock('@/utils/supabase/client', () => ({
  createSupabaseClient: () => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAnalyticsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return analytics data successfully', async () => {
    // Mock successful API response
    const mockSupabase = require('@/utils/supabase/client').createSupabaseClient();
    mockSupabase.select.mockResolvedValueOnce({
      data: mockAnalyticsData,
      error: null,
    });

    const { result } = renderHook(
      () =>
        useAnalyticsData({
          dateRange: { start: '2024-01-01', end: '2024-01-31' },
          treatments: ['facial'],
        }),
      { wrapper: createWrapper() }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify successful data load
    expect(result.current.data).toEqual(mockAnalyticsData);
    expect(result.current.error).toBeNull();
    expect(result.current.isSuccess).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    // Mock error response
    const mockSupabase = require('@/utils/supabase/client').createSupabaseClient();
    mockSupabase.select.mockResolvedValueOnce(mockErrorResponse);

    const { result } = renderHook(
      () =>
        useAnalyticsData({
          dateRange: { start: '2024-01-01', end: '2024-01-31' },
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify error handling
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(true);
  });

  it('should refetch data when filters change', async () => {
    const mockSupabase = require('@/utils/supabase/client').createSupabaseClient();
    mockSupabase.select.mockResolvedValue({
      data: mockAnalyticsData,
      error: null,
    });

    const { result, rerender } = renderHook(({ filters }) => useAnalyticsData(filters), {
      wrapper: createWrapper(),
      initialProps: {
        filters: { dateRange: { start: '2024-01-01', end: '2024-01-31' } },
      },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Change filters
    rerender({
      filters: { dateRange: { start: '2024-02-01', end: '2024-02-28' } },
    });

    // Should trigger refetch
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify Supabase was called twice (initial load + refetch)
    expect(mockSupabase.select).toHaveBeenCalledTimes(2);
  });

  it('should cache data properly', async () => {
    const mockSupabase = require('@/utils/supabase/client').createSupabaseClient();
    mockSupabase.select.mockResolvedValue({
      data: mockAnalyticsData,
      error: null,
    });

    const filters = { dateRange: { start: '2024-01-01', end: '2024-01-31' } };

    // First hook instance
    const { result: result1 } = renderHook(() => useAnalyticsData(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Second hook instance with same filters
    const { result: result2 } = renderHook(() => useAnalyticsData(filters), {
      wrapper: createWrapper(),
    });

    // Should use cached data
    expect(result2.current.data).toEqual(mockAnalyticsData);
    expect(result2.current.isLoading).toBe(false);
  });
});
