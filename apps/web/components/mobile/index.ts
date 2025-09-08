'use client'

/**
 * Mobile Components Index
 * FASE 4: Frontend Components - Mobile First Design
 * Compliance: LGPD/ANVISA/CFM
 */

export {
  MobileAlertCard,
  MobileDashboardCard,
  MobileDashboardGrid,
  MobileDashboardSection,
  MobileMetricCard,
  MobileQuickActions,
  MobileStatusIndicator,
} from './MobileDashboardCards'
export { MobileBottomNavigation, MobileNavigation, } from './MobileNavigation'

// Emergency Interface Components - T3.2 Mobile Emergency Interface <100ms Response
export { default as CriticalInfoDisplay, } from './CriticalInfoDisplay'
export { default as EmergencyModeInterface, } from './EmergencyModeInterface'
export { default as EmergencyPatientLookup, } from './EmergencyPatientLookup'
export { default as OfflineSyncManager, } from './OfflineSyncManager'

// Cross-Device Continuity Components - T3.3 Cross-Device Continuity e QR Handoff System
export { default as ConflictResolver, } from './ConflictResolver'
export { default as CrossDeviceDemo, } from './CrossDeviceDemo'
export { default as OfflineQueueManager, } from './OfflineQueueManager'
export { default as QRHandoffGenerator, } from './QRHandoffGenerator'
export { default as SessionSyncManager, } from './SessionSyncManager'

// Mobile-specific types
export interface MobileNavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  category: 'main' | 'dashboard' | 'tools' | 'settings'
  description?: string
  compliance?: string[]
}

export interface MobileCardProps {
  title: string
  value: string | number
  description?: string
  status?: 'success' | 'warning' | 'error' | 'info'
  progress?: number
  badge?: string
  compliance?: string[]
  onClick?: () => void
}

// Mobile layout utilities
export const MOBILE_BREAKPOINTS = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const

export const MOBILE_GRID_CONFIGS = {
  single: 'grid-cols-1',
  double: 'grid-cols-1 sm:grid-cols-2',
  triple: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  quad: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const

// Touch gesture types
export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'long-press'
  direction?: 'left' | 'right' | 'up' | 'down'
  callback: () => void
}

// Cross-device continuity types
export interface DeviceFingerprint {
  userAgent: string
  screenResolution: string
  timezone: string
  language: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

export interface HandoffSession {
  sessionId: string
  deviceFingerprint: DeviceFingerprint
  sessionData: Record<string, unknown>
  expiresAt: number
  encrypted: boolean
}

export interface SyncConflict {
  id: string
  entityType: 'patient' | 'appointment' | 'treatment' | 'medication' | 'form_data'
  entityId: string
  fieldName: string
  localValue: unknown
  remoteValue: unknown
  priority: 'critical' | 'high' | 'medium' | 'low'
  canAutoResolve: boolean
}

export interface QueuedAction {
  id: string
  type: 'create' | 'update' | 'delete' | 'upload'
  entityType: 'patient' | 'appointment' | 'treatment' | 'medication' | 'file' | 'form_data'
  data: unknown
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'queued' | 'processing' | 'completed' | 'failed'
  attempts: number
  maxAttempts: number
}
