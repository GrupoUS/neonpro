// 🔍 Query Parser & Intent Recognition - Smart Search + NLP Integration
// NeonPro - Parser de Queries e Reconhecimento de Intenção
// Quality Standard: ≥9.5/10 (BMad Enhanced)

import { 
  SearchIntent, 
  SearchContext, 
  EntityType, 
  NaturalLanguageQuery, 
  SearchFilter,
  SearchMode,
  SearchDataCategory,
  NLPProcessingError 
} from '@/lib/types/search-types';

export interface QueryParseResult {
  originalQuery: string;
  normalizedQuery: string;
  tokens: string[];
  queryType: 'natural_language' | 'structured' | 'mixed';
  complexityScore: number;
  language: 'pt' | 'en';
  suggestedMode: SearchMode;
  suggestedContext: SearchContext;
  parseTime: number;
  errors: string[];
  warnings: string[];
}

export interface IntentRecognitionResult {
  primaryIntent: SearchIntent;
  secondaryIntents: Array<{
    intent: SearchIntent;
    confidence: number;
  }>;
  confidence: number;
  reasoning: string[];
  contextualFactors: string[];
  medicalDomain: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface EntityExtractionResult {
  entities: Array<{
    type: EntityType;
    value: string;
    normalizedValue: string;
    confidence: number;
    position: { start: number; end: number };
    attributes: Record<string, any>;
    relationships: Array<{
      targetEntity: string;
      relationship: string;
      confidence: number;
    }>;
  }>;
  namedEntities: Array<{
    type: 'person' | 'organization' | 'location' | 'date' | 'time' | 'money' | 'percentage';
    value: string;
    confidence: number;
    position: { start: number; end: number };
  }>;
  extractionTime: number;
  totalEntities: number;
}

export class QueryParser {
  private stopWords: Set<string>;
  private medicalTerms: Set<string>;
  private synonyms: Map<string, string[]>;
  private abbreviations: Map<string, string>;
  private intentClassifier: IntentClassifier;
  private entityExtractor: EntityExtractor;

  constructor() {
    this.initializeStopWords();
    this.initializeMedicalTerms();
    this.initializeSynonyms();
    this.initializeAbbreviations();
    this.intentClassifier = new IntentClassifier();
    this.entityExtractor = new EntityExtractor();
  }

