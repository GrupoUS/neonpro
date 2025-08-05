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
exports.UploadManager = void 0;
/**
 * Patient upload manager
 */
var UploadManager = /** @class */ (function () {
  function UploadManager(
    supabase,
    auditLogger,
    lgpdManager,
    sessionManager,
    encryptionService,
    config,
  ) {
    this.supabase = supabase;
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.sessionManager = sessionManager;
    this.encryptionService = encryptionService;
    this.config = config;
  }
  /**
   * Upload files for a patient
   */
  UploadManager.prototype.uploadFiles = function (request, sessionToken) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionValidation,
        validationResult,
        _a,
        uploadRecord,
        uploadError,
        uploadedFiles,
        errors,
        _i,
        _b,
        file,
        uploadedFile,
        error_1,
        finalStatus,
        error_2;
      var _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 11, , 13]);
            return [4 /*yield*/, this.sessionManager.validateSession(sessionToken)];
          case 1:
            sessionValidation = _e.sent();
            if (
              !sessionValidation.isValid ||
              ((_c = sessionValidation.session) === null || _c === void 0
                ? void 0
                : _c.patientId) !== request.patientId
            ) {
              throw new Error("Invalid session or unauthorized access");
            }
            validationResult = this.validateUploadRequest(request);
            if (!validationResult.isValid) {
              return [
                2 /*return*/,
                {
                  success: false,
                  message: validationResult.message,
                  errors: validationResult.errors,
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_uploads")
                .insert({
                  patient_id: request.patientId,
                  category: request.category,
                  description: request.description,
                  is_private: request.isPrivate,
                  tags: request.tags,
                  expiration_date:
                    (_d = request.expirationDate) === null || _d === void 0
                      ? void 0
                      : _d.toISOString(),
                  status: "uploading",
                  total_files: request.files.length,
                  created_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 2:
            (_a = _e.sent()), (uploadRecord = _a.data), (uploadError = _a.error);
            if (uploadError) throw uploadError;
            uploadedFiles = [];
            errors = [];
            (_i = 0), (_b = request.files);
            _e.label = 3;
          case 3:
            if (!(_i < _b.length)) return [3 /*break*/, 8];
            file = _b[_i];
            _e.label = 4;
          case 4:
            _e.trys.push([4, 6, , 7]);
            return [4 /*yield*/, this.processFile(file, uploadRecord.id, request)];
          case 5:
            uploadedFile = _e.sent();
            uploadedFiles.push(uploadedFile);
            return [3 /*break*/, 7];
          case 6:
            error_1 = _e.sent();
            errors.push({
              fileName: file.name,
              error: error_1.message,
              code: "PROCESSING_FAILED",
            });
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 3];
          case 8:
            finalStatus =
              errors.length === 0
                ? "completed"
                : errors.length === request.files.length
                  ? "failed"
                  : "partial";
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_uploads")
                .update({
                  status: finalStatus,
                  processed_files: uploadedFiles.length,
                  failed_files: errors.length,
                  completed_at: new Date().toISOString(),
                })
                .eq("id", uploadRecord.id),
            ];
          case 9:
            _e.sent();
            // Log upload activity
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "files_uploaded",
                userId: request.patientId,
                userType: "patient",
                details: {
                  uploadId: uploadRecord.id,
                  category: request.category,
                  totalFiles: request.files.length,
                  successfulFiles: uploadedFiles.length,
                  failedFiles: errors.length,
                },
              }),
            ];
          case 10:
            // Log upload activity
            _e.sent();
            return [
              2 /*return*/,
              {
                success: errors.length < request.files.length,
                uploadId: uploadRecord.id,
                files: uploadedFiles,
                message:
                  errors.length === 0
                    ? "Todos os arquivos foram enviados com sucesso!"
                    : ""
                        .concat(uploadedFiles.length, " de ")
                        .concat(request.files.length, " arquivos enviados com sucesso."),
                errors: errors.length > 0 ? errors : undefined,
              },
            ];
          case 11:
            error_2 = _e.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "upload_failed",
                userId: request.patientId,
                userType: "patient",
                details: { error: error_2.message },
              }),
            ];
          case 12:
            _e.sent();
            throw error_2;
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process individual file
   */
  UploadManager.prototype.processFile = function (file, uploadId, request) {
    return __awaiter(this, void 0, void 0, function () {
      var fileExtension,
        storedName,
        filePath,
        fileBuffer,
        processedBuffer,
        _a,
        uploadData,
        uploadError,
        _b,
        fileRecord,
        fileError;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            fileExtension = file.name.split(".").pop();
            storedName = ""
              .concat(uploadId, "_")
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substring(7), ".")
              .concat(fileExtension);
            filePath = "uploads/"
              .concat(request.patientId, "/")
              .concat(request.category, "/")
              .concat(storedName);
            return [4 /*yield*/, file.arrayBuffer()];
          case 1:
            fileBuffer = _c.sent();
            processedBuffer = new Uint8Array(fileBuffer);
            if (!this.config.encryptionEnabled) return [3 /*break*/, 3];
            return [4 /*yield*/, this.encryptionService.encryptFile(processedBuffer)];
          case 2:
            processedBuffer = _c.sent();
            _c.label = 3;
          case 3:
            return [
              4 /*yield*/,
              this.supabase.storage.from("patient-files").upload(filePath, processedBuffer, {
                contentType: file.type,
                metadata: {
                  originalName: file.name,
                  uploadId: uploadId,
                  category: request.category,
                  patientId: request.patientId,
                  encrypted: this.config.encryptionEnabled,
                },
              }),
            ];
          case 4:
            (_a = _c.sent()), (uploadData = _a.data), (uploadError = _a.error);
            if (uploadError) throw uploadError;
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_files")
                .insert({
                  upload_id: uploadId,
                  patient_id: request.patientId,
                  original_name: file.name,
                  stored_name: storedName,
                  file_path: filePath,
                  size: file.size,
                  mime_type: file.type,
                  category: request.category,
                  status: "processing",
                  is_encrypted: this.config.encryptionEnabled,
                  created_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 5:
            (_b = _c.sent()), (fileRecord = _b.data), (fileError = _b.error);
            if (fileError) throw fileError;
            // Start background processing
            if (this.config.autoProcessingEnabled) {
              this.processFileBackground(fileRecord.id, filePath, file.type);
            }
            return [
              2 /*return*/,
              {
                id: fileRecord.id,
                originalName: file.name,
                storedName: storedName,
                size: file.size,
                mimeType: file.type,
                category: request.category,
                uploadDate: new Date(),
                status: "processing",
              },
            ];
        }
      });
    });
  };
  /**
   * Validate upload request
   */
  UploadManager.prototype.validateUploadRequest = function (request) {
    var errors = [];
    // Check file count
    if (request.files.length > this.config.maxFilesPerUpload) {
      return {
        isValid: false,
        message: "M\u00E1ximo de ".concat(this.config.maxFilesPerUpload, " arquivos por upload."),
      };
    }
    // Validate each file
    for (var _i = 0, _a = request.files; _i < _a.length; _i++) {
      var file = _a[_i];
      // Check file size
      if (file.size > this.config.maxFileSize) {
        errors.push({
          fileName: file.name,
          error: "Arquivo excede o tamanho m\u00E1ximo de ".concat(
            this.formatFileSize(this.config.maxFileSize),
            ".",
          ),
          code: "FILE_TOO_LARGE",
        });
      }
      // Check file type
      if (!this.config.allowedFileTypes.includes(file.type)) {
        errors.push({
          fileName: file.name,
          error: "Tipo de arquivo não permitido.",
          code: "INVALID_FILE_TYPE",
        });
      }
    }
    return {
      isValid: errors.length === 0,
      message:
        errors.length === 0
          ? "Validação bem-sucedida"
          : "Alguns arquivos não passaram na validação.",
      errors: errors.length > 0 ? errors : undefined,
    };
  };
  /**
   * Process file in background
   */
  UploadManager.prototype.processFileBackground = function (fileId, filePath, mimeType) {
    return __awaiter(this, void 0, void 0, function () {
      var virusScanResult, thumbnailUrl, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 11]);
            virusScanResult = "pending";
            thumbnailUrl = void 0;
            if (!this.config.virusScanEnabled) return [3 /*break*/, 4];
            return [4 /*yield*/, this.performVirusScan(filePath)];
          case 1:
            virusScanResult = _a.sent();
            if (!(virusScanResult === "infected")) return [3 /*break*/, 3];
            return [4 /*yield*/, this.quarantineFile(fileId)];
          case 2:
            _a.sent();
            return [2 /*return*/];
          case 3:
            return [3 /*break*/, 5];
          case 4:
            virusScanResult = "clean";
            _a.label = 5;
          case 5:
            if (!(this.config.thumbnailGeneration && mimeType.startsWith("image/")))
              return [3 /*break*/, 7];
            return [4 /*yield*/, this.generateThumbnail(filePath)];
          case 6:
            thumbnailUrl = _a.sent();
            _a.label = 7;
          case 7:
            // Update file status
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_files")
                .update({
                  status: "completed",
                  virus_scan_result: virusScanResult,
                  thumbnail_url: thumbnailUrl,
                  processed_at: new Date().toISOString(),
                })
                .eq("id", fileId),
            ];
          case 8:
            // Update file status
            _a.sent();
            return [3 /*break*/, 11];
          case 9:
            error_3 = _a.sent();
            // Mark file as failed
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_files")
                .update({
                  status: "failed",
                  error_message: error_3.message,
                  processed_at: new Date().toISOString(),
                })
                .eq("id", fileId),
            ];
          case 10:
            // Mark file as failed
            _a.sent();
            return [3 /*break*/, 11];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform virus scan (placeholder - integrate with actual antivirus service)
   */
  UploadManager.prototype.performVirusScan = function (filePath) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would integrate with an actual antivirus service
        // For now, return clean as placeholder
        return [2 /*return*/, "clean"];
      });
    });
  };
  /**
   * Generate thumbnail for image files
   */
  UploadManager.prototype.generateThumbnail = function (filePath) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would integrate with image processing service
        // For now, return undefined as placeholder
        return [2 /*return*/, undefined];
      });
    });
  };
  /**
   * Quarantine infected file
   */
  UploadManager.prototype.quarantineFile = function (fileId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_files")
                .update({
                  status: "quarantined",
                  virus_scan_result: "infected",
                  processed_at: new Date().toISOString(),
                })
                .eq("id", fileId),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Format file size for display
   */
  UploadManager.prototype.formatFileSize = function (bytes) {
    var sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };
  /**
   * Get upload statistics for a patient
   */
  UploadManager.prototype.getUploadStats = function (patientId, sessionToken) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionValidation, _a, uploads, error, stats;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [4 /*yield*/, this.sessionManager.validateSession(sessionToken)];
          case 1:
            sessionValidation = _c.sent();
            if (
              !sessionValidation.isValid ||
              ((_b = sessionValidation.session) === null || _b === void 0
                ? void 0
                : _b.patientId) !== patientId
            ) {
              throw new Error("Invalid session or unauthorized access");
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_uploads")
                .select("\n        *,\n        patient_files(*)\n      ")
                .eq("patient_id", patientId),
            ];
          case 2:
            (_a = _c.sent()), (uploads = _a.data), (error = _a.error);
            if (error) throw error;
            stats = {
              totalUploads: uploads.length,
              totalSize: 0,
              byCategory: {},
              byStatus: {},
              recentActivity: [],
            };
            uploads.forEach(function (upload) {
              // Count by category
              stats.byCategory[upload.category] = (stats.byCategory[upload.category] || 0) + 1;
              // Count by status
              stats.byStatus[upload.status] = (stats.byStatus[upload.status] || 0) + 1;
              // Calculate total size
              if (upload.patient_files) {
                upload.patient_files.forEach(function (file) {
                  stats.totalSize += file.size || 0;
                });
              }
            });
            return [2 /*return*/, stats];
        }
      });
    });
  };
  return UploadManager;
})();
exports.UploadManager = UploadManager;
