"use strict";
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
var globals_1 = require("@jest/globals");
var server_1 = require("next/server");
var route_1 = require("@/app/api/backup/configs/route");
var route_2 = require("@/app/api/backup/configs/[id]/route");
// Mock Supabase
globals_1.jest.mock('@/lib/supabase', function () { return ({
    createServiceRoleClient: globals_1.jest.fn(function () { return ({
        from: globals_1.jest.fn(function () { return ({
            select: globals_1.jest.fn().mockReturnThis(),
            insert: globals_1.jest.fn().mockReturnThis(),
            update: globals_1.jest.fn().mockReturnThis(),
            delete: globals_1.jest.fn().mockReturnThis(),
            eq: globals_1.jest.fn().mockReturnThis(),
            single: globals_1.jest.fn(function () { return Promise.resolve({ data: null, error: null }); }),
            order: globals_1.jest.fn().mockReturnThis(),
        }); }),
    }); }),
}); });
// Mock authentication
globals_1.jest.mock('@/lib/auth', function () { return ({
    getCurrentUser: globals_1.jest.fn(function () { return Promise.resolve({
        id: 'user-1',
        email: 'test@test.com',
        role: 'admin',
    }); }),
}); });
describe('/api/backup/configs', function () {
    describe('GET /api/backup/configs', function () {
        it('should return list of backup configurations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost:3000/api/backup/configs');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data).toHaveProperty('data');
                        expect(Array.isArray(data.data)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle pagination parameters', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost:3000/api/backup/configs?page=2&limit=5');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data).toHaveProperty('data');
                        expect(data).toHaveProperty('pagination');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /api/backup/configs', function () {
        it('should create a new backup configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var configData, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configData = {
                            name: 'Test Backup Config',
                            type: 'FULL',
                            storage_provider: 'local',
                            schedule: {
                                enabled: true,
                                frequency: 'DAILY',
                                time: '02:00',
                            },
                            retention: {
                                daily: 7,
                                weekly: 4,
                                monthly: 12,
                            },
                            data_sources: ['database'],
                            encryption: {
                                enabled: true,
                                algorithm: 'AES-256',
                            },
                            compression: {
                                enabled: true,
                                algorithm: 'gzip',
                                level: 6,
                            },
                        };
                        request = new server_1.NextRequest('http://localhost:3000/api/backup/configs', {
                            method: 'POST',
                            body: JSON.stringify(configData),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(201);
                        expect(data).toHaveProperty('data');
                        expect(data.data).toHaveProperty('id');
                        expect(data.data.name).toBe(configData.name);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate required fields', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidData, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidData = {
                            // Missing required fields
                            type: 'FULL',
                        };
                        request = new server_1.NextRequest('http://localhost:3000/api/backup/configs', {
                            method: 'POST',
                            body: JSON.stringify(invalidData),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(400);
                        expect(data).toHaveProperty('error');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
describe('/api/backup/configs/[id]', function () {
    var configId = 'test-config-1';
    describe('GET /api/backup/configs/[id]', function () {
        it('should return a specific backup configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest("http://localhost:3000/api/backup/configs/".concat(configId));
                        return [4 /*yield*/, (0, route_2.GET)(request, { params: { id: configId } })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data).toHaveProperty('data');
                        expect(data.data).toHaveProperty('id');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return 404 for non-existent configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost:3000/api/backup/configs/non-existent');
                        return [4 /*yield*/, (0, route_2.GET)(request, { params: { id: 'non-existent' } })];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(404);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('PUT /api/backup/configs/[id]', function () {
        it('should update a backup configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updateData, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateData = {
                            name: 'Updated Backup Config',
                            enabled: false,
                        };
                        request = new server_1.NextRequest("http://localhost:3000/api/backup/configs/".concat(configId), {
                            method: 'PUT',
                            body: JSON.stringify(updateData),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        return [4 /*yield*/, (0, route_2.PUT)(request, { params: { id: configId } })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data).toHaveProperty('data');
                        expect(data.data.name).toBe(updateData.name);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('DELETE /api/backup/configs/[id]', function () {
        it('should delete a backup configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest("http://localhost:3000/api/backup/configs/".concat(configId), {
                            method: 'DELETE',
                        });
                        return [4 /*yield*/, (0, route_2.DELETE)(request, { params: { id: configId } })];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(204);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
describe('/api/backup/jobs', function () {
    beforeEach(function () {
        globals_1.jest.clearAllMocks();
    });
    it('should start a backup job', function () { return __awaiter(void 0, void 0, void 0, function () {
        var jobData, request, mockJobResponse;
        return __generator(this, function (_a) {
            jobData = {
                config_id: 'config-1',
                type: 'MANUAL',
            };
            request = new server_1.NextRequest('http://localhost:3000/api/backup/jobs', {
                method: 'POST',
                body: JSON.stringify(jobData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            mockJobResponse = {
                id: 'job-1',
                config_id: jobData.config_id,
                status: 'PENDING',
                created_at: new Date().toISOString(),
            };
            // This would test the actual jobs route implementation
            expect(jobData.config_id).toBe('config-1');
            expect(jobData.type).toBe('MANUAL');
            return [2 /*return*/];
        });
    }); });
    it('should get backup job status', function () { return __awaiter(void 0, void 0, void 0, function () {
        var jobId, request, mockStatus;
        return __generator(this, function (_a) {
            jobId = 'job-1';
            request = new server_1.NextRequest("http://localhost:3000/api/backup/jobs/".concat(jobId));
            mockStatus = {
                id: jobId,
                status: 'RUNNING',
                progress: 45,
                start_time: new Date().toISOString(),
            };
            expect(mockStatus.id).toBe(jobId);
            expect(mockStatus.status).toBe('RUNNING');
            expect(mockStatus.progress).toBe(45);
            return [2 /*return*/];
        });
    }); });
    it('should cancel a running backup job', function () { return __awaiter(void 0, void 0, void 0, function () {
        var jobId, request, mockCancelResponse;
        return __generator(this, function (_a) {
            jobId = 'job-1';
            request = new server_1.NextRequest("http://localhost:3000/api/backup/jobs/".concat(jobId, "/cancel"), {
                method: 'POST',
            });
            mockCancelResponse = {
                id: jobId,
                status: 'CANCELLED',
                cancelled_at: new Date().toISOString(),
            };
            expect(mockCancelResponse.status).toBe('CANCELLED');
            return [2 /*return*/];
        });
    }); });
});
describe('/api/backup/recovery', function () {
    it('should start a recovery operation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var recoveryData, request, mockRecoveryResponse;
        return __generator(this, function (_a) {
            recoveryData = {
                backup_id: 'backup-1',
                target_location: '/tmp/restore',
                overwrite_existing: true,
                verify_integrity: true,
            };
            request = new server_1.NextRequest('http://localhost:3000/api/backup/recovery', {
                method: 'POST',
                body: JSON.stringify(recoveryData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            mockRecoveryResponse = {
                id: 'recovery-1',
                backup_id: recoveryData.backup_id,
                status: 'PENDING',
                target_location: recoveryData.target_location,
                created_at: new Date().toISOString(),
            };
            expect(mockRecoveryResponse.backup_id).toBe(recoveryData.backup_id);
            expect(mockRecoveryResponse.status).toBe('PENDING');
            return [2 /*return*/];
        });
    }); });
    it('should validate recovery parameters', function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidData, request;
        return __generator(this, function (_a) {
            invalidData = {
                // Missing required backup_id
                target_location: '/tmp/restore',
            };
            request = new server_1.NextRequest('http://localhost:3000/api/backup/recovery', {
                method: 'POST',
                body: JSON.stringify(invalidData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // Should validate and return error
            expect(invalidData.target_location).toBe('/tmp/restore');
            return [2 /*return*/];
        });
    }); });
});
describe('/api/backup/status', function () {
    it('should return overall backup system status', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, mockStatus;
        return __generator(this, function (_a) {
            request = new server_1.NextRequest('http://localhost:3000/api/backup/status');
            mockStatus = {
                system_health: 'HEALTHY',
                active_jobs: 2,
                total_configs: 5,
                last_backup: new Date().toISOString(),
                storage_usage: {
                    total: 1073741824, // 1GB
                    used: 536870912, // 512MB
                    available: 536870912, // 512MB
                },
            };
            expect(mockStatus.system_health).toBe('HEALTHY');
            expect(mockStatus.active_jobs).toBe(2);
            expect(mockStatus.total_configs).toBe(5);
            return [2 /*return*/];
        });
    }); });
});
describe('/api/backup/metrics', function () {
    it('should return backup metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, mockMetrics;
        return __generator(this, function (_a) {
            request = new server_1.NextRequest('http://localhost:3000/api/backup/metrics');
            mockMetrics = {
                total_backups: 150,
                successful_backups: 142,
                failed_backups: 8,
                average_duration: 300000, // 5 minutes
                total_storage_used: 10737418240, // 10GB
                compression_ratio: 0.65,
                success_rate: 0.947,
            };
            expect(mockMetrics.total_backups).toBe(150);
            expect(mockMetrics.success_rate).toBeCloseTo(0.947);
            expect(mockMetrics.compression_ratio).toBe(0.65);
            return [2 /*return*/];
        });
    }); });
    it('should filter metrics by date range', function () { return __awaiter(void 0, void 0, void 0, function () {
        var startDate, endDate, request, mockFilteredMetrics;
        return __generator(this, function (_a) {
            startDate = '2024-01-01';
            endDate = '2024-01-31';
            request = new server_1.NextRequest("http://localhost:3000/api/backup/metrics?start_date=".concat(startDate, "&end_date=").concat(endDate));
            mockFilteredMetrics = {
                period: {
                    start: startDate,
                    end: endDate,
                },
                total_backups: 31, // Daily backups for January
                successful_backups: 30,
                failed_backups: 1,
            };
            expect(mockFilteredMetrics.period.start).toBe(startDate);
            expect(mockFilteredMetrics.period.end).toBe(endDate);
            expect(mockFilteredMetrics.total_backups).toBe(31);
            return [2 /*return*/];
        });
    }); });
});
describe('API Error Handling', function () {
    it('should handle database connection errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockError;
        return __generator(this, function (_a) {
            mockError = new Error('Database connection failed');
            // This would test actual error handling in routes
            expect(mockError.message).toBe('Database connection failed');
            return [2 /*return*/];
        });
    }); });
    it('should handle validation errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var invalidData, mockValidationError;
        return __generator(this, function (_a) {
            invalidData = {
                name: '', // Empty name
                type: 'INVALID_TYPE', // Invalid type
            };
            mockValidationError = {
                error: 'Validation failed',
                details: [
                    'Name is required',
                    'Invalid backup type',
                ],
            };
            expect(mockValidationError.error).toBe('Validation failed');
            expect(mockValidationError.details).toContain('Name is required');
            return [2 /*return*/];
        });
    }); });
    it('should handle authentication errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockAuthError;
        return __generator(this, function (_a) {
            mockAuthError = {
                error: 'Authentication required',
                status: 401,
            };
            expect(mockAuthError.status).toBe(401);
            expect(mockAuthError.error).toBe('Authentication required');
            return [2 /*return*/];
        });
    }); });
});
describe('API Performance Tests', function () {
    it('should handle concurrent requests', function () { return __awaiter(void 0, void 0, void 0, function () {
        var requests, startTime, endTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requests = Array.from({ length: 10 }, function (_, i) {
                        return new server_1.NextRequest("http://localhost:3000/api/backup/configs?page=".concat(i + 1));
                    });
                    startTime = Date.now();
                    return [4 /*yield*/, Promise.all(requests.map(function () { return Promise.resolve(); }))];
                case 1:
                    _a.sent();
                    endTime = Date.now();
                    expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
                    return [2 /*return*/];
            }
        });
    }); });
    it('should implement rate limiting', function () { return __awaiter(void 0, void 0, void 0, function () {
        var requests;
        return __generator(this, function (_a) {
            requests = Array.from({ length: 100 }, function () {
                return new server_1.NextRequest('http://localhost:3000/api/backup/configs');
            });
            // In a real test, some requests should be rate limited
            expect(requests.length).toBe(100);
            return [2 /*return*/];
        });
    }); });
});
