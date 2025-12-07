import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Log missing environment variables but don't throw to prevent white screen
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? '✓ set' : '✗ missing',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '✓ set' : '✗ missing',
  })
}

console.log('🔧 Criando cliente Supabase:', { url: supabaseUrl || 'NOT_SET' })

// Limpar storage antigo que pode estar corrompido
if (typeof window !== 'undefined') {
  console.log('🧹 Limpando storage do Supabase...')
  const keysToRemove = Object.keys(localStorage).filter(key =>
    key.startsWith('supabase.auth') || key.startsWith('sb-')
  )
  keysToRemove.forEach(key => {
    console.log(`  Removendo: ${key}`)
    localStorage.removeItem(key)
  })
}

// Use placeholder values if env vars are missing to prevent crash
// The app will show appropriate error messages when trying to use Supabase
export const supabase = supabaseCreateClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Configuração minimalista para debug
      persistSession: false, // Desabilitado temporariamente para debug
      autoRefreshToken: false, // Desabilitado temporariamente para debug
      detectSessionInUrl: false, // Desabilitado temporariamente para debug
    },
  }
)

// Create a convenience export for the client
export const createSupabaseClient = () => supabase
// Back-compat named export expected by components
export const createClient = createSupabaseClient

// Default export for components expecting it
export default supabase
