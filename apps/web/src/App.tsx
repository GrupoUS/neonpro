import { TooltipProvider } from '@/components/ui/tooltip';
// import { SupabaseCacheManager } from '@/lib/cache/supabase-cache-manager'; // disabled for production type-check
// import { HealthcareRoutePrefetcher } from '@/lib/prefetching/route-prefetcher'; // disabled for production type-check
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/query-client';
import { trpc, trpcClient } from '@/lib/trpc';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
// import { TwentyFirstToolbar } from '@21st-extension/toolbar-react';
// import { ReactPlugin } from '@21st-extension/react';

// CopilotKit imports for healthcare AI integration
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import '@/styles/copilot-healthcare.css';

// Custom healthcare agent configuration
import { createHealthcareAgentConfig } from '@/lib/copilot-config';

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
const App = () => {
  // Healthcare agent configuration with UI/UX optimizations
  const healthcareConfig = createHealthcareAgentConfig();

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {/* CopilotKit Provider for Healthcare AI Integration */}
        <CopilotKit {...healthcareConfig}>
          <TooltipProvider>
            {/* Unified toast provider */}
            <Toaster />
            {/* Cache Manager for Supabase data */}
            <CacheManager />

            {/* Healthcare AI Chat Interface */}
            <CopilotPopup
              labels={{
                title: "Assistente NeonPro",
                initial: "Como posso ajudar com seus dados de saúde?",
                placeholder: "Digite sua pergunta sobre pacientes, agendamentos ou finanças...",
                button: "Abrir assistente"
              }}
              className="neonpro-copilot-popup"
              // Healthcare-optimized popup configuration
              defaultOpen={false}
              triggerClassName="neonpro-chat-trigger"
              style={{
                // NeonPro brand colors
                '--copilot-kit-primary-color': '#AC9469',
                '--copilot-kit-secondary-color': '#112031',
                '--copilot-kit-background': '#D2D0C8',
                '--copilot-kit-accent': '#d2aa60ff',

                // Accessibility and mobile-first
                '--copilot-kit-font-family': 'Inter, system-ui, sans-serif',
                '--copilot-kit-border-radius': '8px',
                '--copilot-kit-shadow': '4px 4px 8px rgba(0,0,0,0.15)',

                // Healthcare-appropriate spacing
                '--copilot-kit-spacing': '16px',
                '--copilot-kit-touch-target': '44px'
              } as React.CSSProperties}
            />

            {/* 21st.dev Toolbar - only runs in development mode */}
            {
              /* <TwentyFirstToolbar
            config={{
              plugins: [ReactPlugin],
            }}
          /> */
            }
          </TooltipProvider>
        </CopilotKit>
      </trpc.Provider>
    </QueryClientProvider>
  );
};

export default App;
