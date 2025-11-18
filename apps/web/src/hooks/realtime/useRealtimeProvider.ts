import React, { useCallback, useEffect, useState } from 'react'
import supabase from '@/integrations/supabase/client'

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

export function useRealtimeProvider(): RealtimeProviderReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected')
  const [error, setError] = useState<string | null>(null)

  // Use o cliente Supabase compartilhado (NÃO criar nova instância!)
  const supabaseClient = supabase

  // Wrap reconnect in useCallback so it is stable and can be referenced safely in useEffect deps
  const reconnect = useCallback(() => {
    setConnectionStatus('connecting')
    setError(null)
    // Reinitialize realtime connection
    supabaseClient.removeAllChannels()
    // Trigger a simple channel to test connection
    const testChannel = supabaseClient.channel('connection-test')
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
  }, [supabaseClient])

  useEffect(() => {
    // DESABILITADO: Não conectar automaticamente ao Realtime durante inicialização
    // Isso pode interferir com o processo de autenticação
    // A conexão será estabelecida manualmente após o login bem-sucedido
    // reconnect()

    return () => {
      supabaseClient.removeAllChannels()
    }
  }, [supabaseClient])

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
