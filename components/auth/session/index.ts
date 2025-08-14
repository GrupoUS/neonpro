// =====================================================
// Session Components Index - Export All Session Components
// Story 1.4: Session Management & Security
// =====================================================

// Main session components
export { default as SessionStatus } from './SessionStatus'
export { default as SessionWarning } from './SessionWarning'
export { default as DeviceManagement } from './DeviceManagement'
export { default as SecurityDashboard } from './SecurityDashboard'

// Re-export component types for convenience
export type { SessionStatusProps } from './SessionStatus'
export type { SessionWarningProps } from './SessionWarning'
export type { DeviceManagementProps } from './DeviceManagement'
export type { SecurityDashboardProps } from './SecurityDashboard'

// =====================================================
// COMPONENT COLLECTIONS
// =====================================================

// All session management components
export const SessionComponents = {
  SessionStatus,
  SessionWarning,
  DeviceManagement,
  SecurityDashboard
} as const

// Component categories
export const StatusComponents = {
  SessionStatus,
  SessionWarning
} as const

export const ManagementComponents = {
  DeviceManagement,
  SecurityDashboard
} as const

// =====================================================
// UTILITY EXPORTS
// =====================================================

// Common component configurations
export const defaultSessionConfig = {
  sessionStatus: {
    showExtendButton: true,
    showLogoutButton: true,
    showSecurityScore: true,
    showTimeRemaining: true,
    compact: false
  },
  sessionWarning: {
    warningThreshold: 5, // minutes
    criticalThreshold: 2, // minutes
    autoShow: true,
    showAsDialog: true,
    showAsAlert: false
  },
  deviceManagement: {
    showAddDevice: true,
    showRemoveDevice: true,
    maxDevices: 5
  },
  securityDashboard: {
    showDetailedEvents: true,
    maxEvents: 10,
    autoRefresh: true,
    refreshInterval: 30 // seconds
  }
} as const

// Component size variants
export const componentSizes = {
  compact: 'compact',
  normal: 'normal',
  expanded: 'expanded'
} as const

// Security levels
export const securityLevels = {
  secure: 'secure',
  moderate: 'moderate',
  warning: 'warning',
  critical: 'critical'
} as const

// Device risk levels
export const riskLevels = {
  low: 'low',
  medium: 'medium',
  high: 'high'
} as const