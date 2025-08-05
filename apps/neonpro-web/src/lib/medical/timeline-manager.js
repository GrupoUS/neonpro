"use strict";
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
exports.createmedicalTimelineManager = exports.MedicalTimelineManager = void 0;
// lib/medical/timeline-manager.ts
var server_1 = require("@/lib/supabase/server");
var MedicalTimelineManager = /** @class */ (function () {
  function MedicalTimelineManager() {
    this.supabase = (0, server_1.createClient)();
  }
  /**
   * Adiciona um novo evento à timeline médica
   */
  MedicalTimelineManager.prototype.addTimelineEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var newEvent;
      return __generator(this, function (_a) {
        try {
          newEvent = __assign(__assign({}, event), {
            id: "evt_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          // Simular salvamento no banco de dados
          return [2 /*return*/, newEvent];
        } catch (error) {
          console.error("Erro ao adicionar evento à timeline:", error);
          throw new Error("Falha ao adicionar evento médico");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Recupera a timeline médica completa de um paciente
   */
  MedicalTimelineManager.prototype.getPatientTimeline = function (patientId, filter) {
    return __awaiter(this, void 0, void 0, function () {
      var mockEvents, filteredEvents;
      return __generator(this, function (_a) {
        try {
          mockEvents = [
            {
              id: "evt_001",
              patientId: patientId,
              type: "appointment",
              category: "primary_care",
              date: new Date("2024-01-15"),
              title: "Consulta de Rotina",
              description: "Consulta anual preventiva. Paciente relata fadiga ocasional.",
              provider: "Dr. Maria Silva",
              facility: "NeonPro Clínica",
              severity: "low",
              status: "completed",
              metadata: {
                duration: 45,
                nextAppointment: "2024-07-15",
              },
              createdAt: new Date("2024-01-15"),
              updatedAt: new Date("2024-01-15"),
            },
            {
              id: "evt_002",
              patientId: patientId,
              type: "lab",
              category: "preventive",
              date: new Date("2024-01-20"),
              title: "Exames Laboratoriais",
              description: "Hemograma completo, perfil lipídico, glicemia de jejum.",
              provider: "Lab Central",
              severity: "medium",
              status: "completed",
              metadata: {
                results: {
                  glucose: "112 mg/dL",
                  cholesterol: "195 mg/dL",
                  hdl: "42 mg/dL",
                },
              },
              createdAt: new Date("2024-01-20"),
              updatedAt: new Date("2024-01-20"),
            },
            {
              id: "evt_003",
              patientId: patientId,
              type: "diagnosis",
              category: "chronic_care",
              date: new Date("2024-02-01"),
              title: "Diagnóstico: Pré-hipertensão",
              description: "Pressão arterial consistentemente elevada (135-139/85-89 mmHg).",
              provider: "Dr. Maria Silva",
              facility: "NeonPro Clínica",
              severity: "medium",
              status: "ongoing",
              metadata: {
                icd10: "R03.0",
                treatmentPlan: "Modificações no estilo de vida, monitoramento mensal",
              },
              createdAt: new Date("2024-02-01"),
              updatedAt: new Date("2024-02-01"),
            },
            {
              id: "evt_004",
              patientId: patientId,
              type: "medication",
              category: "chronic_care",
              date: new Date("2024-02-05"),
              title: "Prescrição: Lisinopril 10mg",
              description: "Iniciado IECA para controle da pressão arterial.",
              provider: "Dr. Maria Silva",
              severity: "medium",
              status: "ongoing",
              metadata: {
                medication: "Lisinopril",
                dosage: "10mg",
                frequency: "1x dia",
                duration: "contínuo",
              },
              createdAt: new Date("2024-02-05"),
              updatedAt: new Date("2024-02-05"),
            },
            {
              id: "evt_005",
              patientId: patientId,
              type: "appointment",
              category: "specialist",
              date: new Date("2024-03-10"),
              title: "Consulta Cardiológica",
              description: "Avaliação especializada do risco cardiovascular.",
              provider: "Dr. João Cardoso",
              facility: "Centro Cardíaco",
              severity: "medium",
              status: "completed",
              metadata: {
                recommendations: "Manter medicação atual, exercícios regulares",
              },
              createdAt: new Date("2024-03-10"),
              updatedAt: new Date("2024-03-10"),
            },
            {
              id: "evt_006",
              patientId: patientId,
              type: "vital",
              category: "chronic_care",
              date: new Date("2024-03-25"),
              title: "Monitoramento de PA",
              description: "Pressão arterial: 128/82 mmHg. Melhora significativa.",
              provider: "Enfermeira Ana",
              facility: "NeonPro Clínica",
              severity: "low",
              status: "completed",
              metadata: {
                systolic: 128,
                diastolic: 82,
                heartRate: 72,
              },
              createdAt: new Date("2024-03-25"),
              updatedAt: new Date("2024-03-25"),
            },
          ];
          filteredEvents = mockEvents;
          if (filter) {
            if (filter.dateRange) {
              filteredEvents = filteredEvents.filter(function (event) {
                return event.date >= filter.dateRange.start && event.date <= filter.dateRange.end;
              });
            }
            if (filter.types && filter.types.length > 0) {
              filteredEvents = filteredEvents.filter(function (event) {
                return filter.types.includes(event.type);
              });
            }
            if (filter.categories && filter.categories.length > 0) {
              filteredEvents = filteredEvents.filter(function (event) {
                return filter.categories.includes(event.category);
              });
            }
            if (filter.severity && filter.severity.length > 0) {
              filteredEvents = filteredEvents.filter(function (event) {
                return event.severity && filter.severity.includes(event.severity);
              });
            }
            if (filter.status && filter.status.length > 0) {
              filteredEvents = filteredEvents.filter(function (event) {
                return filter.status.includes(event.status);
              });
            }
          }
          // Ordenar por data (mais recente primeiro)
          return [
            2 /*return*/,
            filteredEvents.sort(function (a, b) {
              return b.date.getTime() - a.date.getTime();
            }),
          ];
        } catch (error) {
          console.error("Erro ao recuperar timeline do paciente:", error);
          throw new Error("Falha ao carregar timeline médica");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Atualiza um evento existente na timeline
   */
  MedicalTimelineManager.prototype.updateTimelineEvent = function (eventId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var updatedEvent;
      return __generator(this, function (_a) {
        try {
          updatedEvent = {
            id: eventId,
            patientId: updates.patientId || "",
            type: updates.type || "note",
            category: updates.category || "primary_care",
            date: updates.date || new Date(),
            title: updates.title || "",
            description: updates.description || "",
            provider: updates.provider || "",
            facility: updates.facility,
            severity: updates.severity,
            status: updates.status || "completed",
            attachments: updates.attachments,
            relatedEvents: updates.relatedEvents,
            metadata: updates.metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return [2 /*return*/, updatedEvent];
        } catch (error) {
          console.error("Erro ao atualizar evento da timeline:", error);
          throw new Error("Falha ao atualizar evento médico");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Remove um evento da timeline
   */
  MedicalTimelineManager.prototype.deleteTimelineEvent = function (eventId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // Simular remoção do evento
          return [2 /*return*/, true];
        } catch (error) {
          console.error("Erro ao remover evento da timeline:", error);
          throw new Error("Falha ao remover evento médico");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Gera análise estatística da timeline médica
   */
  MedicalTimelineManager.prototype.getTimelineAnalytics = function (patientId_1) {
    return __awaiter(this, arguments, void 0, function (patientId, timeframe) {
      var timeline, analytics, error_1;
      if (timeframe === void 0) {
        timeframe = "1year";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getPatientTimeline(patientId)];
          case 1:
            timeline = _a.sent();
            analytics = {
              totalEvents: timeline.length,
              eventsByType: timeline.reduce(function (acc, event) {
                acc[event.type] = (acc[event.type] || 0) + 1;
                return acc;
              }, {}),
              eventsByCategory: timeline.reduce(function (acc, event) {
                acc[event.category] = (acc[event.category] || 0) + 1;
                return acc;
              }, {}),
              averageEventsPerMonth: timeline.length / 12,
              mostActiveProvider: "Dr. Maria Silva",
              chronicConditions: [
                {
                  id: "cond_001",
                  name: "Pré-hipertensão",
                  icd10Code: "R03.0",
                  diagnosedDate: new Date("2024-02-01"),
                  status: "monitored",
                  severity: "moderate",
                  description: "Pressão arterial limite, em tratamento",
                  treatmentPlan: "Medicação + modificações no estilo de vida",
                },
              ],
              upcomingEvents: timeline.filter(function (event) {
                return event.status === "scheduled" && event.date > new Date();
              }),
              recentSignificantEvents: timeline
                .filter(function (event) {
                  return event.severity && ["high", "critical"].includes(event.severity);
                })
                .slice(0, 5),
            };
            return [2 /*return*/, analytics];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao gerar análise da timeline:", error_1);
            throw new Error("Falha na análise da timeline médica");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Busca eventos por critérios específicos
   */
  MedicalTimelineManager.prototype.searchTimelineEvents = function (patientId, query) {
    return __awaiter(this, void 0, void 0, function () {
      var timeline, searchResults, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getPatientTimeline(patientId)];
          case 1:
            timeline = _a.sent();
            searchResults = timeline.filter(function (event) {
              return (
                event.title.toLowerCase().includes(query.toLowerCase()) ||
                event.description.toLowerCase().includes(query.toLowerCase()) ||
                event.provider.toLowerCase().includes(query.toLowerCase())
              );
            });
            return [2 /*return*/, searchResults];
          case 2:
            error_2 = _a.sent();
            console.error("Erro na busca de eventos:", error_2);
            throw new Error("Falha na busca de eventos médicos");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Exporta timeline em diferentes formatos
   */
  MedicalTimelineManager.prototype.exportTimeline = function (patientId_1) {
    return __awaiter(this, arguments, void 0, function (patientId, format) {
      var timeline, csvHeaders, csvData, error_3;
      if (format === void 0) {
        format = "json";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getPatientTimeline(patientId)];
          case 1:
            timeline = _a.sent();
            switch (format) {
              case "json":
                return [
                  2 /*return*/,
                  {
                    patientId: patientId,
                    exportedAt: new Date(),
                    events: timeline,
                  },
                ];
              case "csv":
                csvHeaders = "Data,Tipo,Categoria,Título,Descrição,Provedor,Status\n";
                csvData = timeline
                  .map(function (event) {
                    return ""
                      .concat(event.date.toISOString(), ",")
                      .concat(event.type, ",")
                      .concat(event.category, ',"')
                      .concat(event.title, '","')
                      .concat(event.description, '",')
                      .concat(event.provider, ",")
                      .concat(event.status);
                  })
                  .join("\n");
                return [2 /*return*/, csvHeaders + csvData];
              case "pdf":
                return [
                  2 /*return*/,
                  {
                    format: "pdf",
                    content: timeline,
                    metadata: {
                      title: "Timeline M\u00E9dica - Paciente ".concat(patientId),
                      exportedAt: new Date(),
                    },
                  },
                ];
              default:
                return [2 /*return*/, timeline];
            }
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Erro ao exportar timeline:", error_3);
            throw new Error("Falha na exportação da timeline");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return MedicalTimelineManager;
})();
exports.MedicalTimelineManager = MedicalTimelineManager;
var createmedicalTimelineManager = function () {
  return new MedicalTimelineManager();
};
exports.createmedicalTimelineManager = createmedicalTimelineManager;
