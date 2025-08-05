// =====================================================
// NeonPro Intelligent Allocation Engine
// Story 2.4: Smart Resource Management - Task 2
// =====================================================

import { ResourceManager, Resource, ResourceType, AllocationRequest } from './resource-manager';

// =====================================================
// Types for Allocation Engine
// =====================================================

export interface AllocationCriteria {
  resourceType: ResourceType;
  startTime: string;
  endTime: string;
  requirements?: {
    category?: string;
    capacity?: number;
    skills?: string[];
    equipment?: string[];
    location?: string;
    amenities?: string[];
  };
  preferences?: {
    preferredResources?: string[];
    preferredStaff?: string[];
    avoidResources?: string[];
    prioritizeUtilization?: boolean;
    costOptimization?: boolean;
  };
  businessRules?: {
    maxConsecutiveHours?: number;
    minimumBreak?: number;
    maxDailyHours?: number;
    holidayRestrictions?: boolean;
  };
}

export interface AllocationSuggestion {
  resource: Resource;
  confidence: number; // 0-100
  score: number; // Optimization score
  reasoning: string[];
  alternatives?: Resource[];
  estimatedCost?: number;
  utilizationImpact?: number;
}

export interface AllocationOptimization {
  suggestions: AllocationSuggestion[];
  conflicts: Array<{
    resource_id: string;
    conflict_type: string;
    severity: string;
    resolution_options: string[];
  }>;
  optimization_metrics: {
    overall_efficiency: number;
    cost_efficiency: number;
    utilization_balance: number;
  };
}

export interface StaffWorkload {
  staff_id: string;
  name: string;
  total_hours: number;
  consecutive_hours: number;
  last_break: string | null;
  fatigue_score: number;
  efficiency_rating: number;
  available_skills: string[];
}

// =====================================================
// Intelligent Allocation Engine
// =====================================================

export class AllocationEngine {
  private resourceManager: ResourceManager;

  constructor() {
    this.resourceManager = new ResourceManager();
  }

  // =====================================================
  // Core Allocation Intelligence
  // =====================================================

  async suggestOptimalAllocation(
    clinicId: string,
    criteria: AllocationCriteria
  ): Promise<AllocationOptimization> {
    try {
      console.log('Starting optimal allocation suggestion for:', criteria);

      // Step 1: Get available resources
      const availableResources = await this.resourceManager.getAvailableResources(
        clinicId,
        criteria.startTime,
        criteria.endTime,
        criteria.resourceType,
        criteria.requirements
      );

      console.log(`Found ${availableResources.length} available resources`);

      // Step 2: Score and rank resources
      const suggestions = await this.scoreResources(
        availableResources,
        criteria
      );

      // Step 3: Check for potential conflicts
      const conflicts = await this.analyzeSystemConflicts(
        clinicId,
        criteria.startTime,
        criteria.endTime
      );

      // Step 4: Calculate optimization metrics
      const optimizationMetrics = await this.calculateOptimizationMetrics(
        clinicId,
        suggestions
      );

      return {
        suggestions,
        conflicts,
        optimization_metrics: optimizationMetrics
      };
    } catch (error) {
      console.error('Error in optimal allocation suggestion:', error);
      throw new Error('Failed to suggest optimal allocation');
    }
  }

  private async scoreResources(
    resources: Resource[],
    criteria: AllocationCriteria
  ): Promise<AllocationSuggestion[]> {
    const suggestions: AllocationSuggestion[] = [];

    for (const resource of resources) {
      const score = await this.calculateResourceScore(resource, criteria);
      const confidence = this.calculateConfidence(resource, criteria);
      const reasoning = this.generateReasoning(resource, criteria, score);
      const estimatedCost = this.calculateEstimatedCost(resource, criteria);
      const utilizationImpact = await this.calculateUtilizationImpact(resource, criteria);

      suggestions.push({
        resource,
        confidence,
        score,
        reasoning,
        estimatedCost,
        utilizationImpact
      });
    }

    // Sort by score (highest first)
    return suggestions.sort((a, b) => b.score - a.score);
  }

