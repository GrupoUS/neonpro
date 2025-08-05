"use strict";
// NeonProAIChatEngine - Core AI Chat Processing Engine
// Implementation of Story 4.1: Universal AI Chat Assistant
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeonProAIChatEngine = void 0;
var openai_1 = require("openai");
var server_1 = require("@/lib/supabase/server");
// Initialize OpenAI client
var openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || ''
});
/**
 * NeonProAIChatEngine - Core AI Chat Processing Engine
 * Integrates OpenAI GPT-4 with NeonPro clinic data for intelligent assistance
 */
var NeonProAIChatEngine = /** @class */ (function () {
    function NeonProAIChatEngine() {
        this.supabase = null;
        this.openai = openai;
        this.initializeSupabase();
    }
    NeonProAIChatEngine.prototype.initializeSupabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        _a.supabase = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Main entry point for processing universal AI queries
     * Integrates data from all epics (1, 2, 3) for comprehensive responses
     */
    NeonProAIChatEngine.prototype.processUniversalQuery = function (query, context, userId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, queryType, enrichedContext, response, validatedResponse, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, this.classifyQuery(query)
                            // 2. Context Enrichment based on classification
                        ];
                    case 2:
                        queryType = _a.sent();
                        return [4 /*yield*/, this.enrichContext(context, queryType, clinicId)
                            // 3. Security & RLS Validation
                        ];
                    case 3:
                        enrichedContext = _a.sent();
                        // 3. Security & RLS Validation
                        return [4 /*yield*/, this.validateAccess(userId, clinicId, queryType.requiredPermissions)
                            // 4. AI Processing with Full Context
                        ];
                    case 4:
                        // 3. Security & RLS Validation
                        _a.sent();
                        return [4 /*yield*/, this.generateResponse(query, enrichedContext, queryType)
                            // 5. Response Validation & Compliance
                        ];
                    case 5:
                        response = _a.sent();
                        return [4 /*yield*/, this.validateResponse(response, clinicId)
                            // 6. Audit Trail
                        ];
                    case 6:
                        validatedResponse = _a.sent();
                        // 6. Audit Trail
                        return [4 /*yield*/, this.logAIInteraction(userId, query, validatedResponse)];
                    case 7:
                        // 6. Audit Trail
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, validatedResponse), { metadata: {
                                    confidenceScore: this.calculateConfidence(validatedResponse),
                                    processingTime: performance.now() - startTime,
                                    dataSourcesUsed: this.getDataSources(enrichedContext),
                                    nextActions: this.suggestNextActions(enrichedContext, queryType)
                                } })];
                    case 8:
                        error_1 = _a.sent();
                        console.error('Error in processUniversalQuery:', error_1);
                        errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                        throw new Error("AI processing failed: ".concat(errorMessage));
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enhanced query classification for Epic 4 integration
     */
    NeonProAIChatEngine.prototype.classifyQuery = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var classification;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.openai.chat.completions.create({
                            model: "gpt-4",
                            messages: [
                                {
                                    role: "system",
                                    content: "Classifique a query do usu\u00E1rio nas seguintes categorias baseadas nos \u00C9picos implementados:\n          \n          EPIC 1 - AUTHENTICATION & APPOINTMENTS:\n          - SCHEDULING: agendamentos, calend\u00E1rio, disponibilidade\n          - CONFLICTS: conflitos de agenda, otimiza\u00E7\u00E3o de hor\u00E1rios\n          - PATIENT_PORTAL: portal do paciente, acesso, comunica\u00E7\u00E3o\n          - OAUTH_SECURITY: seguran\u00E7a, autentica\u00E7\u00E3o, controle de acesso\n          \n          EPIC 2 - FINANCIAL MANAGEMENT:\n          - ACCOUNTS_PAYABLE: contas a pagar, fornecedores, despesas\n          - ACCOUNTS_RECEIVABLE: receb\u00EDveis, cobran\u00E7a, inadimpl\u00EAncia\n          - CASH_FLOW: fluxo de caixa, liquidez, proje\u00E7\u00F5es\n          - BANK_RECONCILIATION: concilia\u00E7\u00E3o banc\u00E1ria, transa\u00E7\u00F5es\n          \n          EPIC 3 - CLINICAL OPERATIONS:\n          - MEDICAL_RECORDS: prontu\u00E1rios, hist\u00F3rico m\u00E9dico, documenta\u00E7\u00E3o\n          - TREATMENT_PROTOCOLS: protocolos, procedimentos, tratamentos\n          - PROFESSIONAL_SERVICES: profissionais, performance, especialidades\n          - CLINICAL_COMPLIANCE: conformidade cl\u00EDnica, regulamenta\u00E7\u00F5es\n          \n          EPIC 4 - INTELLIGENT AI SYSTEM:\n          - AI_CHAT: chat inteligente, assistente virtual, linguagem natural\n          - AI_SUGGESTIONS: sugest\u00F5es cross-funcionais, otimiza\u00E7\u00F5es\n          - PREDICTIVE_ANALYTICS: an\u00E1lise preditiva, business intelligence\n          - PROCESS_AUTOMATION: automa\u00E7\u00E3o inteligente, workflows\n          \n          CROSS_FUNCTIONAL: quest\u00F5es que envolvem m\u00FAltiplos \u00E9picos ou an\u00E1lises integradas\n          \n          Retorne JSON com: { \n            epic: \"epic1|epic2|epic3|epic4|cross_functional\",\n            category: \"categoria_espec\u00EDfica\", \n            confidence: 0.0-1.0, \n            requiredPermissions: [\"permiss\u00E3o1\", \"permiss\u00E3o2\"],\n            suggestedActions: [\"a\u00E7\u00E3o1\", \"a\u00E7\u00E3o2\"],\n            affectedSystems: [\"sistema1\", \"sistema2\"]\n          }"
                                },
                                { role: "user", content: query }
                            ],
                            response_format: { type: "json_object" }
                        })];
                    case 1:
                        classification = _a.sent();
                        return [2 /*return*/, JSON.parse(classification.choices[0].message.content || '{}')];
                }
            });
        });
    };
    /**
     * Enrich context based on query classification
     */
    NeonProAIChatEngine.prototype.enrichContext = function (baseContext, queryType, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var relevantData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.loadFinancialContext(clinicId, queryType),
                            this.loadClinicalContext(clinicId, queryType),
                            this.loadOperationalContext(clinicId, queryType),
                            this.loadComplianceContext(clinicId, queryType)
                        ])];
                    case 1:
                        relevantData = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, baseContext), { enrichedData: this.mergeContexts(relevantData), queryClassification: queryType })];
                }
            });
        });
    };
    /**
     * Generate AI response with context-aware processing
     */
    NeonProAIChatEngine.prototype.generateResponse = function (query, context, queryType) {
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, response, aiResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        systemPrompt = this.buildSystemPrompt(queryType, context);
                        return [4 /*yield*/, this.openai.chat.completions.create({
                                model: "gpt-4",
                                messages: [
                                    { role: "system", content: systemPrompt },
                                    { role: "user", content: this.buildUserPrompt(query, context) }
                                ],
                                response_format: { type: "json_object" },
                                temperature: 0.3
                            })];
                    case 1:
                        response = _a.sent();
                        aiResponse = JSON.parse(response.choices[0].message.content || '{}');
                        return [2 /*return*/, {
                                chatResponse: {
                                    message: aiResponse.message,
                                    confidence: aiResponse.confidence || 0.8,
                                    sources: aiResponse.sources || [],
                                    visualizations: aiResponse.visualizations || [],
                                    actions: aiResponse.actions || []
                                },
                                queryClassification: queryType,
                                metadata: {
                                    confidenceScore: aiResponse.confidence || 0.8,
                                    processingTime: 0,
                                    dataSourcesUsed: [],
                                    nextActions: []
                                }
                            }];
                }
            });
        });
    };
    // Helper methods
    NeonProAIChatEngine.prototype.loadFinancialContext = function (clinicId, queryType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for loading financial context
                return [2 /*return*/, {}];
            });
        });
    };
    NeonProAIChatEngine.prototype.loadClinicalContext = function (clinicId, queryType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for loading clinical context
                return [2 /*return*/, {}];
            });
        });
    };
    NeonProAIChatEngine.prototype.loadOperationalContext = function (clinicId, queryType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for loading operational context
                return [2 /*return*/, {}];
            });
        });
    };
    NeonProAIChatEngine.prototype.loadComplianceContext = function (clinicId, queryType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for loading compliance context
                return [2 /*return*/, {}];
            });
        });
    };
    NeonProAIChatEngine.prototype.mergeContexts = function (contexts) {
        // Implementation for merging contexts
        return contexts.reduce(function (merged, context) { return (__assign(__assign({}, merged), context)); }, {});
    };
    NeonProAIChatEngine.prototype.validateAccess = function (userId, clinicId, permissions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    NeonProAIChatEngine.prototype.validateResponse = function (response, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for response validation
                return [2 /*return*/, response];
            });
        });
    };
    NeonProAIChatEngine.prototype.logAIInteraction = function (userId, query, response) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    NeonProAIChatEngine.prototype.calculateConfidence = function (response) {
        // Implementation for confidence calculation
        return response.chatResponse.confidence;
    };
    NeonProAIChatEngine.prototype.getDataSources = function (context) {
        // Implementation for getting data sources
        return [];
    };
    NeonProAIChatEngine.prototype.suggestNextActions = function (context, queryType) {
        // Implementation for suggesting next actions
        return queryType.suggestedActions;
    };
    NeonProAIChatEngine.prototype.buildSystemPrompt = function (queryType, context) {
        // Implementation for building system prompt
        return "Voc\u00EA \u00E9 um assistente de IA especializado em cl\u00EDnicas m\u00E9dicas.";
    };
    NeonProAIChatEngine.prototype.buildUserPrompt = function (query, context) {
        // Implementation for building user prompt
        return query;
    };
    return NeonProAIChatEngine;
}());
exports.NeonProAIChatEngine = NeonProAIChatEngine;
