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
