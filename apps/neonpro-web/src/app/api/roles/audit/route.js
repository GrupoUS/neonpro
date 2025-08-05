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
exports.POST = exports.GET = void 0;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var role_validation_1 = require("@/lib/middleware/role-validation");
exports.GET = (0, role_validation_1.withRoleValidation)(function (request, validation) { return __awaiter(void 0, void 0, void 0, function () {
    var supabase, searchParams, page, limit, action_type, target_user_id, start_date, end_date, offset, query, _a, auditLogs, logsError, count, _b, actionStats, statsError, stats, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                return [4 /*yield*/, (0, server_2.createClient)()];
            case 1:
                supabase = _c.sent();
                searchParams = new URL(request.url).searchParams;
                page = parseInt(searchParams.get('page') || '1');
                limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
                action_type = searchParams.get('action_type');
                target_user_id = searchParams.get('target_user_id');
                start_date = searchParams.get('start_date');
                end_date = searchParams.get('end_date');
                offset = (page - 1) * limit;
                query = supabase
                    .from('role_audit_log')
                    .select("\n          *,\n          user:profiles!role_audit_log_user_id_fkey(id, email, full_name),\n          target_user:profiles!role_audit_log_target_user_id_fkey(id, email, full_name)\n        ", { count: 'exact' });
                // Aplicar filtros
                if (action_type) {
                    query = query.eq('action_type', action_type);
                }
                if (target_user_id) {
                    query = query.eq('target_user_id', target_user_id);
                }
                if (start_date) {
                    query = query.gte('created_at', start_date);
                }
                if (end_date) {
                    query = query.lte('created_at', end_date);
                }
                return [4 /*yield*/, query
                        .order('created_at', { ascending: false })
                        .range(offset, offset + limit - 1)];
            case 2:
                _a = _c.sent(), auditLogs = _a.data, logsError = _a.error, count = _a.count;
                if (logsError) {
                    console.error('Erro ao buscar logs de auditoria:', logsError);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro ao buscar logs de auditoria' }, { status: 500 })];
                }
                return [4 /*yield*/, supabase
                        .from('role_audit_log')
                        .select('action_type')
                        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())];
            case 3:
                _b = _c.sent(), actionStats = _b.data, statsError = _b.error;
                stats = (actionStats === null || actionStats === void 0 ? void 0 : actionStats.reduce(function (acc, log) {
                    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
                    return acc;
                }, {})) || {};
                return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        audit_logs: auditLogs || [],
                        pagination: {
                            current_page: page,
                            total_pages: Math.ceil((count || 0) / limit),
                            total_items: count || 0,
                            items_per_page: limit
                        },
                        statistics: {
                            total_logs: count || 0,
                            actions_last_30_days: stats,
                            available_actions: [
                                'manual_role_assignment',
                                'domain_mapping_created',
                                'domain_mapping_updated',
                                'domain_mapping_deleted',
                                'access_validation',
                                'role_hierarchy_check',
                                'permission_check',
                                'conflict_resolution'
                            ]
                        }
                    })];
            case 4:
                error_1 = _c.sent();
                console.error('Erro no endpoint de logs de auditoria:', error_1);
                return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })];
            case 5: return [2 /*return*/];
        }
    });
}); }, {
    requiredRole: ['admin'],
    requiredPermission: ['view_analytics', 'manage_system']
});
exports.POST = (0, role_validation_1.withRoleValidation)(function (request, validation) { return __awaiter(void 0, void 0, void 0, function () {
    var supabase, body, action_type, target_user_id, old_role, new_role, target_domain, reason, _a, metadata, logEntry, _b, createdLog, logError, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                return [4 /*yield*/, (0, server_2.createClient)()];
            case 1:
                supabase = _c.sent();
                return [4 /*yield*/, request.json()];
            case 2:
                body = _c.sent();
                action_type = body.action_type, target_user_id = body.target_user_id, old_role = body.old_role, new_role = body.new_role, target_domain = body.target_domain, reason = body.reason, _a = body.metadata, metadata = _a === void 0 ? {} : _a;
                // Validar dados obrigatórios
                if (!action_type) {
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Tipo de ação é obrigatório' }, { status: 400 })];
                }
                logEntry = {
                    user_id: validation.user.id,
                    action_type: action_type,
                    target_user_id: target_user_id || null,
                    old_role: old_role || null,
                    new_role: new_role || null,
                    target_domain: target_domain || null,
                    reason: reason || null,
                    metadata: __assign(__assign({}, metadata), { manual_entry: true, created_by_admin: validation.profile.role === 'admin', timestamp: new Date().toISOString() })
                };
                return [4 /*yield*/, supabase
                        .from('role_audit_log')
                        .insert(logEntry)
                        .select("\n          *,\n          user:profiles!role_audit_log_user_id_fkey(id, email, full_name),\n          target_user:profiles!role_audit_log_target_user_id_fkey(id, email, full_name)\n        ")
                        .single()];
            case 3:
                _b = _c.sent(), createdLog = _b.data, logError = _b.error;
                if (logError) {
                    console.error('Erro ao criar log de auditoria:', logError);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro ao criar entrada de log' }, { status: 500 })];
                }
                return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        audit_log: createdLog,
                        message: 'Log de auditoria criado com sucesso'
                    })];
            case 4:
                error_2 = _c.sent();
                console.error('Erro no endpoint de criação de log:', error_2);
                return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })];
            case 5: return [2 /*return*/];
        }
    });
}); }, {
    requiredRole: ['admin']
});
