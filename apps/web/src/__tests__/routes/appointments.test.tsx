import { vi } from 'vitest';
import { ConsentProvider } from '@/contexts/ConsentContext';
import { routeTree } from '@/routeTree.gen';
import { createMemoryHistory } from '@tanstack/history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';

// Mock useQuery to return empty data
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: [],
      isLoading: false,
      error: null,
    })),
  };
});

// Mock auth + supabase to avoid runtime errors and return empty datasets
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    session: { user: { id: 'test-user', email: 'test@example.com' } },
    profile: { role: 'admin', permissions: { canViewAllAppointments: true } } as any,
    loading: false,
    isAuthenticated: true,
    hasPermission: () => true,
    isRole: () => true,
  }),
}));

vi.mock('@/integrations/supabase/client', () => {
  const makeChain = (result: any) => {
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
      auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
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

describe('Appointments route', () => {
  it('shows empty state when no appointments', async () => {
    render(<Wrapper />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhum agendamento encontrado/i)).toBeInTheDocument();
    });
  });
});
