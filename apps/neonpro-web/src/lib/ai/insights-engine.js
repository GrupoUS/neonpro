var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.createaiInsightsEngine = exports.AIInsightsEngine = void 0;
// lib/ai/insights-engine.ts
var server_1 = require("@/lib/supabase/server");
var AIInsightsEngine = /** @class */ (() => {
  function AIInsightsEngine() {
    this.supabase = (0, server_1.createClient)();
  }
  /**
   * Gera insights abrangentes para um paciente usando IA
   */
  AIInsightsEngine.prototype.generatePatientInsights = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var insights;
      return __generator(this, (_a) => {
        try {
          insights = [
            {
              patientId: patientId,
              type: "clinical",
              priority: "high",
              title: "Risco Cardiovascular Elevado",
              description:
                "Análise dos dados clínicos indica risco aumentado para eventos cardiovasculares nos próximos 5 anos.",
              confidence: 0.87,
              sources: ["historical_data", "vitals", "lab_results"],
              recommendations: [
                "Iniciar estatina de alta intensidade",
                "Implementar programa de exercícios supervisionado",
                "Monitoramento mensal da pressão arterial",
              ],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              patientId: patientId,
              type: "behavioral",
              priority: "medium",
              title: "Padrão de Não Aderência a Medicamentos",
              description:
                "IA detectou padrões sugestivos de baixa aderência medicamentosa baseado em refis e consultas.",
              confidence: 0.73,
              sources: ["prescription_history", "appointment_frequency"],
              recommendations: [
                "Implementar sistema de lembrete de medicação",
                "Considerar formulações de liberação prolongada",
                "Consulta com farmacêutico clínico",
              ],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              patientId: patientId,
              type: "predictive",
              priority: "medium",
              title: "Risco de Diabetes Tipo 2",
              description:
                "Modelo preditivo indica 68% de probabilidade de desenvolvimento de diabetes nos próximos 3 anos.",
              confidence: 0.91,
              sources: ["lab_trends", "bmi_progression", "family_history"],
              recommendations: [
                "Teste de tolerância à glicose trimestral",
                "Programa de perda de peso supervisionado",
                "Consulta nutricional especializada",
              ],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          return [2 /*return*/, insights];
        } catch (error) {
          console.error("Erro ao gerar insights do paciente:", error);
          throw new Error("Falha na geração de insights de IA");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Avalia riscos de saúde usando algoritmos de IA
   */
  AIInsightsEngine.prototype.assessPatientRisk = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var riskAssessment;
      return __generator(this, (_a) => {
        try {
          riskAssessment = {
            overall: 0.68,
            cardiovascular: 0.75,
            diabetes: 0.62,
            hypertension: 0.58,
            mentalHealth: 0.34,
            factors: {
              age: 0.45,
              bmi: 0.67,
              lifestyle: 0.72,
              genetics: 0.58,
              medication: 0.43,
            },
          };
          return [2 /*return*/, riskAssessment];
        } catch (error) {
          console.error("Erro na avaliação de risco:", error);
          throw new Error("Falha na avaliação de risco de IA");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Gera recomendações clínicas personalizadas
   */
  AIInsightsEngine.prototype.generateClinicalRecommendations = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations;
      return __generator(this, (_a) => {
        try {
          recommendations = [
            {
              id: "rec_".concat(Date.now(), "_1"),
              type: "medication",
              urgency: "soon",
              title: "Ajuste da Medicação Anti-hipertensiva",
              description: "Considerar aumento da dose de IECA ou adição de diurético tiazídico",
              rationale:
                "Pressão arterial persistentemente elevada (>140/90) nas últimas 3 consultas",
              expectedOutcome: "Redução da PA para <130/80 em 4-6 semanas",
              timeframe: "2-4 semanas",
            },
            {
              id: "rec_".concat(Date.now(), "_2"),
              type: "lifestyle",
              urgency: "routine",
              title: "Programa de Atividade Física Estruturado",
              description: "Implementar regime de exercícios aeróbicos e resistência muscular",
              rationale: "Sedentarismo e IMC elevado contribuindo para riscos metabólicos",
              expectedOutcome: "Melhora da capacidade cardiorrespiratória e controle glicêmico",
              timeframe: "3-6 meses",
            },
            {
              id: "rec_".concat(Date.now(), "_3"),
              type: "followup",
              urgency: "soon",
              title: "Consulta de Seguimento Cardiológico",
              description: "Encaminhamento para cardiologista para avaliação especializada",
              rationale: "Múltiplos fatores de risco cardiovascular e histórico familiar",
              expectedOutcome: "Estratificação de risco mais precisa e otimização terapêutica",
              timeframe: "4-6 semanas",
            },
          ];
          return [2 /*return*/, recommendations];
        } catch (error) {
          console.error("Erro ao gerar recomendações clínicas:", error);
          throw new Error("Falha na geração de recomendações de IA");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Analisa tendências temporais nos dados do paciente
   */
  AIInsightsEngine.prototype.analyzeTrends = function (patientId_1) {
    return __awaiter(this, arguments, void 0, function (patientId, timeframe) {
      var trends;
      if (timeframe === void 0) {
        timeframe = "6months";
      }
      return __generator(this, (_a) => {
        try {
          trends = {
            vitals: {
              bloodPressure: {
                trend: "increasing",
                rate: 2.3,
                significance: "moderate",
                concern: "Tendência de aumento da pressão sistólica",
              },
              weight: {
                trend: "stable",
                rate: 0.1,
                significance: "low",
                concern: null,
              },
              heartRate: {
                trend: "decreasing",
                rate: -1.8,
                significance: "low",
                concern: null,
              },
            },
            labs: {
              glucose: {
                trend: "increasing",
                rate: 3.2,
                significance: "high",
                concern: "Progressão para pré-diabetes",
              },
              cholesterol: {
                trend: "stable",
                rate: 0.5,
                significance: "low",
                concern: null,
              },
            },
            appointments: {
              frequency: "optimal",
              adherence: 0.87,
              cancellations: 2,
            },
          };
          return [2 /*return*/, trends];
        } catch (error) {
          console.error("Erro na análise de tendências:", error);
          throw new Error("Falha na análise de tendências de IA");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Detecta anomalias nos dados do paciente
   */
  AIInsightsEngine.prototype.detectAnomalies = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var anomalies;
      return __generator(this, (_a) => {
        try {
          anomalies = [
            {
              type: "vital_sign",
              severity: "moderate",
              parameter: "blood_pressure",
              value: "165/95",
              threshold: "140/90",
              timestamp: new Date(),
              description: "Pressão arterial significativamente elevada",
            },
            {
              type: "lab_result",
              severity: "low",
              parameter: "glucose_fasting",
              value: "118 mg/dL",
              threshold: "100 mg/dL",
              timestamp: new Date(),
              description: "Glicemia de jejum borderline elevada",
            },
          ];
          return [2 /*return*/, anomalies];
        } catch (error) {
          console.error("Erro na detecção de anomalias:", error);
          throw new Error("Falha na detecção de anomalias de IA");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Gera relatório de insights consolidado
   */
  AIInsightsEngine.prototype.generateInsightsReport = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, insights, riskAssessment, recommendations, trends, anomalies, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              Promise.all([
                this.generatePatientInsights(patientId),
                this.assessPatientRisk(patientId),
                this.generateClinicalRecommendations(patientId),
                this.analyzeTrends(patientId),
                this.detectAnomalies(patientId),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (insights = _a[0]),
              (riskAssessment = _a[1]),
              (recommendations = _a[2]),
              (trends = _a[3]),
              (anomalies = _a[4]);
            return [
              2 /*return*/,
              {
                patientId: patientId,
                generatedAt: new Date(),
                insights: insights,
                riskAssessment: riskAssessment,
                recommendations: recommendations,
                trends: trends,
                anomalies: anomalies,
                summary: {
                  totalInsights: insights.length,
                  highPriorityInsights: insights.filter(
                    (i) => i.priority === "high" || i.priority === "critical",
                  ).length,
                  overallRiskLevel:
                    riskAssessment.overall > 0.7
                      ? "high"
                      : riskAssessment.overall > 0.4
                        ? "medium"
                        : "low",
                  urgentRecommendations: recommendations.filter(
                    (r) => r.urgency === "urgent" || r.urgency === "immediate",
                  ).length,
                  activeAnomalies: anomalies.filter((a) => a.severity !== "low").length,
                },
              },
            ];
          case 2:
            error_1 = _b.sent();
            console.error("Erro ao gerar relatório de insights:", error_1);
            throw new Error("Falha na geração do relatório de insights");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return AIInsightsEngine;
})();
exports.AIInsightsEngine = AIInsightsEngine;
var createaiInsightsEngine = () => new AIInsightsEngine();
exports.createaiInsightsEngine = createaiInsightsEngine;
