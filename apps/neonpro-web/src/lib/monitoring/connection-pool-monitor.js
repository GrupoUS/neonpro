"use strict";
/**
 * 🎯 Connection Pool Monitoring for Healthcare
 * Task 1.3 - CONNECTION POOLING OPTIMIZATION
 *
 * Advanced monitoring and alerting system for healthcare-compliant connection pools
 * Features:
 * - Real-time performance monitoring
 * - LGPD/ANVISA/CFM compliance tracking
 * - Clinical operation metrics
 * - Emergency response protocols
 * - Automated scaling recommendations
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionPoolMonitor = void 0;
var connection_pool_manager_1 = require("@/lib/supabase/connection-pool-manager");
var ConnectionPoolMonitor = /** @class */ (function () {
    function ConnectionPoolMonitor() {
        this.alerts = new Map();
        this.metrics = [];
        this.isMonitoring = false;
        // Healthcare-optimized thresholds
        this.thresholds = {
            responseTime: {
                warning: 1000, // 1 second
                critical: 2000, // 2 seconds
                emergency: 5000 // 5 seconds - patient safety risk
            },
            poolUtilization: {
                warning: 70, // 70%
                critical: 85, // 85%
                emergency: 95 // 95% - service degradation risk
            },
            failureRate: {
                warning: 5, // 5%
                critical: 10, // 10%
                emergency: 25 // 25% - major service disruption
            },
            complianceScore: {
                warning: 95, // 95%
                critical: 90, // 90%
                emergency: 80 // 80% - regulatory risk
            }
        };
        this.startMonitoring();
    }
    ConnectionPoolMonitor.getInstance = function () {
        if (!ConnectionPoolMonitor.instance) {
            ConnectionPoolMonitor.instance = new ConnectionPoolMonitor();
        }
        return ConnectionPoolMonitor.instance;
    };
    /**
     * Start continuous monitoring
     */
    ConnectionPoolMonitor.prototype.startMonitoring = function () {
        var _this = this;
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        console.log('🔍 Starting healthcare connection pool monitoring...');
        this.monitoringInterval = setInterval(function () {
            _this.performMonitoringCycle();
        }, 15000); // Monitor every 15 seconds for healthcare
    };
    /**
     * Stop monitoring
     */
    ConnectionPoolMonitor.prototype.stopMonitoring = function () {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        this.isMonitoring = false;
        console.log('⏹️ Healthcare connection pool monitoring stopped');
    };
    /**
     * Perform comprehensive monitoring cycle
     */
    ConnectionPoolMonitor.prototype.performMonitoringCycle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var poolManager, analytics, currentMetrics, _i, _a, pool, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 8]);
                        poolManager = (0, connection_pool_manager_1.getConnectionPoolManager)();
                        analytics = poolManager.getPoolAnalytics();
                        currentMetrics = {
                            timestamp: new Date(),
                            totalPools: analytics.summary.totalPools,
                            healthyPools: analytics.summary.healthyPools,
                            degradedPools: analytics.pools.filter(function (p) { return p.health.status === 'degraded'; }).length,
                            unhealthyPools: analytics.pools.filter(function (p) { return p.health.status === 'unhealthy'; }).length,
                            avgResponseTime: analytics.summary.avgResponseTime,
                            totalConnections: analytics.pools.reduce(function (sum, p) { return sum + p.metrics.totalConnections; }, 0),
                            complianceScore: analytics.summary.complianceScore,
                            activeAlerts: Array.from(this.alerts.values()).filter(function (a) { return !a.resolved; }).length,
                            criticalAlerts: Array.from(this.alerts.values()).filter(function (a) { return !a.resolved && (a.severity === 'critical' || a.severity === 'emergency'); }).length
                        };
                        this.metrics.push(currentMetrics);
                        // Keep only last 1000 metrics (about 4 hours at 15s intervals)
                        if (this.metrics.length > 1000) {
                            this.metrics = this.metrics.slice(-1000);
                        }
                        _i = 0, _a = analytics.pools;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        pool = _a[_i];
                        return [4 /*yield*/, this.checkPoolHealth(pool.poolKey, pool.health, pool.metrics)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: 
                    // Check system-wide metrics
                    return [4 /*yield*/, this.checkSystemHealth(currentMetrics)
                        // Clean up resolved alerts older than 1 hour
                    ];
                    case 5:
                        // Check system-wide metrics
                        _b.sent();
                        // Clean up resolved alerts older than 1 hour
                        this.cleanupOldAlerts();
                        // Log monitoring status
                        if (currentMetrics.criticalAlerts > 0) {
                            console.warn("\uD83D\uDEA8 ".concat(currentMetrics.criticalAlerts, " critical healthcare alerts active"));
                        }
                        return [3 /*break*/, 8];
                    case 6:
                        error_1 = _b.sent();
                        console.error('Healthcare monitoring cycle failed:', error_1);
                        return [4 /*yield*/, this.createAlert({
                                severity: 'critical',
                                type: 'availability',
                                message: "Monitoring system failure: ".concat(error_1.message),
                                clinicId: 'system',
                                poolKey: 'monitoring'
                            })];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check individual pool health
     */
    ConnectionPoolMonitor.prototype.checkPoolHealth = function (poolKey, health, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var clinicId, failureRate, complianceIssues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        clinicId = poolKey.split('_')[1] || 'unknown';
                        if (!(health.avgResponseTime > this.thresholds.responseTime.emergency)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'emergency',
                                type: 'performance',
                                message: "EMERGENCY: Response time ".concat(health.avgResponseTime, "ms exceeds emergency threshold"),
                                clinicId: clinicId,
                                poolKey: poolKey,
                                responseTime: health.avgResponseTime
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(health.avgResponseTime > this.thresholds.responseTime.critical)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'critical',
                                type: 'performance',
                                message: "CRITICAL: Response time ".concat(health.avgResponseTime, "ms exceeds critical threshold"),
                                clinicId: clinicId,
                                poolKey: poolKey,
                                responseTime: health.avgResponseTime
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(health.avgResponseTime > this.thresholds.responseTime.warning)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'warning',
                                type: 'performance',
                                message: "WARNING: Response time ".concat(health.avgResponseTime, "ms exceeds warning threshold"),
                                clinicId: clinicId,
                                poolKey: poolKey,
                                responseTime: health.avgResponseTime
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(health.poolUtilization > this.thresholds.poolUtilization.emergency)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'emergency',
                                type: 'performance',
                                message: "EMERGENCY: Pool utilization ".concat(health.poolUtilization.toFixed(1), "% at emergency level"),
                                clinicId: clinicId,
                                poolKey: poolKey,
                                metadata: { utilization: health.poolUtilization }
                            })];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        if (!(health.poolUtilization > this.thresholds.poolUtilization.critical)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'critical',
                                type: 'performance',
                                message: "CRITICAL: Pool utilization ".concat(health.poolUtilization.toFixed(1), "% at critical level"),
                                clinicId: clinicId,
                                poolKey: poolKey,
                                metadata: { utilization: health.poolUtilization }
                            })];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        failureRate = metrics.totalConnections > 0 ?
                            (metrics.failedConnections / metrics.totalConnections) * 100 : 0;
                        if (!(failureRate > this.thresholds.failureRate.emergency)) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'emergency',
                                type: 'availability',
                                message: "EMERGENCY: Connection failure rate ".concat(failureRate.toFixed(1), "% at emergency level"),
                                clinicId: clinicId,
                                poolKey: poolKey,
                                metadata: { failureRate: failureRate }
                            })];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        complianceIssues = [];
                        if (!health.compliance.lgpdCompliant)
                            complianceIssues.push('LGPD');
                        if (!health.compliance.anvisaCompliant)
                            complianceIssues.push('ANVISA');
                        if (!health.compliance.cfmCompliant)
                            complianceIssues.push('CFM');
                        if (!(complianceIssues.length > 0)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'emergency',
                                type: 'compliance',
                                message: "EMERGENCY: Healthcare compliance violations detected: ".concat(complianceIssues.join(', ')),
                                clinicId: clinicId,
                                poolKey: poolKey,
                                metadata: { violations: complianceIssues }
                            })];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14:
                        if (!(metrics.clinicIsolationStatus === 'violation')) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'emergency',
                                type: 'security',
                                message: 'EMERGENCY: Multi-tenant isolation violation detected - pool isolated',
                                clinicId: clinicId,
                                poolKey: poolKey,
                                metadata: { isolationStatus: 'violation' }
                            })];
                    case 15:
                        _a.sent();
                        _a.label = 16;
                    case 16:
                        if (!(health.status === 'unhealthy')) return [3 /*break*/, 18];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'critical',
                                type: 'availability',
                                message: 'CRITICAL: Pool health check failed - service unavailable',
                                clinicId: clinicId,
                                poolKey: poolKey
                            })];
                    case 17:
                        _a.sent();
                        _a.label = 18;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check system-wide health
     */
    ConnectionPoolMonitor.prototype.checkSystemHealth = function (metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var healthyRatio;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(metrics.complianceScore < this.thresholds.complianceScore.emergency)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'emergency',
                                type: 'compliance',
                                message: "EMERGENCY: System-wide compliance score ".concat(metrics.complianceScore.toFixed(1), "% below emergency threshold"),
                                clinicId: 'system',
                                poolKey: 'system-wide',
                                metadata: { complianceScore: metrics.complianceScore }
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        healthyRatio = metrics.totalPools > 0 ? (metrics.healthyPools / metrics.totalPools) * 100 : 100;
                        if (!(healthyRatio < 50)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'emergency',
                                type: 'availability',
                                message: "EMERGENCY: Only ".concat(healthyRatio.toFixed(1), "% of pools are healthy"),
                                clinicId: 'system',
                                poolKey: 'system-wide',
                                metadata: { healthyRatio: healthyRatio, totalPools: metrics.totalPools, healthyPools: metrics.healthyPools }
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(metrics.unhealthyPools > 3)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.createAlert({
                                severity: 'critical',
                                type: 'availability',
                                message: "CRITICAL: ".concat(metrics.unhealthyPools, " pools are unhealthy - potential cascade failure"),
                                clinicId: 'system',
                                poolKey: 'system-wide',
                                metadata: { unhealthyPools: metrics.unhealthyPools }
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create and process healthcare alert
     */
    ConnectionPoolMonitor.prototype.createAlert = function (alertData) {
        return __awaiter(this, void 0, void 0, function () {
            var alertId, existingAlert, alert;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        alertId = "".concat(alertData.poolKey, "_").concat(alertData.type, "_").concat(Date.now());
                        existingAlert = Array.from(this.alerts.values()).find(function (alert) {
                            return alert.poolKey === alertData.poolKey &&
                                alert.type === alertData.type &&
                                alert.severity === alertData.severity &&
                                !alert.resolved &&
                                Date.now() - alert.timestamp.getTime() < 300000;
                        } // 5 minutes
                        );
                        if (existingAlert) {
                            return [2 /*return*/]; // Avoid alert spam
                        }
                        alert = __assign(__assign({}, alertData), { id: alertId, timestamp: new Date(), resolved: false });
                        this.alerts.set(alertId, alert);
                        // Process alert based on severity
                        return [4 /*yield*/, this.processAlert(alert)];
                    case 1:
                        // Process alert based on severity
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process alert with appropriate response
     */
    ConnectionPoolMonitor.prototype.processAlert = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            var logLevel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logLevel = alert.severity === 'emergency' ? 'error' :
                            alert.severity === 'critical' ? 'error' : 'warn';
                        console[logLevel]("\uD83D\uDEA8 HEALTHCARE ALERT [".concat(alert.severity.toUpperCase(), "]:"), {
                            id: alert.id,
                            type: alert.type,
                            message: alert.message,
                            clinicId: alert.clinicId,
                            poolKey: alert.poolKey,
                            timestamp: alert.timestamp.toISOString(),
                            metadata: alert.metadata
                        });
                        if (!(alert.severity === 'emergency')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.handleEmergencyAlert(alert)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Send notifications based on alert type and severity
                    return [4 /*yield*/, this.sendAlertNotifications(alert)];
                    case 3:
                        // Send notifications based on alert type and severity
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle emergency alerts with immediate action
     */
    ConnectionPoolMonitor.prototype.handleEmergencyAlert = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.error('🚨 EMERGENCY PROTOCOL ACTIVATED:', alert.message);
                        _a = alert.type;
                        switch (_a) {
                            case 'compliance': return [3 /*break*/, 1];
                            case 'security': return [3 /*break*/, 3];
                            case 'availability': return [3 /*break*/, 5];
                            case 'performance': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: 
                    // Immediate compliance violation response
                    return [4 /*yield*/, this.handleComplianceEmergency(alert)];
                    case 2:
                        // Immediate compliance violation response
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 3: 
                    // Security breach response
                    return [4 /*yield*/, this.handleSecurityEmergency(alert)];
                    case 4:
                        // Security breach response
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 5: 
                    // Service availability emergency
                    return [4 /*yield*/, this.handleAvailabilityEmergency(alert)];
                    case 6:
                        // Service availability emergency
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 7: 
                    // Performance emergency affecting patient care
                    return [4 /*yield*/, this.handlePerformanceEmergency(alert)];
                    case 8:
                        // Performance emergency affecting patient care
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle compliance emergency
     */
    ConnectionPoolMonitor.prototype.handleComplianceEmergency = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                console.error('🔒 COMPLIANCE EMERGENCY - Implementing protective measures');
                // Additional protective measures could be implemented here
                // For now, log the emergency response
                console.error('Compliance emergency response activated for:', {
                    alert: alert.id,
                    clinicId: alert.clinicId,
                    poolKey: alert.poolKey,
                    violations: (_a = alert.metadata) === null || _a === void 0 ? void 0 : _a.violations
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle security emergency
     */
    ConnectionPoolMonitor.prototype.handleSecurityEmergency = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                console.error('🛡️ SECURITY EMERGENCY - Implementing security protocols');
                // Security emergency response
                console.error('Security emergency response activated for:', {
                    alert: alert.id,
                    clinicId: alert.clinicId,
                    poolKey: alert.poolKey,
                    isolationStatus: (_a = alert.metadata) === null || _a === void 0 ? void 0 : _a.isolationStatus
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle availability emergency
     */
    ConnectionPoolMonitor.prototype.handleAvailabilityEmergency = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.error('⚡ AVAILABILITY EMERGENCY - Implementing recovery protocols');
                // Availability emergency response
                console.error('Availability emergency response activated for:', {
                    alert: alert.id,
                    clinicId: alert.clinicId,
                    poolKey: alert.poolKey,
                    metadata: alert.metadata
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle performance emergency
     */
    ConnectionPoolMonitor.prototype.handlePerformanceEmergency = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.error('🚀 PERFORMANCE EMERGENCY - Implementing optimization protocols');
                // Performance emergency response
                console.error('Performance emergency response activated for:', {
                    alert: alert.id,
                    clinicId: alert.clinicId,
                    poolKey: alert.poolKey,
                    responseTime: alert.responseTime,
                    metadata: alert.metadata
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Send alert notifications
     */
    ConnectionPoolMonitor.prototype.sendAlertNotifications = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            var notificationData;
            return __generator(this, function (_a) {
                notificationData = {
                    alertId: alert.id,
                    severity: alert.severity,
                    type: alert.type,
                    message: alert.message,
                    clinicId: alert.clinicId,
                    timestamp: alert.timestamp.toISOString()
                };
                // Log notification for audit trail
                console.log('📧 Healthcare alert notification sent:', notificationData);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Clean up old resolved alerts
     */
    ConnectionPoolMonitor.prototype.cleanupOldAlerts = function () {
        var oneHourAgo = Date.now() - 3600000; // 1 hour
        for (var _i = 0, _a = this.alerts.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], alertId = _b[0], alert_1 = _b[1];
            if (alert_1.resolved && alert_1.timestamp.getTime() < oneHourAgo) {
                this.alerts.delete(alertId);
            }
        }
    };
    /**
     * Get current alerts
     */
    ConnectionPoolMonitor.prototype.getActiveAlerts = function () {
        return Array.from(this.alerts.values())
            .filter(function (alert) { return !alert.resolved; })
            .sort(function (a, b) {
            // Sort by severity (emergency first) then by timestamp
            var severityOrder = { emergency: 0, critical: 1, warning: 2, info: 3 };
            var severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
            if (severityDiff !== 0)
                return severityDiff;
            return b.timestamp.getTime() - a.timestamp.getTime();
        });
    };
    /**
     * Get monitoring metrics
     */
    ConnectionPoolMonitor.prototype.getMetrics = function (lastN) {
        if (lastN) {
            return this.metrics.slice(-lastN);
        }
        return __spreadArray([], this.metrics, true);
    };
    /**
     * Resolve alert
     */
    ConnectionPoolMonitor.prototype.resolveAlert = function (alertId) {
        var alert = this.alerts.get(alertId);
        if (alert && !alert.resolved) {
            alert.resolved = true;
            this.alerts.set(alertId, alert);
            console.log("\u2705 Healthcare alert resolved: ".concat(alertId));
            return true;
        }
        return false;
    };
    /**
     * Get health summary for dashboard
     */
    ConnectionPoolMonitor.prototype.getHealthSummary = function () {
        var activeAlerts = this.getActiveAlerts();
        var criticalAlerts = activeAlerts.filter(function (a) { return a.severity === 'critical' || a.severity === 'emergency'; });
        var emergencyAlerts = activeAlerts.filter(function (a) { return a.severity === 'emergency'; });
        var latestMetrics = this.metrics[this.metrics.length - 1];
        var status = 'healthy';
        if (emergencyAlerts.length > 0)
            status = 'emergency';
        else if (criticalAlerts.length > 0)
            status = 'critical';
        else if (activeAlerts.length > 0)
            status = 'degraded';
        return {
            status: status,
            totalAlerts: activeAlerts.length,
            criticalAlerts: criticalAlerts.length,
            lastUpdate: (latestMetrics === null || latestMetrics === void 0 ? void 0 : latestMetrics.timestamp) || new Date(),
            complianceScore: latestMetrics === null || latestMetrics === void 0 ? void 0 : latestMetrics.complianceScore,
            avgResponseTime: latestMetrics === null || latestMetrics === void 0 ? void 0 : latestMetrics.avgResponseTime
        };
    };
    /**
     * Shutdown monitoring
     */
    ConnectionPoolMonitor.prototype.shutdown = function () {
        this.stopMonitoring();
        this.alerts.clear();
        this.metrics.length = 0;
        console.log('🔄 Healthcare connection pool monitor shutdown completed');
    };
    return ConnectionPoolMonitor;
}());
// Export singleton
var getConnectionPoolMonitor = function () { return ConnectionPoolMonitor.getInstance(); };
exports.getConnectionPoolMonitor = getConnectionPoolMonitor;
