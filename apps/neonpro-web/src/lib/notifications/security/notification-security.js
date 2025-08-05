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
exports.NotificationSecurity = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../../auth/audit/audit-logger");
var lgpd_manager_1 = require("../../lgpd/lgpd-manager");
var encryption_service_1 = require("../../security/encryption-service");
var NotificationSecurity = /** @class */ (() => {
  function NotificationSecurity(config) {
    this.rateLimitCache = new Map();
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.lgpdManager = new lgpd_manager_1.LGPDManager();
    this.encryptionService = new encryption_service_1.EncryptionService();
    this.securityConfig = __assign(
      {
        encryption_enabled: true,
        data_retention_days: 90,
        anonymization_enabled: true,
        audit_enabled: true,
        rate_limiting: {
          enabled: true,
          max_per_minute: 60,
          max_per_hour: 1000,
          max_per_day: 10000,
        },
        content_filtering: {
          enabled: true,
          block_sensitive_data: true,
          block_spam_keywords: true,
          block_malicious_links: true,
        },
        access_control: {
          require_authentication: true,
          allowed_roles: ["admin", "notification_manager", "system"],
          ip_whitelist: [],
        },
      },
      config,
    );
    this.initializeSecurityPatterns();
  }
  /**
   * Valida segurança de uma notificação antes do envio
   */
  NotificationSecurity.prototype.validateNotificationSecurity = function (
    notificationData,
    context,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var violations,
        riskScore,
        accessViolations,
        rateLimitViolations,
        contentViolations,
        lgpdViolations,
        retentionViolations,
        isValid,
        recommendations,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            violations = [];
            riskScore = 0;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 9, , 10]);
            return [4 /*yield*/, this.validateAccessControl(context)];
          case 2:
            accessViolations = _a.sent();
            violations.push.apply(violations, accessViolations);
            riskScore += accessViolations.length * 20;
            return [4 /*yield*/, this.validateRateLimit(context.user_id)];
          case 3:
            rateLimitViolations = _a.sent();
            violations.push.apply(violations, rateLimitViolations);
            riskScore += rateLimitViolations.length * 30;
            return [4 /*yield*/, this.validateContent(notificationData)];
          case 4:
            contentViolations = _a.sent();
            violations.push.apply(violations, contentViolations);
            riskScore += contentViolations.length * 25;
            return [4 /*yield*/, this.validateLGPDCompliance(notificationData, context.user_id)];
          case 5:
            lgpdViolations = _a.sent();
            violations.push.apply(violations, lgpdViolations);
            riskScore += lgpdViolations.length * 40;
            return [4 /*yield*/, this.validateDataRetention(notificationData)];
          case 6:
            retentionViolations = _a.sent();
            violations.push.apply(violations, retentionViolations);
            riskScore += retentionViolations.length * 15;
            isValid =
              violations.filter((v) => v.severity === "critical" || v.severity === "high")
                .length === 0;
            recommendations = this.generateSecurityRecommendations(violations);
            if (!this.securityConfig.audit_enabled) return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              this.logSecurityAudit({
                event_type: "notification_security_validation",
                user_id: context.user_id,
                ip_address: context.ip_address,
                user_agent: context.user_agent,
                security_violations: violations,
                risk_score: riskScore,
                action_taken: isValid ? "approved" : "blocked",
              }),
            ];
          case 7:
            _a.sent();
            _a.label = 8;
          case 8:
            return [
              2 /*return*/,
              {
                is_valid: isValid,
                violations: violations,
                risk_score: Math.min(riskScore, 100),
                recommendations: recommendations,
              },
            ];
          case 9:
            error_1 = _a.sent();
            throw new Error("Erro na valida\u00E7\u00E3o de seguran\u00E7a: ".concat(error_1));
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Criptografa dados sensíveis da notificação
   */
  NotificationSecurity.prototype.encryptNotificationData = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var sensitiveFields,
        dataToEncrypt,
        metadata,
        _i,
        sensitiveFields_1,
        field,
        encryptedContent,
        encryptedMetadata,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.securityConfig.encryption_enabled) {
              throw new Error("Criptografia não está habilitada");
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            sensitiveFields = ["content", "subject", "recipient_data", "personal_data"];
            dataToEncrypt = {};
            metadata = __assign({}, data);
            // Separar dados sensíveis
            for (_i = 0, sensitiveFields_1 = sensitiveFields; _i < sensitiveFields_1.length; _i++) {
              field = sensitiveFields_1[_i];
              if (data[field]) {
                dataToEncrypt[field] = data[field];
                delete metadata[field];
              }
            }
            return [4 /*yield*/, this.encryptionService.encrypt(JSON.stringify(dataToEncrypt))];
          case 2:
            encryptedContent = _a.sent();
            return [4 /*yield*/, this.encryptionService.encrypt(JSON.stringify(metadata))];
          case 3:
            encryptedMetadata = _a.sent();
            return [
              2 /*return*/,
              {
                encrypted_content: encryptedContent.data,
                encrypted_metadata: encryptedMetadata.data,
                encryption_key_id: encryptedContent.keyId,
                encryption_algorithm: "AES-256-GCM",
                created_at: new Date(),
              },
            ];
          case 4:
            error_2 = _a.sent();
            throw new Error("Erro na criptografia: ".concat(error_2));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Descriptografa dados da notificação
   */
  NotificationSecurity.prototype.decryptNotificationData = function (encryptedData) {
    return __awaiter(this, void 0, void 0, function () {
      var decryptedContent, decryptedMetadata, content, metadata, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.securityConfig.encryption_enabled) {
              throw new Error("Criptografia não está habilitada");
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              this.encryptionService.decrypt({
                data: encryptedData.encrypted_content,
                keyId: encryptedData.encryption_key_id,
              }),
            ];
          case 2:
            decryptedContent = _a.sent();
            return [
              4 /*yield*/,
              this.encryptionService.decrypt({
                data: encryptedData.encrypted_metadata,
                keyId: encryptedData.encryption_key_id,
              }),
            ];
          case 3:
            decryptedMetadata = _a.sent();
            content = JSON.parse(decryptedContent);
            metadata = JSON.parse(decryptedMetadata);
            return [2 /*return*/, __assign(__assign({}, metadata), content)];
          case 4:
            error_3 = _a.sent();
            throw new Error("Erro na descriptografia: ".concat(error_3));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Filtra e sanitiza conteúdo
   */
  NotificationSecurity.prototype.filterContent = function (content) {
    return __awaiter(this, void 0, void 0, function () {
      var issues, sanitizedContent, isSafe, piiDetection, spamDetection, maliciousLinks, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            issues = [];
            sanitizedContent = content;
            isSafe = true;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            piiDetection = this.detectPII(content);
            if (piiDetection.length > 0) {
              issues.push.apply(issues, piiDetection);
              isSafe = false;
              if (this.securityConfig.content_filtering.block_sensitive_data) {
                sanitizedContent = this.sanitizePII(sanitizedContent);
              }
            }
            spamDetection = this.detectSpam(content);
            if (spamDetection.length > 0) {
              issues.push.apply(issues, spamDetection);
              isSafe = false;
            }
            return [4 /*yield*/, this.detectMaliciousLinks(content)];
          case 2:
            maliciousLinks = _a.sent();
            if (maliciousLinks.length > 0) {
              issues.push.apply(issues, maliciousLinks);
              isSafe = false;
              if (this.securityConfig.content_filtering.block_malicious_links) {
                sanitizedContent = this.sanitizeMaliciousLinks(sanitizedContent);
              }
            }
            return [
              2 /*return*/,
              {
                is_safe: isSafe,
                detected_issues: issues,
                sanitized_content: sanitizedContent !== content ? sanitizedContent : undefined,
              },
            ];
          case 3:
            error_4 = _a.sent();
            throw new Error("Erro na filtragem de conte\u00FAdo: ".concat(error_4));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verifica rate limiting para usuário
   */
  NotificationSecurity.prototype.checkRateLimit = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var now, cacheKey, status_1, data, limits, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.securityConfig.rate_limiting.enabled) {
              return [
                2 /*return*/,
                {
                  user_id: userId,
                  current_minute: 0,
                  current_hour: 0,
                  current_day: 0,
                  limits_exceeded: false,
                  reset_times: {
                    minute: new Date(),
                    hour: new Date(),
                    day: new Date(),
                  },
                },
              ];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            now = new Date();
            cacheKey = "rate_limit_".concat(userId);
            status_1 = this.rateLimitCache.get(cacheKey);
            if (status_1) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_rate_limits")
                .select("*")
                .eq("user_id", userId)
                .single(),
            ];
          case 2:
            data = _a.sent().data;
            if (data) {
              status_1 = {
                user_id: userId,
                current_minute: data.current_minute || 0,
                current_hour: data.current_hour || 0,
                current_day: data.current_day || 0,
                limits_exceeded: false,
                reset_times: {
                  minute: new Date(data.minute_reset || now),
                  hour: new Date(data.hour_reset || now),
                  day: new Date(data.day_reset || now),
                },
              };
            } else {
              status_1 = {
                user_id: userId,
                current_minute: 0,
                current_hour: 0,
                current_day: 0,
                limits_exceeded: false,
                reset_times: {
                  minute: new Date(now.getTime() + 60000),
                  hour: new Date(now.getTime() + 3600000),
                  day: new Date(now.getTime() + 86400000),
                },
              };
            }
            _a.label = 3;
          case 3:
            // Verificar se precisa resetar contadores
            if (now >= status_1.reset_times.minute) {
              status_1.current_minute = 0;
              status_1.reset_times.minute = new Date(now.getTime() + 60000);
            }
            if (now >= status_1.reset_times.hour) {
              status_1.current_hour = 0;
              status_1.reset_times.hour = new Date(now.getTime() + 3600000);
            }
            if (now >= status_1.reset_times.day) {
              status_1.current_day = 0;
              status_1.reset_times.day = new Date(now.getTime() + 86400000);
            }
            limits = this.securityConfig.rate_limiting;
            status_1.limits_exceeded =
              status_1.current_minute >= limits.max_per_minute ||
              status_1.current_hour >= limits.max_per_hour ||
              status_1.current_day >= limits.max_per_day;
            this.rateLimitCache.set(cacheKey, status_1);
            return [2 /*return*/, status_1];
          case 4:
            error_5 = _a.sent();
            throw new Error("Erro ao verificar rate limit: ".concat(error_5));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Incrementa contador de rate limit
   */
  NotificationSecurity.prototype.incrementRateLimit = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var status_2, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.securityConfig.rate_limiting.enabled) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [4 /*yield*/, this.checkRateLimit(userId)];
          case 2:
            status_2 = _a.sent();
            status_2.current_minute++;
            status_2.current_hour++;
            status_2.current_day++;
            // Atualizar cache
            this.rateLimitCache.set("rate_limit_".concat(userId), status_2);
            // Atualizar banco de dados
            return [
              4 /*yield*/,
              this.supabase.from("notification_rate_limits").upsert({
                user_id: userId,
                current_minute: status_2.current_minute,
                current_hour: status_2.current_hour,
                current_day: status_2.current_day,
                minute_reset: status_2.reset_times.minute.toISOString(),
                hour_reset: status_2.reset_times.hour.toISOString(),
                day_reset: status_2.reset_times.day.toISOString(),
                updated_at: new Date().toISOString(),
              }),
            ];
          case 3:
            // Atualizar banco de dados
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_6 = _a.sent();
            throw new Error("Erro ao incrementar rate limit: ".concat(error_6));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Anonimiza dados de notificação para compliance LGPD
   */
  NotificationSecurity.prototype.anonymizeNotificationData = function (notificationId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.securityConfig.anonymization_enabled) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              this.lgpdManager.anonymizeData("notification_logs", {
                id: notificationId,
              }),
            ];
          case 2:
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "notification_data_anonymized",
                resource_type: "notification",
                resource_id: notificationId,
                details: { reason: "lgpd_compliance" },
              }),
            ];
          case 3:
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            throw new Error("Erro na anonimiza\u00E7\u00E3o: ".concat(error_7));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Remove dados antigos conforme política de retenção
   */
  NotificationSecurity.prototype.cleanupExpiredData = function () {
    return __awaiter(this, void 0, void 0, function () {
      var cutoffDate,
        expiredNotifications,
        deletedCount,
        anonymizedCount,
        _i,
        expiredNotifications_1,
        notification,
        error,
        error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 10, , 11]);
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.securityConfig.data_retention_days);
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_logs")
                .select("id")
                .lt("created_at", cutoffDate.toISOString()),
            ];
          case 1:
            expiredNotifications = _a.sent().data;
            deletedCount = 0;
            anonymizedCount = 0;
            if (!(expiredNotifications && expiredNotifications.length > 0)) return [3 /*break*/, 8];
            if (!this.securityConfig.anonymization_enabled) return [3 /*break*/, 6];
            (_i = 0), (expiredNotifications_1 = expiredNotifications);
            _a.label = 2;
          case 2:
            if (!(_i < expiredNotifications_1.length)) return [3 /*break*/, 5];
            notification = expiredNotifications_1[_i];
            return [4 /*yield*/, this.anonymizeNotificationData(notification.id)];
          case 3:
            _a.sent();
            anonymizedCount++;
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 8];
          case 6:
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_logs")
                .delete()
                .lt("created_at", cutoffDate.toISOString()),
            ];
          case 7:
            error = _a.sent().error;
            if (error) throw error;
            deletedCount = expiredNotifications.length;
            _a.label = 8;
          case 8:
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "notification_data_cleanup",
                resource_type: "notification_logs",
                details: {
                  cutoff_date: cutoffDate.toISOString(),
                  deleted_count: deletedCount,
                  anonymized_count: anonymizedCount,
                },
              }),
            ];
          case 9:
            _a.sent();
            return [
              2 /*return*/,
              {
                deleted_notifications: deletedCount,
                anonymized_records: anonymizedCount,
              },
            ];
          case 10:
            error_8 = _a.sent();
            throw new Error("Erro na limpeza de dados: ".concat(error_8));
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gera relatório de segurança
   */
  NotificationSecurity.prototype.generateSecurityReport = function () {
    return __awaiter(this, arguments, void 0, function (period) {
      var startDate,
        auditLogs,
        totalValidations,
        blockedNotifications,
        allViolations,
        totalViolations,
        averageRiskScore,
        violationsByType,
        topViolations,
        rateLimitData,
        usersLimited,
        recommendations,
        error_9;
      var _this = this;
      if (period === void 0) {
        period = "week";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            startDate = new Date();
            switch (period) {
              case "day":
                startDate.setDate(startDate.getDate() - 1);
                break;
              case "week":
                startDate.setDate(startDate.getDate() - 7);
                break;
              case "month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("security_audit_logs")
                .select("*")
                .gte("timestamp", startDate.toISOString())
                .eq("event_type", "notification_security_validation"),
            ];
          case 1:
            auditLogs = _a.sent().data;
            totalValidations =
              (auditLogs === null || auditLogs === void 0 ? void 0 : auditLogs.length) || 0;
            blockedNotifications =
              (auditLogs === null || auditLogs === void 0
                ? void 0
                : auditLogs.filter((log) => log.action_taken === "blocked").length) || 0;
            allViolations =
              (auditLogs === null || auditLogs === void 0
                ? void 0
                : auditLogs.flatMap((log) => log.security_violations || [])) || [];
            totalViolations = allViolations.length;
            averageRiskScore = (
              auditLogs === null || auditLogs === void 0
                ? void 0
                : auditLogs.length
            )
              ? auditLogs.reduce((sum, log) => sum + (log.risk_score || 0), 0) / auditLogs.length
              : 0;
            violationsByType = allViolations.reduce((counts, violation) => {
              counts[violation.type] = (counts[violation.type] || 0) + 1;
              return counts;
            }, {});
            topViolations = allViolations
              .filter((v) => v.severity === "high" || v.severity === "critical")
              .slice(0, 10);
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_rate_limits")
                .select("user_id, current_minute, current_hour, current_day")
                .gte("updated_at", startDate.toISOString()),
            ];
          case 2:
            rateLimitData = _a.sent().data;
            usersLimited =
              (rateLimitData === null || rateLimitData === void 0
                ? void 0
                : rateLimitData.filter(
                    (rl) =>
                      rl.current_minute >= _this.securityConfig.rate_limiting.max_per_minute ||
                      rl.current_hour >= _this.securityConfig.rate_limiting.max_per_hour ||
                      rl.current_day >= _this.securityConfig.rate_limiting.max_per_day,
                  ).length) || 0;
            recommendations = this.generateSecurityRecommendations(allViolations);
            return [
              2 /*return*/,
              {
                summary: {
                  total_validations: totalValidations,
                  blocked_notifications: blockedNotifications,
                  security_violations: totalViolations,
                  average_risk_score: averageRiskScore,
                },
                violations_by_type: violationsByType,
                top_violations: topViolations,
                rate_limit_stats: {
                  users_limited: usersLimited,
                  total_blocks: blockedNotifications,
                },
                recommendations: recommendations,
              },
            ];
          case 3:
            error_9 = _a.sent();
            throw new Error("Erro ao gerar relat\u00F3rio de seguran\u00E7a: ".concat(error_9));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos privados
  NotificationSecurity.prototype.initializeSecurityPatterns = function () {
    // Padrões para detectar PII
    this.piiPatterns = [
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
      /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, // CNPJ
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}\b/g, // Telefone
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Cartão de crédito
    ];
    // Padrões suspeitos
    this.suspiciousPatterns = [
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /<script[^>]*>/gi,
      /on\w+\s*=/gi,
    ];
    // Palavras-chave de spam
    this.spamKeywords = [
      "ganhe dinheiro fácil",
      "clique aqui agora",
      "oferta limitada",
      "urgente",
      "parabéns você ganhou",
      "renda extra",
      "trabalhe em casa",
    ];
  };
  NotificationSecurity.prototype.validateAccessControl = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var violations, config;
      return __generator(this, function (_a) {
        violations = [];
        config = this.securityConfig.access_control;
        if (config.require_authentication && !context.user_id) {
          violations.push({
            type: "unauthorized_access",
            severity: "critical",
            description: "Tentativa de envio sem autenticação",
            recommendation: "Implementar autenticação obrigatória",
          });
        }
        if (
          context.role &&
          config.allowed_roles.length > 0 &&
          !config.allowed_roles.includes(context.role)
        ) {
          violations.push({
            type: "unauthorized_access",
            severity: "high",
            description: "Role '".concat(context.role, "' n\u00E3o autorizada"),
            recommendation: "Verificar permissões do usuário",
          });
        }
        if (
          config.ip_whitelist.length > 0 &&
          context.ip_address &&
          !config.ip_whitelist.includes(context.ip_address)
        ) {
          violations.push({
            type: "unauthorized_access",
            severity: "medium",
            description: "IP ".concat(context.ip_address, " n\u00E3o est\u00E1 na whitelist"),
            recommendation: "Adicionar IP à whitelist ou revisar política",
          });
        }
        return [2 /*return*/, violations];
      });
    });
  };
  NotificationSecurity.prototype.validateRateLimit = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var violations, status;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!userId || !this.securityConfig.rate_limiting.enabled) {
              return [2 /*return*/, []];
            }
            violations = [];
            return [4 /*yield*/, this.checkRateLimit(userId)];
          case 1:
            status = _a.sent();
            if (status.limits_exceeded) {
              violations.push({
                type: "rate_limit",
                severity: "high",
                description: "Limite de rate limiting excedido",
                recommendation: "Aguardar reset do limite ou revisar política",
              });
            }
            return [2 /*return*/, violations];
        }
      });
    });
  };
  NotificationSecurity.prototype.validateContent = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var violations, content, filterResult, _i, _a, issue;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            violations = [];
            if (!this.securityConfig.content_filtering.enabled) {
              return [2 /*return*/, violations];
            }
            content = JSON.stringify(data);
            return [4 /*yield*/, this.filterContent(content)];
          case 1:
            filterResult = _b.sent();
            for (_i = 0, _a = filterResult.detected_issues; _i < _a.length; _i++) {
              issue = _a[_i];
              violations.push({
                type: issue.type,
                severity:
                  issue.confidence > 0.8 ? "high" : issue.confidence > 0.5 ? "medium" : "low",
                description: "".concat(issue.type, " detectado: ").concat(issue.location),
                recommendation: issue.suggestion,
              });
            }
            return [2 /*return*/, violations];
        }
      });
    });
  };
  NotificationSecurity.prototype.validateLGPDCompliance = function (data, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var violations, hasConsent, hasOptOut, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            violations = [];
            if (!userId) return [2 /*return*/, violations];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [4 /*yield*/, this.lgpdManager.hasValidConsent(userId, "notifications")];
          case 2:
            hasConsent = _a.sent();
            if (!hasConsent) {
              violations.push({
                type: "pii_detected",
                severity: "critical",
                description: "Usuário não possui consentimento válido para notificações",
                recommendation: "Obter consentimento antes do envio",
              });
            }
            return [4 /*yield*/, this.lgpdManager.hasOptedOut(userId, "notifications")];
          case 3:
            hasOptOut = _a.sent();
            if (hasOptOut) {
              violations.push({
                type: "pii_detected",
                severity: "high",
                description: "Usuário optou por não receber notificações",
                recommendation: "Respeitar preferência do usuário",
              });
            }
            return [3 /*break*/, 5];
          case 4:
            error_10 = _a.sent();
            violations.push({
              type: "pii_detected",
              severity: "medium",
              description: "Erro ao validar compliance LGPD",
              recommendation: "Verificar configuração LGPD",
            });
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/, violations];
        }
      });
    });
  };
  NotificationSecurity.prototype.validateDataRetention = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var violations, createdDate, now, daysDiff;
      return __generator(this, function (_a) {
        violations = [];
        if (data.created_at) {
          createdDate = new Date(data.created_at);
          now = new Date();
          daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff > this.securityConfig.data_retention_days) {
            violations.push({
              type: "data_retention",
              severity: "medium",
              description: "Dados com ".concat(
                daysDiff,
                " dias excedem pol\u00EDtica de reten\u00E7\u00E3o",
              ),
              recommendation: "Anonimizar ou deletar dados antigos",
            });
          }
        }
        return [2 /*return*/, violations];
      });
    });
  };
  NotificationSecurity.prototype.detectPII = function (content) {
    var issues = [];
    for (var _i = 0, _a = this.piiPatterns; _i < _a.length; _i++) {
      var pattern = _a[_i];
      var matches = content.match(pattern);
      if (matches) {
        for (var _b = 0, matches_1 = matches; _b < matches_1.length; _b++) {
          var match = matches_1[_b];
          issues.push({
            type: "pii",
            confidence: 0.9,
            location: 'Texto: "'.concat(match, '"'),
            suggestion: "Remover ou mascarar dados pessoais",
          });
        }
      }
    }
    return issues;
  };
  NotificationSecurity.prototype.detectSpam = function (content) {
    var issues = [];
    var lowerContent = content.toLowerCase();
    for (var _i = 0, _a = this.spamKeywords; _i < _a.length; _i++) {
      var keyword = _a[_i];
      if (lowerContent.includes(keyword.toLowerCase())) {
        issues.push({
          type: "spam",
          confidence: 0.7,
          location: 'Palavra-chave: "'.concat(keyword, '"'),
          suggestion: "Revisar conteúdo para evitar características de spam",
        });
      }
    }
    return issues;
  };
  NotificationSecurity.prototype.detectMaliciousLinks = function (content) {
    return __awaiter(this, void 0, void 0, function () {
      var issues, urlRegex, urls, _loop_1, this_1, _i, urls_1, url;
      return __generator(this, function (_a) {
        issues = [];
        urlRegex =
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
        urls = content.match(urlRegex) || [];
        _loop_1 = (url) => {
          // Verificar padrões suspeitos
          for (var _b = 0, _c = this_1.suspiciousPatterns; _b < _c.length; _b++) {
            var pattern = _c[_b];
            if (pattern.test(url)) {
              issues.push({
                type: "malicious_link",
                confidence: 0.8,
                location: 'URL: "'.concat(url, '"'),
                suggestion: "Verificar e validar links antes do envio",
              });
              break;
            }
          }
          // Verificar domínios suspeitos (implementação simplificada)
          var suspiciousDomains = ["bit.ly", "tinyurl.com", "short.link"];
          var domain = new URL(url).hostname;
          if (suspiciousDomains.some((d) => domain.includes(d))) {
            issues.push({
              type: "malicious_link",
              confidence: 0.6,
              location: 'Dom\u00EDnio suspeito: "'.concat(domain, '"'),
              suggestion: "Evitar links encurtados ou verificar destino",
            });
          }
        };
        this_1 = this;
        for (_i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
          url = urls_1[_i];
          _loop_1(url);
        }
        return [2 /*return*/, issues];
      });
    });
  };
  NotificationSecurity.prototype.sanitizePII = function (content) {
    var sanitized = content;
    for (var _i = 0, _a = this.piiPatterns; _i < _a.length; _i++) {
      var pattern = _a[_i];
      sanitized = sanitized.replace(pattern, "[DADOS_PESSOAIS_REMOVIDOS]");
    }
    return sanitized;
  };
  NotificationSecurity.prototype.sanitizeMaliciousLinks = function (content) {
    var sanitized = content;
    for (var _i = 0, _a = this.suspiciousPatterns; _i < _a.length; _i++) {
      var pattern = _a[_i];
      sanitized = sanitized.replace(pattern, "[LINK_REMOVIDO]");
    }
    return sanitized;
  };
  NotificationSecurity.prototype.generateSecurityRecommendations = (violations) => {
    var recommendations = new Set();
    for (var _i = 0, violations_1 = violations; _i < violations_1.length; _i++) {
      var violation = violations_1[_i];
      recommendations.add(violation.recommendation);
    }
    // Recomendações gerais baseadas no padrão de violações
    var criticalCount = violations.filter((v) => v.severity === "critical").length;
    var highCount = violations.filter((v) => v.severity === "high").length;
    if (criticalCount > 0) {
      recommendations.add("Revisar urgentemente as políticas de segurança");
    }
    if (highCount > 3) {
      recommendations.add("Implementar treinamento de segurança para equipe");
    }
    var piiCount = violations.filter((v) => v.type === "pii_detected").length;
    if (piiCount > 0) {
      recommendations.add("Implementar validação automática de PII");
    }
    return Array.from(recommendations);
  };
  NotificationSecurity.prototype.logSecurityAudit = function (auditData) {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("security_audit_logs").insert(
                __assign(__assign({}, auditData), {
                  timestamp: new Date().toISOString(),
                  metadata: {},
                }),
              ),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Erro ao registrar auditoria de segurança:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return NotificationSecurity;
})();
exports.NotificationSecurity = NotificationSecurity;
exports.default = NotificationSecurity;
