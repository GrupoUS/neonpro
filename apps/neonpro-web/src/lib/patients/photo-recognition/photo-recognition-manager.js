/**
 * Photo Recognition Manager
 * Handles patient photo recognition, verification, and biometric matching
 *
 * Features:
 * - Facial recognition for patient identification
 * - Photo verification workflow
 * - Privacy controls and LGPD compliance
 * - Photo quality validation and enhancement
 * - Biometric comparison for security
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */
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
exports.defaultPhotoRecognitionConfig = exports.PhotoRecognitionManager = void 0;
var PhotoRecognitionManager = /** @class */ (() => {
  function PhotoRecognitionManager(supabase, auditLogger, lgpdManager, config) {
    this.supabase = supabase;
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.config = config;
  }
  /**
   * Upload and process patient photo with recognition
   */
  PhotoRecognitionManager.prototype.uploadPatientPhoto = function (
    patientId,
    photoFile,
    photoType,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var hasConsent,
        qualityAssessment,
        fileExtension,
        filename,
        _a,
        uploadData,
        uploadError,
        metadata,
        dimensions,
        recognitionResult,
        dbError,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 11, , 13]);
            return [4 /*yield*/, this.lgpdManager.checkConsent(patientId, "photo_processing")];
          case 1:
            hasConsent = _b.sent();
            if (!hasConsent) {
              throw new Error("Patient consent required for photo processing");
            }
            return [4 /*yield*/, this.assessPhotoQuality(photoFile)];
          case 2:
            qualityAssessment = _b.sent();
            if (qualityAssessment.overall < this.config.qualityThreshold) {
              throw new Error(
                "Photo quality too low: ".concat(qualityAssessment.recommendations.join(", ")),
              );
            }
            fileExtension = this.getFileExtension(photoFile);
            filename = ""
              .concat(patientId, "/")
              .concat(photoType, "/")
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substr(2, 9), ".")
              .concat(fileExtension);
            return [
              4 /*yield*/,
              this.supabase.storage.from("patient-photos").upload(filename, photoFile, {
                cacheControl: "3600",
                upsert: false,
              }),
            ];
          case 3:
            (_a = _b.sent()), (uploadData = _a.data), (uploadError = _a.error);
            if (uploadError) {
              throw new Error("Upload failed: ".concat(uploadError.message));
            }
            metadata = {
              id: crypto.randomUUID(),
              patientId: patientId,
              filename: filename,
              originalName: photoFile instanceof File ? photoFile.name : "uploaded_photo",
              mimeType: photoFile instanceof File ? photoFile.type : "image/jpeg",
              size: photoFile instanceof File ? photoFile.size : Buffer.byteLength(photoFile),
              width: 0, // Will be extracted from image
              height: 0, // Will be extracted from image
              quality: qualityAssessment.overall,
              uploadDate: new Date(),
            };
            return [4 /*yield*/, this.extractImageDimensions(photoFile)];
          case 4:
            dimensions = _b.sent();
            metadata.width = dimensions.width;
            metadata.height = dimensions.height;
            recognitionResult = void 0;
            if (!(this.config.enabled && photoType === "profile")) return [3 /*break*/, 6];
            return [4 /*yield*/, this.performFacialRecognition(photoFile, patientId)];
          case 5:
            recognitionResult = _b.sent();
            _b.label = 6;
          case 6:
            return [
              4 /*yield*/,
              this.supabase.from("patient_photos").insert({
                id: metadata.id,
                patient_id: patientId,
                filename: metadata.filename,
                original_name: metadata.originalName,
                mime_type: metadata.mimeType,
                size: metadata.size,
                width: metadata.width,
                height: metadata.height,
                quality: metadata.quality,
                photo_type: photoType,
                recognition_data:
                  (recognitionResult === null || recognitionResult === void 0
                    ? void 0
                    : recognitionResult.features) || null,
                upload_date: metadata.uploadDate,
                uploaded_by: userId,
              }),
            ];
          case 7:
            dbError = _b.sent().error;
            if (!dbError) return [3 /*break*/, 9];
            // Cleanup uploaded file
            return [4 /*yield*/, this.supabase.storage.from("patient-photos").remove([filename])];
          case 8:
            // Cleanup uploaded file
            _b.sent();
            throw new Error("Database error: ".concat(dbError.message));
          case 9:
            // Log audit event
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "photo_upload",
                userId: userId,
                resourceType: "patient_photo",
                resourceId: metadata.id,
                details: {
                  patientId: patientId,
                  photoType: photoType,
                  fileSize: metadata.size,
                  quality: metadata.quality,
                  recognitionEnabled: this.config.enabled,
                },
              }),
            ];
          case 10:
            // Log audit event
            _b.sent();
            return [
              2 /*return*/,
              {
                photoId: metadata.id,
                metadata: metadata,
                recognition: recognitionResult,
              },
            ];
          case 11:
            error_1 = _b.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "photo_upload_failed",
                userId: userId,
                resourceType: "patient_photo",
                details: {
                  patientId: patientId,
                  error: error_1 instanceof Error ? error_1.message : "Unknown error",
                },
              }),
            ];
          case 12:
            _b.sent();
            throw error_1;
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verify patient identity using photo
   */
  PhotoRecognitionManager.prototype.verifyPatientIdentity = function (request, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        hasConsent,
        qualityAssessment,
        recognitionResult,
        bestMatch,
        verified,
        securityFlags,
        recommendations,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 8]);
            return [
              4 /*yield*/,
              this.lgpdManager.checkConsent(request.patientId, "biometric_verification"),
            ];
          case 2:
            hasConsent = _a.sent();
            if (!hasConsent) {
              throw new Error("Patient consent required for biometric verification");
            }
            return [4 /*yield*/, this.assessPhotoQuality(request.photoFile)];
          case 3:
            qualityAssessment = _a.sent();
            if (qualityAssessment.overall < this.config.qualityThreshold) {
              return [
                2 /*return*/,
                {
                  verified: false,
                  confidence: 0,
                  securityFlags: ["low_photo_quality"],
                  recommendations: qualityAssessment.recommendations,
                  processingTime: Date.now() - startTime,
                },
              ];
            }
            return [
              4 /*yield*/,
              this.performFacialRecognition(request.photoFile, request.patientId),
            ];
          case 4:
            recognitionResult = _a.sent();
            if (!recognitionResult.success) {
              return [
                2 /*return*/,
                {
                  verified: false,
                  confidence: 0,
                  securityFlags: ["recognition_failed"],
                  recommendations: ["Please ensure face is clearly visible", "Try better lighting"],
                  processingTime: Date.now() - startTime,
                },
              ];
            }
            bestMatch = recognitionResult.matches
              .filter((match) => match.patientId === request.patientId)
              .sort((a, b) => b.confidence - a.confidence)[0];
            verified = bestMatch && bestMatch.confidence >= this.config.confidenceThreshold;
            securityFlags = [];
            recommendations = [];
            // Security analysis
            if (bestMatch && bestMatch.confidence < 0.8) {
              securityFlags.push("low_confidence_match");
              recommendations.push("Consider additional verification methods");
            }
            if (recognitionResult.matches.length > 1) {
              securityFlags.push("multiple_matches_found");
              recommendations.push("Manual verification recommended");
            }
            // Log verification attempt
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "patient_verification",
                userId: userId,
                resourceType: "patient",
                resourceId: request.patientId,
                details: {
                  context: request.verificationContext,
                  verified: verified,
                  confidence:
                    (bestMatch === null || bestMatch === void 0 ? void 0 : bestMatch.confidence) ||
                    0,
                  securityFlags: securityFlags,
                  processingTime: Date.now() - startTime,
                },
              }),
            ];
          case 5:
            // Log verification attempt
            _a.sent();
            return [
              2 /*return*/,
              {
                verified: verified,
                confidence:
                  (bestMatch === null || bestMatch === void 0 ? void 0 : bestMatch.confidence) || 0,
                patientMatch: bestMatch,
                securityFlags: securityFlags,
                recommendations: recommendations,
                processingTime: Date.now() - startTime,
              },
            ];
          case 6:
            error_2 = _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "verification_failed",
                userId: userId,
                resourceType: "patient",
                resourceId: request.patientId,
                details: {
                  error: error_2 instanceof Error ? error_2.message : "Unknown error",
                  context: request.verificationContext,
                },
              }),
            ];
          case 7:
            _a.sent();
            return [
              2 /*return*/,
              {
                verified: false,
                confidence: 0,
                securityFlags: ["verification_error"],
                recommendations: ["Please try again or contact support"],
                processingTime: Date.now() - startTime,
              },
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  }; /**
   * Perform facial recognition on photo
   */
  PhotoRecognitionManager.prototype.performFacialRecognition = function (photoFile, patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var photoBase64, features, matches, bestMatch, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.convertToBase64(photoFile),
              // Extract facial features (placeholder for actual ML implementation)
            ];
          case 1:
            photoBase64 = _a.sent();
            return [4 /*yield*/, this.extractFacialFeatures(photoBase64)];
          case 2:
            features = _a.sent();
            if (!features) {
              return [
                2 /*return*/,
                {
                  success: false,
                  confidence: 0,
                  matches: [],
                  error: "No face detected in photo",
                },
              ];
            }
            return [
              4 /*yield*/,
              this.searchFacialMatches(features, patientId),
              // Find best match
            ];
          case 3:
            matches = _a.sent();
            bestMatch = matches.length > 0 ? matches[0] : null;
            return [
              2 /*return*/,
              {
                success: true,
                patientId:
                  bestMatch === null || bestMatch === void 0 ? void 0 : bestMatch.patientId,
                confidence:
                  (bestMatch === null || bestMatch === void 0 ? void 0 : bestMatch.confidence) || 0,
                matches: matches,
                features: features,
              },
            ];
          case 4:
            error_3 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                confidence: 0,
                matches: [],
                error: error_3 instanceof Error ? error_3.message : "Recognition failed",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Extract facial features from photo (ML placeholder)
   */
  PhotoRecognitionManager.prototype.extractFacialFeatures = function (photoBase64) {
    return __awaiter(this, void 0, void 0, function () {
      var mockFeatures, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Simulate ML processing delay
            return [
              4 /*yield*/,
              new Promise((resolve) => setTimeout(resolve, 100)),
              // Mock facial features extraction
            ];
          case 1:
            // Simulate ML processing delay
            _a.sent();
            mockFeatures = {
              landmarks: [
                [100, 120],
                [150, 120], // Eyes
                [125, 140], // Nose
                [110, 160],
                [140, 160], // Mouth corners
              ],
              encoding: Array.from({ length: 128 }, () => Math.random() * 2 - 1),
              confidence: 0.85 + Math.random() * 0.1,
              boundingBox: {
                x: 80,
                y: 100,
                width: 90,
                height: 120,
              },
            };
            return [2 /*return*/, mockFeatures];
          case 2:
            error_4 = _a.sent();
            console.error("Feature extraction failed:", error_4);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Search for facial matches in database
   */
  PhotoRecognitionManager.prototype.searchFacialMatches = function (features, excludePatientId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, storedPhotos, error, matches, _i, _b, photo, similarity, error_5;
      var _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("patient_photos")
              .select(
                "\n          id,\n          patient_id,\n          recognition_data,\n          upload_date,\n          patients!inner(id, name)\n        ",
              )
              .not("recognition_data", "is", null)
              .eq("photo_type", "profile");
            if (excludePatientId) {
              query = query.neq("patient_id", excludePatientId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _d.sent()), (storedPhotos = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Database query failed: ".concat(error.message));
            }
            matches = [];
            // Compare with stored encodings
            for (_i = 0, _b = storedPhotos || []; _i < _b.length; _i++) {
              photo = _b[_i];
              if (!((_c = photo.recognition_data) === null || _c === void 0 ? void 0 : _c.encoding))
                continue;
              similarity = this.calculateFacialSimilarity(
                features.encoding,
                photo.recognition_data.encoding,
              );
              if (similarity >= this.config.confidenceThreshold) {
                matches.push({
                  patientId: photo.patient_id,
                  patientName: photo.patients.name,
                  confidence: similarity,
                  lastSeen: new Date(photo.upload_date),
                  photoId: photo.id,
                });
              }
            }
            // Sort by confidence (highest first)
            return [2 /*return*/, matches.sort((a, b) => b.confidence - a.confidence)];
          case 2:
            error_5 = _d.sent();
            console.error("Facial match search failed:", error_5);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate facial similarity between two encodings
   */
  PhotoRecognitionManager.prototype.calculateFacialSimilarity = (encoding1, encoding2) => {
    if (encoding1.length !== encoding2.length) {
      return 0;
    }
    // Calculate Euclidean distance
    var distance = 0;
    for (var i = 0; i < encoding1.length; i++) {
      distance += (encoding1[i] - encoding2[i]) ** 2;
    }
    distance = Math.sqrt(distance);
    // Convert distance to similarity (0-1 scale)
    // Lower distance = higher similarity
    var maxDistance = Math.sqrt(encoding1.length * 4); // Theoretical max
    var similarity = Math.max(0, 1 - distance / maxDistance);
    return Math.min(1, similarity);
  };
  /**
   * Assess photo quality
   */
  PhotoRecognitionManager.prototype.assessPhotoQuality = function (photoFile) {
    return __awaiter(this, void 0, void 0, function () {
      var fileSize, recommendations, sharpness, lighting, faceVisibility, resolution, overall;
      return __generator(this, (_a) => {
        try {
          fileSize = photoFile instanceof File ? photoFile.size : Buffer.byteLength(photoFile);
          recommendations = [];
          sharpness = 0.8 + Math.random() * 0.2; // Mock sharpness score
          lighting = 0.7 + Math.random() * 0.3; // Mock lighting score
          faceVisibility = 0.85 + Math.random() * 0.15; // Mock face visibility
          resolution = fileSize > 100000 ? 0.9 : 0.6; // Basic resolution check
          // Generate recommendations
          if (sharpness < 0.7) {
            recommendations.push("Image appears blurry - ensure camera is steady");
          }
          if (lighting < 0.6) {
            recommendations.push("Poor lighting - use better illumination");
          }
          if (faceVisibility < 0.8) {
            recommendations.push("Face not clearly visible - center face in frame");
          }
          if (resolution < 0.7) {
            recommendations.push("Low resolution - use higher quality camera");
          }
          overall = (sharpness + lighting + faceVisibility + resolution) / 4;
          return [
            2 /*return*/,
            {
              overall: overall,
              sharpness: sharpness,
              lighting: lighting,
              faceVisibility: faceVisibility,
              resolution: resolution,
              recommendations: recommendations,
            },
          ];
        } catch (error) {
          return [
            2 /*return*/,
            {
              overall: 0.5,
              sharpness: 0.5,
              lighting: 0.5,
              faceVisibility: 0.5,
              resolution: 0.5,
              recommendations: ["Unable to assess photo quality - please try again"],
            },
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Extract image dimensions
   */
  PhotoRecognitionManager.prototype.extractImageDimensions = function (photoFile) {
    return __awaiter(this, void 0, void 0, function () {
      var fileSize;
      return __generator(this, (_a) => {
        try {
          fileSize = photoFile instanceof File ? photoFile.size : Buffer.byteLength(photoFile);
          if (fileSize > 500000) {
            return [2 /*return*/, { width: 1920, height: 1080 }];
          } else if (fileSize > 200000) {
            return [2 /*return*/, { width: 1280, height: 720 }];
          } else {
            return [2 /*return*/, { width: 640, height: 480 }];
          }
        } catch (error) {
          return [2 /*return*/, { width: 640, height: 480 }]; // Default dimensions
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Convert file to base64
   */
  PhotoRecognitionManager.prototype.convertToBase64 = function (file) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        if (file instanceof Buffer) {
          return [2 /*return*/, file.toString("base64")];
        }
        return [
          2 /*return*/,
          new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = () => {
              var result = reader.result;
              var base64 = result.split(",")[1]; // Remove data:image/... prefix
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
        ];
      });
    });
  };
  /**
   * Get file extension from file
   */
  PhotoRecognitionManager.prototype.getFileExtension = (file) => {
    if (file instanceof File) {
      var name_1 = file.name;
      return name_1.substring(name_1.lastIndexOf(".") + 1).toLowerCase();
    }
    return "jpg"; // Default for Buffer
  };
  /**
   * Get patient photos with privacy controls
   */
  PhotoRecognitionManager.prototype.getPatientPhotos = function (patientId, photoType, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var privacyControls_1, query, _a, photos, error, filteredPhotos, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getPatientPrivacyControls(patientId)];
          case 1:
            privacyControls_1 = _b.sent();
            query = this.supabase
              .from("patient_photos")
              .select("*")
              .eq("patient_id", patientId)
              .order("upload_date", { ascending: false });
            if (photoType) {
              query = query.eq("photo_type", photoType);
            }
            return [4 /*yield*/, query];
          case 2:
            (_a = _b.sent()), (photos = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch photos: ".concat(error.message));
            }
            filteredPhotos =
              (photos === null || photos === void 0
                ? void 0
                : photos.filter((photo) => {
                    // Check if photo sharing is allowed
                    if (!privacyControls_1.allowPhotoSharing && userId !== photo.uploaded_by) {
                      return false;
                    }
                    // Check retention period
                    var uploadDate = new Date(photo.upload_date);
                    var daysSinceUpload =
                      (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
                    if (daysSinceUpload > privacyControls_1.dataRetentionDays) {
                      return false;
                    }
                    return true;
                  })) || [];
            return [
              2 /*return*/,
              filteredPhotos.map((photo) => ({
                id: photo.id,
                patientId: photo.patient_id,
                filename: photo.filename,
                originalName: photo.original_name,
                mimeType: photo.mime_type,
                size: photo.size,
                width: photo.width,
                height: photo.height,
                quality: photo.quality,
                uploadDate: new Date(photo.upload_date),
                lastAccessed: photo.last_accessed ? new Date(photo.last_accessed) : undefined,
              })),
            ];
          case 3:
            error_6 = _b.sent();
            console.error("Failed to get patient photos:", error_6);
            return [2 /*return*/, []];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get patient privacy controls
   */
  PhotoRecognitionManager.prototype.getPatientPrivacyControls = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, controls, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_privacy_controls")
                .select("*")
                .eq("patient_id", patientId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (controls = _a.data), (error = _a.error);
            if (error || !controls) {
              // Return default privacy controls
              return [
                2 /*return*/,
                {
                  allowFacialRecognition: false,
                  allowBiometricStorage: false,
                  allowPhotoSharing: false,
                  dataRetentionDays: 365,
                },
              ];
            }
            return [
              2 /*return*/,
              {
                allowFacialRecognition: controls.allow_facial_recognition,
                allowBiometricStorage: controls.allow_biometric_storage,
                allowPhotoSharing: controls.allow_photo_sharing,
                dataRetentionDays: controls.data_retention_days,
                anonymizeAfterDays: controls.anonymize_after_days,
              },
            ];
          case 2:
            error_7 = _b.sent();
            console.error("Failed to get privacy controls:", error_7);
            // Return restrictive defaults
            return [
              2 /*return*/,
              {
                allowFacialRecognition: false,
                allowBiometricStorage: false,
                allowPhotoSharing: false,
                dataRetentionDays: 365,
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update patient privacy controls
   */
  PhotoRecognitionManager.prototype.updatePatientPrivacyControls = function (
    patientId,
    controls,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase.from("patient_privacy_controls").upsert({
                patient_id: patientId,
                allow_facial_recognition: controls.allowFacialRecognition,
                allow_biometric_storage: controls.allowBiometricStorage,
                allow_photo_sharing: controls.allowPhotoSharing,
                data_retention_days: controls.dataRetentionDays,
                anonymize_after_days: controls.anonymizeAfterDays,
                updated_by: userId,
                updated_at: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to update privacy controls: ".concat(error.message));
            }
            // Log privacy update
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "privacy_controls_updated",
                userId: userId,
                resourceType: "patient_privacy",
                resourceId: patientId,
                details: { controls: controls },
              }),
            ];
          case 2:
            // Log privacy update
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_8 = _a.sent();
            console.error("Failed to update privacy controls:", error_8);
            throw error_8;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete patient photo with privacy compliance
   */
  PhotoRecognitionManager.prototype.deletePatientPhoto = function (photoId, userId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, photo, fetchError, storageError, dbError, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase.from("patient_photos").select("*").eq("id", photoId).single(),
            ];
          case 1:
            (_a = _b.sent()), (photo = _a.data), (fetchError = _a.error);
            if (fetchError || !photo) {
              throw new Error("Photo not found");
            }
            return [
              4 /*yield*/,
              this.supabase.storage.from("patient-photos").remove([photo.filename]),
            ];
          case 2:
            storageError = _b.sent().error;
            if (storageError) {
              console.warn("Storage deletion failed:", storageError);
            }
            return [4 /*yield*/, this.supabase.from("patient_photos").delete().eq("id", photoId)];
          case 3:
            dbError = _b.sent().error;
            if (dbError) {
              throw new Error("Database deletion failed: ".concat(dbError.message));
            }
            // Log deletion
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "photo_deleted",
                userId: userId,
                resourceType: "patient_photo",
                resourceId: photoId,
                details: {
                  patientId: photo.patient_id,
                  reason: reason,
                  filename: photo.filename,
                },
              }),
            ];
          case 4:
            // Log deletion
            _b.sent();
            return [3 /*break*/, 6];
          case 5:
            error_9 = _b.sent();
            console.error("Failed to delete photo:", error_9);
            throw error_9;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get photo recognition statistics
   */
  PhotoRecognitionManager.prototype.getRecognitionStats = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        photos,
        error,
        totalPhotos,
        recognizedPhotos,
        confidenceScores,
        averageConfidence,
        lastRecognition,
        error_10;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            query = this.supabase.from("patient_photos").select("recognition_data, upload_date");
            if (patientId) {
              query = query.eq("patient_id", patientId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()), (photos = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Stats query failed: ".concat(error.message));
            }
            totalPhotos = (photos === null || photos === void 0 ? void 0 : photos.length) || 0;
            recognizedPhotos =
              (photos === null || photos === void 0
                ? void 0
                : photos.filter((p) => p.recognition_data).length) || 0;
            confidenceScores =
              (photos === null || photos === void 0
                ? void 0
                : photos
                    .filter((p) => {
                      var _a;
                      return (_a = p.recognition_data) === null || _a === void 0
                        ? void 0
                        : _a.confidence;
                    })
                    .map((p) => p.recognition_data.confidence)) || [];
            averageConfidence =
              confidenceScores.length > 0
                ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
                : 0;
            lastRecognition =
              (_b =
                photos === null || photos === void 0
                  ? void 0
                  : photos
                      .filter((p) => p.recognition_data)
                      .sort(
                        (a, b) =>
                          new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime(),
                      )[0]) === null || _b === void 0
                ? void 0
                : _b.upload_date;
            return [
              2 /*return*/,
              {
                totalPhotos: totalPhotos,
                recognizedPhotos: recognizedPhotos,
                averageConfidence: averageConfidence,
                lastRecognition: lastRecognition ? new Date(lastRecognition) : null,
              },
            ];
          case 2:
            error_10 = _c.sent();
            console.error("Failed to get recognition stats:", error_10);
            return [
              2 /*return*/,
              {
                totalPhotos: 0,
                recognizedPhotos: 0,
                averageConfidence: 0,
                lastRecognition: null,
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return PhotoRecognitionManager;
})();
exports.PhotoRecognitionManager = PhotoRecognitionManager;
// Default configuration
exports.defaultPhotoRecognitionConfig = {
  enabled: true,
  confidenceThreshold: 0.75,
  maxPhotosPerPatient: 50,
  allowedFormats: ["jpg", "jpeg", "png", "webp"],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  qualityThreshold: 0.6,
  privacyMode: "standard",
  retentionDays: 365,
};
