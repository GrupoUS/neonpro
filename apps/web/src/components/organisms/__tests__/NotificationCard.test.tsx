import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import NotificationCard from '../NotificationCard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
      { id: 'a1', created_at: '2025-01-01T10:00:00.000Z', start_time: '2025-01-01T11:00:00.000Z', status: 'scheduled' },
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

vi.mock('@tanstack/react-router', async (importOriginal) => {
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
        <NotificationCard title="Notificações" pollIntervalMs={false} />
      </QueryClientProvider>
    );

    // Wait for items
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    // Expect at least one known item
    const list = screen.getByRole('list', { name: /notificações/i });
    const items = within(list).getAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);

    // Click first notification button inside first list item
    const btn = within(items[0]).getByRole('button');
    await userEvent.click(btn);

    // Nav captured
    expect((globalThis as any).__navigatedTo).toBeTruthy();
  });
});
