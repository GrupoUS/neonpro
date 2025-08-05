"use strict";
/**
 * AI-Powered Automatic Scheduling System
 * Story 2.3: AI-Powered Automatic Scheduling Implementation
 *
 * This is the main entry point for the AI scheduling system that integrates:
 * - AI Scheduling Core Algorithm
 * - Advanced Optimization Engine
 * - Real-time Adaptive Scheduling
 * - Compliance and Rules Engine
 *
 * Features:
 * - Intelligent appointment scheduling with AI optimization
 * - Real-time conflict resolution and adaptive rescheduling
 * - Comprehensive compliance validation (Brazilian healthcare regulations)
 * - Multi-objective optimization (patient satisfaction, revenue, efficiency)
 * - Predictive scheduling adjustments
 * - Emergency scheduling protocols
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
exports.AISchedulingSystem = void 0;
var client_1 = require("@/lib/supabase/client");
var ai_scheduling_core_1 = require("./ai-scheduling-core");
var optimization_engine_1 = require("./optimization-engine");
var real_time_adaptive_1 = require("./real-time-adaptive");
var compliance_rules_engine_1 = require("./compliance-rules-engine");
var AISchedulingSystem = /** @class */ (function () {
    function AISchedulingSystem(config) {
        this.supabase = (0, client_1.createClient)();
        this.eventListeners = new Map();
        // Initialize with default configuration
        this.config = __assign({ enableRealTimeAdaptive: true, enableComplianceValidation: true, enableOptimization: true, optimizationWeights: {
                patientSatisfaction: 0.3,
                revenueOptimization: 0.25,
                staffEfficiency: 0.25,
                resourceUtilization: 0.2
            }, realTimeSettings: {
                monitoringInterval: 30000, // 30 seconds
                conflictResolutionTimeout: 300000, // 5 minutes
                predictiveAdjustmentWindow: 3600000 // 1 hour
            }, complianceSettings: {
                strictMode: true,
                allowOverrides: false,
                requireApprovals: true
            } }, config);
        // Initialize components
        this.aiCore = new ai_scheduling_core_1.AISchedulingCore();
        this.optimizationEngine = new optimization_engine_1.OptimizationEngine();
        this.realTimeAdaptive = new real_time_adaptive_1.RealTimeAdaptiveScheduling();
        this.complianceEngine = new compliance_rules_engine_1.ComplianceRulesEngine();
        // Setup event listeners
        this.setupEventListeners();
    }
    /**
     * Main scheduling method - processes a scheduling request
     */
    AISchedulingSystem.prototype.scheduleAppointment = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, algorithmsUsed, warnings, errors, initialRecommendations, optimizedRecommendations, optimizationResult, complianceResult, compliantRecommendations, validatedRecommendations, _i, optimizedRecommendations_1, recommendation, validation, alternatives, confidenceScore, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        algorithmsUsed = [];
                        warnings = [];
                        errors = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 13, , 14]);
                        // Emit scheduling start event
                        this.emitEvent({
                            id: "schedule-".concat(Date.now()),
                            type: 'request',
                            status: 'processing',
                            timestamp: new Date(),
                            data: request
                        });
                        // Step 1: Generate initial recommendations using AI Core
                        algorithmsUsed.push('AI Core Algorithm');
                        return [4 /*yield*/, this.aiCore.generateRecommendations(request.criteria, request.preferences)];
                    case 2:
                        initialRecommendations = _a.sent();
                        if (initialRecommendations.length === 0) {
                            return [2 /*return*/, {
                                    success: false,
                                    recommendations: [],
                                    alternatives: [],
                                    warnings: ['No available time slots found for the specified criteria'],
                                    errors: [],
                                    metadata: {
                                        processingTime: Date.now() - startTime,
                                        algorithmsUsed: algorithmsUsed,
                                        confidenceScore: 0
                                    }
                                }];
                        }
                        optimizedRecommendations = initialRecommendations;
                        optimizationResult = void 0;
                        if (!this.config.enableOptimization) return [3 /*break*/, 4];
                        algorithmsUsed.push('Multi-Objective Optimization');
                        return [4 /*yield*/, this.optimizationEngine.optimizeSchedule(initialRecommendations, request.criteria, this.config.optimizationWeights)];
                    case 3:
                        optimizationResult = _a.sent();
                        optimizedRecommendations = optimizationResult.optimizedRecommendations;
                        _a.label = 4;
                    case 4:
                        complianceResult = void 0;
                        compliantRecommendations = optimizedRecommendations;
                        if (!this.config.enableComplianceValidation) return [3 /*break*/, 9];
                        algorithmsUsed.push('Compliance Validation');
                        validatedRecommendations = [];
                        _i = 0, optimizedRecommendations_1 = optimizedRecommendations;
                        _a.label = 5;
                    case 5:
                        if (!(_i < optimizedRecommendations_1.length)) return [3 /*break*/, 8];
                        recommendation = optimizedRecommendations_1[_i];
                        return [4 /*yield*/, this.complianceEngine.validateCompliance(recommendation, request.criteria, request.context)];
                    case 6:
                        validation = _a.sent();
                        if (validation.isCompliant || !this.config.complianceSettings.strictMode) {
                            validatedRecommendations.push(recommendation);
                        }
                        else {
                            warnings.push("Recommendation excluded due to compliance violations: ".concat(validation.violations.map(function (v) { return v.description; }).join(', ')));
                        }
                        // Store the first compliance result for response
                        if (!complianceResult) {
                            complianceResult = validation;
                        }
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8:
                        compliantRecommendations = validatedRecommendations;
                        _a.label = 9;
                    case 9: return [4 /*yield*/, this.generateAlternatives(request, compliantRecommendations)
                        // Step 5: Calculate confidence score
                    ];
                    case 10:
                        alternatives = _a.sent();
                        confidenceScore = this.calculateConfidenceScore(compliantRecommendations, optimizationResult, complianceResult);
                        if (!(this.config.enableRealTimeAdaptive && compliantRecommendations.length > 0)) return [3 /*break*/, 12];
                        algorithmsUsed.push('Real-time Adaptive Monitoring');
                        return [4 /*yield*/, this.setupRealTimeMonitoring(compliantRecommendations[0], request)];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        response = {
                            success: compliantRecommendations.length > 0,
                            recommendations: compliantRecommendations,
                            optimizationResult: optimizationResult,
                            complianceResult: complianceResult,
                            alternatives: alternatives,
                            warnings: warnings,
                            errors: errors,
                            metadata: {
                                processingTime: Date.now() - startTime,
                                algorithmsUsed: algorithmsUsed,
                                confidenceScore: confidenceScore,
                                nextAvailableSlot: alternatives.length > 0 ? alternatives[0].timeSlot.startTime : undefined
                            }
                        };
                        // Emit completion event
                        this.emitEvent({
                            id: "schedule-".concat(Date.now()),
                            type: 'completion',
                            status: response.success ? 'completed' : 'failed',
                            timestamp: new Date(),
                            data: response
                        });
                        return [2 /*return*/, response];
                    case 13:
                        error_1 = _a.sent();
                        console.error('Error in AI scheduling system:', error_1);
                        errors.push("System error: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                        return [2 /*return*/, {
                                success: false,
                                recommendations: [],
                                alternatives: [],
                                warnings: warnings,
                                errors: errors,
                                metadata: {
                                    processingTime: Date.now() - startTime,
                                    algorithmsUsed: algorithmsUsed,
                                    confidenceScore: 0
                                }
                            }];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reschedule an existing appointment
     */
    AISchedulingSystem.prototype.rescheduleAppointment = function (appointmentId, newCriteria, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var appointment, request, response, newRecommendation, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.supabase
                                .from('appointments')
                                .select('*')
                                .eq('id', appointmentId)
                                .single()];
                    case 1:
                        appointment = (_a.sent()).data;
                        if (!appointment) {
                            throw new Error('Appointment not found');
                        }
                        request = {
                            criteria: {
                                patientId: appointment.patient_id,
                                treatmentId: appointment.treatment_id,
                                preferredDate: newCriteria.preferredDate || new Date(appointment.scheduled_date),
                                urgencyLevel: newCriteria.urgencyLevel || appointment.urgency_level,
                                duration: newCriteria.duration || appointment.duration_minutes,
                                isFollowUp: newCriteria.isFollowUp || appointment.is_follow_up,
                                specialRequirements: newCriteria.specialRequirements || appointment.special_requirements
                            },
                            context: {
                                isReschedule: true,
                                originalAppointmentId: appointmentId,
                                urgencyReason: reason
                            }
                        };
                        return [4 /*yield*/, this.scheduleAppointment(request)
                            // If successful, update the original appointment
                        ];
                    case 2:
                        response = _a.sent();
                        if (!(response.success && response.recommendations.length > 0)) return [3 /*break*/, 4];
                        newRecommendation = response.recommendations[0];
                        return [4 /*yield*/, this.supabase
                                .from('appointments')
                                .update({
                                scheduled_date: newRecommendation.timeSlot.startTime.toISOString(),
                                staff_id: newRecommendation.staffId,
                                room_id: newRecommendation.roomId,
                                updated_at: new Date().toISOString(),
                                reschedule_reason: reason
                            })
                                .eq('id', appointmentId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, response];
                    case 5:
                        error_2 = _a.sent();
                        console.error('Error rescheduling appointment:', error_2);
                        throw new Error('Failed to reschedule appointment');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel an appointment and handle real-time adjustments
     */
    AISchedulingSystem.prototype.cancelAppointment = function (appointmentId_1, reason_1) {
        return __awaiter(this, arguments, void 0, function (appointmentId, reason, notifyPatient) {
            var appointment, error_3;
            if (notifyPatient === void 0) { notifyPatient = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('appointments')
                                .select('*')
                                .eq('id', appointmentId)
                                .single()];
                    case 1:
                        appointment = (_a.sent()).data;
                        if (!appointment) {
                            throw new Error('Appointment not found');
                        }
                        // Update appointment status
                        return [4 /*yield*/, this.supabase
                                .from('appointments')
                                .update({
                                status: 'cancelled',
                                cancellation_reason: reason,
                                cancelled_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', appointmentId)
                            // Trigger real-time adaptive adjustments
                        ];
                    case 2:
                        // Update appointment status
                        _a.sent();
                        if (!this.config.enableRealTimeAdaptive) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.realTimeAdaptive.handleAppointmentCancellation({
                                appointmentId: appointmentId,
                                scheduledTime: new Date(appointment.scheduled_date),
                                staffId: appointment.staff_id,
                                roomId: appointment.room_id,
                                reason: reason
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!notifyPatient) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.notifyPatientCancellation(appointment.patient_id, appointmentId, reason)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_3 = _a.sent();
                        console.error('Error cancelling appointment:', error_3);
                        throw new Error('Failed to cancel appointment');
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get scheduling analytics and insights
     */
    AISchedulingSystem.prototype.getSchedulingAnalytics = function (dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            var appointments, validations, totalAppointments, successfulSchedules, rescheduledAppointments, cancelledAppointments, averageComplianceScore, recommendations, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('appointments')
                                .select('*')
                                .gte('created_at', dateRange.start.toISOString())
                                .lte('created_at', dateRange.end.toISOString())
                            // Get compliance validations
                        ];
                    case 1:
                        appointments = (_a.sent()).data;
                        return [4 /*yield*/, this.supabase
                                .from('compliance_validations')
                                .select('*')
                                .gte('created_at', dateRange.start.toISOString())
                                .lte('created_at', dateRange.end.toISOString())
                            // Calculate metrics
                        ];
                    case 2:
                        validations = (_a.sent()).data;
                        totalAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.length) || 0;
                        successfulSchedules = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.status === 'scheduled'; }).length) || 0;
                        rescheduledAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.reschedule_reason; }).length) || 0;
                        cancelledAppointments = (appointments === null || appointments === void 0 ? void 0 : appointments.filter(function (a) { return a.status === 'cancelled'; }).length) || 0;
                        averageComplianceScore = (validations === null || validations === void 0 ? void 0 : validations.reduce(function (sum, v) { return sum + (v.compliance_score || 0); }, 0)) / ((validations === null || validations === void 0 ? void 0 : validations.length) || 1);
                        recommendations = this.generateAnalyticsRecommendations({
                            totalAppointments: totalAppointments,
                            successfulSchedules: successfulSchedules,
                            rescheduledAppointments: rescheduledAppointments,
                            cancelledAppointments: cancelledAppointments,
                            averageComplianceScore: averageComplianceScore
                        });
                        return [2 /*return*/, {
                                totalAppointments: totalAppointments,
                                successfulSchedules: successfulSchedules,
                                rescheduledAppointments: rescheduledAppointments,
                                cancelledAppointments: cancelledAppointments,
                                averageProcessingTime: 2500, // Placeholder - would be calculated from actual data
                                complianceScore: averageComplianceScore,
                                optimizationMetrics: {
                                    patientSatisfactionScore: 85, // Placeholder - would be calculated from patient feedback
                                    revenueOptimization: 78, // Placeholder - would be calculated from revenue data
                                    staffEfficiencyScore: 82, // Placeholder - would be calculated from staff utilization
                                    resourceUtilizationScore: 76 // Placeholder - would be calculated from resource usage
                                },
                                topViolations: [], // Placeholder - would be calculated from compliance data
                                recommendations: recommendations
                            }];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error getting scheduling analytics:', error_4);
                        throw new Error('Failed to get scheduling analytics');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate alternatives for scheduling
     */
    AISchedulingSystem.prototype.generateAlternatives = function (request, primaryRecommendations) {
        return __awaiter(this, void 0, void 0, function () {
            var alternativeCriteria, alternatives_1, relaxedCriteria, alternatives, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(primaryRecommendations.length > 0)) return [3 /*break*/, 2];
                        alternativeCriteria = __assign(__assign({}, request.criteria), { preferredDate: new Date(request.criteria.preferredDate.getTime() + 24 * 60 * 60 * 1000) // Next day
                         });
                        return [4 /*yield*/, this.aiCore.generateRecommendations(alternativeCriteria, request.preferences)];
                    case 1:
                        alternatives_1 = _a.sent();
                        return [2 /*return*/, alternatives_1.slice(0, 3)]; // Return top 3 alternatives
                    case 2:
                        relaxedCriteria = __assign(__assign({}, request.criteria), { urgencyLevel: 'normal', duration: Math.max(30, request.criteria.duration - 15) // Reduce duration slightly
                         });
                        return [4 /*yield*/, this.aiCore.generateRecommendations(relaxedCriteria, __assign(__assign({}, request.preferences), { allowAlternatives: true }))];
                    case 3:
                        alternatives = _a.sent();
                        return [2 /*return*/, alternatives.slice(0, 5)]; // Return top 5 alternatives
                    case 4:
                        error_5 = _a.sent();
                        console.error('Error generating alternatives:', error_5);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate confidence score for recommendations
     */
    AISchedulingSystem.prototype.calculateConfidenceScore = function (recommendations, optimizationResult, complianceResult) {
        if (recommendations.length === 0)
            return 0;
        var score = 70; // Base score
        // Add points for optimization
        if (optimizationResult) {
            score += optimizationResult.improvementPercentage * 0.2;
        }
        // Add points for compliance
        if (complianceResult) {
            score += complianceResult.complianceScore * 0.3;
        }
        // Add points for recommendation quality
        var avgRecommendationScore = recommendations.reduce(function (sum, r) { return sum + r.score; }, 0) / recommendations.length;
        score += avgRecommendationScore * 0.1;
        return Math.min(100, Math.max(0, score));
    };
    /**
     * Setup real-time monitoring for a scheduled appointment
     */
    AISchedulingSystem.prototype.setupRealTimeMonitoring = function (recommendation, request) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.realTimeAdaptive.monitorAppointment({
                                appointmentId: "temp-".concat(Date.now()), // Would be actual appointment ID
                                scheduledTime: recommendation.timeSlot.startTime,
                                staffId: recommendation.staffId,
                                roomId: recommendation.roomId,
                                patientId: request.criteria.patientId,
                                treatmentId: request.criteria.treatmentId
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error setting up real-time monitoring:', error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Setup event listeners for system components
     */
    AISchedulingSystem.prototype.setupEventListeners = function () {
        var _this = this;
        // Listen for real-time adaptive events
        this.realTimeAdaptive.on('conflict_detected', function (data) {
            _this.emitEvent({
                id: "conflict-".concat(Date.now()),
                type: 'conflict',
                status: 'processing',
                timestamp: new Date(),
                data: data
            });
        });
        this.realTimeAdaptive.on('auto_rescheduled', function (data) {
            _this.emitEvent({
                id: "reschedule-".concat(Date.now()),
                type: 'recommendation',
                status: 'completed',
                timestamp: new Date(),
                data: data
            });
        });
    };
    /**
     * Emit scheduling event
     */
    AISchedulingSystem.prototype.emitEvent = function (event) {
        var listeners = this.eventListeners.get(event.type) || [];
        listeners.forEach(function (listener) {
            try {
                listener(event);
            }
            catch (error) {
                console.error('Error in event listener:', error);
            }
        });
    };
    /**
     * Add event listener
     */
    AISchedulingSystem.prototype.on = function (eventType, listener) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(listener);
    };
    /**
     * Remove event listener
     */
    AISchedulingSystem.prototype.off = function (eventType, listener) {
        var listeners = this.eventListeners.get(eventType);
        if (listeners) {
            var index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    };
    /**
     * Notify patient of cancellation
     */
    AISchedulingSystem.prototype.notifyPatientCancellation = function (patientId, appointmentId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This would integrate with notification system
                    console.log("Notifying patient ".concat(patientId, " of appointment ").concat(appointmentId, " cancellation: ").concat(reason));
                    // Could send email, SMS, push notification, etc.
                    // await notificationService.sendCancellationNotification(patientId, appointmentId, reason)
                }
                catch (error) {
                    console.error('Error notifying patient:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Generate analytics recommendations
     */
    AISchedulingSystem.prototype.generateAnalyticsRecommendations = function (metrics) {
        var recommendations = [];
        var successRate = metrics.successfulSchedules / metrics.totalAppointments;
        var rescheduleRate = metrics.rescheduledAppointments / metrics.totalAppointments;
        var cancellationRate = metrics.cancelledAppointments / metrics.totalAppointments;
        if (successRate < 0.8) {
            recommendations.push('Consider adjusting scheduling criteria to improve success rate');
        }
        if (rescheduleRate > 0.15) {
            recommendations.push('High reschedule rate detected - review scheduling accuracy');
        }
        if (cancellationRate > 0.1) {
            recommendations.push('High cancellation rate - consider implementing confirmation reminders');
        }
        if (metrics.averageComplianceScore < 85) {
            recommendations.push('Compliance score below target - review and update compliance rules');
        }
        if (recommendations.length === 0) {
            recommendations.push('System performance is optimal - continue current practices');
        }
        return recommendations;
    };
    /**
     * Start the AI scheduling system
     */
    AISchedulingSystem.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('Starting AI Scheduling System...');
                        if (!this.config.enableRealTimeAdaptive) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.realTimeAdaptive.startMonitoring()];
                    case 1:
                        _a.sent();
                        console.log('Real-time adaptive scheduling started');
                        _a.label = 2;
                    case 2:
                        console.log('AI Scheduling System started successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.error('Error starting AI Scheduling System:', error_7);
                        throw new Error('Failed to start AI Scheduling System');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the AI scheduling system
     */
    AISchedulingSystem.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('Stopping AI Scheduling System...');
                        if (!this.config.enableRealTimeAdaptive) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.realTimeAdaptive.stopMonitoring()];
                    case 1:
                        _a.sent();
                        console.log('Real-time adaptive scheduling stopped');
                        _a.label = 2;
                    case 2:
                        console.log('AI Scheduling System stopped successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _a.sent();
                        console.error('Error stopping AI Scheduling System:', error_8);
                        throw new Error('Failed to stop AI Scheduling System');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get system configuration
     */
    AISchedulingSystem.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * Update system configuration
     */
    AISchedulingSystem.prototype.updateConfig = function (updates) {
        this.config = __assign(__assign({}, this.config), updates);
    };
    return AISchedulingSystem;
}());
exports.AISchedulingSystem = AISchedulingSystem;
// Default export
exports.default = AISchedulingSystem;
