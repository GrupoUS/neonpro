"use strict";
/**
 * NeonPro Storage Provider
 * Story 1.8: Sistema de Backup e Recovery
 *
 * Gerenciador de provedores de armazenamento para backups,
 * suportando local, AWS S3, Google Cloud e Azure.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageProvider = exports.StorageProvider = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var types_1 = require("./types");
var audit_logger_1 = require("../auth/audit/audit-logger");
/**
 * Provider para armazenamento local
 */
var LocalStorageProvider = /** @class */ (function () {
    function LocalStorageProvider(config) {
        this.basePath = config.path || './backups';
        this.ensureDirectory();
    }
    LocalStorageProvider.prototype.ensureDirectory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs_1.promises.mkdir(this.basePath, { recursive: true })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Erro ao criar diretório de backup:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LocalStorageProvider.prototype.upload = function (localPath, remotePath, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var targetPath, targetDir, stats, totalSize, uploadedSize, readStream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        targetPath = path_1.default.join(this.basePath, remotePath);
                        targetDir = path_1.default.dirname(targetPath);
                        // Criar diretório se não existir
                        return [4 /*yield*/, fs_1.promises.mkdir(targetDir, { recursive: true })];
                    case 1:
                        // Criar diretório se não existir
                        _a.sent();
                        return [4 /*yield*/, fs_1.promises.stat(localPath)];
                    case 2:
                        stats = _a.sent();
                        totalSize = stats.size;
                        uploadedSize = 0;
                        return [4 /*yield*/, fs_1.promises.readFile(localPath)];
                    case 3:
                        readStream = _a.sent();
                        return [4 /*yield*/, fs_1.promises.writeFile(targetPath, readStream)];
                    case 4:
                        _a.sent();
                        if (onProgress) {
                            onProgress({
                                uploadId: crypto.randomUUID(),
                                fileName: path_1.default.basename(localPath),
                                totalSize: totalSize,
                                uploadedSize: totalSize,
                                percentage: 100,
                                speed: totalSize,
                                eta: 0,
                                status: 'COMPLETED'
                            });
                        }
                        return [2 /*return*/, targetPath];
                }
            });
        });
    };
    LocalStorageProvider.prototype.download = function (remotePath, localPath, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var sourcePath, stats, totalSize, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sourcePath = path_1.default.join(this.basePath, remotePath);
                        return [4 /*yield*/, this.exists(remotePath)];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("Arquivo n\u00E3o encontrado: ".concat(remotePath));
                        }
                        return [4 /*yield*/, fs_1.promises.stat(sourcePath)];
                    case 2:
                        stats = _a.sent();
                        totalSize = stats.size;
                        return [4 /*yield*/, fs_1.promises.readFile(sourcePath)];
                    case 3:
                        data = _a.sent();
                        return [4 /*yield*/, fs_1.promises.writeFile(localPath, data)];
                    case 4:
                        _a.sent();
                        if (onProgress) {
                            onProgress({
                                downloadId: crypto.randomUUID(),
                                fileName: path_1.default.basename(remotePath),
                                totalSize: totalSize,
                                downloadedSize: totalSize,
                                percentage: 100,
                                speed: totalSize,
                                eta: 0,
                                status: 'COMPLETED'
                            });
                        }
                        return [2 /*return*/, localPath];
                }
            });
        });
    };
    LocalStorageProvider.prototype.delete = function (remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            var targetPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        targetPath = path_1.default.join(this.basePath, remotePath);
                        return [4 /*yield*/, fs_1.promises.unlink(targetPath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LocalStorageProvider.prototype.exists = function (remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            var targetPath, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        targetPath = path_1.default.join(this.basePath, remotePath);
                        return [4 /*yield*/, fs_1.promises.access(targetPath)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LocalStorageProvider.prototype.list = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var searchPath, files, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        searchPath = prefix ? path_1.default.join(this.basePath, prefix) : this.basePath;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.readdir(searchPath, { recursive: true })];
                    case 2:
                        files = _b.sent();
                        return [2 /*return*/, files.filter(function (file) { return typeof file === 'string'; })];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LocalStorageProvider.prototype.getMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, totalSize, totalFiles, _i, files_1, file, filePath, stats, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.list()];
                    case 1:
                        files = _b.sent();
                        totalSize = 0;
                        totalFiles = 0;
                        _i = 0, files_1 = files;
                        _b.label = 2;
                    case 2:
                        if (!(_i < files_1.length)) return [3 /*break*/, 7];
                        file = files_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        filePath = path_1.default.join(this.basePath, file);
                        return [4 /*yield*/, fs_1.promises.stat(filePath)];
                    case 4:
                        stats = _b.sent();
                        if (stats.isFile()) {
                            totalSize += stats.size;
                            totalFiles++;
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        _a = _b.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, {
                            totalSize: totalSize,
                            totalFiles: totalFiles,
                            availableSpace: 0, // Não implementado para local
                            usedSpace: totalSize,
                            lastBackup: new Date(),
                            oldestBackup: new Date(),
                            compressionRatio: 1.0,
                            transferSpeed: 0
                        }];
                }
            });
        });
    };
    return LocalStorageProvider;
}());
/**
 * Provider para AWS S3
 */
