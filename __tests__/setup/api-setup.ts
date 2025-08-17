/**
 * API Setup File - Test Configuration for API Routes
 * NeonPro Healthcare System API Test Setup
 */

// Mock Supabase client for API tests
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => {
    // Create a chainable mock for database operations
    const createChainableMock = () => ({
      select: jest.fn(() => createChainableMock()),
      insert: jest.fn(() => createChainableMock()),
      update: jest.fn(() => createChainableMock()),
      delete: jest.fn(() => createChainableMock()),
      eq: jest.fn(() => createChainableMock()),
      neq: jest.fn(() => createChainableMock()),
      gt: jest.fn(() => createChainableMock()),
      gte: jest.fn(() => createChainableMock()),
      lt: jest.fn(() => createChainableMock()),
      lte: jest.fn(() => createChainableMock()),
      like: jest.fn(() => createChainableMock()),
      ilike: jest.fn(() => createChainableMock()),
      is: jest.fn(() => createChainableMock()),
      in: jest.fn(() => createChainableMock()),
      contains: jest.fn(() => createChainableMock()),
      containedBy: jest.fn(() => createChainableMock()),
      rangeGt: jest.fn(() => createChainableMock()),
      rangeGte: jest.fn(() => createChainableMock()),
      rangeLt: jest.fn(() => createChainableMock()),
      rangeLte: jest.fn(() => createChainableMock()),
      rangeAdjacent: jest.fn(() => createChainableMock()),
      overlaps: jest.fn(() => createChainableMock()),
      textSearch: jest.fn(() => createChainableMock()),
      match: jest.fn(() => createChainableMock()),
      not: jest.fn(() => createChainableMock()),
      or: jest.fn(() => createChainableMock()),
      order: jest.fn(() => createChainableMock()),
      limit: jest.fn(() => createChainableMock()),
      range: jest.fn(() => createChainableMock()),
      abortSignal: jest.fn(() => createChainableMock()),
      single: jest.fn().mockResolvedValue({
        data: { id: 'test-id', name: 'Test Item' },
        error: null,
      }),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { id: 'test-id', name: 'Test Item' },
        error: null,
      }),
      then: jest.fn().mockResolvedValue({
        data: [{ id: 'test-id', name: 'Test Item' }],
        error: null,
      }),
    });

    return {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: 'test-user-id' } } },
          error: null,
        }),
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@neonpro.com' } },
          error: null,
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' }, session: {} },
          error: null,
        }),
        signUp: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' }, session: {} },
          error: null,
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
      from: jest.fn(() => createChainableMock()),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'test-path' },
            error: null,
          }),
          download: jest.fn().mockResolvedValue({
            data: new Blob(),
            error: null,
          }),
          remove: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
          list: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        })),
      },
      rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
  }),
}));

// Mock Next.js API request/response objects
export const mockRequest = (overrides = {}) => ({
  method: 'GET',
  headers: {},
  query: {},
  body: {},
  cookies: {},
  url: '/api/test',
  ...overrides,
});

export const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    getHeader: jest.fn(),
    end: jest.fn(),
    redirect: jest.fn(),
  };
  return res;
};

// Mock environment variables for API tests
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Helper function for API route testing
export const testApiRoute = async (
  handler: (req: unknown, res: unknown) => Promise<unknown>,
  req: unknown,
  res: unknown
) => {
  return handler(req, res);
};
