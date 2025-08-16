// Story 9.2: Personalized Treatment Recommendations - Backend Service
// AI-powered personalized treatment recommendation engine

import type {
  ApproveRecommendationRequest,
  CreatePersonalizationFactorRequest,
  CreateRecommendationFeedbackRequest,
  CreateRecommendationProfileRequest,
  CreateTreatmentRecommendationRequest,
  PersonalizationFactor,
  PersonalizationInsights,
  PersonalizedRecommendationResult,
  RecommendationAnalytics,
  RecommendationFeedback,
  RecommendationPerformance,
  RecommendationProfile,
  RecommendationWithDetails,
  RecordPerformanceRequest,
  RiskAssessment,
  SafetyProfile,
  TreatmentAlternative,
  TreatmentOption,
  TreatmentRecommendation,
  UpdateRecommendationProfileRequest,
  UpdateSafetyProfileRequest,
} from '../../types/personalized-recommendations';
import { createClient } from '../../utils/supabase/server';

// Query interfaces for this service
type RecommendationQuery = {
  patient_id?: string;
  provider_id?: string;
  status?: string;
  recommendation_type?: string;
  limit: number;
  offset: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
};

type FeedbackQuery = {
  recommendation_id?: string;
  provider_id?: string;
  feedback_type?: string;
  adoption_status?: string;
  limit: number;
  offset: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
};

type PerformanceQuery = {
  recommendation_id?: string;
  patient_id?: string;
  date_from?: string;
  date_to?: string;
  min_adoption_rate?: number;
  min_effectiveness?: number;
  limit: number;
  offset: number;
};

export class PersonalizedRecommendationService {
  // Recommendation Profile Management
  async createRecommendationProfile(
    data: CreateRecommendationProfileRequest,
  ): Promise<RecommendationProfile> {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('recommendation_profiles')
      .insert({
        patient_id: data.patient_id,
        profile_data: data.profile_data,
        preference_weights: data.preference_weights || {},
        lifestyle_factors: data.lifestyle_factors || {},
        medical_preferences: data.medical_preferences || {},
        communication_preferences: data.communication_preferences || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create recommendation profile: ${error.message}`,
      );
    }
    return profile as RecommendationProfile;
  }

  async getRecommendationProfile(
    patientId: string,
  ): Promise<RecommendationProfile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('recommendation_profiles')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get recommendation profile: ${error.message}`);
    }

    return data as RecommendationProfile | null;
  }

