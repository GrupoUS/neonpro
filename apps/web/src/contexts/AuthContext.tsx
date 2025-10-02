/**
 * @file Auth Context
 *
 * Native Supabase authentication context following healthcare guidelines
 * Implements LGPD compliance and healthcare-specific features
 *
 * @version 2.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM, WCAG 2.1 AA
 */

import supabase from '@/integrations/supabase/client'
import type {
  AuthCredentials,
  AuthError,
  AuthSession,
  AuthState,
  AuthUser,
  OAuthConfig,
  PasswordResetRequest,
  SignUpData,
  UseAuthReturn,
} from '@neonpro/types'
import type {
  AuthChangeEvent,
  Session as SupabaseSession,
  User as SupabaseUser,
} from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'

// Criar contexto de autenticação
const AuthContext = createContext<UseAuthReturn | undefined>(undefined)

// Provider de autenticação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isEmailVerified: false,
  })

  // Converter User do Supabase para nosso tipo personalizado
  const convertSupabaseUser = (supabaseUser: SupabaseUser | null): AuthUser | null => {
    if (!supabaseUser) return null

    // Extrair metadados do usuário (dados customizados)
    const metadata = supabaseUser.user_metadata || {}
    const appMetadata = supabaseUser.app_metadata || {}

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      phone: supabaseUser.phone,
      emailVerified: !!supabaseUser.email_confirmed_at,
      phoneVerified: !!supabaseUser.phone_confirmed_at,

      // Dados pessoais
      firstName: metadata.firstName || metadata.first_name,
      lastName: metadata.lastName || metadata.last_name,
      displayName: metadata.displayName || metadata.full_name,
      avatar: metadata.avatar || metadata.avatar_url,

      // Dados profissionais
      profession: metadata.profession || appMetadata.profession,
      license: metadata.license,
      clinic: metadata.clinic,

      // LGPD - configurações padrão se não existirem
      lgpdConsent: metadata.lgpdConsent || {
        version: '1.0',
        acceptedAt: new Date(),
        ipAddress: '',
        userAgent: navigator.userAgent,
        consentTypes: {
          essential: true,
          analytics: false,
          marketing: false,
          profiling: false,
        },
      },

      dataRetention: metadata.dataRetention || {
        retentionDays: 2555, // 7 anos (padrão LGPD)
        lastReviewedAt: new Date(),
      },

      // Preferências padrão
      preferences: metadata.preferences || {
        theme: 'system',
        language: 'pt-BR',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        privacy: {
          profileVisibility: 'private',
          shareData: false,
        },
      },

      // Timestamps
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
      lastLoginAt: supabaseUser.last_sign_in_at
        ? new Date(supabaseUser.last_sign_in_at)
        : undefined,
    }
  }

  // Converter Session do Supabase para nosso tipo
  const convertSupabaseSession = (supabaseSession: SupabaseSession | null): AuthSession | null => {
    if (!supabaseSession) return null

    const user = convertSupabaseUser(supabaseSession.user)
    if (!user) return null

    return {
      user,
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token || '',
      expiresAt: new Date(supabaseSession.expires_at! * 1000),
      expiresIn: supabaseSession.expires_in || 0,
    }
  }

  // Atualizar estado de autenticação
  const updateAuthState = (supabaseSession: SupabaseSession | null) => {
    const session = convertSupabaseSession(supabaseSession)
    const user = session?.user || null

    setAuthState({
      user,
      session,
      isLoading: false,
      isAuthenticated: !!user,
      isEmailVerified: !!user?.emailVerified,
    })
  }

  // Inicializar autenticação seguindo as guidelines
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (isMounted) {
          updateAuthState(session)
        }
      } catch (error) {
        console.error('Failed to get initial session:', error)
        if (isMounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      }
    })()

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: SupabaseSession | null) => {
        // Log para auditoria LGPD
        if (event === 'SIGNED_IN' && session?.user) {
          // Criar registro de audit log
          try {
            await supabase.from('audit_logs').insert({
              table_name: 'auth.users',
              record_id: session.user.id,
              action: 'SIGN_IN',
              user_id: session.user.id,
              phi_accessed: false,
            })
          } catch (error) {
            console.error('Failed to create audit log:', error)
          }
        } else if (event === 'SIGNED_OUT') {
        }

        updateAuthState(session)
      },
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Implementar funções de autenticação nativas Supabase
  const signUp = async (data: SignUpData): Promise<{ error?: AuthError }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            profession: data.profession,
            license: data.license,
            lgpdConsent: {
              version: '1.0',
              acceptedAt: new Date().toISOString(),
              ipAddress: '', // Seria capturado do servidor
              userAgent: navigator.userAgent,
              consentTypes: {
                essential: true,
                analytics: false,
                marketing: false,
                profiling: false,
              },
            },
          },
        },
      })

      if (error) {
        return {
          error: {
            code: error.message,
            message: error.message,
            details: error.status?.toString(),
          },
        }
      }

      return {}
    } catch (err) {
      console.error('SignUp error:', err)
      return {
        error: {
          code: 'SIGNUP_ERROR',
          message: 'Erro interno durante o cadastro',
          details: err instanceof Error ? err.message : String(err),
        },
      }
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const signIn = async (credentials: AuthCredentials): Promise<{ error?: AuthError }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return {
          error: {
            code: error.message,
            message: error.message,
            details: error.status?.toString(),
          },
        }
      }

      return {}
    } catch (err) {
      console.error('SignIn error:', err)
      return {
        error: {
          code: 'SIGNIN_ERROR',
          message: 'Erro interno durante o login',
          details: err instanceof Error ? err.message : String(err),
        },
      }
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const signOut = async (): Promise<{ error?: AuthError }> => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return {
          error: {
            code: error.message,
            message: error.message,
          },
        }
      }

      return {}
    } catch (err) {
      console.error('SignOut error:', err)
      return {
        error: {
          code: 'SIGNOUT_ERROR',
          message: 'Erro interno durante o logout',
          details: err instanceof Error ? err.message : String(err),
        },
      }
    }
  }

  // OAuth com Google seguindo guidelines
  const signInWithOAuth = async (config: OAuthConfig): Promise<{ error?: AuthError }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const { error } = await supabase.auth.signInWithOAuth({
        provider: config.provider,
        options: {
          redirectTo: config.redirectTo,
        },
      })

      if (error) {
        return {
          error: {
            code: error.message,
            message: error.message,
            details: error.status?.toString(),
          },
        }
      }

      return {}
    } catch (err) {
      console.error('OAuth signIn error:', err)
      return {
        error: {
          code: 'OAUTH_ERROR',
          message: 'Erro interno durante login OAuth',
          details: err instanceof Error ? err.message : String(err),
        },
      }
    }
  }

  // Recuperação de senha
  const resetPassword = async (request: PasswordResetRequest): Promise<{ error?: AuthError }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return {
          error: {
            code: error.message,
            message: error.message,
          },
        }
      }

      return {}
    } catch (err) {
      console.error('ResetPassword error:', err)
      return {
        error: {
          code: 'RESET_PASSWORD_ERROR',
          message: 'Erro interno durante recuperação de senha',
          details: err instanceof Error ? err.message : String(err),
        },
      }
    }
  }

  // Implementações placeholder para outras funções
  const updatePassword = async () => ({
    error: { code: 'NOT_IMPLEMENTED', message: 'Atualização de senha não implementada ainda' },
  })
  const resendEmailVerification = async () => ({
    error: { code: 'NOT_IMPLEMENTED', message: 'Reenvio de verificação não implementado ainda' },
  })
  const updateProfile = async () => ({
    error: { code: 'NOT_IMPLEMENTED', message: 'Atualização de perfil não implementada ainda' },
  })
  const deleteAccount = async () => ({
    error: { code: 'NOT_IMPLEMENTED', message: 'Exclusão de conta não implementada ainda' },
  })

  const value: UseAuthReturn = {
    // State
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    isEmailVerified: authState.isEmailVerified,

    // Actions
    signUp,
    signIn,
    signOut,

    // OAuth
    signInWithOAuth,

    // Password management
    resetPassword,
    updatePassword,

    // Email verification
    resendEmailVerification,

    // User management
    updateProfile,
    deleteAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto de autenticação
export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
