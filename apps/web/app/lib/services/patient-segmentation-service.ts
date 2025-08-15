import type {
  CreateSegmentationRuleRequest,
  CreateSegmentRequest,
  EngagementLevel,
  PatientBehaviorAnalysis,
  PatientSegment,
  SegmentAnalytics,
  SegmentationRule,
  SegmentMembership,
  SegmentMembershipUpdate,
  SegmentPerformance,
} from '@/app/types/segmentation';
import { createClient } from '@/app/utils/supabase/server';

export class PatientSegmentationService {
  private async getSupabase() {
    return await createClient();
  }

  // AI Segmentation Engine
  async createAISegment(data: CreateSegmentRequest): Promise<PatientSegment> {
    const supabase = await this.getSupabase();

    // Generate AI-powered segment criteria
    const aiCriteria = await this.generateAICriteria(data);

    const { data: segment, error } = await supabase
      .from('patient_segments')
      .insert({
        name: data.segment_name,
        description: data.description,
        criteria: aiCriteria,
        ai_model_used: data.ai_model || 'behavioral_clustering_v2',
        accuracy_score: data.expected_accuracy || 0.85,
        segment_type: data.segment_type,
        is_active: true,
        clinic_id: '89084c3a-9200-4058-a15a-b440d3c60687', // TODO: Get from user context
      })
      .select()
      .single();

    if (error) throw error;

    // Generate initial segment memberships
    await this.generateSegmentMemberships(segment.id, aiCriteria);

    return segment;
  }

  async getPatientSegments(filters?: {
    is_active?: boolean;
    segment_type?: string;
    min_accuracy?: number;
  }): Promise<PatientSegment[]> {
    const supabase = await this.getSupabase();

    let query = supabase.from('patient_segments').select(`
        *,
        segment_memberships:segment_memberships(count),
        segment_performance:segment_performance(*)
      `);

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.segment_type) {
      query = query.eq('segment_type', filters.segment_type);
    }

