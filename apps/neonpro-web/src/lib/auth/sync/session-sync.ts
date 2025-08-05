// Session Synchronization System
// Real-time session state synchronization across multiple devices

import type { SessionConfig } from "@/lib/auth/config/session-config";
import type { SessionUtils } from "@/lib/auth/utils/session-utils";
import type { SessionSync, UserDevice, UserSession } from "@/types/session";

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  userId: string;
  sessionId: string;
  deviceId: string;
  data: any;
  timestamp: number;
  version: number;
  checksum: string;
}

export type SyncEventType =
  | "session_created"
  | "session_updated"
  | "session_terminated"
  | "device_registered"
  | "device_updated"
  | "device_removed"
  | "preferences_updated"
  | "security_event"
  | "heartbeat"
  | "sync_request"
  | "conflict_detected"
  | "conflict_resolved";

export interface SyncConflict {
  id: string;
  type: ConflictType;
  userId: string;
  sessionId: string;
  conflictingDevices: string[];
  localVersion: SyncEvent;
  remoteVersions: SyncEvent[];
  resolutionStrategy: ConflictResolutionStrategy;
  resolvedAt?: number;
  resolvedBy?: string;
  resolution?: SyncEvent;
}

export type ConflictType =
  | "concurrent_update"
  | "version_mismatch"
  | "device_desync"
  | "session_collision"
  | "data_corruption"
  | "timestamp_skew";

export type ConflictResolutionStrategy =
  | "last_write_wins"
  | "first_write_wins"
  | "merge_changes"
  | "manual_resolution"
  | "rollback_changes"
  | "device_priority";

export interface SyncState {
  userId: string;
  lastSyncTimestamp: number;
  deviceStates: Map<string, DeviceSyncState>;
  pendingEvents: SyncEvent[];
  conflictQueue: SyncConflict[];
  syncVersion: number;
  isOnline: boolean;
}

export interface DeviceSyncState {
  deviceId: string;
  lastSeen: number;
  version: number;
  isOnline: boolean;
  pendingAcks: string[];
  syncOffset: number; // Time offset for synchronization
}

export interface SyncMessage {
  type: SyncMessageType;
  payload: any;
  timestamp: number;
  messageId: string;
  senderId: string;
  targetId?: string;
}

export type SyncMessageType =
  | "sync_event"
  | "sync_request"
  | "sync_response"
  | "heartbeat"
  | "conflict_notification"
  | "resolution_request"
  | "ack"
  | "nack";

export class SessionSyncManager {
  private config: SessionConfig;
  private utils: SessionUtils;
  private syncStates: Map<string, SyncState> = new Map();
  private webSocket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private isConnected: boolean = false;
  private deviceId: string;
  private userId: string | null = null;

  constructor(deviceId: string) {
    this.config = SessionConfig.getInstance();
    this.utils = new SessionUtils();
    this.deviceId = deviceId;
  }

  /**
   * Initialize sync manager for user
   */
  public async initialize(userId: string): Promise<void> {
    try {
      this.userId = userId;

      // Initialize sync state
      await this.initializeSyncState(userId);

      // Connect to sync server
      await this.connectToSyncServer();

      // Start periodic sync
      this.startPeriodicSync();

      // Start heartbeat
      this.startHeartbeat();

      console.log(`Session sync initialized for user ${userId}`);
      this.emit("sync_initialized", { userId, deviceId: this.deviceId });
    } catch (error) {
      console.error("Error initializing session sync:", error);
      throw error;
    }
  }

  /**
   * Initialize sync state for user
   */
  private async initializeSyncState(userId: string): Promise<void> {
    const existingState = this.syncStates.get(userId);

    if (!existingState) {
      const syncState: SyncState = {
        userId,
        lastSyncTimestamp: Date.now(),
        deviceStates: new Map(),
        pendingEvents: [],
        conflictQueue: [],
        syncVersion: 1,
        isOnline: false,
      };

      this.syncStates.set(userId, syncState);
    }

    // Load existing sync data from storage
    await this.loadSyncDataFromStorage(userId);
  }

  /**
   * Connect to WebSocket sync server
   */
  private async connectToSyncServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.config.getWebSocketUrl();
        this.webSocket = new WebSocket(wsUrl);

