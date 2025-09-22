import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

async function api(path: string, init?: RequestInit) {
  const { default: clinical } = await import('../../src/routes/tools-clinical')
  const app = new Hono(
  app.route('/v1/tools/clinical', clinical
  const url = new URL(`http://local.test/v1${path}`
  return app.request(url, init
}

describe('Contract: Tool.clinical.newTreatments', () => {
  it('lists new treatments with provider, codes, consent flag', async () => {
    const res = await api('/tools/clinical/treatments/new', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        clinicId: 'clinic_001',
        fromDate: '2025-08-01',
        locale: 'pt-BR',
      }),
    }
    expect(res.ok).toBe(true);
    const json = await res.json(
    expect(Array.isArray(json.items)).toBe(true);
    expect(json.items[0]).toHaveProperty('provider')
  }
}
