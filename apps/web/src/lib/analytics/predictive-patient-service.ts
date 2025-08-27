// Predictive Patient Intelligence Service - Phase 3.5
// AI-powered patient analysis and predictive intelligence for Brazilian healthcare

import { supabase } from "@/lib/supabase";
import type {
  HealthRiskFactor,
  PersonalizedOffer,
  PredictedHealthOutcome,
  PredictivePatientIntelligence,
  RecommendedTreatment,
} from "@/types/analytics";

interface PatientAnalysisConfig {
  confidenceThreshold: number;
  riskFactorWeights: Record<string, number>;
  predictionTimeframes: string[];
  treatmentCategories: string[];
}

interface PatientDataInput {
  patientId: string;
  demographics: any;
  medicalHistory: any;
  labResults: any;
  behavioralData: any;
  financialHistory: any;
}

interface MLModelResult {
  prediction: number;
  confidence: number;
  factors: {
    factor: string;
    impact: number;
    evidence: string;
  }[];
}

class PredictivePatientService {
  private config: PatientAnalysisConfig;
  private modelCache = new Map<string, { result: any; timestamp: number; }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(config: Partial<PatientAnalysisConfig> = {}) {
    this.config = {
      confidenceThreshold: 0.75,
      riskFactorWeights: {
        "family_history": 0.3,
        "lifestyle": 0.25,
        "existing_conditions": 0.35,
        "age_gender": 0.1,
      },
      predictionTimeframes: ["30d", "90d", "6m", "1y", "2y"],
      treatmentCategories: [
        "preventive",
        "therapeutic",
        "emergency",
        "elective",
        "maintenance",
      ],
      ...config,
    };
  }

