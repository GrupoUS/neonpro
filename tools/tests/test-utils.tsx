/**
 * Testing utilities following official TanStack Query + React Testing Library patterns
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type React from 'react';

/**
 * Create a test QueryClient following official docs
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // ✅ turns retries off
        gcTime: 0, // ✅ prevent cache persistence between tests
        staleTime: 0, // ✅ always refetch for tests
      },
      mutations: {
        retry: false, // ✅ no mutation retries in tests
      },
    },
  });
};

/**
 * Custom render with QueryClient wrapper
 */
export const renderWithClient = (
  ui: React.ReactElement,
  options?: {
    client?: QueryClient;
    renderOptions?: Omit<RenderOptions, 'wrapper'>;
  },
) => {
  const { client = createTestQueryClient(), renderOptions } = options || {};

  const wrapper = ({ children }: { children: React.ReactNode; }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return {
    client,
    ...render(ui, { wrapper, ...renderOptions }),
  };
};

/**
 * Custom renderHook with QueryClient wrapper following official docs
 */
export const renderHookWithClient = <TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: {
    client?: QueryClient;
    initialProps?: TProps;
  },
) => {
  const { client = createTestQueryClient(), initialProps } = options || {};

  const wrapper = ({ children }: { children: React.ReactNode; }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return {
    client,
    ...renderHook(hook, { wrapper, initialProps }),
  };
};

/**
 * Access global test mocks - for compatibility with existing tests
 */
export const getGlobalMocks = () => ({
  supabaseClient: (globalThis as any).mockSupabaseClient,
  notificationService: (globalThis as any).mockNotificationService,
  lgpdService: (globalThis as any).mockLGPDService || (globalThis as any).mockLgpdService,
  cpfValidator: (globalThis as any).mockCpfValidator,
  queryClient: (globalThis as any).testQueryClient || (globalThis as any).queryClient,
});
