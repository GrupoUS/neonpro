// Concurrent Session Management System
// Manages multiple active sessions per user with intelligent conflict resolution

import { SessionConfig } from '@/lib/auth/config/session-config';
import { SessionUtils } from '@/lib/auth/utils/session-utils';
import type { UserRole, UserSession } from '@/types/session';

export type ConcurrentSessionConfig = {
  maxConcurrentSessions: number;
  allowMultipleDevices: boolean;
  conflictResolution:
    | 'newest_wins'
    | 'oldest_wins'
    | 'user_choice'
    | 'device_priority';
  devicePriorityOrder: string[]; // device types in priority order
  gracePeriodMinutes: number;
  notificationEnabled: boolean;
};

export type SessionConflict = {
  id: string;
  userId: string;
  conflictType:
    | 'max_sessions_exceeded'
    | 'same_device_login'
    | 'suspicious_location';
  existingSessions: UserSession[];
  newSession: Partial<UserSession>;
  resolution: ConflictResolution;
  timestamp: number;
  resolved: boolean;
};

export type ConflictResolution = {
  action:
    | 'terminate_oldest'
    | 'terminate_newest'
    | 'terminate_specific'
    | 'allow_concurrent'
    | 'require_user_choice';
  targetSessionIds?: string[];
  reason: string;
  userNotified: boolean;
};

export type SessionTransfer = {
  fromSessionId: string;
  toSessionId: string;
  transferData: {
    state: Record<string, any>;
    preferences: Record<string, any>;
    temporaryData: Record<string, any>;
  };
  timestamp: number;
  completed: boolean;
};

export class ConcurrentSessionManager {
  private readonly config: SessionConfig;
  private readonly utils: SessionUtils;
  private readonly activeConflicts: Map<string, SessionConflict> = new Map();
  private readonly sessionTransfers: Map<string, SessionTransfer> = new Map();
  private readonly deviceSessions: Map<string, Set<string>> = new Map(); // deviceId -> sessionIds
  private readonly userSessions: Map<string, Set<string>> = new Map(); // userId -> sessionIds

  constructor() {
    this.config = SessionConfig.getInstance();
    this.utils = new SessionUtils();
  }

  /**
   * Check if a new session can be created for the user
   */
  public async canCreateSession(
    userId: string,
    deviceId: string,
    userRole: UserRole
  ): Promise<{
    allowed: boolean;
    reason?: string;
    conflictId?: string;
    existingSessions?: UserSession[];
  }> {
    try {
      const concurrentConfig = this.getConcurrentConfig(userRole);
      const existingSessions = await this.getUserActiveSessions(userId);

      // Check maximum concurrent sessions
      if (existingSessions.length >= concurrentConfig.maxConcurrentSessions) {
        const conflict = await this.createSessionConflict(
          userId,
          'max_sessions_exceeded',
          existingSessions,
          { userId, deviceId }
        );

        return {
          allowed: false,
          reason: `Maximum concurrent sessions (${concurrentConfig.maxConcurrentSessions}) exceeded`,
          conflictId: conflict.id,
          existingSessions,
        };
      }

      // Check same device login
      const deviceSessions = existingSessions.filter(
        (s) => s.deviceId === deviceId
      );
      if (deviceSessions.length > 0 && !concurrentConfig.allowMultipleDevices) {
        const conflict = await this.createSessionConflict(
          userId,
          'same_device_login',
          deviceSessions,
          { userId, deviceId }
        );

        return {
          allowed: false,
          reason: 'Another session is already active on this device',
          conflictId: conflict.id,
          existingSessions: deviceSessions,
        };
      }

      // Check for suspicious location/device patterns
      const suspiciousLogin = await this.detectSuspiciousLogin(
        userId,
        deviceId,
        existingSessions
      );
      if (suspiciousLogin) {
        const conflict = await this.createSessionConflict(
          userId,
          'suspicious_location',
          existingSessions,
          { userId, deviceId }
        );

        return {
          allowed: false,
          reason: 'Suspicious login detected from new location/device',
          conflictId: conflict.id,
          existingSessions,
        };
      }

      return { allowed: true };
    } catch (_error) {
      return {
        allowed: false,
        reason: 'Internal error checking session permissions',
      };
    }
  }

