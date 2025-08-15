/**
 * AI-Driven Patient Segmentation System
 * Story 3.4: Smart Search + NLP Integration - Task 3
 * Intelligent patient segmentation with natural language criteria
 */

import { createClient } from '@supabase/supabase-js';
import { nlpEngine, type SupportedLanguage } from './nlp-engine';

// Types
export interface SegmentCriteria {
  id?: string;
  name: string;
  description: string;
  naturalLanguageQuery: string;
  structuredCriteria: {
    demographics?: {
      ageRange?: { min?: number; max?: number };
      gender?: string[];
      location?: string[];
    };
    medical?: {
      conditions?: string[];
      treatments?: string[];
      medications?: string[];
      allergies?: string[];
    };
    behavioral?: {
      visitFrequency?: {
        min?: number;
        max?: number;
        period?: 'month' | 'year';
      };
      lastVisit?: { before?: string; after?: string };
      appointmentTypes?: string[];
      noShows?: { threshold?: number; period?: 'month' | 'year' };
    };
    financial?: {
      insuranceTypes?: string[];
      paymentMethods?: string[];
      outstandingBalance?: { min?: number; max?: number };
    };
    custom?: Record<string, any>;
  };
  language: SupportedLanguage;
  createdBy: string;
  isActive: boolean;
  tags?: string[];
}

export interface PatientSegment {
  id: string;
  criteria: SegmentCriteria;
  patientCount: number;
  patients: PatientSegmentMember[];
  lastUpdated: string;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
  };
  insights: {
    commonCharacteristics: string[];
    trends: string[];
    recommendations: string[];
  };
}

export interface PatientSegmentMember {
  patientId: string;
  patientName: string;
  matchScore: number;
  matchedCriteria: string[];
  demographics: {
    age: number;
    gender: string;
    location: string;
  };
  medicalSummary: {
    primaryConditions: string[];
    currentTreatments: string[];
    lastVisit: string;
  };
  behavioralMetrics: {
    visitFrequency: number;
    appointmentTypes: string[];
    adherenceScore: number;
  };
}

export interface SegmentationOptions {
  includeInactive?: boolean;
  maxPatients?: number;
  minMatchScore?: number;
  sortBy?: 'matchScore' | 'lastVisit' | 'name';
  sortOrder?: 'asc' | 'desc';
  refreshData?: boolean;
}

export interface SegmentationAnalytics {
  totalSegments: number;
  totalPatients: number;
  averageSegmentSize: number;
  mostCommonCriteria: string[];
  segmentPerformance: {
    highPerforming: number;
    mediumPerforming: number;
    lowPerforming: number;
  };
  trends: {
    growingSegments: string[];
    shrinkingSegments: string[];
    stableSegments: string[];
  };
}

/**
 * AI-Driven Patient Segmentation System
 * Creates and manages intelligent patient segments
 */
export class PatientSegmentation {
  private readonly supabase: any;
  private readonly segmentCache: Map<string, PatientSegment> = new Map();
  private readonly cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Create a new patient segment from natural language criteria
   */
  async createSegment(
    name: string,
    naturalLanguageQuery: string,
    language: SupportedLanguage,
    createdBy: string,
    description?: string
  ): Promise<PatientSegment> {
    try {
      // Process natural language query with NLP
      const nlpResult = await nlpEngine.processQuery(
        naturalLanguageQuery,
        language
      );

      // Convert NLP result to structured criteria
      const structuredCriteria = await this.convertNLPToStructuredCriteria(
        nlpResult,
        language
      );

      // Create segment criteria
      const criteria: SegmentCriteria = {
        name,
        description:
          description ||
          `Segmento criado a partir da consulta: "${naturalLanguageQuery}"`,
        naturalLanguageQuery,
        structuredCriteria,
        language,
        createdBy,
        isActive: true,
        tags: this.extractTagsFromNLP(nlpResult),
      };

      // Save criteria to database
      const { data: savedCriteria, error: criteriaError } = await this.supabase
        .from('patient_segments')
        .insert({
          segment_name: criteria.name,
          description: criteria.description,
          natural_language_query: criteria.naturalLanguageQuery,
          criteria_json: criteria.structuredCriteria,
          language: criteria.language,
          created_by: criteria.createdBy,
          is_active: criteria.isActive,
          tags: criteria.tags,
        })
        .select()
        .single();

      if (criteriaError) {
        throw new Error(
          `Failed to save segment criteria: ${criteriaError.message}`
        );
      }

      criteria.id = savedCriteria.id;

      // Generate segment
      const segment = await this.generateSegment(criteria);

      // Cache the segment
      this.cacheSegment(segment);

      return segment;
    } catch (error) {
      console.error('Error creating segment:', error);
      throw error;
    }
  }

