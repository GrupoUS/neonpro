/**
 * Supabase Mock Setup - Loads first to prevent multiple client instances
 * This file must be loaded before any other setup files to ensure singleton pattern
 */

// Suppress Supabase warnings immediately
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('Multiple GoTrueClient instances detected') ||
    message.includes('GoTrueClient') ||
    message.includes('Multiple instances of auth client')
  ) {
    return; // Suppress these warnings
  }
  originalConsoleWarn.apply(console, args);
};

// Create a singleton mock Supabase client to prevent "Multiple GoTrueClient instances" warning
let singletonMockSupabaseClient: any = null;

const createMockSupabaseClient = () => {
  if (singletonMockSupabaseClient) {
    return singletonMockSupabaseClient;
  }

  singletonMockSupabaseClient = {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      then: jest.fn((fn) => fn({ data: [], error: null })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        list: jest.fn(),
        remove: jest.fn(),
      })),
    },
  };

  return singletonMockSupabaseClient;
};

// Mock Supabase client creation with singleton pattern - this MUST be called early
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => createMockSupabaseClient()),
}));

// Mock the GoTrueClient directly to prevent multiple instances warning
jest.mock('@supabase/auth-js', () => {
  const originalModule = jest.requireActual('@supabase/auth-js');
  let singletonGoTrueClient: any = null;

  return {
    ...originalModule,
    GoTrueClient: jest.fn().mockImplementation(() => {
      if (singletonGoTrueClient) {
        return singletonGoTrueClient;
      }

      singletonGoTrueClient = {
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        getSession: jest
          .fn()
          .mockResolvedValue({ data: { session: null }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: null,
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        signUp: jest.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: null,
        }),
        _handleAuthResponse: jest.fn(),
        _handleGoTrueSignIn: jest.fn(),
        _handleGoTrueSignUp: jest.fn(),
        _handleGoTrueSession: jest.fn(),
        _handleGoTrueUser: jest.fn(),
      };

      return singletonGoTrueClient;
    }),
    AuthError: originalModule.AuthError || jest.fn(),
    AuthApiError: originalModule.AuthApiError || jest.fn(),
  };
});

// Export the singleton for use in tests
export const mockSupabaseClient = createMockSupabaseClient();

console.log(
  '🔧 Supabase singleton mock initialized - preventing multiple client instances'
);