    if (filters?.min_accuracy) {
      query = query.gte('accuracy_score', filters.min_accuracy);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  // Multi-dimensional Segmentation
  async analyzePatientsForSegmentation(
    _segmentId: string
  ): Promise<PatientBehaviorAnalysis[]> {
    const supabase = await this.getSupabase();

    // Get patient data with comprehensive analysis
    const { data: patients, error } = await supabase.from('profiles').select(`
        id,
        full_name,
        email,
        phone,
        birth_date,
        gender,
        address,
        appointments:appointments(
          id,
          appointment_date,
          status,
          treatment_type,
          total_amount
        ),
        preferences:user_preferences(*),
        treatment_history:treatment_records(*)
      `);

    if (error) throw error;

    // Apply AI analysis for each patient
    const analyses = await Promise.all(
      patients.map(async (patient) => {
        return await this.generatePatientBehaviorAnalysis(patient);
      })
    );

    return analyses;
  }

  async updateSegmentMemberships(
    updates: SegmentMembershipUpdate[]
  ): Promise<void> {
    const supabase = await this.getSupabase();

    // Batch update segment memberships
    const { error } = await supabase.from('segment_memberships').upsert(
      updates.map((update) => ({
        patient_id: update.patient_id,
        segment_id: update.segment_id,
        membership_score: update.membership_score,
        join_date: update.join_date || new Date().toISOString(),
        last_updated: new Date().toISOString(),
        engagement_level: update.engagement_level,
        lifetime_value_prediction: update.lifetime_value_prediction,
      }))
    );

    if (error) throw error;
  }

  // Automated Segment Management
  async createAutomatedSegment(
    rule: CreateSegmentationRuleRequest
  ): Promise<SegmentationRule> {
    const supabase = await this.getSupabase();

    const { data: segmentationRule, error } = await supabase
      .from('segmentation_rules')
      .insert({
        rule_name: rule.rule_name,
        description: rule.description,
        conditions: rule.conditions,
        ai_recommendations: await this.generateAIRecommendations(
          rule.conditions
        ),
        is_active: true,
        auto_execute: rule.auto_execute,
        execution_schedule: rule.execution_schedule,
      })
      .select()
      .single();

    if (error) throw error;

    // Execute rule immediately if auto_execute is true
    if (rule.auto_execute) {
      await this.executeSegmentationRule(segmentationRule.id);
    }

    return segmentationRule;
  }

  async executeSegmentationRule(ruleId: string): Promise<PatientSegment> {
    const supabase = await this.getSupabase();

    // Get rule details
    const { data: rule, error: ruleError } = await supabase
      .from('segmentation_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (ruleError) throw ruleError;

    // Create segment based on rule
    const segment = await this.createAISegment({
      segment_name: `${rule.rule_name}_${new Date().toISOString().split('T')[0]}`,
      description: `Auto-generated segment from rule: ${rule.rule_name}`,
      criteria: rule.conditions,
      segment_type: 'ai_generated',
      ai_model: 'rule_based_v1',
    });

    // Update rule performance metrics
    await this.updateRulePerformance(ruleId, segment.id);

    return segment;
  }

  // Performance Tracking & Analytics
  async getSegmentPerformance(segmentId: string): Promise<SegmentPerformance> {
    const supabase = await this.getSupabase();

    const { data: performance, error } = await supabase
      .from('segment_performance')
      .select('*')
      .eq('segment_id', segmentId)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!performance) {
      // Generate performance metrics if not exists
      return await this.generateSegmentPerformance(segmentId);
    }

    return performance;
  }

  async getSegmentAnalytics(segmentId: string): Promise<SegmentAnalytics> {
    const _supabase = await this.getSupabase();

    // Get comprehensive analytics
    const [memberships, performance, trends] = await Promise.all([
      this.getSegmentMemberships(segmentId),
      this.getSegmentPerformance(segmentId),
      this.getSegmentTrends(segmentId),
    ]);

    return {
      segment_id: segmentId,
      total_members: memberships.length,
      active_members: memberships.filter((m) => m.engagement_level === 'high')
        .length,
      average_membership_score:
        memberships.reduce((sum, m) => sum + m.membership_score, 0) /
          memberships.length || 0,
      avg_lifetime_value: this.calculateAverageLifetimeValue(memberships),
      engagement_rate: performance.engagement_rate || 0,
      conversion_rate: performance.conversion_rate || 0,
      retention_rate: performance.retention_rate || 0,
      top_characteristics: [
        'High engagement',
        'Premium treatments',
        'Regular visits',
      ],
      performance_summary: {
        retention_rate: performance.retention_rate || 0,
        engagement_score: performance.engagement_rate || 0,
        revenue_per_member: performance.avg_lifetime_value || 0,
        conversion_rate: performance.conversion_rate || 0,
        growth_rate: 0.15,
      },
      trends,
      last_updated: new Date().toISOString(),
    };
  }

  // Privacy & Compliance Management
  async getPatientConsentStatus(patientId: string): Promise<{
    segmentation_consent: boolean;
    marketing_consent: boolean;
    analytics_consent: boolean;
    last_updated: string;
  }> {
    const supabase = await this.getSupabase();

    const { data: consent, error } = await supabase
      .from('patient_consent')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return (
      consent || {
        segmentation_consent: false,
        marketing_consent: false,
        analytics_consent: false,
        last_updated: new Date().toISOString(),
      }
    );
  }

  async updatePatientConsent(
    patientId: string,
    consents: {
      segmentation_consent?: boolean;
      marketing_consent?: boolean;
      analytics_consent?: boolean;
    }
  ): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase.from('patient_consent').upsert({
      patient_id: patientId,
      ...consents,
      last_updated: new Date().toISOString(),
    });

    if (error) throw error;

    // Remove from segments if consent withdrawn
    if (consents.segmentation_consent === false) {
      await this.removePatientFromAllSegments(patientId);
    }
  }

  // AI Helper Methods
  private async generateAICriteria(data: CreateSegmentRequest): Promise<any> {
    // Simulate AI-powered criteria generation
    // In production, this would call actual ML models
    const criteria = {
      demographic: data.criteria?.demographic || {},
      behavioral: data.criteria?.behavioral || {},
      psychographic: data.criteria?.psychographic || {},
      ai_generated: true,
      confidence_score: 0.87,
      model_version: 'v2.1',
      generated_at: new Date().toISOString(),
    };

    return criteria;
  }

  private async generateAIRecommendations(_conditions: any): Promise<any> {
    // AI-powered recommendations for segment optimization
    return {
      optimization_suggestions: [
        'Consider adding treatment frequency as a criteria',
        'Include seasonal behavior patterns',
        'Add lifetime value thresholds',
      ],
      predicted_performance: {
        expected_size: '15-20% of patient base',
        estimated_engagement: '0.72',
        conversion_probability: '0.28',
      },
      similar_segments: [],
      confidence_score: 0.85,
    };
  }