  async updateRecommendationProfile(
    patientId: string,
    updates: UpdateRecommendationProfileRequest,
  ): Promise<RecommendationProfile> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('recommendation_profiles')
      .update(updates)
      .eq('patient_id', patientId)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to update recommendation profile: ${error.message}`,
      );
    }
    return data as RecommendationProfile;
  }

  // AI-Powered Recommendation Generation
  async generatePersonalizedRecommendations(
    patientId: string,
    treatmentCategory?: string,
  ): Promise<PersonalizedRecommendationResult> {
    // Get patient profile and personalization factors
    const profile = await this.getRecommendationProfile(patientId);
    const factors = await this.getPersonalizationFactors(patientId);
    const safetyProfile = await this.getSafetyProfile(patientId);

    // AI-powered recommendation engine (simplified simulation)
    const recommendations = await this.runRecommendationEngine(
      patientId,
      profile,
      factors,
      safetyProfile,
      treatmentCategory,
    );

    return {
      recommendations: recommendations.primary,
      personalization_score: recommendations.personalization_score,
      safety_assessment:
        safetyProfile || (await this.createDefaultSafetyProfile(patientId)),
      confidence_level: recommendations.confidence_level,
      explanation: recommendations.explanation,
      alternative_options: recommendations.alternatives,
    };
  }

  private async runRecommendationEngine(
    patientId: string,
    profile: RecommendationProfile | null,
    factors: PersonalizationFactor[],
    safetyProfile: SafetyProfile | null,
    category?: string,
  ): Promise<{
    primary: TreatmentRecommendation[];
    alternatives: TreatmentAlternative[];
    personalization_score: number;
    confidence_level: number;
    explanation: string;
  }> {
    // Simulated AI recommendation engine
    const baseRecommendations = await this.getBaseTreatmentOptions(category);
    const personalizedOptions = this.applyPersonalizationFactors(
      baseRecommendations,
      factors,
    );
    const safeOptions = this.applySafetyFiltering(
      personalizedOptions,
      safetyProfile,
    );

    const recommendations = await Promise.all(
      safeOptions.slice(0, 3).map(async (option, _index) => {
        const recommendation: TreatmentRecommendation = {
          id: '', // Will be set by database
          patient_id: patientId,
          provider_id: '', // Will be set by API
          recommendation_type: 'primary_treatment',
          treatment_options: [option],
          ranking_scores: { [option.id]: option.success_probability },
          rationale: `Personalized recommendation based on patient factors and safety profile. Success probability: ${(option.success_probability * 100).toFixed(1)}%`,
          success_probabilities: { [option.id]: option.success_probability },
          risk_assessments: {
            [option.id]: this.generateRiskAssessment(option, safetyProfile),
          },
          contraindications: safetyProfile?.contraindications || [],
          alternatives: [],
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return recommendation;
      }),
    );

    const alternatives = safeOptions.slice(3, 6).map(
      (option): TreatmentAlternative => ({
        option,
        ranking_score: option.success_probability * 0.8, // Slightly lower than primary
        comparison_rationale:
          'Alternative option with good suitability for patient profile',
        pros: [
          `${option.intensity} intensity`,
          'Good success rate',
          'Suitable for patient profile',
        ],
        cons: [
          'Lower ranking than primary options',
          'May require longer duration',
        ],
        suitability_score: option.success_probability * 0.85,
      }),
    );

    return {
      primary: recommendations,
      alternatives,
      personalization_score: this.calculatePersonalizationScore(
        factors,
        profile,
      ),
      confidence_level: this.calculateConfidenceLevel(factors, safetyProfile),
      explanation: this.generateExplanation(
        factors,
        safetyProfile,
        recommendations.length,
      ),
    };
  }

  private async getBaseTreatmentOptions(
    category?: string,
  ): Promise<TreatmentOption[]> {
    // Simulated base treatment options
    const options: TreatmentOption[] = [
      {
        id: 'treatment_1',
        name: 'Laser Facial Rejuvenation',
        type: 'aesthetic',
        description:
          'Advanced laser treatment for skin rejuvenation and anti-aging',
        duration: '4-6 sessions',
        intensity: 'moderate',
        cost_estimate: 1500,
        success_probability: 0.85,
        risk_level: 'low',
        contraindications: ['pregnancy', 'recent_sun_exposure'],
        requirements: ['consultation', 'patch_test'],
        alternatives: ['chemical_peel', 'microneedling'],
      },
      {
        id: 'treatment_2',
        name: 'Botox Anti-Aging Treatment',
        type: 'aesthetic',
        description:
          'Injectable treatment for wrinkle reduction and prevention',
        duration: '1 session, 3-4 month duration',
        intensity: 'minimal',
        cost_estimate: 800,
        success_probability: 0.92,
        risk_level: 'very_low',
        contraindications: ['neuromuscular_disorders', 'pregnancy'],
        requirements: ['medical_clearance'],
        alternatives: ['dermal_fillers', 'laser_treatment'],
      },
      {
        id: 'treatment_3',
        name: 'Chemical Peel Treatment',
        type: 'dermatological',
        description: 'Chemical exfoliation for skin texture improvement',
        duration: '2-4 sessions',
        intensity: 'mild',
        cost_estimate: 600,
        success_probability: 0.78,
        risk_level: 'low',
        contraindications: ['sensitive_skin', 'recent_laser'],
        requirements: ['skin_preparation'],
        alternatives: ['microdermabrasion', 'laser_resurfacing'],
      },
      {
        id: 'treatment_4',
        name: 'Dermal Filler Enhancement',
        type: 'cosmetic',
        description: 'Injectable volume enhancement for facial contouring',
        duration: '1-2 sessions',
        intensity: 'moderate',
        cost_estimate: 1200,
        success_probability: 0.88,
        risk_level: 'low',
        contraindications: ['autoimmune_disorders', 'blood_thinners'],
        requirements: ['consultation', 'medical_history'],
        alternatives: ['fat_transfer', 'thread_lift'],
      },
      {
        id: 'treatment_5',
        name: 'Microneedling Therapy',
        type: 'therapeutic',
        description: 'Collagen induction therapy for skin improvement',
        duration: '3-6 sessions',
        intensity: 'mild',
        cost_estimate: 400,
        success_probability: 0.75,
        risk_level: 'very_low',
        contraindications: ['active_acne', 'blood_disorders'],
        requirements: ['consultation'],
        alternatives: ['laser_therapy', 'chemical_peel'],
      },
    ];

    return category ? options.filter((opt) => opt.type === category) : options;
  }

  private applyPersonalizationFactors(
    options: TreatmentOption[],
    factors: PersonalizationFactor[],
  ): TreatmentOption[] {
    return options.map((option) => {
      let adjustedProbability = option.success_probability;

      // Apply age factor
      const ageFactor = factors.find(
        (f) =>
          f.factor_type === 'demographic' &&
          f.factor_category === 'age_related',
      );
      if (ageFactor) {
        const age = ageFactor.factor_value.age;
        if (age < 30) {
          adjustedProbability *= 1.1; // Better results for younger patients
        } else if (age > 60) {
          adjustedProbability *= 0.95; // Slightly lower for older patients
        }
      }

      // Apply treatment history factor
      const historyFactor = factors.find(
        (f) =>
          f.factor_type === 'medical_history' &&
          f.factor_category === 'treatment_history',
      );
      if (historyFactor) {
        const previousTreatments =
          historyFactor.factor_value.previous_treatments || [];
        if (previousTreatments.includes(option.type)) {
          adjustedProbability *= 1.05; // Boost for familiar treatment types
        }
      }

      // Apply lifestyle factors
      const lifestyleFactor = factors.find(
        (f) => f.factor_type === 'lifestyle',
      );
      if (lifestyleFactor) {
        const sunExposure = lifestyleFactor.factor_value.sun_exposure;
        if (sunExposure === 'high' && option.type === 'aesthetic') {
          adjustedProbability *= 0.9; // Lower success for high sun exposure
        }
      }

      return {
        ...option,
        success_probability: Math.max(0.1, Math.min(0.99, adjustedProbability)),
      };
    });
  }

  private applySafetyFiltering(
    options: TreatmentOption[],
    safetyProfile: SafetyProfile | null,
  ): TreatmentOption[] {
    if (!safetyProfile) {
      return options;
    }

    return options.filter((option) => {
      // Check contraindications
      const hasContraindication = safetyProfile.contraindications.some(
        (contraindication) =>
          option.contraindications.includes(contraindication.description),
      );

      // Check allergies
      const hasAllergy = safetyProfile.allergies.some((allergy) =>
        option.contraindications.includes(allergy.allergen),
      );

      return !(hasContraindication || hasAllergy);
    });
  }

  private generateRiskAssessment(
    option: TreatmentOption,
    safetyProfile: SafetyProfile | null,
  ): RiskAssessment {
    const riskFactors = safetyProfile?.risk_factors || [];

    return {
      risk_level: option.risk_level,
      risk_factors: riskFactors.map((rf) => ({
        id: rf.id,
        factor_name: rf.factor_name,
        factor_type: rf.factor_type,
        risk_level: rf.risk_level,
        description: rf.description,
        mitigation_strategies: rf.mitigation_strategies,
      })),
      mitigation_strategies: [
        'Follow pre-treatment instructions',
        'Monitor for adverse reactions',
        'Schedule follow-up appointments',
      ],
      monitoring_requirements: [
        'Post-treatment observation',
        'Regular progress assessments',
        'Side effect monitoring',
      ],
      safety_precautions: [
        'Proper patient preparation',
        'Sterile technique',
        'Emergency protocols ready',
      ],
    };
  }

  private calculatePersonalizationScore(
    factors: PersonalizationFactor[],
    profile: RecommendationProfile | null,
  ): number {
    const factorCount = factors.length;
    const profileCompleteness = profile
      ? Object.keys(profile.profile_data).length / 10
      : 0; // Assume 10 key fields

    return Math.min(1.0, factorCount * 0.1 + profileCompleteness * 0.5);
  }

  private calculateConfidenceLevel(
    factors: PersonalizationFactor[],
    safetyProfile: SafetyProfile | null,
  ): number {
    const factorConfidence =
      factors.reduce((sum, f) => sum + f.confidence_score, 0) /
      Math.max(factors.length, 1);
    const safetyCompleteness = safetyProfile ? 0.9 : 0.5; // Higher confidence with complete safety profile

    return factorConfidence * 0.7 + safetyCompleteness * 0.3;
  }

  private generateExplanation(
    factors: PersonalizationFactor[],
    safetyProfile: SafetyProfile | null,
    recommendationCount: number,
  ): string {
    const factorTypes = Array.from(new Set(factors.map((f) => f.factor_type)));
    const hasCommonFactors =
      factorTypes.includes('demographic') &&
      factorTypes.includes('medical_history');

    let explanation = `Generated ${recommendationCount} personalized recommendations based on `;

    if (hasCommonFactors) {
      explanation +=
        'comprehensive patient analysis including demographics, medical history, and preferences. ';
    } else {
      explanation += 'available patient data and clinical guidelines. ';
    }

    if (safetyProfile) {
      explanation +=
        'Safety profile reviewed for contraindications and risk factors. ';
    } else {
      explanation += 'Standard safety precautions applied. ';
    }

    explanation +=
      'Recommendations are ranked by success probability and patient suitability.';

    return explanation;
  }

  // Treatment Recommendation Management
  async createTreatmentRecommendation(
    data: CreateTreatmentRecommendationRequest & { provider_id: string },
  ): Promise<TreatmentRecommendation> {
    const supabase = await createClient();
    const { data: recommendation, error } = await supabase
      .from('treatment_recommendations')
      .insert({
        patient_id: data.patient_id,
        provider_id: data.provider_id,
        recommendation_type: data.recommendation_type,
        treatment_options: data.treatment_options,
        ranking_scores: {},
        rationale: data.rationale || 'AI-generated personalized recommendation',
        success_probabilities: {},
        risk_assessments: {},
        contraindications: [],
        alternatives: [],
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create treatment recommendation: ${error.message}`,
      );
    }
    return recommendation as TreatmentRecommendation;
  }

  async getTreatmentRecommendations(query: RecommendationQuery): Promise<{
    recommendations: RecommendationWithDetails[];
    total: number;
  }> {
    const supabase = await createClient();
    let queryBuilder = supabase.from('treatment_recommendations').select(
      `
        *,
        patient:patient_id(id, email, raw_user_meta_data),
        provider:provider_id(id, email, raw_user_meta_data)
      `,
      { count: 'exact' },
    );

    if (query.patient_id) {
      queryBuilder = queryBuilder.eq('patient_id', query.patient_id);
    }
    if (query.provider_id) {
      queryBuilder = queryBuilder.eq('provider_id', query.provider_id);
    }
    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }
    if (query.recommendation_type) {
      queryBuilder = queryBuilder.eq(
        'recommendation_type',
        query.recommendation_type,
      );
    }

    const { data, count, error } = await queryBuilder
      .order(query.sort_by, { ascending: query.sort_order === 'asc' })
      .range(query.offset, query.offset + query.limit - 1);

    if (error) {
      throw new Error(
        `Failed to get treatment recommendations: ${error.message}`,
      );
    }

    return {
      recommendations: (data || []) as RecommendationWithDetails[],
      total: count || 0,
    };
  }

  async getTreatmentRecommendation(
    id: string,
  ): Promise<RecommendationWithDetails | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('treatment_recommendations')
      .select(
        `
        *,
        patient:patient_id(id, email, raw_user_meta_data),
        provider:provider_id(id, email, raw_user_meta_data)
      `,
      )
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(
        `Failed to get treatment recommendation: ${error.message}`,
      );
    }

    return data as RecommendationWithDetails | null;
  }

  async approveRecommendation(
    id: string,
    approval: ApproveRecommendationRequest,
  ): Promise<TreatmentRecommendation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('treatment_recommendations')
      .update({
        status: 'approved',
        approved_by: approval.approved_by,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve recommendation: ${error.message}`);
    }
    return data as TreatmentRecommendation;
  }

  async rejectRecommendation(
    id: string,
    rejectedBy: string,
  ): Promise<TreatmentRecommendation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('treatment_recommendations')
      .update({
        status: 'rejected',
        approved_by: rejectedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject recommendation: ${error.message}`);
    }
    return data as TreatmentRecommendation;
  }

  // Feedback Management
  async createRecommendationFeedback(
    data: CreateRecommendationFeedbackRequest & { provider_id: string },
  ): Promise<RecommendationFeedback> {
    const supabase = await createClient();
    const { data: feedback, error } = await supabase
      .from('recommendation_feedback')
      .insert({
        recommendation_id: data.recommendation_id,
        provider_id: data.provider_id,
        feedback_type: data.feedback_type,
        adoption_status: data.adoption_status,
        quality_rating: data.quality_rating,
        usefulness_rating: data.usefulness_rating,
        accuracy_rating: data.accuracy_rating,
        comments: data.comments,
        improvement_suggestions: data.improvement_suggestions,
        would_recommend: data.would_recommend,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create recommendation feedback: ${error.message}`,
      );
    }
    return feedback as RecommendationFeedback;
  }

  async getRecommendationFeedback(query: FeedbackQuery): Promise<{
    feedback: RecommendationFeedback[];
    total: number;
  }> {
    const supabase = await createClient();
    let queryBuilder = supabase
      .from('recommendation_feedback')
      .select('*', { count: 'exact' });

    if (query.recommendation_id) {
      queryBuilder = queryBuilder.eq(
        'recommendation_id',
        query.recommendation_id,
      );
    }
    if (query.provider_id) {
      queryBuilder = queryBuilder.eq('provider_id', query.provider_id);
    }
    if (query.feedback_type) {
      queryBuilder = queryBuilder.eq('feedback_type', query.feedback_type);
    }
    if (query.adoption_status) {
      queryBuilder = queryBuilder.eq('adoption_status', query.adoption_status);
    }

    const { data, count, error } = await queryBuilder
      .order(query.sort_by, { ascending: query.sort_order === 'asc' })
      .range(query.offset, query.offset + query.limit - 1);

    if (error) {
      throw new Error(
        `Failed to get recommendation feedback: ${error.message}`,
      );
    }

    return {
      feedback: (data || []) as RecommendationFeedback[],
      total: count || 0,
    };
  }

  // Personalization Factor Management
  async createPersonalizationFactor(
    data: CreatePersonalizationFactorRequest,
  ): Promise<PersonalizationFactor> {
    const supabase = await createClient();
    const { data: factor, error } = await supabase
      .from('personalization_factors')
      .insert({
        patient_id: data.patient_id,
        factor_type: data.factor_type,
        factor_category: data.factor_category,
        factor_value: data.factor_value,
        weight: data.weight || 1.0,
        source: data.source,
        confidence_score: data.confidence_score || 0.5,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create personalization factor: ${error.message}`,
      );
    }
    return factor as PersonalizationFactor;
  }

  async getPersonalizationFactors(
    patientId: string,
  ): Promise<PersonalizationFactor[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('personalization_factors')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(
        `Failed to get personalization factors: ${error.message}`,
      );
    }
    return (data || []) as PersonalizationFactor[];
  }

  // Safety Profile Management
  async createDefaultSafetyProfile(patientId: string): Promise<SafetyProfile> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('safety_profiles')
      .insert({
        patient_id: patientId,
        allergies: [],
        contraindications: [],
        drug_interactions: [],
        medical_conditions: [],
        risk_factors: [],
        safety_alerts: [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create safety profile: ${error.message}`);
    }
    return data as SafetyProfile;
  }

  async getSafetyProfile(patientId: string): Promise<SafetyProfile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('safety_profiles')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get safety profile: ${error.message}`);
    }

    return data as SafetyProfile | null;
  }

  async updateSafetyProfile(
    patientId: string,
    updates: UpdateSafetyProfileRequest,
  ): Promise<SafetyProfile> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('safety_profiles')
      .update({
        ...updates,
        last_reviewed: new Date().toISOString(),
      })
      .eq('patient_id', patientId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update safety profile: ${error.message}`);
    }
    return data as SafetyProfile;
  }

  // Performance Tracking
  async recordRecommendationPerformance(
    data: RecordPerformanceRequest,
  ): Promise<RecommendationPerformance> {
    const supabase = await createClient();
    const { data: performance, error } = await supabase
      .from('recommendation_performance')
      .insert({
        recommendation_id: data.recommendation_id,
        patient_id: data.patient_id,
        adoption_rate: data.adoption_rate,
        effectiveness_score: data.effectiveness_score,
        patient_satisfaction: data.patient_satisfaction,
        provider_satisfaction: data.provider_satisfaction,
        outcome_quality: data.outcome_quality,
        time_to_adoption: data.time_to_adoption,
        success_indicators: data.success_indicators,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to record recommendation performance: ${error.message}`,
      );
    }
    return performance as RecommendationPerformance;
  }

  async getRecommendationPerformance(query: PerformanceQuery): Promise<{
    performance: RecommendationPerformance[];
    total: number;
  }> {
    const supabase = await createClient();
    let queryBuilder = supabase
      .from('recommendation_performance')
      .select('*', { count: 'exact' });

    if (query.recommendation_id) {
      queryBuilder = queryBuilder.eq(
        'recommendation_id',
        query.recommendation_id,
      );
    }
    if (query.patient_id) {
      queryBuilder = queryBuilder.eq('patient_id', query.patient_id);
    }
    if (query.date_from) {
      queryBuilder = queryBuilder.gte('measured_at', query.date_from);
    }
    if (query.date_to) {
      queryBuilder = queryBuilder.lte('measured_at', query.date_to);
    }
    if (query.min_adoption_rate) {
      queryBuilder = queryBuilder.gte('adoption_rate', query.min_adoption_rate);
    }
    if (query.min_effectiveness) {
      queryBuilder = queryBuilder.gte(
        'effectiveness_score',
        query.min_effectiveness,
      );
    }

    const { data, count, error } = await queryBuilder
      .order('measured_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (error) {
      throw new Error(
        `Failed to get recommendation performance: ${error.message}`,
      );
    }

    return {
      performance: (data || []) as RecommendationPerformance[],
      total: count || 0,
    };
  }

  // Analytics and Insights
  async getRecommendationAnalytics(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<RecommendationAnalytics> {
    const supabase = await createClient();
    const query = supabase.from('treatment_recommendations').select('*');

    if (dateFrom) {
      query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query.lte('created_at', dateTo);
    }

    const { data: recommendations, error } = await query;
    if (error) {
      throw new Error(
        `Failed to get recommendation analytics: ${error.message}`,
      );
    }

    const feedbackQuery = supabase.from('recommendation_feedback').select('*');

    if (dateFrom) {
      feedbackQuery.gte('created_at', dateFrom);
    }
    if (dateTo) {
      feedbackQuery.lte('created_at', dateTo);
    }

    const { data: feedback } = await feedbackQuery;

    // Calculate analytics
    const totalRecommendations = recommendations?.length || 0;
    const adoptedFeedback =
      feedback?.filter((f: any) => f.adoption_status === 'adopted') || [];
    const adoptionRate =
      totalRecommendations > 0
        ? (adoptedFeedback.length / totalRecommendations) * 100
        : 0;

    const qualityRatings =
      feedback?.map((f: any) => f.quality_rating).filter((r: any) => r) || [];
    const usefulnessRatings =
      feedback?.map((f: any) => f.usefulness_rating).filter((r: any) => r) ||
      [];
    const accuracyRatings =
      feedback?.map((f: any) => f.accuracy_rating).filter((r: any) => r) || [];

    const avgQuality =
      qualityRatings.length > 0
        ? qualityRatings.reduce((sum: number, r: number) => sum + r, 0) /
          qualityRatings.length
        : 0;
    const avgUsefulness =
      usefulnessRatings.length > 0
        ? usefulnessRatings.reduce((sum: number, r: number) => sum + r, 0) /
          usefulnessRatings.length
        : 0;
    const avgAccuracy =
      accuracyRatings.length > 0
        ? accuracyRatings.reduce((sum: number, r: number) => sum + r, 0) /
          accuracyRatings.length
        : 0;

    return {
      total_recommendations: totalRecommendations,
      adoption_rate: adoptionRate,
      average_quality_rating: avgQuality,
      average_usefulness_rating: avgUsefulness,
      average_accuracy_rating: avgAccuracy,
      most_recommended_treatments: [],
      highest_success_rates: [],
      user_acceptance_rate: adoptionRate,
      performance_trends: [],
    };
  }

  async getPersonalizationInsights(
    patientId?: string,
  ): Promise<PersonalizationInsights> {
    const supabase = await createClient();
    let factorsQuery = supabase.from('personalization_factors').select('*');

    if (patientId) {
      factorsQuery = factorsQuery.eq('patient_id', patientId);
    }

    const { data: factors } = await factorsQuery;

    // Calculate insights
    const mostInfluential = (factors || [])
      .sort(
        (a: any, b: any) =>
          b.weight * b.confidence_score - a.weight * a.confidence_score,
      )
      .slice(0, 10);

    return {
      most_influential_factors: mostInfluential as PersonalizationFactor[],
      patient_preferences_distribution: {},
      safety_profile_statistics: {},
      customization_patterns: {},
    };
  }
}

// Export service instance
export const personalizedRecommendationsService =
  new PersonalizedRecommendationService();
