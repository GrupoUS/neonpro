/**
 * @fileoverview Sistema de Busca por Similaridade de Casos Clínicos para NeonPro
 * 
 * Sistema especializado em encontrar casos clínicos similares baseado em
 * sintomas, diagnósticos, tratamentos e características do paciente,
 * utilizando análise semântica avançada e machine learning.
 * 
 * Funcionalidades:
 * - Busca por similaridade de sintomas e diagnósticos
 * - Análise de padrões de tratamento similares
 * - Comparação de características demográficas
 * - Sugestões de casos de referência
 * - Analytics de efetividade de tratamentos
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @since 2025-01-30
 */

import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/supabase';
import { 
  ClinicalCase,
  CaseSimilarity,
  SimilarityMetrics,
  ClinicalPattern,
  TreatmentOutcome,
  PatientProfile,
  DiagnosisProfile,
  SimilaritySearchQuery,
  ClinicalInsight
} from '@/lib/types/search-types';
import { VectorDatabase } from './vector-database';
import { NLPService } from './nlp-service';
import { AuditLogger } from './audit-logger';
import { SearchErrorHandler } from './error-handler';
import { Redis } from 'ioredis';

// Tipos específicos para similaridade clínica
interface ClinicalSimilarityConfig {
  similarity: {
    enabled: boolean;
    thresholds: {
      symptoms: number;
      diagnosis: number;
      treatment: number;
      demographics: number;
      overall: number;
    };
    weights: {
      symptoms: number;
      diagnosis: number;
      treatment: number;
      demographics: number;
      outcomes: number;
    };
  };
  analysis: {
    enabled: boolean;
    deepAnalysis: boolean;
    semanticSimilarity: boolean;
    temporalPatterns: boolean;
    outcomeCorrelation: boolean;
  };
  patterns: {
    enabled: boolean;
    minCaseCount: number;
    confidenceThreshold: number;
    patternTypes: string[];
    learningEnabled: boolean;
  };
  privacy: {
    dataAnonymization: boolean;
    consentRequired: boolean;
    auditAll: boolean;
    retentionDays: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
    warmupPatterns: boolean;
  };
}

interface ClinicalVector {
  caseId: string;
  patientId: string;
  symptoms: string[];
  diagnosis: string[];
  treatments: string[];
  outcomes: TreatmentOutcome[];
  demographics: PatientProfile;
  timeline: Date[];
  embeddings: {
    symptoms: number[];
    diagnosis: number[];
    treatment: number[];
    combined: number[];
  };
  metadata: Record<string, any>;
}

interface SimilarityScore {
  overall: number;
  symptoms: number;
  diagnosis: number;
  treatment: number;
  demographics: number;
  outcomes: number;
  confidence: number;
  breakdown: Record<string, number>;
}

interface ClinicalPattern {
  id: string;
  name: string;
  description: string;
  type: 'diagnostic' | 'treatment' | 'outcome' | 'demographic';
  pattern: {
    conditions: Record<string, any>;
    frequency: number;
    effectiveness: number;
    confidence: number;
  };
  cases: string[];
  insights: ClinicalInsight[];
  lastUpdated: Date;
  metadata: Record<string, any>;
}

