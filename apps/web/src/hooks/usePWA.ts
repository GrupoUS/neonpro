import { useCallback, useEffect, useState } from 'react'
import {
  type OfflineData,
  pwaIndexedDB,
  pwaOfflineSync,
  pwaPushManager,
  pwaStatus,
} from '../utils/pwa-lite'

interface PWAState {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
  notificationPermission: NotificationPermission
  offlineDataCount: number
  syncStatus: 'idle' | 'syncing' | 'error'
  lastSyncTime: Date | null
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstallable: false,
    isInstalled: false,
    notificationPermission: Notification.permission,
    offlineDataCount: 0,
    syncStatus: 'idle',
    lastSyncTime: null,
  })

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Initialize PWA services
  useEffect(() => {
    const initPWA = async () => {
      try {
        // Initialize IndexedDB
        await pwaIndexedDB.init()

        // Initialize offline sync
        await pwaOfflineSync.init()

        // Check PWA status
        setState((prev) => ({
          ...prev,
          isInstalled: pwaStatus.isPWAInstalled(),
        }))

        // Get initial offline data count
        const offlineData = await pwaIndexedDB.getOfflineData()
        setState((prev) => ({
          ...prev,
          offlineDataCount: offlineData.length,
        }))
      } catch (error) {
        console.error('Failed to initialize PWA services:', error)
      }
    }

    initPWA()

    // Set up event listeners
    const unsubscribeOnline = pwaStatus.subscribe('online', (isOnline: boolean) => {
      setState((prev) => ({ ...prev, isOnline }))
    })

    const unsubscribeInstallPrompt = pwaStatus.subscribe(
      'installPromptAvailable',
      (available: boolean) => {
        setState((prev) => ({ ...prev, isInstallable: available }))
      },
    )

    const unsubscribeInstalled = pwaStatus.subscribe('isInstalled', (installed: boolean) => {
      setState((prev) => ({ ...prev, isInstalled: installed }))
    })

    // PWA install event listeners
    const handleInstallPrompt = (event: CustomEvent) => {
      setDeferredPrompt(event.detail)
      setState((prev) => ({ ...prev, isInstallable: true }))
    }

    const handleInstalled = () => {
      setState((prev) => ({ ...prev, isInstalled: true, isInstallable: false }))
    }

    window.addEventListener('pwa-install-available', handleInstallPrompt as EventListener)
    window.addEventListener('pwa-installed', handleInstalled)

    // Online/offline event listeners
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }))
      // Trigger sync when coming back online
      syncOfflineData()
    }

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      unsubscribeOnline()
      unsubscribeInstallPrompt()
      unsubscribeInstalled()
      window.removeEventListener('pwa-install-available', handleInstallPrompt as EventListener)
      window.removeEventListener('pwa-installed', handleInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      setDeferredPrompt(null)
      setState((prev) => ({ ...prev, isInstallable: false }))

      if (outcome === 'accepted') {
        setState((prev) => ({ ...prev, isInstalled: true }))
      }

      return outcome
    } catch (error) {
      console.error('PWA installation failed:', error)
      return 'dismissed'
    }
  }, [deferredPrompt])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      const permission = await pwaPushManager.requestPermission()
      setState((prev) => ({ ...prev, notificationPermission: permission }))
      return permission
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }, [])

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    try {
      const subscription = await pwaPushManager.init()
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }, [])

  // Send local notification
  const sendLocalNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      try {
        await pwaPushManager.sendLocalNotification(title, options)
      } catch (error) {
        console.error('Failed to send local notification:', error)
      }
    },
    [],
  )

  // Add offline action
  const addOfflineAction = useCallback(async (
    type: OfflineData['type'],
    action: OfflineData['action'],
    data: any,
  ): Promise<string> => {
    try {
      const id = await pwaOfflineSync.addOfflineAction(type, action, data)

      // Update offline data count
      const offlineData = await pwaIndexedDB.getOfflineData()
      setState((prev) => ({ ...prev, offlineDataCount: offlineData.length }))

      return id
    } catch (error) {
      console.error('Failed to add offline action:', error)
      throw error
    }
  }, [])

  // Sync offline data
  const syncOfflineData = useCallback(async () => {
    if (!state.isOnline) {
      setState((prev) => ({ ...prev, syncStatus: 'error' }))
      return
    }

    setState((prev) => ({ ...prev, syncStatus: 'syncing' }))

    try {
      await pwaOfflineSync.sync()

      // Update offline data count and sync time
      const offlineData = await pwaIndexedDB.getOfflineData()
      setState((prev) => ({
        ...prev,
        offlineDataCount: offlineData.length,
        syncStatus: 'idle',
        lastSyncTime: new Date(),
      }))
    } catch (error) {
      console.error('Sync failed:', error)
      setState((prev) => ({ ...prev, syncStatus: 'error' }))
    }
  }, [state.isOnline])

  // Cache data
  const cacheData = useCallback(async (key: string, data: any, ttl?: number) => {
    try {
      await pwaIndexedDB.cacheData(key, data, ttl)
    } catch (error) {
      console.error('Failed to cache data:', error)
    }
  }, [])

  // Get cached data
  const getCachedData = useCallback(async (key: string) => {
    try {
      return await pwaIndexedDB.getCachedData(key)
    } catch (error) {
      console.error('Failed to get cached data:', error)
      return null
    }
  }, [])

  // Clear all data
  const clearAllData = useCallback(async () => {
    try {
      // Clear IndexedDB
      const request = indexedDB.deleteDatabase('NeonProOfflineDB')
      request.onsuccess = () => {
        console.warn('IndexedDB cleared successfully')
        setState((prev) => ({ ...prev, offlineDataCount: 0 }))
      }
      request.onerror = () => {
        console.error('Failed to clear IndexedDB')
      }

      // Clear service worker cache
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
        }
      }
    } catch (error) {
      console.error('Failed to clear data:', error)
    }
  }, [])

  return {
    // State
    ...state,

    // Actions
    installPWA,
    requestNotificationPermission,
    subscribeToPushNotifications,
    sendLocalNotification,
    addOfflineAction,
    syncOfflineData,
    cacheData,
    getCachedData,
    clearAllData,

    // Derived state
    hasOfflineData: state.offlineDataCount > 0,
    canSync: state.isOnline && state.offlineDataCount > 0,
    isSyncing: state.syncStatus === 'syncing',
    syncFailed: state.syncStatus === 'error',
  }
}

// Hook for offline-aware data fetching
export function useOfflineData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    ttl?: number
    enabled?: boolean
    refetchOnFocus?: boolean
  },
) {
  const { isOnline, cacheData, getCachedData } = usePWA()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (forceFresh = false) => {
    if (!options?.enabled) return

    setLoading(true)
    setError(null)

    try {
      // Try to get cached data first (unless forcing fresh data)
      if (!forceFresh) {
        const cached = await getCachedData(key) as T | null
        if (cached) {
          setData(cached)
          setLoading(false)
          return
        }
      }

      // Fetch fresh data
      if (isOnline) {
        const freshData = await fetchFn()
        setData(freshData)

        // Cache the data
        await cacheData(key, freshData, options?.ttl)
      } else {
        setError('Offline and no cached data available')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [key, fetchFn, isOnline, cacheData, getCachedData, options?.enabled, options?.ttl])

  useEffect(() => {
    if (options?.enabled ?? true) {
      fetchData()
    }
  }, [fetchData, options?.enabled])

  // Refetch when coming back online
  useEffect(() => {
    if (options?.refetchOnFocus && isOnline) {
      fetchData(true)
    }
  }, [isOnline, fetchData, options?.refetchOnFocus])

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
  }
}
