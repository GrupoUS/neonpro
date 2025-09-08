'use client'

import { createContext, useContext, useEffect, useRef, useState, } from 'react'

// Minimal local interface to avoid hard dependency on @neonpro/monitoring during MVP
export interface HealthcarePerformanceMonitor {
  setHealthcareContext: (context: any,) => void
  startMonitoring: () => Promise<void>
  stopMonitoring: () => Promise<void>
  getMetricsSummary: () => Promise<unknown>
}

interface HealthcareContext {
  clinicId?: string
  userId?: string
  workflowType?:
    | 'patient-registration'
    | 'medical-form'
    | 'procedure-scheduling'
    | 'medical-history'
    | 'real-time-update'
    | 'emergency-protocol'
  patientId?: string
  deviceType?: 'desktop' | 'tablet' | 'mobile'
}

interface PerformanceMonitorContextType {
  monitor: HealthcarePerformanceMonitor | null
  isInitialized: boolean
  setHealthcareContext: (context: HealthcareContext,) => void
  getMetricsSummary: () => Promise<unknown>
  isMonitoringEnabled: boolean
}

const PerformanceMonitorContext = createContext<PerformanceMonitorContextType>({
  monitor: null,
  isInitialized: false,
  setHealthcareContext: () => {},
  getMetricsSummary: async () => ({}),
  isMonitoringEnabled: false,
},)

interface PerformanceMonitorProviderProps {
  children: React.ReactNode
  clinicId?: string
  enableRealtimeStreaming?: boolean
  config?: {
    webVitalsEnabled?: boolean
    aiMetricsEnabled?: boolean
    cacheMetricsEnabled?: boolean
    systemMetricsEnabled?: boolean
    auditTrailEnabled?: boolean
    collectInterval?: number
  }
}

export function PerformanceMonitorProvider({
  children,
  clinicId,
  enableRealtimeStreaming = true,
  config = {},
}: PerformanceMonitorProviderProps,) {
  const [monitor, setMonitor,] = useState<HealthcarePerformanceMonitor | null>(null,)
  const [isInitialized, setIsInitialized,] = useState(false,)
  const [isMonitoringEnabled, setIsMonitoringEnabled,] = useState(false,)
  const initializeAttempted = useRef(false,)

  // Check LGPD performance monitoring consent
  const hasPerformanceConsent = () => {
    if (typeof window === 'undefined') return false

    const consent = localStorage.getItem('performance-consent',)
    const lgpdConsent = localStorage.getItem('lgpd-consent-performance',)

    return consent === 'true' || lgpdConsent === 'accepted'
  }

  // Initialize monitoring system
  useEffect(() => {
    const initializeMonitoring = async () => {
      // Only initialize once
      if (initializeAttempted.current) return
      initializeAttempted.current = true

      // Check browser environment
      if (typeof window === 'undefined') return

      // Verify LGPD compliance consent
      if (!hasPerformanceConsent()) {
        console.log('🔒 Performance monitoring awaiting LGPD consent',)
        return
      }

      try {
        // Dynamic import to avoid SSR issues and optimize bundle
        const { HealthcarePerformanceMonitor, } =
          (await import('@neonpro/monitoring').catch(() => ({} as any))) as {
            HealthcarePerformanceMonitor: new(config: any,) => HealthcarePerformanceMonitor
          }

        // Healthcare-optimized configuration
        const healthcareConfig = {
          enabled: true,
          realtimeEnabled: enableRealtimeStreaming,
          healthcareCompliance: true,
          auditTrailEnabled: true,
          webVitalsEnabled: true,
          aiMetricsEnabled: false, // Start conservative to avoid TensorFlow.js bundle impact
          cacheMetricsEnabled: true,
          systemMetricsEnabled: false, // Browser environment limitation
          clinicId: clinicId || null,
          supabaseProjectId: 'ownkoxryswokcdanrdgj', // NeonPro project ID
          collectInterval: 5000, // 5 seconds for healthcare responsiveness
          ...config,
        }

        if (!HealthcarePerformanceMonitor) {
          console.warn('Performance monitoring package not available; running without monitoring',)
          setIsInitialized(true,)
          setIsMonitoringEnabled(false,)
          return
        }

        const monitorInstance = new HealthcarePerformanceMonitor(healthcareConfig,)

        // Set initial healthcare context based on current URL and user context
        const initialContext = {
          clinicId: clinicId || 'default-clinic',
          workflowType: detectWorkflowFromUrl(),
          deviceType: detectDeviceType(),
        }

        monitorInstance.setHealthcareContext(initialContext,)

        // Start monitoring
        await monitorInstance.startMonitoring()

        setMonitor(monitorInstance,)
        setIsInitialized(true,)
        setIsMonitoringEnabled(true,)

        console.log('🏥 Healthcare Performance Monitoring initialized successfully',)

        // Performance baseline verification
        setTimeout(async () => {
          try {
            const summary = await monitorInstance.getMetricsSummary()
            console.log('📊 Performance baseline:', summary,)
          } catch (error) {
            console.warn('⚠️ Performance summary not available:', error,)
          }
        }, 2000,)
      } catch (error) {
        console.error('❌ Failed to initialize performance monitoring:', error,)
        setIsInitialized(false,)
        setIsMonitoringEnabled(false,)
      }
    }

    initializeMonitoring()

    // Cleanup monitoring on unmount
    return () => {
      if (monitor && typeof monitor.stopMonitoring === 'function') {
        monitor.stopMonitoring().catch(console.error,)
      }
    }
  }, [clinicId, enableRealtimeStreaming, config,],)

  // Detect workflow type from current URL for healthcare context
  const detectWorkflowFromUrl = (): HealthcareContext['workflowType'] => {
    if (typeof window === 'undefined') return undefined

    const path = window.location.pathname.toLowerCase()

    if (path.includes('patient',) && path.includes('register',)) return 'patient-registration'
    if (path.includes('form',) || path.includes('medical',)) return 'medical-form'
    if (path.includes('appointment',) || path.includes('schedule',)) return 'procedure-scheduling'
    if (path.includes('history',) || path.includes('record',)) return 'medical-history'
    if (path.includes('emergency',)) return 'emergency-protocol'
    if (path.includes('dashboard',) || path.includes('real-time',)) return 'real-time-update'

    return undefined
  }

  // Detect device type for healthcare context
  const detectDeviceType = (): HealthcareContext['deviceType'] => {
    if (typeof window === 'undefined') return 'desktop'

    const userAgent = navigator.userAgent.toLowerCase()
    if (/tablet|ipad|playbook|silk/.test(userAgent,)) return 'tablet'
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(
        userAgent,
      )
    ) return 'mobile'

    return 'desktop'
  }

  // Set healthcare context and update monitoring
  const setHealthcareContext = (context: HealthcareContext,) => {
    if (monitor) {
      monitor.setHealthcareContext(context,)
      console.log('🏥 Healthcare context updated:', context,)
    }
  }

  // Get current performance metrics
  const getMetricsSummary = async () => {
    if (!monitor) {
      throw new Error('Performance monitor not initialized',)
    }

    return await monitor.getMetricsSummary()
  }

  // Listen for URL changes to update workflow context
  useEffect(() => {
    if (!monitor || typeof window === 'undefined') return

    const handleUrlChange = () => {
      const newWorkflowType = detectWorkflowFromUrl()
      if (newWorkflowType) {
        setHealthcareContext({
          workflowType: newWorkflowType,
          deviceType: detectDeviceType(),
        },)
      }
    }

    // Listen for navigation changes
    window.addEventListener('popstate', handleUrlChange,)

    return () => {
      window.removeEventListener('popstate', handleUrlChange,)
    }
  }, [monitor,],)

  const contextValue: PerformanceMonitorContextType = {
    monitor,
    isInitialized,
    setHealthcareContext,
    getMetricsSummary,
    isMonitoringEnabled,
  }

  return (
    <PerformanceMonitorContext.Provider value={contextValue}>
      {children}

      {/* Performance Monitoring Status Indicator (Development Only) */}
      {process.env.NODE_ENV === 'development' && isMonitoringEnabled && (
        <div
          className="fixed bottom-2 left-2 z-50 text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded font-mono"
          title="Healthcare Performance Monitoring Active"
        >
          📊 HPM
        </div>
      )}
    </PerformanceMonitorContext.Provider>
  )
}

