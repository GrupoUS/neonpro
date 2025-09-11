// T005 Health endpoint contract test (GREEN phase)
import { describe, expect, it } from 'vitest';
import { app } from '../../app';

describe('T005 /health contract', () => {
  it('returns status ok payload', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
