"use strict";
// Campaign Management System - STORY-SUB-002 Task 3
// AI-powered trial conversion campaigns with A/B testing
// Created: 2025-01-22
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
exports.CampaignManager = void 0;
var server_1 = require("@/lib/supabase/server");
var CampaignManager = /** @class */ (function () {
    function CampaignManager() {
        this.supabase = (0, server_1.createClient)();
    }
    // ========================================================================
    // CAMPAIGN CREATION & MANAGEMENT
    // ========================================================================
    CampaignManager.prototype.createCampaign = function (campaignData) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        campaign = {
                            name: campaignData.name || 'Untitled Campaign',
                            type: campaignData.type || 'email',
                            status: 'draft',
                            target: campaignData.target || this.getDefaultTarget(),
                            content: campaignData.content || this.getDefaultContent(),
                            schedule: campaignData.schedule || this.getDefaultSchedule(),
                            triggers: campaignData.triggers || [],
                            metrics: this.initializeMetrics(),
                            abTest: campaignData.abTest
                        };
                        return [4 /*yield*/, this.supabase
                                .from('trial_campaigns')
                                .insert({
                                name: campaign.name,
                                type: campaign.type,
                                status: campaign.status,
                                target_config: campaign.target,
                                content_config: campaign.content,
                                schedule_config: campaign.schedule,
                                triggers_config: campaign.triggers,
                                ab_test_config: campaign.abTest
                            })
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to create campaign: ".concat(error.message));
                        return [2 /*return*/, __assign(__assign({}, campaign), { id: data.id })];
                }
            });
        });
    };
    CampaignManager.prototype.launchCampaign = function (campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, audienceSize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCampaign(campaignId)];
                    case 1:
                        campaign = _a.sent();
                        if (!campaign)
                            throw new Error('Campaign not found');
                        if (campaign.status !== 'draft') {
                            throw new Error('Only draft campaigns can be launched');
                        }
                        return [4 /*yield*/, this.estimateAudienceSize(campaign.target)
                            // Update campaign status and audience estimate
                        ];
                    case 2:
                        audienceSize = _a.sent();
                        // Update campaign status and audience estimate
                        return [4 /*yield*/, this.supabase
                                .from('trial_campaigns')
                                .update({
                                status: 'active',
                                estimated_audience: audienceSize,
                                launched_at: new Date().toISOString()
                            })
                                .eq('id', campaignId)
                            // If A/B test enabled, initialize test
                        ];
                    case 3:
                        // Update campaign status and audience estimate
                        _a.sent();
                        if (!campaign.abTest) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.initializeABTest(campaignId, campaign.abTest)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: 
                    // Schedule campaign execution
                    return [4 /*yield*/, this.scheduleCampaignExecution(campaign)];
                    case 6:
                        // Schedule campaign execution
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CampaignManager.prototype.pauseCampaign = function (campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('trial_campaigns')
                            .update({ status: 'paused' })
                            .eq('id', campaignId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CampaignManager.prototype.getCampaign = function (campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('trial_campaigns')
                            .select('*')
                            .eq('id', campaignId)
                            .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.mapDatabaseToCampaign(data)];
                }
            });
        });
    };
    // ========================================================================
    // AUDIENCE TARGETING & SEGMENTATION
    // ========================================================================
    CampaignManager.prototype.getEligibleTrials = function (target) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = this.supabase
                            .from('trial_analytics')
                            .select('*');
                        // Filter by trial stages
                        if (target.trialStages.length > 0) {
                            query = query.in('trial_status', target.trialStages);
                        }
                        // Filter by user segments
                        if (target.segments.length > 0) {
                            query = query.in('user_segment', target.segments);
                        }
                        // Filter by conversion probability range
                        if (target.conversionProbabilityRange) {
                            query = query
                                .gte('conversion_probability', target.conversionProbabilityRange[0])
                                .lte('conversion_probability', target.conversionProbabilityRange[1]);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw new Error("Failed to get eligible trials: ".concat(error.message));
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.map(function (trial) { return _this.mapDatabaseToTrial(trial); })) || []];
                }
            });
        });
    };
    CampaignManager.prototype.estimateAudienceSize = function (target) {
        return __awaiter(this, void 0, void 0, function () {
            var eligibleTrials;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEligibleTrials(target)];
                    case 1:
                        eligibleTrials = _a.sent();
                        return [2 /*return*/, eligibleTrials.length];
                }
            });
        });
    };
    // ========================================================================
    // A/B TESTING FRAMEWORK
    // ========================================================================
    CampaignManager.prototype.initializeABTest = function (campaignId, abTestConfig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Create A/B test record
                    return [4 /*yield*/, this.supabase
                            .from('campaign_ab_tests')
                            .insert({
                            campaign_id: campaignId,
                            name: abTestConfig.name,
                            hypothesis: abTestConfig.hypothesis,
                            status: 'running',
                            variants_config: abTestConfig.variants,
                            traffic_split: abTestConfig.trafficSplit,
                            metrics_config: abTestConfig.metrics,
                            duration_days: abTestConfig.duration,
                            min_sample_size: abTestConfig.minSampleSize,
                            confidence_level: abTestConfig.confidenceLevel
                        })];
                    case 1:
                        // Create A/B test record
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CampaignManager.prototype.assignTestVariant = function (userId, campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, hash, variants, splits, cumulativeWeight, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCampaign(campaignId)];
                    case 1:
                        campaign = _a.sent();
                        if (!(campaign === null || campaign === void 0 ? void 0 : campaign.abTest))
                            return [2 /*return*/, 'control'
                                // Use deterministic assignment based on user ID hash
                            ];
                        hash = this.hashUserId(userId);
                        variants = campaign.abTest.variants;
                        splits = campaign.abTest.trafficSplit;
                        cumulativeWeight = 0;
                        for (i = 0; i < variants.length; i++) {
                            cumulativeWeight += splits[i];
                            if (hash < cumulativeWeight) {
                                return [2 /*return*/, variants[i].id];
                            }
                        }
                        return [2 /*return*/, variants[0].id]; // fallback
                }
            });
        });
    };
    CampaignManager.prototype.hashUserId = function (userId) {
        // Simple hash function for consistent variant assignment
        var hash = 0;
        for (var i = 0; i < userId.length; i++) {
            var char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) % 100; // Return 0-99
    };
    CampaignManager.prototype.trackTestConversion = function (campaignId, userId, variantId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('campaign_ab_test_results')
                            .insert({
                            campaign_id: campaignId,
                            user_id: userId,
                            variant_id: variantId,
                            converted: true,
                            conversion_value: 99, // subscription price
                            created_at: new Date().toISOString()
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }; // ========================================================================
    // CAMPAIGN EXECUTION & PERSONALIZATION
    // ========================================================================
    CampaignManager.prototype.executeCampaign = function (campaignId, trial) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, variant, _a, personalizedContent, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getCampaign(campaignId)];
                    case 1:
                        campaign = _c.sent();
                        if (!campaign)
                            return [2 /*return*/];
                        if (!campaign.abTest) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.assignTestVariant(trial.userId, campaignId)];
                    case 2:
                        _a = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = 'control';
                        _c.label = 4;
                    case 4:
                        variant = _a;
                        return [4 /*yield*/, this.personalizeContent(campaign.content, trial)
                            // Execute based on campaign type
                        ];
                    case 5:
                        personalizedContent = _c.sent();
                        _b = campaign.type;
                        switch (_b) {
                            case 'email': return [3 /*break*/, 6];
                            case 'in_app': return [3 /*break*/, 8];
                            case 'push': return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 12];
                    case 6: return [4 /*yield*/, this.sendEmail(trial.userId, personalizedContent)];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 12];
                    case 8: return [4 /*yield*/, this.showInAppMessage(trial.userId, personalizedContent)];
                    case 9:
                        _c.sent();
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, this.sendPushNotification(trial.userId, personalizedContent)];
                    case 11:
                        _c.sent();
                        return [3 /*break*/, 12];
                    case 12: 
                    // Track campaign delivery
                    return [4 /*yield*/, this.trackCampaignDelivery(campaignId, trial.userId, variant)];
                    case 13:
                        // Track campaign delivery
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CampaignManager.prototype.personalizeContent = function (content, trial) {
        return __awaiter(this, void 0, void 0, function () {
            var personalizedMessage, user, topFeatures;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        personalizedMessage = content.message;
                        if (!content.personalization.useUserName) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.supabase
                                .from('profiles')
                                .select('full_name')
                                .eq('id', trial.userId)
                                .single()];
                    case 1:
                        user = (_a.sent()).data;
                        personalizedMessage = personalizedMessage.replace('{{user_name}}', (user === null || user === void 0 ? void 0 : user.full_name) || 'there');
                        _a.label = 2;
                    case 2:
                        if (content.personalization.useDaysRemaining) {
                            personalizedMessage = personalizedMessage.replace('{{days_remaining}}', trial.daysRemaining.toString());
                        }
                        if (!content.personalization.useTopFeatures) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getTopUnusedFeatures(trial.userId)];
                    case 3:
                        topFeatures = _a.sent();
                        personalizedMessage = personalizedMessage.replace('{{top_features}}', topFeatures.join(', '));
                        _a.label = 4;
                    case 4: return [2 /*return*/, __assign(__assign({}, content), { message: personalizedMessage })];
                }
            });
        });
    };
    CampaignManager.prototype.getTopUnusedFeatures = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var usedFeatures, used, allFeatures;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('customer_lifecycle_events')
                            .select('event_data')
                            .eq('user_id', userId)
                            .eq('event_type', 'feature_usage')];
                    case 1:
                        usedFeatures = (_a.sent()).data;
                        used = new Set((usedFeatures === null || usedFeatures === void 0 ? void 0 : usedFeatures.map(function (e) { var _a; return (_a = e.event_data) === null || _a === void 0 ? void 0 : _a.featureId; })) || []);
                        allFeatures = ['dashboard', 'reports', 'integrations', 'automation', 'analytics'];
                        return [2 /*return*/, allFeatures.filter(function (f) { return !used.has(f); }).slice(0, 3)];
                }
            });
        });
    };
    // Mock delivery methods (in production, integrate with actual services)
    CampaignManager.prototype.sendEmail = function (userId, content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Sending email to user ".concat(userId, ":"), content);
                return [2 /*return*/];
            });
        });
    };
    CampaignManager.prototype.showInAppMessage = function (userId, content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Showing in-app message to user ".concat(userId, ":"), content);
                return [2 /*return*/];
            });
        });
    };
    CampaignManager.prototype.sendPushNotification = function (userId, content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Sending push notification to user ".concat(userId, ":"), content);
                return [2 /*return*/];
            });
        });
    };
    CampaignManager.prototype.trackCampaignDelivery = function (campaignId, userId, variant) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('campaign_deliveries')
                            .insert({
                            campaign_id: campaignId,
                            user_id: userId,
                            variant_id: variant,
                            delivered_at: new Date().toISOString()
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }; // ========================================================================
    // CAMPAIGN SCHEDULING & AUTOMATION
    // ========================================================================
    CampaignManager.prototype.scheduleCampaignExecution = function (campaign) {
        return __awaiter(this, void 0, void 0, function () {
            var eligibleTrials, _i, eligibleTrials_1, trial;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(campaign.schedule.type === 'immediate')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getEligibleTrials(campaign.target)];
                    case 1:
                        eligibleTrials = _a.sent();
                        _i = 0, eligibleTrials_1 = eligibleTrials;
                        _a.label = 2;
                    case 2:
                        if (!(_i < eligibleTrials_1.length)) return [3 /*break*/, 5];
                        trial = eligibleTrials_1[_i];
                        return [4 /*yield*/, this.executeCampaign(campaign.id, trial)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        if (campaign.schedule.type === 'trigger_based') {
                            // Set up triggers (in production, use event system)
                            console.log("Setting up triggers for campaign ".concat(campaign.id));
                        }
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // ========================================================================
    // UTILITY METHODS
    // ========================================================================
    CampaignManager.prototype.getDefaultTarget = function () {
        return {
            segments: ['casual_user', 'explorer'],
            trialStages: ['active', 'at_risk'],
            conversionProbabilityRange: [0.2, 0.8],
            engagementLevelRange: ['medium', 'low'],
            customFilters: {},
            estimatedAudience: 0
        };
    };
    CampaignManager.prototype.getDefaultContent = function () {
        return {
            title: 'Don\'t Miss Out on Your Trial',
            message: 'Hi {{user_name}}, you have {{days_remaining}} days left in your trial. Don\'t miss out on these amazing features: {{top_features}}',
            cta: {
                text: 'Upgrade Now',
                action: 'upgrade',
                style: 'primary'
            },
            personalization: {
                useUserName: true,
                useDaysRemaining: true,
                useTopFeatures: true,
                useCompanyName: false,
                customTokens: {}
            },
            assets: []
        };
    };
    CampaignManager.prototype.getDefaultSchedule = function () {
        return {
            type: 'immediate',
            timezone: 'UTC',
            deliveryWindows: [{
                    start: '09:00',
                    end: '17:00',
                    days: [1, 2, 3, 4, 5] // weekdays
                }]
        };
    };
    CampaignManager.prototype.initializeMetrics = function () {
        return {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            unsubscribed: 0,
            bounced: 0,
            revenue: 0,
            conversionRate: 0,
            roi: 0
        };
    };
    CampaignManager.prototype.mapDatabaseToCampaign = function (data) {
        return {
            id: data.id,
            name: data.name,
            type: data.type,
            status: data.status,
            target: data.target_config,
            content: data.content_config,
            schedule: data.schedule_config,
            triggers: data.triggers_config || [],
            metrics: data.metrics || this.initializeMetrics(),
            abTest: data.ab_test_config
        };
    };
    CampaignManager.prototype.mapDatabaseToTrial = function (data) {
        return {
            id: data.id,
            userId: data.user_id,
            status: data.trial_status,
            startDate: new Date(data.start_date),
            endDate: new Date(data.end_date),
            daysRemaining: Math.max(0, Math.ceil((new Date(data.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
            conversionProbability: data.conversion_probability || 0.1,
            engagementScore: data.engagement_score || 0,
            userSegment: data.user_segment || 'casual_user',
            currentStrategy: data.current_strategy || 'engagement_boost',
            metadata: data.metadata || {}
        };
    };
    return CampaignManager;
}());
exports.CampaignManager = CampaignManager;
