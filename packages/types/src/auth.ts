// Authentication types for NeonPro healthcare platform
import type { BaseEntity } from './common.js'

// Estende o User do Supabase com dados específicos do healthcare
export interface AuthUser extends BaseEntity {
  email: string
  phone?: string
  emailVerified: boolean
  phoneVerified: boolean

  // Dados pessoais (LGPD compliant)
  firstName?: string
  lastName?: string
  displayName?: string
  avatar?: string

  // Dados profissionais específicos do healthcare
  profession?: ProfessionType
  license?: string // CRM, CRO, etc.
  clinic?: string

  // Configurações de privacidade (LGPD)
  lgpdConsent: HealthcareLGPDConsent
  dataRetention: HealthcareDataRetentionPolicy

  // Configurações de usuário
  preferences: UserPreferences

  lastLoginAt?: Date
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: Date
  expiresIn: number
}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  isEmailVerified: boolean
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpData extends AuthCredentials {
  firstName: string
  lastName: string
  profession: ProfessionType
  license?: string
  lgpdConsent: boolean
}

export interface AuthError {
  code: string
  message: string
  details?: string
}

export type ProfessionType =
  | 'medico'
  | 'enfermeiro'
  | 'fisioterapeuta'
  | 'nutricionista'
  | 'psicologo'
  | 'dentista'
  | 'admin'
  | 'recepcionista'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'pt-BR' | 'en-US'
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'clinic'
    shareData: boolean
  }
}

export interface HealthcareLGPDConsent {
  version: string
  acceptedAt: Date
  ipAddress: string
  userAgent: string
  consentTypes: {
    essential: boolean
    analytics: boolean
    marketing: boolean
    profiling: boolean
  }
}

export interface HealthcareDataRetentionPolicy {
  retentionDays: number
  autoDeleteAt?: Date
  lastReviewedAt: Date
}

// Auth Provider types for OAuth
export type AuthProvider = 'google' | 'facebook' | 'apple' | 'github'

export interface OAuthConfig {
  provider: AuthProvider
  redirectTo: string
  scopes?: string[]
}

// Password reset types
export interface PasswordResetRequest {
  email: string
  redirectTo: string
}

export interface PasswordUpdate {
  currentPassword: string
  newPassword: string
}

// Email verification
export interface EmailVerificationRequest {
  email: string
  redirectTo: string
}

// Auth hooks return types
export interface UseAuthReturn {
  // State
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  isEmailVerified: boolean

  // Actions
  signUp: (data: SignUpData) => Promise<{ error?: AuthError }>
  signIn: (credentials: AuthCredentials) => Promise<{ error?: AuthError }>
  signOut: () => Promise<{ error?: AuthError }>

  // OAuth
  signInWithOAuth: (config: OAuthConfig) => Promise<{ error?: AuthError }>

  // Password management
  resetPassword: (request: PasswordResetRequest) => Promise<{ error?: AuthError }>
  updatePassword: (update: PasswordUpdate) => Promise<{ error?: AuthError }>

  // Email verification
  resendEmailVerification: (request: EmailVerificationRequest) => Promise<{ error?: AuthError }>

  // User management
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error?: AuthError }>
  deleteAccount: () => Promise<{ error?: AuthError }>
}

// Route protection types
export interface ProtectedRouteProps {
  children: React.ReactNode
  requireEmailVerification?: boolean
  allowedProfessions?: ProfessionType[]
  fallback?: React.ReactNode
}

export interface RouteGuardConfig {
  requireAuth: boolean
  requireEmailVerification?: boolean
  allowedProfessions?: ProfessionType[]
  redirectTo?: string
}
