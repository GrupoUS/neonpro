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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertPanel = AlertPanel;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var scroll_area_1 = require("@/components/ui/scroll-area");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var checkbox_1 = require("@/components/ui/checkbox");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var SEVERITY_CONFIG = {
    critical: {
        icon: lucide_react_1.XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeVariant: 'destructive',
        label: 'Critical',
        priority: 1
    },
    warning: {
        icon: lucide_react_1.AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        badgeVariant: 'secondary',
        label: 'Warning',
        priority: 2
    },
    info: {
        icon: lucide_react_1.Info,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        badgeVariant: 'outline',
        label: 'Info',
        priority: 3
    }
};
var STATUS_CONFIG = {
    active: {
        icon: lucide_react_1.AlertCircle,
        color: 'text-orange-600',
        label: 'Active'
    },
    acknowledged: {
        icon: lucide_react_1.Eye,
        color: 'text-blue-600',
        label: 'Acknowledged'
    },
    resolved: {
        icon: lucide_react_1.CheckCircle,
        color: 'text-green-600',
        label: 'Resolved'
    },
    dismissed: {
        icon: lucide_react_1.EyeOff,
        color: 'text-gray-600',
        label: 'Dismissed'
    }
};
var CATEGORY_CONFIG = {
    performance: {
        icon: lucide_react_1.TrendingUp,
        label: 'Performance',
        color: 'text-blue-600'
    },
    financial: {
        icon: lucide_react_1.Activity,
        label: 'Financial',
        color: 'text-green-600'
    },
    operational: {
        icon: lucide_react_1.Settings,
        label: 'Operational',
        color: 'text-purple-600'
    },
    system: {
        icon: lucide_react_1.AlertTriangle,
        label: 'System',
        color: 'text-red-600'
    },
    compliance: {
        icon: lucide_react_1.CheckCircle,
        label: 'Compliance',
        color: 'text-indigo-600'
    }
};
function AlertPanel(_a) {
    var _this = this;
    var clinicId = _a.clinicId, userId = _a.userId, _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.maxHeight, maxHeight = _c === void 0 ? 600 : _c, _d = _a.showFilters, showFilters = _d === void 0 ? true : _d, _e = _a.autoRefresh, autoRefresh = _e === void 0 ? true : _e, onAlertClick = _a.onAlertClick;
    var _f = (0, react_1.useState)([]), alerts = _f[0], setAlerts = _f[1];
    var _g = (0, react_1.useState)(true), isLoading = _g[0], setIsLoading = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)(new Set()), selectedAlerts = _j[0], setSelectedAlerts = _j[1];
    var _k = (0, react_1.useState)('all'), activeTab = _k[0], setActiveTab = _k[1];
    var _l = (0, react_1.useState)({
        severity: [],
        status: [],
        category: [],
        dateRange: 'week',
        search: '',
        assignedToMe: false
    }), filters = _l[0], setFilters = _l[1];
    // Fetch alerts
    (0, react_1.useEffect)(function () {
        var fetchAlerts = function () { return __awaiter(_this, void 0, void 0, function () {
            var mockAlerts, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        setIsLoading(true);
                        setError(null);
                        // Simulate API call - replace with actual implementation
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        // Simulate API call - replace with actual implementation
                        _a.sent();
                        mockAlerts = generateMockAlerts(clinicId, userId);
                        setAlerts(mockAlerts);
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _a.sent();
                        setError(err_1 instanceof Error ? err_1.message : 'Failed to load alerts');
                        return [3 /*break*/, 4];
                    case 3:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetchAlerts();
        // Set up auto-refresh
        if (autoRefresh) {
            var interval_1 = setInterval(fetchAlerts, 30000); // 30 seconds
            return function () { return clearInterval(interval_1); };
        }
    }, [clinicId, userId, autoRefresh]);
    // Filter and sort alerts
    var filteredAlerts = (0, react_1.useMemo)(function () {
        var filtered = alerts;
        // Apply tab filter
        switch (activeTab) {
            case 'unread':
                filtered = filtered.filter(function (alert) { return !alert.isRead; });
                break;
            case 'critical':
                filtered = filtered.filter(function (alert) { return alert.severity === 'critical'; });
                break;
        }
        // Apply filters
        if (filters.severity.length > 0) {
            filtered = filtered.filter(function (alert) { return filters.severity.includes(alert.severity); });
        }
        if (filters.status.length > 0) {
            filtered = filtered.filter(function (alert) { return filters.status.includes(alert.status); });
        }
        if (filters.category.length > 0) {
            filtered = filtered.filter(function (alert) { return filters.category.includes(alert.category); });
        }
        if (filters.assignedToMe) {
            filtered = filtered.filter(function (alert) { return alert.assignedTo === userId; });
        }
        if (filters.search) {
            var searchLower_1 = filters.search.toLowerCase();
            filtered = filtered.filter(function (alert) {
                return alert.title.toLowerCase().includes(searchLower_1) ||
                    alert.message.toLowerCase().includes(searchLower_1);
            });
        }
        // Apply date range filter
        var now = new Date();
        var dateThreshold = new Date();
        switch (filters.dateRange) {
            case 'today':
                dateThreshold.setHours(0, 0, 0, 0);
                break;
            case 'week':
                dateThreshold.setDate(now.getDate() - 7);
                break;
            case 'month':
                dateThreshold.setMonth(now.getMonth() - 1);
                break;
            default:
                dateThreshold.setFullYear(2000); // Show all
        }
        if (filters.dateRange !== 'all') {
            filtered = filtered.filter(function (alert) { return new Date(alert.createdAt) >= dateThreshold; });
        }
        // Sort by priority and date
        return filtered.sort(function (a, b) {
            var aPriority = SEVERITY_CONFIG[a.severity].priority;
            var bPriority = SEVERITY_CONFIG[b.severity].priority;
            if (aPriority !== bPriority) {
                return aPriority - bPriority; // Lower number = higher priority
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [alerts, activeTab, filters, userId]);
    // Calculate stats
    var stats = (0, react_1.useMemo)(function () {
        return {
            total: alerts.length,
            critical: alerts.filter(function (a) { return a.severity === 'critical'; }).length,
            warning: alerts.filter(function (a) { return a.severity === 'warning'; }).length,
            info: alerts.filter(function (a) { return a.severity === 'info'; }).length,
            unread: alerts.filter(function (a) { return !a.isRead; }).length,
            resolved: alerts.filter(function (a) { return a.status === 'resolved'; }).length
        };
    }, [alerts]);
    // Handle alert actions
    var handleAlertClick = function (alert) {
        // Mark as read
        setAlerts(function (prev) { return prev.map(function (a) {
            return a.id === alert.id ? __assign(__assign({}, a), { isRead: true }) : a;
        }); });
        onAlertClick === null || onAlertClick === void 0 ? void 0 : onAlertClick(alert);
    };
    var handleBulkAction = function (action) { return __awaiter(_this, void 0, void 0, function () {
        var alertIds, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    alertIds = Array.from(selectedAlerts);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 2:
                    // Simulate API call
                    _a.sent();
                    setAlerts(function (prev) { return prev.map(function (alert) {
                        if (alertIds.includes(alert.id)) {
                            switch (action) {
                                case 'acknowledge':
                                    return __assign(__assign({}, alert), { status: 'acknowledged', isRead: true });
                                case 'resolve':
                                    return __assign(__assign({}, alert), { status: 'resolved', isRead: true });
                                case 'dismiss':
                                    return __assign(__assign({}, alert), { status: 'dismissed', isRead: true });
                                case 'delete':
                                    return null; // Will be filtered out
                                default:
                                    return alert;
                            }
                        }
                        return alert;
                    }).filter(Boolean); });
                    setSelectedAlerts(new Set());
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Failed to perform bulk action:', err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsLoading(true);
            setTimeout(function () {
                setIsLoading(false);
            }, 1000);
            return [2 /*return*/];
        });
    }); };
    // Render alert item
    var renderAlertItem = function (alert) {
        var severityConfig = SEVERITY_CONFIG[alert.severity];
        var statusConfig = STATUS_CONFIG[alert.status];
        var categoryConfig = CATEGORY_CONFIG[alert.category];
        var SeverityIcon = severityConfig.icon;
        var StatusIcon = statusConfig.icon;
        var CategoryIcon = categoryConfig.icon;
        var isSelected = selectedAlerts.has(alert.id);
        var timeAgo = getTimeAgo(alert.createdAt);
        return (<div key={alert.id} className={"p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ".concat(!alert.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200', " ").concat(isSelected ? 'ring-2 ring-blue-500' : '')} onClick={function () { return handleAlertClick(alert); }}>
        <div className="flex items-start gap-3">
          <checkbox_1.Checkbox checked={isSelected} onCheckedChange={function (checked) {
                var newSelected = new Set(selectedAlerts);
                if (checked) {
                    newSelected.add(alert.id);
                }
                else {
                    newSelected.delete(alert.id);
                }
                setSelectedAlerts(newSelected);
            }} onClick={function (e) { return e.stopPropagation(); }}/>
          
          <div className={"p-1 rounded ".concat(severityConfig.bgColor)}>
            <SeverityIcon className={"h-4 w-4 ".concat(severityConfig.color)}/>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={"font-medium text-sm truncate ".concat(!alert.isRead ? 'text-gray-900' : 'text-gray-700')}>
                {alert.title}
              </h4>
              
              <badge_1.Badge variant={severityConfig.badgeVariant} className="text-xs">
                {severityConfig.label}
              </badge_1.Badge>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CategoryIcon className="h-3 w-3"/>
                <span>{categoryConfig.label}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {alert.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <StatusIcon className={"h-3 w-3 ".concat(statusConfig.color)}/>
                <span>{statusConfig.label}</span>
                
                <span>•</span>
                
                <lucide_react_1.Clock className="h-3 w-3"/>
                <span>{timeAgo}</span>
                
                {alert.assignedTo && (<>
                    <span>•</span>
                    <lucide_react_1.User className="h-3 w-3"/>
                    <span>Assigned</span>
                  </>)}
              </div>
              
              {!alert.isRead && (<div className="w-2 h-2 bg-blue-500 rounded-full"/>)}
            </div>
          </div>
        </div>
      </div>);
    };
    if (isLoading) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <skeleton_1.Skeleton className="h-5 w-24"/>
            <skeleton_1.Skeleton className="h-4 w-4"/>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map(function (_, i) { return (<div key={i} className="flex items-start gap-3">
                <skeleton_1.Skeleton className="h-4 w-4"/>
                <skeleton_1.Skeleton className="h-8 w-8 rounded"/>
                <div className="flex-1 space-y-2">
                  <skeleton_1.Skeleton className="h-4 w-3/4"/>
                  <skeleton_1.Skeleton className="h-3 w-1/2"/>
                </div>
              </div>); })}
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (error) {
        return (<card_1.Card className={"".concat(className, " border-red-200 bg-red-50")}>
        <card_1.CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-red-600">
            <lucide_react_1.AlertTriangle className="h-8 w-8 mx-auto mb-2"/>
            <div className="font-medium">Error loading alerts</div>
            <div className="text-sm">{error}</div>
            <button_1.Button size="sm" variant="outline" className="mt-2" onClick={handleRefresh}>
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
              Retry
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="text-lg font-semibold flex items-center gap-2">
            <lucide_react_1.Bell className="h-5 w-5"/>
            Alerts
            {stats.unread > 0 && (<badge_1.Badge variant="destructive" className="text-xs">
                {stats.unread}
              </badge_1.Badge>)}
          </card_1.CardTitle>
          
          <div className="flex items-center gap-1">
            <button_1.Button size="sm" variant="ghost" onClick={handleRefresh}>
              <lucide_react_1.RefreshCw className="h-4 w-4"/>
            </button_1.Button>
            
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button size="sm" variant="ghost">
                  <lucide_react_1.MoreVertical className="h-4 w-4"/>
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="end">
                <dropdown_menu_1.DropdownMenuItem>
                  <lucide_react_1.Settings className="h-4 w-4 mr-2"/>
                  Settings
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem>
                  <lucide_react_1.Archive className="h-4 w-4 mr-2"/>
                  Archive All
                </dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total: {stats.total}</span>
          <span className="text-red-600">Critical: {stats.critical}</span>
          <span className="text-yellow-600">Warning: {stats.warning}</span>
          <span className="text-green-600">Resolved: {stats.resolved}</span>
        </div>
      </card_1.CardHeader>
      
      <card_1.CardContent className="pt-0">
        {/* Tabs */}
        <tabs_1.Tabs value={activeTab} onValueChange={function (value) { return setActiveTab(value); }}>
          <tabs_1.TabsList className="grid w-full grid-cols-3">
            <tabs_1.TabsTrigger value="all" className="text-xs">
              All ({stats.total})
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="unread" className="text-xs">
              Unread ({stats.unread})
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="critical" className="text-xs">
              Critical ({stats.critical})
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>
          
          {/* Filters */}
          {showFilters && (<div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <lucide_react_1.Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground"/>
                  <input_1.Input placeholder="Search alerts..." value={filters.search} onChange={function (e) { return setFilters(function (prev) { return (__assign(__assign({}, prev), { search: e.target.value })); }); }} className="pl-7 h-7 text-xs"/>
                </div>
                
                <select_1.Select value={filters.dateRange} onValueChange={function (value) { return setFilters(function (prev) { return (__assign(__assign({}, prev), { dateRange: value })); }); }}>
                  <select_1.SelectTrigger className="w-24 h-7 text-xs">
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="today">Today</select_1.SelectItem>
                    <select_1.SelectItem value="week">Week</select_1.SelectItem>
                    <select_1.SelectItem value="month">Month</select_1.SelectItem>
                    <select_1.SelectItem value="all">All</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              
              <div className="flex items-center gap-2">
                <checkbox_1.Checkbox id="assigned-to-me" checked={filters.assignedToMe} onCheckedChange={function (checked) {
                return setFilters(function (prev) { return (__assign(__assign({}, prev), { assignedToMe: !!checked })); });
            }}/>
                <label htmlFor="assigned-to-me" className="text-xs text-muted-foreground">
                  Assigned to me
                </label>
              </div>
            </div>)}
          
          {/* Bulk Actions */}
          {selectedAlerts.size > 0 && (<div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedAlerts.size} alert(s) selected
                </span>
                
                <div className="flex items-center gap-1">
                  <button_1.Button size="sm" variant="outline" onClick={function () { return handleBulkAction('acknowledge'); }}>
                    <lucide_react_1.Eye className="h-3 w-3 mr-1"/>
                    Acknowledge
                  </button_1.Button>
                  <button_1.Button size="sm" variant="outline" onClick={function () { return handleBulkAction('resolve'); }}>
                    <lucide_react_1.CheckCircle className="h-3 w-3 mr-1"/>
                    Resolve
                  </button_1.Button>
                  <button_1.Button size="sm" variant="outline" onClick={function () { return handleBulkAction('delete'); }}>
                    <lucide_react_1.Trash2 className="h-3 w-3 mr-1"/>
                    Delete
                  </button_1.Button>
                </div>
              </div>
            </div>)}
          
          <tabs_1.TabsContent value={activeTab} className="mt-3">
            <scroll_area_1.ScrollArea className="h-full" style={{ maxHeight: maxHeight - 200 }}>
              <div className="space-y-2">
                {filteredAlerts.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                    <lucide_react_1.Bell className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                    <div>No alerts found</div>
                    <div className="text-sm">All clear! 🎉</div>
                  </div>) : (filteredAlerts.map(renderAlertItem))}
              </div>
            </scroll_area_1.ScrollArea>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </card_1.CardContent>
    </card_1.Card>);
}
// Helper functions
function generateMockAlerts(clinicId, userId) {
    var alerts = [];
    var now = new Date();
    var mockData = [
        {
            title: 'High Patient Wait Time',
            message: 'Average wait time has exceeded 45 minutes in the last hour',
            severity: 'critical',
            category: 'operational',
            createdAt: new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
            title: 'Revenue Target Alert',
            message: 'Monthly revenue is 15% below target with 5 days remaining',
            severity: 'warning',
            category: 'financial',
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
            title: 'System Backup Completed',
            message: 'Daily system backup completed successfully',
            severity: 'info',
            category: 'system',
            createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
            title: 'Patient Satisfaction Score',
            message: 'Patient satisfaction has improved to 4.8/5.0 this week',
            severity: 'info',
            category: 'performance',
            createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) // 6 hours ago
        },
        {
            title: 'Compliance Audit Due',
            message: 'Annual compliance audit is due in 7 days',
            severity: 'warning',
            category: 'compliance',
            createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
        }
    ];
    mockData.forEach(function (data, index) {
        alerts.push({
            id: "alert-".concat(index + 1),
            clinicId: clinicId,
            title: data.title,
            message: data.message,
            severity: data.severity,
            category: data.category,
            status: index === 0 ? 'active' : index === 1 ? 'acknowledged' : 'resolved',
            isRead: index > 1,
            createdAt: data.createdAt,
            updatedAt: data.createdAt,
            assignedTo: index % 2 === 0 ? userId : undefined,
            metadata: {
                source: 'dashboard',
                threshold: index === 0 ? 45 : undefined,
                value: index === 0 ? 52 : undefined
            }
        });
    });
    return alerts;
}
function getTimeAgo(date) {
    var now = new Date();
    var diffMs = now.getTime() - date.getTime();
    var diffMins = Math.floor(diffMs / (1000 * 60));
    var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return "".concat(diffMins, "m ago");
    if (diffHours < 24)
        return "".concat(diffHours, "h ago");
    if (diffDays < 7)
        return "".concat(diffDays, "d ago");
    return date.toLocaleDateString();
}
