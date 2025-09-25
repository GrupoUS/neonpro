/**
 * Simple test example following KISS and YAGNI principles
 */

import { describe, expect, it } from 'vitest'

describe('Basic Functionality', () => {
  it('should pass a simple test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve(42)
    expect(result).toBe(42)
  })

  describe('String operations', () => {
    it('should concatenate strings', () => {
      const hello = 'Hello'
      const world = 'World'
      expect(`${hello} ${world}`).toBe('Hello World')
    })
  })
})