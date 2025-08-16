/**
 * NLP Search Engine Core
 *
 * Provides natural language processing capabilities for conversational patient search.
 * Supports intent detection, entity extraction, and query normalization.
 *
 * @module nlp-engine
 * @version 1.0.0
 */

// Types for search entities and intents
export type SearchEntity = {
  type:
    | 'person'
    | 'condition'
    | 'procedure'
    | 'date'
    | 'age'
    | 'location'
    | 'specialty';
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
};

export type SearchIntent = {
  action: 'find' | 'list' | 'show' | 'search' | 'filter' | 'count';
  target: 'patient' | 'appointment' | 'treatment' | 'procedure' | 'record';
  confidence: number;
  modifiers: string[];
};

export type NLPSearchQuery = {
  originalQuery: string;
  normalizedQuery: string;
  intent: SearchIntent;
  entities: SearchEntity[];
  filters: Record<string, any>;
  suggestions: string[];
};

export type SearchContext = {
  userId: string;
  userRole: string;
  recentSearches: string[];
  currentPage?: string;
  contextualFilters?: Record<string, any>;
};

/**
 * Natural Language Processing Search Engine
 *
 * Converts natural language queries into structured search parameters
 * and provides intelligent suggestions and context-aware results.
 */
export class NLPSearchEngine {
  private stopWords = new Set<string>();

  constructor() {
    this.initializePatterns();
    this.initializeEntityPatterns();
    this.initializeSynonyms();
    this.initializeStopWords();
  }

  /**
   * Process natural language query into structured search parameters
   */
  async processQuery(
    query: string,
    context?: SearchContext,
  ): Promise<NLPSearchQuery> {
    // Normalize the input query
    const normalizedQuery = this.normalizeQuery(query);

    // Extract intent from the query
    const intent = this.extractIntent(normalizedQuery);

    // Extract entities (names, conditions, dates, etc.)
    const entities = this.extractEntities(normalizedQuery);

    // Convert entities to database filters
    const filters = this.entitiesToFilters(entities, context);

    // Generate suggestions based on context
    const suggestions = await this.generateSuggestions(
      normalizedQuery,
      context,
    );

    return {
      originalQuery: query,
      normalizedQuery,
      intent,
      entities,
      filters,
      suggestions,
    };
  }

