import type { QueryClient, } from '@tanstack/react-query'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'professional' | 'receptionist'
  clinicId?: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string,) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

export interface ApiContextType {
  queryClient: QueryClient
  isOnline: boolean
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system',) => void
}

// Types are defined directly in this file
