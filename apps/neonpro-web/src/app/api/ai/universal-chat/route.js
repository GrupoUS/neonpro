"use strict";
// Universal AI Chat Endpoint for NeonPro (Epic 4 - Story 4.1)
// app/api/ai/universal-chat/route.ts
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
exports.POST = POST;
exports.OPTIONS = OPTIONS;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
// Rate limiting and security imports (to be implemented)
// import type { rateLimit } from "@/app/lib/rate-limit"
// import type { validateAPIKey } from "@/app/lib/auth"
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      query,
      context,
      sessionId,
      supabase,
      _a,
      session,
      sessionError,
      userId,
      profile,
      clinicId,
      chatContext,
      response,
      error_1,
      errorMessage;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, , 8]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          (query = body.query), (context = body.context), (sessionId = body.sessionId);
          if (!query || typeof query !== "string") {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { success: false, error: "Query is required and must be a string" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 2:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          (_a = _b.sent()), (session = _a.data.session), (sessionError = _a.error);
          if (sessionError || !session) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          userId = session.user.id;
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", userId).single(),
          ];
        case 4:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { success: false, error: "User clinic not found" },
                { status: 403 },
              ),
            ];
          }
          clinicId = profile.clinic_id;
          chatContext = context;
          if (!!chatContext) return [3 /*break*/, 6];
          return [4 /*yield*/, buildUniversalContext(supabase, clinicId, userId)];
        case 5:
          chatContext = _b.sent();
          _b.label = 6;
        case 6:
          response = {
            chatResponse: "AI chat engine not implemented yet",
            suggestions: [],
            predictions: {},
            automations: {},
            metadata: {},
            confidence: 0,
          };
          /*
                    const response = await chatEngine.processUniversalQuery(
                      query,
                      chatContext,
                      userId,
                      clinicId
                    );
                    */
          // Log successful interaction
          console.log(
            "AI Chat - User: "
              .concat(userId, ", Clinic: ")
              .concat(clinicId, ", Query length: ")
              .concat(query.length),
          );
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              response: response.chatResponse,
              suggestions: response.suggestions,
              predictions: response.predictions,
              automations: response.automations,
              metadata: response.metadata,
              sessionId: sessionId || generateSessionId(),
            }),
          ];
        case 7:
          error_1 = _b.sent();
          console.error("Error in AI chat endpoint:", error_1);
          errorMessage = error_1 instanceof Error ? error_1.message : "Internal server error";
          return [
            2 /*return*/,
            server_2.NextResponse.json({ success: false, error: errorMessage }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Build universal context from current clinic data
 */
function buildUniversalContext(supabase, clinicId, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, appointmentsData, financialData, clinicalData, biData, clinicData, error_2;
    var _b, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            Promise.all([
              buildAppointmentsContext(supabase, clinicId),
              buildFinancialContext(supabase, clinicId),
              buildClinicalContext(supabase, clinicId),
              buildBusinessIntelligenceContext(supabase, clinicId),
              supabase
                .from("clinics")
                .select("id, name, settings, business_hours")
                .eq("id", clinicId)
                .single(),
            ]),
          ];
        case 1:
          (_a = _d.sent()),
            (appointmentsData = _a[0]),
            (financialData = _a[1]),
            (clinicalData = _a[2]),
            (biData = _a[3]),
            (clinicData = _a[4]);
          return [
            2 /*return*/,
            {
              user: {
                id: userId,
                name: "Admin User", // TODO: Get actual user name from profiles
                role: "admin",
                permissions: [],
              },
              clinic: {
                id: clinicId,
                name:
                  ((_b =
                    clinicData === null || clinicData === void 0 ? void 0 : clinicData.data) ===
                    null || _b === void 0
                    ? void 0
                    : _b.name) || "Clinic Name",
                settings:
                  ((_c =
                    clinicData === null || clinicData === void 0 ? void 0 : clinicData.data) ===
                    null || _c === void 0
                    ? void 0
                    : _c.settings) || {},
              },
              appointments: appointmentsData,
              financial: financialData,
              clinical: clinicalData,
              businessIntelligence: biData,
            },
          ];
        case 2:
          error_2 = _d.sent();
          console.error("Error building universal context:", error_2);
          // Return minimal context on error
          return [
            2 /*return*/,
            {
              user: {
                id: userId,
                name: "Unknown User",
                role: "guest",
                permissions: [],
              },
              clinic: {
                id: clinicId,
                name: "Unknown Clinic",
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
                  professionalId: "",
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
                  treatmentType: "",
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
                    birth_date: "",
                    gender: "",
                    clinic_id: clinicId,
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
                  professionalId: "",
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
            },
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Context builders for each epic
 */
function buildAppointmentsContext(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var appointments;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select("*")
              .eq("clinic_id", clinicId)
              .gte("scheduled_at", new Date().toISOString())
              .limit(50),
          ];
        case 1:
          appointments = _a.sent().data;
          return [
            2 /*return*/,
            {
              upcoming: appointments || [],
              conflicts: {
                totalConflicts: 0,
                conflictTypes: {},
                resolutionSuggestions: [],
              },
              utilization: {
                professionalId: "",
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
          ];
      }
    });
  });
}
function buildFinancialContext(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var transactions;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("financial_transactions")
              .select("*")
              .eq("clinic_id", clinicId)
              .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
              .limit(100),
          ];
        case 1:
          transactions = _a.sent().data;
          return [
            2 /*return*/,
            {
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
                treatmentType: "",
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
          ];
      }
    });
  });
}
function buildClinicalContext(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var patients;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("patients")
              .select("id, first_name, created_at")
              .eq("clinic_id", clinicId)
              .limit(10),
          ];
        case 1:
          patients = _a.sent().data;
          return [
            2 /*return*/,
            {
              patientRecords: {
                patientId: "",
                personalInfo: {
                  id: "",
                  first_name: "",
                  last_name: "",
                  email: "",
                  phone: "",
                  birth_date: "",
                  gender: "",
                  clinic_id: clinicId,
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
                professionalId: "",
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
          ];
      }
    });
  });
}
function buildBusinessIntelligenceContext(supabase, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      // Cross-epic analytics
      return [
        2 /*return*/,
        {
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
      ];
    });
  });
}
/**
 * Generate unique session ID
 */
function generateSessionId() {
  return "session_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
}
// OPTIONS handler for CORS
function OPTIONS(request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        new server_2.NextResponse(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }),
      ];
    });
  });
}
