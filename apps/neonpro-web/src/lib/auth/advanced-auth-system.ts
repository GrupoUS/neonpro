// Advanced Authentication System - NeonPro
// Unified integration of all advanced authentication components
// Complete session management with security, monitoring, and compliance

import type { UserSession, SessionConfig, SessionMetrics } from "@/types/session";
import type { SessionConfig as Config } from "./config/session-config";
import type { SessionUtils } from "./utils/session-utils";
import type { IntelligentTimeoutManager } from "./timeout/intelligent-timeout";
import type { ConcurrentSessionManager } from "./concurrent/concurrent-session-manager";
import type { SuspiciousActivityDetector } from "./suspicious/suspicious-activity-detector";
import type { SecurityMonitor } from "./monitoring/security-monitor";
import type { SessionSyncManager } from "./sync/session-sync";
import type { SessionPreservationManager } from "./preservation/session-preservation";
import type { EmergencyShutdownManager } from "./emergency/emergency-shutdown";
import type { AuditTrailManager } from "./audit/audit-trail";
import type { DataCleanupManager } from "./cleanup/data-cleanup";

export interface AdvancedAuthConfig {
  // Core configuration
  sessionTimeout: number;
  maxConcurrentSessions: number;
  enableSuspiciousDetection: boolean;
  enableSecurityMonitoring: boolean;
  enableSessionSync: boolean;
  enableSessionPreservation: boolean;
  enableEmergencyShutdown: boolean;
  enableAuditTrail: boolean;
  enableDataCleanup: boolean;

  // Security settings
  securityLevel: "low" | "medium" | "high" | "maximum";
  anomalyThreshold: number;
  threatResponseLevel: "passive" | "active" | "aggressive";

  // Compliance settings
  complianceFrameworks: string[];
  dataRetentionPeriod: number;
  auditLevel: "basic" | "detailed" | "comprehensive";

  // Performance settings
  batchSize: number;
  cleanupInterval: number;
  monitoringInterval: number;

  // Integration settings
  websocketUrl?: string;
  encryptionKey?: string;
  notificationEndpoints?: string[];
}

export interface AuthSystemStatus {
  initialized: boolean;
  components: ComponentStatus[];
  metrics: SystemMetrics;
  health: HealthStatus;
  alerts: SystemAlert[];
}

export interface ComponentStatus {
  name: string;
  status: "healthy" | "warning" | "error" | "disabled";
  lastCheck: number;
  details: any;
}

export interface SystemMetrics {
  activeSessions: number;
  totalSessions: number;
  suspiciousActivities: number;
  securityThreats: number;
  cleanupOperations: number;
  auditEvents: number;
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  throughput: number;
}

export interface HealthStatus {
  overall: "healthy" | "degraded" | "critical";
  score: number;
  issues: HealthIssue[];
  recommendations: string[];
}

export interface HealthIssue {
  component: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  impact: string;
  resolution: string;
}

export interface SystemAlert {
  id: string;
  type: "security" | "performance" | "compliance" | "system";
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  details: any;
  timestamp: number;
  acknowledged: boolean;
  resolvedAt?: number;
}

export interface AuthSystemEvent {
  id: string;
  type: string;
  category: string;
  severity: string;
  timestamp: number;
  source: string;
  data: any;
}

export class AdvancedAuthSystem {
  private config: AdvancedAuthConfig;
  private sessionConfig: Config;
  private utils: SessionUtils;

  // Core components
  private timeoutManager: IntelligentTimeoutManager;
  private concurrentManager: ConcurrentSessionManager;
  private suspiciousDetector: SuspiciousActivityDetector;
  private securityMonitor: SecurityMonitor;
  private syncManager: SessionSyncManager;
  private preservationManager: SessionPreservationManager;
  private emergencyManager: EmergencyShutdownManager;
  private auditManager: AuditTrailManager;
  private cleanupManager: DataCleanupManager;

