/**
 * NeonPro Audit Trail System
 *
 * Sistema completo de auditoria para rastreamento de todas as ações
 * do sistema, mudanças em dados sensíveis e atividades suspeitas.
 *
 * Features:
 * - Captura automática de eventos
 * - Rastreamento de mudanças em dados sensíveis
 * - Detecção de atividades suspeitas
 * - Armazenamento seguro e criptografado
 * - Retenção e arquivamento automático
 * - Exportação de relatórios
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.getAuditStatistics =
  exports.generateAuditReport =
  exports.queryAuditEvents =
  exports.logAuditEvent =
  exports.createAuditSystem =
  exports.createauditSystem =
  exports.AuditSeverity =
  exports.AuditEventType =
    void 0;
var client_1 = require("@/lib/supabase/client");
var crypto_1 = require("crypto");
// Tipos de eventos de auditoria
var AuditEventType;
((AuditEventType) => {
  // Autenticação e Autorização
  AuditEventType["LOGIN"] = "auth.login";
  AuditEventType["LOGOUT"] = "auth.logout";
  AuditEventType["LOGIN_FAILED"] = "auth.login_failed";
  AuditEventType["PASSWORD_CHANGE"] = "auth.password_change";
  AuditEventType["ROLE_CHANGE"] = "auth.role_change";
  AuditEventType["PERMISSION_CHANGE"] = "auth.permission_change";
  // Gestão de Usuários
  AuditEventType["USER_CREATE"] = "user.create";
  AuditEventType["USER_UPDATE"] = "user.update";
  AuditEventType["USER_DELETE"] = "user.delete";
  AuditEventType["USER_SUSPEND"] = "user.suspend";
  AuditEventType["USER_ACTIVATE"] = "user.activate";
  // Gestão de Pacientes
  AuditEventType["PATIENT_CREATE"] = "patient.create";
  AuditEventType["PATIENT_UPDATE"] = "patient.update";
  AuditEventType["PATIENT_DELETE"] = "patient.delete";
  AuditEventType["PATIENT_VIEW"] = "patient.view";
  AuditEventType["PATIENT_EXPORT"] = "patient.export";
  // Dados Médicos
  AuditEventType["MEDICAL_RECORD_CREATE"] = "medical.record_create";
  AuditEventType["MEDICAL_RECORD_UPDATE"] = "medical.record_update";
  AuditEventType["MEDICAL_RECORD_DELETE"] = "medical.record_delete";
  AuditEventType["MEDICAL_RECORD_VIEW"] = "medical.record_view";
  AuditEventType["MEDICAL_DOCUMENT_UPLOAD"] = "medical.document_upload";
  AuditEventType["MEDICAL_DOCUMENT_DELETE"] = "medical.document_delete";
  // Agendamentos
  AuditEventType["APPOINTMENT_CREATE"] = "appointment.create";
  AuditEventType["APPOINTMENT_UPDATE"] = "appointment.update";
  AuditEventType["APPOINTMENT_CANCEL"] = "appointment.cancel";
  AuditEventType["APPOINTMENT_COMPLETE"] = "appointment.complete";
  // Financeiro
  AuditEventType["PAYMENT_CREATE"] = "payment.create";
  AuditEventType["PAYMENT_UPDATE"] = "payment.update";
  AuditEventType["PAYMENT_REFUND"] = "payment.refund";
  AuditEventType["INVOICE_GENERATE"] = "invoice.generate";
  // Sistema
  AuditEventType["SYSTEM_CONFIG_CHANGE"] = "system.config_change";
  AuditEventType["SYSTEM_BACKUP"] = "system.backup";
  AuditEventType["SYSTEM_RESTORE"] = "system.restore";
  AuditEventType["DATA_EXPORT"] = "system.data_export";
  AuditEventType["DATA_IMPORT"] = "system.data_import";
  // Segurança
  AuditEventType["SECURITY_VIOLATION"] = "security.violation";
  AuditEventType["SUSPICIOUS_ACTIVITY"] = "security.suspicious_activity";
  AuditEventType["FAILED_ACCESS_ATTEMPT"] = "security.failed_access";
  AuditEventType["SESSION_HIJACK_ATTEMPT"] = "security.session_hijack";
  AuditEventType["CSRF_ATTACK_BLOCKED"] = "security.csrf_blocked";
  // LGPD
  AuditEventType["CONSENT_GIVEN"] = "lgpd.consent_given";
  AuditEventType["CONSENT_WITHDRAWN"] = "lgpd.consent_withdrawn";
  AuditEventType["DATA_DELETION_REQUEST"] = "lgpd.data_deletion_request";
  AuditEventType["DATA_EXPORT_REQUEST"] = "lgpd.data_export_request";
  AuditEventType["DATA_ANONYMIZATION"] = "lgpd.data_anonymization";
})(AuditEventType || (exports.AuditEventType = AuditEventType = {}));
// Níveis de severidade
var AuditSeverity;
((AuditSeverity) => {
  AuditSeverity["LOW"] = "low";
  AuditSeverity["MEDIUM"] = "medium";
  AuditSeverity["HIGH"] = "high";
  AuditSeverity["CRITICAL"] = "critical";
})(AuditSeverity || (exports.AuditSeverity = AuditSeverity = {}));
/**
 * Sistema principal de auditoria
 */
