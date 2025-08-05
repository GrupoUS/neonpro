/**
 * Cross-Device Session Synchronization
 * Story 1.4 - Task 6: Real-time synchronization between devices
 * 
 * Features:
 * - Real-time session state synchronization
 * - Cross-device notifications
 * - Conflict resolution
 * - Offline support with sync queue
 * - Device preference management
 * - Session handoff capabilities
 */

import { createClient } from '@supabase/supabase-js';
import { UserRole } from '@/types/auth';
import { SecurityAuditLogger } from './security-audit-logger';

export interface DeviceSession {
  sessionId: string;
  userId: string;
  deviceId: string;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os: string;
    browser: string;
    version: string;
    userAgent: string;
    screenResolution?: string;
    timezone: string;
    language: string;
  };
  isActive: boolean;
  isPrimary: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
  syncState: {
    lastSyncAt: Date;
    pendingChanges: number;
    conflictCount: number;
    isOnline: boolean;
  };
  preferences: {
    notifications: boolean;
    autoSync: boolean;
    syncFrequency: number; // seconds
    conflictResolution: 'manual' | 'latest_wins' | 'primary_wins';
  };
  metadata: Record<string, any>;
}

export interface SyncEvent {
  eventId: string;
  sessionId: string;
  userId: string;
  deviceId: string;
  eventType: 'session_created' | 'session_updated' | 'session_terminated' | 'activity_recorded' | 'preference_changed' | 'data_changed' | 'conflict_detected';
  timestamp: Date;
  data: Record<string, any>;
  version: number;
  checksum: string;
  isProcessed: boolean;
  processingErrors?: string[];
}

export interface SyncConflict {
  conflictId: string;
  sessionId: string;
  userId: string;
  conflictType: 'data_conflict' | 'version_conflict' | 'timestamp_conflict' | 'device_conflict';
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: 'manual' | 'automatic';
  resolutionStrategy?: string;
  localData: Record<string, any>;
  remoteData: Record<string, any>;
  resolvedData?: Record<string, any>;
  isResolved: boolean;
}

export interface SyncStatistics {
  totalSessions: number;
  activeSessions: number;
  devicesOnline: number;
  syncEventsProcessed: number;
  conflictsDetected: number;
  conflictsResolved: number;
  averageSyncLatency: number;
  dataTransferred: number;
  lastSyncAt: Date;
  syncHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface CrossDeviceSyncConfig {
  enabled: boolean;
  syncInterval: number; // seconds
  maxRetries: number;
  retryDelay: number; // seconds
  conflictResolution: 'manual' | 'latest_wins' | 'primary_wins';
  offlineSupport: boolean;
  maxOfflineEvents: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  batchSize: number;
  heartbeatInterval: number; // seconds
  timeoutThreshold: number; // seconds
}

const DEFAULT_CONFIG: CrossDeviceSyncConfig = {
  enabled: true,
  syncInterval: 30,
  maxRetries: 3,
  retryDelay: 5,
  conflictResolution: 'latest_wins',
  offlineSupport: true,
  maxOfflineEvents: 1000,
  compressionEnabled: true,
  encryptionEnabled: true,
  batchSize: 50,
  heartbeatInterval: 60,
  timeoutThreshold: 300
};

export class CrossDeviceSync {
  private supabase;
  private auditLogger: SecurityAuditLogger;
  private config: CrossDeviceSyncConfig;
  private activeSessions: Map<string, DeviceSession> = new Map();
  private syncQueue: Map<string, SyncEvent[]> = new Map();
  private conflictQueue: Map<string, SyncConflict[]> = new Map();
  private syncInterval?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Timeout;
  private websocketConnection?: any;
  private isOnline: boolean = true;
  private lastSyncAt?: Date;
  private syncStatistics: SyncStatistics;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    customConfig?: Partial<CrossDeviceSyncConfig>
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = new SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    
    this.syncStatistics = {
      totalSessions: 0,
      activeSessions: 0,
      devicesOnline: 0,
      syncEventsProcessed: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      averageSyncLatency: 0,
      dataTransferred: 0,
      lastSyncAt: new Date(),
      syncHealth: 'excellent'
    };
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize cross-device synchronization
   */
  async initialize(): Promise<void> {
    try {
      // Load existing sessions
      await this.loadActiveSessions();
      
      // Set up real-time subscriptions
      await this.setupRealtimeSubscriptions();
      
      // Start sync intervals
      this.startSyncInterval();
      this.startHeartbeatInterval();
      
      // Process any pending sync events
      await this.processPendingSyncEvents();
      
      console.log('Cross-device synchronization initialized');
      
    } catch (error) {
      console.error('Failed to initialize cross-device sync:', error);
      throw error;
    }
  }

