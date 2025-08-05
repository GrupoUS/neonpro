"use strict";
/**
 * NeonPro Medical Document Manager
 * Story 2.2: Medical History & Records - Document Management
 *
 * Sistema avançado de gerenciamento de documentos médicos:
 * - Upload e armazenamento seguro
 * - Fotos antes/depois com versionamento
 * - Processamento de imagens
 * - Organização por categorias
 * - Controle de acesso e permissões
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
exports.medicalDocumentManager =
  exports.MedicalDocumentManager =
  exports.AccessLevel =
  exports.DocumentCategory =
  exports.DocumentType =
    void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var crypto_1 = require("crypto");
var audit_logger_1 = require("../audit/audit-logger");
var lgpd_manager_1 = require("../auth/lgpd/lgpd-manager");
// Enums
var DocumentType;
(function (DocumentType) {
  DocumentType["IMAGE"] = "image";
  DocumentType["PDF"] = "pdf";
  DocumentType["DOCUMENT"] = "document";
  DocumentType["VIDEO"] = "video";
  DocumentType["AUDIO"] = "audio";
  DocumentType["DICOM"] = "dicom";
  DocumentType["OTHER"] = "other";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentCategory;
(function (DocumentCategory) {
  DocumentCategory["CONSENT_FORM"] = "consent_form";
  DocumentCategory["MEDICAL_REPORT"] = "medical_report";
  DocumentCategory["LAB_RESULT"] = "lab_result";
  DocumentCategory["IMAGING"] = "imaging";
  DocumentCategory["PRESCRIPTION"] = "prescription";
  DocumentCategory["BEFORE_PHOTO"] = "before_photo";
  DocumentCategory["AFTER_PHOTO"] = "after_photo";
  DocumentCategory["PROGRESS_PHOTO"] = "progress_photo";
  DocumentCategory["IDENTIFICATION"] = "identification";
  DocumentCategory["INSURANCE"] = "insurance";
  DocumentCategory["TREATMENT_PLAN"] = "treatment_plan";
  DocumentCategory["INVOICE"] = "invoice";
  DocumentCategory["OTHER"] = "other";
})(DocumentCategory || (exports.DocumentCategory = DocumentCategory = {}));
var AccessLevel;
(function (AccessLevel) {
  AccessLevel["PUBLIC"] = "public";
  AccessLevel["CLINIC_STAFF"] = "clinic_staff";
  AccessLevel["DOCTOR_ONLY"] = "doctor_only";
  AccessLevel["PATIENT_ONLY"] = "patient_only";
  AccessLevel["RESTRICTED"] = "restricted";
})(AccessLevel || (exports.AccessLevel = AccessLevel = {}));
// ============================================================================
// MEDICAL DOCUMENT MANAGER
// ============================================================================
var MedicalDocumentManager = /** @class */ (function () {
  function MedicalDocumentManager() {
    this.STORAGE_BUCKET = "medical-documents";
    this.MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    this.ALLOWED_MIME_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "video/mp4",
      "video/avi",
      "video/mov",
      "audio/mp3",
      "audio/wav",
      "application/dicom",
    ];
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.lgpdManager = new lgpd_manager_1.LGPDManager();
  }
  // ========================================================================
  // DOCUMENT UPLOAD & MANAGEMENT
  // ========================================================================
  MedicalDocumentManager.prototype.uploadDocument = function (
    file,
    patientId,
    clinicId,
    options,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var validation,
        consentCheck,
        documentId,
        fileExtension,
        fileName,
        filePath,
        checksum,
        duplicateCheck,
        _a,
        uploadData,
        uploadError,
        urlData,
        metadata,
        thumbnailUrl,
        documentType,
        document_1,
        _b,
        data,
        error,
        error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 15, , 16]);
            return [4 /*yield*/, this.validateFile(file)];
          case 1:
            validation = _c.sent();
            if (!validation.isValid) {
              return [2 /*return*/, { success: false, error: validation.error }];
            }
            return [4 /*yield*/, this.lgpdManager.checkConsent(patientId, "medical_data")];
          case 2:
            consentCheck = _c.sent();
            if (!consentCheck.hasConsent) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: "Patient consent required for document upload",
                },
              ];
            }
            documentId = crypto_1.default.randomUUID();
            fileExtension = file.name.split(".").pop();
            fileName = "".concat(documentId, ".").concat(fileExtension);
            filePath = ""
              .concat(clinicId, "/")
              .concat(patientId, "/")
              .concat(options.category, "/")
              .concat(fileName);
            return [
              4 /*yield*/,
              this.calculateChecksum(file),
              // Check for duplicates
            ];
          case 3:
            checksum = _c.sent();
            return [4 /*yield*/, this.checkDuplicate(checksum, patientId)];
          case 4:
            duplicateCheck = _c.sent();
            if (duplicateCheck.isDuplicate) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: "Duplicate file detected. Original uploaded: ".concat(
                    duplicateCheck.originalDate,
                  ),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase.storage.from(this.STORAGE_BUCKET).upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
              }),
            ];
          case 5:
            (_a = _c.sent()), (uploadData = _a.data), (uploadError = _a.error);
            if (uploadError) throw uploadError;
            urlData = this.supabase.storage.from(this.STORAGE_BUCKET).getPublicUrl(filePath).data;
            return [
              4 /*yield*/,
              this.extractMetadata(file),
              // Generate thumbnail if needed
            ];
          case 6:
            metadata = _c.sent();
            thumbnailUrl = void 0;
            if (!(options.generateThumbnail && file.type.startsWith("image/")))
              return [3 /*break*/, 8];
            return [4 /*yield*/, this.generateThumbnail(filePath, file)];
          case 7:
            thumbnailUrl = _c.sent();
            _c.label = 8;
          case 8:
            documentType = this.getDocumentType(file.mime_type);
            document_1 = {
              id: documentId,
              patient_id: patientId,
              clinic_id: clinicId,
              record_id: options.recordId,
              document_type: documentType,
              category: options.category,
              title: options.title,
              description: options.description,
              file_name: fileName,
              original_file_name: file.name,
              file_path: filePath,
              file_url: urlData.publicUrl,
              file_size: file.size,
              mime_type: file.type,
              checksum: checksum,
              thumbnail_url: thumbnailUrl,
              metadata: metadata,
              tags: options.tags || [],
              version: 1,
              is_active: true,
              uploaded_by: userId,
              uploaded_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              expires_at: options.expiresAt,
              access_level: options.accessLevel || AccessLevel.CLINIC_STAFF,
            };
            return [
              4 /*yield*/,
              this.supabase.from("medical_documents").insert(document_1).select().single(),
            ];
          case 9:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            if (!(options.processImage && file.type.startsWith("image/"))) return [3 /*break*/, 11];
            return [4 /*yield*/, this.processImage(documentId, filePath)];
          case 10:
            _c.sent();
            _c.label = 11;
          case 11:
            if (
              !(
                options.beforeAfterPairId &&
                (options.category === DocumentCategory.BEFORE_PHOTO ||
                  options.category === DocumentCategory.AFTER_PHOTO)
              )
            )
              return [3 /*break*/, 13];
            return [
              4 /*yield*/,
              this.handleBeforeAfterPairing(
                documentId,
                options.beforeAfterPairId,
                options.category,
              ),
            ];
          case 12:
            _c.sent();
            _c.label = 13;
          case 13:
            // Log audit event
            return [
              4 /*yield*/,
              this.auditLogger.log({
                event_type: "medical_document_uploaded",
                user_id: userId,
                resource_type: "medical_document",
                resource_id: documentId,
                details: {
                  patient_id: patientId,
                  file_name: file.name,
                  file_size: file.size,
                  category: options.category,
                  document_type: documentType,
                },
              }),
            ];
          case 14:
            // Log audit event
            _c.sent();
            return [2 /*return*/, { success: true, data: data }];
          case 15:
            error_1 = _c.sent();
            console.error("Error uploading document:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
            ];
          case 16:
            return [2 /*return*/];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.getDocument = function (documentId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, hasAccess, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_documents")
                .select("*")
                .eq("id", documentId)
                .eq("is_active", true)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            if (!data) {
              return [2 /*return*/, { success: false, error: "Document not found" }];
            }
            return [4 /*yield*/, this.checkDocumentAccess(data, userId)];
          case 2:
            hasAccess = _b.sent();
            if (!hasAccess) {
              return [2 /*return*/, { success: false, error: "Access denied" }];
            }
            // Log audit event
            return [
              4 /*yield*/,
              this.auditLogger.log({
                event_type: "medical_document_accessed",
                user_id: userId,
                resource_type: "medical_document",
                resource_id: documentId,
                details: {
                  patient_id: data.patient_id,
                  file_name: data.file_name,
                },
              }),
            ];
          case 3:
            // Log audit event
            _b.sent();
            return [2 /*return*/, { success: true, data: data }];
          case 4:
            error_2 = _b.sent();
            console.error("Error getting document:", error_2);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.getPatientDocuments = function (
    patientId,
    userId,
    filters,
    pagination,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, count, accessibleDocuments, _i, _b, doc, hasAccess, error_3;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            query = this.supabase
              .from("medical_documents")
              .select("*", { count: "exact" })
              .eq("patient_id", patientId)
              .eq("is_active", true);
            // Apply filters
            if (filters === null || filters === void 0 ? void 0 : filters.documentType) {
              query = query.eq("document_type", filters.documentType);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.category) {
              query = query.eq("category", filters.category);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.accessLevel) {
              query = query.eq("access_level", filters.accessLevel);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.dateFrom) {
              query = query.gte("uploaded_at", filters.dateFrom);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.dateTo) {
              query = query.lte("uploaded_at", filters.dateTo);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.hasExpiration) !==
              undefined
            ) {
              if (filters.hasExpiration) {
                query = query.not("expires_at", "is", null);
              } else {
                query = query.is("expires_at", null);
              }
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.tags) &&
              filters.tags.length > 0
            ) {
              query = query.overlaps("tags", filters.tags);
            }
            // Apply pagination
            if (pagination) {
              query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
            }
            // Order by upload date
            query = query.order("uploaded_at", { ascending: false });
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            accessibleDocuments = [];
            (_i = 0), (_b = data || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 5];
            doc = _b[_i];
            return [4 /*yield*/, this.checkDocumentAccess(doc, userId)];
          case 3:
            hasAccess = _c.sent();
            if (hasAccess) {
              accessibleDocuments.push(doc);
            }
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            // Log audit event
            return [
              4 /*yield*/,
              this.auditLogger.log({
                event_type: "patient_documents_accessed",
                user_id: userId,
                resource_type: "medical_document",
                resource_id: patientId,
                details: {
                  patient_id: patientId,
                  document_count: accessibleDocuments.length,
                  filters: filters,
                },
              }),
            ];
          case 6:
            // Log audit event
            _c.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: accessibleDocuments,
                total: count || 0,
              },
            ];
          case 7:
            error_3 = _c.sent();
            console.error("Error getting patient documents:", error_3);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_3 instanceof Error ? error_3.message : "Unknown error",
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.updateDocument = function (documentId, updates, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var currentDoc, updatedData, _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getDocument(documentId, userId)];
          case 1:
            currentDoc = _b.sent();
            if (!currentDoc.success || !currentDoc.data) {
              return [2 /*return*/, { success: false, error: "Document not found" }];
            }
            updatedData = __assign(__assign({}, updates), { updated_at: new Date().toISOString() });
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_documents")
                .update(updatedData)
                .eq("id", documentId)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Log audit event
            return [
              4 /*yield*/,
              this.auditLogger.log({
                event_type: "medical_document_updated",
                user_id: userId,
                resource_type: "medical_document",
                resource_id: documentId,
                details: {
                  patient_id: data.patient_id,
                  changes: Object.keys(updates),
                },
              }),
            ];
          case 3:
            // Log audit event
            _b.sent();
            return [2 /*return*/, { success: true, data: data }];
          case 4:
            error_4 = _b.sent();
            console.error("Error updating document:", error_4);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_4 instanceof Error ? error_4.message : "Unknown error",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.deleteDocument = function (documentId_1, userId_1) {
    return __awaiter(this, arguments, void 0, function (documentId, userId, permanent) {
      var docResult, document_2, thumbnailPath, error, error, error_5;
      if (permanent === void 0) {
        permanent = false;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 10, , 11]);
            return [4 /*yield*/, this.getDocument(documentId, userId)];
          case 1:
            docResult = _a.sent();
            if (!docResult.success || !docResult.data) {
              return [2 /*return*/, { success: false, error: "Document not found" }];
            }
            document_2 = docResult.data;
            if (!permanent) return [3 /*break*/, 6];
            // Delete from storage
            return [
              4 /*yield*/,
              this.supabase.storage
                .from(this.STORAGE_BUCKET)
                .remove([document_2.file_path]),
              // Delete thumbnail if exists
            ];
          case 2:
            // Delete from storage
            _a.sent();
            if (!document_2.thumbnail_url) return [3 /*break*/, 4];
            thumbnailPath = document_2.file_path.replace(/\.[^/.]+$/, "_thumb.jpg");
            return [
              4 /*yield*/,
              this.supabase.storage.from(this.STORAGE_BUCKET).remove([thumbnailPath]),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [
              4 /*yield*/,
              this.supabase.from("medical_documents").delete().eq("id", documentId),
            ];
          case 5:
            error = _a.sent().error;
            if (error) throw error;
            return [3 /*break*/, 8];
          case 6:
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_documents")
                .update({
                  is_active: false,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", documentId),
            ];
          case 7:
            error = _a.sent().error;
            if (error) throw error;
            _a.label = 8;
          case 8:
            // Log audit event
            return [
              4 /*yield*/,
              this.auditLogger.log({
                event_type: permanent
                  ? "medical_document_deleted_permanent"
                  : "medical_document_deleted_soft",
                user_id: userId,
                resource_type: "medical_document",
                resource_id: documentId,
                details: {
                  patient_id: document_2.patient_id,
                  file_name: document_2.file_name,
                  permanent: permanent,
                },
              }),
            ];
          case 9:
            // Log audit event
            _a.sent();
            return [2 /*return*/, { success: true }];
          case 10:
            error_5 = _a.sent();
            console.error("Error deleting document:", error_5);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_5 instanceof Error ? error_5.message : "Unknown error",
              },
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  // ========================================================================
  // BEFORE/AFTER PHOTO MANAGEMENT
  // ========================================================================
  MedicalDocumentManager.prototype.createBeforeAfterPair = function (
    patientId,
    clinicId,
    procedureName,
    procedureDate,
    beforePhotoId,
    afterPhotoId,
    userId,
    notes,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var pairId, now, pair, _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            pairId = crypto_1.default.randomUUID();
            now = new Date().toISOString();
            pair = {
              id: pairId,
              patient_id: patientId,
              clinic_id: clinicId,
              procedure_name: procedureName,
              procedure_date: procedureDate,
              before_photo_id: beforePhotoId,
              after_photo_id: afterPhotoId,
              comparison_notes: notes,
              created_by: userId,
              created_at: now,
              updated_at: now,
            };
            return [
              4 /*yield*/,
              this.supabase.from("before_after_pairs").insert(pair).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Update documents to reference the pair
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_documents")
                .update({ metadata: { before_after_pair_id: pairId } })
                .in("id", [beforePhotoId, afterPhotoId]),
              // Log audit event
            ];
          case 2:
            // Update documents to reference the pair
            _b.sent();
            // Log audit event
            return [
              4 /*yield*/,
              this.auditLogger.log({
                event_type: "before_after_pair_created",
                user_id: userId,
                resource_type: "before_after_pair",
                resource_id: pairId,
                details: {
                  patient_id: patientId,
                  procedure_name: procedureName,
                  before_photo_id: beforePhotoId,
                  after_photo_id: afterPhotoId,
                },
              }),
            ];
          case 3:
            // Log audit event
            _b.sent();
            return [2 /*return*/, { success: true, data: data }];
          case 4:
            error_6 = _b.sent();
            console.error("Error creating before/after pair:", error_6);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_6 instanceof Error ? error_6.message : "Unknown error",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.getPatientBeforeAfterPairs = function (patientId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("before_after_pairs")
                .select(
                  "\n          *,\n          before_photo:medical_documents!before_after_pairs_before_photo_id_fkey(*),\n          after_photo:medical_documents!before_after_pairs_after_photo_id_fkey(*)\n        ",
                )
                .eq("patient_id", patientId)
                .order("procedure_date", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, { success: true, data: data || [] }];
          case 2:
            error_7 = _b.sent();
            console.error("Error getting before/after pairs:", error_7);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_7 instanceof Error ? error_7.message : "Unknown error",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ========================================================================
  // DOCUMENT VERSIONING
  // ========================================================================
  MedicalDocumentManager.prototype.createDocumentVersion = function (
    documentId,
    newFile,
    changesDescription,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var currentDoc,
        document_3,
        versionId,
        fileExtension,
        fileName,
        filePath,
        _a,
        uploadData,
        uploadError,
        urlData,
        checksum,
        version,
        _b,
        data,
        error,
        error_8;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            return [4 /*yield*/, this.getDocument(documentId, userId)];
          case 1:
            currentDoc = _c.sent();
            if (!currentDoc.success || !currentDoc.data) {
              return [2 /*return*/, { success: false, error: "Document not found" }];
            }
            document_3 = currentDoc.data;
            versionId = crypto_1.default.randomUUID();
            fileExtension = newFile.name.split(".").pop();
            fileName = "".concat(versionId, ".").concat(fileExtension);
            filePath = ""
              .concat(document_3.clinic_id, "/")
              .concat(document_3.patient_id, "/versions/")
              .concat(fileName);
            return [
              4 /*yield*/,
              this.supabase.storage.from(this.STORAGE_BUCKET).upload(filePath, newFile),
            ];
          case 2:
            (_a = _c.sent()), (uploadData = _a.data), (uploadError = _a.error);
            if (uploadError) throw uploadError;
            urlData = this.supabase.storage.from(this.STORAGE_BUCKET).getPublicUrl(filePath).data;
            return [
              4 /*yield*/,
              this.calculateChecksum(newFile),
              // Create version record
            ];
          case 3:
            checksum = _c.sent();
            version = {
              id: versionId,
              document_id: documentId,
              version_number: document_3.version + 1,
              file_path: filePath,
              file_url: urlData.publicUrl,
              file_size: newFile.size,
              checksum: checksum,
              changes_description: changesDescription,
              created_by: userId,
              created_at: new Date().toISOString(),
            };
            return [
              4 /*yield*/,
              this.supabase.from("document_versions").insert(version).select().single(),
            ];
          case 4:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            // Update main document
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_documents")
                .update({
                  file_path: filePath,
                  file_url: urlData.publicUrl,
                  file_size: newFile.size,
                  checksum: checksum,
                  version: document_3.version + 1,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", documentId),
              // Log audit event
            ];
          case 5:
            // Update main document
            _c.sent();
            // Log audit event
            return [
              4 /*yield*/,
              this.auditLogger.log({
                event_type: "document_version_created",
                user_id: userId,
                resource_type: "document_version",
                resource_id: versionId,
                details: {
                  document_id: documentId,
                  version_number: version.version_number,
                  changes_description: changesDescription,
                },
              }),
            ];
          case 6:
            // Log audit event
            _c.sent();
            return [2 /*return*/, { success: true, data: data }];
          case 7:
            error_8 = _c.sent();
            console.error("Error creating document version:", error_8);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_8 instanceof Error ? error_8.message : "Unknown error",
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.getDocumentVersions = function (documentId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("document_versions")
                .select("*")
                .eq("document_id", documentId)
                .order("version_number", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, { success: true, data: data || [] }];
          case 2:
            error_9 = _b.sent();
            console.error("Error getting document versions:", error_9);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_9 instanceof Error ? error_9.message : "Unknown error",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ========================================================================
  // UTILITY METHODS
  // ========================================================================
  MedicalDocumentManager.prototype.validateFile = function (file) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
          return [
            2 /*return*/,
            {
              isValid: false,
              error: "File size exceeds maximum allowed size of ".concat(
                this.MAX_FILE_SIZE / 1024 / 1024,
                "MB",
              ),
            },
          ];
        }
        // Check MIME type
        if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
          return [
            2 /*return*/,
            {
              isValid: false,
              error: "File type ".concat(file.type, " is not allowed"),
            },
          ];
        }
        return [2 /*return*/, { isValid: true }];
      });
    });
  };
  MedicalDocumentManager.prototype.calculateChecksum = function (file) {
    return __awaiter(this, void 0, void 0, function () {
      var buffer, hash;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, file.arrayBuffer()];
          case 1:
            buffer = _a.sent();
            hash = crypto_1.default.createHash("sha256");
            hash.update(new Uint8Array(buffer));
            return [2 /*return*/, hash.digest("hex")];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.checkDuplicate = function (checksum, patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_documents")
                .select("uploaded_at")
                .eq("checksum", checksum)
                .eq("patient_id", patientId)
                .eq("is_active", true)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") throw error;
            return [
              2 /*return*/,
              {
                isDuplicate: !!data,
                originalDate: data === null || data === void 0 ? void 0 : data.uploaded_at,
              },
            ];
          case 2:
            error_10 = _b.sent();
            console.error("Error checking duplicate:", error_10);
            return [2 /*return*/, { isDuplicate: false }];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.getDocumentType = function (mimeType) {
    if (mimeType.startsWith("image/")) return DocumentType.IMAGE;
    if (mimeType === "application/pdf") return DocumentType.PDF;
    if (mimeType.startsWith("video/")) return DocumentType.VIDEO;
    if (mimeType.startsWith("audio/")) return DocumentType.AUDIO;
    if (mimeType === "application/dicom") return DocumentType.DICOM;
    if (mimeType.includes("document") || mimeType.includes("word")) return DocumentType.DOCUMENT;
    return DocumentType.OTHER;
  };
  MedicalDocumentManager.prototype.extractMetadata = function (file) {
    return __awaiter(this, void 0, void 0, function () {
      var metadata;
      return __generator(this, function (_a) {
        metadata = {};
        if (file.type.startsWith("image/")) {
          // For images, we would typically use a library like exif-js
          // For now, we'll just set basic info
          metadata.creation_date = new Date().toISOString();
        }
        return [2 /*return*/, metadata];
      });
    });
  };
  MedicalDocumentManager.prototype.generateThumbnail = function (filePath, file) {
    return __awaiter(this, void 0, void 0, function () {
      var thumbnailPath, data;
      return __generator(this, function (_a) {
        try {
          thumbnailPath = filePath.replace(/\.[^/.]+$/, "_thumb.jpg");
          data = this.supabase.storage.from(this.STORAGE_BUCKET).getPublicUrl(thumbnailPath).data;
          return [2 /*return*/, data.publicUrl];
        } catch (error) {
          console.error("Error generating thumbnail:", error);
          return [2 /*return*/, undefined];
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDocumentManager.prototype.processImage = function (documentId, filePath) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // Image processing tasks:
          // - Resize for web display
          // - Optimize compression
          // - Extract EXIF data
          // - Generate multiple sizes
          // TODO: Implement image processing pipeline
          console.log("Processing image for document ".concat(documentId, " at ").concat(filePath));
        } catch (error) {
          console.error("Error processing image:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  MedicalDocumentManager.prototype.handleBeforeAfterPairing = function (
    documentId,
    pairId,
    category,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Update document metadata to include pair information
            return [
              4 /*yield*/,
              this.supabase
                .from("medical_documents")
                .update({
                  metadata: { before_after_pair_id: pairId },
                  updated_at: new Date().toISOString(),
                })
                .eq("id", documentId),
            ];
          case 1:
            // Update document metadata to include pair information
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Error handling before/after pairing:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.checkDocumentAccess = function (document, userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // Simplified access control
          // In production, implement proper RBAC integration
          switch (document.access_level) {
            case AccessLevel.PUBLIC:
              return [2 /*return*/, true];
            case AccessLevel.CLINIC_STAFF:
              // Check if user belongs to the same clinic
              return [2 /*return*/, true]; // TODO: Implement clinic membership check
            case AccessLevel.DOCTOR_ONLY:
              // Check if user is a doctor
              return [2 /*return*/, true]; // TODO: Implement role check
            case AccessLevel.PATIENT_ONLY:
              // Check if user is the patient
              return [2 /*return*/, document.patient_id === userId];
            case AccessLevel.RESTRICTED:
              // Check specific permissions
              return [2 /*return*/, false]; // TODO: Implement specific permission check
            default:
              return [2 /*return*/, false];
          }
        } catch (error) {
          console.error("Error checking document access:", error);
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  // ========================================================================
  // SEARCH AND ANALYTICS
  // ========================================================================
  MedicalDocumentManager.prototype.searchDocuments = function (query, clinicId, userId, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var dbQuery, _a, data, error, accessibleDocuments, _i, _b, doc, hasAccess, error_12;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            dbQuery = this.supabase
              .from("medical_documents")
              .select("*")
              .eq("clinic_id", clinicId)
              .eq("is_active", true)
              .or(
                "title.ilike.%"
                  .concat(query, "%,description.ilike.%")
                  .concat(query, "%,original_file_name.ilike.%")
                  .concat(query, "%"),
              );
            // Apply filters
            if (filters === null || filters === void 0 ? void 0 : filters.documentType) {
              dbQuery = dbQuery.eq("document_type", filters.documentType);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.category) {
              dbQuery = dbQuery.eq("category", filters.category);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.accessLevel) {
              dbQuery = dbQuery.eq("access_level", filters.accessLevel);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.dateFrom) {
              dbQuery = dbQuery.gte("uploaded_at", filters.dateFrom);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.dateTo) {
              dbQuery = dbQuery.lte("uploaded_at", filters.dateTo);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.tags) &&
              filters.tags.length > 0
            ) {
              dbQuery = dbQuery.overlaps("tags", filters.tags);
            }
            return [4 /*yield*/, dbQuery.order("uploaded_at", { ascending: false }).limit(50)];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            accessibleDocuments = [];
            (_i = 0), (_b = data || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 5];
            doc = _b[_i];
            return [4 /*yield*/, this.checkDocumentAccess(doc, userId)];
          case 3:
            hasAccess = _c.sent();
            if (hasAccess) {
              accessibleDocuments.push(doc);
            }
            _c.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            // Log audit event
            return [
              4 /*yield*/,
              this.auditLogger.log({
                event_type: "documents_searched",
                user_id: userId,
                resource_type: "medical_document",
                resource_id: clinicId,
                details: {
                  query: query,
                  filters: filters,
                  results_count: accessibleDocuments.length,
                },
              }),
            ];
          case 6:
            // Log audit event
            _c.sent();
            return [2 /*return*/, { success: true, data: accessibleDocuments }];
          case 7:
            error_12 = _c.sent();
            console.error("Error searching documents:", error_12);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_12 instanceof Error ? error_12.message : "Unknown error",
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  MedicalDocumentManager.prototype.getDocumentStatistics = function (clinicId, userId, period) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, stats_1, error_13;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("medical_documents")
              .select("document_type, category, file_size, uploaded_at")
              .eq("clinic_id", clinicId)
              .eq("is_active", true);
            if (period) {
              query = query.gte("uploaded_at", period.from).lte("uploaded_at", period.to);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            stats_1 = {
              total_documents: (data === null || data === void 0 ? void 0 : data.length) || 0,
              total_size: 0,
              by_type: {},
              by_category: {},
              by_month: {},
              average_size: 0,
            };
            data === null || data === void 0
              ? void 0
              : data.forEach(function (doc) {
                  stats_1.total_size += doc.file_size;
                  // Count by type
                  stats_1.by_type[doc.document_type] =
                    (stats_1.by_type[doc.document_type] || 0) + 1;
                  // Count by category
                  stats_1.by_category[doc.category] = (stats_1.by_category[doc.category] || 0) + 1;
                  // Count by month
                  var month = new Date(doc.uploaded_at).toISOString().slice(0, 7);
                  stats_1.by_month[month] = (stats_1.by_month[month] || 0) + 1;
                });
            stats_1.average_size =
              stats_1.total_documents > 0 ? stats_1.total_size / stats_1.total_documents : 0;
            return [2 /*return*/, { success: true, data: stats_1 }];
          case 2:
            error_13 = _b.sent();
            console.error("Error getting document statistics:", error_13);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_13 instanceof Error ? error_13.message : "Unknown error",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return MedicalDocumentManager;
})();
exports.MedicalDocumentManager = MedicalDocumentManager;
// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================
exports.medicalDocumentManager = new MedicalDocumentManager();
exports.default = exports.medicalDocumentManager;
