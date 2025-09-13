import { vi } from 'vitest';
import { ConsentProvider } from '@/contexts/ConsentContext';
import { routeTree } from '@/routeTree.gen';
import { createMemoryHistory } from '@tanstack/history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock auth to appear authenticated in tests
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

// Mock supabase queries used by the dashboard to return empty results quickly
vi.mock('@/integrations/supabase/client', () => {
  const makeThenable = (result: any) => ({
    select: () => chain,
    order: () => chain,
    limit: () => chain,
    eq: () => chain,
    neq: () => chain,
    gte: () => chain,
    lte: () => chain,
    then: (resolve: any) => resolve(result),
  });
  const chain = makeThenable({ data: [], count: 0, error: null });
  return {
    supabase: {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: (_table: string) => chain,
    },
    signOut: vi.fn(),
  } as any;
});

function Wrapper() {
  const qc = new QueryClient();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/dashboard'] }),
  });
  return (
    <QueryClientProvider client={qc}>
      {/* Suppress error boundary noise */}
      <div id='__root-test-wrapper'>
      <ConsentProvider>
        <RouterProvider router={router} />
      </ConsentProvider>
      </div>
    </QueryClientProvider>
  );
}

describe('Dashboard route', () => {
  it('renders cards and metrics placeholders without crashing', async () => {
    render(<Wrapper />);

    // Headings (wait for auth + data to settle)
    expect(await screen.findByRole('heading', { name: /Bem-vindo ao Dashboard/i }))
      .toBeInTheDocument();

    // Cards labels
    expect(screen.getByText(/Consultas Hoje/i)).toBeInTheDocument();
    expect(screen.getByText(/Pacientes Ativos/i)).toBeInTheDocument();
    expect(screen.getByText(/Receita Mensal/i)).toBeInTheDocument();
    expect(screen.getByText(/Taxa de Presença/i)).toBeInTheDocument();

    // Recent activity section
    expect(screen.getByText(/Atividade Recente/i)).toBeInTheDocument();

    // Wait a tick for react-query (mocked supabase returns empty arrays)
    await waitFor(() => {
      expect(screen.getByText('Hoje')).toBeInTheDocument();
    });
  });
});
