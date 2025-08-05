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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
// app/api/search/route.ts
var server_1 = require("@/lib/supabase/server");
var unified_search_1 = require("@/lib/search/unified-search");
var server_2 = require("next/server");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, session, searchParams, searchType, naturalQuery, response_1, response_2, query, response, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_d.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_2.NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    searchType = searchParams.get('type') || 'traditional';
                    naturalQuery = searchParams.get('q') || searchParams.get('query');
                    if (!(searchType === 'conversational' && naturalQuery)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, unified_search_1.createunifiedSearchSystem)().conversationalSearch(naturalQuery, session.user.id, 'user')];
                case 3:
                    response_1 = _d.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: response_1,
                            type: 'conversational'
                        })];
                case 4:
                    if (!(searchType === 'smart' && naturalQuery)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, unified_search_1.createunifiedSearchSystem)().smartSearch(naturalQuery, {
                            userId: session.user.id,
                            userRole: 'user',
                            recentSearches: [] // Could be loaded from database
                        }, {
                            limit: parseInt(searchParams.get('limit') || '20')
                        })];
                case 5:
                    response_2 = _d.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: response_2,
                            type: 'smart'
                        })];
                case 6:
                    query = {
                        term: naturalQuery || '',
                        filters: {
                            types: ((_a = searchParams.get('types')) === null || _a === void 0 ? void 0 : _a.split(',')) || undefined,
                            dateRange: searchParams.get('dateFrom') && searchParams.get('dateTo') ? {
                                start: new Date(searchParams.get('dateFrom')),
                                end: new Date(searchParams.get('dateTo'))
                            } : undefined,
                            patientId: searchParams.get('patientId') || undefined,
                            status: ((_b = searchParams.get('status')) === null || _b === void 0 ? void 0 : _b.split(',')) || undefined,
                            priority: ((_c = searchParams.get('priority')) === null || _c === void 0 ? void 0 : _c.split(',')) || undefined
                        },
                        options: {
                            limit: parseInt(searchParams.get('limit') || '20'),
                            offset: parseInt(searchParams.get('offset') || '0'),
                            sortBy: searchParams.get('sortBy') || 'relevance',
                            sortOrder: searchParams.get('sortOrder') || 'desc',
                            fuzzy: searchParams.get('fuzzy') === 'true',
                            highlight: searchParams.get('highlight') === 'true',
                            useNLP: searchParams.get('nlp') !== 'false' // Enable NLP by default
                        }
                    };
                    return [4 /*yield*/, (0, unified_search_1.createunifiedSearchSystem)().search(query)];
                case 7:
                    response = _d.sent();
                    // Log search analytics (async, don't wait)
                    logSearchAnalytics(session.user.id, query.term, 'traditional', response.totalCount)
                        .catch(function (error) { return console.error('Failed to log search analytics:', error); });
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: response,
                            type: 'traditional'
                        })];
                case 8:
                    error_1 = _d.sent();
                    console.error('Erro na API de busca:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: false,
                            error: 'Erro interno do servidor'
                        }, { status: 500 })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, action, data, _a, response, savedId, stats, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    action = body.action, data = __rest(body, ["action"]);
                    _a = action;
                    switch (_a) {
                        case 'advanced_search': return [3 /*break*/, 2];
                        case 'save_search': return [3 /*break*/, 4];
                        case 'get_statistics': return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 8];
                case 2: return [4 /*yield*/, (0, unified_search_1.createunifiedSearchSystem)().advancedSearch(data.criteria)];
                case 3:
                    response = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: response
                        })];
                case 4: return [4 /*yield*/, (0, unified_search_1.createunifiedSearchSystem)().saveSearch(data.name, data.query, data.userId)];
                case 5:
                    savedId = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: { id: savedId }
                        })];
                case 6: return [4 /*yield*/, (0, unified_search_1.createunifiedSearchSystem)().getSearchStatistics(data.timeframe)];
                case 7:
                    stats = _b.sent();
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: true,
                            data: stats
                        })];
                case 8: return [2 /*return*/, server_2.NextResponse.json({
                        success: false,
                        error: 'Ação não reconhecida'
                    }, { status: 400 })];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_2 = _b.sent();
                    console.error('Erro na API de busca (POST):', error_2);
                    return [2 /*return*/, server_2.NextResponse.json({
                            success: false,
                            error: 'Erro interno do servidor'
                        }, { status: 500 })];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Log search analytics for performance monitoring and insights
 */
function logSearchAnalytics(userId, query, searchType, resultCount) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _a.sent();
                    // Check if search_analytics table exists, if not create it silently
                    return [4 /*yield*/, supabase
                            .from('search_analytics')
                            .insert({
                            user_id: userId,
                            query: query.substring(0, 500), // Limit query length
                            search_type: searchType,
                            result_count: resultCount,
                            timestamp: new Date().toISOString(),
                            metadata: {
                                execution_time: 0 // Could be passed from search execution
                            }
                        })];
                case 2:
                    // Check if search_analytics table exists, if not create it silently
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    // Don't throw - analytics shouldn't break the search functionality
                    console.error('Search analytics logging failed:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
