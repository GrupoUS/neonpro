import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Route as AppointmentsRoute } from '@/routes/appointments';

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
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
