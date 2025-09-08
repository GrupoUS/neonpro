import { describe, expect, it, } from 'vitest'

// Minimal sanity test so that vitest discovers at least one test when invoked via @neonpro/tooling
// This ensures `pnpm test` does not fail due to "No test files found" in the tooling package.
describe('workspace sanity', () => {
  it('runs a trivial assertion', () => {
    expect(1 + 1,).toBe(2,)
  })
})
