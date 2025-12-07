/**
 * Realtime Appointments Hook
 *
 * TODO: Implement proper realtime subscriptions when Supabase realtime is configured
 * Currently disabled to prevent runtime errors from missing dependencies
 */

// Placeholder hooks - no-op implementations
// These will be implemented when realtime feature is properly configured

export const useRealtimeAppointments = (_clinicId: string) => {
  // TODO: Implement realtime appointments subscription
  // Currently disabled - RealtimeService needs proper Supabase integration
  console.debug('[useRealtimeAppointments] Realtime disabled - placeholder hook');
};

export const useRealtimeMessages = (_clinicId: string) => {
  // TODO: Implement realtime messages subscription
  // Currently disabled - RealtimeService needs proper Supabase integration
  console.debug('[useRealtimeMessages] Realtime disabled - placeholder hook');
};