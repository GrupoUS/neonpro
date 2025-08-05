"use strict";
// Endpoint for Universal AI Chat (Epic 4 - Story 4.1)
// app/api/ai/universal-chat/route.ts
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
exports.POST = POST;
var chat_engine_v2_1 = require("@/app/lib/ai/chat-engine-v2");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
/**
 * POST /api/ai/universal-chat
 * Universal AI Chat endpoint for NeonPro clinic management
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, message, context, sessionId, supabase, _a, session, sessionError, universalContext, aiRequest, chatEngine, response, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    console.log("[AI-API] Universal chat request received");
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    message = body.message, context = body.context, sessionId = body.sessionId;
                    if (!message || typeof message !== "string") {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 3:
                    _a = _b.sent(), session = _a.data.session, sessionError = _a.error;
                    if (sessionError || !session) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Authentication required" }, { status: 401 })];
                    }
                    return [4 /*yield*/, buildUniversalContext(supabase, session.user.id)];
                case 4:
                    universalContext = _b.sent();
                    aiRequest = {
                        query: message,
                        context: universalContext,
                        sessionId: (session === null || session === void 0 ? void 0 : session.access_token) || "anonymous",
                        userId: session.user.id,
                        clinicId: universalContext.clinic.id,
                    };
                    return [4 /*yield*/, (0, chat_engine_v2_1.createNeonProAIChatEngine)()];
                case 5:
                    chatEngine = _b.sent();
                    return [4 /*yield*/, chatEngine.processChat(aiRequest)];
                case 6:
                    response = _b.sent();
                    console.log("[AI-API] Chat processed successfully");
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: response,
                            metadata: {
                                timestamp: new Date().toISOString(),
                                userId: session.user.id,
                                clinicId: universalContext.clinic.id,
                            },
                        })];
                case 7:
                    error_1 = _b.sent();
                    console.error("[AI-API] Error processing chat:", error_1);
                    return [2 /*return*/, server_2.NextResponse.json({
                            error: "Internal server error",
                            message: error_1 instanceof Error ? error_1.message : "Unknown error",
                        }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Build universal context from all Epic data sources
 */
function buildUniversalContext(supabase, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, clinic, clinicId, _a, appointmentsData, financialData, clinicalData, biData, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, supabase
                            .from("users")
                            .select("*, clinics(*)")
                            .eq("id", userId)
                            .single()];
                case 1:
                    profile = (_b.sent()).data;
                    if (!profile || !profile.clinics) {
                        throw new Error("User profile or clinic not found");
                    }
                    clinic = profile.clinics;
                    clinicId = clinic.id;
                    return [4 /*yield*/, Promise.all([
                            buildAppointmentsContext(supabase, clinicId),
                            buildFinancialContext(supabase, clinicId),
                            buildClinicalContext(supabase, clinicId),
                            buildBusinessIntelligenceContext(supabase, clinicId),
                        ])];
                case 2:
                    _a = _b.sent(), appointmentsData = _a[0], financialData = _a[1], clinicalData = _a[2], biData = _a[3];
                    return [2 /*return*/, {
                            user: {
                                id: profile.id,
                                name: profile.full_name || "User",
                                role: profile.role || "user",
                                permissions: ["read_basic"],
                            },
                            clinic: {
                                id: clinic.id,
                                name: clinic.name,
                                settings: clinic.settings || {},
                            },
                            appointments: appointmentsData,
                            financial: financialData,
                            clinical: clinicalData,
                            businessIntelligence: biData,
                        }];
                case 3:
                    error_2 = _b.sent();
                    console.error("[AI-API] Error building context:", error_2);
                    // Return basic context with mock data
                    return [2 /*return*/, {
                            user: {
                                id: userId,
                                name: "User",
                                role: "user",
                                permissions: ["read_basic"],
                            },
                            clinic: {
                                id: "default",
                                name: "Default Clinic",
                                settings: {},
                            },
                            appointments: {
                                upcoming: [],
                                conflicts: {
                                    totalConflicts: 0,
                                    conflictTypes: {},
                                    resolutionSuggestions: [],
                                },
                                utilization: {
                                    professionalId: "default",
                                    utilizationRate: 0,
                                    appointmentsCount: 0,
                                    availableSlots: 0,
                                    efficiency: 0,
                                },
                                patientFlow: {
                                    averageWaitTime: 0,
                                    appointmentDuration: 0,
                                    noShowRate: 0,
                                    cancellationRate: 0,
                                },
                            },
                            financial: {
                                cashFlow: {
                                    currentBalance: 0,
                                    projectedBalance: 0,
                                    inflow: 0,
                                    outflow: 0,
                                    burnRate: 0,
                                },
                                receivables: {
                                    current: 0,
                                    thirtyDays: 0,
                                    sixtyDays: 0,
                                    ninetyDaysPlus: 0,
                                    totalReceivables: 0,
                                },
                                payables: {
                                    currentPayables: 0,
                                    overduePayables: 0,
                                    upcomingPayments: 0,
                                    averagePaymentDays: 0,
                                },
                                profitability: {
                                    treatmentType: "default",
                                    revenue: 0,
                                    costs: 0,
                                    margin: 0,
                                    profitabilityRate: 0,
                                },
                                forecasting: {
                                    revenue: {
                                        metric: "",
                                        currentValue: 0,
                                        predictedValue: 0,
                                        confidence: 0,
                                        trend: "stable",
                                        factors: [],
                                    },
                                    expenses: {
                                        metric: "",
                                        currentValue: 0,
                                        predictedValue: 0,
                                        confidence: 0,
                                        trend: "stable",
                                        factors: [],
                                    },
                                    cashFlow: {
                                        metric: "",
                                        currentValue: 0,
                                        predictedValue: 0,
                                        confidence: 0,
                                        trend: "stable",
                                        factors: [],
                                    },
                                    profitability: {
                                        metric: "",
                                        currentValue: 0,
                                        predictedValue: 0,
                                        confidence: 0,
                                        trend: "stable",
                                        factors: [],
                                    },
                                },
                            },
                            clinical: {
                                patientRecords: {
                                    patientId: "",
                                    personalInfo: {
                                        id: "",
                                        first_name: "",
                                        last_name: "",
                                        email: "",
                                        phone: "",
                                        date_of_birth: "",
                                        gender: "",
                                        address: "",
                                        emergency_contact: "",
                                        clinic_id: "",
                                        created_at: "",
                                        updated_at: "",
                                    },
                                    medicalHistory: [],
                                    treatmentSessions: [],
                                    progressTracking: [],
                                    satisfactionScores: [],
                                    riskFactors: [],
                                },
                                treatmentProtocols: {
                                    protocols: [],
                                    successRates: {},
                                    averageDuration: {},
                                    contraindications: {},
                                },
                                professionalPerformance: {
                                    professionalId: "default",
                                    performanceScore: 0,
                                    patientSatisfaction: 0,
                                    treatmentSuccessRate: 0,
                                    efficiency: 0,
                                    specialties: [],
                                },
                                complianceStatus: {
                                    cfmCompliance: true,
                                    anvisaCompliance: true,
                                    lgpdCompliance: true,
                                    lastAuditDate: "",
                                    complianceScore: 0,
                                    violations: [],
                                    recommendations: [],
                                },
                            },
                            businessIntelligence: {
                                kpis: {
                                    revenue: 0,
                                    profitMargin: 0,
                                    customerSatisfaction: 0,
                                    appointmentUtilization: 0,
                                    professionalEfficiency: 0,
                                    complianceScore: 0,
                                },
                                trends: {
                                    revenueGrowth: 0,
                                    patientRetention: 0,
                                    servicePopularity: {},
                                    seasonalPatterns: [],
                                    competitivePosition: "",
                                },
                                opportunities: {
                                    revenueOpportunities: [],
                                    costReductionOpportunities: [],
                                    operationalImprovements: [],
                                    marketExpansion: [],
                                },
                                alerts: { critical: [], warning: [], info: [] },
                            },
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function buildAppointmentsContext(supabase, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
        var appointments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from("appointments")
                        .select("*")
                        .eq("clinic_id", clinicId)
                        .gte("start_time", new Date().toISOString())
                        .limit(50)];
                case 1:
                    appointments = (_a.sent()).data;
                    return [2 /*return*/, {
                            upcoming: appointments || [],
                            conflicts: {
                                totalConflicts: 0,
                                conflictTypes: {},
                                resolutionSuggestions: [],
                            },
                            utilization: {
                                professionalId: "default",
                                utilizationRate: 0,
                                appointmentsCount: 0,
                                availableSlots: 0,
                                efficiency: 0,
                            },
                            patientFlow: {
                                averageWaitTime: 0,
                                appointmentDuration: 0,
                                noShowRate: 0,
                                cancellationRate: 0,
                            },
                        }];
            }
        });
    });
}
function buildFinancialContext(supabase, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
        var transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from("financial_transactions")
                        .select("*")
                        .eq("clinic_id", clinicId)
                        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                        .limit(100)];
                case 1:
                    transactions = (_a.sent()).data;
                    return [2 /*return*/, {
                            cashFlow: {
                                currentBalance: 0,
                                projectedBalance: 0,
                                inflow: 0,
                                outflow: 0,
                                burnRate: 0,
                            },
                            receivables: {
                                current: 0,
                                thirtyDays: 0,
                                sixtyDays: 0,
                                ninetyDaysPlus: 0,
                                totalReceivables: 0,
                            },
                            payables: {
                                currentPayables: 0,
                                overduePayables: 0,
                                upcomingPayments: 0,
                                averagePaymentDays: 0,
                            },
                            profitability: {
                                treatmentType: "default",
                                revenue: 0,
                                costs: 0,
                                margin: 0,
                                profitabilityRate: 0,
                            },
                            forecasting: {
                                revenue: {
                                    metric: "monthly_revenue",
                                    currentValue: 50000,
                                    predictedValue: 55000,
                                    confidence: 0.85,
                                    trend: "increasing",
                                    factors: ["seasonal_increase", "new_services"],
                                },
                                expenses: {
                                    metric: "monthly_expenses",
                                    currentValue: 35000,
                                    predictedValue: 36000,
                                    confidence: 0.9,
                                    trend: "stable",
                                    factors: ["fixed_costs", "inflation"],
                                },
                                cashFlow: {
                                    metric: "net_cash_flow",
                                    currentValue: 15000,
                                    predictedValue: 19000,
                                    confidence: 0.8,
                                    trend: "increasing",
                                    factors: ["improved_efficiency"],
                                },
                                profitability: {
                                    metric: "net_margin",
                                    currentValue: 0.3,
                                    predictedValue: 0.34,
                                    confidence: 0.75,
                                    trend: "increasing",
                                    factors: ["cost_optimization"],
                                },
                            },
                        }];
            }
        });
    });
}
function buildClinicalContext(supabase, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
        var patients;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from("patients")
                        .select("id, first_name, created_at")
                        .eq("clinic_id", clinicId)
                        .limit(10)];
                case 1:
                    patients = (_a.sent()).data;
                    return [2 /*return*/, {
                            patientRecords: {
                                patientId: "anonymized",
                                personalInfo: {
                                    id: "anonymous",
                                    first_name: "Patient",
                                    last_name: "Data (Anonymized)",
                                    email: "",
                                    phone: "",
                                    date_of_birth: "",
                                    gender: "",
                                    address: "",
                                    emergency_contact: "",
                                    clinic_id: "",
                                    created_at: "",
                                    updated_at: "",
                                },
                                medicalHistory: [],
                                treatmentSessions: [],
                                progressTracking: [],
                                satisfactionScores: [],
                                riskFactors: [],
                            },
                            treatmentProtocols: {
                                protocols: [],
                                successRates: {},
                                averageDuration: {},
                                contraindications: {},
                            },
                            professionalPerformance: {
                                professionalId: "default",
                                performanceScore: 0,
                                patientSatisfaction: 0,
                                treatmentSuccessRate: 0,
                                efficiency: 0,
                                specialties: [],
                            },
                            complianceStatus: {
                                cfmCompliance: true,
                                anvisaCompliance: true,
                                lgpdCompliance: true,
                                lastAuditDate: "",
                                complianceScore: 0,
                                violations: [],
                                recommendations: [],
                            },
                        }];
            }
        });
    });
}
function buildBusinessIntelligenceContext(supabase, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Cross-epic analytics
            return [2 /*return*/, {
                    kpis: {
                        revenue: 0,
                        profitMargin: 0,
                        customerSatisfaction: 0,
                        appointmentUtilization: 0,
                        professionalEfficiency: 0,
                        complianceScore: 0,
                    },
                    trends: {
                        revenueGrowth: 0,
                        patientRetention: 0,
                        servicePopularity: {},
                        seasonalPatterns: [],
                        competitivePosition: "",
                    },
                    opportunities: {
                        revenueOpportunities: [],
                        costReductionOpportunities: [],
                        operationalImprovements: [],
                        marketExpansion: [],
                    },
                    alerts: { critical: [], warning: [], info: [] },
                }];
        });
    });
}
