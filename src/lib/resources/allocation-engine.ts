/**
 * Intelligent Resource Allocation Engine
 * Story 2.4: Advanced algorithms for optimal resource allocation
 * 
 * Features:
 * - Smart allocation optimization
 * - Staff skill matching
 * - Workload balancing
 * - Efficiency-based prioritization
 * - Dynamic reallocation
 */

import { ResourceManager, Resource, ResourceAllocation, AllocationRequest, ResourceType } from './resource-manager';
import { createClient } from '@supabase/supabase-js';

// Advanced allocation types
export interface AllocationStrategy {
  name: string;
  weight: number;
  calculate: (resource: Resource, request: AllocationRequest, context: AllocationContext) => Promise<number>;
}

export interface AllocationContext {
  currentAllocations: ResourceAllocation[];
  resourceUtilization: Map<string, number>;
  staffWorkload: Map<string, number>;
  timeOfDay: number;
  dayOfWeek: number;
  seasonalFactors: Record<string, number>;
}

export interface OptimizationResult {
  resource: Resource;
  score: number;
  confidence: number;
  reasoning: string[];
  alternatives: Array<{
    resource: Resource;
    score: number;
    tradeoffs: string[];
  }>;
}

export interface WorkloadBalance {
  staff_id: string;
  current_load: number;
  optimal_load: number;
  efficiency_score: number;
  recommendations: string[];
}

export interface AllocationMetrics {
  total_allocations: number;
  success_rate: number;
  average_utilization: number;
  conflict_rate: number;
  optimization_score: number;
  bottleneck_resources: string[];
}

/**
 * Intelligent Allocation Engine
 * Implements advanced algorithms for optimal resource allocation
 */
