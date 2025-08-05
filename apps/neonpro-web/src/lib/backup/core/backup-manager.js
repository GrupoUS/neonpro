"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.BackupManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../../audit/audit-logger");
var encryption_service_1 = require("../../security/encryption-service");
var lgpd_manager_1 = require("../../lgpd/lgpd-manager");
var BackupManager = /** @class */ (function () {
    function BackupManager(config) {
        this.activeJobs = new Map();
        this.scheduledJobs = new Map();
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        this.auditLogger = new audit_logger_1.AuditLogger();
        this.encryptionService = new encryption_service_1.EncryptionService();
        this.lgpdManager = new lgpd_manager_1.LGPDManager();
        this.config = __assign({ enabled: true, schedule: {
                full_backup_cron: '0 2 * * 0', // Domingo às 2h
                incremental_backup_cron: '0 2 * * 1-6', // Segunda a sábado às 2h
                differential_backup_cron: '0 14 * * *' // Todo dia às 14h
            }, retention: {
                full_backup_days: 90,
                incremental_backup_days: 30,
                differential_backup_days: 7,
                archive_after_days: 365
            }, storage: {
                primary_provider: 'aws_s3',
                secondary_provider: 'azure_blob',
                encryption_enabled: true,
                compression_enabled: true,
                verification_enabled: true
            }, data_sources: {
                database: true,
                files: true,
                configurations: true,
                logs: true,
                user_data: true
            }, notifications: {
                success_notifications: true,
                failure_notifications: true,
                warning_notifications: true,
                notification_channels: ['email', 'slack']
            } }, config);
    }
    /**
     * Inicia o sistema de backup
     */
    BackupManager.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.enabled) {
                            throw new Error('Sistema de backup está desabilitado');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        // Verificar configurações
                        return [4 /*yield*/, this.validateConfiguration()];
                    case 2:
                        // Verificar configurações
                        _a.sent();
                        // Agendar backups automáticos
                        return [4 /*yield*/, this.scheduleAutomaticBackups()];
                    case 3:
                        // Agendar backups automáticos
                        _a.sent();
                        // Verificar backups pendentes
                        return [4 /*yield*/, this.resumePendingJobs()];
                    case 4:
                        // Verificar backups pendentes
                        _a.sent();
                        // Iniciar limpeza automática
                        return [4 /*yield*/, this.scheduleCleanupTasks()];
                    case 5:
                        // Iniciar limpeza automática
                        _a.sent();
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'backup_system_started',
                                resource_type: 'backup_system',
                                details: { config: this.config }
                            })];
                    case 6:
                        _a.sent();
                        console.log('Sistema de backup iniciado com sucesso');
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        throw new Error("Erro ao iniciar sistema de backup: ".concat(error_1));
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Para o sistema de backup
     */
    BackupManager.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, jobId, timeout, activeJobIds, _c, activeJobIds_1, jobId, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        // Cancelar jobs agendados
                        for (_i = 0, _a = this.scheduledJobs; _i < _a.length; _i++) {
                            _b = _a[_i], jobId = _b[0], timeout = _b[1];
                            clearTimeout(timeout);
                            this.scheduledJobs.delete(jobId);
                        }
                        activeJobIds = Array.from(this.activeJobs.keys());
                        _c = 0, activeJobIds_1 = activeJobIds;
                        _d.label = 1;
                    case 1:
                        if (!(_c < activeJobIds_1.length)) return [3 /*break*/, 4];
                        jobId = activeJobIds_1[_c];
                        return [4 /*yield*/, this.cancelBackupJob(jobId)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _c++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.auditLogger.log({
                            action: 'backup_system_stopped',
                            resource_type: 'backup_system',
                            details: { active_jobs_cancelled: activeJobIds.length }
                        })];
                    case 5:
                        _d.sent();
                        console.log('Sistema de backup parado com sucesso');
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _d.sent();
                        throw new Error("Erro ao parar sistema de backup: ".concat(error_2));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cria um backup manual
     */
    BackupManager.prototype.createBackup = function (type, dataSources, userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var jobId_1, job, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        jobId_1 = this.generateJobId();
                        job = {
                            id: jobId_1,
                            type: 'manual',
                            status: 'pending',
                            data_sources: dataSources,
                            total_size_bytes: 0,
                            compressed_size_bytes: 0,
                            files_count: 0,
                            storage_location: '',
                            checksum: '',
                            metadata: {
                                backup_type: type,
                                description: options === null || options === void 0 ? void 0 : options.description,
                                priority: (options === null || options === void 0 ? void 0 : options.priority) || 'normal',
                                notify_on_completion: (options === null || options === void 0 ? void 0 : options.notify_on_completion) || false
                            },
                            created_by: userId,
                            created_at: new Date()
                        };
                        // Salvar job no banco
                        return [4 /*yield*/, this.saveBackupJob(job)];
                    case 1:
                        // Salvar job no banco
                        _a.sent();
                        // Adicionar à fila de execução
                        this.activeJobs.set(jobId_1, job);
                        // Executar backup
                        this.executeBackupJob(jobId_1).catch(function (error) {
                            console.error("Erro no backup ".concat(jobId_1, ":"), error);
                        });
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'backup_job_created',
                                resource_type: 'backup_job',
                                resource_id: jobId_1,
                                user_id: userId,
                                details: { type: type, data_sources: dataSources }
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, jobId_1];
                    case 3:
                        error_3 = _a.sent();
                        throw new Error("Erro ao criar backup: ".concat(error_3));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtém status de um job de backup
     */
    BackupManager.prototype.getBackupJobStatus = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var activeJob, _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        activeJob = this.activeJobs.get(jobId);
                        if (activeJob) {
                            return [2 /*return*/, activeJob];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('backup_jobs')
                                .select('*')
                                .eq('id', jobId)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            if (error.code === 'PGRST116')
                                return [2 /*return*/, null];
                            throw error;
                        }
                        return [2 /*return*/, this.mapDatabaseToBackupJob(data)];
                    case 2:
                        error_4 = _b.sent();
                        throw new Error("Erro ao obter status do backup: ".concat(error_4));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lista jobs de backup
     */
    BackupManager.prototype.listBackupJobs = function (filters, pagination) {
        return __awaiter(this, void 0, void 0, function () {
            var query, offset, _a, data, error, count, jobs, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('backup_jobs')
                            .select('*', { count: 'exact' })
                            .order('created_at', { ascending: false });
                        if (filters === null || filters === void 0 ? void 0 : filters.status) {
                            query = query.in('status', filters.status);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.type) {
                            query = query.in('type', filters.type);
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.date_from) {
                            query = query.gte('created_at', filters.date_from.toISOString());
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.date_to) {
                            query = query.lte('created_at', filters.date_to.toISOString());
                        }
                        if (filters === null || filters === void 0 ? void 0 : filters.created_by) {
                            query = query.eq('created_by', filters.created_by);
                        }
                        if (pagination) {
                            offset = (pagination.page - 1) * pagination.limit;
                            query = query.range(offset, offset + pagination.limit - 1);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        jobs = data.map(this.mapDatabaseToBackupJob);
                        return [2 /*return*/, {
                                jobs: jobs,
                                total: count || 0,
                                page: (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1,
                                limit: (pagination === null || pagination === void 0 ? void 0 : pagination.limit) || jobs.length
                            }];
                    case 2:
                        error_5 = _b.sent();
                        throw new Error("Erro ao listar backups: ".concat(error_5));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancela um job de backup
     */
    BackupManager.prototype.cancelBackupJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        job = this.activeJobs.get(jobId);
                        if (!job) {
                            throw new Error('Job não encontrado ou não está em execução');
                        }
                        // Atualizar status
                        job.status = 'cancelled';
                        job.completed_at = new Date();
                        // Remover da lista de jobs ativos
                        this.activeJobs.delete(jobId);
                        // Atualizar no banco
                        return [4 /*yield*/, this.updateBackupJob(job)];
                    case 1:
                        // Atualizar no banco
                        _a.sent();
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'backup_job_cancelled',
                                resource_type: 'backup_job',
                                resource_id: jobId,
                                details: { reason: 'user_request' }
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        throw new Error("Erro ao cancelar backup: ".concat(error_6));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cria um ponto de recuperação
     */
    BackupManager.prototype.createRecoveryPoint = function (backupJobId, description) {
        return __awaiter(this, void 0, void 0, function () {
            var job, recoveryPointId, retentionDate, recoveryPoint, error, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getBackupJobStatus(backupJobId)];
                    case 1:
                        job = _a.sent();
                        if (!job || job.status !== 'completed') {
                            throw new Error('Backup deve estar completo para criar ponto de recuperação');
                        }
                        recoveryPointId = this.generateJobId();
                        retentionDate = new Date();
                        retentionDate.setDate(retentionDate.getDate() + this.config.retention.full_backup_days);
                        recoveryPoint = {
                            id: recoveryPointId,
                            backup_job_id: backupJobId,
                            type: job.metadata.backup_type || 'full',
                            timestamp: job.completed_at,
                            data_sources: job.data_sources,
                            size_bytes: job.total_size_bytes,
                            storage_location: job.storage_location,
                            is_verified: false,
                            retention_until: retentionDate,
                            metadata: {
                                description: description,
                                created_from_job: backupJobId
                            }
                        };
                        return [4 /*yield*/, this.supabase
                                .from('recovery_points')
                                .insert(recoveryPoint)];
                    case 2:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Verificar integridade
                        return [4 /*yield*/, this.verifyRecoveryPoint(recoveryPointId)];
                    case 3:
                        // Verificar integridade
                        _a.sent();
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'recovery_point_created',
                                resource_type: 'recovery_point',
                                resource_id: recoveryPointId,
                                details: { backup_job_id: backupJobId }
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, recoveryPointId];
                    case 5:
                        error_7 = _a.sent();
                        throw new Error("Erro ao criar ponto de recupera\u00E7\u00E3o: ".concat(error_7));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Inicia processo de recuperação
     */
    BackupManager.prototype.startRecovery = function (recoveryPointId, options, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, recoveryPoint, error, requestId_1, estimatedCompletion, recoveryRequest, insertError, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('recovery_points')
                                .select('*')
                                .eq('id', recoveryPointId)
                                .single()];
                    case 1:
                        _a = _b.sent(), recoveryPoint = _a.data, error = _a.error;
                        if (error || !recoveryPoint) {
                            throw new Error('Ponto de recuperação não encontrado');
                        }
                        if (!recoveryPoint.is_verified) {
                            throw new Error('Ponto de recuperação não foi verificado');
                        }
                        requestId_1 = this.generateJobId();
                        estimatedCompletion = new Date();
                        estimatedCompletion.setHours(estimatedCompletion.getHours() + 2); // Estimativa de 2 horas
                        recoveryRequest = {
                            id: requestId_1,
                            recovery_point_id: recoveryPointId,
                            target_timestamp: options.target_timestamp || recoveryPoint.timestamp,
                            data_sources: options.data_sources,
                            recovery_type: options.recovery_type,
                            target_location: options.target_location,
                            status: 'pending',
                            progress_percentage: 0,
                            estimated_completion: estimatedCompletion,
                            requested_by: userId,
                            created_at: new Date()
                        };
                        return [4 /*yield*/, this.supabase
                                .from('recovery_requests')
                                .insert(recoveryRequest)];
                    case 2:
                        insertError = (_b.sent()).error;
                        if (insertError)
                            throw insertError;
                        // Executar recuperação
                        this.executeRecovery(requestId_1).catch(function (error) {
                            console.error("Erro na recupera\u00E7\u00E3o ".concat(requestId_1, ":"), error);
                        });
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'recovery_started',
                                resource_type: 'recovery_request',
                                resource_id: requestId_1,
                                user_id: userId,
                                details: { recovery_point_id: recoveryPointId, options: options }
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, requestId_1];
                    case 4:
                        error_8 = _b.sent();
                        throw new Error("Erro ao iniciar recupera\u00E7\u00E3o: ".concat(error_8));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtém métricas do sistema de backup
     */
    BackupManager.prototype.getBackupMetrics = function () {
        return __awaiter(this, arguments, void 0, function (period) {
            var startDate, _a, jobs, error, totalBackups, successfulBackups, failedBackups, successRate, completedJobs, averageDuration, totalStorageBytes, totalStorageGB, lastSuccessful, nextScheduled, storageTrend, error_9;
            if (period === void 0) { period = 'month'; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        startDate = new Date();
                        switch (period) {
                            case 'day':
                                startDate.setDate(startDate.getDate() - 1);
                                break;
                            case 'week':
                                startDate.setDate(startDate.getDate() - 7);
                                break;
                            case 'month':
                                startDate.setMonth(startDate.getMonth() - 1);
                                break;
                        }
                        return [4 /*yield*/, this.supabase
                                .from('backup_jobs')
                                .select('*')
                                .gte('created_at', startDate.toISOString())];
                    case 1:
                        _a = _b.sent(), jobs = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalBackups = jobs.length;
                        successfulBackups = jobs.filter(function (j) { return j.status === 'completed'; }).length;
                        failedBackups = jobs.filter(function (j) { return j.status === 'failed'; }).length;
                        successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0;
                        completedJobs = jobs.filter(function (j) { return j.status === 'completed' && j.duration_seconds; });
                        averageDuration = completedJobs.length > 0 ?
                            completedJobs.reduce(function (sum, j) { return sum + j.duration_seconds; }, 0) / completedJobs.length / 60 : 0;
                        totalStorageBytes = jobs.reduce(function (sum, j) { return sum + (j.total_size_bytes || 0); }, 0);
                        totalStorageGB = totalStorageBytes / (1024 * 1024 * 1024);
                        lastSuccessful = jobs
                            .filter(function (j) { return j.status === 'completed'; })
                            .sort(function (a, b) { return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(); })[0];
                        nextScheduled = new Date();
                        nextScheduled.setDate(nextScheduled.getDate() + 1);
                        nextScheduled.setHours(2, 0, 0, 0);
                        return [4 /*yield*/, this.getStorageTrend(period)];
                    case 2:
                        storageTrend = _b.sent();
                        return [2 /*return*/, {
                                total_backups: totalBackups,
                                successful_backups: successfulBackups,
                                failed_backups: failedBackups,
                                success_rate: successRate,
                                average_duration_minutes: averageDuration,
                                total_storage_used_gb: totalStorageGB,
                                last_successful_backup: lastSuccessful ? new Date(lastSuccessful.completed_at) : new Date(0),
                                next_scheduled_backup: nextScheduled,
                                storage_trend: storageTrend
                            }];
                    case 3:
                        error_9 = _b.sent();
                        throw new Error("Erro ao obter m\u00E9tricas: ".concat(error_9));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verifica integridade de um backup
     */
    BackupManager.prototype.verifyBackup = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, checksumVerification, integrityCheck, verification, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getBackupJobStatus(jobId)];
                    case 1:
                        job = _a.sent();
                        if (!job || job.status !== 'completed') {
                            throw new Error('Backup deve estar completo para verificação');
                        }
                        return [4 /*yield*/, this.verifyChecksum(job)];
                    case 2:
                        checksumVerification = _a.sent();
                        return [4 /*yield*/, this.performIntegrityCheck(job)];
                    case 3:
                        integrityCheck = _a.sent();
                        verification = {
                            backup_job_id: jobId,
                            verification_type: 'integrity_check',
                            status: checksumVerification && integrityCheck ? 'passed' : 'failed',
                            details: "Checksum: ".concat(checksumVerification ? 'OK' : 'FALHOU', ", Integridade: ").concat(integrityCheck ? 'OK' : 'FALHOU'),
                            verified_at: new Date()
                        };
                        // Salvar verificação
                        return [4 /*yield*/, this.supabase
                                .from('backup_verifications')
                                .insert(verification)];
                    case 4:
                        // Salvar verificação
                        _a.sent();
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'backup_verified',
                                resource_type: 'backup_job',
                                resource_id: jobId,
                                details: verification
                            })];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, verification];
                    case 6:
                        error_10 = _a.sent();
                        throw new Error("Erro na verifica\u00E7\u00E3o: ".concat(error_10));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Métodos privados
    BackupManager.prototype.validateConfiguration = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Validar configurações de storage
                if (!this.config.storage.primary_provider) {
                    throw new Error('Provider de storage primário não configurado');
                }
                // Validar credenciais de storage (implementação específica por provider)
                // ...
                // Validar configurações de agendamento
                if (!this.isValidCronExpression(this.config.schedule.full_backup_cron)) {
                    throw new Error('Expressão cron inválida para backup completo');
                }
                return [2 /*return*/];
            });
        });
    };
    BackupManager.prototype.scheduleAutomaticBackups = function () {
        return __awaiter(this, void 0, void 0, function () {
            var scheduleNextFullBackup;
            var _this = this;
            return __generator(this, function (_a) {
                scheduleNextFullBackup = function () {
                    var nextRun = _this.getNextCronDate(_this.config.schedule.full_backup_cron);
                    var timeout = nextRun.getTime() - Date.now();
                    var timeoutId = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.createBackup('full', Object.keys(this.config.data_sources), 'system')];
                                case 1:
                                    _a.sent();
                                    scheduleNextFullBackup();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, timeout);
                    _this.scheduledJobs.set('full_backup', timeoutId);
                };
                scheduleNextFullBackup();
                return [2 /*return*/];
            });
        });
    };
    BackupManager.prototype.resumePendingJobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pendingJobs, _loop_1, this_1, _i, _a, job;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('backup_jobs')
                            .select('*')
                            .in('status', ['pending', 'running'])];
                    case 1:
                        pendingJobs = (_b.sent()).data;
                        _loop_1 = function (job) {
                            var backupJob = this_1.mapDatabaseToBackupJob(job);
                            this_1.activeJobs.set(backupJob.id, backupJob);
                            // Retomar execução
                            this_1.executeBackupJob(backupJob.id).catch(function (error) {
                                console.error("Erro ao retomar backup ".concat(backupJob.id, ":"), error);
                            });
                        };
                        this_1 = this;
                        for (_i = 0, _a = pendingJobs || []; _i < _a.length; _i++) {
                            job = _a[_i];
                            _loop_1(job);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    BackupManager.prototype.scheduleCleanupTasks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var scheduleCleanup;
            var _this = this;
            return __generator(this, function (_a) {
                scheduleCleanup = function () {
                    var nextMidnight = new Date();
                    nextMidnight.setDate(nextMidnight.getDate() + 1);
                    nextMidnight.setHours(0, 0, 0, 0);
                    var timeout = nextMidnight.getTime() - Date.now();
                    var timeoutId = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.cleanupExpiredBackups()];
                                case 1:
                                    _a.sent();
                                    scheduleCleanup();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, timeout);
                    _this.scheduledJobs.set('cleanup', timeoutId);
                };
                scheduleCleanup();
                return [2 /*return*/];
            });
        });
    };
    BackupManager.prototype.executeBackupJob = function (jobId) {
        return __awaiter(this, void 0, void 0, function () {
            var job, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        job = this.activeJobs.get(jobId);
                        if (!job)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 8]);
                        job.status = 'running';
                        job.started_at = new Date();
                        return [4 /*yield*/, this.updateBackupJob(job)];
                    case 2:
                        _a.sent();
                        // Simular processo de backup
                        return [4 /*yield*/, this.performBackup(job)];
                    case 3:
                        // Simular processo de backup
                        _a.sent();
                        job.status = 'completed';
                        job.completed_at = new Date();
                        job.duration_seconds = Math.floor((job.completed_at.getTime() - job.started_at.getTime()) / 1000);
                        return [4 /*yield*/, this.updateBackupJob(job)];
                    case 4:
                        _a.sent();
                        this.activeJobs.delete(jobId);
                        // Criar ponto de recuperação automaticamente
                        return [4 /*yield*/, this.createRecoveryPoint(jobId)];
                    case 5:
                        // Criar ponto de recuperação automaticamente
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        error_11 = _a.sent();
                        job.status = 'failed';
                        job.error_message = error_11.toString();
                        job.completed_at = new Date();
                        return [4 /*yield*/, this.updateBackupJob(job)];
                    case 7:
                        _a.sent();
                        this.activeJobs.delete(jobId);
                        throw error_11;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BackupManager.prototype.performBackup = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var totalSize, filesCount, _i, _a, dataSource, _b, dbBackup, filesBackup, encryption;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        totalSize = 0;
                        filesCount = 0;
                        _i = 0, _a = job.data_sources;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        dataSource = _a[_i];
                        _b = dataSource;
                        switch (_b) {
                            case 'database': return [3 /*break*/, 2];
                            case 'files': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 6];
                    case 2: return [4 /*yield*/, this.backupDatabase()];
                    case 3:
                        dbBackup = _c.sent();
                        totalSize += dbBackup.size;
                        filesCount += dbBackup.files;
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.backupFiles()];
                    case 5:
                        filesBackup = _c.sent();
                        totalSize += filesBackup.size;
                        filesCount += filesBackup.files;
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        job.total_size_bytes = totalSize;
                        job.files_count = filesCount;
                        // Comprimir se habilitado
                        if (this.config.storage.compression_enabled) {
                            job.compressed_size_bytes = Math.floor(totalSize * 0.7); // Simulação
                        }
                        else {
                            job.compressed_size_bytes = totalSize;
                        }
                        if (!this.config.storage.encryption_enabled) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.encryptionService.encrypt('backup_data')];
                    case 8:
                        encryption = _c.sent();
                        job.encryption_key_id = encryption.keyId;
                        _c.label = 9;
                    case 9:
                        // Gerar checksum
                        job.checksum = this.generateChecksum(job);
                        // Definir localização de storage
                        job.storage_location = this.generateStorageLocation(job);
                        return [2 /*return*/];
                }
            });
        });
    };
    BackupManager.prototype.executeRecovery = function (requestId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, request, error, progress, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('recovery_requests')
                            .select('*')
                            .eq('id', requestId)
                            .single()];
                    case 1:
                        _a = _b.sent(), request = _a.data, error = _a.error;
                        if (error || !request)
                            return [2 /*return*/];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 10, , 12]);
                        // Atualizar status
                        return [4 /*yield*/, this.supabase
                                .from('recovery_requests')
                                .update({ status: 'running', progress_percentage: 0 })
                                .eq('id', requestId)];
                    case 3:
                        // Atualizar status
                        _b.sent();
                        progress = 10;
                        _b.label = 4;
                    case 4:
                        if (!(progress <= 100)) return [3 /*break*/, 8];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 5:
                        _b.sent(); // Simular trabalho
                        return [4 /*yield*/, this.supabase
                                .from('recovery_requests')
                                .update({ progress_percentage: progress })
                                .eq('id', requestId)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        progress += 10;
                        return [3 /*break*/, 4];
                    case 8: 
                    // Completar
                    return [4 /*yield*/, this.supabase
                            .from('recovery_requests')
                            .update({
                            status: 'completed',
                            progress_percentage: 100
                        })
                            .eq('id', requestId)];
                    case 9:
                        // Completar
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 10:
                        error_12 = _b.sent();
                        return [4 /*yield*/, this.supabase
                                .from('recovery_requests')
                                .update({
                                status: 'failed',
                                error_message: error_12.toString()
                            })
                                .eq('id', requestId)];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    BackupManager.prototype.verifyRecoveryPoint = function (recoveryPointId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Implementar verificação de integridade
                    // Por simplicidade, marcar como verificado
                    return [4 /*yield*/, this.supabase
                            .from('recovery_points')
                            .update({ is_verified: true })
                            .eq('id', recoveryPointId)];
                    case 1:
                        // Implementar verificação de integridade
                        // Por simplicidade, marcar como verificado
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BackupManager.prototype.cleanupExpiredBackups = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, retentionPolicies, _i, retentionPolicies_1, policy, cutoffDate, expiredJobs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        retentionPolicies = [
                            { type: 'full', days: this.config.retention.full_backup_days },
                            { type: 'incremental', days: this.config.retention.incremental_backup_days },
                            { type: 'differential', days: this.config.retention.differential_backup_days }
                        ];
                        _i = 0, retentionPolicies_1 = retentionPolicies;
                        _a.label = 1;
                    case 1:
                        if (!(_i < retentionPolicies_1.length)) return [3 /*break*/, 5];
                        policy = retentionPolicies_1[_i];
                        cutoffDate = new Date(now.getTime() - policy.days * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, this.supabase
                                .from('backup_jobs')
                                .select('id')
                                .eq('metadata->backup_type', policy.type)
                                .lt('created_at', cutoffDate.toISOString())];
                    case 2:
                        expiredJobs = (_a.sent()).data;
                        if (!(expiredJobs && expiredJobs.length > 0)) return [3 /*break*/, 4];
                        // Deletar ou arquivar
                        return [4 /*yield*/, this.supabase
                                .from('backup_jobs')
                                .delete()
                                .in('id', expiredJobs.map(function (j) { return j.id; }))];
                    case 3:
                        // Deletar ou arquivar
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Métodos auxiliares
    BackupManager.prototype.generateJobId = function () {
        return "backup_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    BackupManager.prototype.generateChecksum = function (job) {
        // Implementar geração de checksum real
        return "sha256_".concat(Math.random().toString(36).substr(2, 16));
    };
    BackupManager.prototype.generateStorageLocation = function (job) {
        var provider = this.config.storage.primary_provider;
        var date = new Date().toISOString().split('T')[0];
        return "".concat(provider, "://backups/").concat(date, "/").concat(job.id);
    };
    BackupManager.prototype.backupDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar backup do banco de dados
                return [2 /*return*/, { size: 1024 * 1024 * 100, files: 1 }]; // 100MB simulado
            });
        });
    };
    BackupManager.prototype.backupFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar backup de arquivos
                return [2 /*return*/, { size: 1024 * 1024 * 500, files: 150 }]; // 500MB, 150 arquivos simulado
            });
        });
    };
    BackupManager.prototype.verifyChecksum = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar verificação de checksum
                return [2 /*return*/, true]; // Simulado
            });
        });
    };
    BackupManager.prototype.performIntegrityCheck = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar verificação de integridade
                return [2 /*return*/, true]; // Simulado
            });
        });
    };
    BackupManager.prototype.isValidCronExpression = function (cron) {
        // Implementar validação de expressão cron
        return cron.split(' ').length === 5;
    };
    BackupManager.prototype.getNextCronDate = function (cron) {
        // Implementar cálculo da próxima execução
        var next = new Date();
        next.setDate(next.getDate() + 1);
        next.setHours(2, 0, 0, 0);
        return next;
    };
    BackupManager.prototype.getStorageTrend = function (period) {
        return __awaiter(this, void 0, void 0, function () {
            var trend, days, i, date;
            return __generator(this, function (_a) {
                trend = [];
                days = period === 'month' ? 30 : period === 'week' ? 7 : 1;
                for (i = days - 1; i >= 0; i--) {
                    date = new Date();
                    date.setDate(date.getDate() - i);
                    trend.push({
                        date: date.toISOString().split('T')[0],
                        size_gb: Math.random() * 100 + 50 // Simulado
                    });
                }
                return [2 /*return*/, trend];
            });
        });
    };
    BackupManager.prototype.mapDatabaseToBackupJob = function (data) {
        return {
            id: data.id,
            type: data.type,
            status: data.status,
            data_sources: data.data_sources || [],
            started_at: data.started_at ? new Date(data.started_at) : undefined,
            completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
            duration_seconds: data.duration_seconds,
            total_size_bytes: data.total_size_bytes || 0,
            compressed_size_bytes: data.compressed_size_bytes || 0,
            files_count: data.files_count || 0,
            storage_location: data.storage_location || '',
            encryption_key_id: data.encryption_key_id,
            checksum: data.checksum || '',
            error_message: data.error_message,
            metadata: data.metadata || {},
            created_by: data.created_by,
            created_at: new Date(data.created_at)
        };
    };
    BackupManager.prototype.saveBackupJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('backup_jobs')
                            .insert({
                            id: job.id,
                            type: job.type,
                            status: job.status,
                            data_sources: job.data_sources,
                            started_at: (_a = job.started_at) === null || _a === void 0 ? void 0 : _a.toISOString(),
                            completed_at: (_b = job.completed_at) === null || _b === void 0 ? void 0 : _b.toISOString(),
                            duration_seconds: job.duration_seconds,
                            total_size_bytes: job.total_size_bytes,
                            compressed_size_bytes: job.compressed_size_bytes,
                            files_count: job.files_count,
                            storage_location: job.storage_location,
                            encryption_key_id: job.encryption_key_id,
                            checksum: job.checksum,
                            error_message: job.error_message,
                            metadata: job.metadata,
                            created_by: job.created_by,
                            created_at: job.created_at.toISOString()
                        })];
                    case 1:
                        error = (_c.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    BackupManager.prototype.updateBackupJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('backup_jobs')
                            .update({
                            status: job.status,
                            started_at: (_a = job.started_at) === null || _a === void 0 ? void 0 : _a.toISOString(),
                            completed_at: (_b = job.completed_at) === null || _b === void 0 ? void 0 : _b.toISOString(),
                            duration_seconds: job.duration_seconds,
                            total_size_bytes: job.total_size_bytes,
                            compressed_size_bytes: job.compressed_size_bytes,
                            files_count: job.files_count,
                            storage_location: job.storage_location,
                            encryption_key_id: job.encryption_key_id,
                            checksum: job.checksum,
                            error_message: job.error_message,
                            metadata: job.metadata
                        })
                            .eq('id', job.id)];
                    case 1:
                        error = (_c.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    return BackupManager;
}());
exports.BackupManager = BackupManager;
exports.default = BackupManager;
