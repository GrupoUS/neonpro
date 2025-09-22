/**
 * CRUD Intent Parser + Argument Extraction (T019)
 * Natural language parsing for CRUD operations with intelligent argument extraction
 * Supports Portuguese and English with entity recognition and filtering
 */

export type CrudIntent = "CREATE" | "READ" | "UPDATE" | "DELETE" | "UNKNOWN";

export interface EntityArgument {
  type:
    | "PERSON"
    | "EMAIL"
    | "PHONE"
    | "DATE"
    | "ENTITY_TYPE"
    | "FIELD"
    | "VALUE"
    | "CLINIC"
    | "PROCEDURE"
    | "APPOINTMENT";
  value: string;
  position: [number, number]; // start, end indices in original text
  confidence: number;
}

export interface FilterArgument {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "between"
    | "like"
    | "in"
    | "not_in";
  value: string | number | [string | number, string | number]; // array for between operator
  confidence: number;
}

export interface SortArgument {
  field: string;
  direction: "asc" | "desc";
  confidence: number;
}

export interface LimitArgument {
  count: number;
  offset?: number;
  confidence: number;
}

export interface ParsedArguments {
  filters: FilterArgument[];
  sort?: SortArgument;
  limit?: LimitArgument;
}

export interface ParsedIntent {
  intent: CrudIntent;
  confidence: number;
  entities: EntityArgument[];
  arguments: ParsedArguments;
  originalText: string;
  normalizedText: string;
}

export interface CrudIntentParserConfig {
  confidenceThreshold?: number;
  supportedLanguages?: ("en" | "pt")[];
  customEntityTypes?: string[];
  maxTextLength?: number;
}

export class CrudIntentParser {
  private config: Required<CrudIntentParserConfig>;

  // Intent detection patterns
  private intentPatterns = {
    CREATE: {
      en: ["create", "add", "insert", "make", "new", "register"],
      pt: [
        "criar",
        "adicionar",
        "inserir",
        "fazer",
        "novo",
        "nova",
        "registrar",
        "cadastrar",
      ],
    },
    READ: {
      en: [
        "get",
        "find",
        "show",
        "list",
        "retrieve",
        "search",
        "select",
        "fetch",
        "display",
      ],
      pt: [
        "buscar",
        "encontrar",
        "mostrar",
        "listar",
        "recuperar",
        "pesquisar",
        "selecionar",
        "exibir",
        "ver",
      ],
    },
    UPDATE: {
      en: ["update", "modify", "change", "edit", "alter", "set"],
      pt: ["atualizar", "modificar", "alterar", "editar", "mudar", "definir"],
    },
    DELETE: {
      en: ["delete", "remove", "drop", "cancel", "destroy", "eliminate"],
      pt: [
        "deletar",
        "remover",
        "excluir",
        "cancelar",
        "destruir",
        "eliminar",
        "apagar",
      ],
    },
  };