        this.webSocket.onopen = () => {
          console.log("Connected to sync server");
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Send authentication
          this.sendAuthMessage();

          // Update sync state
          const syncState = this.syncStates.get(this.userId!);
          if (syncState) {
            syncState.isOnline = true;
          }

          this.emit("sync_connected", { deviceId: this.deviceId });
          resolve();
        };

        this.webSocket.onmessage = (event) => {
          this.handleSyncMessage(JSON.parse(event.data));
        };

        this.webSocket.onclose = () => {
          console.log("Disconnected from sync server");
          this.isConnected = false;

          // Update sync state
          const syncState = this.syncStates.get(this.userId!);
          if (syncState) {
            syncState.isOnline = false;
          }

          this.emit("sync_disconnected", { deviceId: this.deviceId });

          // Attempt reconnection
          this.attemptReconnection();
        };

        this.webSocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.emit("sync_error", { error, deviceId: this.deviceId });
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send authentication message
   */
  private sendAuthMessage(): void {
    if (this.webSocket && this.userId) {
      const authMessage: SyncMessage = {
        type: "sync_request",
        payload: {
          action: "authenticate",
          userId: this.userId,
          deviceId: this.deviceId,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        messageId: this.utils.generateSessionToken(),
        senderId: this.deviceId,
      };

      this.webSocket.send(JSON.stringify(authMessage));
    }
  }

  /**
   * Handle incoming sync messages
   */
  private handleSyncMessage(message: SyncMessage): void {
    try {
      switch (message.type) {
        case "sync_event":
          this.handleSyncEvent(message.payload);
          break;

        case "sync_request":
          this.handleSyncRequest(message);
          break;

        case "sync_response":
          this.handleSyncResponse(message);
          break;

        case "heartbeat":
          this.handleHeartbeat(message);
          break;

        case "conflict_notification":
          this.handleConflictNotification(message.payload);
          break;

        case "resolution_request":
          this.handleResolutionRequest(message.payload);
          break;

        case "ack":
          this.handleAcknowledgment(message);
          break;

        case "nack":
          this.handleNegativeAcknowledgment(message);
          break;

        default:
          console.warn("Unknown sync message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling sync message:", error);
    }
  }

  /**
   * Handle sync event
   */
  private async handleSyncEvent(event: SyncEvent): Promise<void> {
    if (!this.userId) return;

    const syncState = this.syncStates.get(this.userId);
    if (!syncState) return;

    // Check for conflicts
    const conflict = await this.detectConflict(event, syncState);
    if (conflict) {
      await this.handleConflict(conflict);
      return;
    }

    // Apply event
    await this.applySyncEvent(event);

    // Update sync state
    syncState.lastSyncTimestamp = Math.max(syncState.lastSyncTimestamp, event.timestamp);
    syncState.syncVersion++;

    // Send acknowledgment
    this.sendAcknowledgment(event.id);

    // Emit event
    this.emit("sync_event_applied", event);
  }

  /**
   * Detect sync conflicts
   */
  private async detectConflict(
    event: SyncEvent,
    syncState: SyncState,
  ): Promise<SyncConflict | null> {
    // Check version conflicts
    const deviceState = syncState.deviceStates.get(event.deviceId);
    if (deviceState && event.version <= deviceState.version) {
      return {
        id: this.utils.generateSessionToken(),
        type: "version_mismatch",
        userId: event.userId,
        sessionId: event.sessionId,
        conflictingDevices: [event.deviceId, this.deviceId],
        localVersion: event,
        remoteVersions: [],
        resolutionStrategy: "last_write_wins",
      };
    }

    // Check for concurrent updates
    const recentEvents = syncState.pendingEvents.filter(
      (e) => e.sessionId === event.sessionId && Math.abs(e.timestamp - event.timestamp) < 5000, // 5 seconds
    );

    if (recentEvents.length > 0) {
      return {
        id: this.utils.generateSessionToken(),
        type: "concurrent_update",
        userId: event.userId,
        sessionId: event.sessionId,
        conflictingDevices: [event.deviceId, this.deviceId],
        localVersion: event,
        remoteVersions: recentEvents,
        resolutionStrategy: "merge_changes",
      };
    }

    return null;
  }

  /**
   * Handle sync conflict
   */
  private async handleConflict(conflict: SyncConflict): Promise<void> {
    if (!this.userId) return;

    const syncState = this.syncStates.get(this.userId);
    if (!syncState) return;

    // Add to conflict queue
    syncState.conflictQueue.push(conflict);

    // Attempt automatic resolution
    const resolution = await this.resolveConflict(conflict);
    if (resolution) {
      await this.applyConflictResolution(conflict, resolution);
    } else {
      // Notify about manual resolution needed
      this.emit("conflict_detected", conflict);
    }
  }

  /**
   * Resolve sync conflict
   */
  private async resolveConflict(conflict: SyncConflict): Promise<SyncEvent | null> {
    switch (conflict.resolutionStrategy) {
      case "last_write_wins":
        return this.resolveLastWriteWins(conflict);

      case "first_write_wins":
        return this.resolveFirstWriteWins(conflict);

      case "merge_changes":
        return await this.resolveMergeChanges(conflict);

      case "device_priority":
        return this.resolveDevicePriority(conflict);

      case "rollback_changes":
        return this.resolveRollback(conflict);

      default:
        return null; // Manual resolution required
    }
  }

  /**
   * Conflict resolution strategies
   */
  private resolveLastWriteWins(conflict: SyncConflict): SyncEvent {
    const allEvents = [conflict.localVersion, ...conflict.remoteVersions];
    return allEvents.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest,
    );
  }

  private resolveFirstWriteWins(conflict: SyncConflict): SyncEvent {
    const allEvents = [conflict.localVersion, ...conflict.remoteVersions];
    return allEvents.reduce((earliest, current) =>
      current.timestamp < earliest.timestamp ? current : earliest,
    );
  }

  private async resolveMergeChanges(conflict: SyncConflict): Promise<SyncEvent | null> {
    try {
      // Merge data from conflicting events
      const mergedData = this.mergeEventData(
        conflict.localVersion.data,
        conflict.remoteVersions.map((e) => e.data),
      );

      // Create merged event
      const mergedEvent: SyncEvent = {
        id: this.utils.generateSessionToken(),
        type: conflict.localVersion.type,
        userId: conflict.userId,
        sessionId: conflict.sessionId,
        deviceId: this.deviceId,
        data: mergedData,
        timestamp: Date.now(),
        version:
          Math.max(
            conflict.localVersion.version,
            ...conflict.remoteVersions.map((e) => e.version),
          ) + 1,
        checksum: this.calculateChecksum(mergedData),
      };

      return mergedEvent;
    } catch (error) {
      console.error("Error merging changes:", error);
      return null;
    }
  }

  private resolveDevicePriority(conflict: SyncConflict): SyncEvent {
    // Use device priority order (could be configured)
    const devicePriority = this.getDevicePriority();
    const allEvents = [conflict.localVersion, ...conflict.remoteVersions];

    return allEvents.reduce((highest, current) => {
      const currentPriority = devicePriority[current.deviceId] || 0;
      const highestPriority = devicePriority[highest.deviceId] || 0;
      return currentPriority > highestPriority ? current : highest;
    });
  }

  private resolveRollback(conflict: SyncConflict): SyncEvent {
    // Create rollback event
    return {
      id: this.utils.generateSessionToken(),
      type: "session_updated",
      userId: conflict.userId,
      sessionId: conflict.sessionId,
      deviceId: this.deviceId,
      data: { action: "rollback", conflictId: conflict.id },
      timestamp: Date.now(),
      version: conflict.localVersion.version + 1,
      checksum: "",
    };
  }

  /**
   * Apply sync event to local state
   */
  private async applySyncEvent(event: SyncEvent): Promise<void> {
    try {
      switch (event.type) {
        case "session_created":
          await this.applySessionCreated(event);
          break;

        case "session_updated":
          await this.applySessionUpdated(event);
          break;

        case "session_terminated":
          await this.applySessionTerminated(event);
          break;

        case "device_registered":
          await this.applyDeviceRegistered(event);
          break;

        case "device_updated":
          await this.applyDeviceUpdated(event);
          break;

        case "device_removed":
          await this.applyDeviceRemoved(event);
          break;

        case "preferences_updated":
          await this.applyPreferencesUpdated(event);
          break;

        case "security_event":
          await this.applySecurityEvent(event);
          break;

        default:
          console.warn("Unknown sync event type:", event.type);
      }
    } catch (error) {
      console.error("Error applying sync event:", error);
      throw error;
    }
  }

  /**
   * Event application methods
   */
  private async applySessionCreated(event: SyncEvent): Promise<void> {
    // Apply session creation to local state
    await fetch("/api/session/sync/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event.data),
    });
  }

