/**
 * Realtime Provider Hook
 * Global realtime connection management and healthcare compliance
 */

import { useEffect, useRef, useContext, createContext, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface RealtimeContextValue {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

const RealtimeContext = createContext<RealtimeContextValue>({
  isConnected: false,
  connectionStatus: 'disconnected',
})

/**
 * Realtime Provider Component
 * Manages global Supabase realtime connection and healthcare compliance
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const connectionStatus = useRef<RealtimeContextValue['connectionStatus']>('disconnected')
  const isConnected = useRef(false)

  useEffect(() => {
    // Create main realtime channel for healthcare operations
    channelRef.current = supabase
      .channel('neonpro-healthcare')
      .on('broadcast', { event: 'appointment-updated' }, (payload) => {
        // Invalidate appointment-related queries
        queryClient.invalidateQueries({ queryKey: ['appointments'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'upcoming-appointments'] })
        
        // Log for healthcare compliance audit
        console.log('[AUDIT] Real-time appointment update received:', payload)
      })
      .on('broadcast', { event: 'patient-updated' }, (payload) => {
        // Invalidate patient-related queries
        queryClient.invalidateQueries({ queryKey: ['patients'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'patient-stats'] })
        
        // Log for LGPD compliance audit
        console.log('[AUDIT] Real-time patient update received:', payload)
      })
      .on('broadcast', { event: 'telemedicine-session-updated' }, (payload) => {
        // Invalidate telemedicine-related queries
        queryClient.invalidateQueries({ queryKey: ['telemedicine-sessions'] })
        
        // Log for CFM compliance audit
        console.log('[AUDIT] Real-time telemedicine session update received:', payload)
      })
      .subscribe((status) => {
        connectionStatus.current = status === 'SUBSCRIBED' ? 'connected' : 'connecting'
        isConnected.current = status === 'SUBSCRIBED'
        
        if (status === 'SUBSCRIBED') {
          console.log('[REALTIME] Connected to NeonPro healthcare realtime')
        } else if (status === 'CHANNEL_ERROR') {
          connectionStatus.current = 'error'
          isConnected.current = false
          console.error('[REALTIME] Connection error')
        }
      })

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [queryClient])

  return (
    <RealtimeContext.Provider 
      value={{ 
        isConnected: isConnected.current, 
        connectionStatus: connectionStatus.current 
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}

/**
 * Hook to access realtime connection status
 */
export function useRealtimeProvider() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtimeProvider must be used within a RealtimeProvider')
  }
  return context
}