// =====================================================
// Authentication Hooks - Main Export Index
// Story 1.4: Session Management & Security
// =====================================================

// Main Session Hook
export { useSession } from './useSession'
export type {
  SessionState,
  SessionActions,
  LoginCredentials,
  DeviceInfo,
  UseSessionOptions,
  UseSessionReturn
} from './useSession'

// Session Activity Tracking Hook
export { useSessionActivity } from './useSessionActivity'
export type {
  ActivityTrackingOptions,
  ActivityEvent,
  UseSessionActivityReturn
} from './useSessionActivity'

// Additional activity tracking utilities
export {
  dispatchCustomActivity,
  withActivityTracking,
  useBusinessActivityTracking
} from './useSessionActivity'

// Device Management Hook
export { useDeviceManagement } from './useDeviceManagement'
export type {
  DeviceState,
  DeviceActions,
  UseDeviceManagementOptions,
  UseDeviceManagementReturn
} from './useDeviceManagement'

// =====================================================
// COMBINED HOOKS FOR CONVENIENCE
// =====================================================

import { useSession } from './useSession'
import { useSessionActivity } from './useSessionActivity'
import { useDeviceManagement } from './useDeviceManagement'

/**
 * Combined hook that provides all session-related functionality
 * Includes session management, activity tracking, and device management
 */
export function useCompleteSessionManagement(userId?: string) {
  const session = useSession({
    autoRefresh: true,
    refreshInterval: 60000,
    redirectOnExpiry: '/login',
    showWarnings: true,
    trackActivity: true
  })
  
  const activity = useSessionActivity({
    trackPageViews: true,
    trackClicks: true,
    trackFormSubmissions: true,
    trackScrolling: false,
    trackIdleTime: true,
    idleThresholdMs: 5 * 60 * 1000,
    debounceMs: 1000
  })
  
  const devices = useDeviceManagement(userId || session.user?.id, {
    autoRegister: true,
    showNotifications: true,
    trackDeviceChanges: true,
    validateOnMount: true
  })
  
  return {
    session,
    activity,
    devices,
    
    // Combined state
    isFullyAuthenticated: session.isAuthenticated && devices.isCurrentDeviceTrusted,
    securityLevel: {
      sessionValid: session.isAuthenticated,
      deviceTrusted: devices.isCurrentDeviceTrusted,
      securityScore: session.securityScore?.score || 0,
      riskLevel: devices.deviceRiskLevel
    },
    
    // Combined actions
    async authenticateWithDevice(credentials: any, deviceInfo: any) {
      const loginSuccess = await session.login(credentials, deviceInfo)
      if (loginSuccess && !devices.isCurrentDeviceTrusted) {
        await devices.registerDevice()
      }
      return loginSuccess
    },
    
    async secureLogout() {
      await session.logout()
      // Device data is automatically handled by the session system
    }
  }
}

// =====================================================
// UTILITY HOOKS
// =====================================================

/**
 * Hook for session timeout warnings
 */
export function useSessionTimeout() {
  const { timeUntilExpiry, isExpiringSoon, extendSession } = useSession()
  
  return {
    timeUntilExpiry,
    isExpiringSoon,
    extendSession,
    
    // Formatted time remaining
    timeRemainingFormatted: timeUntilExpiry ? {
      minutes: Math.floor(timeUntilExpiry / (1000 * 60)),
      seconds: Math.floor((timeUntilExpiry % (1000 * 60)) / 1000)
    } : null
  }
}

/**
 * Hook for security monitoring
 */
export function useSecurityMonitoring() {
  const { securityScore, session } = useSession()
  const { deviceRiskLevel, deviceValidation } = useDeviceManagement(session?.userId)
  const { isIdle, lastActivity } = useSessionActivity()
  
  return {
    securityScore: securityScore?.score || 0,
    securityFactors: securityScore?.factors || [],
    deviceRiskLevel,
    isDeviceTrusted: deviceValidation?.isTrusted || false,
    isUserIdle: isIdle,
    lastActivity,
    
    // Overall security status
    securityStatus: (() => {
      const score = securityScore?.score || 0
      const deviceTrusted = deviceValidation?.isTrusted || false
      
      if (score >= 80 && deviceTrusted) return 'secure'
      if (score >= 60 && deviceTrusted) return 'moderate'
      if (score >= 40) return 'warning'
      return 'critical'
    })()
  }
}

/**
 * Hook for session statistics
 */
export function useSessionStatistics() {
  const { sessionStats, session } = useSession()
  const { getActivityHistory } = useSessionActivity()
  const { deviceStats } = useDeviceManagement(session?.userId)
  
  return {
    sessionDuration: sessionStats?.duration || 0,
    activitiesCount: sessionStats?.activitiesCount || 0,
    lastActivity: sessionStats?.lastActivity,
    activityHistory: getActivityHistory(),
    deviceStats,
    
    // Formatted statistics
    formattedStats: {
      sessionDuration: sessionStats ? {
        hours: Math.floor(sessionStats.duration / (1000 * 60 * 60)),
        minutes: Math.floor((sessionStats.duration % (1000 * 60 * 60)) / (1000 * 60))
      } : null,
      
      activitiesPerHour: sessionStats && sessionStats.duration > 0 
        ? Math.round((sessionStats.activitiesCount / sessionStats.duration) * (1000 * 60 * 60))
        : 0
    }
  }
}

// =====================================================
// CONTEXT PROVIDERS (Optional)
// =====================================================

import React, { createContext, useContext, ReactNode } from 'react'

// Session Context
const SessionContext = createContext<ReturnType<typeof useCompleteSessionManagement> | null>(null)

export function SessionProvider({ 
  children, 
  userId 
}: { 
  children: ReactNode
  userId?: string 
}) {
  const sessionManagement = useCompleteSessionManagement(userId)
  
  return (
    <SessionContext.Provider value={sessionManagement}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider')
  }
  return context
}

// =====================================================
// EXPORT ALL
// =====================================================

export default {
  useSession,
  useSessionActivity,
  useDeviceManagement,
  useCompleteSessionManagement,
  useSessionTimeout,
  useSecurityMonitoring,
  useSessionStatistics,
  SessionProvider,
  useSessionContext
}
