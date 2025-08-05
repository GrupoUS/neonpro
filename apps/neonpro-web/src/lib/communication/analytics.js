"use strict";
/**
 * Communication Analytics - Track and analyze communication performance
 * Story 2.3: Automated Communication System
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
exports.CommunicationAnalytics = void 0;
var CommunicationAnalytics = /** @class */ (function () {
    function CommunicationAnalytics() {
    }
    /**
     * Track a communication event
     */
    CommunicationAnalytics.prototype.trackEvent = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var error_1;
            var logId = _b.logId, event = _b.event, _c = _b.metadata, metadata = _c === void 0 ? {} : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, supabase
                                .from('communication_events')
                                .insert({
                                communication_log_id: logId,
                                event_type: event,
                                metadata: metadata,
                                created_at: new Date()
                            })];
                    case 1:
                        _d.sent();
                        // Update the communication log with latest status
                        return [4 /*yield*/, supabase
                                .from('communication_logs')
                                .update({
                                status: event === 'failed' || event === 'bounced' ? 'failed' :
                                    event === 'delivered' ? 'delivered' :
                                        event === 'sent' ? 'sent' : 'delivered',
                                updated_at: new Date()
                            })
                                .eq('id', logId)];
                    case 2:
                        // Update the communication log with latest status
                        _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        console.error('Error tracking communication event:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get communication metrics for a specific period
     */
    CommunicationAnalytics.prototype.getMetrics = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var query, _c, logs, error, error_2;
            var clinicId = _b.clinicId, startDate = _b.startDate, endDate = _b.endDate, channel = _b.channel, messageType = _b.messageType;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('communication_logs')
                            .select("\n          *,\n          communication_events(*)\n        ")
                            .eq('clinic_id', clinicId)
                            .gte('created_at', startDate.toISOString())
                            .lte('created_at', endDate.toISOString());
                        if (channel) {
                            query = query.eq('channel', channel);
                        }
                        if (messageType) {
                            query = query.eq('message_type', messageType);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _c = _d.sent(), logs = _c.data, error = _c.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, this.calculateMetrics(logs || [])];
                    case 2:
                        error_2 = _d.sent();
                        console.error('Error getting communication metrics:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get channel performance comparison
     */
    CommunicationAnalytics.prototype.getChannelPerformance = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var channels, performance_1, _i, channels_1, channel, currentMetrics, previousMetrics, changePercentage, trend, error_3;
            var clinicId = _b.clinicId, currentPeriodStart = _b.currentPeriodStart, currentPeriodEnd = _b.currentPeriodEnd, previousPeriodStart = _b.previousPeriodStart, previousPeriodEnd = _b.previousPeriodEnd;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        channels = ['sms', 'email', 'whatsapp'];
                        performance_1 = [];
                        _i = 0, channels_1 = channels;
                        _c.label = 1;
                    case 1:
                        if (!(_i < channels_1.length)) return [3 /*break*/, 5];
                        channel = channels_1[_i];
                        return [4 /*yield*/, this.getMetrics({
                                clinicId: clinicId,
                                startDate: currentPeriodStart,
                                endDate: currentPeriodEnd,
                                channel: channel
                            })];
                    case 2:
                        currentMetrics = _c.sent();
                        return [4 /*yield*/, this.getMetrics({
                                clinicId: clinicId,
                                startDate: previousPeriodStart,
                                endDate: previousPeriodEnd,
                                channel: channel
                            })];
                    case 3:
                        previousMetrics = _c.sent();
                        changePercentage = this.calculateChangePercentage(currentMetrics.delivery_rate, previousMetrics.delivery_rate);
                        trend = changePercentage > 5 ? 'up' :
                            changePercentage < -5 ? 'down' : 'stable';
                        performance_1.push({
                            channel: channel,
                            metrics: currentMetrics,
                            trend: trend,
                            period_comparison: {
                                current_period: currentMetrics,
                                previous_period: previousMetrics,
                                change_percentage: changePercentage
                            }
                        });
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, performance_1];
                    case 6:
                        error_3 = _c.sent();
                        console.error('Error getting channel performance:', error_3);
                        throw error_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get campaign analytics
     */
    CommunicationAnalytics.prototype.getCampaignAnalytics = function (campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, campaign, campaignError, _b, logs, logsError, overallMetrics, channels, channelBreakdown, _loop_1, this_1, _i, channels_2, channel, patientEngagement, roi, conversionRate, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, supabase
                                .from('communication_campaigns')
                                .select('*')
                                .eq('id', campaignId)
                                .single()];
                    case 1:
                        _a = _c.sent(), campaign = _a.data, campaignError = _a.error;
                        if (campaignError)
                            throw campaignError;
                        return [4 /*yield*/, supabase
                                .from('communication_logs')
                                .select("\n          *,\n          communication_events(*)\n        ")
                                .eq('campaign_id', campaignId)];
                    case 2:
                        _b = _c.sent(), logs = _b.data, logsError = _b.error;
                        if (logsError)
                            throw logsError;
                        overallMetrics = this.calculateMetrics(logs || []);
                        channels = ['sms', 'email', 'whatsapp'];
                        channelBreakdown = [];
                        _loop_1 = function (channel) {
                            var channelLogs = (logs || []).filter(function (log) { return log.channel === channel; });
                            if (channelLogs.length > 0) {
                                var metrics = this_1.calculateMetrics(channelLogs);
                                channelBreakdown.push({
                                    channel: channel,
                                    metrics: metrics,
                                    trend: 'stable', // Would need historical data for trend
                                    period_comparison: {
                                        current_period: metrics,
                                        previous_period: metrics, // Placeholder
                                        change_percentage: 0
                                    }
                                });
                            }
                        };
                        this_1 = this;
                        for (_i = 0, channels_2 = channels; _i < channels_2.length; _i++) {
                            channel = channels_2[_i];
                            _loop_1(channel);
                        }
                        return [4 /*yield*/, this.calculatePatientEngagement(campaignId)];
                    case 3:
                        patientEngagement = _c.sent();
                        roi = this.calculateROI(overallMetrics.cost_total, patientEngagement.new_appointments);
                        conversionRate = overallMetrics.total_sent > 0 ?
                            (patientEngagement.new_appointments / overallMetrics.total_sent) * 100 : 0;
                        return [2 /*return*/, {
                                campaign_id: campaignId,
                                campaign_name: campaign.name,
                                start_date: new Date(campaign.start_date),
                                end_date: campaign.end_date ? new Date(campaign.end_date) : undefined,
                                status: campaign.status,
                                metrics: overallMetrics,
                                channel_breakdown: channelBreakdown,
                                roi: roi,
                                conversion_rate: conversionRate,
                                patient_engagement: patientEngagement
                            }];
                    case 4:
                        error_4 = _c.sent();
                        console.error('Error getting campaign analytics:', error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate patient engagement score
     */
    CommunicationAnalytics.prototype.calculatePatientEngagementScore = function (patientId, clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var thirtyDaysAgo, communications, appointments, preferences, responseRate, appointmentAdherence, preferenceAlignment, recency, score, recommendations, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return [4 /*yield*/, supabase
                                .from('communication_logs')
                                .select("\n          *,\n          communication_events(*)\n        ")
                                .eq('patient_id', patientId)
                                .eq('clinic_id', clinicId)
                                .gte('created_at', thirtyDaysAgo.toISOString())];
                    case 1:
                        communications = (_a.sent()).data;
                        return [4 /*yield*/, supabase
                                .from('appointments')
                                .select('*')
                                .eq('patient_id', patientId)
                                .eq('clinic_id', clinicId)
                                .gte('created_at', thirtyDaysAgo.toISOString())];
                    case 2:
                        appointments = (_a.sent()).data;
                        return [4 /*yield*/, supabase
                                .from('patient_communication_preferences')
                                .select('*')
                                .eq('patient_id', patientId)
                                .eq('clinic_id', clinicId)
                                .single()];
                    case 3:
                        preferences = (_a.sent()).data;
                        responseRate = this.calculateResponseRate(communications || []);
                        appointmentAdherence = this.calculateAppointmentAdherence(appointments || []);
                        preferenceAlignment = this.calculatePreferenceAlignment(communications || [], preferences);
                        recency = this.calculateRecencyScore(communications || []);
                        score = Math.round((responseRate * 0.3) +
                            (appointmentAdherence * 0.4) +
                            (preferenceAlignment * 0.2) +
                            (recency * 0.1));
                        recommendations = this.generateEngagementRecommendations({
                            responseRate: responseRate,
                            appointmentAdherence: appointmentAdherence,
                            preferenceAlignment: preferenceAlignment,
                            recency: recency
                        });
                        return [2 /*return*/, {
                                patient_id: patientId,
                                score: score,
                                factors: {
                                    response_rate: responseRate,
                                    appointment_adherence: appointmentAdherence,
                                    communication_preference_alignment: preferenceAlignment,
                                    recency: recency
                                },
                                recommendations: recommendations,
                                last_calculated: new Date()
                            }];
                    case 4:
                        error_5 = _a.sent();
                        console.error('Error calculating patient engagement score:', error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get top performing message templates
     */
    CommunicationAnalytics.prototype.getTopPerformingTemplates = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var logs, templateGroups, templatePerformance, error_6;
            var _this = this;
            var clinicId = _b.clinicId, startDate = _b.startDate, endDate = _b.endDate, _c = _b.limit, limit = _c === void 0 ? 10 : _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, supabase
                                .from('communication_logs')
                                .select("\n          template_id,\n          message_type,\n          channel,\n          *,\n          communication_events(*),\n          message_templates(name)\n        ")
                                .eq('clinic_id', clinicId)
                                .gte('created_at', startDate.toISOString())
                                .lte('created_at', endDate.toISOString())
                                .not('template_id', 'is', null)];
                    case 1:
                        logs = (_d.sent()).data;
                        templateGroups = (logs || []).reduce(function (acc, log) {
                            var key = log.template_id;
                            if (!acc[key]) {
                                acc[key] = [];
                            }
                            acc[key].push(log);
                            return acc;
                        }, {});
                        templatePerformance = Object.entries(templateGroups).map(function (_a) {
                            var _b;
                            var templateId = _a[0], templateLogs = _a[1];
                            var firstLog = templateLogs[0];
                            var metrics = _this.calculateMetrics(templateLogs);
                            return {
                                template_id: templateId,
                                template_name: ((_b = firstLog.message_templates) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown Template',
                                message_type: firstLog.message_type,
                                channel: firstLog.channel,
                                metrics: metrics,
                                usage_count: templateLogs.length
                            };
                        });
                        // Sort by delivery rate and usage count
                        return [2 /*return*/, templatePerformance
                                .sort(function (a, b) {
                                var scoreA = a.metrics.delivery_rate * 0.7 + (a.usage_count / 100) * 0.3;
                                var scoreB = b.metrics.delivery_rate * 0.7 + (b.usage_count / 100) * 0.3;
                                return scoreB - scoreA;
                            })
                                .slice(0, limit)];
                    case 2:
                        error_6 = _d.sent();
                        console.error('Error getting top performing templates:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate communication insights and recommendations
     */
    CommunicationAnalytics.prototype.generateInsights = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var insights, recommendations, alerts, thirtyDaysAgo, sixtyDaysAgo, currentMetrics, previousMetrics, deliveryChange, costChange, volumeChange, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        insights = [];
                        recommendations = [];
                        alerts = [];
                        thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        sixtyDaysAgo = new Date();
                        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                        return [4 /*yield*/, this.getMetrics({
                                clinicId: clinicId,
                                startDate: thirtyDaysAgo,
                                endDate: new Date()
                            })];
                    case 1:
                        currentMetrics = _a.sent();
                        return [4 /*yield*/, this.getMetrics({
                                clinicId: clinicId,
                                startDate: sixtyDaysAgo,
                                endDate: thirtyDaysAgo
                            })];
                    case 2:
                        previousMetrics = _a.sent();
                        deliveryChange = this.calculateChangePercentage(currentMetrics.delivery_rate, previousMetrics.delivery_rate);
                        if (deliveryChange > 10) {
                            insights.push("Delivery rate improved by ".concat(deliveryChange.toFixed(1), "% this month"));
                        }
                        else if (deliveryChange < -10) {
                            insights.push("Delivery rate decreased by ".concat(Math.abs(deliveryChange).toFixed(1), "% this month"));
                            alerts.push('Delivery rate has significantly decreased');
                            recommendations.push('Review message content and sending practices');
                        }
                        // Cost efficiency insights
                        if (currentMetrics.cost_per_message > 0) {
                            costChange = this.calculateChangePercentage(currentMetrics.cost_per_message, previousMetrics.cost_per_message);
                            if (costChange > 20) {
                                alerts.push('Communication costs have increased significantly');
                                recommendations.push('Consider optimizing message frequency and channel mix');
                            }
                        }
                        volumeChange = this.calculateChangePercentage(currentMetrics.total_sent, previousMetrics.total_sent);
                        if (volumeChange > 50) {
                            insights.push("Message volume increased by ".concat(volumeChange.toFixed(1), "%"));
                        }
                        // Response rate insights
                        if (currentMetrics.response_rate && currentMetrics.response_rate < 10) {
                            alerts.push('Low patient response rate detected');
                            recommendations.push('Consider personalizing messages and optimizing send times');
                        }
                        // General recommendations
                        if (currentMetrics.delivery_rate < 90) {
                            recommendations.push('Improve delivery rate by cleaning contact lists and verifying phone numbers');
                        }
                        if (currentMetrics.open_rate && currentMetrics.open_rate < 20) {
                            recommendations.push('Improve email subject lines to increase open rates');
                        }
                        return [2 /*return*/, { insights: insights, recommendations: recommendations, alerts: alerts }];
                    case 3:
                        error_7 = _a.sent();
                        console.error('Error generating insights:', error_7);
                        return [2 /*return*/, { insights: [], recommendations: [], alerts: [] }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Private helper methods
    CommunicationAnalytics.prototype.calculateMetrics = function (logs) {
        var totalSent = logs.length;
        var totalDelivered = logs.filter(function (log) { var _a; return (_a = log.communication_events) === null || _a === void 0 ? void 0 : _a.some(function (e) { return e.event_type === 'delivered'; }); }).length;
        var totalFailed = logs.filter(function (log) { var _a; return (_a = log.communication_events) === null || _a === void 0 ? void 0 : _a.some(function (e) { return ['failed', 'bounced'].includes(e.event_type); }); }).length;
        var totalOpened = logs.filter(function (log) { var _a; return (_a = log.communication_events) === null || _a === void 0 ? void 0 : _a.some(function (e) { return e.event_type === 'opened'; }); }).length;
        var totalClicked = logs.filter(function (log) { var _a; return (_a = log.communication_events) === null || _a === void 0 ? void 0 : _a.some(function (e) { return e.event_type === 'clicked'; }); }).length;
        var totalReplied = logs.filter(function (log) { var _a; return (_a = log.communication_events) === null || _a === void 0 ? void 0 : _a.some(function (e) { return e.event_type === 'replied'; }); }).length;
        var deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
        var openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : undefined;
        var clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : undefined;
        var responseRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : undefined;
        var costTotal = logs.reduce(function (sum, log) { return sum + (log.cost || 0); }, 0);
        var costPerMessage = totalSent > 0 ? costTotal / totalSent : 0;
        return {
            total_sent: totalSent,
            total_delivered: totalDelivered,
            total_failed: totalFailed,
            total_opened: totalOpened > 0 ? totalOpened : undefined,
            total_clicked: totalClicked > 0 ? totalClicked : undefined,
            total_replied: totalReplied > 0 ? totalReplied : undefined,
            delivery_rate: deliveryRate,
            open_rate: openRate,
            click_rate: clickRate,
            response_rate: responseRate,
            cost_total: costTotal,
            cost_per_message: costPerMessage
        };
    };
    CommunicationAnalytics.prototype.calculateChangePercentage = function (current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };
    CommunicationAnalytics.prototype.calculatePatientEngagement = function (campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This would require tracking appointment actions after communications
                    // For now, return placeholder data
                    return [2 /*return*/, {
                            new_appointments: 0,
                            confirmed_appointments: 0,
                            cancelled_appointments: 0,
                            no_shows_prevented: 0
                        }];
                }
                catch (error) {
                    console.error('Error calculating patient engagement:', error);
                    return [2 /*return*/, {
                            new_appointments: 0,
                            confirmed_appointments: 0,
                            cancelled_appointments: 0,
                            no_shows_prevented: 0
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    CommunicationAnalytics.prototype.calculateROI = function (cost, newAppointments) {
        // Simplified ROI calculation
        // Assumes average appointment value of $100
        var averageAppointmentValue = 100;
        var revenue = newAppointments * averageAppointmentValue;
        return cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
    };
    CommunicationAnalytics.prototype.calculateResponseRate = function (communications) {
        if (communications.length === 0)
            return 0;
        var responses = communications.filter(function (comm) { var _a; return (_a = comm.communication_events) === null || _a === void 0 ? void 0 : _a.some(function (e) { return e.event_type === 'replied'; }); }).length;
        return (responses / communications.length) * 100;
    };
    CommunicationAnalytics.prototype.calculateAppointmentAdherence = function (appointments) {
        if (appointments.length === 0)
            return 100; // No data = perfect score
        var completed = appointments.filter(function (apt) {
            return apt.status === 'completed' && !apt.actual_no_show;
        }).length;
        return (completed / appointments.length) * 100;
    };
    CommunicationAnalytics.prototype.calculatePreferenceAlignment = function (communications, preferences) {
        var _this = this;
        if (!preferences || communications.length === 0)
            return 50; // Neutral score
        var alignedCommunications = communications.filter(function (comm) {
            if (preferences.preferred_channel && comm.channel === preferences.preferred_channel) {
                return true;
            }
            if (preferences.preferred_time && _this.isTimeAligned(comm.created_at, preferences.preferred_time)) {
                return true;
            }
            return false;
        }).length;
        return (alignedCommunications / communications.length) * 100;
    };
    CommunicationAnalytics.prototype.calculateRecencyScore = function (communications) {
        if (communications.length === 0)
            return 0;
        var now = new Date();
        var mostRecent = new Date(Math.max.apply(Math, communications.map(function (c) { return new Date(c.created_at).getTime(); })));
        var daysSinceLastCommunication = Math.floor((now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
        // Score decreases as days increase
        return Math.max(0, 100 - (daysSinceLastCommunication * 5));
    };
    CommunicationAnalytics.prototype.isTimeAligned = function (communicationTime, preferredTime) {
        var commHour = new Date(communicationTime).getHours();
        switch (preferredTime) {
            case 'morning':
                return commHour >= 8 && commHour < 12;
            case 'afternoon':
                return commHour >= 12 && commHour < 17;
            case 'evening':
                return commHour >= 17 && commHour < 21;
            default:
                return true;
        }
    };
    CommunicationAnalytics.prototype.generateEngagementRecommendations = function (factors) {
        var recommendations = [];
        if (factors.responseRate < 20) {
            recommendations.push('Send more personalized messages to improve response rate');
        }
        if (factors.appointmentAdherence < 80) {
            recommendations.push('Increase reminder frequency to improve appointment adherence');
        }
        if (factors.preferenceAlignment < 60) {
            recommendations.push('Align communication timing and channels with patient preferences');
        }
        if (factors.recency < 30) {
            recommendations.push('Re-engage patient with targeted communication');
        }
        return recommendations;
    };
    return CommunicationAnalytics;
}());
exports.CommunicationAnalytics = CommunicationAnalytics;
