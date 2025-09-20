/**
 * Intent Parser Service
 * Analyzes user queries to determine intent and extract entities
 */

import {
  QueryIntent,
  UserQuery,
  ValidUserQuery,
  IntentParsingError,
  safeValidate,
  UserQuerySchema,
} from "@neonpro/web/types";

// Keywords and patterns for intent classification
const INTENT_PATTERNS = {
  [QueryIntent.CLIENT_SEARCH]: [
    /buscar\s+(cliente|paciente)/i,
    /procurar\s+(cliente|paciente)/i,
    /encontrar\s+(cliente|paciente)/i,
    /quem\s+é\s+(o|a)?\s*(cliente|paciente)/i,
    /(cliente|paciente)\s+com\s+nome/i,
    /dados\s+do\s+(cliente|paciente)/i,
    /informações\s+do\s+(cliente|paciente)/i,
  ],
  [QueryIntent.APPOINTMENT_QUERY]: [
    /agendamentos?\s*(de|para)?/i,
    /consultas?\s*(de|para)?/i,
    /(pr[oó]ximos?|futuros?)\s*(agendamentos?|consultas?)/i,
    /agendamentos?\s+(do|da)\s+(dia|semana|m[eê]s)/i,
    /hoje\s+(tem|temos)/i,
    /amanhã\s+(tem|temos)/i,
    /quais?\s+(agendamentos?|consultas?)\s+(do|da)\s+(dia|semana)/i,
    /hor[áa]rios?\s+(marcados|agendados)/i,
    /hist[óo]rico\s+de\s+(agendamentos?|consultas?)/i,
    /[uú]ltimas?\s+(consultas?|agendamentos?)/i,
  ],
  [QueryIntent.FINANCIAL_QUERY]: [
    /resumo\s+financeiro/i,
    /extrato\s+financeiro/i,
    /faturamento/i,
    /pagamentos?\s+(recebidos|pendentes)/i,
    /valores?\s+(a\s+receber|recebidos)/i,
    /saldo/i,
    /financeiro\s+(do|da)\s+(cliente|paciente)/i,
    /contas?\s+(a\s+receber|pagas)/i,
    /situação\s+financeira/i,
  ],
  [QueryIntent.APPOINTMENT_CREATION]: [
    /agendar\s+(uma\s+)?(consulta|retorno)/i,
    /marcar\s+(uma\s+)?(consulta|retorno)/i,
    /novo\s+agendamento/i,
    /criar\s+(uma\s+)?(consulta|agendamento)/i,
    /quero\s+agendar/i,
    /gostaria\s+de\s+agendar/i,
    /marcar\s+(para|com)/i,
  ],
};

// Date extraction patterns
const DATE_PATTERNS = [
  // Relative dates
  {
    pattern: /hoje/i,
    type: "relative",
    getDate: () => new Date(),
  },
  {
    pattern: /amanh[ãa]/i,
    type: "relative",
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    },
  },
  {
    pattern: /depois\s+de\s+amanh[ãa]/i,
    type: "relative",
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      return date;
    },
  },
  {
    pattern: /ontem/i,
    type: "relative",
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    },
  },
  {
    pattern: /pr[oó]xima\s+semana/i,
    type: "relative",
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
  },
  {
    pattern: /pr[oó]ximo\s+m[êe]s/i,
    type: "relative",
    getDate: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    },
  },
  // Week days
  {
    pattern: /(segunda|terç|quart|quint|sexta|s[áa]bado|domingo)/i,
    type: "relative",
    getDate: (match: string) => {
      const days = [
        "domingo",
        "segunda",
        "terça",
        "quarta",
        "quinta",
        "sexta",
        "sábado",
      ];
      const targetDay = days.findIndex((day) =>
        match.toLowerCase().includes(day),
      );
      if (targetDay === -1) return null;

      const date = new Date();
      const currentDay = date.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7;
      date.setDate(date.getDate() + daysUntilTarget);
      return date;
    },
  },
  // Absolute dates (Brazilian format)
  {
    pattern: /(\d{2})[/-](\d{2})[/-](\d{4})/i,
    type: "absolute",
    getDate: (_, d: string, m: string, y: string) => {
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    },
  },
  {
    pattern:
      /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i,
    type: "absolute",
    getDate: (_, d: string, m: string, y: string) => {
      const months = {
        janeiro: 0,
        fevereiro: 1,
        março: 2,
        abril: 3,
        maio: 4,
        junho: 5,
        julho: 6,
        agosto: 7,
        setembro: 8,
        outubro: 9,
        novembro: 10,
        dezembro: 11,
      };
      return new Date(parseInt(y), months[m.toLowerCase()], parseInt(d));
    },
  },
];

