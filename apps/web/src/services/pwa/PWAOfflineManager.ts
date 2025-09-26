/**
 * NeonPro PWA Advanced Offline Manager
 *
 * Sophisticated offline data management with intelligent synchronization,
 * conflict resolution, and queue management for aesthetic clinic workflows.
 */

export interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: string
  entityId: string
  data: Record<string, unknown>
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  retryCount: number
  maxRetries: number
  syncAttempts: Date[]
  dependencies?: string[]
  conflictResolution?: 'client-wins' | 'server-wins' | 'manual'
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict'
}

export interface OfflineQueue {
  id: string
  name: string
  operations: OfflineOperation[]
  metadata: {
    createdAt: Date
    priority: 'low' | 'medium' | 'high' | 'critical'
    autoSync: boolean
    maxRetries: number
    timeout: number // milliseconds
  }
}

export interface SyncResult {
  success: boolean
  operationsProcessed: number
  errors: string[]
  conflicts: OfflineOperation[]
  duration: number
  bytesSynced: number
}

export interface ConflictResolutionStrategy {
  type: 'timestamp' | 'version' | 'field-level' | 'manual'
  priorityFields: string[]
  mergeStrategy: 'auto' | 'prompt' | 'always-server' | 'always-client'
}

interface ServerData {
  version: number
  timestamp: Date
  data: Record<string, unknown>
}

import { logger } from '@/utils/logger'

export class PWAOfflineManager {
  private queues: Map<string, OfflineQueue> = new Map()
  private isOnline = navigator.onLine
  private syncInProgress = false
  private autoSyncEnabled = true
  private conflictStrategies: Map<string, ConflictResolutionStrategy> = new Map()

  // IndexedDB setup
  private readonly DB_NAME = 'NeonProOfflineDB'
  private readonly DB_VERSION = 2
  private db: IDBDatabase | null = null

  // Default settings
  private settings = {
    autoSync: true,
    syncInterval: 30000, // 30 seconds
    maxRetries: 3,
    queueTimeout: 300000, // 5 minutes
    conflictResolution: 'auto' as 'auto' | 'prompt',
    storageLimit: 100 * 1024 * 1024, // 100MB
    compressionEnabled: true,
    encryptionEnabled: true,
  }

  private constructor() {}

  static getInstance(): PWAOfflineManager {
    if (!PWAOfflineManager.instance) {
      PWAOfflineManager.instance = new PWAOfflineManager()
    }
    return PWAOfflineManager.instance
  }

