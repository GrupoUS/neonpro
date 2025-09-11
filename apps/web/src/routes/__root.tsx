import { ErrorBoundary } from '@/components/error-pages/ErrorBoundary';
import { NotFoundPage } from '@/components/error-pages/NotFoundPage';
import { ConsentBanner } from '@/components/ConsentBanner';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAnalytics } from '@/hooks/useAnalytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

const queryClient = new QueryClient();

function RootComponent() {
  // Initialize analytics based on consent
  useAnalytics();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className='flex min-h-screen flex-col'>
            <main className='flex-1'>
              <Outlet />
            </main>
          </div>
          <ConsentBanner />
          <Toaster />
          <Sonner />
          {/* Only show devtools in development */}
          {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});
