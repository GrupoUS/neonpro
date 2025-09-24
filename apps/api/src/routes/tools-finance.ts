import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
const app = new Hono();

const OverdueRequest = z.object({
  clinicId: z.string().min(1),
  asOfDate: z.string().optional(),
  locale: z.string().default('pt-BR'),
});

type OverdueInvoice = {
  id: string;
  patient: string;
  amount: number;
  dueDate: string;
  bucket: '0-30' | '31-60' | '61-90' | '90+';
};

type OverdueResponse = {
  items: OverdueInvoice[];
  totals: {
    byBucket: Record<OverdueInvoice['bucket'], number>;
    grandTotal: number;
  };
};

app.post('/overdue', zValidator('json', OverdueRequest), c => {
  const { clinicId: _clinicId } = c.req.valid('json');
  // Minimal GREEN with static demo payload (clinicId echoed for future filtering)
  const items: OverdueInvoice[] = [
    {
      id: 'inv_001',
      patient: 'Paciente A',
      amount: 120.5,
      dueDate: '2025-08-01',
      bucket: '31-60',
    },
    {
      id: 'inv_002',
      patient: 'Paciente B',
      amount: 300,
      dueDate: '2025-06-15',
      bucket: '90+',
    },
  ];
  const byBucket = { '0-30': 0, '31-60': 120.5, '61-90': 0, '90+': 300 };
  const grandTotal = 420.5;
  const resp: OverdueResponse = { items, totals: { byBucket, grandTotal } };
  return c.json(resp);
});

export default app;
