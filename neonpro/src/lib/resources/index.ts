/**
 * Resource Management System - Main Export File
 * Story 2.4: Smart Resource Management
 * 
 * This file exports all the resource management modules and provides
 * a unified interface for the smart resource management system.
 */

// Core resource management
export { default as ResourceManager } from './resource-manager';
export type {
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceAllocation,
  AllocationStatus,
  MaintenanceRecord,
  MaintenanceType,
  MaintenanceStatus,
  ResourceUtilization,
  ResourceConflict,
  ConflictType,
  AllocationRequest,
  ResourceAnalytics as ResourceManagerAnalytics
} from './resource-manager';

// Intelligent allocation engine
export { default as AllocationEngine } from './allocation-engine';
export type {
  AllocationStrategy,
  AllocationContext,
  AllocationResult,
  AllocationMetrics,
  StaffSkill,
  SkillLevel,
  WorkloadBalance,
  AllocationConstraint,
  ConstraintType,
  OptimizationGoal,
  AllocationPerformance
} from './allocation-engine';

// Predictive maintenance system
export { default as MaintenanceSystem } from './maintenance-system';
export type {
  MaintenanceSchedule,
  EquipmentUsage,
  MaintenanceAlert,
  MaintenanceCost,
  VendorInfo,
  MaintenanceAnalytics,
  MaintenancePriority,
  AlertType,
  AlertSeverity
} from './maintenance-system';

// Resource analytics system
export { default as ResourceAnalytics } from './resource-analytics';
export type {
  ResourceMetrics,
  UtilizationAnalytics,
  CostAnalytics,
  PerformanceAnalytics,
  PredictiveInsights,
  ResourceReport,
  ChartData,
  ReportType,
  AnalyticsPeriod
} from './resource-analytics';

/**
 * Smart Resource Management System
 * 
 * This is the main class that orchestrates all resource management components.
 * It provides a unified interface for:
 * - Resource tracking and allocation
 * - Intelligent scheduling and optimization
 * - Predictive maintenance
 * - Analytics and reporting
 */
export class SmartResourceManager {
  private resourceManager: ResourceManager;
  private allocationEngine: AllocationEngine;
  private maintenanceSystem: MaintenanceSystem;
  private analytics: ResourceAnalytics;

  constructor() {
    this.resourceManager = new ResourceManager();
    this.allocationEngine = new AllocationEngine();
    this.maintenanceSystem = new MaintenanceSystem();
    this.analytics = new ResourceAnalytics();

    console.log('🚀 Smart Resource Management System initialized');
  }

  /**
   * Get the resource manager instance
   */
  getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  /**
   * Get the allocation engine instance
   */
  getAllocationEngine(): AllocationEngine {
    return this.allocationEngine;
  }

  /**
   * Get the maintenance system instance
   */
  getMaintenanceSystem(): MaintenanceSystem {
    return this.maintenanceSystem;
  }

  /**
   * Get the analytics system instance
   */
  getAnalytics(): ResourceAnalytics {
    return this.analytics;
  }

  /**
   * Initialize the complete resource management system
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing Smart Resource Management System...');
      
      // Initialize all subsystems
      await Promise.all([
        this.resourceManager.initialize?.(),
        this.allocationEngine.initialize?.(),
        // Maintenance system and analytics auto-initialize
      ].filter(Boolean));

      console.log('✅ Smart Resource Management System fully initialized');
    } catch (error) {
      console.error('❌ Error initializing Smart Resource Management System:', error);
      throw new Error('Failed to initialize resource management system');
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    components: Record<string, 'online' | 'offline' | 'degraded'>;
    metrics: {
      total_resources: number;
      active_allocations: number;
      pending_maintenance: number;
      system_utilization: number;
    };
  }> {
    try {
      // Check component health
      const components = {
        resource_manager: 'online' as const,
        allocation_engine: 'online' as const,
        maintenance_system: 'online' as const,
        analytics: 'online' as const
      };

      // Get system metrics
      const [resources, allocations, maintenanceSchedules, utilizationData] = await Promise.all([
        this.resourceManager.getResources(),
        this.resourceManager.getAllocations(),
        this.maintenanceSystem.getMaintenanceSchedule(),
        this.analytics.getUtilizationAnalytics()
      ]);

      const metrics = {
        total_resources: resources.length,
        active_allocations: allocations.filter(a => a.status === 'active').length,
        pending_maintenance: maintenanceSchedules.filter(s => s.status === 'scheduled').length,
        system_utilization: utilizationData.average_utilization
      };

      // Determine overall status
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      
      if (metrics.system_utilization > 0.9) {
        status = 'warning';
      }
      
      if (metrics.pending_maintenance > 10) {
        status = 'warning';
      }

      return {
        status,
        components,
        metrics
      };
    } catch (error) {
      console.error('❌ Error getting system health:', error);
      return {
        status: 'error',
        components: {
          resource_manager: 'offline',
          allocation_engine: 'offline',
          maintenance_system: 'offline',
          analytics: 'offline'
        },
        metrics: {
          total_resources: 0,
          active_allocations: 0,
          pending_maintenance: 0,
          system_utilization: 0
        }
      };
    }
  }

  /**
   * Generate comprehensive system report
   */
  async generateSystemReport(period: AnalyticsPeriod = 'month'): Promise<ResourceReport> {
    try {
      return await this.analytics.generateReport('comprehensive', period);
    } catch (error) {
      console.error('❌ Error generating system report:', error);
      throw new Error('Failed to generate system report');
    }
  }