  // Entity patterns
  private entityPatterns = {
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    PHONE: /\+?[\d\s\-\(\)]{10,}/g,
    DATE: /\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|today|tomorrow|yesterday|ontem|hoje|amanhã|2024-\d{2}-\d{2}|last\s+week|next\s+week|semana\s+passada|próxima\s+semana)\b/gi,
    PERSON: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
    ENTITY_TYPE:
      /\b(patient|patients|user|users|clinic|clinics|appointment|appointments|doctor|doctors|paciente|pacientes|usuario|usuarios|clinica|clinicas|agendamento|agendamentos|medico|medicos|consulta|consultas)\b/gi,
    FIELD:
      /\b(status|age|email|name|id|created_at|updated_at|phone|address|nome|idade|telefone|endereco|created|updated)\b/gi,
    VALUE:
      /(?:=|equals?|is)\s*['""]?([^'""]+)['""]?|(?:status\s*=\s*|age\s*=\s*|name\s*=\s*)([^\s]+)/gi,
    PROCEDURE:
      /\b(botox|filler|laser|peeling|facial|limpeza|hidratação|rejuvenescimento)\b/gi,
    CLINIC: /\b(clinic|clinica|centro|spa|consultorio)\b/gi,
    APPOINTMENT: /\b(appointment|agendamento|consulta|sessão|session)\b/gi,
  };

  constructor(config: CrudIntentParserConfig = {}) {
    this.config = {
      confidenceThreshold: config.confidenceThreshold ?? 0.7,
      supportedLanguages: config.supportedLanguages ?? ["en", "pt"],
      customEntityTypes: config.customEntityTypes ?? [],
      maxTextLength: config.maxTextLength ?? 1000,
    };

    // Add custom entity types to patterns
    if (this.config.customEntityTypes.length > 0) {
      const customPattern = new RegExp(
        `\\b(${this.config.customEntityTypes.join("|")})\\b`,
        "gi",
      );
      this.entityPatterns.ENTITY_TYPE = customPattern;
    }
  }

  parseIntent(input: string): ParsedIntent {
    if (!input || input.trim().length === 0) {
      return this.createEmptyResult(input);
    }

    // Truncate if too long
    const text =
      input.length > this.config.maxTextLength
        ? input.substring(0, this.config.maxTextLength)
        : input;

    const normalizedText = this.normalizeText(text);

    // 1. Detect intent
    const intent = this.detectIntent(normalizedText);

    // 2. Extract entities
    const entities = this.extractEntities(text);

    // 3. Extract arguments (filters, sort, limit)
    const args = this.extractArguments(normalizedText);

    return {
      intent: intent.type,
      confidence: intent.confidence,
      entities,
      arguments: args,
      originalText: input,
      normalizedText,
    };
  }

  private createEmptyResult(input: string): ParsedIntent {
    return {
      intent: "UNKNOWN",
      confidence: 0,
      entities: [],
      arguments: { filters: [] },
      originalText: input,
      normalizedText: "",
    };
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s@.\-+]/g, " ") // Keep alphanumeric, spaces, email chars
      .replace(/\s+/g, " ");
  }

  private detectIntent(normalizedText: string): {
    type: CrudIntent;
    confidence: number;
  } {
    const words = normalizedText.split(/\s+/);
    let bestMatch: { type: CrudIntent; confidence: number } = {
      type: "UNKNOWN",
      confidence: 0,
    };

    // Check for uncertainty words that reduce confidence
    const uncertaintyWords = [
      "maybe",
      "perhaps",
      "possibly",
      "might",
      "could",
      "talvez",
      "possivelmente",
      "poderia",
    ];
    const hasUncertainty = uncertaintyWords.some((word) =>
      normalizedText.includes(word),
    );

    for (const [intentType, patterns] of Object.entries(this.intentPatterns)) {
      let maxConfidence = 0;

      for (const lang of this.config.supportedLanguages) {
        const langPatterns = patterns[lang] || [];

        for (const pattern of langPatterns) {
          // Direct word match (highest confidence) - but require exact match, not substring
          if (words.includes(pattern)) {
            maxConfidence = Math.max(maxConfidence, 0.95);
            continue;
          }

          // Only do partial matching for longer patterns (3+ chars) to avoid false positives
          if (pattern.length >= 3) {
            // Partial word match (medium confidence)
            const partialMatches = words.filter((word) =>
                word.length >= 3 &&
                (word.includes(pattern) || pattern.includes(word)),
            );
            if (partialMatches.length > 0) {
              maxConfidence = Math.max(maxConfidence, 0.6); // Reduced confidence
              continue;
            }

            // Start of word match (lower confidence)
            const startMatches = words.filter((word) =>
                word.length >= 3 &&
                (word.startsWith(pattern) || pattern.startsWith(word)),
            );
            if (startMatches.length > 0) {
              maxConfidence = Math.max(maxConfidence, 0.5); // Reduced confidence
            }
          }
        }
      }

      // Boost confidence for SQL-like patterns - but only if we already have some confidence
      if (maxConfidence > 0.3) {
        if (
          intentType === "READ" &&
          (normalizedText.includes("where") ||
            normalizedText.includes("select"))
        ) {
          maxConfidence = Math.max(maxConfidence, 0.85);
        }
        if (intentType === "UPDATE" && normalizedText.includes("set")) {
          maxConfidence = Math.max(maxConfidence, 0.85);
        }
        if (intentType === "DELETE" && normalizedText.includes("from")) {
          maxConfidence = Math.max(maxConfidence, 0.85);
        }
        if (
          intentType === "CREATE" &&
          (normalizedText.includes("into") || normalizedText.includes("values"))
        ) {
          maxConfidence = Math.max(maxConfidence, 0.85);
        }
      }

      if (maxConfidence > bestMatch.confidence) {
        bestMatch = {
          type: intentType as CrudIntent,
          confidence: maxConfidence,
        };
      }
    }

    // Apply uncertainty penalty
    if (hasUncertainty && bestMatch.confidence > 0) {
      bestMatch.confidence = Math.max(bestMatch.confidence * 0.7, 0.3); // Reduce confidence significantly
    }

    // If confidence is below threshold, return UNKNOWN
    if (bestMatch.confidence < this.config.confidenceThreshold) {
      return { type: "UNKNOWN", confidence: bestMatch.confidence };
    }

    return bestMatch;
  }

  private extractEntities(text: string): EntityArgument[] {
    const entities: EntityArgument[] = [];

    // Extract entities using patterns (including custom entity types)
    for (const [entityType, pattern] of Object.entries(this.entityPatterns)) {
      const matches = [...text.matchAll(pattern)];

      for (const match of matches) {
        if (match.index !== undefined) {
          entities.push({
            type: entityType as EntityArgument["type"],
            value: match[0].trim(),
            position: [match.index, match.index + match[0].length],
            confidence: 0.9,
          });
        }
      }
    }

    // Add VALUE entities from filter patterns and common values
    const valuePatterns = [
      // Quoted strings
      /['"]([^'"]+)['"]/g,
      // Numbers (including decimals)
      /\b(\d+(?:\.\d+)?)\b/g,
      // Common status values after equals/is
      /(?:equals?|is|=)\s+(\w+)(?:\s|$)/gi,
      // Values after field names in WHERE clauses
      /where\s+\w+\s+(?:equals?|is|=|!=|<>|>|<)\s+(\w+)/gi,
    ];

    for (const pattern of valuePatterns) {
      const matches = [...text.matchAll(pattern)];

      for (const match of matches) {
        if (match.index !== undefined && match[1]) {
          const value = match[1].trim();

          // Skip if this is already captured as another entity type
          const existingEntity = entities.find((e) =>
              e.value.toLowerCase() === value.toLowerCase() &&
              e.type !== "VALUE",
          );

          if (!existingEntity) {
            entities.push({
              type: "VALUE",
              value: value,
              position: [match.index, match.index + match[0].length],
              confidence: 0.8,
            });
          }
        }
      }
    }

    // Check for custom entity types if provided
    if (this.config.customEntityTypes) {
      for (const customType of this.config.customEntityTypes) {
        // Create a pattern to match the custom entity type names
        const customPattern = new RegExp(
          `\\b(${customType.toLowerCase()}s?|${customType.toLowerCase()})\\b`,
          "gi",
        );
        const matches = [...text.matchAll(customPattern)];

        for (const match of matches) {
          if (match.index !== undefined) {
            entities.push({
              type: customType as EntityArgument["type"],
              value: match[0].trim(),
              position: [match.index, match.index + match[0].length],
              confidence: 0.85,
            });
          }
        }
      }
    }

    // Custom logic for table/entity detection
    // Look for common table names after action words
    const tablePattern =
      /(?:show|find|get|list|select|from|update|delete|create|insert\s+into|ver|mostrar|buscar|listar)\s+(\w+)/gi;
    const tableMatches = [...text.matchAll(tablePattern)];

    for (const match of tableMatches) {
      if (match.index !== undefined) {
        const tableName = match[1];
        // Skip common words that aren't table names
        if (
          ![
            "with",
            "where",
            "by",
            "from",
            "into",
            "set",
            "com",
            "onde",
            "por",
          ].includes(tableName.toLowerCase())
        ) {
          entities.push({
            type: "FIELD",
            value: match[1],
            position: [match.index, match.index + match[1].length],
            confidence: 0.85,
          });
        }
      }
    }

    // Look for field names in conditions (field = value, field equals value, etc.)
    const fieldPattern =
      /(\w+)\s+(?:=|equals?|is|!=|<>|>|<|like|contains|contém|é|não\s+é)\s+/gi;
    const fieldMatches = [...text.matchAll(fieldPattern)];

    for (const match of fieldMatches) {
      if (match.index !== undefined) {
        const fieldName = match[1];
        // Check if this field is already captured to avoid duplicates
        const existingField = entities.find((e) =>
            e.type === "FIELD" &&
            e.value.toLowerCase() === fieldName.toLowerCase(),
        );
        if (!existingField) {
          entities.push({
            type: "FIELD",
            value: fieldName,
            position: [match.index, match.index + fieldName.length],
            confidence: 0.8,
          });
        }
      }
    }

    return entities.sort((a,_b) => a.position[0] - b.position[0]);
  }

  private extractArguments(normalizedText: string): ParsedArguments {
    const args: ParsedArguments = { filters: [] };

    // Extract filters from WHERE clauses
    args.filters = this.extractFilters(normalizedText);

    // Extract sort from ORDER BY clauses
    args.sort = this.extractSort(normalizedText);

    // Extract limit/pagination
    args.limit = this.extractLimit(normalizedText);

    return args;
  }

  private extractFilters(text: string): FilterArgument[] {
    const filters: FilterArgument[] = [];
    const usedPositions = new Set<number>();

    // Comprehensive pattern for "field operator value"
    const filterPattern =
      /\b(\w+)\s+(equals?|is|=|!=|<>|>|<|>=|<=|greater\s+than|less\s+than|like|between|in|not\s+in|não\s+é|maior\s+que|menor\s+que|entre)\s+(['"]?[\w@.\-+]+['"]?|\d+(?:\.\d+)?)/gi;

    let match;
    while ((match = filterPattern.exec(text)) !== null) {
      // Skip if this position was already used
      if (usedPositions.has(match.index)) continue;

      const field = match[1];
      const operatorText = match[2].toLowerCase().trim();
      const value = match[3].replace(/['"]/g, "");

      const operator = this.mapOperator(operatorText);

      filters.push({
        field,
        operator,
        value, // Keep as string for consistency with test expectations
        confidence: 0.8,
      });

      // Mark this position as used
      usedPositions.add(match.index);
    }

    // Pattern for implicit status filters like "active patients", "deleted users"
    const statusPattern =
      /\b(active|inactive|deleted|archived|published|draft|pending|completed|failed|success|enabled|disabled)\s+(patients|users|appointments|records|items)/gi;
    let statusMatch;
    while ((statusMatch = statusPattern.exec(text)) !== null) {
      // Skip if this position was already used
      if (usedPositions.has(statusMatch.index)) continue;

      const status = statusMatch[1];

      filters.push({
        field: "status",
        operator: "equals",
        value: status,
        confidence: 0.7,
      });

      // Mark this position as used
      usedPositions.add(statusMatch.index);
    }

    return filters.filter((filter,index,_self) =>
        // Remove duplicates based on field and value
        index ===
        self.findIndex((f) => f.field === filter.field && f.value === filter.value,
        ),
    );
  }

  private extractSort(text: string): SortArgument | undefined {
    // Pattern for "ordered by field direction" or "sort by field direction"
    const sortPattern =
      /(?:ordered?\s+by|sort\s+by)\s+(\w+)(?:\s+(asc|desc|ascending|descending))?/gi;
    const match = sortPattern.exec(text);

    if (match) {
      const field = match[1];
      const directionText = match[2] || "asc";
      const direction = directionText.toLowerCase().startsWith("desc")
        ? "desc"
        : "asc";

      return {
        field,
        direction,
        confidence: 0.9,
      };
    }

    return undefined;
  }

  private extractLimit(text: string): LimitArgument | undefined {
    // Pattern for "limit N", "first N", "top N", "show N", "N per page", "N maximum"
    const limitPatterns = [
      /(?:limit|first|top|show)\s+(\d+)/gi,
      /(\d+)\s+(?:per\s+page|maximum|max)/gi,
      /list\s+(\d+)/gi, // for "list N" patterns
    ];

    for (const pattern of limitPatterns) {
      const match = pattern.exec(text);
      if (match) {
        const count = parseInt(match[1], 10);

        // Check for pagination (page N)
        const pagePattern = /page\s+(\d+)/gi;
        const pageMatch = pagePattern.exec(text);
        const page = pageMatch ? parseInt(pageMatch[1], 10) : 1;
        const offset = page > 1 ? (page - 1) * count : 0;

        return {
          count,
          offset: offset > 0 ? offset : undefined,
          confidence: 0.9,
        };
      }
    }

    return undefined;
  }

  private mapOperator(operatorText: string): FilterArgument["operator"] {
    const text = operatorText.toLowerCase().trim();

    if (/^(equals?|is|=|==)$/.test(text)) return "equals";
    if (/^(not\s+equals?|!=|<>|não\s+é|diferente)$/.test(text))
      return "not_equals";
    if (/^(greater\s+than|>|maior\s+que)$/.test(text)) return "greater_than";
    if (/^(less\s+than|<|menor\s+que)$/.test(text)) return "less_than";
    if (/^(between|entre)$/.test(text)) return "between";
    if (/^(like|contains|contém)$/.test(text)) return "like";
    if (/^(in|dentro\s+de)$/.test(text)) return "in";
    if (/^(not\s+in|fora\s+de)$/.test(text)) return "not_in";

    return "equals"; // default fallback
  }
}

/**
 * Factory function to create a new CRUD Intent Parser instance
 */
export function createCrudIntentParser(
  config: CrudIntentParserConfig = {},
): CrudIntentParser {
  return new CrudIntentParser(config);
}

/**
 * Default parser instance for convenience
 */
export const defaultCrudIntentParser = createCrudIntentParser();
