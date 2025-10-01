export interface TestServer {
  request: (options: {
    method: string;
    url: string;
    body?: string;
    headers?: Record<string, string>;
  }) => Promise<{
    status: number;
    headers: Record<string, string>;
    json: () => Promise<any>;
  }>;
}

export const setupTestServer = async (): Promise<TestServer> => {
  // Mock test server implementation
  return {
    request: async (options) => {
      // Mock implementation for testing
      const mockResponse = {
        status: 200,
        headers: { 'content-type': 'application/json' },
        json: async () => ({
          id: 'test-theme-id',
          name: 'NEONPRO',
          colorScheme: 'light',
          colors: {
            primary: '#ac9469',
            deepBlue: '#112031',
            accent: '#d4af37',
            neutral: '#B4AC9C',
            background: '#D2D0C8'
          },
          fonts: {
            sans: 'Inter',
            serif: 'Lora',
            mono: 'JetBrains Mono'
          }
        })
      };
      
      // Handle different endpoints
      if (options.url === '/api/theme/preview') {
        return {
          ...mockResponse,
          json: async () => ({
            previewId: 'preview-123',
            cssVariables: {
              '--primary': '#ac9469',
              '--deep-blue': '#112031'
            },
            expiresAt: new Date(Date.now() + 300000).toISOString()
          })
        };
      }
      
      if (options.url === '/api/components') {
        return {
          ...mockResponse,
          json: async () => ([
            {
              id: 'button',
              name: 'Button',
              version: '1.0.0'
            }
          ])
        };
      }
      
      return mockResponse;
    }
  };
};

export const cleanupTestServer = async (server: TestServer) => {
  // Cleanup implementation
  return Promise.resolve();
};