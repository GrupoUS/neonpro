// 🧠 NLP Service Configuration - Smart Search + NLP Integration
// NeonPro - Serviço de Processamento de Linguagem Natural
// Quality Standard: ≥9.5/10 (BMad Enhanced)

import type {
  EntityType,
  NaturalLanguageQuery,
  NLPProcessingError,
  SearchContext,
  SearchDataCategory,
  SearchFilter,
  SearchIntent,
} from "@neonpro/types/search-types";
import type { OpenAI } from "openai";

export interface NLPServiceConfig {
  provider: "openai" | "claude" | "local";
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  debugMode: boolean;
  medicalTermsDatabase: string[];
  portugueseSupport: boolean;
}

export interface EntityExtractionConfig {
  enabledEntityTypes: EntityType[];
  confidenceThreshold: number;
  maxEntitiesPerQuery: number;
  contextAwareExtraction: boolean;
  medicalEntityRecognition: boolean;
  dateTimeExtraction: boolean;
  numericValueExtraction: boolean;
}

export interface IntentClassificationConfig {
  supportedIntents: SearchIntent[];
  defaultIntent: SearchIntent;
  confidenceThreshold: number;
  contextualClassification: boolean;
  learningEnabled: boolean;
  userFeedbackWeight: number;
}

export class NLPServiceManager {
  private config: NLPServiceConfig;
  private openaiClient?: OpenAI;
  private cache: Map<string, any> = new Map();
  private medicalTerms: Set<string>;
  private intentPatterns: Map<SearchIntent, RegExp[]>;
  private entityPatterns: Map<EntityType, RegExp[]>;

  constructor(config: NLPServiceConfig) {
    this.config = config;
    this.medicalTerms = new Set(config.medicalTermsDatabase);
    this.initializePatterns();

    if (config.provider === "openai" && config.apiKey) {
      this.openaiClient = new OpenAI({ apiKey: config.apiKey });
    }
  }

