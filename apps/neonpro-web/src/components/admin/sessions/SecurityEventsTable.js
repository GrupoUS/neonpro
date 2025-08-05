/**
 * Security Events Table Component
 * Story 1.4: Session Management & Security
 *
 * Comprehensive table for viewing and managing security events
 * with filtering, sorting, and resolution capabilities.
 */
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
exports.default = SecurityEventsTable;
var react_1 = require("react");
var table_1 = require("@/components/ui/table");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var session_1 = require("@/types/session");
var useSession_1 = require("@/hooks/useSession");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function SecurityEventsTable(_a) {
    var _this = this;
    var events = _a.events, onReportActivity = _a.onReportActivity;
    var _b = (0, useSession_1.useSecurityEvents)(), resolveEvent = _b.resolveEvent, dismissEvent = _b.dismissEvent;
    var _c = (0, react_1.useState)({
        search: '',
        severity: 'all',
        eventType: 'all',
        resolved: 'all',
        dateRange: 'all'
    }), filters = _c[0], setFilters = _c[1];
    var _d = (0, react_1.useState)([]), selectedEvents = _d[0], setSelectedEvents = _d[1];
    // ============================================================================
    // FILTERING AND SORTING
    // ============================================================================
    var filteredEvents = (0, react_1.useMemo)(function () {
        var filtered = __spreadArray([], events, true);
        // Search filter
        if (filters.search) {
            var searchLower_1 = filters.search.toLowerCase();
            filtered = filtered.filter(function (event) {
                return event.event_type.toLowerCase().includes(searchLower_1) ||
                    event.ip_address.toLowerCase().includes(searchLower_1) ||
                    (event.details && JSON.stringify(event.details).toLowerCase().includes(searchLower_1));
            });
        }
        // Severity filter
        if (filters.severity !== 'all') {
            filtered = filtered.filter(function (event) { return event.severity === filters.severity; });
        }
        // Event type filter
        if (filters.eventType !== 'all') {
            filtered = filtered.filter(function (event) { return event.event_type === filters.eventType; });
        }
        // Resolved filter
        if (filters.resolved !== 'all') {
            filtered = filtered.filter(function (event) {
                return filters.resolved === 'resolved' ? event.resolved : !event.resolved;
            });
        }
        // Date range filter
        if (filters.dateRange !== 'all') {
            var now = new Date();
            var cutoff_1 = new Date();
            switch (filters.dateRange) {
                case '24h':
                    cutoff_1.setHours(now.getHours() - 24);
                    break;
                case '7d':
                    cutoff_1.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    cutoff_1.setDate(now.getDate() - 30);
                    break;
            }
            filtered = filtered.filter(function (event) {
                return new Date(event.timestamp) >= cutoff_1;
            });
        }
        // Sort by timestamp (newest first)
        return filtered.sort(function (a, b) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }, [events, filters]);
    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    var handleResolveEvent = function (eventId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, resolveEvent(eventId)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Failed to resolve event:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleDismissEvent = function (eventId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, dismissEvent(eventId)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to dismiss event:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleBulkResolve = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all(selectedEvents.map(function (eventId) { return resolveEvent(eventId); }))];
                case 1:
                    _a.sent();
                    setSelectedEvents([]);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Failed to bulk resolve events:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleExportEvents = function () {
        var csvContent = __spreadArray([
            ['Timestamp', 'Event Type', 'Severity', 'IP Address', 'Resolved', 'Details'].join(',')
        ], filteredEvents.map(function (event) { return [
            (0, date_fns_1.format)(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'),
            event.event_type,
            event.severity,
            event.ip_address,
            event.resolved ? 'Yes' : 'No',
            JSON.stringify(event.details || {})
        ].join(','); }), true).join('\n');
        var blob = new Blob([csvContent], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "security-events-".concat((0, date_fns_1.format)(new Date(), 'yyyy-MM-dd'), ".csv");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    var getSeverityBadge = function (severity) {
        var config = {
            low: { variant: 'secondary', color: 'text-blue-600' },
            medium: { variant: 'default', color: 'text-yellow-600' },
            high: { variant: 'destructive', color: 'text-orange-600' },
            critical: { variant: 'destructive', color: 'text-red-600' }
        };
        var _a = config[severity] || config.medium, variant = _a.variant, color = _a.color;
        return (<badge_1.Badge variant={variant} className={color}>
        {severity.toUpperCase()}
      </badge_1.Badge>);
    };
    var getEventTypeLabel = function (eventType) {
        var _a;
        var labels = (_a = {},
            _a[session_1.SecurityEventType.UNUSUAL_LOCATION] = 'Localização Incomum',
            _a[session_1.SecurityEventType.DEVICE_CHANGE] = 'Mudança de Dispositivo',
            _a[session_1.SecurityEventType.RAPID_REQUESTS] = 'Requisições Rápidas',
            _a[session_1.SecurityEventType.SESSION_HIJACK_ATTEMPT] = 'Tentativa de Sequestro',
            _a[session_1.SecurityEventType.SUSPICIOUS_USER_AGENT] = 'User Agent Suspeito',
            _a[session_1.SecurityEventType.CONCURRENT_SESSION_LIMIT] = 'Limite de Sessões',
            _a[session_1.SecurityEventType.FAILED_AUTHENTICATION] = 'Falha na Autenticação',
            _a[session_1.SecurityEventType.PRIVILEGE_ESCALATION] = 'Escalação de Privilégios',
            _a);
        return labels[eventType] || eventType;
    };
    var getEventTypeIcon = function (eventType) {
        var _a;
        var icons = (_a = {},
            _a[session_1.SecurityEventType.UNUSUAL_LOCATION] = <lucide_react_1.MapPin className="h-4 w-4"/>,
            _a[session_1.SecurityEventType.DEVICE_CHANGE] = <lucide_react_1.Monitor className="h-4 w-4"/>,
            _a[session_1.SecurityEventType.RAPID_REQUESTS] = <lucide_react_1.Clock className="h-4 w-4"/>,
            _a[session_1.SecurityEventType.SESSION_HIJACK_ATTEMPT] = <lucide_react_1.Shield className="h-4 w-4"/>,
            _a[session_1.SecurityEventType.SUSPICIOUS_USER_AGENT] = <lucide_react_1.Eye className="h-4 w-4"/>,
            _a[session_1.SecurityEventType.CONCURRENT_SESSION_LIMIT] = <lucide_react_1.AlertTriangle className="h-4 w-4"/>,
            _a[session_1.SecurityEventType.FAILED_AUTHENTICATION] = <lucide_react_1.XCircle className="h-4 w-4"/>,
            _a[session_1.SecurityEventType.PRIVILEGE_ESCALATION] = <lucide_react_1.Shield className="h-4 w-4"/>,
            _a);
        return icons[eventType] || <lucide_react_1.AlertTriangle className="h-4 w-4"/>;
    };
    // ============================================================================
    // RENDER
    // ============================================================================
    return (<card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle>Eventos de Segurança</card_1.CardTitle>
            <card_1.CardDescription>
              Monitore e gerencie eventos de segurança da sessão
            </card_1.CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {selectedEvents.length > 0 && (<button_1.Button variant="outline" size="sm" onClick={handleBulkResolve}>
                <lucide_react_1.CheckCircle className="h-4 w-4 mr-2"/>
                Resolver Selecionados ({selectedEvents.length})
              </button_1.Button>)}
            <button_1.Button variant="outline" size="sm" onClick={handleExportEvents}>
              <lucide_react_1.Download className="h-4 w-4 mr-2"/>
              Exportar
            </button_1.Button>
            <button_1.Button variant="outline" size="sm" onClick={function () { return onReportActivity(session_1.SecurityEventType.SUSPICIOUS_USER_AGENT, {
            manual_report: true,
            description: 'Atividade suspeita reportada pelo usuário'
        }); }}>
              <lucide_react_1.AlertTriangle className="h-4 w-4 mr-2"/>
              Reportar Atividade
            </button_1.Button>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
              <input_1.Input placeholder="Buscar eventos..." value={filters.search} onChange={function (e) { return setFilters(function (prev) { return (__assign(__assign({}, prev), { search: e.target.value })); }); }} className="pl-8"/>
            </div>
          </div>
          
          <select_1.Select value={filters.severity} onValueChange={function (value) { return setFilters(function (prev) { return (__assign(__assign({}, prev), { severity: value })); }); }}>
            <select_1.SelectTrigger className="w-[140px]">
              <select_1.SelectValue placeholder="Severidade"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todas</select_1.SelectItem>
              <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
              <select_1.SelectItem value="medium">Média</select_1.SelectItem>
              <select_1.SelectItem value="high">Alta</select_1.SelectItem>
              <select_1.SelectItem value="critical">Crítica</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <select_1.Select value={filters.eventType} onValueChange={function (value) { return setFilters(function (prev) { return (__assign(__assign({}, prev), { eventType: value })); }); }}>
            <select_1.SelectTrigger className="w-[180px]">
              <select_1.SelectValue placeholder="Tipo de Evento"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos</select_1.SelectItem>
              {Object.values(session_1.SecurityEventType).map(function (type) { return (<select_1.SelectItem key={type} value={type}>
                  {getEventTypeLabel(type)}
                </select_1.SelectItem>); })}
            </select_1.SelectContent>
          </select_1.Select>

          <select_1.Select value={filters.resolved} onValueChange={function (value) { return setFilters(function (prev) { return (__assign(__assign({}, prev), { resolved: value })); }); }}>
            <select_1.SelectTrigger className="w-[140px]">
              <select_1.SelectValue placeholder="Status"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos</select_1.SelectItem>
              <select_1.SelectItem value="unresolved">Pendentes</select_1.SelectItem>
              <select_1.SelectItem value="resolved">Resolvidos</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <select_1.Select value={filters.dateRange} onValueChange={function (value) { return setFilters(function (prev) { return (__assign(__assign({}, prev), { dateRange: value })); }); }}>
            <select_1.SelectTrigger className="w-[120px]">
              <select_1.SelectValue placeholder="Período"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos</select_1.SelectItem>
              <select_1.SelectItem value="24h">24h</select_1.SelectItem>
              <select_1.SelectItem value="7d">7 dias</select_1.SelectItem>
              <select_1.SelectItem value="30d">30 dias</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Events Table */}
        <div className="rounded-md border">
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead className="w-[50px]">
                  <input type="checkbox" checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0} onChange={function (e) {
            if (e.target.checked) {
                setSelectedEvents(filteredEvents.map(function (event) { return event.id; }));
            }
            else {
                setSelectedEvents([]);
            }
        }}/>
                </table_1.TableHead>
                <table_1.TableHead>Evento</table_1.TableHead>
                <table_1.TableHead>Severidade</table_1.TableHead>
                <table_1.TableHead>IP Address</table_1.TableHead>
                <table_1.TableHead>Timestamp</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead className="w-[50px]">Ações</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {filteredEvents.length === 0 ? (<table_1.TableRow>
                  <table_1.TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum evento encontrado
                  </table_1.TableCell>
                </table_1.TableRow>) : (filteredEvents.map(function (event) { return (<table_1.TableRow key={event.id}>
                    <table_1.TableCell>
                      <input type="checkbox" checked={selectedEvents.includes(event.id)} onChange={function (e) {
                if (e.target.checked) {
                    setSelectedEvents(function (prev) { return __spreadArray(__spreadArray([], prev, true), [event.id], false); });
                }
                else {
                    setSelectedEvents(function (prev) { return prev.filter(function (id) { return id !== event.id; }); });
                }
            }}/>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        {getEventTypeIcon(event.event_type)}
                        <span className="font-medium">
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {getSeverityBadge(event.severity)}
                    </table_1.TableCell>
                    <table_1.TableCell className="font-mono text-sm">
                      {event.ip_address}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {(0, date_fns_1.format)(new Date(event.timestamp), 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {event.resolved ? (<div className="flex items-center space-x-1 text-green-600">
                          <lucide_react_1.CheckCircle className="h-4 w-4"/>
                          <span>Resolvido</span>
                        </div>) : (<div className="flex items-center space-x-1 text-red-600">
                          <lucide_react_1.XCircle className="h-4 w-4"/>
                          <span>Pendente</span>
                        </div>)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                            <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                          </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                          <dropdown_menu_1.DropdownMenuLabel>Ações</dropdown_menu_1.DropdownMenuLabel>
                          <dropdown_menu_1.DropdownMenuSeparator />
                          {!event.resolved && (<>
                              <dropdown_menu_1.DropdownMenuItem onClick={function () { return handleResolveEvent(event.id); }}>
                                <lucide_react_1.CheckCircle className="h-4 w-4 mr-2"/>
                                Resolver
                              </dropdown_menu_1.DropdownMenuItem>
                              <dropdown_menu_1.DropdownMenuItem onClick={function () { return handleDismissEvent(event.id); }}>
                                <lucide_react_1.XCircle className="h-4 w-4 mr-2"/>
                                Descartar
                              </dropdown_menu_1.DropdownMenuItem>
                            </>)}
                          <dropdown_menu_1.DropdownMenuItem onClick={function () {
                navigator.clipboard.writeText(JSON.stringify(event, null, 2));
            }}>
                            <lucide_react_1.Eye className="h-4 w-4 mr-2"/>
                            Ver Detalhes
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </table_1.TableCell>
                  </table_1.TableRow>); }))}
            </table_1.TableBody>
          </table_1.Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>
            Mostrando {filteredEvents.length} de {events.length} eventos
          </span>
          <span>
            {filteredEvents.filter(function (e) { return !e.resolved; }).length} pendentes, {' '}
            {filteredEvents.filter(function (e) { return e.resolved; }).length} resolvidos
          </span>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
