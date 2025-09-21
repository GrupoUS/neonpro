import { ThemeProvider } from '@/components/theme-provider';
import { ConsentProvider } from '@/contexts/ConsentContext';
import { routeTree } from '@/routeTree.gen';
import { createMemoryHistory } from '@tanstack/history';
import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Mock auth to always be authenticated in tests
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    session: { user: { id: 'test-user', email: 'test@example.com' } },
    profile: null,
    loading: false,
    isAuthenticated: true,
    hasPermission: () => true,
    isRole: () => true,
  }),
}));

// Mock supabase patients query to return empty data
vi.mock('@/integrations/supabase/client', () => {
  const makeChain = (_result: any) => {
    const p: any = Promise.resolve(result);
    p.select = () => p;
    p.order = () => p;
    p.limit = () => p;
    p.eq = () => p;
    p.or = () => p;
    return p;
  };
  const result = { data: [], count: 0, error: null };
  return {
    supabase: {
      auth: {
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
      },
      from: (_table: string) => makeChain(result),
    },
    signOut: vi.fn(),
  } as any;
});

function Wrapper() {
  const qc = new QueryClient();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/clients'] }),
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

describe('Clients route', () => {
  it('shows empty state when no clients', async () => {
    render(<Wrapper />);

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhum cliente encontrado/i),
      ).toBeInTheDocument();
    });
  });
});
