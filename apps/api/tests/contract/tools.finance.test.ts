import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

// GREEN target: Finance overdue invoices minimal API
async function api(path: string, init?: RequestInit) {
  const { default: finance } = await import('../../src/routes/tools-finance');
  const app = new Hono();
  app.route('/v1/tools/finance', finance);
  const url = new URL(`http://local.test/v1${path}`);
  return app.request(url, init);
}

describe('Contract: Tool.finance.overdueInvoices', () => {
  it('returns overdue invoices with aging buckets and totals', async () => {
    const res = await api('/tools/finance/overdue', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clinicId: 'clinic_001', asOfDate: '2025-09-01', locale: 'pt-BR' }),
    });
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(Array.isArray(json.items)).toBe(true);
    expect(json.totals).toBeDefined();
    expect(json.totals.grandTotal).toBeGreaterThan(0);
  });
});
