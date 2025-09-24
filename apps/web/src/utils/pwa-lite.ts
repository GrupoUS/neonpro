export type OfflineData = {
  id?: string
  type: string
  action: string
  payload?: unknown
  timestamp?: number
}

type NotificationPermission = 'default' | 'granted' | 'denied'

const DB_NAME = 'NeonProOfflineDB'
const DB_VERSION = 1
const OFFLINE_STORE = 'offlineActions'
const CACHE_STORE = 'cache'

let dbPromise: Promise<IDBDatabase> | null = null

async function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(OFFLINE_STORE)) {
        db.createObjectStore(OFFLINE_STORE, { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'key' })
        cacheStore.createIndex('expires', 'expires', { unique: false })
      }
    }
  })

  return dbPromise
}

export const pwaIndexedDB = {
  async init(): Promise<void> {
    await getDB()
  },

  async getOfflineData(): Promise<OfflineData[]> {
    const db = await getDB()
    const tx = db.transaction(OFFLINE_STORE, 'readonly')
    const store = tx.objectStore(OFFLINE_STORE)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result as OfflineData[])
      request.onerror = () => reject(request.error)
    })
  },

  async cacheData(key: string, data: unknown, ttl?: number): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(CACHE_STORE, 'readwrite')
    const store = tx.objectStore(CACHE_STORE)
    const expires = ttl ? Date.now() + ttl * 1000 : undefined
    new Promise((resolve, reject) => {
      const request = store.put({ key, data, expires })
      request.onsuccess = resolve
      request.onerror = () => reject(request.error)
    })
  },

  async getCachedData(key: string): Promise<unknown> {
    const db = await getDB()
    const tx = db.transaction(CACHE_STORE, 'readonly')
    const store = tx.objectStore(CACHE_STORE)
    const entry = new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const entryData = await entry as { expires?: number; data?: unknown } | undefined
    if (entryData && entryData.expires && Date.now() > entryData.expires) {
      new Promise((resolve, reject) => {
        const request = store.delete(key)
        request.onsuccess = resolve
        request.onerror = () => reject(request.error)
      })
      return null
    }
    return entryData?.data || null
  },
}

export const pwaOfflineSync = {
  async init(): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      await navigator.serviceWorker.ready
    }
  },

  async sync(): Promise<void> {
    const offlineData = await pwaIndexedDB.getOfflineData()
    for (const item of offlineData) {
      try {
        console.warn('Syncing offline action:', item)
        const db = await getDB()
        const tx = db.transaction(OFFLINE_STORE, 'readwrite')
        const store = tx.objectStore(OFFLINE_STORE)
        new Promise((resolve, reject) => {
          const request = store.delete(item.id!)
          request.onsuccess = resolve
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        console.error('Sync failed for item:', item.id, error)
        break
      }
    }
  },

  async addOfflineAction(type: string, action: string, data: unknown): Promise<string> {
    const db = await getDB()
    const tx = db.transaction(OFFLINE_STORE, 'readwrite')
    const store = tx.objectStore(OFFLINE_STORE)
    const id = new Promise<number>((resolve, reject) => {
      const request = store.add({ type, action, payload: data, timestamp: Date.now() })
      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
    if (navigator.onLine) {
      setTimeout(() => this.sync(), 1000)
    }
    return (await id).toString()
  },
}

export const pwaPushManager = {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'default'
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission
    }
    return Notification.permission as NotificationPermission
  },

  async init(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BDn...') as BufferSource, // Placeholder - replace with actual VAPID key
      })
    }
    return subscription
  },

  async sendLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission === 'granted') {
      new Notification(title, options)
    }
  },
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const pwaStatus = {
  isPWAInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
  },

  subscribe(event: string, cb: (value: any) => void) {
    const handlers: Record<string, () => void> = {
      online: () => cb(navigator.onLine),
      installPromptAvailable: () => cb(!!(window as any).deferredPrompt),
      isInstalled: () => cb(this.isPWAInstalled()),
    }
    const handler = handlers[event]
    if (handler) {
      window.addEventListener(event, handler)
      handler() // Initial call
    }
    return () => {
      if (handler) {
        window.removeEventListener(event, handler)
      }
    }
  },
}
