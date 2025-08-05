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
exports.CommunicationManager = void 0;
/**
 * Patient communication manager
 */
var CommunicationManager = /** @class */ (function () {
    function CommunicationManager(supabase, auditLogger, lgpdManager, sessionManager, notificationService, config) {
        this.supabase = supabase;
        this.auditLogger = auditLogger;
        this.lgpdManager = lgpdManager;
        this.sessionManager = sessionManager;
        this.notificationService = notificationService;
        this.config = config;
    }
    /**
     * Send a message
     */
    CommunicationManager.prototype.sendMessage = function (request, sessionToken) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionValidation, validationResult, conversationId, attachments, _a, message, messageError, _b, _c, _d, error_1;
            var _e;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 13, , 15]);
                        return [4 /*yield*/, this.sessionManager.validateSession(sessionToken)];
                    case 1:
                        sessionValidation = _g.sent();
                        if (!sessionValidation.isValid || ((_f = sessionValidation.session) === null || _f === void 0 ? void 0 : _f.patientId) !== request.patientId) {
                            throw new Error('Invalid session or unauthorized access');
                        }
                        validationResult = this.validateMessage(request);
                        if (!validationResult.isValid) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: validationResult.message
                                }];
                        }
                        conversationId = request.conversationId;
                        if (!!conversationId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createConversation(request)];
                    case 2:
                        conversationId = _g.sent();
                        _g.label = 3;
                    case 3:
                        attachments = [];
                        if (!(request.attachments && request.attachments.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.processAttachments(request.attachments, request.patientId)];
                    case 4:
                        attachments = _g.sent();
                        _g.label = 5;
                    case 5:
                        _c = (_b = this.supabase
                            .from('messages'))
                            .insert;
                        _e = {
                            conversation_id: conversationId,
                            sender_id: request.patientId,
                            sender_type: 'patient',
                            recipient_id: request.recipientId,
                            recipient_type: request.recipientType,
                            subject: request.subject
                        };
                        if (!this.config.encryptMessages) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.encryptContent(request.content)];
                    case 6:
                        _d = _g.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _d = request.content;
                        _g.label = 8;
                    case 8: return [4 /*yield*/, _c.apply(_b, [(_e.content = _d,
                                _e.message_type = request.messageType,
                                _e.priority = request.priority,
                                _e.status = 'sent',
                                _e.attachments = attachments,
                                _e.is_encrypted = this.config.encryptMessages,
                                _e.created_at = new Date().toISOString(),
                                _e)])
                            .select()
                            .single()];
                    case 9:
                        _a = _g.sent(), message = _a.data, messageError = _a.error;
                        if (messageError)
                            throw messageError;
                        // Update conversation
                        return [4 /*yield*/, this.updateConversation(conversationId, {
                                lastMessageAt: new Date(),
                                status: 'active'
                            })];
                    case 10:
                        // Update conversation
                        _g.sent();
                        // Send notifications
                        return [4 /*yield*/, this.sendNotifications(message, request)];
                    case 11:
                        // Send notifications
                        _g.sent();
                        // Log message activity
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'message_sent',
                                userId: request.patientId,
                                userType: 'patient',
                                details: {
                                    messageId: message.id,
                                    conversationId: conversationId,
                                    messageType: request.messageType,
                                    priority: request.priority,
                                    hasAttachments: attachments.length > 0
                                }
                            })];
                    case 12:
                        // Log message activity
                        _g.sent();
                        return [2 /*return*/, {
                                success: true,
                                messageId: message.id,
                                conversationId: conversationId,
                                message: 'Mensagem enviada com sucesso!',
                                estimatedResponseTime: this.getEstimatedResponseTime(request.priority)
                            }];
                    case 13:
                        error_1 = _g.sent();
                        return [4 /*yield*/, this.auditLogger.log({
                                action: 'message_send_failed',
                                userId: request.patientId,
                                userType: 'patient',
                                details: { error: error_1.message }
                            })];
                    case 14:
                        _g.sent();
                        throw error_1;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate message content
     */
    CommunicationManager.prototype.validateMessage = function (request) {
        // Check message length
        if (request.content.length > this.config.maxMessageLength) {
            return {
                isValid: false,
                message: "Mensagem excede o limite de ".concat(this.config.maxMessageLength, " caracteres.")
            };
        }
        // Check for empty content
        if (!request.content.trim()) {
            return {
                isValid: false,
                message: 'Conteúdo da mensagem não pode estar vazio.'
            };
        }
        // Validate attachments if present
        if (request.attachments && request.attachments.length > 0) {
            if (!this.config.allowAttachments) {
                return {
                    isValid: false,
                    message: 'Anexos não são permitidos.'
                };
            }
            for (var _i = 0, _a = request.attachments; _i < _a.length; _i++) {
                var file = _a[_i];
                if (file.size > this.config.maxAttachmentSize) {
                    return {
                        isValid: false,
                        message: "Arquivo ".concat(file.name, " excede o tamanho m\u00E1ximo permitido.")
                    };
                }
                if (!this.config.allowedFileTypes.includes(file.type)) {
                    return {
                        isValid: false,
                        message: "Tipo de arquivo ".concat(file.type, " n\u00E3o \u00E9 permitido.")
                    };
                }
            }
        }
        return {
            isValid: true,
            message: 'Validação bem-sucedida'
        };
    };
    /**
     * Create a new conversation
     */
    CommunicationManager.prototype.createConversation = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, conversation, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('conversations')
                            .insert({
                            patient_id: request.patientId,
                            staff_id: request.recipientType === 'staff' ? request.recipientId : null,
                            department_id: request.recipientType === 'department' ? request.recipientId : null,
                            subject: request.subject || "".concat(request.messageType, " - ").concat(new Date().toLocaleDateString()),
                            status: 'active',
                            priority: request.priority,
                            last_message_at: new Date().toISOString(),
                            unread_count: 0,
                            created_at: new Date().toISOString()
                        })
                            .select()
                            .single()];
                    case 1:
                        _a = _b.sent(), conversation = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, conversation.id];
                }
            });
        });
    };
    /**
     * Update conversation
     */
    CommunicationManager.prototype.updateConversation = function (conversationId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateData = {};
                        if (updates.lastMessageAt) {
                            updateData.last_message_at = updates.lastMessageAt.toISOString();
                        }
                        if (updates.status) {
                            updateData.status = updates.status;
                        }
                        if (updates.unreadCount !== undefined) {
                            updateData.unread_count = updates.unreadCount;
                        }
                        return [4 /*yield*/, this.supabase
                                .from('conversations')
                                .update(updateData)
                                .eq('id', conversationId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process message attachments
     */
    CommunicationManager.prototype.processAttachments = function (files, patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var attachments, _i, files_1, file, fileName, filePath, _a, data, error, urlData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        attachments = [];
                        _i = 0, files_1 = files;
                        _b.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 5];
                        file = files_1[_i];
                        fileName = "".concat(Date.now(), "_").concat(file.name);
                        filePath = "messages/".concat(patientId, "/").concat(fileName);
                        return [4 /*yield*/, this.supabase.storage
                                .from('message-attachments')
                                .upload(filePath, file)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [4 /*yield*/, this.supabase.storage
                                .from('message-attachments')
                                .createSignedUrl(filePath, 3600)];
                    case 3:
                        urlData = (_b.sent()).data;
                        attachments.push({
                            id: data.path,
                            fileName: file.name,
                            fileSize: file.size,
                            mimeType: file.type,
                            downloadUrl: (urlData === null || urlData === void 0 ? void 0 : urlData.signedUrl) || '',
                            isEncrypted: this.config.encryptMessages
                        });
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, attachments];
                }
            });
        });
    };
    /**
     * Send notifications for new message
     */
    CommunicationManager.prototype.sendNotifications = function (message, request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // This would integrate with the notification service
                    // to send email, SMS, or push notifications based on recipient preferences
                    return [4 /*yield*/, this.notificationService.sendMessageNotification({
                            recipientId: request.recipientId,
                            recipientType: request.recipientType,
                            messageType: request.messageType,
                            priority: request.priority,
                            subject: request.subject,
                            senderName: 'Patient' // Would get actual patient name
                        })];
                    case 1:
                        // This would integrate with the notification service
                        // to send email, SMS, or push notifications based on recipient preferences
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Encrypt message content
     */
    CommunicationManager.prototype.encryptContent = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with encryption service
                // For now, return content as-is
                return [2 /*return*/, content];
            });
        });
    };
    /**
     * Get estimated response time based on priority
     */
    CommunicationManager.prototype.getEstimatedResponseTime = function (priority) {
        switch (priority) {
            case 'urgent':
                return '1-2 horas';
            case 'high':
                return '4-6 horas';
            case 'normal':
                return '24 horas';
            case 'low':
                return '48-72 horas';
            default:
                return '24 horas';
        }
    };
    /**
     * Get communication statistics for a patient
     */
    CommunicationManager.prototype.getCommunicationStats = function (patientId, sessionToken) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionValidation, _a, messages, error, stats;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.sessionManager.validateSession(sessionToken)];
                    case 1:
                        sessionValidation = _c.sent();
                        if (!sessionValidation.isValid || ((_b = sessionValidation.session) === null || _b === void 0 ? void 0 : _b.patientId) !== patientId) {
                            throw new Error('Invalid session or unauthorized access');
                        }
                        return [4 /*yield*/, this.supabase
                                .from('messages')
                                .select('*')
                                .eq('sender_id', patientId)
                                .eq('sender_type', 'patient')];
                    case 2:
                        _a = _c.sent(), messages = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        stats = {
                            totalMessages: messages.length,
                            unreadMessages: messages.filter(function (m) { return m.status !== 'read'; }).length,
                            activeConversations: 0, // Would calculate from conversations table
                            averageResponseTime: 0, // Would calculate from response times
                            messagesByType: {},
                            recentActivity: []
                        };
                        // Count messages by type
                        messages.forEach(function (message) {
                            stats.messagesByType[message.message_type] =
                                (stats.messagesByType[message.message_type] || 0) + 1;
                        });
                        return [2 /*return*/, stats];
                }
            });
        });
    };
    return CommunicationManager;
}());
exports.CommunicationManager = CommunicationManager;
