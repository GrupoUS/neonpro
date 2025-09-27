/**
 * Realtime Hooks Index
 * Central export point for all realtime-related hooks
 */

// Core realtime hooks
export { useRealtimeQuery } from './useRealtimeQuery'
export { useRealtimeMutation } from './useRealtimeMutation'

// tRPC + Realtime integration hooks
export {
  useRealtimeAppointments,
  useRealtimePatients,
  useRealtimeTelemedicineSessions,
  useCreateAppointment,
  useUpdateAppointment,
  useCreatePatient,
  useUpdatePatient,
} from './useTrpcRealtime'

// Healthcare-specific realtime hooks
export { useRealtimeProvider } from './useRealtimeProvider'

// Types
export type { RealtimeQueryOptions } from './useRealtimeQuery'
export type { RealtimeMutationOptions } from './useRealtimeMutation'