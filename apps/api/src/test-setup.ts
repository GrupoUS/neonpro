import { vi } from 'vitest';

// Mock global fetch to handle relative URLs in tests
const originalFetch = global.fetch;
global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  let url: string;

  if (typeof input === 'string') {
    // Handle relative URLs by prepending base URL
    if (input.startsWith('/')) {
      url = `http://local.test${input}`;
    } else {
      url = input;
    }
  } else if (input instanceof URL) {
    url = input.toString();
  } else {
    // RequestInfo case
    url = input.url;
  }

  // Import and use the app for API calls
  if (url.includes('local.test')) {
    const { default: app } = await import('./app');
    return app.request(new URL(url), init);
  }

  // For external calls, use original fetch
  return originalFetch(url, init);
}) as any;

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

  // Return Hono directly but add openapi methods
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

    // Add doc method for OpenAPI documentation
    app.doc = function(path: string, config: any) {
      console.log(`Registering OpenAPI doc at: ${path}`);
      return this.get(path, (c: any) => c.json(config));
    };

    // Add openAPIRegistry mock
    app.openAPIRegistry = {
      registerComponent: function(type: string, name: string, schema: any) {
        console.log(`Registering OpenAPI component: ${type}/${name}`);
      },
    };

    return app;
  };

  // Mock createRoute function
  const createRoute = vi.fn((config: any) => config);

  // Mock z from zod
  const z = {
    object: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    string: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    number: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    boolean: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    array: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    enum: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    literal: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    union: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
    optional: vi.fn(() => ({ parse: vi.fn(), safeParse: vi.fn() })),
  };

  return {
    OpenAPIHono: MockOpenAPIHono,
    createRoute,
    z,
  };
});

// Mock openapi-generator module to provide healthcare functions
vi.mock('./lib/openapi-generator', async () => {
  const { Hono } = await import('hono');

  // Mock createHealthcareOpenAPIApp
  const createHealthcareOpenAPIApp = vi.fn(() => {
    const app = new Hono();

    // Add openapi method
    app.openapi = function(route: any, ...handlers: any[]) {
      const path = route.path || '/';
      const method = route.method?.toLowerCase() || 'get';
      return this[method](path, ...handlers);
    };

    // Add doc method
    app.doc = function(path: string, config: any) {
      return this.get(path, (c: any) => c.json(config));
    };

    // Add openAPIRegistry mock
    app.openAPIRegistry = {
      registerComponent: function(type: string, name: string, schema: any) {
        console.log(`Registering OpenAPI component: ${type}/${name}`);
      },
    };

    return app;
  });

  // Mock createHealthcareRoute
  const createHealthcareRoute = vi.fn((config: any) => {
    console.log('createHealthcareRoute called with:', config);
    return {
      method: config.method,
      path: config.path,
      ...config,
    };
  });

  // Mock setupHealthcareSwaggerUI
  const setupHealthcareSwaggerUI = vi.fn((app: any) => {
    console.log('setupHealthcareSwaggerUI called');
    return app;
  });

  return {
    createHealthcareOpenAPIApp,
    createHealthcareRoute,
    setupHealthcareSwaggerUI,
    HealthcareSchemas: {},
  };
});