  private async calculateResourceScore(
    resource: Resource,
    criteria: AllocationCriteria
  ): Promise<number> {
    let score = 100; // Base score

    // Factor 1: Resource type match (perfect match = no penalty)
    if (resource.type !== criteria.resourceType) {
      score -= 50;
    }

    // Factor 2: Requirements matching
    if (criteria.requirements) {
      const req = criteria.requirements;
      
      // Category match
      if (req.category && resource.category !== req.category) {
        score -= 20;
      }
      
      // Capacity requirements
      if (req.capacity && resource.capacity < req.capacity) {
        score -= 30;
      }
      
      // Skills matching (for staff)
      if (req.skills && resource.type === 'staff') {
        const resourceSkills = resource.skills || [];
        const matchedSkills = req.skills.filter(skill => resourceSkills.includes(skill));
        const skillScore = (matchedSkills.length / req.skills.length) * 20;
        score += skillScore;
      }
      
      // Equipment requirements (for rooms)
      if (req.equipment && resource.type === 'room') {
        const resourceEquipment = resource.equipment_ids || [];
        const matchedEquipment = req.equipment.filter(eq => resourceEquipment.includes(eq));
        const equipmentScore = (matchedEquipment.length / req.equipment.length) * 15;
        score += equipmentScore;
      }
    }

    // Factor 3: Preferences
    if (criteria.preferences) {
      const pref = criteria.preferences;
      
      // Preferred resources bonus
      if (pref.preferredResources?.includes(resource.id)) {
        score += 25;
      }
      
      // Avoided resources penalty
      if (pref.avoidResources?.includes(resource.id)) {
        score -= 40;
      }
      
      // Cost optimization
      if (pref.costOptimization && resource.cost_per_hour) {
        // Lower cost = higher score
        const costFactor = Math.max(0, 100 - resource.cost_per_hour);
        score += costFactor * 0.1;
      }
    }

    // Factor 4: Current utilization (balance workload)
    const currentUtilization = await this.getCurrentUtilization(resource.id);
    if (currentUtilization < 50) {
      score += 10; // Bonus for underutilized resources
    } else if (currentUtilization > 90) {
      score -= 15; // Penalty for overutilized resources
    }

    // Factor 5: Staff workload and fatigue (for staff resources)
    if (resource.type === 'staff') {
      const workload = await this.getStaffWorkload(resource.id, criteria.startTime);
      if (workload.fatigue_score > 80) {
        score -= 25; // High fatigue penalty
      } else if (workload.fatigue_score < 30) {
        score += 15; // Well-rested bonus
      }
    }

    // Factor 6: Equipment maintenance status
    if (resource.type === 'equipment' && resource.next_maintenance) {
      const maintenanceDate = new Date(resource.next_maintenance);
      const appointmentDate = new Date(criteria.startTime);
      const daysUntilMaintenance = Math.ceil(
        (maintenanceDate.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilMaintenance <= 3) {
        score -= 30; // Close to maintenance
      } else if (daysUntilMaintenance <= 7) {
        score -= 10; // Moderate risk
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateConfidence(resource: Resource, criteria: AllocationCriteria): number {
    let confidence = 100;

    // Reduce confidence based on missing information
    if (!resource.specifications) confidence -= 5;
    if (!resource.usage_instructions) confidence -= 5;
    
    // Reduce confidence for complex requirements
    if (criteria.requirements) {
      const reqCount = Object.keys(criteria.requirements).length;
      if (reqCount > 3) confidence -= reqCount * 3;
    }

    // Reduce confidence for strict business rules
    if (criteria.businessRules) {
      const ruleCount = Object.keys(criteria.businessRules).length;
      confidence -= ruleCount * 5;
    }

    return Math.max(60, Math.min(100, confidence));
  }

  private generateReasoning(
    resource: Resource,
    criteria: AllocationCriteria,
    score: number
  ): string[] {
    const reasoning: string[] = [];

    if (score >= 90) {
      reasoning.push('Excellent match for all requirements');
    } else if (score >= 75) {
      reasoning.push('Good match with minor considerations');
    } else if (score >= 60) {
      reasoning.push('Adequate match with some limitations');
    } else {
      reasoning.push('Marginal match with significant considerations');
    }

    // Add specific reasoning based on resource characteristics
    if (resource.type === 'staff' && resource.skills?.length) {
      reasoning.push(`Staff has ${resource.skills.length} relevant skills`);
    }
    
    if (resource.type === 'room' && resource.amenities) {
      reasoning.push('Room has required amenities available');
    }
    
    if (resource.type === 'equipment' && resource.last_maintenance) {
      reasoning.push('Equipment recently maintained and operational');
    }

    // Add cost consideration
    if (resource.cost_per_hour) {
      reasoning.push(`Estimated cost: $${resource.cost_per_hour}/hour`);
    }

    return reasoning;
  }

  private calculateEstimatedCost(
    resource: Resource,
    criteria: AllocationCriteria
  ): number {
    const startTime = new Date(criteria.startTime);
    const endTime = new Date(criteria.endTime);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    return (resource.cost_per_hour || 0) * hours;
  }

  private async calculateUtilizationImpact(
    resource: Resource,
    criteria: AllocationCriteria
  ): Promise<number> {
    try {
      const currentUtilization = await this.getCurrentUtilization(resource.id);
      const startTime = new Date(criteria.startTime);
      const endTime = new Date(criteria.endTime);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Calculate impact on daily utilization
      const dailyHours = 8; // Assume 8-hour work day
      const utilizationIncrease = (hours / dailyHours) * 100;
      
      return currentUtilization + utilizationIncrease;
    } catch (error) {
      console.error('Error calculating utilization impact:', error);
      return 0;
    }
  }

  // =====================================================
  // Business Rules and Validation
  // =====================================================

  async validateBusinessRules(
    allocation: AllocationRequest,
    criteria: AllocationCriteria
  ): Promise<{ valid: boolean; violations: string[] }> {
    const violations: string[] = [];
    
    try {
      const resource = await this.resourceManager.getResourceById(allocation.resource_id);
      if (!resource) {
        violations.push('Resource not found');
        return { valid: false, violations };
      }

      // Check business rules if provided
      if (criteria.businessRules) {
        const rules = criteria.businessRules;
        
        // Check maximum consecutive hours (for staff)
        if (rules.maxConsecutiveHours && resource.type === 'staff') {
          const workload = await this.getStaffWorkload(resource.id, allocation.start_time);
          if (workload.consecutive_hours >= rules.maxConsecutiveHours) {
            violations.push(`Exceeds maximum consecutive hours (${rules.maxConsecutiveHours})`);
          }
        }
        
        // Check minimum break requirement
        if (rules.minimumBreak && resource.type === 'staff') {
          const workload = await this.getStaffWorkload(resource.id, allocation.start_time);
          if (workload.last_break) {
            const lastBreak = new Date(workload.last_break);
            const appointmentStart = new Date(allocation.start_time);
            const minutesSinceBreak = (appointmentStart.getTime() - lastBreak.getTime()) / (1000 * 60);
            
            if (minutesSinceBreak < rules.minimumBreak) {
              violations.push(`Insufficient break time (minimum ${rules.minimumBreak} minutes)`);
            }
          }
        }
        
        // Check maximum daily hours
        if (rules.maxDailyHours && resource.type === 'staff') {
          const workload = await this.getStaffWorkload(resource.id, allocation.start_time);
          const appointmentHours = (new Date(allocation.end_time).getTime() - new Date(allocation.start_time).getTime()) / (1000 * 60 * 60);
          
          if (workload.total_hours + appointmentHours > rules.maxDailyHours) {
            violations.push(`Exceeds maximum daily hours (${rules.maxDailyHours})`);
          }
        }
        
        // Check holiday restrictions
        if (rules.holidayRestrictions) {
          const appointmentDate = new Date(allocation.start_time);
          const isHoliday = await this.isHoliday(appointmentDate);
          if (isHoliday) {
            violations.push('Appointment scheduled on holiday');
          }
        }
      }

      return { valid: violations.length === 0, violations };
    } catch (error) {
      console.error('Error validating business rules:', error);
      violations.push('Error validating business rules');
      return { valid: false, violations };
    }
  }

  // =====================================================
  // Conflict Analysis
  // =====================================================

  private async analyzeSystemConflicts(
    clinicId: string,
    startTime: string,
    endTime: string
  ): Promise<Array<{
    resource_id: string;
    conflict_type: string;
    severity: string;
    resolution_options: string[];
  }>> {
    try {
      const conflicts = [];
      const resources = await this.resourceManager.getResources(clinicId);

      for (const resource of resources) {
        const resourceConflicts = await this.resourceManager.detectConflicts(
          resource.id,
          startTime,
          endTime
        );

        if (resourceConflicts.length > 0) {
          conflicts.push({
            resource_id: resource.id,
            conflict_type: 'scheduling_overlap',
            severity: resourceConflicts.length > 2 ? 'high' : 'medium',
            resolution_options: [
              'Find alternative resource',
              'Reschedule appointment',
              'Extend appointment duration',
              'Split into multiple sessions'
            ]
          });
        }
      }

      return conflicts;
    } catch (error) {
      console.error('Error analyzing system conflicts:', error);
      return [];
    }
  }

  // =====================================================
  // Optimization Metrics
  // =====================================================

  private async calculateOptimizationMetrics(
    clinicId: string,
    suggestions: AllocationSuggestion[]
  ): Promise<{
    overall_efficiency: number;
    cost_efficiency: number;
    utilization_balance: number;
  }> {
    try {
      let totalScore = 0;
      let totalCost = 0;
      let totalUtilization = 0;

      for (const suggestion of suggestions) {
        totalScore += suggestion.score;
        totalCost += suggestion.estimatedCost || 0;
        totalUtilization += suggestion.utilizationImpact || 0;
      }

      const count = suggestions.length || 1;
      
      return {
        overall_efficiency: Math.round(totalScore / count),
        cost_efficiency: Math.round(100 - (totalCost / count)), // Inverse of cost
        utilization_balance: Math.round(100 - Math.abs(50 - (totalUtilization / count))) // Closer to 50% = better balance
      };
    } catch (error) {
      console.error('Error calculating optimization metrics:', error);
      return {
        overall_efficiency: 0,
        cost_efficiency: 0,
        utilization_balance: 0
      };
    }
  }

  // =====================================================
  // Helper Methods
  // =====================================================

  private async getCurrentUtilization(resourceId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const allocations = await this.resourceManager.getAllocations(
        resourceId,
        `${today}T00:00:00Z`,
        `${today}T23:59:59Z`
      );

      // Calculate utilization for today
      const totalMinutes = 8 * 60; // 8 hour work day
      const allocatedMinutes = allocations.reduce((sum, allocation) => {
        const start = new Date(allocation.start_time);
        const end = new Date(allocation.end_time);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0);

      return (allocatedMinutes / totalMinutes) * 100;
    } catch (error) {
      console.error('Error getting current utilization:', error);
      return 0;
    }
  }

  private async getStaffWorkload(staffId: string, appointmentTime: string): Promise<StaffWorkload> {
    try {
      const appointmentDate = new Date(appointmentTime).toISOString().split('T')[0];
      const allocations = await this.resourceManager.getAllocations(
        staffId,
        `${appointmentDate}T00:00:00Z`,
        `${appointmentDate}T23:59:59Z`
      );

      // Calculate workload metrics
      let totalHours = 0;
      let consecutiveHours = 0;
      const lastBreak: string | null = null;

      for (const allocation of allocations) {
        const start = new Date(allocation.start_time);
        const end = new Date(allocation.end_time);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
        
        // Simplified consecutive hours calculation
        if (allocation.status === 'completed' || allocation.status === 'in_use') {
          consecutiveHours += hours;
        }
      }

      // Calculate fatigue score (simplified)
      const fatigueScore = Math.min(100, (totalHours / 8) * 100);
      
      // Get staff details
      const staff = await this.resourceManager.getResourceById(staffId);

      return {
        staff_id: staffId,
        name: staff?.name || 'Unknown Staff',
        total_hours: totalHours,
        consecutive_hours: consecutiveHours,
        last_break: lastBreak,
        fatigue_score: fatigueScore,
        efficiency_rating: Math.max(0, 100 - fatigueScore),
        available_skills: staff?.skills || []
      };
    } catch (error) {
      console.error('Error getting staff workload:', error);
      return {
        staff_id: staffId,
        name: 'Unknown Staff',
        total_hours: 0,
        consecutive_hours: 0,
        last_break: null,
        fatigue_score: 0,
        efficiency_rating: 100,
        available_skills: []
      };
    }
  }

  private async isHoliday(date: Date): Promise<boolean> {
    // Simplified holiday check - can be enhanced with real holiday API
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Weekend
  }

  // =====================================================
  // Advanced Allocation Strategies
  // =====================================================

  async optimizeStaffWorkload(
    clinicId: string,
    date: string
  ): Promise<{
    recommendations: Array<{
      staff_id: string;
      current_workload: number;
      optimal_workload: number;
      rebalancing_actions: string[];
    }>;
    efficiency_improvement: number;
  }> {
    try {
      const staffResources = await this.resourceManager.getResources(clinicId, { type: 'staff' });
      const recommendations = [];
      let totalImprovement = 0;

      for (const staff of staffResources) {
        const workload = await this.getStaffWorkload(staff.id, `${date}T09:00:00Z`);
        const optimalWorkload = 7; // 7 hours optimal
        const currentWorkload = workload.total_hours;
        
        const actions: string[] = [];
        
        if (currentWorkload < 5) {
          actions.push('Add more appointments to increase utilization');
          actions.push('Consider cross-training for additional services');
          totalImprovement += (optimalWorkload - currentWorkload) * 10;
        } else if (currentWorkload > 8) {
          actions.push('Redistribute appointments to other staff');
          actions.push('Consider adding break time');
          totalImprovement += (currentWorkload - optimalWorkload) * 5;
        } else {
          actions.push('Workload is optimal');
        }

        recommendations.push({
          staff_id: staff.id,
          current_workload: currentWorkload,
          optimal_workload: optimalWorkload,
          rebalancing_actions: actions
        });
      }

      return {
        recommendations,
        efficiency_improvement: Math.round(totalImprovement / staffResources.length)
      };
    } catch (error) {
      console.error('Error optimizing staff workload:', error);
      throw new Error('Failed to optimize staff workload');
    }
  }
}
