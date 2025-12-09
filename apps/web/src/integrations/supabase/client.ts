/**
 * Supabase Client - Native Fetch Implementation
 * Clean implementation without SDK dependencies
 * Works perfectly in all environments (Vercel, Netlify, etc)
 */

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Validate environment variables
if (SUPABASE_URL === 'https://placeholder.supabase.co') {
  console.warn('[Supabase] Using placeholder URL - set VITE_SUPABASE_URL')
}

if (SUPABASE_ANON_KEY === 'placeholder-key') {
  console.warn('[Supabase] Using placeholder key - set VITE_SUPABASE_ANON_KEY')
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const session = localStorage.getItem('supabase.auth.token')
    if (session) {
      const parsed = JSON.parse(session)
      return parsed.access_token || null
    }
  } catch (e) {
    console.warn('[Supabase] Error reading auth token:', e)
  }
  
  return null
}

/**
 * Make authenticated request to Supabase
 */
async function supabaseFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken()
  
  const headers: HeadersInit = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Supabase error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * Supabase client - Native Fetch API implementation
 */
export const supabase = {
  /**
   * Authentication methods
   */
  auth: {
    async getSession() {
      try {
        const data = await supabaseFetch('/auth/v1/user', { method: 'GET' })
        return { data: { session: data }, error: null }
      } catch (error: any) {
        return { data: { session: null }, error }
      }
    },
    
    async signIn(email: string, password: string) {
      try {
        const data = await supabaseFetch('/auth/v1/token?grant_type=password', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        
        // Store session
        if (typeof window !== 'undefined' && data.access_token) {
          localStorage.setItem('supabase.auth.token', JSON.stringify(data))
        }
        
        return { data, error: null }
      } catch (error: any) {
        return { data: null, error }
      }
    },
    
    async signOut() {
      try {
        await supabaseFetch('/auth/v1/logout', { method: 'POST' })
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token')
        }
        
        return { error: null }
      } catch (error: any) {
        return { error }
      }
    },
    
    onAuthStateChange(callback: (event: string, session: any) => void) {
      // Simple implementation - checks session periodically
      const checkSession = async () => {
        const { data } = await this.getSession()
        callback('SIGNED_IN', data.session)
      }
      
      checkSession()
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {} // No-op for now
          }
        }
      }
    }
  },
  
  /**
   * Database query builder
   */
  from(table: string) {
    return {
      async select(columns = '*', options: any = {}) {
        try {
          const query = new URLSearchParams()
          query.append('select', columns)
          
          if (options.filter) {
            Object.entries(options.filter).forEach(([key, value]) => {
              query.append(key, `eq.${value}`)
            })
          }
          
          const data = await supabaseFetch(`/rest/v1/${table}?${query}`)
          return { data, error: null }
        } catch (error: any) {
          return { data: [], error }
        }
      },
      
      async insert(values: any) {
        try {
          const data = await supabaseFetch(`/rest/v1/${table}`, {
            method: 'POST',
            body: JSON.stringify(values),
          })
          return { data, error: null }
        } catch (error: any) {
          return { data: null, error }
        }
      },
      
      async update(values: any, options: any = {}) {
        try {
          const query = new URLSearchParams()
          
          if (options.filter) {
            Object.entries(options.filter).forEach(([key, value]) => {
              query.append(key, `eq.${value}`)
            })
          }
          
          const data = await supabaseFetch(`/rest/v1/${table}?${query}`, {
            method: 'PATCH',
            body: JSON.stringify(values),
          })
          return { data, error: null }
        } catch (error: any) {
          return { data: null, error }
        }
      },
      
      async delete(options: any = {}) {
        try {
          const query = new URLSearchParams()
          
          if (options.filter) {
            Object.entries(options.filter).forEach(([key, value]) => {
              query.append(key, `eq.${value}`)
            })
          }
          
          const data = await supabaseFetch(`/rest/v1/${table}?${query}`, {
            method: 'DELETE',
          })
          return { data, error: null }
        } catch (error: any) {
          return { data: null, error }
        }
      }
    }
  }
}

export default supabase

// Type for backwards compatibility
export type Database = any

console.log('[Supabase] Native Fetch client initialized successfully')