interface CaseComparison {
  referenceCase: ClinicalCase;
  similarCase: ClinicalCase;
  similarity: SimilarityScore;
  insights: ClinicalInsight[];
  recommendations: {
    type: 'diagnostic' | 'treatment' | 'monitoring';
    description: string;
    confidence: number;
    evidence: string[];
  }[];
  riskFactors: {
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

/**
 * Sistema avançado de busca por similaridade de casos clínicos
 * 
 * Identifica padrões clínicos, sugere tratamentos baseados em casos
 * similares e fornece insights para tomada de decisão médica.
 */
export class ClinicalSimilarityEngine {
  private supabase;
  private config: ClinicalSimilarityConfig;
  private vectorDatabase: VectorDatabase;
  private nlpService: NLPService;
  private auditLogger: AuditLogger;
  private errorHandler: SearchErrorHandler;
  private redis?: Redis;
  private clinicalPatterns: Map<string, ClinicalPattern>;
  private caseVectors: Map<string, ClinicalVector>;
  private similarityCache: Map<string, CaseSimilarity[]>;

  constructor(config: ClinicalSimilarityConfig) {
    this.supabase = createClient();
    this.config = config;
    this.vectorDatabase = new VectorDatabase(this.getVectorConfig());
    this.nlpService = new NLPService();
    this.auditLogger = new AuditLogger();
    this.errorHandler = new SearchErrorHandler();
    this.clinicalPatterns = new Map();
    this.caseVectors = new Map();
    this.similarityCache = new Map();

    // Inicializar Redis se configurado
    if (this.config.cache.enabled && process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
    }

    // Carregar padrões clínicos existentes
    this.loadClinicalPatterns();
  }

  /**
   * Encontrar casos clínicos similares
   */
  async findSimilarCases(
    referenceCase: ClinicalCase,
    options: {
      maxResults?: number;
      similarityThreshold?: number;
      includeOutcomes?: boolean;
      includeTreatments?: boolean;
      anonymize?: boolean;
      contextType?: string;
    } = {}
  ): Promise<CaseSimilarity[]> {
    try {
      const startTime = Date.now();

      // Verificar cache primeiro
      const cacheKey = this.generateSimilarityCacheKey(referenceCase, options);
      const cached = await this.getCachedSimilarities(cacheKey);
      
      if (cached) {
        await this.logClinicalActivity('similarity_cache_hit', {
          referenceCaseId: referenceCase.id,
          options,
          resultsCount: cached.length
        });
        return cached;
      }

      // Gerar vetor clínico para o caso de referência
      const referenceVector = await this.generateClinicalVector(referenceCase);

      // Buscar casos similares usando múltiplas estratégias
      const [
        symptomSimilarCases,
        diagnosisSimilarCases,
        treatmentSimilarCases,
        semanticSimilarCases
      ] = await Promise.all([
        this.findSymptomSimilarCases(referenceVector, options),
        this.findDiagnosisSimilarCases(referenceVector, options),
        this.findTreatmentSimilarCases(referenceVector, options),
        this.findSemanticSimilarCases(referenceVector, options)
      ]);

      // Combinar e ranquear resultados
      const allSimilarCases = [
        ...symptomSimilarCases,
        ...diagnosisSimilarCases,
        ...treatmentSimilarCases,
        ...semanticSimilarCases
      ];

      const uniqueCases = this.deduplicateSimilarCases(allSimilarCases);
      const scoredCases = await this.calculateSimilarityScores(referenceVector, uniqueCases);
      
      // Filtrar por threshold de similaridade
      const threshold = options.similarityThreshold || this.config.similarity.thresholds.overall;
      const qualifiedCases = scoredCases.filter(
        caseData => caseData.similarity.overall >= threshold
      );

      // Ordenar por similaridade geral
      qualifiedCases.sort((a, b) => b.similarity.overall - a.similarity.overall);

      // Aplicar limite de resultados
      const maxResults = options.maxResults || 10;
      const finalResults = qualifiedCases.slice(0, maxResults);

      // Anonimizar dados se solicitado
      if (options.anonymize) {
        for (const result of finalResults) {
          result.case = await this.anonymizeClinicalCase(result.case);
        }
      }

      // Salvar no cache
      await this.setCachedSimilarities(cacheKey, finalResults);

      const executionTime = Date.now() - startTime;

      await this.logClinicalActivity('similar_cases_found', {
        referenceCaseId: referenceCase.id,
        totalCandidates: allSimilarCases.length,
        qualifiedCases: qualifiedCases.length,
        finalResults: finalResults.length,
        executionTime,
        averageSimilarity: this.calculateAverageSimilarity(finalResults),
        sources: {
          symptoms: symptomSimilarCases.length,
          diagnosis: diagnosisSimilarCases.length,
          treatment: treatmentSimilarCases.length,
          semantic: semanticSimilarCases.length
        }
      });

      return finalResults;

    } catch (error) {
      const handledError = await this.errorHandler.handleClinicalError(error, {
        operation: 'find_similar_cases',
        referenceCaseId: referenceCase.id,
        options
      });
      
      throw handledError;
    }
  }

  /**
   * Análise detalhada de similaridade entre dois casos
   */
  async compareCases(
    case1: ClinicalCase,
    case2: ClinicalCase,
    includeInsights: boolean = true
  ): Promise<CaseComparison> {
    try {
      const startTime = Date.now();

      // Gerar vetores clínicos para ambos os casos
      const [vector1, vector2] = await Promise.all([
        this.generateClinicalVector(case1),
        this.generateClinicalVector(case2)
      ]);

      // Calcular similaridade detalhada
      const similarity = await this.calculateDetailedSimilarity(vector1, vector2);

      // Gerar insights se solicitado
      let insights: ClinicalInsight[] = [];
      let recommendations: any[] = [];
      let riskFactors: any[] = [];

      if (includeInsights) {
        insights = await this.generateClinicalInsights(vector1, vector2, similarity);
        recommendations = await this.generateRecommendations(case1, case2, similarity);
        riskFactors = await this.identifyRiskFactors(case1, case2, similarity);
      }

      const comparison: CaseComparison = {
        referenceCase: case1,
        similarCase: case2,
        similarity,
        insights,
        recommendations,
        riskFactors
      };

      const executionTime = Date.now() - startTime;

      await this.logClinicalActivity('cases_compared', {
        case1Id: case1.id,
        case2Id: case2.id,
        overallSimilarity: similarity.overall,
        insightsGenerated: insights.length,
        executionTime
      });

      return comparison;

    } catch (error) {
      const handledError = await this.errorHandler.handleClinicalError(error, {
        operation: 'compare_cases',
        case1Id: case1.id,
        case2Id: case2.id
      });
      
      throw handledError;
    }
  }

  /**
   * Descobrir padrões clínicos automaticamente
   */
  async discoverClinicalPatterns(
    cases: ClinicalCase[],
    patternType: 'diagnostic' | 'treatment' | 'outcome' | 'all' = 'all',
    minSupport: number = 0.1
  ): Promise<ClinicalPattern[]> {
    try {
      if (!this.config.patterns.enabled) {
        return [];
      }

      const startTime = Date.now();

      // Filtrar casos por critérios mínimos
      const qualifiedCases = cases.filter(c => 
        c.symptoms.length > 0 || c.diagnosis.length > 0
      );

      if (qualifiedCases.length < this.config.patterns.minCaseCount) {
        throw new Error(`Número insuficiente de casos para descoberta de padrões (mínimo: ${this.config.patterns.minCaseCount})`);
      }

      // Descobrir padrões baseados no tipo solicitado
      const patterns: ClinicalPattern[] = [];

      if (patternType === 'diagnostic' || patternType === 'all') {
        const diagnosticPatterns = await this.discoverDiagnosticPatterns(qualifiedCases, minSupport);
        patterns.push(...diagnosticPatterns);
      }

      if (patternType === 'treatment' || patternType === 'all') {
        const treatmentPatterns = await this.discoverTreatmentPatterns(qualifiedCases, minSupport);
        patterns.push(...treatmentPatterns);
      }

      if (patternType === 'outcome' || patternType === 'all') {
        const outcomePatterns = await this.discoverOutcomePatterns(qualifiedCases, minSupport);
        patterns.push(...outcomePatterns);
      }

      // Filtrar padrões por confiança
      const confidenceThreshold = this.config.patterns.confidenceThreshold;
      const qualifiedPatterns = patterns.filter(
        pattern => pattern.pattern.confidence >= confidenceThreshold
      );

      // Ordenar por efetividade
      qualifiedPatterns.sort((a, b) => b.pattern.effectiveness - a.pattern.effectiveness);

      // Salvar padrões descobertos
      for (const pattern of qualifiedPatterns) {
        await this.saveClinicalPattern(pattern);
        this.clinicalPatterns.set(pattern.id, pattern);
      }

      const executionTime = Date.now() - startTime;

      await this.logClinicalActivity('patterns_discovered', {
        casesAnalyzed: qualifiedCases.length,
        patternType,
        patternsFound: qualifiedPatterns.length,
        executionTime,
        averageConfidence: this.calculateAverageConfidence(qualifiedPatterns)
      });

      return qualifiedPatterns;

    } catch (error) {
      const handledError = await this.errorHandler.handleClinicalError(error, {
        operation: 'discover_patterns',
        casesCount: cases.length,
        patternType
      });
      
      throw handledError;
    }
  }

  /**
   * Buscar casos por padrão clínico específico
   */
  async findCasesByPattern(
    patternId: string,
    options: {
      maxResults?: number;
      includeVariations?: boolean;
      confidenceThreshold?: number;
    } = {}
  ): Promise<ClinicalCase[]> {
    try {
      const pattern = this.clinicalPatterns.get(patternId);
      if (!pattern) {
        throw new Error(`Padrão clínico não encontrado: ${patternId}`);
      }

      const startTime = Date.now();

      // Buscar casos que correspondem ao padrão
      const matchingCases = await this.searchCasesByPattern(pattern, options);

      // Incluir variações do padrão se solicitado
      if (options.includeVariations) {
        const variations = await this.findPatternVariations(pattern);
        for (const variation of variations) {
          const variationCases = await this.searchCasesByPattern(variation, options);
          matchingCases.push(...variationCases);
        }
      }

      // Remover duplicatas
      const uniqueCases = this.deduplicateCases(matchingCases);

      // Aplicar limite de resultados
      const maxResults = options.maxResults || 20;
      const finalResults = uniqueCases.slice(0, maxResults);

      const executionTime = Date.now() - startTime;

      await this.logClinicalActivity('cases_found_by_pattern', {
        patternId,
        patternType: pattern.type,
        casesFound: finalResults.length,
        executionTime
      });

      return finalResults;

    } catch (error) {
      const handledError = await this.errorHandler.handleClinicalError(error, {
        operation: 'find_cases_by_pattern',
        patternId
      });
      
      throw handledError;
    }
  }

  /**
   * Análise de efetividade de tratamentos
   */
  async analyzeTreatmentEffectiveness(
    treatmentType: string,
    condition: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<{
    treatment: string;
    condition: string;
    totalCases: number;
    successRate: number;
    averageRecoveryTime: number;
    sideEffects: Array<{ effect: string; frequency: number }>;
    comparisons: Array<{
      alternativeTreatment: string;
      effectiveness: number;
      comparison: 'better' | 'similar' | 'worse';
    }>;
    recommendations: string[];
  }> {
    try {
      const startTime = Date.now();

      // Buscar casos com o tratamento específico
      const treatmentCases = await this.getCasesByTreatment(treatmentType, condition, timeframe);

      if (treatmentCases.length === 0) {
        throw new Error(`Nenhum caso encontrado para tratamento: ${treatmentType}`);
      }

      // Calcular métricas de efetividade
      const successfulCases = treatmentCases.filter(c => 
        c.outcomes.some(o => o.result === 'success' || o.result === 'improved')
      );

      const successRate = successfulCases.length / treatmentCases.length;

      const recoveryTimes = treatmentCases
        .filter(c => c.outcomes.some(o => o.recoveryTime))
        .map(c => c.outcomes.find(o => o.recoveryTime)?.recoveryTime || 0);

      const averageRecoveryTime = recoveryTimes.length > 0 
        ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length
        : 0;

      // Analisar efeitos colaterais
      const sideEffects = await this.analyzeSideEffects(treatmentCases);

      // Comparar com tratamentos alternativos
      const comparisons = await this.compareAlternativeTreatments(
        treatmentType, 
        condition, 
        successRate,
        timeframe
      );

      // Gerar recomendações
      const recommendations = await this.generateTreatmentRecommendations(
        treatmentType,
        condition,
        successRate,
        sideEffects,
        comparisons
      );

      const analysis = {
        treatment: treatmentType,
        condition,
        totalCases: treatmentCases.length,
        successRate,
        averageRecoveryTime,
        sideEffects,
        comparisons,
        recommendations
      };

      const executionTime = Date.now() - startTime;

      await this.logClinicalActivity('treatment_effectiveness_analyzed', {
        treatment: treatmentType,
        condition,
        casesAnalyzed: treatmentCases.length,
        successRate,
        executionTime
      });

      return analysis;

    } catch (error) {
      const handledError = await this.errorHandler.handleClinicalError(error, {
        operation: 'analyze_treatment_effectiveness',
        treatment: treatmentType,
        condition
      });
      
      throw handledError;
    }
  }

  // Métodos privados auxiliares

  private getVectorConfig() {
    return {
      provider: 'supabase' as const,
      supabase: {
        embeddingTable: 'clinical_embeddings',
        vectorColumn: 'embedding',
        metadataColumn: 'metadata',
        similarityFunction: 'cosine' as const,
        threshold: 0.7
      },
      cache: {
        enabled: true,
        ttl: 3600,
        maxSize: 1000
      }
    };
  }

  private async loadClinicalPatterns(): Promise<void> {
    try {
      const { data: patterns, error } = await this.supabase
        .from('clinical_patterns')
        .select('*')
        .order('effectiveness', { ascending: false })
        .limit(500);

      if (error) throw error;

      for (const pattern of patterns) {
        this.clinicalPatterns.set(pattern.id, {
          id: pattern.id,
          name: pattern.name,
          description: pattern.description,
          type: pattern.type,
          pattern: pattern.pattern_data,
          cases: pattern.case_ids || [],
          insights: pattern.insights || [],
          lastUpdated: new Date(pattern.updated_at),
          metadata: pattern.metadata || {}
        });
      }

      console.log(`Carregados ${patterns.length} padrões clínicos`);
    } catch (error) {
      console.warn('Erro ao carregar padrões clínicos:', error);
    }
  }

  private async generateClinicalVector(clinicalCase: ClinicalCase): Promise<ClinicalVector> {
    try {
      // Extrair textos para embeddings
      const symptomsText = clinicalCase.symptoms.join('. ');
      const diagnosisText = clinicalCase.diagnosis.join('. ');
      const treatmentText = clinicalCase.treatments.map(t => t.description).join('. ');
      const combinedText = `${symptomsText} ${diagnosisText} ${treatmentText}`;

      // Gerar embeddings para cada componente
      const [symptomsEmbedding, diagnosisEmbedding, treatmentEmbedding, combinedEmbedding] = 
        await Promise.all([
          this.nlpService.generateEmbedding(symptomsText, { contextType: 'medical_symptoms' }),
          this.nlpService.generateEmbedding(diagnosisText, { contextType: 'medical_diagnosis' }),
          this.nlpService.generateEmbedding(treatmentText, { contextType: 'medical_treatment' }),
          this.nlpService.generateEmbedding(combinedText, { contextType: 'clinical_case' })
        ]);

      const vector: ClinicalVector = {
        caseId: clinicalCase.id,
        patientId: clinicalCase.patientId,
        symptoms: clinicalCase.symptoms,
        diagnosis: clinicalCase.diagnosis,
        treatments: clinicalCase.treatments.map(t => t.name),
        outcomes: clinicalCase.outcomes,
        demographics: clinicalCase.patientProfile,
        timeline: clinicalCase.timeline || [],
        embeddings: {
          symptoms: symptomsEmbedding,
          diagnosis: diagnosisEmbedding,
          treatment: treatmentEmbedding,
          combined: combinedEmbedding
        },
        metadata: {
          caseType: clinicalCase.type,
          severity: clinicalCase.severity,
          urgency: clinicalCase.urgency,
          specialties: clinicalCase.specialties
        }
      };

      // Cache do vetor
      this.caseVectors.set(clinicalCase.id, vector);

      return vector;

    } catch (error) {
      throw new Error(`Erro ao gerar vetor clínico: ${error}`);
    }
  }

  private async findSymptomSimilarCases(
    referenceVector: ClinicalVector,
    options: any
  ): Promise<CaseSimilarity[]> {
    try {
      const similarCases = await this.vectorDatabase.searchSimilar({
        text: referenceVector.symptoms.join('. '),
        type: 'semantic',
        documentTypes: ['clinical_case']
      }, {
        limit: options.maxResults || 20,
        threshold: this.config.similarity.thresholds.symptoms
      });

      return similarCases.map(result => ({
        case: this.convertToClinicalCase(result),
        similarity: {
          overall: result.score,
          symptoms: result.score,
          diagnosis: 0,
          treatment: 0,
          demographics: 0,
          outcomes: 0,
          confidence: result.score,
          breakdown: { symptoms: result.score }
        },
        insights: [],
        matchedFeatures: ['symptoms'],
        confidence: result.score
      }));
    } catch (error) {
      console.warn('Erro em busca por sintomas similares:', error);
      return [];
    }
  }

  private async findDiagnosisSimilarCases(
    referenceVector: ClinicalVector,
    options: any
  ): Promise<CaseSimilarity[]> {
    try {
      // Implementar busca por diagnósticos similares
      const { data: similarCases, error } = await this.supabase
        .rpc('find_diagnosis_similar_cases', {
          reference_diagnosis: referenceVector.diagnosis,
          similarity_threshold: this.config.similarity.thresholds.diagnosis,
          max_results: options.maxResults || 20
        });

      if (error) throw error;

      return similarCases.map((caseData: any) => ({
        case: this.convertToClinicalCase(caseData),
        similarity: {
          overall: caseData.similarity_score,
          symptoms: 0,
          diagnosis: caseData.similarity_score,
          treatment: 0,
          demographics: 0,
          outcomes: 0,
          confidence: caseData.similarity_score,
          breakdown: { diagnosis: caseData.similarity_score }
        },
        insights: [],
        matchedFeatures: ['diagnosis'],
        confidence: caseData.similarity_score
      }));
    } catch (error) {
      console.warn('Erro em busca por diagnóstico similar:', error);
      return [];
    }
  }

  private async findTreatmentSimilarCases(
    referenceVector: ClinicalVector,
    options: any
  ): Promise<CaseSimilarity[]> {
    try {
      // Implementar busca por tratamentos similares
      const { data: similarCases, error } = await this.supabase
        .rpc('find_treatment_similar_cases', {
          reference_treatments: referenceVector.treatments,
          similarity_threshold: this.config.similarity.thresholds.treatment,
          max_results: options.maxResults || 20
        });

      if (error) throw error;

      return similarCases.map((caseData: any) => ({
        case: this.convertToClinicalCase(caseData),
        similarity: {
          overall: caseData.similarity_score,
          symptoms: 0,
          diagnosis: 0,
          treatment: caseData.similarity_score,
          demographics: 0,
          outcomes: 0,
          confidence: caseData.similarity_score,
          breakdown: { treatment: caseData.similarity_score }
        },
        insights: [],
        matchedFeatures: ['treatment'],
        confidence: caseData.similarity_score
      }));
    } catch (error) {
      console.warn('Erro em busca por tratamento similar:', error);
      return [];
    }
  }

  private async findSemanticSimilarCases(
    referenceVector: ClinicalVector,
    options: any
  ): Promise<CaseSimilarity[]> {
    try {
      const semanticCases = await this.vectorDatabase.searchSimilar({
        text: `${referenceVector.symptoms.join('. ')} ${referenceVector.diagnosis.join('. ')}`,
        type: 'semantic',
        documentTypes: ['clinical_case']
      }, {
        limit: options.maxResults || 20,
        threshold: 0.6
      });

      return semanticCases.map(result => ({
        case: this.convertToClinicalCase(result),
        similarity: {
          overall: result.score,
          symptoms: result.score * 0.4,
          diagnosis: result.score * 0.4,
          treatment: result.score * 0.2,
          demographics: 0,
          outcomes: 0,
          confidence: result.score,
          breakdown: { 
            symptoms: result.score * 0.4,
            diagnosis: result.score * 0.4,
            treatment: result.score * 0.2
          }
        },
        insights: [],
        matchedFeatures: ['semantic'],
        confidence: result.score
      }));
    } catch (error) {
      console.warn('Erro em busca semântica:', error);
      return [];
    }
  }

  private deduplicateSimilarCases(cases: CaseSimilarity[]): CaseSimilarity[] {
    const seen = new Set<string>();
    return cases.filter(caseData => {
      if (seen.has(caseData.case.id)) {
        return false;
      }
      seen.add(caseData.case.id);
      return true;
    });
  }

  private async calculateSimilarityScores(
    referenceVector: ClinicalVector,
    cases: CaseSimilarity[]
  ): Promise<CaseSimilarity[]> {
    const scoredCases: CaseSimilarity[] = [];

    for (const caseData of cases) {
      try {
        // Gerar vetor para o caso comparado se não existe
        let compareVector = this.caseVectors.get(caseData.case.id);
        if (!compareVector) {
          compareVector = await this.generateClinicalVector(caseData.case);
        }

        // Calcular similaridade detalhada
        const detailedSimilarity = await this.calculateDetailedSimilarity(
          referenceVector,
          compareVector
        );

        scoredCases.push({
          ...caseData,
          similarity: detailedSimilarity
        });
      } catch (error) {
        console.warn(`Erro ao calcular similaridade para caso ${caseData.case.id}:`, error);
        // Manter o caso com a similaridade original
        scoredCases.push(caseData);
      }
    }

    return scoredCases;
  }

  private async calculateDetailedSimilarity(
    vector1: ClinicalVector,
    vector2: ClinicalVector
  ): Promise<SimilarityScore> {
    try {
      // Calcular similaridade de sintomas
      const symptomsSimilarity = this.calculateCosineSimilarity(
        vector1.embeddings.symptoms,
        vector2.embeddings.symptoms
      );

      // Calcular similaridade de diagnóstico
      const diagnosisSimilarity = this.calculateCosineSimilarity(
        vector1.embeddings.diagnosis,
        vector2.embeddings.diagnosis
      );

      // Calcular similaridade de tratamento
      const treatmentSimilarity = this.calculateCosineSimilarity(
        vector1.embeddings.treatment,
        vector2.embeddings.treatment
      );

      // Calcular similaridade demográfica
      const demographicsSimilarity = this.calculateDemographicSimilarity(
        vector1.demographics,
        vector2.demographics
      );

      // Calcular similaridade de resultados
      const outcomesSimilarity = this.calculateOutcomeSimilarity(
        vector1.outcomes,
        vector2.outcomes
      );

      // Calcular similaridade geral ponderada
      const weights = this.config.similarity.weights;
      const overallSimilarity = (
        symptomsSimilarity * weights.symptoms +
        diagnosisSimilarity * weights.diagnosis +
        treatmentSimilarity * weights.treatment +
        demographicsSimilarity * weights.demographics +
        outcomesSimilarity * weights.outcomes
      ) / (weights.symptoms + weights.diagnosis + weights.treatment + weights.demographics + weights.outcomes);

      // Calcular confiança baseada na consistência entre métricas
      const similarities = [symptomsSimilarity, diagnosisSimilarity, treatmentSimilarity];
      const avgSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
      const variance = similarities.reduce((sum, sim) => sum + Math.pow(sim - avgSimilarity, 2), 0) / similarities.length;
      const confidence = Math.max(0, 1 - variance);

      return {
        overall: overallSimilarity,
        symptoms: symptomsSimilarity,
        diagnosis: diagnosisSimilarity,
        treatment: treatmentSimilarity,
        demographics: demographicsSimilarity,
        outcomes: outcomesSimilarity,
        confidence,
        breakdown: {
          symptoms: symptomsSimilarity,
          diagnosis: diagnosisSimilarity,
          treatment: treatmentSimilarity,
          demographics: demographicsSimilarity,
          outcomes: outcomesSimilarity
        }
      };

    } catch (error) {
      throw new Error(`Erro ao calcular similaridade detalhada: ${error}`);
    }
  }

  private calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vetores devem ter o mesmo tamanho');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  private calculateDemographicSimilarity(profile1: PatientProfile, profile2: PatientProfile): number {
    let similarity = 0;
    let factors = 0;

    // Idade
    if (profile1.age && profile2.age) {
      const ageDiff = Math.abs(profile1.age - profile2.age);
      similarity += Math.max(0, 1 - ageDiff / 50); // Normalizado para 50 anos
      factors++;
    }

    // Gênero
    if (profile1.gender && profile2.gender) {
      similarity += profile1.gender === profile2.gender ? 1 : 0;
      factors++;
    }

    // Outras características demográficas podem ser adicionadas aqui

    return factors > 0 ? similarity / factors : 0;
  }

  private calculateOutcomeSimilarity(outcomes1: TreatmentOutcome[], outcomes2: TreatmentOutcome[]): number {
    if (outcomes1.length === 0 && outcomes2.length === 0) {
      return 1; // Ambos sem outcomes = similaridade máxima
    }

    if (outcomes1.length === 0 || outcomes2.length === 0) {
      return 0; // Um tem outcomes, outro não = sem similaridade
    }

    // Comparar resultados principais
    const results1 = outcomes1.map(o => o.result);
    const results2 = outcomes2.map(o => o.result);

    const commonResults = results1.filter(r => results2.includes(r));
    const totalUniqueResults = new Set([...results1, ...results2]).size;

    return commonResults.length / totalUniqueResults;
  }

  private async generateClinicalInsights(
    vector1: ClinicalVector,
    vector2: ClinicalVector,
    similarity: SimilarityScore
  ): Promise<ClinicalInsight[]> {
    const insights: ClinicalInsight[] = [];

    // Insight sobre sintomas
    if (similarity.symptoms > 0.8) {
      insights.push({
        type: 'symptom_similarity',
        title: 'Alta similaridade de sintomas',
        description: 'Os casos apresentam sintomas muito similares, sugerindo possível diagnóstico relacionado.',
        confidence: similarity.symptoms,
        evidence: [`Similaridade de sintomas: ${(similarity.symptoms * 100).toFixed(1)}%`],
        recommendations: ['Considere protocolo diagnóstico similar', 'Avalie tratamentos aplicados no caso similar']
      });
    }

    // Insight sobre diagnóstico
    if (similarity.diagnosis > 0.9) {
      insights.push({
        type: 'diagnosis_match',
        title: 'Diagnósticos compatíveis',
        description: 'Os casos têm diagnósticos muito similares ou idênticos.',
        confidence: similarity.diagnosis,
        evidence: [`Similaridade de diagnóstico: ${(similarity.diagnosis * 100).toFixed(1)}%`],
        recommendations: ['Aplicar protocolos de tratamento estabelecidos', 'Monitorar evolução similar']
      });
    }

    // Insight sobre tratamento
    if (similarity.treatment > 0.7) {
      insights.push({
        type: 'treatment_similarity',
        title: 'Tratamentos similares aplicados',
        description: 'Os casos utilizaram abordagens terapêuticas similares.',
        confidence: similarity.treatment,
        evidence: [`Similaridade de tratamento: ${(similarity.treatment * 100).toFixed(1)}%`],
        recommendations: ['Avaliar efetividade dos tratamentos aplicados', 'Considerar ajustes baseados nos resultados']
      });
    }

    return insights;
  }

  private async generateRecommendations(
    case1: ClinicalCase,
    case2: ClinicalCase,
    similarity: SimilarityScore
  ): Promise<any[]> {
    const recommendations: any[] = [];

    // Recomendações baseadas em alta similaridade
    if (similarity.overall > 0.8) {
      recommendations.push({
        type: 'diagnostic',
        description: 'Considere aplicar o mesmo protocolo diagnóstico utilizado no caso similar',
        confidence: similarity.overall,
        evidence: [`Similaridade geral: ${(similarity.overall * 100).toFixed(1)}%`]
      });

      if (case2.outcomes.some(o => o.result === 'success')) {
        recommendations.push({
          type: 'treatment',
          description: 'O caso similar teve resultados positivos - considere tratamento similar',
          confidence: 0.9,
          evidence: ['Caso similar teve evolução favorável']
        });
      }
    }

    return recommendations;
  }

  private async identifyRiskFactors(
    case1: ClinicalCase,
    case2: ClinicalCase,
    similarity: SimilarityScore
  ): Promise<any[]> {
    const riskFactors: any[] = [];

    // Identificar fatores de risco baseados no caso similar
    if (case2.outcomes.some(o => o.result === 'complications')) {
      riskFactors.push({
        factor: 'Complicações similares observadas',
        severity: 'medium' as const,
        description: 'O caso similar apresentou complicações - monitorar atentamente'
      });
    }

    return riskFactors;
  }

  private convertToClinicalCase(result: any): ClinicalCase {
    // Converter resultado da busca em ClinicalCase
    return {
      id: result.documentId || result.id,
      patientId: result.metadata?.patientId || '',
      symptoms: result.metadata?.symptoms || [],
      diagnosis: result.metadata?.diagnosis || [],
      treatments: result.metadata?.treatments || [],
      outcomes: result.metadata?.outcomes || [],
      patientProfile: result.metadata?.patientProfile || {},
      type: result.metadata?.caseType || 'general',
      severity: result.metadata?.severity || 'moderate',
      urgency: result.metadata?.urgency || 'routine',
      specialties: result.metadata?.specialties || [],
      timeline: result.metadata?.timeline || [],
      createdAt: new Date(result.metadata?.createdAt || Date.now()),
      updatedAt: new Date(result.metadata?.updatedAt || Date.now())
    };
  }

  private calculateAverageSimilarity(cases: CaseSimilarity[]): number {
    if (cases.length === 0) return 0;
    return cases.reduce((sum, c) => sum + c.similarity.overall, 0) / cases.length;
  }

  private async anonymizeClinicalCase(clinicalCase: ClinicalCase): Promise<ClinicalCase> {
    if (!this.config.privacy.dataAnonymization) {
      return clinicalCase;
    }

    // Implementar anonimização de dados sensíveis
    return {
      ...clinicalCase,
      patientId: `anonymous_${clinicalCase.id.substring(0, 8)}`,
      patientProfile: {
        ...clinicalCase.patientProfile,
        name: undefined,
        email: undefined,
        phone: undefined,
        address: undefined
      }
    };
  }

  // Implementações simplificadas de métodos auxiliares
  private async discoverDiagnosticPatterns(cases: ClinicalCase[], minSupport: number): Promise<ClinicalPattern[]> {
    // Implementar descoberta de padrões diagnósticos
    return [];
  }

  private async discoverTreatmentPatterns(cases: ClinicalCase[], minSupport: number): Promise<ClinicalPattern[]> {
    // Implementar descoberta de padrões de tratamento
    return [];
  }

  private async discoverOutcomePatterns(cases: ClinicalCase[], minSupport: number): Promise<ClinicalPattern[]> {
    // Implementar descoberta de padrões de resultado
    return [];
  }

  private calculateAverageConfidence(patterns: ClinicalPattern[]): number {
    if (patterns.length === 0) return 0;
    return patterns.reduce((sum, p) => sum + p.pattern.confidence, 0) / patterns.length;
  }

  private async saveClinicalPattern(pattern: ClinicalPattern): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('clinical_patterns')
        .upsert({
          id: pattern.id,
          name: pattern.name,
          description: pattern.description,
          type: pattern.type,
          pattern_data: pattern.pattern,
          case_ids: pattern.cases,
          insights: pattern.insights,
          metadata: pattern.metadata,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.warn('Erro ao salvar padrão clínico:', error);
    }
  }

  private async searchCasesByPattern(pattern: ClinicalPattern, options: any): Promise<ClinicalCase[]> {
    // Implementar busca de casos por padrão
    return [];
  }

  private async findPatternVariations(pattern: ClinicalPattern): Promise<ClinicalPattern[]> {
    // Implementar busca de variações do padrão
    return [];
  }

  private deduplicateCases(cases: ClinicalCase[]): ClinicalCase[] {
    const seen = new Set<string>();
    return cases.filter(c => {
      if (seen.has(c.id)) {
        return false;
      }
      seen.add(c.id);
      return true;
    });
  }

  private async getCasesByTreatment(
    treatmentType: string,
    condition: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<ClinicalCase[]> {
    try {
      let query = this.supabase
        .from('clinical_cases')
        .select('*')
        .contains('treatments', [{ name: treatmentType }])
        .contains('diagnosis', [condition]);

      if (timeframe) {
        query = query
          .gte('created_at', timeframe.start.toISOString())
          .lte('created_at', timeframe.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(this.convertToClinicalCase);
    } catch (error) {
      console.warn('Erro ao buscar casos por tratamento:', error);
      return [];
    }
  }

  private async analyzeSideEffects(cases: ClinicalCase[]): Promise<Array<{ effect: string; frequency: number }>> {
    // Implementar análise de efeitos colaterais
    return [];
  }

  private async compareAlternativeTreatments(
    treatmentType: string,
    condition: string,
    successRate: number,
    timeframe?: { start: Date; end: Date }
  ): Promise<Array<{
    alternativeTreatment: string;
    effectiveness: number;
    comparison: 'better' | 'similar' | 'worse';
  }>> {
    // Implementar comparação com tratamentos alternativos
    return [];
  }

  private async generateTreatmentRecommendations(
    treatmentType: string,
    condition: string,
    successRate: number,
    sideEffects: any[],
    comparisons: any[]
  ): Promise<string[]> {
    // Implementar geração de recomendações de tratamento
    return [];
  }

  private generateSimilarityCacheKey(referenceCase: ClinicalCase, options: any): string {
    const keyData = {
      caseId: referenceCase.id,
      symptoms: referenceCase.symptoms.slice(0, 3), // Primeiros 3 sintomas
      maxResults: options.maxResults || 10,
      threshold: options.similarityThreshold || 0.7
    };
    
    return `similarity:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  private async getCachedSimilarities(key: string): Promise<CaseSimilarity[] | null> {
    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
      }
      return null;
    } catch (error) {
      console.warn('Erro ao acessar cache de similaridades:', error);
      return null;
    }
  }

  private async setCachedSimilarities(key: string, similarities: CaseSimilarity[]): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, this.config.cache.ttl, JSON.stringify(similarities));
      }
    } catch (error) {
      console.warn('Erro ao salvar cache de similaridades:', error);
    }
  }

  private async logClinicalActivity(activity: string, data: any): Promise<void> {
    try {
      await this.auditLogger.logSearchActivity(`clinical_${activity}`, data);
    } catch (error) {
      console.warn('Erro ao registrar atividade clínica:', error);
    }
  }
}

/**
 * Factory para criar instância configurada do ClinicalSimilarityEngine
 */
export function createClinicalSimilarityEngine(): ClinicalSimilarityEngine {
  const config: ClinicalSimilarityConfig = {
    similarity: {
      enabled: process.env.ENABLE_CLINICAL_SIMILARITY === 'true',
      thresholds: {
        symptoms: parseFloat(process.env.SYMPTOMS_SIMILARITY_THRESHOLD || '0.7'),
        diagnosis: parseFloat(process.env.DIAGNOSIS_SIMILARITY_THRESHOLD || '0.8'),
        treatment: parseFloat(process.env.TREATMENT_SIMILARITY_THRESHOLD || '0.6'),
        demographics: parseFloat(process.env.DEMOGRAPHICS_SIMILARITY_THRESHOLD || '0.5'),
        overall: parseFloat(process.env.OVERALL_SIMILARITY_THRESHOLD || '0.7')
      },
      weights: {
        symptoms: parseFloat(process.env.SYMPTOMS_WEIGHT || '0.3'),
        diagnosis: parseFloat(process.env.DIAGNOSIS_WEIGHT || '0.3'),
        treatment: parseFloat(process.env.TREATMENT_WEIGHT || '0.2'),
        demographics: parseFloat(process.env.DEMOGRAPHICS_WEIGHT || '0.1'),
        outcomes: parseFloat(process.env.OUTCOMES_WEIGHT || '0.1')
      }
    },
    analysis: {
      enabled: process.env.ENABLE_CLINICAL_ANALYSIS === 'true',
      deepAnalysis: process.env.ENABLE_DEEP_ANALYSIS === 'true',
      semanticSimilarity: process.env.ENABLE_SEMANTIC_SIMILARITY === 'true',
      temporalPatterns: process.env.ENABLE_TEMPORAL_PATTERNS === 'true',
      outcomeCorrelation: process.env.ENABLE_OUTCOME_CORRELATION === 'true'
    },
    patterns: {
      enabled: process.env.ENABLE_PATTERN_DISCOVERY === 'true',
      minCaseCount: parseInt(process.env.MIN_CASE_COUNT || '10'),
      confidenceThreshold: parseFloat(process.env.PATTERN_CONFIDENCE_THRESHOLD || '0.7'),
      patternTypes: process.env.PATTERN_TYPES?.split(',') || ['diagnostic', 'treatment', 'outcome'],
      learningEnabled: process.env.ENABLE_PATTERN_LEARNING === 'true'
    },
    privacy: {
      dataAnonymization: process.env.ENABLE_DATA_ANONYMIZATION === 'true',
      consentRequired: process.env.REQUIRE_CONSENT === 'true',
      auditAll: process.env.AUDIT_ALL_CLINICAL_OPERATIONS === 'true',
      retentionDays: parseInt(process.env.CLINICAL_DATA_RETENTION_DAYS || '365')
    },
    cache: {
      enabled: process.env.ENABLE_CLINICAL_CACHE === 'true',
      ttl: parseInt(process.env.CLINICAL_CACHE_TTL || '1800'), // 30 minutos
      maxSize: parseInt(process.env.CLINICAL_CACHE_MAX_SIZE || '1000'),
      warmupPatterns: process.env.WARMUP_CLINICAL_PATTERNS === 'true'
    }
  };

  return new ClinicalSimilarityEngine(config);
}

/**
 * Instância global do ClinicalSimilarityEngine (singleton)
 */
export const clinicalSimilarityEngine = createClinicalSimilarityEngine();

/**
 * Hook para acessar ClinicalSimilarityEngine em componentes React
 */
export function useClinicalSimilarityEngine() {
  return clinicalSimilarityEngine;
}