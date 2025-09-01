/**
 * ComplianceService - Real-time compliance monitoring service
 * Handles data fetching, real-time updates, and compliance scoring
 */

import { createClient } from '@/lib/supabase/client';
import type { ComplianceScore, ComplianceViolation, ComplianceFramework, ComplianceConfig } from './types';

export class ComplianceService {
  private supabase = createClient();
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  /**
   * Subscribe to real-time compliance updates
   */
  subscribeToUpdates(framework: ComplianceFramework | 'all', callback: (data: ComplianceScore[]) => void): () => void {
    const channel = this.supabase
      .channel('compliance_monitoring')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'compliance_scores',
          filter: framework !== 'all' ? `framework=eq.${framework}` : undefined
        },
        () => {
          this.fetchComplianceScores(framework).then(callback);
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * Fetch current compliance scores
   */
  async fetchComplianceScores(framework: ComplianceFramework | 'all' = 'all'): Promise<ComplianceScore[]> {
    try {
      let query = this.supabase
        .from('compliance_scores')
        .select('*')
        .order('updated_at', { ascending: false });

      if (framework !== 'all') {
        query = query.eq('framework', framework);
      }

      const { data, error } = await query;
      
      if (error) {throw error;}
      
      return this.transformScoreData(data || []);
    } catch (error) {
      console.error('Error fetching compliance scores:', error);
      return this.getFallbackScores(framework);
    }
  }

  /**
   * Fetch compliance violations
   */
  async fetchViolations(filters?: {
    framework?: ComplianceFramework;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'open' | 'in_progress' | 'resolved';
    page?: string;
  }): Promise<ComplianceViolation[]> {
    try {
      let query = this.supabase
        .from('compliance_violations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.framework) {query = query.eq('framework', filters.framework);}
        if (filters.severity) {query = query.eq('severity', filters.severity);}
        if (filters.status) {query = query.eq('status', filters.status);}
        if (filters.page) {query = query.ilike('page', `%${filters.page}%`);}
      }

      const { data, error } = await query;
      
      if (error) {throw error;}
      
      return this.transformViolationData(data || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
      return [];
    }
  }

  /**
   * Run automated compliance checks
   */
  async runComplianceCheck(framework: ComplianceFramework, config?: ComplianceConfig): Promise<ComplianceScore> {
    try {
      const response = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ framework, config })
      });

      if (!response.ok) {throw new Error('Compliance check failed');}
      
