import {
  QueryClient,
  QueryClient,
  QueryClientProvider,
  QueryClientProvider,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { mockExportData } from '@/../../__tests__/utils/mockData';
import { useExportData } from '@/hooks/analytics/useExportData';

// Mock fetch for API calls
global.fetch = vi.fn();

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

describe('useExportData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export data to PDF successfully', async () => {
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: () =>
        Promise.resolve(new Blob(['PDF content'], { type: 'application/pdf' })),
    } as Response);

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.exportToPDF(mockExportData);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: 'pdf',
        data: mockExportData,
      }),
    });

    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportError).toBeNull();
  });

  it('should export data to Excel successfully', async () => {
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: () =>
        Promise.resolve(
          new Blob(['Excel content'], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          })
        ),
    } as Response);

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.exportToExcel(mockExportData);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: 'excel',
        data: mockExportData,
      }),
    });

    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportError).toBeNull();
  });

  it('should handle export errors gracefully', async () => {
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValueOnce(new Error('Export failed'));

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.exportToPDF(mockExportData);
    });

    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportError).toBeTruthy();
    expect(result.current.exportError?.message).toBe('Export failed');
  });

  it('should show loading state during export', async () => {
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>;
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(promise as any);

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    // Start export
    act(() => {
      result.current.exportToPDF(mockExportData);
    });

    // Should be loading
    expect(result.current.isExporting).toBe(true);
    expect(result.current.exportError).toBeNull();

    // Resolve the promise
    act(() => {
      resolvePromise?.({
        ok: true,
        blob: () =>
          Promise.resolve(
            new Blob(['PDF content'], { type: 'application/pdf' })
          ),
      });
    });

    await waitFor(() => {
      expect(result.current.isExporting).toBe(false);
    });
  });

  it('should handle multiple simultaneous exports', async () => {
    const mockFetch = fetch as vi.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () =>
        Promise.resolve(new Blob(['content'], { type: 'application/pdf' })),
    } as Response);

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    });

    // Start multiple exports
    await act(async () => {
      await Promise.all([
        result.current.exportToPDF(mockExportData),
        result.current.exportToExcel(mockExportData),
        result.current.exportToCSV(mockExportData),
      ]);
    });

    // Should handle all exports successfully
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.current.isExporting).toBe(false);
    expect(result.current.exportError).toBeNull();
  });
});
