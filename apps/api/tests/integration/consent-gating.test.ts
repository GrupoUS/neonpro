import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';

// Integration: Consent gating on patient balance

it('Integration: consent gating denies without consent header', async () => {
  const { default: clinical } = await import('../../src/routes/tools-clinical')
  const { requireConsent } = await import('../../src/middleware/authz')
  const app = new Hono(
  app.use('/v1/tools/clinical/patient/balance', requireConsent()
  app.route('/v1/tools/clinical', clinical

  const res = await app.request(
    'http://local.test/v1/tools/clinical/patient/balance',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clinicId: 'c1', patientId: 'p1' }),
    },
  
  expect(res.status).toBe(403
  const body = await res.json(
  expect(body.error).toBe('CONSENT_REQUIRED')
}

it('Integration: passes when consent provided', async () => {
  const { default: clinical } = await import('../../src/routes/tools-clinical')
  const { requireConsent } = await import('../../src/middleware/authz')
  const app = new Hono(
  app.use('/v1/tools/clinical/patient/balance', requireConsent()
  app.route('/v1/tools/clinical', clinical

  const res = await app.request(
    'http://local.test/v1/tools/clinical/patient/balance',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-consent': 'true' },
      body: JSON.stringify({ clinicId: 'c1', patientId: 'p1' }),
    },
  
  expect(res.ok).toBe(true);
  const body = await res.json(
  expect(body.patientId).toBe('p1')
  expect(body.consent.required).toBe(false);
}
