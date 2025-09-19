import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { vi } from 'vitest';
import NotificationCard from '../NotificationCard';

vi.mock('@/integrations/supabase/client', () => {
  // Build a tiny chainable mock for supabase.from().select().order().limit()
  const mkChain = (rows: any[]) => ({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
      }),
    }),
  });

  const tables: Record<string, any[]> = {
    appointments: [
      {
        id: 'a1',
        created_at: '2025-01-01T10:00:00.000Z',
        start_time: '2025-01-01T11:00:00.000Z',
        status: 'scheduled',
      },
    ],
    patients: [
      { id: 'p1', created_at: '2025-01-01T09:00:00.000Z', full_name: 'Maria Silva' },
    ],
    financial_transactions: [
      { id: 'f1', created_at: '2025-01-01T08:00:00.000Z', amount: 150, transaction_type: 'income' },
    ],
  };

  const supabase = {
    from: vi.fn().mockImplementation((table: string) => mkChain(tables[table] ?? [])),
  };
  return { supabase };
});

vi.mock('@tanstack/react-router', async importOriginal => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    useNavigate: () => (opts: any) => {
      // no-op capture
      (globalThis as any).__navigatedTo = opts?.to;
    },
  };
});

describe('NotificationCard', () => {
  test('renders aggregated notifications and navigates on click', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <NotificationCard title='Notificações' pollIntervalMs={false} />
      </QueryClientProvider>,
    );

    // Wait until any notification content is rendered (robust to non-list markup)
    const items = await screen.findAllByText(
      /Consulta agendada|Novo paciente cadastrado|Pagamento recebido/i,
    );
    expect(items.length).toBeGreaterThan(0);

    // Click the first notification to navigate
    await userEvent.click(items[0]);

    // Nav captured
    expect((globalThis as any).__navigatedTo).toBeTruthy();
  });
});
