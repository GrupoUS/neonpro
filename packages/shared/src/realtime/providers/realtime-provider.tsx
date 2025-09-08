/**
 * NeonPro Healthcare Realtime Provider
 * Provider React para sistema de real-time integrado
 * Gerencia conexão global e estado para toda aplicação
 */

import { createContext, useCallback, useContext, useEffect, useState, } from 'react'
import type { ReactNode, } from 'react'
import { getRealtimeConfig, } from '../config'
import { getRealtimeManager, } from '../connection-manager'
import type { ConnectionStatus, SupabaseRealtimeManager, } from '../connection-manager'

interface RealtimeContextValue {
  manager: SupabaseRealtimeManager | null
  connectionStatus: ConnectionStatus
  isReady: boolean
  reconnect: () => void
  disconnect: () => void
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null,)

interface RealtimeProviderProps {
  children: ReactNode
  tenantId: string
  enableHealthcareMode?: boolean
  customConfig?: Partial<unknown>
} /**
 * MANDATORY Realtime Provider para NeonPro Healthcare
 * Deve envolver toda a aplicação para funcionalidade real-time
 */

export function RealtimeProvider({
  children,
  tenantId,
  enableHealthcareMode = true,
  customConfig,
}: RealtimeProviderProps,) {
  const [manager, setManager,] = useState<SupabaseRealtimeManager | null>(null,)
  const [connectionStatus, setConnectionStatus,] = useState<ConnectionStatus>({
    isConnected: false,
    connectionId: null,
    lastConnected: null,
    totalRetries: 0,
    activeChannels: 0,
    healthScore: 0,
  },)
  const [isReady, setIsReady,] = useState(false,)

  /**
   * Initialize realtime manager with healthcare config
   */
  useEffect(() => {
    const config = getRealtimeConfig()
    const healthcareConfig = {
      ...config.connection,
      enableLogging: process.env.NODE_ENV === 'development',
      ...customConfig,
    }

    try {
      const realtimeManager = getRealtimeManager(healthcareConfig,)
      setManager(realtimeManager,)

      // Subscribe to connection status changes
      const unsubscribe = realtimeManager.onStatusChange((status,) => {
        setConnectionStatus(status,)

        // Healthcare mode requires higher health threshold
        const healthThreshold = enableHealthcareMode ? 80 : 50
        setIsReady(status.isConnected && status.healthScore >= healthThreshold,)

        // Log connection events for healthcare audit
        if (enableHealthcareMode) {
        }
      },)

      return () => {
        unsubscribe()
      }
    } catch {
      // Return empty cleanup function
      return () => {}
    }
  }, [enableHealthcareMode, customConfig,],) /**
   * Manual reconnection
   */

  const reconnect = useCallback(() => {
    if (manager) {
      manager.reconnect()
    }
  }, [manager,],)

  /**
   * Manual disconnection
   */
  const disconnect = useCallback(() => {
    if (manager) {
      manager.destroy()
      setManager(null,)
      setIsReady(false,)
    }
  }, [manager,],)

  /**
   * Handle critical connection issues in healthcare mode
   */
  useEffect(() => {
    if (!(enableHealthcareMode && manager)) {
      return
    }

    const handleCriticalIssues = (status: ConnectionStatus,) => {
      // Alert if health drops below critical threshold for healthcare
      if (status.healthScore < 50 && status.isConnected) {
        // Dispatch custom event for UI to handle
        window.dispatchEvent(
          new CustomEvent('neonpro-connection-critical', {
            detail: {
              tenantId,
              status,
              message:
                'Conexão real-time com problemas críticos. Algumas funcionalidades podem estar limitadas.',
            },
          },),
        )
      }

      // Alert for excessive retries
      if (status.totalRetries > 5) {
        window.dispatchEvent(
          new CustomEvent('neonpro-connection-unstable', {
            detail: {
              tenantId,
              status,
              message: 'Conexão instável detectada. Verificar conectividade de rede.',
            },
          },),
        )
      }
    }

    const unsubscribe = manager.onStatusChange(handleCriticalIssues,)
    return unsubscribe
  }, [manager, enableHealthcareMode, tenantId,],)

  const contextValue: RealtimeContextValue = {
    manager,
    connectionStatus,
    isReady,
    reconnect,
    disconnect,
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
} /**
 * Hook para acessar o contexto do realtime provider
 */

export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext,)

  if (!context) {
    throw new Error(
      'useRealtimeContext deve ser usado dentro de um RealtimeProvider',
    )
  }

  return context
}

/**
 * Hook para verificar se realtime está pronto para healthcare
 */
export function useHealthcareReady(): boolean {
  const { isReady, connectionStatus, } = useRealtimeContext()

  // Healthcare requires higher standards
  return isReady && connectionStatus.healthScore >= 80
}

/**
 * Hook para status de conexão com detalhes healthcare
 */
export function useRealtimeStatus() {
  const { connectionStatus, isReady, } = useRealtimeContext()

  return {
    ...connectionStatus,
    isReady,
    isHealthcareReady: connectionStatus.healthScore >= 80,
    statusText: getStatusText(connectionStatus,),
    statusColor: getStatusColor(connectionStatus.healthScore,),
  }
}

/**
 * Get human-readable status text
 */
function getStatusText(status: ConnectionStatus,): string {
  if (!status.isConnected) {
    return 'Desconectado'
  }
  if (status.healthScore >= 90) {
    return 'Excelente'
  }
  if (status.healthScore >= 80) {
    return 'Bom'
  }
  if (status.healthScore >= 60) {
    return 'Regular'
  }
  if (status.healthScore >= 40) {
    return 'Ruim'
  }
  return 'Crítico'
}

/**
 * Get status color for UI
 */
function getStatusColor(healthScore: number,): string {
  if (healthScore >= 80) {
    return '#10b981' // Green
  }
  if (healthScore >= 60) {
    return '#f59e0b' // Yellow
  }
  if (healthScore >= 40) {
    return '#ef4444' // Red
  }
  return '#991b1b' // Dark red
}