  /**
   * Register a new device session
   */
  async registerDeviceSession(
    sessionId: string,
    userId: string,
    deviceInfo: DeviceSession['deviceInfo'],
    preferences?: Partial<DeviceSession['preferences']>
  ): Promise<DeviceSession> {
    try {
      const deviceId = this.generateDeviceId(deviceInfo);
      
      const session: DeviceSession = {
        sessionId,
        userId,
        deviceId,
        deviceInfo,
        isActive: true,
        isPrimary: await this.shouldBePrimaryDevice(userId, deviceId),
        lastActivity: new Date(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        syncState: {
          lastSyncAt: new Date(),
          pendingChanges: 0,
          conflictCount: 0,
          isOnline: true
        },
        preferences: {
          notifications: true,
          autoSync: true,
          syncFrequency: this.config.syncInterval,
          conflictResolution: this.config.conflictResolution,
          ...preferences
        },
        metadata: {}
      };

      // Store session
      await this.storeDeviceSession(session);
      
      // Add to active sessions
      this.activeSessions.set(sessionId, session);
      
      // Create sync event
      await this.createSyncEvent({
        sessionId,
        userId,
        deviceId,
        eventType: 'session_created',
        data: { session }
      });
      
      // Update statistics
      this.updateStatistics();
      
      return session;
      
    } catch (error) {
      console.error('Failed to register device session:', error);
      throw error;
    }
  }

  /**
   * Update device session
   */
  async updateDeviceSession(
    sessionId: string,
    updates: Partial<DeviceSession>
  ): Promise<DeviceSession> {
    try {
      const existingSession = this.activeSessions.get(sessionId);
      if (!existingSession) {
        throw new Error('Session not found');
      }

      const updatedSession: DeviceSession = {
        ...existingSession,
        ...updates,
        lastActivity: new Date(),
        syncState: {
          ...existingSession.syncState,
          pendingChanges: existingSession.syncState.pendingChanges + 1
        }
      };

      // Store updated session
      await this.storeDeviceSession(updatedSession);
      
      // Update active sessions
      this.activeSessions.set(sessionId, updatedSession);
      
      // Create sync event
      await this.createSyncEvent({
        sessionId,
        userId: updatedSession.userId,
        deviceId: updatedSession.deviceId,
        eventType: 'session_updated',
        data: { updates }
      });
      
      return updatedSession;
      
    } catch (error) {
      console.error('Failed to update device session:', error);
      throw error;
    }
  }

  /**
   * Terminate device session
   */
  async terminateDeviceSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return;
      }

      // Mark session as inactive
      const terminatedSession = {
        ...session,
        isActive: false,
        lastActivity: new Date()
      };

      // Store terminated session
      await this.storeDeviceSession(terminatedSession);
      
      // Remove from active sessions
      this.activeSessions.delete(sessionId);
      
      // Create sync event
      await this.createSyncEvent({
        sessionId,
        userId: session.userId,
        deviceId: session.deviceId,
        eventType: 'session_terminated',
        data: { terminatedAt: new Date() }
      });
      