  // System state
  private isInitialized: boolean = false;
  private componentStatuses: Map<string, ComponentStatus> = new Map();
  private systemMetrics: SystemMetrics;
  private systemAlerts: SystemAlert[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;

  constructor(config: Partial<AdvancedAuthConfig> = {}) {
    // Initialize configuration with defaults
    this.config = {
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxConcurrentSessions: 5,
      enableSuspiciousDetection: true,
      enableSecurityMonitoring: true,
      enableSessionSync: true,
      enableSessionPreservation: true,
      enableEmergencyShutdown: true,
      enableAuditTrail: true,
      enableDataCleanup: true,
      securityLevel: "high",
      anomalyThreshold: 0.7,
      threatResponseLevel: "active",
      complianceFrameworks: ["LGPD", "GDPR"],
      dataRetentionPeriod: 365 * 24 * 60 * 60 * 1000, // 1 year
      auditLevel: "detailed",
      batchSize: 100,
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      monitoringInterval: 5 * 60 * 1000, // 5 minutes
      ...config,
    };

    // Initialize core dependencies
    this.sessionConfig = Config.getInstance();
    this.utils = new SessionUtils();

    // Initialize system metrics
    this.systemMetrics = {
      activeSessions: 0,
      totalSessions: 0,
      suspiciousActivities: 0,
      securityThreats: 0,
      cleanupOperations: 0,
      auditEvents: 0,
      performance: {
        averageResponseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
        throughput: 0,
      },
    };

    // Initialize components
    this.initializeComponents();
  }

  /**
   * Initialize all components
   */
  private initializeComponents(): void {
    try {
      // Core session management
      this.timeoutManager = new IntelligentTimeoutManager();
      this.concurrentManager = new ConcurrentSessionManager();

      // Security components
      if (this.config.enableSuspiciousDetection) {
        this.suspiciousDetector = new SuspiciousActivityDetector();
      }

      if (this.config.enableSecurityMonitoring) {
        this.securityMonitor = new SecurityMonitor();
      }

      // Sync and preservation
      if (this.config.enableSessionSync) {
        this.syncManager = new SessionSyncManager();
      }

      if (this.config.enableSessionPreservation) {
        this.preservationManager = new SessionPreservationManager();
      }

      // Emergency and compliance
      if (this.config.enableEmergencyShutdown) {
        this.emergencyManager = new EmergencyShutdownManager();
      }

      if (this.config.enableAuditTrail) {
        this.auditManager = new AuditTrailManager();
      }

      if (this.config.enableDataCleanup) {
        this.cleanupManager = new DataCleanupManager();
      }

      console.log("Advanced auth system components initialized");
    } catch (error) {
      console.error("Error initializing auth system components:", error);
      throw error;
    }
  }

  /**
   * Initialize the complete authentication system
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn("Advanced auth system already initialized");
      return;
    }

    try {
      console.log("Initializing advanced authentication system...");

      // Initialize core components in order
      await this.initializeCore();
      await this.initializeSecurity();
      await this.initializeSync();
      await this.initializeCompliance();

      // Setup component integration
      await this.setupComponentIntegration();

      // Start monitoring
      this.startSystemMonitoring();

      this.isInitialized = true;

      // Log system initialization
      if (this.auditManager) {
        await this.auditManager.logSystemEvent({
          action: "system_initialized",
          description: "Advanced authentication system initialized successfully",
          severity: "info",
          metadata: {
            config: this.config,
            components: Array.from(this.componentStatuses.keys()),
          },
        });
      }

      this.emit("system_initialized", { config: this.config });
      console.log("Advanced authentication system initialized successfully");
    } catch (error) {
      console.error("Error initializing advanced auth system:", error);

      // Log initialization failure
      if (this.auditManager) {
        await this.auditManager.logSystemEvent({
          action: "system_initialization_failed",
          description: `System initialization failed: ${error.message}`,
          severity: "critical",
          metadata: { error: error.message, stack: error.stack },
        });
      }

      throw error;
    }
  }

  /**
   * Initialize core components
   */
  private async initializeCore(): Promise<void> {
    console.log("Initializing core components...");

    // Initialize timeout manager
    await this.timeoutManager.initialize();
    this.updateComponentStatus("timeout_manager", "healthy", "Timeout manager initialized");

    // Initialize concurrent session manager
    await this.concurrentManager.initialize();
    this.updateComponentStatus(
      "concurrent_manager",
      "healthy",
      "Concurrent session manager initialized",
    );

    console.log("Core components initialized");
  }

  /**
   * Initialize security components
   */
  private async initializeSecurity(): Promise<void> {
    console.log("Initializing security components...");

    if (this.suspiciousDetector) {
      await this.suspiciousDetector.initialize();
      this.updateComponentStatus(
        "suspicious_detector",
        "healthy",
        "Suspicious activity detector initialized",
      );
    }

    if (this.securityMonitor) {
      await this.securityMonitor.initialize();
      this.updateComponentStatus("security_monitor", "healthy", "Security monitor initialized");
    }

    console.log("Security components initialized");
  }

  /**
   * Initialize sync components
   */
  private async initializeSync(): Promise<void> {
    console.log("Initializing sync components...");

    if (this.syncManager) {
      await this.syncManager.initialize({
        websocketUrl: this.config.websocketUrl || "ws://localhost:8080/sync",
      });
      this.updateComponentStatus("sync_manager", "healthy", "Session sync manager initialized");
    }

    if (this.preservationManager) {
      await this.preservationManager.initialize();
      this.updateComponentStatus(
        "preservation_manager",
        "healthy",
        "Session preservation manager initialized",
      );
    }

    console.log("Sync components initialized");
  }

  /**
   * Initialize compliance components
   */
  private async initializeCompliance(): Promise<void> {
    console.log("Initializing compliance components...");

    if (this.emergencyManager) {
      await this.emergencyManager.initialize();
      this.updateComponentStatus(
        "emergency_manager",
        "healthy",
        "Emergency shutdown manager initialized",
      );
    }

    if (this.auditManager) {
      await this.auditManager.initialize();
      this.updateComponentStatus("audit_manager", "healthy", "Audit trail manager initialized");
    }

    if (this.cleanupManager) {
      await this.cleanupManager.initialize();
      this.updateComponentStatus("cleanup_manager", "healthy", "Data cleanup manager initialized");
    }

    console.log("Compliance components initialized");
  }

  /**
   * Setup component integration
   */
  private async setupComponentIntegration(): Promise<void> {
    console.log("Setting up component integration...");

    // Integrate suspicious activity detector with security monitor
    if (this.suspiciousDetector && this.securityMonitor) {
      this.suspiciousDetector.on("anomaly_detected", async (event) => {
        await this.securityMonitor.processAnomaly(event);
      });
    }

    // Integrate security monitor with emergency manager
    if (this.securityMonitor && this.emergencyManager) {
      this.securityMonitor.on("critical_threat", async (threat) => {
        if (threat.severity === "critical") {
          await this.emergencyManager.triggerEmergency({
            type: "security_threat",
            severity: "critical",
            trigger: "automated_security_monitor",
            reason: threat.description,
            affectedSessions: threat.affectedSessions,
            actions: ["terminate_sessions", "block_ips", "notify_admins"],
            metadata: threat,
          });
        }
      });
    }

    // Integrate timeout manager with preservation
    if (this.timeoutManager && this.preservationManager) {
      this.timeoutManager.on("session_warning", async (event) => {
        await this.preservationManager.createSnapshot(event.sessionId, {
          reason: "timeout_warning",
          preserveFormData: true,
          preserveNavigationState: true,
        });
      });
    }

    // Integrate all components with audit manager
    if (this.auditManager) {
      const components = [
        this.timeoutManager,
        this.concurrentManager,
        this.suspiciousDetector,
        this.securityMonitor,
        this.syncManager,
        this.preservationManager,
        this.emergencyManager,
        this.cleanupManager,
      ].filter(Boolean);

      components.forEach((component) => {
        if (component && typeof component.on === "function") {
          component.on("*", async (event: any) => {
            await this.auditManager.logEvent({
              type: "component_event",
              category: "system",
              severity: event.severity || "info",
              action: event.action || "unknown",
              description: event.description || "Component event",
              actor: { type: "system", id: event.source || "unknown" },
              target: event.target || { type: "system", id: "auth_system" },
              context: event.context || {},
              metadata: event.metadata || {},
            });
          });
        }
      });
    }

    console.log("Component integration setup completed");
  }

  /**
   * Start system monitoring
   */
  private startSystemMonitoring(): void {
    // Health check interval
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error("Error during health check:", error);
      }
    }, this.config.monitoringInterval);

    // Metrics collection interval
    this.metricsInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error("Error collecting metrics:", error);
      }
    }, this.config.monitoringInterval / 2);

    console.log("System monitoring started");
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    const components = [
      { name: "timeout_manager", instance: this.timeoutManager },
      { name: "concurrent_manager", instance: this.concurrentManager },
      { name: "suspicious_detector", instance: this.suspiciousDetector },
      { name: "security_monitor", instance: this.securityMonitor },
      { name: "sync_manager", instance: this.syncManager },
      { name: "preservation_manager", instance: this.preservationManager },
      { name: "emergency_manager", instance: this.emergencyManager },
      { name: "audit_manager", instance: this.auditManager },
      { name: "cleanup_manager", instance: this.cleanupManager },
    ];

    for (const { name, instance } of components) {
      if (instance && typeof instance.healthCheck === "function") {
        try {
          const health = await instance.healthCheck();
          this.updateComponentStatus(
            name,
            health.status === "healthy" ? "healthy" : "warning",
            health.details || "Health check completed",
          );
        } catch (error) {
          this.updateComponentStatus(name, "error", `Health check failed: ${error.message}`);
        }
      }
    }
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      // Collect metrics from components
      const metrics = {
        activeSessions: 0,
        totalSessions: 0,
        suspiciousActivities: 0,
        securityThreats: 0,
        cleanupOperations: 0,
        auditEvents: 0,
        performance: {
          averageResponseTime: 0,
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
          cpuUsage: 0,
          errorRate: 0,
          throughput: 0,
        },
      };

      // Get metrics from concurrent manager
      if (this.concurrentManager) {
        const concurrentMetrics = await this.concurrentManager.getMetrics();
        metrics.activeSessions = concurrentMetrics.activeSessions || 0;
        metrics.totalSessions = concurrentMetrics.totalSessions || 0;
      }

      // Get metrics from suspicious detector
      if (this.suspiciousDetector) {
        const suspiciousMetrics = await this.suspiciousDetector.getMetrics();
        metrics.suspiciousActivities = suspiciousMetrics.anomaliesDetected || 0;
      }

      // Get metrics from security monitor
      if (this.securityMonitor) {
        const securityMetrics = await this.securityMonitor.getMetrics();
        metrics.securityThreats = securityMetrics.activeThreats || 0;
      }

      // Get metrics from cleanup manager
      if (this.cleanupManager) {
        const cleanupMetrics = (await this.cleanupManager.getMetrics?.()) || {};
        metrics.cleanupOperations = cleanupMetrics.totalOperations || 0;
      }

      // Get metrics from audit manager
      if (this.auditManager) {
        const auditMetrics = await this.auditManager.getMetrics();
        metrics.auditEvents = auditMetrics.totalEvents || 0;
      }

      this.systemMetrics = metrics;

      // Emit metrics update
      this.emit("metrics_updated", metrics);
    } catch (error) {
      console.error("Error collecting metrics:", error);
    }
  }

  /**
   * Update component status
   */
  private updateComponentStatus(
    name: string,
    status: "healthy" | "warning" | "error" | "disabled",
    details: any,
  ): void {
    this.componentStatuses.set(name, {
      name,
      status,
      lastCheck: Date.now(),
      details,
    });
  }

  /**
   * Session management methods
   */
  public async createSession(userId: string, deviceInfo: any): Promise<UserSession> {
    try {
      // Check concurrent sessions
      if (this.concurrentManager) {
        const canCreate = await this.concurrentManager.canCreateSession(userId, deviceInfo);
        if (!canCreate.allowed) {
          throw new Error(`Session creation denied: ${canCreate.reason}`);
        }
      }

      // Create session
      const session = await this.sessionConfig.createSession(userId, deviceInfo);

      // Initialize timeout
      if (this.timeoutManager) {
        await this.timeoutManager.initializeSession(session.id, {
          userId: session.userId,
          role: session.role,
          timeout: this.config.sessionTimeout,
        });
      }

      // Register with concurrent manager
      if (this.concurrentManager) {
        await this.concurrentManager.registerSession(session);
      }

      // Start monitoring
      if (this.suspiciousDetector) {
        await this.suspiciousDetector.startMonitoring(session.id, userId);
      }

      // Create preservation snapshot
      if (this.preservationManager) {
        await this.preservationManager.createSnapshot(session.id, {
          reason: "session_created",
          preserveAuthState: true,
        });
      }

      // Log session creation
      if (this.auditManager) {
        await this.auditManager.logAuthenticationEvent({
          action: "session_created",
          userId,
          sessionId: session.id,
          deviceInfo,
          success: true,
        });
      }

      this.emit("session_created", { session, userId, deviceInfo });
      return session;
    } catch (error) {
      // Log failed session creation
      if (this.auditManager) {
        await this.auditManager.logAuthenticationEvent({
          action: "session_creation_failed",
          userId,
          deviceInfo,
          success: false,
          error: error.message,
        });
      }

      throw error;
    }
  }

  public async validateSession(sessionId: string): Promise<UserSession | null> {
    try {
      // Get session
      const session = await this.sessionConfig.getSession(sessionId);
      if (!session) {
        return null;
      }

      // Check timeout
      if (this.timeoutManager) {
        const isValid = await this.timeoutManager.checkSession(sessionId);
        if (!isValid) {
          await this.terminateSession(sessionId, "timeout");
          return null;
        }
      }

      // Check concurrent sessions
      if (this.concurrentManager) {
        const isValid = await this.concurrentManager.validateSession(sessionId);
        if (!isValid) {
          await this.terminateSession(sessionId, "concurrent_violation");
          return null;
        }
      }

      // Update activity
      if (this.timeoutManager) {
        await this.timeoutManager.updateActivity(sessionId);
      }

      if (this.suspiciousDetector) {
        await this.suspiciousDetector.recordActivity(sessionId, {
          type: "session_validation",
          timestamp: Date.now(),
        });
      }

      return session;
    } catch (error) {
      console.error("Error validating session:", error);
      return null;
    }
  }

  public async terminateSession(sessionId: string, reason: string): Promise<void> {
    try {
      const session = await this.sessionConfig.getSession(sessionId);

      // Create final preservation snapshot
      if (this.preservationManager && session) {
        await this.preservationManager.createSnapshot(sessionId, {
          reason: `session_terminated_${reason}`,
          preserveAll: true,
        });
      }

      // Stop monitoring
      if (this.suspiciousDetector) {
        await this.suspiciousDetector.stopMonitoring(sessionId);
      }

      // Remove from timeout manager
      if (this.timeoutManager) {
        await this.timeoutManager.removeSession(sessionId);
      }

      // Remove from concurrent manager
      if (this.concurrentManager) {
        await this.concurrentManager.removeSession(sessionId);
      }

      // Terminate session
      await this.sessionConfig.terminateSession(sessionId);

      // Log session termination
      if (this.auditManager && session) {
        await this.auditManager.logSessionEvent({
          action: "session_terminated",
          sessionId,
          userId: session.userId,
          reason,
          duration: Date.now() - session.createdAt,
        });
      }

      this.emit("session_terminated", { sessionId, reason });
    } catch (error) {
      console.error("Error terminating session:", error);
      throw error;
    }
  }

  /**
   * Security methods
   */
  public async reportSuspiciousActivity(sessionId: string, activity: any): Promise<void> {
    if (this.suspiciousDetector) {
      await this.suspiciousDetector.recordActivity(sessionId, activity);
    }
  }

  public async triggerEmergencyShutdown(
    reason: string,
    scope: "user" | "system" | "global" = "system",
  ): Promise<void> {
    if (this.emergencyManager) {
      await this.emergencyManager.triggerEmergency({
        type: "manual_trigger",
        severity: "critical",
        trigger: "admin_request",
        reason,
        actions: ["terminate_sessions", "notify_admins", "log_incident"],
        metadata: { scope, timestamp: Date.now() },
      });
    }
  }

  /**
   * System status and monitoring
   */
  public getSystemStatus(): AuthSystemStatus {
    const components = Array.from(this.componentStatuses.values());
    const healthIssues: HealthIssue[] = [];

    // Analyze component health
    components.forEach((component) => {
      if (component.status === "error") {
        healthIssues.push({
          component: component.name,
          severity: "high",
          description: `Component ${component.name} is in error state`,
          impact: "Reduced functionality",
          resolution: "Check component logs and restart if necessary",
        });
      } else if (component.status === "warning") {
        healthIssues.push({
          component: component.name,
          severity: "medium",
          description: `Component ${component.name} has warnings`,
          impact: "Potential performance degradation",
          resolution: "Monitor component and investigate warnings",
        });
      }
    });

    // Calculate overall health
    const healthyComponents = components.filter((c) => c.status === "healthy").length;
    const totalComponents = components.length;
    const healthScore = totalComponents > 0 ? (healthyComponents / totalComponents) * 100 : 0;

    let overallHealth: "healthy" | "degraded" | "critical";
    if (healthScore >= 90) {
      overallHealth = "healthy";
    } else if (healthScore >= 70) {
      overallHealth = "degraded";
    } else {
      overallHealth = "critical";
    }

    return {
      initialized: this.isInitialized,
      components,
      metrics: this.systemMetrics,
      health: {
        overall: overallHealth,
        score: healthScore,
        issues: healthIssues,
        recommendations: this.generateRecommendations(healthIssues),
      },
      alerts: this.systemAlerts.filter((alert) => !alert.acknowledged),
    };
  }

  private generateRecommendations(issues: HealthIssue[]): string[] {
    const recommendations: string[] = [];

    if (issues.some((i) => i.severity === "critical")) {
      recommendations.push("Immediate attention required for critical issues");
    }

    if (issues.length > 3) {
      recommendations.push("Consider system maintenance to address multiple issues");
    }

    if (this.systemMetrics.performance.errorRate > 0.05) {
      recommendations.push("High error rate detected, investigate system stability");
    }

    if (this.systemMetrics.performance.memoryUsage > 500) {
      recommendations.push("High memory usage detected, consider optimization");
    }

    return recommendations;
  }

  public getMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  public getAlerts(): SystemAlert[] {
    return [...this.systemAlerts];
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.systemAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Configuration management
   */
  public updateConfig(updates: Partial<AdvancedAuthConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit("config_updated", { config: this.config, updates });
  }

  public getConfig(): AdvancedAuthConfig {
    return { ...this.config };
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
   * Shutdown system
   */
  public async shutdown(): Promise<void> {
    try {
      console.log("Shutting down advanced authentication system...");

      // Stop monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
      }

      // Shutdown components in reverse order
      const shutdownPromises = [];

      if (this.cleanupManager) {
        shutdownPromises.push(this.cleanupManager.shutdown());
      }
      if (this.auditManager) {
        shutdownPromises.push(this.auditManager.shutdown());
      }
      if (this.emergencyManager) {
        shutdownPromises.push(this.emergencyManager.shutdown());
      }
      if (this.preservationManager) {
        shutdownPromises.push(this.preservationManager.shutdown());
      }
      if (this.syncManager) {
        shutdownPromises.push(this.syncManager.shutdown());
      }
      if (this.securityMonitor) {
        shutdownPromises.push(this.securityMonitor.shutdown());
      }
      if (this.suspiciousDetector) {
        shutdownPromises.push(this.suspiciousDetector.shutdown());
      }
      if (this.concurrentManager) {
        shutdownPromises.push(this.concurrentManager.shutdown());
      }
      if (this.timeoutManager) {
        shutdownPromises.push(this.timeoutManager.shutdown());
      }

      await Promise.allSettled(shutdownPromises);

      // Clear state
      this.componentStatuses.clear();
      this.systemAlerts = [];
      this.eventListeners.clear();
      this.isInitialized = false;

      console.log("Advanced authentication system shutdown completed");
    } catch (error) {
      console.error("Error during system shutdown:", error);
      throw error;
    }
  }
}

// Export singleton instance
let authSystemInstance: AdvancedAuthSystem | null = null;

export function getAdvancedAuthSystem(config?: Partial<AdvancedAuthConfig>): AdvancedAuthSystem {
  if (!authSystemInstance) {
    authSystemInstance = new AdvancedAuthSystem(config);
  }
  return authSystemInstance;
}

export function resetAdvancedAuthSystem(): void {
  if (authSystemInstance) {
    authSystemInstance.shutdown().catch(console.error);
    authSystemInstance = null;
  }
}

export default AdvancedAuthSystem;
