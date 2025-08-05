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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, _b, preferences, error, defaultPreferences, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('assistant_preferences')
                            .select('*')
                            .eq('user_id', user.id)
                            .single()];
                case 3:
                    _b = _c.sent(), preferences = _b.data, error = _b.error;
                    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                        console.error('Error fetching preferences:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })];
                    }
                    // Se não existir, retornar preferências padrão
                    if (!preferences) {
                        defaultPreferences = {
                            language: 'pt-BR',
                            personality: 'profissional e amigável',
                            temperature: 0.7,
                            max_tokens: 2000,
                            preferred_model: 'gpt4',
                            voice_enabled: false,
                            notifications_enabled: true,
                            context_memory: true,
                            suggestions_enabled: true
                        };
                        return [2 /*return*/, server_1.NextResponse.json({ preferences: defaultPreferences })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ preferences: preferences })];
                case 4:
                    error_1 = _c.sent();
                    console.error('Preferences API Error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, authError, _b, language, personality, temperature, max_tokens, preferred_model, voice_enabled, notifications_enabled, context_memory, suggestions_enabled, preferencesData, _c, preferences, error, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _d.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    _b = _d.sent(), language = _b.language, personality = _b.personality, temperature = _b.temperature, max_tokens = _b.max_tokens, preferred_model = _b.preferred_model, voice_enabled = _b.voice_enabled, notifications_enabled = _b.notifications_enabled, context_memory = _b.context_memory, suggestions_enabled = _b.suggestions_enabled;
                    // Validações
                    if (temperature !== undefined && (temperature < 0 || temperature > 2)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Temperature must be between 0 and 2" }, { status: 400 })];
                    }
                    if (max_tokens !== undefined && (max_tokens < 1 || max_tokens > 4000)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Max tokens must be between 1 and 4000" }, { status: 400 })];
                    }
                    if (preferred_model && !['gpt4', 'claude', 'gpt35'].includes(preferred_model)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Invalid preferred model" }, { status: 400 })];
                    }
                    preferencesData = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ user_id: user.id }, (language !== undefined && { language: language })), (personality !== undefined && { personality: personality })), (temperature !== undefined && { temperature: temperature })), (max_tokens !== undefined && { max_tokens: max_tokens })), (preferred_model !== undefined && { preferred_model: preferred_model })), (voice_enabled !== undefined && { voice_enabled: voice_enabled })), (notifications_enabled !== undefined && { notifications_enabled: notifications_enabled })), (context_memory !== undefined && { context_memory: context_memory })), (suggestions_enabled !== undefined && { suggestions_enabled: suggestions_enabled }));
                    return [4 /*yield*/, supabase
                            .from('assistant_preferences')
                            .upsert(preferencesData, {
                            onConflict: 'user_id'
                        })
                            .select()
                            .single()];
                case 4:
                    _c = _d.sent(), preferences = _c.data, error = _c.error;
                    if (error) {
                        console.error('Error saving preferences:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ preferences: preferences })];
                case 5:
                    error_2 = _d.sent();
                    console.error('Save Preferences API Error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
