/**
 * AI-powered Treatment Recommendation Engine
 * Provides intelligent treatment suggestions based on patient profile and evidence-based medicine
 * 
 * Features:
 * - Evidence-based treatment matching
 * - Success rate prediction for recommended treatments
 * - Treatment protocol optimization
 * - Alternative treatment ranking
 * - Combination therapy recommendations
 * - Integration with medical databases and guidelines
 */

import { Patient } from '@/types/patient';
import { TreatmentHistory, MedicalRecord, Treatment } from '@/types/treatment';
import { RiskAssessment } from './risk-assessment';

// Treatment Recommendation Types
export interface TreatmentRecommendation {
  id: string;
  treatment_name: string;
  treatment_type: 'aesthetic' | 'wellness' | 'medical' | 'preventive';
  recommendation_score: number; // 0-100 scale
  success_probability: number; // 0-1 scale
  evidence_level: 'A' | 'B' | 'C' | 'D'; // Clinical evidence grades
  rationale: string;
  expected_outcomes: ExpectedOutcome[];
  contraindications: string[];
  prerequisites: string[];
  estimated_cost: number;
  estimated_duration: string;
  recovery_time: string;
  alternative_treatments: string[];
}

export interface ExpectedOutcome {
  outcome_type: 'improvement' | 'maintenance' | 'prevention';
  description: string;
  probability: number;
  timeframe: string;
  measurable_metrics: string[];
}

export interface TreatmentProtocol {
  id: string;
  name: string;
  steps: ProtocolStep[];
  total_duration: string;
  success_rate: number;
  patient_suitability_score: number;
  customizations: ProtocolCustomization[];
}

export interface ProtocolStep {
  step_number: number;
  description: string;
  duration: string;
  required_equipment: string[];
  precautions: string[];
  expected_results: string;
}

export interface ProtocolCustomization {
  parameter: string;
  standard_value: any;
  recommended_value: any;
  reason: string;
}

export interface TreatmentCombination {
  primary_treatment: string;
  complementary_treatments: string[];
  synergy_score: number;
  combined_success_rate: number;
  interaction_warnings: string[];
  optimal_sequencing: string[];
}

export interface EvidenceSource {
  source_type: 'clinical_trial' | 'meta_analysis' | 'case_study' | 'guideline';
  title: string;
  authors: string;
  publication_date: Date;
  sample_size?: number;
  confidence_level: number;
  relevance_score: number;
}

/**
 * AI Treatment Recommendation Engine
 * Core system for intelligent treatment suggestions and optimization
 */
export class AITreatmentRecommendationEngine {
  private treatmentDatabase: Map<string, Treatment> = new Map();
  private protocolDatabase: Map<string, TreatmentProtocol> = new Map();
  private evidenceDatabase: Map<string, EvidenceSource[]> = new Map();
  private successRateModels: Map<string, any> = new Map();

  constructor() {
    this.initializeTreatmentDatabase();
    this.initializeProtocolDatabase();
    this.loadEvidenceDatabase();
    this.loadSuccessRateModels();
  }

