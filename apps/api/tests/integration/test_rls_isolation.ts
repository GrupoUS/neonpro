import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

// Integration: RLS clinic isolation on finance overdue

describe('Integration: RLS isolation', () => {
  it('denies when clinic scope mismatches', async () => {
    const { default: finance } = await import('../../src/routes/tools-finance');
    const { requireClinicScope } = await import('../../src/middleware/authz');
    const app = new Hono();
    app.use('/v1/tools/finance/overdue', requireClinicScope());
    app.route('/v1/tools/finance', finance);

    const res = await app.request(
      'http://local.test/v1/tools/finance/overdue?clinicId=clinic_A',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-clinic-id': 'clinic_B',
        },
        body: JSON.stringify({ clinicId: 'clinic_A' }),
      },
    );
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('RLS_SCOPE_VIOLATION');
  });

  it('passes when clinic scope matches', async () => {
    const { default: finance } = await import('../../src/routes/tools-finance');
    const { requireClinicScope } = await import('../../src/middleware/authz');
    const app = new Hono();
    app.use('/v1/tools/finance/overdue', requireClinicScope());
    app.route('/v1/tools/finance', finance);

    const res = await app.request(
      'http://local.test/v1/tools/finance/overdue?clinicId=clinic_A',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-clinic-id': 'clinic_A',
        },
        body: JSON.stringify({ clinicId: 'clinic_A' }),
      },
    );
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.totals.grandTotal).toBeGreaterThan(0);
  });
});
