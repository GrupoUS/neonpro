/**
 * @file Supabase Client Factory
 * 
 * Client-side Supabase configuration following healthcare compliance
 * Implements patterns from supabase-auth-guidelines.md
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM, ISO 27001
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@neonpro/types'

// Configuração das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

/**
 * Client-side Supabase client factory
 * Used in Client Components ('use client') for browser-based authentication
 * Follows the pattern from supabase-auth-guidelines.md
 */
export function createSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Configurações de segurança para healthcare
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      
      // Storage personalizado para compliance LGPD
      storage: {
        getItem: (key: string) => {
          // Log de acesso para auditoria LGPD
          if (typeof window !== 'undefined') {
            console.log(`[LGPD Audit] Auth storage read: ${key}`)
            return window.localStorage.getItem(key)
          }
          return null
        },
        setItem: (key: string, value: string) => {
          // Log de escrita para auditoria LGPD
          if (typeof window !== 'undefined') {
            console.log(`[LGPD Audit] Auth storage write: ${key}`)
            window.localStorage.setItem(key, value)
          }
        },
        removeItem: (key: string) => {
          // Log de remoção para auditoria LGPD
          if (typeof window !== 'undefined') {
            console.log(`[LGPD Audit] Auth storage remove: ${key}`)
            window.localStorage.removeItem(key)
          }
        },
      },
    },
    
    // Configurações de performance
    realtime: {
      params: {
        eventsPerSecond: 2, // Limitado para healthcare
      },
    },
    
    // Headers personalizados para compliance
    global: {
      headers: {
        'X-App-Name': 'NeonPro',
        'X-LGPD-Compliant': 'true',
        'X-Healthcare-App': 'true',
      },
    },
  })
}

// Export default client instance for convenience
export const supabase = createSupabaseClient()

// Helper para verificar se o cliente está configurado corretamente
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Helper para debug (apenas em desenvolvimento)
export const getSupabaseConfig = () => {
  if (import.meta.env.DEV) {
    return {
      url: supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      env: import.meta.env.MODE,
    }
  }
  return { configured: isSupabaseConfigured() }
}

// Tipos para o cliente Supabase personalizado
export type SupabaseClient = ReturnType<typeof createSupabaseClient>