  /**
   * Convert NLP result to structured criteria
   */
  private async convertNLPToStructuredCriteria(
    nlpResult: any,
    _language: SupportedLanguage
  ): Promise<SegmentCriteria['structuredCriteria']> {
    const criteria: SegmentCriteria['structuredCriteria'] = {};

    // Extract demographic criteria
    criteria.demographics = this.extractDemographicCriteria(nlpResult);

    // Extract medical criteria
    criteria.medical = this.extractMedicalCriteria(nlpResult);

    // Extract behavioral criteria
    criteria.behavioral = this.extractBehavioralCriteria(nlpResult);

    // Extract financial criteria
    criteria.financial = this.extractFinancialCriteria(nlpResult);

    // Extract custom criteria
    criteria.custom = this.extractCustomCriteria(nlpResult);

    return criteria;
  }

  /**
   * Extract demographic criteria from NLP result
   */
  private extractDemographicCriteria(
    nlpResult: any
  ): SegmentCriteria['structuredCriteria']['demographics'] {
    const demographics: any = {};

    // Age range extraction
    const ageEntities = nlpResult.entities.filter(
      (e: any) => e.type === 'age' || e.type === 'number'
    );
    if (ageEntities.length > 0) {
      const ages = ageEntities
        .map((e: any) => Number.parseInt(e.value, 10))
        .filter((age: number) => !Number.isNaN(age));
      if (ages.length === 1) {
        demographics.ageRange = { min: ages[0] - 5, max: ages[0] + 5 };
      } else if (ages.length >= 2) {
        demographics.ageRange = {
          min: Math.min(...ages),
          max: Math.max(...ages),
        };
      }
    }

    // Gender extraction
    const genderKeywords = {
      pt: {
        male: ['homem', 'homens', 'masculino', 'macho'],
        female: ['mulher', 'mulheres', 'feminino', 'fêmea'],
      },
      en: {
        male: ['man', 'men', 'male'],
        female: ['woman', 'women', 'female'],
      },
      es: {
        male: ['hombre', 'hombres', 'masculino', 'macho'],
        female: ['mujer', 'mujeres', 'femenino', 'hembra'],
      },
    };

    const queryLower = nlpResult.normalized.toLowerCase();
    const genderWords =
      genderKeywords[nlpResult.language as keyof typeof genderKeywords] ||
      genderKeywords.pt;

    if (genderWords.male.some((word) => queryLower.includes(word))) {
      demographics.gender = ['M'];
    } else if (genderWords.female.some((word) => queryLower.includes(word))) {
      demographics.gender = ['F'];
    }

    // Location extraction
    const locationEntities = nlpResult.entities.filter(
      (e: any) => e.type === 'location'
    );
    if (locationEntities.length > 0) {
      demographics.location = locationEntities.map((e: any) => e.value);
    }

    return Object.keys(demographics).length > 0 ? demographics : undefined;
  }

  /**
   * Extract medical criteria from NLP result
   */
  private extractMedicalCriteria(
    nlpResult: any
  ): SegmentCriteria['structuredCriteria']['medical'] {
    const medical: any = {};

    // Medical condition keywords
    const conditionKeywords = {
      pt: [
        'diabetes',
        'hipertensão',
        'asma',
        'depressão',
        'ansiedade',
        'artrite',
        'câncer',
        'obesidade',
      ],
      en: [
        'diabetes',
        'hypertension',
        'asthma',
        'depression',
        'anxiety',
        'arthritis',
        'cancer',
        'obesity',
      ],
      es: [
        'diabetes',
        'hipertensión',
        'asma',
        'depresión',
        'ansiedad',
        'artritis',
        'cáncer',
        'obesidad',
      ],
    };

    // Treatment keywords
    const treatmentKeywords = {
      pt: [
        'fisioterapia',
        'cirurgia',
        'quimioterapia',
        'radioterapia',
        'terapia',
      ],
      en: [
        'physiotherapy',
        'surgery',
        'chemotherapy',
        'radiotherapy',
        'therapy',
      ],
      es: [
        'fisioterapia',
        'cirugía',
        'quimioterapia',
        'radioterapia',
        'terapia',
      ],
    };

    const queryLower = nlpResult.normalized.toLowerCase();
    const lang = nlpResult.language as keyof typeof conditionKeywords;

    // Extract conditions
    const conditions =
      conditionKeywords[lang]?.filter((condition) =>
        queryLower.includes(condition.toLowerCase())
      ) || [];

    if (conditions.length > 0) {
      medical.conditions = conditions;
    }

    // Extract treatments
    const treatments =
      treatmentKeywords[lang]?.filter((treatment) =>
        queryLower.includes(treatment.toLowerCase())
      ) || [];

    if (treatments.length > 0) {
      medical.treatments = treatments;
    }

    // Extract medication entities
    const medicationEntities = nlpResult.entities.filter(
      (e: any) => e.type === 'medication'
    );
    if (medicationEntities.length > 0) {
      medical.medications = medicationEntities.map((e: any) => e.value);
    }

    return Object.keys(medical).length > 0 ? medical : undefined;
  }

