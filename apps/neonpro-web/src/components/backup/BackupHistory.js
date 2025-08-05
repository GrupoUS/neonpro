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
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var BackupHistory = function () {
    var _a = (0, react_1.useState)([]), backups = _a[0], setBackups = _a[1];
    var _b = (0, react_1.useState)([]), filteredBackups = _b[0], setFilteredBackups = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), selectedBackup = _d[0], setSelectedBackup = _d[1];
    var _e = (0, react_1.useState)(false), showDetails = _e[0], setShowDetails = _e[1];
    var _f = (0, react_1.useState)(1), currentPage = _f[0], setCurrentPage = _f[1];
    var _g = (0, react_1.useState)(1), totalPages = _g[0], setTotalPages = _g[1];
    var _h = (0, react_1.useState)({
        status: '',
        type: '',
        dateFrom: '',
        dateTo: '',
        searchTerm: '',
    }), filters = _h[0], setFilters = _h[1];
    var itemsPerPage = 20;
    (0, react_1.useEffect)(function () {
        loadBackupHistory();
    }, [currentPage]);
    (0, react_1.useEffect)(function () {
        applyFilters();
    }, [backups, filters]);
    var loadBackupHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, 6, 7]);
                    setLoading(true);
                    params = new URLSearchParams({
                        page: currentPage.toString(),
                        limit: itemsPerPage.toString(),
                    });
                    return [4 /*yield*/, fetch("/api/backup/jobs?".concat(params))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setBackups(data.data || []);
                    setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
                    return [3 /*break*/, 4];
                case 3:
                    sonner_1.toast.error('Erro ao carregar histórico de backups');
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error('Erro ao carregar histórico:', error_1);
                    sonner_1.toast.error('Erro ao carregar histórico de backups');
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var applyFilters = function () {
        var filtered = __spreadArray([], backups, true);
        if (filters.status) {
            filtered = filtered.filter(function (backup) { return backup.status === filters.status; });
        }
        if (filters.type) {
            filtered = filtered.filter(function (backup) { return backup.type === filters.type; });
        }
        if (filters.dateFrom) {
            var fromDate_1 = new Date(filters.dateFrom);
            filtered = filtered.filter(function (backup) { return new Date(backup.start_time) >= fromDate_1; });
        }
        if (filters.dateTo) {
            var toDate_1 = new Date(filters.dateTo);
            filtered = filtered.filter(function (backup) { return new Date(backup.start_time) <= toDate_1; });
        }
        if (filters.searchTerm) {
            var term_1 = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(function (backup) {
                return backup.config_name.toLowerCase().includes(term_1) ||
                    backup.id.toLowerCase().includes(term_1);
            });
        }
        setFilteredBackups(filtered);
    };
    var loadBackupDetails = function (backupId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/backup/jobs/".concat(backupId))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setSelectedBackup(data.data);
                    setShowDetails(true);
                    return [3 /*break*/, 4];
                case 3:
                    sonner_1.toast.error('Erro ao carregar detalhes do backup');
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    console.error('Erro ao carregar detalhes:', error_2);
                    sonner_1.toast.error('Erro ao carregar detalhes do backup');
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleDownloadBackup = function (backupId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                sonner_1.toast.info('Iniciando download do backup...');
                // Implementar download do backup
                // const response = await fetch(`/api/backup/jobs/${backupId}/download`);
                // ... lógica de download
            }
            catch (error) {
                console.error('Erro ao baixar backup:', error);
                sonner_1.toast.error('Erro ao baixar backup');
            }
            return [2 /*return*/];
        });
    }); };
    var handleDeleteBackup = function (backupId) { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/backup/jobs/".concat(backupId), {
                            method: 'DELETE',
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        sonner_1.toast.success('Backup removido com sucesso');
                        loadBackupHistory();
                    }
                    else {
                        sonner_1.toast.error('Erro ao remover backup');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Erro ao remover backup:', error_3);
                    sonner_1.toast.error('Erro ao remover backup');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'COMPLETED':
                return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'FAILED':
                return <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>;
            case 'RUNNING':
                return <lucide_react_1.RefreshCw className="h-4 w-4 text-blue-500 animate-spin"/>;
            case 'PENDING':
                return <lucide_react_1.Clock className="h-4 w-4 text-yellow-500"/>;
            case 'CANCELLED':
                return <lucide_react_1.XCircle className="h-4 w-4 text-gray-500"/>;
            default:
                return <lucide_react_1.Clock className="h-4 w-4 text-gray-500"/>;
        }
    };
    var getTypeIcon = function (type) {
        switch (type) {
            case 'DATABASE':
                return <lucide_react_1.Database className="h-4 w-4"/>;
            case 'FILES':
                return <lucide_react_1.HardDrive className="h-4 w-4"/>;
            default:
                return <lucide_react_1.Shield className="h-4 w-4"/>;
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'COMPLETED':
                return 'default';
            case 'FAILED':
                return 'destructive';
            case 'RUNNING':
                return 'secondary';
            case 'PENDING':
                return 'outline';
            case 'CANCELLED':
                return 'secondary';
            default:
                return 'outline';
        }
    };
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Backups</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie o histórico completo de backups
          </p>
        </div>
        <button_1.Button onClick={loadBackupHistory} disabled={loading}>
          <lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(loading ? 'animate-spin' : '')}/>
          Atualizar
        </button_1.Button>
      </div>

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
                <input_1.Input id="search" placeholder="Nome ou ID..." value={filters.searchTerm} onChange={function (e) { return setFilters(__assign(__assign({}, filters), { searchTerm: e.target.value })); }} className="pl-9"/>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label>Status</label_1.Label>
              <select_1.Select value={filters.status} onValueChange={function (value) { return setFilters(__assign(__assign({}, filters), { status: value })); }}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Todos"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="COMPLETED">Concluído</select_1.SelectItem>
                  <select_1.SelectItem value="FAILED">Falhou</select_1.SelectItem>
                  <select_1.SelectItem value="RUNNING">Em Execução</select_1.SelectItem>
                  <select_1.SelectItem value="PENDING">Pendente</select_1.SelectItem>
                  <select_1.SelectItem value="CANCELLED">Cancelado</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label_1.Label>Tipo</label_1.Label>
              <select_1.Select value={filters.type} onValueChange={function (value) { return setFilters(__assign(__assign({}, filters), { type: value })); }}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Todos"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="FULL">Completo</select_1.SelectItem>
                  <select_1.SelectItem value="INCREMENTAL">Incremental</select_1.SelectItem>
                  <select_1.SelectItem value="DIFFERENTIAL">Diferencial</select_1.SelectItem>
                  <select_1.SelectItem value="DATABASE">Banco de Dados</select_1.SelectItem>
                  <select_1.SelectItem value="FILES">Arquivos</select_1.SelectItem>
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

      {/* Tabela de Histórico */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>
            Backups ({filteredBackups.length})
          </card_1.CardTitle>
          <card_1.CardDescription>
            Histórico completo de operações de backup
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading ? (<div className="text-center py-8">
              <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2"/>
              <p>Carregando histórico...</p>
            </div>) : filteredBackups.length === 0 ? (<div className="text-center py-8">
              <lucide_react_1.Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
              <p className="text-muted-foreground">
                Nenhum backup encontrado
              </p>
            </div>) : (<table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Configuração</table_1.TableHead>
                  <table_1.TableHead>Tipo</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Início</table_1.TableHead>
                  <table_1.TableHead>Duração</table_1.TableHead>
                  <table_1.TableHead>Tamanho</table_1.TableHead>
                  <table_1.TableHead>Ações</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredBackups.map(function (backup) { return (<table_1.TableRow key={backup.id}>
                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(backup.type)}
                        <div>
                          <div className="font-medium">{backup.config_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {backup.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant="outline">{backup.type}</badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(backup.status)}
                        <badge_1.Badge variant={getStatusColor(backup.status)}>
                          {backup.status}
                        </badge_1.Badge>
                      </div>
                      {backup.status === 'FAILED' && backup.error_message && (<div className="text-xs text-red-500 mt-1 max-w-xs truncate">
                          {backup.error_message}
                        </div>)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="text-sm">
                        {(0, utils_1.formatDate)(new Date(backup.start_time))}
                        <div className="text-muted-foreground">
                          {new Date(backup.start_time).toLocaleTimeString()}
                        </div>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {backup.duration ? ((0, utils_1.formatDuration)(backup.duration)) : backup.status === 'RUNNING' ? (<span className="text-blue-500">Em execução...</span>) : (<span className="text-muted-foreground">-</span>)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {backup.size ? (<div>
                          <div>{(0, utils_1.formatBytes)(backup.size)}</div>
                          {backup.compressed_size && (<div className="text-xs text-muted-foreground">
                              Comprimido: {(0, utils_1.formatBytes)(backup.compressed_size)}
                            </div>)}
                        </div>) : (<span className="text-muted-foreground">-</span>)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <button_1.Button variant="ghost" size="sm">
                            <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                          </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                          <dropdown_menu_1.DropdownMenuLabel>Ações</dropdown_menu_1.DropdownMenuLabel>
                          <dropdown_menu_1.DropdownMenuItem onClick={function () { return loadBackupDetails(backup.id); }}>
                            <lucide_react_1.Eye className="h-4 w-4 mr-2"/>
                            Ver Detalhes
                          </dropdown_menu_1.DropdownMenuItem>
                          {backup.status === 'COMPLETED' && (<dropdown_menu_1.DropdownMenuItem onClick={function () { return handleDownloadBackup(backup.id); }}>
                              <lucide_react_1.Download className="h-4 w-4 mr-2"/>
                              Download
                            </dropdown_menu_1.DropdownMenuItem>)}
                          <dropdown_menu_1.DropdownMenuSeparator />
                          <dropdown_menu_1.DropdownMenuItem onClick={function () { return handleDeleteBackup(backup.id); }} className="text-red-600">
                            <lucide_react_1.Trash2 className="h-4 w-4 mr-2"/>
                            Remover
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </table_1.TableCell>
                  </table_1.TableRow>); })}
              </table_1.TableBody>
            </table_1.Table>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Paginação */}
      {totalPages > 1 && (<div className="flex justify-center space-x-2">
          <button_1.Button variant="outline" onClick={function () { return setCurrentPage(Math.max(1, currentPage - 1)); }} disabled={currentPage === 1}>
            Anterior
          </button_1.Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <button_1.Button variant="outline" onClick={function () { return setCurrentPage(Math.min(totalPages, currentPage + 1)); }} disabled={currentPage === totalPages}>
            Próximo
          </button_1.Button>
        </div>)}

      {/* Dialog de Detalhes */}
      <dialog_1.Dialog open={showDetails} onOpenChange={setShowDetails}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Detalhes do Backup</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Informações detalhadas sobre a operação de backup
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          {selectedBackup && (<div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label className="text-sm font-medium">ID</label_1.Label>
                  <p className="text-sm text-muted-foreground">{selectedBackup.id}</p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Configuração</label_1.Label>
                  <p className="text-sm text-muted-foreground">{selectedBackup.config_name}</p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Tipo</label_1.Label>
                  <p className="text-sm text-muted-foreground">{selectedBackup.type}</p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Status</label_1.Label>
                  <badge_1.Badge variant={getStatusColor(selectedBackup.status)}>
                    {selectedBackup.status}
                  </badge_1.Badge>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Início</label_1.Label>
                  <p className="text-sm text-muted-foreground">
                    {(0, utils_1.formatDate)(new Date(selectedBackup.start_time))} às{' '}
                    {new Date(selectedBackup.start_time).toLocaleTimeString()}
                  </p>
                </div>
                {selectedBackup.end_time && (<div>
                    <label_1.Label className="text-sm font-medium">Fim</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      {(0, utils_1.formatDate)(new Date(selectedBackup.end_time))} às{' '}
                      {new Date(selectedBackup.end_time).toLocaleTimeString()}
                    </p>
                  </div>)}
                {selectedBackup.duration && (<div>
                    <label_1.Label className="text-sm font-medium">Duração</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      {(0, utils_1.formatDuration)(selectedBackup.duration)}
                    </p>
                  </div>)}
                {selectedBackup.size && (<div>
                    <label_1.Label className="text-sm font-medium">Tamanho</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      {(0, utils_1.formatBytes)(selectedBackup.size)}
                      {selectedBackup.compressed_size && (<span className="ml-2">
                          (Comprimido: {(0, utils_1.formatBytes)(selectedBackup.compressed_size)})
                        </span>)}
                    </p>
                  </div>)}
                {selectedBackup.file_count && (<div>
                    <label_1.Label className="text-sm font-medium">Arquivos</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedBackup.file_count.toLocaleString()} arquivo(s)
                    </p>
                  </div>)}
              </div>

              {selectedBackup.error_message && (<alert_1.Alert className="border-red-200">
                  <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                  <alert_1.AlertDescription>
                    <strong>Erro:</strong> {selectedBackup.error_message}
                  </alert_1.AlertDescription>
                </alert_1.Alert>)}

              {selectedBackup.storage_location && (<div>
                  <label_1.Label className="text-sm font-medium">Local de Armazenamento</label_1.Label>
                  <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                    {selectedBackup.storage_location}
                  </p>
                </div>)}

              {selectedBackup.metrics && (<div>
                  <label_1.Label className="text-sm font-medium">Métricas</label_1.Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {(selectedBackup.metrics.compression_ratio * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Compressão</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {(0, utils_1.formatBytes)(selectedBackup.metrics.transfer_speed)}/s
                      </p>
                      <p className="text-xs text-muted-foreground">Velocidade</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedBackup.metrics.verification_status === 'PASSED' ? '✓' : '✗'}
                      </p>
                      <p className="text-xs text-muted-foreground">Verificação</p>
                    </div>
                  </div>
                </div>)}
            </div>)}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
};
exports.default = BackupHistory;
