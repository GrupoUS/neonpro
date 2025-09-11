import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRootRoute, createRouter } from '@tanstack/react-router';
import { createMemoryHistory } from '@tanstack/history';
import React from 'react';
import { routeTree } from '@/routeTree.gen';
import { ConsentProvider } from '@/contexts/ConsentContext';

function Wrapper() {
  const qc = new QueryClient();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/appointments'] }),
  });
  return (
    <QueryClientProvider client={qc}>
      <ConsentProvider>
        <RouterProvider router={router} />
      </ConsentProvider>
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
