import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRootRoute, createRouter } from '@tanstack/react-router';
import { createMemoryHistory } from '@tanstack/history';
import React from 'react';
import { Route as AppointmentsRoute } from '@/routes/appointments';

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  const root = createRootRoute();
  const router = createRouter({
    routeTree: root.addChildren([]),
    history: createMemoryHistory({ initialEntries: ['/appointments'] }),
  });
  return (
    <QueryClientProvider client={qc}>
      <RouterProvider router={router}>{children}</RouterProvider>
    </QueryClientProvider>
  );
}

describe('Appointments route', () => {
  it('shows empty state when no appointments', async () => {
    const Component = (AppointmentsRoute as any).options.component;

    render(
      <Wrapper>
        <Component />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhum agendamento encontrado/i)).toBeInTheDocument();
    });
  });
});