  /**
   * Extract behavioral criteria from NLP result
   */
  private extractBehavioralCriteria(
    nlpResult: any
  ): SegmentCriteria['structuredCriteria']['behavioral'] {
    const behavioral: any = {};

    // Visit frequency keywords
    const frequencyKeywords = {
      pt: {
        frequent: ['frequente', 'regular', 'sempre', 'muito'],
        rare: ['raro', 'pouco', 'nunca', 'raramente'],
        monthly: ['mensal', 'mês', 'meses'],
        yearly: ['anual', 'ano', 'anos'],
      },
      en: {
        frequent: ['frequent', 'regular', 'always', 'often'],
        rare: ['rare', 'seldom', 'never', 'rarely'],
        monthly: ['monthly', 'month', 'months'],
        yearly: ['yearly', 'year', 'years'],
      },
      es: {
        frequent: ['frecuente', 'regular', 'siempre', 'mucho'],
        rare: ['raro', 'poco', 'nunca', 'raramente'],
        monthly: ['mensual', 'mes', 'meses'],
        yearly: ['anual', 'año', 'años'],
      },
    };

    const queryLower = nlpResult.normalized.toLowerCase();
    const lang = nlpResult.language as keyof typeof frequencyKeywords;
    const keywords = frequencyKeywords[lang] || frequencyKeywords.pt;

    // Determine visit frequency
    if (keywords.frequent.some((word) => queryLower.includes(word))) {
      behavioral.visitFrequency = { min: 4, period: 'year' as const };
    } else if (keywords.rare.some((word) => queryLower.includes(word))) {
      behavioral.visitFrequency = { max: 1, period: 'year' as const };
    }

    // Extract date entities for last visit
    const dateEntities = nlpResult.entities.filter(
      (e: any) => e.type === 'date'
    );
    if (dateEntities.length > 0) {
      const date = dateEntities[0].value;
      if (
        queryLower.includes('antes') ||
        queryLower.includes('before') ||
        queryLower.includes('anterior')
      ) {
        behavioral.lastVisit = { before: date };
      } else if (
        queryLower.includes('depois') ||
        queryLower.includes('after') ||
        queryLower.includes('posterior')
      ) {
        behavioral.lastVisit = { after: date };
      }
    }

    return Object.keys(behavioral).length > 0 ? behavioral : undefined;
  }

  /**
   * Extract financial criteria from NLP result
   */
  private extractFinancialCriteria(
    nlpResult: any
  ): SegmentCriteria['structuredCriteria']['financial'] {
    const financial: any = {};

    // Insurance keywords
    const insuranceKeywords = {
      pt: ['plano', 'convênio', 'seguro', 'sus', 'particular'],
      en: ['insurance', 'plan', 'coverage', 'private', 'public'],
      es: ['seguro', 'plan', 'cobertura', 'privado', 'público'],
    };

    const queryLower = nlpResult.normalized.toLowerCase();
    const lang = nlpResult.language as keyof typeof insuranceKeywords;

    // Extract insurance types
    const insuranceTypes =
      insuranceKeywords[lang]?.filter((type) =>
        queryLower.includes(type.toLowerCase())
      ) || [];

    if (insuranceTypes.length > 0) {
      financial.insuranceTypes = insuranceTypes;
    }

    // Extract payment method entities
    const paymentEntities = nlpResult.entities.filter(
      (e: any) => e.type === 'payment'
    );
    if (paymentEntities.length > 0) {
      financial.paymentMethods = paymentEntities.map((e: any) => e.value);
    }

    return Object.keys(financial).length > 0 ? financial : undefined;
  }

  /**
   * Extract custom criteria from NLP result
   */
  private extractCustomCriteria(nlpResult: any): Record<string, any> {
    const custom: Record<string, any> = {};

    // Extract any remaining entities that don't fit standard categories
    nlpResult.entities.forEach((entity: any) => {
      if (
        ![
          'age',
          'number',
          'location',
          'medication',
          'date',
          'payment',
        ].includes(entity.type)
      ) {
        if (!custom[entity.type]) {
          custom[entity.type] = [];
        }
        custom[entity.type].push(entity.value);
      }
    });

    return Object.keys(custom).length > 0 ? custom : {};
  }

  /**
   * Extract tags from NLP result
   */
  private extractTagsFromNLP(nlpResult: any): string[] {
    const tags: string[] = [];

    // Add intent as tag
    if (nlpResult.intent) {
      tags.push(nlpResult.intent);
    }

    // Add entity types as tags
    const entityTypes = [
      ...new Set(nlpResult.entities.map((e: any) => e.type)),
    ];
    tags.push(...entityTypes);

    // Add language as tag
    tags.push(nlpResult.language);

    return tags;
  }