var createauditSystem = /** @class */ (() => {
  function createauditSystem() {
    this.supabase = (0, client_1.createClient)();
    this.encryptionKey = process.env.AUDIT_ENCRYPTION_KEY || "default-key-change-in-production";
  }
  /**
   * Registra um evento de auditoria
   */
  createauditSystem.prototype.logEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var auditEvent, error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            auditEvent = __assign(__assign({}, event), {
              timestamp: new Date(),
              checksum: this.generateChecksum(event),
            });
            // Criptografa dados sensíveis
            if (auditEvent.old_values) {
              auditEvent.old_values = this.encryptSensitiveData(auditEvent.old_values);
            }
            if (auditEvent.new_values) {
              auditEvent.new_values = this.encryptSensitiveData(auditEvent.new_values);
            }
            return [4 /*yield*/, this.supabase.from("audit_logs").insert(auditEvent)];
          case 1:
            error = _a.sent().error;
            if (!error) return [3 /*break*/, 3];
            console.error("Erro ao salvar evento de auditoria:", error);
            // Fallback: salva em arquivo local
            return [4 /*yield*/, this.saveToLocalFile(auditEvent)];
          case 2:
            // Fallback: salva em arquivo local
            _a.sent();
            _a.label = 3;
          case 3:
            if (!this.isSuspiciousActivity(auditEvent)) return [3 /*break*/, 5];
            return [4 /*yield*/, this.handleSuspiciousActivity(auditEvent)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_1 = _a.sent();
            console.error("Erro no sistema de auditoria:", error_1);
            // Não deve falhar silenciosamente
            throw new Error("Falha crítica no sistema de auditoria");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Consulta eventos de auditoria
   */
  createauditSystem.prototype.queryEvents = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_2;
      var _this = this;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("audit_logs")
              .select("*")
              .order("timestamp", { ascending: false });
            // Aplica filtros
            if ((_b = filters.event_types) === null || _b === void 0 ? void 0 : _b.length) {
              query = query.in("event_type", filters.event_types);
            }
            if ((_c = filters.severity) === null || _c === void 0 ? void 0 : _c.length) {
              query = query.in("severity", filters.severity);
            }
            if (filters.user_id) {
              query = query.eq("user_id", filters.user_id);
            }
            if (filters.clinic_id) {
              query = query.eq("clinic_id", filters.clinic_id);
            }
            if (filters.resource_type) {
              query = query.eq("resource_type", filters.resource_type);
            }
            if (filters.resource_id) {
              query = query.eq("resource_id", filters.resource_id);
            }
            if (filters.start_date) {
              query = query.gte("timestamp", filters.start_date.toISOString());
            }
            if (filters.end_date) {
              query = query.lte("timestamp", filters.end_date.toISOString());
            }
            if (filters.ip_address) {
              query = query.eq("ip_address", filters.ip_address);
            }
            // Paginação
            if (filters.limit) {
              query = query.limit(filters.limit);
            }
            if (filters.offset) {
              query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _d.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao consultar eventos: ".concat(error.message));
            }
            // Descriptografa dados sensíveis
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map((event) =>
                    __assign(__assign({}, event), {
                      old_values: event.old_values
                        ? _this.decryptSensitiveData(event.old_values)
                        : undefined,
                      new_values: event.new_values
                        ? _this.decryptSensitiveData(event.new_values)
                        : undefined,
                    }),
                  )) || [],
            ];
          case 2:
            error_2 = _d.sent();
            console.error("Erro ao consultar eventos de auditoria:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera relatório de auditoria
   */
  createauditSystem.prototype.generateReport = function (title, description, filters, generatedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var events, report, error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.queryEvents(filters)];
          case 1:
            events = _a.sent();
            report = {
              id: crypto_1.default.randomUUID(),
              title: title,
              description: description,
              filters: filters,
              events: events,
              generated_at: new Date(),
              generated_by: generatedBy,
              total_events: events.length,
            };
            return [
              4 /*yield*/,
              this.supabase.from("audit_reports").insert({
                id: report.id,
                title: report.title,
                description: report.description,
                filters: report.filters,
                generated_at: report.generated_at,
                generated_by: report.generated_by,
                total_events: report.total_events,
              }),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              console.error("Erro ao salvar relatório:", error);
            }
            return [2 /*return*/, report];
          case 3:
            error_3 = _a.sent();
            console.error("Erro ao gerar relatório:", error_3);
            throw error_3;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém estatísticas de auditoria
   */
  createauditSystem.prototype.getStatistics = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var events, stats_1, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.queryEvents(filters)];
          case 1:
            events = _a.sent();
            stats_1 = {
              total_events: events.length,
              events_by_type: {},
              events_by_severity: {},
              events_by_user: {},
              suspicious_activities: 0,
              failed_access_attempts: 0,
              date_range: {
                start: filters.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: filters.end_date || new Date(),
              },
            };
            // Processa estatísticas
            events.forEach((event) => {
              // Por tipo
              stats_1.events_by_type[event.event_type] =
                (stats_1.events_by_type[event.event_type] || 0) + 1;
              // Por severidade
              stats_1.events_by_severity[event.severity] =
                (stats_1.events_by_severity[event.severity] || 0) + 1;
              // Por usuário
              if (event.user_id) {
                stats_1.events_by_user[event.user_id] =
                  (stats_1.events_by_user[event.user_id] || 0) + 1;
              }
              // Atividades suspeitas
              if (
                event.event_type.includes("security.suspicious") ||
                event.event_type.includes("security.violation")
              ) {
                stats_1.suspicious_activities++;
              }
              // Tentativas de acesso falhadas
              if (
                event.event_type.includes("failed_access") ||
                event.event_type === AuditEventType.LOGIN_FAILED
              ) {
                stats_1.failed_access_attempts++;
              }
            });
            return [2 /*return*/, stats_1];
          case 2:
            error_4 = _a.sent();
            console.error("Erro ao obter estatísticas:", error_4);
            throw error_4;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Arquiva logs antigos
   */
  createauditSystem.prototype.archiveOldLogs = function () {
    return __awaiter(this, arguments, void 0, function (retentionDays) {
      var cutoffDate, _a, oldLogs, selectError, insertError, deleteError, error_5;
      if (retentionDays === void 0) {
        retentionDays = 365;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("audit_logs")
                .select("*")
                .lt("timestamp", cutoffDate.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (oldLogs = _a.data), (selectError = _a.error);
            if (selectError) {
              throw new Error("Erro ao selecionar logs antigos: ".concat(selectError.message));
            }
            if (!oldLogs || oldLogs.length === 0) {
              return [2 /*return*/, 0];
            }
            return [4 /*yield*/, this.supabase.from("audit_logs_archive").insert(oldLogs)];
          case 2:
            insertError = _b.sent().error;
            if (insertError) {
              throw new Error("Erro ao arquivar logs: ".concat(insertError.message));
            }
            return [
              4 /*yield*/,
              this.supabase.from("audit_logs").delete().lt("timestamp", cutoffDate.toISOString()),
            ];
          case 3:
            deleteError = _b.sent().error;
            if (deleteError) {
              throw new Error("Erro ao deletar logs arquivados: ".concat(deleteError.message));
            }
            return [2 /*return*/, oldLogs.length];
          case 4:
            error_5 = _b.sent();
            console.error("Erro ao arquivar logs:", error_5);
            throw error_5;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verifica integridade dos logs
   */
  createauditSystem.prototype.verifyIntegrity = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, logs, error, valid_1, invalid_1, errors_1, error_6;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("audit_logs")
                .select("*")
                .order("timestamp", { ascending: false })
                .limit(1000),
            ];
          case 1:
            (_a = _b.sent()), (logs = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Erro ao verificar integridade: ".concat(error.message));
            }
            valid_1 = 0;
            invalid_1 = 0;
            errors_1 = [];
            logs === null || logs === void 0
              ? void 0
              : logs.forEach((log) => {
                  var expectedChecksum = _this.generateChecksum({
                    event_type: log.event_type,
                    severity: log.severity,
                    user_id: log.user_id,
                    clinic_id: log.clinic_id,
                    session_id: log.session_id,
                    ip_address: log.ip_address,
                    user_agent: log.user_agent,
                    resource_type: log.resource_type,
                    resource_id: log.resource_id,
                    old_values: log.old_values,
                    new_values: log.new_values,
                    metadata: log.metadata,
                    description: log.description,
                  });
                  if (log.checksum === expectedChecksum) {
                    valid_1++;
                  } else {
                    invalid_1++;
                    errors_1.push("Log ".concat(log.id, ": checksum inv\u00E1lido"));
                  }
                });
            return [2 /*return*/, { valid: valid_1, invalid: invalid_1, errors: errors_1 }];
          case 2:
            error_6 = _b.sent();
            console.error("Erro ao verificar integridade:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera checksum para integridade
   */
  createauditSystem.prototype.generateChecksum = function (data) {
    var content = JSON.stringify(data, Object.keys(data).sort());
    return crypto_1.default
      .createHash("sha256")
      .update(content + this.encryptionKey)
      .digest("hex");
  };
  /**
   * Criptografa dados sensíveis
   */
  createauditSystem.prototype.encryptSensitiveData = function (data) {
    var sensitiveFields = ["cpf", "email", "phone", "address", "medical_data"];
    var encrypted = __assign({}, data);
    Object.keys(encrypted).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        var cipher = crypto_1.default.createCipher("aes-256-cbc", this.encryptionKey);
        var encryptedValue = cipher.update(JSON.stringify(encrypted[key]), "utf8", "hex");
        encryptedValue += cipher.final("hex");
        encrypted[key] = "encrypted:".concat(encryptedValue);
      }
    });
    return encrypted;
  };
  /**
   * Descriptografa dados sensíveis
   */
  createauditSystem.prototype.decryptSensitiveData = function (data) {
    var decrypted = __assign({}, data);
    Object.keys(decrypted).forEach((key) => {
      if (typeof decrypted[key] === "string" && decrypted[key].startsWith("encrypted:")) {
        try {
          var encryptedValue = decrypted[key].replace("encrypted:", "");
          var decipher = crypto_1.default.createDecipher("aes-256-cbc", this.encryptionKey);
          var decryptedValue = decipher.update(encryptedValue, "hex", "utf8");
          decryptedValue += decipher.final("utf8");
          decrypted[key] = JSON.parse(decryptedValue);
        } catch (error) {
          console.error("Erro ao descriptografar:", error);
          decrypted[key] = "[ERRO_DESCRIPTOGRAFIA]";
        }
      }
    });
    return decrypted;
  };
  /**
   * Verifica se é uma atividade suspeita
   */
  createauditSystem.prototype.isSuspiciousActivity = (event) => {
    var suspiciousPatterns = [
      AuditEventType.SECURITY_VIOLATION,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditEventType.SESSION_HIJACK_ATTEMPT,
      AuditEventType.FAILED_ACCESS_ATTEMPT,
    ];
    return (
      suspiciousPatterns.includes(event.event_type) || event.severity === AuditSeverity.CRITICAL
    );
  };
  /**
   * Trata atividades suspeitas
   */
  createauditSystem.prototype.handleSuspiciousActivity = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Registra alerta de segurança
            return [
              4 /*yield*/,
              this.supabase
                .from("security_alerts")
                .insert({
                  event_id: event.id,
                  alert_type: "suspicious_activity",
                  severity: event.severity,
                  description: "Atividade suspeita detectada: ".concat(event.description),
                  user_id: event.user_id,
                  ip_address: event.ip_address,
                  created_at: new Date().toISOString(),
                }),
              // TODO: Implementar notificações em tempo real
              // TODO: Implementar bloqueio automático se necessário
            ];
          case 1:
            // Registra alerta de segurança
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            console.error("Erro ao tratar atividade suspeita:", error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Salva evento em arquivo local como fallback
   */
  createauditSystem.prototype.saveToLocalFile = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var fs, path, logDir, logFile, logEntry, error_8;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, Promise.resolve().then(() => require("fs/promises"))];
          case 1:
            fs = _a.sent();
            return [4 /*yield*/, Promise.resolve().then(() => require("path"))];
          case 2:
            path = _a.sent();
            logDir = path.join(process.cwd(), "logs", "audit");
            logFile = path.join(
              logDir,
              "audit-".concat(new Date().toISOString().split("T")[0], ".log"),
            );
            // Cria diretório se não existir
            return [
              4 /*yield*/,
              fs.mkdir(logDir, { recursive: true }),
              // Adiciona ao arquivo
            ];
          case 3:
            // Cria diretório se não existir
            _a.sent();
            logEntry = ""
              .concat(new Date().toISOString(), " - ")
              .concat(JSON.stringify(event), "\n");
            return [4 /*yield*/, fs.appendFile(logFile, logEntry)];
          case 4:
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_8 = _a.sent();
            console.error("Erro ao salvar em arquivo local:", error_8);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  return createauditSystem;
})();
exports.createauditSystem = createauditSystem;
// Instância singleton
var createAuditSystem = () => new createauditSystem();
exports.createAuditSystem = createAuditSystem;
// Helper functions para uso fácil
var logAuditEvent = (event) => (0, exports.createAuditSystem)().logEvent(event);
exports.logAuditEvent = logAuditEvent;
var queryAuditEvents = (filters) => (0, exports.createAuditSystem)().queryEvents(filters);
exports.queryAuditEvents = queryAuditEvents;
var generateAuditReport = (title, description, filters, generatedBy) =>
  (0, exports.createAuditSystem)().generateReport(title, description, filters, generatedBy);
exports.generateAuditReport = generateAuditReport;
var getAuditStatistics = (filters) => (0, exports.createAuditSystem)().getStatistics(filters);
exports.getAuditStatistics = getAuditStatistics;
