// ==================================================
// TEST ENVIRONMENT SETUP - Core Infrastructure
// ==================================================

// Next.js Server Context Mocking for Next.js 15
const mockNextServer = {
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(() => []),
  })),
  headers: jest.fn(() => new Headers()),
  redirect: jest.fn(),
  notFound: jest.fn(),
};

// Mock Next.js async local storage for server context
jest.mock('next/headers', () => ({
  cookies: mockNextServer.cookies,
  headers: mockNextServer.headers,
}));

jest.mock('next/navigation', () => ({
  redirect: mockNextServer.redirect,
  notFound: mockNextServer.notFound,
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
}));

// ==================================================
// SUPABASE CLIENT MOCKING - Complete API Chain
// ==================================================

const createMockSupabaseClient = () => {
  const mockSelect = jest.fn().mockReturnThis();
  const mockInsert = jest.fn().mockReturnThis();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockDelete = jest.fn().mockReturnThis();
  const mockUpsert = jest.fn().mockReturnThis();

  const mockEq = jest.fn().mockReturnThis();
  const mockNeq = jest.fn().mockReturnThis();
  const mockGt = jest.fn().mockReturnThis();
  const mockGte = jest.fn().mockReturnThis();
  const mockLt = jest.fn().mockReturnThis();
  const mockLte = jest.fn().mockReturnThis();
  const mockLike = jest.fn().mockReturnThis();
  const mockIlike = jest.fn().mockReturnThis();
  const mockIn = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockRange = jest.fn().mockReturnThis();
  const mockSingle = jest.fn().mockReturnThis();

  // Mock execution methods that return promises
  const mockExecute = jest.fn().mockResolvedValue({ data: [], error: null });
  const mockThen = jest.fn((callback) => callback({ data: [], error: null }));
  const mockCatch = jest.fn();

  const createQueryBuilder = () => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    upsert: mockUpsert,
    eq: mockEq,
    neq: mockNeq,
    gt: mockGt,
    gte: mockGte,
    lt: mockLt,
    lte: mockLte,
    like: mockLike,
    ilike: mockIlike,
    in: mockIn,
    order: mockOrder,
    limit: mockLimit,
    range: mockRange,
    single: mockSingle,
    execute: mockExecute,
    then: mockThen,
    catch: mockCatch,
  });

  return {
    from: jest.fn(() => createQueryBuilder()),
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } },
        error: null,
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        download: jest.fn().mockResolvedValue({ data: {}, error: null }),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
    },
    realtime: {
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn().mockReturnThis(),
      })),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
};

// Create singleton Supabase client instance
const mockSupabaseClient = createMockSupabaseClient();

// Mock Supabase client creation
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  createClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabaseClient,
  createClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock('@/lib/db', () => ({
  db: mockSupabaseClient,
  supabase: mockSupabaseClient,
}));

// ==================================================
// PATIENT SERVICE MOCKING
// ==================================================

// Mock patient functions
jest.mock('@/lib/supabase/patients', () => ({
  getPatient: jest.fn().mockResolvedValue({
    id: 'test-patient-id',
    name: 'Test Patient',
    email: 'test@example.com',
    phone: '123-456-7890',
    dateOfBirth: '1990-01-01',
    gender: 'Other',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  getPatients: jest.fn().mockResolvedValue([]),
  createPatient: jest.fn().mockResolvedValue({ id: 'new-patient-id' }),
  updatePatient: jest.fn().mockResolvedValue({ id: 'updated-patient-id' }),
  deletePatient: jest.fn().mockResolvedValue({ success: true }),
  searchPatients: jest.fn().mockResolvedValue([]),
}));

// ==================================================
// GLOBAL TEST UTILITIES
// ==================================================

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Export utilities for tests
export { mockSupabaseClient, mockNextServer };
