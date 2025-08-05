"use strict";
/**
 * LGPD Compliance Framework - Core System
 * Sistema principal de conformidade com LGPD
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 8º, 9º, 18º, 46º
 */
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
exports.LGPDManager =
  exports.DataSubjectRequestStatus =
  exports.DataSubjectRequestType =
  exports.LGPDCore =
  exports.LGPDComplianceService =
  exports.LGPDDataSubjectService =
  exports.LGPDConsentService =
  exports.LGPDEncryptionService =
    void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var crypto_1 = require("crypto");
var lgpd_1 = require("../../types/lgpd");
// ============================================================================
// ENCRYPTION SERVICE
// ============================================================================
var LGPDEncryptionService = /** @class */ (function () {
  function LGPDEncryptionService() {}
  LGPDEncryptionService.getEncryptionKey = function (password, salt) {
    return crypto_1.default.pbkdf2Sync(
      password,
      salt,
      this.DEFAULT_CONFIG.iterations,
      this.DEFAULT_CONFIG.keySize,
      "sha512",
    );
  };
  /**
   * Criptografa dados sensíveis conforme LGPD Art. 46º
   */
  LGPDEncryptionService.encrypt = function (data, masterKey) {
    try {
      var salt = crypto_1.default.randomBytes(this.DEFAULT_CONFIG.saltSize);
      var iv = crypto_1.default.randomBytes(this.DEFAULT_CONFIG.ivSize);
      var key = this.getEncryptionKey(masterKey, salt);
      var cipher = crypto_1.default.createCipher(this.DEFAULT_CONFIG.algorithm, key);
      cipher.setAAD(Buffer.from("lgpd-compliance"));
      var encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");
      var authTag = cipher.getAuthTag();
      return {
        data: encrypted + ":" + authTag.toString("hex"),
        iv: iv.toString("hex"),
        salt: salt.toString("hex"),
        algorithm: this.DEFAULT_CONFIG.algorithm,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error("Encryption failed: ".concat(error.message));
    }
  };
  /**
   * Descriptografa dados sensíveis
   */
  LGPDEncryptionService.decrypt = function (encryptedData, masterKey) {
    try {
      var salt = Buffer.from(encryptedData.salt, "hex");
      var iv = Buffer.from(encryptedData.iv, "hex");
      var key = this.getEncryptionKey(masterKey, salt);
      var _a = encryptedData.data.split(":"),
        encrypted = _a[0],
        authTagHex = _a[1];
      var authTag = Buffer.from(authTagHex, "hex");
      var decipher = crypto_1.default.createDecipher(encryptedData.algorithm, key);
      decipher.setAAD(Buffer.from("lgpd-compliance"));
      decipher.setAuthTag(authTag);
      var decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      throw new Error("Decryption failed: ".concat(error.message));
    }
  };
  /**
   * Verifica se dados estão criptografados
   */
  LGPDEncryptionService.isEncrypted = function (data) {
    return (
      typeof data === "object" &&
      data !== null &&
      "data" in data &&
      "iv" in data &&
      "salt" in data &&
      "algorithm" in data
    );
  };
  LGPDEncryptionService.DEFAULT_CONFIG = {
    algorithm: "aes-256-gcm",
    keySize: 32,
    ivSize: 16,
    saltSize: 32,
    iterations: 100000,
  };
  return LGPDEncryptionService;
})();
exports.LGPDEncryptionService = LGPDEncryptionService;
// ============================================================================
// CONSENT MANAGEMENT SERVICE
// ============================================================================
var LGPDConsentService = /** @class */ (function () {
  function LGPDConsentService() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  /**
   * Registra consentimento granular (Art. 8º LGPD)
   */
  LGPDConsentService.prototype.grantConsent = function (
    context,
    consentType,
    legalBasis,
    purpose,
    description,
    expiresAt,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var consentRecord, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            consentRecord = {
              userId: context.userId,
              clinicId: context.clinicId,
              consentType: consentType,
              status: lgpd_1.ConsentStatus.GRANTED,
              legalBasis: legalBasis,
              purpose: purpose,
              description: description,
              grantedAt: context.timestamp,
              expiresAt: expiresAt,
              ipAddress: context.ipAddress,
              userAgent: context.userAgent,
              version: "1.0.0",
            };
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_consent_records").insert(consentRecord).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to grant consent: ".concat(error.message));
            }
            // Log auditoria
            return [
              4 /*yield*/,
              this.logAuditEvent({
                eventType: lgpd_1.AuditEventType.CONSENT_GRANTED,
                userId: context.userId,
                clinicId: context.clinicId,
                dataSubject: context.userId,
                description: "Consent granted for ".concat(consentType, ": ").concat(purpose),
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                timestamp: context.timestamp,
                riskLevel: "low",
                processed: true,
              }),
            ];
          case 2:
            // Log auditoria
            _b.sent();
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * Revoga consentimento (Art. 8º §5º LGPD)
   */
  LGPDConsentService.prototype.withdrawConsent = function (context, consentId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .update({
                  status: lgpd_1.ConsentStatus.WITHDRAWN,
                  withdrawnAt: context.timestamp,
                  updatedAt: context.timestamp,
                })
                .eq("id", consentId)
                .eq("userId", context.userId)
                .eq("clinicId", context.clinicId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to withdraw consent: ".concat(error.message));
            }
            // Log auditoria
            return [
              4 /*yield*/,
              this.logAuditEvent({
                eventType: lgpd_1.AuditEventType.CONSENT_WITHDRAWN,
                userId: context.userId,
                clinicId: context.clinicId,
                dataSubject: context.userId,
                description: "Consent withdrawn for ID: ".concat(consentId),
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                timestamp: context.timestamp,
                riskLevel: "medium",
                processed: true,
              }),
            ];
          case 2:
            // Log auditoria
            _b.sent();
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * Verifica consentimento válido
   */
  LGPDConsentService.prototype.checkConsent = function (userId, clinicId, consentType) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, now, isExpired;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("*")
                .eq("userId", userId)
                .eq("clinicId", clinicId)
                .eq("consentType", consentType)
                .eq("status", lgpd_1.ConsentStatus.GRANTED)
                .order("grantedAt", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  hasConsent: false,
                  consentType: consentType,
                  legalBasis: lgpd_1.LegalBasis.CONSENT,
                  canProcess: false,
                  warnings: ["No valid consent found"],
                },
              ];
            }
            now = new Date();
            isExpired = data.expiresAt && new Date(data.expiresAt) < now;
            return [
              2 /*return*/,
              {
                hasConsent: !isExpired,
                consentType: consentType,
                grantedAt: new Date(data.grantedAt),
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
                legalBasis: data.legalBasis,
                canProcess: !isExpired,
                warnings: isExpired ? ["Consent has expired"] : undefined,
              },
            ];
        }
      });
    });
  };
  /**
   * Lista consentimentos do usuário
   */
  LGPDConsentService.prototype.getUserConsents = function (userId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("*")
                .eq("userId", userId)
                .eq("clinicId", clinicId)
                .order("createdAt", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get user consents: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Registra evento de auditoria
   */
  LGPDConsentService.prototype.logAuditEvent = function (auditLog) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("lgpd_audit_logs").insert(auditLog)];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to log audit event:", error);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  return LGPDConsentService;
})();
exports.LGPDConsentService = LGPDConsentService;
// ============================================================================
// DATA SUBJECT RIGHTS SERVICE
// ============================================================================
var LGPDDataSubjectService = /** @class */ (function () {
  function LGPDDataSubjectService() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.encryptionService = LGPDEncryptionService;
  }
  /**
   * Processa solicitação de direito do titular (Art. 18º LGPD)
   */
  LGPDDataSubjectService.prototype.submitRequest = function (context, requestType, description) {
    return __awaiter(this, void 0, void 0, function () {
      var request, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            request = {
              userId: context.userId,
              clinicId: context.clinicId,
              requestType: requestType,
              status: lgpd_1.RequestStatus.PENDING,
              description: description,
              requestedAt: context.timestamp,
            };
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_data_subject_requests").insert(request).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to submit request: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * Implementa direito ao esquecimento (Art. 18º III LGPD)
   */
  LGPDDataSubjectService.prototype.processErasureRequest = function (requestId, processorId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, request, requestError;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .select("*")
                .eq("id", requestId)
                .eq("requestType", lgpd_1.DataSubjectRight.ELIMINATION)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (request = _a.data), (requestError = _a.error);
            if (requestError || !request) {
              throw new Error("Erasure request not found");
            }
            // Anonimizar dados do usuário
            return [4 /*yield*/, this.anonymizeUserData(request.userId, request.clinicId)];
          case 2:
            // Anonimizar dados do usuário
            _b.sent();
            // Atualizar status da solicitação
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .update({
                  status: lgpd_1.RequestStatus.COMPLETED,
                  processorId: processorId,
                  processedAt: new Date(),
                  completedAt: new Date(),
                })
                .eq("id", requestId),
            ];
          case 3:
            // Atualizar status da solicitação
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Anonimiza dados do usuário
   */
  LGPDDataSubjectService.prototype.anonymizeUserData = function (userId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var anonymizedData;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            anonymizedData = {
              name: "ANONIMIZADO",
              email: "anonimizado_".concat(Date.now(), "@example.com"),
              cpf: null,
              phone: null,
              address: null,
              anonymized: true,
              anonymizedAt: new Date(),
            };
            // Anonimizar na tabela de usuários
            return [
              4 /*yield*/,
              this.supabase
                .from("users")
                .update(anonymizedData)
                .eq("id", userId)
                .eq("clinic_id", clinicId),
            ];
          case 1:
            // Anonimizar na tabela de usuários
            _a.sent();
            // Anonimizar dados médicos
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_records")
                .update({
                  notes: "DADOS ANONIMIZADOS",
                  anonymized: true,
                  anonymizedAt: new Date(),
                })
                .eq("patient_id", userId)
                .eq("clinic_id", clinicId),
            ];
          case 2:
            // Anonimizar dados médicos
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Exporta dados do usuário (portabilidade - Art. 18º V LGPD)
   */
  LGPDDataSubjectService.prototype.exportUserData = function (userId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var userData, user, medicalRecords, consents;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            userData = {};
            return [
              4 /*yield*/,
              this.supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .eq("clinic_id", clinicId)
                .single(),
            ];
          case 1:
            user = _a.sent().data;
            if (user) {
              userData.personal = user;
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_records")
                .select("*")
                .eq("patient_id", userId)
                .eq("clinic_id", clinicId),
            ];
          case 2:
            medicalRecords = _a.sent().data;
            if (medicalRecords) {
              userData.medical = medicalRecords;
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_consent_records")
                .select("*")
                .eq("userId", userId)
                .eq("clinicId", clinicId),
            ];
          case 3:
            consents = _a.sent().data;
            if (consents) {
              userData.consents = consents;
            }
            return [2 /*return*/, userData];
        }
      });
    });
  };
  return LGPDDataSubjectService;
})();
exports.LGPDDataSubjectService = LGPDDataSubjectService;
// ============================================================================
// MAIN LGPD SERVICE
// ============================================================================
var LGPDComplianceService = /** @class */ (function () {
  function LGPDComplianceService() {
    this.consent = new LGPDConsentService();
    this.dataSubject = new LGPDDataSubjectService();
    this.encryption = LGPDEncryptionService;
  }
  /**
   * Valida contexto LGPD
   */
  LGPDComplianceService.validateContext = function (context) {
    if (!context.userId || !context.clinicId) {
      throw new Error("User ID and Clinic ID are required");
    }
    return {
      userId: context.userId,
      clinicId: context.clinicId,
      ipAddress: context.ipAddress || "unknown",
      userAgent: context.userAgent || "unknown",
      timestamp: context.timestamp || new Date(),
    };
  };
  /**
   * Cria resposta padronizada da API
   */
  LGPDComplianceService.createApiResponse = function (data, compliance) {
    return {
      success: true,
      data: data,
      compliance: compliance,
      timestamp: new Date(),
    };
  };
  /**
   * Cria resposta de erro padronizada
   */
  LGPDComplianceService.createErrorResponse = function (error) {
    return {
      success: false,
      error: error,
      compliance: {
        processed: false,
        auditLogged: true,
        consentVerified: false,
      },
      timestamp: new Date(),
    };
  };
  return LGPDComplianceService;
})();
exports.LGPDComplianceService = LGPDComplianceService;
exports.LGPDCore = LGPDComplianceService;
exports.LGPDManager = LGPDComplianceService;
// Export DataSubjectRight as DataSubjectRequestType for compatibility
var lgpd_2 = require("../../types/lgpd");
Object.defineProperty(exports, "DataSubjectRequestType", {
  enumerable: true,
  get: function () {
    return lgpd_2.DataSubjectRight;
  },
});
// Export RequestStatus as DataSubjectRequestStatus for compatibility
var lgpd_3 = require("../../types/lgpd");
Object.defineProperty(exports, "DataSubjectRequestStatus", {
  enumerable: true,
  get: function () {
    return lgpd_3.RequestStatus;
  },
});
exports.default = LGPDComplianceService;
