/**
 * Real-time Services Index
 * 
 * Exports all real-time subscription services for AI agent integration
 */

export { RealtimeSubscriptionService } from './realtime-subscription-service';

// Re-export types for convenience
export type {
  RealtimeEvent,
  SubscriptionOptions,
  SubscriptionHandle,
  RealtimeAnalytics
} from './realtime-subscription-service';

// Default export for easy importing
export default RealtimeSubscriptionService;