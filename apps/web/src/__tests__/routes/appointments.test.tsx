import { ThemeProvider } from '@/components/theme-provider';
import { ConsentProvider } from '@/contexts/ConsentContext';
import { routeTree } from '@/routeTree.gen';
import { createMemoryHistory } from '@tanstack/history';
import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Mock useQuery to return empty data
vi.mock(_'@tanstack/react-query',_async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(_() => ({
      data: [],
      isLoading: false,
      error: null,
    })),
  };
});

// Mock auth + supabase to avoid runtime errors and return empty datasets
vi.mock(_'@/hooks/useAuth',_() => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    session: { user: { id: 'test-user', email: 'test@example.com' } },
    profile: {
      _role: 'admin',
      permissions: { canViewAllAppointments: true },_} as any,
    loading: false,
    isAuthenticated: true,
    hasPermission: () => true,
    isRole: () => true,
  }),
}));

vi.mock(_'@/integrations/supabase/client',_() => {
  const makeChain = (_result: any) => {
    const p: any = Promise.resolve(result);
    p.select = () => p;
    p.eq = () => p;
    p.gte = () => p;
    p.lte = () => p;
    p.order = () => p;
    p.limit = () => p;
    return p;
  };
  return {
    supabase: {
      auth: {
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
      },
      from: () => makeChain({ data: [], count: 0, error: null }),
    },
  } as any;
});

function Wrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/appointments'] }),
  });
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <ConsentProvider>
          <div id='__root-test-wrapper'>
            <RouterProvider router={router} />
          </div>
        </ConsentProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe(_'Appointments route',_() => {
  it(_'shows empty state when no appointments',_async () => {
    render(<Wrapper />);

    await waitFor(_() => {
      expect(
        screen.getByText(/Nenhum agendamento encontrado/i),
      ).toBeInTheDocument();
    });
  });
});
