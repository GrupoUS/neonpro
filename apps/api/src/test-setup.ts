import { vi } from 'vitest';

// Mock auth middleware to bypass authentication in tests
vi.mock('./middleware/authn', () => ({
  requireAuth: vi.fn(async (c: any, next: any) => {
    // Mock user object for tests
    c.set('user', { id: 'user-123', email: 'test@example.com' });
    c.set('userId', 'user-123');
    return next();
  }),
}));

// Mock LGPD middleware to bypass data protection checks in tests
vi.mock('./middleware/lgpd-middleware', () => ({
  dataProtection: {
    clientView: vi.fn(async (c: any, next: any) => {
      return next();
    }),
  },
}));

// Mock OpenAPI Hono to use regular Hono in tests (avoid validation overhead)
vi.mock('@hono/zod-openapi', async () => {
  const { Hono } = await import('hono');
  
  // Return Hono directly but add openapi method
  const MockOpenAPIHono = function() {
    const app = new Hono();
    
    // Add openapi method to the instance
    app.openapi = function(route: any, ...handlers: any[]) {
      const path = route.path || '/';
      const method = route.method?.toLowerCase() || 'get';
      
      console.log(`Registering route: ${method.toUpperCase()} ${path}`);
      console.log(`Handler count: ${handlers.length}`);
      
      // Call the appropriate HTTP method on this Hono instance
      return this[method](path, ...handlers);
    };
    
    return app;
  };
  
  return {
    OpenAPIHono: MockOpenAPIHono,
  };
});

// Mock createHealthcareRoute to return a simple route factory
vi.mock('./lib/openapi-generator', () => ({
  createHealthcareRoute: vi.fn((config: any) => {
    // Return the config object with the method and path preserved
    console.log('createHealthcareRoute called with:', config);
    return {
      method: config.method,
      path: config.path,
      ...config,
    };
  }),
  HealthcareSchemas: {},
}));