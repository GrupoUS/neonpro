import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TwentyFirstToolbar } from '@21st-extension/toolbar-react';
import { ReactPlugin } from '@21st-extension/react';

const queryClient = new QueryClient();

// Note: Router is mounted in main.tsx via <RouterProvider /> from @tanstack/react-router
// This component is only responsible for app-wide providers and common UI.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Single toast provider mounted via Sonner */}
      <Sonner />
      {/* 21st.dev Toolbar - only runs in development mode */}
      <TwentyFirstToolbar
        config={{
          plugins: [ReactPlugin],
        }}
      />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
