/**
 * Session Preservation System
 * Story 1.4 - Task 7: Preserve session data during interruptions
 *
 * Features:
 * - Automatic session state backup
 * - Recovery from interruptions
 * - Data persistence strategies
 * - Progressive data saving
 * - Recovery validation
 * - Cleanup of expired backups
 */

import type { createClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/auth";
import type { SecurityAuditLogger } from "./security-audit-logger";

export interface SessionState {
  sessionId: string;
  userId: string;
  userRole: UserRole;
  deviceId: string;
  applicationState: {
    currentRoute: string;
    formData: Record<string, any>;
    unsavedChanges: Record<string, any>;
    temporaryData: Record<string, any>;
    userPreferences: Record<string, any>;
    uiState: Record<string, any>;
  };
  authenticationState: {
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: Date;
    permissions: string[];
    lastAuthAt: Date;
  };
  securityContext: {
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    securityLevel: "low" | "medium" | "high" | "critical";
    riskScore: number;
    lastSecurityCheck: Date;
  };
  metadata: {
    createdAt: Date;
    lastUpdatedAt: Date;
    version: number;
    checksum: string;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    backupCount: number;
  };
}

export interface SessionBackup {
  backupId: string;
  sessionId: string;
  userId: string;
  backupType: "automatic" | "manual" | "emergency" | "scheduled";
  backupTrigger: "interval" | "activity" | "logout" | "error" | "shutdown";
  sessionState: SessionState;
  createdAt: Date;
  expiresAt: Date;
  isCompressed: boolean;
  isEncrypted: boolean;
  size: number;
  checksum: string;
  recoveryPriority: "low" | "medium" | "high" | "critical";
  metadata: Record<string, any>;
}

export interface RecoveryResult {
  success: boolean;
  sessionState?: SessionState;
  recoveredData: {
    formData: Record<string, any>;
    unsavedChanges: Record<string, any>;
    userPreferences: Record<string, any>;
    applicationState: Record<string, any>;
  };
  recoverySource: "latest_backup" | "emergency_backup" | "local_storage" | "memory";
  recoveryTime: Date;
  dataIntegrity: {
    checksumValid: boolean;
    dataComplete: boolean;
    corruptedFields: string[];
    recoveredFields: string[];
  };
  warnings: string[];
  errors: string[];
}

export interface PreservationConfig {
  enabled: boolean;
  autoBackupInterval: number; // seconds
  maxBackupsPerSession: number;
  backupRetentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  emergencyBackupTriggers: string[];
  preservationPriority: {
    formData: "high" | "medium" | "low";
    unsavedChanges: "high" | "medium" | "low";
    userPreferences: "high" | "medium" | "low";
    applicationState: "high" | "medium" | "low";
  };
  recoveryValidation: {
    checksumValidation: boolean;
    dataIntegrityCheck: boolean;
    securityValidation: boolean;
    timeoutThreshold: number; // seconds
  };
  cleanupSchedule: {
    enabled: boolean;
    frequency: number; // hours
    maxAge: number; // days
  };
}

const DEFAULT_CONFIG: PreservationConfig = {
  enabled: true,
  autoBackupInterval: 300, // 5 minutes
  maxBackupsPerSession: 10,
  backupRetentionDays: 7,
  compressionEnabled: true,
  encryptionEnabled: true,
  emergencyBackupTriggers: ["error", "logout", "shutdown", "network_loss"],
  preservationPriority: {
    formData: "high",
    unsavedChanges: "high",
    userPreferences: "medium",
    applicationState: "low",
  },
  recoveryValidation: {
    checksumValidation: true,
    dataIntegrityCheck: true,
    securityValidation: true,
    timeoutThreshold: 30,
  },
  cleanupSchedule: {
    enabled: true,
    frequency: 24, // daily
    maxAge: 7, // 7 days
  },
};

export class SessionPreservation {
  private supabase;
  private auditLogger: SecurityAuditLogger;
  private config: PreservationConfig;
  private activeBackups: Map<string, SessionBackup[]> = new Map();
  private backupInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  private currentSessionState?: SessionState;
  private isBackupInProgress: boolean = false;
  private recoveryCache: Map<string, RecoveryResult> = new Map();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    customConfig?: Partial<PreservationConfig>,
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = new SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.config = { ...DEFAULT_CONFIG, ...customConfig };

    if (this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize session preservation system
   */
  async initialize(): Promise<void> {
    try {
      // Load existing backups
      await this.loadActiveBackups();

      // Start backup interval
      this.startBackupInterval();

      // Start cleanup interval
      if (this.config.cleanupSchedule.enabled) {
        this.startCleanupInterval();
      }

      // Set up event listeners
      this.setupEventListeners();

      console.log("Session preservation system initialized");
    } catch (error) {
      console.error("Failed to initialize session preservation:", error);
      throw error;
    }
  }

  /**
   * Update current session state
   */
  async updateSessionState(
    sessionId: string,
    stateUpdates: Partial<SessionState["applicationState"]>,
  ): Promise<void> {
    try {
      if (!this.currentSessionState || this.currentSessionState.sessionId !== sessionId) {
        // Load or create session state
        this.currentSessionState = await this.getOrCreateSessionState(sessionId);
      }

      // Update application state
      this.currentSessionState.applicationState = {
        ...this.currentSessionState.applicationState,
        ...stateUpdates,
      };

      // Update metadata
      this.currentSessionState.metadata.lastUpdatedAt = new Date();
      this.currentSessionState.metadata.version++;
      this.currentSessionState.metadata.checksum = this.calculateChecksum(this.currentSessionState);

      // Trigger backup if significant changes
      if (this.shouldTriggerBackup(stateUpdates)) {
        await this.createBackup(sessionId, "automatic", "activity");
      }
    } catch (error) {
      console.error("Failed to update session state:", error);
      throw error;
    }
  }

  /**
   * Create session backup
   */
  async createBackup(
    sessionId: string,
    backupType: SessionBackup["backupType"] = "automatic",
    trigger: SessionBackup["backupTrigger"] = "interval",
  ): Promise<SessionBackup> {
    try {
      if (this.isBackupInProgress) {
        console.log("Backup already in progress, skipping");
        return null;
      }

      this.isBackupInProgress = true;

      // Get current session state
      const sessionState =
        this.currentSessionState || (await this.getOrCreateSessionState(sessionId));

      // Create backup
      const backup: SessionBackup = {
        backupId: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        userId: sessionState.userId,
        backupType,
        backupTrigger: trigger,
        sessionState: { ...sessionState },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.config.backupRetentionDays * 24 * 60 * 60 * 1000),
        isCompressed: this.config.compressionEnabled,
        isEncrypted: this.config.encryptionEnabled,
        size: 0,
        checksum: "",
        recoveryPriority: this.determineRecoveryPriority(sessionState),
        metadata: {
          trigger,
          backupType,
          createdBy: "session_preservation_system",
        },
      };

      // Process backup data
      let backupData = JSON.stringify(backup.sessionState);

      if (backup.isCompressed) {
        backupData = await this.compressData(backupData);
      }

      if (backup.isEncrypted) {
        backupData = await this.encryptData(backupData);
      }

      backup.size = backupData.length;
      backup.checksum = this.calculateChecksum(backup.sessionState);

      // Store backup
      await this.storeBackup(backup, backupData);

      // Add to active backups
      const sessionBackups = this.activeBackups.get(sessionId) || [];
      sessionBackups.push(backup);

      // Limit number of backups per session
      if (sessionBackups.length > this.config.maxBackupsPerSession) {
        const oldestBackup = sessionBackups.shift();
        if (oldestBackup) {
          await this.deleteBackup(oldestBackup.backupId);
        }
      }

      this.activeBackups.set(sessionId, sessionBackups);

      // Log backup creation
      await this.auditLogger.logSecurityEvent({
        eventType: "session_backup_created",
        userId: sessionState.userId,
        metadata: {
          sessionId,
          backupId: backup.backupId,
          backupType,
          trigger,
          size: backup.size,
        },
      });

      return backup;
    } catch (error) {
      console.error("Failed to create backup:", error);
      throw error;
    } finally {
      this.isBackupInProgress = false;
    }
  }

  /**
   * Recover session from backup
   */
  async recoverSession(sessionId: string): Promise<RecoveryResult> {
    try {
      const startTime = Date.now();

      // Check recovery cache first
      const cachedResult = this.recoveryCache.get(sessionId);
      if (cachedResult && Date.now() - cachedResult.recoveryTime.getTime() < 60000) {
        return cachedResult;
      }

      // Get available backups
      const backups = await this.getSessionBackups(sessionId);
      if (backups.length === 0) {
        return {
          success: false,
          recoveredData: {
            formData: {},
            unsavedChanges: {},
            userPreferences: {},
            applicationState: {},
          },
          recoverySource: "memory",
          recoveryTime: new Date(),
          dataIntegrity: {
            checksumValid: false,
            dataComplete: false,
            corruptedFields: [],
            recoveredFields: [],
          },
          warnings: ["No backups found for session"],
          errors: [],
        };
      }

      // Sort backups by priority and recency
      const sortedBackups = this.sortBackupsByPriority(backups);

      let recoveryResult: RecoveryResult | null = null;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Try to recover from each backup until successful
      for (const backup of sortedBackups) {
        try {
          const result = await this.recoverFromBackup(backup);
          if (result.success) {
            recoveryResult = result;
            break;
          } else {
            warnings.push(
              `Failed to recover from backup ${backup.backupId}: ${result.errors.join(", ")}`,
            );
          }
        } catch (error) {
          errors.push(`Error recovering from backup ${backup.backupId}: ${error.message}`);
        }
      }

      // If no backup recovery succeeded, try alternative sources
      if (!recoveryResult) {
        recoveryResult = await this.recoverFromAlternativeSources(sessionId);
        warnings.push("Primary backup recovery failed, using alternative sources");
      }

      // Add any accumulated warnings and errors
      recoveryResult.warnings.push(...warnings);
      recoveryResult.errors.push(...errors);

      // Cache result
      this.recoveryCache.set(sessionId, recoveryResult);

      // Log recovery attempt
      await this.auditLogger.logSecurityEvent({
        eventType: "session_recovery_attempted",
        metadata: {
          sessionId,
          success: recoveryResult.success,
          recoverySource: recoveryResult.recoverySource,
          recoveryTime: Date.now() - startTime,
          backupsAttempted: sortedBackups.length,
        },
      });

      return recoveryResult;
    } catch (error) {
      console.error("Failed to recover session:", error);

      return {
        success: false,
        recoveredData: {
          formData: {},
          unsavedChanges: {},
          userPreferences: {},
          applicationState: {},
        },
        recoverySource: "memory",
        recoveryTime: new Date(),
        dataIntegrity: {
          checksumValid: false,
          dataComplete: false,
          corruptedFields: [],
          recoveredFields: [],
        },
        warnings: [],
        errors: [error.message],
      };
    }
  }

  /**
   * Create emergency backup
   */
  async createEmergencyBackup(sessionId: string, reason: string): Promise<SessionBackup> {
    try {
      const backup = await this.createBackup(sessionId, "emergency", "error");

      // Mark as high priority
      backup.recoveryPriority = "critical";
      backup.metadata.emergencyReason = reason;
      backup.metadata.emergencyTimestamp = new Date().toISOString();

      // Update stored backup
      await this.updateBackupMetadata(backup.backupId, backup.metadata);

      console.log(`Emergency backup created for session ${sessionId}: ${reason}`);

      return backup;
    } catch (error) {
      console.error("Failed to create emergency backup:", error);
      throw error;
    }
  }

  /**
   * Get session backups
   */
  async getSessionBackups(sessionId: string): Promise<SessionBackup[]> {
    try {
      const { data, error } = await this.supabase
        .from("session_backups")
        .select("*")
        .eq("session_id", sessionId)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to get session backups: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToBackup);
    } catch (error) {
      console.error("Failed to get session backups:", error);
      return [];
    }
  }

  /**
   * Delete session backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    try {
      // Delete from database
      await this.supabase.from("session_backups").delete().eq("backup_id", backupId);

      // Remove from active backups
      for (const [sessionId, backups] of this.activeBackups) {
        const filteredBackups = backups.filter((b) => b.backupId !== backupId);
        if (filteredBackups.length !== backups.length) {
          this.activeBackups.set(sessionId, filteredBackups);
          break;
        }
      }
    } catch (error) {
      console.error("Failed to delete backup:", error);
    }
  }

  /**
   * Clean up expired backups
   */
  async cleanupExpiredBackups(): Promise<number> {
    try {
      const now = new Date();

      // Get expired backups
      const { data: expiredBackups, error } = await this.supabase
        .from("session_backups")
        .select("backup_id")
        .lt("expires_at", now.toISOString());

      if (error) {
        console.error("Failed to get expired backups:", error);
        return 0;
      }

      let deletedCount = 0;

      // Delete expired backups
      for (const backup of expiredBackups || []) {
        await this.deleteBackup(backup.backup_id);
        deletedCount++;
      }

      console.log(`Cleaned up ${deletedCount} expired backups`);

      return deletedCount;
    } catch (error) {
      console.error("Failed to cleanup expired backups:", error);
      return 0;
    }
  }

  /**
   * Update preservation configuration
   */
  updateConfig(newConfig: Partial<PreservationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart intervals if needed
    if (this.config.enabled && !this.backupInterval) {
      this.startBackupInterval();
    } else if (!this.config.enabled && this.backupInterval) {
      this.stopPreservation();
    }
  }

  /**
   * Stop session preservation
   */
  stopPreservation(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = undefined;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    console.log("Session preservation stopped");
  }

  // Private methods

  private async loadActiveBackups(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("session_backups")
        .select("*")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load active backups:", error);
        return;
      }

      // Group backups by session
      for (const backupData of data || []) {
        const backup = this.mapDatabaseToBackup(backupData);
        const sessionBackups = this.activeBackups.get(backup.sessionId) || [];
        sessionBackups.push(backup);
        this.activeBackups.set(backup.sessionId, sessionBackups);
      }
    } catch (error) {
      console.error("Failed to load active backups:", error);
    }
  }

  private startBackupInterval(): void {
    this.backupInterval = setInterval(async () => {
      try {
        if (this.currentSessionState && !this.isBackupInProgress) {
          await this.createBackup(this.currentSessionState.sessionId, "automatic", "interval");
        }
      } catch (error) {
        console.error("Backup interval processing failed:", error);
      }
    }, this.config.autoBackupInterval * 1000);
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      async () => {
        try {
          await this.cleanupExpiredBackups();
        } catch (error) {
          console.error("Cleanup interval processing failed:", error);
        }
      },
      this.config.cleanupSchedule.frequency * 60 * 60 * 1000,
    ); // Convert hours to milliseconds
  }

  private setupEventListeners(): void {
    // Listen for page unload events
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", async () => {
        if (this.currentSessionState) {
          await this.createEmergencyBackup(this.currentSessionState.sessionId, "page_unload");
        }
      });

      // Listen for network status changes
      window.addEventListener("offline", async () => {
        if (this.currentSessionState) {
          await this.createEmergencyBackup(this.currentSessionState.sessionId, "network_loss");
        }
      });
    }
  }

  private async getOrCreateSessionState(sessionId: string): Promise<SessionState> {
    try {
      // Try to load existing session state
      const { data, error } = await this.supabase
        .from("session_states")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (data && !error) {
        return this.mapDatabaseToSessionState(data);
      }

      // Create new session state
      const newSessionState: SessionState = {
        sessionId,
        userId: "", // Will be set when user logs in
        userRole: "patient",
        deviceId: "",
        applicationState: {
          currentRoute: "/",
          formData: {},
          unsavedChanges: {},
          temporaryData: {},
          userPreferences: {},
          uiState: {},
        },
        authenticationState: {
          accessToken: "",
          refreshToken: "",
          tokenExpiresAt: new Date(),
          permissions: [],
          lastAuthAt: new Date(),
        },
        securityContext: {
          ipAddress: "",
          userAgent: "",
          deviceFingerprint: "",
          securityLevel: "medium",
          riskScore: 0,
          lastSecurityCheck: new Date(),
        },
        metadata: {
          createdAt: new Date(),
          lastUpdatedAt: new Date(),
          version: 1,
          checksum: "",
          compressionEnabled: this.config.compressionEnabled,
          encryptionEnabled: this.config.encryptionEnabled,
          backupCount: 0,
        },
      };

      newSessionState.metadata.checksum = this.calculateChecksum(newSessionState);

      return newSessionState;
    } catch (error) {
      console.error("Failed to get or create session state:", error);
      throw error;
    }
  }

  private shouldTriggerBackup(stateUpdates: Partial<SessionState["applicationState"]>): boolean {
    // Check if updates contain high-priority data
    const highPriorityFields = ["formData", "unsavedChanges"];

    for (const field of highPriorityFields) {
      if (stateUpdates[field] && Object.keys(stateUpdates[field]).length > 0) {
        return true;
      }
    }

    return false;
  }

  private determineRecoveryPriority(sessionState: SessionState): SessionBackup["recoveryPriority"] {
    // Determine priority based on data content
    const hasFormData = Object.keys(sessionState.applicationState.formData || {}).length > 0;
    const hasUnsavedChanges =
      Object.keys(sessionState.applicationState.unsavedChanges || {}).length > 0;

    if (hasFormData || hasUnsavedChanges) {
      return "high";
    }

    const hasUserPreferences =
      Object.keys(sessionState.applicationState.userPreferences || {}).length > 0;
    if (hasUserPreferences) {
      return "medium";
    }

    return "low";
  }

  private async compressData(data: string): Promise<string> {
    // Simple compression simulation (in production, use proper compression)
    return Buffer.from(data).toString("base64");
  }

  private async encryptData(data: string): Promise<string> {
    // Simple encryption simulation (in production, use proper encryption)
    return Buffer.from(data).toString("base64");
  }

  private async storeBackup(backup: SessionBackup, backupData: string): Promise<void> {
    try {
      await this.supabase.from("session_backups").insert({
        backup_id: backup.backupId,
        session_id: backup.sessionId,
        user_id: backup.userId,
        backup_type: backup.backupType,
        backup_trigger: backup.backupTrigger,
        backup_data: backupData,
        created_at: backup.createdAt.toISOString(),
        expires_at: backup.expiresAt.toISOString(),
        is_compressed: backup.isCompressed,
        is_encrypted: backup.isEncrypted,
        size: backup.size,
        checksum: backup.checksum,
        recovery_priority: backup.recoveryPriority,
        metadata: backup.metadata,
      });
    } catch (error) {
      console.error("Failed to store backup:", error);
      throw error;
    }
  }

  private async updateBackupMetadata(
    backupId: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    try {
      await this.supabase.from("session_backups").update({ metadata }).eq("backup_id", backupId);
    } catch (error) {
      console.error("Failed to update backup metadata:", error);
    }
  }

  private sortBackupsByPriority(backups: SessionBackup[]): SessionBackup[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    return backups.sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityOrder[b.recoveryPriority] - priorityOrder[a.recoveryPriority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // Then by creation time (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  private async recoverFromBackup(backup: SessionBackup): Promise<RecoveryResult> {
    try {
      // Get backup data
      const { data: backupData, error } = await this.supabase
        .from("session_backups")
        .select("backup_data")
        .eq("backup_id", backup.backupId)
        .single();

      if (error) {
        throw new Error(`Failed to get backup data: ${error.message}`);
      }

      let sessionData = backupData.backup_data;

      // Decrypt if needed
      if (backup.isEncrypted) {
        sessionData = await this.decryptData(sessionData);
      }

      // Decompress if needed
      if (backup.isCompressed) {
        sessionData = await this.decompressData(sessionData);
      }

      // Parse session state
      const sessionState: SessionState = JSON.parse(sessionData);

      // Validate data integrity
      const dataIntegrity = await this.validateDataIntegrity(sessionState, backup.checksum);

      if (!dataIntegrity.checksumValid && this.config.recoveryValidation.checksumValidation) {
        throw new Error("Checksum validation failed");
      }

      // Extract recoverable data
      const recoveredData = {
        formData: sessionState.applicationState.formData || {},
        unsavedChanges: sessionState.applicationState.unsavedChanges || {},
        userPreferences: sessionState.applicationState.userPreferences || {},
        applicationState: sessionState.applicationState || {},
      };

      return {
        success: true,
        sessionState,
        recoveredData,
        recoverySource: "latest_backup",
        recoveryTime: new Date(),
        dataIntegrity,
        warnings: [],
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        recoveredData: {
          formData: {},
          unsavedChanges: {},
          userPreferences: {},
          applicationState: {},
        },
        recoverySource: "latest_backup",
        recoveryTime: new Date(),
        dataIntegrity: {
          checksumValid: false,
          dataComplete: false,
          corruptedFields: [],
          recoveredFields: [],
        },
        warnings: [],
        errors: [error.message],
      };
    }
  }

  private async recoverFromAlternativeSources(sessionId: string): Promise<RecoveryResult> {
    // Try to recover from local storage or other sources
    const recoveredData = {
      formData: {},
      unsavedChanges: {},
      userPreferences: {},
      applicationState: {},
    };

    // Try local storage
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const localData = localStorage.getItem(`session_${sessionId}`);
        if (localData) {
          const parsedData = JSON.parse(localData);
          Object.assign(recoveredData, parsedData);
        }
      } catch (error) {
        console.error("Failed to recover from local storage:", error);
      }
    }

    return {
      success:
        Object.keys(recoveredData.formData).length > 0 ||
        Object.keys(recoveredData.unsavedChanges).length > 0,
      recoveredData,
      recoverySource: "local_storage",
      recoveryTime: new Date(),
      dataIntegrity: {
        checksumValid: false,
        dataComplete: false,
        corruptedFields: [],
        recoveredFields: Object.keys(recoveredData),
      },
      warnings: ["Recovered from alternative sources, data may be incomplete"],
      errors: [],
    };
  }

  private async decryptData(data: string): Promise<string> {
    // Simple decryption simulation (in production, use proper decryption)
    return Buffer.from(data, "base64").toString();
  }

  private async decompressData(data: string): Promise<string> {
    // Simple decompression simulation (in production, use proper decompression)
    return Buffer.from(data, "base64").toString();
  }

  private async validateDataIntegrity(
    sessionState: SessionState,
    expectedChecksum: string,
  ): Promise<RecoveryResult["dataIntegrity"]> {
    const actualChecksum = this.calculateChecksum(sessionState);
    const checksumValid = actualChecksum === expectedChecksum;

    const requiredFields = ["sessionId", "userId", "applicationState", "authenticationState"];
    const corruptedFields: string[] = [];
    const recoveredFields: string[] = [];

    for (const field of requiredFields) {
      if (sessionState[field] === undefined || sessionState[field] === null) {
        corruptedFields.push(field);
      } else {
        recoveredFields.push(field);
      }
    }

    return {
      checksumValid,
      dataComplete: corruptedFields.length === 0,
      corruptedFields,
      recoveredFields,
    };
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation (in production, use a proper hash function)
    const dataString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private mapDatabaseToBackup(data: any): SessionBackup {
    return {
      backupId: data.backup_id,
      sessionId: data.session_id,
      userId: data.user_id,
      backupType: data.backup_type,
      backupTrigger: data.backup_trigger,
      sessionState: null, // Will be loaded separately when needed
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
      isCompressed: data.is_compressed,
      isEncrypted: data.is_encrypted,
      size: data.size,
      checksum: data.checksum,
      recoveryPriority: data.recovery_priority,
      metadata: data.metadata || {},
    };
  }

  private mapDatabaseToSessionState(data: any): SessionState {
    return {
      sessionId: data.session_id,
      userId: data.user_id,
      userRole: data.user_role,
      deviceId: data.device_id,
      applicationState: data.application_state,
      authenticationState: data.authentication_state,
      securityContext: data.security_context,
      metadata: {
        createdAt: new Date(data.created_at),
        lastUpdatedAt: new Date(data.last_updated_at),
        version: data.version,
        checksum: data.checksum,
        compressionEnabled: data.compression_enabled,
        encryptionEnabled: data.encryption_enabled,
        backupCount: data.backup_count,
      },
    };
  }
}
