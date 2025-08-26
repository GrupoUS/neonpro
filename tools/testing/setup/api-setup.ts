/**
 * API Setup File - Test Configuration for API Routes
 * NeonPro Healthcare System API Test Setup
 */

import { vi } from "vitest";

// Mock Supabase client for API tests
vi.mock<typeof import("@supabase/supabase-js")>(
  "@supabase/supabase-js",
  () => ({
    createClient: vi.fn(() => {
      // Create a chainable mock for database operations
      const createChainableMock = () => ({
        select: vi.fn(() => createChainableMock()),
        insert: vi.fn(() => createChainableMock()),
        update: vi.fn(() => createChainableMock()),
        delete: vi.fn(() => createChainableMock()),
        eq: vi.fn(() => createChainableMock()),
        neq: vi.fn(() => createChainableMock()),
        gt: vi.fn(() => createChainableMock()),
        gte: vi.fn(() => createChainableMock()),
        lt: vi.fn(() => createChainableMock()),
        lte: vi.fn(() => createChainableMock()),
        like: vi.fn(() => createChainableMock()),
        ilike: vi.fn(() => createChainableMock()),
        is: vi.fn(() => createChainableMock()),
        in: vi.fn(() => createChainableMock()),
        contains: vi.fn(() => createChainableMock()),
        containedBy: vi.fn(() => createChainableMock()),
        rangeGt: vi.fn(() => createChainableMock()),
        rangeGte: vi.fn(() => createChainableMock()),
        rangeLt: vi.fn(() => createChainableMock()),
        rangeLte: vi.fn(() => createChainableMock()),
        rangeAdjacent: vi.fn(() => createChainableMock()),
        overlaps: vi.fn(() => createChainableMock()),
        textSearch: vi.fn(() => createChainableMock()),
        match: vi.fn(() => createChainableMock()),
        not: vi.fn(() => createChainableMock()),
        or: vi.fn(() => createChainableMock()),
        order: vi.fn(() => createChainableMock()),
        limit: vi.fn(() => createChainableMock()),
        range: vi.fn(() => createChainableMock()),
        abortSignal: vi.fn(() => createChainableMock()),
        single: vi.fn().mockResolvedValue({
          data: { id: "test-id", name: "Test Item" },
          error: undefined,
        }),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: "test-id", name: "Test Item" },
          error: undefined,
        }),
        then: vi.fn().mockResolvedValue({
          data: [{ id: "test-id", name: "Test Item" }],
          error: undefined,
        }),
      });

      return {
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "test-user-id" } } },
            error: undefined,
          }),
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "test-user-id", email: "test@neonpro.com" } },
            error: undefined,
          }),
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: { id: "test-user-id" }, session: {} },
            error: undefined,
          }),
          signUp: vi.fn().mockResolvedValue({
            data: { user: { id: "test-user-id" }, session: {} },
            error: undefined,
          }),
          signOut: vi.fn().mockResolvedValue({ error: undefined }),
          onAuthStateChange: vi.fn().mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
          }),
        },
        from: vi.fn(() => createChainableMock()),
        storage: {
          from: vi.fn(() => ({
            upload: vi.fn().mockResolvedValue({
              data: { path: "test-path" },
              error: undefined,
            }),
            download: vi.fn().mockResolvedValue({
              data: new Blob(),
              error: undefined,
            }),
            remove: vi.fn().mockResolvedValue({
              data: [],
              error: undefined,
            }),
            list: vi.fn().mockResolvedValue({
              data: [],
              error: undefined,
            }),
          })),
        },
        rpc: vi.fn().mockResolvedValue({ data: [], error: undefined }),
      };
    }),
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
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    getHeader: vi.fn(),
    end: vi.fn(),
    redirect: vi.fn(),
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
  handler: (req: unknown, res: unknown) => Promise<unknown>,
  req: unknown,
  res: unknown,
) => {
  return handler(req, res);
};
