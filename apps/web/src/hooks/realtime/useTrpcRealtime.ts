/**
 * tRPC + Realtime Integration Hooks
 * Specialized hooks that combine tRPC with Supabase Realtime
 */

import { useRealtimeQuery } from './useRealtimeQuery'
import { useRealtimeMutation } from './useRealtimeMutation'
import { trpc } from '../../lib/trpc'
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server'

/**
 * Real-time appointments query with tRPC integration
 */
export function useRealtimeAppointments(params?: {
  clientId?: string
  status?: string
  limit?: number
}) {
  return useRealtimeQuery({
    queryKey: ['appointments', params],
    queryFn: () => trpc.appointments?.list?.query?.(params),
    table: 'appointments',
    schema: 'public',
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Real-time patients/clients query with tRPC integration
 */
export function useRealtimePatients(params?: {
  search?: string
  limit?: number
  offset?: number
}) {
  return useRealtimeQuery({
    queryKey: ['patients', params],
    queryFn: () => trpc.patients?.list?.query?.(params),
    table: 'patients',
    schema: 'public',
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Real-time telemedicine sessions query with tRPC integration
 */
export function useRealtimeTelemedicineSessions(params?: {
  patientId?: string
  professionalId?: string
  status?: string
}) {
  return useRealtimeQuery({
    queryKey: ['telemedicine-sessions', params],
    queryFn: () => trpc.telemedicine?.getSessions?.query?.(params),
    table: 'telemedicine_sessions',
    schema: 'public',
    invalidateOn: ['INSERT', 'UPDATE', 'DELETE'],
    enableOptimisticUpdates: true,
    staleTime: 10 * 1000, // 10 seconds (more frequent updates for real-time sessions)
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Create appointment mutation with real-time updates
 */
export function useCreateAppointment() {
  return useRealtimeMutation({
    mutationFn: (data: any) => trpc.appointments?.create?.mutate?.(data),
    invalidateQueries: [
      ['appointments'],
      ['appointments', 'calendar'],
      ['dashboard', 'upcoming-appointments'],
    ],
    broadcastUpdate: true,
    broadcastChannel: 'appointments',
    broadcastEvent: 'appointment-created',
  })
}

/**
 * Update appointment mutation with real-time updates
 */
export function useUpdateAppointment() {
  return useRealtimeMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      trpc.appointments?.update?.mutate?.({ id, data }),
    invalidateQueries: [
      ['appointments'],
      ['appointments', 'calendar'],
      ['dashboard', 'upcoming-appointments'],
    ],
    broadcastUpdate: true,
    broadcastChannel: 'appointments',
    broadcastEvent: 'appointment-updated',
  })
}

/**
 * Create patient mutation with real-time updates
 */
export function useCreatePatient() {
  return useRealtimeMutation({
    mutationFn: (data: any) => trpc.patients?.create?.mutate?.(data),
    invalidateQueries: [
      ['patients'],
      ['dashboard', 'patient-stats'],
    ],
    broadcastUpdate: true,
    broadcastChannel: 'patients',
    broadcastEvent: 'patient-created',
  })
}

/**
 * Update patient mutation with real-time updates
 */
export function useUpdatePatient() {
  return useRealtimeMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      trpc.patients?.update?.mutate?.({ id, data }),
    invalidateQueries: [
      ['patients'],
      ['dashboard', 'patient-stats'],
    ],
    broadcastUpdate: true,
    broadcastChannel: 'patients',
    broadcastEvent: 'patient-updated',
  })
}