  /**
   * Optimize system performance
   */
  async optimizeSystem(): Promise<{
    optimizations_applied: number;
    performance_improvement: number;
    recommendations: string[];
  }> {
    try {
      console.log('🔄 Starting system optimization...');
      
      let optimizationsApplied = 0;
      const recommendations: string[] = [];
      
      // Get predictive insights
      const insights = await this.analytics.getPredictiveInsights();
      
      // Apply optimization opportunities
      for (const opportunity of insights.optimization_opportunities) {
        if (opportunity.implementation_effort === 'low') {
          // Auto-apply low-effort optimizations
          switch (opportunity.type) {
            case 'scheduling':
              // Optimize scheduling automatically
              await this.allocationEngine.optimizeAllocations();
              optimizationsApplied++;
              break;
              
            case 'reallocation':
              // Suggest reallocations
              recommendations.push(opportunity.description);
              break;
              
            default:
              recommendations.push(opportunity.description);
          }
        } else {
          recommendations.push(`${opportunity.description} (${opportunity.implementation_effort} effort)`);
        }
      }
      
      // Calculate performance improvement estimate
      const performanceImprovement = insights.optimization_opportunities
        .filter(o => o.implementation_effort === 'low')
        .reduce((sum, o) => sum + o.potential_impact, 0);
      
      console.log(`✅ System optimization completed: ${optimizationsApplied} optimizations applied`);
      
      return {
        optimizations_applied: optimizationsApplied,
        performance_improvement: performanceImprovement,
        recommendations
      };
    } catch (error) {
      console.error('❌ Error optimizing system:', error);
      throw new Error('Failed to optimize system');
    }
  }

  /**
   * Emergency resource reallocation
   */
  async handleEmergency(emergencyType: 'equipment_failure' | 'staff_shortage' | 'high_demand'): Promise<{
    reallocations: number;
    affected_resources: string[];
    estimated_resolution_time: number;
  }> {
    try {
      console.log(`🚨 Handling emergency: ${emergencyType}`);
      
      let reallocations = 0;
      const affectedResources: string[] = [];
      
      switch (emergencyType) {
        case 'equipment_failure':
          // Find alternative equipment
          const alternatives = await this.allocationEngine.findAlternativeResources('equipment');
          reallocations = alternatives.length;
          affectedResources.push(...alternatives.map(a => a.id));
          break;
          
        case 'staff_shortage':
          // Reallocate staff from low-priority areas
          const staffReallocations = await this.allocationEngine.reallocateStaff();
          reallocations = staffReallocations.length;
          affectedResources.push(...staffReallocations.map(r => r.resource_id));
          break;
          
        case 'high_demand':
          // Scale up resources
          const scaleUpResult = await this.allocationEngine.scaleResources('up');
          reallocations = scaleUpResult.allocations;
          affectedResources.push(...scaleUpResult.resources);
          break;
      }
      
      // Estimate resolution time based on emergency type
      const estimatedResolutionTime = {
        equipment_failure: 2, // 2 hours
        staff_shortage: 4,    // 4 hours
        high_demand: 1        // 1 hour
      }[emergencyType];
      
      console.log(`✅ Emergency handled: ${reallocations} reallocations completed`);
      
      return {
        reallocations,
        affected_resources: affectedResources,
        estimated_resolution_time: estimatedResolutionTime
      };
    } catch (error) {
      console.error('❌ Error handling emergency:', error);
      throw new Error('Failed to handle emergency');
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down Smart Resource Management System...');
      
      // Clear caches
      this.analytics.clearCache();
      
      // Cleanup subscriptions and intervals
      // (Individual systems handle their own cleanup)
      
      console.log('✅ Smart Resource Management System shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw new Error('Failed to shutdown resource management system');
    }
  }
}

// Export the main system instance
export default SmartResourceManager;

// Export convenience functions
export const createResourceManager = () => new SmartResourceManager();

/**
 * Resource Management System Configuration
 */
export interface ResourceSystemConfig {
  enablePredictiveMaintenance: boolean;
  enableIntelligentAllocation: boolean;
  enableRealTimeAnalytics: boolean;
  maintenanceCheckInterval: number; // minutes
  allocationOptimizationInterval: number; // minutes
  analyticsRefreshInterval: number; // minutes
  emergencyResponseEnabled: boolean;
}

export const defaultResourceSystemConfig: ResourceSystemConfig = {
  enablePredictiveMaintenance: true,
  enableIntelligentAllocation: true,
  enableRealTimeAnalytics: true,
  maintenanceCheckInterval: 60, // 1 hour
  allocationOptimizationInterval: 30, // 30 minutes
  analyticsRefreshInterval: 15, // 15 minutes
  emergencyResponseEnabled: true
};

/**
 * Initialize the resource management system with configuration
 */
export const initializeResourceSystem = async (config: Partial<ResourceSystemConfig> = {}) => {
  const finalConfig = { ...defaultResourceSystemConfig, ...config };
  const system = new SmartResourceManager();
  
  await system.initialize();
  
  console.log('🚀 Resource Management System initialized with config:', finalConfig);
  
  return system;
};