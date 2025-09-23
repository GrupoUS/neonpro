/**
 * Real-time Services Index
 *
 * Exports all real-time subscription services for AI agent integration
 */

export { RealtimeSubscriptionService } from "./realtime-subscription-service";

// Re-export types for convenience
export type {
  RealtimeAnalytics,
  RealtimeEvent,
  SubscriptionHandle,
  SubscriptionOptions,
} from "./realtime-subscription-service";

// Default export for easy importing
export default RealtimeSubscriptionService;