  /**
   * Handle session creation with conflict resolution
   */
  public async handleSessionCreation(
    userId: string,
    deviceId: string,
    userRole: UserRole,
    conflictId?: string
  ): Promise<{
    success: boolean;
    sessionId?: string;
    terminatedSessions?: string[];
    transferId?: string;
  }> {
    try {
      const canCreate = await this.canCreateSession(userId, deviceId, userRole);

      if (canCreate.allowed) {
        // Create session normally
        const sessionId = await this.createNewSession(userId, deviceId);
        await this.trackSessionCreation(userId, deviceId, sessionId);

        return {
          success: true,
          sessionId,
        };
      }

      // Handle conflict resolution
      if (conflictId) {
        const conflict = this.activeConflicts.get(conflictId);
        if (conflict) {
          return await this.resolveSessionConflict(conflict);
        }
      }

      // Auto-resolve based on configuration
      const concurrentConfig = this.getConcurrentConfig(userRole);
      const existingSessions = canCreate.existingSessions || [];

      const resolution = await this.autoResolveConflict(
        concurrentConfig,
        existingSessions,
        { userId, deviceId }
      );

      return resolution;
    } catch (_error) {
      return { success: false };
    }
  }

  /**
   * Resolve session conflict based on configuration
   */
  private async resolveSessionConflict(conflict: SessionConflict): Promise<{
    success: boolean;
    sessionId?: string;
    terminatedSessions?: string[];
    transferId?: string;
  }> {
    try {
      const resolution = conflict.resolution;
      const terminatedSessions: string[] = [];
      let newSessionId: string | undefined;
      let transferId: string | undefined;

      switch (resolution.action) {
        case 'terminate_oldest': {
          const oldestSession = this.findOldestSession(
            conflict.existingSessions
          );
          if (oldestSession) {
            await this.terminateSession(
              oldestSession.id,
              'Replaced by newer session'
            );
            terminatedSessions.push(oldestSession.id);

            // Transfer session data if needed
            transferId = await this.initiateSessionTransfer(
              oldestSession.id,
              conflict.newSession.userId!,
              conflict.newSession.deviceId!
            );
          }
          newSessionId = await this.createNewSession(
            conflict.newSession.userId!,
            conflict.newSession.deviceId!
          );
          break;
        }

        case 'terminate_newest':
          // Don't create new session, keep existing ones
          break;

        case 'terminate_specific':
          if (resolution.targetSessionIds) {
            for (const sessionId of resolution.targetSessionIds) {
              await this.terminateSession(
                sessionId,
                'Terminated due to conflict resolution'
              );
              terminatedSessions.push(sessionId);
            }
            newSessionId = await this.createNewSession(
              conflict.newSession.userId!,
              conflict.newSession.deviceId!
            );
          }
          break;

        case 'allow_concurrent':
          newSessionId = await this.createNewSession(
            conflict.newSession.userId!,
            conflict.newSession.deviceId!
          );
          break;

        case 'require_user_choice':
          // Return without resolution, requires user interaction
          return {
            success: false,
          };
      }

      // Mark conflict as resolved
      conflict.resolved = true;
      conflict.resolution.userNotified = true;

      // Send notifications
      if (terminatedSessions.length > 0) {
        await this.notifySessionTerminations(
          conflict.userId,
          terminatedSessions
        );
      }

      return {
        success: true,
        sessionId: newSessionId,
        terminatedSessions,
        transferId,
      };
    } catch (_error) {
      return { success: false };
    }
  }

  /**
   * Auto-resolve conflict based on configuration
   */
  private async autoResolveConflict(
    config: ConcurrentSessionConfig,
    existingSessions: UserSession[],
    newSession: Partial<UserSession>
  ): Promise<{
    success: boolean;
    sessionId?: string;
    terminatedSessions?: string[];
    transferId?: string;
  }> {
    const terminatedSessions: string[] = [];
    let sessionToTerminate: UserSession | null = null;

    switch (config.conflictResolution) {
      case 'newest_wins':
        sessionToTerminate = this.findOldestSession(existingSessions);
        break;

      case 'oldest_wins':
        // Don't create new session
        return { success: false };

      case 'device_priority':
        sessionToTerminate = this.findLowestPrioritySession(
          existingSessions,
          config.devicePriorityOrder
        );
        break;

      default:
        sessionToTerminate = this.findOldestSession(existingSessions);
    }

    if (sessionToTerminate) {
      await this.terminateSession(
        sessionToTerminate.id,
        'Replaced by auto-resolution'
      );
      terminatedSessions.push(sessionToTerminate.id);

      // Initiate session transfer
      const transferId = await this.initiateSessionTransfer(
        sessionToTerminate.id,
        newSession.userId!,
        newSession.deviceId!
      );

      // Create new session
      const sessionId = await this.createNewSession(
        newSession.userId!,
        newSession.deviceId!
      );

      return {
        success: true,
        sessionId,
        terminatedSessions,
        transferId,
      };
    }

    return { success: false };
  }

