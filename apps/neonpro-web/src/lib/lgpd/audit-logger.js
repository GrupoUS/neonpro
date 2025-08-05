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
exports.AUDIT_DATA_CATEGORIES =
  exports.AuditLogger =
  exports.auditLogSchema =
  exports.RiskLevel =
  exports.DataProcessingActivity =
    void 0;
var zod_1 = require("zod");
/**
 * LGPD Audit Trail System
 * Comprehensive logging system for data processing activities as required by LGPD Article 37
 */
// Data processing activities that must be logged
var DataProcessingActivity;
((DataProcessingActivity) => {
  // Patient data operations
  DataProcessingActivity["PATIENT_CREATE"] = "patient_create";
  DataProcessingActivity["PATIENT_READ"] = "patient_read";
  DataProcessingActivity["PATIENT_UPDATE"] = "patient_update";
  DataProcessingActivity["PATIENT_DELETE"] = "patient_delete";
  DataProcessingActivity["PATIENT_EXPORT"] = "patient_export";
  DataProcessingActivity["PATIENT_ANONYMIZE"] = "patient_anonymize";
  // Medical records
  DataProcessingActivity["MEDICAL_RECORD_CREATE"] = "medical_record_create";
  DataProcessingActivity["MEDICAL_RECORD_READ"] = "medical_record_read";
  DataProcessingActivity["MEDICAL_RECORD_UPDATE"] = "medical_record_update";
  DataProcessingActivity["MEDICAL_RECORD_DELETE"] = "medical_record_delete";
  DataProcessingActivity["MEDICAL_RECORD_SHARE"] = "medical_record_share";
  // Appointment operations
  DataProcessingActivity["APPOINTMENT_CREATE"] = "appointment_create";
  DataProcessingActivity["APPOINTMENT_READ"] = "appointment_read";
  DataProcessingActivity["APPOINTMENT_UPDATE"] = "appointment_update";
  DataProcessingActivity["APPOINTMENT_CANCEL"] = "appointment_cancel";
  DataProcessingActivity["APPOINTMENT_EXPORT"] = "appointment_export";
  // Financial data
  DataProcessingActivity["FINANCIAL_CREATE"] = "financial_create";
  DataProcessingActivity["FINANCIAL_READ"] = "financial_read";
  DataProcessingActivity["FINANCIAL_UPDATE"] = "financial_update";
  DataProcessingActivity["FINANCIAL_EXPORT"] = "financial_export";
  // System operations
  DataProcessingActivity["LOGIN"] = "login";
  DataProcessingActivity["LOGOUT"] = "logout";
  DataProcessingActivity["PASSWORD_CHANGE"] = "password_change";
  DataProcessingActivity["DATA_BREACH"] = "data_breach";
  DataProcessingActivity["CONSENT_CHANGE"] = "consent_change";
  DataProcessingActivity["DATA_PORTABILITY"] = "data_portability";
  DataProcessingActivity["RIGHT_TO_BE_FORGOTTEN"] = "right_to_be_forgotten";
  // Third party sharing
  DataProcessingActivity["THIRD_PARTY_SHARE"] = "third_party_share";
  DataProcessingActivity["THIRD_PARTY_ACCESS"] = "third_party_access";
  // System administration
  DataProcessingActivity["BACKUP_CREATE"] = "backup_create";
  DataProcessingActivity["BACKUP_RESTORE"] = "backup_restore";
  DataProcessingActivity["DATA_MIGRATION"] = "data_migration";
  DataProcessingActivity["SYSTEM_MAINTENANCE"] = "system_maintenance";
})(DataProcessingActivity || (exports.DataProcessingActivity = DataProcessingActivity = {}));
// Risk levels for audit events
var RiskLevel;
((RiskLevel) => {
  RiskLevel["LOW"] = "low";
  RiskLevel["MEDIUM"] = "medium";
  RiskLevel["HIGH"] = "high";
  RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
// Audit log entry schema
exports.auditLogSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  // Event identification
  activity: zod_1.z.nativeEnum(DataProcessingActivity),
  riskLevel: zod_1.z.nativeEnum(RiskLevel),
  description: zod_1.z.string().min(10, "Descrição deve ser específica"),
  // Data subject information
  dataSubjectId: zod_1.z.string().uuid().optional(), // Patient ID if applicable
  dataSubjectType: zod_1.z.enum(["patient", "employee", "visitor", "system"]).optional(),
  // Actor information (who performed the action)
  actorId: zod_1.z.string().uuid(),
  actorType: zod_1.z.enum(["user", "system", "api", "third_party"]),
  actorRole: zod_1.z.string().optional(), // e.g., 'doctor', 'receptionist', 'admin'
  // Technical details
  ipAddress: zod_1.z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "IP inválido"),
  userAgent: zod_1.z.string().optional(),
  sessionId: zod_1.z.string().optional(),
  // Data processing details
  dataCategories: zod_1.z.array(zod_1.z.string()),
  legalBasis: zod_1.z.enum([
    "consent",
    "contract",
    "legal_obligation",
    "vital_interests",
    "public_interest",
    "legitimate_interests",
  ]),
  purpose: zod_1.z.string().min(10, "Finalidade deve ser específica"),
  // Technical metadata
  timestamp: zod_1.z.date().default(() => new Date()),
  source: zod_1.z.enum(["web", "mobile", "api", "system", "clinic_terminal"]),
  method: zod_1.z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "SYSTEM"]).optional(),
  endpoint: zod_1.z.string().optional(),
  // Result and impact
  success: zod_1.z.boolean(),
  errorCode: zod_1.z.string().optional(),
  errorMessage: zod_1.z.string().optional(),
  recordsAffected: zod_1.z.number().min(0).default(0),
  // Additional context
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  // Retention information
  retentionPeriod: zod_1.z.number().optional(), // Days to retain this log
  createdAt: zod_1.z.date().default(() => new Date()),
});
var AuditLogger = /** @class */ (() => {
  function AuditLogger() {}
  /**
   * Log a data processing activity
   */
  AuditLogger.log = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var auditEntry, validated;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            auditEntry = {
              id: crypto.randomUUID(),
              activity: params.activity,
              riskLevel:
                params.riskLevel || this.calculateRiskLevel(params.activity, params.success),
              description: params.description,
              dataSubjectId: params.dataSubjectId,
              dataSubjectType: params.dataSubjectType,
              actorId: params.actorId,
              actorType: params.actorType,
              actorRole: params.actorRole,
              ipAddress: params.ipAddress,
              userAgent: params.userAgent,
              sessionId: params.sessionId,
              dataCategories: params.dataCategories,
              legalBasis: params.legalBasis,
              purpose: params.purpose,
              timestamp: new Date(),
              source: params.source,
              method: params.method,
              endpoint: params.endpoint,
              success: params.success,
              errorCode: params.errorCode,
              errorMessage: params.errorMessage,
              recordsAffected: params.recordsAffected || 0,
              metadata: params.metadata,
              retentionPeriod: this.getRetentionPeriod(params.activity),
              createdAt: new Date(),
            };
            validated = exports.auditLogSchema.parse(auditEntry);
            // TODO: Store in secure audit database
            console.log("Audit log created:", validated);
            if (
              !(
                validated.riskLevel === RiskLevel.HIGH || validated.riskLevel === RiskLevel.CRITICAL
              )
            )
              return [3 /*break*/, 2];
            return [4 /*yield*/, this.alertSecurityTeam(validated)];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/, validated];
        }
      });
    });
  };
  /**
   * Log patient data access (most common healthcare operation)
   */
  AuditLogger.logPatientAccess = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var activityMap;
      return __generator(this, function (_a) {
        activityMap = {
          create: DataProcessingActivity.PATIENT_CREATE,
          read: DataProcessingActivity.PATIENT_READ,
          update: DataProcessingActivity.PATIENT_UPDATE,
          delete: DataProcessingActivity.PATIENT_DELETE,
        };
        return [
          2 /*return*/,
          this.log({
            activity: activityMap[params.operation],
            description: "".concat(params.operation.toUpperCase(), " operation on patient data"),
            actorId: params.actorId,
            actorType: "user",
            actorRole: params.actorRole,
            dataSubjectId: params.patientId,
            dataSubjectType: "patient",
            dataCategories: ["identification", "contact", "health"],
            legalBasis: "consent",
            purpose: params.purpose,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            sessionId: params.sessionId,
            source: params.source,
            success: params.success,
            errorMessage: params.errorMessage,
            recordsAffected: params.recordsAffected,
          }),
        ];
      });
    });
  };
  /**
   * Log consent changes (critical for LGPD compliance)
   */
  AuditLogger.logConsentChange = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.log({
            activity: DataProcessingActivity.CONSENT_CHANGE,
            description: "Consent "
              .concat(params.consentType, " changed from ")
              .concat(params.oldStatus, " to ")
              .concat(params.newStatus),
            actorId: params.actorId,
            actorType: "user",
            dataSubjectId: params.patientId,
            dataSubjectType: "patient",
            dataCategories: ["consent", "legal_basis"],
            legalBasis: "legal_obligation",
            purpose: "Gestão de consentimentos conforme LGPD",
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            source: "web",
            success: true,
            metadata: {
              consentType: params.consentType,
              oldStatus: params.oldStatus,
              newStatus: params.newStatus,
              reason: params.reason,
            },
            riskLevel: RiskLevel.MEDIUM,
          }),
        ];
      });
    });
  };
  /**
   * Log data breach incidents (mandatory reporting under LGPD)
   */
  AuditLogger.logDataBreach = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.log({
            activity: DataProcessingActivity.DATA_BREACH,
            description: "Data breach incident: ".concat(params.description),
            actorId: params.actorId,
            actorType: "system",
            dataCategories: params.dataCategories,
            legalBasis: "legal_obligation",
            purpose: "Registro de incidente de segurança para compliance LGPD",
            ipAddress: params.ipAddress,
            source: "system",
            success: false,
            recordsAffected: params.affectedRecords,
            metadata: params.incidentDetails,
            riskLevel:
              params.severity === "critical"
                ? RiskLevel.CRITICAL
                : params.severity === "high"
                  ? RiskLevel.HIGH
                  : params.severity === "medium"
                    ? RiskLevel.MEDIUM
                    : RiskLevel.LOW,
          }),
        ];
      });
    });
  };
  /**
   * Generate audit report for compliance purposes
   */
  AuditLogger.generateAuditReport = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // TODO: Query audit database with filters
        // Placeholder implementation
        return [
          2 /*return*/,
          {
            generatedAt: new Date(),
            period: { start: params.startDate, end: params.endDate },
            totalActivities: 0,
            activitiesByType: {},
            riskDistribution: {},
            topActors: [],
            breaches: 0,
            complianceIssues: [],
            recommendations: [
              "Implementar autenticação multifator para usuários administrativos",
              "Revisar políticas de retenção de dados",
              "Treinar equipe sobre boas práticas de proteção de dados",
            ],
          },
        ];
      });
    });
  };
  /**
   * Search audit logs for specific criteria
   */
  AuditLogger.searchLogs = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // TODO: Implement database search
        // Placeholder implementation
        return [
          2 /*return*/,
          {
            logs: [],
            total: 0,
            hasMore: false,
          },
        ];
      });
    });
  };
  // Private helper methods
  AuditLogger.calculateRiskLevel = (activity, success) => {
    // High risk activities
    var highRiskActivities = [
      DataProcessingActivity.PATIENT_DELETE,
      DataProcessingActivity.MEDICAL_RECORD_DELETE,
      DataProcessingActivity.DATA_BREACH,
      DataProcessingActivity.THIRD_PARTY_SHARE,
    ];
    // Medium risk activities
    var mediumRiskActivities = [
      DataProcessingActivity.PATIENT_EXPORT,
      DataProcessingActivity.MEDICAL_RECORD_SHARE,
      DataProcessingActivity.FINANCIAL_EXPORT,
      DataProcessingActivity.DATA_PORTABILITY,
    ];
    if (!success && highRiskActivities.includes(activity)) {
      return RiskLevel.CRITICAL;
    }
    if (highRiskActivities.includes(activity)) {
      return RiskLevel.HIGH;
    }
    if (mediumRiskActivities.includes(activity)) {
      return RiskLevel.MEDIUM;
    }
    return RiskLevel.LOW;
  };
  AuditLogger.getRetentionPeriod = (activity) => {
    var _a;
    // Retention periods in days according to healthcare regulations
    var retentionPeriods =
      ((_a = {}),
      (_a[DataProcessingActivity.MEDICAL_RECORD_CREATE] =
        3650), // 10 years
      (_a[DataProcessingActivity.MEDICAL_RECORD_READ] =
        1825), // 5 years
      (_a[DataProcessingActivity.MEDICAL_RECORD_UPDATE] = 3650),
      (_a[DataProcessingActivity.MEDICAL_RECORD_DELETE] = 3650),
      (_a[DataProcessingActivity.DATA_BREACH] =
        3650), // 10 years for security incidents
      (_a[DataProcessingActivity.CONSENT_CHANGE] =
        2555), // 7 years
      (_a[DataProcessingActivity.FINANCIAL_CREATE] =
        1825), // 5 years for financial data
      (_a[DataProcessingActivity.LOGIN] =
        365), // 1 year for access logs
      (_a[DataProcessingActivity.LOGOUT] = 365),
      _a);
    return retentionPeriods[activity] || 1095; // Default 3 years
  };
  AuditLogger.alertSecurityTeam = function (auditEntry) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // TODO: Implement security alert system
        console.log("Security alert triggered:", {
          activity: auditEntry.activity,
          riskLevel: auditEntry.riskLevel,
          description: auditEntry.description,
          timestamp: auditEntry.timestamp,
        });
        return [2 /*return*/];
      });
    });
  };
  return AuditLogger;
})();
exports.AuditLogger = AuditLogger;
/**
 * Standard data categories for healthcare audit logging
 */
exports.AUDIT_DATA_CATEGORIES = {
  IDENTIFICATION: "identification",
  CONTACT: "contact",
  HEALTH: "health",
  FINANCIAL: "financial",
  BEHAVIORAL: "behavioral",
  BIOMETRIC: "biometric",
  CONSENT: "consent",
  LEGAL_BASIS: "legal_basis",
  LOCATION: "location",
  TECHNICAL: "technical",
};
