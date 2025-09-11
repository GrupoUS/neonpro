import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { createMemoryHistory } from '@tanstack/history';
import { routeTree } from '@/routeTree.gen';
import { ConsentProvider } from '@/contexts/ConsentContext';

function Wrapper() {
  const qc = new QueryClient();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/dashboard'] }),
  });
  return (
    <QueryClientProvider client={qc}>
      <ConsentProvider>
        <RouterProvider router={router} />
      </ConsentProvider>
    </QueryClientProvider>
  );
}

describe('Dashboard route', () => {
  it('renders cards and metrics placeholders without crashing', async () => {
    render(<Wrapper />);

    // Headings (wait for auth + data to settle)
    expect(await screen.findByRole('heading', { name: /Bem-vindo ao Dashboard/i })).toBeInTheDocument();

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
