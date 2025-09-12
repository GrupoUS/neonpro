import { ConsentProvider } from '@/contexts/ConsentContext';
import { routeTree } from '@/routeTree.gen';
import { createMemoryHistory } from '@tanstack/history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

function Wrapper() {
  const qc = new QueryClient();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/clients'] }),
  });
  return (
    <QueryClientProvider client={qc}>
      <ConsentProvider>
        <RouterProvider router={router} />
      </ConsentProvider>
    </QueryClientProvider>
  );
}

describe('Clients route', () => {
  it('shows empty state when no clients', async () => {
    render(<Wrapper />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhum cliente encontrado/i)).toBeInTheDocument();
    });
  });
});
