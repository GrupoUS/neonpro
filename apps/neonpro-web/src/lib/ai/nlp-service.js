"use strict";
// 🧠 NLP Service Configuration - Smart Search + NLP Integration
// NeonPro - Serviço de Processamento de Linguagem Natural
// Quality Standard: ≥9.5/10 (BMad Enhanced)
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_NLP_CONFIG = exports.DEFAULT_MEDICAL_TERMS = exports.NLPServiceManager = void 0;
var openai_1 = require("openai");
var search_types_1 = require("@neonpro/types/search-types");
var NLPServiceManager = /** @class */ (function () {
  function NLPServiceManager(config) {
    this.cache = new Map();
    this.config = config;
    this.medicalTerms = new Set(config.medicalTermsDatabase);
    this.initializePatterns();
    if (config.provider === "openai" && config.apiKey) {
      this.openaiClient = new openai_1.OpenAI({ apiKey: config.apiKey });
    }
  }
  NLPServiceManager.prototype.initializePatterns = function () {
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
  };
  /**
   * Process natural language query and extract intent, entities, and context
   */
  NLPServiceManager.prototype.processQuery = function (query, userId, sessionContext) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        cacheKey_1,
        processedQuery,
        language,
        medicalTerms,
        detectedIntent,
        extractedEntities,
        suggestedFilters,
        temporalFilters,
        confidence,
        result,
        error_1;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            startTime = Date.now();
            cacheKey_1 = "nlp:".concat(query, ":").concat(userId);
            if (this.config.cacheEnabled && this.cache.has(cacheKey_1)) {
              return [2 /*return*/, this.cache.get(cacheKey_1)];
            }
            processedQuery = this.normalizeQuery(query);
            language = this.detectLanguage(processedQuery);
            medicalTerms = this.extractMedicalTerms(processedQuery);
            return [4 /*yield*/, this.classifyIntent(processedQuery, sessionContext)];
          case 1:
            detectedIntent = _a.sent();
            return [4 /*yield*/, this.extractEntities(processedQuery, detectedIntent)];
          case 2:
            extractedEntities = _a.sent();
            suggestedFilters = this.generateSearchFilters(
              processedQuery,
              detectedIntent,
              extractedEntities,
            );
            temporalFilters = this.extractTemporalFilters(processedQuery);
            confidence = this.calculateConfidenceScore(
              detectedIntent,
              extractedEntities,
              medicalTerms,
            );
            result = {
              originalQuery: query,
              processedQuery: processedQuery,
              detectedIntent: detectedIntent,
              extractedEntities: extractedEntities,
              suggestedFilters: suggestedFilters,
              confidence: confidence,
              language: language,
              medicalTerms: medicalTerms,
              temporalFilters: temporalFilters,
            };
            // Cache the result
            if (this.config.cacheEnabled) {
              this.cache.set(cacheKey_1, result);
              setTimeout(function () {
                return _this.cache.delete(cacheKey_1);
              }, this.config.cacheTTL * 1000);
            }
            // Log processing time for optimization
            if (this.config.debugMode) {
              console.log("NLP Processing completed in ".concat(Date.now() - startTime, "ms"));
            }
            return [2 /*return*/, result];
          case 3:
            error_1 = _a.sent();
            throw new search_types_1.NLPProcessingError(
              "Failed to process natural language query: ".concat(
                error_1 instanceof Error ? error_1.message : "Unknown error",
              ),
              { query: query, userId: userId, error: error_1 },
            );
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  NLPServiceManager.prototype.normalizeQuery = function (query) {
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, " ") // Keep Portuguese characters
      .replace(/\s+/g, " ")
      .trim();
  };
  NLPServiceManager.prototype.detectLanguage = function (query) {
    var portugueseWords = [
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
    var englishWords = [
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
    var portugueseCount = portugueseWords.filter(function (word) {
      return query.includes(word);
    }).length;
    var englishCount = englishWords.filter(function (word) {
      return query.includes(word);
    }).length;
    return portugueseCount > englishCount ? "pt" : "en";
  };
  NLPServiceManager.prototype.extractMedicalTerms = function (query) {
    var foundTerms = [];
    for (var _i = 0, _a = this.medicalTerms; _i < _a.length; _i++) {
      var term = _a[_i];
      if (query.includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    }
    return foundTerms;
  };
  NLPServiceManager.prototype.classifyIntent = function (query, sessionContext) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, _b, intent, patterns, _c, patterns_1, pattern;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            // First try pattern matching for quick classification
            for (_i = 0, _a = this.intentPatterns; _i < _a.length; _i++) {
              (_b = _a[_i]), (intent = _b[0]), (patterns = _b[1]);
              for (_c = 0, patterns_1 = patterns; _c < patterns_1.length; _c++) {
                pattern = patterns_1[_c];
                if (pattern.test(query)) {
                  return [2 /*return*/, intent];
                }
              }
            }
            if (!(this.openaiClient && this.config.provider === "openai")) return [3 /*break*/, 2];
            return [4 /*yield*/, this.classifyIntentWithAI(query, sessionContext)];
          case 1:
            return [2 /*return*/, _d.sent()];
          case 2:
            return [2 /*return*/, "general_search"];
        }
      });
    });
  };
  NLPServiceManager.prototype.classifyIntentWithAI = function (query, sessionContext) {
    return __awaiter(this, void 0, void 0, function () {
      var prompt_1, response, intent, validIntents, error_2;
      var _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            prompt_1 =
              '\n        Classifique a inten\u00E7\u00E3o de busca para o seguinte query em um sistema de gest\u00E3o de cl\u00EDnica est\u00E9tica:\n        \n        Query: "'.concat(
                query,
                '"\n        \n        Inten\u00E7\u00F5es poss\u00EDveis:\n        - patient_lookup: buscar informa\u00E7\u00F5es de paciente espec\u00EDfico\n        - appointment_search: buscar agendamentos/consultas\n        - medical_record_search: buscar prontu\u00E1rios/hist\u00F3ricos m\u00E9dicos\n        - procedure_search: buscar procedimentos/tratamentos\n        - financial_search: buscar informa\u00E7\u00F5es financeiras/pagamentos\n        - compliance_search: buscar dados de compliance/auditoria\n        - similar_cases: buscar casos similares\n        - treatment_history: buscar hist\u00F3rico de tratamentos\n        - analytics_search: buscar dados estat\u00EDsticos/relat\u00F3rios\n        - general_search: busca geral\n        \n        Responda apenas com a inten\u00E7\u00E3o mais prov\u00E1vel.\n      ',
              );
            return [
              4 /*yield*/,
              this.openaiClient.chat.completions.create({
                model: this.config.model,
                messages: [{ role: "user", content: prompt_1 }],
                max_tokens: 50,
                temperature: 0.1,
              }),
            ];
          case 1:
            response = _d.sent();
            intent =
              (_c =
                (_b =
                  (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) ===
                  null || _b === void 0
                  ? void 0
                  : _b.content) === null || _c === void 0
                ? void 0
                : _c.trim();
            validIntents = [
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
            return [2 /*return*/, validIntents.includes(intent) ? intent : "general_search"];
          case 2:
            error_2 = _d.sent();
            console.warn(
              "AI intent classification failed, falling back to general_search:",
              error_2,
            );
            return [2 /*return*/, "general_search"];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  NLPServiceManager.prototype.extractEntities = function (query, intent) {
    return __awaiter(this, void 0, void 0, function () {
      var entities,
        _i,
        _a,
        _b,
        entityType,
        patterns,
        _c,
        patterns_2,
        pattern,
        matches,
        _d,
        matches_1,
        match;
      return __generator(this, function (_e) {
        entities = [];
        for (_i = 0, _a = this.entityPatterns; _i < _a.length; _i++) {
          (_b = _a[_i]), (entityType = _b[0]), (patterns = _b[1]);
          for (_c = 0, patterns_2 = patterns; _c < patterns_2.length; _c++) {
            pattern = patterns_2[_c];
            matches = query.matchAll(new RegExp(pattern.source, pattern.flags + "g"));
            for (_d = 0, matches_1 = matches; _d < matches_1.length; _d++) {
              match = matches_1[_d];
              if (match[1]) {
                // Captured group exists
                entities.push({
                  type: entityType,
                  value: match[1].trim(),
                  confidence: this.calculateEntityConfidence(entityType, match[1], intent),
                  startPos: match.index || 0,
                  endPos: (match.index || 0) + match[0].length,
                });
              }
            }
          }
        }
        // Remove duplicates and sort by confidence
        return [
          2 /*return*/,
          entities
            .filter(function (entity, index, self) {
              return (
                index ===
                self.findIndex(function (e) {
                  return e.type === entity.type && e.value === entity.value;
                })
              );
            })
            .sort(function (a, b) {
              return b.confidence - a.confidence;
            })
            .slice(0, 10),
        ]; // Limit to top 10 entities
      });
    });
  };
  NLPServiceManager.prototype.calculateEntityConfidence = function (entityType, value, intent) {
    var _a;
    var confidence = 0.5; // Base confidence
    // Boost confidence based on intent-entity relevance
    var intentEntityMap = {
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
    if (
      (_a = intentEntityMap[intent]) === null || _a === void 0 ? void 0 : _a.includes(entityType)
    ) {
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
  };
  NLPServiceManager.prototype.generateSearchFilters = function (query, intent, entities) {
    var _this = this;
    var filters = [];
    // Add entity-based filters
    entities.forEach(function (entity) {
      if (entity.confidence > 0.6) {
        filters.push({
          field: _this.getFieldForEntityType(entity.type),
          operator: "contains",
          value: entity.value,
          label: "".concat(entity.type, ": ").concat(entity.value),
          category: _this.getCategoryForEntityType(entity.type),
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
  };
  NLPServiceManager.prototype.extractTemporalFilters = function (query) {
    var temporalPatterns = [
      { pattern: /hoje|today/i, days: 0 },
      { pattern: /ontem|yesterday/i, days: -1 },
      { pattern: /semana passada|last week/i, days: -7 },
      { pattern: /mês passado|last month/i, days: -30 },
      { pattern: /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g, type: "date" },
      { pattern: /últimos?\s+(\d+)\s+dias?/i, type: "days" },
      { pattern: /próximos?\s+(\d+)\s+dias?/i, type: "future_days" },
    ];
    var now = new Date();
    var startDate;
    var endDate;
    var period;
    for (var _i = 0, temporalPatterns_1 = temporalPatterns; _i < temporalPatterns_1.length; _i++) {
      var _a = temporalPatterns_1[_i],
        pattern = _a.pattern,
        days = _a.days,
        type = _a.type;
      var match = query.match(pattern);
      if (match) {
        if (typeof days === "number") {
          startDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
          endDate = now;
          period = match[0];
        } else if (type === "date") {
          // Handle date format dd/mm/yyyy
          var day = match[1],
            month = match[2],
            year = match[3];
          startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          period = match[0];
        } else if (type === "days") {
          var daysCount = parseInt(match[1]);
          startDate = new Date(now.getTime() - daysCount * 24 * 60 * 60 * 1000);
          endDate = now;
          period = "\u00FAltimos ".concat(daysCount, " dias");
        } else if (type === "future_days") {
          var daysCount = parseInt(match[1]);
          startDate = now;
          endDate = new Date(now.getTime() + daysCount * 24 * 60 * 60 * 1000);
          period = "pr\u00F3ximos ".concat(daysCount, " dias");
        }
        break;
      }
    }
    if (startDate || endDate || period) {
      return { startDate: startDate, endDate: endDate, period: period };
    }
    return undefined;
  };
  NLPServiceManager.prototype.calculateConfidenceScore = function (intent, entities, medicalTerms) {
    var confidence = 0.3; // Base confidence
    // Boost for specific intent (not general_search)
    if (intent !== "general_search") {
      confidence += 0.4;
    }
    // Boost for extracted entities
    if (entities.length > 0) {
      var avgEntityConfidence =
        entities.reduce(function (sum, e) {
          return sum + e.confidence;
        }, 0) / entities.length;
      confidence += avgEntityConfidence * 0.3;
    }
    // Boost for medical terms
    if (medicalTerms.length > 0) {
      confidence += Math.min(medicalTerms.length * 0.1, 0.2);
    }
    return Math.min(confidence, 1.0);
  };
  NLPServiceManager.prototype.getFieldForEntityType = function (entityType) {
    var fieldMap = {
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
  };
  NLPServiceManager.prototype.getCategoryForEntityType = function (entityType) {
    var categoryMap = {
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
  };
  NLPServiceManager.prototype.updateMedicalTerms = function (newTerms) {
    var _this = this;
    newTerms.forEach(function (term) {
      return _this.medicalTerms.add(term.toLowerCase());
    });
  };
  NLPServiceManager.prototype.getStatistics = function () {
    return {
      cacheSize: this.cache.size,
      medicalTermsCount: this.medicalTerms.size,
      intentPatternsCount: this.intentPatterns.size,
      entityPatternsCount: this.entityPatterns.size,
      config: this.config,
    };
  };
  return NLPServiceManager;
})();
exports.NLPServiceManager = NLPServiceManager;
// Default medical terms database for Brazilian aesthetic clinics
exports.DEFAULT_MEDICAL_TERMS = [
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
exports.DEFAULT_NLP_CONFIG = {
  provider: "openai",
  model: "gpt-3.5-turbo",
  maxTokens: 150,
  temperature: 0.1,
  timeout: 5000,
  retryAttempts: 2,
  cacheEnabled: true,
  cacheTTL: 300,
  debugMode: false,
  medicalTermsDatabase: exports.DEFAULT_MEDICAL_TERMS,
  portugueseSupport: true,
};
