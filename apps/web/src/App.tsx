import React from 'react';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { SupabaseCacheManager } from '@/lib/cache/supabase-cache-manager';
import { HealthcareRoutePrefetcher } from '@/lib/prefetching/route-prefetcher';
// import { TwentyFirstToolbar } from '@21st-extension/toolbar-react';
// import { ReactPlugin } from '@21st-extension/react';

// Cache Manager Component
const CacheManager = () => {
  React.useEffect(() => {
    const cacheManager = new SupabaseCacheManager(queryClient);
    return cacheManager.initialize();
  }, []);

  React.useEffect(() => {
    HealthcareRoutePrefetcher.setupHoverPrefetching();
    
    const currentPath = window.location.pathname;
    HealthcareRoutePrefetcher.prefetchBasedOnCurrentRoute(currentPath);
    
    // Setup manual cache manager for cleanup
    const manualCacheManager = new SupabaseCacheManager(queryClient);
    
    // Cleanup periódico de cache
    const cleanupInterval = setInterval(() => {
      manualCacheManager.cleanupExpiredCache();
      manualCacheManager.optimizeCache();
    }, 10 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return null;
};

// Note: Router is mounted in main.tsx via <RouterProvider /> from @tanstack/react-router
// This component is only responsible for app-wide providers and common UI.
const App = () => (
  <QueryClientProvider client={queryClient}>
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
  </QueryClientProvider>
);

export default App;
