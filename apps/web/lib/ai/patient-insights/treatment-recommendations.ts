// AI-Powered Treatment Recommendation System
// Story 3.2: Task 2 - Treatment Recommendation System

import { createClient } from '@/app/utils/supabase/client';
import type {
  PatientRiskAssessment,
  TreatmentRecommendation,
  TreatmentRecommendationResponse,
} from './types';

export class TreatmentRecommendationEngine {
  private readonly supabase = createClient();
  private readonly evidenceDatabase: Map<string, TreatmentEvidence> = new Map();

  constructor() {
    this.initializeEvidenceDatabase();
  }

  async generateRecommendations(
    patientId: string,
    riskAssessment: PatientRiskAssessment,
    treatmentGoal?: string
  ): Promise<TreatmentRecommendationResponse> {
    const startTime = Date.now();

    try {
      // 1. Get patient data and treatment history
      const patientData = await this.getPatientTreatmentHistory(patientId);

      // 2. Get available treatments for clinic specialty
      const availableTreatments = await this.getAvailableTreatments();

      // 3. Analyze each treatment for suitability
      const recommendations: TreatmentRecommendation[] = [];

      for (const treatment of availableTreatments) {
        const recommendation = await this.analyzeTreatment(
          treatment,
          patientData,
          riskAssessment,
          treatmentGoal
        );

        if (recommendation) {
          recommendations.push(recommendation);
        }
      }

      // 4. Rank recommendations by success probability and safety
      const rankedRecommendations = this.rankRecommendations(recommendations);

      // 5. Filter out contraindicated treatments
      const safeRecommendations = this.filterContraindications(
        rankedRecommendations,
        riskAssessment
      );

      return {
        success: true,
        data: safeRecommendations,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Treatment recommendation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      };
    }
  }

  private async getPatientTreatmentHistory(patientId: string) {
    const { data } = await this.supabase
      .from('patients')
      .select(
        `
        *,
        treatments (*),
        treatment_outcomes (*),
        medical_history (*),
        preferences (*)
      `
      )
      .eq('id', patientId)
      .single();

    return data;
  }

  private async getAvailableTreatments() {
    const { data } = await this.supabase
      .from('treatment_types')
      .select('*')
      .eq('active', true);

    return data || [];
  }

  private async analyzeTreatment(
    treatment: any,
    patientData: any,
    riskAssessment: PatientRiskAssessment,
    treatmentGoal?: string
  ): Promise<TreatmentRecommendation | null> {
    // 1. Check basic eligibility
    if (!this.isPatientEligible(treatment, patientData)) {
      return null;
    }

    // 2. Calculate success probability
    const successProbability = this.calculateSuccessProbability(
      treatment,
      patientData,
      riskAssessment
    );

    // 3. Assess risk level
    const riskLevel = this.assessTreatmentRisk(treatment, riskAssessment);

    // 4. Check contraindications
    const contraindications = this.checkContraindications(
      treatment,
      patientData,
      riskAssessment
    );

    // 5. Get evidence level
    const evidenceLevel = this.getEvidenceLevel(treatment, treatmentGoal);

    // 6. Calculate estimated outcomes
    const estimatedCost = this.calculateEstimatedCost(treatment, patientData);
    const estimatedDuration = this.calculateEstimatedDuration(
      treatment,
      patientData
    );

    // 7. Generate reasoning
    const reasoning = this.generateRecommendationReasoning(
      treatment,
      successProbability,
      riskLevel,
      evidenceLevel
    );

    return {
      treatmentId: treatment.id,
      treatmentName: treatment.name,
      category:
        contraindications.length > 0
          ? 'contraindicated'
          : successProbability > 0.7
            ? 'primary'
            : 'alternative',
      successProbability,
      riskLevel,
      evidenceLevel,
      contraindications,
      prerequisites: this.getPrerequisites(treatment, patientData),
      expectedOutcome: this.getExpectedOutcome(treatment, successProbability),
      estimatedDuration,
      estimatedCost,
      reasoning,
    };
  }

