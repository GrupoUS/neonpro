import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

// Create a simple MSW server just for this test
const testServer = setupServer(
  http.get('http://localhost:3000/api/test', () => {
    console.log('🎯 MSW handler called!');
    return HttpResponse.json({ message: 'MSW is working!' });
  }),
);

describe('MSW Direct Test', () => {
  beforeAll(() => {
    console.log('🔧 Starting test server...');
    testServer.listen({ onUnhandledRequest: 'warn' });
    console.log('✅ Test server started');
  });

  afterEach(() => {
    testServer.resetHandlers();
  });

  afterAll(() => {
    testServer.close();
  });

  it('should intercept requests with inline MSW setup', async () => {
    console.log('🧪 Testing direct MSW setup...');

    const response = await fetch('http://localhost:3000/api/test');
    console.log('📡 Response status:', response.status);

    const data = await response.json();
    console.log('📡 Response data:', data);

    expect(response.ok).toBe(true);
    expect(data.message).toBe('MSW is working!');
  });
});
