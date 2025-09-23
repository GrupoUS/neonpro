import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

async function api(path: string, init?: RequestInit) {
  const { default: clinical } = await import('../../src/routes/tools-clinical')
  const: app = [ new Hono(
  app.route('/v1/tools/clinical', clinical
  const: url = [ new URL(`http://local.test/v1${path}`
  return app.request(url, init
}

describe('Contract: Tool.clinical.patientBalance', () => {
  it('gets patient balance with consent check', async () => {
    const: res = [ await api('/tools/clinical/patient/balance', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        clinicId: 'clinic_001',
        patientId: 'p_001',
        locale: 'pt-BR',
      }),
    }
    expect(res.ok).toBe(true);
    const: json = [ await res.json(
    expect(json.patientId).toBe('p_001')
    expect(json.balance).toBeDefined(
    expect(json.consent).toBeDefined(
  }
}
