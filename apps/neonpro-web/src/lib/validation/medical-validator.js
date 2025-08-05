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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalDataValidator =
  exports.validationResultSchema =
  exports.ValidationCategory =
  exports.ValidationSeverity =
    void 0;
var zod_1 = require("zod");
var schemas_1 = require("@/lib/schemas");
var lgpd_1 = require("@/lib/lgpd");
/**
 * Medical Data Validation System
 * Comprehensive validation for healthcare data with:
 * - Clinical validation rules
 * - Business logic validation
 * - Security and privacy validation
 * - Regulatory compliance validation
 * - Real-time validation with audit trail
 */
// Validation severity levels
var ValidationSeverity;
(function (ValidationSeverity) {
  ValidationSeverity["ERROR"] = "error";
  ValidationSeverity["WARNING"] = "warning";
  ValidationSeverity["INFO"] = "info"; // Informational only
})(ValidationSeverity || (exports.ValidationSeverity = ValidationSeverity = {}));
// Validation categories
var ValidationCategory;
(function (ValidationCategory) {
  ValidationCategory["CLINICAL"] = "clinical";
  ValidationCategory["BUSINESS"] = "business";
  ValidationCategory["SECURITY"] = "security";
  ValidationCategory["COMPLIANCE"] = "compliance";
  ValidationCategory["DATA_QUALITY"] = "data_quality";
})(ValidationCategory || (exports.ValidationCategory = ValidationCategory = {}));
// Validation result schema
exports.validationResultSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  valid: zod_1.z.boolean(),
  score: zod_1.z.number().min(0).max(100), // Overall validation score
  // Issues found
  errors: zod_1.z
    .array(
      zod_1.z.object({
        field: zod_1.z.string(),
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        severity: zod_1.z.nativeEnum(ValidationSeverity),
        category: zod_1.z.nativeEnum(ValidationCategory),
        suggestion: zod_1.z.string().optional(),
      }),
    )
    .default([]),
  // Validation metadata
  validatorVersion: zod_1.z.string().default("1.0"),
  timestamp: zod_1.z.date().default(function () {
    return new Date();
  }),
  context: zod_1.z.record(zod_1.z.any()).optional(),
  // Clinical flags
  clinicalAlerts: zod_1.z
    .array(
      zod_1.z.object({
        type: zod_1.z.enum([
          "drug_interaction",
          "allergy_conflict",
          "contraindication",
          "age_restriction",
        ]),
        severity: zod_1.z.enum(["low", "medium", "high", "critical"]),
        message: zod_1.z.string(),
        recommendations: zod_1.z.array(zod_1.z.string()).default([]),
      }),
    )
    .default([]),
  // Security validation
  securityFlags: zod_1.z
    .array(
      zod_1.z.object({
        type: zod_1.z.enum([
          "data_exposure",
          "access_violation",
          "encryption_required",
          "audit_required",
        ]),
        message: zod_1.z.string(),
        remediation: zod_1.z.string(),
      }),
    )
    .default([]),
  // Data quality metrics
  dataQuality: zod_1.z
    .object({
      completeness: zod_1.z.number().min(0).max(100),
      accuracy: zod_1.z.number().min(0).max(100),
      consistency: zod_1.z.number().min(0).max(100),
      timeliness: zod_1.z.number().min(0).max(100),
    })
    .default({
      completeness: 100,
      accuracy: 100,
      consistency: 100,
      timeliness: 100,
    }),
});
var MedicalDataValidator = /** @class */ (function () {
  function MedicalDataValidator() {}
  /**
   * Comprehensive patient data validation
   */
  MedicalDataValidator.validatePatient = function (patientData, context) {
    return __awaiter(this, void 0, void 0, function () {
      var validationResult, schemaValidation, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            validationResult = {
              id: crypto.randomUUID(),
              valid: true,
              score: 100,
              errors: [],
              clinicalAlerts: [],
              securityFlags: [],
              timestamp: new Date(),
              context: context,
              dataQuality: {
                completeness: 100,
                accuracy: 100,
                consistency: 100,
                timeliness: 100,
              },
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            schemaValidation = (0, schemas_1.validateData)(schemas_1.patientSchema, patientData);
            if (!schemaValidation.success) {
              this.addSchemaErrors(validationResult, schemaValidation.errors || []);
            }
            // 2. Clinical Validation
            return [
              4 /*yield*/,
              this.validateClinicalData(patientData, validationResult),
              // 3. Business Rules Validation
            ];
          case 2:
            // 2. Clinical Validation
            _a.sent();
            // 3. Business Rules Validation
            return [
              4 /*yield*/,
              this.validateBusinessRules(patientData, validationResult),
              // 4. Security Validation
            ];
          case 3:
            // 3. Business Rules Validation
            _a.sent();
            // 4. Security Validation
            return [
              4 /*yield*/,
              this.validateSecurity(patientData, context, validationResult),
              // 5. Compliance Validation
            ];
          case 4:
            // 4. Security Validation
            _a.sent();
            // 5. Compliance Validation
            return [
              4 /*yield*/,
              this.validateCompliance(patientData, validationResult),
              // 6. Data Quality Assessment
            ];
          case 5:
            // 5. Compliance Validation
            _a.sent();
            // 6. Data Quality Assessment
            this.assessDataQuality(patientData, validationResult);
            // Calculate final validation score
            this.calculateValidationScore(validationResult);
            // Log validation for audit
            return [
              4 /*yield*/,
              lgpd_1.AuditLogger.log({
                activity: lgpd_1.DataProcessingActivity.PATIENT_READ,
                description: "Patient data validation ".concat(context.operation),
                actorId: context.userId,
                actorType: "user",
                dataSubjectId: patientData.id,
                dataSubjectType: "patient",
                dataCategories: ["validation", "patient_data"],
                legalBasis: "legitimate_interests",
                purpose: "Data quality and security validation",
                ipAddress: context.ipAddress,
                sessionId: context.sessionId,
                source: "web",
                success: validationResult.valid,
                recordsAffected: 1,
                metadata: {
                  validationScore: validationResult.score,
                  errorCount: validationResult.errors.length,
                  clinicalAlerts: validationResult.clinicalAlerts.length,
                },
              }),
            ];
          case 6:
            // Log validation for audit
            _a.sent();
            return [3 /*break*/, 8];
          case 7:
            error_1 = _a.sent();
            console.error("Validation error:", error_1);
            validationResult.valid = false;
            validationResult.score = 0;
            validationResult.errors.push({
              field: "system",
              code: "VALIDATION_ERROR",
              message: "Internal validation error occurred",
              severity: ValidationSeverity.ERROR,
              category: ValidationCategory.BUSINESS,
              suggestion: "Contact system administrator",
            });
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/, validationResult];
        }
      });
    });
  };
  /**
   * Appointment validation with scheduling conflicts check
   */
  MedicalDataValidator.validateAppointment = function (appointmentData, context) {
    return __awaiter(this, void 0, void 0, function () {
      var validationResult, schemaValidation, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            validationResult = {
              id: crypto.randomUUID(),
              valid: true,
              score: 100,
              errors: [],
              clinicalAlerts: [],
              securityFlags: [],
              timestamp: new Date(),
              context: context,
              dataQuality: {
                completeness: 100,
                accuracy: 100,
                consistency: 100,
                timeliness: 100,
              },
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            schemaValidation = (0, schemas_1.validateData)(
              schemas_1.appointmentSchema,
              appointmentData,
            );
            if (!schemaValidation.success) {
              this.addSchemaErrors(validationResult, schemaValidation.errors || []);
            }
            // Appointment-specific validations
            return [4 /*yield*/, this.validateAppointmentRules(appointmentData, validationResult)];
          case 2:
            // Appointment-specific validations
            _a.sent();
            return [
              4 /*yield*/,
              this.validateSchedulingConflicts(appointmentData, validationResult),
            ];
          case 3:
            _a.sent();
            return [
              4 /*yield*/,
              this.validatePatientAvailability(appointmentData, validationResult),
            ];
          case 4:
            _a.sent();
            return [
              4 /*yield*/,
              this.validateProfessionalAvailability(appointmentData, validationResult),
              // Security validation
            ];
          case 5:
            _a.sent();
            // Security validation
            return [4 /*yield*/, this.validateSecurity(appointmentData, context, validationResult)];
          case 6:
            // Security validation
            _a.sent();
            this.calculateValidationScore(validationResult);
            return [3 /*break*/, 8];
          case 7:
            error_2 = _a.sent();
            console.error("Appointment validation error:", error_2);
            this.addSystemError(validationResult, "Appointment validation failed");
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/, validationResult];
        }
      });
    });
  };
  /**
   * Treatment validation with drug interactions and contraindications
   */
  MedicalDataValidator.validateTreatment = function (treatmentData, patientData, context) {
    return __awaiter(this, void 0, void 0, function () {
      var validationResult, schemaValidation, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            validationResult = {
              id: crypto.randomUUID(),
              valid: true,
              score: 100,
              errors: [],
              clinicalAlerts: [],
              securityFlags: [],
              timestamp: new Date(),
              context: context,
              dataQuality: {
                completeness: 100,
                accuracy: 100,
                consistency: 100,
                timeliness: 100,
              },
            };
            _a.label = 1;
          case 1:
            _a.trys.push([1, 8, , 9]);
            schemaValidation = (0, schemas_1.validateData)(
              schemas_1.treatmentSchema,
              treatmentData,
            );
            if (!schemaValidation.success) {
              this.addSchemaErrors(validationResult, schemaValidation.errors || []);
            }
            // Clinical safety validations
            return [
              4 /*yield*/,
              this.validateDrugInteractions(treatmentData, patientData, validationResult),
            ];
          case 2:
            // Clinical safety validations
            _a.sent();
            return [
              4 /*yield*/,
              this.validateAllergies(treatmentData, patientData, validationResult),
            ];
          case 3:
            _a.sent();
            return [
              4 /*yield*/,
              this.validateContraindications(treatmentData, patientData, validationResult),
            ];
          case 4:
            _a.sent();
            return [
              4 /*yield*/,
              this.validateDosage(treatmentData, patientData, validationResult),
              // Age and condition specific validations
            ];
          case 5:
            _a.sent();
            // Age and condition specific validations
            return [
              4 /*yield*/,
              this.validateAgeRestrictions(treatmentData, patientData, validationResult),
            ];
          case 6:
            // Age and condition specific validations
            _a.sent();
            return [
              4 /*yield*/,
              this.validateMedicalConditions(treatmentData, patientData, validationResult),
            ];
          case 7:
            _a.sent();
            this.calculateValidationScore(validationResult);
            return [3 /*break*/, 9];
          case 8:
            error_3 = _a.sent();
            console.error("Treatment validation error:", error_3);
            this.addSystemError(validationResult, "Treatment validation failed");
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/, validationResult];
        }
      });
    });
  };
  /**
   * Real-time validation during data entry
   */
  MedicalDataValidator.validateField = function (fieldName, value, schema, context) {
    return __awaiter(this, void 0, void 0, function () {
      var result, schemaResult;
      return __generator(this, function (_a) {
        result = {
          valid: true,
          errors: [],
          suggestions: [],
          clinicalFlags: [],
        };
        try {
          schemaResult = schema.safeParse(value);
          if (!schemaResult.success) {
            result.valid = false;
            result.errors = schemaResult.error.errors.map(function (e) {
              return e.message;
            });
          }
          // Field-specific validations
          switch (fieldName) {
            case "cpf":
              if (!this.validateCPF(value)) {
                result.valid = false;
                result.errors.push("CPF inválido");
                result.suggestions.push("Verifique os dígitos do CPF");
              }
              break;
            case "birthDate":
              if (!schemas_1.healthcareValidators.isAdult(value)) {
                result.clinicalFlags.push("Paciente menor de idade - requer responsável");
              }
              break;
            case "allergies":
              if (Array.isArray(value) && value.length > 0) {
                result.clinicalFlags.push(
                  "Paciente possui alergias - verificar antes de prescrever",
                );
              }
              break;
            case "medications":
              if (Array.isArray(value) && value.length > 5) {
                result.clinicalFlags.push(
                  "Paciente com múltiplas medicações - verificar interações",
                );
              }
              break;
          }
        } catch (error) {
          result.valid = false;
          result.errors.push("Erro interno de validação");
        }
        return [2 /*return*/, result];
      });
    });
  };
  // Private validation methods
  MedicalDataValidator.validateClinicalData = function (patientData, result) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, condition, age;
      var _b, _c, _d, _e;
      return __generator(this, function (_f) {
        // Validate medical history consistency
        if ((_b = patientData.medicalInfo) === null || _b === void 0 ? void 0 : _b.medicalHistory) {
          for (_i = 0, _a = patientData.medicalInfo.medicalHistory; _i < _a.length; _i++) {
            condition = _a[_i];
            if (!this.isValidMedicalCondition(condition)) {
              result.errors.push({
                field: "medicalHistory",
                code: "INVALID_CONDITION",
                message: "Condi\u00E7\u00E3o m\u00E9dica inv\u00E1lida: ".concat(condition),
                severity: ValidationSeverity.WARNING,
                category: ValidationCategory.CLINICAL,
                suggestion: "Verificar ortografia ou usar código CID-10",
              });
            }
          }
        }
        // Validate allergies
        if (
          ((_d =
            (_c = patientData.medicalInfo) === null || _c === void 0 ? void 0 : _c.allergies) ===
            null || _d === void 0
            ? void 0
            : _d.length) > 0
        ) {
          result.clinicalAlerts.push({
            type: "allergy_conflict",
            severity: "medium",
            message: "Paciente possui alergias registradas",
            recommendations: [
              "Verificar medicações antes de prescrever",
              "Confirmar alergias com paciente",
            ],
          });
        }
        // Age-related validations
        if ((_e = patientData.personalData) === null || _e === void 0 ? void 0 : _e.birthDate) {
          age = this.calculateAge(patientData.personalData.birthDate);
          if (age < 18) {
            result.clinicalAlerts.push({
              type: "age_restriction",
              severity: "high",
              message: "Paciente menor de idade",
              recommendations: [
                "Responsável legal deve estar presente",
                "Verificar dosagens pediátricas",
              ],
            });
          } else if (age > 65) {
            result.clinicalAlerts.push({
              type: "age_restriction",
              severity: "medium",
              message: "Paciente idoso",
              recommendations: ["Considerar ajustes de dosagem", "Monitoramento mais frequente"],
            });
          }
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateBusinessRules = function (patientData, result) {
    return __awaiter(this, void 0, void 0, function () {
      var requiredForTreatment, _i, requiredForTreatment_1, field;
      var _a, _b;
      return __generator(this, function (_c) {
        requiredForTreatment = ["personalData", "medicalInfo", "consent"];
        for (
          _i = 0, requiredForTreatment_1 = requiredForTreatment;
          _i < requiredForTreatment_1.length;
          _i++
        ) {
          field = requiredForTreatment_1[_i];
          if (!patientData[field]) {
            result.errors.push({
              field: field,
              code: "REQUIRED_FOR_TREATMENT",
              message: "Campo obrigat\u00F3rio para iniciar tratamento: ".concat(field),
              severity: ValidationSeverity.ERROR,
              category: ValidationCategory.BUSINESS,
              suggestion: "Complete os dados obrigatórios antes de agendar tratamentos",
            });
          }
        }
        // Contact information validation
        if (
          !((_a = patientData.personalData) === null || _a === void 0 ? void 0 : _a.email) &&
          !((_b = patientData.personalData) === null || _b === void 0 ? void 0 : _b.phone)
        ) {
          result.errors.push({
            field: "contact",
            code: "NO_CONTACT_INFO",
            message: "Pelo menos um meio de contato (email ou telefone) é obrigatório",
            severity: ValidationSeverity.ERROR,
            category: ValidationCategory.BUSINESS,
            suggestion: "Adicione email ou telefone para comunicação",
          });
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateSecurity = function (data, context, result) {
    return __awaiter(this, void 0, void 0, function () {
      var sensitiveFields, _i, sensitiveFields_1, field;
      return __generator(this, function (_a) {
        sensitiveFields = ["cpf", "rg", "medicalHistory", "diagnosis"];
        for (_i = 0, sensitiveFields_1 = sensitiveFields; _i < sensitiveFields_1.length; _i++) {
          field = sensitiveFields_1[_i];
          if (this.hasField(data, field) && !this.isEncrypted(data, field)) {
            result.securityFlags.push({
              type: "encryption_required",
              message: "Campo sens\u00EDvel n\u00E3o criptografado: ".concat(field),
              remediation: "Criptografar dados sensíveis antes do armazenamento",
            });
          }
        }
        // Check access permissions
        if (context.operation === "read") {
          result.securityFlags.push({
            type: "audit_required",
            message: "Acesso a dados médicos requer auditoria",
            remediation: "Log de auditoria será criado automaticamente",
          });
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateCompliance = function (patientData, result) {
    return __awaiter(this, void 0, void 0, function () {
      var daysSinceCreation;
      var _a;
      return __generator(this, function (_b) {
        // LGPD compliance checks
        if (!((_a = patientData.consent) === null || _a === void 0 ? void 0 : _a.dataProcessing)) {
          result.errors.push({
            field: "consent",
            code: "LGPD_CONSENT_REQUIRED",
            message: "Consentimento LGPD obrigatório para processamento de dados",
            severity: ValidationSeverity.ERROR,
            category: ValidationCategory.COMPLIANCE,
            suggestion: "Obter consentimento explícito do paciente",
          });
        }
        // Data retention validation
        if (patientData.createdAt) {
          daysSinceCreation =
            (Date.now() - new Date(patientData.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCreation > 3650) {
            // 10 years
            result.errors.push({
              field: "dataRetention",
              code: "DATA_RETENTION_EXCEEDED",
              message: "Dados excedem período de retenção recomendado",
              severity: ValidationSeverity.WARNING,
              category: ValidationCategory.COMPLIANCE,
              suggestion: "Revisar necessidade de manter dados antigos",
            });
          }
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.assessDataQuality = function (data, result) {
    var _this = this;
    var _a, _b;
    var quality = result.dataQuality;
    // Completeness assessment
    var requiredFields = ["personalData.name", "personalData.email", "personalData.phone"];
    var completedFields = requiredFields.filter(function (field) {
      return _this.hasField(data, field);
    });
    quality.completeness = (completedFields.length / requiredFields.length) * 100;
    // Accuracy assessment (basic checks)
    var accuracyScore = 100;
    if (
      ((_a = data.personalData) === null || _a === void 0 ? void 0 : _a.email) &&
      !this.isValidEmail(data.personalData.email)
    ) {
      accuracyScore -= 20;
    }
    if (
      ((_b = data.personalData) === null || _b === void 0 ? void 0 : _b.phone) &&
      !this.isValidPhone(data.personalData.phone)
    ) {
      accuracyScore -= 20;
    }
    quality.accuracy = Math.max(0, accuracyScore);
    // Timeliness assessment
    if (data.updatedAt) {
      var daysSinceUpdate =
        (Date.now() - new Date(data.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      quality.timeliness = Math.max(0, 100 - (daysSinceUpdate / 30) * 10); // Decrease over 30 days
    }
  };
  MedicalDataValidator.validateAppointmentRules = function (appointmentData, result) {
    return __awaiter(this, void 0, void 0, function () {
      var scheduledTime, hours;
      return __generator(this, function (_a) {
        scheduledTime = new Date(appointmentData.scheduledDate);
        hours = scheduledTime.getHours();
        if (hours < 8 || hours > 18) {
          result.errors.push({
            field: "scheduledDate",
            code: "OUTSIDE_BUSINESS_HOURS",
            message: "Agendamento fora do horário comercial",
            severity: ValidationSeverity.WARNING,
            category: ValidationCategory.BUSINESS,
            suggestion: "Agendar entre 08:00 e 18:00",
          });
        }
        // Future date validation
        if (scheduledTime <= new Date()) {
          result.errors.push({
            field: "scheduledDate",
            code: "PAST_DATE",
            message: "Data de agendamento deve ser futura",
            severity: ValidationSeverity.ERROR,
            category: ValidationCategory.BUSINESS,
            suggestion: "Selecionar data e hora futuras",
          });
        }
        // Duration validation
        if (appointmentData.duration < 15) {
          result.errors.push({
            field: "duration",
            code: "DURATION_TOO_SHORT",
            message: "Duração mínima de consulta é 15 minutos",
            severity: ValidationSeverity.ERROR,
            category: ValidationCategory.BUSINESS,
            suggestion: "Aumentar duração para pelo menos 15 minutos",
          });
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateSchedulingConflicts = function (appointmentData, result) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validatePatientAvailability = function (appointmentData, result) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateProfessionalAvailability = function (appointmentData, result) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateDrugInteractions = function (treatmentData, patientData, result) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        // TODO: Check for drug interactions with existing medications
        if (
          ((_a = patientData.medicalInfo) === null || _a === void 0 ? void 0 : _a.medications) &&
          patientData.medicalInfo.medications.length > 0
        ) {
          result.clinicalAlerts.push({
            type: "drug_interaction",
            severity: "high",
            message: "Verificar interações medicamentosas",
            recommendations: [
              "Consultar base de dados de interações",
              "Considerar ajustes de dosagem",
            ],
          });
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateAllergies = function (treatmentData, patientData, result) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        if (
          ((_a = patientData.medicalInfo) === null || _a === void 0 ? void 0 : _a.allergies) &&
          patientData.medicalInfo.allergies.length > 0
        ) {
          result.clinicalAlerts.push({
            type: "allergy_conflict",
            severity: "critical",
            message: "Paciente possui alergias - verificar componentes do tratamento",
            recommendations: ["Revisar lista de alergias", "Confirmar ingredientes do tratamento"],
          });
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateContraindications = function (treatmentData, patientData, result) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Check treatment contraindications
        if (treatmentData.contraindications && treatmentData.contraindications.length > 0) {
          result.clinicalAlerts.push({
            type: "contraindication",
            severity: "high",
            message: "Tratamento possui contraindicações",
            recommendations: [
              "Avaliar histórico médico do paciente",
              "Considerar tratamentos alternativos",
            ],
          });
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateDosage = function (treatmentData, patientData, result) {
    return __awaiter(this, void 0, void 0, function () {
      var age;
      return __generator(this, function (_a) {
        age = this.calculateAge(patientData.personalData.birthDate);
        // Example: Check for pediatric or geriatric dosage adjustments
        if (age < 18 || age > 65) {
          result.clinicalAlerts.push({
            type: "contraindication",
            severity: "medium",
            message: "Ajuste de dosagem pode ser necess\u00E1rio para idade ".concat(age, " anos"),
            recommendations: ["Considerar ajuste de dosagem", "Monitoramento mais frequente"],
          });
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateAgeRestrictions = function (treatmentData, patientData, result) {
    return __awaiter(this, void 0, void 0, function () {
      var age;
      return __generator(this, function (_a) {
        age = this.calculateAge(patientData.personalData.birthDate);
        // Some treatments may have age restrictions
        if (treatmentData.minAge && age < treatmentData.minAge) {
          result.errors.push({
            field: "patientAge",
            code: "AGE_RESTRICTION",
            message: "Tratamento n\u00E3o recomendado para idade ".concat(age, " anos"),
            severity: ValidationSeverity.ERROR,
            category: ValidationCategory.CLINICAL,
            suggestion: "Considerar tratamentos apropriados para a idade",
          });
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDataValidator.validateMedicalConditions = function (treatmentData, patientData, result) {
    return __awaiter(this, void 0, void 0, function () {
      var highRiskConditions, patientConditions_1, hasHighRiskCondition;
      var _a;
      return __generator(this, function (_b) {
        // Check if patient's medical conditions affect treatment
        if ((_a = patientData.medicalInfo) === null || _a === void 0 ? void 0 : _a.medicalHistory) {
          highRiskConditions = ["diabetes", "hipertensão", "cardiopatia", "hepatopatia"];
          patientConditions_1 = patientData.medicalInfo.medicalHistory.map(function (c) {
            return c.toLowerCase();
          });
          hasHighRiskCondition = highRiskConditions.some(function (condition) {
            return patientConditions_1.some(function (pc) {
              return pc.includes(condition);
            });
          });
          if (hasHighRiskCondition) {
            result.clinicalAlerts.push({
              type: "contraindication",
              severity: "high",
              message: "Paciente possui condições médicas que requerem cuidado especial",
              recommendations: [
                "Avaliar compatibilidade do tratamento",
                "Considerar consulta especializada",
              ],
            });
          }
        }
        return [2 /*return*/];
      });
    });
  };
  // Utility methods
  MedicalDataValidator.addSchemaErrors = function (result, errors) {
    for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
      var error = errors_1[_i];
      result.errors.push({
        field: "schema",
        code: "SCHEMA_VALIDATION",
        message: error,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.DATA_QUALITY,
        suggestion: "Corrigir formato dos dados",
      });
    }
    result.valid = false;
  };
  MedicalDataValidator.addSystemError = function (result, message) {
    result.errors.push({
      field: "system",
      code: "SYSTEM_ERROR",
      message: message,
      severity: ValidationSeverity.ERROR,
      category: ValidationCategory.BUSINESS,
      suggestion: "Contatar suporte técnico",
    });
    result.valid = false;
  };
  MedicalDataValidator.calculateValidationScore = function (result) {
    var score = 100;
    // Subtract points for each error/warning
    for (var _i = 0, _a = result.errors; _i < _a.length; _i++) {
      var error = _a[_i];
      switch (error.severity) {
        case ValidationSeverity.ERROR:
          score -= 20;
          result.valid = false;
          break;
        case ValidationSeverity.WARNING:
          score -= 10;
          break;
        case ValidationSeverity.INFO:
          score -= 2;
          break;
      }
    }
    // Subtract points for clinical alerts
    for (var _b = 0, _c = result.clinicalAlerts; _b < _c.length; _b++) {
      var alert_1 = _c[_b];
      switch (alert_1.severity) {
        case "critical":
          score -= 15;
          break;
        case "high":
          score -= 10;
          break;
        case "medium":
          score -= 5;
          break;
        case "low":
          score -= 2;
          break;
      }
    }
    // Factor in data quality
    var avgQuality =
      (result.dataQuality.completeness +
        result.dataQuality.accuracy +
        result.dataQuality.consistency +
        result.dataQuality.timeliness) /
      4;
    score = score * 0.7 + avgQuality * 0.3;
    result.score = Math.max(0, Math.round(score));
  };
  MedicalDataValidator.calculateAge = function (birthDate) {
    var birth = new Date(birthDate);
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  MedicalDataValidator.validateCPF = function (cpf) {
    // Remove dots and dashes
    var numbers = cpf.replace(/[.-]/g, "");
    if (numbers.length !== 11) return false;
    if (/^(\d)\1+$/.test(numbers)) return false;
    // Validate CPF check digits
    var sum = 0;
    for (var i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    var remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;
    sum = 0;
    for (var i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[10])) return false;
    return true;
  };
  MedicalDataValidator.isValidMedicalCondition = function (condition) {
    // Basic validation - in production would check against medical databases
    return condition.length >= 3 && /^[a-zA-ZÀ-ÿ\s]+$/.test(condition);
  };
  MedicalDataValidator.hasField = function (obj, fieldPath) {
    var fields = fieldPath.split(".");
    var current = obj;
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
      var field = fields_1[_i];
      if (!current || typeof current !== "object" || !(field in current)) {
        return false;
      }
      current = current[field];
    }
    return current !== null && current !== undefined && current !== "";
  };
  MedicalDataValidator.isEncrypted = function (obj, field) {
    // Check if field is encrypted (placeholder implementation)
    var value = obj[field];
    return value && typeof value === "object" && "data" in value && "algorithm" in value;
  };
  MedicalDataValidator.isValidEmail = function (email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  MedicalDataValidator.isValidPhone = function (phone) {
    var phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/;
    return phoneRegex.test(phone);
  };
  return MedicalDataValidator;
})();
exports.MedicalDataValidator = MedicalDataValidator;