  /**
   * Generate comprehensive treatment recommendations for a patient
   */
  async generateRecommendations(
    patient: Patient,
    riskAssessment: RiskAssessment,
    treatmentHistory: TreatmentHistory[],
    medicalHistory: MedicalRecord[],
    treatmentGoals: string[]
  ): Promise<TreatmentRecommendation[]> {
    try {
      // Analyze patient profile and goals
      const patientProfile = this.analyzePatientProfile(
        patient,
        riskAssessment,
        treatmentHistory,
        medicalHistory
      );

      // Get candidate treatments based on goals
      const candidateTreatments = await this.identifyCandidateTreatments(
        treatmentGoals,
        patientProfile
      );

      // Score and rank treatments
      const scoredTreatments = await this.scoreTreatments(
        candidateTreatments,
        patientProfile,
        riskAssessment
      );

      // Generate detailed recommendations
      const recommendations = await this.generateDetailedRecommendations(
        scoredTreatments,
        patientProfile,
        riskAssessment
      );

      // Sort by recommendation score
      return recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score);
    } catch (error) {
      console.error('Treatment recommendation generation failed:', error);
      throw new Error('Failed to generate treatment recommendations');
    }
  }

  /**
   * Get optimized treatment protocol for specific treatment
   */
  async getOptimizedProtocol(
    treatmentId: string,
    patient: Patient,
    riskAssessment: RiskAssessment
  ): Promise<TreatmentProtocol> {
    const baseProtocol = this.protocolDatabase.get(treatmentId);
    if (!baseProtocol) {
      throw new Error(`Protocol not found for treatment: ${treatmentId}`);
    }

    // Customize protocol based on patient factors
    const customizations = this.generateProtocolCustomizations(
      baseProtocol,
      patient,
      riskAssessment
    );

    // Calculate patient suitability score
    const suitabilityScore = this.calculateProtocolSuitability(
      baseProtocol,
      patient,
      riskAssessment
    );

    return {
      ...baseProtocol,
      patient_suitability_score: suitabilityScore,
      customizations
    };
  }

  /**
   * Recommend treatment combinations with synergy analysis
   */
  async recommendTreatmentCombinations(
    primaryTreatment: string,
    patient: Patient,
    riskAssessment: RiskAssessment
  ): Promise<TreatmentCombination[]> {
    const combinations: TreatmentCombination[] = [];

    // Get compatible complementary treatments
    const complementaryTreatments = this.getCompatibleTreatments(
      primaryTreatment,
      patient,
      riskAssessment
    );

    for (const complementary of complementaryTreatments) {
      const combination = await this.analyzeTreatmentCombination(
        primaryTreatment,
        complementary,
        patient,
        riskAssessment
      );
      
      if (combination.synergy_score > 0.6) {
        combinations.push(combination);
      }
    }

    return combinations.sort((a, b) => b.synergy_score - a.synergy_score);
  }

  /**
   * Predict treatment success rate for specific patient
   */
  async predictTreatmentSuccess(
    treatmentId: string,
    patient: Patient,
    riskAssessment: RiskAssessment
  ): Promise<number> {
    const model = this.successRateModels.get(treatmentId);
    if (!model) {
      // Use baseline success rate if no specific model
      return this.getBaselineSuccessRate(treatmentId);
    }

    // Extract features for prediction
    const features = this.extractPredictionFeatures(patient, riskAssessment);
    
    // Apply ML model (simplified for demo)
    const baseRate = this.getBaselineSuccessRate(treatmentId);
    const riskAdjustment = this.calculateRiskAdjustment(riskAssessment);
    const ageAdjustment = this.calculateAgeAdjustment(patient);
    const historyAdjustment = this.calculateHistoryAdjustment(patient);

    const predictedRate = baseRate * riskAdjustment * ageAdjustment * historyAdjustment;
    return Math.min(Math.max(predictedRate, 0.1), 0.95);
  }

  /**
   * Get evidence-based support for treatment recommendation
   */
  getEvidenceSupport(treatmentId: string): EvidenceSource[] {
    return this.evidenceDatabase.get(treatmentId) || [];
  }

  // Private helper methods

  private analyzePatientProfile(
    patient: Patient,
    riskAssessment: RiskAssessment,
    treatmentHistory: TreatmentHistory[],
    medicalHistory: MedicalRecord[]
  ): any {
    return {
      age: this.calculateAge(patient.birth_date),
      riskLevel: riskAssessment.risk_level,
      overallRiskScore: riskAssessment.overall_score,
      previousTreatments: treatmentHistory.map(t => t.treatment_type),
      chronicConditions: medicalHistory.filter(m => m.condition_type === 'chronic'),
      allergies: patient.allergies || [],
      lifestyle: patient.lifestyle_factors,
      biometrics: patient.biometrics,
      treatmentPreferences: patient.treatment_preferences
    };
  }

  private async identifyCandidateTreatments(
    treatmentGoals: string[],
    patientProfile: any
  ): Promise<string[]> {
    const candidates: string[] = [];

    // Map goals to treatment categories
    const goalTreatmentMap = {
      'anti_aging': ['botox', 'dermal_fillers', 'laser_resurfacing', 'chemical_peel'],
      'skin_rejuvenation': ['microneedling', 'laser_therapy', 'photofacial', 'chemical_peel'],
      'body_contouring': ['coolsculpting', 'radiofrequency', 'ultrasound_therapy'],
      'acne_treatment': ['laser_therapy', 'chemical_peel', 'light_therapy'],
      'wellness': ['iv_therapy', 'vitamin_injections', 'hormone_therapy'],
      'preventive': ['skin_analysis', 'nutritional_counseling', 'lifestyle_coaching']
    };

    for (const goal of treatmentGoals) {
      const treatments = goalTreatmentMap[goal as keyof typeof goalTreatmentMap] || [];
      candidates.push(...treatments);
    }

    // Remove duplicates and filter based on patient profile
    const uniqueCandidates = [...new Set(candidates)];
    return this.filterByPatientSuitability(uniqueCandidates, patientProfile);
  }

  private async scoreTreatments(
    treatments: string[],
    patientProfile: any,
    riskAssessment: RiskAssessment
  ): Promise<Array<{treatment: string, score: number}>> {
    const scoredTreatments = [];

    for (const treatment of treatments) {
      const score = await this.calculateTreatmentScore(
        treatment,
        patientProfile,
        riskAssessment
      );
      scoredTreatments.push({ treatment, score });
    }

    return scoredTreatments;
  }

  private async calculateTreatmentScore(
    treatmentId: string,
    patientProfile: any,
    riskAssessment: RiskAssessment
  ): Promise<number> {
    let score = 50; // Base score

    // Success probability factor (40% weight)
    const successRate = await this.predictTreatmentSuccess(
      treatmentId,
      patientProfile,
      riskAssessment
    );
    score += (successRate - 0.5) * 40;

    // Risk compatibility factor (30% weight)
    const riskCompatibility = this.calculateRiskCompatibility(
      treatmentId,
      riskAssessment
    );
    score += (riskCompatibility - 0.5) * 30;

    // Evidence quality factor (20% weight)
    const evidenceQuality = this.calculateEvidenceQuality(treatmentId);
    score += (evidenceQuality - 0.5) * 20;

    // Patient preference factor (10% weight)
    const preferenceMatch = this.calculatePreferenceMatch(
      treatmentId,
      patientProfile
    );
    score += (preferenceMatch - 0.5) * 10;

    return Math.min(Math.max(score, 0), 100);
  }

  private async generateDetailedRecommendations(
    scoredTreatments: Array<{treatment: string, score: number}>,
    patientProfile: any,
    riskAssessment: RiskAssessment
  ): Promise<TreatmentRecommendation[]> {
    const recommendations: TreatmentRecommendation[] = [];

    for (const { treatment, score } of scoredTreatments) {
      if (score >= 60) { // Only recommend treatments with good scores
        const recommendation = await this.createDetailedRecommendation(
          treatment,
          score,
          patientProfile,
          riskAssessment
        );
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  private async createDetailedRecommendation(
    treatmentId: string,
    score: number,
    patientProfile: any,
    riskAssessment: RiskAssessment
  ): Promise<TreatmentRecommendation> {
    const treatment = this.treatmentDatabase.get(treatmentId);
    if (!treatment) {
      throw new Error(`Treatment not found: ${treatmentId}`);
    }

    const successProbability = await this.predictTreatmentSuccess(
      treatmentId,
      patientProfile,
      riskAssessment
    );

    const expectedOutcomes = this.generateExpectedOutcomes(
      treatmentId,
      patientProfile,
      successProbability
    );

    const contraindications = this.identifyContraindications(
      treatmentId,
      patientProfile,
      riskAssessment
    );

    const prerequisites = this.identifyPrerequisites(
      treatmentId,
      patientProfile,
      riskAssessment
    );

    return {
      id: `rec_${treatmentId}_${Date.now()}`,
      treatment_name: treatment.name,
      treatment_type: treatment.type,
      recommendation_score: score,
      success_probability: successProbability,
      evidence_level: this.getEvidenceLevel(treatmentId),
      rationale: this.generateRationale(treatmentId, patientProfile, score),
      expected_outcomes: expectedOutcomes,
      contraindications,
      prerequisites,
      estimated_cost: treatment.base_cost || 0,
      estimated_duration: treatment.duration || 'Variable',
      recovery_time: treatment.recovery_time || 'Minimal',
      alternative_treatments: this.getAlternativeTreatments(treatmentId)
    };
  }

  // Additional helper methods
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private filterByPatientSuitability(treatments: string[], patientProfile: any): string[] {
    return treatments.filter(treatment => {
      // Basic suitability checks
      if (patientProfile.age < 18 && this.requiresAdultConsent(treatment)) {
        return false;
      }
      
      if (patientProfile.allergies.some((allergy: string) => 
        this.hasAllergyContraindication(treatment, allergy)
      )) {
        return false;
      }
      
      return true;
    });
  }

  private calculateRiskCompatibility(treatmentId: string, riskAssessment: RiskAssessment): number {
    const treatmentRiskProfile = this.getTreatmentRiskProfile(treatmentId);
    
    // Higher risk treatments get lower compatibility with high-risk patients
    if (riskAssessment.risk_level === 'critical' && treatmentRiskProfile === 'high') {
      return 0.2;
    }
    if (riskAssessment.risk_level === 'high' && treatmentRiskProfile === 'high') {
      return 0.4;
    }
    if (riskAssessment.risk_level === 'moderate' && treatmentRiskProfile === 'medium') {
      return 0.7;
    }
    
    return 0.8; // Good compatibility
  }

  private calculateEvidenceQuality(treatmentId: string): number {
    const evidence = this.evidenceDatabase.get(treatmentId) || [];
    if (evidence.length === 0) return 0.3;
    
    const avgConfidence = evidence.reduce((sum, e) => sum + e.confidence_level, 0) / evidence.length;
    return avgConfidence;
  }

  private calculatePreferenceMatch(treatmentId: string, patientProfile: any): number {
    const preferences = patientProfile.treatmentPreferences || {};
    
    // Simple preference matching logic
    if (preferences.invasiveness === 'minimal' && this.isMinimallyInvasive(treatmentId)) {
      return 0.9;
    }
    if (preferences.downtime === 'none' && this.hasNoDowntime(treatmentId)) {
      return 0.8;
    }
    
    return 0.6; // Neutral match
  }

  // Mock data initialization methods
  private initializeTreatmentDatabase(): void {
    // Initialize with sample treatments
    const treatments = [
      {
        id: 'botox',
        name: 'Botulinum Toxin Injection',
        type: 'aesthetic',
        base_cost: 500,
        duration: '30 minutes',
        recovery_time: 'None'
      },
      {
        id: 'dermal_fillers',
        name: 'Dermal Filler Treatment',
        type: 'aesthetic',
        base_cost: 800,
        duration: '45 minutes',
        recovery_time: '1-2 days'
      },
      {
        id: 'laser_resurfacing',
        name: 'Laser Skin Resurfacing',
        type: 'aesthetic',
        base_cost: 1200,
        duration: '60 minutes',
        recovery_time: '7-10 days'
      }
    ];

    treatments.forEach(treatment => {
      this.treatmentDatabase.set(treatment.id, treatment as any);
    });
  }

  private initializeProtocolDatabase(): void {
    // Initialize with sample protocols
    console.log('Initializing treatment protocols...');
  }

  private loadEvidenceDatabase(): void {
    // Load evidence sources
    console.log('Loading evidence database...');
  }

  private loadSuccessRateModels(): void {
    // Load ML models for success rate prediction
    console.log('Loading success rate prediction models...');
  }

  // Additional utility methods would be implemented here...
  private getBaselineSuccessRate(treatmentId: string): number {
    const rates = {
      'botox': 0.92,
      'dermal_fillers': 0.88,
      'laser_resurfacing': 0.85,
      'microneedling': 0.82,
      'chemical_peel': 0.78
    };
    return rates[treatmentId as keyof typeof rates] || 0.75;
  }

  private calculateRiskAdjustment(riskAssessment: RiskAssessment): number {
    const adjustments = {
      'low': 1.05,
      'moderate': 1.0,
      'high': 0.9,
      'critical': 0.75
    };
    return adjustments[riskAssessment.risk_level];
  }

  private calculateAgeAdjustment(patient: any): number {
    const age = patient.age;
    if (age < 25) return 1.02;
    if (age < 40) return 1.0;
    if (age < 60) return 0.98;
    return 0.95;
  }

  private calculateHistoryAdjustment(patient: any): number {
    const previousTreatments = patient.previousTreatments || [];
    if (previousTreatments.length === 0) return 0.98; // Slight reduction for first-time
    if (previousTreatments.length > 5) return 1.05; // Bonus for experienced patients
    return 1.0;
  }

  private extractPredictionFeatures(patient: any, riskAssessment: RiskAssessment): any {
    return {
      age: patient.age,
      riskScore: riskAssessment.overall_score,
      chronicConditions: patient.chronicConditions.length,
      previousTreatments: patient.previousTreatments.length,
      lifestyle: patient.lifestyle
    };
  }

  // More utility methods...
  private requiresAdultConsent(treatmentId: string): boolean {
    const adultOnlyTreatments = ['botox', 'dermal_fillers', 'laser_resurfacing'];
    return adultOnlyTreatments.includes(treatmentId);
  }

  private hasAllergyContraindication(treatmentId: string, allergy: string): boolean {
    const contraindications = {
      'botox': ['botulinum', 'albumin'],
      'dermal_fillers': ['hyaluronic', 'lidocaine'],
      'laser_resurfacing': ['photosensitivity']
    };
    
    const treatmentContras = contraindications[treatmentId as keyof typeof contraindications] || [];
    return treatmentContras.some(contra => allergy.toLowerCase().includes(contra));
  }

  private getTreatmentRiskProfile(treatmentId: string): string {
    const riskProfiles = {
      'botox': 'low',
      'dermal_fillers': 'low',
      'laser_resurfacing': 'medium',
      'chemical_peel': 'medium',
      'surgical': 'high'
    };
    return riskProfiles[treatmentId as keyof typeof riskProfiles] || 'medium';
  }

  private isMinimallyInvasive(treatmentId: string): boolean {
    const minimallyInvasive = ['botox', 'dermal_fillers', 'microneedling', 'chemical_peel'];
    return minimallyInvasive.includes(treatmentId);
  }

  private hasNoDowntime(treatmentId: string): boolean {
    const noDowntime = ['botox', 'microneedling', 'light_therapy'];
    return noDowntime.includes(treatmentId);
  }

  private getEvidenceLevel(treatmentId: string): 'A' | 'B' | 'C' | 'D' {
    const evidenceLevels = {
      'botox': 'A',
      'dermal_fillers': 'A',
      'laser_resurfacing': 'B',
      'microneedling': 'B',
      'chemical_peel': 'C'
    };
    return evidenceLevels[treatmentId as keyof typeof evidenceLevels] || 'C';
  }

  private generateRationale(treatmentId: string, patientProfile: any, score: number): string {
    return `Based on patient profile analysis, this treatment shows ${score}% compatibility. ` +
           `Factors considered include age (${patientProfile.age}), risk level (${patientProfile.riskLevel}), ` +
           `and treatment history.`;
  }

  private generateExpectedOutcomes(treatmentId: string, patientProfile: any, successProbability: number): ExpectedOutcome[] {
    // Generate expected outcomes based on treatment type
    return [
      {
        outcome_type: 'improvement',
        description: 'Visible improvement in target area',
        probability: successProbability,
        timeframe: '2-4 weeks',
        measurable_metrics: ['Patient satisfaction', 'Clinical assessment']
      }
    ];
  }

  private identifyContraindications(treatmentId: string, patientProfile: any, riskAssessment: RiskAssessment): string[] {
    const contraindications: string[] = [];
    
    if (riskAssessment.risk_level === 'critical') {
      contraindications.push('High-risk patient profile requires specialist consultation');
    }
    
    return contraindications;
  }

  private identifyPrerequisites(treatmentId: string, patientProfile: any, riskAssessment: RiskAssessment): string[] {
    const prerequisites: string[] = [];
    
    if (patientProfile.age < 21) {
      prerequisites.push('Parental consent required');
    }
    
    if (riskAssessment.risk_level === 'high') {
      prerequisites.push('Pre-treatment medical clearance');
    }
    
    return prerequisites;
  }

  private getAlternativeTreatments(treatmentId: string): string[] {
    const alternatives = {
      'botox': ['dermal_fillers', 'microneedling'],
      'dermal_fillers': ['botox', 'laser_resurfacing'],
      'laser_resurfacing': ['chemical_peel', 'microneedling']
    };
    return alternatives[treatmentId as keyof typeof alternatives] || [];
  }

  private generateProtocolCustomizations(
    protocol: TreatmentProtocol,
    patient: Patient,
    riskAssessment: RiskAssessment
  ): ProtocolCustomization[] {
    // Generate protocol customizations based on patient factors
    return [];
  }

  private calculateProtocolSuitability(
    protocol: TreatmentProtocol,
    patient: Patient,
    riskAssessment: RiskAssessment
  ): number {
    // Calculate how suitable the protocol is for this patient
    return 0.85;
  }

  private getCompatibleTreatments(
    primaryTreatment: string,
    patient: Patient,
    riskAssessment: RiskAssessment
  ): string[] {
    // Return treatments compatible with the primary treatment
    return [];
  }

  private async analyzeTreatmentCombination(
    primary: string,
    complementary: string,
    patient: Patient,
    riskAssessment: RiskAssessment
  ): Promise<TreatmentCombination> {
    // Analyze synergy between treatments
    return {
      primary_treatment: primary,
      complementary_treatments: [complementary],
      synergy_score: 0.7,
      combined_success_rate: 0.9,
      interaction_warnings: [],
      optimal_sequencing: [primary, complementary]
    };
  }
}

export default AITreatmentRecommendationEngine;