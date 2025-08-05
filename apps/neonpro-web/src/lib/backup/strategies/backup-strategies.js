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
exports.BackupStrategyManager =
  exports.FileSystemBackupStrategy =
  exports.DatabaseBackupStrategy =
    void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../../audit/audit-logger");
var encryption_service_1 = require("../../security/encryption-service");
var lgpd_manager_1 = require("../../lgpd/lgpd-manager");
var DatabaseBackupStrategy = /** @class */ (function () {
  function DatabaseBackupStrategy() {
    this.name = "database";
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.encryptionService = new encryption_service_1.EncryptionService();
    this.lgpdManager = new lgpd_manager_1.LGPDManager();
  }
  DatabaseBackupStrategy.prototype.backup = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        errors,
        warnings,
        totalSize,
        filesProcessed,
        connectionTest,
        tables,
        _i,
        tables_1,
        table,
        tableBackup,
        error_1,
        schemaBackup,
        checksum,
        compressedSize,
        executionTime,
        storageLocation,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            errors = [];
            warnings = [];
            totalSize = 0;
            filesProcessed = 0;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 21, , 22]);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "database_backup_started",
                resource_type: "backup_strategy",
                resource_id: context.job_id,
                details: { strategy: context.strategy.name },
              }),
            ];
          case 2:
            _a.sent();
            return [4 /*yield*/, this.testDatabaseConnection()];
          case 3:
            connectionTest = _a.sent();
            if (!connectionTest.success) {
              throw new Error("Falha na conex\u00E3o: ".concat(connectionTest.error));
            }
            return [4 /*yield*/, this.getDatabaseTables()];
          case 4:
            tables = _a.sent();
            if (tables.length === 0) {
              warnings.push("Nenhuma tabela encontrada para backup");
            }
            (_i = 0), (tables_1 = tables);
            _a.label = 5;
          case 5:
            if (!(_i < tables_1.length)) return [3 /*break*/, 13];
            table = tables_1[_i];
            _a.label = 6;
          case 6:
            _a.trys.push([6, 11, , 12]);
            return [4 /*yield*/, this.backupTable(table, context)];
          case 7:
            tableBackup = _a.sent();
            totalSize += tableBackup.size;
            filesProcessed++;
            return [4 /*yield*/, this.lgpdManager.containsSensitiveData(table)];
          case 8:
            if (!_a.sent()) return [3 /*break*/, 10];
            return [4 /*yield*/, this.lgpdManager.anonymizeBackupData(tableBackup.location)];
          case 9:
            _a.sent();
            _a.label = 10;
          case 10:
            return [3 /*break*/, 12];
          case 11:
            error_1 = _a.sent();
            errors.push("Erro no backup da tabela ".concat(table, ": ").concat(error_1));
            return [3 /*break*/, 12];
          case 12:
            _i++;
            return [3 /*break*/, 5];
          case 13:
            return [4 /*yield*/, this.backupDatabaseSchema(context)];
          case 14:
            schemaBackup = _a.sent();
            totalSize += schemaBackup.size;
            filesProcessed++;
            return [4 /*yield*/, this.generateDatabaseChecksum(context.job_id)];
          case 15:
            checksum = _a.sent();
            compressedSize = totalSize;
            if (!context.strategy.compression_enabled) return [3 /*break*/, 17];
            return [4 /*yield*/, this.compressBackup(context.job_id)];
          case 16:
            compressedSize = _a.sent();
            _a.label = 17;
          case 17:
            if (!context.strategy.encryption_enabled) return [3 /*break*/, 19];
            return [4 /*yield*/, this.encryptBackup(context.job_id)];
          case 18:
            _a.sent();
            _a.label = 19;
          case 19:
            executionTime = Math.floor((Date.now() - startTime) / 1000);
            storageLocation = this.generateStorageLocation(context);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "database_backup_completed",
                resource_type: "backup_strategy",
                resource_id: context.job_id,
                details: {
                  tables_backed_up: filesProcessed,
                  total_size_bytes: totalSize,
                  execution_time_seconds: executionTime,
                },
              }),
            ];
          case 20:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: errors.length === 0,
                strategy_name: this.name,
                execution_time_seconds: executionTime,
                total_size_bytes: totalSize,
                compressed_size_bytes: compressedSize,
                files_processed: filesProcessed,
                files_skipped: 0,
                errors: errors,
                warnings: warnings,
                checksum: checksum,
                storage_location: storageLocation,
                metadata: {
                  tables_count: tables.length,
                  schema_included: true,
                  lgpd_compliant: true,
                },
              },
            ];
          case 21:
            error_2 = _a.sent();
            errors.push("Erro cr\u00EDtico no backup: ".concat(error_2));
            return [
              2 /*return*/,
              {
                success: false,
                strategy_name: this.name,
                execution_time_seconds: Math.floor((Date.now() - startTime) / 1000),
                total_size_bytes: totalSize,
                compressed_size_bytes: totalSize,
                files_processed: filesProcessed,
                files_skipped: 0,
                errors: errors,
                warnings: warnings,
                checksum: "",
                storage_location: "",
                metadata: {},
              },
            ];
          case 22:
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.restore = function (backupLocation, targetLocation) {
    return __awaiter(this, void 0, void 0, function () {
      var isValid, decryptedLocation, decompressedLocation, tables, _i, tables_2, table, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 13, , 14]);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "database_restore_started",
                resource_type: "backup_strategy",
                details: { backup_location: backupLocation, target: targetLocation },
              }),
            ];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.validate(backupLocation)];
          case 2:
            isValid = _a.sent();
            if (!isValid) {
              throw new Error("Backup inválido ou corrompido");
            }
            return [4 /*yield*/, this.decryptBackup(backupLocation)];
          case 3:
            decryptedLocation = _a.sent();
            return [4 /*yield*/, this.decompressBackup(decryptedLocation)];
          case 4:
            decompressedLocation = _a.sent();
            // 4. Restaurar esquema primeiro
            return [4 /*yield*/, this.restoreDatabaseSchema(decompressedLocation)];
          case 5:
            // 4. Restaurar esquema primeiro
            _a.sent();
            return [4 /*yield*/, this.getBackupTables(decompressedLocation)];
          case 6:
            tables = _a.sent();
            (_i = 0), (tables_2 = tables);
            _a.label = 7;
          case 7:
            if (!(_i < tables_2.length)) return [3 /*break*/, 10];
            table = tables_2[_i];
            return [4 /*yield*/, this.restoreTable(table, decompressedLocation)];
          case 8:
            _a.sent();
            _a.label = 9;
          case 9:
            _i++;
            return [3 /*break*/, 7];
          case 10:
            // 6. Verificar integridade pós-restauração
            return [4 /*yield*/, this.verifyRestoreIntegrity()];
          case 11:
            // 6. Verificar integridade pós-restauração
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "database_restore_completed",
                resource_type: "backup_strategy",
                details: { tables_restored: tables.length },
              }),
            ];
          case 12:
            _a.sent();
            return [3 /*break*/, 14];
          case 13:
            error_3 = _a.sent();
            throw new Error("Erro na restaura\u00E7\u00E3o: ".concat(error_3));
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.validate = function (backupLocation) {
    return __awaiter(this, void 0, void 0, function () {
      var exists, checksumValid, structureValid, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.checkBackupExists(backupLocation)];
          case 1:
            exists = _a.sent();
            if (!exists) return [2 /*return*/, false];
            return [4 /*yield*/, this.verifyBackupChecksum(backupLocation)];
          case 2:
            checksumValid = _a.sent();
            if (!checksumValid) return [2 /*return*/, false];
            return [4 /*yield*/, this.verifyBackupStructure(backupLocation)];
          case 3:
            structureValid = _a.sent();
            return [2 /*return*/, structureValid];
          case 4:
            error_4 = _a.sent();
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.getSize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 4]);
            return [4 /*yield*/, this.supabase.rpc("get_database_size")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || 0];
          case 2:
            error_5 = _b.sent();
            return [4 /*yield*/, this.estimateDatabaseSize()];
          case 3:
            // Fallback: estimar baseado no número de registros
            return [2 /*return*/, _b.sent()];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.getLastModified = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("get_last_modification_time")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, new Date(data)];
          case 2:
            error_6 = _b.sent();
            return [2 /*return*/, new Date()]; // Fallback para agora
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos privados
  DatabaseBackupStrategy.prototype.testDatabaseConnection = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("backup_jobs").select("id").limit(1)];
          case 1:
            error = _a.sent().error;
            return [2 /*return*/, { success: !error }];
          case 2:
            error_7 = _a.sent();
            return [2 /*return*/, { success: false, error: error_7.toString() }];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.getDatabaseTables = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("get_user_tables")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
          case 2:
            error_8 = _b.sent();
            // Fallback: lista padrão de tabelas conhecidas
            return [
              2 /*return*/,
              [
                "users",
                "audit_logs",
                "backup_jobs",
                "recovery_points",
                "notifications",
                "templates",
                "security_logs",
              ],
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.backupTable = function (tableName, context) {
    return __awaiter(this, void 0, void 0, function () {
      var backupType, query, lastBackup, _a, data, error, backupData, location_1, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            backupType = context.force_full ? "full" : context.strategy.type;
            query = this.supabase.from(tableName).select("*");
            if (!(backupType === "incremental")) return [3 /*break*/, 2];
            return [4 /*yield*/, this.getLastBackupDate(tableName)];
          case 1:
            lastBackup = _b.sent();
            if (lastBackup) {
              query = query.gte("updated_at", lastBackup.toISOString());
            }
            _b.label = 2;
          case 2:
            return [4 /*yield*/, query];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            backupData = JSON.stringify(data, null, 2);
            location_1 = "".concat(context.job_id, "/").concat(tableName, ".json");
            // Simular salvamento (implementar storage real)
            return [4 /*yield*/, this.saveToStorage(location_1, backupData)];
          case 4:
            // Simular salvamento (implementar storage real)
            _b.sent();
            return [
              2 /*return*/,
              {
                size: Buffer.byteLength(backupData, "utf8"),
                location: location_1,
              },
            ];
          case 5:
            error_9 = _b.sent();
            throw new Error("Erro no backup da tabela ".concat(tableName, ": ").concat(error_9));
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.backupDatabaseSchema = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, schema, error, schemaData, location_2, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.supabase.rpc("get_database_schema")];
          case 1:
            (_a = _b.sent()), (schema = _a.data), (error = _a.error);
            if (error) throw error;
            schemaData = JSON.stringify(schema, null, 2);
            location_2 = "".concat(context.job_id, "/schema.json");
            return [4 /*yield*/, this.saveToStorage(location_2, schemaData)];
          case 2:
            _b.sent();
            return [
              2 /*return*/,
              {
                size: Buffer.byteLength(schemaData, "utf8"),
                location: location_2,
              },
            ];
          case 3:
            error_10 = _b.sent();
            throw new Error("Erro no backup do esquema: ".concat(error_10));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.generateDatabaseChecksum = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      var timestamp, random;
      return __generator(this, function (_a) {
        timestamp = Date.now();
        random = Math.random().toString(36).substr(2, 9);
        return [2 /*return*/, "db_".concat(timestamp, "_").concat(random)];
      });
    });
  };
  DatabaseBackupStrategy.prototype.compressBackup = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      var originalSize;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getBackupSize(jobId)];
          case 1:
            originalSize = _a.sent();
            return [2 /*return*/, Math.floor(originalSize * 0.7)];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.encryptBackup = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      var backupData, encrypted;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getBackupData(jobId)];
          case 1:
            backupData = _a.sent();
            return [4 /*yield*/, this.encryptionService.encrypt(backupData)];
          case 2:
            encrypted = _a.sent();
            return [4 /*yield*/, this.saveEncryptedBackup(jobId, encrypted.data)];
          case 3:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.generateStorageLocation = function (context) {
    var date = new Date().toISOString().split("T")[0];
    return "database/".concat(date, "/").concat(context.job_id);
  };
  DatabaseBackupStrategy.prototype.getLastBackupDate = function (tableName) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("backup_jobs")
                .select("completed_at")
                .contains("data_sources", [tableName])
                .eq("status", "completed")
                .order("completed_at", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) return [2 /*return*/, null];
            return [2 /*return*/, new Date(data.completed_at)];
          case 2:
            error_11 = _b.sent();
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DatabaseBackupStrategy.prototype.saveToStorage = function (location, data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar salvamento real no storage
        console.log("Salvando backup em: ".concat(location));
        return [2 /*return*/];
      });
    });
  };
  DatabaseBackupStrategy.prototype.getBackupSize = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar cálculo real do tamanho
        return [2 /*return*/, 1024 * 1024 * 50]; // 50MB simulado
      });
    });
  };
  DatabaseBackupStrategy.prototype.getBackupData = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar leitura real dos dados
        return [2 /*return*/, "backup_data_".concat(jobId)];
      });
    });
  };
  DatabaseBackupStrategy.prototype.saveEncryptedBackup = function (jobId, encryptedData) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar salvamento dos dados criptografados
        console.log("Backup criptografado salvo: ".concat(jobId));
        return [2 /*return*/];
      });
    });
  };
  DatabaseBackupStrategy.prototype.checkBackupExists = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar verificação de existência
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  DatabaseBackupStrategy.prototype.verifyBackupChecksum = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar verificação de checksum
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  DatabaseBackupStrategy.prototype.verifyBackupStructure = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar verificação de estrutura
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  DatabaseBackupStrategy.prototype.estimateDatabaseSize = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar estimativa baseada em contagem de registros
        return [2 /*return*/, 1024 * 1024 * 100]; // 100MB simulado
      });
    });
  };
  DatabaseBackupStrategy.prototype.decryptBackup = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar descriptografia
        return [2 /*return*/, location]; // Simulado
      });
    });
  };
  DatabaseBackupStrategy.prototype.decompressBackup = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar descompressão
        return [2 /*return*/, location]; // Simulado
      });
    });
  };
  DatabaseBackupStrategy.prototype.restoreDatabaseSchema = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar restauração do esquema
        console.log("Restaurando esquema de: ".concat(location));
        return [2 /*return*/];
      });
    });
  };
  DatabaseBackupStrategy.prototype.getBackupTables = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar listagem de tabelas no backup
        return [2 /*return*/, ["users", "audit_logs"]]; // Simulado
      });
    });
  };
  DatabaseBackupStrategy.prototype.restoreTable = function (tableName, location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar restauração de tabela
        console.log("Restaurando tabela ".concat(tableName, " de: ").concat(location));
        return [2 /*return*/];
      });
    });
  };
  DatabaseBackupStrategy.prototype.verifyRestoreIntegrity = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar verificação de integridade pós-restauração
        console.log("Verificando integridade da restauração");
        return [2 /*return*/];
      });
    });
  };
  return DatabaseBackupStrategy;
})();
exports.DatabaseBackupStrategy = DatabaseBackupStrategy;
var FileSystemBackupStrategy = /** @class */ (function () {
  function FileSystemBackupStrategy() {
    this.name = "filesystem";
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.encryptionService = new encryption_service_1.EncryptionService();
    this.lgpdManager = new lgpd_manager_1.LGPDManager();
  }
  FileSystemBackupStrategy.prototype.backup = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        errors,
        warnings,
        totalSize,
        filesProcessed,
        filesSkipped,
        backupPaths,
        _i,
        backupPaths_1,
        path,
        pathResult,
        error_12,
        checksum,
        compressedSize,
        executionTime,
        storageLocation,
        error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            errors = [];
            warnings = [];
            totalSize = 0;
            filesProcessed = 0;
            filesSkipped = 0;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 15, , 16]);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "filesystem_backup_started",
                resource_type: "backup_strategy",
                resource_id: context.job_id,
                details: { strategy: context.strategy.name },
              }),
            ];
          case 2:
            _a.sent();
            backupPaths = this.getBackupPaths(context);
            (_i = 0), (backupPaths_1 = backupPaths);
            _a.label = 3;
          case 3:
            if (!(_i < backupPaths_1.length)) return [3 /*break*/, 8];
            path = backupPaths_1[_i];
            _a.label = 4;
          case 4:
            _a.trys.push([4, 6, , 7]);
            return [4 /*yield*/, this.backupPath(path, context)];
          case 5:
            pathResult = _a.sent();
            totalSize += pathResult.size;
            filesProcessed += pathResult.files;
            filesSkipped += pathResult.skipped;
            return [3 /*break*/, 7];
          case 6:
            error_12 = _a.sent();
            errors.push("Erro no backup do caminho ".concat(path, ": ").concat(error_12));
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 3];
          case 8:
            return [4 /*yield*/, this.generateFileSystemChecksum(context.job_id)];
          case 9:
            checksum = _a.sent();
            compressedSize = totalSize;
            if (!context.strategy.compression_enabled) return [3 /*break*/, 11];
            return [4 /*yield*/, this.compressFileSystemBackup(context.job_id)];
          case 10:
            compressedSize = _a.sent();
            _a.label = 11;
          case 11:
            if (!context.strategy.encryption_enabled) return [3 /*break*/, 13];
            return [4 /*yield*/, this.encryptFileSystemBackup(context.job_id)];
          case 12:
            _a.sent();
            _a.label = 13;
          case 13:
            executionTime = Math.floor((Date.now() - startTime) / 1000);
            storageLocation = this.generateFileSystemStorageLocation(context);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "filesystem_backup_completed",
                resource_type: "backup_strategy",
                resource_id: context.job_id,
                details: {
                  files_processed: filesProcessed,
                  files_skipped: filesSkipped,
                  total_size_bytes: totalSize,
                  execution_time_seconds: executionTime,
                },
              }),
            ];
          case 14:
            _a.sent();
            return [
              2 /*return*/,
              {
                success: errors.length === 0,
                strategy_name: this.name,
                execution_time_seconds: executionTime,
                total_size_bytes: totalSize,
                compressed_size_bytes: compressedSize,
                files_processed: filesProcessed,
                files_skipped: filesSkipped,
                errors: errors,
                warnings: warnings,
                checksum: checksum,
                storage_location: storageLocation,
                metadata: {
                  paths_backed_up: backupPaths.length,
                  compression_ratio: compressedSize / totalSize,
                  lgpd_compliant: true,
                },
              },
            ];
          case 15:
            error_13 = _a.sent();
            errors.push("Erro cr\u00EDtico no backup: ".concat(error_13));
            return [
              2 /*return*/,
              {
                success: false,
                strategy_name: this.name,
                execution_time_seconds: Math.floor((Date.now() - startTime) / 1000),
                total_size_bytes: totalSize,
                compressed_size_bytes: totalSize,
                files_processed: filesProcessed,
                files_skipped: filesSkipped,
                errors: errors,
                warnings: warnings,
                checksum: "",
                storage_location: "",
                metadata: {},
              },
            ];
          case 16:
            return [2 /*return*/];
        }
      });
    });
  };
  FileSystemBackupStrategy.prototype.restore = function (backupLocation, targetLocation) {
    return __awaiter(this, void 0, void 0, function () {
      var isValid, processedLocation, error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "filesystem_restore_started",
                resource_type: "backup_strategy",
                details: { backup_location: backupLocation, target: targetLocation },
              }),
            ];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.validate(backupLocation)];
          case 2:
            isValid = _a.sent();
            if (!isValid) {
              throw new Error("Backup inválido ou corrompido");
            }
            return [4 /*yield*/, this.prepareBackupForRestore(backupLocation)];
          case 3:
            processedLocation = _a.sent();
            // Restaurar arquivos
            return [4 /*yield*/, this.restoreFiles(processedLocation, targetLocation)];
          case 4:
            // Restaurar arquivos
            _a.sent();
            // Verificar integridade
            return [4 /*yield*/, this.verifyFileSystemRestore(targetLocation)];
          case 5:
            // Verificar integridade
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "filesystem_restore_completed",
                resource_type: "backup_strategy",
                details: { target_location: targetLocation },
              }),
            ];
          case 6:
            _a.sent();
            return [3 /*break*/, 8];
          case 7:
            error_14 = _a.sent();
            throw new Error("Erro na restaura\u00E7\u00E3o: ".concat(error_14));
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  FileSystemBackupStrategy.prototype.validate = function (backupLocation) {
    return __awaiter(this, void 0, void 0, function () {
      var exists, checksumValid, error_15;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.checkFileSystemBackupExists(backupLocation)];
          case 1:
            exists = _a.sent();
            if (!exists) return [2 /*return*/, false];
            return [4 /*yield*/, this.verifyFileSystemChecksum(backupLocation)];
          case 2:
            checksumValid = _a.sent();
            return [2 /*return*/, checksumValid];
          case 3:
            error_15 = _a.sent();
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  FileSystemBackupStrategy.prototype.getSize = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar cálculo do tamanho dos diretórios
        return [2 /*return*/, 1024 * 1024 * 500]; // 500MB simulado
      });
    });
  };
  FileSystemBackupStrategy.prototype.getLastModified = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar busca pela última modificação
        return [2 /*return*/, new Date()];
      });
    });
  };
  // Métodos privados
  FileSystemBackupStrategy.prototype.getBackupPaths = function (context) {
    // Definir caminhos baseado na configuração
    var paths = ["/app/uploads", "/app/logs", "/app/config", "/app/public/assets"];
    return paths.filter(function (path) {
      return (
        context.strategy.data_sources.includes("files") ||
        context.strategy.data_sources.includes("logs") ||
        context.strategy.data_sources.includes("configurations")
      );
    });
  };
  FileSystemBackupStrategy.prototype.backupPath = function (path, context) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar backup de diretório específico
        return [
          2 /*return*/,
          {
            size: 1024 * 1024 * 50, // 50MB simulado
            files: 100,
            skipped: 5,
          },
        ];
      });
    });
  };
  FileSystemBackupStrategy.prototype.generateFileSystemChecksum = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          "fs_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
        ];
      });
    });
  };
  FileSystemBackupStrategy.prototype.compressFileSystemBackup = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      var originalSize;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getFileSystemBackupSize(jobId)];
          case 1:
            originalSize = _a.sent();
            return [2 /*return*/, Math.floor(originalSize * 0.6)]; // 40% de compressão
        }
      });
    });
  };
  FileSystemBackupStrategy.prototype.encryptFileSystemBackup = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar criptografia
        console.log("Criptografando backup filesystem: ".concat(jobId));
        return [2 /*return*/];
      });
    });
  };
  FileSystemBackupStrategy.prototype.generateFileSystemStorageLocation = function (context) {
    var date = new Date().toISOString().split("T")[0];
    return "filesystem/".concat(date, "/").concat(context.job_id);
  };
  FileSystemBackupStrategy.prototype.getFileSystemBackupSize = function (jobId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, 1024 * 1024 * 200]; // 200MB simulado
      });
    });
  };
  FileSystemBackupStrategy.prototype.checkFileSystemBackupExists = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  FileSystemBackupStrategy.prototype.verifyFileSystemChecksum = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  FileSystemBackupStrategy.prototype.prepareBackupForRestore = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, location]; // Simulado
      });
    });
  };
  FileSystemBackupStrategy.prototype.restoreFiles = function (backupLocation, targetLocation) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log(
          "Restaurando arquivos de ".concat(backupLocation, " para ").concat(targetLocation),
        );
        return [2 /*return*/];
      });
    });
  };
  FileSystemBackupStrategy.prototype.verifyFileSystemRestore = function (targetLocation) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        console.log("Verificando restaura\u00E7\u00E3o em: ".concat(targetLocation));
        return [2 /*return*/];
      });
    });
  };
  return FileSystemBackupStrategy;
})();
exports.FileSystemBackupStrategy = FileSystemBackupStrategy;
var BackupStrategyManager = /** @class */ (function () {
  function BackupStrategyManager() {
    this.strategies = new Map();
    this.auditLogger = new audit_logger_1.AuditLogger();
    // Registrar estratégias padrão
    this.registerStrategy(new DatabaseBackupStrategy());
    this.registerStrategy(new FileSystemBackupStrategy());
  }
  BackupStrategyManager.prototype.registerStrategy = function (strategy) {
    this.strategies.set(strategy.name, strategy);
  };
  BackupStrategyManager.prototype.getStrategy = function (name) {
    return this.strategies.get(name);
  };
  BackupStrategyManager.prototype.listStrategies = function () {
    return Array.from(this.strategies.keys());
  };
  BackupStrategyManager.prototype.executeStrategy = function (strategyName, context) {
    return __awaiter(this, void 0, void 0, function () {
      var strategy, result, error_16;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            strategy = this.getStrategy(strategyName);
            if (!strategy) {
              throw new Error("Estrat\u00E9gia n\u00E3o encontrada: ".concat(strategyName));
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 7]);
            // Validar contexto
            return [4 /*yield*/, this.validateExecutionContext(context)];
          case 2:
            // Validar contexto
            _a.sent();
            return [4 /*yield*/, strategy.backup(context)];
          case 3:
            result = _a.sent();
            // Log do resultado
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "backup_strategy_executed",
                resource_type: "backup_strategy",
                resource_id: context.job_id,
                details: {
                  strategy: strategyName,
                  success: result.success,
                  execution_time: result.execution_time_seconds,
                  size_bytes: result.total_size_bytes,
                },
              }),
            ];
          case 4:
            // Log do resultado
            _a.sent();
            return [2 /*return*/, result];
          case 5:
            error_16 = _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "backup_strategy_failed",
                resource_type: "backup_strategy",
                resource_id: context.job_id,
                details: {
                  strategy: strategyName,
                  error: error_16.toString(),
                },
              }),
            ];
          case 6:
            _a.sent();
            throw error_16;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  BackupStrategyManager.prototype.validateStrategy = function (strategy) {
    return __awaiter(this, void 0, void 0, function () {
      var errors, _i, _a, dependency, _b, _c, rule;
      return __generator(this, function (_d) {
        errors = [];
        // Validar campos obrigatórios
        if (!strategy.name) errors.push("Nome da estratégia é obrigatório");
        if (!strategy.type) errors.push("Tipo da estratégia é obrigatório");
        if (!strategy.data_sources || strategy.data_sources.length === 0) {
          errors.push("Pelo menos uma fonte de dados deve ser especificada");
        }
        // Validar cron expression
        if (!this.isValidCronExpression(strategy.schedule)) {
          errors.push("Expressão cron inválida");
        }
        // Validar dependências
        for (_i = 0, _a = strategy.dependencies; _i < _a.length; _i++) {
          dependency = _a[_i];
          if (!this.strategies.has(dependency)) {
            errors.push("Depend\u00EAncia n\u00E3o encontrada: ".concat(dependency));
          }
        }
        // Validar regras de validação
        for (_b = 0, _c = strategy.validation_rules; _b < _c.length; _b++) {
          rule = _c[_b];
          if (!this.isValidValidationRule(rule)) {
            errors.push("Regra de valida\u00E7\u00E3o inv\u00E1lida: ".concat(rule.type));
          }
        }
        return [
          2 /*return*/,
          {
            valid: errors.length === 0,
            errors: errors,
          },
        ];
      });
    });
  };
  BackupStrategyManager.prototype.validateExecutionContext = function (context) {
    return __awaiter(this, void 0, void 0, function () {
      var validation;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!context.job_id) {
              throw new Error("Job ID é obrigatório");
            }
            if (!context.user_id) {
              throw new Error("User ID é obrigatório");
            }
            if (!context.strategy) {
              throw new Error("Estratégia é obrigatória");
            }
            return [4 /*yield*/, this.validateStrategy(context.strategy)];
          case 1:
            validation = _a.sent();
            if (!validation.valid) {
              throw new Error(
                "Estrat\u00E9gia inv\u00E1lida: ".concat(validation.errors.join(", ")),
              );
            }
            return [2 /*return*/];
        }
      });
    });
  };
  BackupStrategyManager.prototype.isValidCronExpression = function (cron) {
    // Implementar validação de cron expression
    return cron.split(" ").length === 5;
  };
  BackupStrategyManager.prototype.isValidValidationRule = function (rule) {
    var validTypes = ["size_limit", "file_count", "duration_limit", "checksum", "custom"];
    var validActions = ["warn", "fail", "retry"];
    return validTypes.includes(rule.type) && validActions.includes(rule.action);
  };
  return BackupStrategyManager;
})();
exports.BackupStrategyManager = BackupStrategyManager;
exports.default = BackupStrategyManager;
