import { TooltipProvider } from '@/components/ui/tooltip';
// import { SupabaseCacheManager } from '@/lib/cache/supabase-cache-manager'; // disabled for production type-check
// import { HealthcareRoutePrefetcher } from '@/lib/prefetching/route-prefetcher'; // disabled for production type-check
import { queryClient } from '@/lib/query-client';
import { trpc, trpcClient } from '@/lib/trpc';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Sonner } from 'sonner';
// import { TwentyFirstToolbar } from '@21st-extension/toolbar-react';
// import { ReactPlugin } from '@21st-extension/react';

// Cache Manager Component
const CacheManager = () => {
  React.useEffect(() => {
    // Cache manager disabled in production type-check
    return () => {};
  }, []);

  React.useEffect(() => {
    // Prefetcher disabled in production type-check
    return () => {};
  }, []);

  return null;
};

// Note: Router is mounted in main.tsx via <RouterProvider /> from @tanstack/react-router
// This component is only responsible for app-wide providers and common UI.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <TooltipProvider>
        {/* Single toast provider mounted via Sonner */}
        <Sonner />
        {/* Cache Manager for Supabase data */}
        <CacheManager />
        {/* 21st.dev Toolbar - only runs in development mode */}
        {
          /* <TwentyFirstToolbar
        config={{
          plugins: [ReactPlugin],
        }}
      /> */
        }
      </TooltipProvider>
    </trpc.Provider>
  </QueryClientProvider>
);

export default App;