  /**
   * Generate patient segment based on criteria
   */
  async generateSegment(
    criteria: SegmentCriteria,
    options: SegmentationOptions = {}
  ): Promise<PatientSegment> {
    try {
      const {
        includeInactive = false,
        maxPatients = 1000,
        minMatchScore = 0.5,
        sortBy = 'matchScore',
        sortOrder = 'desc',
        refreshData = false,
      } = options;

      // Check cache first
      if (!refreshData && criteria.id) {
        const cached = this.getCachedSegment(criteria.id);
        if (cached) {
          return cached;
        }
      }

      // Build SQL query based on criteria
      const _query = this.buildSegmentQuery(criteria, includeInactive);

      // Execute query
      const { data: patients, error } = await this.supabase.rpc(
        'search_patients_by_criteria',
        {
          criteria_json: criteria.structuredCriteria,
          include_inactive: includeInactive,
          max_results: maxPatients,
        }
      );

      if (error) {
        throw new Error(`Failed to generate segment: ${error.message}`);
      }

      // Calculate match scores and filter
      const segmentMembers = await this.calculateMatchScores(
        patients || [],
        criteria,
        minMatchScore
      );

      // Sort results
      const sortedMembers = this.sortSegmentMembers(
        segmentMembers,
        sortBy,
        sortOrder
      );

      // Generate insights
      const insights = await this.generateSegmentInsights(
        sortedMembers,
        criteria
      );

      // Calculate performance metrics
      const performance = this.calculateSegmentPerformance(
        sortedMembers,
        criteria
      );

      const segment: PatientSegment = {
        id: criteria.id || `temp_${Date.now()}`,
        criteria,
        patientCount: sortedMembers.length,
        patients: sortedMembers,
        lastUpdated: new Date().toISOString(),
        performance,
        insights,
      };

      // Update database with patient count
      if (criteria.id) {
        await this.supabase
          .from('patient_segments')
          .update({
            patient_count: segment.patientCount,
            last_updated: segment.lastUpdated,
          })
          .eq('id', criteria.id);
      }

      // Cache the segment
      this.cacheSegment(segment);

      return segment;
    } catch (error) {
      console.error('Error generating segment:', error);
      throw error;
    }
  }

  /**
   * Build SQL query for segment criteria
   */
  private buildSegmentQuery(
    criteria: SegmentCriteria,
    includeInactive: boolean
  ): string {
    const conditions: string[] = [];
    const { structuredCriteria } = criteria;

    // Demographics conditions
    if (structuredCriteria.demographics) {
      const demo = structuredCriteria.demographics;

      if (demo.ageRange) {
        if (demo.ageRange.min !== undefined) {
          conditions.push(
            `EXTRACT(YEAR FROM AGE(birth_date)) >= ${demo.ageRange.min}`
          );
        }
        if (demo.ageRange.max !== undefined) {
          conditions.push(
            `EXTRACT(YEAR FROM AGE(birth_date)) <= ${demo.ageRange.max}`
          );
        }
      }

      if (demo.gender && demo.gender.length > 0) {
        const genderList = demo.gender.map((g) => `'${g}'`).join(',');
        conditions.push(`gender IN (${genderList})`);
      }

      if (demo.location && demo.location.length > 0) {
        const locationConditions = demo.location.map(
          (loc) =>
            `(address ILIKE '%${loc}%' OR city ILIKE '%${loc}%' OR state ILIKE '%${loc}%')`
        );
        conditions.push(`(${locationConditions.join(' OR ')})`);
      }
    }

    // Add active/inactive filter
    if (!includeInactive) {
      conditions.push('active = true');
    }

    return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  }

  /**
   * Calculate match scores for patients
   */
  private async calculateMatchScores(
    patients: any[],
    criteria: SegmentCriteria,
    minMatchScore: number
  ): Promise<PatientSegmentMember[]> {
    const members: PatientSegmentMember[] = [];

    for (const patient of patients) {
      const matchResult = await this.calculatePatientMatchScore(
        patient,
        criteria
      );

      if (matchResult.score >= minMatchScore) {
        members.push({
          patientId: patient.id,
          patientName: patient.name,
          matchScore: matchResult.score,
          matchedCriteria: matchResult.matchedCriteria,
          demographics: {
            age: this.calculateAge(patient.birth_date),
            gender: patient.gender,
            location: patient.city || patient.state || 'N/A',
          },
          medicalSummary: {
            primaryConditions: patient.conditions || [],
            currentTreatments: patient.treatments || [],
            lastVisit: patient.last_visit || 'N/A',
          },
          behavioralMetrics: {
            visitFrequency: patient.visit_frequency || 0,
            appointmentTypes: patient.appointment_types || [],
            adherenceScore: patient.adherence_score || 0,
          },
        });
      }
    }

    return members;
  }