  async initialize(): Promise<void> {
    try {
      await this.initIndexedDB()
      await this.loadQueues()
      this.setupEventListeners()
      this.setupDefaultConflictStrategies()

      if (this.isOnline && this.settings.autoSync) {
        setTimeout(() => this.processAllQueues(), 1000)
      }

      await logger.info('NeonPro Offline Manager initialized successfully')
    } catch (error) {
      await logger.error('Failed to initialize Offline Manager', { error })
      throw error
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores for different entity types
        if (!db.objectStoreNames.contains('operations')) {
          const operationsStore = db.createObjectStore('operations', { keyPath: 'id' })
          operationsStore.createIndex('queue', 'queueId')
          operationsStore.createIndex('status', 'status')
          operationsStore.createIndex('priority', 'priority')
          operationsStore.createIndex('timestamp', 'timestamp')
        }

        if (!db.objectStoreNames.contains('queues')) {
          const queuesStore = db.createObjectStore('queues', { keyPath: 'id' })
          queuesStore.createIndex('name', 'name')
          queuesStore.createIndex('priority', ['metadata.priority'])
        }

        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictsStore = db.createObjectStore('conflicts', { keyPath: 'id' })
          conflictsStore.createIndex('operationId', 'operationId')
          conflictsStore.createIndex('resolved', 'resolved')
        }

        if (!db.objectStoreNames.contains('sync-log')) {
          const syncLogStore = db.createObjectStore('sync-log', { keyPath: 'id' })
          syncLogStore.createIndex('timestamp', 'timestamp')
          syncLogStore.createIndex('queueId', 'queueId')
        }
      }
    })
  }

  private async loadQueues(): Promise<void> {
    if (!this.db) return

    try {
      const transaction = this.db.transaction(['queues'], 'readonly')
      const store = transaction.objectStore('queues')
      const request = store.getAll()

      request.onsuccess = () => {
        request.result.forEach((queue: OfflineQueue) => {
          this.queues.set(queue.id, queue)
        })
      }
    } catch (error) {
      await logger.error('Error loading queues', { error })
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())

    // Listen for service worker messages
    navigator.serviceWorker?.addEventListener('message', event => {
      if (event.data.type === 'SYNC_REQUEST') {
        this.processAllQueues()
      }
    })
  }

  private setupDefaultConflictStrategies(): void {
    // Configure conflict resolution strategies for different entity types
    this.conflictStrategies.set('appointments', {
      type: 'timestamp',
      priorityFields: ['status', 'dateTime', 'professionalId'],
      mergeStrategy: 'auto',
    })

    this.conflictStrategies.set('patients', {
      type: 'field-level',
      priorityFields: ['name', 'phone', 'email'],
      mergeStrategy: 'prompt',
    })

    this.conflictStrategies.set('treatments', {
      type: 'version',
      priorityFields: ['status', 'notes'],
      mergeStrategy: 'always-server',
    })

    this.conflictStrategies.set('inventory', {
      type: 'field-level',
      priorityFields: ['quantity', 'location'],
      mergeStrategy: 'always-server',
    })
  }

  private async handleOnline(): Promise<void> {
    this.isOnline = true
    await logger.info('Device online - starting sync process')

    if (this.settings.autoSync) {
      this.processAllQueues()
    }
  }

  private async handleOffline(): Promise<void> {
    this.isOnline = false
    await logger.info('Device offline - enabling offline mode')
  }

  // Queue Management
  async createQueue(name: string, options: {
    priority?: 'low' | 'medium' | 'high' | 'critical'
    autoSync?: boolean
    maxRetries?: number
    timeout?: number
  } = {}): Promise<string> {
    const queueId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const queue: OfflineQueue = {
      id: queueId,
      name,
      operations: [],
      metadata: {
        createdAt: new Date(),
        priority: options.priority || 'medium',
        autoSync: options.autoSync ?? true,
        maxRetries: options.maxRetries || this.settings.maxRetries,
        timeout: options.timeout || this.settings.queueTimeout,
      },
    }

    this.queues.set(queueId, queue)
    await this.saveQueue(queue)

    return queueId
  }

  async addOperation(
    queueId: string,
    operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'syncAttempts' | 'status'>,
  ): Promise<string> {
    const queue = this.queues.get(queueId)
    if (!queue) {
      throw new Error(`Queue ${queueId} not found`)
    }

    const fullOperation: OfflineOperation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      syncAttempts: [],
      status: 'pending',
    }

    queue.operations.push(fullOperation)
    await this.saveQueue(queue)

    // Auto-sync if online and auto-sync enabled
    if (this.isOnline && queue.metadata.autoSync && this.settings.autoSync) {
      this.processQueue(queueId)
    }

    return fullOperation.id
  }

  async processQueue(queueId: string): Promise<SyncResult> {
    const queue = this.queues.get(queueId)
    if (!queue) {
      throw new Error(`Queue ${queueId} not found`)
    }

    if (this.syncInProgress) {
      return {
        success: false,
        operationsProcessed: 0,
        errors: ['Sync already in progress'],
        conflicts: [],
        duration: 0,
        bytesSynced: 0,
      }
    }

    this.syncInProgress = true
    const startTime = Date.now()

    try {
      const result = await this.processOperations(queue)

      // Log sync result
      await this.logSyncResult(queueId, result)

      return result
    } finally {
      this.syncInProgress = false
    }
  }

  private async processOperations(queue: OfflineQueue): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      operationsProcessed: 0,
      errors: [],
      conflicts: [],
      duration: 0,
      bytesSynced: 0,
    }

    const operationsToProcess = queue.operations
      .filter(op => op.status === 'pending')
      .sort((a, b) => {
        // Sort by priority, then by timestamp
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.timestamp.getTime() - b.timestamp.getTime()
      })

    for (const operation of operationsToProcess) {
      try {
        const syncResult = await this.processSingleOperation(operation, queue)

        if (syncResult.success) {
          operation.status = 'completed'
          result.operationsProcessed++
          result.bytesSynced += syncResult.bytesSynced || 0
        } else {
          operation.status = 'failed'
          result.errors.push(syncResult.error || 'Unknown error')
        }
      } catch (error) {
        operation.status = 'failed'
        result.errors.push(error instanceof Error ? error.message : String(error))
      }

      operation.syncAttempts.push(new Date())
      operation.retryCount++
    }

    // Remove completed operations
    queue.operations = queue.operations.filter(op => op.status !== 'completed')

    // Update queue
    this.queues.set(queue.id, queue)
    await this.saveQueue(queue)

    result.duration = Date.now() - result.startTime
    result.success = result.errors.length === 0

    return result
  }

  private async processSingleOperation(
    operation: OfflineOperation,
    queue: OfflineQueue,
  ): Promise<{ success: boolean; error?: string; bytesSynced?: number }> {
    // Check retry limit
    if (operation.retryCount >= operation.maxRetries) {
      return { success: false, error: 'Max retries exceeded' }
    }

    // Check dependencies
    if (operation.dependencies) {
      const incompleteDeps = operation.dependencies.filter(depId => {
        return queue.operations.some(op => op.id === depId && op.status !== 'completed')
      })

      if (incompleteDeps.length > 0) {
        return { success: false, error: 'Dependencies not completed' }
      }
    }

    // Check timeout
    const timeout = queue.metadata.timeout
    if (Date.now() - operation.timestamp.getTime() > timeout) {
      return { success: false, error: 'Operation timeout' }
    }

    try {
      // Simulate API call - replace with actual implementation
      const apiResult = await this.executeApiOperation(operation)

      if (apiResult.conflict) {
        // Handle conflict
        const resolution = await this.resolveConflict(operation, apiResult.serverData)

        if (resolution.resolved) {
          // Retry with resolved data
          const resolvedOperation = { ...operation, data: resolution.mergedData }
          return await this.executeApiOperation(resolvedOperation)
        } else {
          operation.status = 'conflict'
          return { success: false, error: 'Conflict could not be resolved' }
        }
      }

      return { success: true, bytesSynced: apiResult.bytesSynced }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  private async executeApiOperation(operation: OfflineOperation): Promise<{
    success: boolean
    conflict?: boolean
    serverData?: ServerData
    bytesSynced?: number
    error?: string
  }> {
    // This is a mock implementation - replace with actual API calls
    const dataSize = JSON.stringify(operation.data).length

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

    // Simulate occasional conflicts (5% chance)
    const hasConflict = Math.random() < 0.05

    if (hasConflict) {
      return {
        success: false,
        conflict: true,
        serverData: {
          version: Math.floor(Math.random() * 1000),
          timestamp: new Date(),
          data: operation.data, // Modified server data would go here
        },
      }
    }

    return {
      success: true,
      bytesSynced: dataSize,
    }
  }

  private async resolveConflict(
    clientOperation: OfflineOperation,
    serverData: ServerData,
  ): Promise<{ resolved: boolean; mergedData?: Record<string, unknown> }> {
    const strategy = this.conflictStrategies.get(clientOperation.entity)

    if (!strategy || strategy.mergeStrategy === 'auto') {
      // Auto-resolve based on timestamp
      const clientTimestamp = clientOperation.timestamp
      const serverTimestamp = new Date(serverData.timestamp)

      if (clientTimestamp > serverTimestamp) {
        return { resolved: true, mergedData: clientOperation.data }
      } else {
        return { resolved: true, mergedData: serverData.data }
      }
    }

    if (strategy.mergeStrategy === 'always-server') {
      return { resolved: true, mergedData: serverData.data }
    }

    if (strategy.mergeStrategy === 'always-client') {
      return { resolved: true, mergedData: clientOperation.data }
    }

    // Manual resolution - would show UI prompt
    await logger.warn('Manual conflict resolution required for operation', { operationId: clientOperation.id })
    return { resolved: false }
  }

  private async saveQueue(queue: OfflineQueue): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction(['queues'], 'readwrite')
    const store = transaction.objectStore('queues')
    await store.put(queue)
  }

  async processAllQueues(): Promise<SyncResult[]> {
    const results: SyncResult[] = []

    // Process queues by priority
    const sortedQueues = Array.from(this.queues.values()).sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.metadata.priority] - priorityOrder[a.metadata.priority]
    })

    for (const queue of sortedQueues) {
      if (queue.operations.length > 0 && queue.metadata.autoSync) {
        try {
          const result = await this.processQueue(queue.id)
          results.push(result)
        } catch (error) {
          results.push({
            success: false,
            operationsProcessed: 0,
            errors: [error instanceof Error ? error.message : String(error)],
            conflicts: [],
            duration: 0,
            bytesSynced: 0,
          })
        }
      }
    }

    return results
  }

  // Utility Methods
  private async logSyncResult(queueId: string, result: SyncResult): Promise<void> {
    if (!this.db) return

    const logEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      queueId,
      timestamp: new Date(),
      result,
    }

    const transaction = this.db.transaction(['sync-log'], 'readwrite')
    const store = transaction.objectStore('sync-log')
    await store.add(logEntry)
  }

  async getSyncStatus(): Promise<{
    isOnline: boolean
    pendingOperations: number
    queues: Array<{
      id: string
      name: string
      operations: number
      priority: string
    }>
    lastSync?: Date
  }> {
    const pendingOperations = Array.from(this.queues.values())
      .reduce(
        (sum, queue) => sum + queue.operations.filter(op => op.status === 'pending').length,
        0,
      )

    const queues = Array.from(this.queues.values()).map(queue => ({
      id: queue.id,
      name: queue.name,
      operations: queue.operations.length,
      priority: queue.metadata.priority,
    }))

    // Get last sync time from logs
    let lastSync: Date | undefined
    if (this.db) {
      try {
        const transaction = this.db.transaction(['sync-log'], 'readonly')
        const store = transaction.objectStore('sync-log')
        const index = store.index('timestamp')
        const request = index.openCursor(null, 'prev')

        request.onsuccess = () => {
          const cursor = request.result
          if (cursor) {
            lastSync = new Date(cursor.value.timestamp)
            cursor.continue()
          }
        }
      } catch {
        // Ignore error
      }
    }

    return {
      isOnline: this.isOnline,
      pendingOperations,
      queues,
      lastSync,
    }
  }

  async clearQueue(queueId: string): Promise<void> {
    const queue = this.queues.get(queueId)
    if (queue) {
      queue.operations = []
      await this.saveQueue(queue)
    }
  }

  async clearAllQueues(): Promise<void> {
    for (const queueId of this.queues.keys()) {
      await this.clearQueue(queueId)
    }
  }

  async getStorageUsage(): Promise<{
    used: number
    total: number
    byQueue: Record<string, number>
  }> {
    const usage: Record<string, number> = {}
    let total = 0

    for (const [queueId, queue] of this.queues) {
      const queueSize = JSON.stringify(queue.operations).length
      usage[queueId] = queueSize
      total += queueSize
    }

    return {
      used: total,
      total: this.settings.storageLimit,
      byQueue: usage,
    }
  }

  // Data compression and encryption (placeholder implementations)
  private async compressData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Implement compression logic
    return this.settings.compressionEnabled ? data : data
  }

  private async encryptData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Implement encryption logic
    return this.settings.encryptionEnabled ? data : data
  }

  private async decryptData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Implement decryption logic
    return this.settings.encryptionEnabled ? data : data
  }

  // Background sync for service worker
  async registerBackgroundSync(): Promise<void> {
    if (
      'serviceWorker' in navigator && 'SyncManager' in window.ServiceWorkerRegistration.prototype
    ) {
      try {
        const registration = await navigator.serviceWorker.ready
        // @ts-ignore - SyncManager may not be in all TypeScript definitions
        await registration.sync.register('neonpro-sync')
        await logger.info('Background sync registered')
      } catch (error) {
        await logger.error('Error registering background sync', { error })
      }
    }
  }
}

// Export singleton instance
export const offlineManager = PWAOfflineManager.getInstance()