  private isPatientEligible(treatment: any, patientData: any): boolean {
    // Age restrictions
    const age = this.calculateAge(patientData.date_of_birth);
    if (treatment.min_age && age < treatment.min_age) {
      return false;
    }
    if (treatment.max_age && age > treatment.max_age) {
      return false;
    }

    // Gender restrictions
    if (
      treatment.gender_restriction &&
      treatment.gender_restriction !== patientData.gender
    ) {
      return false;
    }

    // Pregnancy restrictions
    if (treatment.pregnancy_safe === false && patientData.is_pregnant) {
      return false;
    }

    return true;
  }

  private calculateSuccessProbability(
    treatment: any,
    patientData: any,
    riskAssessment: PatientRiskAssessment
  ): number {
    // Base success rate from clinical data
    let baseRate = treatment.base_success_rate || 0.75;

    // Adjust for patient age
    const age = this.calculateAge(patientData.date_of_birth);
    if (age > 65) {
      baseRate *= 0.9;
    }
    if (age > 75) {
      baseRate *= 0.85;
    }

    // Adjust for overall risk score
    const riskFactor = 1 - riskAssessment.overallRiskScore / 200; // Max 50% reduction
    baseRate *= riskFactor;

    // Adjust for previous treatment outcomes
    if (patientData.treatments?.length > 0) {
      const successfulTreatments = patientData.treatments.filter(
        (t) => t.outcome === 'successful'
      ).length;
      const successRate = successfulTreatments / patientData.treatments.length;
      baseRate = (baseRate + successRate) / 2; // Average with historical success
    }

    // Adjust for specific risk factors
    const medicalRisks = riskAssessment.riskFactors.filter(
      (rf) => rf.category === 'medical'
    );
    const riskReduction = medicalRisks.reduce((reduction, risk) => {
      return reduction + risk.weight * 0.1; // Max 10% reduction per risk factor
    }, 0);

    baseRate *= 1 - Math.min(0.4, riskReduction); // Max 40% total reduction

    return Math.max(0.1, Math.min(0.95, baseRate));
  }

  private assessTreatmentRisk(
    treatment: any,
    riskAssessment: PatientRiskAssessment
  ): TreatmentRecommendation['riskLevel'] {
    let riskScore = treatment.base_risk_score || 1; // 1-4 scale

    // Increase risk based on patient risk factors
    const highRiskFactors = riskAssessment.riskFactors.filter(
      (rf) => rf.severity === 'high' || rf.severity === 'critical'
    );

    riskScore += highRiskFactors.length * 0.5;

    // Treatment-specific risk adjustments
    if (treatment.invasiveness === 'high') {
      riskScore += 1;
    }
    if (treatment.anesthesia_required) {
      riskScore += 0.5;
    }
    if (treatment.recovery_time > 30) {
      riskScore += 0.5;
    }

    if (riskScore <= 1.5) {
      return 'low';
    }
    if (riskScore <= 2.5) {
      return 'medium';
    }
    return 'high';
  }

  private checkContraindications(
    treatment: any,
    patientData: any,
    riskAssessment: PatientRiskAssessment
  ): string[] {
    const contraindications: string[] = [];

    // Medical condition contraindications
    const medicalConditions =
      patientData.medical_history?.map((mh) => mh.condition_type) || [];

    if (treatment.contraindicated_conditions) {
      for (const condition of treatment.contraindicated_conditions) {
        if (medicalConditions.includes(condition)) {
          contraindications.push(`Contraindicated with ${condition}`);
        }
      }
    }

    // Medication contraindications
    const medications =
      patientData.medications?.map((m) => m.medication_name.toLowerCase()) ||
      [];

    if (treatment.contraindicated_medications) {
      for (const medication of treatment.contraindicated_medications) {
        if (medications.some((m) => m.includes(medication.toLowerCase()))) {
          contraindications.push(`Contraindicated with ${medication}`);
        }
      }
    }

    // Allergy contraindications
    const allergens =
      patientData.allergies?.map((a) => a.allergen.toLowerCase()) || [];

    if (treatment.potential_allergens) {
      for (const allergen of treatment.potential_allergens) {
        if (allergens.includes(allergen.toLowerCase())) {
          contraindications.push(`Allergy to ${allergen}`);
        }
      }
    }

    // Critical risk factor contraindications
    const criticalRisks = riskAssessment.riskFactors.filter(
      (rf) => rf.severity === 'critical'
    );
    if (criticalRisks.length > 0 && treatment.invasiveness === 'high') {
      contraindications.push(
        'Critical risk factors present for invasive procedure'
      );
    }

    return contraindications;
  }

