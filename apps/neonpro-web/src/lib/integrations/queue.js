"use strict";
/**
 * NeonPro - Integration Queue System
 * Asynchronous job processing system for third-party integrations
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
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
exports.QueueFactory = exports.SupabaseIntegrationQueue = exports.MemoryIntegrationQueue = void 0;
var crypto_1 = require("crypto");
var supabase_js_1 = require("@supabase/supabase-js");
/**
 * Memory Queue Implementation
 * In-memory job queue for development and single-instance deployments
 */
var MemoryIntegrationQueue = /** @class */ (function () {
    function MemoryIntegrationQueue(config) {
        this.jobs = new Map();
        this.pendingJobs = [];
        this.processingJobs = new Set();
        this.processors = new Map();
        this.isProcessing = false;
        this.stats = {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            retries: 0
        };
        this.config = __assign({ maxConcurrency: 5, retryDelay: 5000, maxRetries: 3, processInterval: 1000 }, config);
        // Start processing loop
        this.startProcessing();
    }
    /**
     * Add job to queue
     */
    MemoryIntegrationQueue.prototype.enqueue = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Set default values
                job.id = job.id || crypto_1.default.randomUUID();
                job.status = 'pending';
                job.createdAt = job.createdAt || new Date();
                job.attempts = job.attempts || 0;
                job.maxAttempts = job.maxAttempts || this.config.maxRetries + 1;
                // Store job
                this.jobs.set(job.id, job);
                // Add to pending queue with priority sorting
                this.insertJobByPriority(job);
                this.updateStats();
                return [2 /*return*/, job.id];
            });
        });
    };
    /**
     * Get job by ID
     */
    MemoryIntegrationQueue.prototype.getJob = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.jobs.get(id) || null];
            });
        });
    };
    /**
     * Update job status
     */
    MemoryIntegrationQueue.prototype.updateJob = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var job;
            return __generator(this, function (_a) {
                job = this.jobs.get(id);
                if (!job) {
                    throw new Error("Job not found: ".concat(id));
                }
                Object.assign(job, updates);
                job.updatedAt = new Date();
                this.updateStats();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Remove job from queue
     */
    MemoryIntegrationQueue.prototype.removeJob = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var job, pendingIndex;
            return __generator(this, function (_a) {
                job = this.jobs.get(id);
                if (!job) {
                    return [2 /*return*/, false];
                }
                // Remove from jobs map
                this.jobs.delete(id);
                pendingIndex = this.pendingJobs.findIndex(function (j) { return j.id === id; });
                if (pendingIndex > -1) {
                    this.pendingJobs.splice(pendingIndex, 1);
                }
                // Remove from processing set
                this.processingJobs.delete(id);
                this.updateStats();
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Register job processor
     */
    MemoryIntegrationQueue.prototype.registerProcessor = function (type, processor) {
        this.processors.set(type, processor);
    };
    /**
     * Get queue statistics
     */
    MemoryIntegrationQueue.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, __assign({}, this.stats)];
            });
        });
    };
    /**
     * Get pending jobs
     */
    MemoryIntegrationQueue.prototype.getPendingJobs = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            var jobs;
            return __generator(this, function (_a) {
                jobs = this.pendingJobs.slice(0, limit);
                return [2 /*return*/, jobs.map(function (job) { return (__assign({}, job)); })];
            });
        });
    };
    /**
     * Get processing jobs
     */
    MemoryIntegrationQueue.prototype.getProcessingJobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobs, _i, _a, id, job;
            return __generator(this, function (_b) {
                jobs = [];
                for (_i = 0, _a = this.processingJobs; _i < _a.length; _i++) {
                    id = _a[_i];
                    job = this.jobs.get(id);
                    if (job) {
                        jobs.push(__assign({}, job));
                    }
                }
                return [2 /*return*/, jobs];
            });
        });
    };
    /**
     * Clear all jobs
     */
    MemoryIntegrationQueue.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.jobs.clear();
                this.pendingJobs = [];
                this.processingJobs.clear();
                this.updateStats();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Pause queue processing
     */
    MemoryIntegrationQueue.prototype.pause = function () {
        this.isProcessing = false;
    };
    /**
     * Resume queue processing
     */
    MemoryIntegrationQueue.prototype.resume = function () {
        this.isProcessing = true;
    };
    // Private helper methods
    /**
     * Insert job into pending queue by priority
     */
    MemoryIntegrationQueue.prototype.insertJobByPriority = function (job) {
        var priority = job.priority || 0;
        var insertIndex = this.pendingJobs.length;
        // Find insertion point (higher priority first)
        for (var i = 0; i < this.pendingJobs.length; i++) {
            if ((this.pendingJobs[i].priority || 0) < priority) {
                insertIndex = i;
                break;
            }
        }
        this.pendingJobs.splice(insertIndex, 0, job);
    };
    /**
     * Start processing loop
     */
    MemoryIntegrationQueue.prototype.startProcessing = function () {
        var _this = this;
        setInterval(function () {
            if (_this.isProcessing) {
                _this.processJobs();
            }
        }, this.config.processInterval);
    };
    /**
     * Process pending jobs
     */
    MemoryIntegrationQueue.prototype.processJobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var availableSlots, jobsToProcess, _i, jobsToProcess_1, job;
            return __generator(this, function (_a) {
                availableSlots = this.config.maxConcurrency - this.processingJobs.size;
                if (availableSlots <= 0 || this.pendingJobs.length === 0) {
                    return [2 /*return*/];
                }
                jobsToProcess = this.pendingJobs.splice(0, availableSlots);
                for (_i = 0, jobsToProcess_1 = jobsToProcess; _i < jobsToProcess_1.length; _i++) {
                    job = jobsToProcess_1[_i];
                    this.processJob(job);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Process individual job
     */
    MemoryIntegrationQueue.prototype.processJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var processor, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 5, 6]);
                        // Mark as processing
                        job.status = 'processing';
                        job.startedAt = new Date();
                        job.attempts++;
                        this.processingJobs.add(job.id);
                        this.updateStats();
                        processor = this.processors.get(job.type);
                        if (!processor) {
                            throw new Error("No processor registered for job type: ".concat(job.type));
                        }
                        return [4 /*yield*/, processor(job)];
                    case 1:
                        result = _a.sent();
                        // Mark as completed
                        job.status = 'completed';
                        job.completedAt = new Date();
                        job.result = result;
                        return [3 /*break*/, 6];
                    case 2:
                        error_1 = _a.sent();
                        // Handle job failure
                        job.status = 'failed';
                        job.error = error_1 instanceof Error ? error_1.message : String(error_1);
                        job.failedAt = new Date();
                        if (!(job.attempts < job.maxAttempts)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.scheduleRetry(job)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        // Remove from processing set
                        this.processingJobs.delete(job.id);
                        this.updateStats();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Schedule job retry
     */
    MemoryIntegrationQueue.prototype.scheduleRetry = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var delay;
            var _this = this;
            return __generator(this, function (_a) {
                delay = this.calculateRetryDelay(job.attempts);
                setTimeout(function () {
                    job.status = 'pending';
                    job.scheduledAt = new Date();
                    _this.insertJobByPriority(job);
                    _this.updateStats();
                }, delay);
                this.stats.retries++;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Calculate retry delay
     */
    MemoryIntegrationQueue.prototype.calculateRetryDelay = function (attempts) {
        // Exponential backoff: delay * 2^(attempts-1)
        return this.config.retryDelay * Math.pow(2, attempts - 1);
    };
    /**
     * Update queue statistics
     */
    MemoryIntegrationQueue.prototype.updateStats = function () {
        this.stats.pending = this.pendingJobs.length;
        this.stats.processing = this.processingJobs.size;
        var completed = 0;
        var failed = 0;
        for (var _i = 0, _a = this.jobs.values(); _i < _a.length; _i++) {
            var job = _a[_i];
            if (job.status === 'completed')
                completed++;
            else if (job.status === 'failed')
                failed++;
        }
        this.stats.completed = completed;
        this.stats.failed = failed;
    };
    return MemoryIntegrationQueue;
}());
exports.MemoryIntegrationQueue = MemoryIntegrationQueue;
/**
 * Supabase Queue Implementation
 * Database-backed job queue using Supabase for persistence
 */
var SupabaseIntegrationQueue = /** @class */ (function () {
    function SupabaseIntegrationQueue(supabaseUrl, supabaseKey, config) {
        this.processors = new Map();
        this.isProcessing = false;
        this.processingJobs = new Set();
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.config = __assign({ maxConcurrency: 5, retryDelay: 5000, maxRetries: 3, processInterval: 5000 }, config);
        // Start processing loop
        this.startProcessing();
    }
    /**
     * Add job to queue
     */
    SupabaseIntegrationQueue.prototype.enqueue = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Set default values
                        job.id = job.id || crypto_1.default.randomUUID();
                        job.status = 'pending';
                        job.createdAt = job.createdAt || new Date();
                        job.attempts = job.attempts || 0;
                        job.maxAttempts = job.maxAttempts || this.config.maxRetries + 1;
                        return [4 /*yield*/, this.supabase
                                .from('integration_jobs')
                                .insert({
                                id: job.id,
                                type: job.type,
                                integration_id: job.integrationId,
                                payload: job.payload,
                                priority: job.priority || 0,
                                attempts: job.attempts,
                                max_attempts: job.maxAttempts,
                                delay: job.delay || 0,
                                status: job.status,
                                created_at: job.createdAt,
                                scheduled_at: job.scheduledAt
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Failed to enqueue job: ".concat(error.message));
                        }
                        return [2 /*return*/, job.id];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Failed to enqueue job:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get job by ID
     */
    SupabaseIntegrationQueue.prototype.getJob = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('integration_jobs')
                                .select('*')
                                .eq('id', id)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, this.mapDatabaseToJob(data)];
                    case 2:
                        error_3 = _b.sent();
                        console.error('Failed to get job:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update job status
     */
    SupabaseIntegrationQueue.prototype.updateJob = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, error, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        updateData = {
                            updated_at: new Date()
                        };
                        if (updates.status)
                            updateData.status = updates.status;
                        if (updates.attempts !== undefined)
                            updateData.attempts = updates.attempts;
                        if (updates.result)
                            updateData.result = updates.result;
                        if (updates.error)
                            updateData.error = updates.error;
                        if (updates.startedAt)
                            updateData.started_at = updates.startedAt;
                        if (updates.completedAt)
                            updateData.completed_at = updates.completedAt;
                        if (updates.failedAt)
                            updateData.failed_at = updates.failedAt;
                        if (updates.scheduledAt)
                            updateData.scheduled_at = updates.scheduledAt;
                        return [4 /*yield*/, this.supabase
                                .from('integration_jobs')
                                .update(updateData)
                                .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Failed to update job: ".concat(error.message));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Failed to update job:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove job from queue
     */
    SupabaseIntegrationQueue.prototype.removeJob = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('integration_jobs')
                                .delete()
                                .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            console.error('Failed to remove job:', error);
                            return [2 /*return*/, false];
                        }
                        this.processingJobs.delete(id);
                        return [2 /*return*/, true];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Failed to remove job:', error_5);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register job processor
     */
    SupabaseIntegrationQueue.prototype.registerProcessor = function (type, processor) {
        this.processors.set(type, processor);
    };
    /**
     * Get queue statistics
     */
    SupabaseIntegrationQueue.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, stats, _i, _b, job, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('integration_jobs')
                                .select('status')
                                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())];
                    case 1:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to get stats: ".concat(error.message));
                        }
                        stats = {
                            pending: 0,
                            processing: 0,
                            completed: 0,
                            failed: 0,
                            retries: 0
                        };
                        for (_i = 0, _b = data || []; _i < _b.length; _i++) {
                            job = _b[_i];
                            switch (job.status) {
                                case 'pending':
                                    stats.pending++;
                                    break;
                                case 'processing':
                                    stats.processing++;
                                    break;
                                case 'completed':
                                    stats.completed++;
                                    break;
                                case 'failed':
                                    stats.failed++;
                                    break;
                            }
                        }
                        return [2 /*return*/, stats];
                    case 2:
                        error_6 = _c.sent();
                        console.error('Failed to get stats:', error_6);
                        return [2 /*return*/, {
                                pending: 0,
                                processing: 0,
                                completed: 0,
                                failed: 0,
                                retries: 0
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get pending jobs
     */
    SupabaseIntegrationQueue.prototype.getPendingJobs = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var _a, data, error, error_7;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('integration_jobs')
                                .select('*')
                                .eq('status', 'pending')
                                .or("scheduled_at.is.null,scheduled_at.lte.".concat(new Date().toISOString()))
                                .order('priority', { ascending: false })
                                .order('created_at', { ascending: true })
                                .limit(limit)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to get pending jobs: ".concat(error.message));
                        }
                        return [2 /*return*/, (data || []).map(this.mapDatabaseToJob)];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Failed to get pending jobs:', error_7);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get processing jobs
     */
    SupabaseIntegrationQueue.prototype.getProcessingJobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('integration_jobs')
                                .select('*')
                                .eq('status', 'processing')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to get processing jobs: ".concat(error.message));
                        }
                        return [2 /*return*/, (data || []).map(this.mapDatabaseToJob)];
                    case 2:
                        error_8 = _b.sent();
                        console.error('Failed to get processing jobs:', error_8);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear completed and failed jobs
     */
    SupabaseIntegrationQueue.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('integration_jobs')
                                .delete()
                                .in('status', ['completed', 'failed'])
                                .lt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Failed to clear jobs: ".concat(error.message));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        console.error('Failed to clear jobs:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Pause queue processing
     */
    SupabaseIntegrationQueue.prototype.pause = function () {
        this.isProcessing = false;
    };
    /**
     * Resume queue processing
     */
    SupabaseIntegrationQueue.prototype.resume = function () {
        this.isProcessing = true;
    };
    // Private helper methods
    /**
     * Start processing loop
     */
    SupabaseIntegrationQueue.prototype.startProcessing = function () {
        var _this = this;
        this.isProcessing = true;
        setInterval(function () {
            if (_this.isProcessing) {
                _this.processJobs();
            }
        }, this.config.processInterval);
    };
    /**
     * Process pending jobs
     */
    SupabaseIntegrationQueue.prototype.processJobs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var availableSlots, jobs, _i, jobs_1, job, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        availableSlots = this.config.maxConcurrency - this.processingJobs.size;
                        if (availableSlots <= 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.getPendingJobs(availableSlots)];
                    case 1:
                        jobs = _a.sent();
                        for (_i = 0, jobs_1 = jobs; _i < jobs_1.length; _i++) {
                            job = jobs_1[_i];
                            if (this.processingJobs.size >= this.config.maxConcurrency) {
                                break;
                            }
                            this.processJob(job);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error('Failed to process jobs:', error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process individual job
     */
    SupabaseIntegrationQueue.prototype.processJob = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var processor, result, error_11, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, 8, 9]);
                        // Mark as processing
                        this.processingJobs.add(job.id);
                        return [4 /*yield*/, this.updateJob(job.id, {
                                status: 'processing',
                                startedAt: new Date(),
                                attempts: job.attempts + 1
                            })];
                    case 1:
                        _a.sent();
                        processor = this.processors.get(job.type);
                        if (!processor) {
                            throw new Error("No processor registered for job type: ".concat(job.type));
                        }
                        return [4 /*yield*/, processor(job)];
                    case 2:
                        result = _a.sent();
                        // Mark as completed
                        return [4 /*yield*/, this.updateJob(job.id, {
                                status: 'completed',
                                completedAt: new Date(),
                                result: result
                            })];
                    case 3:
                        // Mark as completed
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 4:
                        error_11 = _a.sent();
                        errorMessage = error_11 instanceof Error ? error_11.message : String(error_11);
                        return [4 /*yield*/, this.updateJob(job.id, {
                                status: 'failed',
                                error: errorMessage,
                                failedAt: new Date()
                            })];
                    case 5:
                        _a.sent();
                        if (!(job.attempts + 1 < job.maxAttempts)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.scheduleRetry(job)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        // Remove from processing set
                        this.processingJobs.delete(job.id);
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Schedule job retry
     */
    SupabaseIntegrationQueue.prototype.scheduleRetry = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var delay, scheduledAt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        delay = this.calculateRetryDelay(job.attempts + 1);
                        scheduledAt = new Date(Date.now() + delay);
                        return [4 /*yield*/, this.updateJob(job.id, {
                                status: 'pending',
                                scheduledAt: scheduledAt
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate retry delay
     */
    SupabaseIntegrationQueue.prototype.calculateRetryDelay = function (attempts) {
        // Exponential backoff: delay * 2^(attempts-1)
        return this.config.retryDelay * Math.pow(2, attempts - 1);
    };
    /**
     * Map database record to job object
     */
    SupabaseIntegrationQueue.prototype.mapDatabaseToJob = function (data) {
        return {
            id: data.id,
            type: data.type,
            integrationId: data.integration_id,
            payload: data.payload,
            priority: data.priority,
            attempts: data.attempts,
            maxAttempts: data.max_attempts,
            delay: data.delay,
            status: data.status,
            result: data.result,
            error: data.error,
            createdAt: new Date(data.created_at),
            updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
            startedAt: data.started_at ? new Date(data.started_at) : undefined,
            completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
            failedAt: data.failed_at ? new Date(data.failed_at) : undefined,
            scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined
        };
    };
    return SupabaseIntegrationQueue;
}());
exports.SupabaseIntegrationQueue = SupabaseIntegrationQueue;
/**
 * Queue Factory
 * Creates appropriate queue implementation based on configuration
 */
var QueueFactory = /** @class */ (function () {
    function QueueFactory() {
    }
    /**
     * Create queue instance based on type
     */
    QueueFactory.createQueue = function (type, config, options) {
        switch (type) {
            case 'memory':
                return new MemoryIntegrationQueue(config);
            case 'supabase':
                if (!(options === null || options === void 0 ? void 0 : options.supabaseUrl) || !(options === null || options === void 0 ? void 0 : options.supabaseKey)) {
                    throw new Error('Supabase URL and key are required for Supabase queue');
                }
                return new SupabaseIntegrationQueue(options.supabaseUrl, options.supabaseKey, config);
            default:
                throw new Error("Unsupported queue type: ".concat(type));
        }
    };
    return QueueFactory;
}());
exports.QueueFactory = QueueFactory;