  /**
   * Initiate session data transfer
   */
  private async initiateSessionTransfer(
    fromSessionId: string,
    _userId: string,
    _deviceId: string
  ): Promise<string> {
    // Get session data to transfer
    const sessionData = await this.getSessionTransferData(fromSessionId);

    const transfer: SessionTransfer = {
      fromSessionId,
      toSessionId: '', // Will be set when new session is created
      transferData: sessionData,
      timestamp: Date.now(),
      completed: false,
    };

    const transferId = this.utils.generateSessionToken();
    this.sessionTransfers.set(transferId, transfer);

    return transferId;
  }

  /**
   * Complete session transfer to new session
   */
  public async completeSessionTransfer(
    transferId: string,
    newSessionId: string
  ): Promise<boolean> {
    try {
      const transfer = this.sessionTransfers.get(transferId);
      if (!transfer) {
        return false;
      }

      transfer.toSessionId = newSessionId;

      // Apply transferred data to new session
      await this.applyTransferData(newSessionId, transfer.transferData);

      transfer.completed = true;

      // Clean up transfer record after 24 hours
      setTimeout(
        () => {
          this.sessionTransfers.delete(transferId);
        },
        24 * 60 * 60 * 1000
      );

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get concurrent session configuration for user role
   */
  private getConcurrentConfig(userRole: UserRole): ConcurrentSessionConfig {
    const policy = this.config.getSessionPolicy(userRole);

    return {
      maxConcurrentSessions: policy.maxConcurrentSessions || 3,
      allowMultipleDevices: true,
      conflictResolution: 'newest_wins',
      devicePriorityOrder: ['desktop', 'tablet', 'mobile'],
      gracePeriodMinutes: 5,
      notificationEnabled: true,
    };
  }

  /**
   * Create session conflict record
   */
  private async createSessionConflict(
    userId: string,
    conflictType: SessionConflict['conflictType'],
    existingSessions: UserSession[],
    newSession: Partial<UserSession>
  ): Promise<SessionConflict> {
    const conflictId = this.utils.generateSessionToken();

    const conflict: SessionConflict = {
      id: conflictId,
      userId,
      conflictType,
      existingSessions,
      newSession,
      resolution: {
        action: 'require_user_choice',
        reason: 'Awaiting user decision',
        userNotified: false,
      },
      timestamp: Date.now(),
      resolved: false,
    };

    this.activeConflicts.set(conflictId, conflict);

    // Auto-expire conflict after 10 minutes
    setTimeout(
      () => {
        if (!conflict.resolved) {
          this.activeConflicts.delete(conflictId);
        }
      },
      10 * 60 * 1000
    );

    return conflict;
  }

  /**
   * Detect suspicious login patterns
   */
  private async detectSuspiciousLogin(
    _userId: string,
    deviceId: string,
    existingSessions: UserSession[]
  ): Promise<boolean> {
    try {
      // Check for rapid location changes
      const recentSessions = existingSessions.filter(
        (s) => Date.now() - new Date(s.lastActivity).getTime() < 30 * 60 * 1000 // Last 30 minutes
      );

      if (recentSessions.length > 0) {
        // Get device info for comparison
        const newDeviceInfo = await this.getDeviceInfo(deviceId);

        for (const session of recentSessions) {
          const existingDeviceInfo = await this.getDeviceInfo(session.deviceId);

          // Check for different countries/regions
          if (newDeviceInfo.country !== existingDeviceInfo.country) {
            return true;
          }

          // Check for different device types with same user agent patterns
          if (this.detectDeviceSpoofing(newDeviceInfo, existingDeviceInfo)) {
            return true;
          }
        }
      }

      return false;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Utility functions
   */
  private findOldestSession(sessions: UserSession[]): UserSession | null {
    if (sessions.length === 0) {
      return null;
    }
    return sessions.reduce((oldest, current) =>
      new Date(current.createdAt) < new Date(oldest.createdAt)
        ? current
        : oldest
    );
  }

  private findLowestPrioritySession(
    sessions: UserSession[],
    priorityOrder: string[]
  ): UserSession | null {
    if (sessions.length === 0) {
      return null;
    }

    return sessions.reduce((lowest, current) => {
      const currentPriority = priorityOrder.indexOf(current.deviceType) || 999;
      const lowestPriority = priorityOrder.indexOf(lowest.deviceType) || 999;
      return currentPriority > lowestPriority ? current : lowest;
    });
  }

  private async getUserActiveSessions(userId: string): Promise<UserSession[]> {
    try {
      const response = await fetch(`/api/session/user/${userId}/active`);
      if (response.ok) {
        const data = await response.json();
        return data.sessions || [];
      }
    } catch (_error) {}
    return [];
  }

  private async createNewSession(
    userId: string,
    deviceId: string
  ): Promise<string> {
    const response = await fetch('/api/session/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        deviceId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.sessionId;
    }

    throw new Error('Failed to create session');
  }

  private async terminateSession(
    sessionId: string,
    reason: string
  ): Promise<void> {
    await fetch('/api/session/terminate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        reason,
      }),
    });
  }

  private async trackSessionCreation(
    userId: string,
    deviceId: string,
    sessionId: string
  ): Promise<void> {
    // Track in local maps
    const userSessions = this.userSessions.get(userId) || new Set();
    userSessions.add(sessionId);
    this.userSessions.set(userId, userSessions);

    const deviceSessions = this.deviceSessions.get(deviceId) || new Set();
    deviceSessions.add(sessionId);
    this.deviceSessions.set(deviceId, deviceSessions);
  }

  private async getSessionTransferData(
    _sessionId: string
  ): Promise<SessionTransfer['transferData']> {
    // This would typically fetch from session storage/database
    return {
      state: {},
      preferences: {},
      temporaryData: {},
    };
  }

  private async applyTransferData(
    _sessionId: string,
    _transferData: SessionTransfer['transferData']
  ): Promise<void> {
    // Apply transferred data to new session
    // This would typically update session storage/database
  }

  private async getDeviceInfo(_deviceId: string): Promise<any> {
    // This would typically fetch device information
    return {
      country: 'BR',
      deviceType: 'desktop',
      userAgent: '',
    };
  }

  private detectDeviceSpoofing(_device1: any, _device2: any): boolean {
    // Implement device spoofing detection logic
    return false;
  }

  private async notifySessionTerminations(
    _userId: string,
    _sessionIds: string[]
  ): Promise<void> {}

  /**
   * Get active conflicts for user
   */
  public getActiveConflicts(userId: string): SessionConflict[] {
    return Array.from(this.activeConflicts.values()).filter(
      (conflict) => conflict.userId === userId && !conflict.resolved
    );
  }

  /**
   * Resolve conflict with user choice
   */
  public async resolveConflictWithUserChoice(
    conflictId: string,
    action: ConflictResolution['action'],
    targetSessionIds?: string[]
  ): Promise<boolean> {
    const conflict = this.activeConflicts.get(conflictId);
    if (!conflict) {
      return false;
    }

    conflict.resolution = {
      action,
      targetSessionIds,
      reason: 'User choice',
      userNotified: true,
    };

    const result = await this.resolveSessionConflict(conflict);
    return result.success;
  }

  /**
   * Clean up expired conflicts and transfers
   */
  public cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up old conflicts
    for (const [id, conflict] of this.activeConflicts.entries()) {
      if (now - conflict.timestamp > maxAge) {
        this.activeConflicts.delete(id);
      }
    }

    // Clean up old transfers
    for (const [id, transfer] of this.sessionTransfers.entries()) {
      if (now - transfer.timestamp > maxAge) {
        this.sessionTransfers.delete(id);
      }
    }
  }
}

// Singleton instance
let concurrentManager: ConcurrentSessionManager | null = null;

export function getConcurrentSessionManager(): ConcurrentSessionManager {
  if (!concurrentManager) {
    concurrentManager = new ConcurrentSessionManager();
  }
  return concurrentManager;
}

export default ConcurrentSessionManager;
