/**
 * Immutable Audit Logger - Constitutional Audit Trail System
 *
 * High-performance (<10ms per event) immutable audit logging system with
 * blockchain verification for NeonPro AI Healthcare Platform.
 *
 * Features:
 * - Cryptographic immutability with hash chains
 * - Healthcare compliance (LGPD, ANVISA, CFM, HIPAA)
 * - Real-time audit event processing
 * - Blockchain verification integration
 * - Performance-optimized batching and buffering
 * - Constitutional governance integration
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";

// Audit event schemas
const AuditEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string(),
  eventType: z.string(),
  serviceId: z.string(),
  userId: z.string().optional(),
  patientId: z.string().optional(),
  tenantId: z.string().optional(),
  sessionId: z.string().optional(),
  operationType: z.enum([
    "CREATE",
    "READ",
    "UPDATE",
    "DELETE",
    "EXECUTE",
    "ACCESS",
  ]),
  resourceType: z.string(),
  resourceId: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  metadata: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
      geolocation: z.string().optional(),
      deviceId: z.string().optional(),
      correlationId: z.string().optional(),
      environment: z.enum(["development", "staging", "production"]).optional(),
    })
    .optional(),
  complianceFrameworks: z.array(z.enum(["LGPD", "ANVISA", "CFM", "HIPAA"])),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  category: z.enum([
    "SECURITY",
    "DATA_ACCESS",
    "MEDICAL_PROCEDURE",
    "COMPLIANCE",
    "SYSTEM",
    "USER_ACTION",
  ]),
  hash: z.string().optional(),
  previousHash: z.string().optional(),
  blockchainTxId: z.string().optional(),
  verified: z.boolean().default(false),
});

const AuditConfigSchema = z.object({
  supabaseUrl: z.string(),
  supabaseServiceKey: z.string(),
  enableBlockchainVerification: z.boolean().default(true),
  enableRealTimeIndexing: z.boolean().default(true),
  batchSize: z.number().int().min(1).max(1000).default(100),
  batchTimeout: z.number().int().min(100).max(30_000).default(5000), // 5 seconds
  retentionDays: z.number().int().min(30).default(2555), // 7 years for healthcare
  performanceTarget: z.number().min(1).max(100).default(10), // 10ms target
  encryptionEnabled: z.boolean().default(true),
  compressEvents: z.boolean().default(true),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditConfig = z.infer<typeof AuditConfigSchema>;

export interface AuditMetrics {
  totalEvents: number;
  averageProcessingTime: number;
  maxProcessingTime: number;
  eventsPerSecond: number;
  blockchainVerificationRate: number;
  bufferUtilization: number;
  errorRate: number;
  complianceScore: number;
}

export interface ImmutableChain {
  id: string;
  chainId: string;
  blockNumber: number;
  previousBlockHash: string;
  currentBlockHash: string;
  events: AuditEvent[];
  timestamp: string;
  verified: boolean;
}

/**
 * High-Performance Immutable Audit Logger
 *
 * Provides cryptographically secure audit logging with constitutional governance
 * integration and healthcare compliance automation.
 */
export class ImmutableAuditLogger {
  private readonly config: AuditConfig;
  private readonly supabase: SupabaseClient;

  // Performance optimization
  private readonly eventBuffer: AuditEvent[] = [];
  private readonly metricsBuffer: {
    timestamp: number;
    processingTime: number;
  }[] = [];
  private batchTimer: NodeJS.Timeout | null = undefined;

  // Immutable chain state
  private currentChainHash = "0";
  private blockNumber = 0;
  private chainId: string;

  // Performance metrics
  private totalEvents = 0;
  private totalProcessingTime = 0;
  private maxProcessingTime = 0;
  private errorCount = 0;
  private verificationCount = 0;

  // Real-time monitoring
  private readonly performanceInterval: NodeJS.Timeout;

  constructor(config: AuditConfig) {
    this.config = AuditConfigSchema.parse(config);
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    this.chainId = randomUUID();

    // Initialize performance monitoring
    this.performanceInterval = setInterval(() => {
      this.monitorPerformance();
    }, 30_000); // Monitor every 30 seconds

    this.initializeAuditLogger();
  }

