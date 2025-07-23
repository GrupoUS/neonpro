/**
 * Subscription Components Index
 * 
 * Central export file for all subscription-related components.
 * Provides clean imports for consumers of subscription functionality.
 * 
 * @author NeonPro Development Team
 * @version 1.0.0
 */

// Core subscription components
export { SubscriptionStatusIndicator } from './subscription-status-indicator'
export type { SubscriptionStatusIndicatorProps } from './subscription-status-indicator'

export { SubscriptionBanner } from './subscription-banner'
export type { SubscriptionBannerProps } from './subscription-banner'

export { SubscriptionGuard } from './subscription-guard'

export { UpgradePrompt } from './upgrade-prompt'

// NEW COMPONENTS - Task 4 Implementation
export { SubscriptionStatusCard } from './subscription-status-card'
export type { SubscriptionStatusCardProps } from './subscription-status-card'

export {
    EnterpriseFeatureGate, FeatureGate,
    ProFeatureGate, UsageLimitGate
} from './subscription-feature-gate'
export type {
    FeatureGateProps,
    UsageLimitGateProps
} from './subscription-feature-gate'

export {
    SubscriptionAlert, SubscriptionNotificationProvider
} from './subscription-notifications'
export type { SubscriptionNotificationProps } from './subscription-notifications'

export {
    CompactSubscriptionWidget,
    DetailedSubscriptionWidget, SubscriptionDashboardWidget
} from './subscription-dashboard-widget'
export type { SubscriptionDashboardWidgetProps } from './subscription-dashboard-widget'
export type { UpgradePromptProps } from './upgrade-prompt'

export { SubscriptionStatusWidget } from './subscription-status-widget'
export type { SubscriptionStatusWidgetProps } from './subscription-status-widget'

// Convenience re-exports of hooks
export { useSubscriptionStatus } from '../../hooks/use-subscription-status'
export type {
    UseSubscriptionStatusOptions,
    UseSubscriptionStatusReturn
} from '../../hooks/use-subscription-status'

// Convenience re-exports of utilities
export { subscriptionRealtimeManager } from '../../lib/subscription-realtime'