  private getEvidenceLevel(
    treatment: any,
    treatmentGoal?: string
  ): TreatmentRecommendation['evidenceLevel'] {
    const evidence =
      this.evidenceDatabase.get(treatment.id) ||
      this.evidenceDatabase.get(treatment.category);

    if (!evidence) {
      return 'weak';
    }

    // Check for goal-specific evidence
    if (treatmentGoal && evidence.goalSpecificStudies[treatmentGoal]) {
      return evidence.goalSpecificStudies[treatmentGoal].evidenceLevel;
    }

    return evidence.overallEvidenceLevel;
  }

  private calculateEstimatedCost(treatment: any, patientData: any): number {
    let baseCost = treatment.base_cost || 0;

    // Adjust for complexity factors
    const age = this.calculateAge(patientData.date_of_birth);
    if (age > 65) {
      baseCost *= 1.2; // 20% increase for elderly patients
    }

    // Adjust for medical conditions that may complicate treatment
    const complicatingConditions =
      patientData.medical_history?.filter((mh) =>
        ['diabetes', 'heart_disease', 'kidney_disease'].includes(
          mh.condition_type
        )
      ) || [];

    baseCost *= 1 + complicatingConditions.length * 0.1;

    return Math.round(baseCost);
  }

  private calculateEstimatedDuration(treatment: any, patientData: any): string {
    let baseDuration = treatment.typical_duration || 30; // minutes

    // Adjust for patient factors
    const age = this.calculateAge(patientData.date_of_birth);
    if (age > 65) {
      baseDuration *= 1.3;
    }

    // Adjust for complexity
    const medicalConditions = patientData.medical_history?.length || 0;
    baseDuration *= 1 + medicalConditions * 0.05;

    if (baseDuration < 60) {
      return `${Math.round(baseDuration)} minutes`;
    }
    if (baseDuration < 120) {
      return `${Math.round((baseDuration / 60) * 10) / 10} hours`;
    }
    return `${Math.round(baseDuration / 60)} hours`;
  }

  private getPrerequisites(treatment: any, patientData: any): string[] {
    const prerequisites: string[] = [];

    // Standard prerequisites from treatment definition
    if (treatment.prerequisites) {
      prerequisites.push(...treatment.prerequisites);
    }

    // Age-based prerequisites
    const age = this.calculateAge(patientData.date_of_birth);
    if (age > 65) {
      prerequisites.push('Cardiac clearance');
      prerequisites.push('Extended pre-operative assessment');
    }

    // Medical condition-based prerequisites
    const medicalConditions =
      patientData.medical_history?.map((mh) => mh.condition_type) || [];

    if (medicalConditions.includes('diabetes')) {
      prerequisites.push('Blood glucose optimization');
    }

    if (medicalConditions.includes('hypertension')) {
      prerequisites.push('Blood pressure control');
    }

    if (medicalConditions.includes('heart_disease')) {
      prerequisites.push('Cardiologist clearance');
    }

    // Medication-based prerequisites
    const medications =
      patientData.medications?.map((m) => m.medication_name.toLowerCase()) ||
      [];

    if (
      medications.some(
        (m) => m.includes('warfarin') || m.includes('anticoagulant')
      )
    ) {
      prerequisites.push('Anticoagulation management');
    }

    return [...new Set(prerequisites)]; // Remove duplicates
  }

  private getExpectedOutcome(
    treatment: any,
    successProbability: number
  ): string {
    const baseOutcome =
      treatment.expected_outcome || 'Improvement in treated area';

    if (successProbability > 0.8) {
      return `Excellent ${baseOutcome.toLowerCase()}`;
    }
    if (successProbability > 0.6) {
      return `Good ${baseOutcome.toLowerCase()}`;
    }
    return `Moderate ${baseOutcome.toLowerCase()}`;
  }

