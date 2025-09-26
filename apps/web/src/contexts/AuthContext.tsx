import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { 
  AuthUser, 
  AuthSession, 
  AuthState, 
  AuthCredentials, 
  SignUpData, 
  AuthError,
  UseAuthReturn 
} from '@neonpro/types'
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'// Criar contexto de autenticação
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
      lastLoginAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined,
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
  }  // Inicializar autenticação
  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session)
    })

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Estado alterado: ${event}`)
      
      // Log para auditoria LGPD
      if (event === 'SIGNED_IN' && session?.user) {
        console.log(`[LGPD Audit] User login: ${session.user.id}`)
      } else if (event === 'SIGNED_OUT') {
        console.log(`[LGPD Audit] User logout`)
      }
      
      updateAuthState(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Implementar funções de autenticação
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
            details: error.status?.toString() 
          } 
        }
      }

      return {}
    } catch (err) {
      return { 
        error: { 
          code: 'SIGNUP_ERROR', 
          message: 'Erro interno durante o cadastro' 
        } 
      }
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
            details: error.status?.toString() 
          } 
        }
      }

      return {}
    } catch (err) {
      return { 
        error: { 
          code: 'SIGNIN_ERROR', 
          message: 'Erro interno durante o login' 
        } 
      }
    }
  }

  const signOut = async (): Promise<{ error?: AuthError }> => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { 
          error: { 
            code: error.message, 
            message: error.message 
          } 
        }
      }

      return {}
    } catch (err) {
      return { 
        error: { 
          code: 'SIGNOUT_ERROR', 
          message: 'Erro interno durante o logout' 
        } 
      }
    }
  }  // Implementações placeholder para outras funções
  const signInWithOAuth = async () => ({ error: { code: 'NOT_IMPLEMENTED', message: 'OAuth não implementado ainda' } })
  const resetPassword = async () => ({ error: { code: 'NOT_IMPLEMENTED', message: 'Reset de senha não implementado ainda' } })
  const updatePassword = async () => ({ error: { code: 'NOT_IMPLEMENTED', message: 'Atualização de senha não implementada ainda' } })
  const resendEmailVerification = async () => ({ error: { code: 'NOT_IMPLEMENTED', message: 'Reenvio de verificação não implementado ainda' } })
  const updateProfile = async () => ({ error: { code: 'NOT_IMPLEMENTED', message: 'Atualização de perfil não implementada ainda' } })
  const deleteAccount = async () => ({ error: { code: 'NOT_IMPLEMENTED', message: 'Exclusão de conta não implementada ainda' } })

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
    
    // OAuth (placeholder)
    signInWithOAuth,
    
    // Password management (placeholder)
    resetPassword,
    updatePassword,
    
    // Email verification (placeholder)
    resendEmailVerification,
    
    // User management (placeholder)
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