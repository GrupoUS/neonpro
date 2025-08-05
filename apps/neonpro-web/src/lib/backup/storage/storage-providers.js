"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
exports.StorageManager =
  exports.S3StorageProvider =
  exports.LocalStorageProvider =
  exports.StorageProvider =
    void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../../audit/audit-logger");
var encryption_service_1 = require("../../security/encryption-service");
var lgpd_manager_1 = require("../../lgpd/lgpd-manager");
var StorageProvider = /** @class */ (function () {
  function StorageProvider(config) {
    this.config = config;
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.encryptionService = new encryption_service_1.EncryptionService();
    this.lgpdManager = new lgpd_manager_1.LGPDManager();
  }
  StorageProvider.prototype.processFile = function (filePath, operation) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = operation;
            switch (_a) {
              case "encrypt":
                return [3 /*break*/, 1];
              case "decrypt":
                return [3 /*break*/, 4];
              case "compress":
                return [3 /*break*/, 7];
              case "decompress":
                return [3 /*break*/, 10];
            }
            return [3 /*break*/, 13];
          case 1:
            if (!this.config.encryption_enabled) return [3 /*break*/, 3];
            return [4 /*yield*/, this.encryptionService.encryptFile(filePath)];
          case 2:
            return [2 /*return*/, _b.sent()];
          case 3:
            return [2 /*return*/, filePath];
          case 4:
            if (!this.config.encryption_enabled) return [3 /*break*/, 6];
            return [4 /*yield*/, this.encryptionService.decryptFile(filePath)];
          case 5:
            return [2 /*return*/, _b.sent()];
          case 6:
            return [2 /*return*/, filePath];
          case 7:
            if (!this.config.compression_enabled) return [3 /*break*/, 9];
            return [4 /*yield*/, this.compressFile(filePath)];
          case 8:
            return [2 /*return*/, _b.sent()];
          case 9:
            return [2 /*return*/, filePath];
          case 10:
            if (!this.config.compression_enabled) return [3 /*break*/, 12];
            return [4 /*yield*/, this.decompressFile(filePath)];
          case 11:
            return [2 /*return*/, _b.sent()];
          case 12:
            return [2 /*return*/, filePath];
          case 13:
            return [2 /*return*/, filePath];
        }
      });
    });
  };
  StorageProvider.prototype.compressFile = function (filePath) {
    return __awaiter(this, void 0, void 0, function () {
      var compressedPath;
      return __generator(this, function (_a) {
        compressedPath = "".concat(filePath, ".gz");
        // Lógica de compressão aqui
        return [2 /*return*/, compressedPath];
      });
    });
  };
  StorageProvider.prototype.decompressFile = function (filePath) {
    return __awaiter(this, void 0, void 0, function () {
      var decompressedPath;
      return __generator(this, function (_a) {
        decompressedPath = filePath.replace(".gz", "");
        // Lógica de descompressão aqui
        return [2 /*return*/, decompressedPath];
      });
    });
  };
  StorageProvider.prototype.calculateChecksum = function (filePath) {
    // Implementar cálculo de checksum
    return Promise.resolve("mock_checksum");
  };
  StorageProvider.prototype.getFileSize = function (filePath) {
    // Implementar obtenção do tamanho do arquivo
    return Promise.resolve(0);
  };
  return StorageProvider;
})();
exports.StorageProvider = StorageProvider;
// Implementação para armazenamento local
var LocalStorageProvider = /** @class */ (function (_super) {
  __extends(LocalStorageProvider, _super);
  function LocalStorageProvider(config) {
    var _this = _super.call(this, config) || this;
    _this.basePath = config.connection_config.base_path || "./backups";
    return _this;
  }
  LocalStorageProvider.prototype.connect = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Verificar se o diretório base existe
        console.log("Conectando ao armazenamento local: ".concat(this.basePath));
        return [2 /*return*/];
      });
    });
  };
  LocalStorageProvider.prototype.disconnect = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Desconectando do armazenamento local");
        return [2 /*return*/];
      });
    });
  };
  LocalStorageProvider.prototype.upload = function (localPath, remotePath, options) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        processedPath,
        targetPath,
        fileSize,
        checksum,
        duration,
        transferRate,
        location_1,
        error_1,
        duration;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 9, , 10]);
            processedPath = localPath;
            if (!this.config.compression_enabled) return [3 /*break*/, 3];
            return [4 /*yield*/, this.processFile(processedPath, "compress")];
          case 2:
            processedPath = _a.sent();
            _a.label = 3;
          case 3:
            if (!this.config.encryption_enabled) return [3 /*break*/, 5];
            return [4 /*yield*/, this.processFile(processedPath, "encrypt")];
          case 4:
            processedPath = _a.sent();
            _a.label = 5;
          case 5:
            targetPath = "".concat(this.basePath, "/").concat(remotePath);
            return [4 /*yield*/, this.getFileSize(processedPath)];
          case 6:
            fileSize = _a.sent();
            return [4 /*yield*/, this.calculateChecksum(processedPath)];
          case 7:
            checksum = _a.sent();
            // Simular cópia do arquivo
            console.log("Copiando ".concat(processedPath, " para ").concat(targetPath));
            duration = Date.now() - startTime;
            transferRate = fileSize / 1024 / 1024 / (duration / 1000);
            location_1 = {
              id: this.generateLocationId(),
              provider: this.config.provider,
              path: remotePath,
              size_bytes: fileSize,
              checksum: checksum,
              encrypted: this.config.encryption_enabled,
              compressed: this.config.compression_enabled,
              created_at: new Date(),
              expires_at:
                this.config.retention_days > 0
                  ? new Date(Date.now() + this.config.retention_days * 24 * 60 * 60 * 1000)
                  : undefined,
              metadata: (options === null || options === void 0 ? void 0 : options.metadata) || {},
            };
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "storage_upload",
                resource_type: "storage_file",
                resource_id: location_1.id,
                details: {
                  provider: this.config.provider,
                  path: remotePath,
                  size_bytes: fileSize,
                  duration_ms: duration,
                },
              }),
            ];
          case 8:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                location: location_1,
                duration_ms: duration,
                bytes_transferred: fileSize,
                transfer_rate_mbps: transferRate,
              },
            ];
          case 9:
            error_1 = _a.sent();
            duration = Date.now() - startTime;
            return [
              2 /*return*/,
              {
                success: false,
                error: error_1.toString(),
                duration_ms: duration,
                bytes_transferred: 0,
                transfer_rate_mbps: 0,
              },
            ];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  LocalStorageProvider.prototype.download = function (remotePath, localPath, options) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, sourcePath, fileSize, processedPath, duration, transferRate, error_2, duration;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 8, , 9]);
            sourcePath = "".concat(this.basePath, "/").concat(remotePath);
            return [4 /*yield*/, this.getFileSize(sourcePath)];
          case 2:
            fileSize = _a.sent();
            // Simular cópia do arquivo
            console.log("Copiando ".concat(sourcePath, " para ").concat(localPath));
            processedPath = localPath;
            if (!this.config.encryption_enabled) return [3 /*break*/, 4];
            return [4 /*yield*/, this.processFile(processedPath, "decrypt")];
          case 3:
            processedPath = _a.sent();
            _a.label = 4;
          case 4:
            if (!this.config.compression_enabled) return [3 /*break*/, 6];
            return [4 /*yield*/, this.processFile(processedPath, "decompress")];
          case 5:
            processedPath = _a.sent();
            _a.label = 6;
          case 6:
            duration = Date.now() - startTime;
            transferRate = fileSize / 1024 / 1024 / (duration / 1000);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "storage_download",
                resource_type: "storage_file",
                resource_id: remotePath,
                details: {
                  provider: this.config.provider,
                  path: remotePath,
                  size_bytes: fileSize,
                  duration_ms: duration,
                },
              }),
            ];
          case 7:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                duration_ms: duration,
                bytes_transferred: fileSize,
                transfer_rate_mbps: transferRate,
              },
            ];
          case 8:
            error_2 = _a.sent();
            duration = Date.now() - startTime;
            return [
              2 /*return*/,
              {
                success: false,
                error: error_2.toString(),
                duration_ms: duration,
                bytes_transferred: 0,
                transfer_rate_mbps: 0,
              },
            ];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  LocalStorageProvider.prototype.delete = function (remotePath) {
    return __awaiter(this, void 0, void 0, function () {
      var targetPath, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            targetPath = "".concat(this.basePath, "/").concat(remotePath);
            console.log("Deletando arquivo: ".concat(targetPath));
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "storage_delete",
                resource_type: "storage_file",
                resource_id: remotePath,
                details: {
                  provider: this.config.provider,
                  path: remotePath,
                },
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/, true];
          case 2:
            error_3 = _a.sent();
            console.error("Erro ao deletar arquivo: ".concat(error_3));
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  LocalStorageProvider.prototype.list = function (remotePath) {
    return __awaiter(this, void 0, void 0, function () {
      var targetPath, files;
      return __generator(this, function (_a) {
        try {
          targetPath = "".concat(this.basePath, "/").concat(remotePath);
          console.log("Listando arquivos em: ".concat(targetPath));
          files = [
            {
              id: this.generateLocationId(),
              provider: this.config.provider,
              path: "".concat(remotePath, "/backup1.sql"),
              size_bytes: 1024 * 1024,
              checksum: "mock_checksum_1",
              encrypted: this.config.encryption_enabled,
              compressed: this.config.compression_enabled,
              created_at: new Date(),
              metadata: {},
            },
          ];
          return [2 /*return*/, files];
        } catch (error) {
          console.error("Erro ao listar arquivos: ".concat(error));
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  LocalStorageProvider.prototype.exists = function (remotePath) {
    return __awaiter(this, void 0, void 0, function () {
      var targetPath;
      return __generator(this, function (_a) {
        try {
          targetPath = "".concat(this.basePath, "/").concat(remotePath);
          console.log("Verificando exist\u00EAncia: ".concat(targetPath));
          return [2 /*return*/, true]; // Simulado
        } catch (error) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  LocalStorageProvider.prototype.getMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            provider: this.config.provider,
            total_storage_gb: this.config.max_storage_gb,
            used_storage_gb: Math.random() * this.config.max_storage_gb,
            available_storage_gb: this.config.max_storage_gb * 0.7,
            total_files: Math.floor(Math.random() * 1000),
            upload_success_rate: 95 + Math.random() * 5,
            download_success_rate: 98 + Math.random() * 2,
            average_upload_speed_mbps: 50 + Math.random() * 50,
            average_download_speed_mbps: 80 + Math.random() * 40,
            total_cost: Math.random() * 100,
            monthly_cost: Math.random() * 20,
            bandwidth_usage_gb: Math.random() * 500,
            error_rate: Math.random() * 5,
            last_health_check: new Date(),
            health_status: "healthy",
          },
        ];
      });
    });
  };
  LocalStorageProvider.prototype.testConnection = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          console.log("Testando conex\u00E3o com armazenamento local: ".concat(this.basePath));
          return [2 /*return*/, true];
        } catch (error) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  LocalStorageProvider.prototype.cleanup = function (olderThanDays) {
    return __awaiter(this, void 0, void 0, function () {
      var cutoffDate, deletedCount, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            console.log("Limpando arquivos anteriores a: ".concat(cutoffDate));
            deletedCount = Math.floor(Math.random() * 10);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "storage_cleanup",
                resource_type: "storage_provider",
                resource_id: this.config.name,
                details: {
                  provider: this.config.provider,
                  older_than_days: olderThanDays,
                  deleted_count: deletedCount,
                },
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/, deletedCount];
          case 2:
            error_4 = _a.sent();
            console.error("Erro na limpeza: ".concat(error_4));
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  LocalStorageProvider.prototype.generateLocationId = function () {
    return "loc_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  };
  return LocalStorageProvider;
})(StorageProvider);
exports.LocalStorageProvider = LocalStorageProvider;
// Implementação para Amazon S3
var S3StorageProvider = /** @class */ (function (_super) {
  __extends(S3StorageProvider, _super);
  function S3StorageProvider(config) {
    var _this = _super.call(this, config) || this;
    _this.bucket = config.connection_config.bucket;
    return _this;
    // Inicializar cliente S3
  }
  S3StorageProvider.prototype.connect = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Conectando ao S3: ".concat(this.bucket));
        return [2 /*return*/];
      });
    });
  };
  S3StorageProvider.prototype.disconnect = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Desconectando do S3");
        return [2 /*return*/];
      });
    });
  };
  S3StorageProvider.prototype.upload = function (localPath, remotePath, options) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        processedPath,
        fileSize,
        checksum,
        duration,
        transferRate,
        location_2,
        error_5,
        duration;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 8, , 9]);
            processedPath = localPath;
            if (!this.config.compression_enabled) return [3 /*break*/, 3];
            return [4 /*yield*/, this.processFile(processedPath, "compress")];
          case 2:
            processedPath = _a.sent();
            _a.label = 3;
          case 3:
            if (!this.config.encryption_enabled) return [3 /*break*/, 5];
            return [4 /*yield*/, this.processFile(processedPath, "encrypt")];
          case 4:
            processedPath = _a.sent();
            _a.label = 5;
          case 5:
            return [4 /*yield*/, this.getFileSize(processedPath)];
          case 6:
            fileSize = _a.sent();
            return [4 /*yield*/, this.calculateChecksum(processedPath)];
          case 7:
            checksum = _a.sent();
            // Simular upload para S3
            console.log(
              "Uploading "
                .concat(processedPath, " to S3: ")
                .concat(this.bucket, "/")
                .concat(remotePath),
            );
            duration = Date.now() - startTime;
            transferRate = fileSize / 1024 / 1024 / (duration / 1000);
            location_2 = {
              id: this.generateLocationId(),
              provider: this.config.provider,
              path: remotePath,
              size_bytes: fileSize,
              checksum: checksum,
              encrypted: this.config.encryption_enabled,
              compressed: this.config.compression_enabled,
              created_at: new Date(),
              expires_at:
                this.config.retention_days > 0
                  ? new Date(Date.now() + this.config.retention_days * 24 * 60 * 60 * 1000)
                  : undefined,
              metadata: __assign(
                {
                  bucket: this.bucket,
                  storage_class:
                    (options === null || options === void 0 ? void 0 : options.storage_class) ||
                    "STANDARD",
                },
                options === null || options === void 0 ? void 0 : options.metadata,
              ),
            };
            return [
              2 /*return*/,
              {
                success: true,
                location: location_2,
                duration_ms: duration,
                bytes_transferred: fileSize,
                transfer_rate_mbps: transferRate,
              },
            ];
          case 8:
            error_5 = _a.sent();
            duration = Date.now() - startTime;
            return [
              2 /*return*/,
              {
                success: false,
                error: error_5.toString(),
                duration_ms: duration,
                bytes_transferred: 0,
                transfer_rate_mbps: 0,
              },
            ];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  S3StorageProvider.prototype.download = function (remotePath, localPath, options) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, fileSize, processedPath, duration, transferRate, error_6, duration;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            console.log(
              "Downloading from S3: "
                .concat(this.bucket, "/")
                .concat(remotePath, " to ")
                .concat(localPath),
            );
            fileSize = 1024 * 1024;
            processedPath = localPath;
            if (!this.config.encryption_enabled) return [3 /*break*/, 3];
            return [4 /*yield*/, this.processFile(processedPath, "decrypt")];
          case 2:
            processedPath = _a.sent();
            _a.label = 3;
          case 3:
            if (!this.config.compression_enabled) return [3 /*break*/, 5];
            return [4 /*yield*/, this.processFile(processedPath, "decompress")];
          case 4:
            processedPath = _a.sent();
            _a.label = 5;
          case 5:
            duration = Date.now() - startTime;
            transferRate = fileSize / 1024 / 1024 / (duration / 1000);
            return [
              2 /*return*/,
              {
                success: true,
                duration_ms: duration,
                bytes_transferred: fileSize,
                transfer_rate_mbps: transferRate,
              },
            ];
          case 6:
            error_6 = _a.sent();
            duration = Date.now() - startTime;
            return [
              2 /*return*/,
              {
                success: false,
                error: error_6.toString(),
                duration_ms: duration,
                bytes_transferred: 0,
                transfer_rate_mbps: 0,
              },
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  S3StorageProvider.prototype.delete = function (remotePath) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          console.log("Deletando do S3: ".concat(this.bucket, "/").concat(remotePath));
          return [2 /*return*/, true];
        } catch (error) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  S3StorageProvider.prototype.list = function (remotePath) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          console.log("Listando objetos S3 em: ".concat(this.bucket, "/").concat(remotePath));
          return [2 /*return*/, []];
        } catch (error) {
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  S3StorageProvider.prototype.exists = function (remotePath) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          console.log(
            "Verificando exist\u00EAncia no S3: ".concat(this.bucket, "/").concat(remotePath),
          );
          return [2 /*return*/, true];
        } catch (error) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  S3StorageProvider.prototype.getMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            provider: this.config.provider,
            total_storage_gb: this.config.max_storage_gb,
            used_storage_gb: Math.random() * this.config.max_storage_gb,
            available_storage_gb: this.config.max_storage_gb * 0.8,
            total_files: Math.floor(Math.random() * 5000),
            upload_success_rate: 98 + Math.random() * 2,
            download_success_rate: 99 + Math.random() * 1,
            average_upload_speed_mbps: 100 + Math.random() * 100,
            average_download_speed_mbps: 150 + Math.random() * 100,
            total_cost: Math.random() * 500,
            monthly_cost: Math.random() * 50,
            bandwidth_usage_gb: Math.random() * 1000,
            error_rate: Math.random() * 2,
            last_health_check: new Date(),
            health_status: "healthy",
          },
        ];
      });
    });
  };
  S3StorageProvider.prototype.testConnection = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          console.log("Testando conex\u00E3o S3: ".concat(this.bucket));
          return [2 /*return*/, true];
        } catch (error) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  S3StorageProvider.prototype.cleanup = function (olderThanDays) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          console.log("Limpando objetos S3 anteriores a ".concat(olderThanDays, " dias"));
          return [2 /*return*/, Math.floor(Math.random() * 50)];
        } catch (error) {
          return [2 /*return*/, 0];
        }
        return [2 /*return*/];
      });
    });
  };
  S3StorageProvider.prototype.generateLocationId = function () {
    return "s3_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  };
  return S3StorageProvider;
})(StorageProvider);
exports.S3StorageProvider = S3StorageProvider;
// Gerenciador de provedores de armazenamento
var StorageManager = /** @class */ (function () {
  function StorageManager() {
    this.providers = new Map();
    this.activeOperations = new Map();
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.auditLogger = new audit_logger_1.AuditLogger();
  }
  /**
   * Registra um provedor de armazenamento
   */
  StorageManager.prototype.registerProvider = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var provider, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            provider = void 0;
            switch (config.provider) {
              case "local":
                provider = new LocalStorageProvider(config);
                break;
              case "s3":
                provider = new S3StorageProvider(config);
                break;
              default:
                throw new Error("Provedor n\u00E3o suportado: ".concat(config.provider));
            }
            return [4 /*yield*/, provider.connect()];
          case 1:
            _a.sent();
            this.providers.set(config.name, provider);
            // Salvar configuração
            return [4 /*yield*/, this.saveStorageConfig(config)];
          case 2:
            // Salvar configuração
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "storage_provider_registered",
                resource_type: "storage_provider",
                resource_id: config.name,
                details: {
                  provider: config.provider,
                  enabled: config.enabled,
                },
              }),
            ];
          case 3:
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            throw new Error("Erro ao registrar provedor: ".concat(error_7));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Remove um provedor de armazenamento
   */
  StorageManager.prototype.unregisterProvider = function (name) {
    return __awaiter(this, void 0, void 0, function () {
      var provider, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            provider = this.providers.get(name);
            if (!provider) return [3 /*break*/, 2];
            return [4 /*yield*/, provider.disconnect()];
          case 1:
            _a.sent();
            this.providers.delete(name);
            _a.label = 2;
          case 2:
            // Remover configuração
            return [4 /*yield*/, this.deleteStorageConfig(name)];
          case 3:
            // Remover configuração
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "storage_provider_unregistered",
                resource_type: "storage_provider",
                resource_id: name,
              }),
            ];
          case 4:
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_8 = _a.sent();
            throw new Error("Erro ao remover provedor: ".concat(error_8));
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Faz upload de um arquivo
   */
  StorageManager.prototype.uploadFile = function (localPath, remotePath, providerName, options) {
    return __awaiter(this, void 0, void 0, function () {
      var provider, operationId, operation, result, error_9;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            provider = providerName
              ? this.providers.get(providerName)
              : this.selectBestProvider("upload");
            if (!provider) {
              throw new Error("Nenhum provedor disponível");
            }
            operationId = this.generateOperationId();
            _a = {
              id: operationId,
              type: "upload",
              provider: providerName || "auto",
              source_path: localPath,
              target_path: remotePath,
              status: "running",
              started_at: new Date(),
              progress_percentage: 0,
            };
            return [4 /*yield*/, provider["getFileSize"](localPath)];
          case 1:
            operation =
              ((_a.bytes_total = _b.sent()),
              (_a.bytes_transferred = 0),
              (_a.transfer_rate_mbps = 0),
              (_a.retry_count = 0),
              (_a.max_retries = 3),
              (_a.metadata =
                (options === null || options === void 0 ? void 0 : options.metadata) || {}),
              _a);
            this.activeOperations.set(operationId, operation);
            return [4 /*yield*/, provider.upload(localPath, remotePath, options)];
          case 2:
            result = _b.sent();
            operation.status = result.success ? "completed" : "failed";
            operation.completed_at = new Date();
            operation.progress_percentage = 100;
            operation.bytes_transferred = result.bytes_transferred;
            operation.transfer_rate_mbps = result.transfer_rate_mbps;
            operation.error_message = result.error;
            return [4 /*yield*/, this.saveStorageOperation(operation)];
          case 3:
            _b.sent();
            this.activeOperations.delete(operationId);
            return [2 /*return*/, result];
          case 4:
            error_9 = _b.sent();
            throw new Error("Erro no upload: ".concat(error_9));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Faz download de um arquivo
   */
  StorageManager.prototype.downloadFile = function (remotePath, localPath, providerName, options) {
    return __awaiter(this, void 0, void 0, function () {
      var provider, operationId, operation, result, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            provider = providerName
              ? this.providers.get(providerName)
              : this.selectBestProvider("download");
            if (!provider) {
              throw new Error("Nenhum provedor disponível");
            }
            operationId = this.generateOperationId();
            operation = {
              id: operationId,
              type: "download",
              provider: providerName || "auto",
              source_path: remotePath,
              target_path: localPath,
              status: "running",
              started_at: new Date(),
              progress_percentage: 0,
              bytes_total: 0, // Será atualizado durante o download
              bytes_transferred: 0,
              transfer_rate_mbps: 0,
              retry_count: 0,
              max_retries: 3,
              metadata: (options === null || options === void 0 ? void 0 : options.metadata) || {},
            };
            this.activeOperations.set(operationId, operation);
            return [4 /*yield*/, provider.download(remotePath, localPath, options)];
          case 1:
            result = _a.sent();
            operation.status = result.success ? "completed" : "failed";
            operation.completed_at = new Date();
            operation.progress_percentage = 100;
            operation.bytes_transferred = result.bytes_transferred;
            operation.transfer_rate_mbps = result.transfer_rate_mbps;
            operation.error_message = result.error;
            return [4 /*yield*/, this.saveStorageOperation(operation)];
          case 2:
            _a.sent();
            this.activeOperations.delete(operationId);
            return [2 /*return*/, result];
          case 3:
            error_10 = _a.sent();
            throw new Error("Erro no download: ".concat(error_10));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Lista arquivos em um provedor
   */
  StorageManager.prototype.listFiles = function (remotePath, providerName) {
    return __awaiter(this, void 0, void 0, function () {
      var provider, error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            provider = providerName
              ? this.providers.get(providerName)
              : this.selectBestProvider("list");
            if (!provider) {
              throw new Error("Nenhum provedor disponível");
            }
            return [4 /*yield*/, provider.list(remotePath)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_11 = _a.sent();
            throw new Error("Erro ao listar arquivos: ".concat(error_11));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Deleta um arquivo
   */
  StorageManager.prototype.deleteFile = function (remotePath, providerName) {
    return __awaiter(this, void 0, void 0, function () {
      var provider, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            provider = providerName
              ? this.providers.get(providerName)
              : this.selectBestProvider("delete");
            if (!provider) {
              throw new Error("Nenhum provedor disponível");
            }
            return [4 /*yield*/, provider.delete(remotePath)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_12 = _a.sent();
            throw new Error("Erro ao deletar arquivo: ".concat(error_12));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas de todos os provedores
   */
  StorageManager.prototype.getAllMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, _i, _a, _b, name_1, provider, providerMetrics, error_13;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            metrics = [];
            (_i = 0), (_a = this.providers);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            (_b = _a[_i]), (name_1 = _b[0]), (provider = _b[1]);
            _c.label = 2;
          case 2:
            _c.trys.push([2, 4, , 5]);
            return [4 /*yield*/, provider.getMetrics()];
          case 3:
            providerMetrics = _c.sent();
            metrics.push(providerMetrics);
            return [3 /*break*/, 5];
          case 4:
            error_13 = _c.sent();
            console.error("Erro ao obter m\u00E9tricas do provedor ".concat(name_1, ":"), error_13);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, metrics];
        }
      });
    });
  };
  /**
   * Testa conectividade de todos os provedores
   */
  StorageManager.prototype.testAllConnections = function () {
    return __awaiter(this, void 0, void 0, function () {
      var results, _i, _a, _b, name_2, provider, _c, _d, error_14;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            results = {};
            (_i = 0), (_a = this.providers);
            _e.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            (_b = _a[_i]), (name_2 = _b[0]), (provider = _b[1]);
            _e.label = 2;
          case 2:
            _e.trys.push([2, 4, , 5]);
            _c = results;
            _d = name_2;
            return [4 /*yield*/, provider.testConnection()];
          case 3:
            _c[_d] = _e.sent();
            return [3 /*break*/, 5];
          case 4:
            error_14 = _e.sent();
            results[name_2] = false;
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Executa limpeza em todos os provedores
   */
  StorageManager.prototype.cleanupAll = function (olderThanDays) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _i, _a, _b, name_3, provider, _c, _d, error_15;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            results = {};
            (_i = 0), (_a = this.providers);
            _e.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            (_b = _a[_i]), (name_3 = _b[0]), (provider = _b[1]);
            _e.label = 2;
          case 2:
            _e.trys.push([2, 4, , 5]);
            _c = results;
            _d = name_3;
            return [4 /*yield*/, provider.cleanup(olderThanDays)];
          case 3:
            _c[_d] = _e.sent();
            return [3 /*break*/, 5];
          case 4:
            error_15 = _e.sent();
            results[name_3] = 0;
            console.error("Erro na limpeza do provedor ".concat(name_3, ":"), error_15);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Lista operações de armazenamento
   */
  StorageManager.prototype.listOperations = function (filters, pagination) {
    return __awaiter(this, void 0, void 0, function () {
      var query, offset, _a, data, error, count, operations, error_16;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("storage_operations")
              .select("*", { count: "exact" })
              .order("started_at", { ascending: false });
            if (filters === null || filters === void 0 ? void 0 : filters.type) {
              query = query.in("type", filters.type);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.provider) {
              query = query.eq("provider", filters.provider);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.in("status", filters.status);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.date_from) {
              query = query.gte("started_at", filters.date_from.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.date_to) {
              query = query.lte("started_at", filters.date_to.toISOString());
            }
            if (pagination) {
              offset = (pagination.page - 1) * pagination.limit;
              query = query.range(offset, offset + pagination.limit - 1);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            operations = data.map(this.mapDatabaseToStorageOperation);
            return [
              2 /*return*/,
              {
                operations: operations,
                total: count || 0,
                page:
                  (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1,
                limit:
                  (pagination === null || pagination === void 0 ? void 0 : pagination.limit) ||
                  operations.length,
              },
            ];
          case 2:
            error_16 = _b.sent();
            throw new Error("Erro ao listar opera\u00E7\u00F5es: ".concat(error_16));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos privados
  StorageManager.prototype.selectBestProvider = function (operation) {
    // Implementar lógica de seleção do melhor provedor
    // baseado em prioridade, disponibilidade, performance, etc.
    var availableProviders = Array.from(this.providers.values()).filter(function (provider) {
      return provider["config"].enabled;
    });
    if (availableProviders.length === 0) {
      return null;
    }
    // Por enquanto, retorna o primeiro disponível
    // TODO: Implementar lógica mais sofisticada
    return availableProviders[0];
  };
  StorageManager.prototype.generateOperationId = function () {
    return "op_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  };
  // Métodos de persistência
  StorageManager.prototype.saveStorageConfig = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("storage_configs").upsert({
                name: config.name,
                provider: config.provider,
                enabled: config.enabled,
                priority: config.priority,
                connection_config: config.connection_config,
                encryption_enabled: config.encryption_enabled,
                compression_enabled: config.compression_enabled,
                retention_days: config.retention_days,
                max_storage_gb: config.max_storage_gb,
                cost_per_gb: config.cost_per_gb,
                bandwidth_limit_mbps: config.bandwidth_limit_mbps,
                metadata: config.metadata,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [2 /*return*/];
        }
      });
    });
  };
  StorageManager.prototype.deleteStorageConfig = function (name) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("storage_configs").delete().eq("name", name)];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [2 /*return*/];
        }
      });
    });
  };
  StorageManager.prototype.saveStorageOperation = function (operation) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("storage_operations").insert({
                id: operation.id,
                type: operation.type,
                provider: operation.provider,
                source_path: operation.source_path,
                target_path: operation.target_path,
                status: operation.status,
                started_at: operation.started_at.toISOString(),
                completed_at:
                  (_a = operation.completed_at) === null || _a === void 0
                    ? void 0
                    : _a.toISOString(),
                progress_percentage: operation.progress_percentage,
                bytes_total: operation.bytes_total,
                bytes_transferred: operation.bytes_transferred,
                transfer_rate_mbps: operation.transfer_rate_mbps,
                error_message: operation.error_message,
                retry_count: operation.retry_count,
                max_retries: operation.max_retries,
                metadata: operation.metadata,
              }),
            ];
          case 1:
            error = _b.sent().error;
            if (error) throw error;
            return [2 /*return*/];
        }
      });
    });
  };
  StorageManager.prototype.mapDatabaseToStorageOperation = function (data) {
    return {
      id: data.id,
      type: data.type,
      provider: data.provider,
      source_path: data.source_path,
      target_path: data.target_path,
      status: data.status,
      started_at: new Date(data.started_at),
      completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
      progress_percentage: data.progress_percentage || 0,
      bytes_total: data.bytes_total || 0,
      bytes_transferred: data.bytes_transferred || 0,
      transfer_rate_mbps: data.transfer_rate_mbps || 0,
      error_message: data.error_message,
      retry_count: data.retry_count || 0,
      max_retries: data.max_retries || 3,
      metadata: data.metadata || {},
    };
  };
  return StorageManager;
})();
exports.StorageManager = StorageManager;
exports.default = StorageManager;
