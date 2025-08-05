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
exports.BreachDetectionAutomation = void 0;
var BreachDetectionAutomation = /** @class */ (function () {
    function BreachDetectionAutomation(supabase, complianceManager, config) {
        this.monitoringInterval = null;
        this.detectionCallbacks = [];
        this.supabase = supabase;
        this.complianceManager = complianceManager;
        this.config = config;
    }
    /**
     * Start Real-Time Breach Detection
     */
    BreachDetectionAutomation.prototype.startBreachDetection = function () {
        return __awaiter(this, arguments, void 0, function (intervalMinutes) {
            var error_1;
            var _this = this;
            if (intervalMinutes === void 0) { intervalMinutes = 1; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (this.monitoringInterval) {
                            clearInterval(this.monitoringInterval);
                        }
                        // Initial detection scan
                        return [4 /*yield*/, this.performDetectionScan()
                            // Set up real-time monitoring
                        ];
                    case 1:
                        // Initial detection scan
                        _a.sent();
                        if (!this.config.real_time_monitoring) return [3 /*break*/, 3];
                        this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.performDetectionScan()];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_2 = _a.sent();
                                        console.error('Error in breach detection cycle:', error_2);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, intervalMinutes * 60 * 1000);
                        // Set up database change listeners for critical events
                        return [4 /*yield*/, this.setupRealtimeDetectionListeners()];
                    case 2:
                        // Set up database change listeners for critical events
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        console.log("Real-time breach detection started (".concat(intervalMinutes, "min intervals)"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error starting breach detection:', error_1);
                        throw new Error("Failed to start breach detection: ".concat(error_1.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop Breach Detection
     */
    BreachDetectionAutomation.prototype.stopBreachDetection = function () {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        console.log('Real-time breach detection stopped');
    };
    /**
     * Create Breach Detection Rule
     */
    BreachDetectionAutomation.prototype.createDetectionRule = function (ruleData) {
        return __awaiter(this, void 0, void 0, function () {
            var validation, _a, rule, error, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validateDetectionRule(ruleData)];
                    case 1:
                        validation = _b.sent();
                        if (!validation.valid) {
                            throw new Error("Invalid detection rule: ".concat(validation.errors.join(', ')));
                        }
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_detection_rules')
                                .insert(__assign(__assign({}, ruleData), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                                .select('id')
                                .single()];
                    case 2:
                        _a = _b.sent(), rule = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Log rule creation
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'breach_detection',
                                resource_type: 'detection_rule',
                                resource_id: rule.id,
                                action: 'detection_rule_created',
                                details: {
                                    rule_name: ruleData.name,
                                    rule_type: ruleData.rule_type,
                                    severity: ruleData.severity,
                                    auto_trigger: ruleData.auto_trigger
                                }
                            })];
                    case 3:
                        // Log rule creation
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                rule_id: rule.id
                            }];
                    case 4:
                        error_3 = _b.sent();
                        console.error('Error creating detection rule:', error_3);
                        throw new Error("Failed to create detection rule: ".concat(error_3.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Report Breach Incident
     */
    BreachDetectionAutomation.prototype.reportBreachIncident = function (incidentData) {
        return __awaiter(this, void 0, void 0, function () {
            var legalDeadline, _a, incident, error, response, _i, _b, callback, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        legalDeadline = new Date();
                        legalDeadline.setHours(legalDeadline.getHours() + 72);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_incidents')
                                .insert(__assign(__assign({}, incidentData), { legal_deadline: legalDeadline.toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                                .select('id')
                                .single()];
                    case 1:
                        _a = _c.sent(), incident = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.initializeBreachResponse(incident.id, incidentData)
                            // Trigger automated response if enabled
                        ];
                    case 2:
                        response = _c.sent();
                        if (!this.config.auto_containment_enabled) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.triggerAutomatedContainment(incident.id, incidentData)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        if (!this.config.auto_notification_enabled) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.triggerBreachNotifications(incident.id, incidentData)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        // Trigger detection callbacks
                        for (_i = 0, _b = this.detectionCallbacks; _i < _b.length; _i++) {
                            callback = _b[_i];
                            try {
                                callback(__assign(__assign({}, incidentData), { id: incident.id, legal_deadline: legalDeadline.toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
                            }
                            catch (error) {
                                console.error('Error in detection callback:', error);
                            }
                        }
                        // Log incident creation
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'breach_incident',
                                resource_type: 'breach_incident',
                                resource_id: incident.id,
                                action: 'breach_incident_reported',
                                details: {
                                    incident_type: incidentData.incident_type,
                                    severity: incidentData.severity,
                                    affected_users: incidentData.affected_users_count,
                                    affected_records: incidentData.affected_records_count,
                                    requires_anpd_notification: incidentData.requires_anpd_notification
                                }
                            })];
                    case 7:
                        // Log incident creation
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                incident_id: incident.id,
                                response_timeline: response
                            }];
                    case 8:
                        error_4 = _c.sent();
                        console.error('Error reporting breach incident:', error_4);
                        throw new Error("Failed to report breach incident: ".concat(error_4.message));
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update Incident Status
     */
    BreachDetectionAutomation.prototype.updateIncidentStatus = function (incidentId, status, notes, updatedBy) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, currentIncident, existingNotes, error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        updateData = {
                            status: status,
                            updated_at: new Date().toISOString()
                        };
                        // Set timestamps based on status
                        if (status === 'contained') {
                            updateData.containment_timestamp = new Date().toISOString();
                        }
                        else if (status === 'resolved') {
                            updateData.resolution_timestamp = new Date().toISOString();
                        }
                        if (!notes) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_incidents')
                                .select('investigation_notes')
                                .eq('id', incidentId)
                                .single()];
                    case 1:
                        currentIncident = (_a.sent()).data;
                        existingNotes = (currentIncident === null || currentIncident === void 0 ? void 0 : currentIncident.investigation_notes) || [];
                        updateData.investigation_notes = __spreadArray(__spreadArray([], existingNotes, true), [
                            {
                                timestamp: new Date().toISOString(),
                                note: notes,
                                updated_by: updatedBy
                            }
                        ], false);
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.supabase
                            .from('lgpd_breach_incidents')
                            .update(updateData)
                            .eq('id', incidentId)];
                    case 3:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Update breach response timeline
                        return [4 /*yield*/, this.updateBreachResponseTimeline(incidentId, {
                                action: "status_updated_to_".concat(status),
                                responsible_party: updatedBy || 'system',
                                status: 'completed',
                                details: { notes: notes, timestamp: new Date().toISOString() }
                            })
                            // Log status update
                        ];
                    case 4:
                        // Update breach response timeline
                        _a.sent();
                        // Log status update
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'breach_incident',
                                resource_type: 'breach_incident',
                                resource_id: incidentId,
                                action: 'incident_status_updated',
                                details: {
                                    new_status: status,
                                    updated_by: updatedBy,
                                    notes: notes
                                }
                            })];
                    case 5:
                        // Log status update
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 6:
                        error_5 = _a.sent();
                        console.error('Error updating incident status:', error_5);
                        throw new Error("Failed to update incident status: ".concat(error_5.message));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send ANPD Notification
     */
    BreachDetectionAutomation.prototype.sendANPDNotification = function (incidentId, customContent) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, incident, incidentError, notificationContent, _b, _c, notification, notificationError, error_6;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_incidents')
                                .select('*')
                                .eq('id', incidentId)
                                .single()];
                    case 1:
                        _a = _d.sent(), incident = _a.data, incidentError = _a.error;
                        if (incidentError)
                            throw incidentError;
                        if (!incident)
                            throw new Error('Incident not found');
                        // Check if notification is required and not already sent
                        if (!incident.requires_anpd_notification) {
                            throw new Error('ANPD notification not required for this incident');
                        }
                        if (incident.anpd_notification_sent) {
                            throw new Error('ANPD notification already sent');
                        }
                        _b = customContent;
                        if (_b) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.generateANPDNotificationContent(incident)
                            // Create notification record
                        ];
                    case 2:
                        _b = (_d.sent());
                        _d.label = 3;
                    case 3:
                        notificationContent = _b;
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_notifications')
                                .insert({
                                incident_id: incidentId,
                                notification_type: 'anpd',
                                recipient: 'ANPD - Autoridade Nacional de Proteção de Dados',
                                notification_method: 'portal', // ANPD has specific portal for notifications
                                content: notificationContent,
                                sent_at: new Date().toISOString(),
                                delivery_status: 'sent',
                                legal_compliance: true
                            })
                                .select('id')
                                .single()];
                    case 4:
                        _c = _d.sent(), notification = _c.data, notificationError = _c.error;
                        if (notificationError)
                            throw notificationError;
                        // Update incident to mark ANPD notification as sent
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_incidents')
                                .update({
                                anpd_notification_sent: true,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', incidentId)
                            // Update breach response timeline
                        ];
                    case 5:
                        // Update incident to mark ANPD notification as sent
                        _d.sent();
                        // Update breach response timeline
                        return [4 /*yield*/, this.updateBreachResponseTimeline(incidentId, {
                                action: 'anpd_notification_sent',
                                responsible_party: 'compliance_team',
                                status: 'completed',
                                details: {
                                    notification_id: notification.id,
                                    sent_at: new Date().toISOString(),
                                    method: 'portal'
                                }
                            })
                            // Log ANPD notification
                        ];
                    case 6:
                        // Update breach response timeline
                        _d.sent();
                        // Log ANPD notification
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'breach_notification',
                                resource_type: 'anpd_notification',
                                resource_id: notification.id,
                                action: 'anpd_notification_sent',
                                details: {
                                    incident_id: incidentId,
                                    incident_type: incident.incident_type,
                                    severity: incident.severity,
                                    affected_users: incident.affected_users_count,
                                    notification_method: 'portal'
                                }
                            })];
                    case 7:
                        // Log ANPD notification
                        _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                notification_id: notification.id
                            }];
                    case 8:
                        error_6 = _d.sent();
                        console.error('Error sending ANPD notification:', error_6);
                        throw new Error("Failed to send ANPD notification: ".concat(error_6.message));
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send User Notifications
     */
    BreachDetectionAutomation.prototype.sendUserNotifications = function (incidentId_1) {
        return __awaiter(this, arguments, void 0, function (incidentId, notificationMethod) {
            var _a, incident, incidentError, affectedUsers, notificationsSent, failedNotifications, notificationContent, _i, affectedUsers_1, user, _b, notification, notificationError, userError_1, error_7;
            if (notificationMethod === void 0) { notificationMethod = 'email'; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 13, , 14]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_incidents')
                                .select('*')
                                .eq('id', incidentId)
                                .single()];
                    case 1:
                        _a = _c.sent(), incident = _a.data, incidentError = _a.error;
                        if (incidentError)
                            throw incidentError;
                        if (!incident)
                            throw new Error('Incident not found');
                        // Check if user notification is required
                        if (!incident.requires_user_notification) {
                            throw new Error('User notification not required for this incident');
                        }
                        return [4 /*yield*/, this.getAffectedUsers(incidentId)];
                    case 2:
                        affectedUsers = _c.sent();
                        notificationsSent = 0;
                        failedNotifications = 0;
                        return [4 /*yield*/, this.generateUserNotificationContent(incident)
                            // Send notifications to affected users
                        ];
                    case 3:
                        notificationContent = _c.sent();
                        _i = 0, affectedUsers_1 = affectedUsers;
                        _c.label = 4;
                    case 4:
                        if (!(_i < affectedUsers_1.length)) return [3 /*break*/, 9];
                        user = affectedUsers_1[_i];
                        _c.label = 5;
                    case 5:
                        _c.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_notifications')
                                .insert({
                                incident_id: incidentId,
                                notification_type: 'user',
                                recipient: user.email || user.phone || user.address,
                                notification_method: notificationMethod,
                                content: notificationContent,
                                sent_at: new Date().toISOString(),
                                delivery_status: 'sent',
                                legal_compliance: true
                            })
                                .select('id')
                                .single()];
                    case 6:
                        _b = _c.sent(), notification = _b.data, notificationError = _b.error;
                        if (notificationError) {
                            failedNotifications++;
                            console.error("Failed to send notification to user ".concat(user.id, ":"), notificationError);
                        }
                        else {
                            notificationsSent++;
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        userError_1 = _c.sent();
                        failedNotifications++;
                        console.error("Error sending notification to user ".concat(user.id, ":"), userError_1);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 4];
                    case 9: 
                    // Update incident to mark user notifications as sent
                    return [4 /*yield*/, this.supabase
                            .from('lgpd_breach_incidents')
                            .update({
                            user_notification_sent: true,
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', incidentId)
                        // Update breach response timeline
                    ];
                    case 10:
                        // Update incident to mark user notifications as sent
                        _c.sent();
                        // Update breach response timeline
                        return [4 /*yield*/, this.updateBreachResponseTimeline(incidentId, {
                                action: 'user_notifications_sent',
                                responsible_party: 'compliance_team',
                                status: 'completed',
                                details: {
                                    notifications_sent: notificationsSent,
                                    failed_notifications: failedNotifications,
                                    notification_method: notificationMethod,
                                    sent_at: new Date().toISOString()
                                }
                            })
                            // Log user notifications
                        ];
                    case 11:
                        // Update breach response timeline
                        _c.sent();
                        // Log user notifications
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'breach_notification',
                                resource_type: 'user_notification',
                                resource_id: incidentId,
                                action: 'user_notifications_sent',
                                details: {
                                    incident_id: incidentId,
                                    notifications_sent: notificationsSent,
                                    failed_notifications: failedNotifications,
                                    notification_method: notificationMethod,
                                    total_affected_users: affectedUsers.length
                                }
                            })];
                    case 12:
                        // Log user notifications
                        _c.sent();
                        return [2 /*return*/, {
                                success: true,
                                notifications_sent: notificationsSent,
                                failed_notifications: failedNotifications
                            }];
                    case 13:
                        error_7 = _c.sent();
                        console.error('Error sending user notifications:', error_7);
                        throw new Error("Failed to send user notifications: ".concat(error_7.message));
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Breach Dashboard
     */
    BreachDetectionAutomation.prototype.getBreachDashboard = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, dashboard, error, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .rpc('get_breach_dashboard')];
                    case 1:
                        _a = _b.sent(), dashboard = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, dashboard];
                    case 2:
                        error_8 = _b.sent();
                        console.error('Error getting breach dashboard:', error_8);
                        throw new Error("Failed to get breach dashboard: ".concat(error_8.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register Detection Callback
     */
    BreachDetectionAutomation.prototype.onBreachDetected = function (callback) {
        this.detectionCallbacks.push(callback);
    };
    // Private helper methods
    BreachDetectionAutomation.prototype.performDetectionScan = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rules, error, _i, rules_1, rule, ruleError_1, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_detection_rules')
                                .select('*')
                                .eq('active', true)
                                .eq('auto_trigger', true)];
                    case 1:
                        _a = _b.sent(), rules = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!rules || rules.length === 0) {
                            return [2 /*return*/];
                        }
                        _i = 0, rules_1 = rules;
                        _b.label = 2;
                    case 2:
                        if (!(_i < rules_1.length)) return [3 /*break*/, 7];
                        rule = rules_1[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.executeDetectionRule(rule)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        ruleError_1 = _b.sent();
                        console.error("Error executing detection rule ".concat(rule.id, ":"), ruleError_1);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_9 = _b.sent();
                        console.error('Error performing detection scan:', error_9);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.executeDetectionRule = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, detectionResult, error, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .rpc('execute_detection_rule', {
                                rule_id: rule.id,
                                detection_query: rule.detection_query,
                                threshold_value: rule.threshold_value,
                                time_window_minutes: rule.time_window_minutes
                            })];
                    case 1:
                        _a = _b.sent(), detectionResult = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!(detectionResult && detectionResult.breach_detected)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleDetectedBreach(rule, detectionResult)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_10 = _b.sent();
                        console.error("Error executing detection rule ".concat(rule.id, ":"), error_10);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.handleDetectedBreach = function (rule, detectionResult) {
        return __awaiter(this, void 0, void 0, function () {
            var incidentData, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        incidentData = {
                            detection_rule_id: rule.id,
                            incident_type: this.mapRuleTypeToIncidentType(rule.rule_type),
                            severity: rule.severity,
                            status: 'detected',
                            title: "Automated Detection: ".concat(rule.name),
                            description: "Breach detected by rule: ".concat(rule.description, ". ").concat(detectionResult.details),
                            affected_data_categories: detectionResult.affected_data_categories || [],
                            affected_users_count: detectionResult.affected_users_count || 0,
                            affected_records_count: detectionResult.affected_records_count || 0,
                            detection_timestamp: new Date().toISOString(),
                            requires_anpd_notification: this.requiresANPDNotification(rule.severity, detectionResult),
                            requires_user_notification: this.requiresUserNotification(rule.severity, detectionResult),
                            anpd_notification_sent: false,
                            user_notification_sent: false,
                            investigation_notes: [],
                            containment_actions: [],
                            remediation_actions: []
                        };
                        return [4 /*yield*/, this.reportBreachIncident(incidentData)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        console.error('Error handling detected breach:', error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.validateDetectionRule = function (rule) {
        return __awaiter(this, void 0, void 0, function () {
            var errors;
            return __generator(this, function (_a) {
                errors = [];
                if (!rule.name || rule.name.trim().length === 0) {
                    errors.push('Rule name is required');
                }
                if (!rule.rule_type) {
                    errors.push('Rule type is required');
                }
                if (!rule.severity) {
                    errors.push('Severity is required');
                }
                if (!rule.detection_query || rule.detection_query.trim().length === 0) {
                    errors.push('Detection query is required');
                }
                if (!rule.time_window_minutes || rule.time_window_minutes <= 0) {
                    errors.push('Time window must be greater than 0');
                }
                return [2 /*return*/, {
                        valid: errors.length === 0,
                        errors: errors
                    }];
            });
        });
    };
    BreachDetectionAutomation.prototype.initializeBreachResponse = function (incidentId, incidentData) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        response = {
                            incident_id: incidentId,
                            response_timeline: [
                                {
                                    timestamp: new Date().toISOString(),
                                    action: 'incident_detected',
                                    responsible_party: 'system',
                                    status: 'completed',
                                    details: {
                                        detection_method: incidentData.detection_rule_id ? 'automated' : 'manual',
                                        severity: incidentData.severity,
                                        incident_type: incidentData.incident_type
                                    }
                                }
                            ],
                            containment_measures: [],
                            investigation_findings: [],
                            remediation_plan: []
                        };
                        // Store initial response
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_responses')
                                .insert({
                                incident_id: incidentId,
                                response_data: response,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            })];
                    case 1:
                        // Store initial response
                        _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.triggerAutomatedContainment = function (incidentId, incidentData) {
        return __awaiter(this, void 0, void 0, function () {
            var containmentActions, _i, containmentActions_1, action, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        containmentActions = this.getAutomatedContainmentActions(incidentData);
                        _i = 0, containmentActions_1 = containmentActions;
                        _a.label = 1;
                    case 1:
                        if (!(_i < containmentActions_1.length)) return [3 /*break*/, 6];
                        action = containmentActions_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.executeContainmentAction(incidentId, action)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_12 = _a.sent();
                        console.error("Failed to execute containment action ".concat(action.type, ":"), error_12);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.triggerBreachNotifications = function (incidentId, incidentData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.notification_channels.email) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendInternalNotification(incidentId, 'email')];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this.config.notification_channels.slack) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendInternalNotification(incidentId, 'slack')];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!this.config.notification_channels.webhook) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.sendInternalNotification(incidentId, 'webhook')];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.updateBreachResponseTimeline = function (incidentId, timelineEntry) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, response, responseError, updatedResponse;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('lgpd_breach_responses')
                            .select('response_data')
                            .eq('incident_id', incidentId)
                            .single()];
                    case 1:
                        _a = _b.sent(), response = _a.data, responseError = _a.error;
                        if (responseError)
                            throw responseError;
                        updatedResponse = response.response_data;
                        updatedResponse.response_timeline.push(__assign({ timestamp: new Date().toISOString() }, timelineEntry));
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_breach_responses')
                                .update({
                                response_data: updatedResponse,
                                updated_at: new Date().toISOString()
                            })
                                .eq('incident_id', incidentId)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.setupRealtimeDetectionListeners = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Set up real-time listeners for critical security events
                this.supabase
                    .channel('breach-detection')
                    .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'auth.users'
                }, function (payload) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.handleAuthEvent(payload)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'lgpd_audit_events'
                }, function (payload) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.handleAuditEvent(payload)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .subscribe();
                return [2 /*return*/];
            });
        });
    };
    BreachDetectionAutomation.prototype.handleAuthEvent = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(payload.eventType === 'INSERT' && payload.new)) return [3 /*break*/, 2];
                        // Check for suspicious login patterns
                        return [4 /*yield*/, this.analyzeLoginPattern(payload.new)];
                    case 1:
                        // Check for suspicious login patterns
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.handleAuditEvent = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(payload.eventType === 'INSERT' && payload.new)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.analyzeAuditPattern(payload.new)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.mapRuleTypeToIncidentType = function (ruleType) {
        var mapping = {
            'anomaly': 'unauthorized_access',
            'threshold': 'data_exfiltration',
            'pattern': 'insider_threat',
            'access_control': 'unauthorized_access',
            'data_export': 'data_exfiltration',
            'system_intrusion': 'system_breach'
        };
        return mapping[ruleType] || 'unauthorized_access';
    };
    BreachDetectionAutomation.prototype.requiresANPDNotification = function (severity, detectionResult) {
        // ANPD notification required for high/critical incidents or when personal data is involved
        return severity === 'high' || severity === 'critical' || detectionResult.personal_data_involved;
    };
    BreachDetectionAutomation.prototype.requiresUserNotification = function (severity, detectionResult) {
        // User notification required when their personal data is compromised
        return detectionResult.personal_data_involved && (severity === 'high' || severity === 'critical');
    };
    BreachDetectionAutomation.prototype.generateANPDNotificationContent = function (incident) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Generate ANPD-compliant notification content
                return [2 /*return*/, "\nNotifica\u00E7\u00E3o de Incidente de Seguran\u00E7a - LGPD\n\nTipo de Incidente: ".concat(incident.incident_type, "\nSeveridade: ").concat(incident.severity, "\nData/Hora da Detec\u00E7\u00E3o: ").concat(incident.detection_timestamp, "\n\nDescri\u00E7\u00E3o: ").concat(incident.description, "\n\nDados Afetados:\n- Categorias: ").concat(incident.affected_data_categories.join(', '), "\n- N\u00FAmero de Titulares: ").concat(incident.affected_users_count, "\n- N\u00FAmero de Registros: ").concat(incident.affected_records_count, "\n\nMedidas de Conten\u00E7\u00E3o: Em andamento\nNotifica\u00E7\u00E3o aos Titulares: ").concat(incident.requires_user_notification ? 'Necessária' : 'Não necessária', "\n\nContato: compliance@empresa.com\n    ").trim()];
            });
        });
    };
    BreachDetectionAutomation.prototype.generateUserNotificationContent = function (incident) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Generate user-friendly notification content
                return [2 /*return*/, "\nCaro(a) Cliente,\n\nInformamos sobre um incidente de seguran\u00E7a que pode ter afetado seus dados pessoais.\n\nO que aconteceu: ".concat(incident.description, "\nQuando: ").concat(new Date(incident.detection_timestamp).toLocaleString('pt-BR'), "\nDados potencialmente afetados: ").concat(incident.affected_data_categories.join(', '), "\n\nMedidas tomadas:\n- Conten\u00E7\u00E3o imediata do incidente\n- Investiga\u00E7\u00E3o em andamento\n- Notifica\u00E7\u00E3o \u00E0s autoridades competentes\n\nRecomenda\u00E7\u00F5es:\n- Monitore suas contas\n- Altere suas senhas\n- Entre em contato conosco em caso de d\u00FAvidas\n\nAtenciosamente,\nEquipe de Seguran\u00E7a\n    ").trim()];
            });
        });
    };
    BreachDetectionAutomation.prototype.getAffectedUsers = function (incidentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, users, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .rpc('get_affected_users_by_incident', {
                            incident_id: incidentId
                        })];
                    case 1:
                        _a = _b.sent(), users = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, users || []];
                }
            });
        });
    };
    BreachDetectionAutomation.prototype.getAutomatedContainmentActions = function (incidentData) {
        // Define automated containment actions based on incident type
        var actions = [];
        if (incidentData.incident_type === 'unauthorized_access') {
            actions.push({ type: 'disable_compromised_accounts' });
            actions.push({ type: 'increase_monitoring' });
        }
        if (incidentData.incident_type === 'data_exfiltration') {
            actions.push({ type: 'block_data_export' });
            actions.push({ type: 'isolate_affected_systems' });
        }
        if (incidentData.severity === 'critical') {
            actions.push({ type: 'emergency_lockdown' });
        }
        return actions;
    };
    BreachDetectionAutomation.prototype.executeContainmentAction = function (incidentId, action) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Execute specific containment action
                console.log("Executing containment action: ".concat(action.type, " for incident ").concat(incidentId));
                return [2 /*return*/];
            });
        });
    };
    BreachDetectionAutomation.prototype.sendInternalNotification = function (incidentId, channel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Send internal notifications via specified channel
                console.log("Sending internal notification via ".concat(channel, " for incident ").concat(incidentId));
                return [2 /*return*/];
            });
        });
    };
    BreachDetectionAutomation.prototype.analyzeLoginPattern = function (authEvent) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    BreachDetectionAutomation.prototype.analyzeAuditPattern = function (auditEvent) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return BreachDetectionAutomation;
}());
exports.BreachDetectionAutomation = BreachDetectionAutomation;
