import { QueryIntent, QueryParameters, DateRange, UserRole } from '@neonpro/types';

/**
 * Intent Parser Service
 * 
 * Analyzes natural language queries to extract intent and parameters
 * for database operations. Supports Portuguese healthcare queries with
 * context-aware parameter extraction.
 */
export class IntentParserService {
  private readonly INTENT_PATTERNS: Record<QueryIntent, RegExp[]> = {
    client_data: [
      /(?:clientes?|pacientes?|paciente|client|patients?)\b/i,
      /(?:most(?:re|ar)?|mostr(?:ar)?|ver|show|list(?:ar)?)\s+(?:todos?\s+)?(?:os\s+)?(?:clientes?|pacientes?)/i,
      /(?:dados\s+do\s+)?(?:cliente|paciente)\s+([^]+)/i,
      /(?:informa[çc][õo]es?\s+do\s+)?(?:cliente|paciente)\s+([^]+)/i,
    ],
    appointments: [
      /(?:agendamentos?|consultas?|appointments?)\b/i,
      /(?:pr[óo]ximos?\s+)?(?:agendamentos?|consultas?)/i,
      /(?:agendamentos?\s+para|consultas?\s+para)\s+(.+)/i,
      /(?:marcados|confirmados|cancelados|completados)\s+(?:agendamentos?|consultas?)/i,
      /(?:hoje|amanh[ãa]|esta\s+semana|este\s+m[êe]s)\s+(?:agendamentos?|consultas?)/i,
    ],
    financial: [
      /(?:faturamento?|financeiro?|receita?|pagamentos?|financial?)\b/i,
      /(?:como\s+est[áa]\s+o\s+)?(?:faturamento?|financeiro?)/i,
      /(?:resumo\s+)?(?:financeiro?|faturamento?)/i,
      /(?:pagamentos?\s+recebidos?|receita?\s+gerada)/i,
      /(?:balan[çc]o?\s+)?(?:financeiro?|cont[áa]bil)/i,
    ],
    general: [
      /(?:oi|ol[áa]|hello|hi|bom\s+dia|boa\s+tarde|boa\s+noite)/i,
      /(?:ajuda|help|como|o\s+que)/i,
      /(?:voc[êe]\s+pode|pode\s+me\s+ajudar)/i,
    ],
  };

  private readonly DATE_PATTERNS = {
    today: [
      /hoje\b/i,
      /agora\b/i,
    ],
    tomorrow: [
      /amanh[ãa]\b/i,
    ],
    this_week: [
      /esta\s+semana\b/i,
      /pr[óo]ximos?\s+7\s+dias\b/i,
    ],
    this_month: [
      /este\s+m[êe]s\b/i,
      /m[êe]s\s+atual\b/i,
    ],
    specific_dates: [
      /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/g, // DD/MM/YYYY
      /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/gi, // DD de MMMM de YYYY
    ],
  };

