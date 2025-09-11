import { Toaster as Sonner, } from '@/components/ui/sonner'
import { Toaster, } from '@/components/ui/toaster'
import { TooltipProvider, } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import { createRootRoute, Outlet, } from '@tanstack/react-router'
import { TanStackRouterDevtools, } from '@tanstack/router-devtools'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <Toaster />
        <Sonner />
        {/* Only show devtools in development */}
        {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
      </TooltipProvider>
    </QueryClientProvider>
  ),
},)