  private async generatePatientBehaviorAnalysis(
    patient: any
  ): Promise<PatientBehaviorAnalysis> {
    // Comprehensive patient behavior analysis using AI
    const appointments = patient.appointments || [];
    const treatmentHistory = patient.treatment_history || [];

    return {
      patient_id: patient.id,
      demographic_profile: {
        age_group: this.calculateAgeGroup(patient.birth_date),
        gender: patient.gender,
        location_segment: this.extractLocationSegment(patient.address),
      },
      behavioral_profile: {
        visit_frequency: this.calculateVisitFrequency(appointments),
        treatment_preferences:
          this.analyzeTreatmentPreferences(treatmentHistory),
        engagement_level: this.calculateEngagementLevel(appointments),
        seasonal_patterns: this.analyzeSeasonalPatterns(appointments),
      },
      psychographic_profile: {
        lifestyle_indicators: this.extractLifestyleIndicators(
          patient.preferences
        ),
        value_orientation: this.analyzeValueOrientation(treatmentHistory),
        communication_preferences: this.analyzeCommPreferences(
          patient.preferences
        ),
      },
      predictive_scores: {
        lifetime_value: this.predictLifetimeValue(
          appointments,
          treatmentHistory
        ),
        churn_probability: this.calculateChurnProbability(appointments),
        treatment_propensity:
          this.calculateTreatmentPropensity(treatmentHistory),
        engagement_score: this.calculateEngagementScore(
          appointments,
          patient.preferences
        ),
      },
      last_analyzed: new Date().toISOString(),
    };
  }

  private async generateSegmentMemberships(
    segmentId: string,
    criteria: any
  ): Promise<void> {
    const supabase = await this.getSupabase();

    // Get all patients and analyze for segment membership
    const analyses = await this.analyzePatientsForSegmentation(segmentId);

    const memberships = analyses
      .filter((analysis) => this.matchesCriteria(analysis, criteria))
      .map((analysis) => ({
        patient_id: analysis.patient_id,
        segment_id: segmentId,
        membership_score: this.calculateMembershipScore(analysis, criteria),
        join_date: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        engagement_level: analysis.behavioral_profile.engagement_level,
        lifetime_value_prediction: analysis.predictive_scores.lifetime_value,
      }));

    if (memberships.length > 0) {
      const { error } = await supabase
        .from('segment_memberships')
        .insert(memberships);

      if (error) throw error;
    }
  }

