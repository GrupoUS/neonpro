// T006 OpenAPI exposure test (GREEN phase)
import { describe, expect, it } from 'vitest';
import { app } from '../../app';

describe('T006 /openapi.json contract', () => {
  it('returns spec with openapi field', async () => {
    const res = await app.request('/api/openapi.json');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('openapi');
    expect(body.info?.title).toBe('NeonPro API');
  });
});
