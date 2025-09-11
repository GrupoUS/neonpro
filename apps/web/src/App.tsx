import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Note: Router is mounted in main.tsx via <RouterProvider /> from @tanstack/react-router
// This component is only responsible for app-wide providers and common UI.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Routes are handled by TanStack Router (see src/routes) */}
      {/* Legacy navItems kept for future integration with route meta/UI components */}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
