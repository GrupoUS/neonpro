/**
 * Offline Synchronization System
 * Story 7.4: Mobile App API Support - Offline Sync
 * 
 * Comprehensive offline synchronization with:
 * - Bidirectional data sync
 * - Conflict resolution
 * - Queue management
 * - Background sync
 * - Data integrity
 * - Performance optimization
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  OfflineConfig,
  SyncOperation,
  SyncBatch,
  SyncConflict,
  SyncResult,
  SyncStatus,
  SyncOptions,
  OfflineStorage,
  OfflinePatient,
  OfflineAppointment,
  OfflineTreatment,
  OfflinePayment,
  OfflineMetadata,
  ApiError
} from './types'

export class OfflineSync {
  private supabase: SupabaseClient
  private config: OfflineConfig
  private operationQueue: SyncOperation[] = []
  private conflictQueue: SyncConflict[] = []
  private isInitialized = false
  private isSyncing = false
  private syncProgress = 0
  private lastSyncTimestamp = 0
  private userId: string | null = null
  private clinicId: string | null = null
  private eventHandlers: { [key: string]: Function[] } = {}
  private syncInterval?: NodeJS.Timeout
  private offlineStorage: OfflineStorage

  constructor(supabase: SupabaseClient, config: OfflineConfig) {
    this.supabase = supabase
    this.config = {
      enabled: true,
      maxStorageSize: 100 * 1024 * 1024, // 100MB
      syncInterval: 60, // 1 minute
      conflictResolution: 'timestamp',
      autoSync: true,
      syncOnReconnect: true,
      backgroundSync: true,
      maxRetries: 5,
      retryDelay: 5, // 5 seconds
      ...config
    }

    this.offlineStorage = {
      patients: [],
      appointments: [],
      treatments: [],
      payments: [],
      metadata: {
        lastSyncTimestamp: 0,
        version: '1.0.0',
        checksum: '',
        totalRecords: 0,
        storageSize: 0,
        expiresAt: 0
      }
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      if (!this.config.enabled) {
        console.log('Offline sync is disabled')
        return
      }

      // Load offline storage from local storage
      await this.loadOfflineStorage()

      // Load operation queue
      await this.loadOperationQueue()

      // Load conflict queue
      await this.loadConflictQueue()

      this.isInitialized = true
      console.log('Offline Sync initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Offline Sync:', error)
      throw error
    }
  }

  async initializeForUser(userId: string, clinicId: string): Promise<void> {
    this.userId = userId
    this.clinicId = clinicId

    // Start auto sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync()
    }

    console.log(`Offline sync initialized for user ${userId} in clinic ${clinicId}`)
  }

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  async performSync(options: SyncOptions & { userId: string; clinicId: string }): Promise<SyncResult> {
    const startTime = Date.now()
    
    try {
      if (this.isSyncing) {
        throw new Error('Sync already in progress')
      }

      this.isSyncing = true
      this.syncProgress = 0
      
      const result: SyncResult = {
        success: false,
        operations: [],
        conflicts: [],
        errors: [],
        statistics: {
          totalOperations: 0,
          successfulOperations: 0,
          failedOperations: 0,
          conflictOperations: 0,
          bytesTransferred: 0,
          compressionRatio: 0
        },
        duration: 0
      }

      // Determine sync direction
      const direction = options.direction || 'both'
      const entities = options.entities || ['patients', 'appointments', 'treatments', 'payments']
      const batchSize = options.batchSize || 100

      // Phase 1: Upload local changes (if direction is 'up' or 'both')
      if (direction === 'up' || direction === 'both') {
        const uploadResult = await this.uploadLocalChanges(entities, batchSize, options)
        result.operations.push(...uploadResult.operations)
        result.conflicts.push(...uploadResult.conflicts)
        result.errors.push(...uploadResult.errors)
        result.statistics.totalOperations += uploadResult.statistics.totalOperations
        result.statistics.successfulOperations += uploadResult.statistics.successfulOperations
        result.statistics.failedOperations += uploadResult.statistics.failedOperations
        result.statistics.conflictOperations += uploadResult.statistics.conflictOperations
      }

      this.syncProgress = 50
      this.emitEvent('syncProgress', this.syncProgress, null)

      // Phase 2: Download server changes (if direction is 'down' or 'both')
      if (direction === 'down' || direction === 'both') {
        const downloadResult = await this.downloadServerChanges(entities, batchSize, options)
        result.operations.push(...downloadResult.operations)
        result.conflicts.push(...downloadResult.conflicts)
        result.errors.push(...downloadResult.errors)
        result.statistics.totalOperations += downloadResult.statistics.totalOperations
        result.statistics.successfulOperations += downloadResult.statistics.successfulOperations
        result.statistics.failedOperations += downloadResult.statistics.failedOperations
        result.statistics.conflictOperations += downloadResult.statistics.conflictOperations
      }

      this.syncProgress = 90
      this.emitEvent('syncProgress', this.syncProgress, null)

      // Phase 3: Resolve conflicts
      if (result.conflicts.length > 0) {
        await this.resolveConflicts(result.conflicts)
      }

      // Update sync timestamp
      this.lastSyncTimestamp = Date.now()
      await this.updateOfflineMetadata()

      // Save updated storage
      await this.saveOfflineStorage()
      await this.saveOperationQueue()
      await this.saveConflictQueue()

      result.success = result.errors.length === 0
      result.duration = Date.now() - startTime
      this.syncProgress = 100

      console.log(`Sync completed in ${result.duration}ms:`, result.statistics)
      return result
    } catch (error) {
      console.error('Sync failed:', error)
      throw error
    } finally {
      this.isSyncing = false
      this.syncProgress = 0
    }
  }

  private async uploadLocalChanges(
    entities: string[],
    batchSize: number,
    options: SyncOptions
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      operations: [],
      conflicts: [],
      errors: [],
      statistics: {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        conflictOperations: 0,
        bytesTransferred: 0,
        compressionRatio: 0
      },
      duration: 0
    }

    // Get pending operations from queue
    const pendingOps = this.operationQueue.filter(op => 
      entities.includes(op.entity) && op.status === 'pending'
    )

    if (pendingOps.length === 0) {
      return result
    }

    // Process operations in batches
    const batches = this.chunkArray(pendingOps, batchSize)
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const batchResult = await this.processBatch(batch, 'upload')
      
      result.operations.push(...batchResult.operations)
      result.conflicts.push(...batchResult.conflicts)
      result.errors.push(...batchResult.errors)
      result.statistics.totalOperations += batchResult.statistics.totalOperations
      result.statistics.successfulOperations += batchResult.statistics.successfulOperations
      result.statistics.failedOperations += batchResult.statistics.failedOperations
      result.statistics.conflictOperations += batchResult.statistics.conflictOperations

      // Update progress
      const progress = Math.floor((i + 1) / batches.length * 25) // 25% of total progress
      this.syncProgress = progress
      this.emitEvent('syncProgress', this.syncProgress, batch[0])
    }

    return result
  }

  private async downloadServerChanges(
    entities: string[],
    batchSize: number,
    options: SyncOptions
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      operations: [],
      conflicts: [],
      errors: [],
      statistics: {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        conflictOperations: 0,
        bytesTransferred: 0,
        compressionRatio: 0
      },
      duration: 0
    }

    for (const entity of entities) {
      try {
        const serverData = await this.fetchServerData(entity, this.lastSyncTimestamp)
        
        if (serverData.length > 0) {
          const operations = this.createDownloadOperations(entity, serverData)
          const batchResult = await this.processBatch(operations, 'download')
          
          result.operations.push(...batchResult.operations)
          result.conflicts.push(...batchResult.conflicts)
          result.errors.push(...batchResult.errors)
          result.statistics.totalOperations += batchResult.statistics.totalOperations
          result.statistics.successfulOperations += batchResult.statistics.successfulOperations
          result.statistics.failedOperations += batchResult.statistics.failedOperations
          result.statistics.conflictOperations += batchResult.statistics.conflictOperations
        }
      } catch (error) {
        console.error(`Failed to download ${entity}:`, error)
        result.errors.push({
          code: 'DOWNLOAD_FAILED',
          message: `Failed to download ${entity}: ${error}`,
          retryable: true
        })
      }
    }

    return result
  }

  private async processBatch(operations: SyncOperation[], direction: 'upload' | 'download'): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      operations: [],
      conflicts: [],
      errors: [],
      statistics: {
        totalOperations: operations.length,
        successfulOperations: 0,
        failedOperations: 0,
        conflictOperations: 0,
        bytesTransferred: 0,
        compressionRatio: 0
      },
      duration: 0
    }

    for (const operation of operations) {
      try {
        if (direction === 'upload') {
          await this.uploadOperation(operation)
        } else {
          await this.downloadOperation(operation)
        }
        
        operation.status = 'synced'
        result.operations.push(operation)
        result.statistics.successfulOperations++
      } catch (error) {
        if (this.isConflictError(error)) {
          const conflict = this.createConflict(operation, error)
          result.conflicts.push(conflict)
          result.statistics.conflictOperations++
          this.emitEvent('syncConflict', conflict)
        } else {
          operation.status = 'failed'
          operation.lastError = error.message
          operation.retryCount++
          result.errors.push({
            code: 'OPERATION_FAILED',
            message: `Operation failed: ${error}`,
            retryable: operation.retryCount < this.config.maxRetries
          })
          result.statistics.failedOperations++
        }
      }
    }

    return result
  }

  // ============================================================================
  // OPERATION MANAGEMENT
  // ============================================================================

  async queueOperation(operation: SyncOperation): Promise<void> {
    try {
      // Add to queue
      this.operationQueue.push(operation)
      
      // Save queue to storage
      await this.saveOperationQueue()
      
      console.log(`Queued operation: ${operation.type} ${operation.entity} ${operation.entityId}`)
    } catch (error) {
      console.error('Failed to queue operation:', error)
      throw error
    }
  }

  private async uploadOperation(operation: SyncOperation): Promise<void> {
    const { entity, entityId, type, data } = operation
    
    switch (type) {
      case 'create':
        await this.createServerRecord(entity, data)
        break
      case 'update':
        await this.updateServerRecord(entity, entityId, data)
        break
      case 'delete':
        await this.deleteServerRecord(entity, entityId)
        break
    }
  }

  private async downloadOperation(operation: SyncOperation): Promise<void> {
    const { entity, entityId, type, data } = operation
    
    switch (type) {
      case 'create':
      case 'update':
        await this.updateLocalRecord(entity, data)
        break
      case 'delete':
        await this.deleteLocalRecord(entity, entityId)
        break
    }
  }

  // ============================================================================
  // CONFLICT RESOLUTION
  // ============================================================================

  private async resolveConflicts(conflicts: SyncConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      try {
        const resolution = await this.resolveConflict(conflict)
        
        if (resolution.resolution) {
          // Apply resolution
          await this.applyConflictResolution(conflict, resolution.resolution, resolution.resolvedData)
          
          // Remove from conflict queue
          const index = this.conflictQueue.findIndex(c => c.id === conflict.id)
          if (index > -1) {
            this.conflictQueue.splice(index, 1)
          }
        } else {
          // Add to conflict queue for manual resolution
          this.conflictQueue.push(conflict)
        }
      } catch (error) {
        console.error('Failed to resolve conflict:', error)
        this.conflictQueue.push(conflict)
      }
    }
  }

  private async resolveConflict(conflict: SyncConflict): Promise<{ resolution?: string; resolvedData?: any }> {
    switch (this.config.conflictResolution) {
      case 'client':
        return { resolution: 'local', resolvedData: conflict.localData }
      
      case 'server':
        return { resolution: 'server', resolvedData: conflict.serverData }
      
      case 'timestamp':
        const localTimestamp = conflict.localData.updated_at || conflict.localData.created_at
        const serverTimestamp = conflict.serverData.updated_at || conflict.serverData.created_at
        
        if (new Date(localTimestamp) > new Date(serverTimestamp)) {
          return { resolution: 'local', resolvedData: conflict.localData }
        } else {
          return { resolution: 'server', resolvedData: conflict.serverData }
        }
      
      case 'manual':
      default:
        return {} // No automatic resolution
    }
  }

  private async applyConflictResolution(
    conflict: SyncConflict,
    resolution: string,
    resolvedData: any
  ): Promise<void> {
    if (resolution === 'local') {
      // Upload local data to server
      await this.updateServerRecord(conflict.entity, conflict.entityId, conflict.localData)
    } else if (resolution === 'server') {
      // Update local data with server data
      await this.updateLocalRecord(conflict.entity, conflict.serverData)
    } else if (resolution === 'merge') {
      // Apply merged data to both local and server
      await this.updateLocalRecord(conflict.entity, resolvedData)
      await this.updateServerRecord(conflict.entity, conflict.entityId, resolvedData)
    }
  }

  // ============================================================================
  // DATA OPERATIONS
  // ============================================================================

  async getOfflineData(endpoint: string, params?: any): Promise<any> {
    try {
      const entity = this.extractEntityFromEndpoint(endpoint)
      const entityId = this.extractEntityIdFromEndpoint(endpoint)
      
      switch (entity) {
        case 'patients':
          return entityId 
            ? this.offlineStorage.patients.find(p => p.id === entityId)
            : this.filterPatients(params)
        
        case 'appointments':
          return entityId
            ? this.offlineStorage.appointments.find(a => a.id === entityId)
            : this.filterAppointments(params)
        
        case 'treatments':
          return entityId
            ? this.offlineStorage.treatments.find(t => t.id === entityId)
            : this.filterTreatments(params)
        
        case 'payments':
          return entityId
            ? this.offlineStorage.payments.find(p => p.id === entityId)
            : this.filterPayments(params)
        
        default:
          return null
      }
    } catch (error) {
      console.error('Failed to get offline data:', error)
      return null
    }
  }

  async getOfflineStorage(): Promise<OfflineStorage> {
    return { ...this.offlineStorage }
  }

  private async updateLocalRecord(entity: string, data: any): Promise<void> {
    switch (entity) {
      case 'patients':
        this.updatePatientRecord(data)
        break
      case 'appointments':
        this.updateAppointmentRecord(data)
        break
      case 'treatments':
        this.updateTreatmentRecord(data)
        break
      case 'payments':
        this.updatePaymentRecord(data)
        break
    }
  }

  private async deleteLocalRecord(entity: string, entityId: string): Promise<void> {
    switch (entity) {
      case 'patients':
        this.offlineStorage.patients = this.offlineStorage.patients.filter(p => p.id !== entityId)
        break
      case 'appointments':
        this.offlineStorage.appointments = this.offlineStorage.appointments.filter(a => a.id !== entityId)
        break
      case 'treatments':
        this.offlineStorage.treatments = this.offlineStorage.treatments.filter(t => t.id !== entityId)
        break
      case 'payments':
        this.offlineStorage.payments = this.offlineStorage.payments.filter(p => p.id !== entityId)
        break
    }
  }

  // ============================================================================
  // SERVER OPERATIONS
  // ============================================================================

  private async fetchServerData(entity: string, since: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(entity)
      .select('*')
      .eq('clinic_id', this.clinicId)
      .gte('updated_at', new Date(since).toISOString())
      .order('updated_at', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to fetch ${entity}: ${error.message}`)
    }
    
    return data || []
  }

  private async createServerRecord(entity: string, data: any): Promise<void> {
    const { error } = await this.supabase
      .from(entity)
      .insert(data)
    
    if (error) {
      throw new Error(`Failed to create ${entity}: ${error.message}`)
    }
  }

  private async updateServerRecord(entity: string, entityId: string, data: any): Promise<void> {
    const { error } = await this.supabase
      .from(entity)
      .update(data)
      .eq('id', entityId)
    
    if (error) {
      throw new Error(`Failed to update ${entity}: ${error.message}`)
    }
  }

  private async deleteServerRecord(entity: string, entityId: string): Promise<void> {
    const { error } = await this.supabase
      .from(entity)
      .delete()
      .eq('id', entityId)
    
    if (error) {
      throw new Error(`Failed to delete ${entity}: ${error.message}`)
    }
  }

  // ============================================================================
  // STATUS & MONITORING
  // ============================================================================

  async getStatus(): Promise<SyncStatus> {
    return {
      isOnline: navigator.onLine,
      lastSyncAt: this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp) : undefined,
      nextSyncAt: this.getNextSyncTime(),
      pendingOperations: this.operationQueue.filter(op => op.status === 'pending').length,
      conflictCount: this.conflictQueue.length,
      syncInProgress: this.isSyncing,
      syncProgress: this.syncProgress,
      estimatedTimeRemaining: this.estimateTimeRemaining()
    }
  }

  private getNextSyncTime(): Date | undefined {
    if (!this.config.autoSync || !this.lastSyncTimestamp) {
      return undefined
    }
    
    return new Date(this.lastSyncTimestamp + (this.config.syncInterval * 1000))
  }

  private estimateTimeRemaining(): number | undefined {
    if (!this.isSyncing) {
      return undefined
    }
    
    const pendingOps = this.operationQueue.filter(op => op.status === 'pending').length
    const avgTimePerOp = 100 // milliseconds
    
    return pendingOps * avgTimePerOp
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  private async loadOfflineStorage(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(`offline-storage-${this.userId}`)
        if (stored) {
          this.offlineStorage = JSON.parse(stored)
        }
      }
    } catch (error) {
      console.error('Failed to load offline storage:', error)
    }
  }

  private async saveOfflineStorage(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          `offline-storage-${this.userId}`,
          JSON.stringify(this.offlineStorage)
        )
      }
    } catch (error) {
      console.error('Failed to save offline storage:', error)
    }
  }

  private async loadOperationQueue(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(`operation-queue-${this.userId}`)
        if (stored) {
          this.operationQueue = JSON.parse(stored)
        }
      }
    } catch (error) {
      console.error('Failed to load operation queue:', error)
    }
  }

  private async saveOperationQueue(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          `operation-queue-${this.userId}`,
          JSON.stringify(this.operationQueue)
        )
      }
    } catch (error) {
      console.error('Failed to save operation queue:', error)
    }
  }

  private async loadConflictQueue(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(`conflict-queue-${this.userId}`)
        if (stored) {
          this.conflictQueue = JSON.parse(stored)
        }
      }
    } catch (error) {
      console.error('Failed to load conflict queue:', error)
    }
  }

  private async saveConflictQueue(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          `conflict-queue-${this.userId}`,
          JSON.stringify(this.conflictQueue)
        )
      }
    } catch (error) {
      console.error('Failed to save conflict queue:', error)
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing && this.userId && this.clinicId) {
        this.performSync({
          userId: this.userId,
          clinicId: this.clinicId,
          priority: 'low'
        }).catch(console.error)
      }
    }, this.config.syncInterval * 1000)
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private createDownloadOperations(entity: string, serverData: any[]): SyncOperation[] {
    return serverData.map(data => ({
      id: `download-${entity}-${data.id}-${Date.now()}`,
      type: 'update',
      entity,
      entityId: data.id,
      data,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      priority: 'normal'
    }))
  }

  private isConflictError(error: any): boolean {
    return error.message && error.message.includes('conflict')
  }

  private createConflict(operation: SyncOperation, error: any): SyncConflict {
    return {
      id: `conflict-${operation.id}-${Date.now()}`,
      operationId: operation.id,
      entity: operation.entity,
      entityId: operation.entityId,
      localData: operation.data,
      serverData: error.serverData || {},
      conflictType: 'data',
      timestamp: Date.now()
    }
  }

  private extractEntityFromEndpoint(endpoint: string): string {
    const parts = endpoint.split('/').filter(Boolean)
    return parts[0] || 'unknown'
  }

  private extractEntityIdFromEndpoint(endpoint: string): string | null {
    const parts = endpoint.split('/').filter(Boolean)
    return parts[1] || null
  }

  private filterPatients(params: any): OfflinePatient[] {
    let patients = this.offlineStorage.patients
    
    if (params?.search) {
      const search = params.search.toLowerCase()
      patients = patients.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.email?.toLowerCase().includes(search) ||
        p.phone?.includes(search)
      )
    }
    
    if (params?.isActive !== undefined) {
      patients = patients.filter(p => p.isActive === params.isActive)
    }
    
    return patients
  }

  private filterAppointments(params: any): OfflineAppointment[] {
    let appointments = this.offlineStorage.appointments
    
    if (params?.patientId) {
      appointments = appointments.filter(a => a.patientId === params.patientId)
    }
    
    if (params?.status) {
      appointments = appointments.filter(a => a.status === params.status)
    }
    
    if (params?.date) {
      const date = new Date(params.date).toDateString()
      appointments = appointments.filter(a => 
        new Date(a.scheduledAt).toDateString() === date
      )
    }
    
    return appointments
  }

  private filterTreatments(params: any): OfflineTreatment[] {
    let treatments = this.offlineStorage.treatments
    
    if (params?.category) {
      treatments = treatments.filter(t => t.category === params.category)
    }
    
    if (params?.isActive !== undefined) {
      treatments = treatments.filter(t => t.isActive === params.isActive)
    }
    
    return treatments
  }

  private filterPayments(params: any): OfflinePayment[] {
    let payments = this.offlineStorage.payments
    
    if (params?.patientId) {
      payments = payments.filter(p => p.patientId === params.patientId)
    }
    
    if (params?.status) {
      payments = payments.filter(p => p.status === params.status)
    }
    
    return payments
  }

  private updatePatientRecord(data: any): void {
    const index = this.offlineStorage.patients.findIndex(p => p.id === data.id)
    if (index > -1) {
      this.offlineStorage.patients[index] = { ...this.offlineStorage.patients[index], ...data }
    } else {
      this.offlineStorage.patients.push(data)
    }
  }

  private updateAppointmentRecord(data: any): void {
    const index = this.offlineStorage.appointments.findIndex(a => a.id === data.id)
    if (index > -1) {
      this.offlineStorage.appointments[index] = { ...this.offlineStorage.appointments[index], ...data }
    } else {
      this.offlineStorage.appointments.push(data)
    }
  }

  private updateTreatmentRecord(data: any): void {
    const index = this.offlineStorage.treatments.findIndex(t => t.id === data.id)
    if (index > -1) {
      this.offlineStorage.treatments[index] = { ...this.offlineStorage.treatments[index], ...data }
    } else {
      this.offlineStorage.treatments.push(data)
    }
  }

  private updatePaymentRecord(data: any): void {
    const index = this.offlineStorage.payments.findIndex(p => p.id === data.id)
    if (index > -1) {
      this.offlineStorage.payments[index] = { ...this.offlineStorage.payments[index], ...data }
    } else {
      this.offlineStorage.payments.push(data)
    }
  }

  private async updateOfflineMetadata(): Promise<void> {
    this.offlineStorage.metadata = {
      lastSyncTimestamp: this.lastSyncTimestamp,
      version: '1.0.0',
      checksum: this.calculateChecksum(),
      totalRecords: this.getTotalRecords(),
      storageSize: this.calculateStorageSize(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }
  }

  private calculateChecksum(): string {
    const data = JSON.stringify({
      patients: this.offlineStorage.patients,
      appointments: this.offlineStorage.appointments,
      treatments: this.offlineStorage.treatments,
      payments: this.offlineStorage.payments
    })
    
    // Simple checksum calculation
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return hash.toString(36)
  }

  private getTotalRecords(): number {
    return (
      this.offlineStorage.patients.length +
      this.offlineStorage.appointments.length +
      this.offlineStorage.treatments.length +
      this.offlineStorage.payments.length
    )
  }

  private calculateStorageSize(): number {
    return JSON.stringify(this.offlineStorage).length
  }

  // ============================================================================
  // EVENT MANAGEMENT
  // ============================================================================

  on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = []
    }
    this.eventHandlers[event].push(handler)
  }

  off(event: string, handler?: Function): void {
    if (!this.eventHandlers[event]) {
      return
    }

    if (handler) {
      const index = this.eventHandlers[event].indexOf(handler)
      if (index > -1) {
        this.eventHandlers[event].splice(index, 1)
      }
    } else {
      this.eventHandlers[event] = []
    }
  }

  private emitEvent(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers[event]
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in sync event handler ${event}:`, error)
        }
      }
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  async destroy(): Promise<void> {
    try {
      this.stopAutoSync()
      
      // Save final state
      await Promise.all([
        this.saveOfflineStorage(),
        this.saveOperationQueue(),
        this.saveConflictQueue()
      ])
      
      // Clear data
      this.operationQueue = []
      this.conflictQueue = []
      this.eventHandlers = {}
      this.userId = null
      this.clinicId = null
      
      this.isInitialized = false
      
      console.log('Offline Sync destroyed successfully')
    } catch (error) {
      console.error('Error destroying Offline Sync:', error)
    }
  }
}