var S3StorageProvider = /** @class */ (function () {
    function S3StorageProvider(config) {
        this.config = config;
        this.initializeS3Client();
    }
    S3StorageProvider.prototype.initializeS3Client = function () {
        // Implementar inicialização do cliente S3
        // const { S3Client } = require('@aws-sdk/client-s3');
        // this.s3Client = new S3Client({
        //   region: this.config.region,
        //   credentials: {
        //     accessKeyId: this.config.accessKey,
        //     secretAccessKey: this.config.secretKey
        //   }
        // });
    };
    S3StorageProvider.prototype.upload = function (localPath, remotePath, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar upload para S3
                throw new Error('S3 upload não implementado ainda');
            });
        });
    };
    S3StorageProvider.prototype.download = function (remotePath, localPath, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar download do S3
                throw new Error('S3 download não implementado ainda');
            });
        });
    };
    S3StorageProvider.prototype.delete = function (remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar delete do S3
                throw new Error('S3 delete não implementado ainda');
            });
        });
    };
    S3StorageProvider.prototype.exists = function (remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar verificação de existência no S3
                return [2 /*return*/, false];
            });
        });
    };
    S3StorageProvider.prototype.list = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar listagem do S3
                return [2 /*return*/, []];
            });
        });
    };
    S3StorageProvider.prototype.getMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar métricas do S3
                return [2 /*return*/, {
                        totalSize: 0,
                        totalFiles: 0,
                        availableSpace: 0,
                        usedSpace: 0,
                        lastBackup: new Date(),
                        oldestBackup: new Date(),
                        compressionRatio: 1.0,
                        transferSpeed: 0
                    }];
            });
        });
    };
    return S3StorageProvider;
}());
/**
 * Provider para Google Cloud Storage
 */
var GCSStorageProvider = /** @class */ (function () {
    function GCSStorageProvider(config) {
        this.config = config;
        this.initializeGCSClient();
    }
    GCSStorageProvider.prototype.initializeGCSClient = function () {
        // Implementar inicialização do cliente GCS
        // const { Storage } = require('@google-cloud/storage');
        // this.gcsClient = new Storage({
        //   projectId: this.config.projectId,
        //   keyFilename: this.config.keyFile
        // });
    };
    GCSStorageProvider.prototype.upload = function (localPath, remotePath, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar upload para GCS
                throw new Error('GCS upload não implementado ainda');
            });
        });
    };
    GCSStorageProvider.prototype.download = function (remotePath, localPath, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar download do GCS
                throw new Error('GCS download não implementado ainda');
            });
        });
    };
    GCSStorageProvider.prototype.delete = function (remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar delete do GCS
                throw new Error('GCS delete não implementado ainda');
            });
        });
    };
    GCSStorageProvider.prototype.exists = function (remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar verificação de existência no GCS
                return [2 /*return*/, false];
            });
        });
    };
    GCSStorageProvider.prototype.list = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar listagem do GCS
                return [2 /*return*/, []];
            });
        });
    };
    GCSStorageProvider.prototype.getMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar métricas do GCS
                return [2 /*return*/, {
                        totalSize: 0,
                        totalFiles: 0,
                        availableSpace: 0,
                        usedSpace: 0,
                        lastBackup: new Date(),
                        oldestBackup: new Date(),
                        compressionRatio: 1.0,
                        transferSpeed: 0
                    }];
            });
        });
    };
    return GCSStorageProvider;
}());
/**
 * Provider para Azure Blob Storage
 */