  private initializePatterns(): void {
    // Intent Detection Patterns (Portuguese + English)
    this.intentPatterns = new Map([
      [
        "patient_lookup",
        [
          /(?:buscar|encontrar|procurar|localizar).*?(?:paciente|cliente)/i,
          /(?:find|search|locate|lookup).*?(?:patient|client)/i,
          /(?:quem é|who is).*?(?:paciente|patient)/i,
          /(?:dados|informações|info).*?(?:paciente|patient)/i,
        ],
      ],
      [
        "appointment_search",
        [
          /(?:buscar|encontrar|ver).*?(?:agendamento|consulta|appointment)/i,
          /(?:quando|when).*?(?:consulta|appointment|agendamento)/i,
          /(?:agenda|schedule|horário|time)/i,
          /(?:próxima|next|última|last).*?(?:consulta|appointment)/i,
        ],
      ],
      [
        "medical_record_search",
        [
          /(?:buscar|ver|encontrar).*?(?:prontuário|ficha|histórico|medical record)/i,
          /(?:exames|tests|resultados|results)/i,
          /(?:diagnóstico|diagnosis|tratamento|treatment)/i,
          /(?:medicamentos|medications|prescrições|prescriptions)/i,
        ],
      ],
      [
        "procedure_search",
        [
          /(?:buscar|encontrar).*?(?:procedimento|procedure|tratamento|treatment)/i,
          /(?:que|what).*?(?:procedimento|procedure).*?(?:foi|was).*?(?:feito|done)/i,
          /(?:cirurgia|surgery|operação|operation)/i,
          /(?:estética|aesthetic|cosmetic)/i,
        ],
      ],
      [
        "financial_search",
        [
          /(?:buscar|ver|encontrar).*?(?:pagamento|payment|financeiro|financial)/i,
          /(?:quanto|how much|valor|price|custo|cost)/i,
          /(?:fatura|invoice|recibo|receipt|cobrança|billing)/i,
          /(?:débito|debt|crédito|credit|pendência|pending)/i,
        ],
      ],
      [
        "compliance_search",
        [
          /(?:buscar|ver).*?(?:compliance|conformidade|auditoria|audit)/i,
          /(?:lgpd|gdpr|regulamentação|regulation)/i,
          /(?:consentimento|consent|autorização|authorization)/i,
          /(?:relatório|report).*?(?:compliance|conformidade)/i,
        ],
      ],
      [
        "similar_cases",
        [
          /(?:casos|cases).*?(?:similares|similar|parecidos|alike)/i,
          /(?:outros|other).*?(?:pacientes|patients).*?(?:como|like)/i,
          /(?:tratamentos|treatments).*?(?:semelhantes|similar)/i,
          /(?:experiências|experiences).*?(?:parecidas|similar)/i,
        ],
      ],
      [
        "treatment_history",
        [
          /(?:histórico|history).*?(?:tratamento|treatment)/i,
          /(?:evolução|evolution|progresso|progress)/i,
          /(?:antes|before|depois|after)/i,
          /(?:sessões|sessions|consultas|appointments).*?(?:anteriores|previous)/i,
        ],
      ],
      [
        "analytics_search",
        [
          /(?:estatísticas|statistics|métricas|metrics|analytics)/i,
          /(?:relatório|report|dashboard|painel)/i,
          /(?:quantos|how many|total|count)/i,
          /(?:performance|desempenho|resultados|results)/i,
        ],
      ],
    ]);

    // Entity Extraction Patterns
    this.entityPatterns = new Map([
      [
        "patient",
        [
          /(?:paciente|patient|cliente|client)\s+([A-Za-záàâãéèêíïóôõöúçñ\s]+)/i,
          /([A-Za-záàâãéèêíïóôõöúçñ]+(?:\s+[A-Za-záàâãéèêíïóôõöúçñ]+)+)(?=\s+(?:tem|has|foi|was|está|is))/i,
          /@([A-Za-z0-9._-]+)/i, // Email patterns
        ],
      ],
      [
        "appointment",
        [
          /(?:agendamento|appointment|consulta)\s+(?:em|on|para|for)\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
          /(?:às|at)\s+(\d{1,2}:\d{2})/i,
          /(?:dia|day)\s+(\d{1,2})/i,
        ],
      ],
      [
        "procedure",
        [
          /(?:procedimento|procedure|tratamento|treatment)\s+([A-Za-záàâãéèêíïóôõöúçñ\s]+)/i,
          /(?:cirurgia|surgery)\s+([A-Za-záàâãéèêíïóôõöúçñ\s]+)/i,
          /(?:botox|preenchimento|laser|peeling|microagulhamento)/i,
        ],
      ],
      [
        "medical_record",
        [
          /(?:prontuário|medical record|ficha)\s+([A-Za-z0-9-]+)/i,
          /(?:exame|test|resultado|result)\s+([A-Za-záàâãéèêíïóôõöúçñ\s]+)/i,
        ],
      ],
      [
        "payment",
        [
          /(?:pagamento|payment|fatura|invoice)\s+([A-Za-z0-9-]+)/i,
          /R?\$\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i, // Brazilian currency
          /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i, // US currency
        ],
      ],
      [
        "document",
        [
          /(?:documento|document|arquivo|file)\s+([A-Za-z0-9._-]+)/i,
          /\.(?:pdf|doc|docx|jpg|jpeg|png|gif)/i,
        ],
      ],
    ]);
  }