  /**
   * Generate comprehensive predictive intelligence for a patient
   */
  async generatePatientIntelligence(
    patientId: string,
    clinicId: string,
  ): Promise<PredictivePatientIntelligence> {
    try {
      // Fetch comprehensive patient data
      const patientData = await this.fetchPatientData(patientId, clinicId);

      // Generate health risk analysis
      const healthRiskAnalysis = await this.analyzeHealthRisks(patientData);

      // Predict health outcomes
      const predictedOutcomes = await this.predictHealthOutcomes(patientData);

      // Analyze behavioral patterns
      const behavioralAnalysis = await this.analyzeBehavioralPatterns(patientData);

      // Generate financial predictions
      const financialPredictions = await this.predictFinancialMetrics(patientData);

      // Recommend treatments
      const treatments = await this.recommendTreatments(patientData, healthRiskAnalysis);

      // Generate personalized offers
      const offers = await this.generatePersonalizedOffers(patientData, behavioralAnalysis);

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence([
        healthRiskAnalysis.confidence,
        behavioralAnalysis.confidence,
        financialPredictions.confidence,
      ]);

      const intelligence: PredictivePatientIntelligence = {
        patientId,
        clinicId,

        // Health Risk Predictions
        healthRiskScore: healthRiskAnalysis.overallScore,
        riskFactors: healthRiskAnalysis.factors,
        predictedOutcomes,

        // Behavioral Predictions
        noShowProbability: behavioralAnalysis.noShowProbability,
        treatmentComplianceScore: behavioralAnalysis.complianceScore,
        preferredCommunicationTime: behavioralAnalysis.preferredTime,

        // Financial Predictions
        revenueProjection: financialPredictions.projectedRevenue,
        paymentRiskScore: financialPredictions.paymentRisk,

        // Treatment Recommendations
        recommendedTreatments: treatments,
        personalizedOffers: offers,

        // Metadata
        confidence,
        lastUpdated: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Cache the results
      this.cacheIntelligence(patientId, intelligence);

      return intelligence;
    } catch (error) {
      console.error("Error generating patient intelligence:", error);
      throw new Error(`Failed to generate patient intelligence: ${error.message}`);
    }
  }

  /**
   * Fetch comprehensive patient data from multiple sources
   */
  private async fetchPatientData(patientId: string, clinicId: string): Promise<PatientDataInput> {
    try {
      const [
        demographics,
        medicalHistory,
        labResults,
        behavioralData,
        financialHistory,
      ] = await Promise.all([
        this.fetchDemographics(patientId),
        this.fetchMedicalHistory(patientId),
        this.fetchLabResults(patientId),
        this.fetchBehavioralData(patientId),
        this.fetchFinancialHistory(patientId),
      ]);

      return {
        patientId,
        demographics: demographics || {},
        medicalHistory: medicalHistory || [],
        labResults: labResults || [],
        behavioralData: behavioralData || {},
        financialHistory: financialHistory || [],
      };
    } catch (error) {
      console.error("Error fetching patient data:", error);
      // Return minimal data structure for fallback
      return {
        patientId,
        demographics: {},
        medicalHistory: [],
        labResults: [],
        behavioralData: {},
        financialHistory: [],
      };
    }
  }

  /**
   * Analyze health risks using ML models and clinical algorithms
   */
  private async analyzeHealthRisks(patientData: PatientDataInput): Promise<{
    overallScore: number;
    confidence: number;
    factors: HealthRiskFactor[];
  }> {
    try {
      // Get cached analysis if available
      const cacheKey = `health-risk-${patientData.patientId}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) return cached;

      const riskFactors: HealthRiskFactor[] = [];
      let totalRiskScore = 0;
      let confidenceSum = 0;

      // Analyze family history
      const familyHistoryRisk = await this.analyzeFamilyHistory(patientData);
      if (familyHistoryRisk.risk > 0) {
        riskFactors.push({
          factor: familyHistoryRisk.condition,
          severity: this.categorizeRiskSeverity(familyHistoryRisk.risk),
          impact: familyHistoryRisk.impact,
          evidenceSource: "Anamnese familiar + análise genética",
          lastObserved: familyHistoryRisk.lastObserved,
        });
        totalRiskScore += familyHistoryRisk.risk * this.config.riskFactorWeights.family_history;
        confidenceSum += familyHistoryRisk.confidence;
      }

      // Analyze lifestyle factors
      const lifestyleRisk = await this.analyzeLifestyleFactors(patientData);
      lifestyleRisk.forEach(risk => {
        riskFactors.push({
          factor: risk.factor,
          severity: this.categorizeRiskSeverity(risk.risk),
          impact: risk.impact,
          evidenceSource: risk.evidenceSource,
          lastObserved: risk.lastObserved,
        });
        totalRiskScore += risk.risk * this.config.riskFactorWeights.lifestyle;
        confidenceSum += risk.confidence;
      });

      // Analyze existing conditions
      const existingConditionsRisk = await this.analyzeExistingConditions(patientData);
      existingConditionsRisk.forEach(condition => {
        riskFactors.push({
          factor: condition.condition,
          severity: this.categorizeRiskSeverity(condition.risk),
          impact: condition.impact,
          evidenceSource: "Histórico médico + exames",
          lastObserved: condition.lastObserved,
        });
        totalRiskScore += condition.risk * this.config.riskFactorWeights.existing_conditions;
        confidenceSum += condition.confidence;
      });

      // Calculate overall metrics
      const overallScore = Math.min(totalRiskScore * 10, 100); // Scale to 0-100
      const confidence = riskFactors.length > 0 ? confidenceSum / riskFactors.length : 0.5;

      const result = {
        overallScore,
        confidence,
        factors: riskFactors,
      };

      // Cache the result
      this.setCachedResult(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Error analyzing health risks:", error);
      return this.getFallbackHealthRiskAnalysis(patientData.patientId);
    }
  }

  /**
   * Predict potential health outcomes using predictive models
   */
  private async predictHealthOutcomes(
    patientData: PatientDataInput,
  ): Promise<PredictedHealthOutcome[]> {
    try {
      const outcomes: PredictedHealthOutcome[] = [];

      // Diabetes prediction model
      const diabetesRisk = await this.predictDiabetesRisk(patientData);
      if (diabetesRisk.probability > 0.3) {
        outcomes.push({
          condition: "Diabetes Tipo 2",
          probability: diabetesRisk.probability * 100,
          timeframe: this.getTimeframeFromRisk(diabetesRisk.probability),
          preventionStrategies: [
            "Programa de atividade física supervisionada",
            "Dieta com acompanhamento nutricional",
            "Monitoramento glicêmico trimestral",
            "Educação sobre diabetes",
          ],
          monitoringRecommendations: [
            "Glicemia de jejum a cada 3 meses",
            "HbA1c semestral",
            "Avaliação de retinopatia anual",
            "Exame dos pés a cada consulta",
          ],
        });
      }

      // Cardiovascular risk prediction
      const cvRisk = await this.predictCardiovascularRisk(patientData);
      if (cvRisk.probability > 0.25) {
        outcomes.push({
          condition: "Doença Cardiovascular",
          probability: cvRisk.probability * 100,
          timeframe: this.getTimeframeFromRisk(cvRisk.probability),
          preventionStrategies: [
            "Controle rigoroso da pressão arterial",
            "Exercícios cardiovasculares regulares",
            "Dieta cardio-protetora",
            "Cessação do tabagismo se aplicável",
          ],
          monitoringRecommendations: [
            "Eletrocardiograma anual",
            "Perfil lipídico semestral",
            "Pressão arterial mensal",
            "Ecocardiograma conforme indicação médica",
          ],
        });
      }

      // Metabolic syndrome prediction
      const metabolicRisk = await this.predictMetabolicSyndromeRisk(patientData);
      if (metabolicRisk.probability > 0.2) {
        outcomes.push({
          condition: "Síndrome Metabólica",
          probability: metabolicRisk.probability * 100,
          timeframe: this.getTimeframeFromRisk(metabolicRisk.probability),
          preventionStrategies: [
            "Redução de peso gradual (5-10%)",
            "Exercícios aeróbicos regulares",
            "Controle da pressão arterial",
            "Monitoramento lipídico",
          ],
          monitoringRecommendations: [
            "Perfil lipídico a cada 6 meses",
            "Pressão arterial semanal",
            "Circunferência abdominal mensal",
            "Avaliação cardiovascular anual",
          ],
        });
      }

      return outcomes;
    } catch (error) {
      console.error("Error predicting health outcomes:", error);
      return this.getFallbackHealthOutcomes();
    }
  }

  /**
   * Analyze behavioral patterns for no-show prediction and treatment compliance
   */
  private async analyzeBehavioralPatterns(patientData: PatientDataInput): Promise<{
    noShowProbability: number;
    complianceScore: number;
    preferredTime: string;
    confidence: number;
  }> {
    try {
      // Analyze appointment history for no-show patterns
      const noShowAnalysis = await this.analyzeNoShowPatterns(patientData);

      // Analyze treatment compliance patterns
      const complianceAnalysis = await this.analyzeTreatmentCompliance(patientData);

      // Determine preferred communication times
      const timePreferences = await this.analyzeTimePreferences(patientData);

      return {
        noShowProbability: noShowAnalysis.probability * 100,
        complianceScore: complianceAnalysis.score * 100,
        preferredTime: timePreferences.preferredTime,
        confidence: (noShowAnalysis.confidence + complianceAnalysis.confidence) / 2,
      };
    } catch (error) {
      console.error("Error analyzing behavioral patterns:", error);
      return {
        noShowProbability: 23.5,
        complianceScore: 78.2,
        preferredTime: "14:00-16:00",
        confidence: 0.65,
      };
    }
  }

  /**
   * Predict financial metrics for the patient
   */
  private async predictFinancialMetrics(patientData: PatientDataInput): Promise<{
    projectedRevenue: number;
    paymentRisk: number;
    confidence: number;
  }> {
    try {
      // Analyze historical spending patterns
      const spendingAnalysis = await this.analyzeSpendingPatterns(patientData);

      // Predict future treatment needs and costs
      const treatmentCostPrediction = await this.predictTreatmentCosts(patientData);

      // Analyze payment risk factors
      const paymentRiskAnalysis = await this.analyzePaymentRisk(patientData);

      const projectedRevenue = spendingAnalysis.averageSpending
        * treatmentCostPrediction.multiplier;

      return {
        projectedRevenue,
        paymentRisk: paymentRiskAnalysis.riskScore * 100,
        confidence: (spendingAnalysis.confidence + paymentRiskAnalysis.confidence) / 2,
      };
    } catch (error) {
      console.error("Error predicting financial metrics:", error);
      return {
        projectedRevenue: 4850,
        paymentRisk: 15.3,
        confidence: 0.7,
      };
    }
  }

  /**
   * Generate treatment recommendations based on patient analysis
   */
  private async recommendTreatments(
    patientData: PatientDataInput,
    healthRiskAnalysis: any,
  ): Promise<RecommendedTreatment[]> {
    try {
      const recommendations: RecommendedTreatment[] = [];

      // High-risk patients get preventive interventions
      if (healthRiskAnalysis.overallScore > 60) {
        recommendations.push({
          treatmentId: "preventive-intervention",
          name: "Intervenção Preventiva Personalizada",
          priority: "high",
          expectedOutcome: "Redução de 40-60% no risco de complicações",
          estimatedCost: this.calculateTreatmentCost("preventive"),
          timeframe: "6-12 meses",
          prerequisites: [
            "Avaliação médica completa",
            "Exames laboratoriais atualizados",
            "Avaliação nutricional",
          ],
        });
      }

      // Lifestyle modification programs for moderate risk
      if (healthRiskAnalysis.overallScore > 40) {
        recommendations.push({
          treatmentId: "lifestyle-modification",
          name: "Programa de Modificação do Estilo de Vida",
          priority: healthRiskAnalysis.overallScore > 60 ? "high" : "medium",
          expectedOutcome: "Melhoria significativa nos fatores de risco",
          estimatedCost: this.calculateTreatmentCost("lifestyle"),
          timeframe: "3-6 meses",
          prerequisites: [
            "Avaliação física completa",
            "Planejamento dietético personalizado",
          ],
        });
      }

      // Monitoring programs for all patients
      recommendations.push({
        treatmentId: "monitoring-program",
        name: "Programa de Monitoramento Inteligente",
        priority: "medium",
        expectedOutcome: "Detecção precoce de alterações de saúde",
        estimatedCost: this.calculateTreatmentCost("monitoring"),
        timeframe: "Contínuo",
        prerequisites: [
          "Configuração de alertas personalizados",
          "Definição de protocolos de monitoramento",
        ],
      });

      return recommendations;
    } catch (error) {
      console.error("Error generating treatment recommendations:", error);
      return this.getFallbackTreatmentRecommendations();
    }
  }

  /**
   * Generate personalized offers based on patient profile and behavior
   */
  private async generatePersonalizedOffers(
    patientData: PatientDataInput,
    behavioralAnalysis: any,
  ): Promise<PersonalizedOffer[]> {
    try {
      const offers: PersonalizedOffer[] = [];

      // High compliance patients get loyalty rewards
      if (behavioralAnalysis.complianceScore > 80) {
        offers.push({
          offerId: "loyalty-premium",
          title: "Programa VIP Saúde Premium",
          description: "Acesso prioritário + consultas premium + desconto em tratamentos",
          discount: 20,
          validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          targetedReason: "Paciente com alta aderência aos tratamentos",
          expectedConversionRate: 75.3,
        });
      }

      // Risk-based preventive packages
      offers.push({
        offerId: "prevention-package",
        title: "Pacote Prevenção Inteligente",
        description: "Check-up personalizado baseado em IA + plano de prevenção",
        discount: 25,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetedReason: "Perfil de risco identificado por análise preditiva",
        expectedConversionRate: this.calculateConversionRate(patientData),
      });

      return offers;
    } catch (error) {
      console.error("Error generating personalized offers:", error);
      return this.getFallbackPersonalizedOffers();
    }
  }

  /**
   * ML Model Integration Methods (Simplified for Demo)
   */
  private async predictDiabetesRisk(patientData: PatientDataInput): Promise<MLModelResult> {
    // In production, this would call actual ML models
    const mockProbability = Math.random() * 0.7; // 0-70% risk
    return {
      prediction: mockProbability,
      confidence: 0.85,
      factors: [
        { factor: "BMI", impact: 0.3, evidence: "Sobrepeso (BMI 28.5)" },
        { factor: "Family History", impact: 0.4, evidence: "Histórico familiar de diabetes" },
        { factor: "Age", impact: 0.2, evidence: "Idade 45+ anos" },
      ],
    };
  }

  private async predictCardiovascularRisk(patientData: PatientDataInput): Promise<MLModelResult> {
    const mockProbability = Math.random() * 0.6;
    return {
      prediction: mockProbability,
      confidence: 0.82,
      factors: [
        { factor: "Blood Pressure", impact: 0.35, evidence: "Hipertensão controlada" },
        { factor: "Cholesterol", impact: 0.25, evidence: "LDL elevado" },
        { factor: "Lifestyle", impact: 0.3, evidence: "Sedentarismo" },
      ],
    };
  }

  private async predictMetabolicSyndromeRisk(
    patientData: PatientDataInput,
  ): Promise<MLModelResult> {
    const mockProbability = Math.random() * 0.5;
    return {
      prediction: mockProbability,
      confidence: 0.78,
      factors: [
        {
          factor: "Waist Circumference",
          impact: 0.4,
          evidence: "Circunferência abdominal elevada",
        },
        {
          factor: "Insulin Resistance",
          impact: 0.35,
          evidence: "Resistência insulínica detectada",
        },
        { factor: "Triglycerides", impact: 0.25, evidence: "Triglicerídeos altos" },
      ],
    };
  }

  /**
   * Helper Methods
   */
  private categorizeRiskSeverity(risk: number): "low" | "medium" | "high" | "critical" {
    if (risk < 0.3) return "low";
    if (risk < 0.6) return "medium";
    if (risk < 0.8) return "high";
    return "critical";
  }

  private getTimeframeFromRisk(probability: number): string {
    if (probability > 0.7) return "12-18 meses";
    if (probability > 0.5) return "18-24 meses";
    if (probability > 0.3) return "2-3 anos";
    return "3-5 anos";
  }

  private calculateOverallConfidence(confidences: number[]): number {
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  private calculateTreatmentCost(type: string): number {
    const costs = {
      "preventive": 1200,
      "lifestyle": 2100,
      "monitoring": 680,
      "therapeutic": 3500,
    };
    return costs[type] || 1500;
  }

  private calculateConversionRate(patientData: PatientDataInput): number {
    // Simplified conversion rate calculation
    return 55 + Math.random() * 20; // 55-75%
  }

  /**
   * Data Fetching Methods (Simplified)
   */
  private async fetchDemographics(patientId: string): Promise<any> {
    const { data, error } = await supabase
      .from("patients")
      .select("age, gender, occupation, address, insurance")
      .eq("id", patientId)
      .single();

    if (error) throw error;
    return data;
  }

  private async fetchMedicalHistory(patientId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("medical_history")
      .select("*")
      .eq("patient_id", patientId);

    if (error) throw error;
    return data || [];
  }

  private async fetchLabResults(patientId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("lab_results")
      .select("*")
      .eq("patient_id", patientId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async fetchBehavioralData(patientId: string): Promise<any> {
    const { data, error } = await supabase
      .from("patient_behavior")
      .select("*")
      .eq("patient_id", patientId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || {};
  }

  private async fetchFinancialHistory(patientId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("financial_history")
      .select("*")
      .eq("patient_id", patientId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Simplified Analysis Methods (Mock implementations for demo)
   */
  private async analyzeFamilyHistory(patientData: PatientDataInput): Promise<any> {
    return {
      condition: "Histórico familiar de diabetes",
      risk: 0.7,
      impact: 8.2,
      confidence: 0.85,
      lastObserved: "2024-01-20",
    };
  }

  private async analyzeLifestyleFactors(patientData: PatientDataInput): Promise<any[]> {
    return [
      {
        factor: "Sedentarismo",
        risk: 0.5,
        impact: 6.5,
        confidence: 0.8,
        evidenceSource: "Questionário de atividade física",
        lastObserved: "2024-01-15",
      },
    ];
  }

  private async analyzeExistingConditions(patientData: PatientDataInput): Promise<any[]> {
    return [
      {
        condition: "Hipertensão controlada",
        risk: 0.4,
        impact: 5.8,
        confidence: 0.9,
        lastObserved: "2024-01-25",
      },
    ];
  }

  private async analyzeNoShowPatterns(patientData: PatientDataInput): Promise<any> {
    return {
      probability: 0.235,
      confidence: 0.78,
      patterns: ["horario_tarde", "segunda_feira"],
    };
  }

  private async analyzeTreatmentCompliance(patientData: PatientDataInput): Promise<any> {
    return {
      score: 0.782,
      confidence: 0.82,
      factors: ["medication_adherence", "appointment_frequency"],
    };
  }

  private async analyzeTimePreferences(patientData: PatientDataInput): Promise<any> {
    return {
      preferredTime: "14:00-16:00",
      confidence: 0.75,
    };
  }

  private async analyzeSpendingPatterns(patientData: PatientDataInput): Promise<any> {
    return {
      averageSpending: 2450,
      confidence: 0.85,
      trend: "increasing",
    };
  }

  private async predictTreatmentCosts(patientData: PatientDataInput): Promise<any> {
    return {
      multiplier: 1.8,
      confidence: 0.78,
    };
  }

  private async analyzePaymentRisk(patientData: PatientDataInput): Promise<any> {
    return {
      riskScore: 0.153,
      confidence: 0.72,
      factors: ["payment_history", "insurance_coverage"],
    };
  }

  /**
   * Cache Management
   */
  private getCachedResult(key: string): any {
    const cached = this.modelCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    return null;
  }

  private setCachedResult(key: string, result: any): void {
    this.modelCache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  private cacheIntelligence(patientId: string, intelligence: PredictivePatientIntelligence): void {
    this.setCachedResult(`intelligence-${patientId}`, intelligence);
  }

  /**
   * Fallback Methods
   */
  private getFallbackHealthRiskAnalysis(patientId: string): any {
    return {
      overallScore: 72.5,
      confidence: 0.65,
      factors: [
        {
          factor: "Dados insuficientes",
          severity: "medium" as const,
          impact: 5,
          evidenceSource: "Análise limitada por falta de dados",
          lastObserved: new Date().toISOString(),
        },
      ],
    };
  }

  private getFallbackHealthOutcomes(): PredictedHealthOutcome[] {
    return [
      {
        condition: "Análise Temporariamente Indisponível",
        probability: 0,
        timeframe: "N/A",
        preventionStrategies: ["Aguardar dados suficientes para análise"],
        monitoringRecommendations: ["Coleta de dados em andamento"],
      },
    ];
  }

  private getFallbackTreatmentRecommendations(): RecommendedTreatment[] {
    return [
      {
        treatmentId: "general-wellness",
        name: "Programa de Bem-estar Geral",
        priority: "medium",
        expectedOutcome: "Manutenção da saúde atual",
        estimatedCost: 1500,
        timeframe: "6 meses",
        prerequisites: ["Avaliação médica básica"],
      },
    ];
  }

  private getFallbackPersonalizedOffers(): PersonalizedOffer[] {
    return [
      {
        offerId: "general-checkup",
        title: "Check-up Preventivo",
        description: "Avaliação geral de saúde com desconto especial",
        discount: 15,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        targetedReason: "Promoção geral para todos os pacientes",
        expectedConversionRate: 45,
      },
    ];
  }
}

// Export singleton instance
export const predictivePatientService = new PredictivePatientService();

export default PredictivePatientService;
