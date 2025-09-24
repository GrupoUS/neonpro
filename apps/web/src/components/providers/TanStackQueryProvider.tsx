import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';

// Create a single QueryClient instance with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes stale time - reduces unnecessary refetches
      staleTime: 1000 * 60 * 5,
      // Don't retry on 4xx errors
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      // Cache time - keep data in cache for 30 minutes
      gcTime: 1000 * 60 * 30,
      // Enable refetch on window focus for real-time updates
      refetchOnWindowFocus: true,
      // Refetch on reconnect for offline resilience
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations up to 2 times
      retry: 2,
      // Cache mutations for 5 minutes
      gcTime: 1000 * 60 * 5,
    },
  },
});

interface TanStackQueryProviderProps {
  children: React.ReactNode;
}

export function TanStackQueryProvider({ children }: TanStackQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Include React Query Devtools in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// Export the QueryClient for use in other components if needed
export { queryClient };

// Export hooks for common patterns
export const useTanStackQuery = () => {
  return queryClient;
};
