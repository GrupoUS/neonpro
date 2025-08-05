/**
 * Emergency Session Termination System
 * Story 1.4 - Task 8: Emergency termination capabilities
 *
 * Features:
 * - Immediate session termination
 * - Bulk session management
 * - Emergency protocols
 * - Security incident response
 * - Audit trail for terminations
 * - Recovery procedures
 */

import type { createClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/auth";
import type { SecurityAuditLogger } from "./security-audit-logger";
import type { SessionPreservation } from "./session-preservation";

export interface EmergencyTerminationRequest {
  requestId: string;
  initiatedBy: string;
  initiatorRole: UserRole;
  terminationType:
    | "single_session"
    | "user_sessions"
    | "all_sessions"
    | "device_sessions"
    | "role_sessions";
  targetIdentifier: string; // sessionId, userId, deviceId, or role
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  preserveData: boolean;
  notifyUsers: boolean;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface TerminationResult {
  requestId: string;
  success: boolean;
  terminatedSessions: {
    sessionId: string;
    userId: string;
    deviceId: string;
    terminatedAt: Date;
    preservationBackupId?: string;
  }[];
  failedTerminations: {
    sessionId: string;
    error: string;
  }[];
  totalAttempted: number;
  totalSuccessful: number;
  totalFailed: number;
  executionTime: number;
  warnings: string[];
  errors: string[];
}

export interface EmergencyProtocol {
  protocolId: string;
  name: string;
  description: string;
  triggerConditions: string[];
  automaticTrigger: boolean;
  severity: "low" | "medium" | "high" | "critical";
  actions: {
    terminateAllSessions: boolean;
    terminateUserSessions: boolean;
    terminateDeviceSessions: boolean;
    preserveData: boolean;
    notifyUsers: boolean;
    notifyAdministrators: boolean;
    lockAccounts: boolean;
    disableNewLogins: boolean;
    escalateToSecurity: boolean;
  };
  approvalRequired: boolean;
  approverRoles: UserRole[];
  cooldownPeriod: number; // minutes
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
}

export interface TerminationAuditLog {
  logId: string;
  requestId: string;
  sessionId: string;
  userId: string;
  deviceId: string;
  initiatedBy: string;
  initiatorRole: UserRole;
  terminationType: string;
  reason: string;
  severity: string;
  terminatedAt: Date;
  preservationBackupId?: string;
  success: boolean;
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
}

export interface EmergencyConfig {
  enabled: boolean;
  requireApproval: {
    singleSession: boolean;
    userSessions: boolean;
    allSessions: boolean;
    deviceSessions: boolean;
    roleBasedSessions: boolean;
  };
  approverRoles: UserRole[];
  autoPreserveData: boolean;
  notificationSettings: {
    notifyUsers: boolean;
    notifyAdministrators: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    maxTerminationsPerHour: number;
    maxTerminationsPerDay: number;
    cooldownPeriod: number; // minutes
  };
  auditSettings: {
    detailedLogging: boolean;
    retentionDays: number;
    realTimeAlerts: boolean;
  };
}

const DEFAULT_CONFIG: EmergencyConfig = {
  enabled: true,
  requireApproval: {
    singleSession: false,
    userSessions: true,
    allSessions: true,
    deviceSessions: true,
    roleBasedSessions: true,
  },
  approverRoles: ["owner", "manager"],
  autoPreserveData: true,
  notificationSettings: {
    notifyUsers: true,
    notifyAdministrators: true,
    emailNotifications: true,
    smsNotifications: false,
  },
  rateLimiting: {
    enabled: true,
    maxTerminationsPerHour: 10,
    maxTerminationsPerDay: 50,
    cooldownPeriod: 5,
  },
  auditSettings: {
    detailedLogging: true,
    retentionDays: 90,
    realTimeAlerts: true,
  },
};

const DEFAULT_PROTOCOLS: EmergencyProtocol[] = [
  {
    protocolId: "security_breach",
    name: "Security Breach Response",
    description: "Immediate response to detected security breaches",
    triggerConditions: ["multiple_failed_logins", "suspicious_activity", "unauthorized_access"],
    automaticTrigger: true,
    severity: "critical",
    actions: {
      terminateAllSessions: true,
      terminateUserSessions: false,
      terminateDeviceSessions: false,
      preserveData: true,
      notifyUsers: true,
      notifyAdministrators: true,
      lockAccounts: true,
      disableNewLogins: true,
      escalateToSecurity: true,
    },
    approvalRequired: false,
    approverRoles: ["owner"],
    cooldownPeriod: 60,
    isActive: true,
    createdAt: new Date(),
  },
  {
    protocolId: "data_breach",
    name: "Data Breach Response",
    description: "Response to potential data breaches",
    triggerConditions: ["unauthorized_data_access", "data_exfiltration", "privilege_escalation"],
    automaticTrigger: true,
    severity: "critical",
    actions: {
      terminateAllSessions: true,
      terminateUserSessions: false,
      terminateDeviceSessions: false,
      preserveData: true,
      notifyUsers: true,
      notifyAdministrators: true,
      lockAccounts: false,
      disableNewLogins: true,
      escalateToSecurity: true,
    },
    approvalRequired: false,
    approverRoles: ["owner"],
    cooldownPeriod: 30,
    isActive: true,
    createdAt: new Date(),
  },
  {
    protocolId: "compromised_account",
    name: "Compromised Account Response",
    description: "Response to compromised user accounts",
    triggerConditions: ["unusual_login_pattern", "location_anomaly", "device_anomaly"],
    automaticTrigger: false,
    severity: "high",
    actions: {
      terminateAllSessions: false,
      terminateUserSessions: true,
      terminateDeviceSessions: false,
      preserveData: true,
      notifyUsers: true,
      notifyAdministrators: true,
      lockAccounts: true,
      disableNewLogins: false,
      escalateToSecurity: false,
    },
    approvalRequired: true,
    approverRoles: ["owner", "manager"],
    cooldownPeriod: 15,
    isActive: true,
    createdAt: new Date(),
  },
];

export class EmergencyTermination {
  private supabase;
  private auditLogger: SecurityAuditLogger;
  private sessionPreservation: SessionPreservation;
  private config: EmergencyConfig;
  private protocols: Map<string, EmergencyProtocol> = new Map();
  private pendingRequests: Map<string, EmergencyTerminationRequest> = new Map();
  private rateLimitTracker: Map<string, { count: number; lastReset: Date }> = new Map();
  private activeSessions: Map<string, any> = new Map();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    sessionPreservation: SessionPreservation,
    customConfig?: Partial<EmergencyConfig>,
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.auditLogger = new SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.sessionPreservation = sessionPreservation;
    this.config = { ...DEFAULT_CONFIG, ...customConfig };

    // Initialize default protocols
    DEFAULT_PROTOCOLS.forEach((protocol) => {
      this.protocols.set(protocol.protocolId, protocol);
    });

    if (this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize emergency termination system
   */
  async initialize(): Promise<void> {
    try {
      // Load custom protocols
      await this.loadCustomProtocols();

      // Load active sessions
      await this.loadActiveSessions();

      // Set up real-time monitoring
      await this.setupRealtimeMonitoring();

      console.log("Emergency termination system initialized");
    } catch (error) {
      console.error("Failed to initialize emergency termination:", error);
      throw error;
    }
  }

  /**
   * Request emergency termination
   */
  async requestTermination(
    request: Omit<EmergencyTerminationRequest, "requestId" | "timestamp">,
  ): Promise<TerminationResult> {
    try {
      const startTime = Date.now();

      // Create termination request
      const terminationRequest: EmergencyTerminationRequest = {
        ...request,
        requestId: `term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      // Validate request
      await this.validateTerminationRequest(terminationRequest);

      // Check rate limits
      await this.checkRateLimits(terminationRequest.initiatedBy);

      // Check if approval is required
      if (this.requiresApproval(terminationRequest)) {
        return await this.requestApproval(terminationRequest);
      }

      // Execute termination
      const result = await this.executeTermination(terminationRequest);

      // Calculate execution time
      result.executionTime = Date.now() - startTime;

      // Log the termination
      await this.logTermination(terminationRequest, result);

      return result;
    } catch (error) {
      console.error("Failed to request termination:", error);
      throw error;
    }
  }

  /**
   * Execute emergency protocol
   */
  async executeProtocol(
    protocolId: string,
    initiatedBy: string,
    initiatorRole: UserRole,
    context?: Record<string, any>,
  ): Promise<TerminationResult> {
    try {
      const protocol = this.protocols.get(protocolId);
      if (!protocol) {
        throw new Error(`Protocol ${protocolId} not found`);
      }

      if (!protocol.isActive) {
        throw new Error(`Protocol ${protocolId} is not active`);
      }

      // Check cooldown period
      if (protocol.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - protocol.lastTriggered.getTime();
        const cooldownMs = protocol.cooldownPeriod * 60 * 1000;

        if (timeSinceLastTrigger < cooldownMs) {
          throw new Error(`Protocol ${protocolId} is in cooldown period`);
        }
      }

      // Create termination request based on protocol
      const terminationRequest: EmergencyTerminationRequest = {
        requestId: `protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        initiatedBy,
        initiatorRole,
        terminationType: protocol.actions.terminateAllSessions ? "all_sessions" : "user_sessions",
        targetIdentifier: protocol.actions.terminateAllSessions ? "all" : initiatedBy,
        reason: `Emergency protocol: ${protocol.name}`,
        severity: protocol.severity,
        preserveData: protocol.actions.preserveData,
        notifyUsers: protocol.actions.notifyUsers,
        timestamp: new Date(),
        metadata: {
          protocolId,
          protocolName: protocol.name,
          automaticTrigger: protocol.automaticTrigger,
          context: context || {},
        },
      };

      // Execute termination
      const result = await this.executeTermination(terminationRequest);

      // Update protocol last triggered time
      protocol.lastTriggered = new Date();
      await this.updateProtocol(protocol);

      // Execute additional protocol actions
      if (protocol.actions.lockAccounts) {
        await this.lockUserAccounts(result.terminatedSessions.map((s) => s.userId));
      }

      if (protocol.actions.disableNewLogins) {
        await this.disableNewLogins();
      }

      if (protocol.actions.escalateToSecurity) {
        await this.escalateToSecurity(terminationRequest, result);
      }

      return result;
    } catch (error) {
      console.error("Failed to execute protocol:", error);
      throw error;
    }
  }

  /**
   * Terminate single session
   */
  async terminateSession(
    sessionId: string,
    initiatedBy: string,
    reason: string,
    preserveData: boolean = true,
  ): Promise<TerminationResult> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const terminationRequest: EmergencyTerminationRequest = {
        requestId: `single_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        initiatedBy,
        initiatorRole: "manager", // Default role for single session termination
        terminationType: "single_session",
        targetIdentifier: sessionId,
        reason,
        severity: "medium",
        preserveData,
        notifyUsers: true,
        timestamp: new Date(),
        metadata: {},
      };

      return await this.executeTermination(terminationRequest);
    } catch (error) {
      console.error("Failed to terminate session:", error);
      throw error;
    }
  }

  /**
   * Terminate all user sessions
   */
  async terminateUserSessions(
    userId: string,
    initiatedBy: string,
    reason: string,
    preserveData: boolean = true,
  ): Promise<TerminationResult> {
    try {
      const terminationRequest: EmergencyTerminationRequest = {
        requestId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        initiatedBy,
        initiatorRole: "manager",
        terminationType: "user_sessions",
        targetIdentifier: userId,
        reason,
        severity: "high",
        preserveData,
        notifyUsers: true,
        timestamp: new Date(),
        metadata: {},
      };

      return await this.executeTermination(terminationRequest);
    } catch (error) {
      console.error("Failed to terminate user sessions:", error);
      throw error;
    }
  }

  /**
   * Terminate all sessions (nuclear option)
   */
  async terminateAllSessions(
    initiatedBy: string,
    reason: string,
    preserveData: boolean = true,
  ): Promise<TerminationResult> {
    try {
      const terminationRequest: EmergencyTerminationRequest = {
        requestId: `all_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        initiatedBy,
        initiatorRole: "owner",
        terminationType: "all_sessions",
        targetIdentifier: "all",
        reason,
        severity: "critical",
        preserveData,
        notifyUsers: true,
        timestamp: new Date(),
        metadata: {},
      };

      return await this.executeTermination(terminationRequest);
    } catch (error) {
      console.error("Failed to terminate all sessions:", error);
      throw error;
    }
  }

  /**
   * Get termination audit logs
   */
  async getTerminationLogs(filters?: {
    initiatedBy?: string;
    userId?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<TerminationAuditLog[]> {
    try {
      let query = this.supabase.from("termination_audit_logs").select("*");

      if (filters?.initiatedBy) {
        query = query.eq("initiated_by", filters.initiatedBy);
      }

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }

      if (filters?.severity) {
        query = query.eq("severity", filters.severity);
      }

      if (filters?.startDate) {
        query = query.gte("terminated_at", filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte("terminated_at", filters.endDate.toISOString());
      }

      query = query.order("terminated_at", { ascending: false }).limit(filters?.limit || 100);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get termination logs: ${error.message}`);
      }

      return (data || []).map(this.mapDatabaseToAuditLog);
    } catch (error) {
      console.error("Failed to get termination logs:", error);
      return [];
    }
  }

  /**
   * Add custom emergency protocol
   */
  async addProtocol(protocol: Omit<EmergencyProtocol, "createdAt">): Promise<void> {
    try {
      const newProtocol: EmergencyProtocol = {
        ...protocol,
        createdAt: new Date(),
      };

      // Store protocol
      await this.supabase.from("emergency_protocols").insert({
        protocol_id: newProtocol.protocolId,
        name: newProtocol.name,
        description: newProtocol.description,
        trigger_conditions: newProtocol.triggerConditions,
        automatic_trigger: newProtocol.automaticTrigger,
        severity: newProtocol.severity,
        actions: newProtocol.actions,
        approval_required: newProtocol.approvalRequired,
        approver_roles: newProtocol.approverRoles,
        cooldown_period: newProtocol.cooldownPeriod,
        is_active: newProtocol.isActive,
        created_at: newProtocol.createdAt.toISOString(),
      });

      // Add to protocols map
      this.protocols.set(newProtocol.protocolId, newProtocol);
    } catch (error) {
      console.error("Failed to add protocol:", error);
      throw error;
    }
  }

  /**
   * Update emergency protocol
   */
  async updateProtocol(protocol: EmergencyProtocol): Promise<void> {
    try {
      await this.supabase
        .from("emergency_protocols")
        .update({
          name: protocol.name,
          description: protocol.description,
          trigger_conditions: protocol.triggerConditions,
          automatic_trigger: protocol.automaticTrigger,
          severity: protocol.severity,
          actions: protocol.actions,
          approval_required: protocol.approvalRequired,
          approver_roles: protocol.approverRoles,
          cooldown_period: protocol.cooldownPeriod,
          is_active: protocol.isActive,
          last_triggered: protocol.lastTriggered?.toISOString(),
        })
        .eq("protocol_id", protocol.protocolId);

      // Update protocols map
      this.protocols.set(protocol.protocolId, protocol);
    } catch (error) {
      console.error("Failed to update protocol:", error);
      throw error;
    }
  }

  /**
   * Get emergency protocols
   */
  getProtocols(): EmergencyProtocol[] {
    return Array.from(this.protocols.values());
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<EmergencyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private methods

  private async loadCustomProtocols(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("emergency_protocols")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Failed to load custom protocols:", error);
        return;
      }

      for (const protocolData of data || []) {
        const protocol = this.mapDatabaseToProtocol(protocolData);
        this.protocols.set(protocol.protocolId, protocol);
      }
    } catch (error) {
      console.error("Failed to load custom protocols:", error);
    }
  }

  private async loadActiveSessions(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("user_sessions")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Failed to load active sessions:", error);
        return;
      }

      for (const sessionData of data || []) {
        this.activeSessions.set(sessionData.session_id, sessionData);
      }
    } catch (error) {
      console.error("Failed to load active sessions:", error);
    }
  }

  private async setupRealtimeMonitoring(): Promise<void> {
    try {
      // Subscribe to session changes
      this.supabase
        .channel("emergency_sessions")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_sessions",
          },
          (payload) => {
            this.handleSessionChange(payload);
          },
        )
        .subscribe();
    } catch (error) {
      console.error("Failed to setup realtime monitoring:", error);
    }
  }

  private async validateTerminationRequest(request: EmergencyTerminationRequest): Promise<void> {
    // Validate termination type and target
    switch (request.terminationType) {
      case "single_session":
        if (!this.activeSessions.has(request.targetIdentifier)) {
          throw new Error("Target session not found");
        }
        break;
      case "user_sessions": {
        // Validate user exists
        const { data: userData, error: userError } = await this.supabase
          .from("users")
          .select("id")
          .eq("id", request.targetIdentifier)
          .single();

        if (userError || !userData) {
          throw new Error("Target user not found");
        }
        break;
      }
      case "all_sessions":
        // No validation needed
        break;
      default:
        throw new Error("Invalid termination type");
    }

    // Validate initiator permissions
    if (!this.hasTerminationPermission(request.initiatorRole, request.terminationType)) {
      throw new Error("Insufficient permissions for termination type");
    }
  }

  private async checkRateLimits(initiatedBy: string): Promise<void> {
    if (!this.config.rateLimiting.enabled) {
      return;
    }

    const now = new Date();
    const tracker = this.rateLimitTracker.get(initiatedBy) || { count: 0, lastReset: now };

    // Reset counter if hour has passed
    if (now.getTime() - tracker.lastReset.getTime() > 60 * 60 * 1000) {
      tracker.count = 0;
      tracker.lastReset = now;
    }

    if (tracker.count >= this.config.rateLimiting.maxTerminationsPerHour) {
      throw new Error("Rate limit exceeded for termination requests");
    }

    tracker.count++;
    this.rateLimitTracker.set(initiatedBy, tracker);
  }

  private requiresApproval(request: EmergencyTerminationRequest): boolean {
    switch (request.terminationType) {
      case "single_session":
        return this.config.requireApproval.singleSession;
      case "user_sessions":
        return this.config.requireApproval.userSessions;
      case "all_sessions":
        return this.config.requireApproval.allSessions;
      case "device_sessions":
        return this.config.requireApproval.deviceSessions;
      case "role_sessions":
        return this.config.requireApproval.roleBasedSessions;
      default:
        return true;
    }
  }

  private async requestApproval(request: EmergencyTerminationRequest): Promise<TerminationResult> {
    // Store pending request
    this.pendingRequests.set(request.requestId, request);

    // Notify approvers
    await this.notifyApprovers(request);

    // Return pending result
    return {
      requestId: request.requestId,
      success: false,
      terminatedSessions: [],
      failedTerminations: [],
      totalAttempted: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      executionTime: 0,
      warnings: ["Termination request pending approval"],
      errors: [],
    };
  }

  private async executeTermination(
    request: EmergencyTerminationRequest,
  ): Promise<TerminationResult> {
    const result: TerminationResult = {
      requestId: request.requestId,
      success: true,
      terminatedSessions: [],
      failedTerminations: [],
      totalAttempted: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      executionTime: 0,
      warnings: [],
      errors: [],
    };

    try {
      // Get target sessions
      const targetSessions = await this.getTargetSessions(request);
      result.totalAttempted = targetSessions.length;

      // Terminate each session
      for (const session of targetSessions) {
        try {
          let preservationBackupId: string | undefined;

          // Create preservation backup if requested
          if (request.preserveData) {
            const backup = await this.sessionPreservation.createEmergencyBackup(
              session.session_id,
              `Emergency termination: ${request.reason}`,
            );
            preservationBackupId = backup.backupId;
          }

          // Terminate session
          await this.terminateSessionById(session.session_id);

          // Remove from active sessions
          this.activeSessions.delete(session.session_id);

          result.terminatedSessions.push({
            sessionId: session.session_id,
            userId: session.user_id,
            deviceId: session.device_id,
            terminatedAt: new Date(),
            preservationBackupId,
          });

          result.totalSuccessful++;
        } catch (error) {
          result.failedTerminations.push({
            sessionId: session.session_id,
            error: error.message,
          });

          result.totalFailed++;
        }
      }

      // Send notifications if requested
      if (request.notifyUsers) {
        await this.notifyAffectedUsers(result.terminatedSessions, request.reason);
      }

      result.success = result.totalFailed === 0;
    } catch (error) {
      result.success = false;
      result.errors.push(error.message);
    }

    return result;
  }

  private async getTargetSessions(request: EmergencyTerminationRequest): Promise<any[]> {
    let query = this.supabase.from("user_sessions").select("*").eq("is_active", true);

    switch (request.terminationType) {
      case "single_session":
        query = query.eq("session_id", request.targetIdentifier);
        break;
      case "user_sessions":
        query = query.eq("user_id", request.targetIdentifier);
        break;
      case "device_sessions":
        query = query.eq("device_id", request.targetIdentifier);
        break;
      case "role_sessions":
        query = query.eq("user_role", request.targetIdentifier);
        break;
      case "all_sessions":
        // No additional filter needed
        break;
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get target sessions: ${error.message}`);
    }

    return data || [];
  }

  private async terminateSessionById(sessionId: string): Promise<void> {
    try {
      // Mark session as inactive
      await this.supabase
        .from("user_sessions")
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          termination_reason: "emergency_termination",
        })
        .eq("session_id", sessionId);
    } catch (error) {
      console.error(`Failed to terminate session ${sessionId}:`, error);
      throw error;
    }
  }

  private async logTermination(
    request: EmergencyTerminationRequest,
    result: TerminationResult,
  ): Promise<void> {
    try {
      // Log each terminated session
      for (const terminatedSession of result.terminatedSessions) {
        const auditLog: Omit<TerminationAuditLog, "logId"> = {
          requestId: request.requestId,
          sessionId: terminatedSession.sessionId,
          userId: terminatedSession.userId,
          deviceId: terminatedSession.deviceId,
          initiatedBy: request.initiatedBy,
          initiatorRole: request.initiatorRole,
          terminationType: request.terminationType,
          reason: request.reason,
          severity: request.severity,
          terminatedAt: terminatedSession.terminatedAt,
          preservationBackupId: terminatedSession.preservationBackupId,
          success: true,
          ipAddress: request.metadata.ipAddress || "",
          userAgent: request.metadata.userAgent || "",
          metadata: request.metadata,
        };

        await this.storeAuditLog(auditLog);
      }

      // Log failed terminations
      for (const failedTermination of result.failedTerminations) {
        const session = this.activeSessions.get(failedTermination.sessionId);

        const auditLog: Omit<TerminationAuditLog, "logId"> = {
          requestId: request.requestId,
          sessionId: failedTermination.sessionId,
          userId: session?.user_id || "",
          deviceId: session?.device_id || "",
          initiatedBy: request.initiatedBy,
          initiatorRole: request.initiatorRole,
          terminationType: request.terminationType,
          reason: request.reason,
          severity: request.severity,
          terminatedAt: new Date(),
          success: false,
          errorMessage: failedTermination.error,
          ipAddress: request.metadata.ipAddress || "",
          userAgent: request.metadata.userAgent || "",
          metadata: request.metadata,
        };

        await this.storeAuditLog(auditLog);
      }
    } catch (error) {
      console.error("Failed to log termination:", error);
    }
  }

  private async storeAuditLog(auditLog: Omit<TerminationAuditLog, "logId">): Promise<void> {
    try {
      await this.supabase.from("termination_audit_logs").insert({
        log_id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        request_id: auditLog.requestId,
        session_id: auditLog.sessionId,
        user_id: auditLog.userId,
        device_id: auditLog.deviceId,
        initiated_by: auditLog.initiatedBy,
        initiator_role: auditLog.initiatorRole,
        termination_type: auditLog.terminationType,
        reason: auditLog.reason,
        severity: auditLog.severity,
        terminated_at: auditLog.terminatedAt.toISOString(),
        preservation_backup_id: auditLog.preservationBackupId,
        success: auditLog.success,
        error_message: auditLog.errorMessage,
        ip_address: auditLog.ipAddress,
        user_agent: auditLog.userAgent,
        metadata: auditLog.metadata,
      });
    } catch (error) {
      console.error("Failed to store audit log:", error);
    }
  }

  private async notifyApprovers(request: EmergencyTerminationRequest): Promise<void> {
    // Implementation for notifying approvers
    console.log(`Notifying approvers for termination request ${request.requestId}`);
  }

  private async notifyAffectedUsers(
    terminatedSessions: TerminationResult["terminatedSessions"],
    reason: string,
  ): Promise<void> {
    // Implementation for notifying affected users
    console.log(
      `Notifying ${terminatedSessions.length} affected users about session termination: ${reason}`,
    );
  }

  private async lockUserAccounts(userIds: string[]): Promise<void> {
    // Implementation for locking user accounts
    console.log(`Locking ${userIds.length} user accounts`);
  }

  private async disableNewLogins(): Promise<void> {
    // Implementation for disabling new logins
    console.log("Disabling new logins system-wide");
  }

  private async escalateToSecurity(
    request: EmergencyTerminationRequest,
    result: TerminationResult,
  ): Promise<void> {
    // Implementation for escalating to security team
    console.log(`Escalating emergency termination to security team: ${request.requestId}`);
  }

  private hasTerminationPermission(role: UserRole, terminationType: string): boolean {
    const permissions = {
      owner: [
        "single_session",
        "user_sessions",
        "all_sessions",
        "device_sessions",
        "role_sessions",
      ],
      manager: ["single_session", "user_sessions", "device_sessions"],
      employee: ["single_session"],
      patient: [],
    };

    return permissions[role]?.includes(terminationType) || false;
  }

  private handleSessionChange(payload: any): void {
    const sessionData = payload.new || payload.old;

    if (payload.eventType === "DELETE" || !sessionData.is_active) {
      this.activeSessions.delete(sessionData.session_id);
    } else {
      this.activeSessions.set(sessionData.session_id, sessionData);
    }
  }

  private mapDatabaseToProtocol(data: any): EmergencyProtocol {
    return {
      protocolId: data.protocol_id,
      name: data.name,
      description: data.description,
      triggerConditions: data.trigger_conditions,
      automaticTrigger: data.automatic_trigger,
      severity: data.severity,
      actions: data.actions,
      approvalRequired: data.approval_required,
      approverRoles: data.approver_roles,
      cooldownPeriod: data.cooldown_period,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      lastTriggered: data.last_triggered ? new Date(data.last_triggered) : undefined,
    };
  }

  private mapDatabaseToAuditLog(data: any): TerminationAuditLog {
    return {
      logId: data.log_id,
      requestId: data.request_id,
      sessionId: data.session_id,
      userId: data.user_id,
      deviceId: data.device_id,
      initiatedBy: data.initiated_by,
      initiatorRole: data.initiator_role,
      terminationType: data.termination_type,
      reason: data.reason,
      severity: data.severity,
      terminatedAt: new Date(data.terminated_at),
      preservationBackupId: data.preservation_backup_id,
      success: data.success,
      errorMessage: data.error_message,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      metadata: data.metadata || {},
    };
  }
}