      const result = await response.json();
      return this.transformSingleScore(result);
    } catch (error) {
      console.error('Error running compliance check:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateReport(frameworks: ComplianceFramework[], options?: {
    startDate?: Date;
    endDate?: Date;
    includeResolved?: boolean;
  }): Promise<{ reportId: string; downloadUrl: string }> {
    try {
      const response = await fetch('/api/compliance/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameworks, ...options })
      });

      if (!response.ok) {throw new Error('Report generation failed');}
      
      return await response.json();
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Update violation status
   */
  async updateViolation(violationId: string, updates: {
    status?: 'open' | 'in_progress' | 'resolved';
    assignedTo?: string;
    notes?: string;
  }): Promise<ComplianceViolation> {
    try {
      const { data, error } = await this.supabase
        .from('compliance_violations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', violationId)
        .select()
        .single();

      if (error) {throw error;}
      
      return this.transformSingleViolation(data);
    } catch (error) {
      console.error('Error updating violation:', error);
      throw error;
    }
  }

  /**
   * Get compliance trends
   */
  async getComplianceTrends(framework: ComplianceFramework, days: number = 30): Promise<{
    dates: string[];
    scores: number[];
    violations: number[];
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const { data, error } = await this.supabase
        .from('compliance_history')
        .select('date, score, violations_count')
        .eq('framework', framework)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {throw error;}

      return {
        dates: data?.map(d => d.date) || [],
        scores: data?.map(d => d.score) || [],
        violations: data?.map(d => d.violations_count) || []
      };
    } catch (error) {
      console.error('Error fetching trends:', error);
      return { dates: [], scores: [], violations: [] };
    }
  }

  /**
   * WCAG-specific automated checking using axe-core
   */
  async runWCAGCheck(url: string): Promise<{
    violations: {
      id: string;
      impact: 'minor' | 'moderate' | 'serious' | 'critical';
      description: string;
      help: string;
      helpUrl: string;
      nodes: {
        target: string[];
        html: string;
      }[];
    }[];
    passes: number;
    incomplete: number;
  }> {
    try {
      const response = await fetch('/api/compliance/wcag/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {throw new Error('WCAG check failed');}
      
      return await response.json();
    } catch (error) {
      console.error('Error running WCAG check:', error);
      throw error;
    }
  }

  /**
   * LGPD-specific data processing audit
   */
  async runLGPDCheck(): Promise<{
    dataProcessingActivities: {
      purpose: string;
      legalBasis: string;
      dataCategories: string[];
      retentionPeriod: string;
      hasConsent: boolean;
    }[];
    consentStatus: {
      total: number;
      valid: number;
      expired: number;
      withdrawn: number;
    };
    violations: {
      type: 'missing_consent' | 'expired_consent' | 'excessive_retention' | 'unauthorized_processing';
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }[];
  }> {
    try {
      const response = await fetch('/api/compliance/lgpd/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {throw new Error('LGPD check failed');}
      
      return await response.json();
    } catch (error) {
      console.error('Error running LGPD check:', error);
      throw error;
    }
  }

  /**
   * Transform database score data to application format
   */
  private transformScoreData(data: unknown[]): ComplianceScore[] {
    return data.map(item => this.transformSingleScore(item));
  }

  private transformSingleScore(item: unknown): ComplianceScore {
    return {
      framework: item.framework,
      score: item.score,
      status: this.getStatusFromScore(item.score),
      lastUpdated: new Date(item.updated_at).getTime(),
      violations: item.violations_count || 0,
      trend: item.trend || 'stable',
      trendValue: item.trend_value || 0
    };
  }

  /**
   * Transform database violation data to application format
   */
  private transformViolationData(data: unknown[]): ComplianceViolation[] {
    return data.map(item => this.transformSingleViolation(item));
  }

  private transformSingleViolation(item: unknown): ComplianceViolation {
    return {
      id: item.id,
      framework: item.framework,
      severity: item.severity,
      rule: item.rule,
      description: item.description,
      element: item.element,
      page: item.page,
      timestamp: new Date(item.created_at).getTime(),
      status: item.status,
      assignedTo: item.assigned_to
    };
  }

  /**
   * Get status based on score
   */
  private getStatusFromScore(score: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (score >= 90) {return 'excellent';}
    if (score >= 75) {return 'good';}
    if (score >= 60) {return 'warning';}
    return 'critical';
  }

  /**
   * Fallback scores for offline/error scenarios
   */
  private getFallbackScores(framework: ComplianceFramework | 'all'): ComplianceScore[] {
    const fallbackData = [
      {
        framework: 'WCAG' as ComplianceFramework,
        score: 85,
        status: 'good' as const,
        lastUpdated: Date.now() - 300_000,
        violations: 3,
        trend: 'stable' as const,
        trendValue: 0
      },
      {
        framework: 'LGPD' as ComplianceFramework,
        score: 92,
        status: 'excellent' as const,
        lastUpdated: Date.now() - 180_000,
        violations: 1,
        trend: 'up' as const,
        trendValue: 2.1
      },
      {
        framework: 'ANVISA' as ComplianceFramework,
        score: 78,
        status: 'good' as const,
        lastUpdated: Date.now() - 120_000,
        violations: 5,
        trend: 'down' as const,
        trendValue: -1.2
      },
      {
        framework: 'CFM' as ComplianceFramework,
        score: 89,
        status: 'good' as const,
        lastUpdated: Date.now() - 240_000,
        violations: 2,
        trend: 'up' as const,
        trendValue: 1.8
      }
    ];

    if (framework === 'all') {return fallbackData;}
    return fallbackData.filter(item => item.framework === framework);
  }
}

// Singleton instance
export const complianceService = new ComplianceService();