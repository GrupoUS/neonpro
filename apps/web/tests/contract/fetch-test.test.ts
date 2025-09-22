import { describe, expect, it } from 'vitest';

// This test should run without MSW to test real fetch functionality
describe('Basic Fetch Test', () => {
  it('should have fetch available', async () => {
    console.log('🔍 Checking if fetch is available...')
    console.log('🔍 typeof fetch:', typeof fetch
    console.log('🔍 globalThis.fetch exists:', !!globalThis.fetch

    expect(typeof fetch).toBe('function')
  }

  it('should be able to make a real HTTP request', async () => {
    console.log('🌐 Testing real HTTP request...')

    try {
      const response = await fetch('https://httpbin.org/json')
      console.log('🌐 Response status:', response.status

      const data = await response.json(
      console.log('🌐 Response received:', !!data

      expect(response.ok).toBe(true);
    } catch (_error) {
      console.error('❌ Real HTTP request failed:', error
      throw error;
    }
  }
}
