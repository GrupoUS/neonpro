// T043 Bundle scan test (RED)
// Expects scanBundleForSecrets() to detect SUPABASE_SERVICE_ROLE_KEY literal when present.
import { describe, it, expect } from 'vitest'
import * as bundleScan from '../../scripts/scan-bundle' // not yet implemented

describe('T043 bundle scan', () => {
  it('detects service role key pattern', () => {
    if (typeof (bundleScan as any).scanBundleForSecrets !== 'function') {
      expect(typeof (bundleScan as any).scanBundleForSecrets).toBe('function') // force fail
      return
    }
    const fake = '... SUPABASE_SERVICE_ROLE_KEY=sk_test_ABC123 ...'
    const result = (bundleScan as any).scanBundleForSecrets(fake)
    expect(result.found).toBe(true)
  })
})
