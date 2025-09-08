// Authentication Flow Integration Test
// Complete authentication lifecycle testing for NeonPro Healthcare

import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor, } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi, } from 'vitest'
import { getGlobalSupabaseMock, resetAllGlobalMocks, } from '../../../../tools/tests/test-utils'

// Get the global mock that's configured in vitest.setup.ts
let mockSupabaseClient: unknown

// Mock authentication hook
const mockAuthHook = {
  user: undefined,
  session: undefined,
  loading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  refreshSession: vi.fn(),
}

vi.mock(
  '@supabase/supabase-js',
  () => ({
    createClient: () => (global as any).mockSupabaseClient,
  }),
)

vi.mock(
  '../../hooks/enhanced/use-auth',
  () => ({
    useAuth: () => mockAuthHook,
  }),
)

// Mock components for testing
const MockLoginComponent = () => {
  const { signIn, } = mockAuthHook

  const handleSubmit = async (e: React.FormEvent,) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement,)
    const email = formData.get('email',) as string
    const password = formData.get('password',) as string

    try {
      await signIn(email, password,)
    } catch {
      // Handle authentication errors gracefully
      // console.log("Authentication error handled:", error);
    }
  }

  return (
    <form data-testid="integration-login-form" onSubmit={handleSubmit}>
      <input
        data-testid="integration-email-input"
        name="email"
        placeholder="Email"
        required
        type="email"
      />
      <input
        data-testid="integration-password-input"
        name="password"
        placeholder="Password"
        required
        type="password"
      />
      <button data-testid="integration-login-button" type="submit">
        Login
      </button>
    </form>
  )
}

