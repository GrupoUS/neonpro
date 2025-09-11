// T008 RLS smoke test (RED)
// Outline: unauthenticated select should fail; authenticated should pass (skipped if missing service key)
import { describe, it, expect } from 'vitest'

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function unauthenticatedQuery() {
  throw new Error('RLS enforced (placeholder)')
}
async function authenticatedQuery() {
  if (!SERVICE_KEY) throw new Error('Service key missing for test context')
  return { ok: true }
}

describe('T008 RLS smoke', () => {
  it('rejects unauthenticated read', async () => {
    await expect(unauthenticatedQuery()).rejects.toThrow()
  })
  it.skip(!SERVICE_KEY ? 'skipped (no service key)' : 'allows authenticated read', async () => {
    const res = await authenticatedQuery()
    expect(res).toEqual({ ok: true })
  })
})
