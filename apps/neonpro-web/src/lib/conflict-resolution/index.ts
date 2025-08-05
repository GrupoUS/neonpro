import type { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { ConflictDetector } from "./conflict-detector";
import type { ResolutionEngine } from "./resolution-engine";
import type { ResourceOptimizer } from "./resource-optimizer";
import type {
  AutomationSettings,
  ConflictDetails,
  ConflictResolutionResult,
  ConflictType,
  LoadBalancingResult,
  OptimizationConfig,
  OptimizationConstraints,
  OptimizationStrategy,
  PerformanceMetrics,
  ResolutionOption,
  ResolutionStrategy,
  ResourceOptimization,
  SystemAnalytics,
} from "./types";

/**
 * Unified Intelligent Conflict Resolution System
 *
 * This system provides comprehensive conflict detection, resolution, and resource optimization
 * for healthcare scheduling and resource management.
 */
export class IntelligentConflictResolutionSystem {
  private supabase: SupabaseClient;
  private conflictDetector: ConflictDetector;
  private resolutionEngine: ResolutionEngine;
  private resourceOptimizer: ResourceOptimizer;
  private config: OptimizationConfig;
  private constraints: OptimizationConstraints;
  private automationSettings: AutomationSettings;
  private analyticsCache: Map<string, SystemAnalytics> = new Map();
  private performanceMetrics: PerformanceMetrics;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config?: Partial<OptimizationConfig>,
    constraints?: Partial<OptimizationConstraints>,
    automationSettings?: Partial<AutomationSettings>,
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Default configuration
    this.config = {
      weights: {
        patientSatisfaction: 0.3,
        staffWorkload: 0.25,
        resourceUtilization: 0.2,
        operationalEfficiency: 0.15,
        financialImpact: 0.1,
      },
      thresholds: {
        conflictSeverity: 0.7,
        autoResolutionConfidence: 0.8,
        resourceUtilization: 0.85,
      },
      ...config,
    };

    // Default constraints
    this.constraints = {
      maxStaffUtilization: 0.9,
      minStaffUtilization: 0.4,
      maxRoomUtilization: 0.95,
      minRoomUtilization: 0.3,
      maxEquipmentUtilization: 0.9,
      minEquipmentUtilization: 0.2,
      businessHours: {
        start: "08:00",
        end: "18:00",
      },
      maxOvertimeHours: 2,
      minBufferTime: 15,
      maxReschedulingWindow: 7,
      ...constraints,
    };

    // Default automation settings
    this.automationSettings = {
      autoDetection: true,
      autoResolution: false,
      autoOptimization: false,
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: false,
        inAppNotifications: true,
      },
      escalationRules: {
        highSeverityThreshold: 0.8,
        escalationDelay: 30,
        maxAutoAttempts: 3,
      },
      ...automationSettings,
    };

    // Initialize components
    this.conflictDetector = new ConflictDetector(
      supabaseUrl,
      supabaseKey,
      this.config,
      this.constraints,
    );

    this.resolutionEngine = new ResolutionEngine(
      supabaseUrl,
      supabaseKey,
      this.config,
      this.constraints,
    );

    this.resourceOptimizer = new ResourceOptimizer(
      supabaseUrl,
      supabaseKey,
      this.config,
      this.constraints,
    );

    // Initialize performance metrics
    this.performanceMetrics = {
      conflictsDetected: 0,
      conflictsResolved: 0,
      averageResolutionTime: 0,
      successRate: 0,
      optimizationsApplied: 0,
      systemUptime: Date.now(),
      lastUpdated: new Date(),
    };

    // Start automated processes if enabled
    if (this.automationSettings.autoDetection) {
      this.startAutomatedConflictDetection();
    }
  }

  /**
   * Comprehensive conflict detection and resolution workflow
   */
  async detectAndResolveConflicts(
    startDate?: Date,
    endDate?: Date,
    autoResolve: boolean = false,
  ): Promise<ConflictResolutionResult> {
    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead

    try {
      // Step 1: Detect conflicts
      const conflicts = await this.conflictDetector.detectConflicts(start, end);

      if (conflicts.length === 0) {
        return {
          success: true,
          conflictsDetected: 0,
          conflictsResolved: 0,
          conflicts: [],
          resolutions: [],
          optimizations: [],
          executionTime: 0,
          timestamp: new Date(),
        };
      }

      const startTime = Date.now();
      const resolutions: ResolutionOption[] = [];
      const appliedResolutions: any[] = [];

      // Step 2: Generate resolutions for each conflict
      for (const conflict of conflicts) {
        const conflictResolutions = await this.resolutionEngine.generateResolutions(conflict);
        resolutions.push(...conflictResolutions);

        // Auto-resolve if enabled and confidence is high enough
        if (autoResolve && this.shouldAutoResolve(conflictResolutions)) {
          const bestResolution = conflictResolutions[0]; // Already sorted by score
          try {
            const result = await this.resolutionEngine.applyResolution(bestResolution.id);
            appliedResolutions.push(result);
            this.performanceMetrics.conflictsResolved++;
          } catch (error) {
            console.error(`Failed to auto-resolve conflict ${conflict.id}:`, error);
          }
        }
      }

      // Step 3: Generate system-wide optimizations
      const optimizations = await this.generateSystemOptimizations(start, end);

      // Update performance metrics
      this.performanceMetrics.conflictsDetected += conflicts.length;
      this.performanceMetrics.averageResolutionTime = this.calculateAverageResolutionTime();
      this.performanceMetrics.successRate = this.calculateSuccessRate();
      this.performanceMetrics.lastUpdated = new Date();

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        conflictsDetected: conflicts.length,
        conflictsResolved: appliedResolutions.length,
        conflicts,
        resolutions,
        appliedResolutions,
        optimizations,
        executionTime,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Error in conflict detection and resolution:", error);
      throw error;
    }
  }

  /**
   * Detect conflicts only
   */
  async detectConflicts(
    startDate?: Date,
    endDate?: Date,
    conflictTypes?: ConflictType[],
  ): Promise<ConflictDetails[]> {
    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return await this.conflictDetector.detectConflicts(start, end, conflictTypes);
  }

  /**
   * Generate resolutions for a specific conflict
   */
  async generateResolutions(
    conflictId: string,
    strategies?: ResolutionStrategy[],
  ): Promise<ResolutionOption[]> {
    const conflict = await this.getConflictById(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    return await this.resolutionEngine.generateResolutions(conflict, strategies);
  }

  /**
   * Apply a specific resolution
   */
  async applyResolution(resolutionId: string): Promise<any> {
    const result = await this.resolutionEngine.applyResolution(resolutionId);
    this.performanceMetrics.conflictsResolved++;
    this.performanceMetrics.lastUpdated = new Date();
    return result;
  }

  /**
   * Optimize resources for a time period
   */
  async optimizeResources(
    startDate: Date,
    endDate: Date,
    strategy: OptimizationStrategy = OptimizationStrategy.BALANCED,
  ): Promise<ResourceOptimization> {
    return await this.resourceOptimizer.optimizeResources(startDate, endDate, strategy);
  }

  /**
   * Balance workload across staff
   */
  async balanceWorkload(
    startDate: Date,
    endDate: Date,
    targetUtilization: number = 0.8,
  ): Promise<LoadBalancingResult> {
    return await this.resourceOptimizer.balanceWorkload(startDate, endDate, targetUtilization);
  }

  /**
   * Apply resource optimization
   */
  async applyOptimization(optimizationId: string): Promise<any> {
    const result = await this.resourceOptimizer.applyOptimization(optimizationId);
    this.performanceMetrics.optimizationsApplied++;
    this.performanceMetrics.lastUpdated = new Date();
    return result;
  }

  /**
   * Get comprehensive system analytics
   */
  async getSystemAnalytics(
    startDate: Date,
    endDate: Date,
    includeForecasting: boolean = true,
  ): Promise<SystemAnalytics> {
    const cacheKey = `analytics-${startDate.toISOString()}-${endDate.toISOString()}-${includeForecasting}`;

    if (this.analyticsCache.has(cacheKey)) {
      return this.analyticsCache.get(cacheKey)!;
    }

    try {
      // Gather analytics from all components
      const conflictAnalytics = await this.getConflictAnalytics(startDate, endDate);
      const resolutionAnalytics = await this.getResolutionAnalytics(startDate, endDate);
      const optimizationAnalytics = await this.getOptimizationAnalytics(startDate, endDate);
      const resourceMetrics = await this.resourceOptimizer.calculateResourceMetrics(
        startDate,
        endDate,
      );

      // Generate forecasting if requested
      let forecasting = null;
      if (includeForecasting) {
        forecasting = await this.generateForecasting(startDate, endDate);
      }

      const analytics: SystemAnalytics = {
        period: { start: startDate, end: endDate },
        conflictAnalytics,
        resolutionAnalytics,
        optimizationAnalytics,
        resourceMetrics,
        performanceMetrics: this.performanceMetrics,
        forecasting,
        trends: await this.calculateTrends(startDate, endDate),
        recommendations: await this.generateSystemRecommendations(),
        generatedAt: new Date(),
      };

      this.analyticsCache.set(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error("Error generating system analytics:", error);
      throw error;
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return {
      ...this.performanceMetrics,
      systemUptime: Date.now() - this.performanceMetrics.systemUptime,
    };
  }

  /**
   * Update system configuration
   */
  updateConfiguration(
    config?: Partial<OptimizationConfig>,
    constraints?: Partial<OptimizationConstraints>,
    automationSettings?: Partial<AutomationSettings>,
  ): void {
    if (config) {
      this.config = { ...this.config, ...config };
      this.conflictDetector.updateConfig(config);
      this.resolutionEngine.updateConfig(config);
      this.resourceOptimizer.updateConfig(config);
    }

    if (constraints) {
      this.constraints = { ...this.constraints, ...constraints };
      this.conflictDetector.updateConstraints(constraints);
      this.resolutionEngine.updateConstraints(constraints);
      this.resourceOptimizer.updateConstraints(constraints);
    }

    if (automationSettings) {
      this.automationSettings = { ...this.automationSettings, ...automationSettings };

      // Restart automation if settings changed
      if (automationSettings.autoDetection !== undefined) {
        if (automationSettings.autoDetection) {
          this.startAutomatedConflictDetection();
        } else {
          this.stopAutomatedConflictDetection();
        }
      }
    }

    // Clear caches
    this.clearAllCaches();
  }

  /**
   * Start automated conflict detection
   */
  private startAutomatedConflictDetection(): void {
    // Run every 30 minutes
    setInterval(
      async () => {
        try {
          await this.detectAndResolveConflicts(
            new Date(),
            new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
            this.automationSettings.autoResolution,
          );
        } catch (error) {
          console.error("Error in automated conflict detection:", error);
        }
      },
      30 * 60 * 1000,
    );
  }

  /**
   * Stop automated conflict detection
   */
  private stopAutomatedConflictDetection(): void {
    // Implementation would clear the interval
    // This is a simplified version
  }

  /**
   * Generate system-wide optimizations
   */
  private async generateSystemOptimizations(
    startDate: Date,
    endDate: Date,
  ): Promise<ResourceOptimization[]> {
    const optimizations: ResourceOptimization[] = [];

    // Generate resource optimization
    const resourceOpt = await this.resourceOptimizer.optimizeResources(
      startDate,
      endDate,
      OptimizationStrategy.BALANCED,
    );
    optimizations.push(resourceOpt);

    // Generate workload balancing
    const workloadBalance = await this.resourceOptimizer.balanceWorkload(startDate, endDate);

    // Convert workload balance to optimization format
    if (workloadBalance.balancingActions.length > 0) {
      const workloadOpt: ResourceOptimization = {
        id: workloadBalance.id,
        period: workloadBalance.period,
        strategy: OptimizationStrategy.BALANCED,
        currentMetrics: await this.resourceOptimizer.calculateResourceMetrics(startDate, endDate),
        recommendations: [], // Would convert balancing actions to recommendations
        expectedImprovements: await this.resourceOptimizer.calculateResourceMetrics(
          startDate,
          endDate,
        ),
        confidence: workloadBalance.confidence,
        estimatedImplementationTime: workloadBalance.estimatedTime,
        createdAt: workloadBalance.createdAt,
        status: "pending",
      };
      optimizations.push(workloadOpt);
    }

    return optimizations;
  }

  /**
   * Determine if a conflict should be auto-resolved
   */
  private shouldAutoResolve(resolutions: ResolutionOption[]): boolean {
    if (!this.automationSettings.autoResolution || resolutions.length === 0) {
      return false;
    }

    const bestResolution = resolutions[0];
    return (
      bestResolution.confidence >= this.config.thresholds.autoResolutionConfidence &&
      bestResolution.feasibility >= 0.8
    );
  }

  /**
   * Calculate average resolution time
   */
  private calculateAverageResolutionTime(): number {
    // Simplified implementation
    return 15; // minutes
  }

  /**
   * Calculate success rate
   */
  private calculateSuccessRate(): number {
    if (this.performanceMetrics.conflictsDetected === 0) return 1.0;
    return this.performanceMetrics.conflictsResolved / this.performanceMetrics.conflictsDetected;
  }

  /**
   * Get conflict analytics
   */
  private async getConflictAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // Implementation would analyze conflict patterns, types, frequencies, etc.
    return {
      totalConflicts: 0,
      conflictsByType: {},
      conflictsBySeverity: {},
      averageResolutionTime: 0,
      mostCommonConflictType: null,
      peakConflictTimes: [],
    };
  }

  /**
   * Get resolution analytics
   */
  private async getResolutionAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // Implementation would analyze resolution effectiveness, strategies used, etc.
    return {
      totalResolutions: 0,
      resolutionsByStrategy: {},
      averageConfidence: 0,
      successRate: 0,
      mostEffectiveStrategy: null,
      averageImplementationTime: 0,
    };
  }

  /**
   * Get optimization analytics
   */
  private async getOptimizationAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // Implementation would analyze optimization impact, ROI, etc.
    return {
      totalOptimizations: 0,
      optimizationsByType: {},
      averageImpact: 0,
      roi: 0,
      mostImpactfulOptimization: null,
      cumulativeImprovements: {},
    };
  }

  /**
   * Generate forecasting
   */
  private async generateForecasting(startDate: Date, endDate: Date): Promise<any> {
    // Implementation would use historical data to predict future conflicts and resource needs
    return {
      predictedConflicts: [],
      resourceDemandForecast: {},
      recommendedPreventiveMeasures: [],
      confidenceLevel: 0.75,
    };
  }

  /**
   * Calculate trends
   */
  private async calculateTrends(startDate: Date, endDate: Date): Promise<any> {
    // Implementation would analyze trends in conflicts, resolutions, and optimizations
    return {
      conflictTrends: {},
      resolutionTrends: {},
      optimizationTrends: {},
      seasonalPatterns: {},
      emergingIssues: [],
    };
  }

  /**
   * Generate system recommendations
   */
  private async generateSystemRecommendations(): Promise<any[]> {
    // Implementation would analyze system performance and suggest improvements
    return [];
  }

  /**
   * Get conflict by ID
   */
  private async getConflictById(conflictId: string): Promise<ConflictDetails | null> {
    // Implementation would fetch from database
    return null;
  }

  /**
   * Clear all caches
   */
  private clearAllCaches(): void {
    this.analyticsCache.clear();
    this.conflictDetector.clearCache();
    this.resolutionEngine.clearCache();
    this.resourceOptimizer.clearCache();
  }

  /**
   * Health check for the system
   */
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    components: Record<string, boolean>;
    lastCheck: Date;
  }> {
    try {
      // Check database connection
      const { error: dbError } = await this.supabase.from("appointments").select("count").limit(1);
      const dbHealthy = !dbError;

      // Check component health
      const components = {
        database: dbHealthy,
        conflictDetector: true, // Would implement actual health checks
        resolutionEngine: true,
        resourceOptimizer: true,
        automation: this.automationSettings.autoDetection,
      };

      const allHealthy = Object.values(components).every(Boolean);
      const mostlyHealthy = Object.values(components).filter(Boolean).length >= 3;

      return {
        status: allHealthy ? "healthy" : mostlyHealthy ? "degraded" : "unhealthy",
        components,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        components: {
          database: false,
          conflictDetector: false,
          resolutionEngine: false,
          resourceOptimizer: false,
          automation: false,
        },
        lastCheck: new Date(),
      };
    }
  }
}

export { ConflictDetector } from "./conflict-detector";
export { ResolutionEngine } from "./resolution-engine";
export { ResourceOptimizer } from "./resource-optimizer";
// Export all types and classes
export * from "./types";

// Default export
export default IntelligentConflictResolutionSystem;