export class AllocationEngine {
  private resourceManager: ResourceManager;
  private supabase;
  private strategies: AllocationStrategy[];
  private performanceMetrics: Map<string, number> = new Map();

  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.initializeStrategies();
  }

  /**
   * Initialize allocation strategies
   */
  private initializeStrategies(): void {
    this.strategies = [
      {
        name: 'utilization_balance',
        weight: 0.25,
        calculate: this.calculateUtilizationScore.bind(this)
      },
      {
        name: 'skill_matching',
        weight: 0.30,
        calculate: this.calculateSkillMatchScore.bind(this)
      },
      {
        name: 'efficiency_optimization',
        weight: 0.20,
        calculate: this.calculateEfficiencyScore.bind(this)
      },
      {
        name: 'workload_distribution',
        weight: 0.15,
        calculate: this.calculateWorkloadScore.bind(this)
      },
      {
        name: 'temporal_optimization',
        weight: 0.10,
        calculate: this.calculateTemporalScore.bind(this)
      }
    ];
  }

  /**
   * Find optimal resource allocation using advanced algorithms
   */
  async findOptimalAllocation(request: AllocationRequest): Promise<OptimizationResult | null> {
    try {
      console.log(`🔍 Finding optimal allocation for ${request.resource_type}`);

      // Get candidate resources
      const candidates = await this.getCandidateResources(request);
      if (candidates.length === 0) {
        console.log('❌ No candidate resources found');
        return null;
      }

      // Build allocation context
      const context = await this.buildAllocationContext(request);

      // Score all candidates
      const scoredCandidates = await Promise.all(
        candidates.map(async (resource) => {
          const score = await this.calculateCompositeScore(resource, request, context);
          const confidence = await this.calculateConfidence(resource, request, context);
          const reasoning = await this.generateReasoning(resource, request, context, score);
          
          return {
            resource,
            score,
            confidence,
            reasoning
          };
        })
      );

      // Sort by score
      scoredCandidates.sort((a, b) => b.score - a.score);

      if (scoredCandidates.length === 0) return null;

      const optimal = scoredCandidates[0];
      const alternatives = scoredCandidates.slice(1, 4).map(candidate => ({
        resource: candidate.resource,
        score: candidate.score,
        tradeoffs: this.calculateTradeoffs(optimal, candidate)
      }));

      console.log(`✅ Optimal allocation found: ${optimal.resource.name} (score: ${optimal.score.toFixed(2)})`);

      return {
        ...optimal,
        alternatives
      };
    } catch (error) {
      console.error('❌ Error finding optimal allocation:', error);
      return null;
    }
  }

  /**
   * Get candidate resources based on basic requirements
   */
  private async getCandidateResources(request: AllocationRequest): Promise<Resource[]> {
    const resources = await this.resourceManager.getResources({
      type: request.resource_type
    });

    return resources.filter(resource => {
      // Basic availability check
      if (resource.status === 'offline' || resource.status === 'maintenance') {
        return false;
      }

      // Capacity check
      if (request.requirements.capacity && 
          resource.capacity && 
          resource.capacity < request.requirements.capacity) {
        return false;
      }

      // Equipment type check
      if (request.requirements.equipment_type && 
          resource.equipment_type && 
          resource.equipment_type !== request.requirements.equipment_type) {
        return false;
      }

      return true;
    });
  }

  /**
   * Build allocation context for decision making
   */
  private async buildAllocationContext(request: AllocationRequest): Promise<AllocationContext> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Get current allocations
    const currentAllocations = await this.resourceManager.getAllocations(
      undefined,
      startOfDay,
      endOfDay
    );

    // Calculate resource utilization
    const resourceUtilization = new Map<string, number>();
    const staffWorkload = new Map<string, number>();

    for (const allocation of currentAllocations) {
      const duration = new Date(allocation.end_time).getTime() - new Date(allocation.start_time).getTime();
      const hours = duration / (1000 * 60 * 60);

      // Update resource utilization
      const currentUtil = resourceUtilization.get(allocation.resource_id) || 0;
      resourceUtilization.set(allocation.resource_id, currentUtil + hours);

      // Update staff workload if applicable
      if (allocation.staff_id) {
        const currentLoad = staffWorkload.get(allocation.staff_id) || 0;
        staffWorkload.set(allocation.staff_id, currentLoad + hours);
      }
    }

    return {
      currentAllocations,
      resourceUtilization,
      staffWorkload,
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      seasonalFactors: this.getSeasonalFactors(now)
    };
  }

  /**
   * Calculate composite score using all strategies
   */
  private async calculateCompositeScore(
    resource: Resource,
    request: AllocationRequest,
    context: AllocationContext
  ): Promise<number> {
    let totalScore = 0;
    let totalWeight = 0;

    for (const strategy of this.strategies) {
      try {
        const score = await strategy.calculate(resource, request, context);
        totalScore += score * strategy.weight;
        totalWeight += strategy.weight;
      } catch (error) {
        console.error(`❌ Error in strategy ${strategy.name}:`, error);
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calculate utilization balance score
   */
  private async calculateUtilizationScore(
    resource: Resource,
    request: AllocationRequest,
    context: AllocationContext
  ): Promise<number> {
    const currentUtilization = context.resourceUtilization.get(resource.id) || 0;
    const optimalUtilization = 6; // 6 hours per day optimal
    
    // Prefer resources with balanced utilization
    const utilizationRatio = currentUtilization / optimalUtilization;
    
    if (utilizationRatio < 0.3) {
      return 90; // Underutilized, good to use
    } else if (utilizationRatio < 0.8) {
      return 100; // Optimal range
    } else if (utilizationRatio < 1.0) {
      return 70; // Getting busy
    } else {
      return 30; // Overutilized
    }
  }

  /**
   * Calculate skill matching score for staff
   */
  private async calculateSkillMatchScore(
    resource: Resource,
    request: AllocationRequest,
    context: AllocationContext
  ): Promise<number> {
    if (resource.type !== 'staff' || !request.requirements.skills) {
      return 100; // Not applicable, neutral score
    }

    const requiredSkills = request.requirements.skills;
    const resourceSkills = resource.skills_required || [];

    if (requiredSkills.length === 0) return 100;

    // Calculate skill match percentage
    const matchedSkills = requiredSkills.filter(skill => 
      resourceSkills.includes(skill)
    );

    const matchPercentage = matchedSkills.length / requiredSkills.length;
    
    // Bonus for additional relevant skills
    const bonusSkills = resourceSkills.filter(skill => 
      !requiredSkills.includes(skill)
    ).length;

    const baseScore = matchPercentage * 100;
    const bonusScore = Math.min(bonusSkills * 5, 20);

    return Math.min(baseScore + bonusScore, 100);
  }

  /**
   * Calculate efficiency optimization score
   */
  private async calculateEfficiencyScore(
    resource: Resource,
    request: AllocationRequest,
    context: AllocationContext
  ): Promise<number> {
    let score = 100;

    // Location efficiency
    if (request.requirements.location_preference) {
      if (resource.location === request.requirements.location_preference) {
        score += 20;
      } else {
        score -= 10;
      }
    }

    // Time-based efficiency
    const requestHour = new Date(request.start_time).getHours();
    if (resource.type === 'staff') {
      // Prefer staff during their peak hours
      if (requestHour >= 9 && requestHour <= 17) {
        score += 10;
      } else {
        score -= 5;
      }
    }

    // Maintenance proximity penalty
    if (resource.maintenance_schedule) {
      const daysDiff = Math.abs(
        (resource.maintenance_schedule.getTime() - request.start_time.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff < 3) {
        score -= 15;
      } else if (daysDiff < 7) {
        score -= 5;
      }
    }

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Calculate workload distribution score
   */
  private async calculateWorkloadScore(
    resource: Resource,
    request: AllocationRequest,
    context: AllocationContext
  ): Promise<number> {
    if (resource.type !== 'staff') {
      return 100; // Not applicable for non-staff resources
    }

    const currentWorkload = context.staffWorkload.get(resource.id) || 0;
    const optimalWorkload = 8; // 8 hours per day
    
    const workloadRatio = currentWorkload / optimalWorkload;
    
    if (workloadRatio < 0.4) {
      return 95; // Underloaded
    } else if (workloadRatio < 0.8) {
      return 100; // Optimal
    } else if (workloadRatio < 1.0) {
      return 80; // Getting busy
    } else {
      return 40; // Overloaded
    }
  }

  /**
   * Calculate temporal optimization score
   */
  private async calculateTemporalScore(
    resource: Resource,
    request: AllocationRequest,
    context: AllocationContext
  ): Promise<number> {
    let score = 100;

    // Day of week factors
    const dayFactors = [0.8, 1.0, 1.0, 1.0, 1.0, 0.9, 0.7]; // Sun-Sat
    score *= dayFactors[context.dayOfWeek];

    // Time of day factors
    if (context.timeOfDay >= 8 && context.timeOfDay <= 18) {
      score *= 1.1; // Business hours bonus
    } else {
      score *= 0.9; // Off-hours penalty
    }

    // Seasonal factors
    const seasonalMultiplier = context.seasonalFactors[resource.type] || 1.0;
    score *= seasonalMultiplier;

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Calculate confidence in the allocation decision
   */
  private async calculateConfidence(
    resource: Resource,
    request: AllocationRequest,
    context: AllocationContext
  ): Promise<number> {
    let confidence = 100;

    // Reduce confidence if resource is near capacity
    const utilization = context.resourceUtilization.get(resource.id) || 0;
    if (utilization > 6) {
      confidence -= 20;
    }

    // Reduce confidence if maintenance is soon
    if (resource.maintenance_schedule) {
      const daysDiff = Math.abs(
        (resource.maintenance_schedule.getTime() - request.start_time.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff < 7) {
        confidence -= 15;
      }
    }

    // Reduce confidence for skill mismatches
    if (resource.type === 'staff' && request.requirements.skills) {
      const skillScore = await this.calculateSkillMatchScore(resource, request, context);
      if (skillScore < 80) {
        confidence -= 10;
      }
    }

    return Math.max(0, Math.min(confidence, 100));
  }

  /**
   * Generate reasoning for allocation decision
   */
  private async generateReasoning(
    resource: Resource,
    request: AllocationRequest,
    context: AllocationContext,
    score: number
  ): Promise<string[]> {
    const reasoning: string[] = [];

    // Utilization reasoning
    const utilization = context.resourceUtilization.get(resource.id) || 0;
    if (utilization < 3) {
      reasoning.push('Resource is underutilized, good opportunity for allocation');
    } else if (utilization > 7) {
      reasoning.push('Resource is heavily utilized, may impact efficiency');
    }

    // Skill matching reasoning
    if (resource.type === 'staff' && request.requirements.skills) {
      const skillScore = await this.calculateSkillMatchScore(resource, request, context);
      if (skillScore > 90) {
        reasoning.push('Excellent skill match for required competencies');
      } else if (skillScore < 70) {
        reasoning.push('Limited skill match, may require additional support');
      }
    }

    // Location reasoning
    if (request.requirements.location_preference === resource.location) {
      reasoning.push('Optimal location match reduces travel time');
    }

    // Maintenance reasoning
    if (resource.maintenance_schedule) {
      const daysDiff = Math.abs(
        (resource.maintenance_schedule.getTime() - request.start_time.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff < 7) {
        reasoning.push('Maintenance scheduled soon, consider alternatives');
      }
    }

    // Overall score reasoning
    if (score > 90) {
      reasoning.push('High optimization score indicates excellent fit');
    } else if (score < 60) {
      reasoning.push('Lower score suggests suboptimal allocation');
    }

    return reasoning;
  }

  /**
   * Calculate tradeoffs between optimal and alternative
   */
  private calculateTradeoffs(
    optimal: { resource: Resource; score: number },
    alternative: { resource: Resource; score: number }
  ): string[] {
    const tradeoffs: string[] = [];

    const scoreDiff = optimal.score - alternative.score;
    if (scoreDiff > 20) {
      tradeoffs.push('Significantly lower optimization score');
    } else if (scoreDiff > 10) {
      tradeoffs.push('Moderately lower optimization score');
    }

    if (optimal.resource.location !== alternative.resource.location) {
      tradeoffs.push('Different location may impact logistics');
    }

    if (optimal.resource.type === 'staff' && alternative.resource.type === 'staff') {
      // Compare skills
      const optimalSkills = optimal.resource.skills_required?.length || 0;
      const altSkills = alternative.resource.skills_required?.length || 0;
      
      if (optimalSkills > altSkills) {
        tradeoffs.push('Fewer specialized skills available');
      }
    }

    return tradeoffs;
  }

  /**
   * Get seasonal factors for resource types
   */
  private getSeasonalFactors(date: Date): Record<string, number> {
    const month = date.getMonth();
    
    // Example seasonal factors (can be customized)
    const factors: Record<string, number> = {
      'room': 1.0,
      'equipment': 1.0,
      'staff': 1.0,
      'vehicle': 1.0
    };

    // Summer months (June-August) - higher demand for aesthetic procedures
    if (month >= 5 && month <= 7) {
      factors['staff'] = 1.1;
      factors['room'] = 1.1;
    }

    // Holiday season (December) - lower activity
    if (month === 11) {
      factors['staff'] = 0.9;
      factors['room'] = 0.9;
    }

    return factors;
  }

  /**
   * Analyze workload balance across staff
   */
  async analyzeWorkloadBalance(): Promise<WorkloadBalance[]> {
    try {
      const staff = await this.resourceManager.getResources({ type: 'staff' });
      const context = await this.buildAllocationContext({
        resource_type: 'staff',
        start_time: new Date(),
        end_time: new Date(),
        requirements: {},
        priority: 1
      });

      const balanceAnalysis: WorkloadBalance[] = [];

      for (const staffMember of staff) {
        const currentLoad = context.staffWorkload.get(staffMember.id) || 0;
        const optimalLoad = 8; // 8 hours per day
        const efficiency = await this.calculateStaffEfficiency(staffMember.id);
        
        const recommendations: string[] = [];
        
        if (currentLoad < optimalLoad * 0.6) {
          recommendations.push('Consider additional assignments');
        } else if (currentLoad > optimalLoad * 1.2) {
          recommendations.push('Reduce workload to prevent burnout');
        }
        
        if (efficiency < 0.8) {
          recommendations.push('Review skill development opportunities');
        }

        balanceAnalysis.push({
          staff_id: staffMember.id,
          current_load: currentLoad,
          optimal_load: optimalLoad,
          efficiency_score: efficiency,
          recommendations
        });
      }

      return balanceAnalysis;
    } catch (error) {
      console.error('❌ Error analyzing workload balance:', error);
      return [];
    }
  }

  /**
   * Calculate staff efficiency metrics
   */
  private async calculateStaffEfficiency(staffId: string): Promise<number> {
    try {
      // This would typically analyze historical performance data
      // For now, return a baseline efficiency
      return 0.85; // 85% efficiency baseline
    } catch (error) {
      console.error('❌ Error calculating staff efficiency:', error);
      return 0.5;
    }
  }

  /**
   * Get allocation performance metrics
   */
  async getAllocationMetrics(days: number = 30): Promise<AllocationMetrics> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const allocations = await this.resourceManager.getAllocations(
        undefined,
        startDate,
        endDate
      );

      const totalAllocations = allocations.length;
      const successfulAllocations = allocations.filter(a => a.status === 'completed').length;
      const conflictedAllocations = allocations.filter(a => a.status === 'cancelled').length;

      // Calculate utilization
      const resourceUtilization = new Map<string, number>();
      for (const allocation of allocations) {
        const duration = new Date(allocation.end_time).getTime() - new Date(allocation.start_time).getTime();
        const hours = duration / (1000 * 60 * 60);
        const current = resourceUtilization.get(allocation.resource_id) || 0;
        resourceUtilization.set(allocation.resource_id, current + hours);
      }

      const utilizationValues = Array.from(resourceUtilization.values());
      const averageUtilization = utilizationValues.length > 0 
        ? utilizationValues.reduce((a, b) => a + b, 0) / utilizationValues.length / (days * 8) // 8 hours per day
        : 0;

      return {
        total_allocations: totalAllocations,
        success_rate: totalAllocations > 0 ? successfulAllocations / totalAllocations : 0,
        average_utilization: averageUtilization,
        conflict_rate: totalAllocations > 0 ? conflictedAllocations / totalAllocations : 0,
        optimization_score: this.calculateOptimizationScore(allocations),
        bottleneck_resources: this.identifyBottlenecks(resourceUtilization)
      };
    } catch (error) {
      console.error('❌ Error getting allocation metrics:', error);
      return {
        total_allocations: 0,
        success_rate: 0,
        average_utilization: 0,
        conflict_rate: 0,
        optimization_score: 0,
        bottleneck_resources: []
      };
    }
  }

  /**
   * Calculate overall optimization score
   */
  private calculateOptimizationScore(allocations: ResourceAllocation[]): number {
    if (allocations.length === 0) return 0;

    // Simple optimization score based on successful allocations and efficiency
    const successRate = allocations.filter(a => a.status === 'completed').length / allocations.length;
    const efficiencyScore = 0.85; // Would be calculated from actual performance data
    
    return (successRate * 0.6 + efficiencyScore * 0.4) * 100;
  }

  /**
   * Identify bottleneck resources
   */
  private identifyBottlenecks(utilization: Map<string, number>): string[] {
    const bottlenecks: string[] = [];
    const threshold = 7 * 8; // 7 days * 8 hours = 56 hours threshold

    for (const [resourceId, hours] of utilization) {
      if (hours > threshold) {
        bottlenecks.push(resourceId);
      }
    }

    return bottlenecks;
  }

  /**
   * Optimize existing allocations
   */
  async optimizeExistingAllocations(date: Date): Promise<{
    optimizations: Array<{
      original: ResourceAllocation;
      optimized: ResourceAllocation;
      improvement: number;
    }>;
    totalImprovement: number;
  }> {
    try {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const allocations = await this.resourceManager.getAllocations(
        undefined,
        startOfDay,
        endOfDay
      );

      const optimizations: Array<{
        original: ResourceAllocation;
        optimized: ResourceAllocation;
        improvement: number;
      }> = [];

      // Implementation for optimization logic would go here
      // This is a placeholder for the complex optimization algorithm

      return {
        optimizations,
        totalImprovement: 0
      };
    } catch (error) {
      console.error('❌ Error optimizing allocations:', error);
      return {
        optimizations: [],
        totalImprovement: 0
      };
    }
  }
}

export default AllocationEngine;