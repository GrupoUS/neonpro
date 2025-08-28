/**
 * API Setup File - Test Configuration for API Routes
 * NeonPro Healthcare System API Test Setup
 */

import { vi } from "vitest";

// Mock Supabase client for API tests
vi.mock<typeof import("@supabase/supabase-js")>(
  "@supabase/supabase-js",
  () => ({
    createClient: vi.fn(() => ({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: "test-user-id" } } },
          error: undefined,
        }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "test-user-id", email: "test@neonpro.com" } },
          error: undefined,
        }),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: undefined }),
        then: vi.fn().mockResolvedValue({ data: [], error: undefined }),
      })),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn(),
          download: vi.fn(),
          remove: vi.fn(),
          list: vi.fn(),
        })),
      },
      rpc: vi.fn().mockResolvedValue({ data: [], error: undefined }),
    })),
  }),
);

// Mock Next.js API request/response objects
export const mockRequest = (overrides = {}) => ({
  method: "GET",
  headers: {},
  query: {},
  body: {},
  cookies: {},
  url: "/api/test",
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
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NEXTAUTH_URL = "http://localhost:3000";

// Helper function for API route testing
export const testApiRoute = async (
  handler: unknown,
  req: unknown,
  res: unknown,
) => {
  return handler(req, res);
};
