"use strict";
/**
 * LGPD Compliance Automation System
 * Sistema completo de automação de compliance LGPD para NeonPro
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 8º, 9º, 18º, 37º, 38º, 46º
 * @story Story 3.3: LGPD Compliance Automation
 */
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
exports.LGPDAutoAnonymizationService =
  exports.LGPDAutoReportingService =
  exports.LGPDAutoAuditService =
  exports.LGPDAutoDataSubjectRightsService =
  exports.LGPDAutoConsentService =
    void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var lgpd_1 = require("../../types/lgpd");
var lgpd_core_1 = require("./lgpd-core");
var audit_trail_1 = require("./audit-trail");
var encryption_1 = require("./encryption");
// ============================================================================
// AUTOMATIC CONSENT MANAGEMENT
// ============================================================================
var LGPDAutoConsentService = /** @class */ (function () {
  function LGPDAutoConsentService() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.complianceService = new lgpd_core_1.LGPDComplianceService();
  }
  /**
   * Configura regras de consentimento automático
   */
  LGPDAutoConsentService.prototype.createAutoConsentRule = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_auto_consent_rules")
                .insert(
                  __assign(__assign({}, rule), { createdAt: new Date(), updatedAt: new Date() }),
                )
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to create auto consent rule: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * Processa consentimento automático baseado em eventos
   */
  LGPDAutoConsentService.prototype.processAutoConsent = function (
    context,
    triggerEvent,
    eventData,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, rules, error, grantedConsents, _i, rules_1, rule, expiresAt, consent, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_auto_consent_rules")
                .select("*")
                .eq("clinicId", context.clinicId)
                .eq("triggerEvent", triggerEvent)
                .eq("isActive", true),
            ];
          case 1:
            (_a = _b.sent()), (rules = _a.data), (error = _a.error);
            if (error || !(rules === null || rules === void 0 ? void 0 : rules.length)) {
              return [2 /*return*/, []];
            }
            grantedConsents = [];
            (_i = 0), (rules_1 = rules);
            _b.label = 2;
          case 2:
            if (!(_i < rules_1.length)) return [3 /*break*/, 7];
            rule = rules_1[_i];
            if (!this.evaluateRuleConditions(rule.conditions, eventData)) return [3 /*break*/, 6];
            _b.label = 3;
          case 3:
            _b.trys.push([3, 5, , 6]);
            expiresAt = rule.expirationDays
              ? new Date(Date.now() + rule.expirationDays * 24 * 60 * 60 * 1000)
              : undefined;
            return [
              4 /*yield*/,
              this.complianceService.consent.grantConsent(
                context,
                rule.consentType,
                rule.legalBasis,
                rule.purpose,
                "".concat(rule.description, " (Autom\u00E1tico: ").concat(triggerEvent, ")"),
                expiresAt,
              ),
            ];
          case 4:
            consent = _b.sent();
            grantedConsents.push(consent);
            return [3 /*break*/, 6];
          case 5:
            error_1 = _b.sent();
            console.error("Failed to auto-grant consent for rule ".concat(rule.id, ":"), error_1);
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 2];
          case 7:
            return [2 /*return*/, grantedConsents];
        }
      });
    });
  };
  /**
   * Monitora expiração de consentimentos
   */
  LGPDAutoConsentService.prototype.monitorConsentExpiration = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var now, warningDate, expiring, expired, notified, _i, expiring_1, consent;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            now = new Date();
            warningDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("*")
                .eq("clinicId", clinicId)
                .eq("status", lgpd_1.ConsentStatus.GRANTED)
                .gte("expiresAt", now.toISOString())
                .lte("expiresAt", warningDate.toISOString()),
            ];
          case 1:
            expiring = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("*")
                .eq("clinicId", clinicId)
                .eq("status", lgpd_1.ConsentStatus.GRANTED)
                .lt("expiresAt", now.toISOString()),
            ];
          case 2:
            expired = _a.sent().data;
            if (!(expired === null || expired === void 0 ? void 0 : expired.length))
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .update({ status: lgpd_1.ConsentStatus.EXPIRED })
                .in(
                  "id",
                  expired.map(function (c) {
                    return c.id;
                  }),
                ),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            notified = 0;
            if (!(expiring === null || expiring === void 0 ? void 0 : expiring.length))
              return [3 /*break*/, 8];
            (_i = 0), (expiring_1 = expiring);
            _a.label = 5;
          case 5:
            if (!(_i < expiring_1.length)) return [3 /*break*/, 8];
            consent = expiring_1[_i];
            return [4 /*yield*/, this.sendConsentExpirationNotification(consent)];
          case 6:
            _a.sent();
            notified++;
            _a.label = 7;
          case 7:
            _i++;
            return [3 /*break*/, 5];
          case 8:
            return [
              2 /*return*/,
              {
                expiring: expiring || [],
                expired: expired || [],
                notified: notified,
              },
            ];
        }
      });
    });
  };
  /**
   * Avalia condições de uma regra de consentimento
   */
  LGPDAutoConsentService.prototype.evaluateRuleConditions = function (conditions, eventData) {
    for (var _i = 0, _a = Object.entries(conditions); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        expectedValue = _b[1];
      var actualValue = this.getNestedValue(eventData, key);
      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(actualValue)) {
          return false;
        }
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }
    return true;
  };
  /**
   * Obtém valor aninhado de um objeto
   */
  LGPDAutoConsentService.prototype.getNestedValue = function (obj, path) {
    return path.split(".").reduce(function (current, key) {
      return current === null || current === void 0 ? void 0 : current[key];
    }, obj);
  };
  /**
   * Envia notificação de expiração de consentimento
   */
  LGPDAutoConsentService.prototype.sendConsentExpirationNotification = function (consent) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar notificação (email, Slack, etc.)
        console.log("Consent expiring: ".concat(consent.id, " for user ").concat(consent.userId));
        return [2 /*return*/];
      });
    });
  };
  return LGPDAutoConsentService;
})();
exports.LGPDAutoConsentService = LGPDAutoConsentService;
// ============================================================================
// AUTOMATIC DATA SUBJECT RIGHTS MANAGEMENT
// ============================================================================
var LGPDAutoDataSubjectRightsService = /** @class */ (function () {
  function LGPDAutoDataSubjectRightsService() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.complianceService = new lgpd_core_1.LGPDComplianceService();
  }
  /**
   * Processa automaticamente solicitações de direitos
   */
  LGPDAutoDataSubjectRightsService.prototype.processDataSubjectRequests = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        requests,
        error,
        processed,
        automated,
        requiresManualReview,
        _i,
        requests_1,
        request,
        canAutomate,
        error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .select("*")
                .eq("clinicId", clinicId)
                .eq("status", lgpd_1.RequestStatus.PENDING)
                .order("requestedAt", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (requests = _a.data), (error = _a.error);
            if (error || !(requests === null || requests === void 0 ? void 0 : requests.length)) {
              return [2 /*return*/, { processed: 0, automated: 0, requiresManualReview: 0 }];
            }
            processed = 0;
            automated = 0;
            requiresManualReview = 0;
            (_i = 0), (requests_1 = requests);
            _b.label = 2;
          case 2:
            if (!(_i < requests_1.length)) return [3 /*break*/, 11];
            request = requests_1[_i];
            _b.label = 3;
          case 3:
            _b.trys.push([3, 9, , 10]);
            return [4 /*yield*/, this.canAutomateRequest(request)];
          case 4:
            canAutomate = _b.sent();
            if (!canAutomate) return [3 /*break*/, 6];
            return [4 /*yield*/, this.automateDataSubjectRequest(request)];
          case 5:
            _b.sent();
            automated++;
            return [3 /*break*/, 8];
          case 6:
            return [4 /*yield*/, this.flagForManualReview(request)];
          case 7:
            _b.sent();
            requiresManualReview++;
            _b.label = 8;
          case 8:
            processed++;
            return [3 /*break*/, 10];
          case 9:
            error_2 = _b.sent();
            console.error("Failed to process request ".concat(request.id, ":"), error_2);
            return [3 /*break*/, 10];
          case 10:
            _i++;
            return [3 /*break*/, 2];
          case 11:
            return [
              2 /*return*/,
              {
                processed: processed,
                automated: automated,
                requiresManualReview: requiresManualReview,
              },
            ];
        }
      });
    });
  };
  /**
   * Verifica se uma solicitação pode ser automatizada
   */
  LGPDAutoDataSubjectRightsService.prototype.canAutomateRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = request.requestType;
            switch (_a) {
              case lgpd_1.DataSubjectRight.ACCESS:
                return [3 /*break*/, 1];
              case lgpd_1.DataSubjectRight.PORTABILITY:
                return [3 /*break*/, 2];
              case lgpd_1.DataSubjectRight.RECTIFICATION:
                return [3 /*break*/, 3];
              case lgpd_1.DataSubjectRight.ELIMINATION:
                return [3 /*break*/, 4];
            }
            return [3 /*break*/, 6];
          case 1:
            return [2 /*return*/, true]; // Sempre pode ser automatizado
          case 2:
            return [2 /*return*/, true]; // Exportação de dados pode ser automatizada
          case 3:
            // Só automatizar se for correção simples
            return [2 /*return*/, this.isSimpleRectification(request)];
          case 4:
            return [4 /*yield*/, this.canDeleteUserData(request.userId, request.clinicId)];
          case 5:
            // Verificar se não há impedimentos legais
            return [2 /*return*/, _b.sent()];
          case 6:
            return [2 /*return*/, false]; // Outros tipos requerem revisão manual
        }
      });
    });
  };
  /**
   * Automatiza processamento de solicitação
   */
  LGPDAutoDataSubjectRightsService.prototype.automateDataSubjectRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .update({
                  status: lgpd_1.RequestStatus.IN_PROGRESS,
                  processedAt: new Date(),
                  processorId: "SYSTEM_AUTO",
                })
                .eq("id", request.id),
            ];
          case 1:
            _b.sent();
            _a = request.requestType;
            switch (_a) {
              case lgpd_1.DataSubjectRight.ACCESS:
                return [3 /*break*/, 2];
              case lgpd_1.DataSubjectRight.PORTABILITY:
                return [3 /*break*/, 4];
              case lgpd_1.DataSubjectRight.ELIMINATION:
                return [3 /*break*/, 6];
              case lgpd_1.DataSubjectRight.RECTIFICATION:
                return [3 /*break*/, 8];
            }
            return [3 /*break*/, 10];
          case 2:
            return [4 /*yield*/, this.automateAccessRequest(request)];
          case 3:
            _b.sent();
            return [3 /*break*/, 10];
          case 4:
            return [4 /*yield*/, this.automatePortabilityRequest(request)];
          case 5:
            _b.sent();
            return [3 /*break*/, 10];
          case 6:
            return [4 /*yield*/, this.automateErasureRequest(request)];
          case 7:
            _b.sent();
            return [3 /*break*/, 10];
          case 8:
            return [4 /*yield*/, this.automateRectificationRequest(request)];
          case 9:
            _b.sent();
            return [3 /*break*/, 10];
          case 10:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .update({
                  status: lgpd_1.RequestStatus.COMPLETED,
                  completedAt: new Date(),
                })
                .eq("id", request.id),
            ];
          case 11:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Automatiza solicitação de acesso
   */
  LGPDAutoDataSubjectRightsService.prototype.automateAccessRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var userData, report;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.complianceService.dataSubject.exportUserData(request.userId, request.clinicId),
            ];
          case 1:
            userData = _a.sent();
            report = {
              requestId: request.id,
              userId: request.userId,
              generatedAt: new Date(),
              data: userData,
            };
            // Salvar relatório
            return [4 /*yield*/, this.supabase.from("lgpd_access_reports").insert(report)];
          case 2:
            // Salvar relatório
            _a.sent();
            // Enviar por email (implementar)
            return [4 /*yield*/, this.sendAccessReport(request, report)];
          case 3:
            // Enviar por email (implementar)
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Automatiza solicitação de portabilidade
   */
  LGPDAutoDataSubjectRightsService.prototype.automatePortabilityRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var userData, exportData;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.complianceService.dataSubject.exportUserData(request.userId, request.clinicId),
            ];
          case 1:
            userData = _a.sent();
            exportData = {
              format: "JSON",
              version: "1.0",
              exportedAt: new Date(),
              data: userData,
            };
            // Salvar arquivo de exportação
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_data_exports").insert({
                requestId: request.id,
                userId: request.userId,
                clinicId: request.clinicId,
                format: "JSON",
                data: exportData,
                createdAt: new Date(),
              }),
            ];
          case 2:
            // Salvar arquivo de exportação
            _a.sent();
            // Enviar link de download (implementar)
            return [4 /*yield*/, this.sendPortabilityData(request, exportData)];
          case 3:
            // Enviar link de download (implementar)
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Automatiza solicitação de eliminação
   */
  LGPDAutoDataSubjectRightsService.prototype.automateErasureRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.complianceService.dataSubject.processErasureRequest(request.id, "SYSTEM_AUTO"),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Automatiza solicitação de retificação
   */
  LGPDAutoDataSubjectRightsService.prototype.automateRectificationRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar lógica de retificação automática
        // Por enquanto, apenas marcar como processada
        console.log("Auto-rectification for request ".concat(request.id));
        return [2 /*return*/];
      });
    });
  };
  /**
   * Marca solicitação para revisão manual
   */
  LGPDAutoDataSubjectRightsService.prototype.flagForManualReview = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .update({
                  status: lgpd_1.RequestStatus.IN_PROGRESS,
                  metadata: __assign(__assign({}, request.metadata), {
                    requiresManualReview: true,
                    flaggedAt: new Date(),
                    reason: "Complex request requiring human review",
                  }),
                })
                .eq("id", request.id),
            ];
          case 1:
            _a.sent();
            // Notificar equipe de compliance
            return [4 /*yield*/, this.notifyComplianceTeam(request)];
          case 2:
            // Notificar equipe de compliance
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verifica se é uma retificação simples
   */
  LGPDAutoDataSubjectRightsService.prototype.isSimpleRectification = function (request) {
    // Implementar lógica para determinar se é uma correção simples
    return false; // Por segurança, sempre requer revisão manual
  };
  /**
   * Verifica se dados do usuário podem ser deletados
   */
  LGPDAutoDataSubjectRightsService.prototype.canDeleteUserData = function (userId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var medicalRecords, fiveYearsAgo_1, recentRecords;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_records")
                .select("id, created_at")
                .eq("patient_id", userId)
                .eq("clinic_id", clinicId),
            ];
          case 1:
            medicalRecords = _a.sent().data;
            // Se há registros médicos recentes (< 5 anos), não pode deletar
            if (
              medicalRecords === null || medicalRecords === void 0 ? void 0 : medicalRecords.length
            ) {
              fiveYearsAgo_1 = new Date();
              fiveYearsAgo_1.setFullYear(fiveYearsAgo_1.getFullYear() - 5);
              recentRecords = medicalRecords.filter(function (record) {
                return new Date(record.created_at) > fiveYearsAgo_1;
              });
              return [2 /*return*/, recentRecords.length === 0];
            }
            return [2 /*return*/, true];
        }
      });
    });
  };
  /**
   * Envia relatório de acesso
   */
  LGPDAutoDataSubjectRightsService.prototype.sendAccessReport = function (request, report) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar envio de email com relatório
        console.log("Sending access report for request ".concat(request.id));
        return [2 /*return*/];
      });
    });
  };
  /**
   * Envia dados de portabilidade
   */
  LGPDAutoDataSubjectRightsService.prototype.sendPortabilityData = function (request, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar envio de dados de portabilidade
        console.log("Sending portability data for request ".concat(request.id));
        return [2 /*return*/];
      });
    });
  };
  /**
   * Notifica equipe de compliance
   */
  LGPDAutoDataSubjectRightsService.prototype.notifyComplianceTeam = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar notificação para equipe
        console.log("Manual review required for request ".concat(request.id));
        return [2 /*return*/];
      });
    });
  };
  return LGPDAutoDataSubjectRightsService;
})(); // ============================================================================
exports.LGPDAutoDataSubjectRightsService = LGPDAutoDataSubjectRightsService;
// AUTOMATIC COMPLIANCE AUDITING
// ============================================================================
var LGPDAutoAuditService = /** @class */ (function () {
  function LGPDAutoAuditService() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.auditService = new audit_trail_1.LGPDAuditTrailService();
  }
  /**
   * Executa auditoria automática de compliance
   */
  LGPDAutoAuditService.prototype.performComplianceAudit = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var timestamp,
        _a,
        consentCheck,
        retentionCheck,
        auditCheck,
        encryptionCheck,
        rightsCheck,
        overallScore,
        actionItems,
        healthCheck;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            timestamp = new Date();
            return [
              4 /*yield*/,
              Promise.all([
                this.auditConsentCompliance(clinicId),
                this.auditDataRetention(clinicId),
                this.auditAuditTrail(clinicId),
                this.auditEncryptionCompliance(clinicId),
                this.auditDataSubjectRights(clinicId),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (consentCheck = _a[0]),
              (retentionCheck = _a[1]),
              (auditCheck = _a[2]),
              (encryptionCheck = _a[3]),
              (rightsCheck = _a[4]);
            overallScore = Math.round(
              (consentCheck.score +
                retentionCheck.score +
                auditCheck.score +
                encryptionCheck.score +
                rightsCheck.score) /
                5,
            );
            actionItems = this.generateActionItems({
              consentCheck: consentCheck,
              retentionCheck: retentionCheck,
              auditCheck: auditCheck,
              encryptionCheck: encryptionCheck,
              rightsCheck: rightsCheck,
            });
            healthCheck = {
              clinicId: clinicId,
              timestamp: timestamp,
              overallScore: overallScore,
              checks: {
                consentCompliance: consentCheck,
                dataRetention: retentionCheck,
                auditTrail: auditCheck,
                encryption: encryptionCheck,
                dataSubjectRights: rightsCheck,
              },
              actionItems: actionItems,
            };
            // Salvar resultado da auditoria
            return [4 /*yield*/, this.saveComplianceHealthCheck(healthCheck)];
          case 2:
            // Salvar resultado da auditoria
            _b.sent();
            if (!(overallScore < 70)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.generateComplianceAlert(healthCheck)];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            return [2 /*return*/, healthCheck];
        }
      });
    });
  };
  /**
   * Auditoria de compliance de consentimento
   */
  LGPDAutoAuditService.prototype.auditConsentCompliance = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var issues, recommendations, score, expiredConsents, invalidConsents, usersWithoutConsent;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            issues = [];
            recommendations = [];
            score = 100;
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("id")
                .eq("clinicId", clinicId)
                .eq("status", lgpd_1.ConsentStatus.GRANTED)
                .lt("expiresAt", new Date().toISOString()),
            ];
          case 1:
            expiredConsents = _a.sent().data;
            if (
              expiredConsents === null || expiredConsents === void 0
                ? void 0
                : expiredConsents.length
            ) {
              issues.push(
                "".concat(expiredConsents.length, " consentimentos expirados encontrados"),
              );
              recommendations.push("Renovar ou revogar consentimentos expirados");
              score -= Math.min(30, expiredConsents.length * 2);
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("id")
                .eq("clinicId", clinicId)
                .is("legalBasis", null),
            ];
          case 2:
            invalidConsents = _a.sent().data;
            if (
              invalidConsents === null || invalidConsents === void 0
                ? void 0
                : invalidConsents.length
            ) {
              issues.push("".concat(invalidConsents.length, " consentimentos sem base legal"));
              recommendations.push("Definir base legal para todos os consentimentos");
              score -= Math.min(25, invalidConsents.length * 3);
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("users")
                .select(
                  "\n        id,\n        lgpd_consent_records!inner(\n          id,\n          consentType,\n          status\n        )\n      ",
                )
                .eq("clinic_id", clinicId)
                .neq("lgpd_consent_records.consentType", lgpd_1.ConsentType.SENSITIVE_DATA)
                .eq("lgpd_consent_records.status", lgpd_1.ConsentStatus.GRANTED),
            ];
          case 3:
            usersWithoutConsent = _a.sent().data;
            if (
              usersWithoutConsent === null || usersWithoutConsent === void 0
                ? void 0
                : usersWithoutConsent.length
            ) {
              issues.push(
                "".concat(
                  usersWithoutConsent.length,
                  " usu\u00E1rios sem consentimento para dados sens\u00EDveis",
                ),
              );
              recommendations.push("Solicitar consentimento para processamento de dados sensíveis");
              score -= Math.min(20, usersWithoutConsent.length);
            }
            return [
              2 /*return*/,
              {
                score: Math.max(0, score),
                issues: issues,
                recommendations: recommendations,
              },
            ];
        }
      });
    });
  };
  /**
   * Auditoria de retenção de dados
   */
  LGPDAutoAuditService.prototype.auditDataRetention = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations,
        score,
        expiredRecords,
        fiveYearsAgo,
        expiredMedicalRecords,
        twoYearsAgo,
        oldAuditLogs;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            recommendations = [];
            score = 100;
            expiredRecords = 0;
            fiveYearsAgo = new Date();
            fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_records")
                .select("id")
                .eq("clinic_id", clinicId)
                .lt("created_at", fiveYearsAgo.toISOString())
                .eq("anonymized", false),
            ];
          case 1:
            expiredMedicalRecords = _a.sent().data;
            if (
              expiredMedicalRecords === null || expiredMedicalRecords === void 0
                ? void 0
                : expiredMedicalRecords.length
            ) {
              expiredRecords += expiredMedicalRecords.length;
              recommendations.push(
                "Anonimizar ou deletar ".concat(
                  expiredMedicalRecords.length,
                  " registros m\u00E9dicos expirados",
                ),
              );
              score -= Math.min(40, expiredMedicalRecords.length);
            }
            twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_audit_logs")
                .select("id")
                .eq("clinicId", clinicId)
                .lt("timestamp", twoYearsAgo.toISOString()),
            ];
          case 2:
            oldAuditLogs = _a.sent().data;
            if (oldAuditLogs === null || oldAuditLogs === void 0 ? void 0 : oldAuditLogs.length) {
              expiredRecords += oldAuditLogs.length;
              recommendations.push(
                "Arquivar ".concat(oldAuditLogs.length, " logs de auditoria antigos"),
              );
              score -= Math.min(20, Math.floor(oldAuditLogs.length / 100));
            }
            return [
              2 /*return*/,
              {
                score: Math.max(0, score),
                expiredRecords: expiredRecords,
                recommendations: recommendations,
              },
            ];
        }
      });
    });
  };
  /**
   * Auditoria de trilha de auditoria
   */
  LGPDAutoAuditService.prototype.auditAuditTrail = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations,
        score,
        missingLogs,
        last24Hours,
        recentLogs,
        expectedMinimumLogs,
        criticalEvents,
        _i,
        criticalEvents_1,
        eventType,
        criticalLogs;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            recommendations = [];
            score = 100;
            missingLogs = 0;
            last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_audit_logs")
                .select("id")
                .eq("clinicId", clinicId)
                .gte("timestamp", last24Hours.toISOString()),
            ];
          case 1:
            recentLogs = _a.sent().data;
            expectedMinimumLogs = 10;
            if (!recentLogs || recentLogs.length < expectedMinimumLogs) {
              missingLogs =
                expectedMinimumLogs -
                ((recentLogs === null || recentLogs === void 0 ? void 0 : recentLogs.length) || 0);
              recommendations.push("Verificar se todos os eventos estão sendo auditados");
              score -= 30;
            }
            criticalEvents = [
              lgpd_1.AuditEventType.DATA_BREACH,
              lgpd_1.AuditEventType.UNAUTHORIZED_ACCESS,
              lgpd_1.AuditEventType.CONSENT_WITHDRAWN,
            ];
            (_i = 0), (criticalEvents_1 = criticalEvents);
            _a.label = 2;
          case 2:
            if (!(_i < criticalEvents_1.length)) return [3 /*break*/, 5];
            eventType = criticalEvents_1[_i];
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_audit_logs")
                .select("id")
                .eq("clinicId", clinicId)
                .eq("eventType", eventType)
                .gte("timestamp", last24Hours.toISOString()),
            ];
          case 3:
            criticalLogs = _a.sent().data;
            if (
              !(criticalLogs === null || criticalLogs === void 0 ? void 0 : criticalLogs.length)
            ) {
              // Verificar se houve eventos que deveriam ter sido auditados
              // Esta é uma verificação simplificada
              return [3 /*break*/, 4];
            }
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [
              2 /*return*/,
              {
                score: Math.max(0, score),
                missingLogs: missingLogs,
                recommendations: recommendations,
              },
            ];
        }
      });
    });
  };
  /**
   * Auditoria de compliance de criptografia
   */
  LGPDAutoAuditService.prototype.auditEncryptionCompliance = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var unencryptedFields,
        recommendations,
        score,
        sensitiveFields,
        _i,
        sensitiveFields_1,
        _a,
        table,
        field,
        data,
        error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            unencryptedFields = [];
            recommendations = [];
            score = 100;
            sensitiveFields = [
              { table: "users", field: "cpf" },
              { table: "users", field: "rg" },
              { table: "medical_records", field: "diagnosis" },
              { table: "medical_records", field: "treatment" },
            ];
            (_i = 0), (sensitiveFields_1 = sensitiveFields);
            _b.label = 1;
          case 1:
            if (!(_i < sensitiveFields_1.length)) return [3 /*break*/, 6];
            (_a = sensitiveFields_1[_i]), (table = _a.table), (field = _a.field);
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from(table)
                .select("".concat(field))
                .eq("clinic_id", clinicId)
                .not(field, "is", null)
                .limit(1),
            ];
          case 3:
            data = _b.sent().data;
            if (
              (data === null || data === void 0 ? void 0 : data.length) &&
              !this.isFieldEncrypted(data[0][field])
            ) {
              unencryptedFields.push("".concat(table, ".").concat(field));
              score -= 15;
            }
            return [3 /*break*/, 5];
          case 4:
            error_3 = _b.sent();
            // Campo pode não existir ou não ser acessível
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            if (unencryptedFields.length) {
              recommendations.push("Criptografar campos sensíveis identificados");
              recommendations.push("Implementar criptografia automática para novos dados");
            }
            return [
              2 /*return*/,
              {
                score: Math.max(0, score),
                unencryptedFields: unencryptedFields,
                recommendations: recommendations,
              },
            ];
        }
      });
    });
  };
  /**
   * Auditoria de direitos dos titulares
   */
  LGPDAutoAuditService.prototype.auditDataSubjectRights = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations,
        score,
        pendingRequests,
        pendingCount,
        fifteenDaysAgo,
        overdueRequests,
        overdueCount;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            recommendations = [];
            score = 100;
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .select("id, requestedAt")
                .eq("clinicId", clinicId)
                .eq("status", lgpd_1.RequestStatus.PENDING),
            ];
          case 1:
            pendingRequests = _a.sent().data;
            pendingCount =
              (pendingRequests === null || pendingRequests === void 0
                ? void 0
                : pendingRequests.length) || 0;
            fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
            overdueRequests =
              (pendingRequests === null || pendingRequests === void 0
                ? void 0
                : pendingRequests.filter(function (req) {
                    return new Date(req.requestedAt) < fifteenDaysAgo;
                  })) || [];
            overdueCount = overdueRequests.length;
            if (pendingCount > 0) {
              score -= Math.min(30, pendingCount * 3);
              recommendations.push(
                "Processar ".concat(pendingCount, " solicita\u00E7\u00F5es pendentes"),
              );
            }
            if (overdueCount > 0) {
              score -= Math.min(40, overdueCount * 5);
              recommendations.push(
                "URGENTE: ".concat(overdueCount, " solicita\u00E7\u00F5es em atraso (>15 dias)"),
              );
            }
            return [
              2 /*return*/,
              {
                score: Math.max(0, score),
                pendingRequests: pendingCount,
                overdueRequests: overdueCount,
                recommendations: recommendations,
              },
            ];
        }
      });
    });
  };
  /**
   * Gera itens de ação baseados na auditoria
   */
  LGPDAutoAuditService.prototype.generateActionItems = function (checks) {
    var actionItems = [];
    var now = new Date();
    // Itens críticos (score < 50)
    Object.entries(checks).forEach(function (_a) {
      var checkName = _a[0],
        check = _a[1];
      if (check.score < 50) {
        actionItems.push({
          priority: "critical",
          description: "Resolver problemas cr\u00EDticos em ".concat(checkName),
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 dias
        });
      } else if (check.score < 70) {
        actionItems.push({
          priority: "high",
          description: "Melhorar compliance em ".concat(checkName),
          dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        });
      }
    });
    // Itens específicos
    if (checks.rightsCheck.overdueRequests > 0) {
      actionItems.push({
        priority: "critical",
        description: "Processar ".concat(
          checks.rightsCheck.overdueRequests,
          " solicita\u00E7\u00F5es em atraso",
        ),
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 dia
      });
    }
    if (checks.retentionCheck.expiredRecords > 100) {
      actionItems.push({
        priority: "high",
        description: "Executar limpeza de dados expirados",
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 dias
      });
    }
    return actionItems;
  };
  /**
   * Salva resultado da verificação de compliance
   */
  LGPDAutoAuditService.prototype.saveComplianceHealthCheck = function (healthCheck) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_compliance_health_checks").insert(healthCheck),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera alerta de compliance
   */
  LGPDAutoAuditService.prototype.generateComplianceAlert = function (healthCheck) {
    return __awaiter(this, void 0, void 0, function () {
      var alert;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alert = {
              clinicId: healthCheck.clinicId,
              severity: healthCheck.overallScore < 50 ? "critical" : "high",
              title: "Compliance Score Baixo: ".concat(healthCheck.overallScore, "%"),
              description: "Auditoria autom\u00E1tica detectou problemas de compliance",
              actionItems: healthCheck.actionItems,
              createdAt: new Date(),
            };
            return [4 /*yield*/, this.supabase.from("lgpd_compliance_alerts").insert(alert)];
          case 1:
            _a.sent();
            // Enviar notificações
            return [4 /*yield*/, this.sendComplianceAlert(alert)];
          case 2:
            // Enviar notificações
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verifica se um campo está criptografado
   */
  LGPDAutoAuditService.prototype.isFieldEncrypted = function (value) {
    if (typeof value !== "string") return false;
    // Verificação simples - em produção seria mais robusta
    return value.includes(":") && value.length > 50;
  };
  /**
   * Envia alerta de compliance
   */
  LGPDAutoAuditService.prototype.sendComplianceAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar envio de notificações
        console.log("Compliance alert: ".concat(alert.title));
        return [2 /*return*/];
      });
    });
  };
  return LGPDAutoAuditService;
})(); // ============================================================================
exports.LGPDAutoAuditService = LGPDAutoAuditService;
// AUTOMATIC COMPLIANCE REPORTING
// ============================================================================
var LGPDAutoReportingService = /** @class */ (function () {
  function LGPDAutoReportingService() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  /**
   * Gera relatórios automáticos de compliance
   */
  LGPDAutoReportingService.prototype.generateComplianceReports = function (clinicId, reportTypes) {
    return __awaiter(this, void 0, void 0, function () {
      var reports, _i, reportTypes_1, reportType, report, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            reports = [];
            (_i = 0), (reportTypes_1 = reportTypes);
            _a.label = 1;
          case 1:
            if (!(_i < reportTypes_1.length)) return [3 /*break*/, 6];
            reportType = reportTypes_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.generateReport(clinicId, reportType)];
          case 3:
            report = _a.sent();
            reports.push(report);
            return [3 /*break*/, 5];
          case 4:
            error_4 = _a.sent();
            console.error("Failed to generate report ".concat(reportType, ":"), error_4);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, reports];
        }
      });
    });
  };
  /**
   * Gera relatório específico
   */
  LGPDAutoReportingService.prototype.generateReport = function (clinicId, reportType) {
    return __awaiter(this, void 0, void 0, function () {
      var now, startDate, endDate, reportData, title, description, _a, report;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            _a = reportType;
            switch (_a) {
              case lgpd_1.ComplianceReportType.CONSENT_SUMMARY:
                return [3 /*break*/, 1];
              case lgpd_1.ComplianceReportType.DATA_PROCESSING:
                return [3 /*break*/, 3];
              case lgpd_1.ComplianceReportType.AUDIT_TRAIL:
                return [3 /*break*/, 5];
              case lgpd_1.ComplianceReportType.DATA_INVENTORY:
                return [3 /*break*/, 7];
              case lgpd_1.ComplianceReportType.RISK_ASSESSMENT:
                return [3 /*break*/, 9];
            }
            return [3 /*break*/, 11];
          case 1:
            return [4 /*yield*/, this.generateConsentSummaryData(clinicId, startDate, endDate)];
          case 2:
            reportData = _b.sent();
            title = "Relatório de Consentimentos";
            description = "Resumo dos consentimentos concedidos, revogados e expirados";
            return [3 /*break*/, 12];
          case 3:
            return [4 /*yield*/, this.generateDataProcessingData(clinicId, startDate, endDate)];
          case 4:
            reportData = _b.sent();
            title = "Relatório de Processamento de Dados";
            description = "Atividades de processamento de dados pessoais";
            return [3 /*break*/, 12];
          case 5:
            return [4 /*yield*/, this.generateAuditTrailData(clinicId, startDate, endDate)];
          case 6:
            reportData = _b.sent();
            title = "Relatório de Trilha de Auditoria";
            description = "Eventos de auditoria e atividades do sistema";
            return [3 /*break*/, 12];
          case 7:
            return [4 /*yield*/, this.generateDataInventoryData(clinicId)];
          case 8:
            reportData = _b.sent();
            title = "Inventário de Dados";
            description = "Mapeamento de dados pessoais processados";
            return [3 /*break*/, 12];
          case 9:
            return [4 /*yield*/, this.generateRiskAssessmentData(clinicId, startDate, endDate)];
          case 10:
            reportData = _b.sent();
            title = "Avaliação de Riscos";
            description = "Análise de riscos de privacidade e segurança";
            return [3 /*break*/, 12];
          case 11:
            throw new Error("Unsupported report type: ".concat(reportType));
          case 12:
            report = {
              id: crypto.randomUUID(),
              clinicId: clinicId,
              reportType: reportType,
              title: title,
              description: description,
              period: { startDate: startDate, endDate: endDate },
              data: reportData,
              generatedAt: now,
              generatedBy: "SYSTEM_AUTO",
              status: "final",
            };
            // Salvar relatório
            return [4 /*yield*/, this.supabase.from("lgpd_compliance_reports").insert(report)];
          case 13:
            // Salvar relatório
            _b.sent();
            return [2 /*return*/, report];
        }
      });
    });
  };
  /**
   * Gera dados do relatório de consentimentos
   */
  LGPDAutoReportingService.prototype.generateConsentSummaryData = function (
    clinicId,
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var consentsByType, consentsByStatus, typeStats, statusStats;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("consentType, status")
                .eq("clinicId", clinicId)
                .gte("createdAt", startDate.toISOString())
                .lte("createdAt", endDate.toISOString()),
            ];
          case 1:
            consentsByType = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("status")
                .eq("clinicId", clinicId)
                .gte("createdAt", startDate.toISOString())
                .lte("createdAt", endDate.toISOString()),
            ];
          case 2:
            consentsByStatus = _a.sent().data;
            typeStats = this.groupBy(consentsByType || [], "consentType");
            statusStats = this.groupBy(consentsByStatus || [], "status");
            return [
              2 /*return*/,
              {
                summary: {
                  totalConsents:
                    (consentsByType === null || consentsByType === void 0
                      ? void 0
                      : consentsByType.length) || 0,
                  byType: typeStats,
                  byStatus: statusStats,
                },
                trends: {
                  granted: statusStats[lgpd_1.ConsentStatus.GRANTED] || 0,
                  withdrawn: statusStats[lgpd_1.ConsentStatus.WITHDRAWN] || 0,
                  expired: statusStats[lgpd_1.ConsentStatus.EXPIRED] || 0,
                },
                compliance: {
                  activeConsents: statusStats[lgpd_1.ConsentStatus.GRANTED] || 0,
                  expirationRate: this.calculateExpirationRate(statusStats),
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Gera dados do relatório de processamento
   */
  LGPDAutoReportingService.prototype.generateDataProcessingData = function (
    clinicId,
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var processingEvents, eventStats;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_audit_logs")
                .select("eventType, timestamp")
                .eq("clinicId", clinicId)
                .in("eventType", [
                  lgpd_1.AuditEventType.DATA_ACCESS,
                  lgpd_1.AuditEventType.DATA_MODIFICATION,
                  lgpd_1.AuditEventType.DATA_DELETION,
                ])
                .gte("timestamp", startDate.toISOString())
                .lte("timestamp", endDate.toISOString()),
            ];
          case 1:
            processingEvents = _a.sent().data;
            eventStats = this.groupBy(processingEvents || [], "eventType");
            return [
              2 /*return*/,
              {
                summary: {
                  totalEvents:
                    (processingEvents === null || processingEvents === void 0
                      ? void 0
                      : processingEvents.length) || 0,
                  byType: eventStats,
                },
                activities: {
                  dataAccess: eventStats[lgpd_1.AuditEventType.DATA_ACCESS] || 0,
                  dataModification: eventStats[lgpd_1.AuditEventType.DATA_MODIFICATION] || 0,
                  dataDeletion: eventStats[lgpd_1.AuditEventType.DATA_DELETION] || 0,
                },
                compliance: {
                  auditCoverage: this.calculateAuditCoverage(processingEvents || []),
                  riskLevel: this.assessProcessingRisk(eventStats),
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Gera dados da trilha de auditoria
   */
  LGPDAutoReportingService.prototype.generateAuditTrailData = function (
    clinicId,
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var auditEvents, eventTypeStats, riskLevelStats;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_audit_logs")
                .select("eventType, riskLevel, timestamp")
                .eq("clinicId", clinicId)
                .gte("timestamp", startDate.toISOString())
                .lte("timestamp", endDate.toISOString()),
            ];
          case 1:
            auditEvents = _a.sent().data;
            eventTypeStats = this.groupBy(auditEvents || [], "eventType");
            riskLevelStats = this.groupBy(auditEvents || [], "riskLevel");
            return [
              2 /*return*/,
              {
                summary: {
                  totalEvents:
                    (auditEvents === null || auditEvents === void 0
                      ? void 0
                      : auditEvents.length) || 0,
                  byEventType: eventTypeStats,
                  byRiskLevel: riskLevelStats,
                },
                security: {
                  criticalEvents: riskLevelStats["critical"] || 0,
                  highRiskEvents: riskLevelStats["high"] || 0,
                  securityIncidents: this.countSecurityIncidents(auditEvents || []),
                },
                compliance: {
                  auditCompleteness: this.calculateAuditCompleteness(auditEvents || []),
                  retentionCompliance: 100, // Simplificado
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Gera inventário de dados
   */
  LGPDAutoReportingService.prototype.generateDataInventoryData = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var tables, inventory, _i, tables_1, table, count, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            tables = [
              { name: "users", description: "Dados pessoais dos usuários" },
              { name: "medical_records", description: "Registros médicos" },
              { name: "appointments", description: "Agendamentos" },
              { name: "prescriptions", description: "Prescrições médicas" },
            ];
            inventory = [];
            (_i = 0), (tables_1 = tables);
            _a.label = 1;
          case 1:
            if (!(_i < tables_1.length)) return [3 /*break*/, 6];
            table = tables_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from(table.name)
                .select("*", { count: "exact", head: true })
                .eq("clinic_id", clinicId),
            ];
          case 3:
            count = _a.sent().count;
            inventory.push({
              dataType: table.name,
              description: table.description,
              recordCount: count || 0,
              dataClassification: this.classifyDataType(table.name),
              retentionPeriod: this.getRetentionPeriod(table.name),
              encryptionStatus: "encrypted", // Simplificado
            });
            return [3 /*break*/, 5];
          case 4:
            error_5 = _a.sent();
            console.error("Error counting ".concat(table.name, ":"), error_5);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [
              2 /*return*/,
              {
                inventory: inventory,
                summary: {
                  totalDataTypes: inventory.length,
                  totalRecords: inventory.reduce(function (sum, item) {
                    return sum + item.recordCount;
                  }, 0),
                  sensitiveDataTypes: inventory.filter(function (item) {
                    return item.dataClassification === "sensitive";
                  }).length,
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Gera avaliação de riscos
   */
  LGPDAutoReportingService.prototype.generateRiskAssessmentData = function (
    clinicId,
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var highRiskEvents, accessViolations, riskScore;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_audit_logs")
                .select("eventType, riskLevel")
                .eq("clinicId", clinicId)
                .in("riskLevel", ["high", "critical"])
                .gte("timestamp", startDate.toISOString())
                .lte("timestamp", endDate.toISOString()),
            ];
          case 1:
            highRiskEvents = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_audit_logs")
                .select("id")
                .eq("clinicId", clinicId)
                .eq("eventType", lgpd_1.AuditEventType.UNAUTHORIZED_ACCESS)
                .gte("timestamp", startDate.toISOString())
                .lte("timestamp", endDate.toISOString()),
            ];
          case 2:
            accessViolations = _a.sent().data;
            riskScore = this.calculateRiskScore({
              highRiskEvents:
                (highRiskEvents === null || highRiskEvents === void 0
                  ? void 0
                  : highRiskEvents.length) || 0,
              accessViolations:
                (accessViolations === null || accessViolations === void 0
                  ? void 0
                  : accessViolations.length) || 0,
            });
            return [
              2 /*return*/,
              {
                riskScore: riskScore,
                riskLevel: this.getRiskLevel(riskScore),
                threats: {
                  unauthorizedAccess:
                    (accessViolations === null || accessViolations === void 0
                      ? void 0
                      : accessViolations.length) || 0,
                  dataBreaches: 0, // Implementar detecção
                  consentViolations: this.countConsentViolations(highRiskEvents || []),
                },
                recommendations: this.generateRiskRecommendations(riskScore),
              },
            ];
        }
      });
    });
  };
  // Métodos auxiliares
  LGPDAutoReportingService.prototype.groupBy = function (array, key) {
    return array.reduce(function (result, item) {
      var group = item[key];
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  };
  LGPDAutoReportingService.prototype.calculateExpirationRate = function (statusStats) {
    var total = Object.values(statusStats).reduce(function (sum, count) {
      return sum + count;
    }, 0);
    var expired = statusStats[lgpd_1.ConsentStatus.EXPIRED] || 0;
    return total > 0 ? Math.round((expired / total) * 100) : 0;
  };
  LGPDAutoReportingService.prototype.calculateAuditCoverage = function (events) {
    // Simplificado - em produção seria mais complexo
    return events.length > 100 ? 95 : Math.max(50, events.length);
  };
  LGPDAutoReportingService.prototype.assessProcessingRisk = function (eventStats) {
    var deletions = eventStats[lgpd_1.AuditEventType.DATA_DELETION] || 0;
    var modifications = eventStats[lgpd_1.AuditEventType.DATA_MODIFICATION] || 0;
    if (deletions > 50 || modifications > 200) return "high";
    if (deletions > 20 || modifications > 100) return "medium";
    return "low";
  };
  LGPDAutoReportingService.prototype.countSecurityIncidents = function (events) {
    return events.filter(function (event) {
      return (
        event.eventType === lgpd_1.AuditEventType.UNAUTHORIZED_ACCESS ||
        event.eventType === lgpd_1.AuditEventType.DATA_BREACH
      );
    }).length;
  };
  LGPDAutoReportingService.prototype.calculateAuditCompleteness = function (events) {
    // Simplificado
    return events.length > 1000 ? 100 : Math.max(70, Math.floor(events.length / 10));
  };
  LGPDAutoReportingService.prototype.classifyDataType = function (tableName) {
    var sensitiveTypes = ["medical_records", "prescriptions"];
    return sensitiveTypes.includes(tableName) ? "sensitive" : "personal";
  };
  LGPDAutoReportingService.prototype.getRetentionPeriod = function (tableName) {
    var periods = {
      medical_records: "20 anos",
      prescriptions: "5 anos",
      users: "5 anos após inatividade",
      appointments: "2 anos",
    };
    return periods[tableName] || "2 anos";
  };
  LGPDAutoReportingService.prototype.calculateRiskScore = function (factors) {
    var score = 0;
    score += factors.highRiskEvents * 10;
    score += factors.accessViolations * 20;
    return Math.min(100, score);
  };
  LGPDAutoReportingService.prototype.getRiskLevel = function (score) {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    return "low";
  };
  LGPDAutoReportingService.prototype.countConsentViolations = function (events) {
    return events.filter(function (event) {
      return event.eventType === lgpd_1.AuditEventType.CONSENT_WITHDRAWN;
    }).length;
  };
  LGPDAutoReportingService.prototype.generateRiskRecommendations = function (score) {
    var recommendations = [];
    if (score >= 80) {
      recommendations.push("Revisar imediatamente políticas de segurança");
      recommendations.push("Implementar monitoramento 24/7");
      recommendations.push("Treinar equipe sobre LGPD");
    } else if (score >= 60) {
      recommendations.push("Fortalecer controles de acesso");
      recommendations.push("Aumentar frequência de auditorias");
    } else if (score >= 40) {
      recommendations.push("Manter monitoramento regular");
      recommendations.push("Revisar políticas trimestralmente");
    } else {
      recommendations.push("Manter boas práticas atuais");
    }
    return recommendations;
  };
  return LGPDAutoReportingService;
})(); // ============================================================================
exports.LGPDAutoReportingService = LGPDAutoReportingService;
var LGPDAutoAnonymizationService = /** @class */ (function () {
  function LGPDAutoAnonymizationService() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.encryptionService = new encryption_1.LGPDEncryptionService();
  }
  /**
   * Executa anonimização automática baseada em regras
   */
  LGPDAutoAnonymizationService.prototype.executeAutoAnonymization = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var job, rules, _i, rules_2, rule, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            job = {
              id: crypto.randomUUID(),
              clinicId: clinicId,
              rules: [],
              status: "pending",
              recordsProcessed: 0,
              recordsAnonymized: 0,
              startedAt: new Date(),
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 8, , 9]);
            return [4 /*yield*/, this.getActiveAnonymizationRules(clinicId)];
          case 2:
            rules = _a.sent();
            job.rules = rules;
            job.status = "running";
            (_i = 0), (rules_2 = rules);
            _a.label = 3;
          case 3:
            if (!(_i < rules_2.length)) return [3 /*break*/, 6];
            rule = rules_2[_i];
            return [4 /*yield*/, this.processAnonymizationRule(job, rule)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            job.status = "completed";
            job.completedAt = new Date();
            // Registrar auditoria
            return [4 /*yield*/, this.logAnonymizationAudit(job)];
          case 7:
            // Registrar auditoria
            _a.sent();
            return [3 /*break*/, 9];
          case 8:
            error_6 = _a.sent();
            job.status = "failed";
            job.errors = [error_6 instanceof Error ? error_6.message : "Unknown error"];
            console.error("Anonymization job failed:", error_6);
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/, job];
        }
      });
    });
  };
  /**
   * Processa regra específica de anonimização
   */
  LGPDAutoAnonymizationService.prototype.processAnonymizationRule = function (job, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var records, _i, records_1, record, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.findRecordsForAnonymization(job.clinicId, rule)];
          case 1:
            records = _a.sent();
            (_i = 0), (records_1 = records);
            _a.label = 2;
          case 2:
            if (!(_i < records_1.length)) return [3 /*break*/, 5];
            record = records_1[_i];
            return [4 /*yield*/, this.anonymizeRecord(record, rule)];
          case 3:
            _a.sent();
            job.recordsProcessed++;
            job.recordsAnonymized++;
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_7 = _a.sent();
            if (!job.errors) job.errors = [];
            job.errors.push(
              "Rule "
                .concat(rule.id, ": ")
                .concat(error_7 instanceof Error ? error_7.message : "Unknown error"),
            );
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Encontra registros para anonimização
   */
  LGPDAutoAnonymizationService.prototype.findRecordsForAnonymization = function (clinicId, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, withdrawnConsents, userIds, retentionDate, _b, data, error;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            query = this.supabase.from(rule.tableName).select("*").eq("clinic_id", clinicId);
            _a = rule.trigger;
            switch (_a) {
              case "consent_withdrawn":
                return [3 /*break*/, 1];
              case "retention_expired":
                return [3 /*break*/, 3];
              case "scheduled":
                return [3 /*break*/, 4];
            }
            return [3 /*break*/, 5];
          case 1:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("userId")
                .eq("clinicId", clinicId)
                .eq("status", lgpd_1.ConsentStatus.WITHDRAWN),
            ];
          case 2:
            withdrawnConsents = _c.sent().data;
            userIds =
              (withdrawnConsents === null || withdrawnConsents === void 0
                ? void 0
                : withdrawnConsents.map(function (c) {
                    return c.userId;
                  })) || [];
            if (userIds.length > 0) {
              query = query.in("user_id", userIds);
            } else {
              return [2 /*return*/, []];
            }
            return [3 /*break*/, 5];
          case 3:
            retentionDate = this.calculateRetentionDate(rule.tableName);
            query = query.lt("created_at", retentionDate.toISOString());
            return [3 /*break*/, 5];
          case 4:
            // Buscar registros marcados para anonimização agendada
            query = query.eq("anonymization_scheduled", true);
            return [3 /*break*/, 5];
          case 5:
            return [4 /*yield*/, query];
          case 6:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Anonimiza registro específico
   */
  LGPDAutoAnonymizationService.prototype.anonymizeRecord = function (record, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var originalValue, anonymizedValue, _a, error;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            originalValue = record[rule.fieldName];
            if (!originalValue) return [2 /*return*/];
            _a = rule.anonymizationType;
            switch (_a) {
              case "hash":
                return [3 /*break*/, 1];
              case "mask":
                return [3 /*break*/, 3];
              case "pseudonymize":
                return [3 /*break*/, 4];
              case "remove":
                return [3 /*break*/, 6];
              case "generalize":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 8];
          case 1:
            return [4 /*yield*/, this.hashValue(originalValue)];
          case 2:
            anonymizedValue = _c.sent();
            return [3 /*break*/, 9];
          case 3:
            anonymizedValue = this.maskValue(originalValue, rule.customPattern);
            return [3 /*break*/, 9];
          case 4:
            return [4 /*yield*/, this.pseudonymizeValue(originalValue, rule.fieldName)];
          case 5:
            anonymizedValue = _c.sent();
            return [3 /*break*/, 9];
          case 6:
            anonymizedValue = null;
            return [3 /*break*/, 9];
          case 7:
            anonymizedValue = this.generalizeValue(originalValue, rule.fieldName);
            return [3 /*break*/, 9];
          case 8:
            throw new Error("Unsupported anonymization type: ".concat(rule.anonymizationType));
          case 9:
            return [
              4 /*yield*/,
              this.supabase
                .from(rule.tableName)
                .update(
                  ((_b = {}),
                  (_b[rule.fieldName] = anonymizedValue),
                  (_b.anonymized_at = new Date().toISOString()),
                  (_b.anonymization_rule_id = rule.id),
                  _b),
                )
                .eq("id", record.id),
            ];
          case 10:
            error = _c.sent().error;
            if (error) throw error;
            // Registrar auditoria da anonimização
            return [
              4 /*yield*/,
              this.logFieldAnonymization(record.id, rule, originalValue, anonymizedValue),
            ];
          case 11:
            // Registrar auditoria da anonimização
            _c.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera hash do valor
   */
  LGPDAutoAnonymizationService.prototype.hashValue = function (value) {
    return __awaiter(this, void 0, void 0, function () {
      var encoder, data, hashBuffer, hashArray;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            encoder = new TextEncoder();
            data = encoder.encode(value);
            return [4 /*yield*/, crypto.subtle.digest("SHA-256", data)];
          case 1:
            hashBuffer = _a.sent();
            hashArray = Array.from(new Uint8Array(hashBuffer));
            return [
              2 /*return*/,
              hashArray
                .map(function (b) {
                  return b.toString(16).padStart(2, "0");
                })
                .join(""),
            ];
        }
      });
    });
  };
  /**
   * Mascara valor preservando formato
   */
  LGPDAutoAnonymizationService.prototype.maskValue = function (value, pattern) {
    if (pattern) {
      return pattern.replace(/X/g, "*");
    }
    // Padrões automáticos
    if (/^\d{11}$/.test(value)) {
      // CPF: 123.456.789-**
      return value.substring(0, 9) + "**";
    }
    if (/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      // Email: us***@domain.com
      var _a = value.split("@"),
        local = _a[0],
        domain = _a[1];
      return local.substring(0, 2) + "***@" + domain;
    }
    if (value.length > 4) {
      // Geral: primeiros 2 + *** + últimos 2
      return value.substring(0, 2) + "***" + value.substring(value.length - 2);
    }
    return "***";
  };
  /**
   * Pseudonimiza valor mantendo utilidade analítica
   */
  LGPDAutoAnonymizationService.prototype.pseudonymizeValue = function (value, fieldName) {
    return __awaiter(this, void 0, void 0, function () {
      var key, pseudonym;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            key = "".concat(fieldName, "_pseudonym_key");
            return [4 /*yield*/, this.encryptionService.encrypt(value, { keyId: key })];
          case 1:
            pseudonym = _a.sent();
            return [2 /*return*/, "PSEUDO_".concat(pseudonym.data.substring(0, 16))];
        }
      });
    });
  };
  /**
   * Generaliza valor reduzindo precisão
   */
  LGPDAutoAnonymizationService.prototype.generalizeValue = function (value, fieldName) {
    // Data de nascimento -> apenas ano
    if (fieldName.includes("birth") || fieldName.includes("nascimento")) {
      var date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.getFullYear().toString();
      }
    }
    // CEP -> apenas primeiros 5 dígitos
    if (fieldName.includes("cep") || fieldName.includes("postal")) {
      return value.substring(0, 5) + "-000";
    }
    // Idade -> faixa etária
    if (fieldName.includes("age") || fieldName.includes("idade")) {
      var age = parseInt(value);
      if (age < 18) return "0-17";
      if (age < 30) return "18-29";
      if (age < 50) return "30-49";
      if (age < 65) return "50-64";
      return "65+";
    }
    return "GENERALIZED";
  };
  /**
   * Calcula data limite para retenção
   */
  LGPDAutoAnonymizationService.prototype.calculateRetentionDate = function (tableName) {
    var now = new Date();
    var retentionPeriods = {
      users: 5 * 365, // 5 anos
      medical_records: 20 * 365, // 20 anos
      appointments: 2 * 365, // 2 anos
      prescriptions: 5 * 365, // 5 anos
    };
    var days = retentionPeriods[tableName] || 2 * 365; // Padrão: 2 anos
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  };
  /**
   * Busca regras ativas de anonimização
   */
  LGPDAutoAnonymizationService.prototype.getActiveAnonymizationRules = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_anonymization_rules")
                .select("*")
                .eq("clinic_id", clinicId)
                .eq("is_active", true),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Registra auditoria da anonimização
   */
  LGPDAutoAnonymizationService.prototype.logAnonymizationAudit = function (job) {
    return __awaiter(this, void 0, void 0, function () {
      var auditLog;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            auditLog = {
              id: crypto.randomUUID(),
              clinicId: job.clinicId,
              eventType: lgpd_1.AuditEventType.DATA_ANONYMIZATION,
              timestamp: new Date(),
              userId: "SYSTEM",
              userRole: "system",
              resourceType: "anonymization_job",
              resourceId: job.id,
              action: "auto_anonymization",
              details: {
                recordsProcessed: job.recordsProcessed,
                recordsAnonymized: job.recordsAnonymized,
                rulesApplied: job.rules.length,
                status: job.status,
                errors: job.errors,
              },
              ipAddress: "system",
              userAgent: "LGPD Auto Anonymization Service",
              riskLevel: "medium",
            };
            return [4 /*yield*/, this.supabase.from("lgpd_audit_logs").insert(auditLog)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Registra auditoria de campo específico
   */
  LGPDAutoAnonymizationService.prototype.logFieldAnonymization = function (
    recordId,
    rule,
    originalValue,
    anonymizedValue,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var auditLog;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _a = {
              id: crypto.randomUUID(),
              clinicId: "", // Será preenchido pelo contexto
              eventType: lgpd_1.AuditEventType.DATA_ANONYMIZATION,
              timestamp: new Date(),
              userId: "SYSTEM",
              userRole: "system",
              resourceType: rule.tableName,
              resourceId: recordId,
              action: "anonymize_".concat(rule.fieldName),
            };
            _b = {
              fieldName: rule.fieldName,
              anonymizationType: rule.anonymizationType,
              ruleId: rule.id,
              trigger: rule.trigger,
            };
            return [4 /*yield*/, this.hashValue(String(originalValue))];
          case 1:
            auditLog =
              ((_a.details =
                ((_b.originalValueHash = _c.sent()), (_b.anonymizedValue = anonymizedValue), _b)),
              (_a.ipAddress = "system"),
              (_a.userAgent = "LGPD Auto Anonymization Service"),
              (_a.riskLevel = "low"),
              _a);
            return [4 /*yield*/, this.supabase.from("lgpd_audit_logs").insert(auditLog)];
          case 2:
            _c.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Agenda anonimização automática
   */
  LGPDAutoAnonymizationService.prototype.scheduleAnonymization = function (
    clinicId,
    rules,
    scheduledFor,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var jobId;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            jobId = crypto.randomUUID();
            // Salvar job agendado
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_scheduled_jobs").insert({
                id: jobId,
                clinic_id: clinicId,
                job_type: "anonymization",
                scheduled_for: scheduledFor.toISOString(),
                config: { rules: rules },
                status: "scheduled",
              }),
            ];
          case 1:
            // Salvar job agendado
            _a.sent();
            return [2 /*return*/, jobId];
        }
      });
    });
  };
  /**
   * Executa jobs agendados
   */
  LGPDAutoAnonymizationService.prototype.executeScheduledJobs = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, scheduledJobs, _i, _a, job, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            now = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_scheduled_jobs")
                .select("*")
                .eq("job_type", "anonymization")
                .eq("status", "scheduled")
                .lte("scheduled_for", now.toISOString()),
            ];
          case 1:
            scheduledJobs = _b.sent().data;
            (_i = 0), (_a = scheduledJobs || []);
            _b.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 9];
            job = _a[_i];
            _b.label = 3;
          case 3:
            _b.trys.push([3, 6, , 8]);
            return [4 /*yield*/, this.executeAutoAnonymization(job.clinic_id)];
          case 4:
            _b.sent();
            // Marcar como executado
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_scheduled_jobs")
                .update({
                  status: "completed",
                  executed_at: now.toISOString(),
                })
                .eq("id", job.id),
            ];
          case 5:
            // Marcar como executado
            _b.sent();
            return [3 /*break*/, 8];
          case 6:
            error_8 = _b.sent();
            console.error(
              "Failed to execute scheduled anonymization job ".concat(job.id, ":"),
              error_8,
            );
            // Marcar como falhou
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_scheduled_jobs")
                .update({
                  status: "failed",
                  error_message: error_8 instanceof Error ? error_8.message : "Unknown error",
                })
                .eq("id", job.id),
            ];
          case 7:
            // Marcar como falhou
            _b.sent();
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 2];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  return LGPDAutoAnonymizationService;
})();
exports.LGPDAutoAnonymizationService = LGPDAutoAnonymizationService;
