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
exports.GET = GET;
exports.PATCH = PATCH;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, user, authError, resolvedParams, conversationId, _d, conversation, convError, _e, messages, messagesError, error_1;
        var params = _b.params;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _f.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _c = _f.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    resolvedParams = _f.sent();
                    conversationId = resolvedParams.id;
                    return [4 /*yield*/, supabase
                            .from('assistant_conversations')
                            .select('*')
                            .eq('id', conversationId)
                            .eq('user_id', user.id)
                            .single()];
                case 4:
                    _d = _f.sent(), conversation = _d.data, convError = _d.error;
                    if (convError || !conversation) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Conversation not found" }, { status: 404 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('assistant_messages')
                            .select('*')
                            .eq('conversation_id', conversationId)
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: true })];
                case 5:
                    _e = _f.sent(), messages = _e.data, messagesError = _e.error;
                    if (messagesError) {
                        console.error('Error fetching messages:', messagesError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            conversation: conversation,
                            messages: messages || []
                        })];
                case 6:
                    error_1 = _f.sent();
                    console.error('Conversation Messages API Error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function PATCH(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, user, authError, resolvedParams, conversationId, _d, title, is_active, _e, existingConversation, convError, updateData, _f, conversation, error, error_2;
        var params = _b.params;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _g.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _c = _g.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    resolvedParams = _g.sent();
                    conversationId = resolvedParams.id;
                    return [4 /*yield*/, request.json()];
                case 4:
                    _d = _g.sent(), title = _d.title, is_active = _d.is_active;
                    return [4 /*yield*/, supabase
                            .from('assistant_conversations')
                            .select('*')
                            .eq('id', conversationId)
                            .eq('user_id', user.id)
                            .single()];
                case 5:
                    _e = _g.sent(), existingConversation = _e.data, convError = _e.error;
                    if (convError || !existingConversation) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Conversation not found" }, { status: 404 })];
                    }
                    updateData = {};
                    if (title !== undefined)
                        updateData.title = title;
                    if (is_active !== undefined)
                        updateData.is_active = is_active;
                    if (Object.keys(updateData).length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "No valid fields to update" }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('assistant_conversations')
                            .update(updateData)
                            .eq('id', conversationId)
                            .eq('user_id', user.id)
                            .select()
                            .single()];
                case 6:
                    _f = _g.sent(), conversation = _f.data, error = _f.error;
                    if (error) {
                        console.error('Error updating conversation:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Failed to update conversation" }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ conversation: conversation })];
                case 7:
                    error_2 = _g.sent();
                    console.error('Update Conversation API Error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, user, authError, resolvedParams, conversationId, _d, existingConversation, convError, error, error_3;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _c = _e.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    resolvedParams = _e.sent();
                    conversationId = resolvedParams.id;
                    return [4 /*yield*/, supabase
                            .from('assistant_conversations')
                            .select('*')
                            .eq('id', conversationId)
                            .eq('user_id', user.id)
                            .single()];
                case 4:
                    _d = _e.sent(), existingConversation = _d.data, convError = _d.error;
                    if (convError || !existingConversation) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Conversation not found" }, { status: 404 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('assistant_conversations')
                            .delete()
                            .eq('id', conversationId)
                            .eq('user_id', user.id)];
                case 5:
                    error = (_e.sent()).error;
                    if (error) {
                        console.error('Error deleting conversation:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true })];
                case 6:
                    error_3 = _e.sent();
                    console.error('Delete Conversation API Error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