var AzureStorageProvider = /** @class */ (function () {
    function AzureStorageProvider(config) {
        this.config = config;
        this.initializeAzureClient();
    }
    AzureStorageProvider.prototype.initializeAzureClient = function () {
        // Implementar inicialização do cliente Azure
        // const { BlobServiceClient } = require('@azure/storage-blob');
        // this.azureClient = BlobServiceClient.fromConnectionString(
        //   this.config.connectionString
        // );
    };
    AzureStorageProvider.prototype.upload = function (localPath, remotePath, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar upload para Azure
                throw new Error('Azure upload não implementado ainda');
            });
        });
    };
    AzureStorageProvider.prototype.download = function (remotePath, localPath, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar download do Azure
                throw new Error('Azure download não implementado ainda');
            });
        });
    };
    AzureStorageProvider.prototype.delete = function (remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar delete do Azure
                throw new Error('Azure delete não implementado ainda');
            });
        });
    };
    AzureStorageProvider.prototype.exists = function (remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar verificação de existência no Azure
                return [2 /*return*/, false];
            });
        });
    };
    AzureStorageProvider.prototype.list = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar listagem do Azure
                return [2 /*return*/, []];
            });
        });
    };
    AzureStorageProvider.prototype.getMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar métricas do Azure
                return [2 /*return*/, {
                        totalSize: 0,
                        totalFiles: 0,
                        availableSpace: 0,
                        usedSpace: 0,
                        lastBackup: new Date(),
                        oldestBackup: new Date(),
                        compressionRatio: 1.0,
                        transferSpeed: 0
                    }];
            });
        });
    };
    return AzureStorageProvider;
}());
/**
 * Gerenciador principal de storage
 */