  /**
   * Normalize query text for better processing
   */
  private normalizeQuery(query: string): string {
    return (
      query
        .toLowerCase()
        .trim()
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Handle common contractions
        .replace(/can't/g, 'cannot')
        .replace(/won't/g, 'will not')
        .replace(/n't/g, ' not')
        // Remove punctuation except for important ones
        .replace(/[^\w\s\-.]/g, ' ')
        .trim()
    );
  }

  /**
   * Extract user intent from the query
   */
  private extractIntent(query: string): SearchIntent {
    // Default intent
    const intent: SearchIntent = {
      action: 'find',
      target: 'patient',
      confidence: 0.5,
      modifiers: [],
    };

    // Action detection patterns
    const actionPatterns = {
      find: /\b(find|search|look|locate|get)\b/i,
      list: /\b(list|show all|display|enumerate)\b/i,
      show: /\b(show|display|view|open)\b/i,
      filter: /\b(filter|where|with|having)\b/i,
      count: /\b(count|how many|number of)\b/i,
    };

    // Target detection patterns
    const targetPatterns = {
      patient: /\b(patient|person|people|individual|client)\b/i,
      appointment: /\b(appointment|booking|schedule|visit)\b/i,
      treatment: /\b(treatment|therapy|procedure|service)\b/i,
      procedure: /\b(procedure|operation|surgery|intervention)\b/i,
      record: /\b(record|history|file|document)\b/i,
    };

    // Detect action
    for (const [action, pattern] of Object.entries(actionPatterns)) {
      if (pattern.test(query)) {
        intent.action = action as any;
        intent.confidence = Math.min(intent.confidence + 0.2, 0.9);
        break;
      }
    }

    // Detect target
    for (const [target, pattern] of Object.entries(targetPatterns)) {
      if (pattern.test(query)) {
        intent.target = target as any;
        intent.confidence = Math.min(intent.confidence + 0.2, 0.9);
        break;
      }
    }

    // Detect modifiers
    const modifierPatterns = {
      recent: /\b(recent|latest|new|current)\b/i,
      urgent: /\b(urgent|emergency|critical|priority)\b/i,
      completed: /\b(completed|finished|done)\b/i,
      pending: /\b(pending|waiting|scheduled)\b/i,
      cancelled: /\b(cancelled|canceled|aborted)\b/i,
    };

    for (const [modifier, pattern] of Object.entries(modifierPatterns)) {
      if (pattern.test(query)) {
        intent.modifiers.push(modifier);
        intent.confidence = Math.min(intent.confidence + 0.1, 0.95);
      }
    }

    return intent;
  }

  /**
   * Extract entities (names, dates, conditions, etc.) from query
   */
  private extractEntities(query: string): SearchEntity[] {
    const entities: SearchEntity[] = [];

    // Name patterns (simple heuristic)
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    let nameMatch;
    while ((nameMatch = namePattern.exec(query)) !== null) {
      // Skip common words that might be capitalized
      if (!this.isCommonWord(nameMatch[1])) {
        entities.push({
          type: 'person',
          value: nameMatch[1],
          confidence: 0.7,
          startIndex: nameMatch.index,
          endIndex: nameMatch.index + nameMatch[1].length,
        });
      }
    }

    // Date patterns
    const datePatterns = [
      { pattern: /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g, confidence: 0.9 },
      { pattern: /\b(\d{4}-\d{1,2}-\d{1,2})\b/g, confidence: 0.9 },
      { pattern: /\b(today|yesterday|tomorrow)\b/g, confidence: 0.8 },
      { pattern: /\b(this week|last week|next week)\b/g, confidence: 0.7 },
      {
        pattern:
          /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b/gi,
        confidence: 0.8,
      },
    ];

    for (const { pattern, confidence } of datePatterns) {
      let dateMatch;
      while ((dateMatch = pattern.exec(query)) !== null) {
        entities.push({
          type: 'date',
          value: dateMatch[1],
          confidence,
          startIndex: dateMatch.index,
          endIndex: dateMatch.index + dateMatch[1].length,
        });
      }
    }

    // Age patterns
    const agePattern = /\b(\d{1,3})\s*(?:years?\s*old|yo|age)\b/gi;
    let ageMatch;
    while ((ageMatch = agePattern.exec(query)) !== null) {
      entities.push({
        type: 'age',
        value: ageMatch[1],
        confidence: 0.8,
        startIndex: ageMatch.index,
        endIndex: ageMatch.index + ageMatch[0].length,
      });
    }

    // Medical condition patterns (basic set)
    const conditionKeywords = [
      'diabetes',
      'hypertension',
      'obesity',
      'depression',
      'anxiety',
      'arthritis',
      'asthma',
      'allergies',
      'migraine',
      'insomnia',
      'acne',
      'eczema',
      'psoriasis',
      'dermatitis',
      'rosacea',
    ];

    for (const condition of conditionKeywords) {
      const pattern = new RegExp(`\\b${condition}\\b`, 'gi');
      let conditionMatch;
      while ((conditionMatch = pattern.exec(query)) !== null) {
        entities.push({
          type: 'condition',
          value: condition,
          confidence: 0.8,
          startIndex: conditionMatch.index,
          endIndex: conditionMatch.index + condition.length,
        });
      }
    }

    // Procedure patterns (aesthetic/beauty focused)
    const procedureKeywords = [
      'botox',
      'fillers',
      'laser',
      'peeling',
      'facial',
      'massage',
      'microagulhamento',
      'limpeza',
      'hidratação',
      'radiofrequência',
      'criolipólise',
      'depilação',
      'toxina',
      'preenchimento',
    ];

    for (const procedure of procedureKeywords) {
      const pattern = new RegExp(`\\b${procedure}\\b`, 'gi');
      let procedureMatch;
      while ((procedureMatch = pattern.exec(query)) !== null) {
        entities.push({
          type: 'procedure',
          value: procedure,
          confidence: 0.8,
          startIndex: procedureMatch.index,
          endIndex: procedureMatch.index + procedure.length,
        });
      }
    }

    // Remove overlapping entities (keep higher confidence)
    return this.removeOverlappingEntities(entities);
  }

  /**
   * Convert extracted entities to database filters
   */
  private entitiesToFilters(
    entities: SearchEntity[],
    context?: SearchContext,
  ): Record<string, any> {
    const filters: Record<string, any> = {};

    for (const entity of entities) {
      switch (entity.type) {
        case 'person':
          // Search in name fields
          filters.name = {
            contains: entity.value,
            mode: 'insensitive',
          };
          break;

        case 'date': {
          // Parse and convert to date range
          const date = this.parseDate(entity.value);
          if (date) {
            filters.createdAt = {
              gte: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
              ),
              lt: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate() + 1,
              ),
            };
          }
          break;
        }

        case 'age': {
          const age = Number.parseInt(entity.value, 10);
          filters.birthDate = {
            gte: new Date(new Date().getFullYear() - age - 1, 0, 1),
            lte: new Date(new Date().getFullYear() - age, 11, 31),
          };
          break;
        }

        case 'condition':
          filters.medicalHistory = {
            some: {
              condition: {
                contains: entity.value,
                mode: 'insensitive',
              },
            },
          };
          break;

        case 'procedure':
          filters.treatments = {
            some: {
              procedureName: {
                contains: entity.value,
                mode: 'insensitive',
              },
            },
          };
          break;

        case 'specialty':
          filters.preferredSpecialty = {
            equals: entity.value,
          };
          break;
      }
    }

    // Add contextual filters if available
    if (context?.contextualFilters) {
      Object.assign(filters, context.contextualFilters);
    }

    return filters;
  }

  /**
   * Generate search suggestions based on query and context
   */
  private async generateSuggestions(
    query: string,
    context?: SearchContext,
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Add recent searches as suggestions
    if (context?.recentSearches) {
      const relevantSearches = context.recentSearches
        .filter((search) => search.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3);
      suggestions.push(...relevantSearches);
    }

    // Add common search patterns
    const commonPatterns = [
      'pacientes com diabetes',
      'agendamentos hoje',
      'tratamentos de botox',
      'pacientes novos esta semana',
      'procedimentos pendentes',
      'histórico de alergias',
    ];

    const relevantPatterns = commonPatterns
      .filter(
        (pattern) =>
          pattern.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(pattern.toLowerCase()),
      )
      .slice(0, 2);

    suggestions.push(...relevantPatterns);

    // Remove duplicates and limit to 5 suggestions
    return Array.from(new Set(suggestions)).slice(0, 5);
  }

  /**
   * Parse natural language date to Date object
   */
  private parseDate(dateString: string): Date | null {
    const today = new Date();

    // Handle relative dates
    switch (dateString.toLowerCase()) {
      case 'today':
        return today;
      case 'yesterday':
        return new Date(today.getTime() - 24 * 60 * 60 * 1000);
      case 'tomorrow':
        return new Date(today.getTime() + 24 * 60 * 60 * 1000);
      case 'this week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return startOfWeek;
      }
      case 'last week': {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7 - today.getDay());
        return lastWeek;
      }
      case 'next week': {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7 - today.getDay());
        return nextWeek;
      }
    }

    // Try to parse standard date formats
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  /**
   * Check if a word is a common word that shouldn't be treated as a name
   */
  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'Today',
      'Yesterday',
      'Tomorrow',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
      'Patient',
      'Doctor',
      'Nurse',
      'Treatment',
      'Procedure',
      'Appointment',
      'Schedule',
      'History',
    ]);

    return commonWords.has(word) || this.stopWords.has(word.toLowerCase());
  }

  /**
   * Remove overlapping entities, keeping the one with higher confidence
   */
  private removeOverlappingEntities(entities: SearchEntity[]): SearchEntity[] {
    const sorted = entities.sort((a, b) => b.confidence - a.confidence);
    const result: SearchEntity[] = [];

    for (const entity of sorted) {
      const hasOverlap = result.some(
        (existing) =>
          (entity.startIndex >= existing.startIndex &&
            entity.startIndex < existing.endIndex) ||
          (entity.endIndex > existing.startIndex &&
            entity.endIndex <= existing.endIndex) ||
          (entity.startIndex <= existing.startIndex &&
            entity.endIndex >= existing.endIndex),
      );

      if (!hasOverlap) {
        result.push(entity);
      }
    }

    return result.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Initialize intent patterns
   */
  private initializePatterns(): void {
    this.intentPatterns = new Map();
    // Patterns are defined in the extractIntent method for better readability
  }

  /**
   * Initialize entity recognition patterns
   */
  private initializeEntityPatterns(): void {
    this.entityPatterns = new Map();
    // Patterns are defined in the extractEntities method for better readability
  }

  /**
   * Initialize synonym mapping
   */
  private initializeSynonyms(): void {
    this.synonyms = new Map([
      ['paciente', ['cliente', 'pessoa', 'individual']],
      ['agendamento', ['consulta', 'visita', 'appointment']],
      ['tratamento', ['procedimento', 'terapia', 'serviço']],
      ['histórico', ['histórico médico', 'prontuário', 'ficha']],
      ['alergia', ['alergias', 'reação alérgica', 'sensibilidade']],
      ['medicamento', ['remédio', 'medicação', 'fármaco']],
    ]);
  }

  /**
   * Initialize stop words
   */
  private initializeStopWords(): void {
    this.stopWords = new Set([
      'a',
      'an',
      'and',
      'are',
      'as',
      'at',
      'be',
      'by',
      'for',
      'from',
      'has',
      'he',
      'in',
      'is',
      'it',
      'its',
      'of',
      'on',
      'that',
      'the',
      'to',
      'was',
      'were',
      'will',
      'with',
      'o',
      'a',
      'os',
      'as',
      'um',
      'uma',
      'de',
      'do',
      'da',
      'dos',
      'das',
      'em',
      'no',
      'na',
      'nos',
      'nas',
      'por',
      'para',
      'com',
      'sem',
      'sob',
      'sobre',
      'ante',
      'após',
    ]);
  }
}

// Export singleton instance
export const nlpSearchEngine = new NLPSearchEngine();
