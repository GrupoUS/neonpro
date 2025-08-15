/**
 * API Setup File - Test Configuration for API Routes
 * NeonPro Healthcare System API Test Setup
 */

// Mock Supabase client for API tests
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@neonpro.com' } },
        error: null,
      }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
      })),
    },
    rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
  })),
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
export const testApiRoute = async (handler: any, req: any, res: any) => {
  return handler(req, res);
};