  /**
   * Calculate individual patient match score
   */
  private async calculatePatientMatchScore(
    patient: any,
    criteria: SegmentCriteria
  ): Promise<{ score: number; matchedCriteria: string[] }> {
    let totalScore = 0;
    let maxPossibleScore = 0;
    const matchedCriteria: string[] = [];

    const { structuredCriteria } = criteria;

    // Demographics scoring
    if (structuredCriteria.demographics) {
      const demoScore = this.scoreDemographics(
        patient,
        structuredCriteria.demographics
      );
      totalScore += demoScore.score;
      maxPossibleScore += demoScore.maxScore;
      matchedCriteria.push(...demoScore.matched);
    }

    // Medical scoring
    if (structuredCriteria.medical) {
      const medicalScore = this.scoreMedical(
        patient,
        structuredCriteria.medical
      );
      totalScore += medicalScore.score;
      maxPossibleScore += medicalScore.maxScore;
      matchedCriteria.push(...medicalScore.matched);
    }

    // Behavioral scoring
    if (structuredCriteria.behavioral) {
      const behavioralScore = this.scoreBehavioral(
        patient,
        structuredCriteria.behavioral
      );
      totalScore += behavioralScore.score;
      maxPossibleScore += behavioralScore.maxScore;
      matchedCriteria.push(...behavioralScore.matched);
    }

    // Financial scoring
    if (structuredCriteria.financial) {
      const financialScore = this.scoreFinancial(
        patient,
        structuredCriteria.financial
      );
      totalScore += financialScore.score;
      maxPossibleScore += financialScore.maxScore;
      matchedCriteria.push(...financialScore.matched);
    }

    const finalScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;

    return {
      score: Math.round(finalScore * 100) / 100,
      matchedCriteria: [...new Set(matchedCriteria)],
    };
  }

  /**
   * Score demographics criteria
   */
  private scoreDemographics(
    patient: any,
    demographics: NonNullable<
      SegmentCriteria['structuredCriteria']['demographics']
    >
  ): { score: number; maxScore: number; matched: string[] } {
    let score = 0;
    let maxScore = 0;
    const matched: string[] = [];

    // Age scoring
    if (demographics.ageRange) {
      maxScore += 10;
      const patientAge = this.calculateAge(patient.birth_date);

      if (
        (!demographics.ageRange.min ||
          patientAge >= demographics.ageRange.min) &&
        (!demographics.ageRange.max || patientAge <= demographics.ageRange.max)
      ) {
        score += 10;
        matched.push('age_range');
      }
    }

    // Gender scoring
    if (demographics.gender && demographics.gender.length > 0) {
      maxScore += 10;
      if (demographics.gender.includes(patient.gender)) {
        score += 10;
        matched.push('gender');
      }
    }

    // Location scoring
    if (demographics.location && demographics.location.length > 0) {
      maxScore += 10;
      const patientLocation =
        `${patient.address || ''} ${patient.city || ''} ${patient.state || ''}`.toLowerCase();

      if (
        demographics.location.some((loc) =>
          patientLocation.includes(loc.toLowerCase())
        )
      ) {
        score += 10;
        matched.push('location');
      }
    }

    return { score, maxScore, matched };
  }

  /**
   * Score medical criteria
   */
  private scoreMedical(
    patient: any,
    medical: NonNullable<SegmentCriteria['structuredCriteria']['medical']>
  ): { score: number; maxScore: number; matched: string[] } {
    let score = 0;
    let maxScore = 0;
    const matched: string[] = [];

    // Conditions scoring
    if (medical.conditions && medical.conditions.length > 0) {
      maxScore += 15;
      const patientConditions = (patient.conditions || []).map((c: string) =>
        c.toLowerCase()
      );
      const matchedConditions = medical.conditions.filter((condition) =>
        patientConditions.some((pc) => pc.includes(condition.toLowerCase()))
      );

      if (matchedConditions.length > 0) {
        score += Math.min(
          15,
          (matchedConditions.length / medical.conditions.length) * 15
        );
        matched.push('conditions');
      }
    }

    // Treatments scoring
    if (medical.treatments && medical.treatments.length > 0) {
      maxScore += 10;
      const patientTreatments = (patient.treatments || []).map((t: string) =>
        t.toLowerCase()
      );
      const matchedTreatments = medical.treatments.filter((treatment) =>
        patientTreatments.some((pt) => pt.includes(treatment.toLowerCase()))
      );

      if (matchedTreatments.length > 0) {
        score += Math.min(
          10,
          (matchedTreatments.length / medical.treatments.length) * 10
        );
        matched.push('treatments');
      }
    }

    // Medications scoring
    if (medical.medications && medical.medications.length > 0) {
      maxScore += 10;
      const patientMedications = (patient.medications || []).map((m: string) =>
        m.toLowerCase()
      );
      const matchedMedications = medical.medications.filter((medication) =>
        patientMedications.some((pm) => pm.includes(medication.toLowerCase()))
      );

      if (matchedMedications.length > 0) {
        score += Math.min(
          10,
          (matchedMedications.length / medical.medications.length) * 10
        );
        matched.push('medications');
      }
    }

    return { score, maxScore, matched };
  }

