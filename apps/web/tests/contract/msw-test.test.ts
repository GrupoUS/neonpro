import { describe, expect, it } from 'vitest';
import { server } from '../mocks/server';

describe('MSW Configuration Test', () => {
  it('should intercept HTTP requests with MSW', async () => {
    console.log('🧪 Testing MSW interception...')

    try {
      // Use absolute URL that matches our MSW handler
      const response = await fetch('http://localhost:3000/api/financial/dashboard', {
        headers: {
          Authorization: 'Bearer valid-test-token',
        },
      }

      console.log('📡 Response status:', response.status
      console.log('📡 Response ok:', response.ok

      const data = await response.json(
      console.log('📡 Response data keys:', Object.keys(data)

      // Basic assertion to verify MSW is working
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    } catch (_error) {
      console.error('❌ MSW test failed:', error
      throw error;
    }
  }

  it('should handle auth errors correctly', async () => {
    console.log('🧪 Testing MSW auth error handling...')

    try {
      // Call without auth header
      const response = await fetch('http://localhost:3000/api/financial/dashboard')

      console.log('📡 Auth error status:', response.status

      const data = await response.json(
      console.log('📡 Auth error data:', data

      expect(response.status).toBe(401
      expect(data.success).toBe(false);
    } catch (_error) {
      console.error('❌ Auth error test failed:', error
      throw error;
    }
  }
}
