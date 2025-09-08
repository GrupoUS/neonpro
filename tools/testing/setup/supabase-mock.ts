/**
 * Supabase Mock Setup - Loads first to prevent multiple client instances
 * This file must be loaded before any other setup files to ensure singleton pattern
 */

import { vi, } from 'vitest'

// Suppress Supabase warnings immediately
const { warn: originalConsoleWarn, } = console
console.warn = (...args) => {
  const message = args.join(' ',)
  if (
    message.includes('Multiple GoTrueClient instances detected',)
    || message.includes('GoTrueClient',)
    || message.includes('Multiple instances of auth client',)
  ) {
    return // Suppress these warnings
  }
  originalConsoleWarn.apply(console, args,)
}

// Create a singleton mock Supabase client to prevent "Multiple GoTrueClient instances" warning
let singletonMockSupabaseClient: unknown

const createMockSupabaseClient = () => {
  if (singletonMockSupabaseClient) {
    return singletonMockSupabaseClient
  }

  singletonMockSupabaseClient = {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: undefined, }, error: undefined, },)
      ),
      getUser: vi.fn(() => Promise.resolve({ data: { user: undefined, }, error: undefined, },)),
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn(), }, },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: undefined, error: undefined, },)),
      then: vi.fn((fn,) => fn({ data: [], error: undefined, },)),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: undefined, error: undefined, },)),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        list: vi.fn(),
        remove: vi.fn(),
      })),
    },
  }

  return singletonMockSupabaseClient
}

// Mock Supabase client creation with singleton pattern - this MUST be called early
vi.mock<typeof import('@supabase/supabase-js')>(
  '@supabase/supabase-js',
  () => ({
    createClient: vi.fn(() => createMockSupabaseClient()),
  }),
)

// Mock the GoTrueClient directly to prevent multiple instances warning
vi.mock<typeof import('@supabase/auth-js')>('@supabase/auth-js', () => {
  const originalModule = vi.importActual('@supabase/auth-js',)
  let singletonGoTrueClient: unknown

  return {
    ...originalModule,
    GoTrueClient: vi.fn().mockImplementation(() => {
      if (singletonGoTrueClient) {
        return singletonGoTrueClient
      }

      singletonGoTrueClient = {
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn(), }, },
        },),
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: undefined, }, error: undefined, },),
        getSession: vi.fn().mockResolvedValue({
          data: { session: undefined, },
          error: undefined,
        },),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: undefined, session: undefined, },
          error: undefined,
        },),
        signOut: vi.fn().mockResolvedValue({ error: undefined, },),
        signUp: vi.fn().mockResolvedValue({
          data: { user: undefined, session: undefined, },
          error: undefined,
        },),
        _handleAuthResponse: vi.fn(),
        _handleGoTrueSignIn: vi.fn(),
        _handleGoTrueSignUp: vi.fn(),
        _handleGoTrueSession: vi.fn(),
        _handleGoTrueUser: vi.fn(),
      }

      return singletonGoTrueClient
    },),
    AuthError: originalModule.AuthError || vi.fn(),
    AuthApiError: originalModule.AuthApiError || vi.fn(),
  }
},)

// Export the singleton for use in tests
export const mockSupabaseClient = createMockSupabaseClient()
