'use client';
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
exports.useAuditTrail = useAuditTrail;
var react_1 = require("react");
var LGPDComplianceManager_1 = require("@/lib/lgpd/LGPDComplianceManager");
var use_toast_1 = require("@/hooks/use-toast");
function useAuditTrail() {
    var _this = this;
    var _a = (0, react_1.useState)([]), events = _a[0], setEvents = _a[1];
    var _b = (0, react_1.useState)(0), totalCount = _b[0], setTotalCount = _b[1];
    var _c = (0, react_1.useState)(1), currentPage = _c[0], setCurrentPage = _c[1];
    var _d = (0, react_1.useState)({
        total: 0,
        today: 0,
        thisWeek: 0,
        uniqueUsers: 0
    }), statistics = _d[0], setStatistics = _d[1];
    var _e = (0, react_1.useState)({
        topActions: [],
        topEntities: [],
        topUsers: [],
        activityByPeriod: []
    }), analytics = _e[0], setAnalytics = _e[1];
    var _f = (0, react_1.useState)(true), isLoading = _f[0], setIsLoading = _f[1];
    var _g = (0, react_1.useState)(false), isUpdating = _g[0], setIsUpdating = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)({
        limit: 50,
        offset: 0,
        sortBy: 'timestamp',
        sortOrder: 'desc'
    }), filters = _j[0], setFilters = _j[1];
    var toast = (0, use_toast_1.useToast)().toast;
    var complianceManager = new LGPDComplianceManager_1.LGPDComplianceManager();
    var loadEvents = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, now, today_1, thisWeek_1, todayEvents, thisWeekEvents, uniqueUsers, err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setError(null);
                    return [4 /*yield*/, complianceManager.getAuditTrail(__assign(__assign({}, filters), { offset: (currentPage - 1) * (filters.limit || 50) }))];
                case 1:
                    response = _a.sent();
                    setEvents(response.data);
                    setTotalCount(response.total);
                    now = new Date();
                    today_1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    thisWeek_1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    todayEvents = response.data.filter(function (e) {
                        return new Date(e.timestamp) >= today_1;
                    }).length;
                    thisWeekEvents = response.data.filter(function (e) {
                        return new Date(e.timestamp) >= thisWeek_1;
                    }).length;
                    uniqueUsers = new Set(response.data.map(function (e) { return e.user_id; }).filter(Boolean)).size;
                    setStatistics({
                        total: response.total,
                        today: todayEvents,
                        thisWeek: thisWeekEvents,
                        uniqueUsers: uniqueUsers
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Erro ao carregar eventos de auditoria';
                    setError(errorMessage);
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [filters, currentPage, complianceManager, toast]);
    var loadAnalytics = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var allEventsResponse, allEvents, actionCounts, topActions, entityCounts, topEntities, userCounts, topUsers, activityByPeriod, _loop_1, i, err_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setError(null);
                    return [4 /*yield*/, complianceManager.getAuditTrail({
                            limit: 1000, // Get more data for analytics
                            sortBy: 'timestamp',
                            sortOrder: 'desc'
                        })];
                case 1:
                    allEventsResponse = _a.sent();
                    allEvents = allEventsResponse.data;
                    actionCounts = allEvents.reduce(function (acc, event) {
                        acc[event.action] = (acc[event.action] || 0) + 1;
                        return acc;
                    }, {});
                    topActions = Object.entries(actionCounts)
                        .sort(function (_a, _b) {
                        var a = _a[1];
                        var b = _b[1];
                        return b - a;
                    })
                        .slice(0, 5)
                        .map(function (_a) {
                        var action = _a[0], count = _a[1];
                        return ({ action: action, count: count });
                    });
                    entityCounts = allEvents.reduce(function (acc, event) {
                        if (event.entity_type) {
                            acc[event.entity_type] = (acc[event.entity_type] || 0) + 1;
                        }
                        return acc;
                    }, {});
                    topEntities = Object.entries(entityCounts)
                        .sort(function (_a, _b) {
                        var a = _a[1];
                        var b = _b[1];
                        return b - a;
                    })
                        .slice(0, 5)
                        .map(function (_a) {
                        var entity = _a[0], count = _a[1];
                        return ({ entity: entity, count: count });
                    });
                    userCounts = allEvents.reduce(function (acc, event) {
                        if (event.user_id) {
                            acc[event.user_id] = (acc[event.user_id] || 0) + 1;
                        }
                        return acc;
                    }, {});
                    topUsers = Object.entries(userCounts)
                        .sort(function (_a, _b) {
                        var a = _a[1];
                        var b = _b[1];
                        return b - a;
                    })
                        .slice(0, 5)
                        .map(function (_a) {
                        var user = _a[0], count = _a[1];
                        return ({ user: user, count: count });
                    });
                    activityByPeriod = [];
                    _loop_1 = function (i) {
                        var date = new Date();
                        date.setDate(date.getDate() - i);
                        var dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        var dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
                        var dayEvents = allEvents.filter(function (e) {
                            var eventDate = new Date(e.timestamp);
                            return eventDate >= dayStart && eventDate < dayEnd;
                        }).length;
                        activityByPeriod.push({
                            period: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
                            count: dayEvents
                        });
                    };
                    for (i = 6; i >= 0; i--) {
                        _loop_1(i);
                    }
                    setAnalytics({
                        topActions: topActions,
                        topEntities: topEntities,
                        topUsers: topUsers,
                        activityByPeriod: activityByPeriod
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    errorMessage = err_2 instanceof Error ? err_2.message : 'Erro ao carregar análises';
                    setError(errorMessage);
                    toast({
                        title: 'Erro',
                        description: errorMessage,
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [complianceManager, toast]);
    var exportEvents = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var csvHeaders, csvRows, csvContent, blob, link, url, errorMessage;
        return __generator(this, function (_a) {
            try {
                setError(null);
                csvHeaders = [
                    'ID',
                    'Ação',
                    'Tipo de Entidade',
                    'ID da Entidade',
                    'Usuário',
                    'Endereço IP',
                    'User Agent',
                    'Timestamp',
                    'Detalhes'
                ];
                csvRows = events.map(function (event) { return [
                    event.id,
                    event.action,
                    event.entity_type || '',
                    event.entity_id || '',
                    event.user_id || '',
                    event.ip_address || '',
                    event.user_agent || '',
                    event.timestamp,
                    JSON.stringify(event.details || {})
                ]; });
                csvContent = __spreadArray([csvHeaders], csvRows, true).map(function (row) { return row.map(function (cell) { return "\"".concat(cell, "\""); }).join(','); })
                    .join('\n');
                blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                link = document.createElement('a');
                url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', "lgpd-audit-trail-".concat(new Date().toISOString().split('T')[0], ".csv"));
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({
                    title: 'Exportação concluída',
                    description: 'Trilha de auditoria exportada com sucesso.'
                });
            }
            catch (err) {
                errorMessage = err instanceof Error ? err.message : 'Erro ao exportar trilha de auditoria';
                setError(errorMessage);
                toast({
                    title: 'Erro na exportação',
                    description: errorMessage,
                    variant: 'destructive'
                });
            }
            return [2 /*return*/];
        });
    }); }, [events, toast]);
    var goToPage = (0, react_1.useCallback)(function (page) {
        setCurrentPage(page);
    }, []);
    // Load data on mount and when filters change
    (0, react_1.useEffect)(function () {
        var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        return [4 /*yield*/, Promise.all([loadEvents(), loadAnalytics()])];
                    case 1:
                        _a.sent();
                        setIsLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        loadData();
    }, [loadEvents, loadAnalytics]);
    // Auto-refresh every 30 seconds
    (0, react_1.useEffect)(function () {
        var interval = setInterval(function () {
            if (!isUpdating) {
                setIsUpdating(true);
                loadEvents().finally(function () { return setIsUpdating(false); });
            }
        }, 30 * 1000); // 30 seconds
        return function () { return clearInterval(interval); };
    }, [loadEvents, isUpdating]);
    return {
        // Data
        events: events,
        totalCount: totalCount,
        currentPage: currentPage,
        statistics: statistics,
        analytics: analytics,
        // Loading states
        isLoading: isLoading,
        isUpdating: isUpdating,
        // Filters
        filters: filters,
        setFilters: setFilters,
        // Actions
        loadEvents: loadEvents,
        loadAnalytics: loadAnalytics,
        exportEvents: exportEvents,
        // Pagination
        goToPage: goToPage,
        // Error handling
        error: error
    };
}