  /**
   * Initialize audit logger and load chain state
   */
  private async initializeAuditLogger(): Promise<void> {
    try {
      // Load latest chain state from Supabase
      await this.loadChainState();

      // Initialize database tables if needed
      await this.ensureAuditTables();

      // console.log("✅ Immutable Audit Logger initialized successfully");
      // console.log(`🔗 Chain ID: ${this.chainId}`);
      // console.log(`📊 Performance target: <${this.config.performanceTarget}ms per event`);
    } catch (error) {
      // console.error("❌ Failed to initialize Immutable Audit Logger:", error);
      throw error;
    }
  }

  /**
   * Log audit event with constitutional compliance
   */
  public async logEvent(
    event: Omit<AuditEvent, "id" | "timestamp" | "hash" | "previousHash">,
  ): Promise<string> {
    const startTime = performance.now();

    try {
      // Generate unique event ID and timestamp
      const auditEvent: AuditEvent = {
        ...event,
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        hash: "",
        previousHash: this.currentChainHash,
        verified: false,
      };

      // Generate cryptographic hash for immutability
      auditEvent.hash = this.generateEventHash(auditEvent);

      // Validate event structure
      const validatedEvent = AuditEventSchema.parse(auditEvent);

      // Add to buffer for batch processing
      this.eventBuffer.push(validatedEvent);

      // Immediate processing for critical events
      if (validatedEvent.severity === "CRITICAL") {
        await this.flushBuffer(true);
      } // Batch processing for performance
      else if (this.eventBuffer.length >= this.config.batchSize) {
        await this.flushBuffer();
      } // Set timer for batch timeout
      else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.flushBuffer();
        }, this.config.batchTimeout);
      }

      // Record performance metrics
      const processingTime = performance.now() - startTime;
      this.recordPerformanceMetrics(processingTime);

      // Performance monitoring
      if (processingTime > this.config.performanceTarget) {
        // console.warn(
        //   `⚠️ Audit event processing exceeded target: ${
        //     processingTime.toFixed(2)
        //   }ms > ${this.config.performanceTarget}ms`,
        // );
      }

      return validatedEvent.id;
    } catch (error) {
      this.errorCount++;
      const processingTime = performance.now() - startTime;
      this.recordPerformanceMetrics(processingTime);

      // console.error("❌ Failed to log audit event:", error);
      throw error;
    }
  }

  /**
   * Log healthcare-specific audit event
   */
  public async logHealthcareEvent(event: {
    eventType: string;
    serviceId: string;
    userId?: string;
    patientId?: string;
    operationType:
      | "CREATE"
      | "READ"
      | "UPDATE"
      | "DELETE"
      | "EXECUTE"
      | "ACCESS";
    resourceType: string;
    resourceId?: string;
    payload?: Record<string, unknown>;
    medicalContext?: {
      procedureType?: string;
      diagnosisCode?: string;
      treatmentId?: string;
      prescriptionId?: string;
      aiPredictionId?: string;
    };
  }): Promise<string> {
    // Determine compliance frameworks based on event type
    const complianceFrameworks: ("LGPD" | "ANVISA" | "CFM" | "HIPAA")[] = [
      "LGPD",
    ];

    if (event.medicalContext?.procedureType) {
      complianceFrameworks.push("ANVISA", "CFM");
    }

    if (event.patientId) {
      complianceFrameworks.push("HIPAA");
    }

    // Determine severity based on operation and context
    let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";

    if (
      event.operationType === "DELETE" ||
      event.medicalContext?.aiPredictionId
    ) {
      severity = "HIGH";
    }

    if (
      event.medicalContext?.procedureType &&
      ["EXECUTE", "UPDATE"].includes(event.operationType)
    ) {
      severity = "CRITICAL";
    }

    return this.logEvent({
      ...event,
      complianceFrameworks,
      severity,
      category: "MEDICAL_PROCEDURE",
      metadata: {
        environment:
          (process.env.NODE_ENV as "development" | "staging" | "production") ||
          "development",
        correlationId: event.payload?.correlationId as string,
        ...event.medicalContext,
      },
    });
  }

  /**
   * Generate cryptographic hash for event immutability
   */
  private generateEventHash(event: Omit<AuditEvent, "hash">): string {
    const hashInput = JSON.stringify({
      id: event.id,
      timestamp: event.timestamp,
      eventType: event.eventType,
      serviceId: event.serviceId,
      userId: event.userId,
      patientId: event.patientId,
      operationType: event.operationType,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      payload: event.payload,
      previousHash: event.previousHash,
    });

    return createHash("sha256").update(hashInput).digest("hex");
  }

  /**
   * Flush event buffer to persistent storage
   */
  private async flushBuffer(forceCritical = false): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer.length = 0; // Clear buffer

    // Clear batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    try {
      // Create immutable block
      const block = await this.createImmutableBlock(events);

      // Store in Supabase
      await this.storeAuditBlock(block);

      // Update chain state
      this.currentChainHash = block.currentBlockHash;
      this.blockNumber++;

      // Blockchain verification for critical events
      if (forceCritical || events.some((e) => e.severity === "CRITICAL")) {
        await this.scheduleBlockchainVerification(block);
      }

      // console.log(
      //   `📝 Flushed audit block ${block.blockNumber} with ${events.length} events`,
      // );
    } catch (error) {
      // console.error("❌ Failed to flush audit buffer:", error);

      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...events);
      throw error;
    }
  }

  /**
   * Create immutable block from events
   */
  private async createImmutableBlock(
    events: AuditEvent[],
  ): Promise<ImmutableChain> {
    const blockId = randomUUID();
    const timestamp = new Date().toISOString();

    // Create block hash from events and previous hash
    const blockContent = {
      chainId: this.chainId,
      blockNumber: this.blockNumber + 1,
      previousBlockHash: this.currentChainHash,
      timestamp,
      events: events.map((e) => e.id).sort(), // Only IDs for block hash
    };

    const currentBlockHash = createHash("sha256")
      .update(JSON.stringify(blockContent))
      .digest("hex");

    return {
      id: blockId,
      chainId: this.chainId,
      blockNumber: this.blockNumber + 1,
      previousBlockHash: this.currentChainHash,
      currentBlockHash,
      events,
      timestamp,
      verified: false,
    };
  }

  /**
   * Store audit block in Supabase
   */
  private async storeAuditBlock(block: ImmutableChain): Promise<void> {
    // Store block metadata
    const { error: blockError } = await this.supabase
      .from("audit_blocks")
      .insert({
        id: block.id,
        chain_id: block.chainId,
        block_number: block.blockNumber,
        previous_block_hash: block.previousBlockHash,
        current_block_hash: block.currentBlockHash,
        event_count: block.events.length,
        timestamp: block.timestamp,
        verified: block.verified,
      });

    if (blockError) {
      throw new Error(`Failed to store audit block: ${blockError.message}`);
    }

    // Store individual events
    const eventRecords = block.events.map((event) => ({
      id: event.id,
      block_id: block.id,
      timestamp: event.timestamp,
      event_type: event.eventType,
      service_id: event.serviceId,
      user_id: event.userId,
      patient_id: event.patientId,
      tenant_id: event.tenantId,
      session_id: event.sessionId,
      operation_type: event.operationType,
      resource_type: event.resourceType,
      resource_id: event.resourceId,
      payload: event.payload,
      metadata: event.metadata,
      compliance_frameworks: event.complianceFrameworks,
      severity: event.severity,
      category: event.category,
      hash: event.hash,
      previous_hash: event.previousHash,
      blockchain_tx_id: event.blockchainTxId,
      verified: event.verified,
    }));

    const { error: eventsError } = await this.supabase
      .from("audit_events")
      .insert(eventRecords);

    if (eventsError) {
      throw new Error(`Failed to store audit events: ${eventsError.message}`);
    }
  }

  /**
   * Schedule blockchain verification
   */
  private async scheduleBlockchainVerification(
    block: ImmutableChain,
  ): Promise<void> {
    try {
      // Add to blockchain verification queue
      await this.supabase.from("blockchain_verification_queue").insert({
        block_id: block.id,
        block_hash: block.currentBlockHash,
        priority: block.events.some((e) => e.severity === "CRITICAL")
          ? "HIGH"
          : "MEDIUM",
        scheduled_at: new Date().toISOString(),
        status: "PENDING",
      });

      this.verificationCount++;
    } catch (error) {
      // console.error("❌ Failed to schedule blockchain verification:", error);
    }
  }

  /**
   * Load chain state from database
   */
  private async loadChainState(): Promise<void> {
    try {
      const { data: latestBlock } = await this.supabase
        .from("audit_blocks")
        .select("block_number, current_block_hash")
        .eq("chain_id", this.chainId)
        .order("block_number", { ascending: false })
        .limit(1)
        .single();

      if (latestBlock) {
        this.blockNumber = latestBlock.block_number;
        this.currentChainHash = latestBlock.current_block_hash;

        // console.log(
        //   `🔗 Loaded chain state: Block ${this.blockNumber}, Hash ${
        //     this.currentChainHash.slice(0, 8)
        //   }...`,
        // );
      }
    } catch {
      // console.log("🔗 Starting new audit chain");
    }
  }

  /**
   * Ensure audit tables exist in Supabase
   */
  private async ensureAuditTables(): Promise<void> {
    // This would typically be handled by database migrations
    // For now, we'll assume tables exist or log a warning

    try {
      const { data, error } = await this.supabase
        .from("audit_events")
        .select("count")
        .limit(1);

      if (error && error.code === "PGRST116") {
        // console.warn(
        //   "⚠️ Audit tables may not exist. Please run database migrations.",
        // );
      }
    } catch (error) {
      // console.warn("⚠️ Could not verify audit table existence:", error);
    }
  }

  /**
   * Record performance metrics
   */
  private recordPerformanceMetrics(processingTime: number): void {
    this.totalEvents++;
    this.totalProcessingTime += processingTime;
    this.maxProcessingTime = Math.max(this.maxProcessingTime, processingTime);

    // Keep rolling window of recent performance
    this.metricsBuffer.push({
      timestamp: Date.now(),
      processingTime,
    });

    // Keep only last 1000 entries
    if (this.metricsBuffer.length > 1000) {
      this.metricsBuffer.splice(0, 100);
    }
  }

  /**
   * Monitor performance and alert on issues
   */
  private monitorPerformance(): void {
    const metrics = this.getPerformanceMetrics();

    // Alert on performance degradation
    if (metrics.averageProcessingTime > this.config.performanceTarget * 2) {
      // console.warn(
      //   `🚨 Performance degradation detected: ${
      //     metrics.averageProcessingTime.toFixed(2)
      //   }ms average`,
      // );
    }

    // Alert on high error rate
    if (metrics.errorRate > 0.05) {
      // 5%
      // console.warn(
      //   `🚨 High error rate detected: ${(metrics.errorRate * 100).toFixed(2)}%`,
      // );
    }

    // Alert on buffer buildup
    if (metrics.bufferUtilization > 0.8) {
      // 80%
      // console.warn(
      //   `🚨 High buffer utilization: ${(metrics.bufferUtilization * 100).toFixed(1)}%`,
      // );
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): AuditMetrics {
    const recentMetrics = this.metricsBuffer.filter(
      (m) => Date.now() - m.timestamp < 300_000, // Last 5 minutes
    );

    const averageProcessingTime =
      this.totalEvents > 0 ? this.totalProcessingTime / this.totalEvents : 0;

    const eventsPerSecond =
      recentMetrics.length > 0 ? recentMetrics.length / 300 : 0;

    const errorRate =
      this.totalEvents > 0 ? this.errorCount / this.totalEvents : 0;

    const blockchainVerificationRate =
      this.totalEvents > 0 ? this.verificationCount / this.totalEvents : 0;

    const bufferUtilization = this.eventBuffer.length / this.config.batchSize;

    // Calculate compliance score based on verification and error rates
    const complianceScore = Math.max(
      0,
      100 -
        errorRate * 100 -
        Math.max(0, averageProcessingTime - this.config.performanceTarget) * 2,
    );

    return {
      totalEvents: this.totalEvents,
      averageProcessingTime,
      maxProcessingTime: this.maxProcessingTime,
      eventsPerSecond,
      blockchainVerificationRate,
      bufferUtilization,
      errorRate,
      complianceScore,
    };
  }

  /**
   * Query audit events with constitutional compliance filters
   */
  public async queryEvents(query: {
    startDate?: string;
    endDate?: string;
    serviceId?: string;
    userId?: string;
    patientId?: string;
    eventType?: string;
    operationType?: string;
    severity?: string;
    category?: string;
    complianceFramework?: "LGPD" | "ANVISA" | "CFM" | "HIPAA";
    verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    events: AuditEvent[];
    totalCount: number;
    complianceStatus: {
      framework: string;
      compliantEvents: number;
      totalEvents: number;
      complianceRate: number;
    }[];
  }> {
    let supabaseQuery = this.supabase
      .from("audit_events")
      .select("*", { count: "exact" });

    // Apply filters
    if (query.startDate) {
      supabaseQuery = supabaseQuery.gte("timestamp", query.startDate);
    }

    if (query.endDate) {
      supabaseQuery = supabaseQuery.lte("timestamp", query.endDate);
    }

    if (query.serviceId) {
      supabaseQuery = supabaseQuery.eq("service_id", query.serviceId);
    }

    if (query.userId) {
      supabaseQuery = supabaseQuery.eq("user_id", query.userId);
    }

    if (query.patientId) {
      supabaseQuery = supabaseQuery.eq("patient_id", query.patientId);
    }

    if (query.eventType) {
      supabaseQuery = supabaseQuery.eq("event_type", query.eventType);
    }

    if (query.operationType) {
      supabaseQuery = supabaseQuery.eq("operation_type", query.operationType);
    }

    if (query.severity) {
      supabaseQuery = supabaseQuery.eq("severity", query.severity);
    }

    if (query.category) {
      supabaseQuery = supabaseQuery.eq("category", query.category);
    }

    if (query.complianceFramework) {
      supabaseQuery = supabaseQuery.contains("compliance_frameworks", [
        query.complianceFramework,
      ]);
    }

    if (query.verified !== undefined) {
      supabaseQuery = supabaseQuery.eq("verified", query.verified);
    }

    // Pagination
    supabaseQuery = supabaseQuery
      .order("timestamp", { ascending: false })
      .range(query.offset || 0, (query.offset || 0) + (query.limit || 100) - 1);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      throw new Error(`Failed to query audit events: ${error.message}`);
    }

    const events = (data || []).map((record) =>
      AuditEventSchema.parse({
        id: record.id,
        timestamp: record.timestamp,
        eventType: record.event_type,
        serviceId: record.service_id,
        userId: record.user_id,
        patientId: record.patient_id,
        tenantId: record.tenant_id,
        sessionId: record.session_id,
        operationType: record.operation_type,
        resourceType: record.resource_type,
        resourceId: record.resource_id,
        payload: record.payload,
        metadata: record.metadata,
        complianceFrameworks: record.compliance_frameworks,
        severity: record.severity,
        category: record.category,
        hash: record.hash,
        previousHash: record.previous_hash,
        blockchainTxId: record.blockchain_tx_id,
        verified: record.verified,
      }),
    );

    // Calculate compliance status
    const complianceStatus = await this.calculateComplianceStatus(events);

    return {
      events,
      totalCount: count || 0,
      complianceStatus,
    };
  }

  /**
   * Calculate compliance status for frameworks
   */
  private async calculateComplianceStatus(events: AuditEvent[]): Promise<
    {
      framework: string;
      compliantEvents: number;
      totalEvents: number;
      complianceRate: number;
    }[]
  > {
    const frameworks = ["LGPD", "ANVISA", "CFM", "HIPAA"];

    return frameworks.map((framework) => {
      const frameworkEvents = events.filter((e) =>
        e.complianceFrameworks.includes(framework as unknown),
      );

      const compliantEvents = frameworkEvents.filter((e) => e.verified).length;
      const { length: totalEvents } = frameworkEvents;
      const complianceRate =
        totalEvents > 0 ? (compliantEvents / totalEvents) * 100 : 100;

      return {
        framework,
        compliantEvents,
        totalEvents,
        complianceRate,
      };
    });
  }

  /**
   * Graceful shutdown with buffer flush
   */
  public async shutdown(): Promise<void> {
    // console.log("🛑 Shutting down Immutable Audit Logger...");

    // Clear performance monitoring
    clearInterval(this.performanceInterval);

    // Flush remaining events
    if (this.eventBuffer.length > 0) {
      await this.flushBuffer();
    }

    // Final metrics report
    const metrics = this.getPerformanceMetrics();
    // console.log("📊 Final performance metrics:", {
    //   totalEvents: metrics.totalEvents,
    //   averageProcessingTime: `${metrics.averageProcessingTime.toFixed(2)}ms`,
    //   complianceScore: `${metrics.complianceScore.toFixed(1)}%`,
    //   errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
    // });

    // console.log("✅ Immutable Audit Logger shutdown complete");
  }
}