  /**
   * Score behavioral criteria
   */
  private scoreBehavioral(
    patient: any,
    behavioral: NonNullable<SegmentCriteria['structuredCriteria']['behavioral']>
  ): { score: number; maxScore: number; matched: string[] } {
    let score = 0;
    let maxScore = 0;
    const matched: string[] = [];

    // Visit frequency scoring
    if (behavioral.visitFrequency) {
      maxScore += 15;
      const patientFrequency = patient.visit_frequency || 0;

      if (
        (!behavioral.visitFrequency.min ||
          patientFrequency >= behavioral.visitFrequency.min) &&
        (!behavioral.visitFrequency.max ||
          patientFrequency <= behavioral.visitFrequency.max)
      ) {
        score += 15;
        matched.push('visit_frequency');
      }
    }

    // Last visit scoring
    if (behavioral.lastVisit) {
      maxScore += 10;
      const lastVisitDate = new Date(patient.last_visit || '1900-01-01');

      let matches = true;
      if (behavioral.lastVisit.before) {
        matches =
          matches && lastVisitDate < new Date(behavioral.lastVisit.before);
      }
      if (behavioral.lastVisit.after) {
        matches =
          matches && lastVisitDate > new Date(behavioral.lastVisit.after);
      }

      if (matches) {
        score += 10;
        matched.push('last_visit');
      }
    }

    return { score, maxScore, matched };
  }

  /**
   * Score financial criteria
   */
  private scoreFinancial(
    patient: any,
    financial: NonNullable<SegmentCriteria['structuredCriteria']['financial']>
  ): { score: number; maxScore: number; matched: string[] } {
    let score = 0;
    let maxScore = 0;
    const matched: string[] = [];

    // Insurance types scoring
    if (financial.insuranceTypes && financial.insuranceTypes.length > 0) {
      maxScore += 10;
      const patientInsurance = (patient.insurance_type || '').toLowerCase();

      if (
        financial.insuranceTypes.some((type) =>
          patientInsurance.includes(type.toLowerCase())
        )
      ) {
        score += 10;
        matched.push('insurance_type');
      }
    }

    // Outstanding balance scoring
    if (financial.outstandingBalance) {
      maxScore += 10;
      const patientBalance = patient.outstanding_balance || 0;

      if (
        (!financial.outstandingBalance.min ||
          patientBalance >= financial.outstandingBalance.min) &&
        (!financial.outstandingBalance.max ||
          patientBalance <= financial.outstandingBalance.max)
      ) {
        score += 10;
        matched.push('outstanding_balance');
      }
    }

    return { score, maxScore, matched };
  }