// Service keywords
const SERVICE_KEYWORDS = [
  "consulta",
  "retorno",
  "exame",
  "procedimento",
  "avaliação",
  "acompanhamento",
  "cirurgia",
  "triagem",
  "urgência",
  "emergência",
];

export class IntentParser {
  private contextCache: Map<string, any> = new Map();

  /**
   * Parse user query to determine intent and extract entities
   */
  async parseQuery(
    text: string,
    context?: {
      userId?: string;
      userRole?: string;
      domain?: string;
      session?: string;
    },
  ): Promise<ValidUserQuery> {
    try {
      // Clean and normalize text
      const cleanedText = text.trim().toLowerCase();

      // Determine intent
      const intent = this.detectIntent(cleanedText);

      // Extract entities
      const entities = await this.extractEntities(cleanedText, intent);

      // Create user query object
      const userQuery: UserQuery = {
        id: this.generateId(),
        text,
        intent,
        entities,
        context: context
          ? {
              userId: context.userId || "",
              userRole: context.userRole || "",
              domain: context.domain,
              session: context.session,
            }
          : undefined,
        timestamp: new Date().toISOString(),
      };

      // Validate and return
      const result = safeValidate(UserQuerySchema, userQuery);
      if (!result.success) {
        throw new IntentParsingError(
          `Invalid query structure: ${result.error.message}`,
          text,
        );
      }

      return result.data;
    } catch (error) {
      if (error instanceof IntentParsingError) {
        throw error;
      }
      throw new IntentParsingError(`Failed to parse query: ${error}`, text);
    }
  }

