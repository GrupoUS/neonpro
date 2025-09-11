import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardComponent } from '@/routes/dashboard';
import React from 'react';
import { RouterProvider, createRootRoute, createRouter } from '@tanstack/react-router';
import { createMemoryHistory } from '@tanstack/history';

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  const root = createRootRoute();
  const router = createRouter({
    routeTree: root.addChildren([]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return (
    <QueryClientProvider client={qc}>
      <RouterProvider router={router}>{children}</RouterProvider>
    </QueryClientProvider>
  );
}

describe('DashboardComponent', () => {
  it('renders cards and metrics placeholders without crashing', async () => {
    render(
      <Wrapper>
        <DashboardComponent />
      </Wrapper>
    );

    // Headings
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();

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
