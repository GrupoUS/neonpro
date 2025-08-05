"use strict";
// Patient Communication Service
// NeonPro - Epic 6 Story 6.2 Task 1: Patient Communication Center
// Comprehensive service for healthcare communication management
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
exports.createcommunicationService = exports.CommunicationService = void 0;
var client_1 = require("@/utils/supabase/client");
var CommunicationService = /** @class */ (function () {
    function CommunicationService() {
    }
    // Supabase client created per method for proper request context
    // ============================================================================
    // MESSAGE OPERATIONS
    // ============================================================================
    /**
     * Send a new message to a patient
     */
    CommunicationService.prototype.sendMessage = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var hasConsent, threadId, processedContent, processedSubject, template, messageData, _a, message, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 11, , 12]);
                        if (!this.requiresConsent(request.channel, request.type)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkPatientConsent(request.patient_id, request.channel)];
                    case 1:
                        hasConsent = _b.sent();
                        if (!hasConsent) {
                            return [2 /*return*/, {
                                    success: false,
                                    status: 'failed',
                                    error: 'Patient consent required for this communication channel'
                                }];
                        }
                        _b.label = 2;
                    case 2:
                        threadId = request.thread_id;
                        if (!!threadId) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createMessageThread(request.patient_id, request.subject)];
                    case 3:
                        threadId = _b.sent();
                        _b.label = 4;
                    case 4:
                        processedContent = request.content;
                        processedSubject = request.subject;
                        if (!(request.template_id && request.template_variables)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getMessageTemplate(request.template_id)];
                    case 5:
                        template = _b.sent();
                        if (template) {
                            processedContent = this.processTemplate(template.content_template, request.template_variables);
                            processedSubject = this.processTemplate(template.subject_template, request.template_variables);
                        }
                        _b.label = 6;
                    case 6:
                        messageData = {
                            thread_id: threadId,
                            sender_id: request.patient_id, // This would be current user in real implementation
                            sender_type: 'staff',
                            recipient_ids: [request.patient_id],
                            type: request.type,
                            channel: request.channel,
                            subject: processedSubject,
                            content: processedContent,
                            priority: request.priority || 'normal',
                            status: request.scheduled_at ? 'draft' : 'sent',
                            template_id: request.template_id,
                            metadata: {
                                template_variables: request.template_variables,
                                scheduled_at: request.scheduled_at,
                            },
                            attachments: [], // File attachments would be processed separately
                        };
                        return [4 /*yield*/, supabase
                                .from('communication_messages')
                                .insert(messageData)
                                .select()
                                .single()];
                    case 7:
                        _a = _b.sent(), message = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        if (!!request.scheduled_at) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.deliverMessage(message.id, request.channel)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: 
                    // Update thread last message timestamp
                    return [4 /*yield*/, this.updateThreadLastMessage(threadId)];
                    case 10:
                        // Update thread last message timestamp
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message_id: message.id,
                                thread_id: threadId,
                                status: message.status,
                                scheduled_at: request.scheduled_at,
                                estimated_delivery: this.calculateDeliveryTime(request.channel),
                                cost: this.calculateMessageCost(request.channel, processedContent.length)
                            }];
                    case 11:
                        error_1 = _b.sent();
                        console.error('Error sending message:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                status: 'failed',
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                            }];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get messages with filtering and pagination
     */
    CommunicationService.prototype.getMessages = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var query, sortBy, sortOrder, page, limit, offset, _a, messages, error, count, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('communication_messages')
                            .select("\n          *,\n          thread:communication_threads(*),\n          attachments:communication_attachments(*)\n        ");
                        // Apply filters
                        if (request.thread_id) {
                            query = query.eq('thread_id', request.thread_id);
                        }
                        if (request.patient_id) {
                            query = query.contains('recipient_ids', [request.patient_id]);
                        }
                        if (request.channel) {
                            query = query.eq('channel', request.channel);
                        }
                        if (request.status) {
                            query = query.eq('status', request.status);
                        }
                        if (request.type) {
                            query = query.eq('type', request.type);
                        }
                        if (request.date_from) {
                            query = query.gte('created_at', request.date_from);
                        }
                        if (request.date_to) {
                            query = query.lte('created_at', request.date_to);
                        }
                        if (request.search) {
                            query = query.or("content.ilike.%".concat(request.search, "%,subject.ilike.%").concat(request.search, "%"));
                        }
                        sortBy = request.sort_by || 'created_at';
                        sortOrder = request.sort_order || 'desc';
                        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
                        page = request.page || 1;
                        limit = Math.min(request.limit || 50, 100);
                        offset = (page - 1) * limit;
                        query = query.range(offset, offset + limit - 1);
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), messages = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                messages: messages || [],
                                total: count || 0,
                                page: page,
                                limit: limit,
                                has_more: (count || 0) > offset + limit
                            }];
                    case 2:
                        error_2 = _b.sent();
                        console.error('Error getting messages:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get message threads for a patient or all patients
     */
    CommunicationService.prototype.getMessageThreads = function (patientId_1) {
        return __awaiter(this, arguments, void 0, function (patientId, includeArchived) {
            var query, _a, threads, error, threadsWithUnread, error_3;
            var _this = this;
            if (includeArchived === void 0) { includeArchived = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        query = supabase
                            .from('communication_threads')
                            .select("\n          *,\n          last_message:communication_messages(\n            id, content, created_at, sender_type, status, type, channel\n          ),\n          participants:communication_thread_participants(\n            user_id, role, name, avatar, joined_at, last_read_at\n          )\n        ")
                            .order('last_message_at', { ascending: false });
                        if (patientId) {
                            query = query.eq('patient_id', patientId);
                        }
                        if (!includeArchived) {
                            query = query.neq('status', 'archived');
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), threads = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, Promise.all((threads || []).map(function (thread) { return __awaiter(_this, void 0, void 0, function () {
                                var unreadCount;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.getUnreadMessageCount(thread.id)];
                                        case 1:
                                            unreadCount = _a.sent();
                                            return [2 /*return*/, __assign(__assign({}, thread), { unread_count: unreadCount })];
                                    }
                                });
                            }); }))];
                    case 2:
                        threadsWithUnread = _b.sent();
                        return [2 /*return*/, threadsWithUnread];
                    case 3:
                        error_3 = _b.sent();
                        console.error('Error getting message threads:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // TEMPLATE OPERATIONS
    // ============================================================================
    /**
     * Get all message templates
     */
    CommunicationService.prototype.getMessageTemplates = function (category, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, templates, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('communication_templates')
                            .select('*')
                            .eq('is_active', true)
                            .order('name');
                        if (category) {
                            query = query.eq('category', category);
                        }
                        if (channel) {
                            query = query.contains('channel', [channel]);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), templates = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, templates || []];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error getting message templates:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new message template
     */
    CommunicationService.prototype.createMessageTemplate = function (template) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_templates')
                                .insert(__assign(__assign({}, template), { usage_count: 0 }))
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 3:
                        error_5 = _b.sent();
                        console.error('Error creating message template:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update message template
     */
    CommunicationService.prototype.updateMessageTemplate = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_templates')
                                .update(updates)
                                .eq('id', id)
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 3:
                        error_6 = _b.sent();
                        console.error('Error updating message template:', error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // CAMPAIGN OPERATIONS
    // ============================================================================
    /**
     * Get communication campaigns
     */
    CommunicationService.prototype.getCommunicationCampaigns = function (status) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, campaigns, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = supabase
                            .from('communication_campaigns')
                            .select("\n          *,\n          template:communication_templates(name, subject_template, content_template)\n        ")
                            .order('created_at', { ascending: false });
                        if (status) {
                            query = query.eq('status', status);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), campaigns = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, campaigns || []];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Error getting communication campaigns:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new communication campaign
     */
    CommunicationService.prototype.createCommunicationCampaign = function (campaign) {
        return __awaiter(this, void 0, void 0, function () {
            var estimatedSize, supabase, _a, data, error, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.estimateAudienceSize(campaign.target_audience)];
                    case 1:
                        estimatedSize = _b.sent();
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 2:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_campaigns')
                                .insert(__assign(__assign({}, campaign), { total_recipients: estimatedSize, sent_count: 0, delivered_count: 0, read_count: 0, failed_count: 0, response_count: 0, unsubscribe_count: 0, metrics: {} }))
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 4:
                        error_8 = _b.sent();
                        console.error('Error creating communication campaign:', error_8);
                        throw error_8;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute a communication campaign
     */
    CommunicationService.prototype.executeCampaign = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, recipients, _a, executionId, queuedMessages, estimatedCost, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.getCampaign(request.campaign_id)];
                    case 1:
                        campaign = _b.sent();
                        if (!campaign) {
                            throw new Error('Campaign not found');
                        }
                        if (!request.test_mode) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getTestRecipients(request.test_recipients || [])];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.getCampaignRecipients(campaign.target_audience)];
                    case 4:
                        _a = _b.sent();
                        _b.label = 5;
                    case 5:
                        recipients = _a;
                        // Update campaign status
                        return [4 /*yield*/, this.updateCampaignStatus(request.campaign_id, 'running')];
                    case 6:
                        // Update campaign status
                        _b.sent();
                        executionId = "exec_".concat(Date.now());
                        return [4 /*yield*/, this.queueCampaignMessages(campaign, recipients, executionId)];
                    case 7:
                        queuedMessages = _b.sent();
                        estimatedCost = this.calculateCampaignCost(campaign.channel, queuedMessages.length);
                        return [2 /*return*/, {
                                success: true,
                                execution_id: executionId,
                                estimated_recipients: recipients.length,
                                estimated_cost: estimatedCost,
                                scheduled_at: campaign.scheduled_at
                            }];
                    case 8:
                        error_9 = _b.sent();
                        console.error('Error executing campaign:', error_9);
                        return [2 /*return*/, {
                                success: false,
                                execution_id: '',
                                estimated_recipients: 0,
                                estimated_cost: 0,
                                error: error_9 instanceof Error ? error_9.message : 'Unknown error'
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // CONSENT & PREFERENCES
    // ============================================================================
    /**
     * Check patient communication consent
     */
    CommunicationService.prototype.checkPatientConsent = function (patientId, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, consent, error, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_consent')
                                .select('*')
                                .eq('patient_id', patientId)
                                .eq('channel', channel)
                                .eq('consent_given', true)
                                .single()];
                    case 2:
                        _a = _b.sent(), consent = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error; // PGRST116 = no rows returned
                        if (!consent)
                            return [2 /*return*/, false];
                        // Check if consent has expired
                        if (consent.expiry_date && new Date(consent.expiry_date) < new Date()) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 3:
                        error_10 = _b.sent();
                        console.error('Error checking patient consent:', error_10);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update patient communication consent
     */
    CommunicationService.prototype.updatePatientConsent = function (consent) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_consent')
                                .upsert(consent, {
                                onConflict: 'patient_id,channel',
                                ignoreDuplicates: false
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 3:
                        error_11 = _b.sent();
                        console.error('Error updating patient consent:', error_11);
                        throw error_11;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get patient communication preferences
     */
    CommunicationService.prototype.getPatientPreferences = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, preferences, error, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_preferences')
                                .select('*')
                                .eq('patient_id', patientId)
                                .single()];
                    case 2:
                        _a = _b.sent(), preferences = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, preferences];
                    case 3:
                        error_12 = _b.sent();
                        console.error('Error getting patient preferences:', error_12);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // ANALYTICS & REPORTING
    // ============================================================================
    /**
     * Get communication statistics
     */
    CommunicationService.prototype.getCommunicationStats = function (period) {
        return __awaiter(this, void 0, void 0, function () {
            var dateRange, supabase, _a, messageStats, statsError, stats, error_13;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        dateRange = this.getDateRange(period);
                        return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _c.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_messages')
                                .select('channel, type, status, created_at')
                                .gte('created_at', dateRange.from)
                                .lte('created_at', dateRange.to)];
                    case 2:
                        _a = _c.sent(), messageStats = _a.data, statsError = _a.error;
                        if (statsError)
                            throw statsError;
                        _b = {
                            period: period,
                            total_messages: (messageStats === null || messageStats === void 0 ? void 0 : messageStats.length) || 0,
                            messages_by_channel: this.groupByChannel(messageStats || []),
                            messages_by_type: this.groupByType(messageStats || [])
                        };
                        return [4 /*yield*/, this.calculateAverageResponseTime(dateRange)];
                    case 3:
                        _b.average_response_time = _c.sent();
                        return [4 /*yield*/, this.calculateAutomationSuccessRate(dateRange)];
                    case 4:
                        _b.automation_success_rate = _c.sent();
                        return [4 /*yield*/, this.getTopTemplates(dateRange)];
                    case 5:
                        _b.top_templates = _c.sent();
                        return [4 /*yield*/, this.getPeakHours(dateRange)];
                    case 6:
                        _b.peak_hours = _c.sent();
                        return [4 /*yield*/, this.getStaffPerformance(dateRange)];
                    case 7:
                        stats = (_b.staff_performance = _c.sent(),
                            _b);
                        return [2 /*return*/, stats];
                    case 8:
                        error_13 = _c.sent();
                        console.error('Error getting communication stats:', error_13);
                        throw error_13;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get communication dashboard data
     */
    CommunicationService.prototype.getCommunicationDashboard = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, stats, recentMessages, activeCampaigns, pendingApprovals, failedMessages, topPerformers, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                this.getCommunicationStats('today'),
                                this.getRecentMessages(10),
                                this.getCommunicationCampaigns('running'),
                                this.getPendingApprovals(),
                                this.getFailedMessages(),
                                this.getTopPerformers()
                            ])];
                    case 1:
                        _a = _b.sent(), stats = _a[0], recentMessages = _a[1], activeCampaigns = _a[2], pendingApprovals = _a[3], failedMessages = _a[4], topPerformers = _a[5];
                        return [2 /*return*/, {
                                stats: stats,
                                recent_messages: recentMessages,
                                active_campaigns: activeCampaigns,
                                pending_approvals: pendingApprovals,
                                failed_messages: failedMessages,
                                top_performers: topPerformers
                            }];
                    case 2:
                        error_14 = _b.sent();
                        console.error('Error getting communication dashboard:', error_14);
                        throw error_14;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // HELPER METHODS
    // ============================================================================
    CommunicationService.prototype.requiresConsent = function (channel, type) {
        // Marketing messages always require consent
        if (type === 'alert' && channel !== 'portal')
            return true;
        // SMS and WhatsApp require consent for non-emergency communications
        if ((channel === 'sms' || channel === 'whatsapp') && type !== 'alert')
            return true;
        return false;
    };
    CommunicationService.prototype.createMessageThread = function (patientId, subject) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_threads')
                                .insert({
                                patient_id: patientId,
                                subject: subject || 'New Conversation',
                                status: 'active',
                                priority: 'normal',
                                participants: []
                            })
                                .select()
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data.id];
                }
            });
        });
    };
    CommunicationService.prototype.getMessageTemplate = function (templateId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_templates')
                                .select('*')
                                .eq('id', templateId)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    CommunicationService.prototype.processTemplate = function (template, variables) {
        var processed = template;
        Object.entries(variables).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            var regex = new RegExp("{{\\s*".concat(key, "\\s*}}"), 'g');
            processed = processed.replace(regex, String(value));
        });
        return processed;
    };
    CommunicationService.prototype.deliverMessage = function (messageId, channel) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_messages')
                                .update({
                                status: 'delivered',
                                delivered_at: new Date().toISOString()
                            })
                                .eq('id', messageId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommunicationService.prototype.updateThreadLastMessage = function (threadId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_threads')
                                .update({
                                last_message_at: new Date().toISOString()
                            })
                                .eq('id', threadId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommunicationService.prototype.calculateDeliveryTime = function (channel) {
        var baseTime = new Date();
        switch (channel) {
            case 'sms':
            case 'whatsapp':
                baseTime.setMinutes(baseTime.getMinutes() + 1);
                break;
            case 'email':
                baseTime.setMinutes(baseTime.getMinutes() + 5);
                break;
            case 'portal':
                baseTime.setSeconds(baseTime.getSeconds() + 30);
                break;
            default:
                baseTime.setMinutes(baseTime.getMinutes() + 2);
        }
        return baseTime.toISOString();
    };
    CommunicationService.prototype.calculateMessageCost = function (channel, contentLength) {
        // Simplified cost calculation
        var baseCosts = {
            sms: 0.05,
            whatsapp: 0.03,
            email: 0.01,
            portal: 0,
            internal: 0
        };
        var segmentMultiplier = Math.ceil(contentLength / 160); // SMS segment size
        return baseCosts[channel] * segmentMultiplier;
    };
    CommunicationService.prototype.getUnreadMessageCount = function (threadId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, count, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('communication_messages')
                            .select('id', { count: 'exact' })
                            .eq('thread_id', threadId)
                            .is('read_at', null)];
                    case 1:
                        _a = _b.sent(), count = _a.count, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, count || 0];
                }
            });
        });
    };
    CommunicationService.prototype.estimateAudienceSize = function (audience) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simplified audience estimation
                return [2 /*return*/, 100]; // In real implementation, would query based on criteria
            });
        });
    };
    CommunicationService.prototype.getCampaign = function (campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_campaigns')
                                .select('*')
                                .eq('id', campaignId)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    CommunicationService.prototype.getTestRecipients = function (testIds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, testIds];
            });
        });
    };
    CommunicationService.prototype.getCampaignRecipients = function (audience) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In real implementation, would query patients based on audience criteria
                return [2 /*return*/, []];
            });
        });
    };
    CommunicationService.prototype.updateCampaignStatus = function (campaignId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_campaigns')
                                .update({ status: status })
                                .eq('id', campaignId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommunicationService.prototype.queueCampaignMessages = function (campaign, recipients, executionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In real implementation, would queue messages for batch processing
                return [2 /*return*/, []];
            });
        });
    };
    CommunicationService.prototype.calculateCampaignCost = function (channel, messageCount) {
        return this.calculateMessageCost(channel, 160) * messageCount;
    };
    CommunicationService.prototype.getDateRange = function (period) {
        var now = new Date();
        var from = new Date();
        switch (period) {
            case 'today':
                from.setHours(0, 0, 0, 0);
                break;
            case 'week':
                from.setDate(now.getDate() - 7);
                break;
            case 'month':
                from.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                from.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                from.setFullYear(now.getFullYear() - 1);
                break;
        }
        return {
            from: from.toISOString(),
            to: now.toISOString()
        };
    };
    CommunicationService.prototype.groupByChannel = function (messages) {
        var groups = {
            sms: 0,
            email: 0,
            portal: 0,
            whatsapp: 0,
            internal: 0
        };
        messages.forEach(function (message) {
            groups[message.channel] = (groups[message.channel] || 0) + 1;
        });
        return groups;
    };
    CommunicationService.prototype.groupByType = function (messages) {
        var groups = {
            text: 0,
            appointment: 0,
            reminder: 0,
            alert: 0,
            document: 0,
            image: 0,
            form: 0
        };
        messages.forEach(function (message) {
            groups[message.type] = (groups[message.type] || 0) + 1;
        });
        return groups;
    };
    CommunicationService.prototype.calculateAverageResponseTime = function (dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simplified calculation - would be more complex in real implementation
                return [2 /*return*/, 45]; // 45 minutes average
            });
        });
    };
    CommunicationService.prototype.calculateAutomationSuccessRate = function (dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simplified calculation
                return [2 /*return*/, 0.95]; // 95% success rate
            });
        });
    };
    CommunicationService.prototype.getTopTemplates = function (dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        // Simplified - would query actual template usage
                        return [2 /*return*/, []];
                }
            });
        });
    };
    CommunicationService.prototype.getPeakHours = function (dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        // Simplified - would analyze message patterns by hour
                        return [2 /*return*/, []];
                }
            });
        });
    };
    CommunicationService.prototype.getStaffPerformance = function (dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        // Simplified - would analyze staff communication metrics
                        return [2 /*return*/, []];
                }
            });
        });
    };
    CommunicationService.prototype.getRecentMessages = function (limit) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_messages')
                                .select('*')
                                .order('created_at', { ascending: false })
                                .limit(limit)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    CommunicationService.prototype.getPendingApprovals = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_messages')
                                .select('*')
                                .eq('status', 'draft')
                                .order('created_at', { ascending: false })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    CommunicationService.prototype.getFailedMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('communication_messages')
                                .select('*')
                                .eq('status', 'failed')
                                .order('created_at', { ascending: false })
                                .limit(10)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    CommunicationService.prototype.getTopPerformers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, client_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        // Simplified - would calculate actual staff performance metrics
                        return [2 /*return*/, []];
                }
            });
        });
    };
    return CommunicationService;
}());
exports.CommunicationService = CommunicationService;
// Export singleton instance
var createcommunicationService = function () { return new CommunicationService(); };
exports.createcommunicationService = createcommunicationService;
