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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var table_1 = require("@/components/ui/table");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var backup_1 = require("@/lib/backup");
var BackupDashboard = function () {
    // State
    var _a = (0, react_1.useState)([]), configs = _a[0], setConfigs = _a[1];
    var _b = (0, react_1.useState)([]), records = _b[0], setRecords = _b[1];
    var _c = (0, react_1.useState)(null), metrics = _c[0], setMetrics = _c[1];
    var _d = (0, react_1.useState)([]), alerts = _d[0], setAlerts = _d[1];
    var _e = (0, react_1.useState)(true), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)('overview'), selectedTab = _f[0], setSelectedTab = _f[1];
    var _g = (0, react_1.useState)(false), showCreateDialog = _g[0], setShowCreateDialog = _g[1];
    var _h = (0, react_1.useState)(false), showRecoveryDialog = _h[0], setShowRecoveryDialog = _h[1];
    var backupSystem = (0, react_1.useState)(function () { return new backup_1.BackupSystem(); })[0];
    // Load data
    (0, react_1.useEffect)(function () {
        loadDashboardData();
        var interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
        return function () { return clearInterval(interval); };
    }, []);
    var loadDashboardData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, configsData, recordsData, metricsData, alertsData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            loadBackupConfigs(),
                            loadBackupRecords(),
                            loadSystemMetrics(),
                            loadAlerts()
                        ])];
                case 1:
                    _a = _b.sent(), configsData = _a[0], recordsData = _a[1], metricsData = _a[2], alertsData = _a[3];
                    setConfigs(configsData);
                    setRecords(recordsData);
                    setMetrics(metricsData);
                    setAlerts(alertsData);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error loading dashboard data:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadBackupConfigs = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Mock data - replace with actual API call
            return [2 /*return*/, [
                    {
                        id: '1',
                        name: 'Database Backup',
                        description: 'Daily backup of main database',
                        enabled: true,
                        type: 'DATABASE',
                        schedule_frequency: 'DAILY',
                        last_backup: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        next_backup: new Date(Date.now() + 60 * 60 * 1000),
                        status: 'ACTIVE',
                        storage_provider: 'S3',
                        retention_daily: 7
                    },
                    {
                        id: '2',
                        name: 'Files Backup',
                        description: 'Weekly backup of application files',
                        enabled: true,
                        type: 'FILES',
                        schedule_frequency: 'WEEKLY',
                        last_backup: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        next_backup: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
                        status: 'ACTIVE',
                        storage_provider: 'LOCAL',
                        retention_daily: 30
                    }
                ]];
        });
    }); };
    var loadBackupRecords = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Mock data - replace with actual API call
            return [2 /*return*/, [
                    {
                        id: '1',
                        config_id: '1',
                        config_name: 'Database Backup',
                        status: 'COMPLETED',
                        type: 'DATABASE',
                        start_time: new Date(Date.now() - 2 * 60 * 60 * 1000),
                        end_time: new Date(Date.now() - 90 * 60 * 1000),
                        duration: 30 * 60, // 30 minutes
                        size: 1024 * 1024 * 500, // 500MB
                        compressed_size: 1024 * 1024 * 150, // 150MB
                        file_count: 1
                    },
                    {
                        id: '2',
                        config_id: '1',
                        config_name: 'Database Backup',
                        status: 'RUNNING',
                        type: 'DATABASE',
                        start_time: new Date(Date.now() - 15 * 60 * 1000),
                        progress: 65
                    }
                ]];
        });
    }); };
    var loadSystemMetrics = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Mock data - replace with actual API call
            return [2 /*return*/, {
                    total_backups_today: 12,
                    successful_backups_today: 11,
                    failed_backups_today: 1,
                    success_rate: 91.7,
                    total_storage_used: 1024 * 1024 * 1024 * 50, // 50GB
                    active_configs: 5,
                    pending_recoveries: 0,
                    system_health: 'HEALTHY'
                }];
        });
    }); };
    var loadAlerts = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Mock data - replace with actual API call
            return [2 /*return*/, [
                    {
                        id: '1',
                        type: 'BACKUP_FAILURE',
                        severity: 'HIGH',
                        message: 'Backup "Files Backup" failed due to insufficient storage space',
                        timestamp: new Date(Date.now() - 30 * 60 * 1000),
                        acknowledged: false
                    }
                ]];
        });
    }); };
    // Actions
    var runBackup = function (configId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, backupSystem.runManualBackup(configId)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, loadDashboardData()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error running backup:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var toggleConfig = function (configId, enabled) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Update config enabled status
                    setConfigs(function (prev) { return prev.map(function (config) {
                        return config.id === configId ? __assign(__assign({}, config), { enabled: enabled }) : config;
                    }); });
                    return [4 /*yield*/, loadDashboardData()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error toggling config:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var acknowledgeAlert = function (alertId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setAlerts(function (prev) { return prev.map(function (alert) {
                    return alert.id === alertId ? __assign(__assign({}, alert), { acknowledged: true }) : alert;
                }); });
            }
            catch (error) {
                console.error('Error acknowledging alert:', error);
            }
            return [2 /*return*/];
        });
    }); };
    // Utility functions
    var getStatusIcon = function (status) {
        switch (status) {
            case 'COMPLETED':
                return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'RUNNING':
                return <lucide_react_1.RefreshCw className="h-4 w-4 text-blue-500 animate-spin"/>;
            case 'FAILED':
                return <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>;
            case 'PENDING':
                return <lucide_react_1.Clock className="h-4 w-4 text-yellow-500"/>;
            default:
                return <lucide_react_1.Clock className="h-4 w-4 text-gray-500"/>;
        }
    };
    var getStatusBadge = function (status) {
        var variants = {
            COMPLETED: 'default',
            RUNNING: 'secondary',
            FAILED: 'destructive',
            PENDING: 'outline'
        };
        return <badge_1.Badge variant={variants[status] || 'outline'}>{status}</badge_1.Badge>;
    };
    var getHealthColor = function (health) {
        switch (health) {
            case 'HEALTHY': return 'text-green-500';
            case 'DEGRADED': return 'text-yellow-500';
            case 'UNHEALTHY': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
        <span className="ml-2">Loading backup dashboard...</span>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Recovery</h1>
          <p className="text-muted-foreground">
            Manage your backup configurations and monitor system health
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button onClick={function () { return setShowRecoveryDialog(true); }} variant="outline">
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Recovery
          </button_1.Button>
          <button_1.Button onClick={function () { return setShowCreateDialog(true); }}>
            <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
            New Backup
          </button_1.Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.filter(function (alert) { return !alert.acknowledged; }).length > 0 && (<div className="space-y-2">
          {alerts
                .filter(function (alert) { return !alert.acknowledged; })
                .map(function (alert) { return (<alert_1.Alert key={alert.id} className={alert.severity === 'CRITICAL' ? 'border-red-500' : ''}>
                <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                <alert_1.AlertTitle>Backup Alert - {alert.severity}</alert_1.AlertTitle>
                <alert_1.AlertDescription className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <button_1.Button size="sm" variant="outline" onClick={function () { return acknowledgeAlert(alert.id); }}>
                    Acknowledge
                  </button_1.Button>
                </alert_1.AlertDescription>
              </alert_1.Alert>); })}
        </div>)}

      {/* Metrics Cards */}
      {metrics && (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">System Health</card_1.CardTitle>
              <lucide_react_1.Shield className={"h-4 w-4 ".concat(getHealthColor(metrics.system_health))}/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className={"text-2xl font-bold ".concat(getHealthColor(metrics.system_health))}>
                {metrics.system_health}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.active_configs} active configurations
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Success Rate</card_1.CardTitle>
              <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{metrics.success_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.successful_backups_today}/{metrics.total_backups_today} successful today
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Storage Used</card_1.CardTitle>
              <lucide_react_1.HardDrive className="h-4 w-4 text-blue-500"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{(0, utils_1.formatBytes)(metrics.total_storage_used)}</div>
              <p className="text-xs text-muted-foreground">
                Across all backup destinations
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Pending Recoveries</card_1.CardTitle>
              <lucide_react_1.Download className="h-4 w-4 text-orange-500"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{metrics.pending_recoveries}</div>
              <p className="text-xs text-muted-foreground">
                Recovery requests in queue
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      {/* Main Content */}
      <tabs_1.Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="configurations">Configurations</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="history">History</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="monitoring">Monitoring</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          {/* Recent Backups */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Recent Backups</card_1.CardTitle>
              <card_1.CardDescription>
                Latest backup executions and their status
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Configuration</table_1.TableHead>
                    <table_1.TableHead>Type</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Started</table_1.TableHead>
                    <table_1.TableHead>Duration</table_1.TableHead>
                    <table_1.TableHead>Size</table_1.TableHead>
                    <table_1.TableHead>Actions</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {records.slice(0, 5).map(function (record) { return (<table_1.TableRow key={record.id}>
                      <table_1.TableCell className="font-medium">
                        {record.config_name}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline">{record.type}</badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </div>
                        {record.status === 'RUNNING' && record.progress && (<progress_1.Progress value={record.progress} className="w-20 mt-1"/>)}
                      </table_1.TableCell>
                      <table_1.TableCell>{(0, utils_1.formatDate)(record.start_time)}</table_1.TableCell>
                      <table_1.TableCell>
                        {record.duration ? (0, utils_1.formatDuration)(record.duration) : '-'}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {record.size ? (0, utils_1.formatBytes)(record.size) : '-'}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <dropdown_menu_1.DropdownMenu>
                          <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                              <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                            </button_1.Button>
                          </dropdown_menu_1.DropdownMenuTrigger>
                          <dropdown_menu_1.DropdownMenuContent align="end">
                            <dropdown_menu_1.DropdownMenuLabel>Actions</dropdown_menu_1.DropdownMenuLabel>
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.FileText className="h-4 w-4 mr-2"/>
                              View Details
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.Download className="h-4 w-4 mr-2"/>
                              Download
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuSeparator />
                            <dropdown_menu_1.DropdownMenuItem className="text-red-600">
                              <lucide_react_1.Trash2 className="h-4 w-4 mr-2"/>
                              Delete
                            </dropdown_menu_1.DropdownMenuItem>
                          </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                      </table_1.TableCell>
                    </table_1.TableRow>); })}
                </table_1.TableBody>
              </table_1.Table>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="configurations" className="space-y-4">
          {/* Backup Configurations */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Backup Configurations</card_1.CardTitle>
              <card_1.CardDescription>
                Manage your backup schedules and settings
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Name</table_1.TableHead>
                    <table_1.TableHead>Type</table_1.TableHead>
                    <table_1.TableHead>Schedule</table_1.TableHead>
                    <table_1.TableHead>Last Backup</table_1.TableHead>
                    <table_1.TableHead>Next Backup</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Actions</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {configs.map(function (config) { return (<table_1.TableRow key={config.id}>
                      <table_1.TableCell>
                        <div>
                          <div className="font-medium">{config.name}</div>
                          {config.description && (<div className="text-sm text-muted-foreground">
                              {config.description}
                            </div>)}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline">{config.type}</badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>{config.schedule_frequency}</table_1.TableCell>
                      <table_1.TableCell>
                        {config.last_backup ? (0, utils_1.formatDate)(config.last_backup) : 'Never'}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {config.next_backup ? (0, utils_1.formatDate)(config.next_backup) : '-'}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center space-x-2">
                          <switch_1.Switch checked={config.enabled} onCheckedChange={function (enabled) { return toggleConfig(config.id, enabled); }}/>
                          <badge_1.Badge variant={config.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {config.status}
                          </badge_1.Badge>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center space-x-2">
                          <button_1.Button size="sm" variant="outline" onClick={function () { return runBackup(config.id); }}>
                            <lucide_react_1.Play className="h-4 w-4"/>
                          </button_1.Button>
                          <dropdown_menu_1.DropdownMenu>
                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                              <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                                <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                              </button_1.Button>
                            </dropdown_menu_1.DropdownMenuTrigger>
                            <dropdown_menu_1.DropdownMenuContent align="end">
                              <dropdown_menu_1.DropdownMenuLabel>Actions</dropdown_menu_1.DropdownMenuLabel>
                              <dropdown_menu_1.DropdownMenuItem>
                                <lucide_react_1.Settings className="h-4 w-4 mr-2"/>
                                Edit Configuration
                              </dropdown_menu_1.DropdownMenuItem>
                              <dropdown_menu_1.DropdownMenuItem>
                                <lucide_react_1.FileText className="h-4 w-4 mr-2"/>
                                View History
                              </dropdown_menu_1.DropdownMenuItem>
                              <dropdown_menu_1.DropdownMenuSeparator />
                              <dropdown_menu_1.DropdownMenuItem className="text-red-600">
                                <lucide_react_1.Trash2 className="h-4 w-4 mr-2"/>
                                Delete
                              </dropdown_menu_1.DropdownMenuItem>
                            </dropdown_menu_1.DropdownMenuContent>
                          </dropdown_menu_1.DropdownMenu>
                        </div>
                      </table_1.TableCell>
                    </table_1.TableRow>); })}
                </table_1.TableBody>
              </table_1.Table>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="history" className="space-y-4">
          {/* Backup History */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Backup History</card_1.CardTitle>
              <card_1.CardDescription>
                Complete history of all backup executions
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Configuration</table_1.TableHead>
                    <table_1.TableHead>Type</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Started</table_1.TableHead>
                    <table_1.TableHead>Completed</table_1.TableHead>
                    <table_1.TableHead>Duration</table_1.TableHead>
                    <table_1.TableHead>Size</table_1.TableHead>
                    <table_1.TableHead>Compression</table_1.TableHead>
                    <table_1.TableHead>Actions</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {records.map(function (record) { return (<table_1.TableRow key={record.id}>
                      <table_1.TableCell className="font-medium">
                        {record.config_name}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline">{record.type}</badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>{(0, utils_1.formatDate)(record.start_time)}</table_1.TableCell>
                      <table_1.TableCell>
                        {record.end_time ? (0, utils_1.formatDate)(record.end_time) : '-'}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {record.duration ? (0, utils_1.formatDuration)(record.duration) : '-'}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {record.size ? (0, utils_1.formatBytes)(record.size) : '-'}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {record.size && record.compressed_size
                ? "".concat(((1 - record.compressed_size / record.size) * 100).toFixed(1), "%")
                : '-'}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <dropdown_menu_1.DropdownMenu>
                          <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                              <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                            </button_1.Button>
                          </dropdown_menu_1.DropdownMenuTrigger>
                          <dropdown_menu_1.DropdownMenuContent align="end">
                            <dropdown_menu_1.DropdownMenuLabel>Actions</dropdown_menu_1.DropdownMenuLabel>
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.FileText className="h-4 w-4 mr-2"/>
                              View Details
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.Download className="h-4 w-4 mr-2"/>
                              Download
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.Upload className="h-4 w-4 mr-2"/>
                              Restore
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuSeparator />
                            <dropdown_menu_1.DropdownMenuItem className="text-red-600">
                              <lucide_react_1.Trash2 className="h-4 w-4 mr-2"/>
                              Delete
                            </dropdown_menu_1.DropdownMenuItem>
                          </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                      </table_1.TableCell>
                    </table_1.TableRow>); })}
                </table_1.TableBody>
              </table_1.Table>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="monitoring" className="space-y-4">
          {/* System Monitoring */}
          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Storage Usage</card_1.CardTitle>
                <card_1.CardDescription>
                  Monitor backup storage consumption
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Local Storage</span>
                    <span className="text-sm text-muted-foreground">15.2 GB</span>
                  </div>
                  <progress_1.Progress value={45}/>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AWS S3</span>
                    <span className="text-sm text-muted-foreground">32.8 GB</span>
                  </div>
                  <progress_1.Progress value={78}/>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Google Cloud</span>
                    <span className="text-sm text-muted-foreground">8.1 GB</span>
                  </div>
                  <progress_1.Progress value={23}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Performance Metrics</card_1.CardTitle>
                <card_1.CardDescription>
                  System performance and health indicators
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Backup Time</span>
                    <span className="text-sm text-muted-foreground">12m 34s</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Compression Ratio</span>
                    <span className="text-sm text-muted-foreground">68.5%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Network Throughput</span>
                    <span className="text-sm text-muted-foreground">45.2 MB/s</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-muted-foreground">23%</span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Create Backup Dialog */}
      <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <dialog_1.DialogContent className="sm:max-w-[600px]">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Create New Backup Configuration</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Set up a new backup schedule for your data
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label_1.Label htmlFor="name" className="text-right">
                Name
              </label_1.Label>
              <input_1.Input id="name" className="col-span-3" placeholder="My Backup"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label_1.Label htmlFor="description" className="text-right">
                Description
              </label_1.Label>
              <textarea_1.Textarea id="description" className="col-span-3" placeholder="Backup description..."/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label_1.Label htmlFor="type" className="text-right">
                Type
              </label_1.Label>
              <select_1.Select>
                <select_1.SelectTrigger className="col-span-3">
                  <select_1.SelectValue placeholder="Select backup type"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="FULL">Full Backup</select_1.SelectItem>
                  <select_1.SelectItem value="INCREMENTAL">Incremental</select_1.SelectItem>
                  <select_1.SelectItem value="DATABASE">Database Only</select_1.SelectItem>
                  <select_1.SelectItem value="FILES">Files Only</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label_1.Label htmlFor="frequency" className="text-right">
                Frequency
              </label_1.Label>
              <select_1.Select>
                <select_1.SelectTrigger className="col-span-3">
                  <select_1.SelectValue placeholder="Select frequency"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="HOURLY">Hourly</select_1.SelectItem>
                  <select_1.SelectItem value="DAILY">Daily</select_1.SelectItem>
                  <select_1.SelectItem value="WEEKLY">Weekly</select_1.SelectItem>
                  <select_1.SelectItem value="MONTHLY">Monthly</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
          <dialog_1.DialogFooter>
            <button_1.Button type="submit">Create Backup</button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Recovery Dialog */}
      <dialog_1.Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <dialog_1.DialogContent className="sm:max-w-[600px]">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Data Recovery</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Restore data from a previous backup
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label_1.Label htmlFor="backup" className="text-right">
                Backup
              </label_1.Label>
              <select_1.Select>
                <select_1.SelectTrigger className="col-span-3">
                  <select_1.SelectValue placeholder="Select backup to restore"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {records
            .filter(function (record) { return record.status === 'COMPLETED'; })
            .map(function (record) { return (<select_1.SelectItem key={record.id} value={record.id}>
                        {record.config_name} - {(0, utils_1.formatDate)(record.start_time)}
                      </select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label_1.Label htmlFor="target" className="text-right">
                Target Path
              </label_1.Label>
              <input_1.Input id="target" className="col-span-3" placeholder="/path/to/restore"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label_1.Label htmlFor="overwrite" className="text-right">
                Overwrite
              </label_1.Label>
              <div className="col-span-3">
                <switch_1.Switch id="overwrite"/>
                <label_1.Label htmlFor="overwrite" className="ml-2 text-sm text-muted-foreground">
                  Overwrite existing files
                </label_1.Label>
              </div>
            </div>
          </div>
          <dialog_1.DialogFooter>
            <button_1.Button type="submit">Start Recovery</button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
};
exports.default = BackupDashboard;
