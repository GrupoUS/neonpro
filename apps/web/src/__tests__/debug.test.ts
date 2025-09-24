import { expect, test } from 'vitest'

test('debug environment', () => {
  console.warn('Global objects:', {
    document: typeof document !== 'undefined' ? 'document exists' : 'document undefined',
    window: typeof window !== 'undefined' ? 'window exists' : 'window undefined',
    global: typeof global !== 'undefined' ? 'global exists' : 'global undefined',
    globalThis: typeof globalThis !== 'undefined' ? 'globalThis exists' : 'globalThis undefined',
  })

  expect(true).toBe(true)
})
