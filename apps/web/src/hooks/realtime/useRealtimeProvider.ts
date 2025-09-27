import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Realtime Provider Hook
 *
 * Provides realtime connection status and management for the NeonPro healthcare platform
 * Uses Supabase realtime for live updates in medical applications
 */
export interface RealtimeProviderReturn {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  reconnect: () => void
  error: string | null
}

export function useRealtimeProvider(supabaseUrl?: string, supabaseKey?: string): RealtimeProviderReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient(
    supabaseUrl || import.meta.env.VITE_SUPABASE_URL,
    supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY
  ) as SupabaseClient

  const reconnect = () => {
    setConnectionStatus('connecting')
    setError(null)
    // Reinitialize realtime connection
    supabase.removeAllChannels()
    // Trigger a simple channel to test connection
    const testChannel = supabase.channel('connection-test')
    testChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        setConnectionStatus('connected')
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false)
        setConnectionStatus('disconnected')
      } else if (status === 'SUBSCRIPTION_ERROR') {
        setError('Subscription error - check network or permissions')
        setConnectionStatus('error')
      }
    })
  }

  useEffect(() => {
    reconnect()

    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  return {
    isConnected,
    connectionStatus,
    reconnect,
    error,
  }
}
