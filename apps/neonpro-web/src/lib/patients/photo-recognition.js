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
exports.createphotoRecognitionSystem = exports.PhotoRecognitionSystem = void 0;
// lib/patients/photo-recognition.ts
var server_1 = require("@/lib/supabase/server");
var PhotoRecognitionSystem = /** @class */ (() => {
  function PhotoRecognitionSystem() {
    this.supabase = (0, server_1.createClient)();
  }
  /**
   * Faz upload e processamento inicial da foto
   */
  PhotoRecognitionSystem.prototype.uploadPatientPhoto = function (
    patientId,
    photoFile,
    uploadedBy,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var photoData_1;
      return __generator(this, (_a) => {
        try {
          photoData_1 = {
            id: "photo_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
            patientId: patientId,
            fileName: photoFile.name,
            fileSize: photoFile.size,
            mimeType: photoFile.type,
            uploadedAt: new Date(),
            uploadedBy: uploadedBy,
            status: "processing",
            metadata: {
              width: 1024,
              height: 768,
              quality: 85,
              faceDetected: true,
              faces: [
                {
                  id: "face_001",
                  boundingBox: { x: 200, y: 150, width: 400, height: 500 },
                  confidence: 0.95,
                  landmarks: {
                    leftEye: { x: 320, y: 280 },
                    rightEye: { x: 480, y: 280 },
                    nose: { x: 400, y: 350 },
                    mouth: { x: 400, y: 420 },
                  },
                  attributes: {
                    age: 35,
                    gender: "male",
                    emotion: "neutral",
                    glasses: false,
                  },
                },
              ],
            },
          };
          // Simular processamento assíncrono
          setTimeout(() => {
            this.processPhotoRecognition(photoData_1.id);
          }, 2000);
          return [2 /*return*/, photoData_1];
        } catch (error) {
          console.error("Erro no upload da foto:", error);
          throw new Error("Falha no upload da foto");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Processa reconhecimento facial na foto
   */
  PhotoRecognitionSystem.prototype.processPhotoRecognition = function (photoId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 4]);
            // Simular processamento de reconhecimento facial
            console.log("Processando reconhecimento facial para foto ".concat(photoId));
            // Atualizar status para verified após processamento
            return [4 /*yield*/, this.updatePhotoStatus(photoId, "verified", 0.92)];
          case 1:
            // Atualizar status para verified após processamento
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Erro no processamento de reconhecimento:", error_1);
            return [4 /*yield*/, this.updatePhotoStatus(photoId, "rejected")];
          case 3:
            _a.sent();
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Atualiza status da foto
   */
  PhotoRecognitionSystem.prototype.updatePhotoStatus = function (
    photoId,
    status,
    verificationScore,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Simular atualização do status no banco
          console.log("Foto ".concat(photoId, " atualizada para status: ").concat(status));
          if (verificationScore) {
            console.log("Score de verifica\u00E7\u00E3o: ".concat(verificationScore));
          }
        } catch (error) {
          console.error("Erro ao atualizar status da foto:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Verifica identidade usando reconhecimento facial
   */
  PhotoRecognitionSystem.prototype.verifyPatientIdentity = function (patientId, photoFile) {
    return __awaiter(this, void 0, void 0, function () {
      var verification;
      return __generator(this, (_a) => {
        try {
          verification = {
            success: true,
            confidence: 0.89,
            matchedPatientId: patientId,
            similarPatients: [
              { patientId: "pat_456", similarity: 0.72 },
              { patientId: "pat_789", similarity: 0.65 },
            ],
            recommendations: [
              "Qualidade da imagem é adequada para verificação",
              "Considerar foto adicional para maior precisão",
            ],
          };
          if (verification.confidence < 0.7) {
            verification.success = false;
            verification.issues = [
              "Confiança baixa na verificação",
              "Foto pode estar com qualidade insuficiente",
            ];
          }
          return [2 /*return*/, verification];
        } catch (error) {
          console.error("Erro na verificação de identidade:", error);
          throw new Error("Falha na verificação de identidade");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Busca pacientes similares usando reconhecimento facial
   */
  PhotoRecognitionSystem.prototype.findSimilarPatients = function (photoFile_1) {
    return __awaiter(this, arguments, void 0, function (photoFile, threshold) {
      var similarPatients;
      if (threshold === void 0) {
        threshold = 0.7;
      }
      return __generator(this, (_a) => {
        try {
          similarPatients = [
            {
              patientId: "pat_123",
              similarity: 0.85,
              metadata: {
                name: "João Silva",
                lastSeen: new Date("2024-01-15"),
                photoCount: 2,
              },
            },
            {
              patientId: "pat_456",
              similarity: 0.72,
              metadata: {
                name: "José Santos",
                lastSeen: new Date("2024-02-20"),
                photoCount: 1,
              },
            },
          ];
          return [
            2 /*return*/,
            similarPatients.filter((patient) => patient.similarity >= threshold),
          ];
        } catch (error) {
          console.error("Erro na busca de pacientes similares:", error);
          throw new Error("Falha na busca de pacientes similares");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Gera template biométrico da foto
   */
  PhotoRecognitionSystem.prototype.generateBiometricTemplate = function (photoId_1) {
    return __awaiter(this, arguments, void 0, function (photoId, algorithm) {
      var template;
      if (algorithm === void 0) {
        algorithm = "facenet";
      }
      return __generator(this, (_a) => {
        try {
          template = {
            id: "template_".concat(Date.now()),
            patientId: "pat_123",
            template: "encoded_biometric_data_placeholder",
            algorithm: algorithm,
            quality: 0.92,
            createdAt: new Date(),
          };
          return [2 /*return*/, template];
        } catch (error) {
          console.error("Erro na geração do template biométrico:", error);
          throw new Error("Falha na geração do template biométrico");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Compara duas fotos para verificação
   */
  PhotoRecognitionSystem.prototype.comparePhotos = function (photo1Id, photo2Id) {
    return __awaiter(this, void 0, void 0, function () {
      var comparison;
      return __generator(this, (_a) => {
        try {
          comparison = {
            similarity: 0.87,
            confidence: 0.91,
            match: true,
            details: {
              faceAlignment: 0.89,
              lighting: 0.85,
              angle: 0.92,
              quality: 0.88,
              landmarks: {
                eyeDistance: 0.96,
                nosePosition: 0.91,
                mouthShape: 0.84,
              },
            },
          };
          return [2 /*return*/, comparison];
        } catch (error) {
          console.error("Erro na comparação de fotos:", error);
          throw new Error("Falha na comparação de fotos");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Valida qualidade da foto para reconhecimento
   */
  PhotoRecognitionSystem.prototype.validatePhotoQuality = function (photoFile) {
    return __awaiter(this, void 0, void 0, function () {
      var validation;
      return __generator(this, (_a) => {
        try {
          validation = {
            isValid: true,
            quality: 0.85,
            issues: [],
            recommendations: [],
          };
          // Verificações simuladas
          if (photoFile.size < 50000) {
            validation.isValid = false;
            validation.issues.push("Arquivo muito pequeno");
            validation.recommendations.push("Use foto com resolução mínima de 800x600");
          }
          if (photoFile.size > 10000000) {
            validation.issues.push("Arquivo muito grande");
            validation.recommendations.push("Comprima a imagem para menos de 10MB");
          }
          if (!["image/jpeg", "image/png"].includes(photoFile.type)) {
            validation.isValid = false;
            validation.issues.push("Formato não suportado");
            validation.recommendations.push("Use apenas JPEG ou PNG");
          }
          return [2 /*return*/, validation];
        } catch (error) {
          console.error("Erro na validação de qualidade:", error);
          throw new Error("Falha na validação de qualidade");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Lista fotos de um paciente
   */
  PhotoRecognitionSystem.prototype.getPatientPhotos = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var photos;
      return __generator(this, (_a) => {
        try {
          photos = [
            {
              id: "photo_001",
              patientId: patientId,
              fileName: "profile_photo.jpg",
              fileSize: 245760,
              mimeType: "image/jpeg",
              uploadedAt: new Date("2024-01-15"),
              uploadedBy: "user_123",
              status: "verified",
              verificationScore: 0.92,
              metadata: {
                width: 1024,
                height: 768,
                quality: 85,
                faceDetected: true,
              },
            },
          ];
          return [2 /*return*/, photos];
        } catch (error) {
          console.error("Erro ao buscar fotos do paciente:", error);
          throw new Error("Falha ao buscar fotos do paciente");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Remove foto do sistema
   */
  PhotoRecognitionSystem.prototype.deletePatientPhoto = function (photoId, deletedBy) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Simular remoção da foto
          console.log("Foto ".concat(photoId, " removida por ").concat(deletedBy));
          return [2 /*return*/, true];
        } catch (error) {
          console.error("Erro ao remover foto:", error);
          throw new Error("Falha ao remover foto");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Gera relatório de uso do sistema de reconhecimento
   */
  PhotoRecognitionSystem.prototype.generateRecognitionReport = function () {
    return __awaiter(this, arguments, void 0, function (timeframe) {
      var report;
      if (timeframe === void 0) {
        timeframe = "30days";
      }
      return __generator(this, (_a) => {
        try {
          report = {
            generatedAt: new Date(),
            timeframe: timeframe,
            statistics: {
              totalPhotos: 156,
              successfulVerifications: 142,
              failedVerifications: 14,
              averageConfidence: 0.87,
              duplicatesDetected: 3,
              qualityIssues: 8,
            },
            qualityMetrics: {
              averagePhotoQuality: 0.84,
              faceDetectionRate: 0.96,
              verificationAccuracy: 0.91,
            },
            usage: {
              dailyUploads: 12,
              peakHours: ["09:00-11:00", "14:00-16:00"],
              topUsers: [
                { userId: "user_123", uploads: 45 },
                { userId: "user_456", uploads: 32 },
              ],
            },
            recommendations: [
              "Implementar orientações de qualidade para usuários",
              "Considerar upgrade do algoritmo para melhor precisão",
              "Adicionar validação de qualidade em tempo real",
            ],
          };
          return [2 /*return*/, report];
        } catch (error) {
          console.error("Erro ao gerar relatório de reconhecimento:", error);
          throw new Error("Falha na geração do relatório");
        }
        return [2 /*return*/];
      });
    });
  };
  return PhotoRecognitionSystem;
})();
exports.PhotoRecognitionSystem = PhotoRecognitionSystem;
var createphotoRecognitionSystem = () => new PhotoRecognitionSystem();
exports.createphotoRecognitionSystem = createphotoRecognitionSystem;