  private async generateSegmentPerformance(
    segmentId: string
  ): Promise<SegmentPerformance> {
    const supabase = await this.getSupabase();

    const memberships = await this.getSegmentMemberships(segmentId);

    const performance = {
      segment_id: segmentId,
      total_members: memberships.length,
      active_members: memberships.filter((m) => m.engagement_level === 'high')
        .length,
      engagement_rate: this.calculateEngagementRate(memberships),
      conversion_rate: this.calculateConversionRate(memberships),
      retention_rate: this.calculateRetentionRate(memberships),
      avg_lifetime_value: this.calculateAverageLifetimeValue(memberships),
      revenue_generated: this.calculateRevenueGenerated(memberships),
      cost_per_acquisition: this.calculateCostPerAcquisition(memberships),
      roi: this.calculateROI(memberships),
      analysis_date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('segment_performance')
      .insert(performance)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Utility Methods
  private calculateAgeGroup(birthDate: string): string {
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  }

  private extractLocationSegment(address: any): string {
    // Extract location-based segment from address
    return address?.city || 'unknown';
  }

  private calculateVisitFrequency(appointments: any[]): string {
    const monthlyVisits = appointments.length / 12; // Assuming 12-month period
    if (monthlyVisits >= 4) return 'high';
    if (monthlyVisits >= 2) return 'medium';
    return 'low';
  }

  private analyzeTreatmentPreferences(treatmentHistory: any[]): string[] {
    return [...new Set(treatmentHistory.map((t) => t.treatment_type))];
  }

  private calculateEngagementLevel(appointments: any[]): EngagementLevel {
    const recentAppointments = appointments.filter(
      (a) =>
        new Date(a.appointment_date) >
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );

    if (recentAppointments.length >= 3) return 'high';
    if (recentAppointments.length >= 1) return 'medium';
    return 'low';
  }

  private analyzeSeasonalPatterns(appointments: any[]): any {
    // Analyze seasonal appointment patterns
    const monthlyCount = new Array(12).fill(0);
    appointments.forEach((apt) => {
      const month = new Date(apt.appointment_date).getMonth();
      monthlyCount[month]++;
    });

    return {
      peak_months: monthlyCount
        .map((count, index) => ({ month: index, count }))
        .filter((m) => m.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    };
  }

  private extractLifestyleIndicators(preferences: any): string[] {
    return preferences?.interests || [];
  }

  private analyzeValueOrientation(treatmentHistory: any[]): string {
    const avgSpend =
      treatmentHistory.reduce((sum, t) => sum + (t.amount || 0), 0) /
      treatmentHistory.length;
    if (avgSpend > 1000) return 'premium';
    if (avgSpend > 500) return 'value';
    return 'budget';
  }

  private analyzeCommPreferences(preferences: any): string[] {
    return preferences?.communication_channels || ['email'];
  }

  private predictLifetimeValue(
    appointments: any[],
    treatmentHistory: any[]
  ): number {
    const avgSpendPerVisit =
      treatmentHistory.reduce((sum, t) => sum + (t.amount || 0), 0) /
      treatmentHistory.length;
    const visitFrequency = appointments.length / 12; // Annual frequency
    return avgSpendPerVisit * visitFrequency * 3; // 3-year LTV
  }

  private calculateChurnProbability(appointments: any[]): number {
    const lastAppointment = appointments[appointments.length - 1];
    if (!lastAppointment) return 0.9;

    const daysSinceLastVisit =
      (Date.now() - new Date(lastAppointment.appointment_date).getTime()) /
      (24 * 60 * 60 * 1000);
    return Math.min(daysSinceLastVisit / 180, 0.9); // Max 90% churn probability
  }

  private calculateTreatmentPropensity(treatmentHistory: any[]): number {
    return Math.min(treatmentHistory.length / 10, 1.0); // Normalized by 10 treatments
  }

  private calculateEngagementScore(
    appointments: any[],
    preferences: any
  ): number {
    const recencyScore = this.calculateRecencyScore(appointments);
    const frequencyScore = this.calculateFrequencyScore(appointments);
    const preferencesScore = preferences ? 0.2 : 0;

    return (recencyScore + frequencyScore + preferencesScore) / 3;
  }

  private matchesCriteria(
    _analysis: PatientBehaviorAnalysis,
    _criteria: any
  ): boolean {
    // Implement criteria matching logic
    return true; // Simplified for now
  }

  private calculateMembershipScore(
    _analysis: PatientBehaviorAnalysis,
    _criteria: any
  ): number {
    // Calculate how well patient matches segment criteria
    return 0.75; // Simplified for now
  }

  private async getSegmentMemberships(
    segmentId: string
  ): Promise<SegmentMembership[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('segment_memberships')
      .select('*')
      .eq('segment_id', segmentId);

    if (error) throw error;
    return data || [];
  }

  private async getSegmentTrends(_segmentId: string): Promise<any> {
    // Get historical trends for segment
    return {
      membership_growth: [],
      engagement_trends: [],
      performance_trends: [],
    };
  }

  private calculateEngagementRate(memberships: SegmentMembership[]): number {
    const engaged = memberships.filter(
      (m) => m.engagement_level === 'high'
    ).length;
    return memberships.length > 0 ? engaged / memberships.length : 0;
  }

  private calculateConversionRate(_memberships: SegmentMembership[]): number {
    // Calculate conversion rate based on treatments/purchases
    return 0.25; // Simplified for now
  }

  private calculateRetentionRate(_memberships: SegmentMembership[]): number {
    // Calculate retention rate
    return 0.85; // Simplified for now
  }

  private calculateAverageLifetimeValue(
    memberships: SegmentMembership[]
  ): number {
    const total = memberships.reduce(
      (sum, m) => sum + (m.lifetime_value_prediction || 0),
      0
    );
    return memberships.length > 0 ? total / memberships.length : 0;
  }

  private calculateRevenueGenerated(memberships: SegmentMembership[]): number {
    return memberships.reduce(
      (sum, m) => sum + (m.lifetime_value_prediction || 0),
      0
    );
  }

  private calculateCostPerAcquisition(
    _memberships: SegmentMembership[]
  ): number {
    return 150; // Simplified for now
  }

  private calculateROI(memberships: SegmentMembership[]): number {
    const revenue = this.calculateRevenueGenerated(memberships);
    const cost =
      this.calculateCostPerAcquisition(memberships) * memberships.length;
    return cost > 0 ? (revenue - cost) / cost : 0;
  }

  private calculateRecencyScore(appointments: any[]): number {
    if (!appointments.length) return 0;

    const lastAppointment = appointments[appointments.length - 1];
    const daysSince =
      (Date.now() - new Date(lastAppointment.appointment_date).getTime()) /
      (24 * 60 * 60 * 1000);
    return Math.max(0, 1 - daysSince / 90); // Score decreases over 90 days
  }

  private calculateFrequencyScore(appointments: any[]): number {
    return Math.min(appointments.length / 12, 1.0); // Normalized by 12 appointments
  }

  private async updateRulePerformance(
    ruleId: string,
    segmentId: string
  ): Promise<void> {
    const supabase = await this.getSupabase();

    const performance = await this.getSegmentPerformance(segmentId);

    const { error } = await supabase
      .from('segmentation_rules')
      .update({
        performance_metrics: {
          last_execution: new Date().toISOString(),
          segments_created: 1,
          avg_accuracy: performance.conversion_rate,
          avg_segment_size: performance.total_members,
        },
        last_executed: new Date().toISOString(),
      })
      .eq('id', ruleId);

    if (error) throw error;
  }

  private async removePatientFromAllSegments(patientId: string): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from('segment_memberships')
      .delete()
      .eq('patient_id', patientId);

    if (error) throw error;
  }
}

export const patientSegmentationService = new PatientSegmentationService();
