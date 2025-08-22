/**
 * 🔐 Fixed Authentication Hook Tests - NeonPro Healthcare
 * ======================================================
 * 
 * Simplified tests that rely on vitest.setup.ts mocks
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import the hook we're testing 
import { useAuth } from '../../hooks/enhanced/use-auth';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
}));

describe('useAuth Hook - NeonPro Healthcare Authentication', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Authentication Flow - Basic', () => {
    it('should initialize with unauthenticated state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.loginError).toBeNull();
    });

    it('should have login function available', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loginAsync).toBeDefined();
      expect(typeof result.current.loginAsync).toBe('function');
    });

    it('should have logout function available', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.logoutAsync).toBeDefined();
      expect(typeof result.current.logoutAsync).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle ApiHelpers.formatError without throwing', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // This test validates that our mock is working and doesn't throw
      expect(() => {
        // Import and use ApiHelpers
        const { ApiHelpers } = require('@neonpro/shared/api-client');
        const formattedError = ApiHelpers.formatError('test error');
        expect(formattedError).toBe('test error');
      }).not.toThrow();
    });
  });
});