      // Update statistics
      this.updateStatistics();
      
    } catch (error) {
      console.error('Failed to terminate device session:', error);
      throw error;
    }
  }

  /**
   * Sync session data across devices
   */
  async syncSessionData(
    sessionId: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Create sync event
      const syncEvent = await this.createSyncEvent({
        sessionId,
        userId: session.userId,
        deviceId: session.deviceId,
        eventType: 'data_changed',
        data
      });

      // Process sync event immediately if online
      if (this.isOnline) {
        await this.processSyncEvent(syncEvent);
      } else {
        // Queue for later processing
        this.queueSyncEvent(sessionId, syncEvent);
      }
      
    } catch (error) {
      console.error('Failed to sync session data:', error);
      throw error;
    }
  }

  /**
   * Get user sessions across all devices
   */
  async getUserSessions(userId: string): Promise<DeviceSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('device_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) {
        throw new Error(`Failed to get user sessions: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToSession);
      
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      throw error;
    }
  }

  /**
   * Set primary device for user
   */
  async setPrimaryDevice(userId: string, deviceId: string): Promise<void> {
    try {
      // Remove primary flag from all user devices
      await this.supabase
        .from('device_sessions')
        .update({ is_primary: false })
        .eq('user_id', userId);

      // Set new primary device
      await this.supabase
        .from('device_sessions')
        .update({ is_primary: true })
        .eq('user_id', userId)
        .eq('device_id', deviceId);

      // Update active sessions
      for (const [sessionId, session] of this.activeSessions) {
        if (session.userId === userId) {
          session.isPrimary = session.deviceId === deviceId;
          this.activeSessions.set(sessionId, session);
        }
      }

      // Log the change
      await this.auditLogger.logSecurityEvent({
        eventType: 'primary_device_changed',
        userId,
        metadata: {
          newPrimaryDevice: deviceId
        }
      });
      
    } catch (error) {
      console.error('Failed to set primary device:', error);
      throw error;
    }
  }

  /**
   * Handle session handoff between devices
   */
  async handoffSession(
    fromSessionId: string,
    toDeviceId: string,
    preserveState: boolean = true
  ): Promise<string> {
    try {
      const fromSession = this.activeSessions.get(fromSessionId);
      if (!fromSession) {
        throw new Error('Source session not found');
      }

      // Create new session on target device
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const handoffSession: DeviceSession = {
        ...fromSession,
        sessionId: newSessionId,
        deviceId: toDeviceId,
        createdAt: new Date(),
        lastActivity: new Date(),
        syncState: {
          lastSyncAt: new Date(),
          pendingChanges: 0,
          conflictCount: 0,
          isOnline: true
        },
        metadata: {
          ...fromSession.metadata,
          handoffFrom: fromSessionId,
          handoffAt: new Date().toISOString(),
          statePreserved: preserveState
        }
      };

      // Store new session
      await this.storeDeviceSession(handoffSession);
      
      // Add to active sessions
      this.activeSessions.set(newSessionId, handoffSession);
      
      // Terminate old session if requested
      if (!preserveState) {
        await this.terminateDeviceSession(fromSessionId);
      }
      
      // Create sync event
      await this.createSyncEvent({
        sessionId: newSessionId,
        userId: fromSession.userId,
        deviceId: toDeviceId,
        eventType: 'session_created',
        data: {
          handoffFrom: fromSessionId,
          preserveState
        }
      });
      
      return newSessionId;
      
    } catch (error) {
      console.error('Failed to handoff session:', error);
      throw error;
    }
  }

  /**
   * Resolve sync conflict
   */
  async resolveSyncConflict(
    conflictId: string,
    resolution: 'use_local' | 'use_remote' | 'merge' | 'manual',
    resolvedData?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: conflictData, error } = await this.supabase
        .from('sync_conflicts')
        .select('*')
        .eq('conflict_id', conflictId)
        .single();

      if (error) {
        throw new Error(`Failed to get conflict: ${error.message}`);
      }

      const conflict = this.mapDatabaseToConflict(conflictData);
      let finalData: Record<string, any>;

      switch (resolution) {
        case 'use_local':
          finalData = conflict.localData;
          break;
        case 'use_remote':
          finalData = conflict.remoteData;
          break;
        case 'merge':
          finalData = { ...conflict.remoteData, ...conflict.localData };
          break;
        case 'manual':
          if (!resolvedData) {
            throw new Error('Resolved data required for manual resolution');
          }
          finalData = resolvedData;
          break;
        default:
          throw new Error('Invalid resolution type');
      }

      // Update conflict as resolved
      await this.supabase
        .from('sync_conflicts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolution: 'manual',
          resolution_strategy: resolution,
          resolved_data: finalData
        })
        .eq('conflict_id', conflictId);

      // Apply resolved data
      await this.syncSessionData(conflict.sessionId, finalData);
      
      // Update statistics
      this.syncStatistics.conflictsResolved++;
      
    } catch (error) {
      console.error('Failed to resolve sync conflict:', error);
      throw error;
    }
  }

  /**
   * Get sync conflicts for user
   */
  async getSyncConflicts(userId: string): Promise<SyncConflict[]> {
    try {
      const { data, error } = await this.supabase
        .from('sync_conflicts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_resolved', false)
        .order('detected_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get sync conflicts: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToConflict);
      
    } catch (error) {
      console.error('Failed to get sync conflicts:', error);
      throw error;
    }
  }

  /**
   * Get synchronization statistics
   */
  getSyncStatistics(): SyncStatistics {
    return { ...this.syncStatistics };
  }

  /**
   * Update sync configuration
   */
  updateConfig(newConfig: Partial<CrossDeviceSyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart intervals if needed
    if (this.config.enabled && !this.syncInterval) {
      this.startSyncInterval();
      this.startHeartbeatInterval();
    } else if (!this.config.enabled && this.syncInterval) {
      this.stopSync();
    }
  }

  /**
   * Stop synchronization
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
    
    if (this.websocketConnection) {
      this.websocketConnection.close();
      this.websocketConnection = undefined;
    }
    
    console.log('Cross-device synchronization stopped');
  }

  // Private methods

  private async loadActiveSessions(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('device_sessions')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Failed to load active sessions:', error);
        return;
      }

      for (const sessionData of data || []) {
        const session = this.mapDatabaseToSession(sessionData);
        this.activeSessions.set(session.sessionId, session);
      }
      
      this.updateStatistics();
      
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    }
  }

  private async setupRealtimeSubscriptions(): Promise<void> {
    try {
      // Subscribe to sync events
      this.supabase
        .channel('sync_events')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'sync_events'
        }, (payload) => {
          this.handleRealtimeSyncEvent(payload.new);
        })
        .subscribe();

      // Subscribe to session changes
      this.supabase
        .channel('device_sessions')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'device_sessions'
        }, (payload) => {
          this.handleRealtimeSessionChange(payload);
        })
        .subscribe();
        
    } catch (error) {
      console.error('Failed to setup realtime subscriptions:', error);
    }
  }

  private startSyncInterval(): void {
    this.syncInterval = setInterval(async () => {
      try {
        await this.processPendingSyncEvents();
        await this.detectAndResolveConflicts();
        this.updateStatistics();
      } catch (error) {
        console.error('Sync interval processing failed:', error);
      }
    }, this.config.syncInterval * 1000);
  }

  private startHeartbeatInterval(): void {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.sendHeartbeat();
        await this.checkSessionTimeouts();
      } catch (error) {
        console.error('Heartbeat processing failed:', error);
      }
    }, this.config.heartbeatInterval * 1000);
  }

  private async processPendingSyncEvents(): Promise<void> {
    try {
      const { data: pendingEvents, error } = await this.supabase
        .from('sync_events')
        .select('*')
        .eq('is_processed', false)
        .order('timestamp', { ascending: true })
        .limit(this.config.batchSize);

      if (error) {
        console.error('Failed to get pending sync events:', error);
        return;
      }

      for (const eventData of pendingEvents || []) {
        const syncEvent = this.mapDatabaseToSyncEvent(eventData);
        await this.processSyncEvent(syncEvent);
      }
      
    } catch (error) {
      console.error('Failed to process pending sync events:', error);
    }
  }

  private async processSyncEvent(syncEvent: SyncEvent): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Process based on event type
      switch (syncEvent.eventType) {
        case 'session_created':
        case 'session_updated':
          await this.syncSessionUpdate(syncEvent);
          break;
        case 'session_terminated':
          await this.syncSessionTermination(syncEvent);
          break;
        case 'data_changed':
          await this.syncDataChange(syncEvent);
          break;
        case 'activity_recorded':
          await this.syncActivityRecord(syncEvent);
          break;
      }

      // Mark as processed
      await this.supabase
        .from('sync_events')
        .update({ is_processed: true })
        .eq('event_id', syncEvent.eventId);

      // Update statistics
      const processingTime = Date.now() - startTime;
      this.updateSyncLatency(processingTime);
      this.syncStatistics.syncEventsProcessed++;
      
    } catch (error) {
      console.error('Failed to process sync event:', error);
      
      // Mark as failed
      await this.supabase
        .from('sync_events')
        .update({ 
          processing_errors: [error.message]
        })
        .eq('event_id', syncEvent.eventId);
    }
  }

  private async syncSessionUpdate(syncEvent: SyncEvent): Promise<void> {
    // Sync session updates across devices
    const session = this.activeSessions.get(syncEvent.sessionId);
    if (session) {
      // Broadcast update to other devices
      await this.broadcastToUserDevices(syncEvent.userId, {
        type: 'session_update',
        sessionId: syncEvent.sessionId,
        data: syncEvent.data
      });
    }
  }

  private async syncSessionTermination(syncEvent: SyncEvent): Promise<void> {
    // Remove session from active sessions
    this.activeSessions.delete(syncEvent.sessionId);
    
    // Broadcast termination to other devices
    await this.broadcastToUserDevices(syncEvent.userId, {
      type: 'session_terminated',
      sessionId: syncEvent.sessionId,
      data: syncEvent.data
    });
  }

  private async syncDataChange(syncEvent: SyncEvent): Promise<void> {
    // Check for conflicts
    const conflict = await this.detectDataConflict(syncEvent);
    if (conflict) {
      await this.handleSyncConflict(conflict);
    } else {
      // Broadcast data change to other devices
      await this.broadcastToUserDevices(syncEvent.userId, {
        type: 'data_change',
        sessionId: syncEvent.sessionId,
        data: syncEvent.data
      });
    }
  }

  private async syncActivityRecord(syncEvent: SyncEvent): Promise<void> {
    // Update last activity for session
    const session = this.activeSessions.get(syncEvent.sessionId);
    if (session) {
      session.lastActivity = new Date();
      this.activeSessions.set(syncEvent.sessionId, session);
    }
  }

  private async detectDataConflict(syncEvent: SyncEvent): Promise<SyncConflict | null> {
    // Simplified conflict detection
    // In production, this would be more sophisticated
    
    const session = this.activeSessions.get(syncEvent.sessionId);
    if (!session) {
      return null;
    }

    // Check if there are concurrent modifications
    const recentEvents = await this.getRecentSyncEvents(syncEvent.sessionId, 60); // Last minute
    const conflictingEvents = recentEvents.filter(event => 
      event.eventId !== syncEvent.eventId &&
      event.eventType === 'data_changed' &&
      Math.abs(event.timestamp.getTime() - syncEvent.timestamp.getTime()) < 5000 // 5 seconds
    );

    if (conflictingEvents.length > 0) {
      return {
        conflictId: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: syncEvent.sessionId,
        userId: syncEvent.userId,
        conflictType: 'data_conflict',
        description: 'Concurrent data modifications detected',
        detectedAt: new Date(),
        localData: syncEvent.data,
        remoteData: conflictingEvents[0].data,
        isResolved: false
      };
    }

    return null;
  }

  private async handleSyncConflict(conflict: SyncConflict): Promise<void> {
    try {
      // Store conflict
      await this.supabase
        .from('sync_conflicts')
        .insert({
          conflict_id: conflict.conflictId,
          session_id: conflict.sessionId,
          user_id: conflict.userId,
          conflict_type: conflict.conflictType,
          description: conflict.description,
          detected_at: conflict.detectedAt.toISOString(),
          local_data: conflict.localData,
          remote_data: conflict.remoteData,
          is_resolved: false
        });

      // Add to conflict queue
      const userConflicts = this.conflictQueue.get(conflict.userId) || [];
      userConflicts.push(conflict);
      this.conflictQueue.set(conflict.userId, userConflicts);

      // Update statistics
      this.syncStatistics.conflictsDetected++;

      // Try automatic resolution based on config
      if (this.config.conflictResolution !== 'manual') {
        await this.attemptAutomaticResolution(conflict);
      }
      
    } catch (error) {
      console.error('Failed to handle sync conflict:', error);
    }
  }

  private async attemptAutomaticResolution(conflict: SyncConflict): Promise<void> {
    try {
      let resolution: 'use_local' | 'use_remote';
      
      switch (this.config.conflictResolution) {
        case 'latest_wins':
          // Use the data from the most recent event
          resolution = 'use_local'; // Assuming local is more recent
          break;
        case 'primary_wins':
          // Use data from primary device
          const session = this.activeSessions.get(conflict.sessionId);
          resolution = session?.isPrimary ? 'use_local' : 'use_remote';
          break;
        default:
          return; // Manual resolution required
      }

      await this.resolveSyncConflict(conflict.conflictId, resolution);
      
    } catch (error) {
      console.error('Failed to automatically resolve conflict:', error);
    }
  }

  private async detectAndResolveConflicts(): Promise<void> {
    // This would implement more sophisticated conflict detection
    // For now, it's a placeholder
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      for (const [sessionId, session] of this.activeSessions) {
        await this.createSyncEvent({
          sessionId,
          userId: session.userId,
          deviceId: session.deviceId,
          eventType: 'activity_recorded',
          data: { heartbeat: true }
        });
      }
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }

  private async checkSessionTimeouts(): Promise<void> {
    try {
      const now = new Date();
      const timeoutThreshold = this.config.timeoutThreshold * 1000;
      
      for (const [sessionId, session] of this.activeSessions) {
        const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
        
        if (timeSinceActivity > timeoutThreshold) {
          await this.terminateDeviceSession(sessionId);
        }
      }
    } catch (error) {
      console.error('Failed to check session timeouts:', error);
    }
  }

  private async broadcastToUserDevices(userId: string, message: any): Promise<void> {
    // This would broadcast messages to all user devices via WebSocket
    // For now, it's a placeholder
    console.log(`Broadcasting to user ${userId}:`, message);
  }

  private async getRecentSyncEvents(sessionId: string, seconds: number): Promise<SyncEvent[]> {
    try {
      const since = new Date(Date.now() - seconds * 1000);
      
      const { data, error } = await this.supabase
        .from('sync_events')
        .select('*')
        .eq('session_id', sessionId)
        .gte('timestamp', since.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Failed to get recent sync events:', error);
        return [];
      }

      return (data || []).map(this.mapDatabaseToSyncEvent);
      
    } catch (error) {
      console.error('Failed to get recent sync events:', error);
      return [];
    }
  }

  private generateDeviceId(deviceInfo: DeviceSession['deviceInfo']): string {
    // Generate a consistent device ID based on device characteristics
    const deviceString = `${deviceInfo.type}_${deviceInfo.os}_${deviceInfo.browser}_${deviceInfo.userAgent}`;
    return `device_${this.hashString(deviceString)}`;
  }

  private hashString(str: string): string {
    // Simple hash function (in production, use a proper hash function)
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async shouldBePrimaryDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      const { count, error } = await this.supabase
        .from('device_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Failed to check existing devices:', error);
        return true; // Default to primary if check fails
      }

      // First device becomes primary
      return (count || 0) === 0;
      
    } catch (error) {
      console.error('Failed to determine primary device:', error);
      return true;
    }
  }

  private async createSyncEvent(
    eventData: Omit<SyncEvent, 'eventId' | 'timestamp' | 'version' | 'checksum' | 'isProcessed'>
  ): Promise<SyncEvent> {
    try {
      const syncEvent: SyncEvent = {
        ...eventData,
        eventId: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        version: 1,
        checksum: this.calculateChecksum(eventData.data),
        isProcessed: false
      };

      // Store sync event
      await this.supabase
        .from('sync_events')
        .insert({
          event_id: syncEvent.eventId,
          session_id: syncEvent.sessionId,
          user_id: syncEvent.userId,
          device_id: syncEvent.deviceId,
          event_type: syncEvent.eventType,
          timestamp: syncEvent.timestamp.toISOString(),
          data: syncEvent.data,
          version: syncEvent.version,
          checksum: syncEvent.checksum,
          is_processed: syncEvent.isProcessed
        });

      return syncEvent;
      
    } catch (error) {
      console.error('Failed to create sync event:', error);
      throw error;
    }
  }

  private queueSyncEvent(sessionId: string, syncEvent: SyncEvent): void {
    const queue = this.syncQueue.get(sessionId) || [];
    queue.push(syncEvent);
    
    // Limit queue size
    if (queue.length > this.config.maxOfflineEvents) {
      queue.splice(0, queue.length - this.config.maxOfflineEvents);
    }
    
    this.syncQueue.set(sessionId, queue);
  }

  private calculateChecksum(data: Record<string, any>): string {
    // Simple checksum calculation (in production, use a proper hash function)
    const dataString = JSON.stringify(data);
    return this.hashString(dataString);
  }

  private updateStatistics(): void {
    this.syncStatistics.totalSessions = this.activeSessions.size;
    this.syncStatistics.activeSessions = Array.from(this.activeSessions.values())
      .filter(s => s.isActive).length;
    this.syncStatistics.devicesOnline = Array.from(this.activeSessions.values())
      .filter(s => s.syncState.isOnline).length;
    this.syncStatistics.lastSyncAt = new Date();
    
    // Calculate sync health
    const conflictRate = this.syncStatistics.conflictsDetected / Math.max(this.syncStatistics.syncEventsProcessed, 1);
    if (conflictRate < 0.01) {
      this.syncStatistics.syncHealth = 'excellent';
    } else if (conflictRate < 0.05) {
      this.syncStatistics.syncHealth = 'good';
    } else if (conflictRate < 0.1) {
      this.syncStatistics.syncHealth = 'fair';
    } else {
      this.syncStatistics.syncHealth = 'poor';
    }
  }

  private updateSyncLatency(latency: number): void {
    const currentAverage = this.syncStatistics.averageSyncLatency;
    const eventCount = this.syncStatistics.syncEventsProcessed;
    
    // Calculate rolling average
    this.syncStatistics.averageSyncLatency = 
      (currentAverage * eventCount + latency) / (eventCount + 1);
  }

  private async storeDeviceSession(session: DeviceSession): Promise<void> {
    try {
      await this.supabase
        .from('device_sessions')
        .upsert({
          session_id: session.sessionId,
          user_id: session.userId,
          device_id: session.deviceId,
          device_info: session.deviceInfo,
          is_active: session.isActive,
          is_primary: session.isPrimary,
          last_activity: session.lastActivity.toISOString(),
          created_at: session.createdAt.toISOString(),
          expires_at: session.expiresAt.toISOString(),
          sync_state: session.syncState,
          preferences: session.preferences,
          metadata: session.metadata
        });
    } catch (error) {
      console.error('Failed to store device session:', error);
    }
  }

  private handleRealtimeSyncEvent(eventData: any): void {
    // Handle real-time sync events from Supabase
    const syncEvent = this.mapDatabaseToSyncEvent(eventData);
    this.processSyncEvent(syncEvent);
  }

  private handleRealtimeSessionChange(payload: any): void {
    // Handle real-time session changes from Supabase
    const sessionData = payload.new || payload.old;
    const session = this.mapDatabaseToSession(sessionData);
    
    if (payload.eventType === 'DELETE' || !session.isActive) {
      this.activeSessions.delete(session.sessionId);
    } else {
      this.activeSessions.set(session.sessionId, session);
    }
    
    this.updateStatistics();
  }

  private mapDatabaseToSession(data: any): DeviceSession {
    return {
      sessionId: data.session_id,
      userId: data.user_id,
      deviceId: data.device_id,
      deviceInfo: data.device_info,
      isActive: data.is_active,
      isPrimary: data.is_primary,
      lastActivity: new Date(data.last_activity),
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
      syncState: data.sync_state,
      preferences: data.preferences,
      metadata: data.metadata || {}
    };
  }

  private mapDatabaseToSyncEvent(data: any): SyncEvent {
    return {
      eventId: data.event_id,
      sessionId: data.session_id,
      userId: data.user_id,
      deviceId: data.device_id,
      eventType: data.event_type,
      timestamp: new Date(data.timestamp),
      data: data.data,
      version: data.version,
      checksum: data.checksum,
      isProcessed: data.is_processed,
      processingErrors: data.processing_errors
    };
  }

  private mapDatabaseToConflict(data: any): SyncConflict {
    return {
      conflictId: data.conflict_id,
      sessionId: data.session_id,
      userId: data.user_id,
      conflictType: data.conflict_type,
      description: data.description,
      detectedAt: new Date(data.detected_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      resolution: data.resolution,
      resolutionStrategy: data.resolution_strategy,
      localData: data.local_data,
      remoteData: data.remote_data,
      resolvedData: data.resolved_data,
      isResolved: data.is_resolved
    };
  }
}