  private readonly CLIENT_NAME_PATTERNS = [
    /(?:cliente|paciente)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)/i, // Capitalized names
  ];

  private readonly FINANCIAL_TYPE_PATTERNS = {
    revenue: [
      /receita\b/i,
      /faturamento?\b/i,
      /entradas?\b/i,
    ],
    payments: [
      /pagamentos?\b/i,
      /recebidos?\b/i,
    ],
    expenses: [
      /despesas?\b/i,
      /gastos?\b/i,
      /custos?\b/i,
    ],
  };

  /**
   * Parse natural language query to extract intent and parameters
   */
  parseQuery(query: string, userRole: UserRole): {
    intent: QueryIntent;
    parameters: QueryParameters;
    confidence: number;
  } {
    const normalizedQuery = this.normalizeQuery(query);
    
    // Determine primary intent
    const intent = this.extractIntent(normalizedQuery);
    const confidence = this.calculateConfidence(normalizedQuery, intent);
    
    // Extract parameters based on intent
    const parameters = this.extractParameters(normalizedQuery, intent, userRole);

    return {
      intent,
      parameters,
      confidence,
    };
  }

  /**
   * Normalize query text for better matching
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, ' ') // Keep only alphanumeric and spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract primary intent from normalized query
   */
  private extractIntent(normalizedQuery: string): QueryIntent {
    const intentScores: Record<QueryIntent, number> = {
      client_data: 0,
      appointments: 0,
      financial: 0,
      general: 0,
      unknown: 0,
    };

    // Score each intent based on pattern matches
    for (const [intent, patterns] of Object.entries(this.INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedQuery)) {
          intentScores[intent as QueryIntent]++;
        }
      }
    }

    // Find intent with highest score
    const maxScore = Math.max(...Object.values(intentScores));
    if (maxScore === 0) {
      return 'unknown';
    }

    const bestIntents = Object.entries(intentScores)
      .filter(([_, score]) => score === maxScore)
      .map(([intent]) => intent as QueryIntent);

    // If tie, prioritize based on query content
    if (bestIntents.length > 1) {
      return this.resolveIntentTie(normalizedQuery, bestIntents);
    }

    return bestIntents[0];
  }

  /**
   * Resolve ties between multiple matching intents
   */
  private resolveIntentTie(query: string, intents: QueryIntent[]): QueryIntent {
    // Priority order for tie-breaking
    const priorityOrder: QueryIntent[] = [
      'financial',
      'appointments',
      'client_data',
      'general',
    ];

    for (const intent of priorityOrder) {
      if (intents.includes(intent)) {
        return intent;
      }
    }

    return intents[0];
  }

  /**
   * Calculate confidence score for intent detection
   */
  private calculateConfidence(query: string, intent: QueryIntent): number {
    if (intent === 'unknown') {
      return 0.3;
    }

    const patterns = this.INTENT_PATTERNS[intent];
    let matchCount = 0;

    for (const pattern of patterns) {
      if (pattern.test(query)) {
        matchCount++;
      }
    }

    // Base confidence on number of matching patterns
    const baseConfidence = Math.min(matchCount / patterns.length, 1.0);

    // Adjust based on query length and specificity
    const queryLengthBonus = Math.min(query.length / 50, 0.2);
    const specificityBonus = this.calculateSpecificityBonus(query);

    return Math.min(baseConfidence + queryLengthBonus + specificityBonus, 1.0);
  }

  /**
   * Calculate bonus based on query specificity
   */
  private calculateSpecificityBonus(query: string): number {
    let bonus = 0;

    // Bonus for specific names
    if (this.CLIENT_NAME_PATTERNS.some(pattern => pattern.test(query))) {
      bonus += 0.2;
    }

    // Bonus for dates
    if (Object.values(this.DATE_PATTERNS).some(patterns => 
      patterns.some(pattern => pattern.test(query))
    )) {
      bonus += 0.2;
    }

    // Bonus for financial type specification
    if (Object.values(this.FINANCIAL_TYPE_PATTERNS).some(patterns => 
      patterns.some(pattern => pattern.test(query))
    )) {
      bonus += 0.1;
    }

    return bonus;
  }

  /**
   * Extract parameters based on intent and query content
   */
  private extractParameters(query: string, intent: QueryIntent, userRole: UserRole): QueryParameters {
    const parameters: QueryParameters = {
      rawEntities: {},
    };

    switch (intent) {
      case 'client_data':
        parameters.clientNames = this.extractClientNames(query);
        break;
      
      case 'appointments':
        parameters.dateRanges = this.extractDateRanges(query);
        break;
      
      case 'financial':
        parameters.financial = this.extractFinancialParameters(query);
        break;
    }

    return parameters;
  }

  /**
   * Extract client names from query
   */
  private extractClientNames(query: string): string[] {
    const names: string[] = [];

    for (const pattern of this.CLIENT_NAME_PATTERNS) {
      const matches = query.match(pattern);
      if (matches) {
        // Extract the captured group (client name)
        for (let i = 1; i < matches.length; i++) {
          if (matches[i] && !names.includes(matches[i])) {
            names.push(matches[i]);
          }
        }
      }
    }

    return names;
  }

  /**
   * Extract date ranges from query
   */
  private extractDateRanges(query: string): DateRange[] {
    const ranges: DateRange[] = [];
    const now = new Date();

    // Check for relative date patterns
    if (this.DATE_PATTERNS.today.some(pattern => pattern.test(query))) {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      ranges.push({ start: today, end: tomorrow });
    }

    if (this.DATE_PATTERNS.tomorrow.some(pattern => pattern.test(query))) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);
      
      ranges.push({ start: tomorrow, end: dayAfter });
    }

    if (this.DATE_PATTERNS.this_week.some(pattern => pattern.test(query))) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      ranges.push({ start: weekStart, end: weekEnd });
    }

    if (this.DATE_PATTERNS.this_month.some(pattern => pattern.test(query))) {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      ranges.push({ start: monthStart, end: monthEnd });
    }

    // Extract specific dates
    const specificDates = this.extractSpecificDates(query);
    if (specificDates.length > 0) {
      if (specificDates.length === 1) {
        // Single date - create a day range
        const date = specificDates[0];
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        ranges.push({ start, end });
      } else {
        // Multiple dates - create range from first to last
        const sorted = specificDates.sort((a, b) => a.getTime() - b.getTime());
        ranges.push({ 
          start: sorted[0], 
          end: sorted[sorted.length - 1] 
        });
      }
    }

    return ranges;
  }

  /**
   * Extract specific dates from query
   */
  private extractSpecificDates(query: string): Date[] {
    const dates: Date[] = [];

    // DD/MM/YYYY pattern
    const dateMatches = query.matchAll(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/g);
    for (const match of dateMatches) {
      const [, day, month, year] = match;
      const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);
      const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
      
      if (!isNaN(date.getTime())) {
        dates.push(date);
      }
    }

    return dates;
  }

  /**
   * Extract financial parameters from query
   */
  private extractFinancialParameters(query: string): QueryParameters['financial'] {
    const financial: QueryParameters['financial'] = {
      type: 'all',
      period: 'month',
    };

    // Extract financial type
    for (const [type, patterns] of Object.entries(this.FINANCIAL_TYPE_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(query))) {
        financial.type = type as 'revenue' | 'payments' | 'expenses';
        break;
      }
    }

    // Extract period
    if (this.DATE_PATTERNS.today.some(pattern => pattern.test(query))) {
      financial.period = 'today';
    } else if (this.DATE_PATTERNS.this_week.some(pattern => pattern.test(query))) {
      financial.period = 'week';
    } else if (this.DATE_PATTERNS.this_month.some(pattern => pattern.test(query))) {
      financial.period = 'month';
    } else if (query.includes('ano') || query.includes('year')) {
      financial.period = 'year';
    }

    return financial;
  }

  /**
   * Get suggested queries for when intent is unclear
   */
  getSuggestedQueries(userRole: UserRole): string[] {
    const baseSuggestions = [
      "Quais os próximos agendamentos?",
      "Me mostre os clientes cadastrados",
      "Como está o faturamento?",
    ];

    // Add role-specific suggestions
    if (userRole === 'admin') {
      baseSuggestions.push("Resumo financeiro completo");
    } else if (userRole === 'doctor') {
      baseSuggestions.push("Me mostre informações do paciente [nome]");
    } else if (userRole === 'receptionist') {
      baseSuggestions.push("Agendamentos para hoje");
    }

    return baseSuggestions;
  }

  /**
   * Validate extracted parameters
   */
  validateParameters(parameters: QueryParameters, intent: QueryIntent): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    switch (intent) {
      case 'client_data':
        if (parameters.clientNames && parameters.clientNames.length > 5) {
          errors.push('Too many client names specified (max 5)');
        }
        break;
      
      case 'appointments':
        if (parameters.dateRanges && parameters.dateRanges.length > 3) {
          errors.push('Too many date ranges specified (max 3)');
        }
        for (const range of parameters.dateRanges || []) {
          if (range.start > range.end) {
            errors.push('Date range start must be before end');
          }
        }
        break;
      
      case 'financial':
        if (parameters.financial?.type && !['revenue', 'payments', 'expenses', 'all'].includes(parameters.financial.type)) {
          errors.push('Invalid financial type specified');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}