  /**
   * Process natural language query and extract intent, entities, and context
   */
  public async processQuery(
    query: string,
    userId: string,
    sessionContext?: any,
  ): Promise<NaturalLanguageQuery> {
    try {
      const startTime = Date.now();

      // Check cache first
      const cacheKey = `nlp:${query}:${userId}`;
      if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Clean and normalize query
      const processedQuery = this.normalizeQuery(query);

      // Detect language
      const language = this.detectLanguage(processedQuery);

      // Extract medical terms
      const medicalTerms = this.extractMedicalTerms(processedQuery);

      // Classify intent
      const detectedIntent = await this.classifyIntent(processedQuery, sessionContext);

      // Extract entities
      const extractedEntities = await this.extractEntities(processedQuery, detectedIntent);

      // Generate search filters
      const suggestedFilters = this.generateSearchFilters(
        processedQuery,
        detectedIntent,
        extractedEntities,
      );

      // Extract temporal information
      const temporalFilters = this.extractTemporalFilters(processedQuery);

      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(
        detectedIntent,
        extractedEntities,
        medicalTerms,
      );

      const result: NaturalLanguageQuery = {
        originalQuery: query,
        processedQuery,
        detectedIntent,
        extractedEntities,
        suggestedFilters,
        confidence,
        language,
        medicalTerms,
        temporalFilters,
      };

      // Cache the result
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), this.config.cacheTTL * 1000);
      }

      // Log processing time for optimization
      if (this.config.debugMode) {
        console.log(`NLP Processing completed in ${Date.now() - startTime}ms`);
      }

      return result;
    } catch (error) {
      throw new NLPProcessingError(
        `Failed to process natural language query: ${error instanceof Error ? error.message : "Unknown error"}`,
        { query, userId, error },
      );
    }
  }

  private normalizeQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, " ") // Keep Portuguese characters
      .replace(/\s+/g, " ")
      .trim();
  }

  private detectLanguage(query: string): "pt" | "en" {
    const portugueseWords = [
      "paciente",
      "agendamento",
      "consulta",
      "prontuário",
      "tratamento",
      "procedimento",
      "quando",
      "onde",
      "como",
      "porque",
    ];
    const englishWords = [
      "patient",
      "appointment",
      "consultation",
      "record",
      "treatment",
      "procedure",
      "when",
      "where",
      "how",
      "why",
    ];

    const portugueseCount = portugueseWords.filter((word) => query.includes(word)).length;
    const englishCount = englishWords.filter((word) => query.includes(word)).length;

    return portugueseCount > englishCount ? "pt" : "en";
  }

  private extractMedicalTerms(query: string): string[] {
    const foundTerms: string[] = [];

    for (const term of this.medicalTerms) {
      if (query.includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    }

    return foundTerms;
  }

  private async classifyIntent(query: string, sessionContext?: any): Promise<SearchIntent> {
    // First try pattern matching for quick classification
    for (const [intent, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          return intent as SearchIntent;
        }
      }
    }

    // Fallback to AI classification if enabled
    if (this.openaiClient && this.config.provider === "openai") {
      return await this.classifyIntentWithAI(query, sessionContext);
    }

    return "general_search";
  }

  private async classifyIntentWithAI(query: string, sessionContext?: any): Promise<SearchIntent> {
    try {
      const prompt = `
        Classifique a intenção de busca para o seguinte query em um sistema de gestão de clínica estética:
        
        Query: "${query}"
        
        Intenções possíveis:
        - patient_lookup: buscar informações de paciente específico
        - appointment_search: buscar agendamentos/consultas
        - medical_record_search: buscar prontuários/históricos médicos
        - procedure_search: buscar procedimentos/tratamentos
        - financial_search: buscar informações financeiras/pagamentos
        - compliance_search: buscar dados de compliance/auditoria
        - similar_cases: buscar casos similares
        - treatment_history: buscar histórico de tratamentos
        - analytics_search: buscar dados estatísticos/relatórios
        - general_search: busca geral
        
        Responda apenas com a intenção mais provável.
      `;

      const response = await this.openaiClient.chat.completions.create({
        model: this.config.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 0.1,
      });

      const intent = response.choices[0]?.message?.content?.trim();

      // Validate the returned intent
      const validIntents: SearchIntent[] = [
        "patient_lookup",
        "appointment_search",
        "medical_record_search",
        "procedure_search",
        "financial_search",
        "compliance_search",
        "similar_cases",
        "treatment_history",
        "analytics_search",
        "general_search",
      ];

      return validIntents.includes(intent as SearchIntent)
        ? (intent as SearchIntent)
        : "general_search";
    } catch (error) {
      console.warn("AI intent classification failed, falling back to general_search:", error);
      return "general_search";
    }
  }

  private async extractEntities(
    query: string,
    intent: SearchIntent,
  ): Promise<NaturalLanguageQuery["extractedEntities"]> {
    const entities: NaturalLanguageQuery["extractedEntities"] = [];

    for (const [entityType, patterns] of this.entityPatterns) {
      for (const pattern of patterns) {
        const matches = query.matchAll(new RegExp(pattern.source, pattern.flags + "g"));

        for (const match of matches) {
          if (match[1]) {
            // Captured group exists
            entities.push({
              type: entityType as EntityType,
              value: match[1].trim(),
              confidence: this.calculateEntityConfidence(
                entityType as EntityType,
                match[1],
                intent,
              ),
              startPos: match.index || 0,
              endPos: (match.index || 0) + match[0].length,
            });
          }
        }
      }
    }

    // Remove duplicates and sort by confidence
    return entities
      .filter(
        (entity, index, self) =>
          index === self.findIndex((e) => e.type === entity.type && e.value === entity.value),
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Limit to top 10 entities
  }

  private calculateEntityConfidence(
    entityType: EntityType,
    value: string,
    intent: SearchIntent,
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on intent-entity relevance
    const intentEntityMap: Record<SearchIntent, EntityType[]> = {
      patient_lookup: ["patient"],
      appointment_search: ["patient", "appointment"],
      medical_record_search: ["patient", "medical_record"],
      procedure_search: ["patient", "procedure"],
      financial_search: ["patient", "payment"],
      compliance_search: ["patient", "document"],
      similar_cases: ["patient", "procedure", "medical_record"],
      treatment_history: ["patient", "procedure"],
      analytics_search: ["patient", "procedure", "payment"],
      general_search: [],
    };

    if (intentEntityMap[intent]?.includes(entityType)) {
      confidence += 0.3;
    }

    // Boost confidence for medical terms
    if (this.medicalTerms.has(value.toLowerCase())) {
      confidence += 0.2;
    }

    // Adjust confidence based on value length and format
    if (value.length > 2 && value.length < 50) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private generateSearchFilters(
    query: string,
    intent: SearchIntent,
    entities: NaturalLanguageQuery["extractedEntities"],
  ): SearchFilter[] {
    const filters: SearchFilter[] = [];

    // Add entity-based filters
    entities.forEach((entity) => {
      if (entity.confidence > 0.6) {
        filters.push({
          field: this.getFieldForEntityType(entity.type),
          operator: "contains",
          value: entity.value,
          label: `${entity.type}: ${entity.value}`,
          category: this.getCategoryForEntityType(entity.type),
          required: false,
          suggested: true,
          confidence: entity.confidence,
        });
      }
    });

    // Add intent-specific filters
    switch (intent) {
      case "appointment_search":
        filters.push({
          field: "status",
          operator: "in",
          value: ["scheduled", "confirmed", "completed"],
          label: "Status do Agendamento",
          category: "internal",
          required: false,
          suggested: true,
        });
        break;

      case "financial_search":
        filters.push({
          field: "payment_status",
          operator: "in",
          value: ["pending", "paid", "overdue"],
          label: "Status do Pagamento",
          category: "financial",
          required: false,
          suggested: true,
        });
        break;
    }

    return filters;
  }

  private extractTemporalFilters(query: string): NaturalLanguageQuery["temporalFilters"] {
    const temporalPatterns = [
      { pattern: /hoje|today/i, days: 0 },
      { pattern: /ontem|yesterday/i, days: -1 },
      { pattern: /semana passada|last week/i, days: -7 },
      { pattern: /mês passado|last month/i, days: -30 },
      { pattern: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g, type: "date" },
      { pattern: /últimos?\s+(\d+)\s+dias?/i, type: "days" },
      { pattern: /próximos?\s+(\d+)\s+dias?/i, type: "future_days" },
    ];

    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let period: string | undefined;

    for (const { pattern, days, type } of temporalPatterns) {
      const match = query.match(pattern);

      if (match) {
        if (typeof days === "number") {
          startDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
          endDate = now;
          period = match[0];
        } else if (type === "date") {
          // Handle date format dd/mm/yyyy
          const [, day, month, year] = match;
          startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          period = match[0];
        } else if (type === "days") {
          const daysCount = parseInt(match[1]);
          startDate = new Date(now.getTime() - daysCount * 24 * 60 * 60 * 1000);
          endDate = now;
          period = `últimos ${daysCount} dias`;
        } else if (type === "future_days") {
          const daysCount = parseInt(match[1]);
          startDate = now;
          endDate = new Date(now.getTime() + daysCount * 24 * 60 * 60 * 1000);
          period = `próximos ${daysCount} dias`;
        }
        break;
      }
    }

    if (startDate || endDate || period) {
      return { startDate, endDate, period };
    }

    return undefined;
  }

  private calculateConfidenceScore(
    intent: SearchIntent,
    entities: NaturalLanguageQuery["extractedEntities"],
    medicalTerms: string[],
  ): number {
    let confidence = 0.3; // Base confidence

    // Boost for specific intent (not general_search)
    if (intent !== "general_search") {
      confidence += 0.4;
    }

    // Boost for extracted entities
    if (entities.length > 0) {
      const avgEntityConfidence =
        entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
      confidence += avgEntityConfidence * 0.3;
    }

    // Boost for medical terms
    if (medicalTerms.length > 0) {
      confidence += Math.min(medicalTerms.length * 0.1, 0.2);
    }

    return Math.min(confidence, 1.0);
  }

  private getFieldForEntityType(entityType: EntityType): string {
    const fieldMap: Record<EntityType, string> = {
      patient: "patient_name",
      appointment: "appointment_id",
      medical_record: "record_content",
      procedure: "procedure_name",
      prescription: "medication_name",
      payment: "payment_reference",
      user: "user_name",
      document: "document_name",
      compliance_record: "compliance_data",
      analytics_data: "metric_name",
    };
    return fieldMap[entityType] || "content";
  }

  private getCategoryForEntityType(entityType: EntityType): SearchDataCategory {
    const categoryMap: Record<EntityType, SearchDataCategory> = {
      patient: "personal",
      appointment: "medical",
      medical_record: "medical",
      procedure: "medical",
      prescription: "medical",
      payment: "financial",
      user: "internal",
      document: "public",
      compliance_record: "sensitive",
      analytics_data: "internal",
    };
    return categoryMap[entityType] || "public";
  }

  public updateMedicalTerms(newTerms: string[]): void {
    newTerms.forEach((term) => this.medicalTerms.add(term.toLowerCase()));
  }

  public getStatistics() {
    return {
      cacheSize: this.cache.size,
      medicalTermsCount: this.medicalTerms.size,
      intentPatternsCount: this.intentPatterns.size,
      entityPatternsCount: this.entityPatterns.size,
      config: this.config,
    };
  }
}

// Default medical terms database for Brazilian aesthetic clinics
export const DEFAULT_MEDICAL_TERMS = [
  // Procedimentos estéticos
  "botox",
  "preenchimento",
  "ácido hialurônico",
  "bioestimulador",
  "laser",
  "radiofrequência",
  "ultrassom",
  "criolipólise",
  "peeling",
  "microagulhamento",
  "mesoterapia",
  "carboxiterapia",
  "harmonização facial",
  "rinomodelação",
  "bichectomia",

  // Áreas de tratamento
  "face",
  "testa",
  "olheiras",
  "rugas",
  "bigode chinês",
  "papada",
  "pescoço",
  "braços",
  "abdômen",
  "pernas",
  "glúteos",
  "flancos",
  "culote",
  "gordura localizada",

  // Produtos e substâncias
  "toxina botulínica",
  "colágeno",
  "vitamina c",
  "retinol",
  "protetor solar",
  "hidratante",
  "serum",
  "esfoliante",

  // Condições e diagnósticos
  "acne",
  "melasma",
  "manchas",
  "cicatrizes",
  "estrias",
  "flacidez",
  "celulite",
  "vasinhos",
  "varizes",
  "rosácea",
  "dermatite",
  "quelóide",
  "hiperpigmentação",

  // Tipos de pele
  "pele oleosa",
  "pele seca",
  "pele mista",
  "pele sensível",
  "pele madura",
  "fotoenvelhecimento",
  "elastose solar",

  // Equipamentos
  "laser fracionado",
  "luz pulsada",
  "microagulhas",
  "endermologia",
  "cavitação",
  "drenagem linfática",
  "massagem modeladora",

  // Termos médicos gerais
  "anamnese",
  "prontuário",
  "evolução",
  "prescrição",
  "orientações",
  "retorno",
  "manutenção",
  "resultado",
  "contraindicação",
  "efeito adverso",
  "complicação",
];

// Export default configuration
export const DEFAULT_NLP_CONFIG: NLPServiceConfig = {
  provider: "openai",
  model: "gpt-3.5-turbo",
  maxTokens: 150,
  temperature: 0.1,
  timeout: 5000,
  retryAttempts: 2,
  cacheEnabled: true,
  cacheTTL: 300,
  debugMode: false,
  medicalTermsDatabase: DEFAULT_MEDICAL_TERMS,
  portugueseSupport: true,
};