  private generateRecommendationReasoning(
    _treatment: any,
    successProbability: number,
    riskLevel: TreatmentRecommendation['riskLevel'],
    evidenceLevel: TreatmentRecommendation['evidenceLevel']
  ): string {
    const reasons: string[] = [];

    // Success probability reasoning
    if (successProbability > 0.8) {
      reasons.push('High success probability based on patient profile');
    } else if (successProbability > 0.6) {
      reasons.push('Good success probability with current patient factors');
    } else {
      reasons.push('Moderate success probability due to risk factors');
    }

    // Risk level reasoning
    if (riskLevel === 'low') {
      reasons.push('Low risk profile for this treatment');
    } else if (riskLevel === 'medium') {
      reasons.push('Moderate risk requiring standard precautions');
    } else {
      reasons.push('Higher risk requiring careful monitoring');
    }

    // Evidence level reasoning
    if (evidenceLevel === 'very_strong' || evidenceLevel === 'strong') {
      reasons.push('Strong clinical evidence supports this treatment');
    } else if (evidenceLevel === 'moderate') {
      reasons.push('Moderate evidence base for this indication');
    } else {
      reasons.push('Limited evidence available for this specific case');
    }

    return `${reasons.join('. ')}.`;
  }

  private rankRecommendations(
    recommendations: TreatmentRecommendation[]
  ): TreatmentRecommendation[] {
    return recommendations.sort((a, b) => {
      // Primary sort by category (primary > alternative > contraindicated)
      const categoryWeight = { primary: 3, alternative: 2, contraindicated: 1 };
      const categoryDiff =
        categoryWeight[b.category] - categoryWeight[a.category];
      if (categoryDiff !== 0) {
        return categoryDiff;
      }

      // Secondary sort by success probability
      const successDiff = b.successProbability - a.successProbability;
      if (Math.abs(successDiff) > 0.1) {
        return successDiff;
      }

      // Tertiary sort by risk level (lower risk first)
      const riskWeight = { low: 3, medium: 2, high: 1 };
      const riskDiff = riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
      if (riskDiff !== 0) {
        return riskDiff;
      }

      // Final sort by evidence level
      const evidenceWeight = {
        very_strong: 4,
        strong: 3,
        moderate: 2,
        weak: 1,
      };
      return evidenceWeight[b.evidenceLevel] - evidenceWeight[a.evidenceLevel];
    });
  }

  private filterContraindications(
    recommendations: TreatmentRecommendation[],
    _riskAssessment: PatientRiskAssessment
  ): TreatmentRecommendation[] {
    // Filter out contraindicated treatments unless specifically requested
    return recommendations.filter((rec) => rec.category !== 'contraindicated');
  }

  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  private initializeEvidenceDatabase(): void {
    // Initialize with common aesthetic treatments evidence
    this.evidenceDatabase.set('botox', {
      overallEvidenceLevel: 'very_strong',
      goalSpecificStudies: {
        wrinkle_reduction: { evidenceLevel: 'very_strong', studyCount: 200 },
        migraine_treatment: { evidenceLevel: 'strong', studyCount: 50 },
        hyperhidrosis: { evidenceLevel: 'strong', studyCount: 30 },
      },
    });

    this.evidenceDatabase.set('dermal_fillers', {
      overallEvidenceLevel: 'strong',
      goalSpecificStudies: {
        volume_restoration: { evidenceLevel: 'strong', studyCount: 150 },
        lip_enhancement: { evidenceLevel: 'moderate', studyCount: 80 },
        scar_treatment: { evidenceLevel: 'moderate', studyCount: 40 },
      },
    });

    this.evidenceDatabase.set('laser_therapy', {
      overallEvidenceLevel: 'strong',
      goalSpecificStudies: {
        hair_removal: { evidenceLevel: 'very_strong', studyCount: 300 },
        skin_resurfacing: { evidenceLevel: 'strong', studyCount: 120 },
        pigmentation: { evidenceLevel: 'moderate', studyCount: 60 },
      },
    });

    this.evidenceDatabase.set('chemical_peels', {
      overallEvidenceLevel: 'moderate',
      goalSpecificStudies: {
        acne_treatment: { evidenceLevel: 'strong', studyCount: 100 },
        anti_aging: { evidenceLevel: 'moderate', studyCount: 70 },
        melasma: { evidenceLevel: 'moderate', studyCount: 30 },
      },
    });
  }
}

interface TreatmentEvidence {
  overallEvidenceLevel: TreatmentRecommendation['evidenceLevel'];
  goalSpecificStudies: Record<
    string,
    {
      evidenceLevel: TreatmentRecommendation['evidenceLevel'];
      studyCount: number;
    }
  >;
}
