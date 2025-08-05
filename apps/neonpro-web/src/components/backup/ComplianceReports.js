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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var ComplianceReports = function () {
    var _a = (0, react_1.useState)([]), reports = _a[0], setReports = _a[1];
    var _b = (0, react_1.useState)([]), filteredReports = _b[0], setFilteredReports = _b[1];
    var _c = (0, react_1.useState)([]), templates = _c[0], setTemplates = _c[1];
    var _d = (0, react_1.useState)(null), metrics = _d[0], setMetrics = _d[1];
    var _e = (0, react_1.useState)(true), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(false), showCreateDialog = _f[0], setShowCreateDialog = _f[1];
    var _g = (0, react_1.useState)(null), selectedReport = _g[0], setSelectedReport = _g[1];
    var _h = (0, react_1.useState)(false), showDetailsDialog = _h[0], setShowDetailsDialog = _h[1];
    var _j = (0, react_1.useState)({
        type: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        searchTerm: '',
    }), filters = _j[0], setFilters = _j[1];
    var _k = (0, react_1.useState)({
        title: '',
        type: 'LGPD',
        template_id: '',
        period_start: '',
        period_end: '',
        description: '',
    }), newReport = _k[0], setNewReport = _k[1];
    (0, react_1.useEffect)(function () {
        loadData();
    }, []);
    (0, react_1.useEffect)(function () {
        applyFilters();
    }, [reports, filters]);
    var loadData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            loadReports(),
                            loadTemplates(),
                            loadMetrics(),
                        ])];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Erro ao carregar dados:', error_1);
                    sonner_1.toast.error('Erro ao carregar dados de compliance');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadReports = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('/api/backup/compliance/reports')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setReports(data.data || []);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadTemplates = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('/api/backup/compliance/templates')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setTemplates(data.data || []);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadMetrics = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('/api/backup/compliance/metrics')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setMetrics(data.data);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var applyFilters = function () {
        var filtered = __spreadArray([], reports, true);
        if (filters.type) {
            filtered = filtered.filter(function (report) { return report.type === filters.type; });
        }
        if (filters.status) {
            filtered = filtered.filter(function (report) { return report.status === filters.status; });
        }
        if (filters.dateFrom) {
            var fromDate_1 = new Date(filters.dateFrom);
            filtered = filtered.filter(function (report) { return new Date(report.created_at) >= fromDate_1; });
        }
        if (filters.dateTo) {
            var toDate_1 = new Date(filters.dateTo);
            filtered = filtered.filter(function (report) { return new Date(report.created_at) <= toDate_1; });
        }
        if (filters.searchTerm) {
            var term_1 = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(function (report) {
                return report.title.toLowerCase().includes(term_1) ||
                    report.id.toLowerCase().includes(term_1);
            });
        }
        setFilteredReports(filtered);
    };
    var handleCreateReport = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch('/api/backup/compliance/reports', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(newReport),
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        sonner_1.toast.success('Relatório criado com sucesso');
                        setShowCreateDialog(false);
                        setNewReport({
                            title: '',
                            type: 'LGPD',
                            template_id: '',
                            period_start: '',
                            period_end: '',
                            description: '',
                        });
                        loadReports();
                    }
                    else {
                        sonner_1.toast.error('Erro ao criar relatório');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Erro ao criar relatório:', error_2);
                    sonner_1.toast.error('Erro ao criar relatório');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleGenerateReport = function (reportId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    sonner_1.toast.info('Gerando relatório...');
                    return [4 /*yield*/, fetch("/api/backup/compliance/reports/".concat(reportId, "/generate"), {
                            method: 'POST',
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        sonner_1.toast.success('Relatório gerado com sucesso');
                        loadReports();
                    }
                    else {
                        sonner_1.toast.error('Erro ao gerar relatório');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Erro ao gerar relatório:', error_3);
                    sonner_1.toast.error('Erro ao gerar relatório');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleDownloadReport = function (reportId_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([reportId_1], args_1, true), void 0, function (reportId, format) {
            var response, blob, url, a, error_4;
            if (format === void 0) { format = 'PDF'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch("/api/backup/compliance/reports/".concat(reportId, "/download?format=").concat(format))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.blob()];
                    case 2:
                        blob = _a.sent();
                        url = window.URL.createObjectURL(blob);
                        a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = "compliance-report-".concat(reportId, ".").concat(format.toLowerCase());
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        sonner_1.toast.success('Download iniciado');
                        return [3 /*break*/, 4];
                    case 3:
                        sonner_1.toast.error('Erro ao baixar relatório');
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        console.error('Erro ao baixar relatório:', error_4);
                        sonner_1.toast.error('Erro ao baixar relatório');
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    var getTypeIcon = function (type) {
        switch (type) {
            case 'LGPD':
                return <lucide_react_1.Shield className="h-4 w-4"/>;
            case 'ANVISA':
                return <lucide_react_1.Users className="h-4 w-4"/>;
            case 'CFM':
                return <lucide_react_1.Lock className="h-4 w-4"/>;
            case 'ISO27001':
                return <lucide_react_1.Globe className="h-4 w-4"/>;
            default:
                return <lucide_react_1.FileText className="h-4 w-4"/>;
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'APPROVED':
                return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'REJECTED':
                return <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>;
            case 'PENDING':
                return <lucide_react_1.Clock className="h-4 w-4 text-yellow-500"/>;
            case 'DRAFT':
                return <lucide_react_1.FileText className="h-4 w-4 text-gray-500"/>;
            default:
                return <lucide_react_1.Clock className="h-4 w-4 text-gray-500"/>;
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'APPROVED':
                return 'default';
            case 'REJECTED':
                return 'destructive';
            case 'PENDING':
                return 'secondary';
            case 'DRAFT':
                return 'outline';
            default:
                return 'outline';
        }
    };
    var getSeverityColor = function (severity) {
        switch (severity) {
            case 'CRITICAL':
                return 'text-red-600 bg-red-50';
            case 'HIGH':
                return 'text-orange-600 bg-orange-50';
            case 'MEDIUM':
                return 'text-yellow-600 bg-yellow-50';
            case 'LOW':
                return 'text-blue-600 bg-blue-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };
    var getComplianceScoreColor = function (score) {
        if (score >= 90)
            return 'text-green-600';
        if (score >= 70)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Relatórios de Compliance</h2>
          <p className="text-muted-foreground">
            Gerencie relatórios de conformidade e auditoria
          </p>
        </div>
        <div className="flex space-x-2">
          <button_1.Button onClick={loadData} variant="outline">
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
            Atualizar
          </button_1.Button>
          <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                Novo Relatório
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent>
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Criar Relatório de Compliance</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Configure um novo relatório de conformidade
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="title">Título</label_1.Label>
                  <input_1.Input id="title" value={newReport.title} onChange={function (e) { return setNewReport(__assign(__assign({}, newReport), { title: e.target.value })); }} placeholder="Ex: Relatório LGPD Mensal"/>
                </div>

                <div className="space-y-2">
                  <label_1.Label>Tipo de Compliance</label_1.Label>
                  <select_1.Select value={newReport.type} onValueChange={function (value) { return setNewReport(__assign(__assign({}, newReport), { type: value })); }}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="LGPD">LGPD</select_1.SelectItem>
                      <select_1.SelectItem value="ANVISA">ANVISA</select_1.SelectItem>
                      <select_1.SelectItem value="CFM">CFM</select_1.SelectItem>
                      <select_1.SelectItem value="ISO27001">ISO 27001</select_1.SelectItem>
                      <select_1.SelectItem value="CUSTOM">Personalizado</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="periodStart">Período Inicial</label_1.Label>
                    <input_1.Input id="periodStart" type="date" value={newReport.period_start} onChange={function (e) { return setNewReport(__assign(__assign({}, newReport), { period_start: e.target.value })); }}/>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label htmlFor="periodEnd">Período Final</label_1.Label>
                    <input_1.Input id="periodEnd" type="date" value={newReport.period_end} onChange={function (e) { return setNewReport(__assign(__assign({}, newReport), { period_end: e.target.value })); }}/>
                  </div>
                </div>

                <div className="space-y-2">
                  <label_1.Label>Template (Opcional)</label_1.Label>
                  <select_1.Select value={newReport.template_id} onValueChange={function (value) { return setNewReport(__assign(__assign({}, newReport), { template_id: value })); }}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione um template"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {templates.map(function (template) { return (<select_1.SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </select_1.SelectItem>); })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="description">Descrição</label_1.Label>
                  <textarea_1.Textarea id="description" value={newReport.description} onChange={function (e) { return setNewReport(__assign(__assign({}, newReport), { description: e.target.value })); }} placeholder="Descrição do relatório..." rows={3}/>
                </div>

                <div className="flex justify-end space-x-2">
                  <button_1.Button variant="outline" onClick={function () { return setShowCreateDialog(false); }}>
                    Cancelar
                  </button_1.Button>
                  <button_1.Button onClick={handleCreateReport}>
                    Criar Relatório
                  </button_1.Button>
                </div>
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Métricas de Compliance */}
      {metrics && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={"text-2xl font-bold ".concat(getComplianceScoreColor(metrics.overall_score))}>
                    {metrics.overall_score}%
                  </p>
                  <p className="text-sm text-muted-foreground">Score Geral</p>
                </div>
                <lucide_react_1.BarChart3 className="h-8 w-8 text-blue-500"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{metrics.total_reports}</p>
                  <p className="text-sm text-muted-foreground">Total de Relatórios</p>
                </div>
                <lucide_react_1.FileText className="h-8 w-8 text-green-500"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{metrics.pending_reports}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
                <lucide_react_1.Clock className="h-8 w-8 text-yellow-500"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{metrics.critical_findings}</p>
                  <p className="text-sm text-muted-foreground">Achados Críticos</p>
                </div>
                <lucide_react_1.AlertTriangle className="h-8 w-8 text-red-500"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      {/* Filtros */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Filter className="h-5 w-5 mr-2"/>
            Filtros
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="search">Buscar</label_1.Label>
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <input_1.Input id="search" placeholder="Título ou ID..." value={filters.searchTerm} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { searchTerm: e.target.value })); }} className="pl-9"/>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Tipo</label_1.Label>
              <select_1.Select value={filters.type} onValueChange={function (value) { return setFilters(__assign(__assign({}, filters), { type: value })); }}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Todos"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="LGPD">LGPD</select_1.SelectItem>
                  <select_1.SelectItem value="ANVISA">ANVISA</select_1.SelectItem>
                  <select_1.SelectItem value="CFM">CFM</select_1.SelectItem>
                  <select_1.SelectItem value="ISO27001">ISO 27001</select_1.SelectItem>
                  <select_1.SelectItem value="CUSTOM">Personalizado</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label>Status</label_1.Label>
              <select_1.Select value={filters.status} onValueChange={function (value) { return setFilters(__assign(__assign({}, filters), { status: value })); }}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Todos"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="DRAFT">Rascunho</select_1.SelectItem>
                  <select_1.SelectItem value="PENDING">Pendente</select_1.SelectItem>
                  <select_1.SelectItem value="APPROVED">Aprovado</select_1.SelectItem>
                  <select_1.SelectItem value="REJECTED">Rejeitado</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="dateFrom">Data Inicial</label_1.Label>
              <input_1.Input id="dateFrom" type="date" value={filters.dateFrom} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { dateFrom: e.target.value })); }}/>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="dateTo">Data Final</label_1.Label>
              <input_1.Input id="dateTo" type="date" value={filters.dateTo} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { dateTo: e.target.value })); }}/>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Lista de Relatórios */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>
            Relatórios ({filteredReports.length})
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading ? (<div className="text-center py-8">
              <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2"/>
              <p>Carregando relatórios...</p>
            </div>) : filteredReports.length === 0 ? (<div className="text-center py-8">
              <lucide_react_1.FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
              <p className="text-muted-foreground">Nenhum relatório encontrado</p>
            </div>) : (<table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Relatório</table_1.TableHead>
                  <table_1.TableHead>Tipo</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Período</table_1.TableHead>
                  <table_1.TableHead>Score</table_1.TableHead>
                  <table_1.TableHead>Criado</table_1.TableHead>
                  <table_1.TableHead>Ações</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredReports.map(function (report) { return (<table_1.TableRow key={report.id}>
                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(report.type)}
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant="outline">{report.type}</badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <badge_1.Badge variant={getStatusColor(report.status)}>
                          {report.status}
                        </badge_1.Badge>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="text-sm">
                        {(0, utils_1.formatDate)(new Date(report.period_start))} -{' '}
                        {(0, utils_1.formatDate)(new Date(report.period_end))}
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <span className={"font-medium ".concat(getComplianceScoreColor(report.metrics.compliance_score))}>
                        {report.metrics.compliance_score}%
                      </span>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="text-sm">
                        {(0, utils_1.formatDate)(new Date(report.created_at))}
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        <button_1.Button variant="ghost" size="sm" onClick={function () {
                    setSelectedReport(report);
                    setShowDetailsDialog(true);
                }}>
                          <lucide_react_1.Eye className="h-4 w-4"/>
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="sm" onClick={function () { return handleDownloadReport(report.id); }}>
                          <lucide_react_1.Download className="h-4 w-4"/>
                        </button_1.Button>
                        {report.status === 'DRAFT' && (<button_1.Button variant="ghost" size="sm" onClick={function () { return handleGenerateReport(report.id); }}>
                            <lucide_react_1.RefreshCw className="h-4 w-4"/>
                          </button_1.Button>)}
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>); })}
              </table_1.TableBody>
            </table_1.Table>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Dialog de Detalhes */}
      <dialog_1.Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <dialog_1.DialogContent className="max-w-4xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Detalhes do Relatório</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          {selectedReport && (<div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label className="text-sm font-medium">Título</label_1.Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.title}</p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Tipo</label_1.Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.type}</p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Período</label_1.Label>
                  <p className="text-sm text-muted-foreground">
                    {(0, utils_1.formatDate)(new Date(selectedReport.period_start))} -{' '}
                    {(0, utils_1.formatDate)(new Date(selectedReport.period_end))}
                  </p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Criado por</label_1.Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.generated_by}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <card_1.Card>
                  <card_1.CardContent className="pt-4">
                    <div className="text-center">
                      <p className={"text-2xl font-bold ".concat(getComplianceScoreColor(selectedReport.metrics.compliance_score))}>
                        {selectedReport.metrics.compliance_score}%
                      </p>
                      <p className="text-sm text-muted-foreground">Compliance</p>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
                <card_1.Card>
                  <card_1.CardContent className="pt-4">
                    <div className="text-center">
                      <p className={"text-2xl font-bold ".concat(getComplianceScoreColor(selectedReport.metrics.data_protection_score))}>
                        {selectedReport.metrics.data_protection_score}%
                      </p>
                      <p className="text-sm text-muted-foreground">Proteção</p>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
                <card_1.Card>
                  <card_1.CardContent className="pt-4">
                    <div className="text-center">
                      <p className={"text-2xl font-bold ".concat(getComplianceScoreColor(selectedReport.metrics.availability_score))}>
                        {selectedReport.metrics.availability_score}%
                      </p>
                      <p className="text-sm text-muted-foreground">Disponibilidade</p>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>

              {selectedReport.findings.length > 0 && (<div>
                  <label_1.Label className="text-sm font-medium">Achados</label_1.Label>
                  <div className="space-y-2 mt-2">
                    {selectedReport.findings.map(function (finding, index) { return (<alert_1.Alert key={index} className={getSeverityColor(finding.severity)}>
                        <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                        <alert_1.AlertDescription>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <strong>{finding.category}:</strong> {finding.description}
                              {finding.recommendation && (<div className="mt-1 text-sm">
                                  <strong>Recomendação:</strong> {finding.recommendation}
                                </div>)}
                            </div>
                            <badge_1.Badge variant="outline" className="ml-2">
                              {finding.severity}
                            </badge_1.Badge>
                          </div>
                        </alert_1.AlertDescription>
                      </alert_1.Alert>); })}
                  </div>
                </div>)}
            </div>)}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
};
exports.default = ComplianceReports;
