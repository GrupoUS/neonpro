"use strict";
// NeonProAIChatEngine - Core AI Chat Processing Engine
// Implementation of Story 4.1: Universal AI Chat Assistant
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.NeonProAIChatEngine = void 0;
exports.createNeonProAIChatEngine = createNeonProAIChatEngine;
var server_1 = require("@/lib/supabase/server");
var openai_1 = require("openai");
// Initialize OpenAI client
var openai = new openai_1.default({
  apiKey: process.env.OPENAI_API_KEY || "",
});
/**
 * NeonProAIChatEngine - Core AI Chat Processing Engine
 * Integrates OpenAI GPT-4 with NeonPro clinic data for intelligent assistance
 */
var NeonProAIChatEngine = /** @class */ (function () {
  function NeonProAIChatEngine(supabaseClient) {
    this.supabase = supabaseClient;
  }
  /**
   * Main chat processing method
   * Epic 4 - Story 4.1: Universal AI Chat Assistant
   */
  NeonProAIChatEngine.prototype.processChat = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var securityCheck, classification, enrichedContext, response, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            console.log("[NeonProAI] Processing chat request:", request.query);
            return [4 /*yield*/, this.validateSecurity(request)];
          case 1:
            securityCheck = _a.sent();
            if (!securityCheck.isValid) {
              throw new Error("Security validation failed: ".concat(securityCheck.reason));
            }
            return [4 /*yield*/, this.classifyQuery(request.query, request.context)];
          case 2:
            classification = _a.sent();
            return [4 /*yield*/, this.enrichContext(classification, request.context)];
          case 3:
            enrichedContext = _a.sent();
            return [
              4 /*yield*/,
              this.generateResponse(request.query, enrichedContext, classification),
            ];
          case 4:
            response = _a.sent();
            console.log("[NeonProAI] Chat processed successfully");
            return [2 /*return*/, response];
          case 5:
            error_1 = _a.sent();
            console.error("[NeonProAI] Error processing chat:", error_1);
            return [2 /*return*/, this.createErrorResponse(error_1)];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Security validation for AI requests
   * Ensures LGPD compliance and proper authorization
   */
  NeonProAIChatEngine.prototype.validateSecurity = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var hasPermission, lgpdCompliant, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Validate user session
            if (!request.sessionId) {
              return [2 /*return*/, { isValid: false, reason: "Missing session ID" }];
            }
            return [4 /*yield*/, this.checkUserPermissions(request.sessionId, request.clinicId)];
          case 1:
            hasPermission = _a.sent();
            if (!hasPermission) {
              return [2 /*return*/, { isValid: false, reason: "Insufficient permissions" }];
            }
            lgpdCompliant = this.validateLGPDCompliance(request.query);
            if (!lgpdCompliant) {
              return [
                2 /*return*/,
                { isValid: false, reason: "LGPD compliance violation detected" },
              ];
            }
            return [2 /*return*/, { isValid: true, reason: "Security validation passed" }];
          case 2:
            error_2 = _a.sent();
            return [
              2 /*return*/,
              { isValid: false, reason: "Security validation error: ".concat(error_2) },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Classify user query to determine appropriate response strategy
   */
  NeonProAIChatEngine.prototype.classifyQuery = function (message, context) {
    return __awaiter(this, void 0, void 0, function () {
      var classificationPrompt, completion, result, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            classificationPrompt = this.buildClassificationPrompt(message, context);
            return [
              4 /*yield*/,
              openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                  { role: "system", content: classificationPrompt },
                  { role: "user", content: message },
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
              }),
            ];
          case 1:
            completion = _a.sent();
            result = JSON.parse(completion.choices[0].message.content || "{}");
            return [
              2 /*return*/,
              {
                epic: "epic4",
                category: result.category || "general_query",
                confidence: result.confidence || 0.5,
                requiredPermissions: result.permissions || ["read_basic"],
                suggestedActions: result.actions || [],
                affectedSystems: result.systems || ["general"],
              },
            ];
          case 2:
            error_3 = _a.sent();
            console.error("[NeonProAI] Query classification error:", error_3);
            // Fallback classification
            return [
              2 /*return*/,
              {
                epic: "epic4",
                category: "general_query",
                confidence: 0.3,
                requiredPermissions: ["read_basic"],
                suggestedActions: ["show_help"],
                affectedSystems: ["general"],
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Enrich context with relevant data based on query classification
   */
  NeonProAIChatEngine.prototype.enrichContext = function (classification, baseContext) {
    return __awaiter(this, void 0, void 0, function () {
      var enriched, _a, _b, _c, _d, _e, error_4;
      return __generator(this, function (_f) {
        switch (_f.label) {
          case 0:
            enriched = __assign(__assign({}, baseContext), {
              enrichedData: {},
              queryClassification: classification,
              relevantData: {},
              searchResults: [],
              suggestedQueries: [],
              permissions: classification.requiredPermissions,
            });
            _f.label = 1;
          case 1:
            _f.trys.push([1, 15, , 16]);
            _a = classification.category;
            switch (_a) {
              case "appointment_query":
                return [3 /*break*/, 2];
              case "financial_query":
                return [3 /*break*/, 5];
              case "patient_query":
                return [3 /*break*/, 8];
              case "analytics_query":
                return [3 /*break*/, 11];
            }
            return [3 /*break*/, 14];
          case 2:
            if (!enriched.relevantData) return [3 /*break*/, 4];
            _b = enriched.relevantData;
            return [4 /*yield*/, this.getRecentAppointments(baseContext.clinic.id, 10)];
          case 3:
            _b.recentAppointments = _f.sent();
            _f.label = 4;
          case 4:
            return [3 /*break*/, 14];
          case 5:
            if (!enriched.relevantData) return [3 /*break*/, 7];
            _c = enriched.relevantData;
            return [4 /*yield*/, this.getFinancialSummary(baseContext.clinic.id)];
          case 6:
            _c.financialSummary = _f.sent();
            _f.label = 7;
          case 7:
            return [3 /*break*/, 14];
          case 8:
            if (!enriched.relevantData) return [3 /*break*/, 10];
            _d = enriched.relevantData;
            return [4 /*yield*/, this.getPatientStatistics(baseContext.clinic.id)];
          case 9:
            _d.patientStats = _f.sent();
            _f.label = 10;
          case 10:
            return [3 /*break*/, 14];
          case 11:
            if (!enriched.relevantData) return [3 /*break*/, 13];
            _e = enriched.relevantData;
            return [4 /*yield*/, this.getAnalyticsSummary(baseContext.clinic.id)];
          case 12:
            _e.analytics = _f.sent();
            _f.label = 13;
          case 13:
            return [3 /*break*/, 14];
          case 14:
            return [2 /*return*/, enriched];
          case 15:
            error_4 = _f.sent();
            console.error("[NeonProAI] Context enrichment error:", error_4);
            return [2 /*return*/, enriched];
          case 16:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate AI response using enriched context
   */
  NeonProAIChatEngine.prototype.generateResponse = function (message, context, classification) {
    return __awaiter(this, void 0, void 0, function () {
      var systemPrompt, completion, responseContent, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            systemPrompt = this.buildSystemPrompt(context, classification);
            return [
              4 /*yield*/,
              openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: message },
                ],
                temperature: 0.7,
                max_tokens: 1000,
              }),
            ];
          case 1:
            completion = _a.sent();
            responseContent =
              completion.choices[0].message.content ||
              "Desculpe, não consegui gerar uma resposta adequada.";
            return [
              2 /*return*/,
              {
                message: responseContent,
                sources: this.extractSources(context),
                visualizations: this.suggestVisualizations(classification),
                actions: classification.suggestedActions,
              },
            ];
          case 2:
            error_5 = _a.sent();
            console.error("[NeonProAI] Response generation error:", error_5);
            return [2 /*return*/, this.createErrorResponse(error_5)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Build classification prompt for OpenAI
   */
  NeonProAIChatEngine.prototype.buildClassificationPrompt = function (message, context) {
    return "You are a clinical management AI assistant. Classify the following user query and respond with JSON.\n\nContext:\n- Clinic: "
      .concat(context.clinic.name, "\n- User Role: ")
      .concat(
        context.user.role,
        '\n- Available Systems: appointments, financial, clinical, business intelligence\n\nClassifications:\n- appointment_query: scheduling, calendar, availability\n- financial_query: billing, payments, revenue, expenses\n- patient_query: patient data, medical records (LGPD compliant)\n- clinical_query: medical procedures, treatments\n- analytics_query: reports, KPIs, business intelligence\n- compliance_query: regulations, audits, LGPD\n- general_query: help, information, navigation\n\nRequired JSON format:\n{\n  "category": "classification_type",\n  "confidence": 0.0-1.0,\n  "permissions": ["required_permission_array"],\n  "actions": ["suggested_action_array"],\n  "systems": ["affected_system_array"]\n}',
      );
  };
  /**
   * Build system prompt for response generation
   */
  NeonProAIChatEngine.prototype.buildSystemPrompt = function (context, classification) {
    var clinicInfo = "Clinic: ".concat(context.clinic.name, " (").concat(context.clinic.id, ")");
    var userInfo = "User: ".concat(context.user.name, " (").concat(context.user.role, ")");
    var systemsInfo = "Systems: ".concat(classification.affectedSystems.join(", "));
    return "You are NeonPro AI, an intelligent assistant for "
      .concat(context.clinic.name, ".\n\nContext:\n")
      .concat(clinicInfo, "\n")
      .concat(userInfo, "\n")
      .concat(
        systemsInfo,
        "\n\nGuidelines:\n1. Respond in Portuguese (Brazil)\n2. Be professional and helpful\n3. Use available data to provide accurate information\n4. Respect LGPD privacy regulations\n5. Suggest relevant actions when appropriate\n6. Keep responses concise but informative\n\nAvailable Data: ",
      )
      .concat(JSON.stringify(context.relevantData, null, 2));
  };
  /**
   * Helper methods for data retrieval
   */
  NeonProAIChatEngine.prototype.getRecentAppointments = function (clinicId, limit) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("id, start_time, status, service_type")
                .eq("clinic_id", clinicId)
                .order("start_time", { ascending: false })
                .limit(limit),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  NeonProAIChatEngine.prototype.getFinancialSummary = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("financial_transactions")
                .select("amount, type, created_at")
                .eq("clinic_id", clinicId)
                .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
            ];
          case 1:
            data = _a.sent().data;
            return [
              2 /*return*/,
              {
                totalRevenue:
                  (data === null || data === void 0
                    ? void 0
                    : data
                        .filter(function (t) {
                          return t.type === "income";
                        })
                        .reduce(function (sum, t) {
                          return sum + t.amount;
                        }, 0)) || 0,
                totalExpenses:
                  (data === null || data === void 0
                    ? void 0
                    : data
                        .filter(function (t) {
                          return t.type === "expense";
                        })
                        .reduce(function (sum, t) {
                          return sum + t.amount;
                        }, 0)) || 0,
                transactionCount: (data === null || data === void 0 ? void 0 : data.length) || 0,
              },
            ];
        }
      });
    });
  };
  NeonProAIChatEngine.prototype.getPatientStatistics = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("patients").select("id, created_at").eq("clinic_id", clinicId),
            ];
          case 1:
            data = _a.sent().data;
            return [
              2 /*return*/,
              {
                totalPatients: (data === null || data === void 0 ? void 0 : data.length) || 0,
                newPatientsThisMonth:
                  (data === null || data === void 0
                    ? void 0
                    : data.filter(function (p) {
                        return (
                          new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        );
                      }).length) || 0,
              },
            ];
        }
      });
    });
  };
  NeonProAIChatEngine.prototype.getAnalyticsSummary = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would integrate with Epic 3 business intelligence
        return [
          2 /*return*/,
          {
            revenue: 0,
            appointments: 0,
            patientSatisfaction: 0,
          },
        ];
      });
    });
  };
  /**
   * Security and compliance helpers
   */
  NeonProAIChatEngine.prototype.checkUserPermissions = function (sessionId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var session, _a;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.auth.getSession()];
          case 1:
            session = _d.sent().data;
            return [
              2 /*return*/,
              (
                (_c = (_b = session.session) === null || _b === void 0 ? void 0 : _b.user) ===
                  null || _c === void 0
                  ? void 0
                  : _c.id
              )
                ? true
                : false,
            ];
          case 2:
            _a = _d.sent();
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  NeonProAIChatEngine.prototype.validateLGPDCompliance = function (message) {
    // Check for potential LGPD violations
    var sensitivePatterns = [
      /cpf\s*:?\s*\d{3}\.?\d{3}\.?\d{3}-?\d{2}/i,
      /rg\s*:?\s*\d+/i,
      /telefone\s*:?\s*\(\d{2}\)\s*\d{4,5}-?\d{4}/i,
    ];
    return !sensitivePatterns.some(function (pattern) {
      return pattern.test(message);
    });
  };
  NeonProAIChatEngine.prototype.extractSources = function (context) {
    var _a, _b, _c, _d;
    var sources = ["neonpro_database"];
    if ((_a = context.relevantData) === null || _a === void 0 ? void 0 : _a.recentAppointments)
      sources.push("appointments_system");
    if ((_b = context.relevantData) === null || _b === void 0 ? void 0 : _b.financialSummary)
      sources.push("financial_system");
    if ((_c = context.relevantData) === null || _c === void 0 ? void 0 : _c.patientStats)
      sources.push("patient_management");
    if ((_d = context.relevantData) === null || _d === void 0 ? void 0 : _d.analytics)
      sources.push("business_intelligence");
    return sources;
  };
  NeonProAIChatEngine.prototype.suggestVisualizations = function (classification) {
    var visualizations = [];
    switch (classification.category) {
      case "financial_query":
        visualizations.push("revenue_chart", "expense_breakdown");
        break;
      case "appointment_query":
        visualizations.push("calendar_view", "schedule_timeline");
        break;
      case "analytics_query":
        visualizations.push("dashboard_overview", "kpi_metrics");
        break;
    }
    return visualizations;
  };
  NeonProAIChatEngine.prototype.createErrorResponse = function (error) {
    return {
      message:
        "Desculpe, encontrei um problema ao processar sua solicitação. Tente novamente em alguns instantes.",
      sources: ["error_handler"],
      visualizations: [],
      actions: ["retry", "contact_support"],
    };
  };
  return NeonProAIChatEngine;
})();
exports.NeonProAIChatEngine = NeonProAIChatEngine;
/**
 * Factory function to create NeonProAIChatEngine instance
 */
function createNeonProAIChatEngine() {
  return __awaiter(this, void 0, void 0, function () {
    var supabase;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [2 /*return*/, new NeonProAIChatEngine(supabase)];
      }
    });
  });
}
exports.default = NeonProAIChatEngine;
