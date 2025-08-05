"use strict";
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.STANDARD_RESPONSE_TIMES =
  exports.DataSubjectRightsManager =
  exports.dataSubjectRequestSchema =
  exports.RequestStatus =
  exports.DataSubjectRight =
    void 0;
var zod_1 = require("zod");
var audit_logger_1 = require("./audit-logger");
/**
 * LGPD Data Subject Rights Implementation
 * Implements all rights guaranteed to data subjects under LGPD Articles 18-22
 */
// Types of rights requests under LGPD
var DataSubjectRight;
(function (DataSubjectRight) {
  DataSubjectRight["ACCESS"] = "access";
  DataSubjectRight["RECTIFICATION"] = "rectification";
  DataSubjectRight["ERASURE"] = "erasure";
  DataSubjectRight["PORTABILITY"] = "portability";
  DataSubjectRight["RESTRICT_PROCESSING"] = "restrict_processing";
  DataSubjectRight["OBJECT_PROCESSING"] = "object_processing";
  DataSubjectRight["WITHDRAW_CONSENT"] = "withdraw_consent";
  DataSubjectRight["INFORMATION"] = "information"; // Art. 18, II - Right to information about processing
})(DataSubjectRight || (exports.DataSubjectRight = DataSubjectRight = {}));
// Status of rights requests
var RequestStatus;
(function (RequestStatus) {
  RequestStatus["SUBMITTED"] = "submitted";
  RequestStatus["IN_PROGRESS"] = "in_progress";
  RequestStatus["COMPLETED"] = "completed";
  RequestStatus["REJECTED"] = "rejected";
  RequestStatus["PARTIALLY_COMPLETED"] = "partially_completed";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
// Data subject rights request schema
exports.dataSubjectRequestSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  // Request identification
  requestType: zod_1.z.nativeEnum(DataSubjectRight),
  status: zod_1.z.nativeEnum(RequestStatus).default(RequestStatus.SUBMITTED),
  // Data subject information
  dataSubjectId: zod_1.z.string().uuid(),
  dataSubjectEmail: zod_1.z.string().email(),
  dataSubjectName: zod_1.z.string(),
  // Request details
  description: zod_1.z.string().min(10, "Descrição da solicitação é obrigatória"),
  specificData: zod_1.z.array(zod_1.z.string()).optional(), // Specific data categories requested
  // Legal and procedural
  legalBasis: zod_1.z.string().optional(),
  urgency: zod_1.z.enum(["normal", "urgent"]).default("normal"),
  // Processing information
  submittedAt: zod_1.z.date().default(function () {
    return new Date();
  }),
  processedAt: zod_1.z.date().optional(),
  completedAt: zod_1.z.date().optional(),
  deadline: zod_1.z.date(), // LGPD requires response within reasonable time
  // Assignee and processing
  assignedTo: zod_1.z.string().uuid().optional(),
  processingNotes: zod_1.z
    .array(
      zod_1.z.object({
        timestamp: zod_1.z.date(),
        userId: zod_1.z.string().uuid(),
        note: zod_1.z.string(),
        action: zod_1.z.string().optional(),
      }),
    )
    .default([]),
  // Results
  resultSummary: zod_1.z.string().optional(),
  documentsGenerated: zod_1.z
    .array(
      zod_1.z.object({
        type: zod_1.z.string(),
        filename: zod_1.z.string(),
        path: zod_1.z.string(),
        generatedAt: zod_1.z.date(),
      }),
    )
    .default([]),
  // Communication
  communicationHistory: zod_1.z
    .array(
      zod_1.z.object({
        timestamp: zod_1.z.date(),
        method: zod_1.z.enum(["email", "phone", "letter", "in_person"]),
        direction: zod_1.z.enum(["inbound", "outbound"]),
        summary: zod_1.z.string(),
      }),
    )
    .default([]),
  // Identity verification
  identityVerified: zod_1.z.boolean().default(false),
  verificationMethod: zod_1.z
    .enum(["document", "biometric", "knowledge_based", "in_person"])
    .optional(),
  verificationDate: zod_1.z.date().optional(),
  // Metadata
  ipAddress: zod_1.z
    .string()
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "IP inválido")
    .optional(),
  userAgent: zod_1.z.string().optional(),
  source: zod_1.z.enum(["web", "email", "phone", "letter", "in_person"]).default("web"),
  createdAt: zod_1.z.date().default(function () {
    return new Date();
  }),
  updatedAt: zod_1.z.date().default(function () {
    return new Date();
  }),
});
var DataSubjectRightsManager = /** @class */ (function () {
  function DataSubjectRightsManager() {}
  /**
   * Submit a new data subject rights request
   */
  DataSubjectRightsManager.submitRequest = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var deadline, request, validated;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            deadline = new Date();
            deadline.setDate(deadline.getDate() + (params.urgency === "urgent" ? 5 : 15));
            request = {
              id: crypto.randomUUID(),
              requestType: params.requestType,
              status: RequestStatus.SUBMITTED,
              dataSubjectId: params.dataSubjectId,
              dataSubjectEmail: params.dataSubjectEmail,
              dataSubjectName: params.dataSubjectName,
              description: params.description,
              specificData: params.specificData,
              urgency: params.urgency || "normal",
              submittedAt: new Date(),
              deadline: deadline,
              processingNotes: [],
              documentsGenerated: [],
              communicationHistory: [],
              identityVerified: false,
              ipAddress: params.ipAddress,
              userAgent: params.userAgent,
              source: params.source || "web",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            validated = exports.dataSubjectRequestSchema.parse(request);
            // Log the request submission
            return [
              4 /*yield*/,
              audit_logger_1.AuditLogger.log({
                activity: audit_logger_1.DataProcessingActivity.PATIENT_READ, // Will be updated when we add rights-specific activities
                description: "Data subject rights request submitted: ".concat(params.requestType),
                actorId: params.dataSubjectId,
                actorType: "user",
                dataSubjectId: params.dataSubjectId,
                dataSubjectType: "patient",
                dataCategories: ["personal_data", "request_metadata"],
                legalBasis: "legal_obligation",
                purpose: "Processamento de solicitação de direitos do titular conforme LGPD",
                ipAddress: params.ipAddress || "127.0.0.1",
                userAgent: params.userAgent,
                source: params.source || "web",
                success: true,
                recordsAffected: 1,
              }),
              // TODO: Store in database
            ];
          case 1:
            // Log the request submission
            _a.sent();
            // TODO: Store in database
            console.log("Data subject request submitted:", validated);
            // Send confirmation email
            return [4 /*yield*/, this.sendConfirmationEmail(validated)];
          case 2:
            // Send confirmation email
            _a.sent();
            return [2 /*return*/, validated];
        }
      });
    });
  };
  /**
   * Process right to access request (most common)
   */
  DataSubjectRightsManager.processAccessRequest = function (requestId, processorId) {
    return __awaiter(this, void 0, void 0, function () {
      var personalData, processingActivities, consentStatus, auditTrail, report;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getPersonalData(requestId)];
          case 1:
            personalData = _a.sent();
            return [4 /*yield*/, this.getProcessingActivities(requestId)];
          case 2:
            processingActivities = _a.sent();
            return [4 /*yield*/, this.getConsentStatus(requestId)];
          case 3:
            consentStatus = _a.sent();
            return [
              4 /*yield*/,
              this.getAuditTrail(requestId),
              // Generate data access report
            ];
          case 4:
            auditTrail = _a.sent();
            report = {
              personalData: personalData,
              processingActivities: processingActivities,
              consentStatus: consentStatus,
              auditTrail: auditTrail,
            };
            // Update request status
            return [
              4 /*yield*/,
              this.updateRequestStatus(requestId, RequestStatus.COMPLETED, processorId),
              // Log completion
            ];
          case 5:
            // Update request status
            _a.sent();
            // Log completion
            return [
              4 /*yield*/,
              audit_logger_1.AuditLogger.log({
                activity: audit_logger_1.DataProcessingActivity.DATA_PORTABILITY,
                description: "Data access request completed",
                actorId: processorId,
                actorType: "user",
                dataCategories: ["all_personal_data"],
                legalBasis: "legal_obligation",
                purpose: "Atendimento ao direito de acesso do titular",
                ipAddress: "127.0.0.1", // System IP
                source: "system",
                success: true,
                recordsAffected: 1,
              }),
            ];
          case 6:
            // Log completion
            _a.sent();
            return [2 /*return*/, report];
        }
      });
    });
  };
  /**
   * Process right to erasure ("right to be forgotten")
   */
  DataSubjectRightsManager.processErasureRequest = function (
    requestId,
    processorId,
    justification,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var request,
        erasureAnalysis,
        itemsErased,
        itemsRetained,
        retentionReasons,
        _i,
        _a,
        item,
        error_1,
        _b,
        _c,
        item,
        success;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            return [4 /*yield*/, this.getRequest(requestId)];
          case 1:
            request = _d.sent();
            if (!request) throw new Error("Request not found");
            return [4 /*yield*/, this.analyzeErasureRequest(request.dataSubjectId)];
          case 2:
            erasureAnalysis = _d.sent();
            itemsErased = 0;
            itemsRetained = 0;
            retentionReasons = [];
            (_i = 0), (_a = erasureAnalysis.canErase);
            _d.label = 3;
          case 3:
            if (!(_i < _a.length)) return [3 /*break*/, 8];
            item = _a[_i];
            _d.label = 4;
          case 4:
            _d.trys.push([4, 6, , 7]);
            return [4 /*yield*/, this.eraseDataItem(item.id, item.type)];
          case 5:
            _d.sent();
            itemsErased++;
            return [3 /*break*/, 7];
          case 6:
            error_1 = _d.sent();
            console.error("Failed to erase item:", item, error_1);
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 3];
          case 8:
            // Document items that must be retained
            for (_b = 0, _c = erasureAnalysis.mustRetain; _b < _c.length; _b++) {
              item = _c[_b];
              itemsRetained++;
              retentionReasons.push({
                item: item.description,
                reason: item.retentionReason,
                legalBasis: item.legalBasis,
              });
            }
            success = itemsErased > 0 || erasureAnalysis.canErase.length === 0;
            // Update request status
            return [
              4 /*yield*/,
              this.updateRequestStatus(
                requestId,
                success ? RequestStatus.COMPLETED : RequestStatus.PARTIALLY_COMPLETED,
                processorId,
              ),
              // Log erasure completion
            ];
          case 9:
            // Update request status
            _d.sent();
            // Log erasure completion
            return [
              4 /*yield*/,
              audit_logger_1.AuditLogger.log({
                activity: audit_logger_1.DataProcessingActivity.RIGHT_TO_BE_FORGOTTEN,
                description: "Right to erasure processed: "
                  .concat(itemsErased, " items erased, ")
                  .concat(itemsRetained, " retained"),
                actorId: processorId,
                actorType: "user",
                dataSubjectId: request.dataSubjectId,
                dataSubjectType: "patient",
                dataCategories: ["personal_data"],
                legalBasis: "legal_obligation",
                purpose: "Atendimento ao direito de eliminação do titular",
                ipAddress: "127.0.0.1",
                source: "system",
                success: success,
                recordsAffected: itemsErased,
                metadata: {
                  justification: justification,
                  itemsRetained: itemsRetained,
                  retentionReasons: retentionReasons.length,
                },
              }),
            ];
          case 10:
            // Log erasure completion
            _d.sent();
            return [
              2 /*return*/,
              {
                success: success,
                itemsErased: itemsErased,
                itemsRetained: itemsRetained,
                retentionReasons: retentionReasons,
              },
            ];
        }
      });
    });
  };
  /**
   * Process data portability request
   */
  DataSubjectRightsManager.processPortabilityRequest = function (requestId_1, processorId_1) {
    return __awaiter(this, arguments, void 0, function (requestId, processorId, format) {
      var request, portableData, expiresAt, downloadUrl;
      if (format === void 0) {
        format = "json";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getRequest(requestId)];
          case 1:
            request = _a.sent();
            if (!request) throw new Error("Request not found");
            return [
              4 /*yield*/,
              this.extractPortableData(request.dataSubjectId, format),
              // Generate secure download link (expires in 7 days)
            ];
          case 2:
            portableData = _a.sent();
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            return [4 /*yield*/, this.generateSecureDownloadLink(portableData, expiresAt)];
          case 3:
            downloadUrl = _a.sent();
            return [
              4 /*yield*/,
              this.updateRequestStatus(requestId, RequestStatus.COMPLETED, processorId),
              // Log portability completion
            ];
          case 4:
            _a.sent();
            // Log portability completion
            return [
              4 /*yield*/,
              audit_logger_1.AuditLogger.log({
                activity: audit_logger_1.DataProcessingActivity.DATA_PORTABILITY,
                description: "Data portability request completed in ".concat(format, " format"),
                actorId: processorId,
                actorType: "user",
                dataSubjectId: request.dataSubjectId,
                dataSubjectType: "patient",
                dataCategories: ["portable_data"],
                legalBasis: "legal_obligation",
                purpose: "Atendimento ao direito de portabilidade do titular",
                ipAddress: "127.0.0.1",
                source: "system",
                success: true,
                recordsAffected: portableData.recordsIncluded,
                metadata: { format: format, fileSize: portableData.fileSize },
              }),
            ];
          case 5:
            // Log portability completion
            _a.sent();
            return [
              2 /*return*/,
              {
                downloadUrl: downloadUrl,
                expiresAt: expiresAt,
                fileSize: portableData.fileSize,
                recordsIncluded: portableData.recordsIncluded,
              },
            ];
        }
      });
    });
  };
  /**
   * Get all pending requests that are approaching deadline
   */
  DataSubjectRightsManager.getOverdueRequests = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Query database for overdue requests
        return [2 /*return*/, []];
      });
    });
  };
  /**
   * Generate monthly compliance report
   */
  DataSubjectRightsManager.generateComplianceReport = function (month) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Generate comprehensive compliance report
        return [
          2 /*return*/,
          {
            totalRequests: 0,
            requestsByType: {},
            averageResponseTime: 0,
            overdueRequests: 0,
            completionRate: 0,
            commonIssues: [],
            recommendations: [],
          },
        ];
      });
    });
  };
  // Private helper methods
  DataSubjectRightsManager.getRequest = function (requestId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Query database
        return [2 /*return*/, null];
      });
    });
  };
  DataSubjectRightsManager.getPersonalData = function (requestId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Compile all personal data for the subject
        return [2 /*return*/, {}];
      });
    });
  };
  DataSubjectRightsManager.getProcessingActivities = function (requestId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Get all processing activities
        return [2 /*return*/, []];
      });
    });
  };
  DataSubjectRightsManager.getConsentStatus = function (requestId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Get current consent status
        return [2 /*return*/, {}];
      });
    });
  };
  DataSubjectRightsManager.getAuditTrail = function (requestId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Get relevant audit trail
        return [2 /*return*/, []];
      });
    });
  };
  DataSubjectRightsManager.updateRequestStatus = function (requestId, status, processorId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Update request in database
        console.log(
          "Request ".concat(requestId, " updated to ").concat(status, " by ").concat(processorId),
        );
        return [2 /*return*/];
      });
    });
  };
  DataSubjectRightsManager.analyzeErasureRequest = function (dataSubjectId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Analyze what data can be erased vs retained
        return [2 /*return*/, { canErase: [], mustRetain: [] }];
      });
    });
  };
  DataSubjectRightsManager.eraseDataItem = function (id, type) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Safely erase data item
        console.log("Erasing ".concat(type, " item ").concat(id));
        return [2 /*return*/];
      });
    });
  };
  DataSubjectRightsManager.extractPortableData = function (dataSubjectId, format) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Extract data in portable format
        return [2 /*return*/, { fileSize: 0, recordsIncluded: 0, data: {} }];
      });
    });
  };
  DataSubjectRightsManager.generateSecureDownloadLink = function (data, expiresAt) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Generate secure, temporary download link
        return [2 /*return*/, "https://secure.clinic.com/download/".concat(crypto.randomUUID())];
      });
    });
  };
  DataSubjectRightsManager.sendConfirmationEmail = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Send confirmation email to data subject
        console.log("Confirmation email sent for request ".concat(request.id));
        return [2 /*return*/];
      });
    });
  };
  return DataSubjectRightsManager;
})();
exports.DataSubjectRightsManager = DataSubjectRightsManager;
/**
 * Standard response times for different request types (in days)
 */
exports.STANDARD_RESPONSE_TIMES =
  ((_a = {}),
  (_a[DataSubjectRight.ACCESS] = 15),
  (_a[DataSubjectRight.RECTIFICATION] = 15),
  (_a[DataSubjectRight.ERASURE] = 15),
  (_a[DataSubjectRight.PORTABILITY] = 15),
  (_a[DataSubjectRight.RESTRICT_PROCESSING] = 5),
  (_a[DataSubjectRight.OBJECT_PROCESSING] = 10),
  (_a[DataSubjectRight.WITHDRAW_CONSENT] = 1),
  (_a[DataSubjectRight.INFORMATION] = 15),
  _a);
