import { useCallback, useState, } from 'react'

// Client-side types for MVP
interface AuthMethods {
  email: string
  password: string
}

interface MockUser {
  id: string
  email: string
  name: string
  role: string
  fullName?: string
  isActive?: boolean
  permissions?: Record<string, string>
  lastLoginAt?: Date
}

interface AuthState {
  user: MockUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

interface LoginResult {
  success: boolean
  user?: MockUser
  error?: string
}

interface RegisterCredentials extends AuthMethods {
  name: string
  clinicName?: string
  role?: string
}

interface RegisterResult {
  success: boolean
  user?: MockUser
  error?: string
}

// Mock implementation for MVP
export function useRealAuth() {
  const [authState, setAuthState,] = useState<AuthState>({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  },)

  // Mock login function
  const login = useCallback(async (credentials: AuthMethods,): Promise<LoginResult> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null, }))

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000,))

    // Mock successful login
    const mockUser = {
      id: 'mock-user-id',
      email: credentials.email,
      name: 'Mock User',
      role: 'admin',
    }

    setAuthState({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      error: null,
    },)

    return { success: true, user: mockUser, }
  }, [],)

  // Mock register function
  const register = useCallback(
    async (credentials: RegisterCredentials,): Promise<RegisterResult> => {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null, }))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000,))

      // Mock successful registration
      const mockUser = {
        id: 'mock-user-id',
        email: credentials.email,
        name: credentials.name,
        role: credentials.role || 'user',
      }

      setAuthState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      },)

      return { success: true, user: mockUser, }
    },
    [],
  )

  // Mock logout function
  const logout = useCallback(async () => {
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    },)
  }, [],)

  // Mock refresh auth function
  const refreshAuth = useCallback(async () => {
    // Mock refresh - do nothing for MVP
  }, [],)

  // Clear error message
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null, }))
  }, [],)

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    login,
    register,
    logout,
    clearError,
    refreshAuth,
  }
}

export type UseRealAuthReturn = ReturnType<typeof useRealAuth>
