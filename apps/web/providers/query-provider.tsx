'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { apiHelpers } from '@neonpro/shared/api-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time for different types of data
            staleTime: 1000 * 60 * 2, // 2 minutes default
            
            // Cache time (garbage collection)
            gcTime: 1000 * 60 * 5, // 5 minutes
            
            // Refetch behavior
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: true,
            
            // Retry logic with smart error handling
            retry: (failureCount, error) => {
              // Don't retry auth errors
              if (apiHelpers.isAuthError(error)) {
                return false;
              }
              
              // Don't retry validation errors (4xx except 401/403)
              if (error instanceof Error) {
                const message = error.message.toLowerCase();
                if (message.includes('validation') || 
                    message.includes('bad request') ||
                    message.includes('not found')) {
                  return false;
                }
              }
              
              // Retry network errors more aggressively
              if (apiHelpers.isNetworkError(error)) {
                return failureCount < 3;
              }
              
              // Default retry for server errors
              return failureCount < 2;
            },
            
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          
          mutations: {
            // Don't retry mutations by default (user should decide)
            retry: false,
            
            // Global mutation error handling
            onError: (error) => {
              console.error('Mutation error:', error);
              
              // Handle auth errors globally
              if (apiHelpers.isAuthError(error)) {
                // Could dispatch a logout action or show auth modal
                console.warn('Authentication error detected:', error);
              }
              
              // Handle network errors globally
              if (apiHelpers.isNetworkError(error)) {
                console.warn('Network error detected:', error);
                // Could show a network status indicator
              }
            },
            
            // Global mutation success handling
            onSuccess: (data, variables, context) => {
              console.debug('Mutation succeeded:', { data, variables });
            },
          },
        },
        
        // Global query cache configuration
        queryCache: undefined, // Use default
        mutationCache: undefined, // Use default
        
        //Logger configuration
        logger: {
          log: console.log,
          warn: console.warn,
          error: console.error,
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
          toggleButtonProps={{
            style: {
              marginLeft: '5px',
              transform: 'scale(0.8)',
              transformOrigin: 'bottom right',
            }
          }}
        />
      )}
    </QueryClientProvider>
  );
}