  /**
   * Detect query intent based on patterns
   */
  private detectIntent(text: string): QueryIntent {
    // Check each intent pattern
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return intent as QueryIntent;
        }
      }
    }

    // Special case: if the query mentions money/financial terms
    if (/(r\$|reais|valor|pago|pagar|fatura|boleto)/i.test(text)) {
      return QueryIntent.FINANCIAL_QUERY;
    }

    // Default to client search if name-like patterns are found
    if (this.looksLikeName(text)) {
      return QueryIntent.CLIENT_SEARCH;
    }

    return QueryIntent.GENERAL_INQUIRY;
  }

  /**
   * Extract entities from query text
   */
  private async extractEntities(
    text: string,
    intent: QueryIntent,
  ): Promise<UserQuery["entities"]> {
    const entities: UserQuery["entities"] = {};

    // Extract client names
    entities.clients = this.extractNames(text);

    // Extract dates
    entities.dates = this.extractDates(text);

    // Extract services based on intent
    if (
      intent === QueryIntent.APPOINTMENT_QUERY ||
      intent === QueryIntent.APPOINTMENT_CREATION
    ) {
      entities.services = this.extractServices(text);
    }

    // Extract professionals
    entities.professionals = this.extractProfessionals(text);

    return entities;
  }

  /**
   * Extract potential client names from text
   */
  private extractNames(
    text: string,
  ): Array<{ name: string; confidence: number }> {
    const names: Array<{ name: string; confidence: number }> = [];

    // Look for name patterns (capitalized words)
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    let match;

    while ((match = namePattern.exec(text)) !== null) {
      const name = match[1];

      // Filter out common words that aren't names
      const commonWords = [
        "O",
        "A",
        "Os",
        "As",
        "Do",
        "Da",
        "Dos",
        "Das",
        "De",
        "E",
      ];
      if (!commonWords.includes(name.toUpperCase()) && name.length > 2) {
        names.push({
          name,
          confidence: Math.min(0.9, 0.3 + name.length * 0.1),
        });
      }
    }

    // Look for "cliente/paciente X" patterns
    const clientPattern =
      /(cliente|paciente)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
    while ((match = clientPattern.exec(text)) !== null) {
      const name = match[2];
      if (!names.find((n) => n.name === name)) {
        names.push({
          name,
          confidence: 0.95,
        });
      }
    }

    return names;
  }

  /**
   * Extract dates from text
   */
  private extractDates(text: string): Array<{
    date: string;
    type: "absolute" | "relative";
    confidence: number;
  }> {
    const dates: Array<{
      date: string;
      type: "absolute" | "relative";
      confidence: number;
    }> = [];

    for (const patternInfo of DATE_PATTERNS) {
      const match = text.match(patternInfo.pattern);
      if (match) {
        try {
          const date = patternInfo.getDate(match[0], ...match.slice(1));
          if (date && !isNaN(date.getTime())) {
            dates.push({
              date: date.toISOString(),
              type: patternInfo.type,
              confidence: 0.9,
            });
          }
        } catch (error) {
          console.warn(`Failed to parse date from "${match[0]}":`, error);
        }
      }
    }

    return dates;
  }

  /**
   * Extract service types from text
   */
  private extractServices(
    text: string,
  ): Array<{ name: string; confidence: number }> {
    const services: Array<{ name: string; confidence: number }> = [];

    for (const keyword of SERVICE_KEYWORDS) {
      if (text.includes(keyword)) {
        services.push({
          name: keyword,
          confidence: 0.8,
        });
      }
    }

    return services;
  }

  /**
   * Extract professional names from text
   */
  private extractProfessionals(
    text: string,
  ): Array<{ name: string; confidence: number }> {
    const professionals: Array<{ name: string; confidence: number }> = [];

    // Look for "dr/dra" patterns
    const doctorPattern =
      /(dr\.?|dra\.?|doutor|doutora)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
    let match;

    while ((match = doctorPattern.exec(text)) !== null) {
      const name = match[2];
      professionals.push({
        name,
        confidence: 0.95,
      });
    }

    return professionals;
  }

  /**
   * Check if text looks like a name search
   */
  private looksLikeName(text: string): boolean {
    // Count capitalized words (potential names)
    const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g) || [];

    // If there are 2-3 capitalized words, it's likely a name
    if (capitalizedWords.length >= 2 && capitalizedWords.length <= 3) {
      return true;
    }

    // Check for common name search patterns
    const nameSearchPatterns = [
      /buscar\s+[A-Z]/i,
      /procurar\s+[A-Z]/i,
      /[A-Z][a-z]+\s+[A-Z][a-z]+/, // Two capitalized words
    ];

    return nameSearchPatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Generate unique ID for query
   */
  private generateId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update context cache for better entity recognition
   */
  updateContext(sessionId: string, context: any): void {
    this.contextCache.set(sessionId, {
      ...this.contextCache.get(sessionId),
      ...context,
      timestamp: Date.now(),
    });
  }

  /**
   * Get context from cache
   */
  getContext(sessionId: string): any {
    const context = this.contextCache.get(sessionId);
    if (!context) return null;

    // Clear old contexts (older than 30 minutes)
    if (Date.now() - context.timestamp > 1800000) {
      this.contextCache.delete(sessionId);
      return null;
    }

    return context;
  }

  /**
   * Clear expired contexts
   */
  clearExpiredContexts(): void {
    const now = Date.now();
    for (const [sessionId, context] of this.contextCache.entries()) {
      if (now - context.timestamp > 1800000) {
        this.contextCache.delete(sessionId);
      }
    }
  }
}

// Export singleton instance
export const intentParser = new IntentParser();