  /**
   * Calculate age from birth date
   */
  private calculateAge(birthDate: string): number {
    if (!birthDate) {
      return 0;
    }

    const birth = new Date(birthDate);
    const today = new Date();
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

  /**
   * Sort segment members
   */
  private sortSegmentMembers(
    members: PatientSegmentMember[],
    sortBy: string,
    sortOrder: string
  ): PatientSegmentMember[] {
    return members.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'matchScore':
          comparison = b.matchScore - a.matchScore;
          break;
        case 'lastVisit':
          comparison =
            new Date(b.medicalSummary.lastVisit).getTime() -
            new Date(a.medicalSummary.lastVisit).getTime();
          break;
        case 'name':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }

  /**
   * Generate segment insights
   */
  private async generateSegmentInsights(
    members: PatientSegmentMember[],
    criteria: SegmentCriteria
  ): Promise<PatientSegment['insights']> {
    const insights: PatientSegment['insights'] = {
      commonCharacteristics: [],
      trends: [],
      recommendations: [],
    };

    if (members.length === 0) {
      return insights;
    }

    // Analyze common characteristics
    const ageGroups = this.analyzeAgeDistribution(members);
    const genderDistribution = this.analyzeGenderDistribution(members);
    const conditionFrequency = this.analyzeConditionFrequency(members);

    insights.commonCharacteristics = [
      `Faixa etária predominante: ${ageGroups[0]?.range || 'N/A'}`,
      `Distribuição por gênero: ${genderDistribution}`,
      `Condições mais comuns: ${conditionFrequency.slice(0, 3).join(', ')}`,
    ];

    // Analyze trends
    insights.trends = [
      `Segmento com ${members.length} pacientes`,
      `Score médio de correspondência: ${this.calculateAverageMatchScore(members).toFixed(2)}`,
      `Frequência média de visitas: ${this.calculateAverageVisitFrequency(members).toFixed(1)}`,
    ];

    // Generate recommendations
    insights.recommendations = this.generateRecommendations(members, criteria);

    return insights;
  }

  /**
   * Analyze age distribution
   */
  private analyzeAgeDistribution(
    members: PatientSegmentMember[]
  ): Array<{ range: string; count: number }> {
    const ageGroups: Record<string, number> = {
      '0-18': 0,
      '19-30': 0,
      '31-45': 0,
      '46-60': 0,
      '61+': 0,
    };

    members.forEach((member) => {
      const age = member.demographics.age;
      if (age <= 18) {
        ageGroups['0-18']++;
      } else if (age <= 30) {
        ageGroups['19-30']++;
      } else if (age <= 45) {
        ageGroups['31-45']++;
      } else if (age <= 60) {
        ageGroups['46-60']++;
      } else {
        ageGroups['61+']++;
      }
    });

    return Object.entries(ageGroups)
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Analyze gender distribution
   */
  private analyzeGenderDistribution(members: PatientSegmentMember[]): string {
    const genderCounts: Record<string, number> = {};

    members.forEach((member) => {
      const gender = member.demographics.gender;
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    return Object.entries(genderCounts)
      .map(([gender, count]) => `${gender}: ${count}`)
      .join(', ');
  }

  /**
   * Analyze condition frequency
   */
  private analyzeConditionFrequency(members: PatientSegmentMember[]): string[] {
    const conditionCounts: Record<string, number> = {};

    members.forEach((member) => {
      member.medicalSummary.primaryConditions.forEach((condition) => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      });
    });

    return Object.entries(conditionCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([condition]) => condition);
  }

  /**
   * Calculate average match score
   */
  private calculateAverageMatchScore(members: PatientSegmentMember[]): number {
    if (members.length === 0) {
      return 0;
    }

    const totalScore = members.reduce(
      (sum, member) => sum + member.matchScore,
      0
    );
    return totalScore / members.length;
  }

  /**
   * Calculate average visit frequency
   */
  private calculateAverageVisitFrequency(
    members: PatientSegmentMember[]
  ): number {
    if (members.length === 0) {
      return 0;
    }

    const totalFrequency = members.reduce(
      (sum, member) => sum + member.behavioralMetrics.visitFrequency,
      0
    );
    return totalFrequency / members.length;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    members: PatientSegmentMember[],
    _criteria: SegmentCriteria
  ): string[] {
    const recommendations: string[] = [];

    // Size-based recommendations
    if (members.length < 10) {
      recommendations.push(
        'Segmento pequeno - considere expandir os critérios para incluir mais pacientes'
      );
    } else if (members.length > 500) {
      recommendations.push(
        'Segmento muito grande - considere refinar os critérios para melhor direcionamento'
      );
    }

    // Match score recommendations
    const avgMatchScore = this.calculateAverageMatchScore(members);
    if (avgMatchScore < 0.7) {
      recommendations.push(
        'Score de correspondência baixo - revise os critérios para melhor precisão'
      );
    }

    // Behavioral recommendations
    const avgVisitFreq = this.calculateAverageVisitFrequency(members);
    if (avgVisitFreq < 2) {
      recommendations.push(
        'Pacientes com baixa frequência de visitas - considere campanhas de engajamento'
      );
    } else if (avgVisitFreq > 6) {
      recommendations.push(
        'Pacientes frequentes - oportunidade para programas de fidelidade'
      );
    }

    return recommendations;
  }

  /**
   * Calculate segment performance
   */
  private calculateSegmentPerformance(
    members: PatientSegmentMember[],
    _criteria: SegmentCriteria
  ): PatientSegment['performance'] {
    const avgMatchScore = this.calculateAverageMatchScore(members);

    return {
      accuracy: Math.round(avgMatchScore * 100) / 100,
      precision:
        Math.round(
          (members.filter((m) => m.matchScore >= 0.8).length / members.length) *
            100
        ) / 100,
      recall: Math.round((members.length / (members.length + 10)) * 100) / 100, // Simplified calculation
    };
  }

  /**
   * Cache segment
   */
  private cacheSegment(segment: PatientSegment): void {
    this.segmentCache.set(segment.id, segment);
    this.cacheExpiry.set(segment.id, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Get cached segment
   */
  private getCachedSegment(segmentId: string): PatientSegment | null {
    const expiry = this.cacheExpiry.get(segmentId);
    if (!expiry || Date.now() > expiry) {
      this.segmentCache.delete(segmentId);
      this.cacheExpiry.delete(segmentId);
      return null;
    }

    return this.segmentCache.get(segmentId) || null;
  }

  /**
   * Get all segments
   */
  async getAllSegments(includeInactive = false): Promise<PatientSegment[]> {
    try {
      const { data, error } = await this.supabase
        .from('patient_segments')
        .select('*')
        .eq('is_active', includeInactive ? undefined : true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get segments: ${error.message}`);
      }

      const segments: PatientSegment[] = [];

      for (const segmentData of data || []) {
        const criteria: SegmentCriteria = {
          id: segmentData.id,
          name: segmentData.segment_name,
          description: segmentData.description,
          naturalLanguageQuery: segmentData.natural_language_query,
          structuredCriteria: segmentData.criteria_json,
          language: segmentData.language,
          createdBy: segmentData.created_by,
          isActive: segmentData.is_active,
          tags: segmentData.tags,
        };

        const segment = await this.generateSegment(criteria, {
          refreshData: false,
        });
        segments.push(segment);
      }

      return segments;
    } catch (error) {
      console.error('Error getting all segments:', error);
      throw error;
    }
  }

  /**
   * Update segment
   */
  async updateSegment(
    segmentId: string,
    updates: Partial<SegmentCriteria>
  ): Promise<PatientSegment> {
    try {
      const { data, error } = await this.supabase
        .from('patient_segments')
        .update({
          segment_name: updates.name,
          description: updates.description,
          natural_language_query: updates.naturalLanguageQuery,
          criteria_json: updates.structuredCriteria,
          language: updates.language,
          is_active: updates.isActive,
          tags: updates.tags,
        })
        .eq('id', segmentId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update segment: ${error.message}`);
      }

      const criteria: SegmentCriteria = {
        id: data.id,
        name: data.segment_name,
        description: data.description,
        naturalLanguageQuery: data.natural_language_query,
        structuredCriteria: data.criteria_json,
        language: data.language,
        createdBy: data.created_by,
        isActive: data.is_active,
        tags: data.tags,
      };

      // Clear cache and regenerate
      this.segmentCache.delete(segmentId);
      this.cacheExpiry.delete(segmentId);

      return await this.generateSegment(criteria, { refreshData: true });
    } catch (error) {
      console.error('Error updating segment:', error);
      throw error;
    }
  }

  /**
   * Delete segment
   */
  async deleteSegment(segmentId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('patient_segments')
        .delete()
        .eq('id', segmentId);

      if (error) {
        throw new Error(`Failed to delete segment: ${error.message}`);
      }

      // Clear cache
      this.segmentCache.delete(segmentId);
      this.cacheExpiry.delete(segmentId);
    } catch (error) {
      console.error('Error deleting segment:', error);
      throw error;
    }
  }

  /**
   * Get segmentation analytics
   */
  async getAnalytics(): Promise<SegmentationAnalytics> {
    try {
      const segments = await this.getAllSegments();

      const totalSegments = segments.length;
      const totalPatients = segments.reduce(
        (sum, segment) => sum + segment.patientCount,
        0
      );
      const averageSegmentSize =
        totalSegments > 0 ? totalPatients / totalSegments : 0;

      // Analyze common criteria
      const criteriaFrequency: Record<string, number> = {};
      segments.forEach((segment) => {
        segment.criteria.tags?.forEach((tag) => {
          criteriaFrequency[tag] = (criteriaFrequency[tag] || 0) + 1;
        });
      });

      const mostCommonCriteria = Object.entries(criteriaFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([criteria]) => criteria);

      // Analyze performance
      const segmentPerformance = {
        highPerforming: segments.filter((s) => s.performance.accuracy >= 0.8)
          .length,
        mediumPerforming: segments.filter(
          (s) => s.performance.accuracy >= 0.6 && s.performance.accuracy < 0.8
        ).length,
        lowPerforming: segments.filter((s) => s.performance.accuracy < 0.6)
          .length,
      };

      // Analyze trends (simplified)
      const trends = {
        growingSegments: segments
          .filter((s) => s.patientCount > averageSegmentSize)
          .map((s) => s.criteria.name),
        shrinkingSegments: segments
          .filter((s) => s.patientCount < averageSegmentSize * 0.5)
          .map((s) => s.criteria.name),
        stableSegments: segments
          .filter(
            (s) =>
              s.patientCount >= averageSegmentSize * 0.5 &&
              s.patientCount <= averageSegmentSize
          )
          .map((s) => s.criteria.name),
      };

      return {
        totalSegments,
        totalPatients,
        averageSegmentSize: Math.round(averageSegmentSize),
        mostCommonCriteria,
        segmentPerformance,
        trends,
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const patientSegmentation = new PatientSegmentation(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
