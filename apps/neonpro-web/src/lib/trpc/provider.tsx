"use client";

/**
 * tRPC Provider for NeonPro Healthcare
 *
 * Provides:
 * - React Query client with healthcare-optimized settings
 * - tRPC client integration
 * - Development tools for debugging
 * - Error boundary for healthcare compliance
 */

interface TRPCProviderProps {
  children: React.ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Healthcare data caching strategy
            staleTime: 1000 * 60 * 5, // 5 minutes for most healthcare data
            cacheTime: 1000 * 60 * 10, // 10 minutes cache retention
            retry: (failureCount, error: any) => {
              // Don't retry on healthcare authentication errors
              if (error?.data?.code === "UNAUTHORIZED" || error?.data?.code === "FORBIDDEN") {
                return false;
              }
              // Retry network errors up to 3 times
              return failureCount < 3;
            },
            refetchOnWindowFocus: true, // Refetch on focus for data freshness
          },
          mutations: {
            // Healthcare mutations error handling
            retry: false, // Don't retry mutations to avoid duplicate medical records
            onError: (error: any) => {
              console.error("Healthcare mutation error:", {
                error: error.message,
                code: error.data?.code,
                timestamp: new Date().toISOString(),
              });
            },
          },
        },
      }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Show React Query devtools in development */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
