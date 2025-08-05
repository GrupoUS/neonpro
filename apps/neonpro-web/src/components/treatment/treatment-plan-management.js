/**
 * Treatment Plan Management Dashboard
 * FHIR-compliant treatment plan creation and management interface
 * Includes LGPD compliance and Brazilian healthcare standards
 *
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentPlanManagement = TreatmentPlanManagement;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var select_1 = require("@/components/ui/select");
var use_toast_1 = require("@/hooks/use-toast");
var treatments_1 = require("@/lib/supabase/treatments");
var patients_1 = require("@/lib/supabase/patients");
var statusColors = {
    'draft': 'bg-gray-100 text-gray-800',
    'active': 'bg-green-100 text-green-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    'revoked': 'bg-red-100 text-red-800',
    'completed': 'bg-blue-100 text-blue-800',
    'entered-in-error': 'bg-gray-100 text-gray-600',
    'unknown': 'bg-gray-100 text-gray-600',
};
var statusLabels = {
    'draft': 'Rascunho',
    'active': 'Ativo',
    'on-hold': 'Em Pausa',
    'revoked': 'Cancelado',
    'completed': 'Concluído',
    'entered-in-error': 'Erro',
    'unknown': 'Desconhecido',
};
var intentLabels = {
    'proposal': 'Proposta',
    'plan': 'Plano',
    'order': 'Ordem',
    'option': 'Opção',
    'directive': 'Diretiva',
};
function TreatmentPlanManagement(_a) {
    var _this = this;
    var _b;
    var onSelectTreatmentPlan = _a.onSelectTreatmentPlan;
    var toast = (0, use_toast_1.useToast)().toast;
    // State management
    var _c = (0, react_1.useState)([]), treatmentPlans = _c[0], setTreatmentPlans = _c[1];
    var _d = (0, react_1.useState)([]), patients = _d[0], setPatients = _d[1];
    var _e = (0, react_1.useState)(null), statistics = _e[0], setStatistics = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(''), searchText = _g[0], setSearchText = _g[1];
    var _h = (0, react_1.useState)({}), filters = _h[0], setFilters = _h[1];
    var _j = (0, react_1.useState)(1), currentPage = _j[0], setCurrentPage = _j[1];
    var _k = (0, react_1.useState)(0), totalCount = _k[0], setTotalCount = _k[1];
    var perPage = 10;
    // Load data on component mount
    (0, react_1.useEffect)(function () {
        loadData();
        loadPatients();
        loadStatistics();
    }, []);
    // Reload treatment plans when filters change
    (0, react_1.useEffect)(function () {
        loadTreatmentPlans();
    }, [filters, currentPage, searchText]);
    var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        loadTreatmentPlans(),
                        loadStatistics(),
                    ])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var loadTreatmentPlans = function () { return __awaiter(_this, void 0, void 0, function () {
        var searchFilters, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    searchFilters = __assign(__assign({}, filters), { search_text: searchText || undefined });
                    return [4 /*yield*/, (0, treatments_1.searchTreatmentPlans)(searchFilters, currentPage, perPage)];
                case 1:
                    response = _a.sent();
                    setTreatmentPlans(response.treatment_plans);
                    setTotalCount(response.total_count);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Erro ao carregar planos de tratamento:', error_1);
                    toast({
                        title: 'Erro',
                        description: 'Não foi possível carregar os planos de tratamento.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var loadPatients = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, patients_1.searchPatients)({}, 1, 100)];
                case 1:
                    response = _a.sent();
                    setPatients(response.patients);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Erro ao carregar pacientes:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadStatistics = function () { return __awaiter(_this, void 0, void 0, function () {
        var stats, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, treatments_1.getTreatmentStatistics)()];
                case 1:
                    stats = _a.sent();
                    setStatistics(stats);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Erro ao carregar estatísticas:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSearch = function (value) {
        setSearchText(value);
        setCurrentPage(1);
    };
    var handleFilterChange = function (key, value) {
        setFilters(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
        setCurrentPage(1);
    };
    var handleDeleteTreatmentPlan = function (treatmentPlan) { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, treatments_1.deleteTreatmentPlan)(treatmentPlan.id)];
                case 1:
                    _a.sent();
                    toast({
                        title: 'Sucesso',
                        description: 'Plano de tratamento excluído com sucesso.',
                    });
                    loadTreatmentPlans();
                    loadStatistics();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Erro ao excluir plano de tratamento:', error_4);
                    toast({
                        title: 'Erro',
                        description: 'Não foi possível excluir o plano de tratamento.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    var totalPages = Math.ceil(totalCount / perPage);
    return (<div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Total de Planos</card_1.CardTitle>
              <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{statistics.total_treatment_plans}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.active_treatment_plans} ativos
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Planos Concluídos</card_1.CardTitle>
              <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{statistics.completed_treatment_plans}</div>
              <p className="text-xs text-muted-foreground">
                Finalizados com sucesso
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Procedimentos</card_1.CardTitle>
              <lucide_react_1.User className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{statistics.total_procedures}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.procedures_this_month} este mês
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Duração Média</card_1.CardTitle>
              <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{statistics.average_treatment_duration_days}</div>
              <p className="text-xs text-muted-foreground">
                dias por tratamento
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planos de Tratamento</h1>
          <p className="text-muted-foreground">
            Gerencie planos de tratamento seguindo padrões HL7 FHIR R4
          </p>
        </div>
        
        <button_1.Button>
          <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
          Novo Plano
        </button_1.Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <input_1.Input placeholder="Buscar planos de tratamento..." value={searchText} onChange={function (e) { return handleSearch(e.target.value); }} className="pl-9"/>
        </div>
        
        <div className="flex gap-2">
          <select_1.Select value={filters.patient_id || 'all'} onValueChange={function (value) {
            return handleFilterChange('patient_id', value === 'all' ? undefined : value);
        }}>
            <select_1.SelectTrigger className="w-[200px]">
              <select_1.SelectValue placeholder="Todos os pacientes"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os pacientes</select_1.SelectItem>
              {patients.map(function (patient) {
            var _a;
            return (<select_1.SelectItem key={patient.id} value={patient.id}>
                  {(_a = patient.given_name) === null || _a === void 0 ? void 0 : _a[0]} {patient.family_name}
                </select_1.SelectItem>);
        })}
            </select_1.SelectContent>
          </select_1.Select>

          <select_1.Select value={((_b = filters.status) === null || _b === void 0 ? void 0 : _b[0]) || 'all'} onValueChange={function (value) {
            return handleFilterChange('status', value === 'all' ? undefined : [value]);
        }}>
            <select_1.SelectTrigger className="w-[150px]">
              <select_1.SelectValue placeholder="Todos os status"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
              {Object.entries(statusLabels).map(function (_a) {
            var value = _a[0], label = _a[1];
            return (<select_1.SelectItem key={value} value={value}>
                  {label}
                </select_1.SelectItem>);
        })}
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </div>

      {/* Treatment Plans Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Planos de Tratamento</card_1.CardTitle>
          <card_1.CardDescription>
            Lista de todos os planos de tratamento criados
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading ? (<div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando...</div>
            </div>) : treatmentPlans.length === 0 ? (<div className="flex items-center justify-center py-8">
              <div className="text-center">
                <lucide_react_1.FileText className="mx-auto h-12 w-12 text-muted-foreground"/>
                <h3 className="mt-4 text-lg font-semibold">Nenhum plano encontrado</h3>
                <p className="text-muted-foreground">
                  Comece criando um novo plano de tratamento.
                </p>
              </div>
            </div>) : (<table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Paciente</table_1.TableHead>
                  <table_1.TableHead>Título</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Intenção</table_1.TableHead>
                  <table_1.TableHead>Período</table_1.TableHead>
                  <table_1.TableHead>Criado</table_1.TableHead>
                  <table_1.TableHead className="w-[50px]"></table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {treatmentPlans.map(function (treatmentPlan) {
                var _a, _b, _c;
                return (<table_1.TableRow key={treatmentPlan.id} className="cursor-pointer hover:bg-muted/50" onClick={function () { return onSelectTreatmentPlan === null || onSelectTreatmentPlan === void 0 ? void 0 : onSelectTreatmentPlan(treatmentPlan); }}>
                    <table_1.TableCell>
                      <div className="font-medium">
                        {/* @ts-ignore - patient relation from Supabase */}
                        {(_b = (_a = treatmentPlan.patient) === null || _a === void 0 ? void 0 : _a.given_name) === null || _b === void 0 ? void 0 : _b[0]} {(_c = treatmentPlan.patient) === null || _c === void 0 ? void 0 : _c.family_name}
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="max-w-[200px] truncate font-medium">
                        {treatmentPlan.title}
                      </div>
                      {treatmentPlan.description && (<div className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {treatmentPlan.description}
                        </div>)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge className={statusColors[treatmentPlan.status]}>
                        {statusLabels[treatmentPlan.status]}
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {intentLabels[treatmentPlan.intent]}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      {treatmentPlan.period_start && treatmentPlan.period_end ? (<div className="text-sm">
                          <div>{formatDate(treatmentPlan.period_start)}</div>
                          <div className="text-muted-foreground">
                            até {formatDate(treatmentPlan.period_end)}
                          </div>
                        </div>) : treatmentPlan.period_start ? (<div className="text-sm">
                          Início: {formatDate(treatmentPlan.period_start)}
                        </div>) : (<span className="text-muted-foreground">-</span>)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(treatmentPlan.created_at)}
                      </div>
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
                          <dropdown_menu_1.DropdownMenuSeparator />
                          <dropdown_menu_1.DropdownMenuItem onClick={function (e) {
                        e.stopPropagation();
                        onSelectTreatmentPlan === null || onSelectTreatmentPlan === void 0 ? void 0 : onSelectTreatmentPlan(treatmentPlan);
                    }}>
                            Ver detalhes
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem onClick={function (e) {
                        e.stopPropagation();
                        // Edit functionality would go here
                    }}>
                            Editar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuSeparator />
                          <dropdown_menu_1.DropdownMenuItem className="text-red-600" onClick={function (e) {
                        e.stopPropagation();
                        handleDeleteTreatmentPlan(treatmentPlan);
                    }}>
                            Excluir
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </table_1.TableCell>
                  </table_1.TableRow>);
            })}
              </table_1.TableBody>
            </table_1.Table>)}

          {/* Pagination */}
          {totalPages > 1 && (<div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * perPage) + 1} a {Math.min(currentPage * perPage, totalCount)} de {totalCount} resultados
              </div>
              <div className="flex items-center space-x-2">
                <button_1.Button variant="outline" size="sm" onClick={function () { return setCurrentPage(function (prev) { return Math.max(1, prev - 1); }); }} disabled={currentPage === 1}>
                  Anterior
                </button_1.Button>
                <div className="text-sm">
                  Página {currentPage} de {totalPages}
                </div>
                <button_1.Button variant="outline" size="sm" onClick={function () { return setCurrentPage(function (prev) { return Math.min(totalPages, prev + 1); }); }} disabled={currentPage === totalPages}>
                  Próxima
                </button_1.Button>
              </div>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