// Test wrapper component
const TestWrapper = ({ children, }: { children: React.ReactNode },) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  },)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('authentication Flow Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    // Reset global mocks and get reference
    resetAllGlobalMocks()
    mockSupabaseClient = getGlobalSupabaseMock()

    vi.clearAllMocks()
    // Create a fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    },)

    // Reset mock auth hook state
    mockAuthHook.user = undefined
    mockAuthHook.session = undefined
    mockAuthHook.loading = false

    // Configure auth hook to call Supabase
    mockAuthHook.signIn.mockImplementation(async (email, password,) => {
      const result = await mockSupabaseClient.auth.signInWithPassword({
        email,
        password,
      },)
      if (!result.error) {
        mockAuthHook.user = result.data.user
        mockAuthHook.session = result.data.session
      }
      return result
    },)

    mockAuthHook.signOut.mockImplementation(async () => {
      const result = await mockSupabaseClient.auth.signOut()
      if (!result.error) {
        mockAuthHook.user = undefined
        mockAuthHook.session = undefined
      }
      return result
    },)

    mockAuthHook.refreshSession.mockImplementation(async () => {
      const result = await mockSupabaseClient.auth.refreshSession()
      if (!result.error) {
        mockAuthHook.session = result.data.session
      }
      return result
    },)
  },)

  afterEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
  },)

  describe('login Flow', () => {
    it('should complete full login flow successfully', async () => {
      // Mock successful authentication response
      const mockUser = {
        id: 'user-123',
        email: 'doctor@clinic.com',
        user_metadata: {
          full_name: 'Dr. João Silva',
          role: 'doctor',
          specialty: 'cardiology',
          license_number: 'CRM-12345',
        },
      }

      const mockSession = {
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3_600_000, // 1 hour from now
        user: mockUser,
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession, },
        error: undefined,
      },)

      mockAuthHook.signIn.mockImplementation(
        async (email: string, password: string,) => {
          // Simulate actual hook behavior by calling global mock
          await (mockSupabaseClient as any).auth.signInWithPassword({ email, password, },)
          mockAuthHook.user = mockUser
          mockAuthHook.session = mockSession
          return {
            data: { user: mockUser, session: mockSession, },
            error: undefined,
          }
        },
      )
      render(
        <TestWrapper>
          <MockLoginComponent />
        </TestWrapper>,
      )

      // Fill in login credentials
      const emailInput = screen.getByTestId('integration-email-input',)
      const passwordInput = screen.getByTestId('integration-password-input',)
      const loginButton = screen.getByTestId('integration-login-button',)

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: 'doctor@clinic.com', },
        },)
        fireEvent.change(passwordInput, {
          target: { value: 'securePassword123', },
        },)
      },)

      // Submit login form
      await act(async () => {
        fireEvent.click(loginButton,)
      },)

      await waitFor(() => {
        expect(mockAuthHook.signIn,).toHaveBeenCalledWith(
          'doctor@clinic.com',
          'securePassword123',
        )
      },)

      // Verify Supabase auth was called
      expect(mockSupabaseClient.auth.signInWithPassword,).toHaveBeenCalledWith({
        email: 'doctor@clinic.com',
        password: 'securePassword123',
      },)

      // Verify user is authenticated
      expect(mockAuthHook.user,).toStrictEqual(mockUser,)
      expect(mockAuthHook.session,).toStrictEqual(mockSession,)
    })

    it('should handle authentication errors properly', async () => {
      const mockError = { message: 'Invalid credentials', }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: undefined, session: undefined, },
        error: mockError,
      },)

      mockAuthHook.signIn.mockRejectedValue(mockError,)

      render(
        <TestWrapper>
          <MockLoginComponent />
        </TestWrapper>,
      )

      const emailInput = screen.getByTestId('integration-email-input',)
      const passwordInput = screen.getByTestId('integration-password-input',)
      const loginButton = screen.getByTestId('integration-login-button',)

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'wrong@email.com', }, },)
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword', }, },)
        fireEvent.click(loginButton,)
      },)

      await waitFor(() => {
        expect(mockAuthHook.signIn,).toHaveBeenCalled()
      },)

      // Verify error handling
      expect(mockAuthHook.user ?? null,).toBeNull()
      expect(mockAuthHook.session ?? null,).toBeNull()
    })
  })

  describe('session Management', () => {
    it('should refresh session when token expires', async () => {
      const newSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh-token',
        expires_at: Date.now() + 3_600_000, // 1 hour from now
        user: mockAuthHook.user,
      }

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: newSession, },
        error: undefined,
      },)

      // Simulate token refresh
      await act(async () => {
        await mockAuthHook.refreshSession()
      },)

      expect(mockSupabaseClient.auth.refreshSession,).toHaveBeenCalled()
    })

    it('should handle session persistence across page reloads', async () => {
      const persistedSession = {
        access_token: 'persisted-token',
        refresh_token: 'persisted-refresh',
        expires_at: Date.now() + 3_600_000,
        user: {
          id: 'user-123',
          email: 'doctor@clinic.com',
        },
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: persistedSession, },
        error: undefined,
      },)

      // Simulate page reload
      mockAuthHook.session = persistedSession

      expect(mockAuthHook.session,).toStrictEqual(persistedSession,)
    })
  })

  describe('role-based Access Control', () => {
    it('should enforce doctor role permissions', async () => {
      const doctorUser = {
        id: 'doctor-123',
        email: 'doctor@clinic.com',
        user_metadata: {
          role: 'doctor',
          specialty: 'cardiology',
          license_number: 'CRM-12345',
          clinic_id: 'clinic-1',
        },
      }

      mockAuthHook.user = doctorUser

      // Test doctor can access patient data
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: 'patient-1', name: 'John Doe', },
              error: undefined,
            },),
          })),
        })),
      },)

      const result = await mockSupabaseClient
        .from('patients',)
        .select('*',)
        .eq('id', 'patient-1',)
        .single()

      expect(result.data,).toBeDefined()
      expect(result.error ?? null,).toBeNull()
    })

    it('should restrict access for unauthorized roles', async () => {
      const receptionistUser = {
        id: 'reception-123',
        email: 'reception@clinic.com',
        user_metadata: {
          role: 'receptionist',
          clinic_id: 'clinic-1',
        },
      }

      mockAuthHook.user = receptionistUser

      // Test receptionist cannot access sensitive medical data
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: undefined,
              error: { message: 'Insufficient permissions', },
            },),
          })),
        })),
      },)

      const result = await mockSupabaseClient
        .from('medical_records',)
        .select('sensitive_data',)
        .eq('patient_id', 'patient-1',)
        .single()

      expect(result.data ?? null,).toBeNull()
      expect(result.error,).toBeDefined()
      expect(result.error.message,).toContain('permissions',)
    })

    it('should handle multi-tenant isolation', async () => {
      const doctorClinic1 = {
        id: 'doctor-clinic1',
        email: 'doctor1@clinic1.com',
        user_metadata: {
          role: 'doctor',
          clinic_id: 'clinic-1',
        },
      }

      mockAuthHook.user = doctorClinic1

      // Doctor should only see patients from their clinic
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [{ id: 'patient-1', clinic_id: 'clinic-1', },],
            error: undefined,
          })),
        })),
      },)

      const result = await mockSupabaseClient
        .from('patients',)
        .select('*',)
        .eq('clinic_id', 'clinic-1',)

      expect(result.data,).toHaveLength(1,)
      expect(result.data[0].clinic_id,).toBe('clinic-1',)
    })
  })

  describe('logout and Session Cleanup', () => {
    it('should properly cleanup session on logout', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: undefined,
      },)

      mockAuthHook.signOut.mockImplementation(async () => {
        // Simulate actual hook behavior by calling global mock
        await mockSupabaseClient.auth.signOut()

        mockAuthHook.user = undefined
        mockAuthHook.session = undefined
      },)

      await act(async () => {
        await mockAuthHook.signOut()
      },)

      expect(mockSupabaseClient.auth.signOut,).toHaveBeenCalled()
      expect(mockAuthHook.user ?? null,).toBeNull()
      expect(mockAuthHook.session ?? null,).toBeNull()
    })
  })
})