// Hook for consuming performance monitoring context
export function usePerformanceMonitor() {
  const context = useContext(PerformanceMonitorContext,)

  if (!context) {
    throw new Error('usePerformanceMonitor must be used within a PerformanceMonitorProvider',)
  }

  return context
}

// Healthcare workflow helpers
export const useHealthcareWorkflow = () => {
  const { setHealthcareContext, } = usePerformanceMonitor()

  const startWorkflow = (
    workflowType: HealthcareContext['workflowType'],
    context?: Partial<HealthcareContext>,
  ) => {
    setHealthcareContext({
      workflowType,
      ...context,
    },)
  }

  const updatePatientContext = (patientId: string,) => {
    setHealthcareContext({
      patientId,
      workflowType: 'medical-form',
    },)
  }

  return {
    startWorkflow,
    updatePatientContext,
  }
}

// Performance metrics hook
export const usePerformanceMetrics = () => {
  const { getMetricsSummary, isMonitoringEnabled, } = usePerformanceMonitor()
  const [metrics, setMetrics,] = useState<unknown>(null,)
  const [loading, setLoading,] = useState(false,)

  const refreshMetrics = async () => {
    if (!isMonitoringEnabled) return

    setLoading(true,)
    try {
      const summary = await getMetricsSummary()
      setMetrics(summary,)
    } catch (error) {
      console.error('Failed to get metrics:', error,)
    } finally {
      setLoading(false,)
    }
  }

  useEffect(() => {
    if (isMonitoringEnabled) {
      refreshMetrics()

      // Refresh metrics every 10 seconds
      const interval = setInterval(refreshMetrics, 10_000,)
      return () => clearInterval(interval,)
    }
  }, [isMonitoringEnabled,],)

  return {
    metrics,
    loading,
    refresh: refreshMetrics,
  }
}