  /**
   * Parse query and extract all relevant information
   */
  public async parseQuery(
    query: string, 
    userId: string, 
    sessionContext?: any
  ): Promise<{
    parseResult: QueryParseResult;
    intentResult: IntentRecognitionResult;
    entityResult: EntityExtractionResult;
  }> {
    const startTime = Date.now();

    try {
      // Step 1: Parse and normalize query
      const parseResult = await this.parseQueryStructure(query);
      
      // Step 2: Recognize intent
      const intentResult = await this.intentClassifier.recognizeIntent(
        parseResult, 
        userId, 
        sessionContext
      );
      
      // Step 3: Extract entities
      const entityResult = await this.entityExtractor.extractEntities(
        parseResult, 
        intentResult
      );

      return {
        parseResult,
        intentResult,
        entityResult
      };

    } catch (error) {
      throw new NLPProcessingError(
        `Query parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { query, userId, parseTime: Date.now() - startTime }
      );
    }
  }

  /**
   * Parse query structure and extract basic information
   */
  private async parseQueryStructure(query: string): Promise<QueryParseResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate input
    if (!query || query.trim().length === 0) {
      errors.push('Query cannot be empty');
    }

    if (query.length > 500) {
      warnings.push('Query is very long, consider simplifying');
    }

    // Normalize query
    const normalizedQuery = this.normalizeQuery(query);
    
    // Tokenize
    const tokens = this.tokenize(normalizedQuery);
    
    // Detect language
    const language = this.detectLanguage(tokens);
    
    // Classify query type
    const queryType = this.classifyQueryType(tokens, normalizedQuery);
    
    // Calculate complexity
    const complexityScore = this.calculateComplexity(tokens, normalizedQuery);
    
    // Suggest search mode and context
    const suggestedMode = this.suggestSearchMode(queryType, complexityScore, tokens);
    const suggestedContext = this.suggestSearchContext(tokens, language);

    return {
      originalQuery: query,
      normalizedQuery,
      tokens,
      queryType,
      complexityScore,
      language,
      suggestedMode,
      suggestedContext,
      parseTime: Date.now() - startTime,
      errors,
      warnings
    };
  }

  /**
   * Normalize query text
   */
  private normalizeQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      // Replace common variations
      .replace(/[àáâãä]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/ñ/g, 'n')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Handle common abbreviations
      .replace(/\bdr\.?/gi, 'doutor')
      .replace(/\bdra\.?/gi, 'doutora')
      .replace(/\bprof\.?/gi, 'professor')
      .replace(/\bpte\.?/gi, 'paciente')
      .replace(/\bagt\.?/gi, 'agendamento')
      .trim();
  }

  /**
   * Tokenize query into meaningful units
   */
  private tokenize(query: string): string[] {
    // Split by whitespace and punctuation, but preserve meaningful units
    const tokens = query
      .split(/[\s\.,;:!?\-()[\]{}]+/)
      .filter(token => token.length > 0)
      .filter(token => !this.stopWords.has(token));

    // Add n-grams for better context understanding
    const nGrams = this.generateNGrams(query.split(/\s+/), 2, 3);
    
    return [...new Set([...tokens, ...nGrams])];
  }

  /**
   * Generate n-grams from tokens
   */
  private generateNGrams(tokens: string[], minN: number, maxN: number): string[] {
    const nGrams: string[] = [];
    
    for (let n = minN; n <= maxN; n++) {
      for (let i = 0; i <= tokens.length - n; i++) {
        const nGram = tokens.slice(i, i + n).join(' ').toLowerCase();
        if (nGram.length > 3 && !this.stopWords.has(nGram)) {
          nGrams.push(nGram);
        }
      }
    }
    
    return nGrams;
  }

  /**
   * Detect query language
   */
  private detectLanguage(tokens: string[]): 'pt' | 'en' {
    const portugueseIndicators = [
      'paciente', 'agendamento', 'consulta', 'prontuário', 'tratamento',
      'procedimento', 'quando', 'onde', 'como', 'porque', 'que', 'quem',
      'qual', 'quanto', 'buscar', 'encontrar', 'ver', 'mostrar'
    ];
    
    const englishIndicators = [
      'patient', 'appointment', 'consultation', 'record', 'treatment',
      'procedure', 'when', 'where', 'how', 'why', 'what', 'who',
      'which', 'how much', 'search', 'find', 'show', 'display'
    ];
    
    const portugueseScore = tokens.filter(token => 
      portugueseIndicators.some(indicator => token.includes(indicator))
    ).length;
    
    const englishScore = tokens.filter(token => 
      englishIndicators.some(indicator => token.includes(indicator))
    ).length;
    
    return portugueseScore >= englishScore ? 'pt' : 'en';
  }

  /**
   * Classify query type
   */
  private classifyQueryType(
    tokens: string[], 
    query: string
  ): 'natural_language' | 'structured' | 'mixed' {
    // Check for structured query patterns
    const structuredPatterns = [
      /\w+:\w+/,                    // field:value
      /\w+\s*=\s*\w+/,             // field = value
      /\w+\s*(>|<|>=|<=)\s*\d+/,   // field > 10
      /"[^"]+"/,                    // quoted strings
      /\[.*\]/,                     // array notation
      /AND|OR|NOT/i                 // boolean operators
    ];
    
    const hasStructured = structuredPatterns.some(pattern => pattern.test(query));
    
    // Check for natural language patterns
    const naturalPatterns = [
      /\b(que|what|como|how|quando|when|onde|where|porque|why|quem|who)\b/i,
      /\b(buscar|search|encontrar|find|mostrar|show|listar|list)\b/i,
      /\b(preciso|need|quero|want|gostaria|would like)\b/i
    ];
    
    const hasNatural = naturalPatterns.some(pattern => pattern.test(query));
    
    if (hasStructured && hasNatural) return 'mixed';
    if (hasStructured) return 'structured';
    return 'natural_language';
  }

  /**
   * Calculate query complexity score
   */
  private calculateComplexity(tokens: string[], query: string): number {
    let complexity = 1; // Base complexity
    
    // Token count factor
    complexity += Math.min(tokens.length * 0.1, 2);
    
    // Query length factor
    complexity += Math.min(query.length * 0.01, 1.5);
    
    // Medical terms factor
    const medicalTermsCount = tokens.filter(token => 
      this.medicalTerms.has(token)
    ).length;
    complexity += medicalTermsCount * 0.3;
    
    // Temporal expressions factor
    const temporalPatterns = [
      /\d{1,2}\/\d{1,2}\/\d{2,4}/,  // dates
      /\d{1,2}:\d{2}/,              // times
      /(hoje|ontem|amanhã|today|yesterday|tomorrow)/i,
      /(semana|week|mês|month|ano|year)/i
    ];
    const hasTemporalExpressions = temporalPatterns.some(pattern => pattern.test(query));
    if (hasTemporalExpressions) complexity += 0.5;
    
    // Relationship queries factor
    const relationshipWords = ['com', 'para', 'de', 'em', 'entre', 'with', 'for', 'of', 'in', 'between'];
    const relationshipCount = tokens.filter(token => relationshipWords.includes(token)).length;
    complexity += relationshipCount * 0.2;
    
    // Boolean operators factor
    const booleanOperators = ['e', 'ou', 'não', 'and', 'or', 'not'];
    const booleanCount = tokens.filter(token => booleanOperators.includes(token)).length;
    complexity += booleanCount * 0.4;
    
    return Math.min(complexity, 10); // Cap at 10
  }

  /**
   * Suggest appropriate search mode
   */
  private suggestSearchMode(
    queryType: 'natural_language' | 'structured' | 'mixed',
    complexity: number,
    tokens: string[]
  ): SearchMode {
    if (queryType === 'structured') {
      return 'structured';
    }
    
    if (complexity > 6) {
      return 'semantic';
    }
    
    if (complexity > 3) {
      return 'natural_language';
    }
    
    // Check for similarity queries
    const similarityWords = ['similar', 'parecido', 'semelhante', 'como', 'like'];
    const hasSimilarity = tokens.some(token => 
      similarityWords.some(word => token.includes(word))
    );
    
    if (hasSimilarity) {
      return 'similarity';
    }
    
    return 'natural_language';
  }

  /**
   * Suggest search context
   */
  private suggestSearchContext(tokens: string[], language: 'pt' | 'en'): SearchContext {
    const contextKeywords = {
      clinical: ['paciente', 'consulta', 'exame', 'diagnóstico', 'tratamento', 'procedimento', 'patient', 'consultation', 'exam', 'diagnosis', 'treatment', 'procedure'],
      administrative: ['agendamento', 'agenda', 'horário', 'marcação', 'appointment', 'schedule', 'booking'],
      financial: ['pagamento', 'fatura', 'cobrança', 'débito', 'crédito', 'payment', 'invoice', 'billing', 'debt', 'credit'],
      compliance: ['lgpd', 'gdpr', 'auditoria', 'conformidade', 'consentimento', 'audit', 'compliance', 'consent'],
      analytics: ['relatório', 'estatística', 'métricas', 'dashboard', 'análise', 'report', 'statistics', 'metrics', 'analytics']
    };
    
    for (const [context, keywords] of Object.entries(contextKeywords)) {
      const hasKeywords = tokens.some(token => 
        keywords.some(keyword => token.includes(keyword))
      );
      if (hasKeywords) {
        return context as SearchContext;
      }
    }
    
    return 'general';
  }

  /**
   * Initialize stop words for Portuguese and English
   */
  private initializeStopWords(): void {
    const portugueseStopWords = [
      'a', 'o', 'e', 'é', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'se', 'na', 'no',
      'ao', 'à', 'por', 'mais', 'que', 'mas', 'eu', 'ele', 'ela', 'nós', 'eles', 'elas',
      'este', 'esta', 'esse', 'essa', 'aquele', 'aquela', 'isto', 'isso', 'aquilo'
    ];
    
    const englishStopWords = [
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in',
      'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with'
    ];
    
    this.stopWords = new Set([...portugueseStopWords, ...englishStopWords]);
  }

  /**
   * Initialize medical terms
   */
  private initializeMedicalTerms(): void {
    const medicalTerms = [
      'botox', 'preenchimento', 'laser', 'peeling', 'microagulhamento',
      'harmonização', 'rinomodelação', 'bichectomia', 'criolipólise',
      'radiofrequência', 'ultrassom', 'mesoterapia', 'carboxiterapia',
      'acne', 'melasma', 'manchas', 'rugas', 'flacidez', 'celulite',
      'anamnese', 'prontuário', 'evolução', 'prescrição', 'diagnóstico'
    ];
    
    this.medicalTerms = new Set(medicalTerms);
  }

  /**
   * Initialize synonyms
   */
  private initializeSynonyms(): void {
    this.synonyms = new Map([
      ['paciente', ['cliente', 'pessoa', 'indivíduo']],
      ['consulta', ['agendamento', 'appointment', 'sessão']],
      ['procedimento', ['tratamento', 'therapy', 'terapia']],
      ['buscar', ['encontrar', 'procurar', 'localizar', 'search', 'find']],
      ['ver', ['mostrar', 'exibir', 'visualizar', 'display', 'show']],
      ['pagamento', ['cobrança', 'fatura', 'billing', 'payment']]
    ]);
  }

  /**
   * Initialize abbreviations
   */
  private initializeAbbreviations(): void {
    this.abbreviations = new Map([
      ['dr', 'doutor'],
      ['dra', 'doutora'],
      ['prof', 'professor'],
      ['pte', 'paciente'],
      ['agt', 'agendamento'],
      ['proc', 'procedimento'],
      ['cons', 'consulta'],
      ['pront', 'prontuário']
    ]);
  }
}

/**
 * Intent Classifier - Specialized for healthcare queries
 */
export class IntentClassifier {
  private intentPatterns: Map<SearchIntent, Array<{
    pattern: RegExp;
    weight: number;
    context: string[];
  }>>;

  constructor() {
    this.initializeIntentPatterns();
  }

  /**
   * Recognize intent from parsed query
   */
  public async recognizeIntent(
    parseResult: QueryParseResult,
    userId: string,
    sessionContext?: any
  ): Promise<IntentRecognitionResult> {
    const { tokens, normalizedQuery, language } = parseResult;
    const reasoning: string[] = [];
    const contextualFactors: string[] = [];
    
    // Calculate intent scores
    const intentScores = new Map<SearchIntent, number>();
    
    for (const [intent, patterns] of this.intentPatterns) {
      let score = 0;
      
      for (const { pattern, weight, context } of patterns) {
        if (pattern.test(normalizedQuery)) {
          score += weight;
          reasoning.push(`Matched pattern for ${intent}: ${pattern.source}`);
          
          // Context bonus
          const hasContext = context.some(ctx => 
            tokens.some(token => token.includes(ctx))
          );
          if (hasContext) {
            score += 0.2;
            contextualFactors.push(`Context match for ${intent}: ${context.join(', ')}`);
          }
        }
      }
      
      if (score > 0) {
        intentScores.set(intent, score);
      }
    }
    
    // Sort by score and get primary intent
    const sortedIntents = Array.from(intentScores.entries())
      .sort(([,a], [,b]) => b - a);
    
    const primaryIntent = sortedIntents[0]?.[0] || 'general_search';
    const confidence = sortedIntents[0]?.[1] || 0.1;
    
    // Get secondary intents
    const secondaryIntents = sortedIntents
      .slice(1, 3)
      .map(([intent, score]) => ({
        intent,
        confidence: score / Math.max(confidence, 0.1)
      }));
    
    // Determine medical domain
    const medicalDomain = this.isMedicalDomain(tokens, primaryIntent);
    
    // Determine urgency level
    const urgencyLevel = this.determineUrgencyLevel(tokens, normalizedQuery);

    return {
      primaryIntent,
      secondaryIntents,
      confidence: Math.min(confidence, 1.0),
      reasoning,
      contextualFactors,
      medicalDomain,
      urgencyLevel
    };
  }

  /**
   * Check if query is in medical domain
   */
  private isMedicalDomain(tokens: string[], intent: SearchIntent): boolean {
    const medicalIntents: SearchIntent[] = [
      'medical_record_search', 'procedure_search', 'similar_cases', 'treatment_history'
    ];
    
    if (medicalIntents.includes(intent)) return true;
    
    const medicalTerms = [
      'paciente', 'consulta', 'exame', 'diagnóstico', 'tratamento', 'procedimento',
      'medicamento', 'cirurgia', 'terapia', 'botox', 'laser', 'peeling'
    ];
    
    return tokens.some(token => 
      medicalTerms.some(term => token.includes(term))
    );
  }

  /**
   * Determine urgency level
   */
  private determineUrgencyLevel(
    tokens: string[], 
    query: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const urgencyKeywords = {
      critical: ['urgente', 'emergência', 'emergency', 'critical', 'agora', 'now'],
      high: ['importante', 'prioritário', 'important', 'priority', 'rápido', 'quick'],
      medium: ['logo', 'soon', 'breve', 'shortly', 'quando possível', 'when possible'],
      low: ['depois', 'later', 'eventually', 'algum dia', 'someday']
    };
    
    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
      const hasKeywords = keywords.some(keyword => 
        query.toLowerCase().includes(keyword)
      );
      if (hasKeywords) {
        return level as 'low' | 'medium' | 'high' | 'critical';
      }
    }
    
    return 'low';
  }

  /**
   * Initialize intent patterns
   */
  private initializeIntentPatterns(): void {
    this.intentPatterns = new Map([
      ['patient_lookup', [
        { pattern: /(?:buscar|encontrar|procurar).*?(?:paciente|cliente)/i, weight: 0.8, context: ['nome', 'cpf', 'telefone'] },
        { pattern: /(?:quem é|who is).*?(?:paciente|patient)/i, weight: 0.9, context: ['identificação'] },
        { pattern: /(?:dados|informações).*?(?:paciente|patient)/i, weight: 0.7, context: ['pessoal', 'contato'] }
      ]],
      ['appointment_search', [
        { pattern: /(?:buscar|ver|encontrar).*?(?:agendamento|consulta|appointment)/i, weight: 0.8, context: ['data', 'horário', 'agenda'] },
        { pattern: /(?:quando|when).*?(?:consulta|appointment)/i, weight: 0.9, context: ['tempo', 'schedule'] },
        { pattern: /(?:próxima|next|última|last).*?(?:consulta|appointment)/i, weight: 0.8, context: ['futuro', 'passado'] }
      ]],
      ['medical_record_search', [
        { pattern: /(?:buscar|ver).*?(?:prontuário|ficha|histórico|medical record)/i, weight: 0.9, context: ['médico', 'clínico'] },
        { pattern: /(?:exames|tests|resultados|results)/i, weight: 0.7, context: ['laboratório', 'diagnóstico'] },
        { pattern: /(?:diagnóstico|diagnosis|tratamento|treatment)/i, weight: 0.8, context: ['médico', 'terapia'] }
      ]],
      ['procedure_search', [
        { pattern: /(?:buscar|encontrar).*?(?:procedimento|procedure|tratamento)/i, weight: 0.8, context: ['estético', 'médico'] },
        { pattern: /(?:que|what).*?(?:procedimento|procedure).*?(?:foi|was)/i, weight: 0.9, context: ['histórico'] },
        { pattern: /(?:botox|preenchimento|laser|peeling|cirurgia)/i, weight: 0.9, context: ['estético'] }
      ]],
      ['financial_search', [
        { pattern: /(?:buscar|ver).*?(?:pagamento|payment|financeiro)/i, weight: 0.8, context: ['dinheiro', 'fatura'] },
        { pattern: /(?:quanto|how much|valor|price|custo)/i, weight: 0.7, context: ['preço', 'cobrança'] },
        { pattern: /(?:fatura|invoice|recibo|receipt)/i, weight: 0.8, context: ['documento', 'billing'] }
      ]],
      ['similar_cases', [
        { pattern: /(?:casos|cases).*?(?:similares|similar|parecidos)/i, weight: 0.9, context: ['comparação'] },
        { pattern: /(?:outros|other).*?(?:pacientes|patients).*?(?:como|like)/i, weight: 0.8, context: ['semelhança'] },
        { pattern: /(?:experiências|experiences).*?(?:parecidas|similar)/i, weight: 0.7, context: ['resultado'] }
      ]],
      ['analytics_search', [
        { pattern: /(?:estatísticas|statistics|métricas|metrics)/i, weight: 0.9, context: ['números', 'dados'] },
        { pattern: /(?:relatório|report|dashboard)/i, weight: 0.8, context: ['análise', 'gestão'] },
        { pattern: /(?:quantos|how many|total|count)/i, weight: 0.7, context: ['contagem', 'soma'] }
      ]]
    ]);
  }
}

/**
 * Entity Extractor - Specialized for healthcare entities
 */
export class EntityExtractor {
  private entityPatterns: Map<EntityType, Array<{
    pattern: RegExp;
    processor: (match: RegExpMatchArray) => any;
    confidence: number;
  }>>;

  constructor() {
    this.initializeEntityPatterns();
  }

  /**
   * Extract entities from parsed query
   */
  public async extractEntities(
    parseResult: QueryParseResult,
    intentResult: IntentRecognitionResult
  ): Promise<EntityExtractionResult> {
    const startTime = Date.now();
    const entities: EntityExtractionResult['entities'] = [];
    const namedEntities: EntityExtractionResult['namedEntities'] = [];
    
    const { normalizedQuery, originalQuery } = parseResult;
    
    // Extract typed entities
    for (const [entityType, patterns] of this.entityPatterns) {
      for (const { pattern, processor, confidence } of patterns) {
        const matches = originalQuery.matchAll(new RegExp(pattern.source, pattern.flags + 'g'));
        
        for (const match of matches) {
          try {
            const processedData = processor(match);
            if (processedData) {
              entities.push({
                type: entityType,
                value: match[0],
                normalizedValue: processedData.normalized || match[0].toLowerCase(),
                confidence: confidence * (intentResult.medicalDomain ? 1.2 : 1.0),
                position: {
                  start: match.index || 0,
                  end: (match.index || 0) + match[0].length
                },
                attributes: processedData.attributes || {},
                relationships: []
              });
            }
          } catch (error) {
            console.warn(`Entity processing failed for ${entityType}:`, error);
          }
        }
      }
    }
    
    // Extract named entities (dates, times, money, etc.)
    namedEntities.push(...this.extractNamedEntities(originalQuery));
    
    // Remove duplicates and sort by confidence
    const uniqueEntities = this.removeDuplicateEntities(entities);
    
    return {
      entities: uniqueEntities.sort((a, b) => b.confidence - a.confidence),
      namedEntities: namedEntities.sort((a, b) => b.confidence - a.confidence),
      extractionTime: Date.now() - startTime,
      totalEntities: uniqueEntities.length + namedEntities.length
    };
  }

  /**
   * Extract named entities (dates, times, money, etc.)
   */
  private extractNamedEntities(query: string): EntityExtractionResult['namedEntities'] {
    const namedEntities: EntityExtractionResult['namedEntities'] = [];
    
    const patterns = [
      {
        type: 'date' as const,
        pattern: /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}\s+de\s+\w+\s+de\s+\d{4})\b/g,
        confidence: 0.9
      },
      {
        type: 'time' as const,
        pattern: /\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:am|pm|h))?)\b/gi,
        confidence: 0.8
      },
      {
        type: 'money' as const,
        pattern: /\b(R?\$\s*\d+(?:\.\d{3})*(?:,\d{2})?|\d+(?:\.\d{3})*(?:,\d{2})?\s*reais?)\b/g,
        confidence: 0.9
      },
      {
        type: 'percentage' as const,
        pattern: /\b(\d+(?:,\d+)?%)\b/g,
        confidence: 0.8
      },
      {
        type: 'person' as const,
        pattern: /\b([A-Z][a-záàâãéèêíïóôõöúçñ]+(?:\s+[A-Z][a-záàâãéèêíïóôõöúçñ]+)+)\b/g,
        confidence: 0.6
      }
    ];
    
    for (const { type, pattern, confidence } of patterns) {
      const matches = query.matchAll(pattern);
      
      for (const match of matches) {
        namedEntities.push({
          type,
          value: match[1] || match[0],
          confidence,
          position: {
            start: match.index || 0,
            end: (match.index || 0) + match[0].length
          }
        });
      }
    }
    
    return namedEntities;
  }

  /**
   * Remove duplicate entities
   */
  private removeDuplicateEntities(
    entities: EntityExtractionResult['entities']
  ): EntityExtractionResult['entities'] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = `${entity.type}:${entity.normalizedValue}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Initialize entity extraction patterns
   */
  private initializeEntityPatterns(): void {
    this.entityPatterns = new Map([
      ['patient', [
        {
          pattern: /(?:paciente|cliente)\s+([A-Za-záàâãéèêíïóôõöúçñ\s]+)/i,
          processor: (match) => ({
            normalized: match[1].trim().toLowerCase(),
            attributes: { type: 'name', source: 'query' }
          }),
          confidence: 0.8
        },
        {
          pattern: /(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})/g,
          processor: (match) => ({
            normalized: match[1].replace(/\D/g, ''),
            attributes: { type: 'cpf', formatted: match[1] }
          }),
          confidence: 0.9
        }
      ]],
      ['appointment', [
        {
          pattern: /agendamento\s+(\w+)/i,
          processor: (match) => ({
            normalized: match[1].toLowerCase(),
            attributes: { type: 'reference' }
          }),
          confidence: 0.7
        }
      ]],
      ['procedure', [
        {
          pattern: /(botox|preenchimento|laser|peeling|microagulhamento|harmonização|rinomodelação|bichectomia)/i,
          processor: (match) => ({
            normalized: match[1].toLowerCase(),
            attributes: { type: 'aesthetic_procedure', category: 'facial' }
          }),
          confidence: 0.9
        }
      ]],
      ['payment', [
        {
          pattern: /(?:fatura|invoice)\s+([A-Za-z0-9-]+)/i,
          processor: (match) => ({
            normalized: match[1].toUpperCase(),
            attributes: { type: 'invoice_number' }
          }),
          confidence: 0.8
        }
      ]]
    ]);
  }
}

export { QueryParser, IntentClassifier, EntityExtractor };