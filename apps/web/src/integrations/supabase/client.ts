import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

console.log('🔧 Criando cliente Supabase:', { url: supabaseUrl })

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

export const supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuração minimalista para debug
    persistSession: false, // Desabilitado temporariamente para debug
    autoRefreshToken: false, // Desabilitado temporariamente para debug
    detectSessionInUrl: false, // Desabilitado temporariamente para debug
  },
})

// Create a convenience export for the client
export const createSupabaseClient = () => supabase
// Back-compat named export expected by components
export const createClient = createSupabaseClient

// Default export for components expecting it
export default supabase