  private async applySessionUpdated(event: SyncEvent): Promise<void> {
    // Apply session update to local state
    await fetch("/api/session/sync/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: event.sessionId,
        updates: event.data,
      }),
    });
  }

  private async applySessionTerminated(event: SyncEvent): Promise<void> {
    // Apply session termination to local state
    await fetch("/api/session/sync/terminate", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: event.sessionId,
        reason: event.data.reason,
      }),
    });
  }

  private async applyDeviceRegistered(event: SyncEvent): Promise<void> {
    // Apply device registration to local state
    await fetch("/api/devices/sync/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event.data),
    });
  }

  private async applyDeviceUpdated(event: SyncEvent): Promise<void> {
    // Apply device update to local state
    await fetch("/api/devices/sync/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: event.data.deviceId,
        updates: event.data.updates,
      }),
    });
  }

  private async applyDeviceRemoved(event: SyncEvent): Promise<void> {
    // Apply device removal to local state
    await fetch("/api/devices/sync/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: event.data.deviceId,
      }),
    });
  }

  private async applyPreferencesUpdated(event: SyncEvent): Promise<void> {
    // Apply preferences update to local state
    await fetch("/api/users/sync/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: event.userId,
        preferences: event.data.preferences,
      }),
    });
  }

  private async applySecurityEvent(event: SyncEvent): Promise<void> {
    // Apply security event to local state
    await fetch("/api/security/sync/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event.data),
    });
  }

  /**
   * Broadcast sync event to other devices
   */
  public async broadcastSyncEvent(
    type: SyncEventType,
    sessionId: string,
    data: any,
  ): Promise<void> {
    if (!this.userId || !this.isConnected) return;

    const syncState = this.syncStates.get(this.userId);
    if (!syncState) return;

    const event: SyncEvent = {
      id: this.utils.generateSessionToken(),
      type,
      userId: this.userId,
      sessionId,
      deviceId: this.deviceId,
      data,
      timestamp: Date.now(),
      version: syncState.syncVersion + 1,
      checksum: this.calculateChecksum(data),
    };

    // Add to pending events
    syncState.pendingEvents.push(event);

    // Send via WebSocket
    if (this.webSocket) {
      const message: SyncMessage = {
        type: "sync_event",
        payload: event,
        timestamp: Date.now(),
        messageId: this.utils.generateSessionToken(),
        senderId: this.deviceId,
      };

      this.webSocket.send(JSON.stringify(message));
    }

    // Update sync version
    syncState.syncVersion++;
  }

  /**
   * Request full sync from server
   */
  public async requestFullSync(): Promise<void> {
    if (!this.userId || !this.isConnected || !this.webSocket) return;

    const message: SyncMessage = {
      type: "sync_request",
      payload: {
        action: "full_sync",
        userId: this.userId,
        deviceId: this.deviceId,
        lastSyncTimestamp: this.syncStates.get(this.userId)?.lastSyncTimestamp || 0,
      },
      timestamp: Date.now(),
      messageId: this.utils.generateSessionToken(),
      senderId: this.deviceId,
    };

    this.webSocket.send(JSON.stringify(message));
  }

  /**
   * Utility methods
   */
  private mergeEventData(localData: any, remoteDataArray: any[]): any {
    // Simple merge strategy - in production, implement proper conflict resolution
    let merged = { ...localData };

    remoteDataArray.forEach((remoteData) => {
      merged = { ...merged, ...remoteData };
    });

    return merged;
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private getDevicePriority(): Record<string, number> {
    // Device priority configuration
    return {
      desktop: 3,
      laptop: 2,
      tablet: 1,
      mobile: 0,
    };
  }

  private async loadSyncDataFromStorage(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/sync/state/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Load sync state from storage
        // Implementation depends on storage format
      }
    } catch (error) {
      console.error("Error loading sync data from storage:", error);
    }
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isConnected) {
        this.requestFullSync();
      }
    }, 30000); // Sync every 30 seconds
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.webSocket) {
        const heartbeat: SyncMessage = {
          type: "heartbeat",
          payload: {
            deviceId: this.deviceId,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
          messageId: this.utils.generateSessionToken(),
          senderId: this.deviceId,
        };

        this.webSocket.send(JSON.stringify(heartbeat));
      }
    }, 15000); // Heartbeat every 15 seconds
  }

  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = 2 ** this.reconnectAttempts * 1000; // Exponential backoff

    setTimeout(() => {
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connectToSyncServer().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  }

  private handleSyncRequest(message: SyncMessage): void {
    // Handle sync requests from other devices
    console.log("Received sync request:", message);
  }

  private handleSyncResponse(message: SyncMessage): void {
    // Handle sync responses
    console.log("Received sync response:", message);
  }

  private handleHeartbeat(message: SyncMessage): void {
    // Update device state
    if (this.userId) {
      const syncState = this.syncStates.get(this.userId);
      if (syncState) {
        const deviceState = syncState.deviceStates.get(message.senderId);
        if (deviceState) {
          deviceState.lastSeen = Date.now();
          deviceState.isOnline = true;
        }
      }
    }
  }

  private handleConflictNotification(conflict: SyncConflict): void {
    this.emit("conflict_notification", conflict);
  }

  private handleResolutionRequest(request: any): void {
    this.emit("resolution_request", request);
  }

  private handleAcknowledgment(message: SyncMessage): void {
    // Remove acknowledged event from pending
    if (this.userId) {
      const syncState = this.syncStates.get(this.userId);
      if (syncState) {
        syncState.pendingEvents = syncState.pendingEvents.filter(
          (e) => e.id !== message.payload.eventId,
        );
      }
    }
  }

  private handleNegativeAcknowledgment(message: SyncMessage): void {
    // Handle failed sync events
    console.error("Sync event failed:", message.payload);
  }

  private sendAcknowledgment(eventId: string): void {
    if (this.webSocket) {
      const ack: SyncMessage = {
        type: "ack",
        payload: { eventId },
        timestamp: Date.now(),
        messageId: this.utils.generateSessionToken(),
        senderId: this.deviceId,
      };

      this.webSocket.send(JSON.stringify(ack));
    }
  }

  private async applyConflictResolution(
    conflict: SyncConflict,
    resolution: SyncEvent,
  ): Promise<void> {
    try {
      // Apply resolution
      await this.applySyncEvent(resolution);

      // Mark conflict as resolved
      conflict.resolvedAt = Date.now();
      conflict.resolvedBy = this.deviceId;
      conflict.resolution = resolution;

      // Remove from conflict queue
      if (this.userId) {
        const syncState = this.syncStates.get(this.userId);
        if (syncState) {
          syncState.conflictQueue = syncState.conflictQueue.filter((c) => c.id !== conflict.id);
        }
      }

      this.emit("conflict_resolved", conflict);
    } catch (error) {
      console.error("Error applying conflict resolution:", error);
    }
  }

  /**
   * Event system
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Public API methods
   */
  public isConnectedToSync(): boolean {
    return this.isConnected;
  }

  public getSyncState(userId: string): SyncState | undefined {
    return this.syncStates.get(userId);
  }

  public getPendingConflicts(userId: string): SyncConflict[] {
    const syncState = this.syncStates.get(userId);
    return syncState ? syncState.conflictQueue : [];
  }

  public async resolveConflictManually(
    conflictId: string,
    resolution: SyncEvent,
  ): Promise<boolean> {
    if (!this.userId) return false;

    const syncState = this.syncStates.get(this.userId);
    if (!syncState) return false;

    const conflict = syncState.conflictQueue.find((c) => c.id === conflictId);
    if (!conflict) return false;

    await this.applyConflictResolution(conflict, resolution);
    return true;
  }

  public cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up old sync states
    for (const [userId, syncState] of this.syncStates.entries()) {
      // Clean up old pending events
      syncState.pendingEvents = syncState.pendingEvents.filter((e) => now - e.timestamp < maxAge);

      // Clean up resolved conflicts
      syncState.conflictQueue = syncState.conflictQueue.filter(
        (c) => !c.resolvedAt || now - c.resolvedAt < maxAge,
      );
    }
  }

  public destroy(): void {
    // Stop intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Close WebSocket
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }

    // Clear state
    this.syncStates.clear();
    this.eventListeners.clear();
    this.isConnected = false;
  }
}

export default SessionSyncManager;
