import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

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

export function useRealtimeProvider(
  supabaseUrl?: string,
  supabaseKey?: string,
): RealtimeProviderReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected')
  const [error, setError] = useState<string | null>(null)

  // Memoize Supabase client so it is stable across renders and can be used in deps
  const supabase = useMemo(
    () =>
      createClient(
        supabaseUrl || import.meta.env.VITE_SUPABASE_URL,
        supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY,
      ) as SupabaseClient,
    [supabaseUrl, supabaseKey],
  )

  // Wrap reconnect in useCallback so it is stable and can be referenced safely in useEffect deps
  const reconnect = useCallback(() => {
    setConnectionStatus('connecting')
    setError(null)
    // Reinitialize realtime connection
    supabase.removeAllChannels()
    // Trigger a simple channel to test connection
    const testChannel = supabase.channel('connection-test')
    testChannel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        setConnectionStatus('connected')
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false)
        setConnectionStatus('disconnected')
      } else if (status === 'TIMED_OUT') {
        // TIMED_OUT is a real Supabase realtime subscribe state — handle as an error
        setError('Realtime connection timed out - check network or permissions')
        setConnectionStatus('error')
      }
    })
  }, [supabase])

  useEffect(() => {
    reconnect()

    return () => {
      supabase.removeAllChannels()
    }
  }, [reconnect, supabase])

  return {
    isConnected,
    connectionStatus,
    reconnect,
    error,
  }
}

// Create a RealtimeProvider component for use in the app
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  // Call hook for side-effects (establish realtime connection) without keeping an unused reference
  useRealtimeProvider()

  return React.createElement('div', null, children)
}