var StorageProvider = /** @class */ (function () {
    function StorageProvider() {
        this.providers = new Map();
        this.activeUploads = new Map();
        this.activeDownloads = new Map();
    }
    /**
     * Registrar provider de storage
     */
    StorageProvider.prototype.registerProvider = function (name, config) {
        var provider;
        switch (config.type) {
            case types_1.StorageType.LOCAL:
                provider = new LocalStorageProvider(config);
                break;
            case types_1.StorageType.AWS_S3:
                provider = new S3StorageProvider(config);
                break;
            case types_1.StorageType.GOOGLE_CLOUD:
                provider = new GCSStorageProvider(config);
                break;
            case types_1.StorageType.AZURE_BLOB:
                provider = new AzureStorageProvider(config);
                break;
            default:
                throw new Error("Tipo de storage n\u00E3o suportado: ".concat(config.type));
        }
        this.providers.set(name, provider);
    };
    /**
     * Fazer upload de arquivo
     */
    StorageProvider.prototype.upload = function (localPath, config, remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            var providerName, provider, fileName, targetPath, uploadId_1, onProgress, result, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        providerName = "".concat(config.type, "-").concat(Date.now());
                        this.registerProvider(providerName, config);
                        provider = this.providers.get(providerName);
                        if (!provider) {
                            throw new Error('Provider não encontrado');
                        }
                        fileName = path_1.default.basename(localPath);
                        targetPath = remotePath || "backups/".concat(new Date().toISOString().split('T')[0], "/").concat(fileName);
                        uploadId_1 = crypto.randomUUID();
                        onProgress = function (progress) {
                            _this.activeUploads.set(uploadId_1, progress);
                        };
                        return [4 /*yield*/, provider.upload(localPath, targetPath, onProgress)];
                    case 1:
                        result = _a.sent();
                        // Remover do tracking
                        this.activeUploads.delete(uploadId_1);
                        this.providers.delete(providerName);
                        return [4 /*yield*/, audit_logger_1.auditLogger.log({
                                action: 'BACKUP_UPLOADED',
                                entityType: 'BACKUP',
                                entityId: uploadId_1,
                                details: {
                                    localPath: localPath,
                                    remotePath: result,
                                    storageType: config.type
                                },
                                userId: 'system'
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: result,
                                message: 'Upload realizado com sucesso',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_2.message,
                                message: 'Erro ao fazer upload',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fazer download de arquivo
     */
    StorageProvider.prototype.download = function (remotePath, localPath, config) {
        return __awaiter(this, void 0, void 0, function () {
            var providerName, provider, downloadId_1, onProgress, result, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        providerName = "".concat(config.type, "-").concat(Date.now());
                        this.registerProvider(providerName, config);
                        provider = this.providers.get(providerName);
                        if (!provider) {
                            throw new Error('Provider não encontrado');
                        }
                        downloadId_1 = crypto.randomUUID();
                        onProgress = function (progress) {
                            _this.activeDownloads.set(downloadId_1, progress);
                        };
                        return [4 /*yield*/, provider.download(remotePath, localPath, onProgress)];
                    case 1:
                        result = _a.sent();
                        // Remover do tracking
                        this.activeDownloads.delete(downloadId_1);
                        this.providers.delete(providerName);
                        return [4 /*yield*/, audit_logger_1.auditLogger.log({
                                action: 'BACKUP_DOWNLOADED',
                                entityType: 'BACKUP',
                                entityId: downloadId_1,
                                details: {
                                    remotePath: remotePath,
                                    localPath: result,
                                    storageType: config.type
                                },
                                userId: 'system'
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: result,
                                message: 'Download realizado com sucesso',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_3.message,
                                message: 'Erro ao fazer download',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verificar se arquivo existe
     */
    StorageProvider.prototype.exists = function (remotePath, config) {
        return __awaiter(this, void 0, void 0, function () {
            var providerName, provider, exists, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        providerName = "".concat(config.type, "-").concat(Date.now());
                        this.registerProvider(providerName, config);
                        provider = this.providers.get(providerName);
                        if (!provider) {
                            throw new Error('Provider não encontrado');
                        }
                        return [4 /*yield*/, provider.exists(remotePath)];
                    case 1:
                        exists = _a.sent();
                        this.providers.delete(providerName);
                        return [2 /*return*/, {
                                success: true,
                                data: exists,
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_4.message,
                                message: 'Erro ao verificar existência',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Listar arquivos
     */
    StorageProvider.prototype.list = function (config, prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var providerName, provider, files, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        providerName = "".concat(config.type, "-").concat(Date.now());
                        this.registerProvider(providerName, config);
                        provider = this.providers.get(providerName);
                        if (!provider) {
                            throw new Error('Provider não encontrado');
                        }
                        return [4 /*yield*/, provider.list(prefix)];
                    case 1:
                        files = _a.sent();
                        this.providers.delete(providerName);
                        return [2 /*return*/, {
                                success: true,
                                data: files,
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_5.message,
                                message: 'Erro ao listar arquivos',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obter métricas de storage
     */
    StorageProvider.prototype.getMetrics = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var providerName, provider, metrics, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        providerName = "".concat(config.type, "-").concat(Date.now());
                        this.registerProvider(providerName, config);
                        provider = this.providers.get(providerName);
                        if (!provider) {
                            throw new Error('Provider não encontrado');
                        }
                        return [4 /*yield*/, provider.getMetrics()];
                    case 1:
                        metrics = _a.sent();
                        this.providers.delete(providerName);
                        return [2 /*return*/, {
                                success: true,
                                data: metrics,
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 2:
                        error_6 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_6.message,
                                message: 'Erro ao obter métricas',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletar arquivo
     */
    StorageProvider.prototype.delete = function (remotePath, config) {
        return __awaiter(this, void 0, void 0, function () {
            var providerName, provider, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        providerName = "".concat(config.type, "-").concat(Date.now());
                        this.registerProvider(providerName, config);
                        provider = this.providers.get(providerName);
                        if (!provider) {
                            throw new Error('Provider não encontrado');
                        }
                        return [4 /*yield*/, provider.delete(remotePath)];
                    case 1:
                        _a.sent();
                        this.providers.delete(providerName);
                        return [4 /*yield*/, audit_logger_1.auditLogger.log({
                                action: 'BACKUP_DELETED',
                                entityType: 'BACKUP',
                                entityId: crypto.randomUUID(),
                                details: {
                                    remotePath: remotePath,
                                    storageType: config.type
                                },
                                userId: 'system'
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Arquivo deletado com sucesso',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 3:
                        error_7 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_7.message,
                                message: 'Erro ao deletar arquivo',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obter progresso de upload
     */
    StorageProvider.prototype.getUploadProgress = function (uploadId) {
        return this.activeUploads.get(uploadId) || null;
    };
    /**
     * Obter progresso de download
     */
    StorageProvider.prototype.getDownloadProgress = function (downloadId) {
        return this.activeDownloads.get(downloadId) || null;
    };
    /**
     * Listar uploads ativos
     */
    StorageProvider.prototype.getActiveUploads = function () {
        return Array.from(this.activeUploads.values());
    };
    /**
     * Listar downloads ativos
     */
    StorageProvider.prototype.getActiveDownloads = function () {
        return Array.from(this.activeDownloads.values());
    };
    /**
     * Testar conectividade com storage
     */
    StorageProvider.prototype.testConnection = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var providerName, provider, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        providerName = "test-".concat(config.type, "-").concat(Date.now());
                        this.registerProvider(providerName, config);
                        provider = this.providers.get(providerName);
                        if (!provider) {
                            throw new Error('Provider não encontrado');
                        }
                        // Tentar listar arquivos como teste de conectividade
                        return [4 /*yield*/, provider.list()];
                    case 1:
                        // Tentar listar arquivos como teste de conectividade
                        _a.sent();
                        this.providers.delete(providerName);
                        return [2 /*return*/, {
                                success: true,
                                data: true,
                                message: 'Conexão testada com sucesso',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 2:
                        error_8 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                data: false,
                                error: error_8.message,
                                message: 'Falha no teste de conexão',
                                timestamp: new Date(),
                                requestId: crypto.randomUUID()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return StorageProvider;
}());
exports.StorageProvider = StorageProvider;
// Instância singleton
exports.storageProvider = new StorageProvider();
